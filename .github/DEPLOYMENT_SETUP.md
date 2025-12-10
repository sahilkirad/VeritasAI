# CI/CD Deployment Setup Guide

## Overview
This workflow automatically deploys your application when code is pushed to the `main` branch.

## What Gets Deployed

### Frontend
- **Source**: `frontend/` directory
- **Build**: Next.js static export (`npm run build`)
- **Output**: `frontend/out/` directory
- **Deployment**: Firebase Hosting (`https://veritas-472301.web.app/`)

### Backend
- **Source**: `functions/` directory
- **Build**: Docker image
- **Deployment**: Cloud Run (`https://veritas-472301.web.app/`)
- **Service**: `veritas-functions` in `asia-south1` region

## Required GitHub Secrets

You need to set up these secrets in your GitHub repository:

### 1. FIREBASE_SERVICE_ACCOUNT
**Purpose**: Authenticate with Firebase Hosting

**How to get it:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `veritas-472301`
3. Go to Project Settings → Service Accounts
4. Click "Generate new private key"
5. Download the JSON file
6. Copy the entire JSON content
7. In GitHub: Settings → Secrets and variables → Actions → New repository secret
8. Name: `FIREBASE_SERVICE_ACCOUNT`
9. Value: Paste the entire JSON content

### 2. GCP_SA_KEY
**Purpose**: Authenticate with Google Cloud Platform for Cloud Run deployment

**How to get it:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `veritas-472301`
3. Go to IAM & Admin → Service Accounts
4. Find or create a service account with these roles:
   - `Cloud Run Admin`
   - `Service Account User`
   - `Artifact Registry Writer`
   - `Storage Admin` (for Artifact Registry)
5. Click on the service account → Keys → Add Key → Create new key → JSON
6. Download the JSON file
7. Copy the entire JSON content
8. In GitHub: Settings → Secrets and variables → Actions → New repository secret
9. Name: `GCP_SA_KEY`
10. Value: Paste the entire JSON content

## Workflow Behavior

### Triggers
- **Branch**: Only `main` branch
- **Paths**: Only triggers if these paths change:
  - `frontend/**`
  - `functions/**`
  - `firebase.json`
  - `.github/workflows/deploy.yml`

### Deployment Process

1. **Frontend Deployment**:
   - Checks out code
   - Installs Node.js 20
   - Installs npm dependencies
   - Builds Next.js static export
   - Deploys to Firebase Hosting

2. **Backend Deployment**:
   - Checks out code
   - Authenticates with Google Cloud
   - Builds Docker image
   - Pushes to Artifact Registry
   - Deploys to Cloud Run
   - Verifies deployment with health check

### Parallel Execution
Both frontend and backend deploy in parallel (separate jobs) for faster deployment.

## Testing the Workflow

1. Make changes to your code
2. Commit and push to `sahil-veritas` branch (or any branch)
3. Create Pull Request: `sahil-veritas` → `main`
4. Review and merge to `main`
5. GitHub Actions automatically triggers
6. Check Actions tab in GitHub to see deployment progress

## Troubleshooting

### Frontend Deployment Fails
- Check if `FIREBASE_SERVICE_ACCOUNT` secret is set correctly
- Verify Firebase project ID is `veritas-472301`
- Check if `frontend/out` directory is created after build

### Backend Deployment Fails
- Check if `GCP_SA_KEY` secret is set correctly
- Verify service account has required permissions
- Check Artifact Registry exists: `asia-south1-docker.pkg.dev/veritas-472301/veritas-artifacts`
- Verify Cloud Run service exists: `veritas-functions` in `asia-south1`

### Health Check Fails
- Check Cloud Run logs for errors
- Verify the service is accessible
- Check if `app.py` has the root route (`/`)

## Manual Deployment (If Needed)

### Frontend
```bash
cd frontend
npm install
npm run build
firebase deploy --only hosting
```

### Backend
```bash
cd functions
gcloud builds submit --tag asia-south1-docker.pkg.dev/veritas-472301/veritas-artifacts/veritas-functions:latest .
gcloud run deploy veritas-functions \
  --image asia-south1-docker.pkg.dev/veritas-472301/veritas-artifacts/veritas-functions:latest \
  --region asia-south1 \
  --platform managed
```

## Notes

- Auto-scaling is already configured on Cloud Run (no changes needed)
- The workflow only deploys on `main` branch pushes
- Changes to other branches won't trigger deployment
- Both deployments run in parallel for speed

