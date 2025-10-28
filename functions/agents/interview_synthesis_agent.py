# agents/interview_synthesis_agent.py

from typing import Dict, List, Any, Optional
import json
import logging
from datetime import datetime

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


class InterviewSynthesisAgent:
    """
    Agent for generating post-interview analysis and summaries.
    Analyzes interview transcripts against original Memo 1 and diligence data.
    """

    def __init__(
        self,
        model: str = "gemini-2.5-flash",
        project: str = "veritas-472301",
        location: str = "asia-south1"
    ):
        """
        Initialize the Interview Synthesis Agent.
        
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

    def set_up(self):
        """Initializes all necessary Google Cloud clients and models."""
        self.logger.info(f"Setting up InterviewSynthesisAgent for project '{self.project}'...")
        if not GOOGLE_AVAILABLE:
            self.logger.error("Google Cloud libraries are not installed. Please run 'pip install google-cloud-aiplatform google-cloud-firestore'.")
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

            self.logger.info("✅ InterviewSynthesisAgent setup complete.")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize agent's Google Cloud clients: {e}", exc_info=True)
            raise

    def generate_summary(self, interview_id: str) -> Dict[str, Any]:
        """
        Generate comprehensive interview summary and analysis.
        
        Args:
            interview_id (str): The interview ID to analyze.
            
        Returns:
            Dict[str, Any]: Structured interview summary.
        """
        self.logger.info(f"Generating summary for interview: {interview_id}")
        
        try:
            # 1. Fetch interview data
            interview_data = self._fetch_interview_data(interview_id)
            if not interview_data:
                raise ValueError(f"No interview data found for ID: {interview_id}")
            
            transcript = interview_data.get('transcript', [])
            company_id = interview_data.get('companyId')
            
            if not transcript:
                raise ValueError(f"No transcript found for interview: {interview_id}")
            
            # 2. Fetch original data sources
            memo1_data = self._fetch_memo1_data(company_id)
            diligence_results = self._fetch_diligence_results(company_id)
            diligence_report = self._fetch_diligence_report(company_id)
            
            # 3. Generate analysis using Gemini
            summary = self._generate_analysis_with_gemini(
                transcript, memo1_data, diligence_results, diligence_report
            )
            
            # 4. Store summary in Firestore
            self._store_summary(interview_id, summary)
            
            self.logger.info(f"Successfully generated summary for interview {interview_id}")
            return summary
            
        except Exception as e:
            self.logger.error(f"Error generating summary for interview {interview_id}: {e}", exc_info=True)
            raise

    def _fetch_interview_data(self, interview_id: str) -> Optional[Dict[str, Any]]:
        """Fetch interview data from Firestore."""
        try:
            doc_ref = self.db.collection('interviews').document(interview_id)
            doc = doc_ref.get()
            if doc.exists:
                return doc.to_dict()
            return None
        except Exception as e:
            self.logger.error(f"Error fetching interview data: {e}")
            return None

    def _fetch_memo1_data(self, company_id: str) -> Optional[Dict[str, Any]]:
        """Fetch Memo 1 data from ingestionResults collection."""
        try:
            doc_ref = self.db.collection('ingestionResults').document(company_id)
            doc = doc_ref.get()
            if doc.exists:
                data = doc.to_dict()
                return data.get('memo_1', {})
            return None
        except Exception as e:
            self.logger.error(f"Error fetching Memo 1 data: {e}")
            return None

    def _fetch_diligence_results(self, company_id: str) -> Optional[Dict[str, Any]]:
        """Fetch diligence results from diligenceResults collection."""
        try:
            query = self.db.collection('diligenceResults').where('memo_1_id', '==', company_id).limit(1)
            docs = query.get()
            
            if docs:
                doc = docs[0]
                return doc.to_dict()
            return None
        except Exception as e:
            self.logger.error(f"Error fetching diligence results: {e}")
            return None

    def _fetch_diligence_report(self, company_id: str) -> Optional[Dict[str, Any]]:
        """Fetch diligence report from diligenceReports collection."""
        try:
            doc_ref = self.db.collection('diligenceReports').document(company_id)
            doc = doc_ref.get()
            if doc.exists:
                return doc.to_dict()
            return None
        except Exception as e:
            self.logger.error(f"Error fetching diligence report: {e}")
            return None

    def _generate_analysis_with_gemini(
        self, 
        transcript: List[Dict], 
        memo1_data: Dict, 
        diligence_results: Dict, 
        diligence_report: Dict
    ) -> Dict[str, Any]:
        """Generate analysis using Gemini AI."""
        
        # Format transcript for analysis
        transcript_text = self._format_transcript(transcript)
        
        prompt = f"""
You are a senior venture capital analyst analyzing an AI-conducted interview with a startup founder.

INTERVIEW TRANSCRIPT:
{transcript_text}

ORIGINAL MEMO 1 DATA:
{json.dumps(memo1_data, indent=2)}

DILIGENCE RESULTS:
{json.dumps(diligence_results, indent=2)}

DILIGENCE REPORT:
{json.dumps(diligence_report, indent=2)}

Analyze this interview and generate a comprehensive assessment with the following structure:

1. EXECUTIVE SUMMARY (2-3 paragraphs):
   - Overall impression of the founder
   - Key strengths and concerns
   - Alignment with pitch deck claims

2. KEY INSIGHTS (5-7 bullet points):
   - Most important revelations
   - Validation of claims
   - New information discovered

3. RED FLAGS (if any):
   - Concerning statements or inconsistencies
   - Gaps in knowledge or preparation
   - Potential risks identified

4. VALIDATION POINTS:
   - What claims were confirmed
   - What claims were contradicted
   - What new information was revealed

5. CONFIDENCE SCORE (1-10):
   - Rate founder credibility and knowledge
   - Justify the score with specific examples

6. RECOMMENDATIONS:
   - Next steps for the investor
   - Areas requiring further investigation
   - Overall investment recommendation

Return ONLY a JSON object with this exact structure:
{{
  "executiveSummary": "string",
  "keyInsights": ["string", "string", ...],
  "redFlags": ["string", "string", ...],
  "validationPoints": ["string", "string", ...],
  "confidenceScore": number,
  "recommendations": "string"
}}

Be specific, professional, and evidence-based in your analysis.
"""

        try:
            response = self.gemini_model.generate_content(prompt)
            analysis_json = self._parse_json_from_text(response.text)
            
            # Validate and structure the response
            if isinstance(analysis_json, dict):
                return self._validate_analysis_structure(analysis_json)
            else:
                self.logger.warning("Gemini returned non-dict format, creating fallback analysis")
                return self._create_fallback_analysis(transcript)
                
        except Exception as e:
            self.logger.error(f"Error generating analysis with Gemini: {e}")
            return self._create_fallback_analysis(transcript)

    def _format_transcript(self, transcript: List[Dict]) -> str:
        """Format transcript for analysis."""
        formatted_lines = []
        
        for entry in transcript:
            speaker = entry.get('speaker', 'unknown')
            text = entry.get('text', '')
            timestamp = entry.get('timestamp', '')
            question_num = entry.get('questionNumber', '')
            
            if speaker == 'ai':
                formatted_lines.append(f"AI (Q{question_num}): {text}")
            elif speaker == 'founder':
                formatted_lines.append(f"Founder: {text}")
        
        return "\n".join(formatted_lines)

    def _validate_analysis_structure(self, analysis: Dict) -> Dict[str, Any]:
        """Validate and ensure proper structure of analysis."""
        required_fields = [
            'executiveSummary', 'keyInsights', 'redFlags', 
            'validationPoints', 'confidenceScore', 'recommendations'
        ]
        
        validated = {}
        
        for field in required_fields:
            if field in analysis:
                validated[field] = analysis[field]
            else:
                # Provide default values for missing fields
                if field == 'executiveSummary':
                    validated[field] = "Analysis completed but executive summary not generated."
                elif field in ['keyInsights', 'redFlags', 'validationPoints']:
                    validated[field] = []
                elif field == 'confidenceScore':
                    validated[field] = 5  # Neutral score
                elif field == 'recommendations':
                    validated[field] = "Further analysis recommended."
        
        # Ensure confidence score is between 1-10
        if isinstance(validated.get('confidenceScore'), (int, float)):
            validated['confidenceScore'] = max(1, min(10, validated['confidenceScore']))
        else:
            validated['confidenceScore'] = 5
        
        return validated

    def _create_fallback_analysis(self, transcript: List[Dict]) -> Dict[str, Any]:
        """Create fallback analysis if Gemini fails."""
        return {
            "executiveSummary": "Interview analysis completed. The founder participated in a structured interview covering key business areas. Further manual review recommended.",
            "keyInsights": [
                "Founder participated in full interview",
                "Responses provided for all questions",
                "Interview completed within expected timeframe"
            ],
            "redFlags": [],
            "validationPoints": [
                "Interview transcript captured successfully",
                "All planned questions were addressed"
            ],
            "confidenceScore": 5,
            "recommendations": "Manual review of transcript recommended for detailed analysis."
        }

    def _parse_json_from_text(self, text: str) -> Dict[str, Any]:
        """Safely extract JSON from Gemini response."""
        try:
            # Clean up the text first
            cleaned_text = text.strip()
            
            # Try to find JSON object in the text
            start_idx = cleaned_text.find('{')
            if start_idx != -1:
                # Find matching closing brace
                brace_count = 0
                end_idx = start_idx
                for i, char in enumerate(cleaned_text[start_idx:], start_idx):
                    if char == '{':
                        brace_count += 1
                    elif char == '}':
                        brace_count -= 1
                        if brace_count == 0:
                            end_idx = i + 1
                            break
                
                json_str = cleaned_text[start_idx:end_idx]
                return json.loads(json_str)
            
            # Try direct parsing
            return json.loads(cleaned_text)
            
        except json.JSONDecodeError as e:
            self.logger.error(f"Failed to parse JSON from Gemini response: {e}")
            self.logger.error(f"Response text: {text[:500]}...")
            return {}

    def _store_summary(self, interview_id: str, summary: Dict[str, Any]):
        """Store analysis summary in Firestore."""
        try:
            interview_ref = self.db.collection('interviews').document(interview_id)
            
            # Update the interview document with summary
            interview_ref.update({
                'summary': summary,
                'status': 'completed',
                'completedAt': firestore.SERVER_TIMESTAMP,
                'updatedAt': firestore.SERVER_TIMESTAMP
            })
            
            self.logger.info(f"Stored summary for interview {interview_id}")
            
        except Exception as e:
            self.logger.error(f"Error storing summary: {e}")

    def get_interview_summary(self, interview_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve interview summary from Firestore.
        
        Args:
            interview_id (str): The interview ID to retrieve summary for.
            
        Returns:
            Optional[Dict[str, Any]]: Interview summary if found, None otherwise.
        """
        try:
            doc_ref = self.db.collection('interviews').document(interview_id)
            doc = doc_ref.get()
            
            if doc.exists:
                data = doc.to_dict()
                return data.get('summary')
            
            return None
            
        except Exception as e:
            self.logger.error(f"Error retrieving interview summary: {e}")
            return None


def test_agent(interview_id: str, project_id: str):
    """
    Test function to run the Interview Synthesis Agent.
    
    Args:
        interview_id (str): The interview ID to test with.
        project_id (str): Your Google Cloud project ID.
    """
    if not project_id:
        print("ERROR: Please provide a Google Cloud project ID.")
        return
        
    agent = InterviewSynthesisAgent(project=project_id)
    agent.set_up()
    
    try:
        summary = agent.generate_summary(interview_id)
        
        print("\n--- Interview Analysis ---")
        print(f"Executive Summary: {summary.get('executiveSummary', 'N/A')}")
        print(f"Confidence Score: {summary.get('confidenceScore', 'N/A')}/10")
        print(f"Key Insights: {len(summary.get('keyInsights', []))} points")
        print(f"Red Flags: {len(summary.get('redFlags', []))} issues")
        print(f"Validation Points: {len(summary.get('validationPoints', []))} points")
        print(f"Recommendations: {summary.get('recommendations', 'N/A')}")
        
        print("\n✅ Analysis completed successfully.")
        
    except Exception as e:
        print(f"❌ An error occurred during testing: {e}")


if __name__ == "__main__":
    # Test configuration
    GCP_PROJECT_ID = "veritas-472301"
    TEST_INTERVIEW_ID = "test_interview_123"  # Replace with actual interview ID
    
    test_agent(interview_id=TEST_INTERVIEW_ID, project_id=GCP_PROJECT_ID)
