#!/usr/bin/env python3
"""
Test Meeting Scheduling - Simple Test
Tests if the meeting scheduling works with primary calendar.
"""

import requests
import json

# Configuration
SCHEDULE_URL = "https://schedule-ai-interview-abvgpbhuca-el.a.run.app"

def test_schedule_with_primary_calendar():
    """Test scheduling with primary calendar instead of Veritas calendar"""
    print("🧪 Testing Schedule AI Interview with Primary Calendar...")
    
    # Test data - using primary calendar
    test_data = {
        "memo_id": "test_memo_primary",
        "founder_email": "founder@teststartup.com",
        "investor_email": "investor@veritas.ai",
        "startup_name": "TestAI Startup Primary",
        "calendar_id": "primary"  # Use primary calendar instead
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
            if result.get('status') == 'success':
                print("✅ Schedule AI Interview with Primary Calendar - SUCCESS")
                print(f"   Event ID: {result.get('event_id', 'N/A')}")
                print(f"   Meet Link: {result.get('meet_link', 'N/A')}")
                print(f"   Calendar: {result.get('calendar_used', 'N/A')}")
                return result
            else:
                print("❌ Schedule AI Interview - FAILED")
                print(f"   Error: {result.get('error', 'Unknown error')}")
                return None
        else:
            print("❌ Schedule AI Interview - HTTP ERROR")
            return None
            
    except Exception as e:
        print(f"❌ Schedule AI Interview - ERROR: {e}")
        return None

def test_schedule_with_veritas_calendar():
    """Test scheduling with Veritas calendar (should fail due to permissions)"""
    print("\n🧪 Testing Schedule AI Interview with Veritas Calendar...")
    
    # Test data - using Veritas calendar
    test_data = {
        "memo_id": "test_memo_veritas",
        "founder_email": "founder@teststartup.com",
        "investor_email": "investor@veritas.ai",
        "startup_name": "TestAI Startup Veritas",
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
            if result.get('status') == 'success':
                print("✅ Schedule AI Interview with Veritas Calendar - SUCCESS")
                print(f"   Event ID: {result.get('event_id', 'N/A')}")
                print(f"   Meet Link: {result.get('meet_link', 'N/A')}")
                return result
            else:
                print("❌ Schedule AI Interview with Veritas Calendar - FAILED (Expected)")
                print(f"   Error: {result.get('error', 'Unknown error')}")
                return None
        else:
            print("❌ Schedule AI Interview - HTTP ERROR")
            return None
            
    except Exception as e:
        print(f"❌ Schedule AI Interview - ERROR: {e}")
        return None

def main():
    """Run meeting scheduling tests"""
    print("🧪 AI Interview Meeting Scheduling Test")
    print("=" * 50)
    
    # Test 1: Primary Calendar (should work)
    primary_result = test_schedule_with_primary_calendar()
    
    # Test 2: Veritas Calendar (should fail due to permissions)
    veritas_result = test_schedule_with_veritas_calendar()
    
    # Summary
    print("\n📊 Test Summary:")
    print("=" * 50)
    
    if primary_result:
        print("✅ Primary Calendar: WORKING")
        print("   → Meetings can be scheduled in your personal Google Calendar")
    else:
        print("❌ Primary Calendar: FAILED")
        print("   → Check authentication and permissions")
    
    if veritas_result:
        print("✅ Veritas Calendar: WORKING")
        print("   → Meetings can be scheduled in Veritas calendar")
    else:
        print("❌ Veritas Calendar: FAILED (Expected)")
        print("   → Need to share Veritas calendar with service account")
        print("   → Go to: https://calendar.google.com")
        print("   → Find 'Veritas' calendar → Settings and sharing")
        print("   → Add: firebase-adminsdk-fbsvc@veritas-472301.iam.gserviceaccount.com")
        print("   → Permission: Make changes to events")
    
    print("\n🔧 Next Steps:")
    if not veritas_result:
        print("1. Share Veritas calendar with service account")
        print("2. Wait 5-10 minutes for permissions to propagate")
        print("3. Test again")
    
    return primary_result is not None

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
