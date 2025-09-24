# GitHub Secrets Setup

To deploy your Firebase project using GitHub Actions, you need to set up the following secrets in your GitHub repository:

## Required GitHub Secrets

### Firebase Configuration
- `FIREBASE_PROJECT_ID` - Your Firebase project ID (e.g., `veritas-472301`)
- `FIREBASE_API_KEY` - Your Firebase Web API key
- `FIREBASE_AUTH_DOMAIN` - Your Firebase auth domain (e.g., `veritas-472301.firebaseapp.com`)
- `FIREBASE_STORAGE_BUCKET` - Your Firebase storage bucket (e.g., `veritas-472301.firebasestorage.app`)
- `FIREBASE_MESSAGING_SENDER_ID` - Your Firebase messaging sender ID
- `FIREBASE_APP_ID` - Your Firebase app ID
- `FIREBASE_MEASUREMENT_ID` - Your Firebase measurement ID

### Firebase Admin SDK
- `FIREBASE_PRIVATE_KEY` - Your Firebase service account private key (full key including BEGIN/END lines)
- `FIREBASE_CLIENT_EMAIL` - Your Firebase service account email

### Cloud Functions URLs
- `PROCESS_INGESTION_URL` - `https://asia-south1-veritas-472301.cloudfunctions.net/process_ingestion_task`
- `ON_FILE_UPLOAD_URL` - `https://asia-south1-veritas-472301.cloudfunctions.net/on_file_upload`
- `TRIGGER_DILIGENCE_URL` - `https://asia-south1-veritas-472301.cloudfunctions.net/trigger_diligence`
- `PROCESS_DILIGENCE_URL` - `https://asia-south1-veritas-472301.cloudfunctions.net/process_diligence_task`
- `SCHEDULE_INTERVIEW_URL` - `https://asia-south1-veritas-472301.cloudfunctions.net/schedule_ai_interview`

### App Configuration
- `APP_NAME` - `Veritas`
- `APP_URL` - `https://veritas-472301.web.app`

### Deployment
- `FIREBASE_TOKEN` - Your Firebase CLI token (get with `firebase login:ci`)
- `GCP_SA_KEY` - Your Google Cloud Service Account key (JSON format)

## How to Set Up Secrets

1. Go to your GitHub repository
2. Click on "Settings" tab
3. Click on "Secrets and variables" → "Actions"
4. Click "New repository secret"
5. Add each secret with the exact name and value

## Getting Firebase Token

Run this command locally:
```bash
firebase login:ci
```

## Getting Service Account Key

1. Go to Google Cloud Console
2. Navigate to IAM & Admin → Service Accounts
3. Find your service account
4. Click "Keys" tab
5. Click "Add Key" → "Create new key"
6. Choose JSON format
7. Download and copy the entire JSON content

## Testing the Deployment

After setting up all secrets, push to the main branch to trigger the deployment workflow.
