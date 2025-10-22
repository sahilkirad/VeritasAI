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
        if not self.api_key:
            raise ValueError("PERPLEXITY_API_KEY environment variable is required")
        self.base_url = "https://api.perplexity.ai/chat/completions"
        self.logger = logging.getLogger(self.__class__.__name__)
        
        # Log API key status for debugging
        if os.environ.get("PERPLEXITY_API_KEY"):
            self.logger.info("Using PERPLEXITY_API_KEY from environment variables")
        else:
            self.logger.warning("PERPLEXITY_API_KEY not found in environment variables")
    
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
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": "llama-3.1-sonar-small-128k-online",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a helpful assistant that provides accurate and up-to-date information with proper citations and references."
                    },
                    {
                        "role": "user",
                        "content": query
                    }
                ],
                "max_tokens": 1000,
                "temperature": 0.1,
                "top_p": 0.9
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(self.base_url, headers=headers, json=payload) as response:
                    if response.status == 200:
                        data = await response.json()
                        content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                        
                        # Extract sources from the response
                        sources = []
                        if "sources" in data:
                            sources = data["sources"]
                        
                        return [{
                            "content": content,
                            "sources": sources,
                            "query": query
                        }]
                    else:
                        self.logger.error(f"Perplexity API error: {response.status}")
                        return []
                        
        except Exception as e:
            self.logger.error(f"Error in Perplexity search: {str(e)}")
            return []
    
    def _identify_missing_fields(self, memo_data: Dict[str, Any]) -> List[str]:
        """
        Identify fields that are missing or have placeholder values.
        
        Args:
            memo_data: The memo data to analyze
            
        Returns:
            List of field names that need enrichment
        """
        fields_to_check = [
            "company_name", "headquarters", "founded_date", "company_stage",
            "amount_raising", "post_money_valuation", "current_revenue",
            "customer_acquisition_cost", "gross_margin", "burn_rate",
            "runway", "team_size", "market_size", "target_market",
            "competitive_advantages", "business_model", "revenue_model",
            "pricing_strategy", "go_to_market", "key_milestones",
            "founder_linkedin", "founder_background"
        ]
        
        missing_fields = []
        for field in fields_to_check:
            value = memo_data.get(field)
            if not value or value in ["Not specified", "Not disclosed", "N/A", "", None]:
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
        try:
            # Identify missing fields
            missing_fields = self._identify_missing_fields(memo_data)
            
            if not missing_fields:
                self.logger.info("No missing fields found for enrichment")
                return memo_data
            
            self.logger.info(f"Found {len(missing_fields)} missing fields: {missing_fields}")
            
            # Create company context for better search results
            company_name = memo_data.get("company_name", "the company")
            company_stage = memo_data.get("company_stage", "")
            industry = memo_data.get("industry", "")
            
            company_context = f"{company_name}"
            if company_stage:
                company_context += f" ({company_stage})"
            if industry:
                company_context += f" in {industry}"
            
            # Enrich missing fields
            enriched_data = await self._enrich_fields(missing_fields, company_context)
            
            # Merge enriched data with original data
            result = memo_data.copy()
            for field, value in enriched_data.items():
                if field in missing_fields:
                    result[f"{field}_enriched"] = value
                    result["enrichment_sources"] = result.get("enrichment_sources", [])
                    result["enrichment_sources"].append(f"Perplexity AI - {field}")
            
            self.logger.info(f"Successfully enriched {len(enriched_data)} fields")
            return result
            
        except Exception as e:
            self.logger.error(f"Error in enrich_missing_fields: {str(e)}")
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
