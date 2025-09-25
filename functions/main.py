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

# Set global options - THIS IS CRITICAL FOR YOUR REGION
options.set_global_options(region="asia-south1")

# Import our custom agent logic from the agents/ directory
from agents.intake_agent import IntakeCurationAgent  # CORRECT CLASS NAME
from agents.diligence_agent import DiligenceAgent
from agents.coordinator_agent import CoordinatorAgent
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
# ------------------------------------


# --- 2. Ingestion Pipeline: Stage 1 (File Upload) ---
@https_fn.on_request(
    memory=options.MemoryOption.MB_256,
    cors=options.CorsOptions(
        cors_origins=["*"],
        cors_methods=["POST", "OPTIONS"]
    )
)
def on_file_upload(req: https_fn.Request) -> https_fn.Response:
    """Handle file uploads from frontend"""
    try:
        # Handle CORS preflight
        if req.method == 'OPTIONS':
            headers = {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '3600'
            }
            return https_fn.Response('', status=204, headers=headers)
        
        # Get Firebase app
        app = get_firebase_app()
        
        # Check content type
        content_type = req.headers.get('content-type', '')
        if 'application/json' not in content_type:
            return https_fn.Response(
                json.dumps({"error": "Content-Type must be application/json"}),
                status=415,
                headers={'Content-Type': 'application/json'}
            )
        
        # Parse request data
        data = req.get_json()
        if not data:
            return https_fn.Response(
                json.dumps({"error": "No data provided"}),
                status=400,
                headers={'Content-Type': 'application/json'}
            )
        
        file_name = data.get('file_name')
        file_type = data.get('file_type')
        file_size = data.get('file_size')
        content_type = data.get('content_type')
        file_data = data.get('file_data')  # Base64 encoded file data
        
        if not all([file_name, file_type, file_data]):
            return https_fn.Response("Missing required fields", status=400)
        
        # Decode base64 file data
        try:
            file_bytes = base64.b64decode(file_data)
        except Exception as e:
            print(f"Error decoding base64: {e}")
            return https_fn.Response("Invalid file data", status=400)
        
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
            
            return https_fn.Response(json.dumps({
                'success': True,
                'download_url': download_url,
                'file_name': blob_name,
                'message': 'File uploaded successfully',
                'memo_id': doc_ref[1].id  # Add this line
            }), status=200, headers={'Content-Type': 'application/json'})
            
        finally:
            # Clean up temporary file
            try:
                os.unlink(temp_file_path)
            except:
                pass
                
    except Exception as e:
        print(f"Error in on_file_upload: {e}")
        return https_fn.Response(f"Internal server error: {str(e)}", status=500)

# --- 3. Ingestion Pipeline: Stage 2 (AI Processing) ---
@pubsub_fn.on_message_published(
    topic="document-ingestion-topic",
    memory=options.MemoryOption.MB_256,
    timeout_sec=540
)
def process_ingestion_task(event: pubsub_fn.CloudEvent) -> None:
    """Triggers on a Pub/Sub message and calls the IntakeCurationAgent."""
    global ingestion_agent, publisher
    
    # Initialize Firebase app when function runs
    get_firebase_app()
    
    try:
        if ingestion_agent is None:
            print("Initializing IntakeCurationAgent...")  # CORRECT NAME
            ingestion_agent = IntakeCurationAgent(project="veritas-472301")  # CORRECT CLASS
            ingestion_agent.set_up()
            print("IntakeCurationAgent initialized.")  # CORRECT NAME

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

        print(f"Invoking IntakeCurationAgent for file type: {file_type}...")  # CORRECT NAME
        ingestion_result = ingestion_agent.run(
            file_data=file_data, filename=file_path, file_type=file_type
        )
        
        if ingestion_result.get("status") == "SUCCESS":
            print(f"Successfully ingested {file_path}. Memo 1 generated. Saving to Firestore...")
            db = firestore.client()
            doc_ref = db.collection("ingestionResults").add(ingestion_result)
            print(f"Successfully saved results for {file_path} to Firestore with ID: {doc_ref[1].id}")
            
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
    memory=options.MemoryOption.MB_256,  # Reduced memory to match firebase.json
    timeout_sec=540  # Maximum allowed for event-triggered functions
)
def process_diligence_task(event: pubsub_fn.CloudEvent) -> None:
    """Triggers on a Pub/Sub message and calls the DiligenceAgent."""
    global diligence_agent
    
    # Initialize Firebase app when function runs
    get_firebase_app()
    
    start_time = datetime.now()
    
    try:
        if diligence_agent is None:
            print("Initializing DiligenceAgent...")
            diligence_agent = DiligenceAgent(project="veritas-472301")
            diligence_agent.set_up()
            print("DiligenceAgent initialized.")

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
        memo_2_result = diligence_agent.run(
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
            doc_ref = db.collection("diligenceResults").add(diligence_result)
            print(f"Successfully saved Memo 1 Diligence with ID: {doc_ref[1].id}")
        else:
            print(f"ERROR: DiligenceAgent failed. Reason: {memo_2_result.get('error')}")
    except Exception as e:
        print(f"A critical error occurred in process_diligence_task: {e}")
        raise

# --- 5. HTTP Endpoint for Manual Diligence Trigger ---
@https_fn.on_request(
    memory=options.MemoryOption.MB_256, 
    timeout_sec=900,
    cors=options.CorsOptions(
        cors_origins=["*"],
        cors_methods=["POST", "OPTIONS"]
    )
)
def trigger_diligence(req: https_fn.Request) -> https_fn.Response:
    """HTTP endpoint to manually trigger diligence analysis on a memo."""
    
    # Initialize Firebase app when function runs
    get_firebase_app()
    
    try:
        # Handle CORS preflight
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

        data = req.get_json()
        if not data or 'memo_1_id' not in data:
            return https_fn.Response('Missing memo_1_id in request body', status=400)

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
    memory=options.MemoryOption.MB_256,
    cors=options.CorsOptions(
        cors_origins=["*"],
        cors_methods=["POST", "OPTIONS"]
    )
)
def schedule_ai_interview(req: https_fn.Request) -> https_fn.Response:
    """HTTP endpoint to trigger the CoordinatorAgent for scheduling the AI interview."""
    global coordinator_agent

    # Initialize Firebase app when function runs
    get_firebase_app()

    try:
        # Handle CORS for testing
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

        founder_email = data.get("founder_email")
        investor_email = data.get("investor_email") 
        startup_name = data.get("startup_name")
        calendar_id = data.get("calendar_id")
        
        # Use environment variable instead of hardcoded
        calendar_id = data.get("calendar_id") or os.getenv("DEFAULT_CALENDAR_ID", "93fe7cf38ab2552f7c40f0a9e3584f3fab5bbe5e006011eac718ca8e7cc34e4f@group.calendar.google.com")
        
        # Validate required parameters
        if not all([founder_email, investor_email, startup_name]):
            return https_fn.Response('Missing required parameters: founder_email, investor_email, startup_name', status=400)

        # Lazy-initialize the agent
        if coordinator_agent is None:
            print("Initializing CoordinatorAgent...")
            # Use pure ADC approach - no service account files needed
            coordinator_agent = CoordinatorAgent()  # No parameters needed
            coordinator_agent.set_up()
        
        print(f"Scheduling AI interview for {startup_name}")
        print(f"Founder: {founder_email}")
        print(f"Investor: {investor_email}")
        print(f"Calendar: {calendar_id}")
        
        result = coordinator_agent.run(calendar_id, founder_email, investor_email, startup_name)
        
        # Return JSON response
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        }
        return https_fn.Response(json.dumps(result), status=200, headers=headers)
        
    except Exception as e:
        print(f"Error in schedule_ai_interview: {e}")
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        }
        return https_fn.Response(json.dumps({"status": "FAILED", "error": str(e)}), status=500, headers=headers)