#!/usr/bin/env python3
"""
Test script to validate Perplexity API 400 error fix
Tests the model fallback mechanism and error handling
"""

import os
import json
import asyncio
import logging
from typing import Dict, List, Any

# Import the enhanced Perplexity service
from services.perplexity_service import PerplexitySearchService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PerplexityAPITester:
    """Test and validate Perplexity API fix with model fallback"""
    
    def __init__(self):
        self.perplexity_service = PerplexitySearchService(project="veritas-472301")
        
    async def test_model_fallback(self, test_query: str = "What is the latest funding information for OpenAI?"):
        """Test the model fallback mechanism"""
        logger.info("🧪 Testing Perplexity API model fallback mechanism...")
        logger.info(f"Test query: {test_query}")
        
        try:
            # Test the search with fallback
            results = await self.perplexity_service._perplexity_search(test_query)
            
            if results:
                logger.info("✅ Perplexity API test successful!")
                logger.info(f"Model used: {results[0].get('model_used', 'Unknown')}")
                logger.info(f"Content length: {len(results[0].get('content', ''))}")
                logger.info(f"Citations: {len(results[0].get('citations', []))}")
                
                # Show first 200 chars of content
                content_preview = results[0].get('content', '')[:200]
                logger.info(f"Content preview: {content_preview}...")
                
                return True
            else:
                logger.error("❌ Perplexity API test failed - no results returned")
                return False
                
        except Exception as e:
            logger.error(f"❌ Exception during Perplexity API test: {str(e)}")
            return False
    
    async def test_enrichment_flow(self):
        """Test the complete enrichment flow"""
        logger.info("🧪 Testing complete enrichment flow...")
        
        # Sample memo data with missing fields
        sample_memo = {
            "title": "TechCorp AI",
            "company_stage": "Not specified",
            "headquarters": "Not disclosed", 
            "founded_date": "N/A",
            "current_revenue": "Not available",
            "team_size": "TBD",
            "industry_category": "Artificial Intelligence"
        }
        
        try:
            # Test enrichment
            enriched_data = await self.perplexity_service.enrich_missing_fields(sample_memo)
            
            if enriched_data.get("enrichment_success"):
                logger.info("✅ Enrichment test successful!")
                logger.info(f"Fields enriched: {enriched_data.get('enrichment_count', 0)}")
                logger.info(f"Enriched fields: {enriched_data.get('enrichment_metadata', {}).get('fields_enriched', [])}")
                
                # Show some enriched data
                for field in ["company_stage", "headquarters", "current_revenue"]:
                    if field in enriched_data and enriched_data[field] != sample_memo[field]:
                        logger.info(f"✅ {field}: {enriched_data[field]}")
                
                return True
            else:
                logger.error("❌ Enrichment test failed")
                return False
                
        except Exception as e:
            logger.error(f"❌ Exception during enrichment test: {str(e)}")
            return False

async def main():
    """Main test function"""
    print("🔧 Perplexity API 400 Error Fix - Test Suite")
    print("=" * 50)
    
    # Check if API key is available
    api_key = os.environ.get("PERPLEXITY_API_KEY")
    if not api_key:
        print("❌ PERPLEXITY_API_KEY not found in environment variables")
        print("Please set your Perplexity API key:")
        print("export PERPLEXITY_API_KEY=your_api_key_here")
        return
    
    print(f"✅ API Key found: {api_key[:10]}...")
    
    tester = PerplexityAPITester()
    
    # Test 1: Model fallback mechanism
    print("\n📋 Test 1: Model Fallback Mechanism")
    print("-" * 40)
    fallback_success = await tester.test_model_fallback()
    
    # Test 2: Complete enrichment flow
    print("\n📋 Test 2: Complete Enrichment Flow")
    print("-" * 40)
    enrichment_success = await tester.test_enrichment_flow()
    
    # Summary
    print("\n📊 Test Results Summary")
    print("=" * 30)
    print(f"Model Fallback: {'✅ PASS' if fallback_success else '❌ FAIL'}")
    print(f"Enrichment Flow: {'✅ PASS' if enrichment_success else '❌ FAIL'}")
    
    if fallback_success and enrichment_success:
        print("\n🎉 All tests passed! Perplexity API fix is working correctly.")
        print("Ready to deploy to Firebase Functions.")
    else:
        print("\n⚠️  Some tests failed. Check the logs above for details.")
        print("The 400 error may still occur in production.")

if __name__ == "__main__":
    asyncio.run(main())
