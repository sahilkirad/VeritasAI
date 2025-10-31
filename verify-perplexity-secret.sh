#!/bin/bash

echo "🔍 Verifying Perplexity API Key Secret Configuration"
echo "==================================================="
echo ""

PROJECT_ID="veritas-472301"
SECRET_NAME="PERPLEXITY_API_KEY"
REGION="asia-south1"

echo "1️⃣ Checking if secret exists..."
SECRET_EXISTS=$(gcloud secrets describe $SECRET_NAME --project=$PROJECT_ID 2>&1)
if [ $? -eq 0 ]; then
    echo "✅ Secret exists: $SECRET_NAME"
else
    echo "❌ Secret does not exist. Creating it..."
    echo "Please enter your Perplexity API key:"
    read -s API_KEY
    echo "$API_KEY" | gcloud secrets create $SECRET_NAME --project=$PROJECT_ID --data-file=-
    exit 0
fi

echo ""
echo "2️⃣ Checking secret versions..."
VERSIONS=$(gcloud secrets versions list $SECRET_NAME --project=$PROJECT_ID --format="value(name)" --limit=1)
LATEST_VERSION=$(echo "$VERSIONS" | head -n 1)
echo "Latest version: $LATEST_VERSION"

echo ""
echo "3️⃣ Verifying API key format (first 8 chars only)..."
API_KEY_PREVIEW=$(gcloud secrets versions access $LATEST_VERSION --secret=$SECRET_NAME --project=$PROJECT_ID | cut -c1-8)
echo "API Key preview: $API_KEY_PREVIEW..."

if [[ "$API_KEY_PREVIEW" == "pplx-"* ]]; then
    echo "✅ API key format is correct (starts with 'pplx-')"
else
    echo "⚠️  API key format may be incorrect (should start with 'pplx-')"
fi

echo ""
echo "4️⃣ Checking Cloud Functions service account permissions..."
FUNCTION_SERVICE_ACCOUNT="${PROJECT_ID}@appspot.gserviceaccount.com"

echo "Service account: $FUNCTION_SERVICE_ACCOUNT"

# Check if service account has access
POLICIES=$(gcloud secrets get-iam-policy $SECRET_NAME --project=$PROJECT_ID 2>&1)

if echo "$POLICIES" | grep -q "$FUNCTION_SERVICE_ACCOUNT"; then
    echo "✅ Service account has access to secret"
else
    echo "❌ Service account does NOT have access to secret"
    echo ""
    echo "Granting access..."
    gcloud secrets add-iam-policy-binding $SECRET_NAME \
        --member="serviceAccount:$FUNCTION_SERVICE_ACCOUNT" \
        --role="roles/secretmanager.secretAccessor" \
        --project=$PROJECT_ID
    echo "✅ Access granted"
fi

echo ""
echo "5️⃣ Checking Cloud Functions configuration..."
echo "Checking process_ingestion_task..."
gcloud functions describe process_ingestion_task \
    --region=$REGION \
    --gen2 \
    --project=$PROJECT_ID \
    --format="value(serviceConfig.secretEnvironmentVariables)" 2>/dev/null | grep -q "PERPLEXITY_API_KEY" && \
    echo "✅ process_ingestion_task has secret configured" || \
    echo "❌ process_ingestion_task missing secret configuration"

echo "Checking process_diligence_task..."
gcloud functions describe process_diligence_task \
    --region=$REGION \
    --gen2 \
    --project=$PROJECT_ID \
    --format="value(serviceConfig.secretEnvironmentVariables)" 2>/dev/null | grep -q "PERPLEXITY_API_KEY" && \
    echo "✅ process_diligence_task has secret configured" || \
    echo "❌ process_diligence_task missing secret configuration"

echo ""
echo "6️⃣ Testing API key validity..."
echo "Note: This requires a valid API key. If you see errors, the key may be invalid/expired."
TEST_RESULT=$(curl -s -X POST "https://api.perplexity.ai/chat/completions" \
    -H "Authorization: Bearer $(gcloud secrets versions access $LATEST_VERSION --secret=$SECRET_NAME --project=$PROJECT_ID)" \
    -H "Content-Type: application/json" \
    -d '{"model": "sonar", "messages": [{"role": "user", "content": "test"}], "max_tokens": 10}' 2>&1)

if echo "$TEST_RESULT" | grep -q "unauthorized\|401"; then
    echo "❌ API key test failed - Key appears to be invalid or expired"
    echo "Please get a new API key from: https://www.perplexity.ai/settings/api"
    echo ""
    echo "To update the secret:"
    echo "1. Get new API key from Perplexity"
    echo "2. Run: echo 'YOUR_NEW_KEY' | gcloud secrets versions add $SECRET_NAME --project=$PROJECT_ID --data-file=-"
elif echo "$TEST_RESULT" | grep -q "rate_limit\|429"; then
    echo "⚠️  API key test - Rate limit (key is valid but you hit rate limits)"
elif echo "$TEST_RESULT" | grep -q "id\""; then
    echo "✅ API key test passed - Key is valid!"
else
    echo "⚠️  API key test - Could not determine status. Response: ${TEST_RESULT:0:100}..."
fi

echo ""
echo "==================================================="
echo "📋 Summary:"
echo "- If API key format is correct and permissions are set, the issue may be:"
echo "  1. API key is invalid/expired (get new one from Perplexity)"
echo "  2. API key needs to be updated in Secret Manager"
echo "- After fixing, redeploy functions if needed"
echo "==================================================="

