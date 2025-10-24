import os
import json
import logging
import asyncio
import aiohttp
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv
load_dotenv()  # Add at top of file

# Vertex AI imports for enhanced processing
try:
    import vertexai
    from vertexai.generative_models import GenerativeModel
    VERTEX_AI_AVAILABLE = True
except ImportError:
    VERTEX_AI_AVAILABLE = False
class PerplexitySearchService:
    """
    Service for enriching memo data using Perplexity AI search.
    Follows the same pattern as DiligenceAgent for consistency.
    """
    
    def __init__(self, project: str = "veritas-472301", location: str = "us-central1"):
        # Use environment variable for API key
        self.api_key = os.environ.get("PERPLEXITY_API_KEY")
        self.logger = logging.getLogger(self.__class__.__name__)
        
        # Vertex AI configuration
        self.project = project
        self.location = location
        self.vertex_model = None
        
        if not self.api_key:
            self.logger.warning("PERPLEXITY_API_KEY not set - enrichment will be skipped")
            self.enabled = False
        else:
            self.logger.info("Perplexity enrichment enabled")
            self.enabled = True
        
        # Initialize Vertex AI if available
        if VERTEX_AI_AVAILABLE and self.enabled:
            try:
                vertexai.init(project=self.project, location=self.location)
                self.vertex_model = GenerativeModel("gemini-2.0-flash-exp")
                self.logger.info("Vertex AI initialized for structured data extraction")
            except Exception as e:
                self.logger.warning(f"Vertex AI initialization failed: {e}")
                self.vertex_model = None
        
        self.base_url = "https://api.perplexity.ai/chat/completions"
    
    async def _perplexity_search(self, query: str, max_results: int = 3) -> List[Dict[str, Any]]:
        """
        Perform a search using Perplexity AI API.
        
        Args:
            query: The search query
            max_results: Maximum number of results to return
            
        Returns:
            List of search results with content and sources
        """
        try:
            # Log API key status (first 10 chars only for security)
            api_key_preview = f"{self.api_key[:10]}..." if self.api_key else "None"
            self.logger.debug(f"Using API key: {api_key_preview}")
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
            
            # Use the correct model name and parameters for Perplexity
            payload = {
                "model": "sonar-medium-online",  # Valid Perplexity online search model
                "messages": [
                    {
                        "role": "user",
                        "content": query
                    }
                ],
                "temperature": 0.2,
                "return_citations": True,
                "search_recency_filter": "month"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(self.base_url, headers=headers, json=payload, timeout=aiohttp.ClientTimeout(total=30)) as response:
                    response_text = await response.text()
                    
                    if response.status == 200:
                        data = json.loads(response_text)
                        content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                        citations = data.get("citations", [])
                        
                        return [{
                            "content": content,
                            "citations": citations,
                            "query": query
                        }]
                    else:
                        self.logger.error(f"Perplexity API error {response.status}: {response_text}")
                        self.logger.error(f"Request payload: {json.dumps(payload, indent=2)}")
                        return []
                        
        except Exception as e:
            self.logger.error(f"Exception in Perplexity search: {str(e)}", exc_info=True)
            return []
    
    def _identify_missing_fields(self, memo_data: Dict[str, Any]) -> List[str]:
        """
        Identify fields that are missing or have placeholder values.
        Prioritizes critical fields for enrichment.
        
        Args:
            memo_data: The memo data to analyze
            
        Returns:
            List of field names that need enrichment
        """
        # Critical fields that should be enriched first
        critical_fields = [
            "company_stage", "headquarters", "founded_date", 
            "current_revenue", "revenue_growth_rate", "burn_rate", "runway",
            "amount_raising", "post_money_valuation", "lead_investor"
        ]
        
        # Important fields for comprehensive enrichment
        important_fields = [
            "customer_acquisition_cost", "lifetime_value", "gross_margin",
            "team_size", "key_team_members", "advisory_board",
            "go_to_market", "sales_strategy", "partnerships",
            "use_of_funds", "financial_projections", "potential_acquirers",
            "sam_market_size", "som_market_size", "market_penetration",
            "market_timing", "market_trends", "competitive_advantages",
            "scalability_plan", "exit_strategy", "exit_valuation"
        ]
        
        # Check critical fields first
        missing_fields = []
        for field in critical_fields:
            value = memo_data.get(field)
            if self._is_field_missing(value):
                missing_fields.append(field)
        
        # Add important fields if we have capacity
        for field in important_fields:
            value = memo_data.get(field)
            if self._is_field_missing(value):
                missing_fields.append(field)
        
        return missing_fields
    
    def _is_field_missing(self, value: Any) -> bool:
        """Check if a field value is missing or placeholder"""
        if not value:
            return True
        if isinstance(value, str):
            return value.strip() in ["Not specified", "Not disclosed", "N/A", "", "None", "Pending", "Not available", "TBD", "To be determined"]
        if isinstance(value, list):
            return len(value) == 0
        return False
    
    async def _enrich_fields(self, missing_fields: List[str], company_context: str) -> Dict[str, Any]:
        """
        Enrich missing fields using category-specific Perplexity searches.
        
        Args:
            missing_fields: List of fields to enrich
            company_context: Context about the company
            
        Returns:
            Dictionary of enriched field data
        """
        enriched_data = {}
        
        # Define field categories with specialized prompts
        field_categories = {
            "company_basics": {
                "fields": ["company_stage", "headquarters", "founded_date", "team_size"],
                "prompt_template": "Provide verified company information for {company_context}: headquarters location, founding date, current stage (seed/series A/B/C), employee count. Include specific dates, locations, and stage details with sources."
            },
            "financial_metrics": {
                "fields": ["current_revenue", "revenue_growth_rate", "burn_rate", "runway", "customer_acquisition_cost", "lifetime_value", "gross_margin"],
                "prompt_template": "Find latest financial data for {company_context}: current revenue, revenue growth rate, funding raised, valuation, burn rate, runway, CAC, LTV, gross margins. Focus on recent data with specific numbers and sources."
            },
            "funding_deals": {
                "fields": ["amount_raising", "post_money_valuation", "pre_money_valuation", "lead_investor", "committed_funding", "use_of_funds"],
                "prompt_template": "Research funding information for {company_context}: current funding round amount, valuation, lead investors, committed funding, use of funds. Include recent funding announcements and investor details."
            },
            "market_intelligence": {
                "fields": ["sam_market_size", "som_market_size", "market_penetration", "market_timing", "market_trends", "competitive_advantages"],
                "prompt_template": "Analyze market for {company_context}: TAM/SAM/SOM with sources, market penetration, competitive advantages, market timing, industry trends. Provide specific market size numbers and competitive positioning."
            },
            "team_execution": {
                "fields": ["key_team_members", "advisory_board", "go_to_market", "sales_strategy", "partnerships"],
                "prompt_template": "Research team and execution for {company_context}: key team members, advisory board, go-to-market strategy, sales approach, key partnerships. Include LinkedIn profiles and strategic partnerships."
            },
            "growth_exit": {
                "fields": ["scalability_plan", "exit_strategy", "exit_valuation", "potential_acquirers", "ipo_timeline"],
                "prompt_template": "Analyze growth and exit strategy for {company_context}: scalability plans, exit strategy, potential acquirers, IPO timeline, exit valuation expectations. Include strategic growth plans and exit options."
            }
        }
        
        # Process each category
        for category_name, category_info in field_categories.items():
            relevant_fields = [f for f in category_info["fields"] if f in missing_fields]
            if not relevant_fields:
                continue
                
            try:
                # Create specialized query for this category
                query = category_info["prompt_template"].format(company_context=company_context)
                
                self.logger.info(f"Enriching {category_name} fields: {relevant_fields}")
                results = await self._perplexity_search(query)
                
                if results:
                    # Process results with Vertex AI if available
                    if self.vertex_model:
                        processed_data = await self._process_with_vertex_ai(
                            results[0]["content"], 
                            relevant_fields, 
                            category_name
                        )
                        enriched_data.update(processed_data)
                    else:
                        # Fallback to simple extraction
                        enriched_data.update(self._extract_field_data(results[0]["content"], relevant_fields))
                        
            except Exception as e:
                self.logger.error(f"Error enriching {category_name}: {str(e)}")
        
        return enriched_data
    
    async def _process_with_vertex_ai(self, content: str, fields: List[str], category: str) -> Dict[str, Any]:
        """
        Process Perplexity results using Vertex AI for structured data extraction.
        
        Args:
            content: Raw content from Perplexity search
            fields: List of fields to extract
            category: Category of fields being processed
            
        Returns:
            Dictionary of processed field data with confidence scores
        """
        if not self.vertex_model:
            return {}
            
        try:
            prompt = f"""
            You are a data extraction specialist. Extract structured information from the following content about a startup company.
            
            Category: {category}
            Fields to extract: {', '.join(fields)}
            
            Content to analyze:
            {content[:4000]}  # Limit content to avoid token limits
            
            Instructions:
            1. Extract only the requested fields from the content
            2. For each field, provide the value and a confidence score (0.0-1.0)
            3. If information is not found, use null for the value and 0.0 for confidence
            4. Format dates consistently (YYYY-MM-DD format)
            5. Format numbers with appropriate units (e.g., "$1.2M", "50 employees")
            6. For team members, format as "Name - Role"
            7. For lists, use JSON arrays
            
            Return ONLY a valid JSON object with this structure:
            {{
                "field_name": {{
                    "value": "extracted_value",
                    "confidence": 0.85,
                    "source": "brief source description"
                }}
            }}
            
            Example:
            {{
                "company_stage": {{
                    "value": "Series A",
                    "confidence": 0.9,
                    "source": "Recent funding announcement"
                }},
                "headquarters": {{
                    "value": "San Francisco, CA",
                    "confidence": 0.8,
                    "source": "Company website"
                }}
            }}
            """
            
            response = self.vertex_model.generate_content(prompt)
            
            # Parse the JSON response
            try:
                result = json.loads(response.text)
                
                # Extract values and confidence scores
                processed_data = {}
                for field, data in result.items():
                    if isinstance(data, dict) and "value" in data:
                        value = data["value"]
                        confidence = data.get("confidence", 0.0)
                        
                        # Only include fields with reasonable confidence
                        if confidence > 0.3:
                            processed_data[field] = value
                            processed_data[f"{field}_confidence"] = confidence
                            processed_data[f"{field}_source"] = data.get("source", "")
                            
                return processed_data
                
            except json.JSONDecodeError as e:
                self.logger.error(f"Failed to parse Vertex AI response: {e}")
                return {}
                
        except Exception as e:
            self.logger.error(f"Error in Vertex AI processing: {e}")
            return {}
    
    def _extract_field_data(self, content: str, fields: List[str]) -> Dict[str, Any]:
        """
        Extract specific field data from search results.
        
        Args:
            content: The search result content
            fields: List of fields to extract
            
        Returns:
            Dictionary of extracted field data
        """
        extracted_data = {}
        
        # Simple extraction logic - can be enhanced with more sophisticated parsing
        for field in fields:
            if field in content.lower():
                # Extract the value after the field name
                lines = content.split('\n')
                for line in lines:
                    if field.replace('_', ' ').lower() in line.lower():
                        value = line.split(':', 1)[-1].strip()
                        if value and value not in ["Not specified", "N/A"]:
                            extracted_data[field] = value
                            break
        
        return extracted_data
    
    async def enrich_missing_fields(self, memo_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main method to enrich missing fields in memo data with enhanced validation.
        
        Args:
            memo_data: The memo data to enrich
            
        Returns:
            Enriched memo data with additional fields and confidence scores
        """
        if not self.enabled:
            self.logger.info("Perplexity enrichment disabled - skipping")
            return memo_data
            
        try:
            # Identify missing fields
            missing_fields = self._identify_missing_fields(memo_data)
            
            if not missing_fields:
                self.logger.info("No missing fields found for enrichment")
                return memo_data
            
            self.logger.info(f"Enriching {len(missing_fields)} missing fields: {missing_fields}")
            
            # Get company context - check multiple possible field names
            company_name = memo_data.get("title", memo_data.get("company_name", "the company"))
            company_stage = memo_data.get("company_stage", "")
            industry = memo_data.get("industry_category", memo_data.get("industry", ""))
            
            # Handle industry if it's a list
            if isinstance(industry, list):
                industry = ", ".join(industry)
            
            company_context = f"{company_name}"
            if company_stage:
                company_context += f" ({company_stage})"
            if industry:
                company_context += f" in {industry}"
            
            # Enrich missing fields
            enriched_data = await self._enrich_fields(missing_fields, company_context)
            
            # Merge enriched data with validation and confidence scoring
            result = memo_data.copy()
            enriched_count = 0
            enrichment_metadata = {
                "enrichment_timestamp": str(asyncio.get_event_loop().time()),
                "fields_enriched": [],
                "confidence_scores": {},
                "sources": {}
            }
            
            for field, value in enriched_data.items():
                if field in missing_fields and value:
                    # Validate the enriched value
                    if self._validate_enriched_value(field, value):
                        # Store in original field
                        result[field] = value
                        # Store enriched version for reference
                        result[f"{field}_enriched"] = value
                        
                        # Add confidence and source information
                        confidence_key = f"{field}_confidence"
                        source_key = f"{field}_source"
                        
                        if confidence_key in enriched_data:
                            result[confidence_key] = enriched_data[confidence_key]
                            enrichment_metadata["confidence_scores"][field] = enriched_data[confidence_key]
                        
                        if source_key in enriched_data:
                            result[source_key] = enriched_data[source_key]
                            enrichment_metadata["sources"][field] = enriched_data[source_key]
                        
                        enrichment_metadata["fields_enriched"].append(field)
                        enriched_count += 1
                    else:
                        self.logger.warning(f"Validation failed for enriched field: {field}")
            
            # Add enrichment metadata
            result["enrichment_metadata"] = enrichment_metadata
            result["enrichment_success"] = enriched_count > 0
            result["enrichment_count"] = enriched_count
            
            self.logger.info(f"Successfully enriched {enriched_count} fields with confidence scoring")
            return result
            
        except Exception as e:
            self.logger.error(f"Error in enrich_missing_fields: {str(e)}", exc_info=True)
            return memo_data
    
    def _validate_enriched_value(self, field: str, value: Any) -> bool:
        """
        Validate enriched field values for quality and consistency.
        
        Args:
            field: The field name
            value: The enriched value
            
        Returns:
            True if value is valid, False otherwise
        """
        if not value:
            return False
            
        # Field-specific validation rules
        validation_rules = {
            "company_stage": lambda v: isinstance(v, str) and len(v) > 0 and any(stage in v.lower() for stage in ["seed", "series", "pre-seed", "startup"]),
            "headquarters": lambda v: isinstance(v, str) and len(v) > 2 and "," in v,  # Should have city, state/country
            "founded_date": lambda v: isinstance(v, str) and len(v) >= 4,  # At least year
            "current_revenue": lambda v: isinstance(v, str) and any(char in v for char in ["$", "M", "K", "B"]),
            "team_size": lambda v: isinstance(v, str) and any(char.isdigit() for char in v),
            "burn_rate": lambda v: isinstance(v, str) and any(char in v for char in ["$", "M", "K"]),
            "runway": lambda v: isinstance(v, str) and any(char.isdigit() for char in v)
        }
        
        if field in validation_rules:
            try:
                return validation_rules[field](value)
            except:
                return False
        
        # Default validation for other fields
        return isinstance(value, (str, int, float, list)) and str(value).strip() not in ["", "null", "None"]
    
    async def analyze_competitor_matrix(self, company_name: str, industry: str, competitors: List[str]) -> Dict[str, Any]:
        """
        Analyze competitors and create a comprehensive matrix.
        
        Args:
            company_name: Name of the company
            industry: Industry category
            competitors: List of competitor names
            
        Returns:
            Comprehensive competitor matrix data
        """
        try:
            # Create a comprehensive query for competitor analysis
            query = f"""
            As a Senior Competitive Intelligence Analyst, perform a comprehensive competitor matrix analysis for {company_name} in the {industry} industry.
            
            Analyze these competitors: {', '.join(competitors)}
            
            For each competitor, provide:
            1. Market position and competitive standing
            2. Funding status and recent investments
            3. Key differentiators and unique value propositions
            4. Market share and customer base
            5. Geographic presence and expansion strategy
            6. Recent developments and strategic moves
            7. Competitive strengths and weaknesses
            8. Founder & Team Intelligence: LinkedIn profile URLs and background information for founders and key executives
            
            Create a professional competitor matrix table with the following columns:
            - Company Name
            - Market Position
            - Funding Status
            - Market Share
            - Key Differentiators
            - Geographic Presence
            - Competitive Threat Level
            - LinkedIn profile URLs for founders and key executives
            - Recent Developments
            
            Also provide:
            - Market leaders identification
            - Emerging players analysis
            - Competitive intensity assessment
            - Market concentration analysis
            - Key market trends
            - Market gaps and opportunities
            
            Provide proper citations and references for all information.
            NO SUMMARY TABLES OR EXECUTIVE SUMMARIES.
            """
            
            results = await self._perplexity_search(query, max_results=1)
            if not results:
                return {"error": "Failed to analyze competitors"}
            
            # Process the results into structured data
            competitor_matrix = self._process_competitor_matrix(results[0]["content"])
            
            return {
                "competitor_matrix": competitor_matrix,
                "sources": results[0].get("sources", []),
                "analysis_timestamp": str(asyncio.get_event_loop().time()),
                "industry_category": industry
            }
            
        except Exception as e:
            self.logger.error(f"Error in analyze_competitor_matrix: {str(e)}")
            return {"error": str(e)}
    
    def _process_competitor_matrix(self, content: str) -> Dict[str, Any]:
        """
        Process competitor matrix content into structured data.
        
        Args:
            content: The competitor analysis content
            
        Returns:
            Structured competitor matrix data
        """
        try:
            # This is a simplified parser - in production, you'd want more sophisticated parsing
            lines = content.split('\n')
            competitors = []
            market_leaders = []
            emerging_players = []
            
            current_competitor = {}
            in_competitor_section = False
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                # Detect competitor entries
                if any(keyword in line.lower() for keyword in ['company:', 'competitor:', 'firm:']):
                    if current_competitor:
                        competitors.append(current_competitor)
                    current_competitor = {"name": line.split(':', 1)[-1].strip()}
                    in_competitor_section = True
                
                # Parse competitor attributes
                elif in_competitor_section and ':' in line:
                    key, value = line.split(':', 1)
                    key = key.strip().lower().replace(' ', '_')
                    current_competitor[key] = value.strip()
                
                # Detect market leaders
                elif 'market leader' in line.lower() or 'leader' in line.lower():
                    market_leaders.append(line)
                
                # Detect emerging players
                elif 'emerging' in line.lower() or 'startup' in line.lower():
                    emerging_players.append(line)
            
            # Add the last competitor
            if current_competitor:
                competitors.append(current_competitor)
            
            return {
                "competitors": competitors,
                "market_leaders": market_leaders,
                "emerging_players": emerging_players,
                "competitive_intensity": "High",  # Default value
                "market_concentration": "Moderate"  # Default value
            }
            
        except Exception as e:
            self.logger.error(f"Error processing competitor matrix: {str(e)}")
            return {"competitors": [], "error": str(e)}
    
    def _extract_competitor_info(self, content: str) -> Dict[str, Any]:
        """
        Extract competitor information from content.
        
        Args:
            content: The content to parse
            
        Returns:
            Extracted competitor information
        """
        # This is a simplified extraction - enhance as needed
        return {
            "name": "",
            "market_position": "",
            "funding_status": "",
            "market_share": "",
            "key_differentiators": [],
            "geographic_presence": "",
            "recent_developments": "",
            "competitive_strengths": [],
            "competitive_weaknesses": [],
            "founder_linkedin_urls": [],
            "founder_backgrounds": [],
            "key_executives": []
        }
