#!/usr/bin/env python3
"""
Enhanced Investor Recommendation Agent Test Script
Tests the agent with sample data and validates all functionality
"""

import json
import sys
import os
from datetime import datetime

# Add the functions directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'functions'))

def test_agent_locally():
    """Test the investor recommendation agent locally."""
    print("🧪 Testing Enhanced Investor Recommendation Agent Locally")
    print("=" * 60)
    
    try:
        from agents.investor_recommendation_agent import InvestorRecommendationAgent
        
        # Initialize the agent
        print("📋 Initializing agent...")
        agent = InvestorRecommendationAgent(project="veritas-472301")
        agent.set_up()
        print("✅ Agent initialized successfully")
        
        # Sample startup data
        sample_startup = {
            'title': 'TechStartup AI',
            'industry_category': 'AI',
            'company_stage': 'Seed',
            'amount_raising': '$2M',
            'headquarters': 'San Francisco, CA',
            'problem': 'Small businesses struggle with inefficient inventory management, leading to overstocking and stockouts that cost them 15-20% of their revenue annually.',
            'solution': 'AI-powered inventory optimization platform that uses machine learning to predict demand patterns and automates reordering with 95% accuracy.',
            'business_model': 'SaaS subscription with tiered pricing based on business size and features',
            'market_size': '$2.5B TAM in inventory management software market',
            'traction': '150+ paying customers, $50K MRR, 40% month-over-month growth',
            'team_size': '8',
            'revenue': '$50K',
            'revenue_growth_rate': '40%',
            'competition': ['TradeGecko', 'Cin7', 'inFlow']
        }
        
        # Sample founder profile
        sample_founder = {
            'professionalBackground': 'Former Amazon engineer with 8 years experience in supply chain optimization and machine learning',
            'yearsOfExperience': 8,
            'education': [
                {'degree': 'MS Computer Science', 'institution': 'Stanford University', 'year': '2015'}
            ],
            'previousCompanies': [
                {'company': 'Amazon', 'role': 'Senior Software Engineer', 'duration': '2016-2024'}
            ]
        }
        
        print("\n🏢 Testing with sample startup data...")
        print(f"Company: {sample_startup['title']}")
        print(f"Sector: {sample_startup['industry_category']}")
        print(f"Stage: {sample_startup['company_stage']}")
        
        # Run the agent
        print("\n🤖 Running recommendation generation...")
        start_time = datetime.now()
        
        result = agent.run(
            company_id="test_company_001",
            memo_data=sample_startup,
            founder_profile=sample_founder
        )
        
        end_time = datetime.now()
        processing_time = (end_time - start_time).total_seconds()
        
        print(f"⏱️  Processing time: {processing_time:.2f} seconds")
        print(f"📊 Status: {result.get('status', 'Unknown')}")
        
        if result.get('status') == 'SUCCESS':
            recommendations = result.get('recommendations', [])
            print(f"🎯 Generated {len(recommendations)} recommendations")
            
            # Display top 3 recommendations
            for i, rec in enumerate(recommendations[:3], 1):
                print(f"\n📈 Recommendation #{i}:")
                print(f"   Investor: {rec.get('investorName', 'Unknown')}")
                print(f"   Firm: {rec.get('firmName', 'Unknown')}")
                print(f"   Match Score: {rec.get('matchScore', 0):.1f}%")
                print(f"   Rationale: {rec.get('rationale', 'No rationale provided')[:100]}...")
                
                # Show breakdown
                print(f"   Breakdown:")
                print(f"     - Sector Alignment: {rec.get('sectorAlignment', 0):.1f}%")
                print(f"     - Stage Alignment: {rec.get('stageAlignment', 0):.1f}%")
                print(f"     - Ticket Size Match: {rec.get('ticketSizeMatch', 0):.1f}%")
                print(f"     - Geography Match: {rec.get('geographyMatch', 0):.1f}%")
        else:
            print(f"❌ Agent failed: {result.get('error', 'Unknown error')}")
            return False
            
        print("\n✅ Local test completed successfully!")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Make sure you're in the correct directory and all dependencies are installed.")
        return False
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        return False

def test_agent_remotely():
    """Test the deployed agent via HTTP request."""
    print("\n🌐 Testing Deployed Agent via HTTP")
    print("=" * 60)
    
    import requests
    
    # This would be the actual deployed function URL
    function_url = "https://asia-south1-veritas-472301.cloudfunctions.net/investor-recommendation-agent"
    
    # Sample test data
    test_data = {
        "company_id": "test_company_002",
        "memo_data": {
            "title": "GreenTech Solutions",
            "industry_category": "CleanTech",
            "company_stage": "Series A",
            "amount_raising": "$5M",
            "headquarters": "New York, NY",
            "problem": "Traditional energy systems are inefficient and contribute to climate change",
            "solution": "AI-powered smart grid optimization platform that reduces energy waste by 30%",
            "business_model": "B2B SaaS with performance-based pricing",
            "market_size": "$15B smart grid market",
            "traction": "50+ utility customers, $200K ARR, 60% YoY growth"
        },
        "founder_profile": {
            "professionalBackground": "Former Tesla engineer with 10 years in clean energy",
            "yearsOfExperience": 10
        }
    }
    
    try:
        print(f"📡 Sending request to: {function_url}")
        print(f"📦 Test data: {test_data['memo_data']['title']}")
        
        response = requests.post(
            function_url,
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=60
        )
        
        print(f"📊 Response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Request successful!")
            print(f"📊 Status: {result.get('status', 'Unknown')}")
            print(f"🎯 Recommendations: {len(result.get('recommendations', []))}")
            return True
        else:
            print(f"❌ Request failed: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error: {e}")
        print("Make sure the function is deployed and accessible.")
        return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def main():
    """Run all tests."""
    print("🚀 Enhanced Investor Recommendation Agent Test Suite")
    print("=" * 60)
    
    # Test locally first
    local_success = test_agent_locally()
    
    if local_success:
        print("\n🎉 Local tests passed! Agent is working correctly.")
        
        # Ask if user wants to test remotely
        print("\n🌐 Would you like to test the deployed function? (y/n)")
        choice = input().lower().strip()
        
        if choice == 'y':
            remote_success = test_agent_remotely()
            if remote_success:
                print("\n🎉 All tests passed! The agent is ready for production.")
            else:
                print("\n⚠️  Remote test failed. Check deployment status.")
        else:
            print("\n✅ Local testing completed successfully!")
    else:
        print("\n❌ Local tests failed. Please check the agent implementation.")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
