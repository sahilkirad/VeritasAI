# agents/intake_curation_agent.py

from typing import Dict, List, Any, Optional
import json
import logging
import re
from datetime import datetime

# Google Cloud imports
try:
    from google.cloud import speech_v2 as speech
    import vertexai
    from vertexai.generative_models import GenerativeModel, Part
    from google.cloud import firestore
    GOOGLE_AVAILABLE = True
except ImportError:
    GOOGLE_AVAILABLE = False

# Import vector search client
try:
    from .vector_search_client import get_vector_search_client
    VECTOR_SEARCH_AVAILABLE = True
except ImportError:
    VECTOR_SEARCH_AVAILABLE = False
    
# Suppress noisy Google Cloud logging
logging.getLogger('google.api_core').setLevel(logging.WARNING)
logging.getLogger('google.auth').setLevel(logging.WARNING)


class IntakeCurationAgent:
    """
    Agent 1: Intake & Curation
    Standardizes raw, founder-submitted data (PDFs, media files) into a structured JSON memo.
    This is the first gatekeeper in the analysis pipeline.
    """

    def __init__(
        self,
        model: str = "gemini-2.5-flash",
        project: str = "",
        location: str = "asia-south1"
    ):
        """
        Initializes the agent's configuration.
        
        Args:
            model (str): The name of the Gemini model to use.
            project (str): The Google Cloud project ID.
            location (str): The Google Cloud location for Vertex AI services.
        """
        self.model_name = model
        self.project = project
        self.location = location
        
        # Setup professional logging
        self.logger = logging.getLogger(self.__class__.__name__)
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
            self.logger.setLevel(logging.INFO)

        # Initialize Google Cloud clients to None
        self.gemini_model = None
        self.speech_client = None
        self.db = None
        self.vector_search_client = None

    def set_up(self):
        """Initializes all necessary Google Cloud clients and models."""
        self.logger.info(f"Setting up IntakeCurationAgent for project '{self.project}'...")
        if not GOOGLE_AVAILABLE:
            self.logger.error("Google Cloud libraries are not installed. Please run 'pip install google-cloud-aiplatform google-cloud-speech'.")
            raise ImportError("Required Google Cloud libraries are missing.")
        
        try:
            # Initialize Vertex AI
            vertexai.init(project=self.project, location=self.location)
            self.logger.info(f"Vertex AI initialized in project '{self.project}' and location '{self.location}'.")
            
            # Initialize Gemini Model
            self.gemini_model = GenerativeModel(self.model_name)
            self.logger.info(f"GenerativeModel ('{self.model_name}') initialized successfully.")
            
            # Initialize Speech-to-Text Client
            self.speech_client = speech.SpeechClient()
            self.logger.info("SpeechClient initialized successfully.")
            
            # Initialize Firestore client
            self.db = firestore.Client(project=self.project)
            self.logger.info("Firestore client initialized successfully.")
            
            # Initialize Vector Search client
            if VECTOR_SEARCH_AVAILABLE:
                self.vector_search_client = get_vector_search_client()
                self.logger.info("Vector Search client initialized successfully.")
            else:
                self.logger.warning("Vector Search client not available.")

            self.logger.info("✅ IntakeCurationAgent setup complete.")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize agent's Google Cloud clients: {e}", exc_info=True)
            raise

    def run(self, file_data: bytes, filename: str, file_type: str) -> Dict[str, Any]:
        """
        Main entry point for the agent. Processes a single file and generates Memo 1.

        Args:
            file_data (bytes): The raw byte content of the file.
            filename (str): The original name of the file.
            file_type (str): The type of file ('pdf', 'video', 'audio').

        Returns:
            Dict[str, Any]: A structured dictionary containing the processing status and results.
        """
        start_time = datetime.now()
        self.logger.info(f"Starting intake process for '{filename}' (type: {file_type})...")
        
        try:
            extracted_text = ""
            if file_type == 'pdf':
                # For PDFs, we generate the memo directly to avoid a two-step process
                memo_1_json = self._process_pdf_and_generate_memo(file_data)
            elif file_type in ['video', 'audio']:
                # For media, we first transcribe, then generate the memo
                extracted_text = self._process_media(file_data, file_type)
                memo_1_json = self._generate_memo_from_text(extracted_text, "pitch transcript")
            else:
                raise ValueError(f"Unsupported file type: {file_type}")

            processing_time = (datetime.now() - start_time).total_seconds()
            self.logger.info(f"Successfully processed '{filename}' in {processing_time:.2f} seconds.")

            return {
                "timestamp": datetime.now().isoformat(),
                "processing_time_seconds": processing_time,
                "memo_1": memo_1_json,
                "original_filename": filename,
                "status": "SUCCESS"
            }
            
        except Exception as e:
            self.logger.error(f"Error during intake process for '{filename}': {e}", exc_info=True)
            processing_time = (datetime.now() - start_time).total_seconds()
            
            return {
                "timestamp": datetime.now().isoformat(),
                "processing_time_seconds": processing_time,
                "memo_1": {},
                "status": "FAILED",
                "error": str(e)
            }

    def _process_pdf_and_generate_memo(self, file_data: bytes) -> Dict[str, Any]:
        """Processes a PDF file using Gemini and generates Memo 1 in a single call."""
        self.logger.info("Processing PDF with Gemini to generate Memo 1...")
        pdf_part = Part.from_data(data=file_data, mime_type="application/pdf")
        
        prompt = """
        You are an elite AI Venture Capital Analyst with 15+ years of experience in startup evaluation, due diligence, and investment decision-making. You have analyzed thousands of pitch decks across all industries and stages, from pre-seed to Series C+.
        
        Your expertise includes:
        - Deep understanding of startup metrics, unit economics, and growth patterns
        - Comprehensive knowledge of market dynamics, competitive landscapes, and industry trends
        - Advanced ability to identify red flags, risks, and opportunities
        - Expertise in financial modeling, valuation methodologies, and deal structuring
        - Strong background in technology assessment, product-market fit analysis, and team evaluation
        
        TASK: Analyze the attached pitch deck document and extract comprehensive structured data for the Founders Checklist (Memo 1). This is the first critical step in our 17-agent AI investment analysis pipeline.
        
        ANALYSIS FRAMEWORK:
        1. **Company Overview**: Extract core business information, stage, and positioning
        2. **Market Analysis**: Assess market size, timing, and competitive landscape
        3. **Product & Technology**: Evaluate solution, innovation, and technical advantages
        4. **Financial Assessment**: Analyze business model, unit economics, and financial projections
        5. **Team & Execution**: Assess founding team, advisors, and execution capability
        6. **Risk Assessment**: Identify key risks, red flags, and mitigation strategies
        7. **Investment Thesis**: Formulate initial investment recommendation and rationale
        
        RESPONSE FORMAT: Respond ONLY with a valid JSON object containing the following keys. Do not include any other text, explanations, or markdown formatting.
        If a specific piece of information is not found, return a relevant empty value (e.g., an empty string "" or an empty list []).

        JSON Schema (CORE FIELDS - Extract with high precision):
        - "title": The company name or title of the pitch (extract exact company name).
        - "founder_name": The name of the founder(s) building the startup (extract full names, include all co-founders).
        - "founder_linkedin_url": The LinkedIn URL of the founder(s) if mentioned (extract full URL format: https://www.linkedin.com/in/username/).
        - "company_linkedin_url": The LinkedIn company page URL if mentioned (extract full URL format: https://www.linkedin.com/company/company-name/).
        - "problem": A detailed, specific summary of the core problem the company is solving (include target audience, pain points, and market need).
        - "solution": A comprehensive summary of the proposed solution (include key features, technology, and value proposition).
        - "traction": Detailed summary of traction metrics, milestones, and achievements (include specific numbers, dates, and key customers).
        - "market_size": A comprehensive string description of the Total Addressable Market (TAM), Serviceable Addressable Market (SAM), and Serviceable Obtainable Market (SOM) with specific numbers and sources. Format as a readable text description, not as separate fields.
        - "business_model": Detailed explanation of revenue model, pricing strategy, and monetization approach.
        - "competition": A comprehensive list of direct and indirect competitors with brief descriptions of competitive positioning.
        - "team": Detailed summary of founding team background, relevant experience, and key strengths.
        - "initial_flags": A list of 3-5 potential red flags, risks, or areas of concern identified from the pitch deck. MUST be an array of strings, not "Not specified". Examples: ["High burn rate without clear path to profitability", "Unproven market demand for XR solutions", "Heavy competition from established players"]. Always provide specific, actionable concerns.
        - "validation_points": A list of the top 5 most critical claims that require investor validation (include specific metrics, partnerships, or achievements). MUST be an array of strings, not "Not specified". Examples: ["Claim of 3x better render quality than market", "59k+ website visitors metric", "Partnership claims with major enterprises"]. Always provide specific, verifiable claims.
        - "summary_analysis": A comprehensive 4-5 paragraph executive summary that synthesizes key findings, highlights compelling aspects, identifies risks, and provides an initial investment thesis with clear rationale. MUST be a detailed string, not "Not specified". This is the main executive summary that investors will read first.
        
        COMPREHENSIVE ANALYSIS FIELDS (Extract with maximum detail):
        
        MARKET & INDUSTRY ANALYSIS:
        - "industry_category": Primary and secondary industry categories (e.g., "EdTech", "HRTech", "FinTech", "AI/ML", "SaaS", "Healthcare", "E-commerce").
        - "target_market": Specific target market segments, customer personas, and market positioning.
        - "market_timing": Analysis of why now is the right time for this market opportunity.
        - "market_penetration": Current market penetration, market share, and competitive positioning.
        - "market_trends": Relevant industry trends, market dynamics, and growth drivers.
        
        BUSINESS MODEL & FINANCIALS:
        - "revenue_model": Detailed revenue model breakdown (subscription, commission, one-time, freemium, marketplace, etc.).
        - "pricing_strategy": A comprehensive string description of pricing tiers, models, strategies, and competitive pricing analysis. Format as a readable text description, NOT as an object with tier names as keys.
        - "unit_economics": Customer Acquisition Cost (CAC), Lifetime Value (LTV), gross margins, and unit economics.
        - "financial_projections": Revenue projections, growth rates, and key financial metrics.
        - "funding_history": Previous funding rounds, amounts raised, and investor information.
        - "funding_ask": Current funding round amount, valuation, and equity offered.
        - "use_of_funds": Detailed breakdown of how funding will be allocated and used.
        
        PRODUCT & TECHNOLOGY:
        - "technology_stack": Key technologies, platforms, frameworks, and technical architecture.
        - "product_features": Comprehensive list of key product features and capabilities.
        - "technology_advantages": Unique technological advantages, IP, and competitive moats.
        - "innovation_level": Level of technical innovation, R&D investment, and IP portfolio.
        - "scalability_plan": Technical scalability, infrastructure, and growth capacity.
        - "product_roadmap": Product development timeline, upcoming features, and innovation pipeline.
        
        GO-TO-MARKET & SALES:
        - "go_to_market": Comprehensive go-to-market strategy and customer acquisition approach.
        - "sales_strategy": Sales process, channels, partnerships, and customer acquisition methods.
        - "customer_segments": Target customer segments, personas, and market segmentation.
        - "partnerships": Key partnerships, integrations, collaborations, and strategic alliances.
        - "distribution_channels": Distribution strategy, channels, and market reach.
        
        TEAM & EXECUTION:
        - "team_size": Current team size, roles, and organizational structure.
        - "key_team_members": Names, roles, backgrounds, and expertise of key team members.
        - "advisory_board": Advisory board members, their expertise, and strategic value.
        - "execution_track_record": Previous execution experience, achievements, and success stories.
        - "hiring_plan": Team expansion plans, key hires, and organizational growth.
        
        RISK & COMPLIANCE:
        - "regulatory_considerations": Regulatory requirements, compliance needs, and legal considerations.
        - "intellectual_property": Patents, trademarks, copyrights, and IP protection strategy.
        - "key_risks": Comprehensive risk assessment including market, technology, execution, and financial risks.
        - "risk_mitigation": Risk mitigation strategies, contingency plans, and risk management.
        - "competitive_risks": Competitive threats, market risks, and competitive response strategies.
        
        GROWTH & EXIT:
        - "growth_strategy": Growth plans, expansion strategy, and scaling approach.
        - "international_expansion": International market plans, localization, and global strategy.
        - "exit_strategy": Potential exit strategies, acquisition targets, and IPO considerations.
        - "exit_valuation": Expected exit valuation, comparable transactions, and valuation rationale.
        
        Company Snapshot Fields (Extract from pitch):
        - "company_stage": The current stage of the company (e.g., "Seed", "Series A", "Pre-Seed").
        - "headquarters": The headquarters location of the company.
        - "founded_date": When the company was founded.
        - "amount_raising": The amount of funding being raised in this round.
        - "post_money_valuation": The post-money valuation of the company.
        - "investment_sought": The specific investment amount being sought.
        - "ownership_target": The percentage of ownership being offered.
        - "key_thesis": The main investment thesis or value proposition.
        - "key_metric": The most important business metric or KPI.
        
        Financial & Deal Details:
        - "current_revenue": Current revenue numbers if mentioned.
        - "revenue_growth_rate": Revenue growth rate or percentage.
        - "customer_acquisition_cost": CAC if mentioned.
        - "lifetime_value": LTV if mentioned.
        - "gross_margin": Gross margin percentage if mentioned.
        - "burn_rate": Monthly burn rate if mentioned.
        - "runway": Months of runway remaining if mentioned.
        - "pre_money_valuation": Pre-money valuation if mentioned.
        - "lead_investor": Name of lead investor if mentioned.
        - "committed_funding": Amount of committed funding if mentioned.
        - "round_stage": The stage of the current funding round.
        
        Product & Technology:
        - "product_features": List of key product features mentioned.
        - "technology_advantages": Key technological advantages or differentiators.
        - "innovation_level": Level of innovation or technical sophistication.
        - "scalability_plan": Plans for scaling the technology or product.
        
        Market & Competition:
        - "target_customers": Specific target customer segments.
        - "market_timing": Why now is the right time for this market.
        - "competitive_advantages": Key competitive advantages over competitors.
        - "market_penetration": Current market penetration or market share.
        
        Team & Execution:
        - "team_size": Current team size.
        - "key_team_members": Names and roles of key team members.
        - "advisory_board": Advisory board members if mentioned.
        - "execution_track_record": Previous execution experience of founders.
        
        Growth & Traction:
        - "user_growth": User growth metrics if mentioned.
        - "revenue_growth": Revenue growth metrics if mentioned.
        - "customer_growth": Customer growth metrics if mentioned.
        - "key_milestones": Key business milestones achieved.
        - "upcoming_milestones": Upcoming milestones or goals.
        
        Risk & Mitigation:
        - "key_risks": Main business risks identified.
        - "risk_mitigation": How risks are being mitigated.
        - "regulatory_risks": Any regulatory or compliance risks.
        
        Exit Strategy:
        - "potential_acquirers": Potential acquisition targets mentioned.
        - "ipo_timeline": IPO timeline or plans if mentioned.
        - "exit_valuation": Expected exit valuation if mentioned.
        
        CRITICAL: You MUST always generate the following fields with actual content, never "Not specified":
        - "initial_flags": MUST be an array of 3-5 specific red flags or concerns
        - "validation_points": MUST be an array of 5 specific claims to validate  
        - "summary_analysis": MUST be a comprehensive 4-5 paragraph executive summary
        
        These fields are essential for the investment analysis and must contain real, actionable insights.
        """
        
        response = self.gemini_model.generate_content([prompt, pdf_part])
        self.logger.info("PDF processing and memo generation complete.")
        return self._parse_json_from_text(response.text)

    def _process_media(self, file_data: bytes, file_type: str) -> str:
        """Transcribes video or audio file's audio track using Speech-to-Text."""
        self.logger.info(f"Transcribing {file_type} using Speech-to-Text...")
        model = "long" if file_type == 'video' else "telephony"
        
        config = speech.RecognitionConfig(
            auto_decoding_config=speech.AutoDetectDecodingConfig(),
            language_codes=["en-US", "en-GB"],  # Added GB for broader coverage
            model=model
        )
        request = speech.RecognizeRequest(config=config, content=file_data, recognizer=f"projects/{self.project}/locations/global/recognizers/_")
        
        try:
            response = self.speech_client.recognize(request=request)
            transcript = " ".join([result.alternatives[0].transcript for result in response.results if result.alternatives])
            self.logger.info(f"{file_type.capitalize()} transcription complete. Length: {len(transcript)} chars.")
            return transcript
        except Exception as e:
            self.logger.error(f"Speech-to-Text recognition failed: {e}")
            raise  # Re-raise the exception to be caught by the main run method

    def _generate_memo_from_text(self, text: str, context: str) -> Dict[str, Any]:
        """Uses Gemini to analyze text from a transcript and generate Memo 1."""
        if not text.strip():
            self.logger.warning("No text to analyze. Skipping memo generation.")
            return {}

        self.logger.info(f"Generating Memo 1 from {context} text...")
        prompt = f"""
        You are an elite AI Venture Capital Analyst with 15+ years of experience in startup evaluation, due diligence, and investment decision-making. You have analyzed thousands of startup presentations across all industries and stages, from pre-seed to Series C+.
        
        Your expertise includes:
        - Deep understanding of startup metrics, unit economics, and growth patterns
        - Comprehensive knowledge of market dynamics, competitive landscapes, and industry trends
        - Advanced ability to identify red flags, risks, and opportunities
        - Expertise in financial modeling, valuation methodologies, and deal structuring
        - Strong background in technology assessment, product-market fit analysis, and team evaluation
        
        TASK: Analyze the following text extracted from a startup's {context} and extract comprehensive structured data for the Founders Checklist (Memo 1). This is the first critical step in our 17-agent AI investment analysis pipeline.
        
        ANALYSIS FRAMEWORK:
        1. **Company Overview**: Extract core business information, stage, and positioning
        2. **Market Analysis**: Assess market size, timing, and competitive landscape
        3. **Product & Technology**: Evaluate solution, innovation, and technical advantages
        4. **Financial Assessment**: Analyze business model, unit economics, and financial projections
        5. **Team & Execution**: Assess founding team, advisors, and execution capability
        6. **Risk Assessment**: Identify key risks, red flags, and mitigation strategies
        7. **Investment Thesis**: Formulate initial investment recommendation and rationale
        
        RESPONSE FORMAT: Respond ONLY with a valid JSON object containing the following keys. Do not include any other text, explanations, or markdown formatting.
        If a specific piece of information is not found, return a relevant empty value (e.g., an empty string "" or an empty list []).

        JSON Schema:
        - "title": The company name or title of the pitch.
        - "founder_name": The name of the founder(s) building the startup (extract from the text).
        - "founder_linkedin_url": The LinkedIn URL of the founder(s) if mentioned in the text (extract the full URL).
        - "company_linkedin_url": The LinkedIn company page URL if mentioned in the text (extract the full URL in format: https://www.linkedin.com/company/company-name/).
        - "problem": A concise summary of the core problem the company is trying to solve.
        - "solution": A concise summary of the proposed solution.
        - "traction": A summary of any key traction metrics or milestones mentioned (e.g., revenue, user numbers, key customers).
        - "market_size": A comprehensive string description of the Total Addressable Market (TAM) or overall market size mentioned. Format as a readable text description, not as separate fields.
        - "business_model": A brief explanation of how the company plans to make money.
        - "competition": A list of key competitors mentioned, as an array of strings.
        - "team": A brief summary of the founding team's background or strengths.
        - "initial_flags": A list of 1-2 potential red flags or areas of concern based ONLY on the provided text. MUST be an array of strings, not "Not specified". Always provide specific, actionable concerns based on the text content.
        - "validation_points": A list of the top 2-3 most important claims from the text that an investor must validate. MUST be an array of strings, not "Not specified". Always provide specific, verifiable claims from the text.
        - "summary_analysis": A comprehensive 2-3 paragraph analysis that synthesizes the key findings, highlights the most compelling aspects of the opportunity, and provides an initial investment thesis with both strengths and potential concerns. MUST be a detailed string, not "Not specified". This is the main executive summary.
        
        Additional Fields for Comprehensive Analysis:
        - "industry_category": The primary industry category (e.g., "EdTech", "HRTech", "FinTech", "AI/ML", "SaaS").
        - "target_market": The specific target market or customer segment.
        - "revenue_model": Detailed revenue model breakdown (subscription, commission, one-time, etc.).
        - "pricing_strategy": A comprehensive string description of pricing tiers, models, or strategies mentioned. Format as a readable text description, NOT as an object.
        - "technology_stack": Key technologies, platforms, or technical approaches mentioned.
        - "go_to_market": Go-to-market strategy or customer acquisition approach.
        - "funding_ask": Amount of funding being sought (if mentioned).
        - "use_of_funds": How the funding will be used (if mentioned).
        - "timeline": Key milestones, launch dates, or development timeline.
        - "partnerships": Key partnerships, integrations, or collaborations mentioned.
        - "regulatory_considerations": Any regulatory, compliance, or legal considerations.
        - "scalability": Information about scalability, growth potential, or expansion plans.
        - "intellectual_property": Patents, trademarks, or IP considerations mentioned.
        - "exit_strategy": Potential exit strategies or acquisition targets mentioned.
        
        Company Snapshot Fields (Extract from pitch):
        - "company_stage": The current stage of the company (e.g., "Seed", "Series A", "Pre-Seed").
        - "headquarters": The headquarters location of the company.
        - "founded_date": When the company was founded.
        - "amount_raising": The amount of funding being raised in this round.
        - "post_money_valuation": The post-money valuation of the company.
        - "investment_sought": The specific investment amount being sought.
        - "ownership_target": The percentage of ownership being offered.
        - "key_thesis": The main investment thesis or value proposition.
        - "key_metric": The most important business metric or KPI.
        
        Financial & Deal Details:
        - "current_revenue": Current revenue numbers if mentioned.
        - "revenue_growth_rate": Revenue growth rate or percentage.
        - "customer_acquisition_cost": CAC if mentioned.
        - "lifetime_value": LTV if mentioned.
        - "gross_margin": Gross margin percentage if mentioned.
        - "burn_rate": Monthly burn rate if mentioned.
        - "runway": Months of runway remaining if mentioned.
        - "pre_money_valuation": Pre-money valuation if mentioned.
        - "lead_investor": Name of lead investor if mentioned.
        - "committed_funding": Amount of committed funding if mentioned.
        - "round_stage": The stage of the current funding round.
        
        Product & Technology:
        - "product_features": List of key product features mentioned.
        - "technology_advantages": Key technological advantages or differentiators.
        - "innovation_level": Level of innovation or technical sophistication.
        - "scalability_plan": Plans for scaling the technology or product.
        
        Market & Competition:
        - "target_customers": Specific target customer segments.
        - "market_timing": Why now is the right time for this market.
        - "competitive_advantages": Key competitive advantages over competitors.
        - "market_penetration": Current market penetration or market share.
        
        Team & Execution:
        - "team_size": Current team size.
        - "key_team_members": Names and roles of key team members.
        - "advisory_board": Advisory board members if mentioned.
        - "execution_track_record": Previous execution experience of founders.
        
        Growth & Traction:
        - "user_growth": User growth metrics if mentioned.
        - "revenue_growth": Revenue growth metrics if mentioned.
        - "customer_growth": Customer growth metrics if mentioned.
        - "key_milestones": Key business milestones achieved.
        - "upcoming_milestones": Upcoming milestones or goals.
        
        Risk & Mitigation:
        - "key_risks": Main business risks identified.
        - "risk_mitigation": How risks are being mitigated.
        - "regulatory_risks": Any regulatory or compliance risks.
        
        Exit Strategy:
        - "potential_acquirers": Potential acquisition targets mentioned.
        - "ipo_timeline": IPO timeline or plans if mentioned.
        - "exit_valuation": Expected exit valuation if mentioned.
        
        CRITICAL: You MUST always generate the following fields with actual content, never "Not specified":
        - "initial_flags": MUST be an array of 1-2 specific red flags or concerns
        - "validation_points": MUST be an array of 2-3 specific claims to validate  
        - "summary_analysis": MUST be a comprehensive 2-3 paragraph executive summary
        
        These fields are essential for the investment analysis and must contain real, actionable insights.
        
        Text to analyze:
        {text[:20000]}
        """
        response = self.gemini_model.generate_content(prompt)
        self.logger.info("Memo 1 generation from text complete.")
        return self._parse_json_from_text(response.text)
        
    def _parse_json_from_text(self, text: str) -> Dict[str, Any]:
        """Safely extracts a JSON object from a string, even with markdown wrappers."""
        self.logger.debug(f"Attempting to parse JSON from model response: {text[:200]}...")
        
        # Clean up the text first
        cleaned_text = text.strip()
        
        # Remove any leading/trailing non-JSON characters
        if cleaned_text.startswith('⁠ '):
            cleaned_text = cleaned_text[2:]  # Remove the invisible character and space
        
        # Try to find JSON in markdown code blocks
        match = re.search(r'```(?:json)?\s*(\{.*\})\s*```', cleaned_text, re.DOTALL)
        if match:
            json_str = match.group(1)
        else:
            # Try to find JSON object boundaries
            start_idx = cleaned_text.find('{')
            if start_idx != -1:
                # Find matching closing brace
                brace_count = 0
                end_idx = start_idx
                for i, char in enumerate(cleaned_text[start_idx:], start_idx):
                    if char == '{':
                        brace_count += 1
                    elif char == '}':
                        brace_count -= 1
                        if brace_count == 0:
                            end_idx = i + 1
                            break
                json_str = cleaned_text[start_idx:end_idx]
            else:
                json_str = cleaned_text
            
        try:
            return json.loads(json_str)
        except json.JSONDecodeError as e:
            self.logger.error(f"Failed to decode JSON from model response: {e}")
            self.logger.error(f"JSON string (first 500 chars): {json_str[:500]}")
            return {"error": "Failed to parse valid JSON from model response.", "raw_response": text}

    def get_founder_profile(self, founder_email: str) -> Optional[Dict[str, Any]]:
        """Get founder profile data from Firestore"""
        try:
            if not self.db:
                self.logger.error("Firestore client not initialized")
                return None
                
            # Query founderProfiles collection by email
            profiles_ref = self.db.collection('founderProfiles')
            query = profiles_ref.where('email', '==', founder_email).limit(1)
            docs = query.get()
            
            if docs:
                doc = docs[0]
                profile_data = doc.to_dict()
                self.logger.info(f"Found founder profile for {founder_email}")
                return profile_data
            else:
                self.logger.warning(f"No founder profile found for {founder_email}")
                return None
                
        except Exception as e:
            self.logger.error(f"Error getting founder profile: {e}")
            return None

    def store_embeddings_for_company(self, company_id: str, memo1: Dict[str, Any], 
                                    founder_email: str, pitch_deck_text: str = "") -> bool:
        """Store embeddings for a company's data in Vector Search"""
        try:
            if not self.vector_search_client:
                self.logger.warning("Vector Search client not available. Skipping embedding storage.")
                return False
                
            # Get founder profile data
            founder_profile = self.get_founder_profile(founder_email)
            if not founder_profile:
                self.logger.warning(f"No founder profile found for {founder_email}. Using empty profile.")
                founder_profile = {}
            
            # Store embeddings using vector search client
            success = self.vector_search_client.store_company_embeddings(
                company_id=company_id,
                memo1=memo1,
                founder_profile=founder_profile,
                pitch_deck_text=pitch_deck_text
            )
            
            if success:
                self.logger.info(f"Successfully stored embeddings for company {company_id}")
            else:
                self.logger.error(f"Failed to store embeddings for company {company_id}")
                
            return success
            
        except Exception as e:
            self.logger.error(f"Error storing embeddings for company {company_id}: {e}")
            return False

    async def run_with_embeddings(self, file_data: bytes, filename: str, file_type: str, 
                          founder_email: str, company_id: str = None) -> Dict[str, Any]:
        """
        Enhanced run method that also generates and stores embeddings and enriches missing data with Perplexity
        
        Args:
            file_data (bytes): The raw byte content of the file.
            filename (str): The original name of the file.
            file_type (str): The type of file ('pdf', 'video', 'audio').
            founder_email (str): Email of the founder for profile lookup.
            company_id (str): Optional company ID for embedding storage.
            
        Returns:
            Dict[str, Any]: A structured dictionary containing the processing status and results.
        """
        # Run the original processing
        result = self.run(file_data, filename, file_type)
        
        # If processing was successful, enrich missing data and store embeddings
        if result.get("status") == "SUCCESS" and result.get("memo_1"):
            memo1 = result["memo_1"]
            
            # Use company_id if provided, otherwise generate from filename
            if not company_id:
                company_id = filename.replace('.', '_').replace(' ', '_').lower()
            
            # Enrich missing fields using Perplexity AI
            try:
                from services.perplexity_service import PerplexitySearchService
                perplexity_service = PerplexitySearchService()
                
                self.logger.info(f"Enriching missing data for {memo1.get('title', 'Unknown Company')} using Perplexity AI...")
                
                # Run enrichment asynchronously
                import asyncio
                enriched_memo1 = await perplexity_service.enrich_missing_fields(memo1)
                
                # Update the memo with enriched data
                result["memo_1"] = enriched_memo1
                result["data_enriched"] = True
                
                self.logger.info(f"Successfully enriched data for {memo1.get('title', 'Unknown Company')}")
                
            except Exception as e:
                self.logger.error(f"Error enriching data with Perplexity: {e}")
                result["data_enriched"] = False
                result["enrichment_error"] = str(e)
            
            # Extract pitch deck text if it's a PDF
            pitch_deck_text = ""
            if file_type == 'pdf':
                # For PDFs, we could extract text here, but for now we'll use the memo1 content
                pitch_deck_text = json.dumps(result["memo_1"], indent=2)
            
            # Store embeddings
            embedding_success = self.store_embeddings_for_company(
                company_id=company_id,
                memo1=result["memo_1"],
                founder_email=founder_email,
                pitch_deck_text=pitch_deck_text
            )
            
            # Add embedding status to result
            result["embeddings_stored"] = embedding_success
            
            # Add extracted text and founder email to result for diligence agents
            result["extracted_text"] = pitch_deck_text
            result["founder_email"] = founder_email
            result["company_id"] = company_id
            
            if embedding_success:
                self.logger.info(f"Embeddings stored successfully for company {company_id}")
            else:
                self.logger.warning(f"Failed to store embeddings for company {company_id}")
        
        return result


def test_agent(file_path: str, project_id: str):
    """
    Test function to run the agent with a local file.
    
    Args:
        file_path (str): The local path to the file to process.
        project_id (str): Your Google Cloud project ID.
    """
    if not project_id:
        print("ERROR: Please provide a Google Cloud project ID.")
        return
        
    agent = IntakeCurationAgent(project=project_id)
    agent.set_up()
    
    try:
        with open(file_path, 'rb') as f:
            file_data = f.read()
            
        filename = file_path.split('/')[-1].split('\\')[-1] # Works for both / and \
        file_ext = filename.split('.')[-1].lower()
        
        if file_ext not in ['pdf', 'mp4', 'mov', 'mp3', 'wav', 'flac']:
            print(f"Unsupported file extension: {file_ext}")
            return
            
        file_type_map = {
            'pdf': 'pdf',
            'mp4': 'video', 'mov': 'video',
            'mp3': 'audio', 'wav': 'audio', 'flac': 'audio'
        }
        file_type = file_type_map[file_ext]
        
        result = agent.run(file_data=file_data, filename=filename, file_type=file_type)
        
        print("\n--- Agent Result ---")
        print(json.dumps(result, indent=2))
        print("--------------------\n")

    except FileNotFoundError:
        print(f"Error: The file was not found at {file_path}")
    except Exception as e:
        print(f"An unexpected error occurred during the test run: {e}")


if __name__ == "__main__":
    # === HOW TO RUN THIS TEST ===
    # 1. Make sure you have authenticated with Google Cloud:
    #    gcloud auth application-default login
    # 2. Set your Project ID below.
    # 3. Set the path to your test file (PDF, MP4, MP3, etc.).
    # 4. Run from your terminal: python your_script_name.py
    
    # --- Configuration ---
    # Since I remember it, I'll use your project ID.
    GCP_PROJECT_ID = "veritas-472301" 
    
    # --- Provide the path to a local file for testing ---
    # Example: TEST_FILE_PATH = "path/to/your/pitch_deck.pdf"
    # Example: TEST_FILE_PATH = "path/to/your/founder_pitch.mp4"
    TEST_FILE_PATH = "D:/startup_files/pitch_deck_v2.pdf" # <--- CHANGE THIS
    
    import os
    if not os.path.exists(TEST_FILE_PATH):
        print("="*50)
        print(f"WARNING: The test file path is a placeholder.")
        print(f"Please edit the 'TEST_FILE_PATH' variable in this script to point to a real file.")
        print(f"Current placeholder path: '{TEST_FILE_PATH}'")
        print("="*50)
    else:
        test_agent(file_path=TEST_FILE_PATH, project_id=GCP_PROJECT_ID)