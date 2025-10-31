import os
import json
import logging
import asyncio
import aiohttp
import re
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
    
    def __init__(self, project: str = "veritas-472301", location: str = "asia-south1"):
        # Use environment variable for API key
        # In Cloud Functions, secrets are automatically available as environment variables
        self.api_key = os.environ.get("PERPLEXITY_API_KEY")
        self.logger = logging.getLogger(self.__class__.__name__)
        
        # Vertex AI configuration
        self.project = project
        self.location = location
        self.vertex_model = None
        
        # Log API key status for debugging (without exposing full key)
        if self.api_key:
            api_key_preview = f"{self.api_key[:8]}...{self.api_key[-4:]}" if len(self.api_key) > 12 else f"{self.api_key[:4]}..."
            self.logger.info(f"PERPLEXITY_API_KEY found: {api_key_preview}")
            self.logger.info(f"API key length: {len(self.api_key)}")
            self.logger.info(f"API key starts with 'pplx-': {self.api_key.startswith('pplx-')}")
        else:
            self.logger.warning("PERPLEXITY_API_KEY not found in environment variables")
            # Check if it's available via different methods
            self.logger.warning(f"Available env vars with 'PERPLEXITY' or 'API': {[k for k in os.environ.keys() if 'PERPLEXITY' in k or 'API' in k]}")
        
        if not self.api_key:
            self.logger.warning("PERPLEXITY_API_KEY not set - enrichment will be skipped")
            self.logger.warning("Please verify the secret is configured in Google Secret Manager and the Cloud Function has access to it")
            self.enabled = False
        else:
            # Validate API key format (Perplexity keys typically start with 'pplx-')
            api_key_preview = f"{self.api_key[:8]}...{self.api_key[-4:]}" if len(self.api_key) > 12 else f"{self.api_key[:4]}..."
            if not self.api_key.startswith("pplx-"):
                self.logger.warning(f"PERPLEXITY_API_KEY format may be invalid (should start with 'pplx-'): {api_key_preview}")
                self.logger.warning("The API key might be incorrectly formatted. Please verify in Google Secret Manager.")
                # Still enable it, but log the warning
            else:
                self.logger.info(f"Perplexity enrichment enabled (API key: {api_key_preview})")
            self.enabled = True
        
        # Initialize Vertex AI if available (only if Perplexity is enabled)
        # Vertex AI is used for structured extraction from Perplexity results
        if VERTEX_AI_AVAILABLE:
            try:
                # Initialize Vertex AI - this can be done even if Perplexity is disabled
                # as it might be used for other purposes or re-enabled later
                vertexai.init(project=self.project, location=self.location)
                self.vertex_model = GenerativeModel("gemini-2.5-flash")
                self.logger.info(f"Vertex AI initialized for structured data extraction (project: {self.project}, location: {self.location})")
            except Exception as e:
                self.logger.warning(f"Vertex AI initialization failed: {e}. Will use fallback extraction methods.")
                self.vertex_model = None
                # Don't disable the service if Vertex AI fails - we have fallback extraction
        else:
            self.logger.warning("Vertex AI libraries not available. Will use fallback extraction methods.")
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
        # Validate API key and service status before making request
        if not self.api_key:
            self.logger.error("API key is not set, cannot make Perplexity API call")
            return []
        
        if not self.enabled:
            self.logger.warning("Perplexity service is disabled, skipping API call")
            return []
        
        try:
            # Log API key status (first 10 chars only for security)
            api_key_preview = f"{self.api_key[:10]}..." if self.api_key else "None"
            self.logger.debug(f"Making Perplexity API call with key: {api_key_preview}")
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
            
            # Use the correct model name and parameters for Perplexity
            payload = {
                "model": "sonar",  # Current Perplexity search model (2025) with web search + citations
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
                        # Gracefully handle errors with better diagnostics
                        if response.status == 401:
                            api_key_preview = f"{self.api_key[:8]}...{self.api_key[-4:]}" if len(self.api_key) > 12 else f"{self.api_key[:4]}..."
                            error_message = (
                                f"Perplexity API returned 401 Unauthorized. "
                                f"This usually means the API key is invalid or expired. "
                                f"API key preview: {api_key_preview}. "
                                f"API key length: {len(self.api_key) if self.api_key else 0}. "
                                f"Please verify the PERPLEXITY_API_KEY secret in Google Secret Manager. "
                                f"Steps to fix:\n"
                                f"1. Check if the secret exists: gcloud secrets describe PERPLEXITY_API_KEY\n"
                                f"2. Verify the secret value starts with 'pplx-'\n"
                                f"3. Ensure the Cloud Function has access to the secret\n"
                                f"4. Update the secret if it's expired: gcloud secrets versions add PERPLEXITY_API_KEY --data-file=-"
                            )
                            self.logger.error(error_message)
                            # Don't disable permanently - allow retries
                            # Return empty result but keep enabled for next run
                        elif response.status == 429:
                            self.logger.warning("Perplexity API returned 429 Rate Limit. Enrichment will be skipped for this run.")
                            # Don't disable permanently for rate limits
                        else:
                            # Truncate to keep logs readable
                            truncated = (response_text[:300] + '...') if len(response_text) > 300 else response_text
                            self.logger.warning(f"Perplexity API error {response.status}: {truncated}")
                        # Return empty result but keep service enabled for next run
                        return []
                        
        except Exception as e:
            self.logger.error(f"Exception in Perplexity search: {str(e)}", exc_info=True)
            return []
    
    def extract_json_from_response(self, response_text: str) -> Optional[Dict[str, Any]]:
        """
        Extract JSON from Gemini response, handling markdown code blocks and extra text.
        Similar to the helper in diligence_agent_rag.py for consistency.
        
        Args:
            response_text: Raw response text from Gemini
            
        Returns:
            Parsed JSON dictionary or None if extraction fails
        """
        if not response_text or not response_text.strip():
            self.logger.warning("Empty response from Gemini")
            return None
            
        try:
            # First try direct JSON parsing
            return json.loads(response_text.strip())
        except json.JSONDecodeError:
            pass
        
        # Try to extract JSON from markdown code blocks
        import re
        
        # Pattern to match ```json ... ``` blocks
        json_pattern = r'```(?:json)?\s*(\{.*?\})\s*```'
        match = re.search(json_pattern, response_text, re.DOTALL)
        
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass
        
        # Try to find JSON object boundaries
        json_pattern = r'\{.*\}'
        match = re.search(json_pattern, response_text, re.DOTALL)
        
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                pass
        
        # Log the actual response for debugging
        self.logger.error(f"Failed to extract JSON from Gemini response. Response: {response_text[:500]}...")
        return None
    
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
        
        # Define field categories with specialized prompts - Enhanced for better data extraction
        field_categories = {
            "company_basics": {
                "fields": ["company_stage", "headquarters", "founded_date", "team_size"],
                "prompt_template": """Research and provide verified company information for {company_context}. 
                    Find and extract:
                    1. Headquarters location - exact city and state/country
                    2. Founding date - year or specific date
                    3. Current funding stage - Seed, Series A/B/C, Pre-seed, Growth stage, etc.
                    4. Team size - number of employees
                    
                    Search for official sources like company website, Crunchbase, LinkedIn company page, press releases, and SEC filings.
                    Include specific dates, locations, and stage details with sources."""
            },
            "financial_metrics": {
                "fields": ["current_revenue", "revenue_growth_rate", "burn_rate", "runway", "customer_acquisition_cost", "lifetime_value", "gross_margin"],
                "prompt_template": """Find latest financial data and metrics for {company_context}. 
                    Extract:
                    1. Current revenue - annual revenue, ARR, or MRR with currency
                    2. Revenue growth rate - percentage or growth rate
                    3. Burn rate - monthly cash burn with currency
                    4. Runway - months of cash remaining
                    5. Customer Acquisition Cost (CAC) - cost per customer
                    6. Lifetime Value (LTV) - customer lifetime value
                    7. Gross margin - gross margin percentage
                    
                    Focus on recent data from 2024-2025. Look for financial disclosures, investor reports, pitch decks, or public statements.
                    Include specific numbers, currency, and sources."""
            },
            "funding_deals": {
                "fields": ["amount_raising", "post_money_valuation", "pre_money_valuation", "lead_investor", "committed_funding", "use_of_funds"],
                "prompt_template": """Research funding information for {company_context}. 
                    Find and extract:
                    1. Current funding round amount - amount raising or recently raised
                    2. Post-money valuation - valuation after funding round
                    3. Pre-money valuation - valuation before funding round
                    4. Lead investor - name of lead investment firm or investor
                    5. Committed funding - total funding committed or raised
                    6. Use of funds - how the funding will be used (product development, marketing, hiring, etc.)
                    
                    Search for recent funding announcements, press releases, TechCrunch articles, Crunchbase, and investor databases.
                    Include specific amounts with currency and recent dates."""
            },
            "market_intelligence": {
                "fields": ["sam_market_size", "som_market_size", "market_penetration", "market_timing", "market_trends", "competitive_advantages"],
                "prompt_template": """Analyze market for {company_context}. 
                    Find and extract:
                    1. SAM (Serviceable Addressable Market) size - total addressable market size with currency
                    2. SOM (Serviceable Obtainable Market) size - obtainable market size with currency
                    3. Market penetration - current market penetration percentage
                    4. Market timing - assessment of market timing (early, mature, etc.)
                    5. Market trends - current trends in the industry
                    6. Competitive advantages - key competitive advantages and differentiators
                    
                    Look for market research reports, industry analyses, competitor data, and market sizing studies.
                    Include specific market size numbers, percentages, and competitive positioning."""
            },
            "team_execution": {
                "fields": ["key_team_members", "advisory_board", "go_to_market", "sales_strategy", "partnerships"],
                "prompt_template": """Research team and execution for {company_context}. 
                    Find and extract:
                    1. Key team members - names and roles of key executives and founders
                    2. Advisory board - names and backgrounds of advisory board members
                    3. Go-to-market strategy - GTM strategy description
                    4. Sales strategy - sales approach and methodology
                    5. Key partnerships - list of important strategic partnerships
                    
                    Search company website, LinkedIn company page, press releases, and executive profiles.
                    Include LinkedIn profiles, strategic partnerships, and execution details."""
            },
            "growth_exit": {
                "fields": ["scalability_plan", "exit_strategy", "exit_valuation", "potential_acquirers", "ipo_timeline"],
                "prompt_template": """Analyze growth and exit strategy for {company_context}. 
                    Find and extract:
                    1. Scalability plan - plans for scaling the business
                    2. Exit strategy - planned exit strategy (IPO, acquisition, etc.)
                    3. Exit valuation - expected exit valuation with currency
                    4. Potential acquirers - list of potential acquirer companies
                    5. IPO timeline - IPO timeline if applicable
                    
                    Look for strategic plans, investor presentations, and industry analysis.
                    Include strategic growth plans and exit options."""
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
        Enhanced with better field matching and extraction logic.
        
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
            # Create field descriptions for better extraction
            field_descriptions = {
                "company_stage": "company funding stage like Seed, Series A, Series B, Pre-seed, or growth stage",
                "headquarters": "headquarters location as City, State/Country",
                "founded_date": "founding date as YYYY-MM-DD or YYYY",
                "team_size": "total number of employees or team size",
                "current_revenue": "current annual revenue with currency",
                "revenue_growth_rate": "revenue growth rate as percentage",
                "burn_rate": "monthly burn rate with currency",
                "runway": "runway in months remaining",
                "customer_acquisition_cost": "CAC cost per customer with currency",
                "lifetime_value": "LTV lifetime value per customer with currency",
                "gross_margin": "gross margin percentage",
                "amount_raising": "amount currently raising in funding round with currency",
                "post_money_valuation": "post-money valuation with currency",
                "pre_money_valuation": "pre-money valuation with currency",
                "lead_investor": "name of lead investor or investment firm",
                "committed_funding": "committed funding amount with currency",
                "use_of_funds": "how the funding will be used",
                "sam_market_size": "SAM (Serviceable Addressable Market) size with currency",
                "som_market_size": "SOM (Serviceable Obtainable Market) size with currency",
                "market_penetration": "market penetration percentage",
                "market_timing": "market timing assessment",
                "market_trends": "current market trends description",
                "competitive_advantages": "list of competitive advantages",
                "key_team_members": "list of key team members with roles",
                "advisory_board": "list of advisory board members",
                "go_to_market": "go-to-market strategy description",
                "sales_strategy": "sales strategy description",
                "partnerships": "list of key partnerships",
                "scalability_plan": "scalability plan description",
                "exit_strategy": "exit strategy description",
                "exit_valuation": "expected exit valuation with currency",
                "potential_acquirers": "list of potential acquirer companies",
                "ipo_timeline": "IPO timeline if applicable"
            }
            
            # Build field descriptions string
            fields_with_desc = []
            for field in fields:
                desc = field_descriptions.get(field, field.replace('_', ' '))
                fields_with_desc.append(f"{field} ({desc})")
            
            prompt = f"""You are an expert data extraction specialist for startup investment due diligence. Extract structured information from the following content about a startup company.

            **CRITICAL - RESPONSE FORMAT:**
            Return ONLY a valid JSON object. No markdown, no code blocks, no explanations before or after.
            Your response must start with {{ and end with }}.
            Do not wrap in ```json``` or any other formatting.

            **Required JSON Structure:**
            {{
                "field_name": {{
                    "value": "extracted_value",
                    "confidence": 0.85,
                    "source": "brief source description"
                }}
            }}

            **Category:** {category}
            **Fields to extract:** {', '.join(fields)}
            **Field Descriptions:** {', '.join(fields_with_desc)}
            
            **Content to analyze:**
            {content[:6000]}

            **Extraction Rules:**
            1. **Search thoroughly** - Look for the information in multiple ways:
               - Direct mentions (e.g., "founded in 2020", "headquartered in San Francisco")
               - Indirect mentions (e.g., "company history shows...", "based in...")
               - Alternative phrasings (e.g., "headquarters" vs "head office" vs "HQ" vs "base")
               - Related information that implies the field (e.g., "Series A round" implies stage)
            
            2. Extract ONLY the requested fields ({', '.join(fields)})
            3. For each field found, provide:
               - value: The extracted data (string, number, or array as appropriate)
               - confidence: 0.0-1.0 (1.0 = highly confident, 0.5 = somewhat confident, 0.0 = not found)
               - source: Brief description of where the data came from (e.g., "Company website", "Crunchbase", "LinkedIn profile", "Press release")
            
            4. **Field-Specific Formatting:**
               - Dates: Use YYYY-MM-DD or YYYY format (e.g., "2020-05-15" or "2020")
               - Currency: Include currency symbol and units (e.g., "$2.5M", "$500K", "$1.2B", "$50M ARR")
               - Percentages: Include % symbol (e.g., "85%", "12.5%")
               - Numbers with units: Include units (e.g., "50 employees", "24 months", "120 customers")
               - Locations: Format as "City, State/Country" (e.g., "San Francisco, CA" or "Bangalore, India")
               - Funding stages: Use standard format (e.g., "Seed", "Series A", "Series B", "Pre-seed", "Growth")
               - Team members: Format as "Name - Role" or array of objects
               - URLs: Full URLs (e.g., "https://linkedin.com/in/username")
            
            5. **Confidence Scoring Guidelines:**
               - 0.9-1.0: Explicitly stated in content, multiple sources agree, very clear
               - 0.7-0.9: Clearly stated, single reliable source, unambiguous
               - 0.5-0.7: Implied or inferred from content, reasonably clear
               - 0.3-0.5: Possible but uncertain, needs verification
               - 0.0-0.3: Not found or highly uncertain (use null for value)
            
            6. **Field Matching Strategies:**
               - Look for exact field names (e.g., "headquarters", "HQ")
               - Look for synonyms (e.g., "founded" = "founded_date", "established" = "founded_date")
               - Look for related phrases (e.g., "based in" = "headquarters", "located in" = "headquarters")
               - For financial fields, look for currency symbols and numbers together
               - For dates, look for year mentions or date patterns
            
            7. If information is NOT found: Use null for value and 0.0 for confidence
            8. For arrays/lists: Use JSON arrays ["item1", "item2"]
            9. Preserve original data format when possible (don't convert unnecessarily)
            10. Extract ALL available information - don't stop at first match if more data is available

            **Example Output:**
            {{
                "founded_date": {{
                    "value": "2020-05-15",
                    "confidence": 0.9,
                    "source": "Company website About page"
                }},
                "headquarters": {{
                    "value": "San Francisco, CA",
                    "confidence": 0.85,
                    "source": "Crunchbase and company LinkedIn"
                }},
                "customer_acquisition_cost": {{
                    "value": "$3,500",
                    "confidence": 0.7,
                    "source": "Industry report and interview mention"
                }},
                "lifetime_value": {{
                    "value": "$850K",
                    "confidence": 0.75,
                    "source": "Public disclosure in pitch deck summary"
                }}
            }}

            **IMPORTANT:** 
            - Extract real data only. If a field is not found in the content, set value to null and confidence to 0.0.
            - Do not make up or infer data that isn't present.
            - Search for ALL requested fields ({', '.join(fields)}) - don't skip any.
            - Be thorough and extract as much information as possible.
            - If you find partial information, include it with appropriate confidence score.

            Analyze the content carefully and return ONLY the JSON object with extracted fields."""
            
            # Generate content using Vertex AI (sync method)
            # Note: Vertex AI GenerativeModel.generate_content() is synchronous
            # In async contexts, it still works but runs synchronously
            try:
                response = self.vertex_model.generate_content(prompt)
            except Exception as gen_error:
                self.logger.error(f"Error generating content with Vertex AI: {gen_error}", exc_info=True)
                return {}
            
            # Get response text (handle both sync and async responses)
            response_text = response.text if hasattr(response, 'text') else str(response)
            
            # Add debug logging for Gemini response
            self.logger.debug(f"Gemini response (first 500 chars): {response_text[:500]}")
            
            # Parse the JSON response using helper function
            result = self.extract_json_from_response(response_text)
            
            if result is None:
                self.logger.error("Failed to extract JSON from Gemini response")
                return {}
            
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
                        
            self.logger.info(f"Successfully processed {len(processed_data)} fields from Gemini response")
            return processed_data
                
        except Exception as e:
            self.logger.error(f"Error in Vertex AI processing: {e}")
            return {}
    
    def _extract_field_data(self, content: str, fields: List[str]) -> Dict[str, Any]:
        """
        Extract specific field data from search results with enhanced parsing.
        Uses multiple strategies to find field values.
        
        Args:
            content: The search result content
            fields: List of fields to extract
            
        Returns:
            Dictionary of extracted field data
        """
        extracted_data = {}
        content_lower = content.lower()
        
        # Field name mappings for better matching
        field_aliases = {
            "founded_date": ["founded", "established", "founding date", "started", "launched"],
            "headquarters": ["headquarters", "hq", "head office", "base", "located in", "based in", "city"],
            "company_stage": ["stage", "funding stage", "round", "series", "seed", "growth stage"],
            "amount_raising": ["raising", "funding round", "seeking", "looking to raise", "target"],
            "post_money_valuation": ["post-money", "post money valuation", "valued at", "valuation"],
            "current_revenue": ["revenue", "arr", "annual revenue", "recurring revenue", "income"],
            "team_size": ["employees", "team size", "headcount", "staff", "people"],
            "burn_rate": ["burn rate", "monthly burn", "cash burn"],
            "runway": ["runway", "months remaining", "cash runway"],
            "customer_acquisition_cost": ["cac", "customer acquisition cost", "acquisition cost"],
            "lifetime_value": ["ltv", "lifetime value", "customer lifetime value"],
            "gross_margin": ["gross margin", "margin", "gross profit margin"]
        }
        
        for field in fields:
            if field in extracted_data:
                continue  # Already extracted
                
            # Strategy 1: Direct field name match
            field_lower = field.replace('_', ' ').lower()
            if field_lower in content_lower:
                # Look for value patterns near the field name
                patterns = [
                    rf"{re.escape(field_lower)}\s*[:=]\s*([^\n,]+)",
                    rf"{re.escape(field_lower)}\s+(?:is|are|was|were)?\s+([^\n,\.]+)",
                    rf"{re.escape(field_lower)}\s*[-–]\s*([^\n,]+)",
                ]
                
                for pattern in patterns:
                    match = re.search(pattern, content_lower, re.IGNORECASE)
                    if match:
                        value = match.group(1).strip()
                        if value and value not in ["not specified", "n/a", "unknown", "tbd", ""]:
                            extracted_data[field] = value
                            break
            
            # Strategy 2: Use field aliases
            if field not in extracted_data and field in field_aliases:
                for alias in field_aliases[field]:
                    if alias in content_lower:
                        # Find the value near the alias
                        alias_pattern = rf"{re.escape(alias)}\s*[:=]\s*([^\n,\.]+)"
                        match = re.search(alias_pattern, content_lower, re.IGNORECASE)
                        if match:
                            value = match.group(1).strip()
                            if value and value not in ["not specified", "n/a", "unknown", "tbd", ""]:
                                extracted_data[field] = value
                                break
            
            # Strategy 3: Pattern-based extraction for specific field types
            if field not in extracted_data:
                # Dates (founded_date)
                if field == "founded_date":
                    date_patterns = [
                        r"(?:founded|established|started|launched)\s+(?:in\s+)?(\d{4})",
                        r"(\d{4})\s+(?:founded|established|started|launched)",
                        r"since\s+(\d{4})"
                    ]
                    for pattern in date_patterns:
                        match = re.search(pattern, content_lower)
                        if match:
                            extracted_data[field] = match.group(1)
                            break
                
                # Currency amounts (revenue, valuation, funding)
                elif field in ["amount_raising", "post_money_valuation", "current_revenue", "pre_money_valuation"]:
                    currency_patterns = [
                        r"\$\s*(\d+\.?\d*)\s*[KMkmB]",
                        r"(\d+\.?\d*)\s*(?:million|billion|thousand)",
                        r"USD\s*(\d+\.?\d*)\s*[KMkmB]?"
                    ]
                    for pattern in currency_patterns:
                        matches = re.findall(pattern, content_lower)
                        if matches:
                            # Get the largest value (likely the main amount)
                            extracted_data[field] = f"${matches[-1]}"
                            break
                
                # Locations (headquarters)
                elif field == "headquarters":
                    location_patterns = [
                        r"(?:headquarters|hq|base|located|based)\s+(?:in|at)?\s*([A-Z][a-zA-Z\s]+(?:,\s*[A-Z][a-zA-Z\s]+)?)",
                        r"([A-Z][a-zA-Z]+),\s*([A-Z]{2}|[A-Z][a-zA-Z]+)"
                    ]
                    for pattern in location_patterns:
                        match = re.search(pattern, content, re.IGNORECASE)
                        if match:
                            location = match.group(0) if len(match.groups()) == 0 else ', '.join(match.groups())
                            if len(location) > 3 and len(location) < 100:
                                extracted_data[field] = location
                                break
            
            # Strategy 4: Line-by-line search for structured content
            if field not in extracted_data:
                lines = content.split('\n')
                for i, line in enumerate(lines):
                    line_lower = line.lower()
                    # Check if line contains field name or alias
                    search_terms = [field.replace('_', ' ')] + field_aliases.get(field, [])
                    
                    for term in search_terms:
                        if term in line_lower and ':' in line:
                            parts = line.split(':', 1)
                            if len(parts) == 2:
                                value = parts[1].strip()
                                if value and value not in ["not specified", "n/a", "unknown", "tbd", "", "none"]:
                                    # Clean up the value
                                    value = value.rstrip('.,;')
                                    extracted_data[field] = value
                                    break
                    if field in extracted_data:
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

            # Derive Financial Validation block if possible
            financial_validation = self._build_financial_validation(memo_data, enriched_data)
            if financial_validation:
                enriched_data["financial_validation"] = financial_validation

            # Build Market & Claim Validation structure if content available
            claim_validations = self._build_claim_validations(memo_data, enriched_data)
            if claim_validations:
                enriched_data["claim_validations"] = claim_validations
            
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

    def _build_financial_validation(self, base: Dict[str, Any], enriched: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            def pick(*keys):
                for k in keys:
                    if k in base and base[k]:
                        return base[k]
                    if k in enriched and enriched[k]:
                        return enriched[k]
                return None

            cac = pick("customer_acquisition_cost", "cac")
            ltv = pick("lifetime_value", "ltv")
            burn = pick("burn_rate")
            runway = pick("runway")
            gross_margin = pick("gross_margin")

            if not any([cac, ltv, burn, runway, gross_margin]):
                return None

            def label_cac(v: str) -> str:
                return "REASONABLE" if v else "UNKNOWN"
            def label_ltv(v: str) -> str:
                return "SOLID" if v else "UNKNOWN"
            def label_burn(v: str, rw: str) -> str:
                return "TIGHT" if v and rw else "UNKNOWN"
            def label_gm(v: str) -> str:
                return "HEALTHY" if v else "UNKNOWN"

            return {
                "cac_current": cac,
                "cac_eoy": None,
                "ltv_min": ltv,
                "ltv_max": None,
                "cac_ltv_ratio": None,
                "burn_rate_monthly": burn,
                "runway_months": runway,
                "gross_margin_pct": gross_margin,
                "labels": {
                    "cac_reasonableness": label_cac(cac),
                    "ltv_quality": label_ltv(ltv),
                    "burn_tightness": label_burn(burn, runway),
                    "gross_margin_health": label_gm(gross_margin)
                }
            }
        except Exception:
            return None

    def _build_claim_validations(self, base: Dict[str, Any], enriched: Dict[str, Any]) -> Optional[List[Dict[str, Any]]]:
        try:
            claims = []
            for claim in base.get("validation_points", []) or []:
                claims.append({
                    "claim": claim,
                    "source": "web",
                    "finding": "pending",
                    "match": False,
                    "confidence": 0.0
                })
            return claims or None
        except Exception:
            return None
    
    async def enrich_linkedin_verification(self, founder_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Enrich founder data with LinkedIn verification information.
        
        Args:
            founder_data: Dictionary containing founder information from memo_1
            
        Returns:
            Dictionary with LinkedIn verification data
        """
        if not self.enabled:
            self.logger.info("Perplexity enrichment disabled - skipping LinkedIn verification")
            return {}
            
        try:
            founder_name = founder_data.get("founder_name", "")
            if isinstance(founder_name, list):
                founder_name = founder_name[0] if founder_name else ""
            
            company_name = founder_data.get("title", founder_data.get("company_name", ""))
            
            if not founder_name:
                self.logger.warning("No founder name provided for LinkedIn verification")
                return {}
            
            # Search for LinkedIn profile and verification data
            linkedin_query = f"LinkedIn profile verification {founder_name} {company_name} education employment patents"
            
            search_results = await self._perplexity_search(linkedin_query, max_results=3)
            
            if not search_results:
                self.logger.warning(f"No LinkedIn data found for {founder_name}")
                return {}
            
            # Use Gemini to extract structured LinkedIn verification data
            if self.vertex_model:
                verification_data = await self._extract_linkedin_verification(search_results, founder_name, company_name)
                return verification_data
            else:
                # Fallback to basic extraction
                return self._basic_linkedin_extraction(search_results, founder_name)
                
        except Exception as e:
            self.logger.error(f"Error in LinkedIn verification: {str(e)}", exc_info=True)
            return {}
    
    async def _extract_linkedin_verification(self, search_results: List[Dict[str, Any]], 
                                           founder_name: str, company_name: str) -> Dict[str, Any]:
        """Extract structured LinkedIn verification data using Gemini."""
        try:
            # Prepare context from search results
            context = "\n\n".join([result.get("content", "") for result in search_results])
            
            prompt = f"""
            Extract LinkedIn verification data for founder: {founder_name} at company: {company_name}
            
            From the following search results, extract and structure LinkedIn verification information:
            
            {context}
            
            Return a JSON object with the following structure:
            {{
                "founder_name": "{founder_name}",
                "linkedin_url": "linkedin.com/in/...",
                "education_verified": {{
                    "degree": "M.E. Information Technology",
                    "university": "Frankfurt University",
                    "status": "VERIFIED",
                    "confidence": 0.9
                }},
                "employment_verified": {{
                    "company": "Bosch",
                    "position": "Senior Data Scientist",
                    "duration": "2018-2023",
                    "status": "VERIFIED",
                    "confidence": 0.9
                }},
                "patents_verified": {{
                    "count": 10,
                    "status": "VERIFIED",
                    "confidence": 0.8
                }},
                "recommendations": {{
                    "count": 12,
                    "status": "VERIFIED",
                    "confidence": 0.7
                }},
                "current_position": {{
                    "company": "{company_name}",
                    "position": "CEO",
                    "status": "VERIFIED",
                    "confidence": 0.9
                }},
                "overall_verification_score": 0.85,
                "verification_status": "HIGH"
            }}
            
            If information is not found, set status to "NOT_FOUND" and confidence to 0.0.
            Be conservative with verification - only mark as VERIFIED if clearly stated in the search results.
            """
            
            response = await self.vertex_model.generate_content_async(prompt)
            verification_text = response.text.strip()
            
            # Extract JSON from response
            import json
            import re
            
            # Try to find JSON in the response
            json_match = re.search(r'\{.*\}', verification_text, re.DOTALL)
            if json_match:
                verification_data = json.loads(json_match.group())
                return verification_data
            else:
                self.logger.warning("Could not extract JSON from LinkedIn verification response")
                return {}
                
        except Exception as e:
            self.logger.error(f"Error extracting LinkedIn verification: {str(e)}")
            return {}
    
    def _basic_linkedin_extraction(self, search_results: List[Dict[str, Any]], founder_name: str) -> Dict[str, Any]:
        """Basic LinkedIn data extraction without Gemini."""
        try:
            # Simple keyword-based extraction
            content = " ".join([result.get("content", "") for result in search_results])
            
            verification_data = {
                "founder_name": founder_name,
                "linkedin_url": "Not found",
                "education_verified": {
                    "degree": "Not specified",
                    "university": "Not specified", 
                    "status": "NOT_FOUND",
                    "confidence": 0.0
                },
                "employment_verified": {
                    "company": "Not specified",
                    "position": "Not specified",
                    "duration": "Not specified",
                    "status": "NOT_FOUND", 
                    "confidence": 0.0
                },
                "patents_verified": {
                    "count": 0,
                    "status": "NOT_FOUND",
                    "confidence": 0.0
                },
                "recommendations": {
                    "count": 0,
                    "status": "NOT_FOUND",
                    "confidence": 0.0
                },
                "current_position": {
                    "company": "Not specified",
                    "position": "Not specified",
                    "status": "NOT_FOUND",
                    "confidence": 0.0
                },
                "overall_verification_score": 0.0,
                "verification_status": "LOW"
            }
            
            # Basic keyword matching
            if "linkedin.com" in content.lower():
                verification_data["linkedin_url"] = "Found in search results"
            
            if any(degree in content.lower() for degree in ["b.e.", "m.e.", "bachelor", "master", "phd"]):
                verification_data["education_verified"]["status"] = "PARTIAL"
                verification_data["education_verified"]["confidence"] = 0.5
            
            if any(company in content.lower() for company in ["bosch", "ibm", "microsoft", "google"]):
                verification_data["employment_verified"]["status"] = "PARTIAL"
                verification_data["employment_verified"]["confidence"] = 0.5
            
            if "patent" in content.lower():
                verification_data["patents_verified"]["status"] = "PARTIAL"
                verification_data["patents_verified"]["confidence"] = 0.5
            
            return verification_data
            
        except Exception as e:
            self.logger.error(f"Error in basic LinkedIn extraction: {str(e)}")
            return {}

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
