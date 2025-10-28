#!/usr/bin/env python3
"""
Test Perplexity enrichment with your API key
"""

import os
import asyncio
import json
from datetime import datetime

# Set the API key from environment variable
# For testing, set PERPLEXITY_API_KEY environment variable
# export PERPLEXITY_API_KEY='your_api_key_here'

# Import the service
import sys
sys.path.append('functions')
from services.perplexity_service import PerplexitySearchService

async def test_perplexity_enrichment():
    """Test Perplexity enrichment with sample data"""
    print("🧪 Testing Perplexity Enrichment")
    print("=" * 40)
    
    # Initialize the service
    service = PerplexitySearchService(project="veritas-472301")
    
    if not service.enabled:
        print("❌ Perplexity service is not enabled")
        return
    
    print("✅ Perplexity service is enabled")
    print(f"✅ API Key: {service.api_key[:10]}...")
    
    # Create sample memo data with missing fields
    sample_memo = {
        "title": "we360.ai",
        "company_name": "we360.ai",
        "company_stage": "Not specified",
        "headquarters": "Not specified", 
        "founded_date": "Not specified",
        "current_revenue": "Not specified",
        "team_size": "Not specified",
        "industry_category": "AI/HR Technology",
        "description": "AI-powered workforce productivity platform"
    }
    
    print(f"\n📊 Sample data before enrichment:")
    for key, value in sample_memo.items():
        if value == "Not specified":
            print(f"  ❌ {key}: {value}")
        else:
            print(f"  ✅ {key}: {value}")
    
    print(f"\n🔍 Running enrichment...")
    start_time = datetime.now()
    
    # Run enrichment
    enriched_memo = await service.enrich_missing_fields(sample_memo)
    
    enrichment_time = (datetime.now() - start_time).total_seconds()
    
    print(f"\n📈 Enrichment completed in {enrichment_time:.2f} seconds")
    
    # Check results
    enrichment_metadata = enriched_memo.get("enrichment_metadata", {})
    enriched_fields = enrichment_metadata.get("fields_enriched", [])
    confidence_scores = enrichment_metadata.get("confidence_scores", {})
    
    print(f"\n📊 Results after enrichment:")
    print(f"  Fields enriched: {len(enriched_fields)}")
    print(f"  Enriched fields: {enriched_fields}")
    
    if confidence_scores:
        avg_confidence = sum(confidence_scores.values()) / len(confidence_scores)
        print(f"  Average confidence: {avg_confidence:.2f}")
    
    print(f"\n🔍 Detailed results:")
    for key, value in enriched_memo.items():
        if key.startswith("enrichment_"):
            continue
        if value != sample_memo.get(key, ""):
            print(f"  ✅ {key}: {value}")
        elif value == "Not specified":
            print(f"  ❌ {key}: {value}")
        else:
            print(f"  📝 {key}: {value}")
    
    # Test a specific search
    print(f"\n🔍 Testing specific search for we360.ai...")
    results = await service._perplexity_search("we360.ai company information headquarters founding date funding", max_results=1)
    
    if results:
        print(f"✅ Search successful!")
        print(f"Content preview: {results[0]['content'][:200]}...")
        print(f"Sources: {len(results[0].get('citations', []))} citations")
    else:
        print(f"❌ Search failed")
    
    print(f"\n✅ Test completed!")

if __name__ == "__main__":
    asyncio.run(test_perplexity_enrichment())
