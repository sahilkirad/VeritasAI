#!/usr/bin/env python3
"""
Test script for Perplexity AI enrichment
"""

import sys
import os
import json
import asyncio

# Add the functions directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'functions'))

from services.perplexity_service import PerplexitySearchService

async def test_perplexity_enrichment():
    """Test the Perplexity enrichment service"""
    print("🧪 Testing Perplexity AI Enrichment...")
    
    # Create test memo data with missing fields
    test_memo = {
        "title": "Test Company Inc.",
        "company_name": "Test Company Inc.",
        "company_stage": "Not specified",
        "headquarters": "Not specified", 
        "founded_date": "Not specified",
        "amount_raising": "Not specified",
        "post_money_valuation": "Not specified",
        "investment_sought": "Not specified",
        "ownership_target": "Not specified",
        "key_thesis": "Not specified",
        "key_metric": "Not specified"
    }
    
    print(f"📊 Original memo data:")
    for key, value in test_memo.items():
        print(f"  {key}: {value}")
    
    # Initialize Perplexity service
    try:
        perplexity_service = PerplexitySearchService()
        print("✅ PerplexitySearchService initialized successfully")
        
        # Test enrichment
        print("\n🔍 Starting enrichment process...")
        enriched_memo = await perplexity_service.enrich_missing_fields(test_memo)
        
        print(f"\n📈 Enriched memo data:")
        for key, value in enriched_memo.items():
            if key.endswith('_enriched'):
                print(f"  {key}: {json.dumps(value, indent=2)}")
            else:
                print(f"  {key}: {value}")
        
        # Check if enrichment worked
        enriched_fields = [key for key in enriched_memo.keys() if key.endswith('_enriched')]
        print(f"\n🎯 Found {len(enriched_fields)} enriched fields:")
        for field in enriched_fields:
            print(f"  - {field}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing Perplexity enrichment: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_perplexity_enrichment())
    if success:
        print("\n✅ Perplexity enrichment test completed successfully!")
    else:
        print("\n❌ Perplexity enrichment test failed!")
        sys.exit(1)
