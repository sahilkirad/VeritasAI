#!/bin/bash

# Monitor Perplexity + Vertex AI Enrichment Deployment
# This script checks the deployment status and logs

echo "🔍 Monitoring Perplexity + Vertex AI Enrichment Deployment"
echo "========================================================"

# Check if function exists
echo "📋 Checking function deployment status..."
gcloud functions describe intake-agent \
  --region=us-central1 \
  --gen2 \
  --format="table(name,status,updateTime)" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Function is deployed"
else
    echo "❌ Function not found. Please deploy first."
    exit 1
fi

echo ""
echo "🔐 Checking secret access..."
SECRET_ACCESS=$(gcloud functions describe intake-agent \
  --region=us-central1 \
  --gen2 \
  --format="value(serviceConfig.secretEnvironmentVariables)" 2>/dev/null)

if [[ $SECRET_ACCESS == *"PERPLEXITY_API_KEY"* ]]; then
    echo "✅ Secret access configured"
else
    echo "❌ Secret access not configured"
    echo "Run: gcloud secrets add-iam-policy-binding PERPLEXITY_API_KEY --member=\"serviceAccount:veritas-472301@appspot.gserviceaccount.com\" --role=\"roles/secretmanager.secretAccessor\""
fi

echo ""
echo "📊 Function configuration:"
gcloud functions describe intake-agent \
  --region=us-central1 \
  --gen2 \
  --format="table(serviceConfig.runtime,serviceConfig.memory,serviceConfig.timeout,serviceConfig.maxInstances)"

echo ""
echo "📝 Recent logs (last 20 entries):"
gcloud functions logs read intake-agent \
  --region=us-central1 \
  --gen2 \
  --limit=20 \
  --format="table(timestamp,severity,textPayload)"

echo ""
echo "🔍 Looking for enrichment-specific logs..."
gcloud functions logs read intake-agent \
  --region=us-central1 \
  --gen2 \
  --limit=50 \
  --filter="textPayload:\"Perplexity\" OR textPayload:\"enrichment\" OR textPayload:\"Vertex AI\"" \
  --format="table(timestamp,textPayload)"

echo ""
echo "💰 Cost monitoring:"
echo "To set up budget alerts:"
echo "1. Go to: https://console.cloud.google.com/billing"
echo "2. Create budget alert for:"
echo "   - Perplexity API usage (~$0.01-0.06 per enrichment)"
echo "   - Vertex AI API usage (~$0.001-0.005 per enrichment)"
echo "   - Cloud Functions execution time"

echo ""
echo "🧪 To test the deployment:"
echo "python functions/test_deployed_enrichment.py"

echo ""
echo "📊 Function URL:"
echo "https://us-central1-veritas-472301.cloudfunctions.net/intake-agent"

echo ""
echo "✅ Monitoring complete!"
