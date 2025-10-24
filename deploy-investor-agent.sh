#!/bin/bash

# Targeted Deployment Script for Investor Recommendation Agent
# Deploys only the investor recommendation agent and vector search functionality

set -e

# Configuration
PROJECT_ID="veritas-472301"
REGION="asia-south1"
FUNCTION_NAME="investor-recommendation-agent"
RUNTIME="python311"
MEMORY="1GB"
TIMEOUT="540s"
MAX_INSTANCES="10"

echo "🎯 Deploying Investor Recommendation Agent (Admin Focus Only)"
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Function: $FUNCTION_NAME"

# Check if gcloud is installed and authenticated
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI is not installed. Please install it first."
    echo "Visit: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Error: Not authenticated with gcloud. Please run 'gcloud auth login'"
    exit 1
fi

# Set the project
echo "📋 Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Enable required APIs for investor recommendations only
echo "🔧 Enabling required APIs for investor recommendations..."
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable aiplatform.googleapis.com
gcloud services enable firestore.googleapis.com

# Create minimal requirements.txt for investor agent only
echo "📦 Creating requirements for investor recommendation agent..."
cat > functions/requirements-investor.txt << EOF
# Core dependencies for investor recommendations
google-cloud-aiplatform>=1.38.0
google-cloud-firestore>=2.13.0
google-cloud-functions-framework>=3.4.0
firebase-functions>=0.1.0
firebase-admin>=6.2.0

# AI/ML dependencies for matching
vertexai>=1.38.0
scikit-learn>=1.3.0
numpy>=1.24.0

# Additional utilities
python-dotenv>=1.0.0
requests>=2.31.0
EOF

# Create a focused HTTP trigger for investor recommendations only
echo "📁 Creating investor recommendation trigger..."
cat > functions/investor_trigger.py << 'EOF'
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
    """HTTP Cloud Function entry point for investor recommendations (Admin Dashboard)."""
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
EOF

# Deploy the investor recommendation function
echo "🚀 Deploying Investor Recommendation Cloud Function..."
gcloud functions deploy $FUNCTION_NAME \
    --gen2 \
    --runtime=$RUNTIME \
    --region=$REGION \
    --source=functions \
    --entry-point=generate_investor_recommendations \
    --trigger-http \
    --allow-unauthenticated \
    --memory=$MEMORY \
    --timeout=$TIMEOUT \
    --max-instances=$MAX_INSTANCES \
    --requirements-file=requirements-investor.txt \
    --set-env-vars="GOOGLE_CLOUD_PROJECT=$PROJECT_ID" \
    --set-env-vars="VERTEX_AI_LOCATION=$REGION"

# Get the function URL
echo "🔗 Getting function URL..."
FUNCTION_URL=$(gcloud functions describe $FUNCTION_NAME --region=$REGION --gen2 --format="value(serviceConfig.uri)")

echo "✅ Investor Recommendation Agent deployed successfully!"
echo "📡 Function URL: $FUNCTION_URL"
echo ""
echo "🧪 Test the investor recommendation function:"
echo "curl -X POST $FUNCTION_URL \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{"
echo "    \"company_id\": \"test-company\","
echo "    \"memo_data\": {"
echo "      \"title\": \"AI Startup\","
echo "      \"sector\": \"AI\","
echo "      \"stage\": \"Seed\","
echo "      \"problem\": \"Business problem\","
echo "      \"solution\": \"AI solution\""
echo "    }"
echo "  }'"
echo ""
echo "📊 Monitor the function:"
echo "https://console.cloud.google.com/functions/list?project=$PROJECT_ID"

# Clean up temporary files
rm -f functions/requirements-investor.txt
rm -f functions/investor_trigger.py

echo "🎉 Investor Recommendation Agent is ready for admin dashboard integration!"
