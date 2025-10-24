#!/usr/bin/env python3
"""
Test script for Perplexity AI enrichment validation
Compares before/after enrichment quality and generates reports
"""

import os
import json
import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
from google.cloud import firestore

# Import the enhanced Perplexity service
from services.perplexity_service import PerplexitySearchService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnrichmentTester:
    """Test and validate Perplexity AI enrichment results"""
    
    def __init__(self, project_id: str = "veritas-472301"):
        self.project_id = project_id
        self.db = firestore.Client(project=project_id)
        self.perplexity_service = PerplexitySearchService(project=project_id)
        
    def fetch_existing_results(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Fetch existing ingestion results from Firestore"""
        try:
            results_ref = self.db.collection('ingestionResults')
            docs = results_ref.limit(limit).stream()
            
            results = []
            for doc in docs:
                data = doc.to_dict()
                data['doc_id'] = doc.id
                results.append(data)
                
            logger.info(f"Fetched {len(results)} existing results")
            return results
            
        except Exception as e:
            logger.error(f"Error fetching existing results: {e}")
            return []
    
    def analyze_field_coverage(self, memo_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze field coverage in memo data"""
        critical_fields = [
            "company_stage", "headquarters", "founded_date", 
            "current_revenue", "revenue_growth_rate", "burn_rate", "runway",
            "amount_raising", "post_money_valuation", "lead_investor"
        ]
        
        important_fields = [
            "customer_acquisition_cost", "lifetime_value", "gross_margin",
            "team_size", "key_team_members", "advisory_board",
            "go_to_market", "sales_strategy", "partnerships",
            "use_of_funds", "financial_projections", "potential_acquirers"
        ]
        
        def is_field_populated(field: str) -> bool:
            value = memo_data.get(field)
            if not value:
                return False
            if isinstance(value, str):
                return value.strip() not in ["", "Not specified", "Not disclosed", "N/A", "None", "Pending", "Not available"]
            return True
        
        critical_coverage = sum(1 for field in critical_fields if is_field_populated(field))
        important_coverage = sum(1 for field in important_fields if is_field_populated(field))
        
        return {
            "critical_fields_total": len(critical_fields),
            "critical_fields_populated": critical_coverage,
            "critical_coverage_percent": (critical_coverage / len(critical_fields)) * 100,
            "important_fields_total": len(important_fields),
            "important_fields_populated": important_coverage,
            "important_coverage_percent": (important_coverage / len(important_fields)) * 100,
            "total_fields_analyzed": len(critical_fields) + len(important_fields),
            "total_fields_populated": critical_coverage + important_coverage,
            "overall_coverage_percent": ((critical_coverage + important_coverage) / (len(critical_fields) + len(important_fields))) * 100
        }
    
    async def test_enrichment_on_sample(self, memo_data: Dict[str, Any], company_name: str) -> Dict[str, Any]:
        """Test enrichment on a single memo sample"""
        logger.info(f"Testing enrichment for {company_name}")
        
        # Analyze before enrichment
        before_analysis = self.analyze_field_coverage(memo_data)
        
        # Run enrichment
        start_time = datetime.now()
        enriched_memo = await self.perplexity_service.enrich_missing_fields(memo_data)
        enrichment_time = (datetime.now() - start_time).total_seconds()
        
        # Analyze after enrichment
        after_analysis = self.analyze_field_coverage(enriched_memo)
        
        # Extract enrichment metadata
        enrichment_metadata = enriched_memo.get("enrichment_metadata", {})
        enriched_fields = enrichment_metadata.get("fields_enriched", [])
        confidence_scores = enrichment_metadata.get("confidence_scores", {})
        sources = enrichment_metadata.get("sources", {})
        
        return {
            "company_name": company_name,
            "enrichment_time_seconds": enrichment_time,
            "before_analysis": before_analysis,
            "after_analysis": after_analysis,
            "enriched_fields": enriched_fields,
            "confidence_scores": confidence_scores,
            "sources": sources,
            "enrichment_success": enriched_memo.get("enrichment_success", False),
            "enrichment_count": enriched_memo.get("enrichment_count", 0),
            "improvement": {
                "critical_coverage_improvement": after_analysis["critical_coverage_percent"] - before_analysis["critical_coverage_percent"],
                "important_coverage_improvement": after_analysis["important_coverage_percent"] - before_analysis["important_coverage_percent"],
                "overall_coverage_improvement": after_analysis["overall_coverage_percent"] - before_analysis["overall_coverage_percent"]
            }
        }
    
    async def run_comprehensive_test(self, sample_size: int = 5) -> Dict[str, Any]:
        """Run comprehensive enrichment testing"""
        logger.info(f"Starting comprehensive enrichment test with {sample_size} samples")
        
        # Fetch existing results
        existing_results = self.fetch_existing_results(sample_size)
        
        if not existing_results:
            logger.warning("No existing results found for testing")
            return {"error": "No existing results found"}
        
        test_results = []
        total_enrichment_time = 0
        successful_enrichments = 0
        
        for result in existing_results:
            memo_1 = result.get("memo_1", {})
            company_name = memo_1.get("title", "Unknown Company")
            
            if not memo_1:
                logger.warning(f"Skipping {company_name} - no memo_1 data")
                continue
            
            try:
                test_result = await self.test_enrichment_on_sample(memo_1, company_name)
                test_results.append(test_result)
                total_enrichment_time += test_result["enrichment_time_seconds"]
                
                if test_result["enrichment_success"]:
                    successful_enrichments += 1
                    
            except Exception as e:
                logger.error(f"Error testing enrichment for {company_name}: {e}")
                test_results.append({
                    "company_name": company_name,
                    "error": str(e),
                    "enrichment_success": False
                })
        
        # Generate summary statistics
        summary = self.generate_test_summary(test_results, total_enrichment_time, successful_enrichments)
        
        return {
            "test_timestamp": datetime.now().isoformat(),
            "sample_size": len(test_results),
            "test_results": test_results,
            "summary": summary
        }
    
    def generate_test_summary(self, test_results: List[Dict[str, Any]], total_time: float, successful_count: int) -> Dict[str, Any]:
        """Generate summary statistics from test results"""
        if not test_results:
            return {"error": "No test results to summarize"}
        
        # Calculate averages
        successful_results = [r for r in test_results if r.get("enrichment_success", False)]
        
        if not successful_results:
            return {
                "success_rate": 0.0,
                "average_enrichment_time": 0.0,
                "average_improvement": 0.0,
                "total_tests": len(test_results),
                "successful_tests": 0
            }
        
        avg_enrichment_time = sum(r.get("enrichment_time_seconds", 0) for r in successful_results) / len(successful_results)
        avg_critical_improvement = sum(r.get("improvement", {}).get("critical_coverage_improvement", 0) for r in successful_results) / len(successful_results)
        avg_important_improvement = sum(r.get("improvement", {}).get("important_coverage_improvement", 0) for r in successful_results) / len(successful_results)
        avg_overall_improvement = sum(r.get("improvement", {}).get("overall_coverage_improvement", 0) for r in successful_results) / len(successful_results)
        
        # Field enrichment statistics
        all_enriched_fields = []
        all_confidence_scores = []
        
        for result in successful_results:
            enriched_fields = result.get("enriched_fields", [])
            confidence_scores = result.get("confidence_scores", {})
            
            all_enriched_fields.extend(enriched_fields)
            all_confidence_scores.extend(confidence_scores.values())
        
        field_frequency = {}
        for field in all_enriched_fields:
            field_frequency[field] = field_frequency.get(field, 0) + 1
        
        return {
            "success_rate": (successful_count / len(test_results)) * 100,
            "average_enrichment_time": avg_enrichment_time,
            "average_critical_improvement": avg_critical_improvement,
            "average_important_improvement": avg_important_improvement,
            "average_overall_improvement": avg_overall_improvement,
            "total_tests": len(test_results),
            "successful_tests": successful_count,
            "total_enrichment_time": total_time,
            "most_frequently_enriched_fields": sorted(field_frequency.items(), key=lambda x: x[1], reverse=True)[:10],
            "average_confidence_score": sum(all_confidence_scores) / len(all_confidence_scores) if all_confidence_scores else 0,
            "total_fields_enriched": len(all_enriched_fields)
        }
    
    def save_test_report(self, test_results: Dict[str, Any], filename: str = None) -> str:
        """Save test results to a JSON file"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"enrichment_test_report_{timestamp}.json"
        
        filepath = os.path.join(os.getcwd(), filename)
        
        try:
            with open(filepath, 'w') as f:
                json.dump(test_results, f, indent=2, default=str)
            
            logger.info(f"Test report saved to: {filepath}")
            return filepath
            
        except Exception as e:
            logger.error(f"Error saving test report: {e}")
            return ""

async def main():
    """Main test function"""
    print("🚀 Starting Perplexity AI Enrichment Testing")
    print("=" * 50)
    
    # Initialize tester
    tester = EnrichmentTester()
    
    # Check if Perplexity service is enabled
    if not tester.perplexity_service.enabled:
        print("❌ Perplexity service is not enabled. Please set PERPLEXITY_API_KEY environment variable.")
        return
    
    print("✅ Perplexity service is enabled")
    print("✅ Vertex AI integration available:", tester.perplexity_service.vertex_model is not None)
    
    # Run comprehensive test
    print("\n📊 Running comprehensive enrichment test...")
    test_results = await tester.run_comprehensive_test(sample_size=3)  # Start with 3 samples
    
    if "error" in test_results:
        print(f"❌ Test failed: {test_results['error']}")
        return
    
    # Display results
    summary = test_results["summary"]
    print(f"\n📈 Test Results Summary:")
    print(f"  Success Rate: {summary['success_rate']:.1f}%")
    print(f"  Average Enrichment Time: {summary['average_enrichment_time']:.2f}s")
    print(f"  Average Critical Field Improvement: {summary['average_critical_improvement']:.1f}%")
    print(f"  Average Important Field Improvement: {summary['average_important_improvement']:.1f}%")
    print(f"  Average Overall Improvement: {summary['average_overall_improvement']:.1f}%")
    print(f"  Total Fields Enriched: {summary['total_fields_enriched']}")
    print(f"  Average Confidence Score: {summary['average_confidence_score']:.2f}")
    
    # Show most frequently enriched fields
    if summary['most_frequently_enriched_fields']:
        print(f"\n🏆 Most Frequently Enriched Fields:")
        for field, count in summary['most_frequently_enriched_fields'][:5]:
            print(f"  {field}: {count} times")
    
    # Save detailed report
    report_path = tester.save_test_report(test_results)
    if report_path:
        print(f"\n💾 Detailed report saved to: {report_path}")
    
    print("\n✅ Enrichment testing completed!")

if __name__ == "__main__":
    asyncio.run(main())
