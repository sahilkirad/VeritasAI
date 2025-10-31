#!/bin/bash

# Script to update PERPLEXITY_API_KEY in Google Secret Manager

PROJECT_ID="veritas-472301"
SECRET_NAME="PERPLEXITY_API_KEY"

echo "🔧 Updating PERPLEXITY_API_KEY secret in Google Secret Manager..."
echo "Project: $PROJECT_ID"
echo "Secret: $SECRET_NAME"
echo ""

# Check if API key is provided as argument
if [ -z "$1" ]; then
    echo "❌ Error: Please provide the Perplexity API key as an argument"
    echo ""
    echo "Usage:"
    echo "  ./update_perplexity_secret.sh pplx-YOUR-API-KEY"
    echo ""
    echo "To get your Perplexity API key:"
    echo "  1. Go to https://www.perplexity.ai/settings/api"
    echo "  2. Copy your API key (should start with 'pplx-')"
    echo "  3. Run this script with the key"
    exit 1
fi

API_KEY="$1"

# Validate API key format
if [[ ! $API_KEY == pplx-* ]]; then
    echo "⚠️  Warning: API key does not start with 'pplx-'. Format may be invalid."
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if secret exists
if ! gcloud secrets describe $SECRET_NAME --project=$PROJECT_ID > /dev/null 2>&1; then
    echo "Secret does not exist. Creating it..."
    echo -n "$API_KEY" | gcloud secrets create $SECRET_NAME --data-file=- --project=$PROJECT_ID
    echo "✅ Secret created successfully"
else
    echo "Secret exists. Adding new version..."
    echo -n "$API_KEY" | gcloud secrets versions add $SECRET_NAME --data-file=- --project=$PROJECT_ID
    echo "✅ Secret updated successfully"
fi

echo ""
echo "Preview of updated secret:"
PREVIEW="${API_KEY:0:8}...${API_KEY: -4}"
echo "  $PREVIEW"

echo ""
echo "📝 Next steps:"
echo "  1. The secret has been updated in Google Secret Manager"
echo "  2. Redeploy your Cloud Functions to use the new secret:"
echo "     cd functions && firebase deploy --only functions"
echo ""
echo "  3. Verify the secret is accessible:"
echo "     gcloud functions describe <function-name> --region=asia-south1 --project=$PROJECT_ID"
echo "     (Check the 'secretEnvironmentVariables' section)"

