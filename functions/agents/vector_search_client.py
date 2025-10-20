"""
Firestore Client for Veritas AI Diligence System
Handles company data storage and retrieval using Firestore (Vector Search removed)
"""

import os
import json
import time
from typing import List, Dict, Any, Optional
from google.cloud import firestore
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VectorSearchClient:
    """Client for Firestore-based company data operations (Vector Search removed)"""
    
    def __init__(self, project_id: str = "veritas-472301", region: str = "asia-south1"):
        """Initialize Firestore client only"""
        self.project_id = project_id
        self.region = region
        
        # Initialize Firestore
        self.db = firestore.Client()
        logger.info("Initialized Firestore client for diligence queries")
    
    def store_company_embeddings(self, company_id: str, memo1: Dict[str, Any], 
                                 founder_profile: Dict[str, Any], pitch_deck_text: str) -> bool:
        """Store company data in Firestore (no embeddings needed)"""
        try:
            doc_ref = self.db.collection('companyVectorData').document(company_id)
            doc_ref.set({
                'company_id': company_id,
                'memo1': memo1,
                'founder_profile': founder_profile,
                'pitch_deck_text': pitch_deck_text,
                'created_at': firestore.SERVER_TIMESTAMP,
                'last_updated': firestore.SERVER_TIMESTAMP
            })
            logger.info(f"Stored company data for {company_id} in Firestore")
            return True
        except Exception as e:
            logger.error(f"Error storing company data: {e}")
            return False
    
    def delete_company_embeddings(self, company_id: str) -> bool:
        """Delete company data from Firestore"""
        try:
            doc_ref = self.db.collection('companyVectorData').document(company_id)
            doc_ref.delete()
            logger.info(f"Deleted company data for {company_id}")
            return True
        except Exception as e:
            logger.error(f"Error deleting company data: {e}")
            return False
    
    def get_company_data(self, company_id: str) -> Optional[Dict[str, Any]]:
        """Get all data for a company from Firestore"""
        try:
            # Try ingestionResults collection first (primary source)
            doc_ref = self.db.collection('ingestionResults').document(company_id)
            doc = doc_ref.get()
            
            if doc.exists:
                data = doc.to_dict()
                
                # Extract and structure the data for diligence
                result = {
                    'company_id': company_id,
                    'memo1': data.get('memo_1', {}),
                    'pitch_deck_text': data.get('extracted_text', ''),
                    'founder_profile': {},
                    'created_at': data.get('created_at')
                }
                
                # Get founder profile if founder_email exists
                founder_email = data.get('founder_email')
                if founder_email:
                    # Query by email field since document ID is UID, not email
                    profiles_ref = self.db.collection('founderProfiles')
                    query = profiles_ref.where('email', '==', founder_email).limit(1)
                    docs = query.get()
                    
                    if docs:
                        profile_doc = docs[0]
                        profile_data = profile_doc.to_dict()
                        
                        # Use top-level fields if nested profile exists (handle old data)
                        if 'profile' in profile_data and profile_data['profile']:
                            # Merge: prefer top-level, fallback to nested
                            result['founder_profile'] = {
                                'fullName': profile_data.get('fullName') or profile_data['profile'].get('fullName', ''),
                                'linkedinUrl': profile_data.get('linkedinUrl') or profile_data['profile'].get('linkedinUrl', ''),
                                'professionalBackground': profile_data.get('professionalBackground') or profile_data['profile'].get('professionalBackground', ''),
                                'education': profile_data.get('education') or profile_data['profile'].get('education', []),
                                'previousCompanies': profile_data.get('previousCompanies') or profile_data['profile'].get('previousCompanies', []),
                                'yearsOfExperience': profile_data.get('yearsOfExperience') or profile_data['profile'].get('yearsOfExperience', ''),
                                'teamSize': profile_data.get('teamSize') or profile_data['profile'].get('teamSize', ''),
                                'expertise': profile_data.get('expertise') or profile_data['profile'].get('expertise', [])
                            }
                        else:
                            # New structure: use top-level fields directly
                            result['founder_profile'] = profile_data
                
                return result
            
            # Fallback to companyVectorData if not found in ingestionResults
            doc_ref = self.db.collection('companyVectorData').document(company_id)
            doc = doc_ref.get()
            
            if doc.exists:
                return doc.to_dict()
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting company data: {e}")
            return None

# Global instance
_vector_search_client = None

def get_vector_search_client() -> VectorSearchClient:
    """Get or create Vector Search client instance"""
    global _vector_search_client
    if _vector_search_client is None:
        _vector_search_client = VectorSearchClient()
    return _vector_search_client