#!/bin/bash

# Setup script for Perplexity API key
echo "🔧 Setting up Perplexity API Key for Data Enrichment"
echo "=================================================="
echo ""

# Check if PERPLEXITY_API_KEY is already set
if [ -n "$PERPLEXITY_API_KEY" ]; then
    echo "✅ PERPLEXITY_API_KEY is already set"
    echo "Key preview: ${PERPLEXITY_API_KEY:0:10}..."
else
    echo "❌ PERPLEXITY_API_KEY is not set"
    echo ""
    echo "📋 To get your Perplexity API key:"
    echo "1. Go to https://www.perplexity.ai/settings/api"
    echo "2. Sign up for an account"
    echo "3. Copy your API key"
    echo ""
    echo "🔑 Then run one of these commands:"
    echo ""
    echo "Option 1 - Set for current session:"
    echo "export PERPLEXITY_API_KEY='your_api_key_here'"
    echo ""
    echo "Option 2 - Set permanently in your shell profile:"
    echo "echo 'export PERPLEXITY_API_KEY=\"your_api_key_here\"' >> ~/.zshrc"
    echo "source ~/.zshrc"
    echo ""
    echo "Option 3 - Set in Cloud Functions (recommended for production):"
    echo "gcloud secrets create PERPLEXITY_API_KEY --data-file=- <<< 'your_api_key_here'"
    echo ""
fi

echo ""
echo "🧪 After setting the API key, test the enrichment:"
echo "cd functions && python test_perplexity_vertex_enrichment.py"
echo ""
echo "📊 The system will then:"
echo "1. Extract data from uploaded PDFs"
echo "2. Identify missing fields (like 'Not specified')"
echo "3. Use Perplexity AI to search the internet for missing data"
echo "4. Enrich the memo with real company information"
echo "5. Provide confidence scores and sources"
echo ""
echo "✅ This will fix the 'Not specified' issue you're seeing!"
