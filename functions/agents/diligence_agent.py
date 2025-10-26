# functions/agents/diligence_agent.py

import logging
import json
import re
from datetime import datetime
from typing import Dict, Any, Optional

# Google Cloud Imports
import vertexai
from vertexai.generative_models import GenerativeModel
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import RunReportRequest
from firebase_admin import firestore

# Import PerplexitySearchService for market benchmarking
from services.perplexity_service import PerplexitySearchService

class DiligenceAgent:
    """
    Agent 2: Diligence & Synthesis
    Takes curated Memo 1 data, enriches it with live Google Analytics data and public
    founder data, and synthesizes it into a comprehensive Memo 1 Diligence.
    """

    MEMO_2_PROMPT_TEMPLATE = """
    You are a Senior Venture Capital Analyst with 15+ years of experience in early-stage investments. Your task is to synthesize available information about a startup into a single, comprehensive diligence report (Memo 2).

    You have been given:
    1.  **Curated Data (Memo 1):** The startup's claims, extracted from their pitch deck or transcript, including comprehensive Founders Checklist data.
    2.  **Google Analytics Data:** If available, verified user metrics from their Google Analytics property. If not available, skip GA-related analysis.
    3.  **Public Founder Data:** Detailed information scraped from the founder's public LinkedIn profile.

    **ANALYSIS INSTRUCTIONS:**
    - Base ALL analysis STRICTLY on the provided data sources
    - Do NOT make up or hallucinate any information
    - If information is not available in the provided data, state "Information not available in provided data sources"
    - Use the LinkedIn data to analyze founder background and experience
    - Cross-reference all claims with the available data sources
    - Focus on validating the comprehensive Founders Checklist data from Memo 1
    - If Google Analytics data is not available or shows errors, focus analysis on Memo 1 data and LinkedIn data only

    **FOUNDERS CHECKLIST VALIDATION:**
    The Memo 1 data now includes comprehensive analysis of:
    - Industry & Market Size (Talent Acquisition, EdTech, Simulation Learning, AI in HR, etc.)
    - Technology Stack (AI engine, simulation workflows, SaaS stack, security & infra)
    - Revenue Streams & Pricing Models
    - Unit Economics (CAC, LTV, recurring vs one-time)
    - Competitor Analysis (Mercor, Degreed, Skillfully)
    - Founders Profiles (Aditya Sambamoorthy, Abhishek Mehta)
    - Provisional Financials & Valuation
    - Risks & Mitigation
    - Pipeline & Growth Projections
    - Fundraise ask & round structure

    Your Instructions:
    - Cross-reference the 'traction' claims from Memo 1 with the live Google Analytics data to validate user metrics and growth claims.
    - Analyze the founder's background from Memo 1 against their detailed LinkedIn profile to assess founder-market fit and credibility.
    - Validate market size claims against industry benchmarks and public datasets.
    - Cross-check competitor information and funding data.
    - Assess technology stack claims and technical feasibility.
    - Evaluate revenue model and pricing strategy against industry standards.
    - Pay special attention to the founder's experience and domain expertise alignment with the startup's solution.
    - Evaluate the alignment between the startup's solution and the founder's domain expertise.
    - Use the Market Benchmarking Data to analyze competitive positioning, industry averages, and market opportunity.
    - Compare the startup's metrics against industry benchmarks and competitor data.
    - Assess market opportunity and competitive advantages based on the benchmarking data.
    - Based on ALL available information, provide a score (from 1 to 10) and a detailed analysis for each of the following diligence points:

    **DILIGENCE FRAMEWORK:**
    1. **Founder-Market Fit (Score 1-10):**
       - Analyze the founder's background from the provided LinkedIn data
       - Assess alignment between founder's experience and the problem/solution from Memo 1
       - Use only the provided data sources

    2. **Problem Validation (Score 1-10):**
       - Evaluate the severity and market size of the problem based STRICTLY on Memo 1 data
       - Cross-reference with Google Analytics data to validate market demand
       - Assess if the problem is well-defined and addressable based on uploaded document

    3. **Solution & Product-Market Fit (Score 1-10):**
       - Analyze the uniqueness and defensibility of the solution based on Memo 1
       - Evaluate technical feasibility and scalability from uploaded document
       - Assess product-market fit indicators from GA data

    4. **Traction & Metrics Validation (Score 1-10):**
       - Cross-reference startup's traction claims with Google Analytics data
       - Validate user growth, engagement, and conversion metrics based on Memo 1
       - Assess revenue claims and business model viability from uploaded document

    5. **Team & Execution Capability (Score 1-10):**
       - Analyze team composition and relevant experience based on Memo 1
       - Evaluate founder's leadership and execution track record from uploaded document
       - Assess technical and business expertise alignment from Memo 1

    6. **Market Opportunity & Competition (Score 1-10):**
       - Analyze competitive positioning and differentiation from uploaded document
       - Assess market timing and growth potential based on Memo 1
       - Use competition and market_size data from Memo 1 only

    7. **Benchmarking Analysis (Score 1-10):**
       - Compare the startup's product/solution with competitors mentioned in Memo 1
       - Analyze competitive advantages and disadvantages based on provided data
       - Assess market positioning and differentiation

    **OUTPUT REQUIREMENTS:**
    - Generate a final "investment_thesis" that provides a holistic investment recommendation
    - Provide an overall "confidence_score" (1-10) for the investment opportunity
    - Include "key_risks" and "mitigation_strategies" 
    - Suggest "due_diligence_next_steps" for further investigation
    - Provide "investment_recommendation" (STRONG BUY, BUY, HOLD, PASS)

    **IMPORTANT: Keep all analysis concise and under 200 characters per field to prevent JSON truncation.**

    Respond ONLY with a valid JSON object. Do not include any other text or markdown formatting.

    **JSON SCHEMA (KEEP ALL RESPONSES UNDER 200 CHARACTERS):**
    {{
        "google_analytics_summary": {{
            "data_source": "Not Available",
            "property_id": "Not Available",
            "performance_analysis": "GA data not available for analysis"
        }},
        "industry_market_validation": {{
            "market_size_validation": "<brief validation under 200 chars>",
            "competitive_landscape": "<brief assessment under 200 chars>"
        }},
        "technology_validation": {{
            "technical_feasibility": "<brief assessment under 200 chars>",
            "innovation_level": "<brief assessment under 200 chars>"
        }},
        "financial_validation": {{
            "revenue_model": "<brief assessment under 200 chars>",
            "unit_economics": "<brief assessment under 200 chars>"
        }},
        "founder_analysis": {{
            "score": <number 1-10>,
            "background": "<brief founder background under 200 chars>",
            "market_fit": "<brief market fit assessment under 200 chars>"
        }},
        "problem_validation": {{
            "score": <number 1-10>,
            "severity": "<brief problem severity under 200 chars>",
            "market_need": "<brief market need assessment under 200 chars>"
        }},
        "solution_analysis": {{
            "score": <number 1-10>,
            "uniqueness": "<brief uniqueness assessment under 200 chars>",
            "feasibility": "<brief feasibility assessment under 200 chars>"
        }},
        "traction_analysis": {{
            "score": <number 1-10>,
            "validation": "<brief traction validation under 200 chars>",
            "growth_potential": "<brief growth assessment under 200 chars>"
        }},
        "team_analysis": {{
            "score": <number 1-10>,
            "composition": "<brief team composition under 200 chars>",
            "capability": "<brief capability assessment under 200 chars>"
        }},
        "market_analysis": {{
            "score": <number 1-10>,
            "opportunity": "<brief market opportunity under 200 chars>",
            "competition": "<brief competition analysis under 200 chars>"
        }},
        "investment_thesis": "<comprehensive thesis under 200 chars>",
        "confidence_score": <number 1-10>,
        "key_risks": ["<risk 1 under 50 chars>", "<risk 2 under 50 chars>"],
        "investment_recommendation": "<STRONG BUY, BUY, HOLD, or PASS>",
        "market_benchmarking": {{
            "industry_averages": {{
                "metrics": [
                    {{"label": "<dynamic metric label>", "value": "<value with context>"}},
                    {{"label": "<dynamic metric label>", "value": "<value with context>"}},
                    {{"label": "<dynamic metric label>", "value": "<value with context>"}}
                ]
            }},
            "competitive_landscape": [
                {{
                    "company_name": "<company name>",
                    "is_target": true/false,
                    "metric1_value": "<value>",
                    "metric2_value": "<value>",
                    "fees": "<value>",
                    "ai_powered": "<Yes/No/Partial>",
                    "notes": "<brief competitive notes under 100 chars>"
                }}
            ],
            "metric_labels": {{
                "metric1": "<dynamic label for first metric>",
                "metric2": "<dynamic label for second metric>"
            }},
            "market_opportunity": {{
                "description": "<full paragraph describing market opportunity, growth projections, and competitive advantages>"
            }}
        }}
    }}

    **JSON DATA INPUTS:**
    ---
    Memo 1 Data: {memo_1_data}
    ---
    Google Analytics Data: {ga_data}
    ---
    Public Founder Data: {public_data}
    ---
    Market Benchmarking Data: {market_benchmarking_data}
    ---
    """

    def __init__(self, project: str, location: str = "asia-south1"):
        self.project = project
        self.location = location
        self.logger = logging.getLogger(self.__class__.__name__)
        
        # Initialize clients to None - will be set up in set_up()
        self.db = None
        self.ga_client = None
        self.gemini_model = None
        self.perplexity_service = None

    def set_up(self):
        """Initializes all necessary Google Cloud clients and models."""
        self.logger.info(f"Setting up DiligenceAgent for project '{self.project}'...")
        
        try:
            # Initialize Vertex AI
            vertexai.init(project=self.project, location=self.location)
            self.logger.info(f"Vertex AI initialized in project '{self.project}' and location '{self.location}'.")
            
            # Use Gemini 1.5 Pro for maximum accuracy in diligence analysis
            self.gemini_model = GenerativeModel("gemini-1.5-flash")
            self.logger.info("GenerativeModel ('gemini-1.5-flash') initialized for diligence analysis.")
            
            # Initialize Firestore client
            self.db = firestore.client()
            self.logger.info("Firestore client initialized successfully.")
            
            # Initialize Google Analytics client
            self.ga_client = BetaAnalyticsDataClient()
            self.logger.info("Google Analytics client initialized successfully.")
            
            # Initialize PerplexitySearchService for market benchmarking
            self.perplexity_service = PerplexitySearchService(project=self.project, location=self.location)
            self.logger.info("PerplexitySearchService initialized for market benchmarking.")

            self.logger.info("✅ DiligenceAgent setup complete.")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize DiligenceAgent clients: {e}", exc_info=True)
            raise

    def _extract_linkedin_url_from_memo(self, memo_1_data: dict) -> str:
        """
        Extracts LinkedIn URL from Memo 1 data if available.
        Falls back to default URL if not found.
        """
        # Try to extract LinkedIn URL from various possible fields
        linkedin_url = None
        
        # Check if LinkedIn URL is explicitly mentioned in the memo
        memo_text = json.dumps(memo_1_data, indent=2).lower()
        
        # Look for LinkedIn URL patterns
        import re
        linkedin_patterns = [
            r'linkedin\.com/in/[a-zA-Z0-9\-]+',
            r'https://www\.linkedin\.com/in/[a-zA-Z0-9\-]+',
            r'www\.linkedin\.com/in/[a-zA-Z0-9\-]+'
        ]
        
        for pattern in linkedin_patterns:
            matches = re.findall(pattern, memo_text)
            if matches:
                linkedin_url = matches[0]
                if not linkedin_url.startswith('http'):
                    linkedin_url = f"https://{linkedin_url}"
                break
        
        # If no LinkedIn URL found, use default
        if not linkedin_url:
            linkedin_url = "https://www.linkedin.com/in/your-linkedin-profile/"
            self.logger.info("No LinkedIn URL found in memo, using default")
        else:
            self.logger.info(f"Found LinkedIn URL in memo: {linkedin_url}")
        
        return linkedin_url

    def _fetch_public_linkedin_data(self, linkedin_url: str, memo_1_data: dict = None) -> Dict[str, Any]:
        """
        Fetches LinkedIn data based on the actual URL from the memo.
        For now, returns mock data but can be extended to real scraping.
        """
        self.logger.info(f"Fetching public data for LinkedIn URL: {linkedin_url}")
        
        # Extract founder name from memo for more realistic mock data
        founder_name = "Unknown Founder"
        if memo_1_data and "founder_name" in memo_1_data:
            founder_name = memo_1_data["founder_name"]
        
        # Extract company name from memo
        company_name = "Startup Company"
        if memo_1_data and "title" in memo_1_data:
            company_name = memo_1_data["title"]
        
        # TODO: In the future, implement real LinkedIn scraping here
        # For now, return mock data that's customized based on the memo
        
        return {
            "full_name": founder_name,
            "headline": f"Founder & CEO at '{company_name}' | Entrepreneur",
            "location": "Location not specified",
            "summary": f"Founder of {company_name} with experience in building innovative solutions. Background extracted from pitch deck analysis.",
            "connections": "500+",
            "experience": [
                {
                    "role": "Founder & CEO",
                    "company": company_name,
                    "duration": "Current",
                    "description": f"Leading {company_name} in developing innovative solutions for the market."
                }
            ],
            "education": [
                {
                    "school": "University",
                    "degree": "Degree not specified",
                    "year": "Year not specified",
                    "achievements": "Details not available in provided data"
                }
            ],
            "skills": [
                "Entrepreneurship",
                "Leadership", 
                "Business Strategy",
                "Product Development"
            ],
            "certifications": [],
            "achievements": [],
            "languages": ["English"],
            "data_source": f"LinkedIn Profile Analysis (URL: {linkedin_url})",
            "status": "MOCK_DATA_BASED_ON_MEMO",
            "profile_completeness": "Limited - based on memo data only",
            "last_updated": datetime.now().strftime("%Y-%m-%d"),
            "verification_status": "Mock data - real scraping not implemented",
            "note": "This is mock data. Real LinkedIn scraping would require additional implementation."
        }

    def run(self, startup_id: str, ga_property_id: str, linkedin_url: str) -> Dict[str, Any]:
        """Main entry point. Orchestrates the creation of Memo 1 Diligence."""
        start_time = datetime.now()
        self.logger.info(f"Starting diligence process for startup_id: {startup_id}")
        
        try:
            # 1. Fetch the curated Memo 1 data from Firestore
            memo_1_data = self._fetch_memo_1_data(startup_id)
            if not memo_1_data:
                raise ValueError("Memo 1 data not found in Firestore.")

            # 2. Extract LinkedIn URL from memo if not provided
            if linkedin_url == "https://www.linkedin.com/in/your-linkedin-profile/":
                linkedin_url = self._extract_linkedin_url_from_memo(memo_1_data)

            # 3. Fetch live data from Google Analytics
            ga_data = self._fetch_google_analytics_data(ga_property_id)

            # 4. Fetch public data from LinkedIn (with memo context)
            public_data = self._fetch_public_linkedin_data(linkedin_url, memo_1_data)
            
            # 5. Fetch market benchmarking data using Perplexity API
            market_benchmarking_data = self._fetch_market_benchmarking(memo_1_data)
            
            # 6. Synthesize all data into Memo 1 Diligence using Gemini
            memo_2_json = self._generate_memo_2(memo_1_data, ga_data, public_data, market_benchmarking_data)

            processing_time = (datetime.now() - start_time).total_seconds()
            self.logger.info(f"Successfully generated Memo 1 Diligence for '{startup_id}' in {processing_time:.2f} seconds.")

            return {
                "status": "SUCCESS",
                "memo_2": memo_2_json  # Keep this field name for compatibility
            }
        except Exception as e:
            self.logger.error(f"Error during diligence process for startup_id '{startup_id}': {e}", exc_info=True)
            return {
                "status": "FAILED",
                "error": str(e)
            }

    def _fetch_memo_1_data(self, startup_id: str) -> Optional[Dict[str, Any]]:
        """Fetches the result from the IntakeCurationAgent from Firestore."""
        self.logger.info(f"Fetching Memo 1 data for startup: {startup_id}")
        # NOTE: Assumes Memo 1 is stored in a collection named 'ingestionResults'
        doc_ref = self.db.collection('ingestionResults').document(startup_id)
        doc = doc_ref.get()
        if doc.exists:
            return doc.to_dict().get("memo_1", {})
        return None

    def _fetch_google_analytics_data(self, property_id: str) -> Dict[str, Any]:
        """Connects to the GA Data API to fetch live metrics."""
        self.logger.info(f"Fetching live data from Google Analytics property: {property_id}")
        try:
            request = RunReportRequest(
                property=f"properties/{property_id}",
                dimensions=[{"name": "country"}],
                metrics=[{"name": "activeUsers"}],
                date_ranges=[{"start_date": "28daysAgo", "end_date": "today"}],
            )
            response = self.ga_client.run_report(request)
            
            # FIX: Add error handling for empty responses
            if not response.rows:
                self.logger.warning("No data returned from Google Analytics")
                return {
                    "total_active_users_last_28_days": 0,
                    "data_source": "Google Analytics Data API",
                    "status": "NO_DATA"
                }
            
            # FIX: Safe processing of metric values
            active_users = 0
            for row in response.rows:
                if row.metric_values and len(row.metric_values) > 0:
                    try:
                        active_users += int(row.metric_values[0].value)
                    except (ValueError, IndexError) as e:
                        self.logger.warning(f"Failed to parse metric value: {e}")
                        continue
            
            ga_summary = {
                "total_active_users_last_28_days": active_users,
                "data_source": "Google Analytics Data API",
                "status": "VERIFIED_LIVE_DATA"
            }
            self.logger.info(f"Successfully fetched GA data: {ga_summary}")
            return ga_summary
        except Exception as e:
            self.logger.warning(f"Could not fetch Google Analytics data: {e}")
            return {"error": "Failed to fetch GA data.", "status": "FETCH_FAILED"}

    def _fetch_market_benchmarking(self, memo_1_data: dict) -> Dict[str, Any]:
        """Fetches market benchmarking data using Perplexity API."""
        self.logger.info("Fetching market benchmarking data using Perplexity API...")
        
        try:
            # Extract company context from memo_1_data
            company_name = memo_1_data.get("title", "the company")
            industry = memo_1_data.get("industry_category", memo_1_data.get("industry", ""))
            
            # Handle industry if it's a list
            if isinstance(industry, list):
                industry = ", ".join(industry)
            
            company_context = f"{company_name}"
            if industry:
                company_context += f" in {industry}"
            
            # Create comprehensive market benchmarking query with target company focus
            target_company = memo_1_data.get("title", company_name)
            query = f"""
            As a Senior Market Research Analyst, provide comprehensive market benchmarking analysis for {company_context}.
            
            **TARGET COMPANY:** {target_company}
            
            Please provide:
            
            1. Industry Averages (with specific metric labels for {industry}):
            - Identify 3 key industry performance metrics with their labels (e.g., "Avg. Transaction Failure Rate" for payments, "Churn Rate" for SaaS)
            - Provide average values for each metric
            - Include total addressable market size with proper label
            - Market growth rate (CAGR) and projected size
            
            2. Competitive Landscape Analysis:
            - List exactly 3-4 main competitors in the industry
            - For each competitor, provide: company name, metric1 value, metric2 value, fees/pricing, AI-powered features (Yes/No/Partial)
            - Include {target_company} in the comparison with their actual or estimated metrics
            - Market positioning and competitive advantages
            
            3. Market Opportunity Assessment:
            - Provide a comprehensive paragraph describing market opportunity, growth projections, and competitive advantages
            - Include specific CAGR, market size projections, and target market share potential
            - Highlight differentiation opportunities and market gaps
            
            **IMPORTANT:** 
            - Focus on recent data (2024-2025) with specific numbers, percentages, and market values
            - Ensure {target_company} is included in the competitive analysis
            - Provide industry-specific metric labels (not generic terms)
            - Include proper citations and sources for all information
            """
            
            # Use PerplexitySearchService to fetch data
            if self.perplexity_service and self.perplexity_service.enabled:
                import asyncio
                results = asyncio.run(self.perplexity_service._perplexity_search(query, max_results=1))
                
                if results and results[0].get("content"):
                    content = results[0]["content"]
                    citations = results[0].get("citations", [])
                    
                    # Process the content to extract structured data
                    market_data = self._process_market_benchmarking_content(content, company_context)
                    
                    # Ensure target company is first in competitive landscape
                    market_data = self._ensure_target_company_first(market_data, memo_1_data)
                    
                    market_data["sources"] = citations
                    market_data["data_source"] = "Perplexity API"
                    market_data["status"] = "VERIFIED_LIVE_DATA"
                    
                    self.logger.info("Successfully fetched market benchmarking data from Perplexity API")
                    return market_data
                else:
                    self.logger.warning("No market benchmarking data returned from Perplexity API")
                    return self._get_default_market_benchmarking()
            else:
                self.logger.warning("PerplexitySearchService not available, using default market benchmarking")
                return self._get_default_market_benchmarking()
                
        except Exception as e:
            self.logger.warning(f"Could not fetch market benchmarking data: {e}")
            return self._get_default_market_benchmarking()

    def _process_market_benchmarking_content(self, content: str, company_context: str) -> Dict[str, Any]:
        """Process Perplexity content to extract structured market benchmarking data."""
        try:
            # Extract target company name from company_context
            target_company = company_context.split(" in ")[0] if " in " in company_context else company_context
            
            # Use Gemini to extract structured data from Perplexity content
            prompt = f"""Extract structured market benchmarking data from the following content about {company_context}.

**CRITICAL - RESPONSE FORMAT:**
Return ONLY a valid JSON object. No markdown, no code blocks, no explanations.
Start with {{ and end with }}.

**Required JSON Structure:**
{{
    "industry_averages": {{
        "metrics": [
            {{"label": "<dynamic metric label>", "value": "<value with context>"}},
            {{"label": "<dynamic metric label>", "value": "<value with context>"}},
            {{"label": "<dynamic metric label>", "value": "<value with context>"}}
        ]
    }},
    "competitive_landscape": [
        {{
            "company_name": "{target_company}",
            "is_target": true,
            "metric1_value": "<value>",
            "metric2_value": "<value>",
            "fees": "<value>",
            "ai_powered": "<Yes/No/Partial>",
            "notes": "<brief competitive notes under 100 chars>"
        }},
        {{
            "company_name": "<competitor name>",
            "is_target": false,
            "metric1_value": "<value>",
            "metric2_value": "<value>",
            "fees": "<value>",
            "ai_powered": "<Yes/No/Partial>",
            "notes": "<brief competitive notes under 100 chars>"
        }}
    ],
    "metric_labels": {{
        "metric1": "<dynamic label for first metric>",
        "metric2": "<dynamic label for second metric>"
    }},
    "market_opportunity": {{
        "description": "<full paragraph describing market opportunity, growth projections, and competitive advantages>"
    }}
}}

**IMPORTANT INSTRUCTIONS:**
1. Ensure {target_company} appears FIRST in competitive_landscape array with is_target: true
2. Extract industry-specific metric labels (e.g., "Avg. Transaction Failure Rate" for payments, "Churn Rate" for SaaS)
3. Include 3-4 competitors total (target + 2-3 others)
4. Provide full paragraph for market_opportunity.description
5. Use dynamic labels based on the industry type mentioned in content

**Content to analyze:**
{content[:4000]}

Extract the data and return ONLY the JSON object."""
            
            response = self.gemini_model.generate_content(prompt)
            result = self._parse_json_from_text(response.text)
            
            if result and isinstance(result, dict):
                return result
            else:
                return self._get_default_market_benchmarking()
                
        except Exception as e:
            self.logger.error(f"Error processing market benchmarking content: {e}")
            return self._get_default_market_benchmarking()

    def _get_default_market_benchmarking(self) -> Dict[str, Any]:
        """Return default market benchmarking data when external data is unavailable."""
        return {
            "industry_averages": {
                "metrics": [
                    {"label": "Avg. Transaction Failure Rate", "value": "8-12% (Industry standard)"},
                    {"label": "Industry Processing Fees", "value": "2.5-3.5% (Industry average)"},
                    {"label": "Market Size", "value": "Market size not available"}
                ]
            },
            "competitive_landscape": [
                {
                    "company_name": "Target Company",
                    "is_target": True,
                    "metric1_value": "Data not available",
                    "metric2_value": "Data not available",
                    "fees": "Data not available",
                    "ai_powered": "Unknown",
                    "notes": "Target company - data from memo analysis"
                },
                {
                    "company_name": "Industry Leader",
                    "is_target": False,
                    "metric1_value": "5-8%",
                    "metric2_value": "2.0-2.5%",
                    "fees": "2.0-2.5%",
                    "ai_powered": "Yes",
                    "notes": "Market leader with AI capabilities"
                }
            ],
            "metric_labels": {
                "metric1": "Failure Rate",
                "metric2": "Processing Fees"
            },
            "market_opportunity": {
                "description": "Market opportunity analysis not available. Industry shows growth potential with AI-powered solutions representing competitive advantages. Target market share of 5-10% achievable with proper execution."
            },
            "data_source": "Default Template",
            "status": "DEFAULT_DATA"
        }

    def _ensure_target_company_first(self, market_data: Dict[str, Any], memo_1_data: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure target company appears first in competitive_landscape array."""
        try:
            target_company = memo_1_data.get("title", "Target Company")
            competitive_landscape = market_data.get("competitive_landscape", [])
            
            # Find target company in the list
            target_found = False
            target_entry = None
            
            for i, company in enumerate(competitive_landscape):
                if company.get("company_name", "").lower() == target_company.lower():
                    target_found = True
                    target_entry = competitive_landscape.pop(i)
                    target_entry["is_target"] = True
                    break
            
            # If target company not found, create entry from memo_1 data
            if not target_found:
                target_entry = {
                    "company_name": target_company,
                    "is_target": True,
                    "metric1_value": "Data not available",
                    "metric2_value": "Data not available", 
                    "fees": "Data not available",
                    "ai_powered": "Unknown",
                    "notes": "Target company - data from memo analysis"
                }
            
            # Ensure target company is first
            if target_entry:
                competitive_landscape.insert(0, target_entry)
            
            # Update the market data
            market_data["competitive_landscape"] = competitive_landscape
            
            self.logger.info(f"Ensured {target_company} is first in competitive landscape")
            return market_data
            
        except Exception as e:
            self.logger.error(f"Error ensuring target company first: {e}")
            return market_data

    def _generate_memo_2(self, memo_1_data: dict, ga_data: dict, public_data: dict, market_benchmarking_data: dict) -> Dict[str, Any]:
        """Uses Gemini to synthesize all data sources into the final Memo 1 Diligence."""
        self.logger.info("Synthesizing all data sources to generate Memo 1 Diligence...")
        
        # Enhanced prompt with analysis instructions
        prompt = self.MEMO_2_PROMPT_TEMPLATE.format(
            memo_1_data=json.dumps(memo_1_data, indent=2),
            ga_data=json.dumps(ga_data, indent=2),
            public_data=json.dumps(public_data, indent=2),
            market_benchmarking_data=json.dumps(market_benchmarking_data, indent=2)
        )
        
        # Use generate_content with standard configuration
        response = self.gemini_model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.1,  # Lower temperature for more factual responses
                "top_p": 0.8,
                "top_k": 40,
                "max_output_tokens": 8192,  # Reduced to prevent truncation with simpler schema
            }
        )
        self.logger.info("Memo 1 Diligence generation complete.")
        return self._parse_json_from_text(response.text)

    def _parse_json_from_text(self, text: str) -> Dict[str, Any]:
        """Safely extracts a JSON object from a string, even with markdown wrappers."""
        self.logger.debug(f"Attempting to parse JSON from model response: {text[:200]}...")
        
        # Remove markdown code blocks
        text = text.replace('```json', '').replace('```', '')
        
        # Try direct parsing first
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass
        
        # Try to find JSON object in the text
        start = text.find('{')
        if start != -1:
            # Find the matching closing brace
            brace_count = 0
            end = start
            for i, char in enumerate(text[start:], start):
                if char == '{':
                    brace_count += 1
                elif char == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        end = i + 1
                        break
            
            if end > start:
                json_str = text[start:end]
                try:
                    return json.loads(json_str)
                except json.JSONDecodeError:
                    self.logger.error(f"Failed to decode JSON: {json_str[:200]}...")
        
        # Check if JSON is truncated (common issue)
        if text.count('{') > text.count('}'):
            self.logger.error("JSON appears to be truncated - missing closing braces")
            return {
                "error": "JSON response appears to be truncated",
                "raw_response": text,
                "status": "TRUNCATED_JSON"
            }
        
        # Fallback: return error structure
        self.logger.error(f"Failed to parse JSON from model response: {text[:500]}...")
        return {
            "error": "Failed to parse valid JSON from model response",
            "raw_response": text[:1000],  # Truncate for storage
            "status": "PARSE_ERROR"
        }