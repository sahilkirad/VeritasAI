#!/bin/bash

echo "🧪 Testing Perplexity API Key"
echo "=============================="
echo ""

PROJECT_ID="veritas-472301"
SECRET_NAME="PERPLEXITY_API_KEY"

echo "1️⃣ Retrieving API key from Secret Manager..."
API_KEY=$(gcloud secrets versions access latest --secret=$SECRET_NAME --project=$PROJECT_ID 2>&1)

if [ $? -ne 0 ]; then
    echo "❌ Failed to retrieve secret: $API_KEY"
    exit 1
fi

API_KEY_PREVIEW="${API_KEY:0:12}...${API_KEY: -4}"
echo "API Key preview: $API_KEY_PREVIEW"

if [[ ! "$API_KEY" == "pplx-"* ]]; then
    echo "⚠️  WARNING: API key does not start with 'pplx-'. This may be invalid."
fi

echo ""
echo "2️⃣ Testing API key with Perplexity API..."
echo "Sending test request..."

TEST_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "https://api.perplexity.ai/chat/completions" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "model": "sonar",
        "messages": [{"role": "user", "content": "test"}],
        "max_tokens": 10
    }' 2>&1)

HTTP_CODE=$(echo "$TEST_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
RESPONSE_BODY=$(echo "$TEST_RESPONSE" | grep -v "HTTP_CODE")

echo ""
if [ "$HTTP_CODE" == "200" ]; then
    echo "✅ SUCCESS: API key is VALID and working!"
    echo "Response preview: ${RESPONSE_BODY:0:100}..."
    echo ""
    echo "The 401 errors should stop now. Try uploading a new PDF to test."
elif [ "$HTTP_CODE" == "401" ]; then
    echo "❌ FAILED: API key is INVALID or EXPIRED (HTTP 401)"
    echo ""
    echo "Response: ${RESPONSE_BODY:0:200}..."
    echo ""
    echo "📋 Next Steps:"
    echo "1. Get a new API key from: https://www.perplexity.ai/settings/api"
    echo "2. Update the secret with the new key (see commands below)"
    echo ""
    echo "To update the secret, run:"
    echo "----------------------------------------"
    echo "echo 'YOUR_NEW_API_KEY_HERE' | gcloud secrets versions add $SECRET_NAME --project=$PROJECT_ID --data-file=-"
    echo "----------------------------------------"
elif [ "$HTTP_CODE" == "429" ]; then
    echo "⚠️  Rate limit hit (HTTP 429) - Key is VALID but you've hit rate limits"
    echo "This is temporary - key works!"
elif [ "$HTTP_CODE" == "000" ]; then
    echo "❌ Network error - Could not reach Perplexity API"
    echo "Check your internet connection"
else
    echo "⚠️  Unexpected response: HTTP $HTTP_CODE"
    echo "Response: ${RESPONSE_BODY:0:200}..."
fi

echo ""
echo "=============================="

