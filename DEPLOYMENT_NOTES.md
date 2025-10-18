# Deployment Configuration Notes

## Current Setup
- **Frontend**: Next.js with static export for Firebase Hosting
- **Backend**: Firebase Functions (Python)
- **Deployment**: GitHub Actions → Firebase

## API Routes Limitation
⚠️ **Important**: API routes (`/api/*`) are NOT compatible with static export.

### Current API Routes (Will be removed):
- `/api/generate-memo`
- `/api/get-transcript` 
- `/api/schedule-interview`
- `/api/start-interview`

### Solution:
These API routes need to be replaced with direct calls to Firebase Functions:
- `generate-memo` → `https://asia-south1-veritas-472301.cloudfunctions.net/generate_memo`
- `get-transcript` → `https://asia-south1-veritas-472301.cloudfunctions.net/get_transcript`
- `schedule-interview` → `https://asia-south1-veritas-472301.cloudfunctions.net/schedule_ai_interview`
- `start-interview` → `https://asia-south1-veritas-472301.cloudfunctions.net/start_transcription`

## Required Changes for Deployment:

1. **Remove API Routes**: Delete the `/api` directory
2. **Update Frontend**: Change all API calls to use Firebase Functions directly
3. **Environment Variables**: Set production URLs in GitHub Actions secrets

## GitHub Actions Secrets Required:
- `FIREBASE_TOKEN`: Firebase CI token for deployment
- `NEXT_PUBLIC_FIREBASE_API_KEY`: Firebase API key for production

## Deployment Commands:
```bash
# Local testing
npm run build
firebase deploy --only hosting

# Full deployment (via GitHub Actions)
firebase deploy
```
