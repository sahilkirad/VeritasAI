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
        from agents.comprehensive_agents import CoordinatorAgent
        coordinator_agent = CoordinatorAgent(project="veritas-472301")
        coordinator_agent.set_up()
    return coordinator_agent

# --- 2. Authentication Helper ---
def verify_firebase_token(auth_header: str) -> dict:
    """Verify Firebase ID token and return user info"""
    if not auth_header or not auth_header.startswith('Bearer '):
        raise ValueError("No valid authorization header")
    
    token = auth_header.split('Bearer ')[1]
    try:
        decoded_token = firebase_auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise ValueError(f"Invalid token: {str(e)}")

# --- 3. Document Upload Function ---
@https_fn.on_request(
    memory=options.MemoryOption.MB_512,
    timeout_sec=300,
    cors=options.CorsOptions(
        cors_origins=["*"],
        cors_methods=["POST", "OPTIONS"]
    )
)
def upload_document(req: https_fn.Request) -> https_fn.Response:
    """Upload document and trigger processing pipeline"""
    
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
        auth_header = req.headers.get('Authorization', '')
        try:
            user_info = verify_firebase_token(auth_header)
            user_id = user_info['uid']
            user_email = user_info.get('email', '')
        except Exception as e:
            return https_fn.Response(
                json.dumps({"error": f"Authentication failed: {str(e)}"}),
                status=401,
                headers={'Content-Type': 'application/json'}
            )

        # Get file from request
        if 'file' not in req.files:
            return https_fn.Response('No file provided', status=400)
        
        file = req.files['file']
        if file.filename == '':
            return https_fn.Response('No file selected', status=400)

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
            'blob_name': blob_name,
            'download_url': download_url,
            'upload_id': upload_ref[1].id,
            'triggered_by': "http_upload"
        })
        
        message_bytes = message_json.encode('utf-8')
        publisher.publish(topic_path, message_bytes)
        
        return https_fn.Response(
            json.dumps({
                "status": "success",
                "message": "Document uploaded and processing started",
                "upload_id": upload_ref[1].id,
                "download_url": download_url
            }),
            status=200,
            headers={'Content-Type': 'application/json'}
        )

    except Exception as e:
        print(f"Error in upload_document: {e}")
        return https_fn.Response(f'Error: {str(e)}', status=500)

# --- 4. Pub/Sub Trigger for Document Processing ---
@pubsub_fn.on_message_published(
    topic="document-ingestion-topic",
    memory=options.MemoryOption.MB_512,
    timeout_sec=900
)
def process_document(event: pubsub_fn.CloudEvent) -> None:
    """Process uploaded document through AI pipeline"""
    
    # Initialize Firebase app when function runs
    get_firebase_app()
    
    try:
        # Decode message
        message_data = base64.b64decode(event.data).decode('utf-8')
        message = json.loads(message_data)
        
        print(f"Processing document: {message.get('file_name', 'Unknown')}")
        
        # Use IntakeCurationAgent for processing
        agent = get_intake_agent()
        result = agent.process_document(
            user_id=message.get('user_id'),
            user_email=message.get('user_email'),
            startup_name=message.get('startup_name'),
            file_name=message.get('file_name'),
            file_type=message.get('file_type'),
            blob_name=message.get('blob_name'),
            download_url=message.get('download_url')
        )
        
        print(f"Document processing completed: {result.get('status', 'Unknown')}")
        
    except Exception as e:
        print(f"Error processing document: {str(e)}")

# --- 5. Diligence Trigger Function ---
@https_fn.on_request(
    memory=options.MemoryOption.MB_512, 
    timeout_sec=900,
    cors=options.CorsOptions(
        cors_origins=["*"],
        cors_methods=["POST", "OPTIONS"]
    )
)
def trigger_diligence(req: https_fn.Request) -> https_fn.Response:
    """Trigger diligence analysis on Memo 1"""
    
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

        # Extract parameters
        data = req.get_json()
        if not data:
            return https_fn.Response('No JSON data provided', status=400)

        memo_1_id = data.get("memo_1_id")
        if not memo_1_id:
            return https_fn.Response('Missing memo_1_id', status=400)

        # Use DiligenceAgent to process
        agent = get_diligence_agent()
        result = agent.process_memo_1(memo_1_id=memo_1_id)

        # Return response
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Content-Type': 'application/json'
        }
        return https_fn.Response(json.dumps(result), status=200, headers=headers)

    except Exception as e:
        print(f"Error in trigger_diligence: {e}")
        return https_fn.Response(f'Error: {str(e)}', status=500)

# --- 6. AI Interview System: Layer 2 (AI Interview & Engagement) ---

# Global variables for AI Interview agents
meeting_agent = None
speech_stream_agent = None
qa_generation_agent = None
sentiment_agent = None
synthesis_agent = None

def get_meeting_agent():
    """Lazy import of MeetingAgent"""
    global meeting_agent
    if meeting_agent is None:
        from agents.meeting_agent import MeetingAgent
        meeting_agent = MeetingAgent(project_id="veritas-472301")
        meeting_agent.set_up()
    return meeting_agent

def get_speech_stream_agent():
    """Lazy import of SpeechStreamAgent"""
    global speech_stream_agent
    if speech_stream_agent is None:
        from agents.speech_stream_agent import SpeechStreamAgent
        speech_stream_agent = SpeechStreamAgent(project_id="veritas-472301")
        speech_stream_agent.set_up()
    return speech_stream_agent

def get_qa_generation_agent():
    """Lazy import of QAGenerationAgent"""
    global qa_generation_agent
    if qa_generation_agent is None:
        from agents.qa_generation_agent import QAGenerationAgent
        qa_generation_agent = QAGenerationAgent(project="veritas-472301")
        qa_generation_agent.set_up()
    return qa_generation_agent

def get_sentiment_agent():
    """Lazy import of SentimentCommunicationAgent"""
    global sentiment_agent
    if sentiment_agent is None:
        from agents.sentiment_agent import SentimentCommunicationAgent
        sentiment_agent = SentimentCommunicationAgent(project="veritas-472301")
        sentiment_agent.set_up()
    return sentiment_agent

def get_synthesis_agent():
    """Lazy import of SynthesisAgent"""
    global synthesis_agent
    if synthesis_agent is None:
        from agents.synthesis_agent import SynthesisAgent
        synthesis_agent = SynthesisAgent(project="veritas-472301")
        synthesis_agent.set_up()
    return synthesis_agent

# --- AI Interview HTTP Endpoints ---

@https_fn.on_request(
    memory=options.MemoryOption.MB_512,
    timeout_sec=300,
    cors=options.CorsOptions(
        cors_origins=["*"],
        cors_methods=["POST", "OPTIONS"]
    )
)
def schedule_ai_interview(req: https_fn.Request) -> https_fn.Response:
    """Schedule AI Interview meeting and publish to Pub/Sub"""
    
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

        memo_id = data.get("memo_id")
        founder_email = data.get("founder_email")
        investor_email = data.get("investor_email")
        startup_name = data.get("startup_name")
        
        # Validate required parameters
        if not all([memo_id, founder_email, investor_email, startup_name]):
            return https_fn.Response('Missing required parameters', status=400)

        # Get calendar_id from request or use default
        calendar_id = data.get("calendar_id", "primary")
        
        # Use MeetingAgent to schedule the interview
        agent = get_meeting_agent()
        result = agent.schedule_ai_interview(
            memo_id=memo_id,
            founder_email=founder_email,
            investor_email=investor_email,
            startup_name=startup_name,
            calendar_id=calendar_id
        )

        # Publish to Pub/Sub for AI Interview orchestration
        global publisher
        if publisher is None:
            publisher = pubsub_v1.PublisherClient()
        
        # Publish meeting scheduled event
        meeting_topic = publisher.topic_path("veritas-472301", "ai-interview-topic")
        meeting_message = json.dumps({
            "event_type": "meeting_scheduled",
            "memo_id": memo_id,
            "founder_email": founder_email,
            "investor_email": investor_email,
            "startup_name": startup_name,
            "meeting_result": result,
            "timestamp": datetime.now().isoformat()
        })
        
        publisher.publish(meeting_topic, meeting_message.encode('utf-8'))

        # Return response
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Content-Type': 'application/json'
        }
        return https_fn.Response(json.dumps(result), status=200, headers=headers)

    except Exception as e:
        print(f"Error in schedule_ai_interview: {e}")
        return https_fn.Response(f'Error: {str(e)}', status=500)

@https_fn.on_request(
    memory=options.MemoryOption.GB_1,
    timeout_sec=300,
    cors=options.CorsOptions(
        cors_origins=["*"],
        cors_methods=["POST", "OPTIONS"]
    )
)
def start_transcription(req: https_fn.Request) -> https_fn.Response:
    """Start real-time transcription for AI Interview"""
    
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

        # Extract parameters
        data = req.get_json()
        if not data:
            return https_fn.Response('No JSON data provided', status=400)

        meeting_id = data.get("meeting_id")
        audio_config = data.get("audio_config", {})
        
        if not meeting_id:
            return https_fn.Response('Missing meeting_id', status=400)

        # Use SpeechStreamAgent to start transcription
        agent = get_speech_stream_agent()
        result = agent.start_transcription(meeting_id=meeting_id, audio_config=audio_config)

        # Publish transcription started event
        global publisher
        if publisher is None:
            publisher = pubsub_v1.PublisherClient()
        
        transcription_topic = publisher.topic_path("veritas-472301", "ai-interview-topic")
        transcription_message = json.dumps({
            "event_type": "transcription_started",
            "meeting_id": meeting_id,
            "transcription_result": result,
            "timestamp": datetime.now().isoformat()
        })
        
        publisher.publish(transcription_topic, transcription_message.encode('utf-8'))

        # Return response
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Content-Type': 'application/json'
        }
        return https_fn.Response(json.dumps(result), status=200, headers=headers)

    except Exception as e:
        print(f"Error in start_transcription: {e}")
        return https_fn.Response(f'Error: {str(e)}', status=500)

@https_fn.on_request(
    memory=options.MemoryOption.GB_1,
    timeout_sec=300,
    cors=options.CorsOptions(
        cors_origins=["*"],
        cors_methods=["POST", "OPTIONS"]
    )
)
def generate_questions(req: https_fn.Request) -> https_fn.Response:
    """Generate AI questions based on transcript and memo data"""
    
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

        # Extract parameters
        data = req.get_json()
        if not data:
            return https_fn.Response('No JSON data provided', status=400)

        memo_data = data.get("memo_data")
        transcript_data = data.get("transcript_data", [])
        meeting_id = data.get("meeting_id")
        
        if not memo_data or not meeting_id:
            return https_fn.Response('Missing required parameters', status=400)

        # Use QAGenerationAgent to generate questions
        agent = get_qa_generation_agent()
        result = agent.generate_questions(
            memo_data=memo_data,
            transcript_data=transcript_data,
            meeting_id=meeting_id
        )

        # Publish questions generated event
        global publisher
        if publisher is None:
            publisher = pubsub_v1.PublisherClient()
        
        qa_topic = publisher.topic_path("veritas-472301", "ai-interview-topic")
        qa_message = json.dumps({
            "event_type": "questions_generated",
            "meeting_id": meeting_id,
            "questions_result": result,
            "timestamp": datetime.now().isoformat()
        })
        
        publisher.publish(qa_topic, qa_message.encode('utf-8'))

        # Return response
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Content-Type': 'application/json'
        }
        return https_fn.Response(json.dumps(result), status=200, headers=headers)

    except Exception as e:
        print(f"Error in generate_questions: {e}")
        return https_fn.Response(f'Error: {str(e)}', status=500)

@https_fn.on_request(
    memory=options.MemoryOption.GB_1,
    timeout_sec=300,
    cors=options.CorsOptions(
        cors_origins=["*"],
        cors_methods=["POST", "OPTIONS"]
    )
)
def analyze_sentiment(req: https_fn.Request) -> https_fn.Response:
    """Analyze sentiment and tone of founder responses"""
    
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

        # Extract parameters
        data = req.get_json()
        if not data:
            return https_fn.Response('No JSON data provided', status=400)

        text = data.get("text")
        speaker = data.get("speaker", "founder")
        
        if not text:
            return https_fn.Response('Missing text', status=400)

        # Use SentimentCommunicationAgent to analyze sentiment
        agent = get_sentiment_agent()
        result = agent.analyze_sentiment(text=text, speaker=speaker)

        # Publish sentiment analysis event
        global publisher
        if publisher is None:
            publisher = pubsub_v1.PublisherClient()
        
        sentiment_topic = publisher.topic_path("veritas-472301", "ai-interview-topic")
        sentiment_message = json.dumps({
            "event_type": "sentiment_analyzed",
            "speaker": speaker,
            "sentiment_result": result,
            "timestamp": datetime.now().isoformat()
        })
        
        publisher.publish(sentiment_topic, sentiment_message.encode('utf-8'))

        # Return response
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Content-Type': 'application/json'
        }
        return https_fn.Response(json.dumps(result), status=200, headers=headers)

    except Exception as e:
        print(f"Error in analyze_sentiment: {e}")
        return https_fn.Response(f'Error: {str(e)}', status=500)

@https_fn.on_request(
    memory=options.MemoryOption.GB_1,
    timeout_sec=600,
    cors=options.CorsOptions(
        cors_origins=["*"],
        cors_methods=["POST", "OPTIONS"]
    )
)
def generate_memo_2(req: https_fn.Request) -> https_fn.Response:
    """Generate Memo 2 from interview data and publish to Pub/Sub"""
    
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

        # Extract parameters
        data = req.get_json()
        if not data:
            return https_fn.Response('No JSON data provided', status=400)

        memo_1_data = data.get("memo_1_data")
        transcript_data = data.get("transcript_data", [])
        sentiment_analysis = data.get("sentiment_analysis", {})
        qa_data = data.get("qa_data", {})
        meeting_id = data.get("meeting_id")
        
        if not memo_1_data or not meeting_id:
            return https_fn.Response('Missing required parameters', status=400)

        # Use SynthesisAgent to generate Memo 2
        agent = get_synthesis_agent()
        result = agent.generate_memo_2(
            memo_1_data=memo_1_data,
            transcript_data=transcript_data,
            sentiment_analysis=sentiment_analysis,
            qa_data=qa_data,
            meeting_id=meeting_id
        )

        # Publish Memo 2 generated event
        global publisher
        if publisher is None:
            publisher = pubsub_v1.PublisherClient()
        
        memo2_topic = publisher.topic_path("veritas-472301", "ai-interview-topic")
        memo2_message = json.dumps({
            "event_type": "memo_2_generated",
            "meeting_id": meeting_id,
            "memo_2_result": result,
            "timestamp": datetime.now().isoformat()
        })
        
        publisher.publish(memo2_topic, memo2_message.encode('utf-8'))

        # Return response
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Content-Type': 'application/json'
        }
        return https_fn.Response(json.dumps(result), status=200, headers=headers)

    except Exception as e:
        print(f"Error in generate_memo_2: {e}")
        return https_fn.Response(f'Error: {str(e)}', status=500)

# --- 7. Pub/Sub Orchestrator for AI Interview System ---
@pubsub_fn.on_message_published(
    topic="ai-interview-topic",
    memory=options.MemoryOption.GB_1,
    timeout_sec=900
)
def orchestrate_ai_interview(event: pubsub_fn.CloudEvent) -> None:
    """Orchestrate AI Interview workflow based on events"""
    
    # Initialize Firebase app when function runs
    get_firebase_app()
    
    try:
        # Decode message
        message_data = base64.b64decode(event.data).decode('utf-8')
        message = json.loads(message_data)
        
        event_type = message.get("event_type")
        print(f"Processing AI Interview event: {event_type}")
        
        # Handle different event types
        if event_type == "meeting_scheduled":
            print(f"Meeting scheduled for: {message.get('startup_name')}")
            # Could trigger automatic transcription setup here
            
        elif event_type == "transcription_started":
            print(f"Transcription started for meeting: {message.get('meeting_id')}")
            # Could trigger automatic question generation here
            
        elif event_type == "questions_generated":
            print(f"Questions generated for meeting: {message.get('meeting_id')}")
            # Could trigger automatic sentiment analysis here
            
        elif event_type == "sentiment_analyzed":
            print(f"Sentiment analyzed for speaker: {message.get('speaker')}")
            # Could trigger Memo 2 generation here
            
        elif event_type == "memo_2_generated":
            print(f"Memo 2 generated for meeting: {message.get('meeting_id')}")
            # AI Interview workflow completed
        
        print(f"AI Interview event processed: {event_type}")
        
    except Exception as e:
        print(f"Error processing AI Interview event: {str(e)}")
