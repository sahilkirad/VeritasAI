# Investor Matching Data Storage Locations

## 📍 Overview
This document describes where all investment matching data is stored in Firestore.

---

## 1. **Investor Profiles Data** ⭐
**Collection**: `investors`  
**Document ID**: `investor_001`, `investor_002`, etc. (from `investor.id` field)

**Location in Firebase Console**: 
```
Firestore Database → investors → [investor_id]
```

**What's stored here:**
- Complete investor profiles with all metadata
- Uploaded from `functions/agents/investors_list.json`
- Contains: investment profile, ticket size, sector focus, stage preference, geography, past investments, thesis, contact info, portfolio metrics
- Timestamps: `uploaded_at`, `last_updated`

**Example Document Structure:**
```json
{
  "id": "investor_001",
  "name": "Tiger Global Management",
  "type": "VC Fund",
  "firm": "Tiger Global",
  "investment_profile": {
    "ticket_size": { "min": 50000000, "max": 500000000, "avg": 150000000 },
    "stage_preference": ["Series A", "Series B"],
    "sector_focus": ["Fintech", "SaaS", "E-commerce"],
    "geography": ["India", "US", "Southeast Asia"]
  },
  "past_investments": ["Razorpay", "Unacademy", "Cred"],
  "investment_thesis": "High-growth tech companies...",
  "contact": {
    "email": "deals@tigerglobal.com",
    "website": "tigerglobal.com"
  },
  "uploaded_at": "2025-11-01T...",
  "last_updated": "2025-11-01T..."
}
```

**How to upload/update:**
- Use the `upload_investors` Cloud Function endpoint
- URL: `https://asia-south1-veritas-472301.cloudfunctions.net/upload_investors`
- Method: `POST`
- Or use the script: `functions/scripts/upload_investors_to_firestore.py`

---

## 2. **Founder/Startup Data (Input for Matching)** 📊
**Collection**: `ingestionResults`  
**Document ID**: Auto-generated when PDF is processed

**Location in Firebase Console**: 
```
Firestore Database → ingestionResults → [memo_id]
```

**What's stored here:**
- Original startup/founder data extracted from uploaded documents
- Contains `memo_1` with company info, sector, stage, funding ask, geography, metrics
- Used as input for matching algorithm
- **READ-ONLY** - Matching agent does not modify this data

**Example Document Structure:**
```json
{
  "memo_1": {
    "title": "Company Name",
    "founder_name": "John Doe",
    "founder_email": "john@company.com",
    "sector": "FinTech",
    "company_stage": "Seed",
    "amount_raising": "₹1.5 Cr",
    "headquarters": "Pune, India",
    "revenue": "₹50L ARR",
    "growth_rate": "200% YoY"
  },
  "status": "SUCCESS",
  "timestamp": "2025-11-01T..."
}
```

**Note:** The matching agent reads from this collection but never writes to it.

---

## 3. **Matching Results** ✅
**Collection**: `investor_matches`  
**Document ID**: `{memo_id}` or `{founder_email}`

**Location in Firebase Console**: 
```
Firestore Database → investor_matches → [memo_id]
```

**What's stored here:**
- Complete matching results for each founder/startup
- Contains all matched investors with scores and reasoning
- Automatically stored after computation
- Cached for faster subsequent loads

**Example Document Structure:**
```json
{
  "memo_id": "...",
  "founder_email": "...",
  "founder_data": {
    "company_name": "...",
    "sector": "...",
    "stage": "..."
  },
  "matches": [
    {
      "investor_id": "investor_001",
      "investor_name": "Tiger Global Management",
      "match_score": 87.5,
      "score_breakdown": {...},
      "why_match": "...",
      "recommended_action": "connect"
    }
  ],
  "total_investors_analyzed": 14,
  "min_score_used": 0.3,
  "processing_time_seconds": 2.3,
  "created_at": "2025-11-01T...",
  "last_updated": "2025-11-01T...",
  "timestamp": "2025-11-01T..."
}
```

**How it works:**
- When "Find Investors" is clicked, the system first checks Firestore for cached results
- If cached results exist with the same or lower `min_score`, they are returned immediately (faster)
- If no cache exists or `force_recompute=true`, new matches are computed and stored
- Results are automatically updated when investor profiles change

**What gets returned (but not stored):**
```json
{
  "status": "SUCCESS",
  "founder_data": {
    "company_name": "...",
    "sector": "...",
    "stage": "..."
  },
  "matches": [
    {
      "investor_id": "investor_001",
      "investor_name": "Tiger Global Management",
      "firm_name": "Tiger Global",
      "match_score": 87.5,
      "score_breakdown": {
        "sector_alignment": 0.9,
        "stage_alignment": 0.8,
        "ticket_fit": 0.85
      },
      "why_match": "AI-generated explanation...",
      "recommended_action": "connect",
      "contact": {...},
      "investment_profile": {...}
    }
  ],
  "total_investors_analyzed": 14,
  "processing_time_seconds": 2.3,
  "timestamp": "2025-11-01T..."
}
```

---

## 4. **Future: Optional Matching Results Storage** 🔮

If you want to store matching results for caching/analytics, you could add:

**Suggested Collection**: `investor_matches`  
**Document ID**: `{memo_id}_{timestamp}` or `{memo_id}` (to overwrite)

**Structure:**
```json
{
  "memo_id": "...",
  "founder_email": "...",
  "company_name": "...",
  "matches": [...],
  "created_at": "2025-11-01T...",
  "expires_at": "2025-11-08T..."  // Optional: cache for 7 days
}
```

**Benefits:**
- Faster responses for repeated queries
- Analytics on match history
- Ability to track which matches founders viewed/clicked

**Implementation:**
Would require modifying `investor_match` endpoint in `functions/main.py` to save results after computing.

---

## 📊 Summary

| Data Type | Collection | Read/Write | Purpose |
|-----------|-----------|------------|---------|
| Investor Profiles | `investors` | Read by matching agent | Master list of all investors |
| Startup/Founder Data | `ingestionResults` | Read-only by matching agent | Input data for matching |
| Matching Results | ❌ Not stored | N/A | Computed on-demand, returned to frontend |

---

## 🔍 How to View Data

### View Investors:
1. Go to Firebase Console → Firestore Database
2. Navigate to `investors` collection
3. You'll see all 14 investors we uploaded

### View Startup Data:
1. Go to Firebase Console → Firestore Database  
2. Navigate to `ingestionResults` collection
3. Each document represents a processed startup/founder

### View Matching Results:
- Currently not stored - results are only visible in the frontend when "Find Investors" is clicked
- Check browser Network tab to see the API response

---

## 🔧 Maintenance

### Update Investor Data:
```bash
# After modifying investors_list.json, redeploy and call:
curl -X POST https://asia-south1-veritas-472301.cloudfunctions.net/upload_investors
```

### Clear Investor Cache:
The matching agent caches investors in memory (`self._investors_cache`). 
- Cache is cleared when the Cloud Function restarts
- To force refresh: redeploy the function

