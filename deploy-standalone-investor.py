#!/usr/bin/env python3
"""
Standalone Investor Recommendation Agent Deployment
Deploys the investor recommendation agent as a standalone Cloud Function
"""

import os
import sys
import json
import subprocess
import tempfile
import shutil
from pathlib import Path

def create_standalone_function():
    """Create a standalone function for investor recommendations."""
    
    # Create temporary directory for deployment
    temp_dir = tempfile.mkdtemp()
    print(f"📁 Creating deployment package in: {temp_dir}")
    
    # Copy the investor recommendation agent
    agent_source = Path("functions/agents/investor_recommendation_agent.py")
    if not agent_source.exists():
        print("❌ Error: investor_recommendation_agent.py not found")
        return False
    
    # Create main.py for the standalone function
    main_py_content = '''
import json
import logging
from agents.investor_recommendation_agent import InvestorRecommendationAgent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize the agent
agent = None

def initialize_agent():
    global agent
    if agent is None:
        agent = InvestorRecommendationAgent(project="veritas-472301")
        agent.set_up()
    return agent

def generate_investor_recommendations(request):
    """HTTP Cloud Function entry point for investor recommendations."""
    # Set CORS headers
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
    
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        return ('', 204, headers)
    
    try:
        # Initialize agent
        agent = initialize_agent()
        
        # Parse request data
        if request.method == 'GET':
            return ('Method not allowed. Use POST.', 405, headers)
        
        # Get JSON data from request
        request_json = request.get_json(silent=True)
        if not request_json:
            return (json.dumps({'error': 'No JSON data provided'}), 400, headers)
        
        company_id = request_json.get('company_id')
        memo_data = request_json.get('memo_data')
        founder_profile = request_json.get('founder_profile')
        
        if not company_id or not memo_data:
            return (json.dumps({'error': 'Missing required parameters: company_id and memo_data'}), 400, headers)
        
        logger.info(f"Generating investor recommendations for company: {company_id}")
        
        # Generate recommendations using enhanced agent
        result = agent.run(
            company_id=company_id,
            memo_data=memo_data,
            founder_profile=founder_profile
        )
        
        return (json.dumps(result), 200, headers)
        
    except Exception as e:
        logger.error(f"Error in generate_investor_recommendations: {e}")
        return (json.dumps({'error': str(e)}), 500, headers)
'''
    
    # Write main.py
    with open(os.path.join(temp_dir, "main.py"), "w") as f:
        f.write(main_py_content)
    
    # Create agents directory and copy agent
    agents_dir = os.path.join(temp_dir, "agents")
    os.makedirs(agents_dir, exist_ok=True)
    shutil.copy2(agent_source, os.path.join(agents_dir, "investor_recommendation_agent.py"))
    
    # Create requirements.txt
    requirements_content = '''# Investor Recommendation Agent Dependencies
firebase-functions>=0.2.0
firebase-admin>=6.5.0
google-cloud-aiplatform>=1.49.0
google-cloud-firestore>=2.13.0
google-cloud-functions-framework>=3.4.0
vertexai>=1.38.0
scikit-learn>=1.3.0
numpy>=1.24.0
python-dotenv>=1.0.0
requests>=2.31.0
pydantic>=2.0.0
'''
    
    with open(os.path.join(temp_dir, "requirements.txt"), "w") as f:
        f.write(requirements_content)
    
    print("✅ Standalone function package created")
    return temp_dir

def deploy_with_gcloud(temp_dir):
    """Deploy using gcloud CLI."""
    try:
        # Check if gcloud is available
        result = subprocess.run(['gcloud', '--version'], capture_output=True, text=True)
        if result.returncode != 0:
            print("❌ gcloud CLI not found. Please install Google Cloud CLI first.")
            return False
        
        print("🚀 Deploying with gcloud CLI...")
        
        # Deploy the function
        cmd = [
            'gcloud', 'functions', 'deploy', 'investor-recommendation-agent',
            '--gen2',
            '--runtime=python312',
            '--region=asia-south1',
            '--source=' + temp_dir,
            '--entry-point=generate_investor_recommendations',
            '--trigger-http',
            '--allow-unauthenticated',
            '--memory=1GB',
            '--timeout=540s',
            '--max-instances=10'
        ]
        
        print(f"Running: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Function deployed successfully!")
            print(result.stdout)
            return True
        else:
            print("❌ Deployment failed:")
            print(result.stderr)
            return False
            
    except Exception as e:
        print(f"❌ Error during deployment: {e}")
        return False

def main():
    """Main deployment function."""
    print("🎯 Standalone Investor Recommendation Agent Deployment")
    print("=" * 60)
    
    # Create standalone function package
    temp_dir = create_standalone_function()
    if not temp_dir:
        return 1
    
    try:
        # Deploy with gcloud
        success = deploy_with_gcloud(temp_dir)
        
        if success:
            print("\n🎉 Deployment completed successfully!")
            print("📡 Function URL: https://asia-south1-veritas-472301.cloudfunctions.net/investor-recommendation-agent")
            print("\n🧪 Test the function:")
            print("curl -X POST https://asia-south1-veritas-472301.cloudfunctions.net/investor-recommendation-agent \\")
            print("  -H 'Content-Type: application/json' \\")
            print("  -d '{\"company_id\": \"test\", \"memo_data\": {\"title\": \"Test Startup\"}}'")
        else:
            print("\n❌ Deployment failed. Please check the errors above.")
            return 1
            
    finally:
        # Clean up temporary directory
        shutil.rmtree(temp_dir, ignore_errors=True)
        print(f"🧹 Cleaned up temporary directory: {temp_dir}")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
