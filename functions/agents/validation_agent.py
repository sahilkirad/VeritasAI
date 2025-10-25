#!/usr/bin/env python3
"""
Validation Agent for Company Data Enrichment
Searches the web for company data and enriches fields using enhanced prompts
"""

import os
import json
import logging
import asyncio
import aiohttp
from typing import Dict, List, Any, Optional
from datetime import datetime
from dotenv import load_dotenv

# Google Cloud imports
try:
    import vertexai
    from vertexai.generative_models import GenerativeModel
    GOOGLE_AVAILABLE = True
except ImportError:
    GOOGLE_AVAILABLE = False

load_dotenv()

class ValidationAgent:
    """
    Validation Agent that searches the web for company data and enriches fields
    using enhanced prompts for comprehensive data validation
    """
    
    def __init__(
        self,
        model: str = "gemini-2.0-flash-exp",
        project: str = "veritas-472301",
        location: str = "asia-south1"
    ):
        """
        Initializes the validation agent's configuration.
        
        Args:
            model (str): The name of the Gemini model to use as fallback.
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

        # Initialize clients to None
        self.gemini_model = None
        self.perplexity_api_key = os.environ.get("PERPLEXITY_API_KEY")
        self.perplexity_base_url = "https://api.perplexity.ai/chat/completions"
        
        # Enhanced field mapping with detailed prompts
        self.field_categories = {
            "company_basics": {
                "fields": ["company_stage", "headquarters", "founded_date", "team_size", "industry"],
                "enhanced_prompt": """
                As a business intelligence researcher, find comprehensive company information for {company_name}.
                
                Search for and extract the following specific data:
                1. Company Stage: Current funding stage (Pre-seed, Seed, Series A/B/C, Growth, etc.)
                2. Headquarters: Complete address with city, state, country
                3. Founded Date: Exact founding date or year
                4. Team Size: Current number of employees
                5. Industry: Primary business category and sector
                
                Focus on:
                - Official company website and about page
                - Recent news articles and press releases
                - LinkedIn company page
                - Crunchbase or similar databases
                - Recent funding announcements
                
                Provide specific, factual data with sources and dates.
                """
            },
            "financial_metrics": {
                "fields": ["current_revenue", "revenue_growth_rate", "burn_rate", "runway", "funding_raised"],
                "enhanced_prompt": """
                As a financial analyst, research the financial performance of {company_name}.
                
                Find and extract:
                1. Current Revenue: Latest annual or monthly revenue figures
                2. Revenue Growth Rate: Year-over-year or quarter-over-quarter growth
                3. Burn Rate: Monthly cash burn rate
                4. Runway: Months of cash remaining
                5. Total Funding Raised: All funding rounds and amounts
                
                Search sources:
                - Recent financial reports and earnings calls
                - Funding announcements and press releases
                - SEC filings (if public)
                - Industry reports and analysis
                - News articles about financial performance
                
                Provide specific numbers, dates, and sources for all financial data.
                """
            },
            "team_execution": {
                "fields": ["key_team_members", "advisory_board", "founders", "leadership"],
                "enhanced_prompt": """
                As a talent intelligence researcher, find detailed team information for {company_name}.
                
                Research and extract:
                1. Key Team Members: Founders, C-level executives, key employees
                2. Advisory Board: Board members, advisors, investors
                3. Founders: Founder names, backgrounds, previous experience
                4. Leadership Team: Current leadership structure
                
                Search sources:
                - Company website team page
                - LinkedIn company page and employee profiles
                - Press releases about team hires
                - News articles about leadership changes
                - Investor presentations and pitch decks
                
                Include names, titles, backgrounds, and LinkedIn profiles when available.
                """
            },
            "market_intelligence": {
                "fields": ["market_size", "competitors", "competitive_advantages", "market_position"],
                "enhanced_prompt": """
                As a market research analyst, analyze the market position of {company_name}.
                
                Research and extract:
                1. Market Size: TAM (Total Addressable Market), SAM, SOM
                2. Competitors: Direct and indirect competitors
                3. Competitive Advantages: Unique value propositions, differentiators
                4. Market Position: Market share, competitive standing
                
                Search sources:
                - Industry reports and market analysis
                - Competitor analysis and comparisons
                - News articles about market dynamics
                - Analyst reports and research
                - Company investor materials
                
                Provide specific market data, competitor names, and market positioning insights.
                """
            },
            "growth_metrics": {
                "fields": ["customer_count", "growth_rate", "user_acquisition", "retention_rate"],
                "enhanced_prompt": """
                As a growth analyst, research the growth metrics of {company_name}.
                
                Find and extract:
                1. Customer Count: Total customers, users, or subscribers
                2. Growth Rate: Customer/user growth rate
                3. User Acquisition: Customer acquisition strategies and metrics
                4. Retention Rate: Customer retention and churn rates
                
                Search sources:
                - Company growth announcements
                - News articles about user growth
                - Industry reports on growth metrics
                - Social media and user engagement data
                - Press releases about milestones
                
                Provide specific numbers, growth percentages, and time periods.
                """
            }
        }
    
    def set_up(self):
        """Initializes all necessary clients and models."""
        self.logger.info(f"Setting up ValidationAgent for project '{self.project}'...")
        
        if not GOOGLE_AVAILABLE:
            self.logger.warning("Google Cloud libraries are not available. Gemini fallback disabled.")
        else:
            try:
                # Initialize Vertex AI for Gemini fallback
                vertexai.init(project=self.project, location=self.location)
                self.logger.info(f"Vertex AI initialized in project '{self.project}' and location '{self.location}'.")
                
                # Initialize Gemini Model as fallback
                self.gemini_model = GenerativeModel(self.model_name)
                self.logger.info(f"GenerativeModel ('{self.model_name}') initialized as fallback.")
                
            except Exception as e:
                self.logger.warning(f"Failed to initialize Gemini fallback: {str(e)}")
                self.gemini_model = None
        
        # Check Perplexity API key
        if not self.perplexity_api_key:
            self.logger.warning("PERPLEXITY_API_KEY not found - web search disabled")
        else:
            self.logger.info("Perplexity API key found - web search enabled")
        
        self.logger.info("ValidationAgent setup complete")
        return True
    
    async def validate_company_data(self, company_name: str, existing_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main validation method that searches for company data and enriches missing fields
        
        Args:
            company_name: Name of the company to validate
            existing_data: Current company data from ingestion
            
        Returns:
            Enriched and validated company data
        """
        self.logger.info(f"🔍 Starting enhanced validation for company: {company_name}")
        
        # Identify missing or incomplete fields
        missing_fields = self._identify_missing_fields(existing_data)
        self.logger.info(f"📋 Missing fields identified: {missing_fields}")
        
        if not missing_fields:
            self.logger.info("✅ No missing fields found - data is complete")
            return existing_data
        
        # Search for company data using enhanced prompts
        validation_results = {}
        
        for category, category_info in self.field_categories.items():
            relevant_fields = [f for f in category_info["fields"] if f in missing_fields]
            if not relevant_fields:
                continue
            
            self.logger.info(f"🔍 Validating {category} fields: {relevant_fields}")
            
            # Primary: Use Perplexity web search with enhanced prompts
            web_search_data = await self._enhanced_web_search(
                company_name, category_info, relevant_fields
            )
            
            # Fallback: Use Gemini if web search fails
            gemini_data = {}
            if not web_search_data and self.gemini_model:
                self.logger.info(f"🔄 Web search failed for {category}, trying Gemini fallback")
                gemini_data = await self._search_with_gemini(
                    company_name, relevant_fields, category_info
                )
            
            # Merge results, prioritizing web search data
            category_results = self._merge_validation_results(
                web_search_data, gemini_data, relevant_fields
            )
            
            validation_results.update(category_results)
        
        # Apply validation results to existing data
        enriched_data = existing_data.copy()
        validation_metadata = {
            "validation_timestamp": datetime.now().isoformat(),
            "fields_validated": [],
            "validation_sources": {},
            "confidence_scores": {}
        }
        
        for field, value in validation_results.items():
            if value and self._validate_field_value(field, value):
                # Extract actual value from result
                if isinstance(value, dict):
                    actual_value = value.get("value", "")
                    source = value.get("source", "web_search")
                    confidence = value.get("confidence", 0.8)
                else:
                    actual_value = str(value)
                    source = "web_search"
                    confidence = 0.8
                
                enriched_data[field] = actual_value
                enriched_data[f"{field}_validated"] = True
                validation_metadata["fields_validated"].append(field)
                validation_metadata["validation_sources"][field] = source
                validation_metadata["confidence_scores"][field] = confidence
        
        enriched_data["validation_metadata"] = validation_metadata
        enriched_data["validation_success"] = len(validation_metadata["fields_validated"]) > 0
        
        self.logger.info(f"✅ Enhanced validation complete - {len(validation_metadata['fields_validated'])} fields enriched")
        return enriched_data
    
    def _identify_missing_fields(self, data: Dict[str, Any]) -> List[str]:
        """Identify fields that are missing or have placeholder values"""
        missing_fields = []
        
        for category_info in self.field_categories.values():
            for field in category_info["fields"]:
                value = data.get(field)
                if self._is_field_missing(value):
                    missing_fields.append(field)
        
        return missing_fields
    
    async def _enhanced_web_search(
        self, 
        company_name: str, 
        category_info: Dict[str, Any], 
        relevant_fields: List[str]
    ) -> Dict[str, Any]:
        """
        Enhanced web search using Perplexity API with detailed prompts
        
        Args:
            company_name: Name of the company
            category_info: Category configuration with enhanced prompt
            relevant_fields: Fields to search for
            
        Returns:
            Dictionary of extracted field data
        """
        if not self.perplexity_api_key:
            self.logger.warning("Perplexity API key not available for web search")
            return {}
        
        try:
            # Create enhanced search query using the category prompt
            enhanced_prompt = category_info["enhanced_prompt"].format(company_name=company_name)
            
            # Add specific field requirements
            field_requirements = "\n\nExtract the following specific fields:\n"
            for field in relevant_fields:
                field_requirements += f"- {field}\n"
            
            full_query = enhanced_prompt + field_requirements
            
            self.logger.info(f"🔍 Enhanced web search query: {full_query[:200]}...")
            
            # Search with Perplexity API
            search_results = await self._perplexity_search(full_query)
            
            if not search_results:
                self.logger.warning("No results from Perplexity web search")
                return {}
            
            # Extract field data from search results
            extracted_data = self._extract_field_data(search_results, relevant_fields)
            
            self.logger.info(f"✅ Enhanced web search extracted {len(extracted_data)} fields")
            return extracted_data
            
        except Exception as e:
            self.logger.error(f"Enhanced web search failed: {str(e)}")
            return {}
    
    def _is_field_missing(self, value: Any) -> bool:
        """Check if a field value is missing or placeholder"""
        if not value:
            return True
        if isinstance(value, str):
            return value.strip() in [
                "Not specified", "Not disclosed", "N/A", "", "None", 
                "Pending", "Not available", "TBD", "To be determined",
                "Unknown", "Not found", "Not provided"
            ]
        if isinstance(value, list):
            return len(value) == 0
        return False
    
    async def _perplexity_search(self, query: str) -> List[Dict[str, Any]]:
        """
        Search using Perplexity API with model fallback
        
        Args:
            query: Search query string
            
        Returns:
            List of search results with content and citations
        """
        if not self.perplexity_api_key:
            self.logger.warning("Perplexity API key not available")
            return []
        
        models_to_try = [
            "sonar",
            "sonar-pro", 
            "sonar-reasoning",
            "claude-3.5-sonnet",
            "gpt-4o"
        ]
        
        for model_index, model_name in enumerate(models_to_try):
            try:
                self.logger.debug(f"Trying Perplexity model: {model_name}")
                
                headers = {
                    "Authorization": f"Bearer {self.perplexity_api_key}",
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
                
                payload = {
                    "model": model_name,
                    "messages": [{"role": "user", "content": query}],
                    "temperature": 0.2,
                    "max_tokens": 2000
                }
                
                if model_name.startswith("sonar"):
                    payload["return_citations"] = True
                    payload["search_domain_filter"] = "perplexity.ai"
                elif model_name.startswith("claude"):
                    payload["max_tokens"] = 1500
                elif model_name.startswith("gpt"):
                    payload["max_tokens"] = 1500
                
                async with aiohttp.ClientSession() as session:
                    async with session.post(
                        self.perplexity_base_url,
                        headers=headers,
                        json=payload,
                        timeout=aiohttp.ClientTimeout(total=30)
                    ) as response:
                        response_text = await response.text()
                        
                        if response.status == 200:
                            data = json.loads(response_text)
                            content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                            citations = data.get("citations", [])
                            
                            self.logger.info(f"✅ Perplexity search successful with model: {model_name}")
                            return [{
                                "content": content,
                                "citations": citations,
                                "query": query,
                                "model_used": model_name
                            }]
                        else:
                            self.logger.error(f"Model {model_name} failed with status {response.status}")
                            self.logger.error(f"Error response: {response_text}")
                            
                            if model_index < len(models_to_try) - 1:
                                self.logger.info(f"Trying next model: {models_to_try[model_index + 1]}")
                                continue
                            else:
                                self.logger.error("All Perplexity models failed")
                                return []
                                
            except Exception as e:
                self.logger.error(f"Exception with model {model_name}: {str(e)}")
                
                if model_index < len(models_to_try) - 1:
                    self.logger.info(f"Trying next model after exception: {models_to_try[model_index + 1]}")
                    continue
                else:
                    self.logger.error("All models failed due to exceptions")
                    return []
        
        return []
    
    async def _search_with_perplexity(self, company_name: str, fields: List[str], search_terms: List[str]) -> Dict[str, Any]:
        """Search for company data using Perplexity API"""
        if not self.perplexity_api_key:
            self.logger.warning("Perplexity API key not available")
            return {}
        
        try:
            # Create comprehensive search query
            query = f"""
            Find comprehensive information about {company_name} company:
            
            Focus on these specific areas:
            {', '.join(fields)}
            
            Search for: {', '.join(search_terms)}
            
            Provide specific, factual data with sources and dates.
            Include recent information when available.
            """
            
            headers = {
                "Authorization": f"Bearer {self.perplexity_api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": "sonar",
                "messages": [{"role": "user", "content": query}],
                "temperature": 0.1,
                "return_citations": True,
                "max_tokens": 2000
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.perplexity_base_url,
                    headers=headers,
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                        citations = data.get("citations", [])
                        
                        return self._extract_field_data(content, fields, "perplexity", citations)
                    else:
                        self.logger.error(f"Perplexity API error: {response.status}")
                        return {}
        
        except Exception as e:
            self.logger.error(f"Perplexity search error: {str(e)}")
            return {}
    
    async def _search_with_gemini(self, company_name: str, fields: List[str], category_info: Dict[str, Any]) -> Dict[str, Any]:
        """Search for company data using Gemini API as fallback"""
        if not self.gemini_model:
            self.logger.warning("Gemini model not available")
            return {}
        
        try:
            # Use enhanced prompt from category info
            enhanced_prompt = category_info["enhanced_prompt"].format(company_name=company_name)
            
            # Add field extraction requirements
            field_requirements = "\n\nExtract the following specific fields:\n"
            for field in fields:
                field_requirements += f"- {field}\n"
            
            prompt = enhanced_prompt + field_requirements + """
            
            Provide structured data in JSON format with:
            - field_name: extracted_value
            - confidence: 0.0-1.0
            - source: brief description
            
            Example format:
            {
                "company_stage": {
                    "value": "Series A",
                    "confidence": 0.9,
                    "source": "Recent funding announcement"
                },
                "headquarters": {
                    "value": "San Francisco, CA",
                    "confidence": 0.8,
                    "source": "Company website"
                }
            }
            
            Return ONLY valid JSON, no additional text.
            """
            
            response = self.gemini_model.generate_content(prompt)
            
            try:
                data = json.loads(response.text)
                return self._process_gemini_data(data, fields)
            except json.JSONDecodeError:
                self.logger.error("Failed to parse Gemini response as JSON")
                return {}
        
        except Exception as e:
            self.logger.error(f"Gemini search error: {str(e)}")
            return {}
    
    def _extract_field_data(self, search_results: List[Dict[str, Any]], fields: List[str]) -> Dict[str, Any]:
        """Extract field data from search results"""
        extracted_data = {}
        
        if not search_results:
            return extracted_data
        
        # Combine all search result content
        combined_content = ""
        all_citations = []
        
        for result in search_results:
            combined_content += result.get("content", "") + "\n"
            all_citations.extend(result.get("citations", []))
        
        for field in fields:
            # Enhanced keyword-based extraction
            field_keywords = {
                "company_stage": ["stage", "series", "seed", "pre-seed", "round", "funding stage", "investment stage"],
                "headquarters": ["headquarters", "based", "located", "office", "head office", "main office"],
                "founded_date": ["founded", "established", "started", "created", "launched", "incorporated"],
                "team_size": ["employees", "team size", "staff", "people", "workforce", "headcount"],
                "current_revenue": ["revenue", "income", "sales", "earnings", "annual revenue", "monthly revenue"],
                "funding_raised": ["funding", "raised", "investment", "capital", "total funding", "funding rounds"],
                "key_team_members": ["founder", "ceo", "team", "leadership", "executive", "management"],
                "market_size": ["market", "tam", "sam", "som", "size", "addressable market"],
                "competitors": ["competitor", "rival", "competition", "alternative", "competing"]
            }
            
            keywords = field_keywords.get(field, [field])
            
            # Search for field in content
            lines = combined_content.split('\n')
            for line in lines:
                if any(keyword in line.lower() for keyword in keywords):
                    # Extract value after colon or similar
                    if ':' in line:
                        value = line.split(':', 1)[-1].strip()
                        if value and len(value) > 2:
                            extracted_data[field] = {
                                "value": value,
                                "confidence": 0.8,
                                "source": "web_search",
                                "citations": all_citations
                            }
                            break
        
        return extracted_data
    
    def _process_gemini_data(self, data: Dict[str, Any], fields: List[str]) -> Dict[str, Any]:
        """Process Gemini API response data"""
        processed_data = {}
        
        for field in fields:
            if field in data and isinstance(data[field], dict):
                field_data = data[field]
                if "value" in field_data:
                    processed_data[field] = {
                        "value": field_data["value"],
                        "confidence": field_data.get("confidence", 0.8),
                        "source": field_data.get("source", "gemini"),
                        "citations": []
                    }
        
        return processed_data
    
    def _merge_validation_results(self, web_search_data: Dict[str, Any], gemini_data: Dict[str, Any], fields: List[str]) -> Dict[str, Any]:
        """Merge results from web search and Gemini fallback, prioritizing web search"""
        merged_results = {}
        
        for field in fields:
            web_result = web_search_data.get(field)
            gemini_result = gemini_data.get(field)
            
            # Prioritize web search data (Perplexity) over Gemini fallback
            if web_result:
                merged_results[field] = web_result
                self.logger.info(f"✅ Using web search data for {field}")
            elif gemini_result:
                merged_results[field] = gemini_result
                self.logger.info(f"🔄 Using Gemini fallback data for {field}")
            else:
                self.logger.warning(f"⚠️ No data found for {field}")
        
        return merged_results
    
    def _validate_field_value(self, field: str, value: Any) -> bool:
        """Validate if a field value is meaningful and not placeholder"""
        if not value:
            return False
        
        if isinstance(value, dict):
            actual_value = value.get("value", "")
        else:
            actual_value = str(value)
        
        if not actual_value or len(actual_value.strip()) < 2:
            return False
        
        # Field-specific validation
        validation_rules = {
            "company_stage": lambda v: any(stage in v.lower() for stage in ["seed", "series", "pre-seed", "startup", "growth"]),
            "headquarters": lambda v: "," in v and len(v) > 5,
            "founded_date": lambda v: any(char.isdigit() for char in v),
            "team_size": lambda v: any(char.isdigit() for char in v),
            "current_revenue": lambda v: any(char in v for char in ["$", "M", "K", "B", "million", "billion"]),
            "funding_raised": lambda v: any(char in v for char in ["$", "M", "K", "B", "million", "billion"]),
        }
        
        if field in validation_rules:
            try:
                return validation_rules[field](actual_value)
            except:
                return False
        
        return True
    
    async def validate_company_completeness(self, company_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate the completeness of company data and provide recommendations
        
        Args:
            company_data: Company data to validate
            
        Returns:
            Validation report with completeness scores and recommendations
        """
        total_fields = 0
        completed_fields = 0
        field_scores = {}
        
        for category, category_info in self.field_categories.items():
            category_score = 0
            category_total = len(category_info["fields"])
            
            for field in category_info["fields"]:
                value = company_data.get(field)
                if value and not self._is_field_missing(value):
                    completed_fields += 1
                    category_score += 1
                total_fields += 1
            
            field_scores[category] = {
                "score": category_score,
                "total": category_total,
                "percentage": (category_score / category_total * 100) if category_total > 0 else 0
            }
        
        overall_completeness = (completed_fields / total_fields * 100) if total_fields > 0 else 0
        
        # Generate recommendations
        recommendations = []
        for category, scores in field_scores.items():
            if scores["percentage"] < 50:
                recommendations.append(f"Improve {category} data - only {scores['percentage']:.1f}% complete")
        
        return {
            "overall_completeness": overall_completeness,
            "completed_fields": completed_fields,
            "total_fields": total_fields,
            "category_scores": field_scores,
            "recommendations": recommendations,
            "validation_timestamp": datetime.now().isoformat()
        }
