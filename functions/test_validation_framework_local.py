#!/usr/bin/env python3
"""
Local test script for Veritas Validation Framework
Tests memo enrichment with validation using Perplexity API and Google fallback
"""

import os
import sys
import json
import asyncio
import logging
from datetime import datetime
from typing import Dict, Any, Optional

# Setup path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Check environment variables
def check_environment():
    """Check if required environment variables are set"""
    print("🔍 Checking environment configuration...")
    
    perplexity_key = os.environ.get('PERPLEXITY_API_KEY', '')
    project_id = os.environ.get('GOOGLE_CLOUD_PROJECT', 'veritas-472301')
    
    print(f"  PERPLEXITY_API_KEY: {'✅ Set' if perplexity_key else '❌ Not set'}")
    if perplexity_key:
        preview = f"{perplexity_key[:8]}...{perplexity_key[-4:]}" if len(perplexity_key) > 12 else f"{perplexity_key[:4]}..."
        print(f"    Preview: {preview}")
        print(f"    Valid format: {'✅' if perplexity_key.startswith('pplx-') else '❌'} (should start with 'pplx-')")
    
    print(f"  GOOGLE_CLOUD_PROJECT: {project_id}")
    print(f"  Expected location: asia-south1")
    
    return {
        "perplexity_configured": bool(perplexity_key),
        "perplexity_valid": perplexity_key.startswith('pplx-') if perplexity_key else False,
        "project_id": project_id
    }

async def test_validation_framework_local():
    """Test the validation framework locally"""
    print("\n" + "="*70)
    print("🧪 LOCAL TEST: Veritas Validation Framework")
    print("="*70 + "\n")
    
    # Check environment
    env_status = check_environment()
    print()
    
    if not env_status["perplexity_configured"]:
        print("⚠️  WARNING: PERPLEXITY_API_KEY not set. Will test with Google fallback only.")
        print("   Set it with: export PERPLEXITY_API_KEY='your-key-here'\n")
    
    # Initialize agent (without Firestore - we'll test validation only)
    print("📦 Initializing MemoEnrichmentAgent...")
    try:
        from agents.memo_enrichment_agent import MemoEnrichmentAgent
        
        agent = MemoEnrichmentAgent(
            project=env_status["project_id"],
            location="asia-south1"
        )
        
        # Try to set up, but continue if Firestore fails (we'll test validation only)
        try:
            agent.set_up()
            print("✅ MemoEnrichmentAgent initialized successfully\n")
        except Exception as firestore_error:
            print(f"⚠️  Firestore initialization failed (will test validation only): {firestore_error}")
            print("   This is OK - we'll test validation logic without Firestore\n")
        
    except Exception as e:
        print(f"❌ Failed to initialize agent: {e}")
        import traceback
        traceback.print_exc()
        return
    
    # Create sample memo data (simulating what would be fetched from Firestore)
    print("📝 Creating sample memo data...")
    sample_memo_data = {
        "title": "we360.ai",
        "founder_name": ["Arnav Gupta", "Siddharth Gupta"],
        "industry_category": "HRTech",
        "company_stage": "Series A",
        "headquarters": "Bangalore, India",
        "founded_date": "2020",
        "problem": "Workforce productivity and employee monitoring challenges",
        "solution": "AI-powered workforce productivity SaaS platform",
        "market_size": "$2.5B global market",
        "competition": ["Zoho People", "BambooHR"],
        "current_revenue": "$500K ARR",
        "amount_raising": "$5M Series A",
        "founder_linkedin_url": [],
        "company_linkedin_url": ""
    }
    
    print(f"  Company: {sample_memo_data['title']}")
    print(f"  Founders: {', '.join(sample_memo_data['founder_name'])}")
    print(f"  Industry: {sample_memo_data['industry_category']}\n")
    
    # Test validation directly (without Firestore)
    print("🔍 Testing validation framework...")
    print("   This will validate using Perplexity API (with Google fallback if needed)\n")
    
    try:
        company_name = sample_memo_data.get("title", "Unknown")
        founder_name = sample_memo_data.get("founder_name", "")
        if isinstance(founder_name, list):
            founder_name = founder_name[0] if founder_name else ""
        industry = sample_memo_data.get("industry_category", "")
        
        print(f"  Validating: {company_name}")
        print(f"  Founder: {founder_name}")
        print(f"  Industry: {industry}\n")
        
        # Run validation
        start_time = datetime.now()
        validation_results = await agent.validate_memo_claims(
            sample_memo_data,
            company_name,
            founder_name,
            industry
        )
        validation_time = (datetime.now() - start_time).total_seconds()
        
        if validation_time > 0:
            print(f"\n✅ Validation completed in {validation_time:.2f} seconds\n")
        else:
            print(f"\n✅ Validation completed\n")
        
        # Display results
        print("="*70)
        print("📊 VALIDATION RESULTS")
        print("="*70 + "\n")
        
        validation_method = validation_results.get("validation_method", "unknown")
        overall_score = validation_results.get("overall_validation_score", 0.0)
        categories_validated = validation_results.get("categories_validated", 0)
        success_rate = validation_results.get("perplexity_success_rate", "N/A")
        
        print(f"Validation Method: {validation_method}")
        print(f"Overall Score: {overall_score:.2f}/1.0")
        print(f"Categories Validated: {categories_validated}/10")
        print(f"Perplexity Success Rate: {success_rate}\n")
        
        # Show category-by-category results
        results = validation_results.get("validation_results", {})
        print("Category Breakdown:")
        print("-" * 70)
        
        category_names = {
            "company_identity": "1. Company Identity",
            "founder_team": "2. Founder & Team",
            "product_ip": "3. Product & IP",
            "market_opportunity": "4. Market Opportunity",
            "competitors": "5. Competitors",
            "financial_traction": "6. Financial & Traction",
            "fundraising_cap_table": "7. Fundraising & Cap Table",
            "compliance_sanctions": "8. Compliance & Sanctions",
            "public_sentiment": "9. Public Sentiment",
            "exit_acquisition": "10. Exit / Acquisition"
        }
        
        for category_key, category_label in category_names.items():
            category_result = results.get(category_key, {})
            if category_result:
                status = category_result.get("status", "UNKNOWN")
                confidence = category_result.get("confidence", 0.0)
                method = category_result.get("validation_method", "unknown")
                sources_count = len(category_result.get("sources", []))
                
                status_emoji = "✅" if status == "CONFIRMED" else "⚠️" if status == "QUESTIONABLE" else "❌"
                print(f"  {status_emoji} {category_label}")
                print(f"      Status: {status}")
                print(f"      Confidence: {confidence:.2f}/1.0")
                print(f"      Method: {method}")
                print(f"      Sources: {sources_count}")
                
                # Show key findings if available
                findings = category_result.get("findings", {})
                if isinstance(findings, dict) and findings:
                    key_items = list(findings.items())[:2]  # Show first 2 items
                    for key, value in key_items:
                        if value and not isinstance(value, (dict, list)) and len(str(value)) < 100:
                            print(f"      {key}: {str(value)[:60]}...")
                print()
            else:
                print(f"  ⚠️  {category_label} - Not validated")
                print()
        
        # Test fallback if Perplexity is disabled
        if not env_status["perplexity_configured"]:
            print("\n" + "="*70)
            print("🔄 FALLBACK TEST: Testing Google Validation Service")
            print("="*70 + "\n")
            
            try:
                from services.google_validation_service import GoogleValidationService
                google_service = GoogleValidationService(
                    project=env_status["project_id"],
                    location="asia-south1"
                )
                google_service.set_up()
                
                print("✅ Google Validation Service initialized")
                print("   Running comprehensive validation...\n")
                
                fallback_result = google_service.validate_memo_data(sample_memo_data)
                
                if fallback_result.get("status") == "SUCCESS":
                    print("✅ Google fallback validation successful")
                    validation_result = fallback_result.get("validation_result", {})
                    print(f"   Data validation score: {validation_result.get('data_validation', {}).get('accuracy_score', 0)}/10")
                    print(f"   Market validation score: {validation_result.get('market_validation', {}).get('market_size_accuracy', 0)}/10")
                else:
                    print(f"❌ Google fallback failed: {fallback_result.get('error', 'Unknown error')}")
                    
            except Exception as e:
                print(f"❌ Google fallback test failed: {e}")
                import traceback
                traceback.print_exc()
        
        # Save results to file
        output_file = f"validation_test_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w') as f:
            json.dump({
                "test_timestamp": datetime.now().isoformat(),
                "environment": env_status,
                "sample_data": sample_memo_data,
                "validation_results": validation_results,
                "validation_time_seconds": validation_time
            }, f, indent=2, default=str)
        
        print("\n" + "="*70)
        print("✅ LOCAL TEST COMPLETED SUCCESSFULLY")
        print("="*70)
        print(f"\n📄 Results saved to: {output_file}")
        print(f"\n📊 Summary:")
        print(f"   - Validation method: {validation_method}")
        print(f"   - Overall score: {overall_score:.2f}/1.0")
        print(f"   - Categories validated: {categories_validated}/10")
        print(f"   - Validation time: {validation_time:.2f}s")
        print(f"\n🎯 Next steps:")
        print(f"   1. Check {output_file} for detailed results")
        print(f"   2. Verify all 10 categories have validation results")
        print(f"   3. Test with real memo_id from Firestore")
        print(f"   4. Check logs for any warnings or errors")
        
    except Exception as e:
        print(f"\n❌ Validation test failed: {e}")
        import traceback
        traceback.print_exc()
        return

async def test_with_firestore_memo():
    """Test with an actual memo from Firestore"""
    print("\n" + "="*70)
    print("🧪 TEST WITH FIRESTORE MEMO")
    print("="*70 + "\n")
    
    try:
        from agents.memo_enrichment_agent import MemoEnrichmentAgent
        import firebase_admin
        from firebase_admin import firestore, initialize_app
        
        # Initialize Firebase
        try:
            firebase_admin.get_app()
        except ValueError:
            initialize_app()
        
        agent = MemoEnrichmentAgent(project="veritas-472301", location="asia-south1")
        agent.set_up()
        
        # Get a test memo_id (you can modify this)
        db = firestore.client()
        print("📋 Fetching recent memos from Firestore...")
        
        # Get most recent memo
        query = db.collection("ingestionResults").order_by("timestamp", direction=firestore.Query.DESCENDING).limit(1)
        docs = list(query.stream())
        
        if not docs:
            print("❌ No memos found in Firestore. Use test_without_firestore() instead.")
            return
        
        test_doc = docs[0]
        memo_id = test_doc.id
        memo_data = test_doc.to_dict()
        
        print(f"✅ Found memo: {memo_id}")
        print(f"   Company: {memo_data.get('memo_1', {}).get('title', 'Unknown')}\n")
        
        print("🔄 Running enrichment + validation...")
        print("   This will:")
        print("   1. Fetch memo_1 data from Firestore")
        print("   2. Enrich missing fields")
        print("   3. Validate enriched data using Perplexity API")
        print("   4. Save to memo1_validated collection\n")
        
        start_time = datetime.now()
        result = await agent.enrich_memo(memo_id, "memo_1")
        total_time = (datetime.now() - start_time).total_seconds()
        
        print(f"\n✅ Enrichment + Validation completed in {total_time:.2f} seconds\n")
        
        # Display results
        print("="*70)
        print("📊 ENRICHMENT + VALIDATION RESULTS")
        print("="*70 + "\n")
        
        print(f"Status: {result.get('status', 'unknown')}")
        print(f"Fields Enriched: {result.get('fields_enriched_count', 0)}")
        print(f"Missing Fields Identified: {result.get('missing_fields_count', 0)}")
        
        validation_results = result.get("validation_results")
        if validation_results:
            print(f"\nValidation:")
            print(f"  Method: {validation_results.get('validation_method', 'unknown')}")
            print(f"  Overall Score: {validation_results.get('overall_validation_score', 0.0):.2f}/1.0")
            print(f"  Categories Validated: {validation_results.get('categories_validated', 0)}/10")
            print(f"  Success Rate: {validation_results.get('perplexity_success_rate', 'N/A')}")
            
            # Show which categories were validated
            validated = validation_results.get('validated_categories', [])
            if validated:
                print(f"\n  ✅ Validated Categories:")
                for cat in validated:
                    print(f"     - {cat}")
        
        print(f"\n💾 Results saved to memo1_validated/{memo_id}")
        
    except Exception as e:
        print(f"❌ Firestore test failed: {e}")
        import traceback
        traceback.print_exc()

def main():
    """Main test function"""
    print("\n🚀 Veritas Validation Framework - Local Testing")
    print("="*70)
    
    # Check if running in test mode
    test_mode = sys.argv[1] if len(sys.argv) > 1 else "local"
    
    if test_mode == "firestore":
        # Test with actual Firestore data
        asyncio.run(test_with_firestore_memo())
    else:
        # Test with sample data (no Firestore required)
        asyncio.run(test_validation_framework_local())
    
    print("\n✅ Testing complete!\n")

if __name__ == "__main__":
    main()

