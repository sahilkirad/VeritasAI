#!/usr/bin/env python3
"""
Test AI Interview System - Comprehensive Testing
Tests all AI Interview agents and meeting scheduling functionality.
"""

import requests
import json
import time
from datetime import datetime, timedelta

# Configuration
BASE_URL = "https://asia-south1-veritas-472301.cloudfunctions.net"
SCHEDULE_URL = "https://schedule-ai-interview-abvgpbhuca-el.a.run.app"

def test_schedule_ai_interview():
    """Test the schedule_ai_interview function"""
    print("🧪 Testing Schedule AI Interview...")
    
    # Test data
    test_data = {
        "memo_id": "test_memo_123",
        "founder_email": "founder@teststartup.com",
        "investor_email": "investor@veritas.ai",
        "startup_name": "TestAI Startup",
        "calendar_id": "93fe7cf38ab25552f7c40f0a9e3584f3fab5bbe5e006011eac718ca8e7cc34e4f@group.calendar.google.com"
    }
    
    try:
        response = requests.post(
            SCHEDULE_URL,
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Schedule AI Interview - SUCCESS")
            print(f"   Event ID: {result.get('event_id', 'N/A')}")
            print(f"   Meet Link: {result.get('meet_link', 'N/A')}")
            print(f"   Status: {result.get('status', 'N/A')}")
            return result
        else:
            print("❌ Schedule AI Interview - FAILED")
            return None
            
    except Exception as e:
        print(f"❌ Schedule AI Interview - ERROR: {e}")
        return None

def test_start_transcription():
    """Test the start_transcription function"""
    print("\n🧪 Testing Start Transcription...")
    
    test_data = {
        "meeting_id": "test_meeting_456",
        "audio_config": {
            "sample_rate": 16000,
            "language_code": "en-US",
            "enable_speaker_diarization": True
        }
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/start_transcription",
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Start Transcription - SUCCESS")
            return response.json()
        else:
            print("❌ Start Transcription - FAILED")
            return None
            
    except Exception as e:
        print(f"❌ Start Transcription - ERROR: {e}")
        return None

def test_generate_questions():
    """Test the QAGenerationAgent functionality"""
    print("\n🧪 Testing Generate Questions (QAGenerationAgent)...")
    
    # Sample Memo 1 data (FinTech startup)
    memo_data = {
        "domain": "FinTech",
        "problem": "High MDR fees for SMEs",
        "solution": "AI-based transaction gateway",
        "missing_fields": ["unit_economics", "customer_retention", "compliance_policy"],
        "founder_profile": {
            "name": "Ravi Menon",
            "background": "ex-ICICI product head",
            "experience": "10 years banking"
        },
        "company_stage": "Series A",
        "revenue_model": "Transaction fees",
        "target_market": "SMEs in India"
    }
    
    # Sample transcript data
    transcript_data = [
        {
            "speaker": "founder",
            "text": "We currently serve 200 merchants and have an ARR of 120k USD",
            "timestamp": "00:02:30"
        },
        {
            "speaker": "investor", 
            "text": "That's interesting. Can you tell me more about your customer acquisition?",
            "timestamp": "00:03:15"
        },
        {
            "speaker": "founder",
            "text": "We acquire customers through digital marketing and partnerships",
            "timestamp": "00:03:45"
        }
    ]
    
    test_data = {
        "memo_data": memo_data,
        "transcript_data": transcript_data,
        "meeting_id": "test_meeting_456"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/generate_questions",
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Generate Questions - SUCCESS")
            
            # Display generated questions
            if 'generated_questions' in result:
                questions = result['generated_questions']
                print(f"   Generated {len(questions)} questions:")
                for i, q in enumerate(questions, 1):
                    print(f"   {i}. {q.get('question', 'N/A')}")
                    print(f"      Priority: {q.get('priority', 'N/A')}")
                    print(f"      Domain: {q.get('domain', 'N/A')}")
                    print()
            
            return result
        else:
            print("❌ Generate Questions - FAILED")
            return None
            
    except Exception as e:
        print(f"❌ Generate Questions - ERROR: {e}")
        return None

def test_analyze_sentiment():
    """Test the SentimentCommunicationAgent functionality"""
    print("\n🧪 Testing Analyze Sentiment...")
    
    test_data = {
        "text": "We're very confident about our market position and have strong unit economics with a 3:1 LTV to CAC ratio",
        "speaker": "founder"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/analyze_sentiment",
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Analyze Sentiment - SUCCESS")
            print(f"   Sentiment: {result.get('sentiment', 'N/A')}")
            print(f"   Confidence Score: {result.get('confidence_score', 'N/A')}")
            print(f"   Tone: {result.get('tone', 'N/A')}")
            return result
        else:
            print("❌ Analyze Sentiment - FAILED")
            return None
            
    except Exception as e:
        print(f"❌ Analyze Sentiment - ERROR: {e}")
        return None

def test_generate_memo_2():
    """Test the SynthesisAgent functionality"""
    print("\n🧪 Testing Generate Memo 2...")
    
    # Sample data for Memo 2 generation
    memo_1_data = {
        "startup_name": "TestAI Startup",
        "domain": "FinTech",
        "problem": "High MDR fees for SMEs",
        "solution": "AI-based transaction gateway",
        "founder_name": "Ravi Menon",
        "company_stage": "Series A"
    }
    
    transcript_data = [
        {
            "speaker": "founder",
            "text": "We serve 200 merchants with 120k ARR and 3:1 LTV to CAC ratio",
            "timestamp": "00:05:00"
        },
        {
            "speaker": "founder", 
            "text": "Our churn rate is 2% monthly and we're growing 20% MoM",
            "timestamp": "00:07:30"
        }
    ]
    
    sentiment_analysis = {
        "sentiment": "positive",
        "confidence_score": 0.85,
        "tone": "confident"
    }
    
    qa_data = {
        "questions_asked": 5,
        "questions_answered": 4,
        "missing_topics": ["regulatory_compliance"]
    }
    
    test_data = {
        "memo_1_data": memo_1_data,
        "transcript_data": transcript_data,
        "sentiment_analysis": sentiment_analysis,
        "qa_data": qa_data,
        "meeting_id": "test_meeting_456"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/generate_memo_2",
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=60
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Generate Memo 2 - SUCCESS")
            print(f"   Memo Version: {result.get('memo_version', 'N/A')}")
            print(f"   Summary: {result.get('summary', 'N/A')[:100]}...")
            print(f"   Recommendation: {result.get('recommendation', 'N/A')}")
            return result
        else:
            print("❌ Generate Memo 2 - FAILED")
            return None
            
    except Exception as e:
        print(f"❌ Generate Memo 2 - ERROR: {e}")
        return None

def test_full_ai_interview_flow():
    """Test the complete AI Interview flow"""
    print("\n🚀 Testing Complete AI Interview Flow...")
    
    results = {}
    
    # Step 1: Schedule meeting
    print("\n📅 Step 1: Scheduling AI Interview...")
    schedule_result = test_schedule_ai_interview()
    results['schedule'] = schedule_result
    
    if schedule_result:
        meeting_id = schedule_result.get('event_id', 'test_meeting_456')
        
        # Step 2: Start transcription
        print(f"\n🎤 Step 2: Starting transcription for meeting {meeting_id}...")
        transcription_result = test_start_transcription()
        results['transcription'] = transcription_result
        
        # Step 3: Generate questions
        print(f"\n❓ Step 3: Generating intelligent questions...")
        questions_result = test_generate_questions()
        results['questions'] = questions_result
        
        # Step 4: Analyze sentiment
        print(f"\n😊 Step 4: Analyzing founder sentiment...")
        sentiment_result = test_analyze_sentiment()
        results['sentiment'] = sentiment_result
        
        # Step 5: Generate Memo 2
        print(f"\n📝 Step 5: Generating Memo 2...")
        memo2_result = test_generate_memo_2()
        results['memo2'] = memo2_result
        
        return results
    
    return None

def main():
    """Run all tests"""
    print("🧪 AI Interview System - Comprehensive Test Suite")
    print("=" * 60)
    
    # Test individual functions
    print("\n🔧 Testing Individual Functions...")
    
    # Test 1: Schedule AI Interview
    schedule_result = test_schedule_ai_interview()
    
    # Test 2: Start Transcription
    transcription_result = test_start_transcription()
    
    # Test 3: Generate Questions (QAGenerationAgent)
    questions_result = test_generate_questions()
    
    # Test 4: Analyze Sentiment
    sentiment_result = test_analyze_sentiment()
    
    # Test 5: Generate Memo 2
    memo2_result = test_generate_memo_2()
    
    # Test complete flow
    print("\n🔄 Testing Complete AI Interview Flow...")
    flow_result = test_full_ai_interview_flow()
    
    # Summary
    print("\n📊 Test Summary:")
    print("=" * 60)
    
    tests = [
        ("Schedule AI Interview", schedule_result),
        ("Start Transcription", transcription_result),
        ("Generate Questions", questions_result),
        ("Analyze Sentiment", sentiment_result),
        ("Generate Memo 2", memo2_result)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, result in tests:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All AI Interview functions are working correctly!")
    else:
        print("⚠️  Some functions need attention. Check the logs above.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
