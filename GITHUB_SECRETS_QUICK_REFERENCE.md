# GitHub Secrets Quick Reference

## 🔗 Direct Link to Secrets
https://github.com/sahilkirad/VeritasAI/settings/secrets/actions

## 📋 All Required Secrets (15 total)

### Firebase Configuration (7 secrets)
| Secret Name | Secret Value |
|-------------|--------------|
| `FIREBASE_PROJECT_ID` | `veritas-472301` |
| `FIREBASE_API_KEY` | [Get from Firebase Console > Project Settings > General] |
| `FIREBASE_AUTH_DOMAIN` | `veritas-472301.firebaseapp.com` |
| `FIREBASE_STORAGE_BUCKET` | `veritas-472301.firebasestorage.app` |
| `FIREBASE_MESSAGING_SENDER_ID` | `533015987350` |
| `FIREBASE_APP_ID` | `1:533015987350:web:d6080ff950f86137352eb7` |
| `FIREBASE_MEASUREMENT_ID` | `G-PRT33XGJNS` |

### Firebase Admin SDK (2 secrets)
| Secret Name | Secret Value |
|-------------|--------------|
| `FIREBASE_PRIVATE_KEY` | [From service account JSON - include BEGIN/END lines] |
| `FIREBASE_CLIENT_EMAIL` | `veritas-ai-backend@veritas-472301.iam.gserviceaccount.com` |

### Cloud Functions URLs (5 secrets)
| Secret Name | Secret Value |
|-------------|--------------|
| `PROCESS_INGESTION_URL` | `https://asia-south1-veritas-472301.cloudfunctions.net/process_ingestion_task` |
| `ON_FILE_UPLOAD_URL` | `https://asia-south1-veritas-472301.cloudfunctions.net/on_file_upload` |
| `TRIGGER_DILIGENCE_URL` | `https://asia-south1-veritas-472301.cloudfunctions.net/trigger_diligence` |
| `PROCESS_DILIGENCE_URL` | `https://asia-south1-veritas-472301.cloudfunctions.net/process_diligence_task` |
| `SCHEDULE_INTERVIEW_URL` | `https://asia-south1-veritas-472301.cloudfunctions.net/schedule_ai_interview` |

### App Configuration (2 secrets)
| Secret Name | Secret Value |
|-------------|--------------|
| `APP_NAME` | `Veritas` |
| `APP_URL` | `https://veritas-472301.web.app` |

### Deployment (2 secrets)
| Secret Name | Secret Value |
|-------------|--------------|
| `FIREBASE_TOKEN` | [Run `firebase login:ci` to get this] |
| `GCP_SA_KEY` | [Service account JSON file content] |

## 🚀 Steps to Add Secrets

1. **Go to**: https://github.com/sahilkirad/VeritasAI/settings/secrets/actions
2. **Click**: "New repository secret"
3. **Add each secret** with the exact name and value from the table above
4. **Repeat** for all 15 secrets
5. **Push to main branch** to trigger deployment

## 🔧 Getting Missing Values

### Firebase API Key
- Go to [Firebase Console](https://console.firebase.google.com/project/veritas-472301/settings/general)
- Copy the "Web API Key"

### Firebase Token
```bash
firebase login:ci
```

### Service Account JSON
- Go to [Google Cloud Console](https://console.cloud.google.com/iam-admin/serviceaccounts?project=veritas-472301)
- Click on your service account
- Go to "Keys" tab
- Click "Add Key" → "Create new key" → "JSON"
- Download and copy the entire JSON content

## ✅ Verification

After adding all secrets, push to main branch and check the Actions tab to see the deployment workflow running.
