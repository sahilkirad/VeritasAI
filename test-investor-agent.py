#!/usr/bin/env python3
"""
Focused Test Script for Investor Recommendation Agent
Tests only the investor recommendation functionality for admin dashboard
"""

import json
import sys
import os
from datetime import datetime

# Add the functions directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'functions'))

def test_investor_agent():
    """Test the investor recommendation agent for admin dashboard."""
    print("🎯 Testing Investor Recommendation Agent (Admin Dashboard Focus)")
    print("=" * 70)
    
    try:
        from agents.investor_recommendation_agent import InvestorRecommendationAgent
        
        # Initialize the agent
        print("📋 Initializing investor recommendation agent...")
        agent = InvestorRecommendationAgent(project="veritas-472301")
        agent.set_up()
        print("✅ Agent initialized successfully")
        
        # Sample startup data for admin dashboard
        sample_startup = {
            'title': 'AI HealthTech Solutions',
            'industry_category': 'HealthTech',
            'company_stage': 'Series A',
            'amount_raising': '$5M',
            'headquarters': 'San Francisco, CA',
            'problem': 'Healthcare providers struggle with inefficient patient data management, leading to delayed diagnoses and poor patient outcomes.',
            'solution': 'AI-powered patient data analytics platform that uses machine learning to identify health patterns and predict potential issues with 92% accuracy.',
            'business_model': 'B2B SaaS with per-provider licensing',
            'market_size': '$8.2B healthcare analytics market',
            'traction': '25+ hospital systems, $180K ARR, 65% YoY growth',
            'team_size': '12',
            'revenue': '$180K',
            'revenue_growth_rate': '65%',
            'competition': ['Epic', 'Cerner', 'Allscripts']
        }
        
        # Sample founder profile
        sample_founder = {
            'professionalBackground': 'Former Google Health engineer with 10 years experience in healthcare AI and data analytics',
            'yearsOfExperience': 10,
            'education': [
                {'degree': 'PhD Computer Science', 'institution': 'MIT', 'year': '2012'}
            ],
            'previousCompanies': [
                {'company': 'Google Health', 'role': 'Senior AI Engineer', 'duration': '2018-2024'},
                {'company': 'Epic Systems', 'role': 'Software Engineer', 'duration': '2014-2018'}
            ]
        }
        
        print("\n🏢 Testing with HealthTech startup data...")
        print(f"Company: {sample_startup['title']}")
        print(f"Sector: {sample_startup['industry_category']}")
        print(f"Stage: {sample_startup['company_stage']}")
        print(f"Funding Ask: {sample_startup['amount_raising']}")
        
        # Run the investor recommendation agent
        print("\n🤖 Running investor recommendation generation...")
        start_time = datetime.now()
        
        result = agent.run(
            company_id="healthtech_001",
            memo_data=sample_startup,
            founder_profile=sample_founder
        )
        
        end_time = datetime.now()
        processing_time = (end_time - start_time).total_seconds()
        
        print(f"⏱️  Processing time: {processing_time:.2f} seconds")
        print(f"📊 Status: {result.get('status', 'Unknown')}")
        
        if result.get('status') == 'SUCCESS':
            recommendations = result.get('recommendations', [])
            print(f"🎯 Generated {len(recommendations)} investor recommendations")
            
            # Display top 3 recommendations with enhanced details
            for i, rec in enumerate(recommendations[:3], 1):
                print(f"\n📈 Investor Recommendation #{i}:")
                print(f"   👤 Investor: {rec.get('investorName', 'Unknown')}")
                print(f"   🏢 Firm: {rec.get('firmName', 'Unknown')}")
                print(f"   🎯 Match Score: {rec.get('matchScore', 0):.1f}%")
                print(f"   💡 Rationale: {rec.get('rationale', 'No rationale provided')[:150]}...")
                
                # Show detailed breakdown
                print(f"   📊 Detailed Breakdown:")
                print(f"     - Sector Alignment: {rec.get('sectorAlignment', 0):.1f}%")
                print(f"     - Stage Alignment: {rec.get('stageAlignment', 0):.1f}%")
                print(f"     - Ticket Size Match: {rec.get('ticketSizeMatch', 0):.1f}%")
                print(f"     - Geography Match: {rec.get('geographyMatch', 0):.1f}%")
                
                # Show network paths if available
                network_paths = rec.get('networkPath', [])
                if network_paths:
                    print(f"     - Network Paths: {len(network_paths)} connections")
                    for path in network_paths[:2]:  # Show first 2 paths
                        print(f"       {path.get('fromId', '')} → {path.get('toId', '')} ({path.get('connectionType', '')})")
        else:
            print(f"❌ Agent failed: {result.get('error', 'Unknown error')}")
            return False
            
        print("\n✅ Investor recommendation test completed successfully!")
        print("🎉 Agent is ready for admin dashboard integration!")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Make sure you're in the correct directory and all dependencies are installed.")
        return False
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        return False

def test_deployed_function():
    """Test the deployed investor recommendation function."""
    print("\n🌐 Testing Deployed Investor Recommendation Function")
    print("=" * 70)
    
    import requests
    
    # This would be the actual deployed function URL
    function_url = "https://asia-south1-veritas-472301.cloudfunctions.net/investor-recommendation-agent"
    
    # Sample test data for admin dashboard
    test_data = {
        "company_id": "admin_test_company",
        "memo_data": {
            "title": "FinTech Innovation",
            "industry_category": "FinTech",
            "company_stage": "Seed",
            "amount_raising": "$2M",
            "headquarters": "New York, NY",
            "problem": "Small businesses struggle with complex financial management",
            "solution": "AI-powered financial management platform for SMBs",
            "business_model": "SaaS subscription with tiered pricing",
            "market_size": "$12B SMB financial services market",
            "traction": "100+ customers, $25K MRR, 50% MoM growth"
        },
        "founder_profile": {
            "professionalBackground": "Former Goldman Sachs analyst with 8 years in fintech",
            "yearsOfExperience": 8
        }
    }
    
    try:
        print(f"📡 Sending request to deployed function...")
        print(f"🏢 Testing with: {test_data['memo_data']['title']}")
        
        response = requests.post(
            function_url,
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=60
        )
        
        print(f"📊 Response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Deployed function working!")
            print(f"📊 Status: {result.get('status', 'Unknown')}")
            recommendations = result.get('recommendations', [])
            print(f"🎯 Recommendations generated: {len(recommendations)}")
            
            if recommendations:
                top_rec = recommendations[0]
                print(f"🏆 Top match: {top_rec.get('investorName')} ({top_rec.get('matchScore', 0):.1f}%)")
            
            return True
        else:
            print(f"❌ Function request failed: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error: {e}")
        print("Make sure the function is deployed and accessible.")
        return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def main():
    """Run investor recommendation tests."""
    print("🚀 Investor Recommendation Agent Test Suite (Admin Dashboard)")
    print("=" * 70)
    
    # Test locally first
    local_success = test_investor_agent()
    
    if local_success:
        print("\n🎉 Local investor recommendation tests passed!")
        print("🤖 Agent is working correctly for admin dashboard.")
        
        # Ask if user wants to test deployed function
        print("\n🌐 Would you like to test the deployed function? (y/n)")
        choice = input().lower().strip()
        
        if choice == 'y':
            remote_success = test_deployed_function()
            if remote_success:
                print("\n🎉 All investor recommendation tests passed!")
                print("✅ Agent is ready for admin dashboard production use.")
            else:
                print("\n⚠️  Deployed function test failed. Check deployment status.")
        else:
            print("\n✅ Local investor recommendation testing completed!")
    else:
        print("\n❌ Local tests failed. Please check the investor recommendation agent.")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
