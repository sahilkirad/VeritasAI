# main.py
# This file contains all Cloud Function triggers for the Veritas AI platform.

import firebase_admin
from firebase_admin import initialize_app, storage, firestore
from google.cloud import pubsub_v1
from google.cloud import bigquery
import json
import os
from datetime import datetime
import base64
import tempfile
import time
import warnings
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Suppress Vertex AI SDK deprecation warning noise in logs
warnings.filterwarnings(
    "ignore",
    category=UserWarning,
    module="vertexai.generative_models"
)

# Firebase Functions SDK imports
from firebase_functions import storage_fn, pubsub_fn, https_fn, options
from firebase_admin import auth as firebase_auth

# Set global options - THIS IS CRITICAL FOR YOUR REGION
options.set_global_options(region="asia-south1")

def get_cors_headers(request):
    """Get CORS headers for the response - returns single origin only"""
    origin = request.headers.get('Origin', '')
    
    # Whitelist allowed origins
    allowed_origins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://veritas-472301.web.app',
        'https://veritas-472301.firebaseapp.com'
    ]
    
    # CRITICAL: Return only ONE origin value, never comma-separated
    if origin in allowed_origins:
        return {
            'Access-Control-Allow-Origin': origin,  # Single value only!
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Credentials': 'true'
        }
    
    # Fallback for development localhost variations
    if 'localhost' in origin:
        return {
            'Access-Control-Allow-Origin': origin,  # Still single value
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    
    # Default: no CORS (will fail for cross-origin)
    return {
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }

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

# Log environment configuration (without exposing sensitive values)
def log_environment_config():
    """Log environment configuration for debugging"""
    perplexity_key = os.environ.get('PERPLEXITY_API_KEY', '')
    key_preview = f"{perplexity_key[:8]}...{perplexity_key[-4:]}" if len(perplexity_key) > 12 else (f"{perplexity_key[:4]}..." if perplexity_key else "None")
    key_valid = bool(perplexity_key) and perplexity_key.startswith("pplx-")
    
    print(f"Environment configuration:")
    print(f"- PERPLEXITY_API_KEY configured: {bool(perplexity_key)}")
    print(f"- PERPLEXITY_API_KEY format valid: {key_valid}")
    if perplexity_key:
        print(f"- PERPLEXITY_API_KEY preview: {key_preview}")
    print(f"- GOOGLE_CLOUD_PROJECT: {os.environ.get('GOOGLE_CLOUD_PROJECT', 'Not set')}")
    print(f"- VERTEX_AI_LOCATION: {os.environ.get('VERTEX_AI_LOCATION', 'asia-south1')}")

# Declare global variables for clients and agents, but keep them as None.
# They will be "lazy loaded" on the first function invocation for efficiency and to prevent timeouts.
publisher = None
ingestion_agent = None
diligence_agent = None
coordinator_agent = None
feedback_agent = None
bigquery_client = None

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

def get_bigquery_client():
    """Lazy import of BigQuery client"""
    global bigquery_client
    if bigquery_client is None:
        bigquery_client = bigquery.Client(project="veritas-472301")
    return bigquery_client

def save_to_bigquery(upload_id: str, founder_email: str, ingestion_result: dict):
    """Save pitch deck data to BigQuery"""
    try:
        client = get_bigquery_client()
        table_id = "veritas-472301.veritas_pitch_data.pitch_deck_data"
        
        # Prepare row data
        row_data = {
            "upload_id": upload_id,
            "founder_email": founder_email,
            "upload_timestamp": datetime.now().isoformat(),
            "original_filename": ingestion_result.get("original_filename", ""),
            "memo_1": json.dumps(ingestion_result.get("memo_1", {})),
            "processing_time_seconds": ingestion_result.get("processing_time_seconds", 0.0),
            "status": ingestion_result.get("status", "SUCCESS")
        }
        
        # Insert row
        errors = client.insert_rows_json(table_id, [row_data])
        if errors:
            print(f"BigQuery insert errors: {errors}")
        else:
            print(f"Successfully saved to BigQuery: {upload_id}")
            
    except Exception as e:
        print(f"BigQuery save failed (non-blocking): {e}")
        # Don't raise - this is fire-and-forget

def verify_firebase_token(auth_header: str) -> dict:
    """Verify Firebase ID token and return user info"""
    if not auth_header or not auth_header.startswith('Bearer '):
        raise ValueError("Missing or invalid authorization header")
    
    # Extract the token
    token = auth_header.split('Bearer ')[1]
    
    try:
        # Verify the token
        decoded_token = firebase_auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise ValueError(f"Invalid token: {str(e)}")

# --- 2. Ingestion Pipeline: Stage 1 (File Upload) ---
@https_fn.on_request(
    memory=options.MemoryOption.MB_512
)
def on_file_upload(req: https_fn.Request) -> https_fn.Response:
    """Handle file uploads from frontend"""
    try:
        # Handle CORS preflight
        if req.method == 'OPTIONS':
            headers = get_cors_headers(req)
            headers['Access-Control-Max-Age'] = '3600'
            return https_fn.Response('', status=204, headers=headers)
        
        # Skip Firebase authentication for now - using custom auth system
        # TODO: Implement proper authentication verification
        print("File upload request received (authentication bypassed)")
        
        # Get Firebase app
        app = get_firebase_app()
        
        # Check content type - allow multipart/form-data for file uploads
        content_type = req.headers.get('content-type', '')
        if 'multipart/form-data' not in content_type and 'application/json' not in content_type:
            headers = get_cors_headers(req)
            return https_fn.Response(
                json.dumps({"error": "Content-Type must be multipart/form-data or application/json"}),
                status=415,
                headers=headers
            )
        
        # Handle file uploads (multipart/form-data)
        if 'multipart/form-data' in content_type:
            try:
                # Parse multipart form data
                from werkzeug.datastructures import FileStorage
                import io
                
                # Get the file from the request
                file = None
                file_type = 'deck'
                original_name = ''
                
                # Parse multipart data
                if hasattr(req, 'files') and req.files:
                    for key, file_storage in req.files.items():
                        if key == 'file':
                            file = file_storage
                            break
                
                if not file:
                    headers = get_cors_headers(req)
                    return https_fn.Response(
                        json.dumps({"error": "No file provided"}),
                        status=400,
                        headers=headers
                    )
                
                # Get file info
                original_name = file.filename or 'unknown'
                file_content = file.read()
                file_type = req.form.get('file_type', 'deck')
                founder_email = req.form.get('founder_email', 'unknown@example.com')
                
                print(f"Processing file: {original_name} ({file.content_type}, {len(file_content)} bytes)")
                
                # Upload to Firebase Storage
                bucket = storage.bucket('veritas-472301.firebasestorage.app')
                timestamp = int(time.time() * 1000)
                blob_name = f"deck/{timestamp}-{original_name}"
                blob = bucket.blob(blob_name)
                
                # Upload the file
                blob.upload_from_string(file_content, content_type=file.content_type)
                
                # Make the file publicly accessible
                blob.make_public()
                
                # Get download URL
                download_url = blob.public_url
                
                print(f"File uploaded to storage: {blob_name}")
                print(f"Download URL: {download_url}")
                
                # Save metadata to Firestore
                db = firestore.client()
                upload_doc = {
                    'fileName': blob_name,
                    'originalName': original_name,
                    'downloadURL': download_url,
                    'contentType': file.content_type,
                    'size': len(file_content),
                    'type': file_type,
                    'status': 'uploaded',
                    'uploadedAt': firestore.SERVER_TIMESTAMP,
                    'uploadedBy': 'user',
                    'founderEmail': founder_email
                }
                
                # Add to uploads collection
                upload_ref = db.collection('uploads').add(upload_doc)
                print(f"File metadata stored in Firestore: {upload_ref[1].id}")
                
                # Create message for Pub/Sub to trigger processing
                message_data = {
                    "bucket_name": "veritas-472301.firebasestorage.app",
                    "file_path": blob_name,
                    "content_type": file.content_type,
                    "download_url": download_url,
                    "original_name": original_name,
                    "file_size": len(file_content),
                    "file_type": file_type,
                    "upload_id": upload_ref[1].id,
                    "founder_email": founder_email,
                    "triggered_by": "http_upload"
                }
                
                # Publish to Pub/Sub for processing
                global publisher
                if publisher is None:
                    publisher = pubsub_v1.PublisherClient()
                topic_path = publisher.topic_path("veritas-472301", "document-ingestion-topic")
                
                message_json = json.dumps(message_data)
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
                
                headers = get_cors_headers(req)
                return https_fn.Response(
                    json.dumps({
                        "message": "File uploaded and processing initiated", 
                        "status": "success",
                        "upload_id": upload_ref[1].id,
                        "download_url": download_url
                    }),
                    status=200,
                    headers=headers
                )
                
            except Exception as e:
                print(f"Error processing multipart upload: {e}")
                import traceback
                traceback.print_exc()
                headers = get_cors_headers(req)
                return https_fn.Response(
                    json.dumps({"error": f"Upload processing failed: {str(e)}"}),
                    status=500,
                    headers=headers
                )
        
        # Parse request data for JSON requests
        data = req.get_json()
        if not data:
            headers = get_cors_headers(req)
            return https_fn.Response(
                json.dumps({"error": "No data provided"}),
                status=400,
                headers=headers
            )
        
        file_name = data.get('file_name')
        file_type = data.get('file_type')
        file_size = data.get('file_size')
        content_type = data.get('content_type')
        file_data = data.get('file_data')  # Base64 encoded file data
        
        if not all([file_name, file_type, file_data]):
            headers = get_cors_headers(req)
            return https_fn.Response("Missing required fields", status=400, headers=headers)
        
        # Decode base64 file data
        try:
            file_bytes = base64.b64decode(file_data)
        except Exception as e:
            print(f"Error decoding base64: {e}")
            headers = get_cors_headers(req)
            return https_fn.Response("Invalid file data", status=400, headers=headers)
        
        # Create a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{file_name}") as temp_file:
            temp_file.write(file_bytes)
            temp_file_path = temp_file.name
        
        try:
            # Upload to Firebase Storage
            bucket = storage.bucket('veritas-472301.firebasestorage.app')
            timestamp = int(time.time() * 1000)
            blob_name = f"{content_type}/{timestamp}-{file_name}"
            blob = bucket.blob(blob_name)
            
            # Upload the file
            blob.upload_from_filename(temp_file_path, content_type=file_type)
            
            # Make the file publicly accessible
            blob.make_public()
            
            # Get download URL
            download_url = blob.public_url
            
            # Save metadata to Firestore
            db = firestore.client()
            upload_doc = {
                'fileName': blob_name,
                'originalName': file_name,
                'type': content_type,
                'size': file_size,
                'contentType': file_type,
                'downloadURL': download_url,
                'uploadedAt': firestore.SERVER_TIMESTAMP,
                'status': 'uploaded',
            }
            
            doc_ref = db.collection('uploads').add(upload_doc)
            
            # Trigger the intake process
            try:
                # Create a Pub/Sub message for processing
                message_data = {
                    'bucket_name': 'veritas-472301.firebasestorage.app',
                    'file_path': blob_name,
                    'content_type': file_type,
                    'download_url': download_url,
                }
                
                # Publish to Pub/Sub topic
                publisher = pubsub_v1.PublisherClient()
                topic_path = publisher.topic_path('veritas-472301', 'document-ingestion-topic')
                
                message_json = json.dumps(message_data)
                message_bytes = message_json.encode('utf-8')
                
                future = publisher.publish(topic_path, message_bytes)
                future.result()  # Wait for the publish to complete
                
                print(f"Published message to Pub/Sub: {message_data}")
                
            except Exception as e:
                print(f"Error triggering processing: {e}")
                # Don't fail the upload if processing trigger fails
            
            headers = get_cors_headers(req)
            return https_fn.Response(json.dumps({
                'success': True,
                'download_url': download_url,
                'file_name': blob_name,
                'message': 'File uploaded successfully',
                'memo_id': doc_ref[1].id  # Add this line
            }), status=200, headers=headers)
            
        finally:
            # Clean up temporary file
            try:
                os.unlink(temp_file_path)
            except:
                pass
                
    except Exception as e:
        print(f"Error in on_file_upload: {e}")
        headers = get_cors_headers(req)
        return https_fn.Response(f"Internal server error: {str(e)}", status=500, headers=headers)

# --- 3. Ingestion Pipeline: Stage 2 (AI Processing) ---
@pubsub_fn.on_message_published(
    topic="document-ingestion-topic",
    memory=options.MemoryOption.MB_512,
    timeout_sec=540,
    secrets=["PERPLEXITY_API_KEY"]
)
def process_ingestion_task(event: pubsub_fn.CloudEvent) -> None:
    """Triggers on a Pub/Sub message and calls the IntakeCurationAgent."""
    global publisher
    
    # Initialize Firebase app when function runs
    get_firebase_app()
    
    # Log environment configuration for debugging
    log_environment_config()
    
    try:
        # Lazy load the agent
        agent = get_intake_agent()

        # Extract and decode the Pub/Sub message data
        message_data = event.data.message.data
        
        # Log the raw message data for debugging
        print(f"Raw message data type: {type(message_data)}")
        print(f"Raw message data: {message_data}")
        
        # Handle different message data formats
        if isinstance(message_data, bytes):
            try:
                message_str = message_data.decode('utf-8')
                print(f"Decoded message from bytes: {message_str}")
            except UnicodeDecodeError as e:
                print(f"ERROR: Failed to decode message bytes as UTF-8: {e}")
                return
        elif isinstance(message_data, str):
            # Check if the string looks like Base64 encoded data
            if message_data and not message_data.startswith('{') and not message_data.startswith('['):
                try:
                    # Try to decode as Base64 first
                    import base64
                    decoded_bytes = base64.b64decode(message_data)
                    message_str = decoded_bytes.decode('utf-8')
                    print(f"Decoded Base64 message: {message_str}")
                except Exception as e:
                    # If Base64 decoding fails, treat as regular string
                    message_str = message_data
                    print(f"Base64 decode failed, treating as regular string: {message_str}")
            else:
                message_str = message_data
                print(f"Message is already a JSON string: {message_str}")
        else:
            print(f"ERROR: Unexpected message data type: {type(message_data)}. Expected bytes or string.")
            return

        # Validate message content before JSON parsing
        if not message_str or message_str.strip() == "":
            print("ERROR: Empty or whitespace-only message payload received. Acknowledging and exiting.")
            return

        # Attempt JSON parsing with robust error handling
        try:
            task_data = json.loads(message_str)
            print(f"Successfully parsed JSON: {task_data}")
        except json.JSONDecodeError as e:
            print(f"ERROR: Failed to parse message as JSON: {e}")
            print(f"Malformed message content: {repr(message_str)}")
            return
        except Exception as e:
            print(f"ERROR: Unexpected error during JSON parsing: {e}")
            return

        # Validate required fields in the parsed data
        if not isinstance(task_data, dict):
            print(f"ERROR: Parsed data is not a dictionary. Type: {type(task_data)}")
            return
            
        file_path = task_data.get("file_path")
        bucket_name = task_data.get("bucket_name")
        content_type = task_data.get("content_type")
        
        if not file_path or not bucket_name or not content_type:
            print(f"ERROR: Missing required fields in task data. file_path: {file_path}, bucket_name: {bucket_name}, content_type: {content_type}")
            return
            
        print(f"Received ingestion task for: {file_path}")

        bucket = storage.bucket(bucket_name)
        blob = bucket.blob(file_path)
        file_data = blob.download_as_bytes()

        if 'pdf' in content_type: file_type = 'pdf'
        elif 'video' in content_type: file_type = 'video'
        elif 'audio' in content_type: file_type = 'audio'
        else:
            print(f"Unsupported content type: {content_type}. Task ignored.")
            return

        print(f"Invoking IntakeCurationAgent for file type: {file_type}...")
        
        # Get founder email from task data
        founder_email = task_data.get("founder_email", "")
        
        # Use enhanced run method with embeddings if founder email is available
        if founder_email:
            print(f"Using enhanced intake agent with embeddings for founder: {founder_email}")
            import asyncio
            ingestion_result = asyncio.run(agent.run_with_embeddings(
                file_data=file_data, 
                filename=file_path, 
                file_type=file_type,
                founder_email=founder_email,
                company_id=task_data.get("upload_id", file_path.replace('/', '_'))
            ))
        else:
            print("No founder email provided, using standard intake agent")
            ingestion_result = agent.run(
                file_data=file_data, filename=file_path, file_type=file_type
            )
        
        if ingestion_result.get("status") == "SUCCESS":
            print(f"Successfully ingested {file_path}. Memo 1 generated. Validating data before saving...")
            
            # Validate memo data before storing
            memo_1 = ingestion_result.get("memo_1", {})
            if memo_1:
                try:
                    # Test JSON serialization
                    json.dumps(memo_1)
                    print("Memo data validation passed - data is JSON serializable")
                except (TypeError, ValueError) as e:
                    print(f"WARNING: Memo data validation failed: {e}")
                    # Continue anyway but log the issue
                    ingestion_result["validation_warning"] = f"Data serialization issue: {str(e)}"
            
            # Store founder email inside memo_1
            founder_email = task_data.get("founder_email", "unknown@example.com")
            if "memo_1" in ingestion_result and isinstance(ingestion_result["memo_1"], dict):
                ingestion_result["memo_1"]["founder_email"] = founder_email
            
            db = firestore.client()
            doc_ref = db.collection("ingestionResults").add(ingestion_result)
            print(f"Successfully saved results for {file_path} to Firestore with ID: {doc_ref[1].id}")
            
            # Save to BigQuery (fire-and-forget)
            founder_email = task_data.get("founder_email", "unknown@example.com")
            save_to_bigquery(doc_ref[1].id, founder_email, ingestion_result)
            
            # Auto-trigger diligence analysis ONLY after successful save
            print(f"Auto-triggering diligence analysis for memo ID: {doc_ref[1].id}")
            try:
                # Publish message to diligence topic
                if publisher is None:
                    publisher = pubsub_v1.PublisherClient()
                
                topic_path = publisher.topic_path("veritas-472301", "diligence-topic")
                message_data = {
                    "memo_1_id": doc_ref[1].id,
                    "ga_property_id": "213025502",  # Your GA property ID
                    "linkedin_url": "https://www.linkedin.com/in/your-linkedin-profile/"
                }
                message_bytes = json.dumps(message_data).encode("utf-8")
                
                publish_future = publisher.publish(topic_path, data=message_bytes)
                publish_future.result()
                print(f"Successfully triggered diligence analysis for memo {doc_ref[1].id}")
            except Exception as e:
                print(f"ERROR: Failed to auto-trigger diligence: {e}")
        else:
            print(f"ERROR: Agent failed to ingest {file_path}. Reason: {ingestion_result.get('error')}")
    except Exception as e:
        print(f"A critical error occurred in process_ingestion_task: {e}")
        raise

# --- 4. Diligence Pipeline: Stage 3 (Deep Analysis) ---
@pubsub_fn.on_message_published(
    topic="diligence-topic",
    memory=options.MemoryOption.MB_512,  # Reduced memory to match firebase.json
    timeout_sec=540,  # Maximum allowed for event-triggered functions
    secrets=["PERPLEXITY_API_KEY"]
)
def process_diligence_task(event: pubsub_fn.CloudEvent) -> None:
    """Triggers on a Pub/Sub message and calls the DiligenceAgent."""
    
    # Initialize Firebase app when function runs
    get_firebase_app()
    
    start_time = datetime.now()
    
    try:
        # Lazy load the agent
        agent = get_diligence_agent()

        # Extract and decode the Pub/Sub message data
        message_data = event.data.message.data
        
        if isinstance(message_data, bytes):
            message_str = message_data.decode('utf-8')
        elif isinstance(message_data, str):
            if message_data and not message_data.startswith('{') and not message_data.startswith('['):
                try:
                    import base64
                    decoded_bytes = base64.b64decode(message_data)
                    message_str = decoded_bytes.decode('utf-8')
                except Exception:
                    message_str = message_data
            else:
                message_str = message_data
        else:
            print(f"ERROR: Unexpected message data type: {type(message_data)}")
            return

        if not message_str or message_str.strip() == "":
            print("ERROR: Empty message payload received.")
            return

        try:
            task_data = json.loads(message_str)
        except json.JSONDecodeError as e:
            print(f"ERROR: Failed to parse message as JSON: {e}")
            return

        memo_1_id = task_data.get("memo_1_id")
        ga_property_id = task_data.get("ga_property_id", "213025502")  # Updated to your correct Property ID
        linkedin_url = task_data.get("linkedin_url", "https://www.linkedin.com/in/your-linkedin-profile/")  # Default URL
        
        if not memo_1_id:
            print("ERROR: Missing memo_1_id in task data.")
            return

        print(f"Received diligence task for memo ID: {memo_1_id}")
        print(f"Using GA Property ID: {ga_property_id}")
        print(f"Using LinkedIn URL: {linkedin_url}")

        # Fetch the memo from Firestore
        db = firestore.client()
        memo_doc = db.collection("ingestionResults").document(memo_1_id).get()
        
        if not memo_doc.exists:
            print(f"ERROR: Memo with ID {memo_1_id} not found.")
            return

        memo_1_data = memo_doc.to_dict()
        memo_1 = memo_1_data.get("memo_1", {})

        print(f"Invoking DiligenceAgent for memo: {memo_1.get('title', 'Unknown')}")
        memo_2_result = agent.run(
            startup_id=memo_1_id,
            ga_property_id=ga_property_id,
            linkedin_url=linkedin_url
        )

        if memo_2_result.get("status") == "SUCCESS":
            print(f"Successfully generated Memo 1 Diligence for {memo_1_id}. Saving to Firestore...")
            db = firestore.client()
            # Store as memo1_diligence
            diligence_result = {
                "timestamp": datetime.now().isoformat(),
                "processing_time_seconds": (datetime.now() - start_time).total_seconds(),
                "memo1_diligence": memo_2_result.get("memo_2", memo_2_result),  # Store as memo1_diligence
                "memo_1_id": memo_1_id,
                "status": "SUCCESS"
            }
            doc_ref = db.collection("diligenceReports").add(diligence_result)
            print(f"Successfully saved Memo 1 Diligence with ID: {doc_ref[1].id}")
        else:
            print(f"ERROR: DiligenceAgent failed. Reason: {memo_2_result.get('error')}")
    except Exception as e:
        print(f"A critical error occurred in process_diligence_task: {e}")
        raise

# --- 5. HTTP Endpoint for Manual Diligence Trigger ---
@https_fn.on_request(
    memory=options.MemoryOption.MB_512, 
    timeout_sec=900
)
def trigger_diligence(req: https_fn.Request) -> https_fn.Response:
    """HTTP endpoint to manually trigger diligence analysis on a memo."""
    
    # Initialize Firebase app when function runs
    get_firebase_app()
    
    try:
        # Handle CORS preflight
        if req.method == 'OPTIONS':
            headers = get_cors_headers(req)
            headers['Access-Control-Max-Age'] = '3600'
            return https_fn.Response('', status=204, headers=headers)
        
        if req.method != 'POST':
            return https_fn.Response(
                json.dumps({"error": "Method not allowed"}),
                status=405,
                headers={'Content-Type': 'application/json'}
            )

        # Skip Firebase authentication for now - using custom auth system
        # TODO: Implement proper authentication verification
        print("Diligence trigger request received (authentication bypassed)")

        data = req.get_json()
        print(f"Received request data: {data}")
        print(f"Request method: {req.method}")
        print(f"Request headers: {dict(req.headers)}")
        
        if not data:
            print("ERROR: No data in request body")
            return https_fn.Response('No data in request body', status=400)
            
        if 'memo_1_id' not in data:
            print(f"ERROR: Missing memo_1_id in request body. Available keys: {list(data.keys())}")
            return https_fn.Response(f'Missing memo_1_id in request body. Available keys: {list(data.keys())}', status=400)

        memo_1_id = data['memo_1_id']
        ga_property_id = data.get('ga_property_id', '213025502')  # Updated to your correct Property ID
        linkedin_url = data.get('linkedin_url', 'https://www.linkedin.com/in/your-linkedin-profile/')  # Default URL
        
        print(f"Manual diligence trigger requested for memo ID: {memo_1_id}")
        print(f"Using GA Property ID: {ga_property_id}")
        print(f"Using LinkedIn URL: {linkedin_url}")

        # Publish message to diligence topic with all required data
        global publisher
        if publisher is None:
            publisher = pubsub_v1.PublisherClient()

        topic_path = publisher.topic_path("veritas-472301", "diligence-topic")
        message_data = {
            "memo_1_id": memo_1_id,
            "ga_property_id": ga_property_id,
            "linkedin_url": linkedin_url
        }
        message_bytes = json.dumps(message_data).encode("utf-8")

        publish_future = publisher.publish(topic_path, data=message_bytes)
        publish_future.result()

        return https_fn.Response(f'Diligence analysis triggered for memo {memo_1_id}', status=200)

    except Exception as e:
        print(f"Error in trigger_diligence: {e}")
        return https_fn.Response(f'Error: {str(e)}', status=500)

@https_fn.on_request(
    region="asia-south1", 
    memory=options.MemoryOption.MB_512,
    secrets=["SENDGRID_API_KEY", "SENDGRID_FROM_EMAIL"]
)
def schedule_ai_interview(req: https_fn.Request) -> https_fn.Response:
    """HTTP endpoint to schedule AI interview with email notification."""
    
    get_firebase_app()

    try:
        if req.method == 'OPTIONS':
            headers = get_cors_headers(req)
            headers['Access-Control-Max-Age'] = '3600'
            return https_fn.Response('', status=204, headers=headers)

        if req.method != 'POST':
            return https_fn.Response(
                json.dumps({"error": "Method not allowed"}),
                status=405,
                headers={'Content-Type': 'application/json'}
            )

        data = req.get_json()
        if not data:
            return https_fn.Response('No JSON data provided', status=400)

        founder_email = data.get("founder_email")
        investor_email = data.get("investor_email") 
        startup_name = data.get("startup_name")
        company_id = data.get("company_id")
        
        # Debug logging - what did frontend send?
        print(f"🔍 DEBUG: Received request data: {data}")
        print(f"🔍 DEBUG: founder_email from request: '{founder_email}'")
        print(f"🔍 DEBUG: Type of founder_email: {type(founder_email)}")
        
        if not all([founder_email, investor_email, startup_name, company_id]):
            return https_fn.Response(
                'Missing required parameters: founder_email, investor_email, startup_name, company_id', 
                status=400
            )
        
        print(f"Scheduling AI interview for {startup_name}")
        print(f"Founder: {founder_email}, Investor: {investor_email}, Company: {company_id}")

        # Generate unique interview ID
        interview_id = f"interview_{int(time.time() * 1000)}_{company_id}"
        
        # Create interview URL (using query parameter for Next.js static export compatibility)
        interview_url = f"https://veritas-472301.web.app/interview?id={interview_id}"
        
        # Store interview record in Firestore
        db = firestore.client()
        from datetime import datetime
        interview_doc = {
            'id': interview_id,
            'interviewUrl': interview_url,
            'companyId': company_id,
            'founderEmail': founder_email,
            'investorEmail': investor_email,
            'startupName': startup_name,
            'status': 'scheduled',
            'scheduledAt': datetime.now().isoformat(),
            'transcript': [],
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat()
        }
        
        db.collection('interviews').document(interview_id).set(interview_doc)
        print(f"Stored interview record: {interview_id}")
        
        # Send email to founder via SendGrid
        try:
            from sendgrid import SendGridAPIClient
            from sendgrid.helpers.mail import Mail
            
            sendgrid_api_key = os.environ.get('SENDGRID_API_KEY')
            sendgrid_from_email = os.environ.get('SENDGRID_FROM_EMAIL')
            
            # Debug logging
            print(f"🔍 Debug: API Key exists: {sendgrid_api_key is not None}")
            print(f"🔍 Debug: API Key length: {len(sendgrid_api_key) if sendgrid_api_key else 0}")
            print(f"🔍 Debug: API Key prefix: {sendgrid_api_key[:5] if sendgrid_api_key else 'None'}")
            print(f"🔍 Debug: From email: {sendgrid_from_email}")
            
            message = Mail(
                from_email=sendgrid_from_email,
                to_emails=founder_email,
                subject=f'AI Interview Invitation from {investor_email}',
                html_content=f'''
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; }}
                        .header h1 {{ margin: 0; font-size: 28px; font-weight: 600; }}
                        .content {{ background-color: #ffffff; padding: 40px 30px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; border-radius: 0 0 12px 12px; }}
                        .greeting {{ font-size: 18px; font-weight: 500; color: #111827; margin-bottom: 20px; }}
                        .intro {{ font-size: 16px; color: #374151; margin-bottom: 25px; line-height: 1.7; }}
                        .company-name {{ color: #667eea; font-weight: 600; }}
                        .details-box {{ background-color: #f9fafb; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 6px; }}
                        .details-box p {{ margin: 8px 0; font-size: 15px; color: #4b5563; }}
                        .details-box strong {{ color: #111827; }}
                        .button-container {{ text-align: center; margin: 35px 0; }}
                        .button {{ display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25); transition: transform 0.2s; }}
                        .button:hover {{ transform: translateY(-2px); box-shadow: 0 6px 12px rgba(102, 126, 234, 0.3); }}
                        .link-text {{ margin-top: 20px; font-size: 14px; color: #6b7280; text-align: center; }}
                        .link-url {{ color: #667eea; word-break: break-all; }}
                        .footer {{ text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }}
                        .footer-signature {{ font-weight: 500; color: #374151; margin-top: 10px; }}
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎙️ AI Interview Invitation</h1>
                        </div>
                        <div class="content">
                            <p class="greeting">Hello,</p>
                            
                            <p class="intro">
                                We're excited to invite you to participate in an AI-powered interview for <span class="company-name">{startup_name}</span>. 
                                This interview will help us gain deeper insights into your company's vision, operations, and growth potential.
                            </p>
                            
                            <div class="details-box">
                                <p><strong>📋 What to Expect:</strong></p>
                                <p>• 8-10 targeted questions about your company</p>
                                <p>• Speech-to-text powered responses</p>
                                <p>• Video monitoring for authenticity</p>
                                <p>• Flexible pacing - answer at your own speed</p>
                            </div>
                            
                            <div class="button-container">
                                <a href="{interview_url}" class="button">Begin Interview</a>
                            </div>
                            
                            <p class="link-text">
                                Or copy and paste this link into your browser:<br>
                                <span class="link-url">{interview_url}</span>
                            </p>
                            
                            <div style="margin-top: 30px; padding: 20px; background-color: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
                                <p style="margin: 0; font-size: 14px; color: #92400e;">
                                    <strong>⚠️ Important:</strong> Please ensure you're in a quiet environment with a working microphone and camera before starting.
                                </p>
                            </div>
                        </div>
                        <div class="footer">
                            <p>If you have any questions or technical issues, please don't hesitate to reach out.</p>
                            <p class="footer-signature">
                                Best regards,<br>
                                <strong>The Veritas AI Team</strong>
                            </p>
                        </div>
                    </div>
                </body>
                </html>
                '''
            )
            
            sg = SendGridAPIClient(sendgrid_api_key)
            response = sg.send(message)
            print(f"📧 Email sent to {founder_email}: Status {response.status_code}")
            
        except Exception as email_error:
            print(f"⚠️ Email sending failed: {email_error}")
            # Don't fail the whole function if email fails
        
        # Return success response
        result = {
            'status': 'SUCCESS',
            'message': 'AI Interview scheduled successfully',
            'interviewId': interview_id,
            'interviewUrl': interview_url
        }
        
        headers = get_cors_headers(req)
        return https_fn.Response(json.dumps(result), status=200, headers=headers)
        
    except Exception as e:
        print(f"Error in schedule_ai_interview: {e}")
        import traceback
        traceback.print_exc()
        headers = get_cors_headers(req)
        return https_fn.Response(
            json.dumps({"status": "FAILED", "error": str(e)}), 
            status=500, 
            headers=headers
        )

def get_feedback_agent():
    """Lazy import of FeedbackAgent"""
    global feedback_agent
    if feedback_agent is None:
        from agents.feedback_agent import FeedbackAgent
        feedback_agent = FeedbackAgent(project="veritas-472301")
        feedback_agent.set_up()
    return feedback_agent

@https_fn.on_request(
    region="asia-south1", 
    memory=options.MemoryOption.MB_512
)
def ai_feedback(req: https_fn.Request) -> https_fn.Response:
    """HTTP endpoint for AI-powered feedback and recommendations."""
    
    # Initialize Firebase app when function runs
    get_firebase_app()

    try:
        # Handle CORS for testing
        if req.method == 'OPTIONS':
            headers = get_cors_headers(req)
            headers['Access-Control-Max-Age'] = '3600'
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

        founder_email = data.get("founder_email")
        action = data.get("action")  # "recommendations" or "question"
        question = data.get("question", "")

        # Validate required parameters
        if not founder_email:
            return https_fn.Response('Missing required parameter: founder_email', status=400)
        
        if not action:
            return https_fn.Response('Missing required parameter: action', status=400)
        
        if action not in ["recommendations", "question"]:
            return https_fn.Response('Invalid action. Must be "recommendations" or "question"', status=400)
        
        if action == "question" and not question:
            return https_fn.Response('Missing required parameter: question', status=400)

        # Lazy-initialize the agent
        agent = get_feedback_agent()
        
        print(f"AI Feedback request for founder: {founder_email}, action: {action}")
        
        # Process the request
        if action == "recommendations":
            result = agent.get_recommendations(founder_email)
        else:  # action == "question"
            result = agent.answer_question(founder_email, question)
        
        # Return data directly (frontend API client will wrap it with success: true)
        headers = get_cors_headers(req)
        return https_fn.Response(json.dumps(result), status=200, headers=headers)
        
    except Exception as e:
        print(f"Error in ai_feedback: {e}")
        headers = get_cors_headers(req)
        return https_fn.Response(json.dumps({"error": str(e)}), status=500, headers=headers)


# --- 8. Diligence Hub Endpoints ---

@https_fn.on_request(
    memory=options.MemoryOption.MB_512,
    timeout_sec=300
)
def run_diligence(req: https_fn.Request):
    """
    Endpoint: POST /run_diligence
    Body: { company_id, investor_email }
    Returns: Validation report
    """
    try:
        # Handle CORS preflight
        if req.method == "OPTIONS":
            headers = get_cors_headers(req)
            return https_fn.Response("", status=200, headers=headers)

        # Extract and validate parameters
        data = req.get_json()
        if not data:
            return https_fn.Response('No JSON data provided', status=400)

        company_id = data.get("company_id")
        investor_email = data.get("investor_email")

        # Validate required parameters
        if not company_id:
            return https_fn.Response('Missing required parameter: company_id', status=400)
        
        if not investor_email:
            return https_fn.Response('Missing required parameter: investor_email', status=400)

        # Lazy-initialize the diligence agent
        from agents.diligence_agent_rag import get_diligence_agent
        agent = get_diligence_agent()
        
        print(f"Running diligence for company: {company_id}, investor: {investor_email}")
        
        # Run diligence validation asynchronously
        import asyncio
        result = asyncio.run(agent.run_validation(company_id, investor_email))
        
        # Add detailed logging
        print(f"Diligence completed. Result keys: {list(result.keys())}")
        print(f"Result size: {len(json.dumps(result))} bytes")
        
        # Debug: log score presence to detect zero rendering issues
        try:
            overall = result.get('overall_score')
            av = result.get('agent_validations', {})
            fp = (av.get('founder_profile') or {}).get('credibility_score')
            pc = (av.get('pitch_consistency') or {}).get('consistency_score')
            ma = (av.get('memo1_accuracy') or {}).get('accuracy_score')
            print(f"Score summary -> overall:{overall}, fp:{fp}, pc:{pc}, ma:{ma}")
        except Exception as _e:
            print(f"Score summary logging failed: {_e}")

        # Return results with proper JSON content type
        headers = {
            **get_cors_headers(req),
            'Content-Type': 'application/json'
        }
        return https_fn.Response(json.dumps(result), status=200, headers=headers)
        
    except Exception as e:
        print(f"Error in run_diligence: {e}")
        headers = {
            **get_cors_headers(req),
            'Content-Type': 'application/json'
        }
        return https_fn.Response(json.dumps({"error": str(e)}), status=500, headers=headers)


@https_fn.on_request(
    memory=options.MemoryOption.MB_512,
    timeout_sec=60
)
def query_diligence(req: https_fn.Request):
    """
    Endpoint: POST /query_diligence
    Body: { company_id, question }
    Returns: AI-generated answer with sources
    """
    try:
        # Handle CORS preflight
        if req.method == "OPTIONS":
            headers = get_cors_headers(req)
            return https_fn.Response("", status=200, headers=headers)

        # Extract and validate parameters
        data = req.get_json()
        if not data:
            return https_fn.Response('No JSON data provided', status=400)

        company_id = data.get("company_id")
        question = data.get("question")

        # Validate required parameters
        if not company_id:
            return https_fn.Response('Missing required parameter: company_id', status=400)
        
        if not question:
            return https_fn.Response('Missing required parameter: question', status=400)

        # Lazy-initialize the diligence agent
        from agents.diligence_agent_rag import get_diligence_agent
        agent = get_diligence_agent()
        
        print(f"Querying diligence for company: {company_id}, question: {question}")
        
        # Query diligence data
        import asyncio
        result = asyncio.run(agent.query_diligence(company_id, question))
        
        # Add detailed logging
        print(f"Query completed. Result keys: {list(result.keys())}")
        print(f"Answer: {result.get('answer', 'NO ANSWER FIELD')[:100]}...")
        
        # Return results with proper JSON content type
        headers = {
            **get_cors_headers(req),
            'Content-Type': 'application/json'
        }
        return https_fn.Response(json.dumps(result), status=200, headers=headers)
        
    except Exception as e:
        print(f"Error in query_diligence: {e}")
        headers = {
            **get_cors_headers(req),
            'Content-Type': 'application/json'
        }
        return https_fn.Response(json.dumps({"error": str(e)}), status=500, headers=headers)

# --- 9. Validation Endpoints ---

@https_fn.on_request(
    memory=options.MemoryOption.MB_512,
    timeout_sec=300,
    secrets=["PERPLEXITY_API_KEY"]
)
def validate_memo_data(req: https_fn.Request):
    """
    Endpoint: POST /validate_memo_data
    Body: { memo_data, memo_id, memo_type }
    Returns: Validation results with enrichment data
    """
    try:
        # Handle CORS preflight
        if req.method == "OPTIONS":
            headers = get_cors_headers(req)
            return https_fn.Response("", status=200, headers=headers)

        # Extract and validate parameters
        data = req.get_json()
        if not data:
            return https_fn.Response('No JSON data provided', status=400)

        memo_data = data.get("memo_data")
        memo_id = data.get("memo_id")
        memo_type = data.get("memo_type", "memo_1")
        
        if not memo_data:
            return https_fn.Response('Missing required parameter: memo_data', status=400)
        
        if not memo_id:
            return https_fn.Response('Missing required parameter: memo_id', status=400)

        print(f"Validating and enriching memo data for company: {memo_data.get('title', 'Unknown')} (ID: {memo_id})")
        
        # Initialize Firebase before any Firestore operations
        get_firebase_app()
        
        # Try to find the correct memo_id if the provided one doesn't match document ID
        # The memo_id might be a company_id instead of document ID
        resolved_memo_id = memo_id
        try:
            db = firestore.client()
            # Check if memo_id is actually a company_id
            if memo_data.get('company_id'):
                # Try to find document by company_id in ingestionResults
                query = db.collection("ingestionResults").where("company_id", "==", memo_data.get('company_id')).limit(1)
                docs = list(query.stream())
                if docs:
                    resolved_memo_id = docs[0].id
                    print(f"Resolved memo_id from company_id: {memo_id} -> {resolved_memo_id}")
                # Also try direct lookup with the provided memo_id
                elif memo_id:
                    doc_ref = db.collection("ingestionResults").document(memo_id)
                    if doc_ref.get().exists:
                        resolved_memo_id = memo_id
                        print(f"Using provided memo_id as document ID: {memo_id}")
                    else:
                        # Try searching recent documents
                        recent_query = db.collection("ingestionResults").order_by("timestamp", direction=firestore.Query.DESCENDING).limit(20)
                        for doc in recent_query.stream():
                            doc_data = doc.to_dict()
                            if (doc_data.get("company_id") == memo_id or 
                                doc_data.get("memo_1", {}).get("company_id") == memo_id or
                                doc.id == memo_id):
                                resolved_memo_id = doc.id
                                print(f"Found matching document: {memo_id} -> {resolved_memo_id}")
                                break
        except Exception as e:
            print(f"Error resolving memo_id: {e}, using original memo_id: {memo_id}")
            resolved_memo_id = memo_id
        
        # Step 1: Run enrichment agent (includes validation via Perplexity API with Google fallback)
        enrichment_result = None
        validation_results = None
        
        if memo_type == "memo_1":
            try:
                from agents.memo_enrichment_agent import MemoEnrichmentAgent
                enrichment_agent = MemoEnrichmentAgent(project="veritas-472301", location="asia-south1")
                enrichment_agent.set_up()
                
                # Run enrichment asynchronously with resolved memo_id
                # This now includes validation using Perplexity API (with Google fallback)
                import asyncio
                enrichment_result = asyncio.run(enrichment_agent.enrich_memo(resolved_memo_id, memo_type))
                
                # Extract validation results from enrichment_result
                validation_results = enrichment_result.get("validation_results")
                
                print(f"Enrichment completed: {enrichment_result.get('fields_enriched_count', 0)} fields enriched")
                if validation_results:
                    validation_method = validation_results.get("validation_method", "unknown")
                    overall_score = validation_results.get("overall_validation_score", 0.0)
                    categories_validated = validation_results.get("categories_validated", 0)
                    print(f"Validation completed using {validation_method}: Overall score: {overall_score:.2f}, Categories validated: {categories_validated}/10")
                else:
                    print("Warning: No validation results returned from enrichment agent")
                    
            except Exception as e:
                print(f"Enrichment/Validation failed (non-blocking): {e}")
                import traceback
                traceback.print_exc()
                enrichment_result = {"error": str(e)}
        
        # Step 2: Fallback validation if enrichment didn't include validation results
        if not validation_results or not enrichment_result:
            print("Running fallback validation using Google Validation Service...")
            try:
                from services.google_validation_service import GoogleValidationService
                validation_service = GoogleValidationService(project="veritas-472301", location="asia-south1")
                validation_service.set_up()
                
                # Use enriched data if available, otherwise use original
                validation_data = memo_data
                if resolved_memo_id:
                    try:
                        db = firestore.client()
                        validated_doc = db.collection("memo1_validated").document(resolved_memo_id).get()
                        if validated_doc.exists:
                            validated_data = validated_doc.to_dict().get("memo_1", memo_data)
                            print(f"Using enriched data from memo1_validated for fallback validation")
                    except Exception as e:
                        print(f"Error fetching enriched data: {e}")
                
                # Run fallback validation
                validation_result = validation_service.validate_memo_data(validation_data)
                
                if validation_result.get("status") == "SUCCESS":
                    # Map Google validation results to our validation framework structure
                    validation_results = {
                        "validation_results": {
                            "company_identity": {
                                "status": "CONFIRMED" if validation_result.get("validation_result", {}).get("data_validation", {}).get("accuracy_score", 0) >= 7 else "QUESTIONABLE",
                                "confidence": validation_result.get("validation_result", {}).get("data_validation", {}).get("accuracy_score", 0) / 10.0,
                                "findings": validation_result.get("validation_result", {}).get("data_validation", {}),
                                "sources": ["Google Vertex AI"],
                                "validation_method": "google_vertex_ai_fallback"
                            },
                            "market_opportunity": {
                                "status": "CONFIRMED" if validation_result.get("validation_result", {}).get("market_validation", {}).get("market_size_accuracy", 0) >= 7 else "QUESTIONABLE",
                                "confidence": validation_result.get("validation_result", {}).get("market_validation", {}).get("market_size_accuracy", 0) / 10.0,
                                "findings": validation_result.get("validation_result", {}).get("market_validation", {}),
                                "sources": ["Google Vertex AI"],
                                "validation_method": "google_vertex_ai_fallback"
                            },
                            "founder_team": {
                                "status": "CONFIRMED" if validation_result.get("validation_result", {}).get("team_validation", {}).get("team_strength", 0) >= 7 else "QUESTIONABLE",
                                "confidence": validation_result.get("validation_result", {}).get("team_validation", {}).get("team_strength", 0) / 10.0,
                                "findings": validation_result.get("validation_result", {}).get("team_validation", {}),
                                "sources": ["Google Vertex AI"],
                                "validation_method": "google_vertex_ai_fallback"
                            },
                            "financial_traction": {
                                "status": "CONFIRMED" if validation_result.get("validation_result", {}).get("financial_validation", {}).get("financial_viability", 0) >= 7 else "QUESTIONABLE",
                                "confidence": validation_result.get("validation_result", {}).get("financial_validation", {}).get("financial_viability", 0) / 10.0,
                                "findings": validation_result.get("validation_result", {}).get("financial_validation", {}),
                                "sources": ["Google Vertex AI"],
                                "validation_method": "google_vertex_ai_fallback"
                            }
                        },
                        "overall_validation_score": sum([
                            validation_result.get("validation_result", {}).get("data_validation", {}).get("accuracy_score", 0),
                            validation_result.get("validation_result", {}).get("market_validation", {}).get("market_size_accuracy", 0),
                            validation_result.get("validation_result", {}).get("team_validation", {}).get("team_strength", 0),
                            validation_result.get("validation_result", {}).get("financial_validation", {}).get("financial_viability", 0)
                        ]) / 40.0,  # Average of 4 scores
                        "validation_timestamp": datetime.now().isoformat(),
                        "validation_method": "google_vertex_ai_fallback"
                    }
                    print(f"Fallback validation completed using Google Vertex AI")
            except Exception as fallback_error:
                print(f"Fallback validation also failed: {fallback_error}")
                validation_results = {
                    "validation_results": {},
                    "overall_validation_score": 0.0,
                    "validation_timestamp": datetime.now().isoformat(),
                    "validation_method": "error",
                    "error": str(fallback_error)
                }
        
        # Build final result with both enrichment and validation
        # Note: validation_results already contains the full structure with validation_results key
        result = {}
        if validation_results:
            # validation_results already has the correct structure from enrichment agent
            result.update(validation_results)
            # Ensure we have the top-level fields
            if "validation_results" not in result:
                result["validation_results"] = validation_results.get("validation_results", {})
            result["overall_validation_score"] = validation_results.get("overall_validation_score", 0.0)
            result["validation_timestamp"] = validation_results.get("validation_timestamp", datetime.now().isoformat())
            result["validation_method"] = validation_results.get("validation_method", "unknown")
            result["categories_validated"] = validation_results.get("categories_validated", len([k for k, v in validation_results.get("validation_results", {}).items() if v]))
        else:
            # If no validation results, create empty structure
            result = {
                "validation_results": {},
                "overall_validation_score": 0.0,
                "validation_timestamp": datetime.now().isoformat(),
                "validation_method": "none",
                "categories_validated": 0
            }
        
        # Add enrichment info to result
        if enrichment_result:
            result["enrichment"] = {
                "fields_enriched": enrichment_result.get("fields_enriched", []),
                "fields_enriched_count": enrichment_result.get("fields_enriched_count", 0),
                "status": enrichment_result.get("status", "unknown"),
                "enrichment_metadata": enrichment_result.get("enrichment_metadata", {})
            }
        
        # Store validation result in Firestore (already saved by enrichment agent, but update if needed)
        if resolved_memo_id and validation_results:
            try:
                db = firestore.client()
                
                if memo_type == "diligence":
                    # Store in diligenceResults collection
                    diligence_doc_ref = db.collection("diligenceResults").document(resolved_memo_id)
                    diligence_doc_ref.set({
                        "validation_results": validation_results,
                        "validation_timestamp": datetime.now().isoformat()
                    }, merge=True)
                    print(f"Validation result stored in diligenceResults for memo: {resolved_memo_id}")
                else:
                    # Update memo1_validated with validation results (enrichment agent already saved basic structure)
                    validated_doc_ref = db.collection("memo1_validated").document(resolved_memo_id)
                    validated_doc_ref.set({
                        "validation_results": validation_results,
                        "validation_timestamp": datetime.now().isoformat(),
                        "validation_method": validation_results.get("validation_method", "unknown")
                    }, merge=True)
                    print(f"Validation result stored/updated in memo1_validated for memo: {resolved_memo_id}")
                    
            except Exception as e:
                print(f"Error storing validation result: {e}")
                import traceback
                traceback.print_exc()
                # Don't fail the request if storage fails
        
        # Return results with proper JSON content type
        headers = {
            **get_cors_headers(req),
            'Content-Type': 'application/json'
        }
        return https_fn.Response(json.dumps(result), status=200, headers=headers)
        
    except Exception as e:
        print(f"Error in validate_memo_data: {e}")
        import traceback
        traceback.print_exc()
        headers = {
            **get_cors_headers(req),
            'Content-Type': 'application/json'
        }
        return https_fn.Response(json.dumps({"error": str(e)}), status=500, headers=headers)

@https_fn.on_request(
    memory=options.MemoryOption.MB_512,
    timeout_sec=300,
    invoker="public"
)
def validate_market_size(req: https_fn.Request):
    """
    Endpoint: POST /validate_market_size
    Body: { market_size_claim, industry_category }
    Returns: Market size validation results
    """
    try:
        # Handle CORS preflight
        if req.method == "OPTIONS":
            headers = get_cors_headers(req)
            return https_fn.Response("", status=200, headers=headers)

        # Initialize Firebase before any Firestore operations
        get_firebase_app()

        # Extract and validate parameters
        data = req.get_json()
        if not data:
            return https_fn.Response('No JSON data provided', status=400)

        market_size_claim = data.get("market_size_claim")
        industry_category = data.get("industry_category", "technology")
        
        if not market_size_claim:
            return https_fn.Response('Missing required parameter: market_size_claim', status=400)

        # Lazy-initialize the validation service
        from services.google_validation_service import GoogleValidationService
        validation_service = GoogleValidationService()
        validation_service.set_up()
        
        print(f"Validating market size: {market_size_claim} for industry: {industry_category}")
        
        # Run validation
        result = validation_service.validate_market_size(market_size_claim, industry_category)
        
        # Store validation result in Firestore
        memo_id = data.get("memo_id")
        memo_type = data.get("memo_type", "memo_1")
        
        if memo_id:
            try:
                db = firestore.client()
                
                if memo_type == "diligence":
                    # Store in diligenceResults collection
                    diligence_doc_ref = db.collection("diligenceResults").document(memo_id)
                    diligence_doc_ref.update({
                        "market_validation_result": result
                    })
                    print(f"Market validation result stored in diligenceResults for memo: {memo_id}")
                else:
                    # Store in ingestionResults collection under memo_1
                    memo_doc_ref = db.collection("ingestionResults").document(memo_id)
                    memo_doc_ref.update({
                        "memo_1.market_validation_result": result
                    })
                    print(f"Market validation result stored in ingestionResults for memo: {memo_id}")
                    
            except Exception as e:
                print(f"Error storing market validation result: {e}")
                # Don't fail the request if storage fails
        
        # Return results with proper JSON content type
        headers = {
            **get_cors_headers(req),
            'Content-Type': 'application/json'
        }
        return https_fn.Response(json.dumps(result), status=200, headers=headers)
        
    except Exception as e:
        print(f"Error in validate_market_size: {e}")
        headers = {
            **get_cors_headers(req),
            'Content-Type': 'application/json'
        }
        return https_fn.Response(json.dumps({"error": str(e)}), status=500, headers=headers)

@https_fn.on_request(
    memory=options.MemoryOption.MB_512,
    timeout_sec=60,
    invoker="public"
)
def check_memo(req: https_fn.Request):
    """
    Endpoint: GET /check_memo?fileName=<filename>
    Returns: Memo ID and processing status for a given filename
    """
    try:
        # Handle CORS preflight
        if req.method == "OPTIONS":
            headers = get_cors_headers(req)
            return https_fn.Response("", status=200, headers=headers)

        if req.method != "GET":
            headers = get_cors_headers(req)
            return https_fn.Response("Method not allowed", status=405, headers=headers)

        # Get filename from query parameters
        fileName = req.args.get('fileName')
        if not fileName:
            headers = get_cors_headers(req)
            return https_fn.Response("Missing fileName parameter", status=400, headers=headers)

        print(f"Checking memo status for filename: {fileName}")

        # Initialize Firebase app
        get_firebase_app()
        db = firestore.client()

        # Search for memo by filename in ingestionResults
        ingestion_query = db.collection("ingestionResults").where("original_filename", "==", fileName)
        ingestion_docs = ingestion_query.get()

        if ingestion_docs:
            # Found in ingestionResults
            doc = ingestion_docs[0]
            doc_data = doc.to_dict()
            memo_1 = doc_data.get("memo_1", {})
            
            result = {
                "memoId": doc.id,
                "status": doc_data.get("status", "unknown"),
                "title": memo_1.get("title", "Unknown"),
                "founder_name": memo_1.get("founder_name", "Unknown"),
                "timestamp": doc_data.get("timestamp", ""),
                "processing_time_seconds": doc_data.get("processing_time_seconds", 0)
            }
            
            print(f"Found memo in ingestionResults: {result}")
            
            headers = {
                **get_cors_headers(req),
                'Content-Type': 'application/json'
            }
            return https_fn.Response(json.dumps(result), status=200, headers=headers)

        # If not found in ingestionResults, check if it's still processing
        # This could be enhanced to check processing status in the future
        result = {
            "memoId": None,
            "status": "processing",
            "message": "File is still being processed"
        }
        
        print(f"No memo found for filename: {fileName}")
        
        headers = {
            **get_cors_headers(req),
            'Content-Type': 'application/json'
        }
        return https_fn.Response(json.dumps(result), status=200, headers=headers)
        
    except Exception as e:
        print(f"Error in check_memo: {e}")
        headers = {
            **get_cors_headers(req),
            'Content-Type': 'application/json'
        }
        return https_fn.Response(json.dumps({"error": str(e)}), status=500, headers=headers)

@https_fn.on_request(
    memory=options.MemoryOption.MB_512,
    timeout_sec=300,
    invoker="public"
)
def validate_competitors(req: https_fn.Request):
    """
    Endpoint: POST /validate_competitors
    Body: { competitors, industry_category }
    Returns: Competitor validation results
    """
    try:
        # Handle CORS preflight
        if req.method == "OPTIONS":
            headers = get_cors_headers(req)
            return https_fn.Response("", status=200, headers=headers)

        # Initialize Firebase before any Firestore operations
        get_firebase_app()

        # Extract and validate parameters
        data = req.get_json()
        if not data:
            return https_fn.Response('No JSON data provided', status=400)

        competitors = data.get("competitors", [])
        industry_category = data.get("industry_category", "technology")
        
        if not competitors:
            return https_fn.Response('Missing required parameter: competitors', status=400)

        # Lazy-initialize the validation service
        from services.google_validation_service import GoogleValidationService
        validation_service = GoogleValidationService()
        validation_service.set_up()
        
        print(f"Validating competitors: {competitors} for industry: {industry_category}")
        
        # Run validation
        result = validation_service.validate_competitors(competitors, industry_category)
        
        # Store validation result in Firestore
        memo_id = data.get("memo_id")
        memo_type = data.get("memo_type", "memo_1")
        
        if memo_id:
            try:
                db = firestore.client()
                
                if memo_type == "diligence":
                    # Store in diligenceResults collection
                    diligence_doc_ref = db.collection("diligenceResults").document(memo_id)
                    diligence_doc_ref.update({
                        "competitor_validation_result": result
                    })
                    print(f"Competitor validation result stored in diligenceResults for memo: {memo_id}")
                else:
                    # Store in ingestionResults collection under memo_1
                    memo_doc_ref = db.collection("ingestionResults").document(memo_id)
                    memo_doc_ref.update({
                        "memo_1.competitor_validation_result": result
                    })
                    print(f"Competitor validation result stored in ingestionResults for memo: {memo_id}")
                    
            except Exception as e:
                print(f"Error storing competitor validation result: {e}")
                # Don't fail the request if storage fails
        
        # Return results with proper JSON content type
        headers = {
            **get_cors_headers(req),
            'Content-Type': 'application/json'
        }
        return https_fn.Response(json.dumps(result), status=200, headers=headers)
        
    except Exception as e:
        print(f"Error in validate_competitors: {e}")
        headers = {
            **get_cors_headers(req),
            'Content-Type': 'application/json'
        }
        return https_fn.Response(json.dumps({"error": str(e)}), status=500, headers=headers)


# ============================================================================
# AI INTERVIEW SYSTEM CLOUD FUNCTIONS
# ============================================================================

@https_fn.on_request(region="asia-south1", memory=options.MemoryOption.MB_512)
def start_ai_interview(req: https_fn.Request) -> https_fn.Response:
    """HTTP endpoint triggered when founder clicks 'Start AI Interview' button."""
    
    # Initialize Firebase app when function runs
    get_firebase_app()

    try:
        # Handle CORS for testing
        if req.method == 'OPTIONS':
            headers = get_cors_headers(req)
            headers['Access-Control-Max-Age'] = '3600'
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

        interview_id = data.get("interview_id")
        if not interview_id:
            return https_fn.Response('Missing required parameter: interview_id', status=400)

        print(f"Starting AI interview for: {interview_id}")

        # Fetch interview record from Firestore
        db = firestore.client()
        interview_ref = db.collection('interviews').document(interview_id)
        interview_doc = interview_ref.get()
        
        if not interview_doc.exists:
            return https_fn.Response('Interview not found', status=404)
        
        interview_data = interview_doc.to_dict()
        current_status = interview_data.get('status')
        
        # Verify status is 'scheduled' or 'waiting_for_founder'
        if current_status not in ['scheduled', 'waiting_for_founder']:
            return https_fn.Response(
                f'Interview cannot be started. Current status: {current_status}', 
                status=400
            )

        # Update status to 'in_progress' using plain datetime
        from datetime import datetime
        interview_ref.update({
            'status': 'in_progress',
            'startedAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat()
        })

        # Publish message to Pub/Sub: "bot-join-meeting" topic
        global publisher
        if publisher is None:
            publisher = pubsub_v1.PublisherClient()

        topic_path = publisher.topic_path("veritas-472301", "bot-join-meeting")
        message_data = {
            "interview_id": interview_id,
            "meeting_link": interview_data.get('meetingLink'),
            "company_id": interview_data.get('companyId'),
            "founder_email": interview_data.get('founderEmail'),
            "investor_email": interview_data.get('investorEmail')
        }
        message_bytes = json.dumps(message_data).encode("utf-8")

        publish_future = publisher.publish(topic_path, data=message_bytes)
        publish_future.result()

        print(f"Published bot-join-meeting message for interview: {interview_id}")

        # Return success response
        result = {
            'status': 'SUCCESS',
            'message': 'AI Interview started successfully',
            'interviewId': interview_id
        }
        
        headers = get_cors_headers(req)
        return https_fn.Response(json.dumps(result), status=200, headers=headers)
        
    except Exception as e:
        print(f"Error in start_ai_interview: {e}")
        import traceback
        traceback.print_exc()
        headers = get_cors_headers(req)
        return https_fn.Response(json.dumps({"status": "FAILED", "error": str(e)}), status=500, headers=headers)


@pubsub_fn.on_message_published(
    topic="bot-join-meeting", 
    timeout_sec=300,
    memory=options.MemoryOption.MB_512
)
def conduct_interview(event: pubsub_fn.CloudEvent) -> None:
    """Prepare interview questions - frontend handles recording"""
    
    # Initialize Firebase app when function runs
    get_firebase_app()

    try:
        # Extract interview_id from message - handle new Pub/Sub event structure
        import base64
        
        # New event structure uses event.data["message"]["data"]
        if hasattr(event.data, 'message'):
            message_bytes = base64.b64decode(event.data.message.data)
        else:
            # Fallback for direct data access
            message_bytes = base64.b64decode(event.data["message"]["data"])
        
        message_data = json.loads(message_bytes.decode('utf-8'))
        interview_id = message_data.get('interview_id')
        company_id = message_data.get('company_id')
        
        if not interview_id:
            print("Error: No interview_id in message")
            return

        print(f"Preparing interview questions: {interview_id}")

        # Initialize QAGenerationAgent
        from agents.qa_generation_agent import QAGenerationAgent
        qa_agent = QAGenerationAgent(project="veritas-472301")
        qa_agent.set_up()

        # Generate questions based on Memo 1 + Diligence data
        print(f"Generating questions for company: {company_id}")
        questions = qa_agent.generate_questions(company_id)
        print(f"Generated {len(questions)} questions")

        # Store questions in Firestore
        db = firestore.client()
        interview_ref = db.collection('interviews').document(interview_id)
        interview_ref.update({
            'questions': questions,
            'status': 'ready',
            'updatedAt': datetime.now().isoformat()
        })
        
        print(f"Stored {len(questions)} questions for interview {interview_id}")
        
    except Exception as e:
        print(f"Error in conduct_interview: {e}")
        import traceback
        traceback.print_exc()
        
        # Update status to failed
        try:
            db = firestore.client()
            interview_ref = db.collection('interviews').document(interview_id)
            interview_ref.update({
                'status': 'failed',
                'error': str(e),
                'updatedAt': datetime.now().isoformat()
            })
        except:
            pass


@pubsub_fn.on_message_published(topic="interview-completed", memory=512)
def generate_interview_summary(event: pubsub_fn.CloudEvent) -> None:
    """Generate post-interview analysis triggered by Pub/Sub."""
    
    # Initialize Firebase app when function runs
    get_firebase_app()

    try:
        # Extract interview_id with proper Pub/Sub message parsing
        import base64
        if hasattr(event.data, 'message'):
            message_bytes = base64.b64decode(event.data.message.data)
        else:
            message_bytes = base64.b64decode(event.data["message"]["data"])
        message_data = json.loads(message_bytes.decode('utf-8'))
        interview_id = message_data.get('interview_id')
        company_id = message_data.get('company_id')
        
        if not interview_id:
            print("Error: No interview_id in message")
            return

        print(f"Generating summary for interview: {interview_id}")

        # Initialize InterviewSynthesisAgent
        from agents.interview_synthesis_agent import InterviewSynthesisAgent
        synthesis_agent = InterviewSynthesisAgent(project="veritas-472301")
        synthesis_agent.set_up()

        # Generate summary
        summary = synthesis_agent.generate_summary(interview_id)
        
        print(f"Generated summary for interview: {interview_id}")
        print(f"Confidence Score: {summary.get('confidenceScore', 'N/A')}/10")
        
    except Exception as e:
        print(f"Error in generate_interview_summary: {e}")
        import traceback
        traceback.print_exc()


@https_fn.on_request(region="asia-south1", memory=options.MemoryOption.MB_512)
def submit_interview_answer(req: https_fn.Request) -> https_fn.Response:
    """Process founder's recorded answer and get next question"""
    
    # Initialize Firebase app when function runs
    get_firebase_app()
    
    try:
        # Handle CORS for testing
        if req.method == 'OPTIONS':
            headers = get_cors_headers(req)
            headers['Access-Control-Max-Age'] = '3600'
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

        interview_id = data.get('interview_id')
        question_number = data.get('question_number')
        answer_text = data.get('answer_text')  # Transcribed by frontend
        answer_audio_url = data.get('answer_audio_url')  # Optional
        
        if not all([interview_id, question_number is not None, answer_text]):
            return https_fn.Response('Missing required parameters: interview_id, question_number, answer_text', status=400)

        print(f"Processing answer for interview {interview_id}, question {question_number}")
        
        # Store answer in transcript
        db = firestore.client()
        interview_ref = db.collection('interviews').document(interview_id)
        interview_doc = interview_ref.get()
        
        if not interview_doc.exists:
            return https_fn.Response('Interview not found', status=404)
        
        interview_data = interview_doc.to_dict()
        transcript = interview_data.get('transcript', [])
        
        # Add answer to transcript
        transcript.append({
            'speaker': 'founder',
            'text': answer_text,
            'timestamp': datetime.now().isoformat(),
            'questionNumber': question_number,
            'audioUrl': answer_audio_url
        })
        
        # Update Firestore
        interview_ref.update({
            'transcript': transcript,
            'updatedAt': datetime.now().isoformat()
        })
        
        # Check if interview is complete
        questions = interview_data.get('questions', [])
        if question_number >= len(questions) - 1:
            # Trigger summary generation
            interview_ref.update({'status': 'generating_summary'})
            
            global publisher
            if publisher is None:
                publisher = pubsub_v1.PublisherClient()
            
            topic_path = publisher.topic_path("veritas-472301", "interview-completed")
            message_data = {
                "interview_id": interview_id,
                "company_id": interview_data.get('companyId')
            }
            message_bytes = json.dumps(message_data).encode("utf-8")
            publisher.publish(topic_path, data=message_bytes)
            
            result = {
                'status': 'completed',
                'message': 'Interview completed'
            }
            
            headers = get_cors_headers(req)
            return https_fn.Response(json.dumps(result), status=200, headers=headers)
        
        # Return next question
        next_question = questions[question_number + 1] if question_number + 1 < len(questions) else None
        
        result = {
            'status': 'continue',
            'nextQuestion': next_question,
            'questionNumber': question_number + 1
        }
        
        headers = get_cors_headers(req)
        return https_fn.Response(json.dumps(result), status=200, headers=headers)
        
    except Exception as e:
        print(f"Error in submit_interview_answer: {e}")
        import traceback
        traceback.print_exc()
        headers = get_cors_headers(req)
        return https_fn.Response(json.dumps({"error": str(e)}), status=500, headers=headers)


@https_fn.on_request(region="asia-south1", memory=options.MemoryOption.MB_512)
def upload_investors(req: https_fn.Request) -> https_fn.Response:
    """
    One-time endpoint to upload investors from JSON to Firestore.
    POST /upload_investors
    """
    get_firebase_app()
    
    try:
        if req.method == 'OPTIONS':
            headers = get_cors_headers(req)
            return https_fn.Response('', status=204, headers=headers)
        
        if req.method != 'POST':
            headers = get_cors_headers(req)
            return https_fn.Response(json.dumps({"error": "Method not allowed"}), status=405, headers={**get_cors_headers(req), 'Content-Type': 'application/json'})
        
        import os
        current_dir = os.path.dirname(os.path.abspath(__file__))
        json_file_path = os.path.join(current_dir, 'agents', 'investors_list.json')
        
        if not os.path.exists(json_file_path):
            return https_fn.Response(json.dumps({"error": "Investors JSON file not found"}), status=404, headers={**get_cors_headers(req), 'Content-Type': 'application/json'})
        
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        investors = data.get('investors', [])
        db = firestore.client()
        collection_ref = db.collection('investors')
        
        uploaded_count = 0
        updated_count = 0
        
        for investor in investors:
            investor_id = investor.get('id')
            if not investor_id:
                continue
            
            doc_ref = collection_ref.document(investor_id)
            investor_data = {**investor, 'uploaded_at': firestore.SERVER_TIMESTAMP, 'last_updated': firestore.SERVER_TIMESTAMP}
            
            if doc_ref.get().exists:
                doc_ref.update(investor_data)
                updated_count += 1
            else:
                doc_ref.set(investor_data)
                uploaded_count += 1
        
        result = {"success": True, "total_investors": len(investors), "uploaded": uploaded_count, "updated": updated_count}
        return https_fn.Response(json.dumps(result), status=200, headers={**get_cors_headers(req), 'Content-Type': 'application/json'})
        
    except Exception as e:
        print(f"Error uploading investors: {e}")
        import traceback
        traceback.print_exc()
        return https_fn.Response(json.dumps({"error": str(e)}), status=500, headers={**get_cors_headers(req), 'Content-Type': 'application/json'})


@https_fn.on_request(region="asia-south1", memory=options.MemoryOption.MB_512)
def investor_match(req: https_fn.Request) -> https_fn.Response:
    """
    API endpoint for investor matching.
    Matches founders from ingestionResults with investors from Firestore 'investors' collection.
    READ-ONLY operations - does not modify memo data.
    
    Accepts:
    - memo_id: Document ID in ingestionResults (optional)
    - founder_email: Founder email to look up (optional)
    - min_score: Minimum match score threshold (optional, default 0.3)
    
    Returns:
    - Ranked list of investor matches with scores and reasoning
    """
    
    # Initialize Firebase app when function runs
    get_firebase_app()
    
    try:
        # Handle CORS
        if req.method == 'OPTIONS':
            headers = get_cors_headers(req)
            headers['Access-Control-Max-Age'] = '3600'
            return https_fn.Response('', status=204, headers=headers)

        if req.method != 'POST' and req.method != 'GET':
            headers = get_cors_headers(req)
            return https_fn.Response(
                json.dumps({"error": "Method not allowed"}),
                status=405,
                headers={**headers, 'Content-Type': 'application/json'}
            )

        # Extract parameters
        if req.method == 'POST':
            data = req.get_json() or {}
        else:
            # GET request - parse query parameters
            import urllib.parse
            params = urllib.parse.parse_qs(req.query_string)
            data = {k: v[0] if isinstance(v, list) and len(v) > 0 else v for k, v in params.items()}

        memo_id = data.get('memo_id')
        founder_email = data.get('founder_email')
        min_score = float(data.get('min_score', 0.3))
        force_recompute = data.get('force_recompute', False)  # Allow forcing recomputation

        print(f"Investor matching request: memo_id={memo_id}, founder_email={founder_email}, min_score={min_score}, force_recompute={force_recompute}")

        # Check if results already exist in Firestore (unless forcing recompute)
        result = None
        if not force_recompute and (memo_id or founder_email):
            try:
                db = firestore.client()
                doc_id = memo_id or founder_email
                match_doc_ref = db.collection("investor_matches").document(doc_id)
                existing_doc = match_doc_ref.get()
                
                if existing_doc.exists:
                    existing_data = existing_doc.to_dict()
                    stored_min_score = existing_data.get("min_score_used", 0.3)
                    
                    # If stored results used same or lower min_score, return cached results
                    if stored_min_score <= min_score:
                        print(f"✅ Found cached matching results in Firestore for doc_id={doc_id}")
                        result = {
                            "status": "SUCCESS",
                            "founder_data": existing_data.get("founder_data", {}),
                            "matches": existing_data.get("matches", []),
                            "total_investors_analyzed": existing_data.get("total_investors_analyzed", 0),
                            "processing_time_seconds": existing_data.get("processing_time_seconds", 0),
                            "timestamp": existing_data.get("timestamp", datetime.now().isoformat()),
                            "cached": True,
                            "firestore_doc_id": doc_id
                        }
            except Exception as fetch_error:
                print(f"⚠️ Error fetching cached results: {fetch_error}")
                # Continue to compute new results

        # If no cached results found, compute new matches
        if result is None:
            print("Computing new matching results...")
            # Initialize Investor Matching Agent
            from agents.investor_matching_agent import InvestorMatchingAgent
            
            agent = InvestorMatchingAgent(project="veritas-472301", location="asia-south1")
            agent.set_up()

            # Find matches
            result = agent.find_matches(memo_id=memo_id, founder_email=founder_email, min_score=min_score)

        # Store matching results in Firestore if successful
        if result.get("status") == "SUCCESS" and (memo_id or founder_email):
            try:
                db = firestore.client()
                
                # Use memo_id as document ID if available, otherwise use founder_email
                doc_id = memo_id or founder_email
                
                # Create document in investor_matches collection
                match_doc_ref = db.collection("investor_matches").document(doc_id)
                
                # Prepare data to store
                match_data = {
                    "memo_id": memo_id,
                    "founder_email": founder_email,
                    "founder_data": result.get("founder_data", {}),
                    "matches": result.get("matches", []),
                    "total_investors_analyzed": result.get("total_investors_analyzed", 0),
                    "min_score_used": min_score,
                    "created_at": firestore.SERVER_TIMESTAMP,
                    "last_updated": firestore.SERVER_TIMESTAMP,
                    "timestamp": datetime.now().isoformat(),
                    "processing_time_seconds": result.get("processing_time_seconds", 0)
                }
                
                # Use set with merge=True to update if exists, or create if new
                match_doc_ref.set(match_data, merge=True)
                print(f"✅ Stored matching results in Firestore for doc_id={doc_id}")
                
                # Add storage info to result
                result["stored_in_firestore"] = True
                result["firestore_doc_id"] = doc_id
                
            except Exception as storage_error:
                print(f"⚠️ Warning: Failed to store matching results in Firestore: {storage_error}")
                import traceback
                traceback.print_exc()
                # Don't fail the request if storage fails
                result["stored_in_firestore"] = False
                result["storage_error"] = str(storage_error)
        else:
            result["stored_in_firestore"] = False

        # Ensure result is JSON serializable
        try:
            result_json = json.dumps(result, default=str)
        except (TypeError, ValueError) as json_error:
            print(f"Error serializing result to JSON: {json_error}")
            result = {
                "status": "ERROR",
                "error": f"Failed to serialize response: {str(json_error)}",
                "matches": [],
                "timestamp": datetime.now().isoformat()
            }
            result_json = json.dumps(result)

        headers = get_cors_headers(req)
        headers['Content-Type'] = 'application/json'
        return https_fn.Response(result_json, status=200, headers=headers)
        
    except Exception as e:
        print(f"Error in investor_match: {e}")
        import traceback
        traceback.print_exc()
        headers = get_cors_headers(req)
        return https_fn.Response(json.dumps({"error": str(e), "status": "ERROR"}), status=500, headers=headers)
