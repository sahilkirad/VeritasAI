#!/usr/bin/env python3
"""
Test script for Validation Agent
Tests company data validation and enrichment using Gemini and Perplexity APIs
"""

import os
import json
import asyncio
import logging
from typing import Dict, List, Any

# Import the validation agent
from agents.validation_agent import ValidationAgent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ValidationAgentTester:
    """Test and validate the Validation Agent functionality"""
    
    def __init__(self):
        self.validation_agent = ValidationAgent(project="veritas-472301")
        self.validation_agent.set_up()  # Initialize the agent
        
    async def test_company_validation(self, company_name: str = "OpenAI"):
        """Test company data validation with a real company"""
        logger.info(f"🧪 Testing validation for company: {company_name}")
        
        # Sample incomplete company data
        sample_data = {
            "title": company_name,
            "company_stage": "Not specified",
            "headquarters": "Not disclosed",
            "founded_date": "N/A",
            "team_size": "Unknown",
            "current_revenue": "Not available",
            "funding_raised": "Not disclosed",
            "key_team_members": [],
            "market_size": "Not specified",
            "competitors": []
        }
        
        try:
            # Test validation
            validated_data = await self.validation_agent.validate_company_data(
                company_name, sample_data
            )
            
            # Show results
            logger.info("📊 Validation Results:")
            logger.info(f"Fields validated: {validated_data.get('validation_metadata', {}).get('fields_validated', [])}")
            logger.info(f"Validation success: {validated_data.get('validation_success', False)}")
            
            # Show enriched fields
            enriched_fields = []
            for field in ["company_stage", "headquarters", "founded_date", "team_size", "current_revenue"]:
                if field in validated_data and validated_data[field] != sample_data[field]:
                    enriched_fields.append(field)
                    logger.info(f"✅ {field}: {validated_data[field]}")
            
            return len(enriched_fields) > 0
            
        except Exception as e:
            logger.error(f"❌ Validation test failed: {str(e)}")
            return False
    
    async def test_enhanced_web_search(self):
        """Test enhanced web search functionality"""
        logger.info("🧪 Testing enhanced web search...")
        
        # Test with a well-known company
        sample_data = {
            "title": "Tesla",
            "company_stage": "",  # Missing
            "headquarters": "",  # Missing
            "founded_date": "",  # Missing
            "team_size": "",  # Missing
            "current_revenue": "",  # Missing
            "funding_raised": "",  # Missing
            "key_team_members": [],  # Missing
            "market_size": "",  # Missing
            "competitors": []  # Missing
        }
        
        try:
            # Test enhanced validation
            validated_data = await self.validation_agent.validate_company_data(
                "Tesla", sample_data
            )
            
            logger.info("📊 Enhanced Web Search Results:")
            validation_metadata = validated_data.get('validation_metadata', {})
            fields_validated = validation_metadata.get('fields_validated', [])
            
            if fields_validated:
                logger.info(f"✅ Fields enriched: {len(fields_validated)}")
                for field in fields_validated:
                    value = validated_data.get(field, "N/A")
                    confidence = validation_metadata.get('confidence_scores', {}).get(field, 0)
                    source = validation_metadata.get('validation_sources', {}).get(field, "unknown")
                    logger.info(f"  • {field}: {value} (confidence: {confidence}, source: {source})")
                return True
            else:
                logger.warning("⚠️ No fields were enriched")
                return False
            
        except Exception as e:
            logger.error(f"❌ Enhanced web search test failed: {str(e)}")
            return False
    
    async def test_api_connectivity(self):
        """Test API connectivity for both Gemini and Perplexity"""
        logger.info("🧪 Testing API connectivity...")
        
        # Test Gemini
        gemini_available = self.validation_agent.gemini_model is not None
        logger.info(f"Gemini API: {'✅ Available' if gemini_available else '❌ Not available'}")
        
        # Test Perplexity
        perplexity_available = self.validation_agent.perplexity_api_key is not None
        logger.info(f"Perplexity API: {'✅ Available' if perplexity_available else '❌ Not available'}")
        
        return gemini_available or perplexity_available

async def main():
    """Main test function"""
    print("🔍 Validation Agent Test Suite")
    print("=" * 40)
    
    # Check API keys
    gemini_key = os.environ.get("GEMINI_API_KEY")
    perplexity_key = os.environ.get("PERPLEXITY_API_KEY")
    
    print(f"🔑 API Keys Status:")
    print(f"  Gemini: {'✅ Set' if gemini_key else '❌ Not set'}")
    print(f"  Perplexity: {'✅ Set' if perplexity_key else '❌ Not set'}")
    print()
    
    if not gemini_key and not perplexity_key:
        print("⚠️  No API keys found. Please set GEMINI_API_KEY or PERPLEXITY_API_KEY")
        print("   export GEMINI_API_KEY=your_gemini_key")
        print("   export PERPLEXITY_API_KEY=your_perplexity_key")
        return
    
    tester = ValidationAgentTester()
    
    # Test 1: API Connectivity
    print("📋 Test 1: API Connectivity")
    print("-" * 30)
    connectivity_success = await tester.test_api_connectivity()
    
    # Test 2: Company Validation
    print("\n📋 Test 2: Company Data Validation")
    print("-" * 40)
    validation_success = await tester.test_company_validation("OpenAI")
    
    # Test 3: Enhanced Web Search
    print("\n📋 Test 3: Enhanced Web Search")
    print("-" * 35)
    web_search_success = await tester.test_enhanced_web_search()
    
    # Summary
    print("\n📊 Test Results Summary")
    print("=" * 30)
    print(f"API Connectivity: {'✅ PASS' if connectivity_success else '❌ FAIL'}")
    print(f"Company Validation: {'✅ PASS' if validation_success else '❌ FAIL'}")
    print(f"Enhanced Web Search: {'✅ PASS' if web_search_success else '❌ FAIL'}")
    
    if connectivity_success and (validation_success or web_search_success):
        print("\n🎉 Enhanced Validation Agent is working correctly!")
        print("Ready to integrate with ingestion pipeline.")
    else:
        print("\n⚠️  Some tests failed. Check API keys and network connectivity.")

if __name__ == "__main__":
    asyncio.run(main())
