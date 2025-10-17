# main.py
# This file contains all Cloud Function triggers for the Veritas AI platform.

import firebase_admin
from firebase_admin import initialize_app, storage, firestore
from google.cloud import pubsub_v1
import json
import os
from datetime import datetime
import base64
import tempfile
import time

# Firebase Functions SDK imports
from firebase_functions import storage_fn, pubsub_fn, https_fn, options
from firebase_admin import auth as firebase_auth

# Set global options - THIS IS CRITICAL FOR YOUR REGION
options.set_global_options(region="asia-south1")

# --- 1. Global Initialization ---
# Initialize Firebase Admin SDK only when needed (not during deployment analysis)
def get_firebase_app():
    """Get or initialize Firebase app"""
    try:
        return firebase_admin.get_app()
    except ValueError:
        # App not initialized yet, initialize it
        # For Firebase Functions 2nd Gen, credentials are handled automatically
        return initialize_app()

# Declare global variables for clients and agents, but keep them as None.
# They will be "lazy loaded" on the first function invocation for efficiency and to prevent timeouts.
publisher = None
ingestion_agent = None
diligence_agent = None
coordinator_agent = None

# Lazy import function to avoid import issues during deployment
def get_intake_agent():
    """Lazy import of IntakeCurationAgent"""
    global ingestion_agent
    if ingestion_agent is None:
        from agents.intake_agent import IntakeCurationAgent
        ingestion_agent = IntakeCurationAgent(project="veritas-472301")
        ingestion_agent.set_up()
    return ingestion_agent

def get_diligence_agent():
    """Lazy import of DiligenceAgent"""
    global diligence_agent
    if diligence_agent is None:
        from agents.diligence_agent import DiligenceAgent
        diligence_agent = DiligenceAgent(project="veritas-472301")
        diligence_agent.set_up()
    return diligence_agent

def get_coordinator_agent():
    """Lazy import of CoordinatorAgent"""
    global coordinator_agent
    if coordinator_agent is None:
        from agents.coordinator_agent import CoordinatorAgent
        coordinator_agent = CoordinatorAgent()
        coordinator_agent.set_up()
    return coordinator_agent


def verify_firebase_token(auth_header: str) -> dict:
    """Verify Firebase ID token and return user info"""
    if not auth_header or not auth_header.startswith('Bearer '):
        raise ValueError("Missing or invalid authorization header")
    
    token = auth_header.split('Bearer ')[1]
    try:
        decoded_token = firebase_auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise ValueError(f"Invalid token: {str(e)}")

# --- 2. Ingestion Pipeline: Stage 1 (File Upload) ---
@https_fn.on_request(
    memory=options.MemoryOption.MB_512,
    cors=options.CorsOptions(
        cors_origins=["*"],
        cors_methods=["POST", "OPTIONS"]
    )
)
def upload_document(req: https_fn.Request) -> https_fn.Response:
    """HTTP endpoint for document upload and initial processing."""
    
    # Initialize Firebase app when function runs
    get_firebase_app()

    try:
        # Handle CORS
        if req.method == 'OPTIONS':
            headers = {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '3600'
            }
            return https_fn.Response('', status=204, headers=headers)

        if req.method != 'POST':
            return https_fn.Response(
                json.dumps({"error": "Method not allowed"}),
                status=405,
                headers={'Content-Type': 'application/json'}
            )

        # Verify authentication
        auth_header = req.headers.get('Authorization')
        if not auth_header:
            return https_fn.Response(
                json.dumps({"error": "Authorization header required"}),
                status=401,
                headers={'Content-Type': 'application/json'}
            )

        try:
            user_info = verify_firebase_token(auth_header)
            user_id = user_info.get('uid')
            user_email = user_info.get('email')
        except ValueError as e:
            return https_fn.Response(
                json.dumps({"error": str(e)}),
                status=401,
                headers={'Content-Type': 'application/json'}
            )

        # Get file from request
        if 'file' not in req.files:
            return https_fn.Response(
                json.dumps({"error": "No file provided"}),
                status=400,
                headers={'Content-Type': 'application/json'}
            )

        file = req.files['file']
        if file.filename == '':
            return https_fn.Response(
                json.dumps({"error": "No file selected"}),
                status=400,
                headers={'Content-Type': 'application/json'}
            )

        # Get additional form data
        startup_name = req.form.get('startup_name', '')
        file_type = req.form.get('file_type', 'pitch_deck')
        original_name = file.filename

        # Read file content
        file_content = file.read()
        file_size = len(file_content)

        # Generate unique blob name
        timestamp = int(time.time())
        blob_name = f"uploads/{user_id}/{timestamp}_{original_name}"

        # Upload to Firebase Storage
        bucket = storage.bucket()
        blob = bucket.blob(blob_name)
        blob.upload_from_string(file_content, content_type=file.content_type)

        # Generate download URL
        download_url = blob.generate_signed_url(
            version="v4",
            expiration=datetime.timedelta(days=7),
            method="GET"
        )

        # Store upload metadata in Firestore
        db = firestore.client()
        upload_ref = db.collection('uploads').add({
            'user_id': user_id,
            'user_email': user_email,
            'startup_name': startup_name,
            'file_name': original_name,
            'file_type': file_type,
            'file_size': file_size,
            'bucket_name': "veritas-472301.firebasestorage.app",
            'file_path': blob_name,
            'content_type': file.content_type,
            'download_url': download_url,
            'original_name': original_name,
            'file_size': len(file_content),
            'file_type': file_type,
            'upload_id': upload_ref[1].id,
            'triggered_by': "http_upload"
        })
        
        # Publish to Pub/Sub for processing
        global publisher
        if publisher is None:
            publisher = pubsub_v1.PublisherClient()
        topic_path = publisher.topic_path("veritas-472301", "document-ingestion-topic")
        
        message_json = json.dumps({
            'user_id': user_id,
            'user_email': user_email,
            'startup_name': startup_name,
            'file_name': original_name,
            'file_type': file_type,
            'file_size': file_size,
            'bucket_name': "veritas-472301.firebasestorage.app",
            'file_path': blob_name,
            'content_type': file.content_type,
            'download_url': download_url,
            'original_name': original_name,
            'file_size': len(file_content),
            'file_type': file_type,
            'upload_id': upload_ref[1].id,
            'triggered_by': "http_upload"
        })
        message_bytes = message_json.encode('utf-8')
        
        future = publisher.publish(topic_path, message_bytes)
        message_id = future.result()
        
        print(f"Published message to document-ingestion-topic: {message_id}")
        
        # Update upload document with processing status
        upload_ref[1].update({
            'status': 'processing',
            'processing_started_at': firestore.SERVER_TIMESTAMP,
            'message_id': message_id
        })

        # Return success response
        response_data = {
            "status": "success",
            "message": "File uploaded and processing started",
            "upload_id": upload_ref[1].id,
            "file_name": original_name,
            "file_size": file_size,
            "download_url": download_url
        }

        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Content-Type': 'application/json'
        }
        return https_fn.Response(json.dumps(response_data), status=200, headers=headers)

    except Exception as e:
        print(f"Error in upload_document: {e}")
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Content-Type': 'application/json'
        }
        return https_fn.Response(json.dumps({"error": str(e)}), status=500, headers=headers)

# --- 3. Document Processing: Stage 1 (Intake Curation) ---
@pubsub_fn.on_message_published(
    topic="document-ingestion-topic",
    memory=options.MemoryOption.GB_1,
    timeout_sec=900
)
def process_document_ingestion(event: pubsub_fn.CloudEvent) -> None:
    """Process uploaded documents through the intake curation pipeline."""
    
    # Initialize Firebase app when function runs
    get_firebase_app()

    try:
        # Decode the message
        message_data = json.loads(event.data.decode('utf-8'))
        print(f"Processing document ingestion: {message_data.get('file_name', 'Unknown')}")
        
        # Lazy-initialize the intake agent
        agent = get_intake_agent()
        
        # Process the document
        result = agent.process_document(message_data)
        
        print(f"Document processing completed: {result.get('status', 'Unknown')}")
        
    except Exception as e:
        print(f"Error in process_document_ingestion: {e}")
        raise

# --- 4. Diligence Processing: Stage 2 (Deep Analysis) ---
@pubsub_fn.on_message_published(
    topic="diligence-topic",
    memory=options.MemoryOption.GB_1,
    timeout_sec=900
)
def process_diligence_task(event: pubsub_fn.CloudEvent) -> None:
    """Process diligence tasks through the comprehensive analysis pipeline."""
    
    # Initialize Firebase app when function runs
    get_firebase_app()

    try:
        # Decode the message
        message_data = json.loads(event.data.decode('utf-8'))
        print(f"Processing diligence task: {message_data.get('memo_1_id', 'Unknown')}")
        
        # Lazy-initialize the diligence agent
        agent = get_diligence_agent()
        
        # Process the diligence task
        result = agent.run(message_data)
        
        print(f"Diligence processing completed: {result.get('status', 'Unknown')}")
        
    except Exception as e:
        print(f"Error in process_diligence_task: {e}")
        raise

# --- 5. HTTP Endpoint for Manual Diligence Trigger ---
@https_fn.on_request(
    memory=options.MemoryOption.MB_512, 
    timeout_sec=900,
    cors=options.CorsOptions(
        cors_origins=["*"],
        cors_methods=["POST", "OPTIONS"]
    )
)
def trigger_diligence(req: https_fn.Request) -> https_fn.Response:
    """HTTP endpoint to manually trigger diligence processing for a specific memo."""
    
    # Initialize Firebase app when function runs
    get_firebase_app()

    try:
        # Handle CORS
        if req.method == 'OPTIONS':
            headers = {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '3600'
            }
            return https_fn.Response('', status=204, headers=headers)

        if req.method != 'POST':
            return https_fn.Response(
                json.dumps({"error": "Method not allowed"}),
                status=405,
                headers={'Content-Type': 'application/json'}
            )

        # Extract and validate parameters
        data = req.get_json()
        if not data:
            return https_fn.Response('No JSON data provided', status=400)

        memo_1_id = data.get("memo_1_id")
        timestamp = data.get("timestamp")
        
        # Validate required parameters
        if not memo_1_id:
            return https_fn.Response('Missing required parameter: memo_1_id', status=400)

        # Publish to Pub/Sub for processing
        global publisher
        if publisher is None:
            publisher = pubsub_v1.PublisherClient()
        topic_path = publisher.topic_path("veritas-472301", "diligence-topic")
        
        message_data = {
            "memo_1_id": memo_1_id,
            "timestamp": timestamp,
            "triggered_by": "manual_http",
            "triggered_at": datetime.now().isoformat()
        }
        
        message_json = json.dumps(message_data)
        message_bytes = message_json.encode('utf-8')
        
        future = publisher.publish(topic_path, message_bytes)
        message_id = future.result()
        
        print(f"Published diligence task to diligence-topic: {message_id}")

        # Return success response
        response_data = {
            "status": "success",
            "message": "Diligence processing triggered",
            "memo_1_id": memo_1_id,
            "message_id": message_id
        }

        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Content-Type': 'application/json'
        }
        return https_fn.Response(json.dumps(response_data), status=200, headers=headers)

    except Exception as e:
        print(f"Error in trigger_diligence: {e}")
        return https_fn.Response(f'Error: {str(e)}', status=500)
