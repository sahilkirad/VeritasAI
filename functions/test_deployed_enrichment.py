#!/usr/bin/env python3
"""
Test script for deployed Perplexity + Vertex AI enrichment
Tests the deployed Cloud Function to verify enrichment is working
"""

import requests
import json
import time
from typing import Dict, Any

# Configuration
FUNCTION_URL = "https://us-central1-veritas-472301.cloudfunctions.net/intake-agent"

def test_deployed_enrichment():
    """Test the deployed Cloud Function with sample data"""
    print("🧪 Testing Deployed Perplexity + Vertex AI Enrichment")
    print("=" * 60)
    
    # Test data - simulate a PDF upload
    test_data = {
        "filename": "test_pitch_deck.pdf",
        "file_type": "pdf",
        "founder_email": "test@example.com",
        "company_id": "test_company_001",
        "file_data": "base64_encoded_pdf_data_here"  # In real scenario, this would be actual PDF data
    }
    
    print(f"📤 Sending request to: {FUNCTION_URL}")
    print(f"📋 Test data: {json.dumps(test_data, indent=2)}")
    
    try:
        # Send request to deployed function
        print("\n⏳ Sending request...")
        start_time = time.time()
        
        response = requests.post(
            FUNCTION_URL, 
            json=test_data,
            timeout=600  # 10 minutes timeout for enrichment
        )
        
        request_time = time.time() - start_time
        
        print(f"⏱️  Request completed in {request_time:.2f} seconds")
        print(f"📊 Response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            
            print("\n✅ Function executed successfully!")
            print(f"📋 Status: {result.get('status')}")
            print(f"🔄 Data enriched: {result.get('data_enriched')}")
            print(f"📈 Enrichment count: {result.get('enrichment_count', 0)}")
            
            # Check enrichment metadata
            enrichment_metadata = result.get('enrichment_metadata', {})
            if enrichment_metadata:
                enriched_fields = enrichment_metadata.get('fields_enriched', [])
                confidence_scores = enrichment_metadata.get('confidence_scores', {})
                
                print(f"\n🎯 Enriched fields: {enriched_fields}")
                print(f"📊 Confidence scores: {confidence_scores}")
                
                if confidence_scores:
                    avg_confidence = sum(confidence_scores.values()) / len(confidence_scores)
                    print(f"📈 Average confidence: {avg_confidence:.2f}")
            
            # Check processing time
            processing_time = result.get('processing_time_seconds', 0)
            print(f"⏱️  Processing time: {processing_time:.2f} seconds")
            
            # Success criteria check
            print(f"\n🎯 Success Criteria Check:")
            print(f"  ✅ Function deployed: {response.status_code == 200}")
            print(f"  ✅ Data enriched: {result.get('data_enriched', False)}")
            print(f"  ✅ Enrichment count: {result.get('enrichment_count', 0)} > 0")
            print(f"  ✅ Processing time: {processing_time:.2f}s < 30s")
            
            if result.get('data_enriched') and result.get('enrichment_count', 0) > 0:
                print(f"\n🎉 SUCCESS! Perplexity + Vertex AI enrichment is working!")
                print(f"📊 Enriched {result.get('enrichment_count', 0)} fields")
                print(f"⏱️  Completed in {processing_time:.2f} seconds")
            else:
                print(f"\n⚠️  WARNING: Enrichment may not be working properly")
                print(f"🔍 Check logs for more details")
            
        else:
            print(f"\n❌ Function failed with status {response.status_code}")
            print(f"📋 Response: {response.text}")
            
    except requests.exceptions.Timeout:
        print(f"\n⏰ Request timed out after 10 minutes")
        print(f"🔍 This might indicate the function is still processing")
        
    except requests.exceptions.RequestException as e:
        print(f"\n❌ Request failed: {e}")
        print(f"🔍 Check if the function is deployed and accessible")
        
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")

def test_function_health():
    """Test basic function health"""
    print("\n🏥 Testing Function Health")
    print("-" * 30)
    
    try:
        # Simple health check
        health_data = {
            "filename": "health_check.pdf",
            "file_type": "pdf",
            "founder_email": "health@test.com",
            "company_id": "health_check_001"
        }
        
        response = requests.post(FUNCTION_URL, json=health_data, timeout=30)
        
        if response.status_code == 200:
            print("✅ Function is healthy and responding")
            return True
        else:
            print(f"❌ Function health check failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 Deployed Perplexity + Vertex AI Enrichment Test")
    print("=" * 60)
    
    # Test function health first
    if not test_function_health():
        print("\n❌ Function health check failed. Please check deployment.")
        return
    
    # Test enrichment functionality
    test_deployed_enrichment()
    
    print(f"\n📋 Next Steps:")
    print(f"1. Check function logs: gcloud functions logs read intake-agent --region=us-central1 --gen2")
    print(f"2. Monitor enrichment performance")
    print(f"3. Verify field coverage meets 80%+ target")
    print(f"4. Check processing time stays under 30 seconds")

if __name__ == "__main__":
    main()
