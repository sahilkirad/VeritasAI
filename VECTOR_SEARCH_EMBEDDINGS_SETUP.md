# Vector Search Embeddings Setup Guide

This guide provides step-by-step instructions for setting up Vector Search embeddings in Google Cloud Console for the VeritasAI system.

## Prerequisites

- Google Cloud Project: `veritas-472301`
- Vertex AI API enabled
- Vector Search API enabled
- Appropriate IAM permissions

## Step 1: Enable Required APIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `veritas-472301`
3. Navigate to **APIs & Services** > **Library**
4. Enable the following APIs:
   - **Vertex AI API**
   - **Vector Search API** (if available)
   - **AI Platform API**

## Step 2: Create Vector Search Index

### Option A: Using Google Cloud Console (Recommended)

1. Navigate to **Vertex AI** > **Vector Search** in the Google Cloud Console
2. Click **Create Index**
3. Configure the index:
   - **Index Name**: `veritas-company-embeddings`
   - **Description**: `Company embeddings for VeritasAI diligence system`
   - **Index Type**: `Dense Vector Index`
   - **Dimensions**: `768` (for text-embedding-004 model)
   - **Distance Measure**: `Cosine`

### Option B: Using gcloud CLI

```bash
# Set your project
gcloud config set project veritas-472301

# Create the index
gcloud ai indexes create \
  --display-name="veritas-company-embeddings" \
  --description="Company embeddings for VeritasAI diligence system" \
  --metadata-file=index_metadata.json \
  --region=asia-south1
```

Create `index_metadata.json`:
```json
{
  "config": {
    "dimensions": 768,
    "approximateNeighborsCount": 10,
    "distanceMeasureType": "DOT_PRODUCT_DISTANCE",
    "algorithmConfig": {
      "treeAhConfig": {
        "leafNodeEmbeddingCount": 500,
        "leafNodesToSearchPercent": 10
      }
    }
  }
}
```

## Step 3: Create Index Endpoint

1. In **Vertex AI** > **Vector Search**, click **Create Endpoint**
2. Configure the endpoint:
   - **Endpoint Name**: `veritas-embeddings-endpoint`
   - **Description**: `Endpoint for VeritasAI company embeddings`
   - **Region**: `asia-south1`
   - **Network**: `default`

### Using gcloud CLI:

```bash
gcloud ai index-endpoints create \
  --display-name="veritas-embeddings-endpoint" \
  --description="Endpoint for VeritasAI company embeddings" \
  --region=asia-south1
```

## Step 4: Deploy Index to Endpoint

1. After creating both index and endpoint, deploy the index:
2. Go to your index and click **Deploy to Endpoint**
3. Select your endpoint and configure:
   - **Min Replica Count**: `1`
   - **Max Replica Count**: `3`
   - **Machine Type**: `e2-standard-2`

### Using gcloud CLI:

```bash
# Get the index ID and endpoint ID from the console
INDEX_ID="your-index-id"
ENDPOINT_ID="your-endpoint-id"

gcloud ai index-endpoints deploy-index \
  $ENDPOINT_ID \
  --deployed-index-id="veritas-company-index" \
  --index=$INDEX_ID \
  --display-name="VeritasAI Company Index" \
  --min-replica-count=1 \
  --max-replica-count=3 \
  --machine-type="e2-standard-2" \
  --region=asia-south1
```

## Step 5: Update Vector Search Client

Update the `vector_search_client.py` with your index and endpoint IDs:

```python
# In functions/agents/vector_search_client.py
class VectorSearchClient:
    def __init__(self, project_id: str = "veritas-472301", region: str = "asia-south1"):
        self.project_id = project_id
        self.region = region
        
        # Update these with your actual IDs
        self.index_id = "your-index-id"
        self.endpoint_id = "your-endpoint-id"
        self.deployed_index_id = "veritas-company-index"
        
        # Initialize Vertex AI
        vertexai.init(project=project_id, location=region)
        self.prediction_service_client = aiplatform.gapic.PredictionServiceClient(
            client_options={"api_endpoint": f"{region}-aiplatform.googleapis.com"}
        )
```

## Step 6: Test Embedding Storage

Create a test script to verify the setup:

```python
# test_embeddings.py
import asyncio
from agents.vector_search_client import get_vector_search_client

async def test_embeddings():
    client = get_vector_search_client()
    
    # Test data
    test_company_data = {
        "company_id": "test-company-001",
        "memo1": {
            "title": "Test Company",
            "company_stage": "Series A",
            "headquarters": "San Francisco, CA"
        },
        "founder_profile": {
            "fullName": "John Doe",
            "email": "john@testcompany.com"
        },
        "pitch_deck_text": "Test pitch deck content..."
    }
    
    # Store embeddings
    success = client.store_company_embeddings(
        company_id=test_company_data["company_id"],
        memo1=test_company_data["memo1"],
        founder_profile=test_company_data["founder_profile"],
        pitch_deck_text=test_company_data["pitch_deck_text"]
    )
    
    if success:
        print("✅ Embeddings stored successfully")
        
        # Test retrieval
        retrieved_data = client.get_company_data(test_company_data["company_id"])
        if retrieved_data:
            print("✅ Embeddings retrieved successfully")
        else:
            print("❌ Failed to retrieve embeddings")
    else:
        print("❌ Failed to store embeddings")

if __name__ == "__main__":
    asyncio.run(test_embeddings())
```

## Step 7: Environment Variables

Add these environment variables to your deployment:

```bash
# In your .env file or deployment environment
GOOGLE_CLOUD_PROJECT=veritas-472301
VERTEX_AI_LOCATION=asia-south1
VECTOR_SEARCH_INDEX_ID=your-index-id
VECTOR_SEARCH_ENDPOINT_ID=your-endpoint-id
VECTOR_SEARCH_DEPLOYED_INDEX_ID=veritas-company-index
```

## Step 8: IAM Permissions

Ensure your service account has the following roles:

- **Vertex AI User** (`roles/aiplatform.user`)
- **Vertex AI Service Agent** (`roles/aiplatform.serviceAgent`)
- **Storage Object Admin** (if using Cloud Storage for embeddings)

## Troubleshooting

### Common Issues:

1. **Index creation fails**: Ensure Vector Search API is enabled
2. **Deployment fails**: Check machine type availability in the region
3. **Embedding storage fails**: Verify IAM permissions
4. **Retrieval fails**: Check index deployment status

### Monitoring:

1. Go to **Vertex AI** > **Vector Search** > **Indexes**
2. Check index status and deployment status
3. Monitor usage and performance metrics
4. Set up alerts for failures

## Cost Optimization

- **Min Replica Count**: Set to 1 for development, 2+ for production
- **Machine Type**: Use `e2-standard-2` for development, scale up for production
- **Auto-scaling**: Configure based on usage patterns
- **Index Updates**: Batch updates to reduce costs

## Security Considerations

- Use VPC networks for production deployments
- Enable audit logging for compliance
- Implement proper IAM roles and permissions
- Encrypt data at rest and in transit

## Next Steps

After completing the setup:

1. Run the test script to verify functionality
2. Update your deployment configuration
3. Monitor the system for performance
4. Scale resources based on usage

For additional support, refer to the [Vertex AI Vector Search documentation](https://cloud.google.com/vertex-ai/docs/vector-search/overview).
