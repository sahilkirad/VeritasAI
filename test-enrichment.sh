#!/bin/bash

# Test script to verify memo enrichment is working
# This script helps test the enrichment fixes

echo "🧪 Testing Memo Enrichment Fixes"
echo "================================="
echo ""

# Get memo ID from user or use example
if [ -z "$1" ]; then
    echo "Usage: ./test-enrichment.sh <memo_id>"
    echo ""
    echo "Example memo IDs you can use:"
    echo "  - Check Firestore 'ingestionResults' collection for document IDs"
    echo ""
    echo "To find a memo ID:"
    echo "  1. Go to Firebase Console > Firestore"
    echo "  2. Open 'ingestionResults' collection"
    echo "  3. Copy a document ID"
    echo ""
    exit 1
fi

MEMO_ID=$1
VALIDATION_URL="https://validate-memo-data-abvgpbhuca-el.a.run.app"

echo "📋 Testing enrichment for memo: $MEMO_ID"
echo ""

# Get memo data first to see what needs enrichment
echo "1️⃣ Fetching current memo data..."
MEMO_DATA=$(gcloud firestore documents get "ingestionResults/$MEMO_ID" --format=json 2>/dev/null || echo "{}")

if [ "$MEMO_DATA" == "{}" ]; then
    echo "⚠️  Could not fetch memo data. Let's try via API..."
else
    echo "✅ Found memo data"
fi

echo ""
echo "2️⃣ Checking fields that might need enrichment..."
echo "   Fields to check: company_stage, headquarters, founded_date, amount_raising, post_money_valuation, investment_sought, ownership_target"
echo ""

# Trigger validation/enrichment
echo "3️⃣ Triggering validation and enrichment..."
echo "   This will:"
echo "   - Identify missing fields with 'Not specified'"
echo "   - Query Perplexity AI for real data"
echo "   - Enrich the memo with actual company information"
echo "   - Save to memo1_validated collection"
echo ""

RESPONSE=$(curl -X POST "$VALIDATION_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"memo_id\": \"$MEMO_ID\",
    \"memo_type\": \"memo_1\",
    \"memo_data\": {}
  }" \
  -w "\nHTTP Status: %{http_code}" 2>/dev/null)

echo "$RESPONSE" | head -20
echo ""

if echo "$RESPONSE" | grep -q "200\|success"; then
    echo "✅ Validation/enrichment triggered successfully!"
    echo ""
    echo "4️⃣ Check the enriched data:"
    echo "   - Go to Firestore > memo1_validated collection"
    echo "   - Look for document with ID: $MEMO_ID"
    echo "   - Check memo_1 fields for enriched values"
    echo ""
    echo "5️⃣ View logs:"
    echo "   firebase functions:log --only validate_memo_data"
    echo ""
else
    echo "❌ Validation failed. Check the error above."
    echo ""
    echo "Debug steps:"
    echo "  1. Check Firebase logs: firebase functions:log"
    echo "  2. Verify memo exists: Check ingestionResults/$MEMO_ID"
    echo "  3. Check PERPLEXITY_API_KEY is set as secret"
fi

echo ""
echo "📊 Monitor enrichment progress:"
echo "   firebase functions:log --only validate_memo_data | grep -i enrich"

