# Enhanced Investor Recommendation Agent - Deployment Guide

## 🚀 Overview

This guide walks you through deploying the enhanced AI-powered investor recommendation agent to Google Cloud Functions with advanced matching algorithms and sophisticated prompt engineering.

## 📋 Prerequisites

### 1. Google Cloud Setup
```bash
# Install Google Cloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Authenticate
gcloud auth login
gcloud config set project veritas-472301
```

### 2. Required APIs
```bash
# Enable required services
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable aiplatform.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable run.googleapis.com
```

### 3. Dependencies
```bash
# Install Python dependencies
pip install google-cloud-aiplatform
pip install google-cloud-firestore
pip install scikit-learn
pip install numpy
```

## 🛠️ Enhanced Features

### 1. Advanced Matching Algorithm
- **6-Factor Scoring**: Sector, Stage, Ticket Size, Geography, Portfolio Similarity, Network Connections
- **Weighted Scoring**: Optimized weights for different factors
- **Semantic Matching**: Vector embeddings for portfolio similarity
- **Network Analysis**: Warm introduction path discovery

### 2. Sophisticated AI Prompts
- **Context-Rich Analysis**: Comprehensive startup and investor profiles
- **Strategic Insights**: Business case development and mutual value creation
- **Professional Tone**: Investment analyst perspective with 15+ years experience
- **Data-Driven Rationale**: Specific metrics and examples

### 3. Enhanced Scoring Weights
```python
weights = {
    'sector_alignment': 0.25,      # Primary factor
    'stage_alignment': 0.20,       # Investment stage fit
    'ticket_size_match': 0.20,     # Funding amount alignment
    'portfolio_similarity': 0.15,  # Semantic portfolio match
    'geography_match': 0.10,       # Geographic proximity
    'network_connections': 0.10     # Warm introduction potential
}
```

## 🚀 Deployment Steps

### 1. Deploy the Agent
```bash
# Make deployment script executable
chmod +x deploy-agent.sh

# Run deployment
./deploy-agent.sh
```

### 2. Verify Deployment
```bash
# Check function status
gcloud functions describe investor-recommendation-agent --region=asia-south1 --gen2

# Get function URL
gcloud functions describe investor-recommendation-agent --region=asia-south1 --gen2 --format="value(serviceConfig.uri)"
```

### 3. Test the Agent
```bash
# Run comprehensive tests
python test-agent.py
```

## 🧪 Testing the Agent

### Local Testing
```python
from agents.investor_recommendation_agent import InvestorRecommendationAgent

# Initialize agent
agent = InvestorRecommendationAgent(project="veritas-472301")
agent.set_up()

# Test with sample data
result = agent.run(
    company_id="test_company",
    memo_data={
        "title": "AI Startup",
        "sector": "AI",
        "stage": "Seed",
        "problem": "Business problem...",
        "solution": "AI solution..."
    },
    founder_profile={
        "professionalBackground": "Tech background...",
        "yearsOfExperience": 5
    }
)
```

### Remote Testing
```bash
# Test deployed function
curl -X POST https://asia-south1-veritas-472301.cloudfunctions.net/investor-recommendation-agent \
  -H 'Content-Type: application/json' \
  -d '{
    "company_id": "test_company",
    "memo_data": {
      "title": "Test Startup",
      "sector": "AI",
      "stage": "Seed"
    }
  }'
```

## 📊 Agent Performance

### Expected Output
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "processing_time_seconds": 2.5,
  "company_id": "test_company",
  "company_name": "AI Startup",
  "recommendations": [
    {
      "investorId": "investor_001",
      "investorName": "Sarah Chen",
      "firmName": "Accel Partners",
      "matchScore": 92.5,
      "rationale": "Strong strategic match with Accel's AI focus and seed-stage expertise...",
      "sectorAlignment": 95.0,
      "stageAlignment": 88.0,
      "ticketSizeMatch": 90.0,
      "geographyMatch": 85.0,
      "networkPath": [
        {
          "fromId": "founder",
          "toId": "angel_1",
          "connectionType": "direct"
        }
      ]
    }
  ],
  "total_investors_analyzed": 150,
  "status": "SUCCESS"
}
```

## 🔧 Configuration

### Environment Variables
```bash
GOOGLE_CLOUD_PROJECT=veritas-472301
VERTEX_AI_LOCATION=asia-south1
```

### Function Settings
- **Runtime**: Python 3.11
- **Memory**: 1GB
- **Timeout**: 540 seconds
- **Max Instances**: 10
- **Region**: asia-south1

## 📈 Monitoring

### Cloud Console
- **Functions**: https://console.cloud.google.com/functions/list?project=veritas-472301
- **Logs**: https://console.cloud.google.com/logs/query?project=veritas-472301
- **Metrics**: https://console.cloud.google.com/monitoring?project=veritas-472301

### Key Metrics
- **Invocation Count**: Number of requests
- **Execution Time**: Processing duration
- **Error Rate**: Failed requests percentage
- **Memory Usage**: Resource consumption

## 🚨 Troubleshooting

### Common Issues

1. **Authentication Errors**
   ```bash
   gcloud auth login
   gcloud auth application-default login
   ```

2. **API Not Enabled**
   ```bash
   gcloud services enable aiplatform.googleapis.com
   ```

3. **Memory Issues**
   - Increase memory allocation in deployment script
   - Optimize agent code for memory usage

4. **Timeout Errors**
   - Increase timeout in deployment script
   - Optimize agent processing time

### Debug Mode
```python
# Enable detailed logging
import logging
logging.basicConfig(level=logging.DEBUG)

# Test with verbose output
agent = InvestorRecommendationAgent(project="veritas-472301")
agent.set_up()
result = agent.run(company_id="test", memo_data={})
```

## 🔄 Updates and Maintenance

### Updating the Agent
1. Modify the agent code
2. Run deployment script again
3. Test with new functionality
4. Monitor performance

### Scaling
- **Auto-scaling**: Function automatically scales based on demand
- **Concurrent Executions**: Up to 10 instances by default
- **Cold Start**: First request may take longer

## 📚 API Documentation

### Endpoint
```
POST https://asia-south1-veritas-472301.cloudfunctions.net/investor-recommendation-agent
```

### Request Body
```json
{
  "company_id": "string",
  "memo_data": {
    "title": "string",
    "sector": "string",
    "stage": "string",
    "problem": "string",
    "solution": "string",
    "business_model": "string",
    "market_size": "string",
    "traction": "string"
  },
  "founder_profile": {
    "professionalBackground": "string",
    "yearsOfExperience": "number"
  }
}
```

### Response
```json
{
  "status": "SUCCESS|FAILED",
  "recommendations": [...],
  "processing_time_seconds": "number",
  "error": "string (if failed)"
}
```

## 🎯 Best Practices

1. **Data Quality**: Ensure high-quality startup and investor data
2. **Regular Updates**: Keep investor profiles current
3. **Performance Monitoring**: Track response times and accuracy
4. **A/B Testing**: Compare different matching algorithms
5. **Feedback Loop**: Collect user feedback on recommendations

## 📞 Support

For issues or questions:
- Check Cloud Function logs
- Review agent code for errors
- Test with sample data
- Monitor resource usage

---

**🎉 Your Enhanced Investor Recommendation Agent is now deployed and ready to power intelligent startup-investor matching!**
