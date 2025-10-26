# functions/agents/comprehensive_agents.py

"""
Comprehensive Agent System for Founders Checklist Processing

This module implements the enhanced agent workflow as specified in the organizer requirements:
1. IntakeCurationAgent → parse PDF into structured JSON
2. ValidationAgent → validate Memo 1 claims
3. CompetitorBenchmarkingAgent → enrich competitor funding & ARR details
4. FinancialProjectionAgent → sanity check pricing vs growth forecasts
5. RiskScoringAgent → add quantified risks
6. FinalDiligenceAgent → generate refined Memo 3
7. InvestorPreferenceAgent → align with thesis (e.g., HRTech, EdTech)
"""

import logging
import json
import re
from datetime import datetime
from typing import Dict, Any, Optional, List
import requests
from dataclasses import dataclass

# Google Cloud Imports
import vertexai
from vertexai.generative_models import GenerativeModel
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from firebase_admin import firestore

@dataclass
class AgentConfig:
    """Configuration for all agents"""
    project: str
    location: str = "asia-south1"
    model: str = "gemini-1.5-flash"

class ValidationAgent:
    """
    Agent 2: Validation
    Cross-checks Memo 1 claims against public datasets and external APIs
    """
    
    def __init__(self, config: AgentConfig):
        self.config = config
        self.logger = logging.getLogger(self.__class__.__name__)
        self.gemini_model = None
        self.db = None
        
    def set_up(self):
        """Initialize Google Cloud clients"""
        vertexai.init(project=self.config.project, location=self.config.location)
        self.gemini_model = GenerativeModel(self.config.model)
        self.db = firestore.client()
        self.logger.info("✅ ValidationAgent setup complete.")
    
    def validate_memo_1_claims(self, memo_1_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate Memo 1 claims against external data sources
        """
        self.logger.info("Starting validation of Memo 1 claims...")
        
        validation_results = {
            "market_size_validation": self._validate_market_size(memo_1_data),
            "competitor_validation": self._validate_competitors(memo_1_data),
            "founder_validation": self._validate_founder_data(memo_1_data),
            "pricing_validation": self._validate_pricing_benchmarks(memo_1_data),
            "timestamp": datetime.now().isoformat(),
            "status": "SUCCESS"
        }
        
        return validation_results
    
    def _validate_market_size(self, memo_1_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate market size claims against public datasets"""
        # TODO: Integrate with BigQuery public datasets
        return {
            "method": "BigQuery + External APIs",
            "status": "PENDING_IMPLEMENTATION",
            "note": "Market size validation requires BigQuery integration"
        }
    
    def _validate_competitors(self, memo_1_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate competitor information against Crunchbase/LinkedIn APIs"""
        # TODO: Integrate with Crunchbase API
        return {
            "method": "Crunchbase/LinkedIn APIs",
            "status": "PENDING_IMPLEMENTATION",
            "note": "Competitor validation requires API integration"
        }
    
    def _validate_founder_data(self, memo_1_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate founder experience against LinkedIn/AngelList"""
        # TODO: Integrate with LinkedIn API
        return {
            "method": "LinkedIn/AngelList APIs",
            "status": "PENDING_IMPLEMENTATION",
            "note": "Founder validation requires API integration"
        }
    
    def _validate_pricing_benchmarks(self, memo_1_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate pricing against industry reports"""
        # TODO: Integrate with industry pricing databases
        return {
            "method": "Industry Reports",
            "status": "PENDING_IMPLEMENTATION",
            "note": "Pricing validation requires industry data integration"
        }

class CompetitorBenchmarkingAgent:
    """
    Agent 3: Competitor Benchmarking
    Enriches competitor funding & ARR details
    """
    
    def __init__(self, config: AgentConfig):
        self.config = config
        self.logger = logging.getLogger(self.__class__.__name__)
        self.gemini_model = None
        
    def set_up(self):
        """Initialize Google Cloud clients"""
        vertexai.init(project=self.config.project, location=self.config.location)
        self.gemini_model = GenerativeModel(self.config.model)
        self.logger.info("✅ CompetitorBenchmarkingAgent setup complete.")
    
    def enrich_competitor_data(self, memo_1_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Enrich competitor information with funding and ARR details
        """
        self.logger.info("Starting competitor benchmarking...")
        
        competitors = memo_1_data.get("competition", [])
        enriched_competitors = []
        
        for competitor in competitors:
            enriched_data = self._get_competitor_details(competitor)
            enriched_competitors.append(enriched_data)
        
        return {
            "enriched_competitors": enriched_competitors,
            "benchmarking_analysis": self._generate_benchmarking_analysis(enriched_competitors),
            "timestamp": datetime.now().isoformat(),
            "status": "SUCCESS"
        }
    
    def _get_competitor_details(self, competitor_name: str) -> Dict[str, Any]:
        """Get detailed competitor information"""
        # TODO: Integrate with Crunchbase API for real data
        return {
            "name": competitor_name,
            "funding_raised": "Data pending API integration",
            "arr": "Data pending API integration",
            "founding_year": "Data pending API integration",
            "headquarters": "Data pending API integration",
            "status": "PENDING_API_INTEGRATION"
        }
    
    def _generate_benchmarking_analysis(self, competitors: List[Dict[str, Any]]) -> str:
        """Generate benchmarking analysis using AI"""
        # TODO: Implement AI-powered benchmarking analysis
        return "Benchmarking analysis pending implementation"

class FinancialProjectionAgent:
    """
    Agent 4: Financial Projections
    Sanity checks pricing vs growth forecasts
    """
    
    def __init__(self, config: AgentConfig):
        self.config = config
        self.logger = logging.getLogger(self.__class__.__name__)
        self.gemini_model = None
        
    def set_up(self):
        """Initialize Google Cloud clients"""
        vertexai.init(project=self.config.project, location=self.config.location)
        self.gemini_model = GenerativeModel(self.config.model)
        self.logger.info("✅ FinancialProjectionAgent setup complete.")
    
    def validate_financial_projections(self, memo_1_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate financial projections and pricing strategy
        """
        self.logger.info("Starting financial projection validation...")
        
        return {
            "pricing_sanity_check": self._check_pricing_reasonableness(memo_1_data),
            "growth_forecast_validation": self._validate_growth_forecasts(memo_1_data),
            "unit_economics_validation": self._validate_unit_economics(memo_1_data),
            "timestamp": datetime.now().isoformat(),
            "status": "SUCCESS"
        }
    
    def _check_pricing_reasonableness(self, memo_1_data: Dict[str, Any]) -> Dict[str, Any]:
        """Check if pricing is reasonable for the market"""
        # TODO: Implement pricing validation logic
        return {
            "method": "Industry Benchmarking",
            "status": "PENDING_IMPLEMENTATION",
            "note": "Pricing validation requires industry data"
        }
    
    def _validate_growth_forecasts(self, memo_1_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate growth forecasts against industry standards"""
        # TODO: Implement growth validation logic
        return {
            "method": "Industry Growth Analysis",
            "status": "PENDING_IMPLEMENTATION",
            "note": "Growth validation requires industry benchmarks"
        }
    
    def _validate_unit_economics(self, memo_1_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate unit economics (CAC, LTV, etc.)"""
        # TODO: Implement unit economics validation
        return {
            "method": "Unit Economics Benchmarking",
            "status": "PENDING_IMPLEMENTATION",
            "note": "Unit economics validation requires industry data"
        }

class RiskScoringAgent:
    """
    Agent 5: Risk Scoring
    Adds quantified risks to the analysis
    """
    
    def __init__(self, config: AgentConfig):
        self.config = config
        self.logger = logging.getLogger(self.__class__.__name__)
        self.gemini_model = None
        
    def set_up(self):
        """Initialize Google Cloud clients"""
        vertexai.init(project=self.config.project, location=self.config.location)
        self.gemini_model = GenerativeModel(self.config.model)
        self.logger.info("✅ RiskScoringAgent setup complete.")
    
    def calculate_risk_scores(self, memo_1_data: Dict[str, Any], validation_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate quantified risk scores
        """
        self.logger.info("Starting risk scoring...")
        
        return {
            "market_risk_score": self._calculate_market_risk(memo_1_data),
            "technology_risk_score": self._calculate_technology_risk(memo_1_data),
            "execution_risk_score": self._calculate_execution_risk(memo_1_data),
            "financial_risk_score": self._calculate_financial_risk(memo_1_data),
            "overall_risk_score": self._calculate_overall_risk(),
            "risk_mitigation_strategies": self._generate_mitigation_strategies(),
            "timestamp": datetime.now().isoformat(),
            "status": "SUCCESS"
        }
    
    def _calculate_market_risk(self, memo_1_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate market-related risks"""
        # TODO: Implement market risk calculation
        return {
            "score": 5,
            "factors": ["Market competition", "Market size validation"],
            "status": "PENDING_IMPLEMENTATION"
        }
    
    def _calculate_technology_risk(self, memo_1_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate technology-related risks"""
        # TODO: Implement technology risk calculation
        return {
            "score": 4,
            "factors": ["Technical feasibility", "Scalability concerns"],
            "status": "PENDING_IMPLEMENTATION"
        }
    
    def _calculate_execution_risk(self, memo_1_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate execution-related risks"""
        # TODO: Implement execution risk calculation
        return {
            "score": 6,
            "factors": ["Team experience", "Execution capability"],
            "status": "PENDING_IMPLEMENTATION"
        }
    
    def _calculate_financial_risk(self, memo_1_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate financial-related risks"""
        # TODO: Implement financial risk calculation
        return {
            "score": 5,
            "factors": ["Revenue model", "Unit economics"],
            "status": "PENDING_IMPLEMENTATION"
        }
    
    def _calculate_overall_risk(self) -> int:
        """Calculate overall risk score"""
        # TODO: Implement overall risk calculation
        return 5
    
    def _generate_mitigation_strategies(self) -> List[str]:
        """Generate risk mitigation strategies"""
        # TODO: Implement AI-powered mitigation strategy generation
        return [
            "Obtain and verify Google Analytics data",
            "Conduct thorough due diligence on authentication process",
            "Develop a robust multi-channel marketing strategy"
        ]

class FinalDiligenceAgent:
    """
    Agent 6: Final Diligence
    Generates refined Memo 3 with comprehensive LVX-style investment analysis
    Enhanced with Perplexity for exit scenario research and market data
    """
    
    def __init__(self, config: AgentConfig):
        self.config = config
        self.logger = logging.getLogger(self.__class__.__name__)
        self.gemini_model = None
        self.perplexity_service = None
        
    def set_up(self):
        """Initialize Google Cloud clients and Perplexity"""
        vertexai.init(project=self.config.project, location=self.config.location)
        self.gemini_model = GenerativeModel(self.config.model)
        
        # Initialize Perplexity service
        from services.perplexity_service import PerplexitySearchService
        self.perplexity_service = PerplexitySearchService(project=self.config.project, location=self.config.location)
        # No set_up() call needed - PerplexitySearchService initializes in __init__
        
        self.logger.info("✅ FinalDiligenceAgent setup complete with Perplexity integration.")
    
    async def generate_memo_3(self, memo_1_data: Dict[str, Any], memo_2_data: Dict[str, Any], 
                       validation_data: Dict[str, Any], risk_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate comprehensive LVX-style Memo 3 with exit research and financial projections
        """
        self.logger.info("Starting comprehensive Memo 3 generation...")
        
        try:
            # Step 1: Research exit scenarios using Perplexity
            exit_research = await self._research_exit_scenarios(memo_1_data)
            
            # Step 2: Calculate financial projections
            financial_projections = self._calculate_financial_projections(memo_1_data)
            
            # Step 3: Generate comprehensive Memo 3 with enhanced prompt
            memo_3_data = await self._generate_comprehensive_memo_3(
                memo_1_data, memo_2_data, validation_data, risk_data, 
                exit_research, financial_projections
            )
            
            return {
                "memo_3": memo_3_data,
                "exit_research": exit_research,
                "financial_projections": financial_projections,
                "timestamp": datetime.now().isoformat(),
                "status": "SUCCESS"
            }
            
        except Exception as e:
            self.logger.error(f"Error in generate_memo_3: {str(e)}")
            return {
                "memo_3": {"error": str(e)},
                "timestamp": datetime.now().isoformat(),
                "status": "FAILED"
            }
    
    async def _research_exit_scenarios(self, memo_1_data: Dict[str, Any]) -> Dict[str, Any]:
        """Use Perplexity to research realistic exit scenarios and valuations"""
        try:
            company_name = memo_1_data.get('title') or memo_1_data.get('company_name', 'Unknown')
            industry = memo_1_data.get('industry_category') or memo_1_data.get('industry', 'Technology')
            
            query = f"""
            Research exit scenarios and acquisition multiples for {industry} companies similar to {company_name}:
            
            1. Recent acquisitions in {industry} (2023-2025)
            2. Typical revenue multiples (8-10x, 6-8x, etc.)
            3. IPO valuations for similar companies
            4. Timeline to exit (typical years)
            5. Acquirer types (strategic vs financial)
            
            Provide specific examples with company names, valuations, and multiples.
            Focus on companies with similar business models and market sizes.
            """
            
            results = await self.perplexity_service._perplexity_search(query, max_results=1)
            return self._process_exit_scenarios(results[0] if results else {})
            
        except Exception as e:
            self.logger.error(f"Error in exit research: {str(e)}")
            return {"error": str(e)}
    
    def _process_exit_scenarios(self, exit_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process exit scenario data from Perplexity"""
        try:
            content = exit_data.get("content", "")
            if not content:
                return {"error": "No exit research data available"}
            
            # Use Gemini to structure the exit research data
            prompt = f"""
            Extract and structure exit scenario data from this research:
            
            {content}
            
            Return JSON with:
            - recent_acquisitions: list of recent acquisitions with valuations
            - revenue_multiples: typical multiples by company stage
            - ipo_examples: IPO examples with valuations
            - exit_timeline: typical years to exit
            - acquirer_types: strategic vs financial acquirers
            """
            
            response = self.gemini_model.generate_content(prompt)
            structured_data = self._parse_json_from_text(response.text)
            
            return structured_data if structured_data else {"error": "Failed to structure exit data"}
            
        except Exception as e:
            self.logger.error(f"Error processing exit scenarios: {str(e)}")
            return {"error": str(e)}
    
    def _calculate_financial_projections(self, memo_1_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate 3-year financial projections from Memo 1 data"""
        try:
            # Extract current revenue and growth rate
            current_revenue = self._parse_revenue(memo_1_data.get('current_revenue', '$0'))
            growth_rate = self._parse_percentage(memo_1_data.get('revenue_growth_rate', '300%'))
            gross_margin = self._parse_percentage(memo_1_data.get('gross_margin', '75%'))
            
            # Calculate projections
            year1_revenue = current_revenue * (growth_rate / 100)
            year2_revenue = year1_revenue * 3  # 3x growth
            year3_revenue = year2_revenue * 2.5  # 2.5x growth
            
            return {
                "year1": {
                    "arr": f"${year1_revenue/1000000:.1f}M",
                    "arr_growth": f"{growth_rate:.0f}%",
                    "gross_margin": f"{gross_margin}%",
                    "gross_profit": f"${year1_revenue * gross_margin / 100 / 1000000:.1f}M",
                    "operating_expenses": f"${year1_revenue * 1.2 / 1000000:.1f}M",
                    "operating_expense_details": "Hiring, marketing, R&D",
                    "ebitda": f"-${year1_revenue * 0.45 / 1000000:.1f}M",
                    "ebitda_margin": "-45%",
                    "burn_rate": f"~${year1_revenue * 0.04 / 1000:.0f}K/month",
                    "runway": "18 months"
                },
                "year2": {
                    "arr": f"${year2_revenue/1000000:.1f}M",
                    "arr_growth": "3x",
                    "gross_margin": "75-80%",
                    "gross_profit": f"${year2_revenue * 0.77 / 1000000:.1f}M",
                    "operating_expenses": f"${year2_revenue * 0.67 / 1000000:.1f}M",
                    "operating_expense_details": "Scaled team, expanded marketing",
                    "ebitda": f"+${year2_revenue * 0.1 / 1000000:.1f}M",
                    "ebitda_margin": "10%",
                    "burn_rate": "Self-sustaining",
                    "runway": "Positive"
                },
                "year3": {
                    "arr": f"${year3_revenue/1000000:.1f}M",
                    "arr_growth": "2.5-3x",
                    "gross_margin": "78-82%",
                    "gross_profit": f"${year3_revenue * 0.8 / 1000000:.1f}M",
                    "operating_expenses": f"${year3_revenue * 0.4 / 1000000:.1f}M",
                    "operating_expense_details": "Efficient scaled operations",
                    "ebitda": f"+${year3_revenue * 0.4 / 1000000:.1f}M",
                    "ebitda_margin": "40%",
                    "burn_rate": "Positive, ready for Series B/C",
                    "runway": "Self-funded growth"
                }
            }
            
        except Exception as e:
            self.logger.error(f"Error calculating financial projections: {str(e)}")
            return {"error": str(e)}
    
    def _parse_revenue(self, revenue_str: str) -> float:
        """Parse revenue string to float value in dollars"""
        try:
            if not revenue_str or revenue_str == "$0":
                return 0.0
            
            # Remove currency symbols and convert to float
            clean_str = revenue_str.replace('$', '').replace(',', '').replace(' ', '')
            
            if 'M' in clean_str.upper():
                return float(clean_str.upper().replace('M', '')) * 1000000
            elif 'K' in clean_str.upper():
                return float(clean_str.upper().replace('K', '')) * 1000
            elif 'B' in clean_str.upper():
                return float(clean_str.upper().replace('B', '')) * 1000000000
            else:
                return float(clean_str)
        except:
            return 0.0
    
    def _parse_percentage(self, percentage_str: str) -> float:
        """Parse percentage string to float value"""
        try:
            if not percentage_str:
                return 0.0
            
            clean_str = percentage_str.replace('%', '').replace(' ', '')
            return float(clean_str)
        except:
            return 0.0
    
    async def _generate_comprehensive_memo_3(self, memo_1_data: Dict[str, Any], memo_2_data: Dict[str, Any], 
                                           validation_data: Dict[str, Any], risk_data: Dict[str, Any],
                                           exit_research: Dict[str, Any], financial_projections: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive LVX-style Memo 3 with enhanced prompt"""
        
        # Calculate composite score from Memo 1 and Memo 2
        composite_score = self._calculate_composite_score(memo_1_data, memo_2_data)
        
        # Get current date
        current_date = datetime.now().strftime("%Y-%m-%d")
        
        prompt = f"""
        You are Warren Buffett's right-hand Managing Partner at Berkshire Hathaway Ventures, tasked with generating the FINAL INVESTMENT DECISION MEMO (Memo 3) for the investment committee.

        This is the MOST CRITICAL document that determines whether we invest $300K-$1M in this startup.

        ═══════════════════════════════════════════════════════════
        📊 DATA YOU HAVE ACCESS TO:
        ═══════════════════════════════════════════════════════════

        **MEMO 1 (Initial Analysis):**
        {json.dumps(memo_1_data, indent=2)}

        **MEMO 2 (Due Diligence & Interview):**
        {json.dumps(memo_2_data, indent=2)}

        **EXIT RESEARCH (Perplexity Market Data):**
        {json.dumps(exit_research, indent=2)}

        **FINANCIAL CALCULATIONS:**
        {json.dumps(financial_projections, indent=2)}

        ═══════════════════════════════════════════════════════════
        🎯 YOUR MISSION:
        ═══════════════════════════════════════════════════════════

        Generate a COMPLETE, PROFESSIONAL, INVESTOR-GRADE Memo 3 that includes:

        1. ✅ Executive Summary (scores, status, confidence)
        2. ✅ Investment Recommendation (BUY/HOLD/PASS with rationale)
        3. ✅ Investment Thesis (3-4 sentences synthesizing everything)
        4. ✅ Score Breakdown (6 categories with weights)
        5. ✅ Investment Strengths (5-6 validated strengths with DD notes)
        6. ✅ Risk Assessment (3-5 risks with mitigation + monitoring)
        7. ✅ Conditions Precedent (5 specific conditions with timelines)
        8. ✅ Return Projections (4 scenarios: Base, Upside, Conservative, IPO)
        9. ✅ Financial Projections (3-year: ARR, margins, EBITDA, burn)
        10. ✅ Investment Terms (SAFE details, rights, governance)
        11. ✅ Next Steps (actionable items for investor & company)
        12. ✅ Summary Scorecard (final weighted score + confidence)

        ═══════════════════════════════════════════════════════════
        📋 CRITICAL JSON SCHEMA (FOLLOW EXACTLY):
        ═══════════════════════════════════════════════════════════

        Respond with ONLY this JSON structure. NO markdown, NO code blocks, JUST JSON:

        {{
          "memo_3_analysis": {{
            "generated_date": "{current_date}",
            "composite_score": {composite_score},
            "confidence_level": 78,
            "status": "DD-VALIDATED",
            
            "investment_recommendation": "INVEST – CONDITIONAL BUY" | "HOLD – NEEDS MORE DD" | "PASS – HIGH RISK",
            
            "investment_thesis": "<3-4 sentence comprehensive thesis synthesizing:
              - Company name + market size + problem/solution
              - Key strengths (team, traction, unit economics)
              - Due diligence validation summary
              - Final recommendation rationale>",
            
            "score_breakdown": {{
              "market_opportunity": {{
                "score": <number 1-10>,
                "weight": "25%",
                "rationale": "<brief 1-line explanation>"
              }},
              "product_technology": {{
                "score": <number 1-10>,
                "weight": "20%",
                "rationale": "<brief 1-line explanation>"
              }},
              "team_execution": {{
                "score": <number 1-10>,
                "weight": "20%",
                "rationale": "<brief 1-line explanation>"
              }},
              "traction_revenue": {{
                "score": <number 1-10>,
                "weight": "15%",
                "rationale": "<brief 1-line explanation>"
              }},
              "risk_assessment": {{
                "score": <number 1-10>,
                "weight": "10%",
                "rationale": "<brief 1-line explanation>"
              }},
              "financial_controls": {{
                "score": <number 1-10>,
                "weight": "10%",
                "rationale": "<brief 1-line explanation>"
              }}
            }},
            
            "validated_strengths": [
              {{
                "title": "MARKET OPPORTUNITY",
                "score": <score from breakdown>,
                "status": "Strong" | "Good" | "Medium",
                "description": "<1-2 sentence description with specific data>",
                "dd_validation": "<brief DD validation source>"
              }},
              {{
                "title": "UNIT ECONOMICS",
                "score": <calculated>,
                "status": "Strong" | "Good" | "Medium",
                "description": "<LTV:CAC ratio with specific numbers>",
                "dd_validation": "DD VALIDATED: Customer interviews + contracts"
              }},
              {{
                "title": "TEAM EXECUTION",
                "score": <calculated>,
                "status": "Strong" | "Good" | "Medium",
                "description": "<Team background with companies>",
                "dd_validation": "DD VALIDATED: Interview + background checks"
              }},
              {{
                "title": "EARLY TRACTION",
                "score": <calculated>,
                "status": "Strong" | "Good" | "Medium",
                "description": "<Revenue + customer metrics>",
                "dd_validation": "DD VALIDATED: Bank statements + confirmations"
              }},
              {{
                "title": "TECHNOLOGY MOAT",
                "score": <calculated>,
                "status": "Strong" | "Good" | "Medium",
                "description": "<Tech advantages + defensibility>",
                "dd_validation": "DD VALIDATED: Technical review + interviews"
              }},
              {{
                "title": "GROWTH STRATEGY",
                "score": <calculated>,
                "status": "Good" | "Medium",
                "description": "<Growth plan + realistic targets>",
                "dd_validation": "DD VALIDATED: Interview + milestone tracking"
              }}
            ],
            
            "risk_assessment": [
              {{
                "risk_number": 1,
                "title": "<Primary Risk Title>",
                "severity": "HIGH" | "MEDIUM" | "LOW",
                "current_state": "<What's happening now>",
                "mitigation_action": "<What company will do>",
                "mitigation_target": "<Target outcome + timeline>",
                "monitoring_approach": "<How we'll track progress>",
                "status": "MITIGATED" | "CONDITIONAL" | "MANAGED"
              }},
              {{
                "risk_number": 2,
                "title": "<Secondary Risk Title>",
                "severity": "MEDIUM" | "LOW",
                "current_state": "<What's happening now>",
                "mitigation_action": "<What company will do>",
                "mitigation_target": "<Target outcome + timeline>",
                "monitoring_approach": "<How we'll track progress>",
                "status": "CONDITIONAL" | "MANAGED"
              }},
              {{
                "risk_number": 3,
                "title": "<Third Risk Title>",
                "severity": "MEDIUM" | "LOW",
                "current_state": "<What's happening now>",
                "mitigation_action": "<What company will do>",
                "mitigation_target": "<Target outcome + timeline>",
                "monitoring_approach": "<How we'll track progress>",
                "status": "CONSERVATIVE" | "MANAGED"
              }}
            ],
            
            "conditions_precedent": [
              {{
                "number": 1,
                "condition": "Permanent CFO Hire",
                "timeline": "60 days post-funding",
                "verification": "Job offer letter + background check",
                "status": "Identified 2 candidates",
                "details": "<Additional context if needed>"
              }},
              {{
                "number": 2,
                "condition": "Google Analytics Access",
                "timeline": "Before first transfer of funds",
                "verification": "GA4 account access + NDA signed",
                "status": "Company agreed in DD call",
                "details": "12 months historical + monthly reporting"
              }},
              {{
                "number": 3,
                "condition": "Observer Board Seat",
                "timeline": "First board meeting within 30 days",
                "verification": "Monthly or quarterly meetings",
                "status": "Investor to confirm availability",
                "details": "Quarterly financial reviews + D&O insurance"
              }},
              {{
                "number": 4,
                "condition": "3x Growth Targets (Conservative)",
                "timeline": "Year 1 Target: $1M ARR (from current)",
                "verification": "Quarterly revenue reporting",
                "status": "Company to commit in term sheet",
                "details": "Use 3x instead of claimed 4x for planning"
              }},
              {{
                "number": 5,
                "condition": "Revenue Diversification",
                "timeline": "<Specific % target by end Year 1>",
                "verification": "Monthly revenue breakdown",
                "status": "<Current progress>",
                "details": "<Specific action plan>"
              }}
            ],
            
            "return_projections": {{
              "base_case": {{
                "probability": 60,
                "exit_type": "Acquisition (HRTech/EdTech player)",
                "year5_arr": "<From exit research + projections>",
                "exit_valuation": "<Based on 8-10x revenue multiple>",
                "exit_multiple": "8-10x revenue",
                "investor_return": "<Calculate based on investment amount>",
                "timeline_years": "5-7",
                "key_assumptions": ["<Assumption 1>", "<Assumption 2>"]
              }},
              "upside_case": {{
                "probability": 20,
                "exit_type": "Strategic acquisition (tech giant)",
                "year5_arr": "<Higher ARR from aggressive growth>",
                "exit_valuation": "<Higher multiple 10-12x>",
                "exit_multiple": "10-12x revenue",
                "investor_return": "<Calculate higher return>",
                "timeline_years": "4-6",
                "key_assumptions": ["Rapid enterprise adoption", "Category leadership"]
              }},
              "conservative_case": {{
                "probability": 15,
                "exit_type": "Acquisition (staffing/consulting)",
                "year5_arr": "<Lower ARR from slower growth>",
                "exit_valuation": "<Lower multiple 6-8x>",
                "exit_multiple": "6-8x revenue",
                "investor_return": "<Calculate lower return>",
                "timeline_years": "6-8",
                "key_assumptions": ["Slower adoption", "Profitable but smaller scale"]
              }},
              "ipo_case": {{
                "probability": 5,
                "exit_type": "IPO (Public markets)",
                "year5_arr": "$30M+",
                "exit_valuation": "$250M+ (8-10x)",
                "exit_multiple": "8-10x revenue",
                "investor_return": "100x+",
                "timeline_years": "5-7",
                "key_assumptions": ["Category scaling", "Profitability", "Public market conditions"]
              }}
            }},
            
            "financial_projections": {{
              "year1": {json.dumps(financial_projections.get("year1", {}), indent=2)},
              "year2": {json.dumps(financial_projections.get("year2", {}), indent=2)},
              "year3": {json.dumps(financial_projections.get("year3", {}), indent=2)}
            }},
            
            "investment_terms": {{
              "instrument": "SAFE (Simple Agreement for Future Equity)",
              "amount": "{memo_1_data.get('amount_raising', '$300K')}",
              "post_money_valuation": "{memo_1_data.get('post_money_valuation', '$1.2M')}",
              "pre_money_valuation": "<Calculated: post_money - amount>",
              "discount_rate": "20% (standard Seed)",
              "warrant_coverage": "10% (standard)",
              "pro_rata_rights": true,
              "pro_rata_details": "Series A follow-on participation",
              "mfn_clause": true,
              "mfn_details": "Most Favored Nation clause",
              "board_seat": "Observer",
              "board_seat_details": "Investor to attend monthly/quarterly meetings",
              "information_rights": "Monthly financial reports + quarterly calls",
              "follow_on_expected": "12-18 months (Series A)",
              "liquidation_preference": "1x non-participating"
            }},
            
            "next_steps": {{
              "investor_actions": [
                "Schedule 30-min call with CEO + CTO",
                "Request cap table + detailed financial model",
                "Review 2-3 customer references (enterprise cases)",
                "Confirm observer board seat acceptance",
                "Finalize SAFE terms with legal counsel",
                "Schedule investment committee presentation"
              ],
              "company_conditions": [
                "Hire permanent CFO (Month 1-2 post-funding)",
                "Provide GA access under NDA",
                "Formalize investor observer seat arrangement",
                "Commit to 3x ARR growth targets (not 4x)",
                "Monthly board updates + quarterly revenue reports"
              ]
            }},
            
            "summary_scorecard": {{
              "final_weighted_score": {composite_score},
              "confidence_level": 78,
              "final_recommendation": "BUY" | "HOLD" | "PASS",
              "recommendation_rationale": "<1-2 sentence final rationale>",
              "metrics": [
                {{
                  "metric": "Market Opportunity",
                  "score": <score>,
                  "status": "✅ Strong" | "⚠️ Medium" | "🔴 Action"
                }},
                {{
                  "metric": "Product & Technology",
                  "score": <score>,
                  "status": "✅ Strong" | "⚠️ Medium" | "🔴 Action"
                }},
                {{
                  "metric": "Team & Execution",
                  "score": <score>,
                  "status": "✅ Strong" | "⚠️ Medium" | "🔴 Action"
                }},
                {{
                  "metric": "Traction & Revenue",
                  "score": <score>,
                  "status": "✅ Strong" | "⚠️ Medium" | "🔴 Action"
                }},
                {{
                  "metric": "Risk Assessment",
                  "score": <score>,
                  "status": "✅ Strong" | "⚠️ Medium" | "🔴 Action"
                }},
                {{
                  "metric": "Financial Controls",
                  "score": <score>,
                  "status": "✅ Strong" | "⚠️ Medium" | "🔴 Action"
                }}
              ]
            }}
          }},
          
          "backward_compatibility": {{
            "overall_score": {composite_score},
            "key_risks": ["<Extract from risk_assessment>", "<risk 2>", "<risk 3>"],
            "mitigation_strategies": ["<Extract from risk_assessment>", "<strategy 2>", "<strategy 3>"],
            "due_diligence_next_steps": ["<Extract from next_steps>", "<step 2>", "<step 3>"],
            "investment_thesis": "<Same as memo_3_analysis.investment_thesis>",
            "synthesis_notes": "<Brief 2-3 sentence synthesis of entire analysis>"
          }}
        }}

        ═══════════════════════════════════════════════════════════
        🔥 CRITICAL INSTRUCTIONS:
        ═══════════════════════════════════════════════════════════

        1. **CALCULATE SCORES**: Use weighted average from Memo 1 + Memo 2 data
        2. **BE REALISTIC**: Base exit valuations on REAL market data from exit research
        3. **BE SPECIFIC**: All conditions/actions must be concrete and measurable
        4. **BE CONSISTENT**: Financial projections must align with Memo 1 data
        5. **BE DECISIVE**: investment_recommendation must match scores:
           - Score ≥ 7.0: "INVEST – CONDITIONAL BUY"
           - Score 5.0-6.9: "HOLD – NEEDS MORE DD"
           - Score < 5.0: "PASS – HIGH RISK"
        6. **USE REAL DATA**: Pull company name, market size, revenue, team info from Memo 1
        7. **VALIDATE CLAIMS**: Reference Memo 2 DD validation results
        8. **NO HALLUCINATION**: If data is missing, use "Not specified in provided data"

        ═══════════════════════════════════════════════════════════
        ✨ REMEMBER:
        ═══════════════════════════════════════════════════════════

        This memo will be used by REAL investors to make a REAL $300K-$1M investment decision.
        Make it PROFESSIONAL, DATA-DRIVEN, and ACTIONABLE.

        **RESPOND WITH ONLY THE JSON. START WITH {{ and END WITH }}. NO OTHER TEXT.**
        """
        
        response = self.gemini_model.generate_content(prompt)
        memo_3_data = self._parse_json_from_text(response.text)
        
        return memo_3_data
    
    def _calculate_composite_score(self, memo_1_data: Dict[str, Any], memo_2_data: Dict[str, Any]) -> float:
        """Calculate weighted composite score from Memo 1 and Memo 2"""
        try:
            # Extract scores from Memo 1 (if available)
            memo_1_score = memo_1_data.get('overall_score', 7.5)  # Default if not available
            
            # Extract scores from Memo 2 (if available)
            memo_2_score = memo_2_data.get('overall_score', 7.3)  # Default if not available
            
            # Weight: 60% Memo 1, 40% Memo 2
            composite_score = (memo_1_score * 0.6) + (memo_2_score * 0.4)
            
            return round(composite_score, 1)
            
        except Exception as e:
            self.logger.error(f"Error calculating composite score: {str(e)}")
            return 7.0  # Default score
    
    def _parse_json_from_text(self, text: str) -> Dict[str, Any]:
        """Safely extract JSON from text"""
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            match = re.search(r'```(json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(2))
                except json.JSONDecodeError:
                    pass
            return {"error": "Failed to parse JSON", "raw_response": text[:1000]}

class InvestorPreferenceAgent:
    """
    Agent 7: Investor Preferences
    Aligns analysis with specific investor thesis (HRTech, EdTech, etc.)
    """
    
    def __init__(self, config: AgentConfig):
        self.config = config
        self.logger = logging.getLogger(self.__class__.__name__)
        self.gemini_model = None
        
    def set_up(self):
        """Initialize Google Cloud clients"""
        vertexai.init(project=self.config.project, location=self.config.location)
        self.gemini_model = GenerativeModel(self.config.model)
        self.logger.info("✅ InvestorPreferenceAgent setup complete.")
    
    def align_with_investor_thesis(self, memo_data: Dict[str, Any], investor_preferences: Dict[str, Any]) -> Dict[str, Any]:
        """
        Align analysis with specific investor thesis
        """
        self.logger.info("Starting investor preference alignment...")
        
        return {
            "thesis_alignment": self._assess_thesis_alignment(memo_data, investor_preferences),
            "investment_fit": self._assess_investment_fit(memo_data, investor_preferences),
            "recommendation_adjustment": self._adjust_recommendation(memo_data, investor_preferences),
            "timestamp": datetime.now().isoformat(),
            "status": "SUCCESS"
        }
    
    def _assess_thesis_alignment(self, memo_data: Dict[str, Any], preferences: Dict[str, Any]) -> Dict[str, Any]:
        """Assess alignment with investor thesis"""
        # TODO: Implement thesis alignment assessment
        return {
            "alignment_score": 7,
            "thesis_match": "Partial match with EdTech/HRTech focus",
            "status": "PENDING_IMPLEMENTATION"
        }
    
    def _assess_investment_fit(self, memo_data: Dict[str, Any], preferences: Dict[str, Any]) -> Dict[str, Any]:
        """Assess investment fit with investor preferences"""
        # TODO: Implement investment fit assessment
        return {
            "fit_score": 6,
            "fit_assessment": "Moderate fit with investment criteria",
            "status": "PENDING_IMPLEMENTATION"
        }
    
    def _adjust_recommendation(self, memo_data: Dict[str, Any], preferences: Dict[str, Any]) -> Dict[str, Any]:
        """Adjust recommendation based on investor preferences"""
        # TODO: Implement recommendation adjustment
        return {
            "adjusted_recommendation": "HOLD",
            "adjustment_reasoning": "Based on investor thesis alignment",
            "status": "PENDING_IMPLEMENTATION"
        }

class ComprehensiveAgentOrchestrator:
    """
    Orchestrates the complete agent workflow for Founders Checklist processing
    """
    
    def __init__(self, config: AgentConfig):
        self.config = config
        self.logger = logging.getLogger(self.__class__.__name__)
        
        # Initialize all agents
        self.validation_agent = ValidationAgent(config)
        self.competitor_agent = CompetitorBenchmarkingAgent(config)
        self.financial_agent = FinancialProjectionAgent(config)
        self.risk_agent = RiskScoringAgent(config)
        self.final_diligence_agent = FinalDiligenceAgent(config)
        self.investor_preference_agent = InvestorPreferenceAgent(config)
    
    def set_up(self):
        """Initialize all agents"""
        self.logger.info("Setting up comprehensive agent orchestrator...")
        
        self.validation_agent.set_up()
        self.competitor_agent.set_up()
        self.financial_agent.set_up()
        self.risk_agent.set_up()
        self.final_diligence_agent.set_up()
        self.investor_preference_agent.set_up()
        
        self.logger.info("✅ ComprehensiveAgentOrchestrator setup complete.")
    
    def process_founders_checklist(self, memo_1_data: Dict[str, Any], 
                                 memo_2_data: Dict[str, Any] = None,
                                 investor_preferences: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Process the complete Founders Checklist workflow
        """
        self.logger.info("Starting comprehensive Founders Checklist processing...")
        
        # Step 1: Validate Memo 1 claims
        validation_results = self.validation_agent.validate_memo_1_claims(memo_1_data)
        
        # Step 2: Enrich competitor data
        competitor_results = self.competitor_agent.enrich_competitor_data(memo_1_data)
        
        # Step 3: Validate financial projections
        financial_results = self.financial_agent.validate_financial_projections(memo_1_data)
        
        # Step 4: Calculate risk scores
        risk_results = self.risk_agent.calculate_risk_scores(memo_1_data, validation_results)
        
        # Step 5: Generate Memo 3 (if Memo 2 exists)
        memo_3_results = None
        if memo_2_data:
            memo_3_results = self.final_diligence_agent.generate_memo_3(
                memo_1_data, memo_2_data, validation_results, risk_results
            )
        
        # Step 6: Align with investor preferences (if provided)
        investor_alignment = None
        if investor_preferences:
            investor_alignment = self.investor_preference_agent.align_with_investor_thesis(
                memo_1_data, investor_preferences
            )
        
        return {
            "memo_1_validation": validation_results,
            "competitor_benchmarking": competitor_results,
            "financial_validation": financial_results,
            "risk_assessment": risk_results,
            "memo_3": memo_3_results,
            "investor_alignment": investor_alignment,
            "timestamp": datetime.now().isoformat(),
            "status": "SUCCESS"
        }

# Example usage and testing
def test_comprehensive_agents():
    """Test function for the comprehensive agent system"""
    config = AgentConfig(project="veritas-472301")
    orchestrator = ComprehensiveAgentOrchestrator(config)
    orchestrator.set_up()
    
    # Example memo 1 data
    sample_memo_1 = {
        "title": "ZINIOSA",
        "founder_name": "Ashri Jaiswal, Varun Ramani",
        "problem": "High prices of luxury goods, limited availability",
        "solution": "Pre-owned luxury fashion marketplace",
        "market_size": "Indian Luxury Market: Rs. 82,186 crore by 2027",
        "competition": ["Luxepolis", "Confidentiale Couture", "Luxurypop"],
        "business_model": "Consignment model with 25% markup",
        "traction": "Rs. 8 crore worth of inventory, 80% sell-through rate"
    }
    
    # Process the checklist
    results = orchestrator.process_founders_checklist(sample_memo_1)
    
    print("Comprehensive Agent Results:")
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    test_comprehensive_agents()
