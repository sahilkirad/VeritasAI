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

# Firebase Functions SDK imports
from firebase_functions import storage_fn, pubsub_fn, https_fn, options
from firebase_admin import auth as firebase_auth

# Set global options - THIS IS CRITICAL FOR YOUR REGION
options.set_global_options(region="asia-south1")

def get_cors_headers(request):
    """Get CORS headers based on request origin"""
    origin = request.headers.get('Origin', 'https://veritas-472301.web.app')
    allowed_origins = ['http://localhost:3000', 'https://veritas-472301.web.app']
    cors_origin = origin if origin in allowed_origins else 'https://veritas-472301.web.app'
    
    return {
        'Access-Control-Allow-Origin': cors_origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
    }

# --- 1. Global Initialization ---
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
qa_agent = None
speech_agent = None
synthesis_agent = None
sentiment_agent = None
meeting_agent = None
feedback_agent = None

# --- 2. File Upload and Processing Functions ---

@https_fn.on_request()
def on_file_upload(req: https_fn.Request) -> https_fn.Response:
    """Handle file uploads from frontend"""
    global publisher
    try:
        # Handle CORS preflight
        if req.method == 'OPTIONS':
            headers = get_cors_headers(req)
            headers['Access-Control-Max-Age'] = '3600'
            return https_fn.Response('', status=204, headers=headers)

        # Skip Firebase authentication for now - using custom auth system
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
        
        # Handle JSON file uploads (base64 encoded)
        if 'file_data' in data:
            try:
                file_data = data['file_data']
                file_bytes = base64.b64decode(file_data)
            except Exception as e:
                print(f"Error decoding base64: {e}")
                headers = get_cors_headers(req)
                return https_fn.Response(
                    json.dumps({"error": "Invalid base64 file data"}),
                    status=400,
                    headers=headers
                )
            
            # Create temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
                temp_file.write(file_bytes)
                temp_file_path = temp_file.name
            
            try:
                # Upload to Firebase Storage
                bucket = storage.bucket('veritas-472301.firebasestorage.app')
                timestamp = int(time.time() * 1000)
                blob_name = f"deck/{timestamp}-upload.pdf"
                blob = bucket.blob(blob_name)
                
                blob.upload_from_filename(temp_file_path, content_type='application/pdf')
                blob.make_public()
                download_url = blob.public_url
                
                # Save to Firestore
                db = firestore.client()
                upload_doc = {
                    'fileName': blob_name,
                    'originalName': 'upload.pdf',
                    'downloadURL': download_url,
                    'contentType': 'application/pdf',
                    'size': len(file_bytes),
                    'type': 'deck',
                    'status': 'uploaded',
                    'uploadedAt': firestore.SERVER_TIMESTAMP,
                    'uploadedBy': 'user',
                    'founderEmail': data.get('founder_email', 'unknown@example.com')
                }
                
                upload_ref = db.collection('uploads').add(upload_doc)
                
                # Trigger processing
                message_data = {
                    "bucket_name": "veritas-472301.firebasestorage.app",
                    "file_path": blob_name,
                    "content_type": "application/pdf",
                    "download_url": download_url,
                    "original_name": "upload.pdf",
                    "file_size": len(file_bytes),
                    "file_type": "deck",
                    "upload_id": upload_ref[1].id,
                    "founder_email": data.get('founder_email', 'unknown@example.com'),
                    "triggered_by": "json_upload"
                }
                
                # Publish to Pub/Sub
                if publisher is None:
                    publisher = pubsub_v1.PublisherClient()
                topic_path = publisher.topic_path("veritas-472301", "document-ingestion-topic")
                
                message_json = json.dumps(message_data)
                message_bytes = message_json.encode('utf-8')
                
                future = publisher.publish(topic_path, message_bytes)
                message_id = future.result()
                
                print(f"Published message to Pub/Sub: {message_data}")
                
            except Exception as e:
                print(f"Error triggering processing: {e}")
                # Don't fail the upload if processing trigger fails
            
            finally:
                # Clean up temporary file
                try:
                    os.unlink(temp_file_path)
                except:
                    pass
            
            headers = get_cors_headers(req)
            return https_fn.Response(json.dumps({
                "message": "File uploaded successfully",
                "status": "success",
                "upload_id": upload_ref[1].id,
                "download_url": download_url
            }), status=200, headers=headers)

    except Exception as e:
        print(f"Error in on_file_upload: {e}")
        headers = get_cors_headers(req)
        return https_fn.Response(f"Internal server error: {str(e)}", status=500, headers=headers)

# --- 3. Ingestion Pipeline: Stage 2 (AI Processing) ---

@pubsub_fn.on_message_published(topic="document-ingestion-topic")
def process_ingestion_task(event: pubsub_fn.CloudEvent) -> None:
    """Process uploaded documents using AI agents"""
    try:
        # Get message data
        message_data = event.data.get('message', {})
        if not message_data:
            print("No message data found")
            return
        
        # Decode message if it's base64 encoded
        if isinstance(message_data, bytes):
            try:
                message_str = message_data.decode('utf-8')
                print(f"Decoded message from bytes: {message_str}")
            except UnicodeDecodeError as e:
                print(f"ERROR: Failed to decode message bytes as UTF-8: {e}")
                return
        else:
            message_str = str(message_data)
        
        # Try to decode as base64 if it looks like base64
        if len(message_str) > 100 and not message_str.startswith('{'):
            try:
                decoded_bytes = base64.b64decode(message_str)
                message_str = decoded_bytes.decode('utf-8')
                print(f"Decoded Base64 message: {message_str}")
            except Exception as e:
                # If Base64 decoding fails, treat as regular string
                message_str = message_data
        
        # Parse JSON
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
    
    # Extract task information
    bucket_name = task_data.get('bucket_name', '')
    file_path = task_data.get('file_path', '')
    content_type = task_data.get('content_type', '')
    download_url = task_data.get('download_url', '')
    original_name = task_data.get('original_name', '')
    file_size = task_data.get('file_size', 0)
    file_type = task_data.get('file_type', 'deck')
    upload_id = task_data.get('upload_id', '')
    founder_email = task_data.get('founder_email', '')
    triggered_by = task_data.get('triggered_by', 'unknown')
    
    print(f"Processing ingestion task:")
    print(f"  Bucket: {bucket_name}")
    print(f"  File: {file_path}")
    print(f"  Type: {content_type}")
    print(f"  Size: {file_size} bytes")
    print(f"  Upload ID: {upload_id}")
    print(f"  Founder: {founder_email}")
    print(f"  Triggered by: {triggered_by}")
    
    # Initialize ingestion agent if needed
    global ingestion_agent
    if ingestion_agent is None:
        from agents.intake_agent import IntakeCurationAgent
        ingestion_agent = IntakeCurationAgent(
            project="veritas-472301",
            location="asia-south1"
        )
        ingestion_agent.set_up()
    
    # Process the document
    try:
        ingestion_result = ingestion_agent.process_document(
            bucket_name=bucket_name,
            file_path=file_path,
            content_type=content_type,
            download_url=download_url,
            original_name=original_name,
            file_size=file_size,
            file_type=file_type,
            upload_id=upload_id,
            founder_email=founder_email
        )
        
        if ingestion_result.get('success'):
            print(f"✅ Document processed successfully: {upload_id}")
            
            # Save memo to Firestore
            db = firestore.client()
            doc_ref = db.collection('memos').add(ingestion_result.get('memo_data', {}))
            print(f"Memo saved to Firestore: {doc_ref[1].id}")
            
            # Auto-trigger diligence analysis
            try:
                global publisher
                if publisher is None:
                    publisher = pubsub_v1.PublisherClient()
                
                diligence_message = {
                    "memo_1_id": doc_ref[1].id,
                    "founder_email": founder_email,
                    "triggered_by": "auto_after_ingestion"
                }
                
                topic_path = publisher.topic_path("veritas-472301", "diligence-analysis-topic")
                message_json = json.dumps(diligence_message)
                message_bytes = message_json.encode('utf-8')
                
                publish_future = publisher.publish(topic_path, message_bytes)
                publish_future.result()
                print(f"Successfully triggered diligence analysis for memo {doc_ref[1].id}")
            except Exception as e:
                print(f"ERROR: Failed to auto-trigger diligence: {e}")
        else:
            print(f"ERROR: Agent failed to ingest {file_path}. Reason: {ingestion_result.get('error')}")
    except Exception as e:
        print(f"A critical error occurred in process_ingestion_task: {e}")
        raise

# --- 4. Diligence Analysis Pipeline ---

@pubsub_fn.on_message_published(topic="diligence-analysis-topic")
def process_diligence_task(event: pubsub_fn.CloudEvent) -> None:
    """Process diligence analysis using AI agents"""
    try:
        # Get message data
        message_data = event.data.get('message', {})
        if not message_data:
            print("No message data found")
            return
        
        # Decode message if needed
        if isinstance(message_data, bytes):
            try:
                decoded_bytes = base64.b64decode(message_data)
                message_str = decoded_bytes.decode('utf-8')
            except Exception:
                message_str = message_data
        else:
            message_str = message_data
        
        try:
            task_data = json.loads(message_str)
        except json.JSONDecodeError as e:
            print(f"ERROR: Failed to parse message as JSON: {e}")
            return
        
        memo_1_id = task_data.get('memo_1_id', '')
        founder_email = task_data.get('founder_email', '')
        triggered_by = task_data.get('triggered_by', 'unknown')
        
        print(f"Processing diligence task:")
        print(f"  Memo 1 ID: {memo_1_id}")
        print(f"  Founder: {founder_email}")
        print(f"  Triggered by: {triggered_by}")
        
        # Initialize diligence agent if needed
        global diligence_agent
        if diligence_agent is None:
            from agents.diligence_agent import DiligenceAgent
            diligence_agent = DiligenceAgent(
                project="veritas-472301",
                location="asia-south1"
            )
            diligence_agent.set_up()
        
        # Process diligence analysis
        memo_2_result = diligence_agent.analyze_diligence(
            memo_1_id=memo_1_id,
            founder_email=founder_email
        )
        
        if memo_2_result.get('success'):
            print(f"✅ Diligence analysis completed successfully for memo {memo_1_id}")
        else:
            print(f"ERROR: DiligenceAgent failed. Reason: {memo_2_result.get('error')}")
    except Exception as e:
        print(f"A critical error occurred in process_diligence_task: {e}")
        raise

# --- 5. AI Interview System Functions ---

@https_fn.on_request()
def schedule_ai_interview(req: https_fn.Request) -> https_fn.Response:
    """Schedule an AI interview with Google Meet integration"""
    try:
        # Handle CORS
        if req.method == 'OPTIONS':
            headers = get_cors_headers(req)
            return https_fn.Response('', status=204, headers=headers)
        
        data = req.get_json()
        if not data:
            headers = get_cors_headers(req)
            return https_fn.Response(
                json.dumps({"error": "No data provided"}),
                status=400,
                headers=headers
            )
        
        # Extract interview details
        founder_email = data.get('founder_email', '')
        investor_email = data.get('investor_email', '')
        scheduled_time = data.get('scheduled_time', '')
        duration = data.get('duration', 45)
        
        # Create Google Calendar event with Meet link
        from google.oauth2 import service_account
        from googleapiclient.discovery import build
        
        # Initialize Google Calendar API
        credentials = service_account.Credentials.from_service_account_file(
            'veritas-472301-4adaefc0e151.json',
            scopes=['https://www.googleapis.com/auth/calendar']
        )
        
        service = build('calendar', 'v3', credentials=credentials)
        
        # Create event with Meet link
        event = {
            'summary': f'Veritas AI Interview - {founder_email}',
            'description': 'AI-led founder-investor interview auto-scheduled by Veritas platform.',
            'start': {
                'dateTime': scheduled_time,
                'timeZone': 'Asia/Kolkata'
            },
            'end': {
                'dateTime': scheduled_time.replace('T', 'T').replace('Z', '+05:30'),
                'timeZone': 'Asia/Kolkata'
            },
            'attendees': [
                {'email': founder_email},
                {'email': investor_email},
                {'email': 'ai@veritas.in'}
            ],
            'conferenceData': {
                'createRequest': {
                    'conferenceSolutionKey': {'type': 'hangoutsMeet'},
                    'requestId': f'veritas-meet-ai-{int(time.time())}',
                    'status': {'statusCode': 'success'}
                }
            },
            'sendUpdates': 'all',
            'guestsCanInviteOthers': False,
            'guestsCanModify': False,
            'guestsCanSeeOtherGuests': True
        }
        
        # Create the event
        created_event = service.events().insert(
            calendarId='primary',
            body=event,
            conferenceDataVersion=1
        ).execute()
        
        meet_link = created_event.get('conferenceData', {}).get('entryPoints', [{}])[0].get('uri', '')
        
        # Save interview details to Firestore
        db = firestore.client()
        interview_doc = {
            'founder_email': founder_email,
            'investor_email': investor_email,
            'scheduled_time': scheduled_time,
            'duration': duration,
            'meet_link': meet_link,
            'status': 'scheduled',
            'created_at': firestore.SERVER_TIMESTAMP,
            'event_id': created_event.get('id', '')
        }
        
        interview_ref = db.collection('interviews').add(interview_doc)
        
        result = {
            "success": True,
            "message": "AI interview scheduled successfully",
            "interview_id": interview_ref[1].id,
            "meet_link": meet_link,
            "event_id": created_event.get('id', '')
        }
        
        headers = get_cors_headers(req)
        return https_fn.Response(json.dumps(result), status=200, headers=headers)

    except Exception as e:
        print(f"Error in schedule_ai_interview: {e}")
        headers = get_cors_headers(req)
        return https_fn.Response(
            json.dumps({"error": f"Failed to schedule interview: {str(e)}"}),
            status=500,
            headers=headers
        )

@https_fn.on_request()
def start_transcription(req: https_fn.Request) -> https_fn.Response:
    """Start real-time transcription for AI interview"""
    try:
        # Handle CORS
        if req.method == 'OPTIONS':
            headers = get_cors_headers(req)
            return https_fn.Response('', status=204, headers=headers)
        
        data = req.get_json()
        if not data:
            headers = get_cors_headers(req)
            return https_fn.Response(
                json.dumps({"error": "No data provided"}),
                status=400,
                headers=headers
            )
        
        meeting_id = data.get('meeting_id', '')
        audio_config = data.get('audio_config', {})
        
        # Initialize speech agent if needed
        global speech_agent
        if speech_agent is None:
            from agents.speech_stream_agent import SpeechStreamAgent
            speech_agent = SpeechStreamAgent(
                project_id="veritas-472301",
                language_code="en-US",
                sample_rate=16000,
                enable_speaker_diarization=True,
                speaker_count=3
            )
            speech_agent.set_up()
        
        # Start transcription
        result = speech_agent.start_transcription(meeting_id, audio_config)
        
        headers = get_cors_headers(req)
        return https_fn.Response(json.dumps(result), status=200, headers=headers)
        
    except Exception as e:
        print(f"Error in start_transcription: {e}")
        headers = get_cors_headers(req)
        return https_fn.Response(
            json.dumps({"error": f"Failed to start transcription: {str(e)}"}),
            status=500,
            headers=headers
        )

@https_fn.on_request()
def process_audio_chunk(req: https_fn.Request) -> https_fn.Response:
    """Process audio chunk for real-time transcription"""
    try:
        # Handle CORS
        if req.method == 'OPTIONS':
            headers = get_cors_headers(req)
            return https_fn.Response('', status=204, headers=headers)
        
        data = req.get_json()
        if not data:
            headers = get_cors_headers(req)
            return https_fn.Response(
                json.dumps({"error": "No data provided"}),
                status=400,
                headers=headers
            )
        
        meeting_id = data.get('meeting_id', '')
        audio_data = data.get('audio_data', '')
        
        # Initialize speech agent if needed
        global speech_agent
        if speech_agent is None:
            from agents.speech_stream_agent import SpeechStreamAgent
            speech_agent = SpeechStreamAgent(
                project_id="veritas-472301",
                language_code="en-US",
                sample_rate=16000,
                enable_speaker_diarization=True,
                speaker_count=3
            )
            speech_agent.set_up()
        
        # Process audio chunk
        result = speech_agent.process_audio_chunk(meeting_id, audio_data)
        
        headers = get_cors_headers(req)
        return https_fn.Response(json.dumps(result), status=200, headers=headers)
        
    except Exception as e:
        print(f"Error in process_audio_chunk: {e}")
        headers = get_cors_headers(req)
        return https_fn.Response(
            json.dumps({"error": f"Failed to process audio: {str(e)}"}),
            status=500,
            headers=headers
        )

@https_fn.on_request()
def get_transcript(req: https_fn.Request) -> https_fn.Response:
    """Get live transcript for AI interview"""
    try:
        # Handle CORS
        if req.method == 'OPTIONS':
            headers = get_cors_headers(req)
            return https_fn.Response('', status=204, headers=headers)
        
        meeting_id = req.args.get('meeting_id', '')
        if not meeting_id:
            headers = get_cors_headers(req)
            return https_fn.Response(
                json.dumps({"error": "meeting_id parameter required"}),
                status=400,
                headers=headers
            )
        
        # Initialize speech agent if needed
        global speech_agent
        if speech_agent is None:
            from agents.speech_stream_agent import SpeechStreamAgent
            speech_agent = SpeechStreamAgent(
                project_id="veritas-472301",
                language_code="en-US",
                sample_rate=16000,
                enable_speaker_diarization=True,
                speaker_count=3
            )
            speech_agent.set_up()
        
        # Get transcript
        result = speech_agent.get_transcript(meeting_id)
        
        headers = get_cors_headers(req)
        return https_fn.Response(json.dumps(result), status=200, headers=headers)
        
    except Exception as e:
        print(f"Error in get_transcript: {e}")
        headers = get_cors_headers(req)
        return https_fn.Response(
            json.dumps({"error": f"Failed to get transcript: {str(e)}"}),
            status=500,
            headers=headers
        )

# --- 6. QA and Analysis Functions ---

@https_fn.on_request()
def generate_questions(req: https_fn.Request) -> https_fn.Response:
    """Generate AI follow-up questions based on memo and missing data"""
    try:
        # Handle CORS
        if req.method == 'OPTIONS':
            headers = get_cors_headers(req)
            return https_fn.Response('', status=204, headers=headers)
        
        data = req.get_json()
        if not data:
            headers = get_cors_headers(req)
            return https_fn.Response(
                json.dumps({"error": "No data provided"}),
                status=400,
                headers=headers
            )
        
        memo_data = data.get('memo_data', {})
        transcript_data = data.get('transcript_data', [])
        missing_fields = data.get('missing_fields', [])
        
        # Initialize QA agent if needed
        global qa_agent
        if qa_agent is None:
            from agents.qa_generation_agent import QAGenerationAgent
            qa_agent = QAGenerationAgent(
                project="veritas-472301",
                location="asia-south1",
                model="gemini-1.5-pro"
            )
            qa_agent.set_up()
        
        # Generate questions
        result = qa_agent.generate_questions(memo_data, transcript_data, missing_fields)
        
        headers = get_cors_headers(req)
        return https_fn.Response(json.dumps(result), status=200, headers=headers)
        
    except Exception as e:
        print(f"Error in generate_questions: {e}")
        headers = get_cors_headers(req)
        return https_fn.Response(
            json.dumps({"error": f"Failed to generate questions: {str(e)}"}),
            status=500,
            headers=headers
        )

@https_fn.on_request()
def analyze_gaps(req: https_fn.Request) -> https_fn.Response:
    """Analyze knowledge gaps in memo and transcript"""
    try:
        # Handle CORS
        if req.method == 'OPTIONS':
            headers = get_cors_headers(req)
            return https_fn.Response('', status=204, headers=headers)
        
        data = req.get_json()
        if not data:
            headers = get_cors_headers(req)
            return https_fn.Response(
                json.dumps({"error": "No data provided"}),
                status=400,
                headers=headers
            )
        
        memo_data = data.get('memo_data', {})
        transcript_data = data.get('transcript_data', [])
        
        # Initialize QA agent if needed
        global qa_agent
        if qa_agent is None:
            from agents.qa_generation_agent import QAGenerationAgent
            qa_agent = QAGenerationAgent(
                project="veritas-472301",
                location="asia-south1",
                model="gemini-1.5-pro"
            )
            qa_agent.set_up()
        
        # Analyze gaps
        analysis = qa_agent.analyze_gaps(memo_data, transcript_data)
        
        headers = get_cors_headers(req)
        return https_fn.Response(json.dumps(analysis), status=200, headers=headers)
        
    except Exception as e:
        print(f"Error in analyze_gaps: {e}")
        headers = get_cors_headers(req)
        return https_fn.Response(
            json.dumps({"error": f"Failed to analyze gaps: {str(e)}"}),
            status=500,
            headers=headers
        )

@https_fn.on_request()
def generate_memo2(req: https_fn.Request) -> https_fn.Response:
    """Generate Memo 2 from Memo 1 and interview transcript"""
    try:
        # Handle CORS
        if req.method == 'OPTIONS':
            headers = get_cors_headers(req)
            return https_fn.Response('', status=204, headers=headers)
        
        data = req.get_json()
        if not data:
            headers = get_cors_headers(req)
            return https_fn.Response(
                json.dumps({"error": "No data provided"}),
                status=400,
                headers=headers
            )
        
        memo_1_data = data.get('memo_1_data', {})
        transcript_data = data.get('transcript_data', [])
        gap_analysis = data.get('gap_analysis', {})
        
        # Initialize synthesis agent if needed
        global synthesis_agent
        if synthesis_agent is None:
            from agents.synthesis_agent import SynthesisAgent
            synthesis_agent = SynthesisAgent(
                project="veritas-472301",
                location="asia-south1",
                model="gemini-1.5-pro"
            )
            synthesis_agent.set_up()
        
        # Generate Memo 2
        memo2 = synthesis_agent.synthesize_memo(memo_1_data, transcript_data, gap_analysis)
        
        headers = get_cors_headers(req)
        return https_fn.Response(json.dumps({"memo2": memo2}), status=200, headers=headers)
        
    except Exception as e:
        print(f"Error in generate_memo2: {e}")
        headers = get_cors_headers(req)
        return https_fn.Response(
            json.dumps({"error": f"Failed to generate memo2: {str(e)}"}),
            status=500,
            headers=headers
        )

@https_fn.on_request()
def synthesize_memo(req: https_fn.Request) -> https_fn.Response:
    """Synthesize final memo from all data sources"""
    try:
        # Handle CORS
        if req.method == 'OPTIONS':
            headers = get_cors_headers(req)
            return https_fn.Response('', status=204, headers=headers)
        
        data = req.get_json()
        if not data:
            headers = get_cors_headers(req)
            return https_fn.Response(
                json.dumps({"error": "No data provided"}),
                status=400,
                headers=headers
            )
        
        memo_1_data = data.get('memo_1_data', {})
        memo_2_data = data.get('memo_2_data', {})
        transcript_data = data.get('transcript_data', [])
        gap_analysis = data.get('gap_analysis', {})
        
        # Initialize synthesis agent if needed
        global synthesis_agent
        if synthesis_agent is None:
            from agents.synthesis_agent import SynthesisAgent
            synthesis_agent = SynthesisAgent(
                project="veritas-472301",
                location="asia-south1",
                model="gemini-1.5-pro"
            )
            synthesis_agent.set_up()
        
        # Synthesize final memo
        result = synthesis_agent.synthesize_memo(memo_1_data, transcript_data, gap_analysis)
        
        headers = get_cors_headers(req)
        return https_fn.Response(json.dumps(result), status=200, headers=headers)
        
    except Exception as e:
        print(f"Error in synthesize_memo: {e}")
        headers = get_cors_headers(req)
        return https_fn.Response(
            json.dumps({"error": f"Failed to synthesize memo: {str(e)}"}),
            status=500,
            headers=headers
        )

# --- 7. Additional Utility Functions ---

@https_fn.on_request()
def ai_feedback(req: https_fn.Request) -> https_fn.Response:
    """Provide AI feedback on pitch deck data"""
    try:
        # Handle CORS
        if req.method == 'OPTIONS':
            headers = get_cors_headers(req)
            return https_fn.Response('', status=204, headers=headers)
        
        data = req.get_json()
        if not data:
            headers = get_cors_headers(req)
            return https_fn.Response(
                json.dumps({"error": "No data provided"}),
                status=400,
                headers=headers
            )
        
        # Initialize feedback agent if needed
        global feedback_agent
        if feedback_agent is None:
            from agents.feedback_agent import FeedbackAgent
            feedback_agent = FeedbackAgent(
                project="veritas-472301",
                location="asia-south1",
                model="gemini-2.5-flash"
            )
            feedback_agent.set_up()
        
        # Generate feedback
        result = feedback_agent.generate_feedback(data)
        
        headers = get_cors_headers(req)
        return https_fn.Response(json.dumps(result), status=200, headers=headers)
        
    except Exception as e:
        print(f"Error in ai_feedback: {e}")
        headers = get_cors_headers(req)
        return https_fn.Response(
            json.dumps({"error": f"Failed to generate feedback: {str(e)}"}),
            status=500,
            headers=headers
        )

@https_fn.on_request()
def trigger_diligence(req: https_fn.Request) -> https_fn.Response:
    """Manually trigger diligence analysis"""
    try:
        # Handle CORS
        if req.method == 'OPTIONS':
            headers = get_cors_headers(req)
            return https_fn.Response('', status=204, headers=headers)
        
        data = req.get_json()
        if not data:
            headers = get_cors_headers(req)
            return https_fn.Response(
                json.dumps({"error": "No data provided"}),
                status=400,
                headers=headers
            )
        
        memo_1_id = data.get('memo_1_id', '')
        founder_email = data.get('founder_email', '')
        
        if not memo_1_id:
            headers = get_cors_headers(req)
            return https_fn.Response(
                json.dumps({"error": "memo_1_id required"}),
                status=400,
                headers=headers
            )
        
        # Trigger diligence analysis
        global publisher
        if publisher is None:
            publisher = pubsub_v1.PublisherClient()
        
        diligence_message = {
            "memo_1_id": memo_1_id,
            "founder_email": founder_email,
            "triggered_by": "manual"
        }
        
        topic_path = publisher.topic_path("veritas-472301", "diligence-analysis-topic")
        message_json = json.dumps(diligence_message)
        message_bytes = message_json.encode('utf-8')
        
        future = publisher.publish(topic_path, message_bytes)
        message_id = future.result()
        
        result = {
            "success": True,
            "message": "Diligence analysis triggered",
            "message_id": message_id
        }
        
        headers = get_cors_headers(req)
        return https_fn.Response(json.dumps(result), status=200, headers=headers)
        
    except Exception as e:
        print(f"Error in trigger_diligence: {e}")
        headers = get_cors_headers(req)
        return https_fn.Response(
            json.dumps({"error": f"Failed to trigger diligence: {str(e)}"}),
            status=500,
            headers=headers
        )