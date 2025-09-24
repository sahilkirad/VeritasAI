#!/bin/bash

echo "🔧 GitHub Secrets Setup Helper"
echo "================================"
echo ""

echo "📋 Required GitHub Secrets:"
echo ""

echo "1. Firebase Configuration:"
echo "   FIREBASE_PROJECT_ID: veritas-472301"
echo "   FIREBASE_API_KEY: [Get from Firebase Console > Project Settings > General]"
echo "   FIREBASE_AUTH_DOMAIN: veritas-472301.firebaseapp.com"
echo "   FIREBASE_STORAGE_BUCKET: veritas-472301.firebasestorage.app"
echo "   FIREBASE_MESSAGING_SENDER_ID: [Get from Firebase Console]"
echo "   FIREBASE_APP_ID: [Get from Firebase Console]"
echo "   FIREBASE_MEASUREMENT_ID: [Get from Firebase Console]"
echo ""

echo "2. Firebase Admin SDK:"
echo "   FIREBASE_PRIVATE_KEY: [Get from Service Account JSON]"
echo "   FIREBASE_CLIENT_EMAIL: [Get from Service Account JSON]"
echo ""

echo "3. Cloud Functions URLs:"
echo "   PROCESS_INGESTION_URL: https://asia-south1-veritas-472301.cloudfunctions.net/process_ingestion_task"
echo "   ON_FILE_UPLOAD_URL: https://asia-south1-veritas-472301.cloudfunctions.net/on_file_upload"
echo "   TRIGGER_DILIGENCE_URL: https://asia-south1-veritas-472301.cloudfunctions.net/trigger_diligence"
echo "   PROCESS_DILIGENCE_URL: https://asia-south1-veritas-472301.cloudfunctions.net/process_diligence_task"
echo "   SCHEDULE_INTERVIEW_URL: https://asia-south1-veritas-472301.cloudfunctions.net/schedule_ai_interview"
echo ""

echo "4. App Configuration:"
echo "   APP_NAME: Veritas"
echo "   APP_URL: https://veritas-472301.web.app"
echo ""

echo "5. Deployment:"
echo "   FIREBASE_TOKEN: [Run 'firebase login:ci' to get this]"
echo "   GCP_SA_KEY: [Get from Google Cloud Console > Service Accounts]"
echo ""

echo "🚀 Next Steps:"
echo "1. Go to your GitHub repository"
echo "2. Click Settings > Secrets and variables > Actions"
echo "3. Add each secret with the exact name and value"
echo "4. Push to main branch to trigger deployment"
