# Pub/Sub Push Subscriptions Setup Guide

## Overview
Your Cloud Run service now has HTTP endpoints to handle Pub/Sub messages. You need to configure Pub/Sub push subscriptions to send messages to these endpoints.

## Cloud Run Service URL
```
https://veritas-functions-533015987350.asia-south1.run.app
```

## Required Push Subscriptions

### 1. Document Ingestion Topic
- **Topic Name**: `document-ingestion-topic`
- **Cloud Run Endpoint**: `/process_ingestion_task`
- **Full URL**: `https://veritas-functions-533015987350.asia-south1.run.app/process_ingestion_task`

### 2. Diligence Topic
- **Topic Name**: `diligence-topic`
- **Cloud Run Endpoint**: `/process_diligence_task`
- **Full URL**: `https://veritas-functions-533015987350.asia-south1.run.app/process_diligence_task`

### 3. Bot Join Meeting Topic
- **Topic Name**: `bot-join-meeting`
- **Cloud Run Endpoint**: `/conduct_interview`
- **Full URL**: `https://veritas-functions-533015987350.asia-south1.run.app/conduct_interview`

### 4. Interview Completed Topic
- **Topic Name**: `interview-completed`
- **Cloud Run Endpoint**: `/generate_interview_summary`
- **Full URL**: `https://veritas-functions-533015987350.asia-south1.run.app/generate_interview_summary`

## Setup Steps in Google Cloud Console

### For Each Topic (Repeat for all 4):

1. **Navigate to Pub/Sub**:
   - Go to Google Cloud Console → Pub/Sub → Subscriptions

2. **Create New Subscription**:
   - Click "Create Subscription"
   - **Subscription ID**: `{topic-name}-push-subscription` (e.g., `document-ingestion-topic-push-subscription`)
   - **Topic**: Select the corresponding topic (e.g., `document-ingestion-topic`)
   - **Delivery Type**: Select **"Push"**

3. **Configure Push Endpoint**:
   - **Endpoint URL**: Enter the full Cloud Run URL for that endpoint
   - Example: `https://veritas-functions-533015987350.asia-south1.run.app/process_ingestion_task`

4. **Authentication**:
   - **Authentication**: Select "Add authentication header"
   - **Service Account**: Create or select a service account with "Pub/Sub Service Agent" role
   - This ensures only Pub/Sub can call your Cloud Run service

5. **Advanced Settings** (Optional but Recommended):
   - **Acknowledgment deadline**: 600 seconds (10 minutes)
   - **Message retention**: 7 days
   - **Dead letter topic**: (Optional) Create a dead-letter topic for failed messages

6. **Click "Create"**

## Grant Pub/Sub Permission to Cloud Run

1. **Go to Cloud Run**:
   - Navigate to Cloud Run → `veritas-functions` → Permissions

2. **Add Principal**:
   - Click "Add Principal"
   - **Principal**: `service-{PROJECT_NUMBER}@gcp-sa-pubsub.iam.gserviceaccount.com`
   - Replace `{PROJECT_NUMBER}` with your project number (found in Project Settings)
   - **Role**: `Cloud Run Invoker`

3. **Save**

## Verify Setup

After creating all subscriptions, verify they're working:

1. **Check Subscription Status**:
   - Go to Pub/Sub → Subscriptions
   - Check that all 4 subscriptions show "Active" status

2. **Test with a Message**:
   - Go to Pub/Sub → Topics
   - Select a topic (e.g., `document-ingestion-topic`)
   - Click "Publish Message"
   - Add test data and publish
   - Check Cloud Run logs to see if the message was received

3. **Monitor Logs**:
   - Go to Cloud Run → `veritas-functions` → Logs
   - Look for incoming requests to the Pub/Sub endpoints

## Troubleshooting

### If messages aren't being delivered:

1. **Check Cloud Run Logs**:
   - Look for 401/403 errors (authentication issues)
   - Look for 500 errors (processing errors)

2. **Verify Service Account Permissions**:
   - Ensure the Pub/Sub service account has "Cloud Run Invoker" role
   - Ensure Cloud Run service allows unauthenticated OR has proper IAM setup

3. **Check Subscription Status**:
   - Go to Pub/Sub → Subscriptions → [Your Subscription]
   - Check "Messages" tab for undelivered messages
   - Check "Monitoring" tab for delivery errors

4. **Verify Endpoint URLs**:
   - Make sure the URLs are correct and accessible
   - Test the endpoint directly with a curl command

## Notes

- **Old Firebase Functions**: You can keep the old Firebase Functions for Pub/Sub as backup, but they won't be used once push subscriptions are active
- **Message Format**: The endpoints automatically handle Pub/Sub push message format conversion
- **Scaling**: Cloud Run will auto-scale based on Pub/Sub message volume

