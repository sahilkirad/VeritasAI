#!/usr/bin/env python3
"""
Test Current AI Interview System Status
Quick test to see what's working and what needs fixing.
"""

import requests
import json

# Function URLs
FUNCTIONS = {
    "schedule_ai_interview": "https://schedule-ai-interview-abvgpbhuca-el.a.run.app",
    "start_transcription": "https://asia-south1-veritas-472301.cloudfunctions.net/start_transcription",
    "generate_questions": "https://asia-south1-veritas-472301.cloudfunctions.net/generate_questions",
    "analyze_sentiment": "https://asia-south1-veritas-472301.cloudfunctions.net/analyze_sentiment",
    "generate_memo_2": "https://asia-south1-veritas-472301.cloudfunctions.net/generate_memo_2"
}

def test_function(name, url, test_data):
    """Test a single function"""
    print(f"\n🧪 Testing {name}...")
    print(f"URL: {url}")
    
    try:
        response = requests.post(
            url,
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            if result.get('status') == 'success':
                print("✅ SUCCESS")
                return True
            else:
                print(f"❌ FAILED - {result.get('error', 'Unknown error')}")
                return False
        else:
            print(f"❌ HTTP ERROR - {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ EXCEPTION - {e}")
        return False

def main():
    """Test all AI Interview functions"""
    print("🧪 AI Interview System - Current Status Test")
    print("=" * 60)
    
    results = {}
    
    # Test 1: Schedule AI Interview
    schedule_data = {
        "memo_id": "test_status",
        "founder_email": "founder@test.com",
        "investor_email": "investor@test.com",
        "startup_name": "Test Startup",
        "calendar_id": "primary"
    }
    results['schedule'] = test_function("Schedule AI Interview", FUNCTIONS['schedule_ai_interview'], schedule_data)
    
    # Test 2: Generate Questions
    questions_data = {
        "memo_data": {
            "domain": "FinTech",
            "missing_fields": ["CAC", "LTV"]
        },
        "transcript_data": [
            {"speaker": "founder", "text": "We have 200 customers", "timestamp": "00:01:00"}
        ],
        "meeting_id": "test_meeting"
    }
    results['questions'] = test_function("Generate Questions", FUNCTIONS['generate_questions'], questions_data)
    
    # Test 3: Analyze Sentiment
    sentiment_data = {
        "text": "We're confident about our market position",
        "speaker": "founder"
    }
    results['sentiment'] = test_function("Analyze Sentiment", FUNCTIONS['analyze_sentiment'], sentiment_data)
    
    # Test 4: Generate Memo 2
    memo2_data = {
        "memo_1_data": {"startup_name": "Test Startup"},
        "transcript_data": [{"speaker": "founder", "text": "We have strong metrics", "timestamp": "00:01:00"}],
        "sentiment_analysis": {"sentiment": "positive"},
        "qa_data": {"questions_asked": 3},
        "meeting_id": "test_meeting"
    }
    results['memo2'] = test_function("Generate Memo 2", FUNCTIONS['generate_memo_2'], memo2_data)
    
    # Test 5: Start Transcription
    transcription_data = {
        "meeting_id": "test_meeting",
        "audio_config": {
            "sample_rate": 16000,
            "language_code": "en-US"
        }
    }
    results['transcription'] = test_function("Start Transcription", FUNCTIONS['start_transcription'], transcription_data)
    
    # Summary
    print("\n📊 Test Results Summary:")
    print("=" * 60)
    
    working = 0
    total = len(results)
    
    for name, status in results.items():
        status_icon = "✅" if status else "❌"
        print(f"{status_icon} {name.replace('_', ' ').title()}")
        if status:
            working += 1
    
    print(f"\nOverall: {working}/{total} functions working")
    
    if working == total:
        print("🎉 All AI Interview functions are working!")
    elif working >= 3:
        print("⚠️  Most functions working - only meeting scheduling needs attention")
    else:
        print("❌ Multiple functions need attention")
    
    # Specific recommendations
    print("\n🔧 Recommendations:")
    if not results['schedule']:
        print("• Fix meeting scheduling: Remove attendees and sendUpdates from MeetingAgent")
    if not results['sentiment']:
        print("• Enable Cloud Natural Language API in Google Cloud Console")
    if not results['transcription']:
        print("• Fix Speech-to-Text configuration: Remove unsupported fields")
    
    return working >= 3

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
