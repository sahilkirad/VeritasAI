# Validation Agent Setup Guide

## Overview
The Validation Agent searches the web for company data after ingestion and enriches missing fields using both Gemini and Perplexity APIs for comprehensive data validation.

## Features
- **Web Search**: Uses Perplexity API to search for real-time company data
- **AI Analysis**: Uses Gemini API for intelligent data extraction and validation
- **Field Enrichment**: Automatically fills missing company information
- **Data Validation**: Ensures data quality and completeness
- **Source Tracking**: Tracks data sources and confidence scores

## API Keys Required

### 1. Perplexity API Key
```bash
# Set in environment variables
export PERPLEXITY_API_KEY=your_perplexity_api_key_here

# Or set in Firebase secrets
firebase functions:secrets:set PERPLEXITY_API_KEY
```

### 2. Gemini API Key
```bash
# Set in environment variables
export GEMINI_API_KEY=your_gemini_api_key_here

# Or set in Firebase secrets
firebase functions:secrets:set GEMINI_API_KEY
```

## Installation

### 1. Install Dependencies
```bash
cd functions
pip install google-generativeai>=0.3.0
```

### 2. Deploy to Firebase
```bash
firebase deploy --only functions
```

## Usage

### Automatic Integration
The Validation Agent is automatically integrated into the ingestion pipeline. After a company profile is ingested, it will:

1. **Identify Missing Fields**: Scan for incomplete or placeholder data
2. **Web Search**: Use Perplexity to find current company information
3. **AI Analysis**: Use Gemini to extract and structure the data
4. **Data Enrichment**: Fill missing fields with validated information
5. **Quality Assurance**: Validate data quality and track sources

### Manual Testing
```bash
cd functions
python test_validation_agent.py
```

## Field Categories

### Company Basics
- `company_stage`: Series A, Seed, etc.
- `headquarters`: Location with city, state
- `founded_date`: Year or full date
- `team_size`: Number of employees
- `industry`: Business category

### Financial Metrics
- `current_revenue`: Revenue figures
- `revenue_growth_rate`: Growth percentage
- `burn_rate`: Monthly burn rate
- `runway`: Months of runway
- `funding_raised`: Total funding amount

### Team & Execution
- `key_team_members`: Founders and executives
- `advisory_board`: Advisory members
- `founders`: Founder information
- `leadership`: Leadership team

### Market Intelligence
- `market_size`: TAM/SAM/SOM
- `competitors`: Competitor analysis
- `competitive_advantages`: Unique value props
- `market_position`: Market standing

### Growth Metrics
- `customer_count`: Number of customers
- `growth_rate`: Growth metrics
- `user_acquisition`: Acquisition data
- `retention_rate`: Customer retention

## Validation Process

### 1. Data Analysis
- Scans existing company data
- Identifies missing or incomplete fields
- Prioritizes critical information

### 2. Web Search
- Uses Perplexity API for real-time search
- Searches multiple sources and databases
- Gathers recent company information

### 3. AI Processing
- Uses Gemini API for intelligent extraction
- Structures unstructured data
- Validates data quality and accuracy

### 4. Data Enrichment
- Fills missing fields with validated data
- Adds confidence scores and sources
- Maintains data integrity

## Configuration

### Environment Variables
```bash
# Required
PERPLEXITY_API_KEY=pplx-...
GEMINI_API_KEY=your_gemini_key

# Optional
GOOGLE_CLOUD_PROJECT=veritas-472301
```

### Firebase Secrets
```bash
# Set secrets in Firebase
firebase functions:secrets:set PERPLEXITY_API_KEY
firebase functions:secrets:set GEMINI_API_KEY
```

## Monitoring

### Logs
Check Firebase function logs for validation activity:
```bash
firebase functions:log --only process_ingestion_task
```

### Success Indicators
- ✅ "Web validation completed" messages
- ✅ Fields enriched count in logs
- ✅ Validation metadata in Firestore

### Error Handling
- ⚠️ Validation failures are logged but don't stop ingestion
- ⚠️ Original data is preserved if validation fails
- ⚠️ Error details are stored in validation_error field

## Testing

### Local Testing
```bash
# Set API keys
export PERPLEXITY_API_KEY=your_key
export GEMINI_API_KEY=your_key

# Run test
cd functions
python test_validation_agent.py
```

### Production Testing
1. Upload a company profile
2. Check ingestion logs for validation activity
3. Verify enriched data in Firestore
4. Review validation metadata

## Troubleshooting

### Common Issues

#### 1. API Key Not Found
```
Error: PERPLEXITY_API_KEY not found
Solution: Set the API key in environment variables or Firebase secrets
```

#### 2. SSL Certificate Error
```
Error: SSL: CERTIFICATE_VERIFY_FAILED
Solution: This is a local development issue, Firebase Functions work fine
```

#### 3. Validation Timeout
```
Error: Validation timeout
Solution: Check API quotas and network connectivity
```

### Debug Mode
Enable detailed logging:
```python
logging.basicConfig(level=logging.DEBUG)
```

## Performance

### Expected Results
- **Field Coverage**: 80%+ for critical fields
- **Validation Time**: <30 seconds per company
- **Accuracy**: 90%+ for validated fields
- **Source Tracking**: All enriched fields include sources

### Optimization
- Uses model fallback for reliability
- Implements caching for repeated searches
- Optimizes API calls for cost efficiency
- Validates data quality before storage

## Cost Management

### API Usage
- **Perplexity**: ~$0.20 per company validation
- **Gemini**: ~$0.10 per company validation
- **Total**: ~$0.30 per company

### Optimization Tips
- Only validates companies with missing data
- Uses efficient search queries
- Implements result caching
- Monitors API usage

## Support

For issues or questions:
1. Check Firebase function logs
2. Review validation metadata in Firestore
3. Test with known companies (OpenAI, Tesla, etc.)
4. Verify API key configuration

## Success Metrics

### Validation Success Rate
- Target: >90% of companies get some enrichment
- Critical fields: >80% coverage
- Financial data: >60% coverage

### Data Quality
- Source citations: 100% of enriched fields
- Confidence scores: >0.7 average
- Validation metadata: Complete tracking

The Validation Agent ensures your company data is comprehensive, accurate, and up-to-date! 🎯
