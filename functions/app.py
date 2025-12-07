from flask import Flask, request, Response as FlaskResponse, jsonify
import main
import json
import base64
from firebase_functions import pubsub_fn

app = Flask(__name__)


def convert_firebase_response(firebase_resp):
    """Convert Firebase Functions Response to Flask Response"""
    if hasattr(firebase_resp, 'status'):
        status = firebase_resp.status
    else:
        status = 200
    
    if hasattr(firebase_resp, 'data'):
        data = firebase_resp.data
    elif hasattr(firebase_resp, 'response'):
        data = firebase_resp.response
    else:
        data = str(firebase_resp) if firebase_resp else b''
    
    if isinstance(data, str):
        data = data.encode('utf-8')
    
    headers = {}
    if hasattr(firebase_resp, 'headers'):
        headers = dict(firebase_resp.headers)
    
    return FlaskResponse(data, status=status, headers=headers)


@app.route("/on_file_upload", methods=["GET", "POST", "OPTIONS"])
def on_file_upload_route():
    result = main.on_file_upload(request)
    return convert_firebase_response(result)


@app.route("/validate_memo_data", methods=["POST", "OPTIONS"])
def validate_memo_data_route():
    result = main.validate_memo_data(request)
    return convert_firebase_response(result)


@app.route("/validate_market_size", methods=["POST", "OPTIONS"])
def validate_market_size_route():
    result = main.validate_market_size(request)
    return convert_firebase_response(result)


@app.route("/validate_competitors", methods=["POST", "OPTIONS"])
def validate_competitors_route():
    result = main.validate_competitors(request)
    return convert_firebase_response(result)


@app.route("/run_diligence", methods=["POST", "OPTIONS"])
def run_diligence_route():
    result = main.run_diligence(request)
    return convert_firebase_response(result)


@app.route("/query_diligence", methods=["POST", "OPTIONS"])
def query_diligence_route():
    result = main.query_diligence(request)
    return convert_firebase_response(result)


@app.route("/schedule_ai_interview", methods=["POST", "OPTIONS"])
def schedule_ai_interview_route():
    result = main.schedule_ai_interview(request)
    return convert_firebase_response(result)


@app.route("/start_ai_interview", methods=["POST", "OPTIONS"])
def start_ai_interview_route():
    result = main.start_ai_interview(request)
    return convert_firebase_response(result)


@app.route("/submit_interview_answer", methods=["POST", "OPTIONS"])
def submit_interview_answer_route():
    result = main.submit_interview_answer(request)
    return convert_firebase_response(result)


@app.route("/ai_feedback", methods=["POST", "OPTIONS"])
def ai_feedback_route():
    result = main.ai_feedback(request)
    return convert_firebase_response(result)


@app.route("/check_memo", methods=["GET", "OPTIONS"])
def check_memo_route():
    result = main.check_memo(request)
    return convert_firebase_response(result)


@app.route("/trigger_diligence", methods=["POST", "OPTIONS"])
def trigger_diligence_route():
    result = main.trigger_diligence(request)
    return convert_firebase_response(result)


# Pub/Sub Push Subscription Endpoints
# These endpoints receive HTTP POST requests from Pub/Sub push subscriptions

@app.route("/process_ingestion_task", methods=["POST", "OPTIONS"])
def process_ingestion_task_route():
    """Handle Pub/Sub push message for document ingestion"""
    try:
        # Handle CORS preflight
        if request.method == 'OPTIONS':
            return FlaskResponse('', status=204, headers={
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            })
        
        # Parse Pub/Sub push message format
        pubsub_message = request.get_json()
        if not pubsub_message or 'message' not in pubsub_message:
            return jsonify({"error": "Invalid Pub/Sub message format"}), 400
        
        # Decode the message data
        message_data = pubsub_message['message'].get('data', '')
        if isinstance(message_data, str):
            message_bytes = base64.b64decode(message_data)
        else:
            message_bytes = message_data
        
        # Create a proper CloudEvent mock that satisfies the decorator
        # The decorator expects both dict-style access (data["message"]) and attribute access (data.message)
        class MockMessage:
            def __init__(self, data):
                self.data = data
        
        class MockData(dict):
            """Supports both dict-style and attribute access"""
            def __init__(self, message):
                super().__init__()
                self["message"] = message
                self.message = message  # Also support attribute access
        
        # The decorator converts event to dict - ensure all keys are in __dict__ for vars() access
        from datetime import datetime
        time_str = datetime.utcnow().isoformat() + "Z"
        
        # The decorator at line 109 does: event_dict["time"]
        # It converts event to dict, likely using dict(event) or accessing __dict__
        # We need MockCloudEvent to work with BOTH dict() and vars() conversions
        # Solution: Inherit from dict AND set attributes so both work
        class MockCloudEvent(dict):
            def __init__(self, data_bytes):
                # Initialize as dict with all required keys
                # This makes dict(event) work and creates a proper dict
                super().__init__({
                    "data": MockData(MockMessage(data_bytes)),
                    "specversion": "1.0",
                    "type": "google.cloud.pubsub.topic.v1.messagePublished",
                    "source": "",
                    "id": "",
                    "time": time_str  # CRITICAL: Must be in dict for dict(event) to work
                })
                # Also set as attributes for attribute access (event.time, event.data, etc.)
                # This ensures vars(event) also works if decorator uses that
                self.data = self["data"]
                self.specversion = self["specversion"]
                self.type = self["type"]
                self.source = self["source"]
                self.id = self["id"]
                self.time = self["time"]  # Also as attribute
                self._attributes = {}
            
            def _get_attributes(self):
                return self._attributes or {}
            
            def get_data(self):
                return self.data
        
        event = MockCloudEvent(message_bytes)
        
        # Call the function
        main.process_ingestion_task(event)
        
        return jsonify({"status": "success"}), 200
        
    except Exception as e:
        print(f"Error in process_ingestion_task_route: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/process_diligence_task", methods=["POST", "OPTIONS"])
def process_diligence_task_route():
    """Handle Pub/Sub push message for diligence processing"""
    try:
        # Handle CORS preflight
        if request.method == 'OPTIONS':
            return FlaskResponse('', status=204, headers={
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            })
        
        # Parse Pub/Sub push message format
        pubsub_message = request.get_json()
        if not pubsub_message or 'message' not in pubsub_message:
            return jsonify({"error": "Invalid Pub/Sub message format"}), 400
        
        # Decode the message data
        message_data = pubsub_message['message'].get('data', '')
        if isinstance(message_data, str):
            message_bytes = base64.b64decode(message_data)
        else:
            message_bytes = message_data
        
        # Create a proper CloudEvent mock that satisfies the decorator
        class MockMessage:
            def __init__(self, data):
                self.data = data
        
        class MockData(dict):
            """Supports both dict-style and attribute access"""
            def __init__(self, message):
                super().__init__()
                self["message"] = message
                self.message = message  # Also support attribute access
        
        # The decorator at line 109 does: event_dict["time"]
        # It converts event to dict, likely using dict(event) or accessing __dict__
        # We need MockCloudEvent to work with BOTH dict() and vars() conversions
        # Solution: Inherit from dict AND set attributes so both work
        from datetime import datetime
        time_str = datetime.utcnow().isoformat() + "Z"
        
        class MockCloudEvent(dict):
            def __init__(self, data_bytes):
                # Initialize as dict with all required keys
                # This makes dict(event) work and creates a proper dict
                super().__init__({
                    "data": MockData(MockMessage(data_bytes)),
                    "specversion": "1.0",
                    "type": "google.cloud.pubsub.topic.v1.messagePublished",
                    "source": "",
                    "id": "",
                    "time": time_str  # CRITICAL: Must be in dict for dict(event) to work
                })
                # Also set as attributes for attribute access (event.time, event.data, etc.)
                # This ensures vars(event) also works if decorator uses that
                self.data = self["data"]
                self.specversion = self["specversion"]
                self.type = self["type"]
                self.source = self["source"]
                self.id = self["id"]
                self.time = self["time"]  # Also as attribute
                self._attributes = {}
            
            def _get_attributes(self):
                return self._attributes or {}
            
            def get_data(self):
                return self.data
        
        event = MockCloudEvent(message_bytes)
        
        # Call the function
        main.process_diligence_task(event)
        
        return jsonify({"status": "success"}), 200
        
    except Exception as e:
        print(f"Error in process_diligence_task_route: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/conduct_interview", methods=["POST", "OPTIONS"])
def conduct_interview_route():
    """Handle Pub/Sub push message for interview conduction"""
    try:
        # Handle CORS preflight
        if request.method == 'OPTIONS':
            return FlaskResponse('', status=204, headers={
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            })
        
        # Parse Pub/Sub push message format
        pubsub_message = request.get_json()
        if not pubsub_message or 'message' not in pubsub_message:
            return jsonify({"error": "Invalid Pub/Sub message format"}), 400
        
        # Decode the message data
        message_data = pubsub_message['message'].get('data', '')
        if isinstance(message_data, str):
            message_bytes = base64.b64decode(message_data)
        else:
            message_bytes = message_data
        
        # Create a proper CloudEvent mock that satisfies the decorator
        class MockMessage:
            def __init__(self, data):
                self.data = data
        
        class MockData(dict):
            """Supports both dict-style and attribute access"""
            def __init__(self, message):
                super().__init__()
                self["message"] = message
                self.message = message  # Also support attribute access
        
        # The decorator converts event to dict - ensure all keys are in __dict__ for vars() access
        from datetime import datetime
        time_str = datetime.utcnow().isoformat() + "Z"
        
        # Create event with all fields in __dict__ so vars(event) works
        class MockCloudEvent:
            def __init__(self, data_bytes):
                # Put everything in __dict__ so vars() conversion works
                self.data = MockData(MockMessage(data_bytes))
                self.specversion = "1.0"
                self.type = "google.cloud.pubsub.topic.v1.messagePublished"
                self.source = ""
                self.id = ""
                self.time = time_str
                self._attributes = {}
            
            def _get_attributes(self):
                return self._attributes or {}
            
            def get_data(self):
                return self.data
            
            def __getitem__(self, key):
                # Support dict-style access via __dict__
                return self.__dict__[key]
            
            def __contains__(self, key):
                return key in self.__dict__
            
            def keys(self):
                return [k for k in self.__dict__.keys() if not k.startswith('_')]
            
            def items(self):
                return [(k, v) for k, v in self.__dict__.items() if not k.startswith('_')]
            
            def __iter__(self):
                return iter(self.keys())
        
        event = MockCloudEvent(message_bytes)
        
        # Call the function
        main.conduct_interview(event)
        
        return jsonify({"status": "success"}), 200
        
    except Exception as e:
        print(f"Error in conduct_interview_route: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/generate_interview_summary", methods=["POST", "OPTIONS"])
def generate_interview_summary_route():
    """Handle Pub/Sub push message for interview summary generation"""
    try:
        # Handle CORS preflight
        if request.method == 'OPTIONS':
            return FlaskResponse('', status=204, headers={
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            })
        
        # Parse Pub/Sub push message format
        pubsub_message = request.get_json()
        if not pubsub_message or 'message' not in pubsub_message:
            return jsonify({"error": "Invalid Pub/Sub message format"}), 400
        
        # Decode the message data
        message_data = pubsub_message['message'].get('data', '')
        if isinstance(message_data, str):
            message_bytes = base64.b64decode(message_data)
        else:
            message_bytes = message_data
        
        # Create a proper CloudEvent mock that satisfies the decorator
        class MockMessage:
            def __init__(self, data):
                self.data = data
        
        class MockData(dict):
            """Supports both dict-style and attribute access"""
            def __init__(self, message):
                super().__init__()
                self["message"] = message
                self.message = message  # Also support attribute access
        
        # The decorator converts event to dict - ensure all keys are in __dict__ for vars() access
        from datetime import datetime
        time_str = datetime.utcnow().isoformat() + "Z"
        
        # Create event with all fields in __dict__ so vars(event) works
        class MockCloudEvent:
            def __init__(self, data_bytes):
                # Put everything in __dict__ so vars() conversion works
                self.data = MockData(MockMessage(data_bytes))
                self.specversion = "1.0"
                self.type = "google.cloud.pubsub.topic.v1.messagePublished"
                self.source = ""
                self.id = ""
                self.time = time_str
                self._attributes = {}
            
            def _get_attributes(self):
                return self._attributes or {}
            
            def get_data(self):
                return self.data
            
            def __getitem__(self, key):
                # Support dict-style access via __dict__
                return self.__dict__[key]
            
            def __contains__(self, key):
                return key in self.__dict__
            
            def keys(self):
                return [k for k in self.__dict__.keys() if not k.startswith('_')]
            
            def items(self):
                return [(k, v) for k, v in self.__dict__.items() if not k.startswith('_')]
            
            def __iter__(self):
                return iter(self.keys())
        
        event = MockCloudEvent(message_bytes)
        
        # Call the function
        main.generate_interview_summary(event)
        
        return jsonify({"status": "success"}), 200
        
    except Exception as e:
        print(f"Error in generate_interview_summary_route: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


