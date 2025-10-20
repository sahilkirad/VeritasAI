"""
Diligence Agent with RAG (Retrieval-Augmented Generation)
Performs automated validation using Vector Search and Gemini AI
"""

import os
import json
import asyncio
from typing import Dict, List, Any, Optional, Tuple
from concurrent.futures import ThreadPoolExecutor
import vertexai
from vertexai.generative_models import GenerativeModel
from google.cloud import firestore
from google.cloud import bigquery
import logging
from datetime import datetime
from .vector_search_client import get_vector_search_client

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def extract_json_from_response(response_text: str) -> dict:
    """Extract JSON from Gemini response that may be wrapped in markdown"""
    try:
        # Try direct JSON parse first
        return json.loads(response_text)
    except:
        # Extract from markdown code block
        if "```json" in response_text:
            json_str = response_text.split("```json")[1].split("```")[0].strip()
            return json.loads(json_str)
        elif "```" in response_text:
            json_str = response_text.split("```")[1].split("```")[0].strip()
            return json.loads(json_str)
        raise ValueError("Could not extract JSON from response")

def convert_timestamps(data):
    """Convert Firestore timestamps to ISO strings for JSON serialization"""
    if isinstance(data, dict):
        return {k: convert_timestamps(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [convert_timestamps(item) for item in data]
    elif hasattr(data, 'timestamp'):  # DatetimeWithNanoseconds
        return data.isoformat()
    elif hasattr(data, 'isoformat'):  # datetime objects
        return data.isoformat()
    return data

class DiligenceAgentRAG:
    """RAG-based diligence validation agent"""
    
    def __init__(self, project_id: str = "veritas-472301", region: str = "asia-south1"):
        """Initialize diligence agent with Firestore and Gemini"""
        self.project_id = project_id
        self.region = region
        
        # Initialize Vertex AI
        vertexai.init(project=project_id, location=region)
        
        # Initialize Gemini model
        self.gemini_model = GenerativeModel("gemini-2.5-flash")
        
        # Initialize clients
        self.db = firestore.Client(project=project_id)
        self.bq_client = bigquery.Client(project=project_id)
        self.vector_client = get_vector_search_client()  # Only for get_company_data()
        logger.info("Initialized DiligenceAgentRAG with Firestore + Gemini")
    
    async def run_validation(self, company_id: str, investor_email: str) -> Dict[str, Any]:
        """Run complete diligence validation for a company"""
        try:
            logger.info(f"Starting diligence validation for company {company_id}")
            
            # Update status to processing
            self._update_diligence_status(company_id, investor_email, "processing", 0)
            
            # Get company data from Firestore (0-25%)
            self._update_diligence_status(company_id, investor_email, "processing", 10)
            company_data = self.vector_client.get_company_data(company_id)
            if not company_data:
                raise Exception(f"No data found for company {company_id}")
            
            self._update_diligence_status(company_id, investor_email, "processing", 25)
            
            # Run parallel validation agents (25-75%)
            self._update_diligence_status(company_id, investor_email, "processing", 30)
            validation_results = await self._run_parallel_validations(company_id, company_data)
            self._update_diligence_status(company_id, investor_email, "processing", 75)
            
            # Synthesize results (75-100%)
            final_report = await self._synthesize_validation_results(validation_results, company_data)
            self._update_diligence_status(company_id, investor_email, "processing", 90)
            
            # Save results
            self._save_diligence_results(company_id, investor_email, final_report)
            
            # Update status to completed
            self._update_diligence_status(company_id, investor_email, "completed", 100, final_report)
            
            logger.info(f"Diligence validation completed for company {company_id}")
            return final_report
            
        except Exception as e:
            logger.error(f"Error in diligence validation: {e}")
            self._update_diligence_status(company_id, investor_email, "failed", 0, error=str(e))
            raise
    
    async def _run_parallel_validations(self, company_id: str, company_data: Dict[str, Any]) -> Dict[str, Any]:
        """Run all validation agents in parallel"""
        
        # Create validation tasks
        tasks = [
            self._validate_founder_profile(company_id, company_data),
            self._validate_pitch_consistency(company_id, company_data),
            self._validate_memo1_accuracy(company_id, company_data)
        ]
        
        # Run validations in parallel
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        return {
            "founder_profile": results[0] if not isinstance(results[0], Exception) else {"error": str(results[0])},
            "pitch_consistency": results[1] if not isinstance(results[1], Exception) else {"error": str(results[1])},
            "memo1_accuracy": results[2] if not isinstance(results[2], Exception) else {"error": str(results[2])}
        }
    
    async def _validate_founder_profile(self, company_id: str, company_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate founder profile with detailed analysis"""
        try:
            founder_profile = company_data.get("founder_profile", {})
            memo1 = company_data.get("memo1", {})
            pitch_deck_text = company_data.get("pitch_deck_text", "")
            
            # Enhanced detailed prompt with strict JSON formatting
            prompt = f"""You are a senior due diligence analyst specializing in founder background verification.

**CRITICAL - RESPONSE FORMAT:**
Return ONLY a valid JSON object. No markdown, no code blocks, no explanations before or after.
Your response must start with {{ and end with }}.
Do not wrap in ```json``` or any other formatting.

**Required JSON Structure:**
{{
  "validation_status": "verified" | "inconsistent" | "unverified",
  "credibility_score": <number 0-100>,
  "verified_claims": ["claim1", "claim2"],
  "red_flags": ["flag1", "flag2"],
  "missing_information": ["gap1", "gap2"],
  "recommendation": "text",
  "detailed_analysis": "text"
}}

**Founder Profile Data:**
{json.dumps(convert_timestamps(founder_profile), indent=2)}

**Pitch Deck Claims:**
{pitch_deck_text[:3000]}

Analyze the founder profile for consistency with pitch deck claims and return ONLY the JSON object."""
            
            response = self.gemini_model.generate_content(prompt)
            return extract_json_from_response(response.text)
            
        except Exception as e:
            logger.error(f"Error in founder profile validation: {e}")
            return {"error": str(e)}
    
    async def _validate_pitch_consistency(self, company_id: str, company_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate internal pitch deck consistency"""
        try:
            pitch_deck_text = company_data.get("pitch_deck_text", "")
            memo1 = company_data.get("memo1", {})
            
            prompt = f"""You are an expert investment analyst checking for internal contradictions in a pitch deck.

**CRITICAL - RESPONSE FORMAT:**
Return ONLY a valid JSON object. No markdown, no code blocks, no extra text.
Start with {{ and end with }}.

**Required JSON Structure:**
{{
  "consistency_score": <number 0-100>,
  "internal_contradictions": ["contradiction1", "contradiction2"],
  "unrealistic_claims": ["claim1", "claim2"],
  "data_gaps": ["gap1", "gap2"],
  "risk_level": "low" | "medium" | "high",
  "detailed_analysis": "text"
}}

**Pitch Deck Content:**
{pitch_deck_text[:5000]}

**Memo1 Summary:**
{json.dumps(convert_timestamps(memo1), indent=2)}

Analyze for internal contradictions and return ONLY the JSON object."""
            
            response = self.gemini_model.generate_content(prompt)
            return extract_json_from_response(response.text)
            
        except Exception as e:
            logger.error(f"Error in pitch consistency validation: {e}")
            return {"error": str(e)}
    
    async def _validate_memo1_accuracy(self, company_id: str, company_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate Memo1 accuracy against all sources"""
        try:
            memo1 = company_data.get("memo1", {})
            pitch_deck_text = company_data.get("pitch_deck_text", "")
            founder_profile = company_data.get("founder_profile", {})
            
            prompt = f"""You are an expert investment analyst validating memo accuracy against source documents.

**CRITICAL - RESPONSE FORMAT:**
Return ONLY a valid JSON object. No markdown, no explanations.
Start with {{ and end with }}.

**Required JSON Structure:**
{{
  "accuracy_score": <number 0-100>,
  "verified_facts": ["fact1", "fact2"],
  "discrepancies": ["discrepancy1", "discrepancy2"],
  "exaggerations": ["exaggeration1", "exaggeration2"],
  "omissions": ["omission1", "omission2"],
  "risk_level": "low" | "medium" | "high",
  "detailed_analysis": "text"
}}

**Memo1 Summary:**
{json.dumps(convert_timestamps(memo1), indent=2)}

**Source Pitch Deck:**
{pitch_deck_text[:5000]}

Compare memo against source and return ONLY the JSON object."""
            
            response = self.gemini_model.generate_content(prompt)
            return extract_json_from_response(response.text)
            
        except Exception as e:
            logger.error(f"Error in memo1 accuracy validation: {e}")
            return {"error": str(e)}
    
    
    async def _synthesize_validation_results(self, validation_results: Dict[str, Any], company_data: Dict[str, Any]) -> Dict[str, Any]:
        """Synthesize all validation results into final report"""
        try:
            # Prepare synthesis context
            synthesis_context = self._prepare_synthesis_context(validation_results, company_data)
            
            prompt = f"""
            As a senior diligence expert, synthesize the validation results into a comprehensive diligence report.
            
            Validation Results:
            {json.dumps(convert_timestamps(validation_results), indent=2)}
            
            Company Data Context:
            {synthesis_context}
            
            Please create a comprehensive diligence report with:
            1. Executive summary
            2. Risk assessment (high/medium/low)
            3. Key findings categorized by type
            4. Recommendations
            5. Overall score (0-100)
            6. Priority actions for investor
            
            Return in JSON format:
            {{
                "executive_summary": "string",
                "risk_assessment": "high/medium/low",
                "key_findings": {{
                    "internal_contradictions": [list],
                    "external_discrepancies": [list],
                    "unsubstantiated_claims": [list],
                    "red_flags": [list]
                }},
                "recommendations": [list of recommendations],
                "overall_score": number,
                "priority_actions": [list of priority actions],
                "detailed_analysis": "string",
                "confidence_level": "high/medium/low"
            }}
            """
            
            response = self.gemini_model.generate_content(prompt)
            result = extract_json_from_response(response.text)
            
            # Add metadata
            result["company_id"] = company_data.get("company_id", "")
            result["validation_timestamp"] = datetime.now().isoformat()
            result["validation_results"] = validation_results
            
            # Add individual agent results for UI display
            result["agent_validations"] = {
                "founder_profile": validation_results.get("founder_profile", {}),
                "pitch_consistency": validation_results.get("pitch_consistency", {}),
                "memo1_accuracy": validation_results.get("memo1_accuracy", {})
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Error synthesizing validation results: {e}")
            return {
                "error": str(e),
                "company_id": company_data.get("company_id", ""),
                "validation_timestamp": datetime.now().isoformat()
            }
    
    def _prepare_synthesis_context(self, validation_results: Dict[str, Any], company_data: Dict[str, Any]) -> str:
        """Prepare context for synthesis"""
        context_parts = []
        
        # Add company basic info
        founder_profile = company_data.get("founder_profile", {})
        if founder_profile:
            context_parts.append(f"Founder: {founder_profile.get('fullName', 'Unknown')}")
            context_parts.append(f"Experience: {founder_profile.get('yearsOfExperience', 'Unknown')}")
            context_parts.append(f"Team Size: {founder_profile.get('teamSize', 'Unknown')}")
        
        # Add validation status
        for validation_type, result in validation_results.items():
            if result.get("status") == "completed":
                context_parts.append(f"{validation_type}: Completed successfully")
            else:
                context_parts.append(f"{validation_type}: Failed - {result.get('error', 'Unknown error')}")
        
        return "\n".join(context_parts)
    
    def _update_diligence_status(self, company_id: str, investor_email: str, status: str, 
                               progress: int, results: Optional[Dict[str, Any]] = None, 
                               error: Optional[str] = None):
        """Update diligence status in Firestore"""
        try:
            doc_ref = self.db.collection('diligenceReports').document(f"{company_id}_{investor_email}")
            
            update_data = {
                "status": status,
                "progress": progress,
                "last_updated": firestore.SERVER_TIMESTAMP
            }
            
            if results:
                update_data["results"] = results
            
            if error:
                update_data["error"] = error
            
            doc_ref.set(update_data, merge=True)
            
        except Exception as e:
            logger.error(f"Error updating diligence status: {e}")
    
    def _save_diligence_results(self, company_id: str, investor_email: str, results: Dict[str, Any]):
        """Save diligence results to Firestore and BigQuery"""
        try:
            # Save to Firestore
            doc_ref = self.db.collection('diligenceReports').document(f"{company_id}_{investor_email}")
            doc_ref.set({
                "company_id": company_id,
                "investor_email": investor_email,
                "status": "completed",
                "results": results,
                "created_at": firestore.SERVER_TIMESTAMP,
                "completed_at": firestore.SERVER_TIMESTAMP
            })
            
            # Save to BigQuery
            self._save_to_bigquery(company_id, investor_email, results)
            
        except Exception as e:
            logger.error(f"Error saving diligence results: {e}")
    
    def _save_to_bigquery(self, company_id: str, investor_email: str, results: Dict[str, Any]):
        """Save diligence results to BigQuery"""
        try:
            table_id = f"{self.project_id}.veritas_pitch_data.diligence_reports"
            table = self.bq_client.get_table(table_id)
            
            row = {
                "report_id": f"{company_id}_{investor_email}",
                "company_id": company_id,
                "investor_email": investor_email,
                "validation_results": json.dumps(convert_timestamps(results)),
                "processing_time_seconds": results.get("processing_time", 0.0),
                "contradictions_count": len(results.get("contradictions", [])),
                "discrepancies_count": len(results.get("discrepancies", [])),
                "overall_score": results.get("overall_score", 0.0),
                "status": "completed",
                "timestamp": datetime.now().isoformat()
            }
            
            errors = self.bq_client.insert_rows_json(table, [row])
            if errors:
                logger.error(f"BigQuery insert errors: {errors}")
            
        except Exception as e:
            logger.error(f"Error saving to BigQuery: {e}")
    
    async def query_diligence(self, company_id: str, question: str) -> Dict[str, Any]:
        """Answer custom questions about company diligence data"""
        try:
            # Get company data from Firestore
            company_data = self.vector_client.get_company_data(company_id)
            if not company_data:
                raise Exception(f"No data found for company {company_id}")
            
            memo1 = company_data.get("memo1", {})
            pitch_deck_text = company_data.get("pitch_deck_text", "")
            founder_profile = company_data.get("founder_profile", {})
            
            # Enhanced detailed prompt with strict JSON formatting
            prompt = f"""You are an expert investment analyst answering questions about company diligence data.

**CRITICAL - RESPONSE FORMAT:**
Return ONLY a valid JSON object. No markdown, no explanations.
Start with {{ and end with }}.

**Required JSON Structure:**
{{
  "answer": "detailed answer text",
  "confidence_level": "high" | "medium" | "low",
  "data_sources_used": ["source1", "source2"],
  "supporting_evidence": ["evidence1", "evidence2"],
  "caveats": ["caveat1", "caveat2"],
  "additional_insights": "text"
}}

**Available Data:**
- Pitch Deck: {pitch_deck_text[:3000]}
- Memo1: {json.dumps(convert_timestamps(memo1), indent=2)[:2000]}
- Founder Profile: {json.dumps(convert_timestamps(founder_profile), indent=2)[:1000]}

**Question:** {question}

Analyze and return ONLY the JSON object."""

            response = self.gemini_model.generate_content(prompt)
            result = extract_json_from_response(response.text)
            
            return {
                "answer": result.get("answer", "Unable to generate answer"),
                "confidence_level": result.get("confidence_level", "low"),
                "data_sources_used": result.get("data_sources_used", []),
                "supporting_evidence": result.get("supporting_evidence", []),
                "caveats": result.get("caveats", []),
                "additional_insights": result.get("additional_insights", "")
            }
            
        except Exception as e:
            logger.error(f"Error in query_diligence: {e}")
            return {"error": str(e), "answer": "Failed to process question"}

# Global instance
_diligence_agent = None

def get_diligence_agent() -> DiligenceAgentRAG:
    """Get or create diligence agent instance"""
    global _diligence_agent
    if _diligence_agent is None:
        _diligence_agent = DiligenceAgentRAG()
    return _diligence_agent
