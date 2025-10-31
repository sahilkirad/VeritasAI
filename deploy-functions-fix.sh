#!/bin/bash

# Deploy Cloud Functions with Firebase initialization and enrichment fixes
# This deploys all functions with the latest fixes for:
# 1. Firebase initialization in all agents
# 2. Memo enrichment agent improvements (amount_raising, investment_sought, etc.)

set -e  # Exit on any error

echo "🚀 Deploying Cloud Functions with Latest Fixes..."
echo "================================================="
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Error: Firebase CLI is not installed"
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi

# Check if logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Error: Not logged in to Firebase"
    echo "Login with: firebase login"
    exit 1
fi

echo "✅ Firebase CLI check passed"
echo ""

# Navigate to project root (if not already there)
cd "$(dirname "$0")"

# Deploy functions
echo "📦 Deploying Cloud Functions..."
echo ""
echo "This will deploy:"
echo "  - All HTTP endpoints (validate_memo_data, etc.)"
echo "  - All Pub/Sub triggers (process_ingestion_task, process_diligence_task, etc.)"
echo "  - With fixes for:"
echo "    • Firebase initialization in all agents"
echo "    • Memo enrichment for missing fields (stage, headquarters, funding info)"
echo ""

firebase deploy --only functions

echo ""
echo "✅ Functions deployed successfully!"
echo ""
echo "📋 Key functions updated:"
echo "  • validate_memo_data - Now properly initializes Firebase before enrichment"
echo "  • MemoEnrichmentAgent - Now enriches amount_raising, investment_sought, etc."
echo "  • All agents - Firebase initialization checks added"
echo ""
echo "🧪 Test the enrichment:"
echo "  1. Trigger validation for a memo with 'Not specified' fields"
echo "  2. Check logs to see enrichment progress"
echo "  3. Verify memo1_validated collection has enriched data"
echo ""
echo "📊 Monitor logs:"
echo "  firebase functions:log"
echo ""

