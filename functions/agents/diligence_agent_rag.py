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
from services.perplexity_service import PerplexitySearchService

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
        
        # Initialize PerplexitySearchService for market benchmarking
        self.perplexity_service = PerplexitySearchService(project=project_id, location=region)
        logger.info("Initialized DiligenceAgentRAG with Firestore + Gemini + Perplexity")
    
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
            
            # Run parallel validation agents (25-70%)
            self._update_diligence_status(company_id, investor_email, "processing", 30)
            validation_results = await self._run_parallel_validations(company_id, company_data)
            self._update_diligence_status(company_id, investor_email, "processing", 70)
            
            # Synthesize results (70-90%)
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
            self._validate_memo1_accuracy(company_id, company_data),
            self._validate_market_benchmarking(company_id, company_data)  # NEW
        ]
        
        # Run validations in parallel
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        return {
            "founder_profile": results[0] if not isinstance(results[0], Exception) else {"error": str(results[0])},
            "pitch_consistency": results[1] if not isinstance(results[1], Exception) else {"error": str(results[1])},
            "memo1_accuracy": results[2] if not isinstance(results[2], Exception) else {"error": str(results[2])},
            "market_benchmarking": results[3] if not isinstance(results[3], Exception) else {"error": str(results[3])}  # NEW
        }
    
    async def _validate_founder_profile(self, company_id: str, company_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate founder profile with detailed analysis"""
        try:
            founder_profile = company_data.get("founder_profile", {})
            memo1 = company_data.get("memo1", {})
            pitch_deck_text = company_data.get("pitch_deck_text", "")
            
            # Log what data we have for debugging
            logger.info(f"Founder profile data: {json.dumps(founder_profile, indent=2)}")
            logger.info(f"Memo1 data keys: {list(memo1.keys()) if memo1 else 'empty'}")
            logger.info(f"Pitch deck text length: {len(pitch_deck_text)}")
            
            # If founder profile is empty, try to extract from memo1
            if not founder_profile or len(founder_profile) == 0:
                logger.warning("Founder profile is empty, attempting to extract from memo1")
                founder_profile = self._extract_founder_from_memo1(memo1)
            
            # Enhance founder profile with LinkedIn data if URL is provided
            linkedin_url = founder_profile.get("linkedinUrl", "")
            if linkedin_url and linkedin_url.startswith("https://linkedin.com"):
                enhanced_profile = await self._scrape_linkedin_profile(linkedin_url, founder_profile)
                if enhanced_profile:
                    founder_profile = {**founder_profile, **enhanced_profile}
            
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

**Memo1 Data (for additional context):**
{json.dumps(convert_timestamps(memo1), indent=2)[:2000]}

**IMPORTANT INSTRUCTIONS:**
- If founder profile data is limited, extract what you can from the pitch deck and memo1 data
- Use the team information from memo1 to assess founder credibility
- If founder name is available, use that for basic verification
- Always provide a credibility score (0-100) based on available information
- If data is very limited, set credibility_score to 30-50 and note missing information in detailed_analysis

Analyze the available founder information and return ONLY the JSON object."""
            
            response = self.gemini_model.generate_content(prompt)
            raw = extract_json_from_response(response.text)

            # Normalize numeric fields and required keys
            def to_number(value, default=0, min_val=0, max_val=100):
                try:
                    n = float(value)
                except Exception:
                    return default
                if n < min_val: n = min_val
                if n > max_val: n = max_val
                return int(n)

            # Derive a credibility score from available founder profile data if model omitted/returned 0
            def derive_credibility_from_profile(profile: Dict[str, Any]) -> int:
                if not isinstance(profile, dict) or not profile:
                    return 0
                score = 0
                max_score = 100
                # Attribute weights (sum to 100)
                weights = {
                    "fullName": 10,
                    "linkedinUrl": 20,
                    "yearsOfExperience": 15,
                    "previousCompanies": 15,
                    "education": 15,
                    "expertise": 15,
                    "professionalBackground": 10
                }
                # Presence-based scoring
                if profile.get("fullName"): score += weights["fullName"]
                if profile.get("linkedinUrl"): score += weights["linkedinUrl"]
                try:
                    yoe = float(profile.get("yearsOfExperience", 0) or 0)
                    if yoe >= 8:
                        score += weights["yearsOfExperience"]
                    elif yoe >= 3:
                        score += int(weights["yearsOfExperience"] * 0.6)
                    elif yoe > 0:
                        score += int(weights["yearsOfExperience"] * 0.3)
                except Exception:
                    pass
                if isinstance(profile.get("previousCompanies"), list) and len(profile.get("previousCompanies")) > 0:
                    cnt = len(profile.get("previousCompanies"))
                    score += min(weights["previousCompanies"], 5 * cnt)
                if isinstance(profile.get("education"), list) and len(profile.get("education")) > 0:
                    score += weights["education"]
                if isinstance(profile.get("expertise"), list) and len(profile.get("expertise")) > 0:
                    cnt = len(profile.get("expertise"))
                    score += min(weights["expertise"], 3 * cnt)
                if profile.get("professionalBackground"):
                    score += weights["professionalBackground"]
                # Clamp 0..100
                if score < 0: score = 0
                if score > max_score: score = max_score
                return int(score)

            credibility_score = to_number(raw.get("credibility_score"), 0, 0, 100)
            if credibility_score == 0:
                # Attempt heuristic derivation from available profile data
                credibility_score = derive_credibility_from_profile(founder_profile)

            normalized = {
                "validation_status": raw.get("validation_status") or "unverified",
                "credibility_score": credibility_score,
                "verified_claims": raw.get("verified_claims") or [],
                "red_flags": raw.get("red_flags") or [],
                "missing_information": raw.get("missing_information") or [],
                "recommendation": raw.get("recommendation") or "",
                "detailed_analysis": raw.get("detailed_analysis") or "",
            }
            return normalized
            
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
            raw = extract_json_from_response(response.text)

            def to_number(value, default=0, min_val=0, max_val=100):
                try:
                    n = float(value)
                except Exception:
                    return default
                if n < min_val: n = min_val
                if n > max_val: n = max_val
                return int(n)

            normalized = {
                "consistency_score": to_number(raw.get("consistency_score"), 0, 0, 100),
                "internal_contradictions": raw.get("internal_contradictions") or [],
                "unrealistic_claims": raw.get("unrealistic_claims") or [],
                "data_gaps": raw.get("data_gaps") or [],
                "risk_level": raw.get("risk_level") or "medium",
                "detailed_analysis": raw.get("detailed_analysis") or "",
            }
            return normalized
            
        except Exception as e:
            logger.error(f"Error in pitch consistency validation: {e}")
            return {"error": str(e)}
    
    async def _validate_memo1_accuracy(self, company_id: str, company_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate Memo1 accuracy against all sources"""
        try:
            memo1 = company_data.get("memo1", {})
            pitch_deck_text = company_data.get("pitch_deck_text", "")
            founder_profile = company_data.get("founder_profile", {})
            
            # Log what data we have for debugging
            logger.info(f"Memo1 accuracy validation for {company_id}:")
            logger.info(f"  - Memo1 keys: {list(memo1.keys()) if memo1 else 'empty'}")
            logger.info(f"  - Pitch deck text length: {len(pitch_deck_text)}")
            
            # If pitch deck text is empty but memo1 has content, use memo1 as source
            if not pitch_deck_text and memo1:
                logger.warning("No pitch deck text available, using memo1 content as source")
                pitch_deck_text = json.dumps(memo1, indent=2)
            
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

**IMPORTANT INSTRUCTIONS:**
- If the source pitch deck is the same as memo1 content, focus on internal consistency and completeness
- Look for any missing information, exaggerated claims, or unrealistic projections within the memo itself
- Even without external source, assess the memo's internal logic and flag any inconsistencies
- Provide a reasonable accuracy score (30-70) based on memo completeness and internal consistency

Compare memo against source and return ONLY the JSON object."""
            
            response = self.gemini_model.generate_content(prompt)
            raw = extract_json_from_response(response.text)

            def to_number(value, default=0, min_val=0, max_val=100):
                try:
                    n = float(value)
                except Exception:
                    return default
                if n < min_val: n = min_val
                if n > max_val: n = max_val
                return int(n)

            normalized = {
                "accuracy_score": to_number(raw.get("accuracy_score"), 0, 0, 100),
                "verified_facts": raw.get("verified_facts") or [],
                "discrepancies": raw.get("discrepancies") or [],
                "exaggerations": raw.get("exaggerations") or [],
                "omissions": raw.get("omissions") or [],
                "risk_level": raw.get("risk_level") or "medium",
                "detailed_analysis": raw.get("detailed_analysis") or "",
            }
            return normalized
            
        except Exception as e:
            logger.error(f"Error in memo1 accuracy validation: {e}")
            return {"error": str(e)}
    
    async def _validate_market_benchmarking(self, company_id: str, company_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fetch and structure market benchmarking data"""
        try:
            memo1 = company_data.get("memo1", {})
            
            # Fetch market benchmarking using Perplexity (now async)
            market_data = await self._fetch_market_benchmarking(memo1)
            
            # Ensure target company is first
            market_data = self._ensure_target_company_first(market_data, memo1)
            
            return {
                "status": "completed",
                "data": market_data
            }
        except Exception as e:
            logger.error(f"Error in market benchmarking: {e}")
            return {"error": str(e), "status": "failed"}
    
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

            # Ensure numeric fields exist and compute overall score
            def get_int(d: Dict[str, Any], key: str) -> int:
                try:
                    return int(float(d.get(key, 0)))
                except Exception:
                    return 0

            fp = validation_results.get("founder_profile", {})
            pc = validation_results.get("pitch_consistency", {})
            ma = validation_results.get("memo1_accuracy", {})

            fp_score = get_int(fp, "credibility_score")
            pc_score = get_int(pc, "consistency_score")
            ma_score = get_int(ma, "accuracy_score")

            score_components = [s for s in [fp_score, pc_score, ma_score] if isinstance(s, int)]
            if score_components:
                result["overall_score"] = int(sum(score_components) / len(score_components))
            else:
                result.setdefault("overall_score", 0)
            
            # Add metadata
            result["company_id"] = company_data.get("company_id", "")
            result["validation_timestamp"] = datetime.now().isoformat()
            result["validation_results"] = validation_results
            
            # Add market benchmarking to results
            result["market_benchmarking"] = validation_results.get("market_benchmarking", {}).get("data", {})
            
            # Add individual agent results for UI display
            result["agent_validations"] = {
                "founder_profile": {
                    **fp,
                    "credibility_score": fp_score
                },
                "pitch_consistency": {
                    **pc,
                    "consistency_score": pc_score
                },
                "memo1_accuracy": {
                    **ma,
                    "accuracy_score": ma_score
                }
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
    
    async def _scrape_linkedin_profile(self, linkedin_url: str, existing_profile: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Scrape LinkedIn profile data using AI to extract structured information"""
        try:
            # Use Gemini to analyze LinkedIn profile and extract structured data
            prompt = f"""Analyze this LinkedIn profile URL and extract structured founder information.
            
LinkedIn URL: {linkedin_url}
Existing Profile Data: {json.dumps(existing_profile, indent=2)}

Extract and return ONLY a JSON object with these fields:
{{
    "fullName": "extracted full name",
    "professionalBackground": "brief professional summary",
    "yearsOfExperience": "estimated years (number)",
    "education": [
        {{"school": "university name", "degree": "degree type", "year": "graduation year"}}
    ],
    "previousCompanies": [
        {{"company": "company name", "role": "job title", "duration": "time period"}}
    ],
    "expertise": ["skill1", "skill2", "skill3"],
    "linkedinConnections": "connection count if visible",
    "profileCompleteness": "estimated percentage (0-100)"
}}

Note: If specific data is not available, use reasonable defaults or leave empty.
Focus on extracting verifiable professional information that would be useful for due diligence."""

            response = self.gemini_model.generate_content(prompt)
            scraped_data = extract_json_from_response(response.text)
            
            # Merge with existing profile, preferring scraped data
            enhanced_profile = {
                "fullName": scraped_data.get("fullName") or existing_profile.get("fullName", ""),
                "professionalBackground": scraped_data.get("professionalBackground") or existing_profile.get("professionalBackground", ""),
                "yearsOfExperience": scraped_data.get("yearsOfExperience") or existing_profile.get("yearsOfExperience", ""),
                "education": scraped_data.get("education", []) or existing_profile.get("education", []),
                "previousCompanies": scraped_data.get("previousCompanies", []) or existing_profile.get("previousCompanies", []),
                "expertise": scraped_data.get("expertise", []) or existing_profile.get("expertise", []),
                "linkedinConnections": scraped_data.get("linkedinConnections", ""),
                "profileCompleteness": scraped_data.get("profileCompleteness", 0),
                "linkedinScraped": True,
                "linkedinUrl": linkedin_url
            }
            
            logger.info(f"LinkedIn profile scraped for {linkedin_url}: {len(enhanced_profile)} fields extracted")
            return enhanced_profile
            
        except Exception as e:
            logger.warning(f"LinkedIn scraping failed for {linkedin_url}: {e}")
            return None
    
    def _extract_founder_from_memo1(self, memo1: Dict[str, Any]) -> Dict[str, Any]:
        """Extract founder information from memo1 data when founder profile is empty"""
        try:
            founder_data = {}
            
            # Extract founder name
            founder_name = memo1.get("founder_name", "")
            if founder_name:
                founder_data["fullName"] = founder_name
            
            # Extract team information
            team_info = memo1.get("team", "")
            if team_info:
                founder_data["professionalBackground"] = team_info
            
            # Extract LinkedIn URL if available
            linkedin_url = memo1.get("founder_linkedin_url", "")
            if linkedin_url and isinstance(linkedin_url, list) and len(linkedin_url) > 0:
                founder_data["linkedinUrl"] = linkedin_url[0]
            elif linkedin_url and isinstance(linkedin_url, str):
                founder_data["linkedinUrl"] = linkedin_url
            
            # Extract company information
            company_name = memo1.get("title", "")
            if company_name:
                founder_data["companyName"] = company_name
            
            # Set default values for missing fields
            founder_data.setdefault("yearsOfExperience", "Unknown")
            founder_data.setdefault("education", [])
            founder_data.setdefault("previousCompanies", [])
            founder_data.setdefault("expertise", [])
            founder_data.setdefault("teamSize", "Unknown")
            
            logger.info(f"Extracted founder data from memo1: {json.dumps(founder_data, indent=2)}")
            return founder_data
            
        except Exception as e:
            logger.error(f"Error extracting founder data from memo1: {e}")
            return {}

    async def _fetch_market_benchmarking(self, memo1_data: dict) -> Dict[str, Any]:
        """Fetches market benchmarking data using Perplexity API."""
        logger.info("Fetching market benchmarking data using Perplexity API...")
        
        try:
            # Extract company context from memo1_data
            company_name = memo1_data.get("title", "the company")
            industry = memo1_data.get("industry_category", memo1_data.get("industry", ""))
            
            # Handle industry if it's a list
            if isinstance(industry, list):
                industry = ", ".join(industry)
            
            company_context = f"{company_name}"
            if industry:
                company_context += f" in {industry}"
            
            # Create comprehensive market benchmarking query with target company focus
            target_company = memo1_data.get("title", company_name)
            query = f"""
            As a Senior Market Research Analyst, provide comprehensive market benchmarking analysis for {company_context}.
            
            **TARGET COMPANY:** {target_company}
            
            Please provide:
            
            1. Industry Averages (with specific metric labels for {industry}):
            - Identify 3 key industry performance metrics with their labels (e.g., "Avg. Transaction Failure Rate" for payments, "Churn Rate" for SaaS)
            - Provide average values for each metric
            - Include total addressable market size with proper label
            - Market growth rate (CAGR) and projected size
            
            2. Competitive Landscape Analysis:
            - List exactly 3-4 main competitors in the industry
            - For each competitor, provide: company name, metric1 value, metric2 value, fees/pricing, AI-powered features (Yes/No/Partial)
            - Include {target_company} in the comparison with their actual or estimated metrics
            - Market positioning and competitive advantages
            
            3. Market Opportunity Assessment:
            - Provide a comprehensive paragraph describing market opportunity, growth projections, and competitive advantages
            - Include specific CAGR, market size projections, and target market share potential
            - Highlight differentiation opportunities and market gaps
            
            **IMPORTANT:** 
            - Focus on recent data (2024-2025) with specific numbers, percentages, and market values
            - Ensure {target_company} is included in the competitive analysis
            - Provide industry-specific metric labels (not generic terms)
            - Include proper citations and sources for all information
            """
            
            # Use PerplexitySearchService to fetch data
            if self.perplexity_service and self.perplexity_service.enabled:
                results = await self.perplexity_service._perplexity_search(query, max_results=1)
                
                if results and results[0].get("content"):
                    content = results[0]["content"]
                    citations = results[0].get("citations", [])
                    
                    # Process the content to extract structured data
                    market_data = self._process_market_benchmarking_content(content, company_context)
                    
                    # Ensure target company is first in competitive landscape
                    market_data = self._ensure_target_company_first(market_data, memo1_data)
                    
                    market_data["sources"] = citations
                    market_data["data_source"] = "Perplexity API"
                    market_data["status"] = "VERIFIED_LIVE_DATA"
                    
                    logger.info("Successfully fetched market benchmarking data from Perplexity API")
                    return market_data
                else:
                    logger.warning("No market benchmarking data returned from Perplexity API")
                    return self._get_default_market_benchmarking()
            else:
                logger.warning("PerplexitySearchService not available, using default market benchmarking")
                return self._get_default_market_benchmarking()
                
        except Exception as e:
            logger.warning(f"Could not fetch market benchmarking data: {e}")
            return self._get_default_market_benchmarking()

    def _process_market_benchmarking_content(self, content: str, company_context: str) -> Dict[str, Any]:
        """Process Perplexity content to extract structured market benchmarking data."""
        try:
            # Extract target company name from company_context
            target_company = company_context.split(" in ")[0] if " in " in company_context else company_context
            
            # Use Gemini to extract structured data from Perplexity content
            prompt = f"""Extract structured market benchmarking data from the following content about {company_context}.

**CRITICAL - RESPONSE FORMAT:**
Return ONLY a valid JSON object. No markdown, no code blocks, no explanations.
Start with {{ and end with }}.

**Required JSON Structure:**
{{
    "industry_averages": {{
        "metrics": [
            {{"label": "<dynamic metric label>", "value": "<value with context>"}},
            {{"label": "<dynamic metric label>", "value": "<value with context>"}},
            {{"label": "<dynamic metric label>", "value": "<value with context>"}}
        ]
    }},
    "competitive_landscape": [
        {{
            "company_name": "{target_company}",
            "is_target": true,
            "metric1_value": "<value>",
            "metric2_value": "<value>",
            "fees": "<value>",
            "ai_powered": "<Yes/No/Partial>",
            "notes": "<brief competitive notes under 100 chars>"
        }},
        {{
            "company_name": "<competitor name>",
            "is_target": false,
            "metric1_value": "<value>",
            "metric2_value": "<value>",
            "fees": "<value>",
            "ai_powered": "<Yes/No/Partial>",
            "notes": "<brief competitive notes under 100 chars>"
        }}
    ],
    "metric_labels": {{
        "metric1": "<dynamic label for first metric>",
        "metric2": "<dynamic label for second metric>"
    }},
    "market_opportunity": {{
        "description": "<full paragraph describing market opportunity, growth projections, and competitive advantages>"
    }}
}}

**IMPORTANT INSTRUCTIONS:**
1. Ensure {target_company} appears FIRST in competitive_landscape array with is_target: true
2. Extract industry-specific metric labels (e.g., "Avg. Transaction Failure Rate" for payments, "Churn Rate" for SaaS)
3. Include 3-4 competitors total (target + 2-3 others)
4. Provide full paragraph for market_opportunity.description
5. Use dynamic labels based on the industry type mentioned in content

**Content to analyze:**
{content[:4000]}

Extract the data and return ONLY the JSON object."""
            
            response = self.gemini_model.generate_content(prompt)
            result = self._parse_json_from_text(response.text)
            
            if result and isinstance(result, dict):
                return result
            else:
                return self._get_default_market_benchmarking()
                
        except Exception as e:
            logger.error(f"Error processing market benchmarking content: {e}")
            return self._get_default_market_benchmarking()

    def _get_default_market_benchmarking(self) -> Dict[str, Any]:
        """Return default market benchmarking data when external data is unavailable."""
        return {
            "industry_averages": {
                "metrics": [
                    {"label": "Avg. Transaction Failure Rate", "value": "8-12% (Industry standard)"},
                    {"label": "Industry Processing Fees", "value": "2.5-3.5% (Industry average)"},
                    {"label": "Market Size", "value": "Market size not available"}
                ]
            },
            "competitive_landscape": [
                {
                    "company_name": "Target Company",
                    "is_target": True,
                    "metric1_value": "Data not available",
                    "metric2_value": "Data not available",
                    "fees": "Data not available",
                    "ai_powered": "Unknown",
                    "notes": "Target company - data from memo analysis"
                },
                {
                    "company_name": "Industry Leader",
                    "is_target": False,
                    "metric1_value": "5-8%",
                    "metric2_value": "2.0-2.5%",
                    "fees": "2.0-2.5%",
                    "ai_powered": "Yes",
                    "notes": "Market leader with AI capabilities"
                }
            ],
            "metric_labels": {
                "metric1": "Failure Rate",
                "metric2": "Processing Fees"
            },
            "market_opportunity": {
                "description": "Market opportunity analysis not available. Industry shows growth potential with AI-powered solutions representing competitive advantages. Target market share of 5-10% achievable with proper execution."
            },
            "data_source": "Default Template",
            "status": "DEFAULT_DATA"
        }

    def _ensure_target_company_first(self, market_data: Dict[str, Any], memo1_data: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure target company appears first in competitive_landscape array."""
        try:
            target_company = memo1_data.get("title", "Target Company")
            competitive_landscape = market_data.get("competitive_landscape", [])
            
            # Find target company in the list
            target_found = False
            target_entry = None
            
            for i, company in enumerate(competitive_landscape):
                if company.get("company_name", "").lower() == target_company.lower():
                    target_found = True
                    target_entry = competitive_landscape.pop(i)
                    target_entry["is_target"] = True
                    break
            
            # If target company not found, create entry from memo1 data
            if not target_found:
                target_entry = {
                    "company_name": target_company,
                    "is_target": True,
                    "metric1_value": "Data not available",
                    "metric2_value": "Data not available", 
                    "fees": "Data not available",
                    "ai_powered": "Unknown",
                    "notes": "Target company - data from memo analysis"
                }
            
            # Ensure target company is first
            if target_entry:
                competitive_landscape.insert(0, target_entry)
            
            # Update the market data
            market_data["competitive_landscape"] = competitive_landscape
            
            logger.info(f"Ensured {target_company} is first in competitive landscape")
            return market_data
            
        except Exception as e:
            logger.error(f"Error ensuring target company first: {e}")
            return market_data

    def _parse_json_from_text(self, text: str) -> Dict[str, Any]:
        """Safely extracts a JSON object from a string, even with markdown wrappers."""
        try:
            # Try direct JSON parsing first
            return json.loads(text)
        except json.JSONDecodeError:
            pass
        
        # Try to extract JSON from markdown code blocks
        import re
        
        # Pattern to match ```json ... ``` blocks
        json_pattern = r'```(?:json)?\s*(\{.*?\})\s*```'
        match = re.search(json_pattern, text, re.DOTALL)
        
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass
        
        # Try to find JSON object boundaries
        json_pattern = r'\{.*\}'
        match = re.search(json_pattern, text, re.DOTALL)
        
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                pass
        
        # Log the actual response for debugging
        logger.error(f"Failed to extract JSON from Gemini response. Response: {text[:500]}...")
        return None

# Global instance
_diligence_agent = None

def get_diligence_agent() -> DiligenceAgentRAG:
    """Get or create diligence agent instance"""
    global _diligence_agent
    if _diligence_agent is None:
        _diligence_agent = DiligenceAgentRAG()
    return _diligence_agent
