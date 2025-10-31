#!/bin/bash

# Update Cloud Functions with Perplexity API Key
echo "🔧 Updating Cloud Functions with Perplexity API Key"
echo "================================================="
echo ""

# Perplexity API Key should be set as environment variable
# export PERPLEXITY_API_KEY='your_api_key_here'

echo "📋 Updating Cloud Functions with Perplexity enrichment..."
echo ""

# Update the main Cloud Functions
echo "1. Updating process_ingestion_task function..."
gcloud functions deploy process_ingestion_task \
  --gen2 \
  --runtime=python312 \
  --region=asia-south1 \
  --source=functions \
  --entry-point=process_ingestion_task \
  --trigger-topic=document-ingestion-topic \
  --timeout=540s \
  --memory=1GB \
  --set-secrets=PERPLEXITY_API_KEY=PERPLEXITY_API_KEY:latest \
  --set-env-vars=GOOGLE_CLOUD_PROJECT=veritas-472301,VERTEX_AI_LOCATION=asia-south1

echo ""
echo "2. Updating run_diligence function..."
gcloud functions deploy run_diligence \
  --gen2 \
  --runtime=python312 \
  --region=asia-south1 \
  --source=functions \
  --entry-point=run_diligence \
  --trigger-http \
  --allow-unauthenticated \
  --timeout=300s \
  --memory=1GB \
  --set-secrets=PERPLEXITY_API_KEY=PERPLEXITY_API_KEY:latest \
  --set-env-vars=GOOGLE_CLOUD_PROJECT=veritas-472301,VERTEX_AI_LOCATION=asia-south1

echo ""
echo "3. Updating query_diligence function..."
gcloud functions deploy query_diligence \
  --gen2 \
  --runtime=python312 \
  --region=asia-south1 \
  --source=functions \
  --entry-point=query_diligence \
  --trigger-http \
  --allow-unauthenticated \
  --timeout=60s \
  --memory=1GB \
  --set-secrets=PERPLEXITY_API_KEY=PERPLEXITY_API_KEY:latest \
  --set-env-vars=GOOGLE_CLOUD_PROJECT=veritas-472301,VERTEX_AI_LOCATION=asia-south1

echo ""
echo "✅ Cloud Functions updated with Perplexity API Key!"
echo ""
echo "🧪 Test the enrichment by:"
echo "1. Go to http://localhost:3002"
echo "2. Sign up as a founder"
echo "3. Upload a PDF pitch deck"
echo "4. Wait for processing (2-5 minutes)"
echo "5. Check the results - fields should be enriched with real data!"
echo ""
echo "📊 The system will now:"
echo "- Extract data from PDFs"
echo "- Identify missing fields"
echo "- Use Perplexity AI to search the internet"
echo "- Enrich with real company information"
echo "- Provide confidence scores and sources"
