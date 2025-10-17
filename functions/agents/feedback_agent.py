# agents/feedback_agent.py

from typing import Dict, List, Any, Optional
import json
import logging
from datetime import datetime

# Google Cloud imports
try:
    import vertexai
    from vertexai.generative_models import GenerativeModel
    from google.cloud import bigquery
    GOOGLE_AVAILABLE = True
except ImportError:
    GOOGLE_AVAILABLE = False
    
# Suppress noisy Google Cloud logging
logging.getLogger('google.api_core').setLevel(logging.WARNING)
logging.getLogger('google.auth').setLevel(logging.WARNING)


class FeedbackAgent:
    """
    Agent for AI-powered feedback and recommendations on pitch deck data.
    Uses Vertex AI Gemini with BigQuery integration for founder-specific insights.
    """

    def __init__(
        self,
        model: str = "gemini-2.5-flash",
        project: str = "veritas-472301",
        location: str = "asia-south1"
    ):
        """
        Initializes the feedback agent.
        
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
        self.bigquery_client = None

    def set_up(self):
        """Initializes all necessary Google Cloud clients and models."""
        self.logger.info(f"Setting up FeedbackAgent for project '{self.project}'...")
        if not GOOGLE_AVAILABLE:
            self.logger.error("Google Cloud libraries are not installed. Please run 'pip install google-cloud-aiplatform google-cloud-bigquery'.")
            raise ImportError("Required Google Cloud libraries are missing.")
        
        try:
            # Initialize Vertex AI
            vertexai.init(project=self.project, location=self.location)
            self.logger.info(f"Vertex AI initialized in project '{self.project}' and location '{self.location}'.")
            
            # Initialize Gemini Model
            self.gemini_model = GenerativeModel(self.model_name)
            self.logger.info(f"GenerativeModel ('{self.model_name}') initialized successfully.")
            
            # Initialize BigQuery Client
            self.bigquery_client = bigquery.Client(project=self.project)
            self.logger.info("BigQuery client initialized successfully.")

            self.logger.info("✅ FeedbackAgent setup complete.")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize agent's Google Cloud clients: {e}", exc_info=True)
            raise

    def get_recommendations(self, founder_email: str) -> Dict[str, Any]:
        """
        Get AI-powered recommendations for a founder's pitch deck data.
        
        Args:
            founder_email (str): The email of the founder to get recommendations for.
            
        Returns:
            Dict[str, Any]: A dictionary containing recommendations and analysis.
        """
        self.logger.info(f"Getting recommendations for founder: {founder_email}")
        
        try:
            # Query BigQuery for founder's data
            founder_data = self._query_founder_data(founder_email)
            
            if not founder_data:
                return {
                    "error": "No pitch deck data found for this founder. Please upload a pitch deck first.",
                    "recommendations": []
                }
            
            # Generate recommendations using Gemini
            recommendations = self._generate_recommendations(founder_data)
            
            return {
                "recommendations": recommendations,
                "data_points_analyzed": len(founder_data),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error getting recommendations: {e}", exc_info=True)
            return {
                "error": str(e),
                "recommendations": []
            }

    def answer_question(self, founder_email: str, question: str) -> Dict[str, Any]:
        """
        Answer a specific question about a founder's pitch deck data.
        
        Args:
            founder_email (str): The email of the founder.
            question (str): The question to answer.
            
        Returns:
            Dict[str, Any]: A dictionary containing the answer and analysis.
        """
        self.logger.info(f"Answering question for founder {founder_email}: {question}")
        
        try:
            # Query BigQuery for founder's data
            founder_data = self._query_founder_data(founder_email)
            
            if not founder_data:
                return {
                    "error": "No pitch deck data found for this founder. Please upload a pitch deck first.",
                    "answer": ""
                }
            
            # Generate answer using Gemini
            answer = self._generate_answer(founder_data, question)
            
            return {
                "answer": answer,
                "question": question,
                "data_points_analyzed": len(founder_data),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error answering question: {e}", exc_info=True)
            return {
                "error": str(e),
                "answer": ""
            }

    def _query_founder_data(self, founder_email: str) -> List[Dict[str, Any]]:
        """Query BigQuery for founder's pitch deck data."""
        try:
            query = f"""
            SELECT 
                upload_id,
                upload_timestamp,
                original_filename,
                memo_1,
                processing_time_seconds,
                status
            FROM `{self.project}.veritas_pitch_data.pitch_deck_data`
            WHERE founder_email = @founder_email
            ORDER BY upload_timestamp DESC
            LIMIT 5
            """
            
            job_config = bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("founder_email", "STRING", founder_email)
                ]
            )
            
            query_job = self.bigquery_client.query(query, job_config=job_config)
            results = query_job.result()
            
            founder_data = []
            for row in results:
                # Parse memo_1 JSON (handle both string and dict)
                if isinstance(row.memo_1, dict):
                    memo_1 = row.memo_1
                elif isinstance(row.memo_1, str):
                    memo_1 = json.loads(row.memo_1) if row.memo_1 else {}
                else:
                    memo_1 = {}
                
                founder_data.append({
                    "upload_id": row.upload_id,
                    "upload_timestamp": row.upload_timestamp.isoformat() if row.upload_timestamp else None,
                    "original_filename": row.original_filename,
                    "memo_1": memo_1,
                    "processing_time_seconds": row.processing_time_seconds,
                    "status": row.status
                })
            
            self.logger.info(f"Retrieved {len(founder_data)} data points for founder {founder_email}")
            return founder_data
            
        except Exception as e:
            self.logger.error(f"Error querying founder data: {e}")
            return []

    def _generate_recommendations(self, founder_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate recommendations using Gemini based on founder's data."""
        try:
            # Prepare data for analysis
            latest_data = founder_data[0] if founder_data else {}
            memo_1 = latest_data.get("memo_1", {})
            
            # Create context for Gemini
            context = f"""
            Analyze the following pitch deck data and provide specific, actionable recommendations for improvement:
            
            Company: {memo_1.get('title', 'Unknown')}
            Problem: {memo_1.get('problem', 'Not specified')}
            Solution: {memo_1.get('solution', 'Not specified')}
            Market Size: {memo_1.get('market_size', 'Not specified')}
            Business Model: {memo_1.get('business_model', 'Not specified')}
            Competition: {', '.join(memo_1.get('competition', []))}
            Team: {memo_1.get('team', 'Not specified')}
            Traction: {memo_1.get('traction', 'Not specified')}
            Funding Ask: {memo_1.get('funding_ask', 'Not specified')}
            Use of Funds: {memo_1.get('use_of_funds', 'Not specified')}
            
            Provide 3-5 specific, actionable recommendations to improve this pitch deck.
            Focus on areas like: problem-solution fit, market validation, competitive positioning, financial projections, team presentation, and investor appeal.
            """
            
            prompt = f"""
            You are an expert venture capital analyst with 15+ years of experience evaluating startups.
            {context}
            
            Provide your analysis in the following JSON format:
            {{
                "recommendations": [
                    {{
                        "category": "Problem/Solution",
                        "priority": "High/Medium/Low",
                        "title": "Specific recommendation title",
                        "description": "Detailed explanation of the recommendation",
                        "action_items": ["Specific action 1", "Specific action 2"]
                    }}
                ],
                "overall_score": 7.5,
                "strengths": ["Strength 1", "Strength 2"],
                "areas_for_improvement": ["Area 1", "Area 2"]
            }}
            
            Be specific, actionable, and focus on what will make this pitch more compelling to investors.
            
            IMPORTANT: You must respond with ONLY valid JSON in the exact format shown above. Do not include any additional text, explanations, or markdown formatting. Return only the JSON object.
            """
            
            response = self.gemini_model.generate_content(prompt)
            self.logger.info("Generated recommendations using Gemini")
            
            # Parse JSON response
            try:
                # Check if response.text is already a dict or needs parsing
                if isinstance(response.text, dict):
                    result = response.text
                else:
                    # Strip markdown code blocks if present
                    text = response.text.strip()
                    if text.startswith("```"):
                        # Remove ```json or ``` at start and ``` at end
                        text = text.split("```")[1]
                        if text.startswith("json"):
                            text = text[4:].strip()
                    
                    result = json.loads(text)
                
                self.logger.info(f"Successfully parsed recommendations: {len(result.get('recommendations', []))} items")
                return result.get("recommendations", [])
            except (json.JSONDecodeError, TypeError) as e:
                # Log the error and the raw response for debugging
                self.logger.error(f"JSON parsing failed: {e}")
                self.logger.error(f"Raw response (first 500 chars): {response.text[:500]}")
                # Fallback if JSON parsing fails
                return [{
                    "category": "General",
                    "priority": "Medium",
                    "title": "AI Analysis Complete",
                    "description": "AI analysis completed. Please review the detailed feedback above.",
                    "action_items": ["Review the analysis", "Implement suggested improvements"]
                }]
                
        except Exception as e:
            self.logger.error(f"Error generating recommendations: {e}")
            return [{
                "category": "Error",
                "priority": "High",
                "title": "Analysis Error",
                "description": f"Unable to generate recommendations: {str(e)}",
                "action_items": ["Please try again later"]
            }]

    def _generate_answer(self, founder_data: List[Dict[str, Any]], question: str) -> str:
        """Generate an answer to a specific question using Gemini."""
        try:
            # Prepare data for analysis
            latest_data = founder_data[0] if founder_data else {}
            memo_1 = latest_data.get("memo_1", {})
            
            # Create context for Gemini
            context = f"""
            Based on the following pitch deck data, answer the user's question: "{question}"
            
            Company: {memo_1.get('title', 'Unknown')}
            Problem: {memo_1.get('problem', 'Not specified')}
            Solution: {memo_1.get('solution', 'Not specified')}
            Market Size: {memo_1.get('market_size', 'Not specified')}
            Business Model: {memo_1.get('business_model', 'Not specified')}
            Competition: {', '.join(memo_1.get('competition', []))}
            Team: {memo_1.get('team', 'Not specified')}
            Traction: {memo_1.get('traction', 'Not specified')}
            Funding Ask: {memo_1.get('funding_ask', 'Not specified')}
            Use of Funds: {memo_1.get('use_of_funds', 'Not specified')}
            """
            
            prompt = f"""
            You are an expert venture capital analyst. {context}
            
            Provide a detailed, helpful answer to the user's question based on their pitch deck data.
            Be specific and reference the actual data from their pitch deck.
            If the question cannot be answered with the available data, explain what additional information would be needed.
            
            FORMAT YOUR RESPONSE PROFESSIONALLY:
            - Use **bold text** for key terms, metrics, and important concepts
            - Use bullet points (•) for lists of items
            - Use numbered lists (1., 2., 3.) for sequential steps or priorities
            - Start with a brief overview paragraph
            - Break down detailed points into clear sections
            - Use proper spacing between sections (double line breaks)
            - Keep each paragraph concise (2-4 sentences)
            
            Example format:
            **Overview:** Brief summary sentence.
            
            **Key Point 1:** Detailed explanation here.
            • Sub-point one
            • Sub-point two
            
            **Key Point 2:** Another detailed explanation.
            
            Keep your answer comprehensive but well-organized (3-4 paragraphs with formatting).
            """
            
            response = self.gemini_model.generate_content(prompt)
            self.logger.info("Generated answer using Gemini")
            
            return response.text
            
        except Exception as e:
            self.logger.error(f"Error generating answer: {e}")
            return f"I apologize, but I encountered an error while analyzing your question: {str(e)}. Please try again later."


def test_agent(founder_email: str, project_id: str):
    """
    Test function to run the feedback agent.
    
    Args:
        founder_email (str): The email of the founder to test with.
        project_id (str): Your Google Cloud project ID.
    """
    if not project_id:
        print("ERROR: Please provide a Google Cloud project ID.")
        return
        
    agent = FeedbackAgent(project=project_id)
    agent.set_up()
    
    try:
        # Test recommendations
        print("Testing recommendations...")
        recommendations = agent.get_recommendations(founder_email)
        print("\n--- Recommendations ---")
        print(json.dumps(recommendations, indent=2) if isinstance(recommendations, (list, dict)) else str(recommendations))
        
        # Test question answering
        print("\nTesting question answering...")
        answer = agent.answer_question(founder_email, "What are the main strengths of my pitch deck?")
        print("\n--- Answer ---")
        print(json.dumps(answer, indent=2) if isinstance(answer, (list, dict)) else str(answer))
        
    except Exception as e:
        print(f"An unexpected error occurred during the test run: {e}")


if __name__ == "__main__":
    # === HOW TO RUN THIS TEST ===
    # 1. Make sure you have authenticated with Google Cloud:
    #    gcloud auth application-default login
    # 2. Set your Project ID and founder email below.
    # 3. Run from your terminal: python feedback_agent.py
    
    # --- Configuration ---
    GCP_PROJECT_ID = "veritas-472301"
    TEST_FOUNDER_EMAIL = "founder@startup.com"  # <--- CHANGE THIS
    
    test_agent(founder_email=TEST_FOUNDER_EMAIL, project_id=GCP_PROJECT_ID)
