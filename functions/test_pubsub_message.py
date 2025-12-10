#!/usr/bin/env python3
"""
Quick test script to send a Pub/Sub push message to Flask route
"""

import json
import base64
import requests
import sys

def create_pubsub_message(payload_dict):
    """Create Pub/Sub push message format"""
    payload_json = json.dumps(payload_dict)
    payload_b64 = base64.b64encode(payload_json.encode('utf-8')).decode('utf-8')
    
    return {
        "message": {
            "data": payload_b64,
            "messageId": "test-msg-123",
            "publishTime": "2024-01-01T00:00:00.000Z"
        }
    }

def test_route():
    """Test the Flask route"""
    url = "http://localhost:5000/process_ingestion_task"
    
    payload = {
        "file_path": "test.pdf",
        "bucket_name": "test-bucket",
        "content_type": "application/pdf"
    }
    
    pubsub_msg = create_pubsub_message(payload)
    
    print(f"Testing: {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, json=pubsub_msg, timeout=10)
        print(f"\nStatus: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        if "KeyError" in response.text or "'time'" in response.text:
            print("\n❌ FAILED: KeyError 'time' detected!")
            return False
        elif response.status_code == 200:
            print("\n✅ SUCCESS: Route works, no KeyError!")
            return True
        else:
            print(f"\n⚠️  Status {response.status_code} (may be expected)")
            return True
    except requests.exceptions.ConnectionError:
        print("\n❌ Flask app not running. Start with: python app.py")
        return False
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = test_route()
    sys.exit(0 if success else 1)

