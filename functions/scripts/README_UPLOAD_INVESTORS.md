# Upload Investors to Firestore

This script uploads investor data from `investors_list.json` to Firestore.

## Usage

### Option 1: Run directly with Python (if dependencies installed)
```bash
cd functions
python3 scripts/upload_investors_to_firestore.py
```

### Option 2: Run in Cloud Functions environment
Since this requires Firestore access, you can:
1. Deploy it as a Cloud Function, OR
2. Run it locally with Firebase emulator, OR
3. Set up Google Cloud credentials locally

### Option 3: Run as a one-time script from main.py
You can add a Cloud Function endpoint to trigger this upload:

```python
@https_fn.on_request()
def upload_investors(req: https_fn.Request) -> https_fn.Response:
    """One-time upload of investors to Firestore"""
    from scripts.upload_investors_to_firestore import upload_investors_to_firestore
    import os
    
    json_path = os.path.join(os.path.dirname(__file__), 'agents', 'investors_list.json')
    success = upload_investors_to_firestore(json_path)
    
    return https_fn.Response(
        json.dumps({"success": success}),
        mimetype="application/json"
    )
```

## What it does:
- Reads `functions/agents/investors_list.json`
- Uploads each investor as a document to Firestore `investors` collection
- Uses `investor.id` as the document ID
- Adds `uploaded_at` and `last_updated` timestamps

## After Upload:
The `InvestorMatchingAgent` will automatically use Firestore data instead of markdown parsing.

