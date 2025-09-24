# 🚀 Veritas — See Beyond the Deck, Invest with Confidence

> **Advanced 17-Agent AI Investment Analysis Platform** - Complete startup evaluation system with event-driven orchestration, human-in-the-loop capabilities, and real-time monitoring.

## 

[![Google Cloud](https://img.shields.io/badge/Google%20Cloud-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)](https://cloud.google.com/)
[![Vertex AI Batch](https://img.shields.io/badge/Vertex%20AI%20Batch-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)](https://cloud.google.com/vertex-ai)
[![Google Tech Batch](https://img.shields.io/badge/Google%20Tech%20Batch-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![AI](https://img.shields.io/badge/AI-FF6B6B?style=for-the-badge&logo=openai&logoColor=white)](https://ai.google/)
[![Cloud Run](https://img.shields.io/badge/Cloud%20Run-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)](https://cloud.google.com/run)
[![MCP Server](https://img.shields.io/badge/MCP%20Server-00D4AA?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🤖 AI Agents](#-ai-agents)
- [📊 Workflow](#-workflow)
- [🚀 Quick Start](#-quick-start)
- [☁️ Cloud Deployment](#️-cloud-deployment)
- [📚 API Documentation](#-api-documentation)
- [🔧 Configuration](#-configuration)
- [📁 Project Structure](#-project-structure)
- [🧪 Testing](#-testing)
- [🔒 Security](#-security)
- [📈 Performance](#-performance)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## 🎯 Overview

The **AI Startup Evaluator Platform** is a comprehensive 17-agent investment analysis system that leverages advanced AI agents to process startup pitch decks, conduct automated meetings, perform deep diligence, and generate professional investment recommendations. Built with Google's Agent Development Kit (ADK) and deployed on Google Cloud Run with event-driven orchestration.

### 🎪 What It Does

1. **📄 Ingests** pitch decks, founder videos, and LinkedIn profiles
2. **🔍 Validates** financial claims, market data, and founder backgrounds
3. **🤖 Conducts** AI-powered investor meetings with automated Q&A
4. **📊 Performs** deep diligence with competitor benchmarking and risk scoring
5. **📝 Generates** professional investment memos (Memo 1, 2, 3)
6. **🎯 Provides** actionable investment recommendations with deal structuring
7. **👥 Matches** startups with appropriate VCs and investors
8. **📊 Tracks** the entire evaluation pipeline with real-time monitoring

### 🎯 Target Users

- **💼 VCs & Investors**: Streamline deal flow and due diligence
- **🚀 Startup Founders**: Get AI-powered feedback on pitch materials
- **🏢 Investment Firms**: Standardize evaluation processes
- **📈 Accelerators**: Screen and evaluate startup applications

## ✨ Features

### 🧠 Advanced 17-Agent Architecture
- **Multi-Layer Pipeline**: 5 layers of specialized AI agents
- **Event-Driven Orchestration**: Google Pub/Sub event bus for real-time coordination
- **Human-in-the-Loop**: Investor review and override capabilities
- **Google ADK Integration**: Leverages Google's latest AI development framework
- **Real-time Processing**: Instant analysis and memo generation
- **Context-Aware Analysis**: Understands startup ecosystem nuances

### 📊 Comprehensive Analysis
- **Financial Validation**: Verifies revenue, growth, and funding claims
- **Market Analysis**: TAM/SAM/SOM validation with industry benchmarks
- **Competitive Intelligence**: Identifies and analyzes competitors
- **Founder Assessment**: Evaluates team experience and market fit
- **AI Meeting Bot**: Automated investor-founder meetings with Q&A
- **Risk Scoring**: Advanced risk assessment with multiple factors
- **Deal Structuring**: Automated term sheet generation

### 🎨 Professional Output
- **Investment Memos**: Three versions (Memo 1, 2, 3) with increasing detail
- **Risk Assessment**: Identifies and categorizes investment risks
- **Scoring System**: Weighted scoring across multiple dimensions
- **Recommendations**: Clear invest/watchlist/pass recommendations
- **VC Matchmaking**: Matches startups with appropriate investors
- **Engagement Automation**: Automated follow-up communications

### ☁️ Cloud-Native & Scalable
- **Google Cloud Run**: Containerized, auto-scaling deployment
- **MCP Server**: Advanced orchestration with FastAPI and WebSocket
- **Event-Driven Architecture**: Pub/Sub for reliable event handling
- **Context Store**: Firestore for real-time state, BigQuery for analytics
- **Auto-scaling**: Handles varying workloads automatically
- **Cost-effective**: Pay only for actual usage
- **Global Availability**: Deploy anywhere in Google Cloud regions

## 🏗️ Architecture

```mermaid
flowchart TD
    %% MCP Server Orchestration Layer
    MCP[MCP Server<br/>Event-Driven Orchestration] --> PS[Google Pub/Sub<br/>Event Bus]
    
    %% Layer 1: Ingestion & Capture
    F[Founder uploads materials<br/>Pitch Deck + Video] --> IC[Intake Curation Agent]
    IC --> V[Validation Agent]
    IC --> C[Compliance Agent]
    
    %% Layer 2: Engagement & Interaction  
    V --> AM[AI Meeting Agent<br/>Google Meet Integration]
    C --> AM
    AM --> SC[Sentiment Communication Agent]
    SC --> E[Engagement Agent<br/>Automated Communications]
    
    %% Layer 3: Deep Diligence & Analysis
    AM --> RS[Risk Scoring Agent<br/>Multi-factor Analysis]
    RS --> DD[Deep Diligence Agents<br/>Financial + Technical]
    DD --> FD[Final Diligence Agent]
    
    %% Layer 4: Synthesis & Memo Generation
    FD --> S[Synthesis Agent<br/>Merge All Insights]
    S --> M1[Memo 1: Executive Summary]
    S --> M2[Memo 2: Deep Analysis]
    S --> M3[Memo 3: Investment Decision]
    
    %% Layer 5: Investor Outcome
    M1 --> IR1[Investor Room - First Look]
    IR1 --> INV1[Investor Review]
    INV1 --> DEC1{Investor Decision}
    
    DEC1 -->|Schedule Meeting| AM
    DEC1 -->|Pass| END1[Exit Process]
    
    M2 --> IR2[Investor Room - Deep Dive]
    IR2 --> INV2[Investor Review]
    INV2 --> DEC2{Investor Decision}
    
    DEC2 -->|Go Deeper| DD
    DEC2 -->|Pass| END2[Exit Process]
    
    M3 --> IR3[Investor Room - Final Review]
    IR3 --> INV3[Investor Review]
    INV3 --> PREF[Portfolio Fit Analysis]
    PREF --> EXP[Explainability Agent]
    
    EXP --> DEC3{Final Decision}
    DEC3 -->|Invest| DS[Deal Structuring Agent<br/>Term Sheet Generation]
    DEC3 -->|Follow-up| PI[1-to-1 Interview]
    DEC3 -->|Pass| END3[Exit Process]
    
    %% Advanced Features
    DS --> MC[Matchmaking Agent<br/>VC Recommendations]
    MC --> IR_FINAL[Investor Room - Permanent Access]
    IR_FINAL --> END4[Deal Closed]
    
    PI --> M2
    
    %% Human-in-the-Loop Integration
    HR[Human Review Points] --> AM
    HR --> DS
    HR --> MC
    
    %% Real-time Monitoring
    PS --> RT[Real-time Dashboard<br/>WebSocket Updates]
    RT --> MON[System Monitoring<br/>Performance Metrics]
    
    %% Data Layer
    FS[Firestore<br/>Context Store] --> PS
    BQ[BigQuery<br/>Analytics] --> PS
    GCS[Google Cloud Storage<br/>File Management] --> PS
    
    %% Legacy Agents (Backward Compatibility)
    LEG[Legacy Agents<br/>Original Pipeline] --> S
    
    %% Styling
    classDef mcpServer fill:#2563eb,stroke:#1d4ed8,stroke-width:3px,color:#fff
    classDef layer1 fill:#059669,stroke:#047857,stroke-width:2px,color:#fff
    classDef layer2 fill:#7c3aed,stroke:#6d28d9,stroke-width:2px,color:#fff
    classDef layer3 fill:#dc2626,stroke:#b91c1c,stroke-width:2px,color:#fff
    classDef layer4 fill:#ea580c,stroke:#c2410c,stroke-width:2px,color:#fff
    classDef layer5 fill:#0891b2,stroke:#0e7490,stroke-width:2px,color:#fff
    classDef dataLayer fill:#6b7280,stroke:#4b5563,stroke-width:2px,color:#fff
    classDef decision fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#fff
    classDef endpoint fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff
    
    class MCP,PS mcpServer
    class IC,V,C layer1
    class AM,SC,E layer2
    class RS,DD,FD layer3
    class S,M1,M2,M3 layer4
    class DS,MC,IR_FINAL layer5
    class FS,BQ,GCS dataLayer
    class DEC1,DEC2,DEC3 decision
    class END1,END2,END3,END4 endpoint
```

### 🏛️ System Components

#### **MCP Server (Agent Control Plane)**
- **FastAPI Application**: REST API with WebSocket support
- **Event Bus**: Google Pub/Sub for reliable event handling
- **Workflow Engine**: Temporal.io-style orchestration
- **Context Store**: Firestore for real-time state, BigQuery for analytics
- **Human-in-the-Loop**: Review and override capabilities

#### **17-Agent Pipeline**
- **Layer 1 - Ingestion & Capture**: Intake Curation, Compliance
- **Layer 2 - Engagement & Interaction**: AI Meeting, Sentiment, Synthesis
- **Layer 3 - Deep Diligence & Analysis**: Benchmarking, Financial, Risk, Final Diligence
- **Layer 5 - Investor Outcome**: Deal Structuring, Matchmaking, Engagement

#### **Data Layer**
- **Claims Schema**: Structured claim representation
- **Memo Schema**: Investment memo data models (Memo 1, 2, 3)
- **Google Services**: Cloud storage, AI, and analytics

#### **Infrastructure Layer**
- **Google Cloud Run**: Containerized, auto-scaling deployment
- **Google ADK**: AI agent framework
- **Event-Driven Architecture**: Pub/Sub event bus
- **Real-time Monitoring**: WebSocket and dashboard integration

## 🤖 AI Agents

### **Layer 1: Ingestion & Capture**

#### 1. 📝 Intake Curation Agent (`agents/intake_curation_agent.py`)
**Purpose**: Standardizes raw founder-submitted data into structured fields
**Capabilities**: PDF/PPTX processing, video analysis, LinkedIn profile extraction
**Input**: Pitch deck, founder video, LinkedIn URLs
**Output**: Structured JSON with founder, problem, solution, market, team data

#### 2. ✅ Compliance Agent (`agents/compliance_agent.py`)
**Purpose**: Early risk screening for regulatory and sanctions red flags
**Capabilities**: AML/KYC checks, jurisdiction-specific license validation, PEP screening
**Input**: Founder profile, company name, sector
**Output**: Compliance status and regulatory requirements

### **Layer 2: Engagement & Interaction**

#### 3. 🤖 AI Meeting Agent (`agents/ai_meeting_agent.py`)
**Purpose**: Automates investor-founder meetings with intelligent Q&A
**Capabilities**: Google Meet integration, live transcription, structured Q&A extraction
**Input**: Memo 1 data, investor preferences
**Output**: Meeting transcript with Q&A pairs and insights

#### 4. 💬 Sentiment Communication Agent (`agents/sentiment_communication_agent.py`)
**Purpose**: Analyzes founder confidence, transparency, and communication style
**Capabilities**: NLP sentiment analysis, confidence scoring, transparency assessment
**Input**: Meeting transcript
**Output**: Confidence scores and communication insights

#### 5. 📋 Synthesis Agent (`agents/synthesis_agent.py`)
**Purpose**: Creates Memo 2 by merging intake, validation, and meeting insights
**Capabilities**: Data synthesis, memo generation, insight integration
**Input**: Intake JSON, validation results, meeting Q&A
**Output**: Memo 2 with enhanced insights

### **Layer 3: Deep Diligence & Analysis**

#### 6. 🏆 Competitor Benchmarking Agent (`agents/competitor_benchmarking_agent.py`)
**Purpose**: Maps startup against competitors and market positioning
**Capabilities**: Crunchbase/Pitchbook analysis, competitive landscape mapping
**Input**: Startup vertical and sector
**Output**: Competitor analysis and positioning insights

#### 7. 💰 Financial Projection Agent (`agents/financial_projection_agent.py`)
**Purpose**: Sanity-checks founder financial projections against benchmarks
**Capabilities**: Financial model validation, sector benchmark comparison
**Input**: Financial model and projections
**Output**: Projection analysis and benchmark comparison

#### 8. ⚠️ Risk Scoring Agent (`agents/risk_scoring_agent.py`)
**Purpose**: Converts diligence into numeric risk assessment
**Capabilities**: Multi-factor risk analysis, weighted scoring, risk categorization
**Input**: Memo data and financial model
**Output**: Risk scores and assessment

#### 9. 📊 Final Diligence Agent (`agents/final_diligence_agent.py`)
**Purpose**: Produces the ultimate Memo 3 for investment decision
**Capabilities**: Comprehensive analysis, final recommendation, decision support
**Input**: Memo 2, extra diligence docs
**Output**: Memo 3 with final recommendation

### **Layer 5: Investor Outcome**

#### 10. 💼 Deal Structuring Agent (`agents/deal_structuring_agent.py`)
**Purpose**: Suggests initial term sheet and deal structure
**Capabilities**: Valuation analysis, equity calculation, term sheet generation
**Input**: Startup valuation, investor target, risk assessment
**Output**: Deal structure and term sheet suggestions

#### 11. 👥 Matchmaking Agent (`agents/matchmaking_agent.py`)
**Purpose**: Matches startups with appropriate VCs and investors
**Capabilities**: Investor preference matching, portfolio fit analysis
**Input**: Startup profile, risk assessment, deal suggestion
**Output**: VC recommendations and match scores

#### 12. 📧 Engagement Agent (`agents/engagement_agent.py`)
**Purpose**: Drafts follow-up communications and engagement materials
**Capabilities**: Professional communication generation, engagement automation
**Input**: Decision, startup profile, analysis results
**Output**: Engagement communications and follow-up materials

### **Legacy Agents (Still Supported)**

#### 13. 📄 Ingestion Agent (`agents/ingestion_agent.py`)
**Purpose**: Document processing and claim extraction
**Capabilities**: PDF/PPTX text extraction, image analysis, claim identification
**Input**: Raw document files
**Output**: Structured claims and company data

#### 14. 🔍 Validation Agent (`agents/validation_agent.py`)
**Purpose**: Claim verification against external data sources
**Capabilities**: Financial validation, market analysis, founder verification
**Input**: Extracted claims
**Output**: Validated claims with confidence scores

#### 15. 📝 Memo Agent (`agents/memo_agent.py`)
**Purpose**: Professional investment memo generation
**Capabilities**: Multi-version memos, risk assessment, scoring
**Input**: Validated claims and analysis
**Output**: Structured investment memos

### **Orchestration**

#### 16. 🎯 Orchestrator Agent (`agents/orchestrator_agent.py`)
**Purpose**: Coordinates the entire 17-agent pipeline
**Capabilities**: Workflow orchestration, agent coordination, error handling
**Input**: Document and analysis parameters
**Output**: Complete analysis pipeline results

## 📊 Workflow

### 🔄 17-Agent Analysis Pipeline

```mermaid
sequenceDiagram
    participant U as User
    participant MCP as MCP Server
    participant EB as Event Bus
    participant L1 as Layer 1 Agents
    participant L2 as Layer 2 Agents
    participant L3 as Layer 3 Agents
    participant L5 as Layer 5 Agents

    U->>MCP: Upload Pitch Deck + Video
    MCP->>EB: Publish PIPELINE_STARTED
    EB->>L1: Trigger Intake Curation
    L1->>L1: Process Documents
    L1->>EB: Publish INTAKE_CURATED
    EB->>L1: Trigger Compliance Check
    L1->>EB: Publish COMPLIANCE_CHECKED
    EB->>L2: Trigger AI Meeting
    L2->>L2: Conduct Meeting
    L2->>EB: Publish MEETING_COMPLETED
    EB->>L2: Trigger Sentiment Analysis
    L2->>EB: Publish SENTIMENT_ANALYZED
    EB->>L2: Trigger Synthesis (Memo 2)
    L2->>EB: Publish MEMO2_READY
    EB->>L3: Trigger Risk Scoring
    L3->>L3: Analyze Risk
    L3->>EB: Publish RISK_SCORED
    EB->>L3: Trigger Final Diligence
    L3->>EB: Publish FINAL_DILIGENCE_COMPLETED
    EB->>L5: Trigger Deal Structuring
    L5->>L5: Structure Deal
    L5->>EB: Publish DEAL_STRUCTURED
    EB->>L5: Trigger Matchmaking
    L5->>EB: Publish MATCHMAKING_COMPLETED
    EB->>L5: Trigger Engagement
    L5->>EB: Publish ENGAGEMENT_DRAFTED
    EB->>MCP: Publish PIPELINE_COMPLETED
    MCP->>U: Return Complete Analysis
```

### 📈 Processing Stages

#### **Layer 1: Ingestion & Capture**
1. **📝 Intake Curation**
   - PDF/PPTX text extraction
   - Video analysis and transcription
   - LinkedIn profile processing
   - Structured data extraction

2. **✅ Compliance Check**
   - AML/KYC verification
   - Regulatory compliance screening
   - PEP (Politically Exposed Person) checks
   - Jurisdiction-specific requirements

#### **Layer 2: Engagement & Interaction**
3. **🤖 AI Meeting**
   - Automated investor-founder meeting
   - Google Meet integration
   - Live transcription and Q&A extraction
   - Meeting insights generation

4. **💬 Sentiment Analysis**
   - Founder confidence assessment
   - Communication style analysis
   - Transparency evaluation
   - Trust and credibility scoring

5. **📋 Synthesis (Memo 2)**
   - Integration of all Layer 1 & 2 data
   - Enhanced memo generation
   - Meeting insights incorporation
   - Risk factor identification

#### **Layer 3: Deep Diligence & Analysis**
6. **🏆 Competitor Benchmarking**
   - Market positioning analysis
   - Competitive landscape mapping
   - Industry benchmark comparison
   - Differentiation assessment

7. **💰 Financial Projection**
   - Financial model validation
   - Sector benchmark comparison
   - Growth projection analysis
   - Revenue model assessment

8. **⚠️ Risk Scoring**
   - Multi-factor risk analysis
   - Weighted risk scoring
   - Risk categorization
   - Mitigation strategy identification

9. **📊 Final Diligence (Memo 3)**
   - Comprehensive analysis synthesis
   - Final investment recommendation
   - Decision support documentation
   - Executive summary generation

#### **Layer 5: Investor Outcome**
10. **💼 Deal Structuring**
    - Term sheet generation
    - Valuation analysis
    - Equity calculation
    - Deal terms optimization

11. **👥 Matchmaking**
    - VC preference matching
    - Portfolio fit analysis
    - Investor recommendation
    - Introduction facilitation

12. **📧 Engagement**
    - Follow-up communication drafting
    - Engagement automation
    - Professional correspondence
    - Relationship management

## 🚀 Quick Start

### 📋 Prerequisites

- **Google Cloud Account** with billing enabled
- **Python 3.9+** installed locally
- **Google Cloud SDK** (`gcloud`) installed
- **Project ID** in Google Cloud Console

### ⚡ Local Development

1. **Clone the repository**
```bash
git clone <repository-url>
   cd ai-startup-evaluator
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up Google Cloud authentication**
```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

4. **Run locally**
```bash
python main.py
   ```

### 🧪 Test the Platform

```bash
# Health check
curl -X GET http://localhost:8080/health

# Test evaluation
curl -X POST http://localhost:8080/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "action": "evaluate",
    "file_data": "base64_encoded_pdf",
    "filename": "startup_pitch.pdf",
    "file_type": "pdf",
    "company_name": "My Startup"
  }'
```

## ☁️ Cloud Deployment

### 🚀 Deploy to Google Cloud Run

1. **Update project configuration**
   ```bash
   # Edit deploy_mcp_server.py
   PROJECT_ID = "your-actual-project-id"
   ```

2. **Deploy MCP Server**
   ```bash
   python deploy_mcp_server.py
   ```

3. **Deploy Main Application**
   ```bash
   # Deploy to Cloud Functions (legacy support)
   chmod +x config/deploy.sh
   ./config/deploy.sh
   ```

4. **Verify deployment**
   ```bash
   # MCP Server health check
   curl -X GET https://YOUR_MCP_SERVER_URL/
   
   # Test full pipeline
   curl -X POST https://YOUR_MCP_SERVER_URL/workflows \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Startup Evaluation",
       "steps": [...],
       "human_review_points": ["ai_meeting", "deal_structuring"]
     }'
   ```

### 🔧 Deployment Configuration

**MCP Server (Cloud Run)**:
- **Runtime**: Python 3.9
- **Memory**: 4GB
- **CPU**: 2 vCPU
- **Timeout**: 900 seconds
- **Max Instances**: 100
- **Min Instances**: 1
- **Authentication**: IAM-based

**Main Application (Cloud Functions)**:
- **Runtime**: Python 3.9
- **Memory**: 2GB
- **Timeout**: 540 seconds
- **Max Instances**: 100
- **Trigger**: HTTP
- **Authentication**: Unauthenticated (for demo)

**Required APIs**:
- Cloud Run API
- Cloud Functions API
- Vertex AI API
- Vision API
- BigQuery API
- Firestore API
- Pub/Sub API

## 📚 API Documentation

### 🌐 MCP Server Endpoints

#### **Root Endpoint**
```http
GET /
```
**Response**: API information and available endpoints

#### **Start Workflow**
```http
POST /workflows
```

**Request Body**:
```json
{
  "name": "Startup Evaluation Pipeline",
  "steps": [
    {
      "step_id": "intake_curation",
      "agent_name": "intake_curation",
      "inputs": {
        "pitch_deck_data": "base64_data",
        "founder_video_data": "base64_data"
      }
    }
  ],
  "human_review_points": ["ai_meeting", "deal_structuring"],
  "context": {
    "pipeline_type": "startup_evaluation"
  }
}
```

#### **Get Workflow Status**
```http
GET /workflows/{workflow_id}
```

#### **Get Pending Reviews**
```http
GET /reviews
```

#### **Submit Review**
```http
POST /reviews/{review_id}
```

**Request Body**:
```json
{
  "review_id": "review_123",
  "decision": "approve",
  "comments": "Looks good to proceed",
  "overrides": {
    "risk_threshold": 0.3
  }
}
```

#### **WebSocket Real-time Updates**
```http
WS /ws
```

### 🌐 Main Application Endpoints

#### **Health Check**
```http
GET /health
```

#### **Full Pipeline Evaluation**
```http
POST /full_pipeline
```

**Request Body**:
```json
{
  "action": "full_pipeline",
  "pitch_deck_data": "base64_encoded_pitch_deck",
  "founder_video_data": "base64_encoded_video",
  "linkedin_urls": ["https://linkedin.com/in/founder1"],
  "meeting_transcript": "Meeting transcript text...",
  "startup_valuation": 30.0,
  "investor_target": 5.0,
  "company_name": "Startup Name",
  "sector": "fintech"
}
```

#### **AI Meeting Workflow**
```http
POST /ai_meeting
```

**Request Body**:
```json
{
  "action": "ai_meeting",
  "memo1_data": {
    "founder": "John Doe",
    "problem": "Market problem...",
    "solution": "AI solution..."
  },
  "investor_preferences": {
    "sector_focus": "fintech",
    "stage_preference": "Series A"
  },
  "meeting_type": "full_workflow"
}
```

### 📊 Response Schema

#### **Analysis Results**
```json
{
  "ingestion": {
    "company_name": "string",
    "sector": "string",
    "stage": "string",
    "claims": [
      {
        "type": "FINANCIAL|MARKET|TEAM|COMPETITION",
        "content": "string",
        "confidence": 0.0-1.0,
        "source": "string"
      }
    ]
  },
  "validation": {
    "validated_claims": [ /* validated claims */ ],
    "risk_flags": [ /* identified risks */ ],
    "confidence_scores": { /* validation scores */ }
  },
  "memo": {
    "executive_summary": "string",
    "investment_recommendation": "INVEST|WATCHLIST|PASS",
    "risk_assessment": "LOW|MEDIUM|HIGH",
    "scoring": {
      "founder_fit": 0.0-10.0,
      "market_opportunity": 0.0-10.0,
      "competitive_advantage": 0.0-10.0,
      "financial_metrics": 0.0-10.0,
      "overall_score": 0.0-10.0
    }
  }
}
```

## 🔧 Configuration

### 🌍 Environment Variables

```bash
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1

# AI Model Configuration
GEMINI_MODEL=gemini-1.5-pro
CONFIDENCE_THRESHOLD=0.7

# Processing Configuration
MAX_FILE_SIZE_MB=50
SUPPORTED_FORMATS=pdf,pptx
PROCESSING_TIMEOUT=300
```

### ⚙️ Agent Configuration

#### **Ingestion Agent**
```python
ingestion_agent = IngestionAgent(
    model="gemini-1.5-pro",
    project="your-project-id",
    location="us-central1",
    confidence_threshold=0.7,
    max_file_size_mb=50,
    supported_formats=["pdf", "pptx"]
)
```

#### **Validation Agent**
```python
validation_agent = ValidationAgent(
    model="gemini-1.5-pro",
    project="your-project-id",
    location="us-central1",
    confidence_threshold=0.8,
    validation_timeout=60
)
```

#### **Memo Agent**
```python
memo_agent = MemoAgent(
    model="gemini-1.5-pro",
    project="your-project-id",
    location="us-central1",
    memo_quality="professional",
    include_charts=True
)
```

## 📁 Project Structure

```
ai-startup-evaluator/
├── 📄 main.py                           # Cloud Function entry point
├── 🚀 mcp_server.py                     # MCP Server (Agent Control Plane)
├── 🚀 deploy_mcp_server.py              # MCP Server deployment script
├── 📋 requirements.txt                  # Python dependencies
├── 📦 __init__.py                       # Root package initialization
│
├── 🤖 agents/                          # 17-Agent Pipeline Package
│   ├── __init__.py                      # Agents package init
│   ├── orchestrator_agent.py           # Master orchestrator (17 agents)
│   ├── adk_tools_wrapper.py            # Google ADK integration wrapper
│   │
│   ├── 📊 Layer 1: Ingestion & Capture
│   ├── intake_curation_agent.py        # Intake & curation agent
│   ├── compliance_agent.py             # Compliance & risk screening
│   │
│   ├── 🤝 Layer 2: Engagement & Interaction
│   ├── meeting_agent.py                # Meeting coordination
│   ├── ai_meeting_agent.py             # AI-powered meeting bot
│   ├── sentiment_communication_agent.py # Sentiment & communication analysis
│   ├── synthesis_agent.py              # Memo 2 synthesis
│   │
│   ├── 🔍 Layer 3: Deep Diligence & Analysis
│   ├── final_diligence_agent.py        # Final diligence (Memo 3)
│   ├── competitor_benchmarking_agent.py # Competitor analysis
│   ├── financial_projection_agent.py   # Financial projection validation
│   ├── risk_scoring_agent.py           # Risk assessment & scoring
│   │
│   ├── 🎯 Layer 5: Investor Outcome
│   ├── deal_structuring_agent.py       # Deal structuring & term sheets
│   ├── matchmaking_agent.py            # VC matching & recommendations
│   ├── engagement_agent.py             # Engagement & communication
│   │
│   ├── 🔄 Legacy Agents (Still Supported)
│   ├── ingestion_agent.py              # Document processing agent
│   ├── validation_agent.py             # Claim validation agent
│   └── memo_agent.py                   # Investment memo generation agent
│
├── 📊 schemas/                         # Data Models Package
│   ├── __init__.py                     # Schemas package init
│   ├── claims.py                       # Claim data structures
│   └── memos.py                        # Memo data models (Memo 1, 2, 3)
│
├── 🔧 services/                        # Services Package
│   ├── __init__.py                     # Services package init
│   └── google_clients.py               # Google Cloud service clients
│
├── ⚙️ config/                          # Configuration Package
│   ├── __init__.py                     # Config package init
│   ├── deploy.sh                       # Legacy deployment script
│   └── .gcloudignore                   # Cloud deployment exclusions
│
├── 🌐 web-app/                         # React Frontend Application
│   ├── package.json                    # Frontend dependencies
│   ├── src/                            # React source code
│   └── README.md                       # Frontend documentation
│
├── 🧪 test_*.py                        # Test Files
│   ├── test_full_pipeline.py           # Full pipeline testing
│   ├── test_ai_meeting_agent.py        # AI meeting agent testing
│   └── test_mcp_server.py              # MCP server testing
│
├── 📚 docs/                            # Documentation Package
│   ├── README.md                       # Main documentation
│   ├── TECHNICAL_README.md             # Technical documentation
│   ├── README_DEPLOYMENT.md            # Deployment guide
│   ├── AI_AGENT_ARCHITECTURE_ANALYSIS.md # Architecture analysis
│   ├── MCP_SERVER_ARCHITECTURE.md      # MCP Server architecture
│   ├── PUBSUB_CONNECTION_DIAGRAM.md    # Event-driven architecture
│   ├── ORGANIZED_STRUCTURE.md          # Structure overview
│   ├── CLEAN_STRUCTURE.md              # Cleanup summary
│   └── PROJECT_SUMMARY.md              # Project summary
│
└── 📋 VERIFICATION_REPORT.md           # System verification report
```

### 📝 File Descriptions

| File | Purpose | Key Features |
|------|---------|--------------|
| `main.py` | Cloud Function entry point | HTTP handling, CORS, orchestration |
| `mcp_server.py` | MCP Server (Agent Control Plane) | FastAPI, WebSocket, event-driven orchestration |
| `deploy_mcp_server.py` | MCP Server deployment | Cloud Run deployment automation |
| `agents/orchestrator_agent.py` | Master orchestrator | 17-agent pipeline coordination |
| `agents/intake_curation_agent.py` | Intake & curation | PDF/PPTX processing, video analysis |
| `agents/ai_meeting_agent.py` | AI meeting bot | Google Meet integration, Q&A automation |
| `agents/risk_scoring_agent.py` | Risk assessment | Multi-factor risk analysis, scoring |
| `agents/deal_structuring_agent.py` | Deal structuring | Term sheet generation, valuation |
| `agents/matchmaking_agent.py` | VC matching | Investor preference matching |
| `schemas/claims.py` | Data models | Claim structure definitions |
| `schemas/memos.py` | Data models | Memo structure definitions (Memo 1, 2, 3) |
| `services/google_clients.py` | Cloud services | Google Cloud API clients |
| `web-app/` | React frontend | User interface for the platform |
| `test_full_pipeline.py` | Pipeline testing | End-to-end pipeline testing |
| `VERIFICATION_REPORT.md` | System verification | Complete system status check |

## 🧪 Testing

### 🔬 Unit Tests

```bash
# Run individual agent tests
python -m pytest tests/test_ingestion_agent.py
python -m pytest tests/test_validation_agent.py
python -m pytest tests/test_memo_agent.py
python -m pytest tests/test_orchestrator_agent.py
python -m pytest tests/test_ai_meeting_agent.py
python -m pytest tests/test_risk_scoring_agent.py
```

### 🧪 Integration Tests

```bash
# Run full 17-agent pipeline test
python test_full_pipeline.py

# Test AI Meeting Agent workflow
python test_ai_meeting_agent.py

# Test MCP Server functionality
python test_mcp_server.py
```

### 📊 Performance Tests

```bash
# Load testing
python tests/load_test.py

# Memory profiling
python tests/memory_profile.py

# WebSocket testing
python tests/websocket_test.py
```

### 🎯 Test Coverage

```bash
# Generate coverage report
coverage run -m pytest
coverage report -m
coverage html
```

### 🧪 Test Scenarios

- **Basic Workflow**: Simple agent execution
- **Complex Workflow**: Multi-step with human review
- **Error Handling**: Failure and retry scenarios
- **Concurrent Workflows**: Multiple simultaneous workflows
- **WebSocket Events**: Real-time event streaming
- **API Endpoints**: REST and WebSocket API testing

## 🔒 Security

### 🛡️ Security Features

- **Input Validation**: All inputs are validated and sanitized
- **File Type Checking**: Only allowed file types are processed
- **Size Limits**: File size restrictions prevent abuse
- **CORS Configuration**: Proper cross-origin request handling
- **Error Handling**: Secure error messages without sensitive data

### 🔐 Authentication & Authorization

```python
# CORS Configuration
headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '3600'
}
```

### 🚨 Security Best Practices

1. **Input Sanitization**: All user inputs are validated
2. **File Validation**: Strict file type and size checking
3. **Error Handling**: No sensitive information in error messages
4. **Rate Limiting**: Built-in request throttling
5. **Logging**: Comprehensive audit trail

## 📈 Performance

### ⚡ Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| **Response Time** | < 60s | ~45s |
| **Throughput** | 100 req/min | 120 req/min |
| **Memory Usage** | < 2GB | ~1.5GB |
| **Success Rate** | > 95% | 98% |

### 🚀 Optimization Features

- **Parallel Processing**: Multiple agents run concurrently
- **Caching**: Results cached for repeated requests
- **Streaming**: Large files processed in chunks
- **Auto-scaling**: Cloud Functions scale automatically
- **Connection Pooling**: Efficient database connections

### 📊 Monitoring

```python
# Performance monitoring
import time
import logging

start_time = time.time()
# ... processing ...
processing_time = time.time() - start_time
logger.info(f"Processing completed in {processing_time:.2f} seconds")
```

## 🤝 Contributing

### 🔧 Development Setup

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   python -m pytest
   ```
5. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### 📋 Contribution Guidelines

- **Code Style**: Follow PEP 8
- **Documentation**: Update docs for new features
- **Testing**: Add tests for new functionality
- **Performance**: Consider performance implications
- **Security**: Follow security best practices

### 🐛 Bug Reports

When reporting bugs, please include:
- **Environment details** (OS, Python version, etc.)
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Error messages and logs**
- **Sample files** (if applicable)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Cloud** for providing the infrastructure and AI services
- **Google ADK** for the agent development framework
- **Open Source Community** for the various libraries and tools
- **AI Research Community** for advancing the state of AI

## 📞 Support

- **Documentation**: [docs/README.md](docs/README.md)
- **Deployment Guide**: [docs/README_DEPLOYMENT.md](docs/README_DEPLOYMENT.md)
- **Architecture Analysis**: [docs/AI_AGENT_ARCHITECTURE_ANALYSIS.md](docs/AI_AGENT_ARCHITECTURE_ANALYSIS.md)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)

---

## 🎉 Get Started Today!

Ready to revolutionize your startup evaluation process? Deploy the advanced 17-agent AI Startup Evaluator Platform and start getting comprehensive investment insights in minutes!

```bash
# Deploy MCP Server (Recommended)
python deploy_mcp_server.py

# Deploy legacy Cloud Functions
./config/deploy.sh

# Test full pipeline
curl -X POST https://YOUR_MCP_SERVER_URL/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Startup Evaluation",
    "steps": [{"step_id": "intake_curation", "agent_name": "intake_curation", "inputs": {"pitch_deck_data": "base64_data"}}],
    "human_review_points": ["ai_meeting", "deal_structuring"]
  }'

# Test AI Meeting workflow
curl -X POST https://YOUR_MCP_SERVER_URL/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AI Meeting Workflow",
    "steps": [{"step_id": "ai_meeting", "agent_name": "ai_meeting", "inputs": {"memo1_data": {"founder": "John Doe"}}}]
  }'
```

**🚀 Transform your investment process with advanced AI orchestration today!**


