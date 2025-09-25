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

class DiligenceAgent:
    """
    Agent 2: Diligence & Synthesis
    Takes curated Memo 1 data, enriches it with live Google Analytics data and public
    founder data, and synthesizes it into a comprehensive Memo 1 Diligence.
    """

    MEMO_2_PROMPT_TEMPLATE = """
    You are a Senior Venture Capital Analyst with 15+ years of experience in early-stage investments. Your task is to synthesize three distinct sources of information about a startup into a single, comprehensive diligence report (Memo 2).

    You have been given:
    1.  **Curated Data (Memo 1):** The startup's claims, extracted from their pitch deck or transcript, including comprehensive Founders Checklist data.
    2.  **Live Google Analytics Data:** Verified, real-time user metrics from their Google Analytics property.
    3.  **Public Founder Data:** Detailed information scraped from the founder's public LinkedIn profile.

    **ANALYSIS INSTRUCTIONS:**
    - Base ALL analysis STRICTLY on the provided data sources
    - Do NOT make up or hallucinate any information
    - If information is not available in the provided data, state "Information not available in provided data sources"
    - Use the LinkedIn data to analyze founder background and experience
    - Cross-reference all claims with the available data sources
    - Focus on validating the comprehensive Founders Checklist data from Memo 1

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

    Respond ONLY with a valid JSON object. Do not include any other text or markdown formatting.

    **JSON SCHEMA:**
    {{
        "google_analytics_summary": {{
            "data_source": "Google Analytics Data API",
            "property_id": "<GA property ID>",
            "key_metrics": {{
                "total_active_users": "<number>",
                "time_period": "<period>",
                "data_freshness": "<last updated>"
            }},
            "performance_analysis": "<detailed analysis of GA metrics and what they indicate>",
            "user_behavior_insights": "<insights from GA data about user engagement and patterns>",
            "growth_indicators": "<trends and growth patterns from GA data>",
            "data_quality_assessment": "<assessment of data reliability and completeness>"
        }},
        "industry_market_validation": {{
            "market_size_validation": "<validation of market size claims against industry benchmarks>",
            "industry_category_accuracy": "<assessment of industry categorization>",
            "target_market_assessment": "<evaluation of target market definition>",
            "competitive_landscape_validation": "<validation of competitive analysis>"
        }},
        "technology_stack_validation": {{
            "technical_feasibility": "<assessment of technology claims>",
            "scalability_analysis": "<evaluation of scalability claims>",
            "security_infrastructure": "<assessment of security and infrastructure>",
            "innovation_assessment": "<evaluation of technical innovation>"
        }},
        "financial_model_validation": {{
            "revenue_model_viability": "<assessment of revenue model>",
            "pricing_strategy_validation": "<evaluation of pricing strategy>",
            "unit_economics_sanity_check": "<validation of CAC/LTV claims>",
            "financial_projections_reasonableness": "<assessment of financial projections>"
        }},
        "founder_market_fit": {{
            "score": <number 1-10>,
            "analysis": "<detailed analysis based on provided LinkedIn data>",
            "founder_profile": {{
                "name": "<founder name from LinkedIn data>",
                "company_founded": "<company name from LinkedIn data>",
                "company_description": "<brief description from LinkedIn data>",
                "role_and_contributions": "<key role and contributions from LinkedIn data>",
                "recent_achievements": "<notable achievements from LinkedIn data>",
                "data_source": "Provided LinkedIn Profile Data"
            }},
            "key_insights": ["<insight1>", "<insight2>"]
        }},
        "problem_validation": {{
            "score": <number 1-10>,
            "analysis": "<detailed analysis based STRICTLY on Memo 1 data>",
            "market_size_assessment": "<assessment from uploaded document>"
        }},
        "solution_product_market_fit": {{
            "score": <number 1-10>,
            "analysis": "<detailed analysis based on Memo 1>",
            "competitive_advantages": ["<advantage1>", "<advantage2>"]
        }},
        "traction_metrics_validation": {{
            "score": <number 1-10>,
            "analysis": "<detailed analysis based on Memo 1 and GA data>",
            "ga_data_correlation": "<correlation analysis between startup claims and GA data>",
            "growth_trajectory": "<trajectory assessment>",
            "metrics_validation": "<validation of specific metrics against GA data>"
        }},
        "team_execution_capability": {{
            "score": <number 1-10>,
            "analysis": "<detailed analysis based on Memo 1>",
            "relevant_experience": ["<experience1>", "<experience2>"]
        }},
        "market_opportunity_competition": {{
            "score": <number 1-10>,
            "analysis": "<detailed analysis based on Memo 1 competition and market_size data>",
            "competitive_landscape": "<landscape analysis from Memo 1>",
            "market_opportunities": "<analysis based on Memo 1 market data>"
        }},
        "benchmarking_analysis": {{
            "score": <number 1-10>,
            "analysis": "<comparison with competitors from Memo 1>",
            "competitive_positioning": "<positioning analysis>",
            "differentiation_factors": ["<factor1>", "<factor2>"],
            "competitive_threats": ["<threat1>", "<threat2>"]
        }},
        "investment_thesis": "<comprehensive 2-3 paragraph investment thesis>",
        "overall_score": <number 1-10>,
        "key_risks": ["<risk1>", "<risk2>", "<risk3>"],
        "mitigation_strategies": ["<strategy1>", "<strategy2>"],
        "due_diligence_next_steps": ["<step1>", "<step2>", "<step3>"],
        "investment_recommendation": "<STRONG BUY/BUY/HOLD/PASS>",
        "synthesis_notes": "<how the three data sources align or contradict each other>",
        "memo_1_id": "<reference to original memo 1 document>",
        "processing_time_seconds": <number>,
        "status": "SUCCESS"
    }}

    **JSON DATA INPUTS:**
    ---
    Memo 1 Data: {memo_1_data}
    ---
    Google Analytics Data: {ga_data}
    ---
    Public Founder Data: {public_data}
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

    def set_up(self):
        """Initializes all necessary Google Cloud clients and models."""
        self.logger.info(f"Setting up DiligenceAgent for project '{self.project}'...")
        
        try:
            # Initialize Vertex AI
            vertexai.init(project=self.project, location=self.location)
            self.logger.info(f"Vertex AI initialized in project '{self.project}' and location '{self.location}'.")
            
            # Use Gemini 1.5 Pro for maximum accuracy in diligence analysis
            self.gemini_model = GenerativeModel("gemini-1.5-pro")
            self.logger.info("GenerativeModel ('gemini-1.5-pro') initialized for diligence analysis.")
            
            # Initialize Firestore client
            self.db = firestore.client()
            self.logger.info("Firestore client initialized successfully.")
            
            # Initialize Google Analytics client
            self.ga_client = BetaAnalyticsDataClient()
            self.logger.info("Google Analytics client initialized successfully.")

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
            
            # 5. Synthesize all data into Memo 1 Diligence using Gemini
            memo_2_json = self._generate_memo_2(memo_1_data, ga_data, public_data)

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

    def _generate_memo_2(self, memo_1_data: dict, ga_data: dict, public_data: dict) -> Dict[str, Any]:
        """Uses Gemini to synthesize all data sources into the final Memo 1 Diligence."""
        self.logger.info("Synthesizing all data sources to generate Memo 1 Diligence...")
        
        # Enhanced prompt with analysis instructions
        prompt = self.MEMO_2_PROMPT_TEMPLATE.format(
            memo_1_data=json.dumps(memo_1_data, indent=2),
            ga_data=json.dumps(ga_data, indent=2),
            public_data=json.dumps(public_data, indent=2)
        )
        
        # Use generate_content with standard configuration
        response = self.gemini_model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.1,  # Lower temperature for more factual responses
                "top_p": 0.8,
                "top_k": 40,
                "max_output_tokens": 8192,
            }
        )
        self.logger.info("Memo 1 Diligence generation complete.")
        return self._parse_json_from_text(response.text)

    def _parse_json_from_text(self, text: str) -> Dict[str, Any]:
        """Safely extracts a JSON object from a string."""
        try:
            # Try direct parsing first
            return json.loads(text)
        except json.JSONDecodeError:
            # Try with regex extraction
            match = re.search(r'```(json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(2))
                except json.JSONDecodeError:
                    pass
            
            # Fallback: return error structure
            self.logger.error(f"Failed to parse JSON from model response: {text[:500]}...")
            return {
                "error": "Failed to parse valid JSON from model response",
                "raw_response": text[:1000],  # Truncate for storage
                "status": "PARSE_ERROR"
            }