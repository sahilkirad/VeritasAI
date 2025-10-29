#!/bin/bash

# Setup script for new Firebase project
echo "🚀 Setting up new Firebase project..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if gcloud CLI is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud CLI not found. Please install it first."
    echo "Visit: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

echo "📋 Please provide the following information:"
read -p "New Firebase Project ID: " PROJECT_ID
read -p "New Firebase App Name (default: Veritas): " APP_NAME
APP_NAME=${APP_NAME:-Veritas}

echo "🔧 Configuring Firebase project..."

# Update firebase.json
cp firebase-new-project.json firebase.json
sed -i.bak "s/YOUR_NEW_PROJECT_ID/$PROJECT_ID/g" firebase.json
rm firebase.json.bak

# Update .firebaserc
echo "{\"projects\": {\"default\": \"$PROJECT_ID\"}}" > .firebaserc

echo "🔑 Setting up secrets in Google Secret Manager..."

# Enable Secret Manager API
gcloud services enable secretmanager.googleapis.com --project=$PROJECT_ID

echo "📝 Please add the following secrets to Google Secret Manager:"
echo "1. PERPLEXITY_API_KEY"
echo "2. SENDGRID_API_KEY" 
echo "3. SENDGRID_FROM_EMAIL"
echo ""
echo "Run these commands:"
echo "echo -n 'your-perplexity-key' | gcloud secrets create PERPLEXITY_API_KEY --data-file=- --project=$PROJECT_ID"
echo "echo -n 'your-sendgrid-key' | gcloud secrets create SENDGRID_API_KEY --data-file=- --project=$PROJECT_ID"
echo "echo -n 'your-email@domain.com' | gcloud secrets create SENDGRID_FROM_EMAIL --data-file=- --project=$PROJECT_ID"

echo ""
echo "🔐 Please add the following secrets to GitHub repository:"
echo "Go to: Settings > Secrets and variables > Actions"
echo ""
echo "Required secrets (add _NEW suffix):"
echo "- FIREBASE_PROJECT_ID_NEW: $PROJECT_ID"
echo "- FIREBASE_TOKEN_NEW: (get from firebase login:ci)"
echo "- GCP_SA_KEY_NEW: (service account JSON)"
echo "- NEXT_PUBLIC_FIREBASE_PROJECT_ID_NEW: $PROJECT_ID"
echo "- NEXT_PUBLIC_FIREBASE_API_KEY_NEW: (from Firebase console)"
echo "- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_NEW: $PROJECT_ID.firebaseapp.com"
echo "- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_NEW: $PROJECT_ID.appspot.com"
echo "- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_NEW: (from Firebase console)"
echo "- NEXT_PUBLIC_FIREBASE_APP_ID_NEW: (from Firebase console)"
echo "- NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID_NEW: (from Firebase console)"
echo "- NEXT_PUBLIC_GA_PROPERTY_ID_NEW: (your GA property ID)"
echo "- NEXT_PUBLIC_APP_NAME_NEW: $APP_NAME"
echo "- NEXT_PUBLIC_APP_URL_NEW: https://$PROJECT_ID.web.app"
echo ""
echo "API Endpoints (update after functions are deployed):"
echo "- NEXT_PUBLIC_PROCESS_INGESTION_URL_NEW: https://asia-south1-$PROJECT_ID.cloudfunctions.net/process_ingestion_task"
echo "- NEXT_PUBLIC_ON_FILE_UPLOAD_URL_NEW: https://asia-south1-$PROJECT_ID.cloudfunctions.net/on_file_upload"
echo "- NEXT_PUBLIC_TRIGGER_DILIGENCE_URL_NEW: https://asia-south1-$PROJECT_ID.cloudfunctions.net/trigger_diligence"
echo "- NEXT_PUBLIC_PROCESS_DILIGENCE_URL_NEW: https://asia-south1-$PROJECT_ID.cloudfunctions.net/process_diligence_task"
echo "- NEXT_PUBLIC_SCHEDULE_INTERVIEW_URL_NEW: https://asia-south1-$PROJECT_ID.cloudfunctions.net/schedule_ai_interview"
echo "- NEXT_PUBLIC_RUN_DILIGENCE_URL_NEW: https://asia-south1-$PROJECT_ID.cloudfunctions.net/run_diligence"
echo "- NEXT_PUBLIC_QUERY_DILIGENCE_URL_NEW: https://asia-south1-$PROJECT_ID.cloudfunctions.net/query_diligence"

echo ""
echo "✅ Setup complete! Next steps:"
echo "1. Create the Firebase project: firebase projects:create $PROJECT_ID"
echo "2. Add all the secrets to GitHub"
echo "3. Push this branch: git push origin firebase-new-project"
echo "4. Monitor deployment in GitHub Actions"
