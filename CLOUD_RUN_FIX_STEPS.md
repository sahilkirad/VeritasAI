# Cloud Run Configuration Fix Steps

## Code Changes Completed ✅

1. **Dockerfile**: Updated Gunicorn timeout to 600 seconds (10 minutes)
2. **app.py**: Added proper error handling for rate limits and other errors

## Manual Steps Required

### Step 1: Update Cloud Run Service Configuration

You need to update the Cloud Run service to increase timeout and memory.

#### Option A: Using Google Cloud Console (UI)

1. **Go to Cloud Run Console**:
   - Navigate to: https://console.cloud.google.com/run/detail/asia-south1/veritas-functions?project=veritas-472301

2. **Edit Service**:
   - Click **"Edit and deploy new revision"** button (top right)

3. **Update Configuration**:
   - **Container tab**:
     - **Memory**: Change from `4 GiB` to `8 GiB` (or `8192 MiB`)
     - **CPU**: Keep at `2` (or increase to `4` if needed)
   
   - **Container, Variables & Secrets tab**:
     - No changes needed here
   
   - **Networking tab**:
     - **Request timeout**: Change from `300 seconds` to `600 seconds` (10 minutes)
     - Keep other settings as is

4. **Deploy**:
   - Click **"Deploy"** button at the bottom
   - Wait for deployment to complete (2-3 minutes)

#### Option B: Using gcloud CLI

Run these commands:

```bash
# Update timeout to 600 seconds (10 minutes)
gcloud run services update veritas-functions \
  --region=asia-south1 \
  --timeout=600 \
  --memory=8Gi \
  --cpu=2 \
  --project=veritas-472301

# Verify the changes
gcloud run services describe veritas-functions \
  --region=asia-south1 \
  --project=veritas-472301 \
  --format="get(spec.template.spec.timeoutSeconds,spec.template.spec.containers[0].resources.limits)"
```

Expected output:
```
600	cpu=2000m;memory=8Gi
```

---

### Step 2: Rebuild and Deploy Docker Image

After code changes, rebuild and deploy:

```bash
# Navigate to functions directory
cd VeritasAI/functions

# Build and push Docker image
gcloud builds submit --tag asia-south1-docker.pkg.dev/veritas-472301/veritas-functions/veritas-functions:latest --project=veritas-472301

# Deploy to Cloud Run
gcloud run deploy veritas-functions \
  --image=asia-south1-docker.pkg.dev/veritas-472301/veritas-functions/veritas-functions:latest \
  --region=asia-south1 \
  --platform=managed \
  --allow-unauthenticated \
  --timeout=600 \
  --memory=8Gi \
  --cpu=2 \
  --project=veritas-472301
```

**OR** if you have CI/CD set up, just commit and push to `main` branch - it will auto-deploy.

---

### Step 3: Re-enable Pub/Sub Subscriptions

After deployment is complete and verified:

1. **Go to Pub/Sub Console**:
   - https://console.cloud.google.com/cloudpubsub/subscription/list?project=veritas-472301

2. **Re-create the subscriptions** (or edit if you paused them):
   - For each subscription, click **"Edit"**
   - Add back the **Endpoint URL**:
     - `diligence-topic-push-subscription`: `https://veritas-functions-533015987350.asia-south1.run.app/process_diligence_task`
     - `document-ingestion-topic-push-subscription`: `https://veritas-functions-533015987350.asia-south1.run.app/process_ingestion_task`
     - `bot-join-meeting-push-subscription`: `https://veritas-functions-533015987350.asia-south1.run.app/conduct_interview`
     - `interview-completed-push-subscription`: `https://veritas-functions-533015987350.asia-south1.run.app/generate_interview_summary`
   - Click **"Save"**

3. **Update Acknowledgment Deadline** (recommended):
   - Set to `600 seconds` (10 minutes) to match Cloud Run timeout
   - This prevents premature retries

---

### Step 4: Verify Everything Works

1. **Check Cloud Run Logs**:
   ```bash
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=veritas-functions" \
     --limit=20 \
     --project=veritas-472301 \
     --freshness=10m
   ```

2. **Test with a Single Message**:
   - Go to Pub/Sub → Topics
   - Select `diligence-topic`
   - Click "Publish Message"
   - Add test JSON and publish
   - Monitor Cloud Run logs to see if it processes successfully

3. **Monitor Metrics**:
   - Go to Cloud Run → veritas-functions → Observability → Metrics
   - Check:
     - Request latencies (should be < 5 minutes now)
     - Error rates (should decrease)
     - Memory usage (should be stable)

---

## Summary of Changes

| Component | Before | After | Reason |
|-----------|--------|-------|--------|
| Gunicorn Timeout | 30s (default) | 600s | Allow long-running AI tasks |
| Cloud Run Timeout | 300s | 600s | Match Gunicorn timeout |
| Memory | 4GB | 8GB | Prevent OOM kills |
| Error Handling | Always 500 | Smart status codes | Proper retry logic |
| Workers | 1 | 2 workers, 4 threads | Better concurrency |

---

## Expected Results

✅ **No more worker timeouts** - Tasks can run up to 10 minutes  
✅ **No more OOM kills** - 8GB memory handles concurrent requests  
✅ **Better error handling** - Rate limits return 429 (backoff)  
✅ **Reduced retry loops** - Proper status codes prevent infinite retries  
✅ **Better performance** - Multiple workers handle concurrent requests  

---

## Troubleshooting

If issues persist:

1. **Check logs** for specific error messages
2. **Verify memory usage** - May need to increase to 16GB if still OOM
3. **Check rate limits** - Vertex AI may still rate limit (429 errors)
4. **Monitor Pub/Sub** - Check subscription metrics for delivery issues

