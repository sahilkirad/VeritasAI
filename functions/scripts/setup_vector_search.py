#!/usr/bin/env python3
"""
Setup script for Google Cloud Vector Search (Matching Engine)
Creates index and endpoint for Veritas AI diligence system
"""

import os
import time
from google.cloud import aiplatform

# Configuration
PROJECT_ID = "veritas-472301"
REGION = "asia-south1"
INDEX_DISPLAY_NAME = "veritas-diligence-index"
ENDPOINT_DISPLAY_NAME = "veritas-diligence-endpoint"
DIMENSIONS = 768  # textembedding-gecko@003 dimensions
DISTANCE_MEASURE = "DOT_PRODUCT_DISTANCE"
SHARD_SIZE = "SHARD_SIZE_SMALL"

def check_permissions():
    """Check if service account has required permissions"""
    try:
        aiplatform.init(project=PROJECT_ID, location=REGION)
        # Try to list indexes as permission check
        aiplatform.MatchingEngineIndex.list()
        return True
    except Exception as e:
        print(f"⚠️  Permission check failed: {e}")
        return False

def create_vector_search_index():
    """Create Vector Search index"""
    print(f"🚀 Creating Vector Search Index in {REGION}...")
    print(f"   Project: {PROJECT_ID}")
    print(f"   Index Name: {INDEX_DISPLAY_NAME}")
    print(f"   Dimensions: {DIMENSIONS}")
    
    try:
        # Initialize Vertex AI
        aiplatform.init(project=PROJECT_ID, location=REGION)
        
        # Create index
        index = aiplatform.MatchingEngineIndex.create_tree_ah_index(
            display_name=INDEX_DISPLAY_NAME,
            dimensions=DIMENSIONS,
            approximate_neighbors_count=100,  # ADD THIS - optimal for speed/accuracy
            leaf_node_embedding_count=500,     # ADD THIS - limits nodes for faster search
            distance_measure_type=DISTANCE_MEASURE,
            shard_size=SHARD_SIZE,
            description="Vector Search index for Veritas AI diligence validation system",
            labels={"environment": "production", "system": "veritas-diligence"}
        )
        
        print(f"✅ Index created successfully!")
        print(f"   Index ID: {index.resource_name}")
        print(f"   Index Name: {index.display_name}")
        
        return index
        
    except Exception as e:
        print(f"❌ Error creating index: {e}")
        print(f"\nTroubleshooting:")
        print(f"1. Make sure Vertex AI API is enabled")
        print(f"2. Check IAM permissions for your account")
        print(f"3. Verify project ID is correct: {PROJECT_ID}")
        return None

def create_index_endpoint(index):
    """Create and deploy index endpoint"""
    print(f"\n🚀 Creating Index Endpoint...")
    
    try:
        # Create endpoint
        endpoint = aiplatform.MatchingEngineIndexEndpoint.create(
            display_name=ENDPOINT_DISPLAY_NAME,
            description="Endpoint for Veritas AI diligence validation queries",
            public_endpoint_enabled=True,
            labels={"environment": "production", "system": "veritas-diligence"}
        )
        
        print(f"✅ Endpoint created successfully!")
        print(f"   Endpoint ID: {endpoint.resource_name}")
        print(f"   Endpoint Name: {endpoint.display_name}")
        
        # Deploy index to endpoint
        print(f"\n🚀 Deploying index to endpoint...")
        print(f"   This may take 10-15 minutes...")
        
        deployed_index = endpoint.deploy_index(
            index=index,
            deployed_index_id="veritas_diligence_deployed",
            display_name="Veritas Diligence Deployed Index",
            machine_type="e2-standard-2",
            min_replica_count=1,
            max_replica_count=3,
            enable_access_logging=True
        )
        
        print(f"✅ Index deployed successfully!")
        
        return endpoint
        
    except Exception as e:
        print(f"❌ Error creating/deploying endpoint: {e}")
        print(f"\nTroubleshooting:")
        print(f"1. Ensure Compute Engine API is enabled")
        print(f"2. Check if you have sufficient quota in {REGION}")
        print(f"3. Verify billing is enabled for the project")
        return None

def print_summary(index, endpoint):
    """Print setup summary with IDs to copy"""
    print("\n" + "="*70)
    print("🎉 VECTOR SEARCH SETUP COMPLETE!")
    print("="*70)
    
    if index:
        print(f"\n📋 INDEX INFORMATION:")
        print(f"   Index ID: {index.resource_name}")
        print(f"   Display Name: {index.display_name}")
        print(f"   Dimensions: {DIMENSIONS}")
        print(f"   Distance: {DISTANCE_MEASURE}")
    
    if endpoint:
        print(f"\n📋 ENDPOINT INFORMATION:")
        print(f"   Endpoint ID: {endpoint.resource_name}")
        print(f"   Display Name: {endpoint.display_name}")
        print(f"   Public Endpoint: {endpoint.public_endpoint_domain_name if hasattr(endpoint, 'public_endpoint_domain_name') else 'N/A'}")
    
    print("\n" + "="*70)
    print("📝 COPY THESE VALUES:")
    print("="*70)
    
    if index:
        print(f"\nVECTOR_SEARCH_INDEX_ID='{index.resource_name}'")
    
    if endpoint:
        print(f"VECTOR_SEARCH_ENDPOINT_ID='{endpoint.resource_name}'")
    
    print("\n" + "="*70)
    print("✅ Next Steps:")
    print("="*70)
    print("1. Copy the IDs above")
    print("2. Provide them to the AI assistant")
    print("3. The assistant will add them to the code automatically")
    print("4. Run setup_bigquery.py next")
    print("="*70 + "\n")

def main():
    """Main setup function"""
    print("\n" + "="*70)
    print("🔧 VERITAS AI - VECTOR SEARCH SETUP")
    print("="*70 + "\n")
    
    # Check permissions first
    print("🔍 Checking permissions...")
    if not check_permissions():
        print("❌ Permission check failed. Please ensure the service account has required roles.")
        return
    
    # Check if index already exists
    print("🔍 Checking for existing resources...")
    try:
        aiplatform.init(project=PROJECT_ID, location=REGION)
        
        existing_indexes = aiplatform.MatchingEngineIndex.list()
        existing_endpoints = aiplatform.MatchingEngineIndexEndpoint.list()
        
        for idx in existing_indexes:
            if idx.display_name == INDEX_DISPLAY_NAME:
                print(f"⚠️  Index '{INDEX_DISPLAY_NAME}' already exists!")
                print(f"   Index ID: {idx.resource_name}")
                
                use_existing = input("\nUse existing index? (y/n): ").strip().lower()
                if use_existing == 'y':
                    index = idx
                    print("✅ Using existing index")
                    
                    # Check for endpoint
                    endpoint = None
                    for ep in existing_endpoints:
                        if ep.display_name == ENDPOINT_DISPLAY_NAME:
                            endpoint = ep
                            print(f"✅ Found existing endpoint: {ep.resource_name}")
                            break
                    
                    if not endpoint:
                        endpoint = create_index_endpoint(index)
                    
                    print_summary(index, endpoint)
                    return
        
    except Exception as e:
        print(f"⚠️  Could not check existing resources: {e}")
    
    # Create new index
    index = create_vector_search_index()
    
    if not index:
        print("\n❌ Setup failed. Please check errors above.")
        return
    
    # Wait a bit for index to be ready
    print("\n⏳ Waiting for index to be fully ready...")
    time.sleep(10)
    
    # Create endpoint
    endpoint = create_index_endpoint(index)
    
    # Print summary
    print_summary(index, endpoint)

if __name__ == "__main__":
    main()

