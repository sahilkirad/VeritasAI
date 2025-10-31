# Firestore Data Storage Locations

## 📍 Where Your Memo Data is Stored

### 1. **Original Memo Data (Before Enrichment)**
**Collection**: `ingestionResults`
**Document ID**: Auto-generated when PDF is processed
**Location in Firebase Console**: 
```
Firestore Database → ingestionResults → [document_id]
```

**What's stored here:**
- Original extracted memo data from PDF
- Contains `memo_1` object with all fields (including "Not specified")
- File metadata (filename, upload date, etc.)
- Processing status and timestamps

**Example Document Structure:**
```json
{
  "memo_1": {
    "title": "Syntra by InLustro",
    "company_stage": "Not specified",
    "headquarters": "Not specified",
    "founded_date": "Not specified",
    "amount_raising": "Not specified",
    "post_money_valuation": "Not specified",
    ...
  },
  "status": "SUCCESS",
  "timestamp": "2025-10-31T13:06:26",
  "processing_time_seconds": 45.2
}
```

---

### 2. **Enriched Memo Data (After Enrichment) ⭐**
**Collection**: `memo1_validated`
**Document ID**: Same as `ingestionResults` document ID
**Location in Firebase Console**:
```
Firestore Database → memo1_validated → [memo_id]
```

**What's stored here:**
- Enriched memo data with all missing fields filled
- Replaces "Not specified" with actual data from Perplexity AI
- Contains enrichment metadata (sources, confidence scores)
- Validation results

**Example Document Structure:**
```json
{
  "memo_1": {
    "title": "Syntra by InLustro",
    "company_stage": "Seed",  // ✅ Enriched!
    "headquarters": "San Francisco, CA",  // ✅ Enriched!
    "founded_date": "2023",  // ✅ Enriched!
    "amount_raising": "$2M",  // ✅ Enriched!
    "post_money_valuation": "$12M",  // ✅ Enriched!
    "investment_sought": "$2M",  // ✅ Enriched!
    "ownership_target": "15%",  // ✅ Enriched!
    ...
  },
  "original_memo_id": "cLn8VE9XflC4aFbOTVpQ",
  "enrichment_metadata": {
    "enrichment_timestamp": "2025-10-31T13:10:00",
    "fields_enriched": [
      "company_stage",
      "headquarters", 
      "founded_date",
      "amount_raising",
      "post_money_valuation"
    ],
    "enrichment_method": "perplexity_vertex_ai",
    "confidence_scores": {
      "company_stage": 0.9,
      "headquarters": 0.95
    },
    "sources": {
      "company_stage": "Crunchbase",
      "headquarters": "Company website"
    }
  },
  "validation_result": {
    "overall_score": 8.5,
    "validation_points": [...]
  },
  "timestamp": "2025-10-31T13:10:00"
}
```

---

### 3. **Diligence Reports**
**Collection**: `diligenceReports`
**Document ID**: Auto-generated OR `{company_id}_{investor_email}`
**Location in Firebase Console**:
```
Firestore Database → diligenceReports → [document_id]
```

**What's stored here:**
- Memo 2 (Diligence analysis results)
- Validation status and progress
- Analysis results and scores

---

### 4. **Validation Results (Separate Collection)**
**Collection**: `diligenceResults`
**Document ID**: Same as memo_id
**Location**: Used for diligence-specific validation results

---

## 🔍 How to Find Your Data

### Step-by-Step Guide:

1. **Go to Firebase Console**
   - https://console.firebase.google.com/project/veritas-472301/firestore

2. **Find Your Memo**:
   
   **Option A: Find by Company Name**
   - Click on `ingestionResults` collection
   - Search or filter by `memo_1.title`
   - Note the Document ID
   
   **Option B: Find Enriched Data**
   - Click on `memo1_validated` collection
   - Look for the same Document ID
   - This has the enriched data with real values

3. **Check the Data**:
   - In `memo1_validated` collection
   - Open the document with your memo ID
   - Expand the `memo_1` object
   - Look for fields like:
     - `company_stage` (should be "Seed", "Series A", etc.)
     - `headquarters` (should be a city/location)
     - `amount_raising` (should be "$X" format)
     - `post_money_valuation` (should be a valuation amount)

---

## 📊 Data Flow

```
1. PDF Upload
   ↓
2. ingestionResults collection
   (Original data with "Not specified")
   ↓
3. Run Validation/Enrichment
   ↓
4. memo1_validated collection
   (Enriched data with real values) ⭐
```

---

## 🎯 Key Points

- **Original Data**: Always in `ingestionResults`
- **Enriched Data**: Always in `memo1_validated` (same document ID)
- **Frontend Reads**: Should read from `memo1_validated` to get enriched data
- **Document IDs Match**: The ID in `ingestionResults` = ID in `memo1_validated`

---

## 💡 Quick Query Examples

### Find enriched memo by company name:
```javascript
// In Firestore Console or code
db.collection('memo1_validated')
  .where('memo_1.title', '==', 'Syntra by InLustro')
  .get()
```

### Find memo by ID:
```
Collection: memo1_validated
Document: cLn8VE9XflC4aFbOTVpQ
```

### Check enrichment status:
Look at `enrichment_metadata.fields_enriched` array to see which fields were enriched.

---

## 🚨 If Data is Missing

If you don't see data in `memo1_validated`:
1. Check if validation/enrichment was triggered
2. Check function logs for errors
3. Verify the memo ID matches between collections
4. Re-run validation to trigger enrichment

