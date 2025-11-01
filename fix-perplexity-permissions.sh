#!/bin/bash

echo "🔧 Fixing Perplexity API Key Permissions"
echo "========================================"
echo ""

PROJECT_ID="veritas-472301"
SECRET_NAME="PERPLEXITY_API_KEY"
REGION="asia-south1"
SERVICE_ACCOUNT="${PROJECT_ID}@appspot.gserviceaccount.com"

echo "1️⃣ Granting Cloud Functions service account access to secret..."
gcloud secrets add-iam-policy-binding $SECRET_NAME \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor" \
    --project=$PROJECT_ID

if [ $? -eq 0 ]; then
    echo "✅ Permissions granted successfully"
else
    echo "❌ Failed to grant permissions"
    exit 1
fi

echo ""
echo "2️⃣ Verifying permissions..."
POLICIES=$(gcloud secrets get-iam-policy $SECRET_NAME --project=$PROJECT_ID --format=json)
if echo "$POLICIES" | grep -q "$SERVICE_ACCOUNT"; then
    echo "✅ Service account has access confirmed"
else
    echo "❌ Permissions not applied correctly"
    exit 1
fi

echo ""
echo "3️⃣ Testing API key validity..."
echo "Accessing latest secret version..."
API_KEY=$(gcloud secrets versions access latest --secret=$SECRET_NAME --project=$PROJECT_ID 2>&1)

if [ $? -ne 0 ]; then
    echo "❌ Failed to access secret. Error: $API_KEY"
    exit 1
fi

API_KEY_PREVIEW="${API_KEY:0:12}..."
echo "API Key preview: $API_KEY_PREVIEW"

if [[ ! "$API_KEY" == "pplx-"* ]]; then
    echo "⚠️  WARNING: API key does not start with 'pplx-'. This may be invalid."
fi

echo ""
echo "4️⃣ Testing API key with Perplexity API..."
TEST_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "https://api.perplexity.ai/chat/completions" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "model": "sonar",
        "messages": [{"role": "user", "content": "test"}],
        "max_tokens": 10
    }' 2>&1)

HTTP_CODE=$(echo "$TEST_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$TEST_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "200" ]; then
    echo "✅ API key is VALID and working!"
elif [ "$HTTP_CODE" == "401" ]; then
    echo "❌ API key is INVALID or EXPIRED"
    echo ""
    echo "Please get a new API key from: https://www.perplexity.ai/settings/api"
    echo ""
    echo "Then update the secret with:"
    echo "echo 'YOUR_NEW_API_KEY' | gcloud secrets versions add $SECRET_NAME --project=$PROJECT_ID --data-file=-"
elif [ "$HTTP_CODE" == "429" ]; then
    echo "⚠️  API key is valid but rate limit hit (429). Key works!"
else
    echo "⚠️  Unexpected response code: $HTTP_CODE"
    echo "Response: ${RESPONSE_BODY:0:200}..."
fi

echo ""
echo "5️⃣ Verifying Cloud Functions are configured to use the secret..."
echo ""
echo "Checking process_ingestion_task..."
INGESTION_SECRETS=$(gcloud functions describe process_ingestion_task \
    --region=$REGION \
    --gen2 \
    --project=$PROJECT_ID \
    --format="value(serviceConfig.secretEnvironmentVariables)" 2>/dev/null)

if echo "$INGESTION_SECRETS" | grep -q "PERPLEXITY_API_KEY"; then
    echo "✅ process_ingestion_task has secret configured"
else
    echo "❌ process_ingestion_task missing secret - redeploy needed"
fi

echo ""
echo "Checking process_diligence_task..."
DILIGENCE_SECRETS=$(gcloud functions describe process_diligence_task \
    --region=$REGION \
    --gen2 \
    --project=$PROJECT_ID \
    --format="value(serviceConfig.secretEnvironmentVariables)" 2>/dev/null)

if echo "$DILIGENCE_SECRETS" | grep -q "PERPLEXITY_API_KEY"; then
    echo "✅ process_diligence_task has secret configured"
else
    echo "❌ process_diligence_task missing secret - redeploy needed"
fi

echo ""
echo "========================================"
echo "📋 Summary:"
echo "- IAM permissions: ✅ Fixed"
echo "- API key validity: Check output above"
echo "- Function configuration: Check output above"
echo ""
echo "If API key is invalid, update it and redeploy functions."
echo "========================================"


