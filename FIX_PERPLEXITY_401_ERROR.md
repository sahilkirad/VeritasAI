# Fix Perplexity API 401 Unauthorized Error

## Problem
The Perplexity API is returning `401 Unauthorized` errors, which means:
- The `PERPLEXITY_API_KEY` secret doesn't exist in Google Secret Manager, OR
- The API key is invalid/expired, OR
- The Cloud Function doesn't have access to the secret

## Solution

### Step 1: Get Your Perplexity API Key

1. Go to https://www.perplexity.ai/settings/api
2. Log in to your Perplexity account
3. Copy your API key (it should start with `pplx-`)

### Step 2: Create/Update the Secret in Google Secret Manager

**Option A: Using the helper script (Recommended)**
```bash
cd functions/scripts
./update_perplexity_secret.sh pplx-YOUR-API-KEY-HERE
```

**Option B: Manual creation**
```bash
# If secret doesn't exist, create it:
echo -n 'pplx-YOUR-API-KEY-HERE' | gcloud secrets create PERPLEXITY_API_KEY \
  --data-file=- \
  --project=veritas-472301

# If secret already exists, update it:
echo -n 'pplx-YOUR-API-KEY-HERE' | gcloud secrets versions add PERPLEXITY_API_KEY \
  --data-file=- \
  --project=veritas-472301
```

### Step 3: Grant Cloud Functions Access to the Secret

The Cloud Function service account needs permission to access the secret:

```bash
PROJECT_ID="veritas-472301"
SERVICE_ACCOUNT="${PROJECT_ID}@appspot.gserviceaccount.com"

gcloud secrets add-iam-policy-binding PERPLEXITY_API_KEY \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor" \
  --project=${PROJECT_ID}
```

### Step 4: Verify the Secret

Run the verification script:
```bash
cd functions/scripts
./verify_perplexity_secret.sh
```

This will check:
- ✅ Secret exists
- ✅ Secret format (should start with `pplx-`)
- ✅ Cloud Function has access

### Step 5: Redeploy Cloud Functions

After updating the secret, redeploy your Cloud Functions so they can access the new secret:

```bash
cd functions
firebase deploy --only functions
```

Or use the update script:
```bash
./update-cloud-functions.sh
```

### Step 6: Test the Fix

1. Upload a new document through the frontend
2. Check the Cloud Functions logs for enrichment messages
3. The logs should now show successful Perplexity API calls instead of 401 errors

## Troubleshooting

### Still getting 401 errors?

1. **Verify API key is valid:**
   ```bash
   API_KEY=$(gcloud secrets versions access latest --secret=PERPLEXITY_API_KEY --project=veritas-472301)
   curl -X POST "https://api.perplexity.ai/chat/completions" \
     -H "Authorization: Bearer $API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model": "sonar", "messages": [{"role": "user", "content": "test"}]}'
   ```

2. **Check Cloud Function logs:**
   ```bash
   gcloud functions logs read process_ingestion_task \
     --region=asia-south1 \
     --limit=50 \
     --filter="textPayload:\"Perplexity\""
   ```

3. **Verify secret is accessible:**
   ```bash
   gcloud secrets versions access latest --secret=PERPLEXITY_API_KEY --project=veritas-472301
   ```

4. **Check service account permissions:**
   ```bash
   gcloud secrets get-iam-policy PERPLEXITY_API_KEY --project=veritas-472301
   ```

## Expected Behavior After Fix

- ✅ No more `401 Unauthorized` errors
- ✅ Enrichment logs show: `Perplexity enrichment enabled (API key: pplx-...)`
- ✅ Missing fields are populated with real data from Perplexity searches
- ✅ Logs show successful API calls: `Successfully enriched X fields`

## Notes

- The API key must start with `pplx-`
- After updating the secret, you must redeploy the Cloud Functions
- The secret is automatically available as `os.environ.get("PERPLEXITY_API_KEY")` in Cloud Functions
- The enhanced logging will now show detailed debug information about the API key status

