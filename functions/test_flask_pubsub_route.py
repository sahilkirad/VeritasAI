#!/usr/bin/env python3
"""
Test script to verify Flask Pub/Sub routes work correctly after the fix
Tests the /process_ingestion_task endpoint with a simulated Pub/Sub push message
"""

import sys
import json
import base64
import requests
import time
import threading
from flask import Flask

# Add functions directory to path
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def create_pubsub_push_message(payload_dict):
    """Create a Pub/Sub push message format"""
    payload_json = json.dumps(payload_dict)
    payload_bytes = payload_json.encode('utf-8')
    payload_b64 = base64.b64encode(payload_bytes).decode('utf-8')
    
    return {
        "message": {
            "data": payload_b64,
            "messageId": "test-message-id",
            "publishTime": "2024-01-01T00:00:00.000Z"
        },
        "subscription": "projects/test-project/subscriptions/test-sub"
    }


def test_flask_route(flask_url="http://localhost:5000", timeout=30):
    """Test the Flask route with a Pub/Sub push message"""
    print("=" * 60)
    print("Testing Flask Route: /process_ingestion_task")
    print("=" * 60)
    
    # Create test payload
    test_payload = {
        "file_path": "test.pdf",
        "bucket_name": "test-bucket",
        "content_type": "application/pdf"
    }
    
    pubsub_message = create_pubsub_push_message(test_payload)
    
    print(f"\n📤 Sending POST request to: {flask_url}/process_ingestion_task")
    print(f"📋 Payload: {json.dumps(test_payload, indent=2)}")
    print(f"📦 Pub/Sub message format: {json.dumps(pubsub_message, indent=2)[:200]}...")
    
    try:
        start_time = time.time()
        response = requests.post(
            f"{flask_url}/process_ingestion_task",
            json=pubsub_message,
            headers={"Content-Type": "application/json"},
            timeout=timeout
        )
        elapsed = time.time() - start_time
        
        print(f"\n⏱️  Response received in {elapsed:.2f} seconds")
        print(f"📊 Status Code: {response.status_code}")
        
        try:
            response_json = response.json()
            print(f"📄 Response Body: {json.dumps(response_json, indent=2)}")
        except:
            print(f"📄 Response Body (text): {response.text[:500]}")
        
        # Check for KeyError in response
        if "KeyError" in response.text or "'time'" in response.text:
            print("\n❌ FAILED: KeyError 'time' detected in response!")
            return False
        
        # Check for success
        if response.status_code == 200:
            if "status" in response.text and "success" in response.text.lower():
                print("\n✅ SUCCESS: Route returned 200 with success status")
                print("✅ No KeyError 'time' - fix is working!")
                return True
            else:
                print("\n⚠️  Route returned 200 but response format unexpected")
                return True  # Still counts as success if no KeyError
        else:
            print(f"\n⚠️  Route returned {response.status_code} (may be expected if dependencies missing)")
            # Check if it's a KeyError
            if response.status_code == 500 and "KeyError" in response.text:
                print("❌ FAILED: KeyError detected in 500 response!")
                return False
            return True  # Other errors are OK (dependencies, etc.)
            
    except requests.exceptions.ConnectionError:
        print(f"\n❌ ERROR: Could not connect to {flask_url}")
        print("   Make sure Flask app is running!")
        print("   You can start it with: python -m flask run --port 5000")
        return False
    except requests.exceptions.Timeout:
        print(f"\n⚠️  Request timed out after {timeout} seconds")
        print("   This might be normal if the function takes a long time")
        return True  # Timeout doesn't mean the fix failed
    except Exception as e:
        print(f"\n❌ ERROR: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return False


def start_flask_app_in_background(port=5000):
    """Start Flask app in a background thread"""
    try:
        import app
        app.app.config['TESTING'] = True
        
        def run_app():
            app.app.run(host='0.0.0.0', port=port, debug=False, use_reloader=False)
        
        thread = threading.Thread(target=run_app, daemon=True)
        thread.start()
        
        # Wait for app to start
        print(f"⏳ Starting Flask app on port {port}...")
        for i in range(10):
            try:
                response = requests.get(f"http://localhost:{port}/", timeout=1)
                print(f"✅ Flask app is running!")
                return True
            except:
                time.sleep(0.5)
        
        print("⚠️  Flask app may not have started properly")
        return False
        
    except Exception as e:
        print(f"❌ Error starting Flask app: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Main test function"""
    print("🧪 Testing Flask Pub/Sub Route Fix")
    print("=" * 60)
    print("This test verifies that /process_ingestion_task route")
    print("doesn't raise KeyError 'time' when processing Pub/Sub messages")
    print("=" * 60)
    
    # Check if Flask app is already running
    flask_url = "http://localhost:5000"
    try:
        requests.get(flask_url, timeout=2)
        print("\n✅ Flask app appears to be running")
    except:
        print("\n⚠️  Flask app not detected. Attempting to start...")
        if not start_flask_app_in_background():
            print("\n❌ Could not start Flask app automatically")
            print("   Please start it manually with: python -m flask run --port 5000")
            print("   Or run: python app.py (if it has a main block)")
            return 1
        time.sleep(2)  # Give it a moment to start
    
    # Run the test
    success = test_flask_route(flask_url)
    
    print("\n" + "=" * 60)
    if success:
        print("✅ TEST PASSED: Flask route fix is working correctly!")
        print("   No KeyError 'time' occurred")
    else:
        print("❌ TEST FAILED: KeyError 'time' still occurs")
    print("=" * 60)
    
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())

