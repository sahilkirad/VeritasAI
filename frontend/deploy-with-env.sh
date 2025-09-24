#!/bin/bash

# Deployment script with correct environment variables
# This script sets the environment variables and builds the frontend

echo "🚀 Setting up environment variables for deployment..."

# Set the correct Cloud Functions URLs
export NEXT_PUBLIC_PROCESS_INGESTION_URL="https://asia-south1-veritas-472301.cloudfunctions.net/process_ingestion_task"
export NEXT_PUBLIC_ON_FILE_UPLOAD_URL="https://on-file-upload-abvgpbhuca-el.a.run.app"
export NEXT_PUBLIC_TRIGGER_DILIGENCE_URL="https://trigger-diligence-abvgpbhuca-el.a.run.app"
export NEXT_PUBLIC_PROCESS_DILIGENCE_URL="https://asia-south1-veritas-472301.cloudfunctions.net/process_diligence_task"
export NEXT_PUBLIC_SCHEDULE_INTERVIEW_URL="https://schedule-ai-interview-abvgpbhuca-el.a.run.app"

# Set Firebase configuration
export NEXT_PUBLIC_FIREBASE_PROJECT_ID="veritas-472301"
export NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="veritas-472301.firebaseapp.com"
export NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="veritas-472301.firebasestorage.app"

# Set analytics and app configuration
export NEXT_PUBLIC_GA_PROPERTY_ID="213025502"
export NEXT_PUBLIC_APP_NAME="Veritas"
export NEXT_PUBLIC_APP_URL="http://localhost:3000"

echo "✅ Environment variables set:"
echo "   NEXT_PUBLIC_ON_FILE_UPLOAD_URL: $NEXT_PUBLIC_ON_FILE_UPLOAD_URL"
echo "   NEXT_PUBLIC_TRIGGER_DILIGENCE_URL: $NEXT_PUBLIC_TRIGGER_DILIGENCE_URL"
echo "   NEXT_PUBLIC_SCHEDULE_INTERVIEW_URL: $NEXT_PUBLIC_SCHEDULE_INTERVIEW_URL"

echo "🔨 Building frontend with correct environment variables..."
npm run build

echo "🎉 Build complete! The frontend now has the correct function URLs."
