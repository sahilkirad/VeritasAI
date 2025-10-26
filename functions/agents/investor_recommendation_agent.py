# agents/investor_recommendation_agent.py

from typing import Dict, List, Any, Optional, Tuple
import json
import logging
import numpy as np
from datetime import datetime
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler

# Google Cloud imports
try:
    import vertexai
    from vertexai.generative_models import GenerativeModel
    from google.cloud import firestore
    GOOGLE_AVAILABLE = True
except ImportError:
    GOOGLE_AVAILABLE = False

# Import vector search client
try:
    from .vector_search_client import get_vector_search_client
    VECTOR_SEARCH_AVAILABLE = True
except ImportError:
    VECTOR_SEARCH_AVAILABLE = False
    
# Suppress noisy Google Cloud logging
logging.getLogger('google.api_core').setLevel(logging.WARNING)
logging.getLogger('google.auth').setLevel(logging.WARNING)


class InvestorRecommendationAgent:
    """
    Agent: AI-Driven Investor Recommendation System
    Matches approved startup memos with suitable investors using multi-factor scoring
    and network analysis. Generates ranked recommendations with detailed rationale.
    """

    def __init__(
        self,
        model: str = "gemini-1.5-flash",
        project: str = "",
        location: str = "asia-south1"
    ):
        """
        Initializes the agent's configuration.
        
        Args:
            model (str): The name of the Gemini model to use.
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

        # Initialize Google Cloud clients to None
        self.gemini_model = None
        self.db = None
        self.vector_search_client = None
        
        # Enhanced scoring weights for multi-factor matching
        self.weights = {
            'sector_alignment': 0.25,
            'stage_alignment': 0.20,
            'ticket_size_match': 0.20,
            'portfolio_similarity': 0.15,
            'geography_match': 0.10,
            'network_connections': 0.10  # New factor for network effects
        }

    def set_up(self):
        """Initializes all necessary Google Cloud clients and models."""
        self.logger.info(f"Setting up InvestorRecommendationAgent for project '{self.project}'...")
        if not GOOGLE_AVAILABLE:
            self.logger.error("Google Cloud libraries are not installed. Please run 'pip install google-cloud-aiplatform'.")
            raise ImportError("Required Google Cloud libraries are missing.")
        
        try:
            # Initialize Vertex AI
            vertexai.init(project=self.project, location=self.location)
            self.logger.info(f"Vertex AI initialized in project '{self.project}' and location '{self.location}'.")
            
            # Initialize Gemini Model
            self.gemini_model = GenerativeModel(self.model_name)
            self.logger.info(f"GenerativeModel ('{self.model_name}') initialized successfully.")
            
            # Initialize Firestore client
            self.db = firestore.Client(project=self.project)
            self.logger.info("Firestore client initialized successfully.")
            
            # Initialize Vector Search client
            if VECTOR_SEARCH_AVAILABLE:
                self.vector_search_client = get_vector_search_client()
                self.logger.info("Vector Search client initialized successfully.")
            else:
                self.logger.warning("Vector Search client not available.")

            self.logger.info("✅ InvestorRecommendationAgent setup complete.")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize agent's Google Cloud clients: {e}", exc_info=True)
            raise

    def run(self, company_id: str, memo_data: Dict[str, Any], founder_profile: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Main entry point for generating investor recommendations.

        Args:
            company_id (str): The company ID to generate recommendations for.
            memo_data (Dict[str, Any]): The approved memo data (Memo 1, 2, or 3).
            founder_profile (Dict[str, Any]): Optional founder profile data.

        Returns:
            Dict[str, Any]: A structured dictionary containing recommendations and metadata.
        """
        start_time = datetime.now()
        self.logger.info(f"Starting investor recommendation process for company '{company_id}'...")
        
        try:
            # Extract startup features
            startup_features = self._get_startup_features(memo_data, founder_profile)
            self.logger.info("Startup features extracted successfully.")
            
            # Get all investor profiles
            investor_profiles = self._get_all_investor_profiles()
            self.logger.info(f"Retrieved {len(investor_profiles)} investor profiles.")
            
            # Calculate matches for each investor
            recommendations = []
            for investor in investor_profiles:
                investor_features = self._get_investor_features(investor)
                match_score, breakdown = self._calculate_match_score(startup_features, investor_features)
                
                if match_score > 0.3:  # Only include investors with >30% match
                    rationale = self._generate_rationale(startup_features, investor_features, breakdown)
                    network_paths = self._find_network_paths(startup_features, investor)
                    
                    recommendations.append({
                        'investorId': investor['id'],
                        'investorName': investor['fullName'],
                        'firmName': investor['firmName'],
                        'matchScore': round(match_score * 100, 1),
                        'rationale': rationale,
                        'sectorAlignment': round(breakdown['sector_alignment'] * 100, 1),
                        'stageAlignment': round(breakdown['stage_alignment'] * 100, 1),
                        'ticketSizeMatch': round(breakdown['ticket_size_match'] * 100, 1),
                        'geographyMatch': round(breakdown['geography_match'] * 100, 1),
                        'networkPath': network_paths
                    })
            
            # Sort by match score (highest first)
            recommendations.sort(key=lambda x: x['matchScore'], reverse=True)
            
            # Store recommendations in Firestore
            self._store_recommendations(company_id, memo_data.get('title', 'Unknown Company'), recommendations)
            
            processing_time = (datetime.now() - start_time).total_seconds()
            self.logger.info(f"Successfully generated {len(recommendations)} recommendations in {processing_time:.2f} seconds.")

            return {
                "timestamp": datetime.now().isoformat(),
                "processing_time_seconds": processing_time,
                "company_id": company_id,
                "company_name": memo_data.get('title', 'Unknown Company'),
                "recommendations": recommendations,
                "total_investors_analyzed": len(investor_profiles),
                "status": "SUCCESS"
            }
            
        except Exception as e:
            self.logger.error(f"Error during recommendation process for company '{company_id}': {e}", exc_info=True)
            processing_time = (datetime.now() - start_time).total_seconds()
            
            return {
                "timestamp": datetime.now().isoformat(),
                "processing_time_seconds": processing_time,
                "company_id": company_id,
                "recommendations": [],
                "status": "FAILED",
                "error": str(e)
            }

    def _get_startup_features(self, memo_data: Dict[str, Any], founder_profile: Dict[str, Any] = None) -> Dict[str, Any]:
        """Extract and normalize startup features for matching."""
        features = {
            'company_name': memo_data.get('title', ''),
            'sector': memo_data.get('industry_category', ''),
            'stage': memo_data.get('company_stage', ''),
            'ticket_size': self._parse_ticket_size(memo_data.get('amount_raising', '')),
            'geography': memo_data.get('headquarters', ''),
            'revenue': self._parse_revenue(memo_data.get('current_revenue', '')),
            'growth_rate': self._parse_growth_rate(memo_data.get('revenue_growth_rate', '')),
            'team_size': self._parse_team_size(memo_data.get('team_size', '')),
            'problem': memo_data.get('problem', ''),
            'solution': memo_data.get('solution', ''),
            'traction': memo_data.get('traction', ''),
            'business_model': memo_data.get('business_model', ''),
            'market_size': memo_data.get('market_size', ''),
            'competition': memo_data.get('competition', []),
            'founder_background': founder_profile.get('professionalBackground', '') if founder_profile else '',
            'founder_experience': founder_profile.get('yearsOfExperience', 0) if founder_profile else 0
        }
        
        # Create text embedding for semantic matching
        text_content = f"{features['problem']} {features['solution']} {features['business_model']} {features['traction']}"
        features['text_embedding'] = self._get_text_embedding(text_content)
        
        return features

    def _get_investor_features(self, investor_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Extract and normalize investor features for matching."""
        features = {
            'investor_id': investor_profile['id'],
            'investor_name': investor_profile['fullName'],
            'firm_name': investor_profile['firmName'],
            'sectors': investor_profile.get('sectors', []),
            'stages': investor_profile.get('investmentStage', []),
            'ticket_range': investor_profile.get('ticketSize', {'min': 0, 'max': 10000000}),
            'geography': investor_profile.get('geography', []),
            'portfolio': investor_profile.get('portfolio', []),
            'response_history': investor_profile.get('responseHistory', []),
            'network_connections': investor_profile.get('networkConnections', [])
        }
        
        # Create portfolio text for semantic matching
        portfolio_text = ' '.join([f"{p['companyName']} {p['sector']} {p['stage']}" for p in features['portfolio']])
        features['portfolio_embedding'] = self._get_text_embedding(portfolio_text)
        
        return features

    def _calculate_match_score(self, startup_features: Dict[str, Any], investor_features: Dict[str, Any]) -> Tuple[float, Dict[str, float]]:
        """Calculate comprehensive match score between startup and investor."""
        
        # 1. Sector Alignment
        sector_score = self._calculate_sector_alignment(
            startup_features['sector'], 
            investor_features['sectors']
        )
        
        # 2. Stage Alignment
        stage_score = self._calculate_stage_alignment(
            startup_features['stage'], 
            investor_features['stages']
        )
        
        # 3. Ticket Size Match
        ticket_score = self._calculate_ticket_size_match(
            startup_features['ticket_size'], 
            investor_features['ticket_range']
        )
        
        # 4. Geography Match
        geo_score = self._calculate_geography_match(
            startup_features['geography'], 
            investor_features['geography']
        )
        
        # 5. Portfolio Similarity (semantic matching)
        portfolio_similarity = self._calculate_portfolio_similarity(
            startup_features['text_embedding'],
            investor_features['portfolio_embedding']
        )
        
        # 6. Network Connections (warm introductions)
        network_score = self._calculate_network_connections(
            startup_features,
            investor_features
        )
        
        # Weighted final score with enhanced factors
        breakdown = {
            'sector_alignment': sector_score,
            'stage_alignment': stage_score,
            'ticket_size_match': ticket_score,
            'geography_match': geo_score,
            'portfolio_similarity': portfolio_similarity,
            'network_connections': network_score
        }
        
        final_score = sum(score * self.weights[key] for key, score in breakdown.items())
        
        return final_score, breakdown

    def _calculate_sector_alignment(self, startup_sector: str, investor_sectors: List[str]) -> float:
        """Calculate sector alignment score."""
        if not startup_sector or not investor_sectors:
            return 0.0
        
        startup_sector_lower = startup_sector.lower()
        investor_sectors_lower = [s.lower() for s in investor_sectors]
        
        # Direct match
        if startup_sector_lower in investor_sectors_lower:
            return 1.0
        
        # Partial match (substring)
        for investor_sector in investor_sectors_lower:
            if startup_sector_lower in investor_sector or investor_sector in startup_sector_lower:
                return 0.7
        
        # No match
        return 0.0

    def _calculate_stage_alignment(self, startup_stage: str, investor_stages: List[str]) -> float:
        """Calculate stage alignment score."""
        if not startup_stage or not investor_stages:
            return 0.0
        
        startup_stage_lower = startup_stage.lower()
        investor_stages_lower = [s.lower() for s in investor_stages]
        
        # Direct match
        if startup_stage_lower in investor_stages_lower:
            return 1.0
        
        # Stage proximity scoring
        stage_hierarchy = ['pre-seed', 'seed', 'series a', 'series b', 'series c', 'growth']
        try:
            startup_idx = stage_hierarchy.index(startup_stage_lower)
            investor_indices = [stage_hierarchy.index(s) for s in investor_stages_lower if s in stage_hierarchy]
            
            if investor_indices:
                min_distance = min(abs(startup_idx - idx) for idx in investor_indices)
                return max(0.0, 1.0 - (min_distance * 0.2))  # 20% penalty per stage difference
        except ValueError:
            pass
        
        return 0.0

    def _calculate_ticket_size_match(self, startup_ticket: float, investor_range: Dict[str, float]) -> float:
        """Calculate ticket size match score."""
        if not startup_ticket or not investor_range:
            return 0.0
        
        min_ticket = investor_range.get('min', 0)
        max_ticket = investor_range.get('max', float('inf'))
        
        if min_ticket <= startup_ticket <= max_ticket:
            return 1.0
        
        # Calculate proximity score
        if startup_ticket < min_ticket:
            return max(0.0, 1.0 - (min_ticket - startup_ticket) / min_ticket)
        else:
            return max(0.0, 1.0 - (startup_ticket - max_ticket) / max_ticket)

    def _calculate_geography_match(self, startup_location: str, investor_geography: List[str]) -> float:
        """Calculate geography match score."""
        if not startup_location or not investor_geography:
            return 0.0
        
        startup_location_lower = startup_location.lower()
        investor_geo_lower = [g.lower() for g in investor_geography]
        
        # Direct match
        if startup_location_lower in investor_geo_lower:
            return 1.0
        
        # Country/region matching
        country_mapping = {
            'us': ['united states', 'usa', 'america'],
            'india': ['in', 'indian'],
            'europe': ['eu', 'european', 'uk', 'germany', 'france']
        }
        
        for region, aliases in country_mapping.items():
            if any(alias in startup_location_lower for alias in aliases):
                if region in investor_geo_lower:
                    return 1.0
        
        return 0.0

    def _calculate_portfolio_similarity(self, startup_embedding: List[float], investor_embedding: List[float]) -> float:
        """Calculate semantic similarity between startup and investor portfolio."""
        if not startup_embedding or not investor_embedding:
            return 0.0
        
        try:
            # Reshape for cosine similarity calculation
            startup_vec = np.array(startup_embedding).reshape(1, -1)
            investor_vec = np.array(investor_embedding).reshape(1, -1)
            
            similarity = cosine_similarity(startup_vec, investor_vec)[0][0]
            return max(0.0, similarity)
        except Exception as e:
            self.logger.warning(f"Error calculating portfolio similarity: {e}")
            return 0.0

    def _calculate_network_connections(self, startup_features: Dict[str, Any], investor_features: Dict[str, Any]) -> float:
        """Calculate network connection strength between startup and investor."""
        try:
            network_connections = investor_features.get('networkConnections', [])
            if not network_connections:
                return 0.0
            
            # Calculate network strength based on connection types and frequency
            connection_scores = {
                'co_investor': 0.9,  # Highest value - they've invested together
                'syndicate': 0.7,   # High value - they work together
                'referral': 0.5     # Medium value - they refer deals
            }
            
            total_score = 0.0
            for connection in network_connections:
                connection_type = connection.get('connectionType', 'referral')
                score = connection_scores.get(connection_type, 0.3)
                total_score += score
            
            # Normalize by number of connections (diminishing returns)
            if len(network_connections) > 0:
                normalized_score = min(total_score / len(network_connections), 1.0)
                return normalized_score
            
            return 0.0
        except Exception as e:
            self.logger.warning(f"Error calculating network connections: {e}")
            return 0.0

    def _get_text_embedding(self, text: str) -> List[float]:
        """Get text embedding using Gemini model."""
        try:
            if not text.strip():
                return []
            
            # Use Gemini to generate embeddings
            response = self.gemini_model.embed_content(text)
            return response.values
        except Exception as e:
            self.logger.warning(f"Error generating text embedding: {e}")
            return []

    def _generate_rationale(self, startup_features: Dict[str, Any], investor_features: Dict[str, Any], breakdown: Dict[str, float]) -> str:
        """Generate human-readable rationale for the match using enhanced AI analysis."""
        try:
            # Enhanced prompt with more context and analysis
            prompt = f"""
            You are a senior investment analyst at a top-tier VC firm with 15+ years of experience in startup-investor matching. 
            Your task is to provide a compelling, data-driven rationale for why this startup-investor pairing makes strategic sense.
            
            STARTUP PROFILE:
            Company: {startup_features['company_name']}
            Sector: {startup_features['sector']}
            Stage: {startup_features['stage']}
            Problem Statement: {startup_features['problem'][:300]}
            Solution: {startup_features['solution'][:300]}
            Business Model: {startup_features.get('business_model', 'Not specified')}
            Market Size: {startup_features.get('market_size', 'Not specified')}
            Traction: {startup_features.get('traction', 'Not specified')}
            Team Size: {startup_features.get('team_size', 'Not specified')}
            Revenue: {startup_features.get('revenue', 'Not specified')}
            Growth Rate: {startup_features.get('growth_rate', 'Not specified')}
            
            INVESTOR PROFILE:
            Name: {investor_features['investor_name']}
            Firm: {investor_features['firm_name']}
            Investment Focus: {', '.join(investor_features['sectors'])}
            Stage Preferences: {', '.join(investor_features['stages'])}
            Ticket Size Range: ${investor_features['ticket_range']['min']:,.0f} - ${investor_features['ticket_range']['max']:,.0f}
            Geographic Focus: {', '.join(investor_features['geography'])}
            Portfolio Companies: {len(investor_features['portfolio'])} investments
            Recent Investments: {', '.join([p['companyName'] for p in investor_features['portfolio'][:3]])}
            
            MATCH ANALYSIS:
            Sector Alignment: {breakdown['sector_alignment']:.1%} - {"Excellent" if breakdown['sector_alignment'] > 0.8 else "Good" if breakdown['sector_alignment'] > 0.6 else "Moderate"}
            Stage Alignment: {breakdown['stage_alignment']:.1%} - {"Perfect fit" if breakdown['stage_alignment'] > 0.8 else "Good fit" if breakdown['stage_alignment'] > 0.6 else "Partial fit"}
            Ticket Size Match: {breakdown['ticket_size_match']:.1%} - {"Ideal range" if breakdown['ticket_size_match'] > 0.8 else "Within range" if breakdown['ticket_size_match'] > 0.6 else "Outside range"}
            Geography Match: {breakdown['geography_match']:.1%} - {"Same region" if breakdown['geography_match'] > 0.8 else "Adjacent region" if breakdown['geography_match'] > 0.6 else "Different region"}
            Portfolio Synergy: {breakdown['portfolio_similarity']:.1%} - {"High synergy" if breakdown['portfolio_similarity'] > 0.7 else "Moderate synergy" if breakdown['portfolio_similarity'] > 0.5 else "Low synergy"}
            
            ANALYSIS REQUIREMENTS:
            1. Identify the TOP 2 strongest alignment factors and explain why they matter
            2. Highlight any strategic advantages (network effects, portfolio synergies, market timing)
            3. Address any potential concerns or gaps
            4. Provide a compelling business case for the investment
            5. Keep the tone professional but enthusiastic
            6. Use specific data points and examples where possible
            
            Generate a 3-4 sentence rationale that would convince both the startup and investor that this is a strategic match. 
            Focus on mutual value creation and strategic fit.
            """
            
            response = self.gemini_model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            self.logger.warning(f"Error generating enhanced rationale: {e}")
            # Fallback to basic rationale
            return f"Strong strategic match with {breakdown['sector_alignment']:.1%} sector alignment and {breakdown['stage_alignment']:.1%} stage fit. The investor's portfolio and expertise align well with the startup's market opportunity and growth trajectory."

    def _find_network_paths(self, startup_features: Dict[str, Any], investor: Dict[str, Any]) -> List[Dict[str, str]]:
        """Find network connection paths between startup and investor."""
        try:
            # This is a simplified implementation
            # In a real system, you'd query a network graph database
            network_connections = investor.get('networkConnections', [])
            
            paths = []
            for connection in network_connections[:3]:  # Limit to top 3 connections
                paths.append({
                    'fromId': startup_features.get('founder_email', ''),
                    'toId': connection['investorEmail'],
                    'connectionType': connection['connectionType']
                })
            
            return paths
        except Exception as e:
            self.logger.warning(f"Error finding network paths: {e}")
            return []

    def _get_all_investor_profiles(self) -> List[Dict[str, Any]]:
        """Retrieve all investor profiles from Firestore."""
        try:
            if not self.db:
                self.logger.error("Firestore client not initialized")
                return []
            
            investors_ref = self.db.collection('investorProfiles')
            docs = investors_ref.get()
            
            investors = []
            for doc in docs:
                investor_data = doc.to_dict()
                investor_data['id'] = doc.id
                investors.append(investor_data)
            
            self.logger.info(f"Retrieved {len(investors)} investor profiles")
            return investors
            
        except Exception as e:
            self.logger.error(f"Error retrieving investor profiles: {e}")
            return []

    def _store_recommendations(self, company_id: str, company_name: str, recommendations: List[Dict[str, Any]]) -> bool:
        """Store recommendations in Firestore."""
        try:
            if not self.db:
                self.logger.error("Firestore client not initialized")
                return False
            
            # Create recommendation document
            recommendation_data = {
                'companyId': company_id,
                'companyName': company_name,
                'memoId': f"memo_{company_id}",
                'recommendations': recommendations,
                'status': 'generated',
                'generatedAt': firestore.SERVER_TIMESTAMP,
                'createdAt': firestore.SERVER_TIMESTAMP,
                'updatedAt': firestore.SERVER_TIMESTAMP
            }
            
            # Store in Firestore
            doc_ref = self.db.collection('investorRecommendations').document()
            doc_ref.set(recommendation_data)
            
            self.logger.info(f"Stored {len(recommendations)} recommendations for company {company_id}")
            return True
            
        except Exception as e:
            self.logger.error(f"Error storing recommendations: {e}")
            return False

    def _parse_ticket_size(self, ticket_str: str) -> float:
        """Parse ticket size from string to float."""
        if not ticket_str:
            return 0.0
        
        try:
            # Remove currency symbols and convert to float
            import re
            numbers = re.findall(r'[\d,]+\.?\d*', ticket_str.replace(',', ''))
            if numbers:
                return float(numbers[0])
        except (ValueError, IndexError):
            pass
        
        return 0.0

    def _parse_revenue(self, revenue_str: str) -> float:
        """Parse revenue from string to float."""
        return self._parse_ticket_size(revenue_str)

    def _parse_growth_rate(self, growth_str: str) -> float:
        """Parse growth rate from string to float."""
        if not growth_str:
            return 0.0
        
        try:
            import re
            numbers = re.findall(r'[\d,]+\.?\d*', growth_str.replace('%', ''))
            if numbers:
                return float(numbers[0]) / 100  # Convert percentage to decimal
        except (ValueError, IndexError):
            pass
        
        return 0.0

    def _parse_team_size(self, team_str: str) -> int:
        """Parse team size from string to int."""
        if not team_str:
            return 0
        
        try:
            import re
            numbers = re.findall(r'\d+', team_str)
            if numbers:
                return int(numbers[0])
        except (ValueError, IndexError):
            pass
        
        return 0


def test_agent(company_id: str, project_id: str, memo_data: Dict[str, Any] = None):
    """
    Test function to run the agent with sample data.
    
    Args:
        company_id (str): The company ID to test with.
        project_id (str): Your Google Cloud project ID.
        memo_data (Dict[str, Any]): Sample memo data for testing.
    """
    if not project_id:
        print("ERROR: Please provide a Google Cloud project ID.")
        return
        
    if not memo_data:
        # Sample memo data for testing
        memo_data = {
            'title': 'TechStartup Inc',
            'industry_category': 'AI',
            'company_stage': 'Seed',
            'amount_raising': '$2M',
            'headquarters': 'San Francisco, CA',
            'problem': 'AI-powered customer service automation',
            'solution': 'Automated customer support using advanced NLP',
            'business_model': 'SaaS subscription',
            'traction': '100+ enterprise customers',
            'competition': ['Zendesk', 'Intercom']
        }
    
    agent = InvestorRecommendationAgent(project=project_id)
    agent.set_up()
    
    try:
        result = agent.run(company_id=company_id, memo_data=memo_data)
        
        print("\n--- Investor Recommendation Result ---")
        print(json.dumps(result, indent=2))
        print("------------------------------------\n")

    except Exception as e:
        print(f"An unexpected error occurred during the test run: {e}")


if __name__ == "__main__":
    # === HOW TO RUN THIS TEST ===
    # 1. Make sure you have authenticated with Google Cloud:
    #    gcloud auth application-default login
    # 2. Set your Project ID below.
    # 3. Set the company ID to test with.
    # 4. Run from your terminal: python investor_recommendation_agent.py
    
    # --- Configuration ---
    GCP_PROJECT_ID = "veritas-472301" 
    TEST_COMPANY_ID = "test_company_001"
    
    test_agent(company_id=TEST_COMPANY_ID, project_id=GCP_PROJECT_ID)
