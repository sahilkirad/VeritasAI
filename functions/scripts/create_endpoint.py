#!/usr/bin/env python3
"""
Create Vector Search Endpoint manually
Fixes deployment issues by creating endpoint with proper configuration
"""

import os
import time
from google.cloud import aiplatform

# Configuration
PROJECT_ID = "veritas-472301"
REGION = "asia-south1"
INDEX_ID = "projects/533015987350/locations/asia-south1/indexes/2748330468695867392"
ENDPOINT_DISPLAY_NAME = "veritas-diligence-endpoint"

def create_endpoint_manually():
    """Create endpoint manually with proper configuration"""
    print(f"🚀 Creating Vector Search Endpoint manually...")
    print(f"   Project: {PROJECT_ID}")
    print(f"   Region: {REGION}")
    print(f"   Index ID: {INDEX_ID}")
    
    try:
        # Initialize Vertex AI
        aiplatform.init(project=PROJECT_ID, location=REGION)
        
        # Create endpoint with public access (simplest configuration)
        endpoint = aiplatform.MatchingEngineIndexEndpoint.create(
            display_name=ENDPOINT_DISPLAY_NAME,
            description="Endpoint for Veritas AI diligence validation queries",
            public_endpoint_enabled=True,  # Enable public endpoint (no network config needed)
            labels={"environment": "production", "system": "veritas-diligence"}
        )
        
        print(f"✅ Endpoint created successfully!")
        print(f"   Endpoint ID: {endpoint.resource_name}")
        print(f"   Endpoint Name: {endpoint.display_name}")
        
        # Wait for endpoint to be ready
        print(f"\n⏳ Waiting for endpoint to be ready...")
        time.sleep(30)
        
        # Deploy index to endpoint with minimal resources
        print(f"\n🚀 Deploying index to endpoint...")
        
        # Get the index
        index = aiplatform.MatchingEngineIndex(index_name=INDEX_ID)
        
        # Deploy with minimal configuration
        deployed_index = endpoint.deploy_index(
            index=index,
            deployed_index_id="veritas_diligence_deployed",
            display_name="Veritas Diligence Deployed Index",
            machine_type="e2-standard-2",  # Minimal machine type
            min_replica_count=1,
            max_replica_count=1,  # Start with 1 replica
            enable_access_logging=False  # Disable logging to reduce complexity
        )
        
        print(f"✅ Index deployed successfully!")
        print(f"   Deployed Index ID: {deployed_index.id}")
        
        return endpoint
        
    except Exception as e:
        print(f"❌ Error creating endpoint: {e}")
        print(f"\nTroubleshooting:")
        print(f"1. Check if Compute Engine API is enabled")
        print(f"2. Verify billing is enabled for the project")
        print(f"3. Check quota in {REGION} region")
        print(f"4. Try a different machine type")
        return None

def print_summary(endpoint):
    """Print setup summary"""
    print("\n" + "="*70)
    print("🎉 ENDPOINT CREATION COMPLETE!")
    print("="*70)
    
    if endpoint:
        print(f"\n📋 ENDPOINT INFORMATION:")
        print(f"   Endpoint ID: {endpoint.resource_name}")
        print(f"   Display Name: {endpoint.display_name}")
        print(f"   Public Endpoint: {endpoint.public_endpoint_domain_name if hasattr(endpoint, 'public_endpoint_domain_name') else 'Private'}")
    
    print("\n" + "="*70)
    print("📝 COPY THIS VALUE:")
    print("="*70)
    
    if endpoint:
        print(f"\nVECTOR_SEARCH_ENDPOINT_ID='{endpoint.resource_name}'")
    
    print("\n" + "="*70)
    print("✅ Next Steps:")
    print("="*70)
    print("1. Copy the Endpoint ID above")
    print("2. Provide it to the AI assistant")
    print("3. The system will be ready for testing")
    print("="*70 + "\n")

def main():
    """Main function"""
    print("\n" + "="*70)
    print("🔧 VERITAS AI - ENDPOINT CREATION")
    print("="*70 + "\n")
    
    # Create endpoint
    endpoint = create_endpoint_manually()
    
    if endpoint:
        print_summary(endpoint)
    else:
        print("\n❌ Endpoint creation failed. Please check errors above.")

if __name__ == "__main__":
    main()
