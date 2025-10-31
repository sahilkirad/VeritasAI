"""
Memo Enrichment Agent
Identifies missing fields in memos, enriches them from public sources via Perplexity API,
and saves to memo1_validated collection.
"""

import logging
import asyncio
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
                    "enrichment_method": "perplexity_vertex_ai",
                    "confidence_scores": confidence_scores,
                    "sources": enrichment_sources,
                    "missing_fields_identified": missing_fields
                },
                "timestamp": datetime.now().isoformat()
            }
            
            # Save to memo1_validated collection
            self._save_validated_memo(memo_id, validated_data)
            
            self.logger.info(f"Enrichment complete for memo {memo_id}. Enriched {len(enriched_fields_list)} fields.")
            
            return {
                "status": "success",
                "memo_id": memo_id,
                "fields_enriched": enriched_fields_list,
                "fields_enriched_count": len(enriched_fields_list),
                "missing_fields_count": len(missing_fields),
                "enrichment_metadata": validated_data["enrichment_metadata"]
            }
            
        except Exception as e:
            self.logger.error(f"Error in enrich_memo: {e}", exc_info=True)
            return {"status": "error", "error": str(e), "memo_id": memo_id}
    
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

