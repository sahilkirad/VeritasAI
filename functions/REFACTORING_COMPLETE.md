# Pub/Sub KeyError 'time' Fix - Complete

## Solution Implemented

✅ **Refactored main.py to separate business logic from decorators**

This is the recommended long-term solution that completely avoids the firebase decorator wrapper issue.

## Changes Made

### 1. Created Implementation Functions in `main.py`

Four new implementation functions that contain the business logic:

- `_process_ingestion_task_impl(message_data_bytes: bytes)` - Handles document ingestion
- `_process_diligence_task_impl(message_data_bytes: bytes)` - Handles diligence processing  
- `_conduct_interview_impl(message_data_bytes: bytes)` - Handles interview question generation
- `_generate_interview_summary_impl(message_data_bytes: bytes)` - Handles interview summary generation

These functions:
- Accept raw message data bytes (no CloudEvent dependency)
- Contain all the business logic
- Can be called directly without going through decorators

### 2. Updated Decorated Functions in `main.py`

The firebase-decorated functions are now thin wrappers:

```python
@pubsub_fn.on_message_published(...)
def process_ingestion_task(event: pubsub_fn.CloudEvent) -> None:
    """Firebase-decorated wrapper that calls the implementation."""
    message_data = event.data.message.data
    _process_ingestion_task_impl(message_data)
```

This pattern:
- Keeps the decorator for Cloud Function deployment
- Extracts message data from CloudEvent
- Calls the implementation function directly

### 3. Updated Flask Routes in `app.py`

All four Pub/Sub routes now call the implementation functions directly:

```python
# Before (caused KeyError 'time'):
main.process_ingestion_task(event)

# After (bypasses decorator completely):
main._process_ingestion_task_impl(message_bytes)
```

**Updated routes:**
- `/process_ingestion_task` → calls `_process_ingestion_task_impl`
- `/process_diligence_task` → calls `_process_diligence_task_impl`
- `/conduct_interview` → calls `_conduct_interview_impl`
- `/generate_interview_summary` → calls `_generate_interview_summary_impl`

## How It Works

1. **Cloud Function Deployment**: The decorated functions (`process_ingestion_task`, etc.) are still used by Firebase Functions for Pub/Sub triggers. They extract data from CloudEvent and call the implementation.

2. **Flask Routes**: The Flask routes in `app.py` call the implementation functions directly with raw message bytes, completely bypassing the firebase decorator wrapper.

3. **No KeyError**: Since we're not calling through the decorator wrapper, there's no check for `event["time"]`, so no KeyError occurs.

## Benefits

✅ **Clean Architecture**: Business logic is separated from infrastructure concerns  
✅ **Testable**: Implementation functions can be tested independently  
✅ **Reusable**: Implementation functions can be called from multiple places  
✅ **No Decorator Issues**: Flask routes bypass the decorator entirely  
✅ **Backward Compatible**: Cloud Functions still work as before  

## Testing

To test the fix:

1. **Deploy to Cloud Run** and test the Flask routes
2. **Publish a Pub/Sub message**:
   ```bash
   gcloud pubsub topics publish document-ingestion-topic \
     --message='{"file_path": "test.pdf", "bucket_name": "test-bucket", "content_type": "application/pdf"}'
   ```
3. **Check logs** - should see no KeyError 'time'

## Files Modified

- `functions/main.py` - Added 4 implementation functions, updated 4 decorated functions
- `functions/app.py` - Updated 4 routes to call implementation functions directly

## Status

✅ **COMPLETE** - The fix is implemented and ready for deployment.

The KeyError 'time' issue is resolved by completely bypassing the firebase decorator wrapper in Flask routes.

