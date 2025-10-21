# functions/services/google_validation_service.py

import logging
import json
import os
from typing import Dict, Any, List, Optional
from datetime import datetime

# Google Cloud Imports
import vertexai
from vertexai.generative_models import GenerativeModel

logger = logging.getLogger(__name__)

class GoogleValidationService:
    """
    Service for validating dynamic memo content using Vertex AI
    and providing references for market data, competitor information, etc.
    Follows the same pattern as DiligenceAgent for consistency.
    """
    
    def __init__(self, project: str = "veritas-472301", location: str = "asia-south1"):
        self.project = project
        self.location = location
        self.logger = logging.getLogger(self.__class__.__name__)
        
        # Initialize clients to None - will be set up in set_up()
        self.gemini_model = None
        
        self.logger.info("✅ GoogleValidationService initialized.")
    
    def set_up(self):
        """Initializes all necessary Google Cloud clients and models."""
        self.logger.info(f"Setting up GoogleValidationService for project '{self.project}'...")
        
        try:
            # Initialize Vertex AI
            vertexai.init(project=self.project, location=self.location)
            self.logger.info(f"Vertex AI initialized in project '{self.project}' and location '{self.location}'.")
            
            # Use Gemini 2.5 Flash for validation analysis
            self.gemini_model = GenerativeModel("gemini-2.5-flash")
            self.logger.info("GenerativeModel ('gemini-2.5-flash') initialized for validation analysis.")
            
            self.logger.info("✅ GoogleValidationService setup complete.")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize GoogleValidationService clients: {e}", exc_info=True)
            raise
    
    def validate_market_size(self, market_size_claim: str, industry_category: str) -> Dict[str, Any]:
        """
        Validate market size claims using Vertex AI analysis.
        Follows DiligenceAgent pattern.
        """
        start_time = datetime.now()
        self.logger.info(f"Starting market size validation for industry: {industry_category}")
        
        try:
            # Generate validation prompt
            prompt = self._create_market_size_validation_prompt(market_size_claim, industry_category)
            
            # Use Gemini to analyze the claim
            response = self.gemini_model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.1,
                    "top_p": 0.8,
                    "top_k": 40,
                    "max_output_tokens": 2048,
                }
            )
            
            # Parse the validation result
            validation_result = self._parse_validation_response(response.text, "market_size")
            
            processing_time = (datetime.now() - start_time).total_seconds()
            self.logger.info(f"Successfully validated market size in {processing_time:.2f} seconds.")
            
            return {
                "status": "SUCCESS",
                "validation_result": validation_result,
                "processing_time": processing_time
            }
            
        except Exception as e:
            self.logger.error(f"Error during market size validation: {e}", exc_info=True)
            return {
                "status": "FAILED",
                "error": str(e)
            }
    
    def validate_competitors(self, competitors: List[str], industry_category: str) -> Dict[str, Any]:
        """
        Validate competitor information using Vertex AI analysis.
        Follows DiligenceAgent pattern.
        """
        start_time = datetime.now()
        self.logger.info(f"Starting competitor validation for industry: {industry_category}")
        
        try:
            # Generate validation prompt
            prompt = self._create_competitor_validation_prompt(competitors, industry_category)
            
            # Use Gemini to analyze the competitors
            response = self.gemini_model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.1,
                    "top_p": 0.8,
                    "top_k": 40,
                    "max_output_tokens": 2048,
                }
            )
            
            # Parse the validation result
            validation_result = self._parse_validation_response(response.text, "competitors")
            
            processing_time = (datetime.now() - start_time).total_seconds()
            self.logger.info(f"Successfully validated competitors in {processing_time:.2f} seconds.")
            
            return {
                "status": "SUCCESS",
                "validation_result": validation_result,
                "processing_time": processing_time
            }
            
        except Exception as e:
            self.logger.error(f"Error during competitor validation: {e}", exc_info=True)
            return {
                "status": "FAILED",
                "error": str(e)
            }
    
    def validate_memo_data(self, memo_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Comprehensive validation of memo data using Vertex AI analysis.
        Follows DiligenceAgent pattern.
        """
        start_time = datetime.now()
        self.logger.info(f"Starting comprehensive memo validation")
        
        try:
            # Generate validation prompt
            prompt = self._create_comprehensive_validation_prompt(memo_data)
            
            # Use Gemini to analyze the memo data
            response = self.gemini_model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.1,
                    "top_p": 0.8,
                    "top_k": 40,
                    "max_output_tokens": 4096,
                }
            )
            
            # Parse the validation result
            validation_result = self._parse_validation_response(response.text, "comprehensive")
            
            processing_time = (datetime.now() - start_time).total_seconds()
            self.logger.info(f"Successfully validated memo data in {processing_time:.2f} seconds.")
            
            return {
                "status": "SUCCESS",
                "validation_result": validation_result,
                "processing_time": processing_time
            }
            
        except Exception as e:
            self.logger.error(f"Error during comprehensive memo validation: {e}", exc_info=True)
            return {
                "status": "FAILED",
                "error": str(e)
            }
    
    def _create_market_size_validation_prompt(self, market_size_claim: str, industry_category: str) -> str:
        """Create a comprehensive prompt for market size validation."""
        return f"""
        You are a Senior Market Research Analyst with 15+ years of experience in industry analysis, market sizing, and investment due diligence. Your expertise spans multiple sectors including technology, healthcare, fintech, and emerging markets.

        **VALIDATION TASK:**
        Analyze and validate the following market size claim for the {industry_category} industry.

        **MARKET SIZE CLAIM:** "{market_size_claim}"
        **TARGET INDUSTRY:** {industry_category}

        **ANALYSIS FRAMEWORK:**
        1. **Market Definition Validation:**
           - Assess if the market definition is clear and well-defined
           - Identify potential market scope issues or ambiguities
           - Evaluate geographic and demographic boundaries

        2. **Size Claim Verification:**
           - Cross-reference with known industry benchmarks and reports
           - Assess reasonableness based on comparable markets
           - Identify potential overestimation or underestimation factors

        3. **Market Dynamics Analysis:**
           - Evaluate market growth drivers and trends
           - Assess competitive landscape and market concentration
           - Identify key market segments and their relative sizes

        4. **Data Quality Assessment:**
           - Evaluate the credibility of the market size methodology
           - Identify potential data sources and their reliability
           - Assess currency and relevance of the data

        5. **Risk Factors:**
           - Identify potential market size risks or uncertainties
           - Assess market volatility and external factors
           - Evaluate regulatory or economic impacts

        **VALIDATION CRITERIA:**
        - Use industry-standard methodologies (TAM, SAM, SOM framework)
        - Consider multiple data sources and perspectives
        - Account for market maturity and growth stage
        - Evaluate competitive intensity and barriers to entry
        - Assess market timing and cyclical factors

        **RESPONSE REQUIREMENTS:**
        - Provide specific, actionable insights
        - Include confidence levels with clear reasoning
        - Identify key assumptions and their validity
        - Suggest additional research areas if needed
        - Keep all responses under 200 characters per field to prevent JSON truncation

        **JSON OUTPUT FORMAT:**
        {{
            "claim_validation": {{
                "is_accurate": true/false,
                "confidence_score": <number 1-10>,
                "verification_notes": "<detailed analysis under 200 chars>",
                "industry_benchmarks": "<relevant benchmarks under 200 chars>",
                "methodology_assessment": "<methodology evaluation under 200 chars>",
                "potential_concerns": ["<concern1 under 50 chars>", "<concern2 under 50 chars>"],
                "data_quality": "<data quality assessment under 200 chars>"
            }},
            "market_analysis": {{
                "market_size_estimate": "<estimated size under 200 chars>",
                "growth_rate": "<growth rate if available under 200 chars>",
                "key_drivers": ["<driver1 under 50 chars>", "<driver2 under 50 chars>"],
                "market_segments": ["<segment1 under 50 chars>", "<segment2 under 50 chars>"],
                "competitive_landscape": "<competitive analysis under 200 chars>",
                "market_maturity": "<maturity assessment under 200 chars>"
            }},
            "investment_implications": {{
                "market_attractiveness": "<attractiveness score 1-10>",
                "scalability_potential": "<scalability assessment under 200 chars>",
                "barriers_to_entry": "<entry barriers under 200 chars>",
                "growth_potential": "<growth potential under 200 chars>"
            }},
            "validation_summary": "<comprehensive assessment under 200 chars>",
            "recommendations": ["<rec1 under 50 chars>", "<rec2 under 50 chars>"]
        }}

        **IMPORTANT:** Base your analysis on industry knowledge and market research best practices. If specific data is not available, clearly state limitations and provide general industry insights.
        """
    
    def _create_competitor_validation_prompt(self, competitors: List[str], industry_category: str) -> str:
        """Create a comprehensive prompt for competitor validation with matrix analysis."""
        competitors_str = ", ".join(competitors)
        return f"""
        You are a Senior Competitive Intelligence Analyst with 15+ years of experience in market research, competitive analysis, and strategic intelligence. Your expertise spans multiple industries including technology, healthcare, fintech, and emerging markets.

        **VALIDATION TASK:**
        Create a comprehensive competitor matrix analysis for the {industry_category} industry.

        **COMPETITORS TO ANALYZE:** {competitors_str}
        **TARGET INDUSTRY:** {industry_category}

        **COMPETITOR MATRIX ANALYSIS FRAMEWORK:**
        1. **Competitor Verification & Classification:**
           - Verify each competitor's existence and current market presence
           - Classify competitors by market position (Leader/Challenger/Niche)
           - Assess company size, funding status, and market position
           - Identify potential name variations or subsidiaries
           - Evaluate competitor relevance to the target market

        2. **Market Positioning Matrix:**
           - Create a competitive positioning matrix
           - Assess each competitor's market share and positioning
           - Identify market leaders, challengers, and niche players
           - Evaluate competitive intensity and market concentration
           - Analyze geographic presence and market penetration

        3. **Competitive Landscape Assessment:**
           - Identify missing key competitors in the analysis
           - Assess competitive gaps and opportunities
           - Evaluate market maturity and competitive dynamics
           - Identify emerging players and disruptors
           - Map competitive ecosystem and relationships

        4. **Strategic Differentiation Analysis:**
           - Analyze key differentiators and competitive advantages
           - Assess product/service positioning and value propositions
           - Evaluate pricing strategies and business models
           - Identify competitive threats and opportunities
           - Map competitive strengths and weaknesses

        5. **Market Intelligence & Trends:**
           - Assess competitor strengths and weaknesses
           - Identify market trends and competitive movements
           - Evaluate competitive barriers and entry requirements
           - Analyze competitive response patterns
           - Track recent funding rounds and strategic moves
        
        6. **Founder & Executive Intelligence:**
           - Find LinkedIn profile URLs for founders and key executives of each competitor
           - Provide specific LinkedIn URLs for each founder/executive
           - Include founder background information and previous companies
           - Identify key team members and their professional profiles
           - Map executive networks and connections

        **COMPETITOR MATRIX REQUIREMENTS:**
        - Create a professional competitor matrix table with structured data
        - Include company name, market position, funding status, key differentiators
        - Provide market share estimates and competitive positioning
        - Include geographic presence and recent developments
        - Include LinkedIn profile URLs for founders and key executives
        - Include founder background information and previous companies
        - Focus on actionable competitive intelligence
        - NO SUMMARY TABLES OR EXECUTIVE SUMMARIES
        - Focus only on detailed competitor analysis

        **VALIDATION CRITERIA:**
        - Use multiple data sources for verification
        - Consider both direct and indirect competitors
        - Account for market segmentation and niches
        - Evaluate competitive intensity and market dynamics
        - Assess competitive positioning and differentiation
        - Provide specific data points and recent information
        - Verify competitor existence and market presence

        **RESPONSE REQUIREMENTS:**
        - Provide specific, actionable insights for each competitor
        - Include confidence levels with clear reasoning
        - Identify competitive gaps and opportunities
        - Create structured competitor matrix tables only
        - Include proper citations and references for all data
        - Focus on detailed competitor analysis
        - NO SUMMARY TABLES OR EXECUTIVE SUMMARIES
        - Keep all responses under 200 characters per field to prevent JSON truncation

        **JSON OUTPUT FORMAT:**
        {{
            "competitor_matrix": {{
                "industry_category": "{industry_category}",
                "analysis_timestamp": "<timestamp>",
                "competitors": [
                    {{
                        "name": "<company_name>",
                        "market_position": "<Leader/Challenger/Niche/Emerging>",
                        "funding_status": "<Series A/B/C, IPO, Bootstrapped, etc.>",
                        "market_share": "<percentage or estimate>",
                        "key_differentiators": ["<diff1>", "<diff2>", "<diff3>"],
                        "geographic_presence": "<primary markets>",
                        "recent_developments": "<recent news or moves under 200 chars>",
                        "competitive_strengths": ["<strength1>", "<strength2>"],
                        "competitive_weaknesses": ["<weakness1>", "<weakness2>"],
                        "funding_amount": "<recent funding amount if available>",
                        "employee_count": "<company size if available>",
                        "founded_year": "<year founded if available>",
                        "key_products": ["<product1>", "<product2>"],
                        "target_market": "<primary target market>",
                        "business_model": "<revenue model>",
                        "competitive_threat_level": "<High/Medium/Low>",
                        "founder_linkedin_urls": ["<linkedin_url1>", "<linkedin_url2>"],
                        "founder_backgrounds": ["<background1>", "<background2>"],
                        "key_executives": ["<executive1>", "<executive2>"]
                    }}
                ],
                "market_leaders": ["<leader1>", "<leader2>"],
                "emerging_players": ["<emerging1>", "<emerging2>"],
                "competitive_intensity": "<High/Medium/Low>",
                "market_concentration": "<High/Medium/Low>",
                "total_competitors_analyzed": <number>,
                "market_gaps_identified": ["<gap1>", "<gap2>"],
                "key_market_trends": ["<trend1>", "<trend2>"]
            }},
            "competitive_landscape": {{
                "market_dynamics": "<dynamics analysis under 200 chars>",
                "competitive_barriers": "<entry barriers under 200 chars>",
                "market_opportunities": ["<opportunity1>", "<opportunity2>"],
                "competitive_threats": ["<threat1>", "<threat2>"]
            }},
            "sources": ["<source1>", "<source2>", "<source3>"],
            "data_quality": "<assessment of data reliability under 200 chars>",
            "analysis_confidence": <number 1-10>
        }}

        **IMPORTANT:** 
        - Create a professional competitor matrix table format
        - Include specific data points and recent information
        - Provide proper citations and references for all data
        - Focus on actionable competitive intelligence
        - Base analysis on industry knowledge and competitive intelligence best practices
        - If specific competitor data is not available, clearly state limitations and provide general industry insights
        """
    
    def _create_comprehensive_validation_prompt(self, memo_data: Dict[str, Any]) -> str:
        """Create a comprehensive prompt for memo validation."""
        return f"""
        You are a Senior Investment Analyst with 15+ years of experience in startup evaluation, due diligence, and venture capital. Your expertise spans multiple sectors including technology, healthcare, fintech, and emerging markets.

        **VALIDATION TASK:**
        Conduct a comprehensive validation analysis of the following startup memo data for accuracy, completeness, and investment readiness.

        **MEMO DATA:**
        {json.dumps(memo_data, indent=2)}

        **ANALYSIS FRAMEWORK:**
        1. **Data Quality Assessment:**
           - Evaluate data accuracy, completeness, and consistency
           - Assess data sources and reliability
           - Identify gaps, inconsistencies, or red flags
           - Evaluate data currency and relevance

        2. **Market Validation:**
           - Validate market size claims and methodology
           - Assess competitive landscape and positioning
           - Evaluate market timing and growth potential
           - Analyze market dynamics and trends

        3. **Financial Validation:**
           - Assess revenue projections and assumptions
           - Evaluate unit economics and business model
           - Analyze funding requirements and use of funds
           - Assess valuation reasonableness and comparables

        4. **Team & Execution Validation:**
           - Evaluate founder background and experience
           - Assess team completeness and capabilities
           - Analyze execution track record and potential
           - Evaluate advisory board and network

        5. **Strategic Assessment:**
           - Analyze competitive advantages and differentiation
           - Evaluate market opportunity and scalability
           - Assess business model viability
           - Identify key risks and mitigation strategies

        6. **Investment Readiness:**
           - Evaluate overall investment attractiveness
           - Assess key strengths and competitive advantages
           - Identify key concerns and risk factors
           - Provide actionable recommendations

        **VALIDATION CRITERIA:**
        - Use industry benchmarks and best practices
        - Consider market conditions and trends
        - Evaluate competitive positioning and differentiation
        - Assess execution capability and track record
        - Analyze financial projections and assumptions

        **RESPONSE REQUIREMENTS:**
        - Provide specific, actionable insights for each validation area
        - Include confidence levels with clear reasoning
        - Identify key strengths and concerns with detailed analysis
        - Suggest additional research areas if needed
        - Focus on detailed validation analysis only
        - NO SUMMARY TABLES OR EXECUTIVE SUMMARIES
        - Keep all responses under 200 characters per field to prevent JSON truncation

        **JSON OUTPUT FORMAT:**
        {{
            "data_validation": {{
                "accuracy_score": <number 1-10>,
                "completeness_score": <number 1-10>,
                "consistency_score": <number 1-10>,
                "validation_notes": "<detailed analysis under 200 chars>",
                "data_quality": "<data quality assessment under 200 chars>",
                "red_flags": ["<flag1 under 50 chars>", "<flag2 under 50 chars>"]
            }},
            "market_validation": {{
                "market_size_accuracy": <number 1-10>,
                "competitive_landscape": "<assessment under 200 chars>",
                "market_timing": "<assessment under 200 chars>",
                "growth_potential": "<assessment under 200 chars>",
                "market_attractiveness": <number 1-10>,
                "competitive_positioning": "<positioning analysis under 200 chars>"
            }},
            "financial_validation": {{
                "revenue_projections": "<assessment under 200 chars>",
                "unit_economics": "<assessment under 200 chars>",
                "funding_requirements": "<assessment under 200 chars>",
                "valuation_reasonableness": "<assessment under 200 chars>",
                "financial_viability": <number 1-10>,
                "burn_rate_analysis": "<burn rate assessment under 200 chars>"
            }},
            "team_validation": {{
                "founder_background": "<assessment under 200 chars>",
                "team_completeness": "<assessment under 200 chars>",
                "execution_capability": "<assessment under 200 chars>",
                "advisory_board": "<assessment under 200 chars>",
                "team_strength": <number 1-10>,
                "execution_risk": "<execution risk assessment under 200 chars>"
            }},
            "strategic_analysis": {{
                "competitive_advantages": ["<advantage1 under 50 chars>", "<advantage2 under 50 chars>"],
                "differentiation": "<differentiation analysis under 200 chars>",
                "scalability": "<scalability assessment under 200 chars>",
                "market_opportunity": "<opportunity analysis under 200 chars>",
                "business_model": "<business model assessment under 200 chars>"
            }},
            "risk_assessment": {{
                "key_risks": ["<risk1 under 50 chars>", "<risk2 under 50 chars>"],
                "risk_mitigation": "<mitigation analysis under 200 chars>",
                "regulatory_risks": "<regulatory assessment under 200 chars>",
                "market_risks": "<market risk assessment under 200 chars>",
                "execution_risks": "<execution risk assessment under 200 chars>"
            }},
            "overall_assessment": {{
                "investment_readiness": <number 1-10>,
                "key_strengths": ["<strength1 under 50 chars>", "<strength2 under 50 chars>"],
                "key_concerns": ["<concern1 under 50 chars>", "<concern2 under 50 chars>"],
                "investment_attractiveness": <number 1-10>,
                "due_diligence_priority": "<priority assessment under 200 chars>"
            }},
            "recommendations": {{
                "immediate_actions": ["<action1 under 50 chars>", "<action2 under 50 chars>"],
                "additional_research": ["<research1 under 50 chars>", "<research2 under 50 chars>"],
                "investment_considerations": ["<consideration1 under 50 chars>", "<consideration2 under 50 chars>"],
                "next_steps": ["<step1 under 50 chars>", "<step2 under 50 chars>"]
            }},
            "sources": ["<source1>", "<source2>", "<source3>"],
            "data_quality": "<assessment of data reliability under 200 chars>",
            "analysis_confidence": <number 1-10>
        }}

        **IMPORTANT:** Base your analysis on industry knowledge and investment best practices. If specific data is not available, clearly state limitations and provide general industry insights.
        """
    
    def _parse_validation_response(self, response_text: str, validation_type: str) -> Dict[str, Any]:
        """Parse the validation response from Gemini."""
        self.logger.debug(f"Parsing validation response for {validation_type}: {response_text[:200]}...")
        
        # Remove markdown code blocks
        text = response_text.replace('```json', '').replace('```', '')
        
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
        
        # Fallback: return error structure
        self.logger.error(f"Failed to parse validation response: {response_text[:500]}...")
        return {
            "error": "Failed to parse validation response",
            "raw_response": response_text[:1000],
            "status": "PARSE_ERROR"
        }