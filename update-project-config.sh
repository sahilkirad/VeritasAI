#!/bin/bash

echo "🔧 Updating Firebase project configuration..."
echo "Please enter your new Firebase project ID:"
read PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Project ID cannot be empty!"
    exit 1
fi

echo "✅ Updating configuration for project: $PROJECT_ID"

# Update firebase.json
cp firebase-new-project.json firebase.json
sed -i.bak "s/YOUR_NEW_PROJECT_ID/$PROJECT_ID/g" firebase.json
rm firebase.json.bak

# Update .firebaserc
echo "{\"projects\": {\"default\": \"$PROJECT_ID\"}}" > .firebaserc

echo "✅ Configuration updated!"
echo ""
echo "📋 Next steps:"
echo "1. Add GitHub secrets (see the list below)"
echo "2. Push to firebase-new-project branch"
echo "3. Monitor deployment in GitHub Actions"
echo ""
echo "🔑 Required GitHub Secrets (add _NEW suffix):"
echo "FIREBASE_PROJECT_ID_NEW = $PROJECT_ID"
echo "FIREBASE_TOKEN_NEW = (get from: firebase login:ci)"
echo "GCP_SA_KEY_NEW = (service account JSON key)"
echo "NEXT_PUBLIC_FIREBASE_PROJECT_ID_NEW = $PROJECT_ID"
echo "NEXT_PUBLIC_FIREBASE_API_KEY_NEW = (from Firebase console)"
echo "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_NEW = $PROJECT_ID.firebaseapp.com"
echo "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_NEW = $PROJECT_ID.appspot.com"
echo "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_NEW = (from Firebase console)"
echo "NEXT_PUBLIC_FIREBASE_APP_ID_NEW = (from Firebase console)"
echo "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID_NEW = (from Firebase console)"
echo "NEXT_PUBLIC_GA_PROPERTY_ID_NEW = (your GA property ID)"
echo "NEXT_PUBLIC_APP_NAME_NEW = Veritas"
echo "NEXT_PUBLIC_APP_URL_NEW = https://$PROJECT_ID.web.app"
echo ""
echo "API Endpoints (update after functions are deployed):"
echo "NEXT_PUBLIC_PROCESS_INGESTION_URL_NEW = https://asia-south1-$PROJECT_ID.cloudfunctions.net/process_ingestion_task"
echo "NEXT_PUBLIC_ON_FILE_UPLOAD_URL_NEW = https://asia-south1-$PROJECT_ID.cloudfunctions.net/on_file_upload"
echo "NEXT_PUBLIC_TRIGGER_DILIGENCE_URL_NEW = https://asia-south1-$PROJECT_ID.cloudfunctions.net/trigger_diligence"
echo "NEXT_PUBLIC_PROCESS_DILIGENCE_URL_NEW = https://asia-south1-$PROJECT_ID.cloudfunctions.net/process_diligence_task"
echo "NEXT_PUBLIC_SCHEDULE_INTERVIEW_URL_NEW = https://asia-south1-$PROJECT_ID.cloudfunctions.net/schedule_ai_interview"
echo "NEXT_PUBLIC_RUN_DILIGENCE_URL_NEW = https://asia-south1-$PROJECT_ID.cloudfunctions.net/run_diligence"
echo "NEXT_PUBLIC_QUERY_DILIGENCE_URL_NEW = https://asia-south1-$PROJECT_ID.cloudfunctions.net/query_diligence"
