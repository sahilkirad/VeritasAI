"""
Memo Enrichment Agent
Identifies missing fields in memos, enriches them from public sources via Perplexity API,
and saves to memo1_validated collection.
"""

import logging
import asyncio
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import firebase_admin
from firebase_admin import firestore, initialize_app

from services.perplexity_service import PerplexitySearchService


class MemoEnrichmentAgent:
    """Agent for enriching memo data with missing information from public sources."""
    
    def __init__(self, project: str = "veritas-472301", location: str = "asia-south1"):
        self.project = project
        self.location = location
        self.logger = logging.getLogger(self.__class__.__name__)
        # Initialize Perplexity service with correct location
        self.perplexity_service = PerplexitySearchService(project=project, location=location)
        self.db = None
        
    def set_up(self):
        """Initialize the agent (called by main.py lazy loading pattern)."""
        # Ensure Firebase is initialized before using Firestore
        try:
            firebase_admin.get_app()
        except ValueError:
            # App not initialized yet, initialize it
            initialize_app()
        
        self.db = firestore.client()
        self.logger.info("MemoEnrichmentAgent initialized")
    
    def _is_field_empty(self, value: Any) -> bool:
        """Check if a field value is empty, missing, or placeholder."""
        if value is None:
            return True
        if isinstance(value, str):
            value = value.strip()
            # Check for empty string
            if len(value) == 0:
                return True
            # Normalize and check against placeholders
            normalized = value.lower().strip()
            placeholders = [
                "not specified", "not disclosed", "n/a", "na", "none", 
                "pending", "not available", "tbd", "to be determined", "—", 
                "-", "unknown", "tbc", "to be confirmed", "tba", "to be announced",
                "n/a", "na", "null", "nil", "undefined", "missing", "data pending"
            ]
            return normalized in placeholders
        if isinstance(value, (list, dict)):
            return len(value) == 0
        if isinstance(value, (int, float)):
            # For numeric fields, 0 might be valid, but we'll treat it as potentially missing
            # This can be refined based on business logic
            return value == 0
        return False
    
    def identify_missing_fields(self, memo_data: Dict[str, Any], memo_type: str = "memo_1") -> List[str]:
        """
        Identify fields that need enrichment based on required schema.
        
        Args:
            memo_data: The memo data to analyze
            memo_type: Type of memo ("memo_1", "diligence", etc.)
            
        Returns:
            List of field names that need enrichment
        """
        missing_fields = []
        
        # Get the memo_1 nested object if it exists
        memo_1 = memo_data.get("memo_1", memo_data) if memo_type == "memo_1" else memo_data
        
        # Required fields schema organized by category
        required_fields = {
            "company_details": [
                "founded_date", "headquarters", "company_stage", "team_size"
            ],
            "funding": [
                "amount_raising", "investment_sought", "pre_money_valuation", "post_money_valuation", "ownership_target",
                "fundraising_timeline", "exit_valuation", "exit_timeline"
            ],
            "finance_unit_economics": [
                "customer_acquisition_cost", "cac", "lifetime_value", "ltv",
                "gross_margin", "burn_rate", "runway", "runway_months"
            ],
            "market": [
                "sam", "som", "sam_market_size", "som_market_size"
            ],
            "product_tech": [
                "technology_stack", "product_roadmap", "key_features"
            ],
            "competitive": [
                "competitors", "competition", "market_positioning"
            ],
            "execution": [
                "partnership_timelines", "user_engagement_stats", "growth_metrics"
            ],
            "team": [
                "key_team_members", "founder_linkedin_url", "company_linkedin_url"
            ]
        }
        
        # Check each category
        for category, fields in required_fields.items():
            for field in fields:
                # Check both direct field and nested paths
                value = memo_1.get(field)
                if value is None:
                    # Try alternative field names
                    alt_names = {
                        "cac": "customer_acquisition_cost",
                        "ltv": "lifetime_value",
                        "sam": "sam_market_size",
                        "som": "som_market_size",
                        "runway": "runway_months",
                        "competitors": "competition"
                    }
                    if field in alt_names:
                        value = memo_1.get(alt_names[field])
                
                if self._is_field_empty(value):
                    missing_fields.append(field)
                    self.logger.debug(f"Missing field identified: {field}")
        
        self.logger.info(f"Identified {len(missing_fields)} missing fields for enrichment")
        return missing_fields
    
    def generate_enrichment_queries(self, missing_fields: List[str], company_name: str, 
                                   founder_name: str = "", industry: str = "") -> List[Dict[str, str]]:
        """
        Generate Perplexity queries for missing fields.
        
        Args:
            missing_fields: List of fields to enrich
            company_name: Company name
            founder_name: Founder name(s)
            industry: Industry category
            
        Returns:
            List of query dictionaries with field mappings
        """
        queries = []
        
        # Group fields by category for batch queries
        company_fields = ["founded_date", "headquarters", "company_stage", "team_size"]
        funding_fields = ["amount_raising", "investment_sought", "pre_money_valuation", "post_money_valuation", "ownership_target", 
                         "fundraising_timeline", "exit_valuation", "exit_timeline"]
        finance_fields = ["customer_acquisition_cost", "cac", "lifetime_value", "ltv", 
                         "gross_margin", "burn_rate", "runway", "runway_months"]
        market_fields = ["sam", "som", "sam_market_size", "som_market_size"]
        team_fields = ["key_team_members", "founder_linkedin_url", "company_linkedin_url"]
        
        context = company_name
        if founder_name:
            context += f" founded by {founder_name}"
        if industry:
            context += f" in {industry}"
        
        # Company details query
        if any(f in missing_fields for f in company_fields):
            queries.append({
                "query": f"""Research and provide verified company information for {context}. Find comprehensive details from official sources.

REQUIRED INFORMATION TO EXTRACT:
1. Headquarters location: Exact city, state/province, and country format (e.g., "San Francisco, CA, USA" or "Bangalore, Karnataka, India")
2. Founding date: Year (YYYY) or full date (YYYY-MM-DD) if available
3. Current funding stage: Specific stage (Pre-seed, Seed, Series A, Series B, Series C, Growth, Late-stage, etc.)
4. Team size/Employee count: Current number of employees (e.g., "25 employees", "50 people", "100+ team members")

DATA SOURCES TO PRIORITIZE:
- Company official website (About page, Team page, Contact page)
- Crunchbase profile with verified data
- LinkedIn company page
- Recent press releases (2024-2025)
- SEC filings if applicable
- News articles from TechCrunch, Forbes, or reputable tech publications

FORMATTING REQUIREMENTS:
- Dates: Use YYYY format (e.g., "2020") or YYYY-MM-DD if specific date available
- Locations: Format as "City, State/Province, Country" or "City, Country"
- Stages: Use standard capitalization (e.g., "Series A", "Seed", "Pre-seed")
- Team size: Include number and unit (e.g., "50 employees", "25 people")

VERIFICATION: Ensure all information is from verified, recent sources (2024-2025 preferred). Cross-reference multiple sources when possible.""",
                "fields": [f for f in company_fields if f in missing_fields]
            })
        
        # Funding query
        if any(f in missing_fields for f in funding_fields):
            queries.append({
                "query": f"""Research comprehensive funding and investment information for {context}. Extract detailed financial data from verified sources.

REQUIRED INFORMATION TO EXTRACT:
1. Amount Raising (amount_raising): Total amount the company is seeking to raise in current/upcoming round (e.g., "$5M", "$2.5M", "$10M Series A")
2. Investment Sought (investment_sought): Specific investment amount being solicited (may be same as amount_raising or a portion)
3. Pre-money Valuation: Company valuation before the funding round (e.g., "$25M pre-money", "$50M pre-money valuation")
4. Post-money Valuation: Company valuation after including new funding (e.g., "$30M post-money", "$60M post-money valuation")
5. Ownership Target: Percentage of equity being offered in this round (e.g., "20%", "15% equity")
6. Fundraising Timeline: Expected close date or timeline (e.g., "Q1 2025", "March 2025", "Within 6 months")
7. Exit Valuation: Expected exit valuation if disclosed (e.g., "$100M exit target", "$500M IPO valuation")
8. Exit Timeline: Expected IPO or acquisition timeline if mentioned (e.g., "IPO planned for 2027", "Exit in 5 years")

DATA SOURCES TO PRIORITIZE:
- Crunchbase funding rounds (most recent first)
- PitchBook database
- TechCrunch funding announcements
- Investor press releases and blogs
- Company website (if they disclose funding)
- LinkedIn company posts about funding
- SEC Form D filings (for US companies)
- Crunchbase news articles about funding rounds

FORMATTING REQUIREMENTS:
- Currency: Always include currency symbol and units (e.g., "$5M", "$2.5M", "$500K", "$1.2B", "€3M")
- Percentages: Include % symbol (e.g., "20%", "15% equity")
- Dates: Use clear format (e.g., "Q1 2025", "March 2025", "2025-Q2")
- Valuations: Specify pre-money or post-money clearly

RECENCY PRIORITY: Focus on data from last 12-18 months. If company is actively fundraising, prioritize current round information.""",
                "fields": [f for f in funding_fields if f in missing_fields]
            })
        
        # Financial/Unit Economics query
        if any(f in missing_fields for f in finance_fields):
            queries.append({
                "query": f"""Research and extract comprehensive financial metrics and unit economics data for {context}. Find the most recent verified financial information.

REQUIRED INFORMATION TO EXTRACT:
1. Customer Acquisition Cost (CAC): Cost to acquire one paying customer (e.g., "$500", "$3,500 per customer", "$2K CAC")
2. Lifetime Value (LTV): Total revenue expected from one customer over their lifetime (e.g., "$15,000", "$50K LTV", "$850K lifetime value")
3. Gross Margin: Percentage of revenue after direct costs (e.g., "75%", "80% gross margin", "60-70%")
4. Burn Rate: Monthly cash expenditure/burn (e.g., "$50K/month", "$200K monthly burn", "$2.5M annual burn")
5. Runway: Months of cash remaining at current burn rate (e.g., "18 months", "12-15 months runway", "24 months")

DATA SOURCES TO PRIORITIZE:
- Public financial disclosures (if available)
- Investor pitch deck summaries or public excerpts
- TechCrunch or Forbes interviews mentioning metrics
- Industry reports or benchmarking studies
- Podcasts or webinars where founders shared metrics
- Competitor analysis that includes benchmark data
- SaaS industry reports (SaaS Capital, OpenView, etc.)
- Startup databases that track metrics

FORMATTING REQUIREMENTS:
- Currency: Include $ symbol and units (e.g., "$3,500", "$50K", "$2.5M", "$1.2B")
- Percentages: Include % symbol (e.g., "75%", "80% gross margin")
- Time periods: Specify clearly (e.g., "18 months runway", "$50K/month burn rate")
- Ratios: Format as decimals or ratios (e.g., "3:1 LTV:CAC ratio", "LTV/CAC of 3.5")

RECENCY PRIORITY: Focus on data from 2024-2025. If older data is only available, clearly note the timeframe. Prefer quarterly or annual reports over older data.

VERIFICATION: Cross-reference multiple sources when possible. If metrics vary, use the most recent and reliable source.""",
                "fields": [f for f in finance_fields if f in missing_fields]
            })
        
        # Market query
        if any(f in missing_fields for f in market_fields):
            queries.append({
                "query": f"""Research and analyze market size metrics for {context}. Extract comprehensive market sizing data from credible sources.

REQUIRED INFORMATION TO EXTRACT:
1. SAM (Serviceable Addressable Market): Total market size that the company's products/services can address (e.g., "$5B SAM", "$2.5 billion addressable market")
2. SOM (Serviceable Obtainable Market): Portion of SAM the company can realistically capture in 3-5 years (e.g., "$500M SOM", "$200M obtainable market")

DEFINITIONS FOR CLARITY:
- SAM = Total addressable market for the company's specific product/service category
- SOM = Realistic market share the company can capture within their target timeframe
- Both should be for the same geographic and market segment

DATA SOURCES TO PRIORITIZE:
- Industry research reports (Gartner, Forrester, McKinsey, Deloitte)
- Market research firms (IBISWorld, Grand View Research, MarketsandMarkets)
- Government industry statistics (Bureau of Labor Statistics, census data)
- Trade association reports
- Investment bank market analyses
- Venture capital firm market research publications
- Academic research papers on market sizing
- Industry-specific market reports (e.g., CB Insights, PitchBook market reports)

FORMATTING REQUIREMENTS:
- Currency: Include $ symbol and units (e.g., "$5B", "$2.5 billion", "$500M", "$1.2T")
- Timeframe: Specify the year/period (e.g., "$5B SAM (2025)", "$2.5B market size by 2027")
- Geographic scope: Note if global, US, or specific region (e.g., "$5B global SAM", "$2.5B US market")

METHODOLOGY: If sources provide different numbers, include the methodology or note the range. Prefer data from established market research firms with clear methodology.

RECENCY: Prioritize market size data from 2024-2025 reports. If only older data available, note the year.""",
                "fields": [f for f in market_fields if f in missing_fields]
            })
        
        # Team/LinkedIn query
        if any(f in missing_fields for f in team_fields) and founder_name:
            queries.append({
                "query": f"""Research and find verified LinkedIn profile and professional background information for {founder_name} from {company_name}. Extract comprehensive professional data.

REQUIRED INFORMATION TO EXTRACT:
1. Founder LinkedIn Profile URL: Full LinkedIn profile URL (e.g., "https://linkedin.com/in/username", "linkedin.com/in/john-doe")
2. Company LinkedIn Page URL: Company's official LinkedIn page (e.g., "https://linkedin.com/company/companyname", "linkedin.com/company/startup-name")
3. Key Team Members: Names and roles of key executives/team members (e.g., "John Doe - CEO", "Jane Smith - CTO, previously at Google")

BACKGROUND INFORMATION TO INCLUDE:
- Education: Degrees, universities, graduation years (e.g., "MBA from Stanford, 2018", "BS Computer Science, MIT")
- Work History: Previous companies, positions, duration (e.g., "Senior Engineer at Google (2015-2020)", "VP Product at Microsoft (2010-2015)")
- Patents: Number of patents if applicable (e.g., "10 patents", "5 granted patents in AI/ML")
- Recommendations: Number of LinkedIn recommendations (e.g., "25 recommendations", "50+ endorsements")
- Current Role: Current position at {company_name} (e.g., "CEO and Co-founder", "Founder & CTO")

DATA SOURCES TO PRIORITIZE:
- Verified LinkedIn profiles (official profile pages)
- Company LinkedIn company page
- Crunchbase founder/team pages
- Company website "Team" or "About" pages
- Professional biographies from news articles
- Conference speaker bios
- Investor portfolio company pages

FORMATTING REQUIREMENTS:
- URLs: Full URLs including https:// (e.g., "https://linkedin.com/in/username")
- Names: Full names with proper capitalization
- Roles: Include both title and company (e.g., "CEO at StartupName", "CTO and Co-founder")
- Dates: Use clear format (e.g., "2015-2020", "2018-2023")

VERIFICATION: Ensure names match exactly. Cross-reference with company website and other professional profiles. If multiple people have the same name, prioritize the one clearly associated with {company_name}.""",
                "fields": [f for f in team_fields if f in missing_fields]
            })
        
        return queries
    
    async def enrich_memo(self, memo_id: str, memo_type: str = "memo_1") -> Dict[str, Any]:
        """
        Main orchestration method to enrich a memo.
        
        Args:
            memo_id: ID of the memo to enrich
            memo_type: Type of memo ("memo_1", "diligence", etc.)
            
        Returns:
            Dictionary with enrichment results and metadata
        """
        try:
            self.logger.info(f"Starting enrichment for memo {memo_id} (type: {memo_type})")
            
            # Ensure Firestore is initialized
            if not self.db:
                self.logger.warning("Firestore not initialized, calling set_up()")
                self.set_up()
            
            # Try multiple strategies to find the memo
            original_data = None
            memo_doc = None
            memo_1 = {}
            
            # Strategy 1: Try direct lookup by memo_id in ingestionResults
            try:
                memo_doc = self.db.collection("ingestionResults").document(memo_id).get()
                if memo_doc.exists:
                    original_data = memo_doc.to_dict()
                    memo_1 = original_data.get("memo_1", {})
                    self.logger.info(f"Found memo {memo_id} in ingestionResults by document ID")
            except Exception as e:
                self.logger.warning(f"Error fetching memo by document ID: {e}")
            
            # Strategy 2: If not found, try querying by company_id or other identifiers
            if not memo_doc or not memo_doc.exists:
                self.logger.info(f"Memo {memo_id} not found by document ID, trying alternative lookup...")
                try:
                    # Try querying by company_id if memo_id might be a company_id
                    from google.cloud.firestore import Query
                    query_ref = self.db.collection("ingestionResults")
                    
                    # Try querying by company_id field
                    query = query_ref.where("company_id", "==", memo_id).limit(1)
                    docs = list(query.stream())
                    
                    if not docs:
                        # Try querying recent documents and search for matching ID in various fields
                        query = query_ref.order_by("timestamp", direction=Query.DESCENDING).limit(20)
                        docs = list(query.stream())
                        
                        # Search through recent docs for matching memo_id in various fields
                        for doc in docs:
                            data = doc.to_dict()
                            if (data.get("company_id") == memo_id or 
                                data.get("memo_1", {}).get("company_id") == memo_id or
                                doc.id == memo_id):
                                memo_doc = doc
                                original_data = data
                                memo_1 = original_data.get("memo_1", {})
                                self.logger.info(f"Found memo {memo_id} in recent ingestionResults (doc ID: {doc.id})")
                                break
                    else:
                        doc_ref = docs[0].reference
                        memo_doc = doc_ref.get()
                        if memo_doc.exists:
                            original_data = memo_doc.to_dict()
                            memo_1 = original_data.get("memo_1", {})
                            self.logger.info(f"Found memo {memo_id} by company_id query (doc ID: {memo_doc.id})")
                        else:
                            # Use the doc from stream directly
                            memo_doc = docs[0]
                            original_data = docs[0].to_dict()
                            memo_1 = original_data.get("memo_1", {})
                            self.logger.info(f"Found memo {memo_id} by company_id query (doc ID: {docs[0].id})")
                except Exception as e:
                    self.logger.warning(f"Error in alternative lookup: {e}")
            
            # Strategy 3: Try checking memo1_validated collection
            # Check if we have a valid document (doc from stream doesn't have .exists, but we check if it's None)
            doc_exists = False
            if memo_doc:
                if hasattr(memo_doc, 'exists'):
                    doc_exists = memo_doc.exists
                else:
                    # DocumentSnapshot from stream() doesn't have .exists, but if it's not None, it exists
                    doc_exists = True
            
            if not doc_exists or not original_data or not memo_1:
                self.logger.info(f"Trying memo1_validated collection for memo {memo_id}...")
                try:
                    validated_doc = self.db.collection("memo1_validated").document(memo_id).get()
                    if validated_doc.exists:
                        validated_data = validated_doc.to_dict()
                        memo_1 = validated_data.get("memo_1", {})
                        original_data = {"memo_1": memo_1}
                        self.logger.info(f"Found memo {memo_id} in memo1_validated collection")
                    else:
                        # Try querying by company_id in memo1_validated
                        query = self.db.collection("memo1_validated").where("company_id", "==", memo_id).limit(1)
                        docs = list(query.stream())
                        if docs:
                            validated_data = docs[0].to_dict()
                            memo_1 = validated_data.get("memo_1", {})
                            original_data = {"memo_1": memo_1}
                            self.logger.info(f"Found memo {memo_id} in memo1_validated by company_id")
                except Exception as e:
                    self.logger.warning(f"Error checking memo1_validated: {e}")
            
            # Final check: if still not found, return error
            if not original_data or not memo_1:
                self.logger.error(f"Memo {memo_id} not found in ingestionResults or memo1_validated after all lookup strategies")
                return {
                    "error": "Memo not found", 
                    "memo_id": memo_id,
                    "suggestion": "Verify the memo_id is correct or check if memo exists in Firestore"
                }
            
            # Identify missing fields
            missing_fields = self.identify_missing_fields(original_data, memo_type)
            
            if not missing_fields:
                self.logger.info(f"No missing fields found for memo {memo_id}")
                # Still save to memo1_validated for consistency
                validated_data = {
                    "memo_1": memo_1,
                    "original_memo_id": memo_id,
                    "enrichment_metadata": {
                        "enrichment_timestamp": datetime.now().isoformat(),
                        "fields_enriched": [],
                        "enrichment_method": "none_needed"
                    },
                    "timestamp": datetime.now().isoformat()
                }
                self._save_validated_memo(memo_id, validated_data)
                return {"status": "no_enrichment_needed", "fields_enriched": []}
            
            # Get company context
            company_name = memo_1.get("title", original_data.get("title", "Unknown Company"))
            founder_name = memo_1.get("founder_name", "")
            if isinstance(founder_name, list):
                founder_name = founder_name[0] if founder_name else ""
            industry = memo_1.get("industry_category", memo_1.get("industry", ""))
            if isinstance(industry, list):
                industry = ", ".join(industry)
            
            # Generate queries
            queries = self.generate_enrichment_queries(missing_fields, company_name, founder_name, industry)
            
            # Enrich using Perplexity service
            enriched_data = {}
            enriched_fields_list = []
            enrichment_sources = {}
            confidence_scores = {}
            
            for query_info in queries:
                try:
                    # Use the Perplexity service to enrich
                    query = query_info["query"]
                    target_fields = query_info["fields"]
                    
                    self.logger.info(f"Enriching fields: {target_fields} with query: {query[:100]}...")
                    
                    # Check if Perplexity service is enabled before using it
                    if not self.perplexity_service.enabled:
                        self.logger.warning(f"Perplexity service is disabled, skipping enrichment for fields: {target_fields}")
                        continue
                    
                    # Search with Perplexity
                    search_results = await self.perplexity_service._perplexity_search(query)
                    
                    if not search_results:
                        self.logger.warning(f"No search results returned for query targeting fields: {target_fields}")
                        continue
                    
                    # Extract structured data using Vertex AI if available
                    extracted = {}
                    if self.perplexity_service.vertex_model:
                        try:
                            extracted = await self.perplexity_service._process_with_vertex_ai(
                                search_results[0]["content"],
                                target_fields,
                                "memo_enrichment"
                            )
                        except Exception as vertex_error:
                            self.logger.warning(f"Vertex AI extraction failed, trying fallback: {vertex_error}")
                            # Fallback to simple extraction
                            if search_results:
                                extracted = self.perplexity_service._extract_field_data(
                                    search_results[0]["content"],
                                    target_fields
                                )
                    else:
                        # Use fallback extraction if Vertex AI not available
                        if search_results:
                            extracted = self.perplexity_service._extract_field_data(
                                search_results[0]["content"],
                                target_fields
                            )
                    
                    # Map extracted data to fields
                    for field in target_fields:
                        # Try direct match first
                        if field in extracted:
                            value = extracted[field]
                            if value and not self._is_field_empty(value):
                                enriched_data[field] = value
                                enriched_fields_list.append(field)
                                
                                # Store confidence and source
                                conf_key = f"{field}_confidence"
                                src_key = f"{field}_source"
                                if conf_key in extracted:
                                    confidence_scores[field] = extracted[conf_key]
                                if src_key in extracted:
                                    enrichment_sources[field] = extracted[src_key]
                        else:
                            # Try alternative field names
                            alt_map = {
                                "cac": "customer_acquisition_cost",
                                "ltv": "lifetime_value",
                                "sam": "sam_market_size",
                                "som": "som_market_size",
                                "runway": "runway_months"
                            }
                            alt_field = alt_map.get(field, field)
                            if alt_field in extracted:
                                value = extracted[alt_field]
                                if value and not self._is_field_empty(value):
                                    enriched_data[field] = value
                                    enriched_fields_list.append(field)
                    
                except Exception as e:
                    self.logger.error(f"Error enriching with query {query_info['query'][:50]}...: {e}", exc_info=True)
                    # Continue with other queries even if one fails
                    continue
            
            # Fallback to Google Validation Service if Perplexity failed or is disabled
            if not enriched_fields_list and missing_fields:
                self.logger.info("Perplexity enrichment failed or no fields enriched. Falling back to Google Vertex AI enrichment...")
                try:
                    from services.google_validation_service import GoogleValidationService
                    google_service = GoogleValidationService(project=self.project, location=self.location)
                    google_service.set_up()
                    
                    # Build company context for enrichment
                    company_context = company_name
                    if founder_name:
                        company_context += f" (Founder: {founder_name})"
                    if industry:
                        company_context += f" in {industry}"
                    
                    # Use Google Validation Service to enrich missing fields
                    fallback_result = google_service.enrich_missing_fields(memo_1, missing_fields, company_context)
                    
                    if fallback_result.get("status") == "SUCCESS" and fallback_result.get("enriched_data"):
                        fallback_data = fallback_result.get("enriched_data", {})
                        self.logger.info(f"Google Vertex AI enrichment successful. Enriched {len([k for k in fallback_data.keys() if not k.endswith('_confidence') and not k.endswith('_source')])} fields")
                        
                        # Merge fallback enriched data
                        for key, value in fallback_data.items():
                            # Skip confidence and source metadata for now
                            if key.endswith("_confidence") or key.endswith("_source"):
                                continue
                            if value and not self._is_field_empty(value):
                                enriched_data[key] = value
                                enriched_fields_list.append(key)
                                
                                # Store confidence and source if available
                                if f"{key}_confidence" in fallback_data:
                                    confidence_scores[key] = fallback_data[f"{key}_confidence"]
                                if f"{key}_source" in fallback_data:
                                    enrichment_sources[key] = fallback_data[f"{key}_source"]
                                
                                self.logger.info(f"Enriched field '{key}' via Google Vertex AI fallback: {str(value)[:100]}")
                    else:
                        self.logger.warning(f"Google Vertex AI fallback enrichment failed: {fallback_result.get('error', 'Unknown error')}")
                        
                except Exception as fallback_error:
                    self.logger.error(f"Error in Google Vertex AI fallback enrichment: {fallback_error}", exc_info=True)
            
            # Merge enriched data with original memo_1
            # Always overwrite "Not specified" or empty values with enriched data
            enriched_memo_1 = memo_1.copy()
            for key, value in enriched_data.items():
                # Always use enriched value if it's not empty
                if value and not self._is_field_empty(value):
                    enriched_memo_1[key] = value
                    self.logger.info(f"Enriched field '{key}': {str(value)[:100]}")
                elif key in enriched_memo_1 and self._is_field_empty(enriched_memo_1.get(key)):
                    # Even if enriched value seems empty, try to use it if original is "Not specified"
                    enriched_memo_1[key] = value
                    self.logger.info(f"Replaced empty field '{key}' with enriched value")
            
            # Build validated memo document
            validated_data = {
                "memo_1": enriched_memo_1,
                "original_memo_id": memo_id,
                "enrichment_metadata": {
                    "enrichment_timestamp": datetime.now().isoformat(),
                    "fields_enriched": enriched_fields_list,
                    "enrichment_method": "perplexity_vertex_ai" if enriched_fields_list and any("perplexity" in str(source).lower() for source in enrichment_sources.values()) else "google_vertex_ai_fallback",
                    "confidence_scores": confidence_scores,
                    "sources": enrichment_sources,
                    "missing_fields_identified": missing_fields
                },
                "timestamp": datetime.now().isoformat()
            }
            
            # Run validation after enrichment - use enriched_memo_1 (not original memo_1) so we validate the complete data
            validation_results = await self.validate_memo_claims(enriched_memo_1, company_name, founder_name, industry)
            
            # Add validation results to validated_data
            validated_data["validation_results"] = validation_results
            
            # Save to memo1_validated collection
            self._save_validated_memo(memo_id, validated_data)
            
            self.logger.info(f"Enrichment complete for memo {memo_id}. Enriched {len(enriched_fields_list)} fields.")
            
            return {
                "status": "success",
                "memo_id": memo_id,
                "fields_enriched": enriched_fields_list,
                "fields_enriched_count": len(enriched_fields_list),
                "missing_fields_count": len(missing_fields),
                "enrichment_metadata": validated_data["enrichment_metadata"],
                "validation_results": validation_results
            }
            
        except Exception as e:
            self.logger.error(f"Error in enrich_memo: {e}", exc_info=True)
            return {"status": "error", "error": str(e), "memo_id": memo_id}
    
    async def validate_memo_claims(self, memo_data: Dict[str, Any], company_name: str, 
                                   founder_name: str = "", industry: str = "") -> Dict[str, Any]:
        """
        Validate memo claims using Perplexity API for all 10 validation categories.
        Falls back to Google Validation Service if Perplexity fails.
        
        Args:
            memo_data: The memo data to validate
            company_name: Company name
            founder_name: Founder name(s)
            industry: Industry category
            
        Returns:
            Dictionary with structured validation results matching intake agent format
        """
        self.logger.info(f"Starting validation for {company_name}")
        
        validation_results = {
            "company_identity": {},
            "founder_team": {},
            "product_ip": {},
            "market_opportunity": {},
            "competitors": {},
            "financial_traction": {},
            "fundraising_cap_table": {},
            "compliance_sanctions": {},
            "public_sentiment": {},
            "exit_acquisition": {}
        }
        
        try:
            # Generate validation queries for all categories
            validation_queries = self._generate_validation_queries(memo_data, company_name, founder_name, industry)
            
            # Process each validation category using Perplexity
            validation_method_used = "perplexity"
            perplexity_success_count = 0
            perplexity_total_count = len(validation_queries)
            perplexity_completely_failed = False
            
            # Check if Perplexity service is enabled
            if not self.perplexity_service.enabled:
                self.logger.warning("Perplexity service is disabled, will use Google fallback for all categories")
                perplexity_completely_failed = True
            else:
                # Try Perplexity for each category
                for category, query_info in validation_queries.items():
                    try:
                        query = query_info["query"]
                        self.logger.info(f"Validating {category} using Perplexity API...")
                        
                        # Search with Perplexity
                        search_results = await self.perplexity_service._perplexity_search(query)
                        
                        if not search_results:
                            self.logger.warning(f"No Perplexity results for {category}, will use fallback for this category")
                            # Don't mark as completely failed - continue with other categories
                            continue
                        
                        # Process validation response
                        category_result = await self._process_validation_response(
                            search_results[0]["content"],
                            category,
                            query_info.get("expected_fields", []),
                            search_results[0].get("citations", [])
                        )
                        
                        if category_result and category_result.get("status") != "MISSING":
                            validation_results[category] = category_result
                            perplexity_success_count += 1
                            self.logger.info(f"Successfully validated {category} using Perplexity")
                        else:
                            self.logger.warning(f"Perplexity validation returned empty for {category}")
                            
                    except Exception as e:
                        self.logger.warning(f"Perplexity validation failed for {category}: {e}")
                        # Continue with other categories - don't fail completely
                        continue
                
                # Check if we got reasonable results from Perplexity
                if perplexity_success_count == 0 and perplexity_total_count > 0:
                    perplexity_completely_failed = True
                    self.logger.warning(f"Perplexity failed for all {perplexity_total_count} categories, will use full fallback")
                else:
                    self.logger.info(f"Perplexity succeeded for {perplexity_success_count}/{perplexity_total_count} categories")
            
            # Fallback to Google Validation Service if Perplexity completely failed or is disabled
            if perplexity_completely_failed or not self.perplexity_service.enabled:
                self.logger.info("Falling back to Google Validation Service...")
                validation_method_used = "google_fallback"
                
                try:
                    from services.google_validation_service import GoogleValidationService
                    google_service = GoogleValidationService(project=self.project, location=self.location)
                    google_service.set_up()
                    
                    # Run comprehensive validation
                    comprehensive_result = google_service.validate_memo_data(memo_data)
                    
                    if comprehensive_result.get("status") == "SUCCESS":
                        # Map Google validation results to our structure
                        validation_result = comprehensive_result.get("validation_result", {})
                        
                        # Map to our categories
                        if "data_validation" in validation_result:
                            validation_results["company_identity"] = {
                                "status": "CONFIRMED" if validation_result["data_validation"].get("accuracy_score", 0) >= 7 else "QUESTIONABLE",
                                "confidence": validation_result["data_validation"].get("accuracy_score", 0) / 10.0,
                                "findings": validation_result["data_validation"],
                                "sources": ["Google Vertex AI"],
                                "validation_method": "google_vertex_ai"
                            }
                        
                        if "market_validation" in validation_result:
                            validation_results["market_opportunity"] = {
                                "status": "CONFIRMED" if validation_result["market_validation"].get("market_size_accuracy", 0) >= 7 else "QUESTIONABLE",
                                "confidence": validation_result["market_validation"].get("market_size_accuracy", 0) / 10.0,
                                "findings": validation_result["market_validation"],
                                "sources": ["Google Vertex AI"],
                                "validation_method": "google_vertex_ai"
                            }
                        
                        if "team_validation" in validation_result:
                            validation_results["founder_team"] = {
                                "status": "CONFIRMED" if validation_result["team_validation"].get("team_strength", 0) >= 7 else "QUESTIONABLE",
                                "confidence": validation_result["team_validation"].get("team_strength", 0) / 10.0,
                                "findings": validation_result["team_validation"],
                                "sources": ["Google Vertex AI"],
                                "validation_method": "google_vertex_ai"
                            }
                        
                        if "financial_validation" in validation_result:
                            validation_results["financial_traction"] = {
                                "status": "CONFIRMED" if validation_result["financial_validation"].get("financial_viability", 0) >= 7 else "QUESTIONABLE",
                                "confidence": validation_result["financial_validation"].get("financial_viability", 0) / 10.0,
                                "findings": validation_result["financial_validation"],
                                "sources": ["Google Vertex AI"],
                                "validation_method": "google_vertex_ai"
                            }
                        
                        # Use competitor validation if available
                        competitors_list = memo_data.get("competition", memo_data.get("competitors", []))
                        if isinstance(competitors_list, str):
                            competitors_list = [competitors_list] if competitors_list else []
                        elif not isinstance(competitors_list, list):
                            competitors_list = []
                        
                        competitor_result = google_service.validate_competitors(competitors_list, industry)
                        if competitor_result.get("status") == "SUCCESS":
                            competitor_validation = competitor_result.get("validation_result", {})
                            if "competitor_matrix" in competitor_validation:
                                validation_results["competitors"] = {
                                    "status": "CONFIRMED" if competitor_validation.get("analysis_confidence", 0) >= 7 else "QUESTIONABLE",
                                    "confidence": competitor_validation.get("analysis_confidence", 0) / 10.0,
                                    "findings": competitor_validation.get("competitor_matrix", {}),
                                    "sources": ["Google Vertex AI"],
                                    "validation_method": "google_vertex_ai"
                                }
                    
                except Exception as fallback_error:
                    self.logger.error(f"Google Validation Service fallback failed: {fallback_error}", exc_info=True)
            
            # Calculate overall validation score
            scores = []
            validated_categories = []
            for category, result in validation_results.items():
                if result and isinstance(result, dict) and "confidence" in result:
                    confidence = result.get("confidence", 0.0)
                    scores.append(confidence)
                    validated_categories.append(category)
            
            overall_score = sum(scores) / len(scores) if scores else 0.0
            
            return {
                "validation_results": validation_results,
                "overall_validation_score": overall_score,
                "validation_timestamp": datetime.now().isoformat(),
                "validation_method": validation_method_used,
                "categories_validated": len(validated_categories),
                "validated_categories": validated_categories,
                "perplexity_success_rate": f"{perplexity_success_count}/{perplexity_total_count}" if not perplexity_completely_failed else "0/0"
            }
            
        except Exception as e:
            self.logger.error(f"Error in validate_memo_claims: {e}", exc_info=True)
            import traceback
            self.logger.error(f"Traceback: {traceback.format_exc()}")
            return {
                "validation_results": validation_results,
                "overall_validation_score": 0.0,
                "validation_timestamp": datetime.now().isoformat(),
                "validation_method": "error",
                "error": str(e),
                "categories_validated": 0
            }
    
    def _generate_validation_queries(self, memo_data: Dict[str, Any], company_name: str,
                                    founder_name: str = "", industry: str = "") -> Dict[str, Dict[str, Any]]:
        """
        Generate Perplexity queries for each of the 10 validation categories.
        
        Returns:
            Dictionary mapping category names to query information
        """
        queries = {}
        
        context = company_name
        if founder_name:
            context += f" (Founder: {founder_name})"
        if industry:
            context += f" in {industry}"
        
        # 1. Company Identity Validation (MCA, ZaubaCorp, Tofler)
        queries["company_identity"] = {
            "query": f"""Search the internet using real-time web search to validate company registration and legal existence for {context}.

IMPORTANT: You must search the web and fetch real-time data from official sources. Do not rely on knowledge cutoff - use live web search results.

REQUIRED VALIDATION:
1. Company registration status - Search official registries to verify if company exists
2. CIN number (Corporate Identification Number) - Find CIN from official databases if applicable
3. Incorporation date and legal status - Search for incorporation records
4. Registered address and compliance status - Find registered office address from official sources
5. Directors information - Search for director names if available in public records

DATA SOURCES TO SEARCH:
- MCA (Ministry of Corporate Affairs) website: www.mca.gov.in - Search company name directly
- ZaubaCorp database - Search company name on zaubacorp.com
- Tofler company database - Search on tofler.in
- StartupIndia portal - Search for startup registration
- Company official website - Check "About Us" and contact pages
- SEC EDGAR database (for US companies) - Search sec.gov/edgar/searchedgar

SEARCH STRATEGY:
1. Search: "{company_name} company registration MCA"
2. Search: "{company_name} CIN number India"
3. Search: "{company_name} incorporation date"
4. Search: "{company_name} registered address"
5. Search: "{company_name} directors list"

Return ONLY valid JSON (no markdown, no code blocks):
{{
    "company_exists": true/false,
    "cin_number": "CIN if found in search results",
    "incorporation_date": "YYYY-MM-DD from search",
    "registered_address": "address from official sources",
    "compliance_status": "COMPLIANT/NON_COMPLIANT/UNKNOWN",
    "confidence": 0.0-1.0,
    "sources": ["exact URL sources from search"]
}}""",
            "expected_fields": ["company_exists", "cin_number", "incorporation_date", "registered_address", "compliance_status"]
        }
        
        # 2. Founder & Team Validation (LinkedIn, Crunchbase, news)
        if founder_name:
            queries["founder_team"] = {
                "query": f"""Search the internet using real-time web search to validate founder and team credentials for {founder_name} from {company_name}.

IMPORTANT: You must search the web and fetch real-time data. Use live LinkedIn profiles, recent news articles, and current Crunchbase data.

REQUIRED VALIDATION:
1. LinkedIn profile verification - Search and find LinkedIn profile URL for {founder_name}
2. Employment history verification - Search for and verify claimed previous roles and companies
3. Education verification - Search for and verify claimed degrees and universities
4. Prior startups/exits - Search for information about previous startups or exits
5. Domain relevance - Search for information matching founder expertise with business problem
6. Social credibility - Search for press mentions, conference appearances, awards

SEARCH QUERIES TO EXECUTE:
1. Search: "{founder_name} LinkedIn profile {company_name}"
2. Search: "{founder_name} education degree university"
3. Search: "{founder_name} previous companies work history"
4. Search: "{founder_name} startup founder CEO"
5. Search: "{founder_name} {company_name} news TechCrunch"
6. Search: "{founder_name} Crunchbase profile"

DATA SOURCES TO ACCESS:
- LinkedIn: Search linkedin.com/in/ profiles
- Crunchbase: Search crunchbase.com/person/ profiles
- Google News: Search for recent articles mentioning founder
- TechCrunch, YourStory, Inc42: Search startup news articles
- Conference websites: Search speaker bios and conference lists
- Press releases: Search for company announcements mentioning founder

Return ONLY valid JSON (no markdown, no code blocks):
{{
    "linkedin_url": "https://linkedin.com/in/... (from search)",
    "linkedin_verified": true/false,
    "employment_verified": true/false,
    "education_verified": true/false,
    "prior_startups": ["startup1 from search", "startup2 from search"],
    "domain_relevance_score": 0.0-1.0,
    "press_mentions_count": number,
    "confidence": 0.0-1.0,
    "sources": ["exact URLs from search results"]
}}""",
                "expected_fields": ["linkedin_url", "linkedin_verified", "employment_verified", "education_verified"]
            }
        
        # 3. Product & IP Validation (Patents, app stores)
        queries["product_ip"] = {
            "query": f"""Search the internet using real-time web search to validate product claims and intellectual property for {context}.

IMPORTANT: Use live web search to check current patent databases, app stores, and product listings. Fetch real-time data.

REQUIRED VALIDATION:
1. Trademark/Patent filings - Search patent databases to verify "patent pending" or IP claims
2. Product presence - Search app stores and web to check if product exists
3. User feedback consistency - Search and analyze reviews and ratings from app stores
4. Technology claims - Search for information verifying technical claims

SEARCH QUERIES TO EXECUTE:
1. Search: "{company_name} patent USPTO Google Patents"
2. Search: "{company_name} app Play Store App Store"
3. Search: "{company_name} product reviews ratings"
4. Search: "{company_name} trademark registered IP"
5. Search: "{company_name} ProductHunt"

DATA SOURCES TO ACCESS:
- Google Patents: patents.google.com - Search for patents by company name
- USPTO: uspto.gov - Search patent database
- IP India Portal: ipindia.gov.in - Search Indian patents and trademarks
- Google Play Store: play.google.com - Search for app listings
- Apple App Store: apps.apple.com - Search for iOS app
- ProductHunt: producthunt.com - Search for product listings
- Company website: Search product pages

Return ONLY valid JSON (no markdown, no code blocks):
{{
    "patents_filed": number,
    "patents_granted": number,
    "trademarks_registered": number,
    "product_listings_found": true/false,
    "average_rating": 0.0-5.0,
    "review_count": number,
    "ip_claims_verified": true/false,
    "confidence": 0.0-1.0,
    "sources": ["exact URLs from search"]
}}""",
            "expected_fields": ["patents_filed", "product_listings_found", "ip_claims_verified"]
        }
        
        # 4. Market Opportunity Validation (TAM/SAM/SOM)
        claimed_tam = memo_data.get("market_size", memo_data.get("sam_market_size", ""))
        queries["market_opportunity"] = {
            "query": f"""Search the internet using real-time web search to validate market size claims (TAM/SAM/SOM) for {context}.

CLAIMED MARKET SIZE: {claimed_tam}

IMPORTANT: Search for latest market research reports from 2024-2025. Use real-time web search to find current market data.

REQUIRED VALIDATION:
1. TAM/SAM/SOM numbers - Search market research reports and cross-reference claimed numbers
2. Market size methodology - Search for methodology details in reports
3. Market growth rate (CAGR) - Search for industry CAGR data
4. Market definition - Search for market definitions in research reports

SEARCH QUERIES TO EXECUTE:
1. Search: "{industry} market size TAM SAM 2024 2025 Statista"
2. Search: "{industry} market research report Tracxn CB Insights"
3. Search: "{industry} CAGR growth rate market analysis"
4. Search: "{industry} PwC Deloitte market report"
5. Search: "{industry} Grand View Research MarketsandMarkets"

DATA SOURCES TO ACCESS:
- Statista: statista.com - Search for market size statistics
- Tracxn: tracxn.com - Search for market reports
- CB Insights: cbinsights.com - Search market analyses
- PwC/Deloitte/EY: Search their websites for industry reports
- Grand View Research: grandviewresearch.com - Search market reports
- MarketsandMarkets: marketsandmarkets.com - Search market research

Return ONLY valid JSON (no markdown, no code blocks):
{{
    "claimed_tam": "{claimed_tam}",
    "verified_tam_range": "range from search results",
    "tam_accuracy_score": 0.0-1.0,
    "market_growth_rate_cagr": "percentage from reports",
    "methodology_assessment": "VALID/QUESTIONABLE/INVALID",
    "confidence": 0.0-1.0,
    "sources": ["exact URLs from reports found"]
}}""",
            "expected_fields": ["claimed_tam", "verified_tam_range", "tam_accuracy_score"]
        }
        
        # 5. Competitor Validation
        competitors = memo_data.get("competition", memo_data.get("competitors", []))
        if isinstance(competitors, str):
            competitors = [competitors]
        elif not isinstance(competitors, list):
            competitors = []
        
        # Handle competitors list - can contain strings or dicts
        competitor_names = []
        for comp in competitors:
            if isinstance(comp, str):
                competitor_names.append(comp)
            elif isinstance(comp, dict):
                # Extract name from dict (common keys: name, title, competitor_name, company_name)
                comp_name = comp.get("name") or comp.get("title") or comp.get("competitor_name") or comp.get("company_name") or str(comp.get("value", ""))
                if comp_name:
                    competitor_names.append(str(comp_name))
        
        competitors_str = ', '.join(competitor_names) if competitor_names else 'Not specified'
        
        queries["competitors"] = {
            "query": f"""Search the internet using real-time web search to validate competitor information for {context}.

CLAIMED COMPETITORS: {competitors_str}

IMPORTANT: Use live web search to verify each competitor exists, find their funding, and assess market position. Fetch current data.

REQUIRED VALIDATION:
1. Competitor existence - Search for each competitor to verify they exist
2. Competitor funding - Search for recent funding rounds and amounts
3. Competitor scale - Search for company size, revenue, market position
4. Competitive positioning - Search for market share and positioning information

SEARCH QUERIES TO EXECUTE:
1. For each competitor, search: "[competitor name] Crunchbase"
2. Search: "{industry} competitors startups funding"
3. Search: "{industry} market share competitive landscape"
4. Search: "{competitors_str} funding rounds 2024"

DATA SOURCES TO ACCESS:
- Crunchbase: crunchbase.com - Search competitor profiles
- Tracxn: tracxn.com - Search competitor data
- CB Insights: cbinsights.com - Search competitive intelligence
- TechCrunch: techcrunch.com - Search competitor news
- VCCircle, Entrackr: Search competitor coverage

Return ONLY valid JSON (no markdown, no code blocks):
{{
    "competitors_verified": number,
    "competitors_total": {len(competitor_names) if competitor_names else 0},
    "funding_verified": true/false,
    "market_positioning_verified": true/false,
    "missing_key_competitors": ["competitor1", "competitor2"],
    "confidence": 0.0-1.0,
    "sources": ["exact URLs from search"]
}}""",
            "expected_fields": ["competitors_verified", "competitors_total", "funding_verified"]
        }
        
        # 6. Financial & Traction Validation
        claimed_revenue = memo_data.get("current_revenue", "")
        queries["financial_traction"] = {
            "query": f"""Search the internet using real-time web search to validate financial and traction claims for {context}.

CLAIMED REVENUE: {claimed_revenue}

IMPORTANT: Use live web search to find current revenue data, web traffic, app downloads, and public disclosures. Fetch real-time metrics.

REQUIRED VALIDATION:
1. Revenue claims (ARR/MRR/GMV) - Search for public evidence of revenue claims
2. Customer base - Search for customer count, downloads, web traffic data
3. Growth rate consistency - Search for multiple sources to verify growth claims
4. Unit economics - Search for CAC/LTV information if publicly disclosed

SEARCH QUERIES TO EXECUTE:
1. Search: "{company_name} revenue ARR MRR funding announcement"
2. Search: "{company_name} SimilarWeb web traffic visitors"
3. Search: "{company_name} app downloads App Annie SensorTower"
4. Search: "{company_name} customers users growth"
5. Search: "{company_name} MCA filing revenue Form 8"

DATA SOURCES TO ACCESS:
- SimilarWeb: similarweb.com - Search for web traffic data
- App Annie / SensorTower: Search for app download data
- Google Play Store / App Store: Search for app ratings and reviews
- MCA filings: Search MCA website for public filings
- Press releases: Search for revenue announcements
- Crunchbase: Search for revenue data in funding rounds

Return ONLY valid JSON (no markdown, no code blocks):
{{
    "revenue_claim": "{claimed_revenue}",
    "revenue_verified": true/false,
    "customer_count_verified": true/false,
    "web_traffic_verified": true/false,
    "growth_rate_consistency": "CONSISTENT/QUESTIONABLE/INCONSISTENT",
    "confidence": 0.0-1.0,
    "sources": ["exact URLs from search"]
}}""",
            "expected_fields": ["revenue_verified", "customer_count_verified", "growth_rate_consistency"]
        }
        
        # 7. Fundraising & Cap Table Validation
        claimed_investors = memo_data.get("lead_investor", memo_data.get("funding_history", ""))
        if isinstance(claimed_investors, str):
            investors_str = claimed_investors
        elif isinstance(claimed_investors, list):
            # Handle list - can contain strings or dicts
            investor_names = []
            for inv in claimed_investors:
                if isinstance(inv, str):
                    investor_names.append(inv)
                elif isinstance(inv, dict):
                    # Extract name from dict
                    inv_name = inv.get("name") or inv.get("title") or inv.get("investor_name") or inv.get("company_name") or str(inv.get("value", ""))
                    if inv_name:
                        investor_names.append(str(inv_name))
            investors_str = ', '.join(investor_names) if investor_names else 'Not specified'
        else:
            investors_str = 'Not specified'
        
        queries["fundraising_cap_table"] = {
            "query": f"""Search the internet using real-time web search to validate fundraising and investor claims for {context}.

CLAIMED INVESTORS: {investors_str}

IMPORTANT: Use live web search to find recent funding announcements, verify investors, and check round details. Fetch current data.

REQUIRED VALIDATION:
1. Investor verification - Search for funding announcements confirming investor participation
2. Round size verification - Search for exact round amounts in announcements
3. Valuation claims - Search for valuation information in funding rounds
4. Cap table consistency - Search for funding history to verify round sequencing

SEARCH QUERIES TO EXECUTE:
1. Search: "{company_name} funding round {investors_str} Crunchbase"
2. Search: "{company_name} raised funding amount valuation"
3. Search: "{company_name} investor {investors_str} portfolio"
4. Search: "{company_name} MCA filing PAS-3 funding"
5. Search: "{company_name} TechCrunch funding announcement"

DATA SOURCES TO ACCESS:
- Crunchbase: crunchbase.com - Search funding rounds
- Tracxn: tracxn.com - Search funding data
- MCA: Search MCA website for Form PAS-3 / SH-7 filings
- VCCircle, Inc42: Search funding announcements
- TechCrunch: Search funding news
- Investor websites: Search investor portfolio pages

Return ONLY valid JSON (no markdown, no code blocks):
{{
    "investors_verified": true/false,
    "round_size_verified": true/false,
    "valuation_reasonable": true/false,
    "cap_table_consistent": true/false,
    "funding_announcements_found": number,
    "confidence": 0.0-1.0,
    "sources": ["exact URLs from search"]
}}""",
            "expected_fields": ["investors_verified", "round_size_verified", "valuation_reasonable"]
        }
        
        # 8. Compliance & Sanctions Screening
        queries["compliance_sanctions"] = {
            "query": f"""Search the internet using real-time web search to screen for compliance issues and sanctions for {context}.

IMPORTANT: Search official databases and regulatory websites for current compliance and sanctions information. Use live web search.

REQUIRED VALIDATION:
1. KYC status - Search for founder and director KYC status information
2. SEBI blacklist - Search SEBI website for disqualified directors
3. Sanction checks - Search OFAC, EU sanctions lists online
4. Regulatory compliance - Search for industry-specific compliance requirements

SEARCH QUERIES TO EXECUTE:
1. Search: "{company_name} directors MCA disqualified list"
2. Search: "{founder_name} SEBI blacklist disqualified"
3. Search: "{company_name} OFAC sanctions list"
4. Search: "{company_name} {industry} regulatory compliance"
5. Search: "{company_name} RBI watchlist KYC"

DATA SOURCES TO ACCESS:
- MCA: mca.gov.in - Search disqualified directors database
- SEBI: sebi.gov.in - Search blacklist and disqualified directors
- RBI: rbi.org.in - Search watchlists
- OFAC: ofac.treasury.gov - Search sanctions list
- OpenSanctions: opensanctions.org - Search sanctions database
- Industry regulatory websites: Search specific industry compliance requirements

Return ONLY valid JSON (no markdown, no code blocks):
{{
    "kyc_status": "CLEAR/ISSUES/UNKNOWN",
    "sanctions_check": "CLEAR/FLAGGED/UNKNOWN",
    "sebi_blacklist_check": "CLEAR/FLAGGED/UNKNOWN",
    "compliance_issues": [],
    "risk_level": "LOW/MEDIUM/HIGH",
    "confidence": 0.0-1.0,
    "sources": ["exact URLs from search"]
}}""",
            "expected_fields": ["kyc_status", "sanctions_check", "risk_level"]
        }
        
        # 9. Public Sentiment & Brand Validation
        queries["public_sentiment"] = {
            "query": f"""Search the internet using real-time web search to analyze public sentiment and brand perception for {context}.

IMPORTANT: Search current reviews, social media, and news articles to assess real-time brand sentiment. Use live web search.

REQUIRED VALIDATION:
1. Public reviews sentiment - Search and analyze customer reviews vs claims
2. Social media engagement - Search social media platforms for engagement trends
3. Press mentions sentiment - Search news articles and analyze media coverage tone
4. Brand perception - Calculate overall brand sentiment score from multiple sources

SEARCH QUERIES TO EXECUTE:
1. Search: "{company_name} reviews Google Play Store App Store"
2. Search: "{company_name} Twitter Instagram social media"
3. Search: "{company_name} news articles sentiment"
4. Search: "{company_name} customer feedback complaints"
5. Search: "{company_name} Reddit discussions reviews"

DATA SOURCES TO ACCESS:
- Google Play Store / App Store: Search for app ratings and reviews
- Google Reviews: Search Google for business reviews
- Twitter/X: Search for brand mentions and sentiment
- Instagram, LinkedIn: Search for social media presence
- Google News: Search for recent news articles
- Reddit: Search for discussions about the company

Return ONLY valid JSON (no markdown, no code blocks):
{{
    "average_rating": 0.0-5.0,
    "review_sentiment": "POSITIVE/NEUTRAL/NEGATIVE",
    "social_engagement_score": 0.0-1.0,
    "press_sentiment": "POSITIVE/NEUTRAL/NEGATIVE",
    "overall_brand_score": 0.0-1.0,
    "confidence": 0.0-1.0,
    "sources": ["exact URLs from search"]
}}""",
            "expected_fields": ["average_rating", "review_sentiment", "overall_brand_score"]
        }
        
        # 10. Exit / Acquisition Validation
        exit_strategy = memo_data.get("exit_strategy", memo_data.get("potential_acquirers", ""))
        if isinstance(exit_strategy, str):
            exit_strategy_str = exit_strategy
        elif isinstance(exit_strategy, list):
            # Handle list - can contain strings or dicts
            exit_names = []
            for item in exit_strategy:
                if isinstance(item, str):
                    exit_names.append(item)
                elif isinstance(item, dict):
                    # Extract name from dict
                    exit_name = item.get("name") or item.get("title") or item.get("acquirer_name") or item.get("company_name") or str(item.get("value", ""))
                    if exit_name:
                        exit_names.append(str(exit_name))
            exit_strategy_str = ', '.join(exit_names) if exit_names else 'Not specified'
        else:
            exit_strategy_str = 'Not specified'
        
        queries["exit_acquisition"] = {
            "query": f"""Search the internet using real-time web search to validate exit strategy and acquisition claims for {context}.

CLAIMED EXIT STRATEGY: {exit_strategy_str}

IMPORTANT: Use live web search to find comparable exits, verify acquirer information, and assess exit multiples. Fetch current exit data.

REQUIRED VALIDATION:
1. Potential acquirers - Search to verify claimed acquirers exist and assess acquisition likelihood
2. Exit multiples - Search for comparable exit multiples in the industry
3. Comparable exits - Search for similar company exits for benchmarking

SEARCH QUERIES TO EXECUTE:
1. Search: "{industry} startup exits acquisitions 2024 2025"
2. Search: "{exit_strategy_str} acquisitions startup exits"
3. Search: "{industry} exit multiples valuation acquisitions"
4. Search: "{industry} comparable exits Crunchbase CB Insights"
5. Search: "{industry} M&A deals startup acquisitions"

DATA SOURCES TO ACCESS:
- Crunchbase: crunchbase.com - Search exit database
- CB Insights: cbinsights.com - Search exit reports
- Pitchbook: pitchbook.com - Search exit data
- TechCrunch: Search acquisition announcements
- Press releases: Search for exit announcements

Return ONLY valid JSON (no markdown, no code blocks):
{{
    "exit_strategy_realistic": true/false,
    "potential_acquirers_verified": number,
    "exit_multiples_reasonable": true/false,
    "comparable_exits_found": number,
    "exit_probability_score": 0.0-1.0,
    "confidence": 0.0-1.0,
    "sources": ["exact URLs from search"]
}}""",
            "expected_fields": ["exit_strategy_realistic", "potential_acquirers_verified", "exit_multiples_reasonable"]
        }
        
        return queries
    
    async def _process_validation_response(self, content: str, category: str, 
                                          expected_fields: List[str], citations: List[str] = None) -> Dict[str, Any]:
        """
        Process Perplexity validation response and structure it according to intake agent format.
        
        Args:
            content: Raw validation response content
            category: Validation category name
            expected_fields: Fields expected in the response
            citations: List of source citations
            
        Returns:
            Structured validation result
        """
        try:
            # Try to extract JSON from response
            parsed_data = None
            
            # Try direct JSON parsing
            try:
                parsed_data = json.loads(content)
            except json.JSONDecodeError:
                # Try extracting JSON from markdown
                import re
                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                if json_match:
                    try:
                        parsed_data = json.loads(json_match.group())
                    except json.JSONDecodeError:
                        pass
            
            # If JSON parsing failed, use Vertex AI to structure the response
            if not parsed_data and self.perplexity_service.vertex_model:
                try:
                    structure_prompt = f"""Extract validation results from the following text and return ONLY valid JSON.

Category: {category}
Expected fields: {', '.join(expected_fields)}

Text:
{content[:4000]}

Return JSON with these fields:
{{
    "status": "CONFIRMED/QUESTIONABLE/MISSING",
    "confidence": 0.0-1.0,
    "findings": {{...}},
    "sources": [...]
}}

Base status on confidence: >= 0.7 = CONFIRMED, 0.4-0.69 = QUESTIONABLE, < 0.4 = MISSING"""
                    
                    response = self.perplexity_service.vertex_model.generate_content(structure_prompt)
                    response_text = response.text if hasattr(response, 'text') else str(response)
                    
                    # Extract JSON from response
                    json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                    if json_match:
                        parsed_data = json.loads(json_match.group())
                except Exception as e:
                    self.logger.warning(f"Vertex AI structuring failed for {category}: {e}")
            
            # Build structured result
            if parsed_data:
                confidence = parsed_data.get("confidence", 0.5)
                if isinstance(confidence, str):
                    try:
                        confidence = float(confidence)
                    except ValueError:
                        confidence = 0.5
                
                # Determine status based on confidence
                if confidence >= 0.7:
                    status = "CONFIRMED"
                elif confidence >= 0.4:
                    status = "QUESTIONABLE"
                else:
                    status = "MISSING"
                
                return {
                    "status": status,
                    "confidence": float(confidence),
                    "findings": parsed_data.get("findings", parsed_data),
                    "sources": citations if citations else parsed_data.get("sources", ["Perplexity API"]),
                    "validation_method": "perplexity"
                }
            else:
                # Fallback: basic parsing
                confidence = 0.5
                if "verified" in content.lower() or "confirmed" in content.lower():
                    confidence = 0.7
                elif "questionable" in content.lower() or "unclear" in content.lower():
                    confidence = 0.5
                
                status = "CONFIRMED" if confidence >= 0.7 else "QUESTIONABLE" if confidence >= 0.4 else "MISSING"
                
                return {
                    "status": status,
                    "confidence": confidence,
                    "findings": {"raw_response": content[:500]},
                    "sources": citations if citations else ["Perplexity API"],
                    "validation_method": "perplexity"
                }
                
        except Exception as e:
            self.logger.error(f"Error processing validation response for {category}: {e}", exc_info=True)
            return {
                "status": "MISSING",
                "confidence": 0.0,
                "findings": {"error": str(e)},
                "sources": [],
                "validation_method": "perplexity"
            }
    
    def _save_validated_memo(self, memo_id: str, validated_data: Dict[str, Any]):
        """Save validated/enriched memo to memo1_validated collection."""
        try:
            if not self.db:
                self.logger.error("Firestore client not initialized. Call set_up() first.")
                raise RuntimeError("Firestore client not initialized")
            
            doc_ref = self.db.collection("memo1_validated").document(memo_id)
            doc_ref.set(validated_data, merge=True)
            self.logger.info(f"Saved validated memo to memo1_validated/{memo_id}")
        except Exception as e:
            self.logger.error(f"Error saving validated memo: {e}", exc_info=True)
            raise

