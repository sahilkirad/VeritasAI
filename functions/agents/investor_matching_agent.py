"""
Investor Matching Agent
Matches founders from ingestionResults with investors from list_of_investors.md
using weighted scoring with Gemini embeddings for semantic matching.
READ-ONLY operations on Firestore - does not modify memo data.
"""

import logging
import json
import re
import os
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# Google Cloud imports
try:
    import vertexai
    from vertexai.generative_models import GenerativeModel
    from google.cloud import firestore
    GOOGLE_AVAILABLE = True
except ImportError:
    GOOGLE_AVAILABLE = False

# Suppress noisy Google Cloud logging
logging.getLogger('google.api_core').setLevel(logging.WARNING)
logging.getLogger('google.auth').setLevel(logging.WARNING)

logger = logging.getLogger(__name__)


class InvestorMatchingAgent:
    """
    Agent for matching founders with investors using multi-factor scoring.
    Reads founder data from ingestionResults (READ-ONLY) and investor data from list_of_investors.md.
    """
    
    def __init__(self, project: str = "veritas-472301", location: str = "asia-south1"):
        """
        Initialize the Investor Matching Agent.
        
        Args:
            project: Google Cloud project ID
            location: Vertex AI location
        """
        self.project = project
        self.location = location
        self.logger = logging.getLogger(self.__class__.__name__)
        
        # Initialize clients to None - will be set up in set_up()
        self.gemini_model = None
        self.db = None
        
        # Matching weights as specified in the plan
        self.weights = {
            'sector_alignment': 0.30,      # 30%
            'stage_alignment': 0.20,       # 20%
            'ticket_fit': 0.15,            # 15%
            'geography': 0.10,             # 10%
            'founder_background': 0.10,    # 10%
            'traction': 0.10,              # 10%
            'network': 0.05                # 5%
        }
        
        # Cache for investors and embeddings
        self._investors_cache = None
        self._sector_embeddings_cache = {}
        
        self.logger.info("InvestorMatchingAgent initialized")
    
    def set_up(self):
        """Initialize all necessary Google Cloud clients and models."""
        self.logger.info(f"Setting up InvestorMatchingAgent for project '{self.project}'...")
        
        if not GOOGLE_AVAILABLE:
            self.logger.error("Google Cloud libraries are not installed.")
            raise ImportError("Required Google Cloud libraries are missing.")
        
        try:
            # Initialize Vertex AI
            vertexai.init(project=self.project, location=self.location)
            self.logger.info(f"Vertex AI initialized in project '{self.project}' and location '{self.location}'.")
            
            # Initialize Gemini Model for embeddings and rationale generation
            self.gemini_model = GenerativeModel("gemini-2.5-flash")
            self.logger.info("GenerativeModel ('gemini-2.5-flash') initialized.")
            
            # Initialize Firestore client (READ-ONLY operations only)
            self.db = firestore.Client(project=self.project)
            self.logger.info("Firestore client initialized (read-only mode).")
            
            self.logger.info("✅ InvestorMatchingAgent setup complete.")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize InvestorMatchingAgent: {e}", exc_info=True)
            raise
    
    def get_investors_from_firestore(self, collection_name: str = "investors") -> List[Dict[str, Any]]:
        """
        Fetch investor data from Firestore collection.
        
        Args:
            collection_name: Name of the Firestore collection (default: "investors")
            
        Returns:
            List of investor dictionaries
        """
        if self._investors_cache is not None:
            return self._investors_cache
        
        investors = []
        
        try:
            collection_ref = self.db.collection(collection_name)
            docs = collection_ref.stream()
            
            for doc in docs:
                investor_data = doc.to_dict()
                # Remove Firestore timestamps (they're not JSON serializable)
                if 'uploaded_at' in investor_data:
                    del investor_data['uploaded_at']
                if 'last_updated' in investor_data:
                    del investor_data['last_updated']
                
                investors.append(investor_data)
                self.logger.info(f"Loaded investor: {investor_data.get('name', 'Unknown')} (ID: {investor_data.get('id', 'N/A')})")
            
            self.logger.info(f"Successfully loaded {len(investors)} investors from Firestore collection '{collection_name}'")
            self._investors_cache = investors
            return investors
            
        except Exception as e:
            self.logger.error(f"Error fetching investors from Firestore: {e}")
            import traceback
            self.logger.error(traceback.format_exc())
            return []
    
    def parse_investors_from_markdown(self, file_path: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        DEPRECATED: Use get_investors_from_firestore() instead.
        This method is kept for backward compatibility but should not be used.
        
        Parse investor data from list_of_investors.md file.
        """
        self.logger.warning("parse_investors_from_markdown() is deprecated. Use get_investors_from_firestore() instead.")
        # Try Firestore first
        investors = self.get_investors_from_firestore()
        if investors:
            return investors
        
        # Fallback to markdown parsing (if needed)
        self.logger.warning("No investors found in Firestore, falling back to markdown parsing...")
        return []
    
    def extract_founder_data(self, memo_id: Optional[str] = None, founder_email: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Extract founder/startup data from ingestionResults collection (READ-ONLY).
        
        Args:
            memo_id: Document ID in ingestionResults
            founder_email: Founder email to look up
            
        Returns:
            Dictionary with founder/startup features, or None if not found
        """
        if not self.db:
            self.logger.error("Firestore client not initialized")
            return None
        
        try:
            # Strategy 1: Direct lookup by memo_id
            if memo_id:
                doc_ref = self.db.collection("ingestionResults").document(memo_id)
                doc = doc_ref.get()
                if doc.exists:
                    data = doc.to_dict()
                    memo_1 = data.get("memo_1", {})
                    if memo_1:
                        return self._extract_features_from_memo1(memo_1)
            
            # Strategy 2: Lookup by founder_email
            if founder_email:
                query = self.db.collection("ingestionResults")
                # Note: founder_email might be in memo_1.founder_email
                docs = query.stream()
                for doc in docs:
                    data = doc.to_dict()
                    memo_1 = data.get("memo_1", {})
                    if memo_1 and memo_1.get("founder_email") == founder_email:
                        return self._extract_features_from_memo1(memo_1)
                
                # Fallback: search in top-level founder_email
                query = self.db.collection("ingestionResults").where("founder_email", "==", founder_email).limit(1)
                docs = query.stream()
                for doc in docs:
                    data = doc.to_dict()
                    memo_1 = data.get("memo_1", {})
                    if memo_1:
                        return self._extract_features_from_memo1(memo_1)
            
            # Strategy 3: Get most recent if no specific ID provided
            if not memo_id and not founder_email:
                query = self.db.collection("ingestionResults").order_by("timestamp", direction=firestore.Query.DESCENDING).limit(1)
                docs = query.stream()
                for doc in docs:
                    data = doc.to_dict()
                    memo_1 = data.get("memo_1", {})
                    if memo_1:
                        return self._extract_features_from_memo1(memo_1)
            
            self.logger.warning(f"No founder data found for memo_id={memo_id}, founder_email={founder_email}")
            return None
            
        except Exception as e:
            self.logger.error(f"Error extracting founder data: {e}", exc_info=True)
            return None
    
    def _extract_features_from_memo1(self, memo_1: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract features from memo_1 data for matching.
        
        Args:
            memo_1: The memo_1 dictionary from ingestionResults
            
        Returns:
            Dictionary with normalized features
        """
        # Extract founder name
        founder_name = memo_1.get("founder_name", "")
        if isinstance(founder_name, list):
            founder_name = founder_name[0] if founder_name else ""
        
        # Extract sector/industry
        sector = memo_1.get("industry_category", memo_1.get("industry", ""))
        if isinstance(sector, list):
            sector = ", ".join(sector) if sector else ""
        
        # Extract stage
        stage = memo_1.get("company_stage", "")
        
        # Extract ticket size (amount_raising)
        ticket_str = memo_1.get("amount_raising", "")
        ticket_size = self._parse_ticket_size(ticket_str)
        
        # Extract geography
        geography = memo_1.get("headquarters", "")
        
        # Extract revenue and growth
        revenue_str = memo_1.get("current_revenue", "")
        revenue = self._parse_revenue(revenue_str)
        
        growth_rate_str = memo_1.get("revenue_growth_rate", "")
        growth_rate = self._parse_growth_rate(growth_rate_str)
        
        # Extract other relevant fields
        features = {
            'company_name': memo_1.get("title", ""),
            'founder_name': founder_name,
            'sector': sector,
            'stage': stage,
            'ticket_size': ticket_size,
            'geography': geography,
            'revenue': revenue,
            'growth_rate': growth_rate,
            'problem': memo_1.get("problem", ""),
            'solution': memo_1.get("solution", ""),
            'business_model': memo_1.get("business_model", ""),
            'traction': memo_1.get("traction", ""),
            'market_size': memo_1.get("market_size", ""),
            'team_size': self._parse_team_size(memo_1.get("team_size", "")),
            'competition': memo_1.get("competition", []),
            'founder_email': memo_1.get("founder_email", ""),
        }
        
        return features
    
    def find_matches(self, memo_id: Optional[str] = None, founder_email: Optional[str] = None, 
                     min_score: float = 0.3) -> Dict[str, Any]:
        """
        Find investor matches for a founder.
        
        Args:
            memo_id: Document ID in ingestionResults
            founder_email: Founder email to look up
            min_score: Minimum match score threshold (0-1)
            
        Returns:
            Dictionary with matches and metadata
        """
        start_time = datetime.now()
        self.logger.info(f"Finding investor matches for memo_id={memo_id}, founder_email={founder_email}, min_score={min_score}")
        
        try:
            # Validate that at least one identifier is provided
            if not memo_id and not founder_email:
                self.logger.warning("No memo_id or founder_email provided")
                return {
                    "status": "ERROR",
                    "error": "Either memo_id or founder_email must be provided",
                    "matches": [],
                    "timestamp": datetime.now().isoformat()
                }
            
            # Extract founder data
            founder_features = self.extract_founder_data(memo_id, founder_email)
            if not founder_features:
                self.logger.warning(f"Founder data not found for memo_id={memo_id}, founder_email={founder_email}")
                return {
                    "status": "ERROR",
                    "error": "Founder data not found in ingestionResults. Please ensure the memo has been successfully ingested.",
                    "matches": [],
                    "timestamp": datetime.now().isoformat()
                }
            
            self.logger.info(f"Found founder data: {founder_features.get('company_name', 'Unknown')} (Sector: {founder_features.get('sector', 'Unknown')}, Stage: {founder_features.get('stage', 'Unknown')})")
            
            # Load investors from Firestore
            investors = self.get_investors_from_firestore()
            if not investors:
                self.logger.error("No investors found in Firestore collection")
                return {
                    "status": "ERROR",
                    "error": "No investors found in Firestore 'investors' collection. Please run upload_investors_to_firestore.py script first.",
                    "matches": [],
                    "timestamp": datetime.now().isoformat()
                }
            
            self.logger.info(f"Loaded {len(investors)} investors from Firestore")
            
            # Calculate matches
            matches = []
            for investor in investors:
                try:
                    investor_features = self._extract_investor_features(investor)
                    match_score, score_breakdown = self._calculate_match_score(founder_features, investor_features)
                    
                    if match_score >= min_score:
                        # Generate "Why This Match" explanation
                        why_match = self._generate_why_match(founder_features, investor_features, score_breakdown)
                        
                        matches.append({
                            'investor_id': investor.get('id', ''),
                            'investor_name': investor.get('name', ''),
                            'firm_name': investor.get('firm', ''),
                            'investor_type': investor.get('type', ''),
                            'match_score': round(match_score * 100, 1),  # Convert to percentage
                            'score_breakdown': {k: round(v, 3) for k, v in score_breakdown.items()},
                            'why_match': why_match,
                            'recommended_action': self._get_recommended_action(match_score, investor),
                            'contact': investor.get('contact', {}),
                            'investment_profile': investor.get('investment_profile', {}),
                            'portfolio_metrics': investor.get('portfolio_metrics', {}),
                            'past_investments': investor.get('past_investments', []),
                            'thesis': investor.get('thesis') or investor.get('investment_thesis', ''),
                        })
                except Exception as e:
                    self.logger.warning(f"Error calculating match for investor {investor.get('id', 'Unknown')}: {e}")
                    continue
            
            # Sort by match score (highest first)
            matches.sort(key=lambda x: x['match_score'], reverse=True)
            
            processing_time = (datetime.now() - start_time).total_seconds()
            self.logger.info(f"Found {len(matches)} matches in {processing_time:.2f} seconds")
            
            return {
                "status": "SUCCESS",
                "founder_data": {
                    "company_name": founder_features.get('company_name', ''),
                    "sector": founder_features.get('sector', ''),
                    "stage": founder_features.get('stage', ''),
                },
                "matches": matches,
                "total_investors_analyzed": len(investors),
                "processing_time_seconds": processing_time,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error finding matches: {e}", exc_info=True)
            return {
                "status": "ERROR",
                "error": str(e),
                "matches": [],
                "timestamp": datetime.now().isoformat()
            }
    
    def _extract_investor_features(self, investor: Dict[str, Any]) -> Dict[str, Any]:
        """Extract and normalize investor features for matching."""
        investment_profile = investor.get('investment_profile', {})
        ticket_size = investment_profile.get('ticket_size', {})
        
        features = {
            'investor_id': investor.get('id', ''),
            'investor_name': investor.get('name', ''),
            'firm_name': investor.get('firm', ''),
            'sectors': investment_profile.get('sector_focus', []),
            'stages': investment_profile.get('stage_preference', []),
            'ticket_range': {
                'min': ticket_size.get('min', 0),
                'max': ticket_size.get('max', float('inf')),
                'avg': ticket_size.get('avg', 0)
            },
            'geography': investment_profile.get('geography', []),
            'business_model': investment_profile.get('business_model', []),
            'past_investments': investor.get('past_investments', []),
            'thesis': investor.get('thesis') or investor.get('investment_thesis', ''),
            'portfolio_metrics': investor.get('portfolio_metrics', {}),
        }
        
        return features
    
    def _calculate_match_score(self, founder_features: Dict[str, Any], 
                                investor_features: Dict[str, Any]) -> Tuple[float, Dict[str, float]]:
        """
        Calculate weighted match score between founder and investor.
        
        Returns:
            Tuple of (final_score, breakdown_dict)
        """
        breakdown = {}
        
        # 1. Sector Alignment (30%) - using Gemini embeddings for semantic matching
        breakdown['sector_alignment'] = self._calculate_sector_alignment(
            founder_features.get('sector', ''),
            investor_features.get('sectors', [])
        )
        
        # 2. Stage Alignment (20%)
        breakdown['stage_alignment'] = self._calculate_stage_alignment(
            founder_features.get('stage', ''),
            investor_features.get('stages', [])
        )
        
        # 3. Ticket Size Fit (15%)
        breakdown['ticket_fit'] = self._calculate_ticket_fit(
            founder_features.get('ticket_size', 0),
            investor_features.get('ticket_range', {})
        )
        
        # 4. Geography (10%)
        breakdown['geography'] = self._calculate_geography_match(
            founder_features.get('geography', ''),
            investor_features.get('geography', [])
        )
        
        # 5. Founder Background (10%)
        breakdown['founder_background'] = self._calculate_founder_background(
            founder_features,
            investor_features
        )
        
        # 6. Traction Quality (10%)
        breakdown['traction'] = self._calculate_traction_quality(
            founder_features,
            investor_features
        )
        
        # 7. Network Proximity (5%)
        breakdown['network'] = self._calculate_network_proximity(
            founder_features,
            investor_features
        )
        
        # Calculate weighted final score
        final_score = sum(
            breakdown[key] * self.weights[key] 
            for key in self.weights.keys() 
            if key in breakdown
        )
        
        return final_score, breakdown
    
    def _calculate_sector_alignment(self, founder_sector: str, investor_sectors: List[str]) -> float:
        """
        Calculate sector alignment using string matching first, then embeddings if available (30% weight).
        Falls back gracefully if embeddings are unavailable.
        """
        if not founder_sector or not investor_sectors:
            return 0.0
        
        # First, try string matching (fast and reliable, always works)
        founder_sector_lower = founder_sector.lower()
        for inv_sector in investor_sectors:
            inv_sector_lower = inv_sector.lower()
            if founder_sector_lower == inv_sector_lower:
                return 1.0  # Direct match = 100%
            if founder_sector_lower in inv_sector_lower or inv_sector_lower in founder_sector_lower:
                return 0.7  # Partial match = 70%
        
        # If no string match, try embeddings as enhancement (optional)
        try:
            founder_embedding = self._get_sector_embedding(founder_sector)
            
            # Only proceed if embeddings are available
            if not founder_embedding:
                return self._calculate_sector_alignment_string(founder_sector, investor_sectors)
            
            # Get embeddings for investor sectors and find best match
            best_match = 0.0
            for inv_sector in investor_sectors:
                inv_embedding = self._get_sector_embedding(inv_sector)
                
                if inv_embedding:
                    # Calculate cosine similarity
                    similarity = self._cosine_similarity(founder_embedding, inv_embedding)
                    best_match = max(best_match, similarity)
            
            # Use embedding similarity if found, otherwise return string match result (0.0)
            return best_match if best_match > 0.0 else self._calculate_sector_alignment_string(founder_sector, investor_sectors)
            
        except Exception as e:
            self.logger.warning(f"Error calculating sector alignment with embeddings: {e}")
            # Fallback to string matching
            return self._calculate_sector_alignment_string(founder_sector, investor_sectors)
    
    def _calculate_sector_alignment_string(self, founder_sector: str, investor_sectors: List[str]) -> float:
        """Fallback string-based sector matching."""
        if not founder_sector or not investor_sectors:
            return 0.0
        
        founder_sector_lower = founder_sector.lower()
        investor_sectors_lower = [s.lower() for s in investor_sectors]
        
        # Direct match
        if founder_sector_lower in investor_sectors_lower:
            return 1.0
        
        # Partial match
        for inv_sector in investor_sectors_lower:
            if founder_sector_lower in inv_sector or inv_sector in founder_sector_lower:
                return 0.7
        
        return 0.0
    
    def _get_sector_embedding(self, sector_text: str) -> Optional[List[float]]:
        """Get embedding for sector text using Vertex AI Embeddings API."""
        if not sector_text or not sector_text.strip():
            return None
        
        # Check cache first
        cache_key = sector_text.lower().strip()
        if cache_key in self._sector_embeddings_cache:
            return self._sector_embeddings_cache[cache_key]
        
        # Try multiple embedding models in order of preference
        embedding_models = [
            "textembedding-gecko@001",  # Older stable version
            "textembedding-gecko@002",  # Alternative version
            "text-embedding-004",        # Newer model
            "gemini-embedding-001"       # Gemini embedding model
        ]
        
        for model_name in embedding_models:
            try:
                from vertexai.language_models import TextEmbeddingModel
                
                # Initialize embedding model
                embedding_model = TextEmbeddingModel.from_pretrained(model_name)
                
                # Generate embedding
                embeddings = embedding_model.get_embeddings([sector_text])
                if embeddings and len(embeddings) > 0:
                    embedding = embeddings[0].values
                    
                    # Cache the embedding
                    self._sector_embeddings_cache[cache_key] = embedding
                    
                    self.logger.info(f"Successfully generated embedding using {model_name}")
                    return embedding
                    
            except Exception as e:
                self.logger.debug(f"Model {model_name} failed: {e}, trying next...")
                continue
        
        # If all models fail, return None (fallback to string matching)
        self.logger.warning(f"All embedding models failed for '{sector_text}', falling back to string matching")
        return None
    
    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors."""
        try:
            vec1_arr = np.array(vec1).reshape(1, -1)
            vec2_arr = np.array(vec2).reshape(1, -1)
            similarity = cosine_similarity(vec1_arr, vec2_arr)[0][0]
            return max(0.0, min(1.0, similarity))  # Clamp to [0, 1]
        except Exception as e:
            self.logger.warning(f"Error calculating cosine similarity: {e}")
            return 0.0
    
    def _calculate_stage_alignment(self, founder_stage: str, investor_stages: List[str]) -> float:
        """Calculate stage alignment (20% weight)."""
        if not founder_stage or not investor_stages:
            return 0.0
        
        founder_stage_lower = founder_stage.lower()
        investor_stages_lower = [s.lower() for s in investor_stages]
        
        # Direct match
        if founder_stage_lower in investor_stages_lower:
            return 1.0
        
        # Stage hierarchy matching
        stage_hierarchy = ['pre-seed', 'seed', 'series a', 'series b', 'series c', 'series d', 'growth']
        
        try:
            founder_idx = stage_hierarchy.index(founder_stage_lower)
            investor_indices = [stage_hierarchy.index(s) for s in investor_stages_lower if s in stage_hierarchy]
            
            if investor_indices:
                min_distance = min(abs(founder_idx - idx) for idx in investor_indices)
                # 20% penalty per stage difference
                return max(0.0, 1.0 - (min_distance * 0.2))
        except ValueError:
            pass
        
        return 0.0
    
    def _calculate_ticket_fit(self, founder_ticket: float, investor_range: Dict[str, float]) -> float:
        """Calculate ticket size fit (15% weight)."""
        if not founder_ticket or founder_ticket <= 0:
            return 0.0
        
        if not investor_range:
            return 0.0
        
        min_ticket = investor_range.get('min', 0)
        max_ticket = investor_range.get('max', float('inf'))
        
        # Perfect fit
        if min_ticket <= founder_ticket <= max_ticket:
            return 1.0
        
        # Calculate proximity score
        if founder_ticket < min_ticket:
            diff = min_ticket - founder_ticket
            return max(0.0, 1.0 - (diff / min_ticket))
        else:
            diff = founder_ticket - max_ticket
            if max_ticket > 0:
                return max(0.0, 1.0 - (diff / max_ticket))
            return 0.0
    
    def _calculate_geography_match(self, founder_location: str, investor_geography: List[str]) -> float:
        """Calculate geography match (10% weight)."""
        if not founder_location or not investor_geography:
            return 0.0
        
        founder_location_lower = founder_location.lower()
        investor_geo_lower = [g.lower() for g in investor_geography]
        
        # Direct match
        if any(geo in founder_location_lower for geo in investor_geo_lower):
            return 1.0
        
        # Country/region matching
        country_mapping = {
            'india': ['in', 'indian', 'bangalore', 'mumbai', 'delhi', 'hyderabad', 'pune'],
            'us': ['united states', 'usa', 'america', 'san francisco', 'new york', 'silicon valley'],
            'asia': ['southeast asia', 'singapore', 'singapore', 'asia'],
            'global': ['global', 'international']
        }
        
        for region, aliases in country_mapping.items():
            if any(alias in founder_location_lower for alias in aliases):
                if region in investor_geo_lower or any(r in investor_geo_lower for r in aliases):
                    return 1.0
        
        return 0.0
    
    def _calculate_founder_background(self, founder_features: Dict[str, Any], 
                                     investor_features: Dict[str, Any]) -> float:
        """Calculate founder background match (10% weight)."""
        # This is a simplified implementation
        # In a full system, would analyze founder experience, exits, education, etc.
        # For now, check if investor has similar portfolio companies or thesis mentions founder quality
        
        thesis = investor_features.get('thesis', '').lower()
        founder_name = founder_features.get('founder_name', '')
        
        # Check if thesis mentions founder qualities
        founder_keywords = ['founder', 'pedigree', 'experience', 'background', 'team', 'execution']
        if any(keyword in thesis for keyword in founder_keywords):
            return 0.7
        
        # Default moderate score if we can't determine
        return 0.5
    
    def _calculate_traction_quality(self, founder_features: Dict[str, Any], 
                                    investor_features: Dict[str, Any]) -> float:
        """Calculate traction quality match (10% weight)."""
        revenue = founder_features.get('revenue', 0)
        growth_rate = founder_features.get('growth_rate', 0)
        
        # Check if investor has NRR requirement
        portfolio_metrics = investor_features.get('portfolio_metrics', {})
        nrr_requirement = portfolio_metrics.get('nrr_requirement', 'Any')
        
        if nrr_requirement != 'Any' and nrr_requirement != '':
            try:
                required_nrr = int(nrr_requirement.replace('+', '').replace('%', ''))
                # Simplified: if growth rate is positive and significant, give good score
                if growth_rate > 0:
                    if growth_rate * 100 >= required_nrr:
                        return 1.0
                    else:
                        return 0.6
            except:
                pass
        
        # If revenue exists and growth is positive, give moderate score
        if revenue > 0 and growth_rate > 0:
            return 0.7
        
        # Default score
        return 0.5
    
    def _calculate_network_proximity(self, founder_features: Dict[str, Any], 
                                     investor_features: Dict[str, Any]) -> float:
        """Calculate network proximity (5% weight)."""
        # This is simplified - in a full system, would check:
        # - Shared investors in portfolio
        # - LinkedIn connections
        # - Mutual contacts
        
        # For now, check if founder's competition overlaps with investor's portfolio
        founder_competition = founder_features.get('competition', [])
        if isinstance(founder_competition, str):
            founder_competition = [founder_competition]
        
        investor_portfolio = investor_features.get('past_investments', [])
        
        # Check for overlaps
        if founder_competition and investor_portfolio:
            founder_comp_lower = [c.lower() for c in founder_competition if isinstance(c, str)]
            investor_port_lower = [p.lower() if isinstance(p, str) else str(p).lower() for p in investor_portfolio]
            
            overlaps = set(founder_comp_lower) & set(investor_port_lower)
            if overlaps:
                return 0.8  # High network score if portfolio overlaps
        
        return 0.3  # Default low network score
    
    def _generate_why_match(self, founder_features: Dict[str, Any], 
                           investor_features: Dict[str, Any],
                           score_breakdown: Dict[str, float]) -> str:
        """Generate AI-powered 'Why This Match' explanation."""
        try:
            if not self.gemini_model:
                return self._generate_fallback_why_match(founder_features, investor_features, score_breakdown)
            
            prompt = f"""You are a senior investment analyst providing a concise, compelling explanation for why this startup-investor match makes strategic sense.

STARTUP:
Company: {founder_features.get('company_name', 'Unknown')}
Sector: {founder_features.get('sector', 'Unknown')}
Stage: {founder_features.get('stage', 'Unknown')}
Problem: {founder_features.get('problem', '')[:200]}
Solution: {founder_features.get('solution', '')[:200]}
Business Model: {founder_features.get('business_model', 'Unknown')}

INVESTOR:
Name: {investor_features.get('investor_name', 'Unknown')}
Firm: {investor_features.get('firm_name', 'Unknown')}
Focus: {', '.join(investor_features.get('sectors', []))}
Stages: {', '.join(investor_features.get('stages', []))}
Thesis: {investor_features.get('thesis', '')[:200]}

MATCH SCORES:
Sector: {score_breakdown.get('sector_alignment', 0):.1%}
Stage: {score_breakdown.get('stage_alignment', 0):.1%}
Ticket Fit: {score_breakdown.get('ticket_fit', 0):.1%}
Geography: {score_breakdown.get('geography', 0):.1%}

Generate a 2-3 sentence explanation highlighting the strongest alignment factors. Be specific and compelling. Focus on mutual value creation."""

            response = self.gemini_model.generate_content(prompt)
            return response.text.strip()
            
        except Exception as e:
            self.logger.warning(f"Error generating why_match with Gemini: {e}")
            return self._generate_fallback_why_match(founder_features, investor_features, score_breakdown)
    
    def _generate_fallback_why_match(self, founder_features: Dict[str, Any],
                                    investor_features: Dict[str, Any],
                                    score_breakdown: Dict[str, float]) -> str:
        """Fallback why_match generation without AI."""
        top_factors = sorted(score_breakdown.items(), key=lambda x: x[1], reverse=True)[:2]
        factor_names = {
            'sector_alignment': 'sector focus',
            'stage_alignment': 'investment stage',
            'ticket_fit': 'funding range',
            'geography': 'geographic focus'
        }
        
        reasons = []
        for key, score in top_factors:
            if score > 0.7:
                reasons.append(factor_names.get(key, key.replace('_', ' ')))
        
        if reasons:
            return f"Strong alignment in {', '.join(reasons)}. The investor's portfolio and expertise align well with this startup's market opportunity."
        else:
            return "Moderate strategic fit based on investment profile and startup characteristics."
    
    def _get_recommended_action(self, match_score: float, investor: Dict[str, Any]) -> str:
        """Get recommended action based on match score."""
        if match_score >= 0.85:
            return "Request Intro"
        elif match_score >= 0.70:
            return "Reach Out"
        else:
            return "Consider"
    
    # Parsing helpers
    def _parse_ticket_size(self, ticket_str: str) -> float:
        """Parse ticket size from string to float (handles ₹50L, ₹1Cr, etc.)."""
        if not ticket_str:
            return 0.0
        
        try:
            # Remove currency symbols and spaces
            ticket_clean = ticket_str.replace('₹', '').replace('$', '').replace(',', '').strip().lower()
            
            # Handle "Cr" (Crores), "L" (Lakhs), "M" (Millions)
            multiplier = 1.0
            if 'cr' in ticket_clean or 'crore' in ticket_clean:
                multiplier = 10000000  # 1 Crore = 10M
                ticket_clean = ticket_clean.replace('cr', '').replace('crore', '').strip()
            elif 'l' in ticket_clean or 'lakh' in ticket_clean:
                multiplier = 100000  # 1 Lakh = 100K
                ticket_clean = ticket_clean.replace('l', '').replace('lakh', '').strip()
            elif 'm' in ticket_clean:
                multiplier = 1000000  # 1 Million
                ticket_clean = ticket_clean.replace('m', '').strip()
            elif 'k' in ticket_clean:
                multiplier = 1000  # 1 Thousand
                ticket_clean = ticket_clean.replace('k', '').strip()
            
            # Extract number
            import re
            numbers = re.findall(r'[\d.]+', ticket_clean)
            if numbers:
                return float(numbers[0]) * multiplier
        except Exception as e:
            self.logger.warning(f"Error parsing ticket size '{ticket_str}': {e}")
        
        return 0.0
    
    def _parse_revenue(self, revenue_str: str) -> float:
        """Parse revenue from string to float."""
        return self._parse_ticket_size(revenue_str)
    
    def _parse_growth_rate(self, growth_str: str) -> float:
        """Parse growth rate from string to float (percentage)."""
        if not growth_str:
            return 0.0
        
        try:
            import re
            # Extract percentage number
            numbers = re.findall(r'[\d.]+', growth_str.replace('%', '').replace(',', ''))
            if numbers:
                return float(numbers[0]) / 100  # Convert to decimal
        except Exception as e:
            self.logger.warning(f"Error parsing growth rate '{growth_str}': {e}")
        
        return 0.0
    
    def _parse_team_size(self, team_str: str) -> int:
        """Parse team size from string to int."""
        if not team_str:
            return 0
        
        try:
            import re
            numbers = re.findall(r'\d+', str(team_str))
            if numbers:
                return int(numbers[0])
        except Exception as e:
            self.logger.warning(f"Error parsing team size '{team_str}': {e}")
        
        return 0

