# Perplexity + Vertex AI Enrichment Setup Guide

This guide provides simple setup instructions for the enhanced Perplexity AI enrichment system using Vertex AI for structured data extraction. **No Vector Search required!**

## 🎯 **Simplified Architecture**

```
Perplexity API → Vertex AI (Gemini) → Structured Data → Firestore
```

**Benefits:**
- ✅ No Vector Search setup needed
- ✅ Lower costs (no embedding storage)
- ✅ Simpler deployment
- ✅ Direct Perplexity + Vertex AI processing

## 📋 **Prerequisites**

- Google Cloud Project: `veritas-472301`
- Vertex AI API enabled
- Perplexity API key
- Appropriate IAM permissions

## 🔧 **Step 1: Enable Required APIs**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `veritas-472301`
3. Navigate to **APIs & Services** > **Library**
4. Enable the following APIs:
   - **Vertex AI API** ✅ (Already enabled)
   - **AI Platform API** ✅ (Already enabled)

## 🔑 **Step 2: Set Environment Variables**

Add these to your deployment environment:

```bash
# Perplexity API (Required)
PERPLEXITY_API_KEY=your_perplexity_api_key_here

# Vertex AI Configuration
GOOGLE_CLOUD_PROJECT=veritas-472301
VERTEX_AI_LOCATION=us-central1
VERTEX_AI_API_KEY=AQ.Ab8RN6IaGv5rkuBlydmAYOeitsJN9suwP2pudfGlV8QlJTD3Tg
```

## 🧪 **Step 3: Test the Setup**

Run the simplified test script:

```bash
cd functions
python test_perplexity_vertex_enrichment.py
```

## 📊 **Expected Results**

- **80%+ field coverage** for critical fields (company_stage, headquarters, funding)
- **60%+ field coverage** for financial metrics
- **<30 seconds** enrichment time per company
- **All enriched fields** include source citations
- **No Vector Search** dependencies

## 🚀 **How It Works**

### **1. Perplexity API Search**
- Uses `sonar-medium-online` model for real-time web search
- Category-specific prompts for targeted data retrieval
- Returns citations and sources for all data

### **2. Vertex AI Processing**
- Uses `gemini-2.0-flash-exp` for fast structured data extraction
- Processes Perplexity results into clean JSON format
- Assigns confidence scores (0.0-1.0) to each field
- Validates data quality before merging

### **3. Automatic Integration**
- Runs automatically after intake agent completes
- Enriches missing Memo 1 and Memo 3 fields
- Stores enriched data directly to Firestore
- No additional setup required

## 📈 **Field Categories Enriched**

### **Company Basics**
- Company stage, headquarters, founding date, team size
- **Prompt**: "Provide verified company information for [Company]: headquarters location, founding date, current stage, employee count"

### **Financial Metrics**
- Revenue, growth rate, burn rate, runway, CAC, LTV, margins
- **Prompt**: "Find latest financial data for [Company]: current revenue, revenue growth rate, funding raised, valuation, burn rate, runway, CAC, LTV, gross margins"

### **Funding Deals**
- Amount raising, valuation, lead investors, use of funds
- **Prompt**: "Research funding information for [Company]: current funding round amount, valuation, lead investors, committed funding, use of funds"

### **Market Intelligence**
- TAM/SAM/SOM, market penetration, competitive advantages
- **Prompt**: "Analyze market for [Company]: TAM/SAM/SOM with sources, market penetration, competitive advantages, market timing, industry trends"

### **Team & Execution**
- Key team members, advisory board, GTM strategy, partnerships
- **Prompt**: "Research team and execution for [Company]: key team members, advisory board, go-to-market strategy, sales approach, key partnerships"

### **Growth & Exit**
- Scalability plans, exit strategy, potential acquirers
- **Prompt**: "Analyze growth and exit strategy for [Company]: scalability plans, exit strategy, potential acquirers, IPO timeline, exit valuation expectations"

## 🔍 **Monitoring & Validation**

### **Enrichment Metadata**
Each enriched field includes:
- **Value**: The enriched data
- **Confidence**: Score from 0.0 to 1.0
- **Source**: Brief description of the source
- **Timestamp**: When enrichment occurred

### **Quality Metrics**
- Field coverage percentage
- Average confidence scores
- Enrichment success rate
- Processing time per company

## 💰 **Cost Optimization**

### **Perplexity API Costs**
- ~$0.01-0.05 per enrichment request
- Based on query complexity and response length
- No additional storage costs

### **Vertex AI Costs**
- ~$0.001-0.005 per enrichment request
- Based on Gemini model usage
- No embedding storage costs

### **Total Cost per Company**
- **Estimated**: $0.01-0.06 per company enrichment
- **Much cheaper** than Vector Search approach
- **No ongoing storage costs**

## 🛠️ **Troubleshooting**

### **Common Issues**

1. **Perplexity API Key Missing**
   - Set `PERPLEXITY_API_KEY` environment variable
   - Check API key validity

2. **Vertex AI Initialization Failed**
   - Verify `GOOGLE_CLOUD_PROJECT` is correct
   - Check IAM permissions for Vertex AI

3. **Enrichment Timeout**
   - Check network connectivity
   - Verify API quotas not exceeded

### **Debug Mode**
Enable detailed logging:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 🎯 **Success Criteria**

- ✅ **80%+ critical field coverage**
- ✅ **60%+ financial metrics coverage**
- ✅ **<30 seconds per company**
- ✅ **All fields include sources**
- ✅ **No Vector Search setup needed**
- ✅ **Lower costs than Vector Search**

## 🚀 **Next Steps**

1. **Set Environment Variables** (especially `PERPLEXITY_API_KEY`)
2. **Run Test Script**: `python test_perplexity_vertex_enrichment.py`
3. **Deploy to Production** with confidence
4. **Monitor Performance** and costs
5. **Scale as needed** based on usage

## 📞 **Support**

For additional help:
- Check logs for specific error messages
- Verify all environment variables are set
- Test with a single company first
- Monitor Google Cloud Console for API usage

This simplified approach gives you powerful enrichment capabilities without the complexity of Vector Search setup! 🎉
