#!/bin/bash

# Script to verify and update PERPLEXITY_API_KEY in Google Secret Manager

PROJECT_ID="veritas-472301"
SECRET_NAME="PERPLEXITY_API_KEY"

echo "🔍 Verifying PERPLEXITY_API_KEY secret in Google Secret Manager..."
echo "Project: $PROJECT_ID"
echo "Secret: $SECRET_NAME"
echo ""

# Check if secret exists
echo "1. Checking if secret exists..."
if gcloud secrets describe $SECRET_NAME --project=$PROJECT_ID > /dev/null 2>&1; then
    echo "✅ Secret $SECRET_NAME exists"
    
    # Get the latest version
    echo ""
    echo "2. Checking latest secret version..."
    LATEST_VERSION=$(gcloud secrets versions list $SECRET_NAME --project=$PROJECT_ID --limit=1 --format="value(name)" | head -1)
    echo "Latest version: $LATEST_VERSION"
    
    # Preview the secret (first 8 and last 4 characters)
    echo ""
    echo "3. Previewing secret value (first 8 and last 4 chars)..."
    SECRET_VALUE=$(gcloud secrets versions access $LATEST_VERSION --secret=$SECRET_NAME --project=$PROJECT_ID)
    PREVIEW="${SECRET_VALUE:0:8}...${SECRET_VALUE: -4}"
    echo "Secret preview: $PREVIEW"
    echo "Secret length: ${#SECRET_VALUE}"
    
    # Check format
    if [[ $SECRET_VALUE == pplx-* ]]; then
        echo "✅ Secret format is valid (starts with 'pplx-')"
    else
        echo "⚠️  Warning: Secret does not start with 'pplx-'. Format may be invalid."
    fi
    
else
    echo "❌ Secret $SECRET_NAME does not exist"
    echo ""
    echo "To create the secret, run:"
    echo "  echo -n 'your-perplexity-api-key' | gcloud secrets create $SECRET_NAME --data-file=- --project=$PROJECT_ID"
    exit 1
fi

echo ""
echo "4. Checking Cloud Function access to secret..."
echo "   (Make sure the Cloud Function has 'secretAccessor' role)"

echo ""
echo "5. To update the secret with a new API key:"
echo "   echo -n 'pplx-YOUR-NEW-API-KEY' | gcloud secrets versions add $SECRET_NAME --data-file=- --project=$PROJECT_ID"

echo ""
echo "6. After updating, redeploy the Cloud Functions:"
echo "   cd functions && firebase deploy --only functions"

echo ""
echo "✅ Verification complete!"

