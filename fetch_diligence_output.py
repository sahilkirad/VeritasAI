#!/usr/bin/env python3
"""
Script to fetch diligence agent output (AI insight memo 1) from Firestore
"""

import json
import sys
from datetime import datetime
from typing import Dict, Any, List

# Firebase imports
try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False
    print("Firebase Admin SDK not installed. Install with: pip install firebase-admin")

def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    if not FIREBASE_AVAILABLE:
        print("ERROR: Firebase Admin SDK not available")
        return None
    
    try:
        # Try to use default credentials (if running on GCP or with service account)
        if not firebase_admin._apps:
            cred = credentials.ApplicationDefault()
            firebase_admin.initialize_app(cred)
        
        db = firestore.client()
        print("✅ Firebase initialized successfully")
        return db
    except Exception as e:
        print(f"ERROR: Failed to initialize Firebase: {e}")
        print("Make sure you have:")
        print("1. Set GOOGLE_APPLICATION_CREDENTIALS environment variable")
        print("2. Or run 'gcloud auth application-default login'")
        return None

def fetch_diligence_results(db) -> List[Dict[str, Any]]:
    """Fetch all diligence results from Firestore"""
    try:
        print("🔍 Fetching diligence results from Firestore...")
        
        # Query the diligenceResults collection
        diligence_ref = db.collection('diligenceResults')
        docs = diligence_ref.order_by('timestamp', direction=firestore.Query.DESCENDING).limit(10).stream()
        
        results = []
        for doc in docs:
            doc_data = doc.to_dict()
            doc_data['document_id'] = doc.id
            results.append(doc_data)
        
        print(f"✅ Found {len(results)} diligence results")
        return results
        
    except Exception as e:
        print(f"ERROR: Failed to fetch diligence results: {e}")
        return []

def fetch_ingestion_results(db) -> List[Dict[str, Any]]:
    """Fetch all ingestion results from Firestore"""
    try:
        print("🔍 Fetching ingestion results from Firestore...")
        
        # Query the ingestionResults collection
        ingestion_ref = db.collection('ingestionResults')
        docs = ingestion_ref.order_by('timestamp', direction=firestore.Query.DESCENDING).limit(10).stream()
        
        results = []
        for doc in docs:
            doc_data = doc.to_dict()
            doc_data['document_id'] = doc.id
            results.append(doc_data)
        
        print(f"✅ Found {len(results)} ingestion results")
        return results
        
    except Exception as e:
        print(f"ERROR: Failed to fetch ingestion results: {e}")
        return []

def display_diligence_summary(results: List[Dict[str, Any]]):
    """Display a summary of diligence results"""
    if not results:
        print("❌ No diligence results found")
        return
    
    print("\n" + "="*80)
    print("📊 DILIGENCE AGENT OUTPUT SUMMARY")
    print("="*80)
    
    for i, result in enumerate(results, 1):
        print(f"\n📋 Result #{i}")
        print(f"Document ID: {result.get('document_id', 'N/A')}")
        print(f"Timestamp: {result.get('timestamp', 'N/A')}")
        print(f"Status: {result.get('status', 'N/A')}")
        
        # Check if it has memo1_diligence structure
        memo1_diligence = result.get('memo1_diligence', {})
        if memo1_diligence:
            print(f"Investment Recommendation: {memo1_diligence.get('investment_recommendation', 'N/A')}")
            print(f"Overall Score: {memo1_diligence.get('overall_score', 'N/A')}")
            
            # Show key sections
            founder_fit = memo1_diligence.get('founder_market_fit', {})
            if founder_fit:
                print(f"Founder-Market Fit Score: {founder_fit.get('score', 'N/A')}")
            
            team_exec = memo1_diligence.get('team_execution_capability', {})
            if team_exec:
                print(f"Team Execution Score: {team_exec.get('score', 'N/A')}")
            
            traction = memo1_diligence.get('traction_metrics_validation', {})
            if traction:
                print(f"Traction Validation Score: {traction.get('score', 'N/A')}")
        
        print("-" * 40)

def display_detailed_diligence(result: Dict[str, Any]):
    """Display detailed diligence analysis"""
    print("\n" + "="*80)
    print("📋 DETAILED DILIGENCE ANALYSIS")
    print("="*80)
    
    memo1_diligence = result.get('memo1_diligence', {})
    if not memo1_diligence:
        print("❌ No memo1_diligence data found")
        return
    
    # Investment Recommendation
    print(f"\n🎯 Investment Recommendation: {memo1_diligence.get('investment_recommendation', 'N/A')}")
    print(f"📊 Overall Score: {memo1_diligence.get('overall_score', 'N/A')}/10")
    
    # Investment Thesis
    thesis = memo1_diligence.get('investment_thesis', '')
    if thesis:
        print(f"\n💡 Investment Thesis:")
        print(f"   {thesis}")
    
    # Founder Market Fit
    founder_fit = memo1_diligence.get('founder_market_fit', {})
    if founder_fit:
        print(f"\n👤 Founder-Market Fit: {founder_fit.get('score', 'N/A')}/10")
        analysis = founder_fit.get('analysis', '')
        if analysis:
            print(f"   Analysis: {analysis}")
    
    # Team Execution
    team_exec = memo1_diligence.get('team_execution_capability', {})
    if team_exec:
        print(f"\n⚡ Team Execution: {team_exec.get('score', 'N/A')}/10")
        analysis = team_exec.get('analysis', '')
        if analysis:
            print(f"   Analysis: {analysis}")
    
    # Traction Validation
    traction = memo1_diligence.get('traction_metrics_validation', {})
    if traction:
        print(f"\n📈 Traction Validation: {traction.get('score', 'N/A')}/10")
        analysis = traction.get('analysis', '')
        if analysis:
            print(f"   Analysis: {analysis}")
    
    # Key Risks
    risks = memo1_diligence.get('key_risks', [])
    if risks:
        print(f"\n⚠️  Key Risks:")
        for i, risk in enumerate(risks, 1):
            print(f"   {i}. {risk}")
    
    # Mitigation Strategies
    mitigations = memo1_diligence.get('mitigation_strategies', [])
    if mitigations:
        print(f"\n🛡️  Mitigation Strategies:")
        for i, strategy in enumerate(mitigations, 1):
            print(f"   {i}. {strategy}")
    
    # Due Diligence Next Steps
    next_steps = memo1_diligence.get('due_diligence_next_steps', [])
    if next_steps:
        print(f"\n📋 Due Diligence Next Steps:")
        for i, step in enumerate(next_steps, 1):
            print(f"   {i}. {step}")
    
    # Synthesis Notes
    synthesis = memo1_diligence.get('synthesis_notes', '')
    if synthesis:
        print(f"\n🔍 Synthesis Notes:")
        print(f"   {synthesis}")

def save_to_file(data: Dict[str, Any], filename: str):
    """Save data to a JSON file"""
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False, default=str)
        print(f"💾 Data saved to {filename}")
    except Exception as e:
        print(f"ERROR: Failed to save to file: {e}")

def main():
    """Main function"""
    print("🚀 Fetching Diligence Agent Output (AI Insight Memo 1)")
    print("="*60)
    
    # Initialize Firebase
    db = initialize_firebase()
    if not db:
        return
    
    # Fetch diligence results
    diligence_results = fetch_diligence_results(db)
    
    if not diligence_results:
        print("❌ No diligence results found. Checking ingestion results...")
        ingestion_results = fetch_ingestion_results(db)
        if ingestion_results:
            print(f"✅ Found {len(ingestion_results)} ingestion results")
            print("These contain the initial memo data but no diligence analysis yet.")
        return
    
    # Display summary
    display_diligence_summary(diligence_results)
    
    # Ask user if they want detailed view
    if len(sys.argv) > 1 and sys.argv[1] == "--detailed":
        # Show detailed view of the first result
        display_detailed_diligence(diligence_results[0])
        
        # Save to file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"diligence_output_{timestamp}.json"
        save_to_file(diligence_results[0], filename)
    
    # Show available commands
    print(f"\n💡 Available commands:")
    print(f"   python {sys.argv[0]} --detailed    # Show detailed analysis")
    print(f"   python {sys.argv[0]} --save        # Save all results to file")

if __name__ == "__main__":
    main()
