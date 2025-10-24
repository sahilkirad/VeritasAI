#!/bin/bash

# Deploy Perplexity + Vertex AI Enrichment System
# This script deploys the enhanced intake agent with Perplexity enrichment

echo "🚀 Deploying Perplexity + Vertex AI Enrichment System"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "functions/requirements.txt" ]; then
    echo "❌ Error: Please run this script from the VeritasAI root directory"
    exit 1
fi

# Navigate to functions directory
cd functions

echo "📦 Deploying Cloud Function with Perplexity enrichment..."

# Deploy the intake agent with enrichment
gcloud functions deploy intake-agent \
  --gen2 \
  --runtime=python311 \
  --region=us-central1 \
  --source=. \
  --entry-point=intake_handler \
  --trigger-http \
  --allow-unauthenticated \
  --timeout=540s \
  --memory=2GB \
  --set-secrets=PERPLEXITY_API_KEY=PERPLEXITY_API_KEY:latest \
  --set-env-vars=GOOGLE_CLOUD_PROJECT=veritas-472301,VERTEX_AI_LOCATION=us-central1

if [ $? -eq 0 ]; then
    echo "✅ Cloud Function deployed successfully!"
    echo ""
    echo "🔍 Verifying deployment..."
    
    # Check if the function can access the secret
    echo "Checking secret access..."
    gcloud functions describe intake-agent \
      --region=us-central1 \
      --gen2 \
      --format="value(serviceConfig.secretEnvironmentVariables)"
    
    echo ""
    echo "📊 Function URL:"
    echo "https://us-central1-veritas-472301.cloudfunctions.net/intake-agent"
    
    echo ""
    echo "🔍 To monitor logs, run:"
    echo "gcloud functions logs read intake-agent --region=us-central1 --gen2 --limit=50"
    
    echo ""
    echo "🧪 To test the deployment, run:"
    echo "python test_deployed_enrichment.py"
    
else
    echo "❌ Deployment failed!"
    echo "Check the error messages above and try again."
    exit 1
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Monitor logs for enrichment activity"
echo "2. Test with sample data"
echo "3. Verify 80%+ field coverage"
echo "4. Check <30 seconds enrichment time"
echo ""
echo "✅ Deployment complete!"
