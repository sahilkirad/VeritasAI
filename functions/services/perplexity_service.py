import os
import json
import logging
import asyncio
import aiohttp
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv
load_dotenv()  # Add at top of file
class PerplexitySearchService:
    """
    Service for enriching memo data using Perplexity AI search.
    Follows the same pattern as DiligenceAgent for consistency.
    """
    
    def __init__(self):
        # Use environment variable for API key
        self.api_key = os.environ.get("PERPLEXITY_API_KEY")
        self.logger = logging.getLogger(self.__class__.__name__)
        
        if not self.api_key:
            self.logger.warning("PERPLEXITY_API_KEY not set - enrichment will be skipped")
            self.enabled = False
        else:
            self.logger.info("Perplexity enrichment enabled")
            self.enabled = True
        
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
        
        Args:
            memo_data: The memo data to analyze
            
        Returns:
            List of field names that need enrichment
        """
        # Comprehensive list of all fields that can be enriched
        fields_to_check = [
            # Company basics
            "headquarters", "founded_date", "company_stage",
            
            # Funding & financials
            "amount_raising", "post_money_valuation", "pre_money_valuation",
            "lead_investor", "committed_funding", "ownership_target",
            "use_of_funds",  # ADD THIS
            "financial_projections",  # ADD THIS
            "potential_acquirers",  # ADD THIS
            
            # Market analysis
            "sam_market_size", "som_market_size", "market_penetration",
            "market_timing", "market_trends",
            
            # Financial metrics
            "current_revenue", "revenue_growth_rate",
            "customer_acquisition_cost", "lifetime_value",
            "gross_margin", "operating_margin", "net_margin",
            "burn_rate", "runway",
            
            # Team & execution
            "team_size", "hiring_plan",
            
            # Strategy
            "go_to_market", "sales_strategy", "partnerships",
            "distribution_channels", "scalability_plan",
            
            # Exit & timeline
            "timeline", "exit_strategy", "exit_valuation", "ipo_timeline"
        ]
        
        missing_fields = []
        for field in fields_to_check:
            value = memo_data.get(field)
            # Check for missing, empty, or placeholder values
            if not value or str(value).strip() in ["Not specified", "Not disclosed", "N/A", "", "None", "Pending", "Not available"]:
                missing_fields.append(field)
        
        return missing_fields
    
    async def _enrich_fields(self, missing_fields: List[str], company_context: str) -> Dict[str, Any]:
        """
        Enrich missing fields using Perplexity search.
        
        Args:
            missing_fields: List of fields to enrich
            company_context: Context about the company
            
        Returns:
            Dictionary of enriched field data
        """
        enriched_data = {}
        
        # Group fields by type for more efficient searches
        field_groups = {
            "company_info": ["company_name", "headquarters", "founded_date", "company_stage"],
            "financials": ["amount_raising", "post_money_valuation", "current_revenue", 
                          "customer_acquisition_cost", "gross_margin", "burn_rate", "runway"],
            "team": ["team_size", "founder_linkedin", "founder_background"],
            "market": ["market_size", "target_market", "competitive_advantages"],
            "business": ["business_model", "revenue_model", "pricing_strategy", "go_to_market"]
        }
        
        for group_name, fields in field_groups.items():
            relevant_fields = [f for f in fields if f in missing_fields]
            if not relevant_fields:
                continue
                
            # Create a comprehensive query for this group
            query = f"Find detailed information about {company_context} focusing on: {', '.join(relevant_fields)}. Provide specific data, metrics, and recent updates."
            
            try:
                results = await self._perplexity_search(query)
                if results:
                    enriched_data.update(self._extract_field_data(results[0]["content"], relevant_fields))
            except Exception as e:
                self.logger.error(f"Error enriching {group_name}: {str(e)}")
        
        return enriched_data
    
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
        Main method to enrich missing fields in memo data.
        
        Args:
            memo_data: The memo data to enrich
            
        Returns:
            Enriched memo data with additional fields
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
            
            # Merge enriched data DIRECTLY into original fields (not just as _enriched)
            result = memo_data.copy()
            enriched_count = 0
            for field, value in enriched_data.items():
                if field in missing_fields and value:
                    # Store in original field
                    result[field] = value
                    # Also store enriched version for reference
                    result[f"{field}_enriched"] = value
                    result.setdefault("enrichment_sources", []).append(f"Perplexity AI - {field}")
                    enriched_count += 1
            
            self.logger.info(f"Successfully enriched {enriched_count} fields")
            return result
            
        except Exception as e:
            self.logger.error(f"Error in enrich_missing_fields: {str(e)}", exc_info=True)
            return memo_data
    
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
