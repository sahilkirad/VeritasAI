# agents/qa_generation_agent.py

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


class QAGenerationAgent:
    """
    Agent for generating intelligent, contextual interview questions based on:
    - Memo 1 data (from ingestionResults)
    - Diligence results (from diligenceResults) 
    - Diligence reports (from diligenceReports)
    """

    def __init__(
        self,
        model: str = "gemini-2.5-flash",
        project: str = "veritas-472301",
        location: str = "asia-south1"
    ):
        """
        Initializes the QA Generation Agent.
        
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
        self.logger.info(f"Setting up QAGenerationAgent for project '{self.project}'...")
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

            self.logger.info("✅ QAGenerationAgent setup complete.")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize agent's Google Cloud clients: {e}", exc_info=True)
            raise

    def generate_questions(self, company_id: str) -> List[Dict[str, Any]]:
        """
        Generate intelligent interview questions based on Memo 1, diligenceResults, and diligenceReports.
        
        Args:
            company_id (str): The company ID to fetch data for.
            
        Returns:
            List[Dict[str, Any]]: List of structured interview questions.
        """
        self.logger.info(f"Generating questions for company: {company_id}")
        
        try:
            # 1. Fetch Memo 1 from ingestionResults
            memo1_data = self._fetch_memo1_data(company_id)
            if not memo1_data:
                raise ValueError(f"No Memo 1 data found for company: {company_id}")
            
            # 2. Fetch diligenceResults (where memo_1_id == company_id)
            diligence_results = self._fetch_diligence_results(company_id)
            
            # 3. Fetch diligenceReports/{company_id}
            diligence_report = self._fetch_diligence_report(company_id)
            
            # 4. Generate questions using Gemini
            questions = self._generate_questions_with_gemini(memo1_data, diligence_results, diligence_report)
            
            self.logger.info(f"Successfully generated {len(questions)} questions for company {company_id}")
            return questions
            
        except Exception as e:
            self.logger.error(f"Error generating questions for company {company_id}: {e}", exc_info=True)
            raise

    def generate_followup(self, previous_qa: List[Dict], current_answer: str, question_number: int) -> str:
        """
        Generate next question based on conversation context.
        
        Args:
            previous_qa (List[Dict]): Previous Q&A pairs
            current_answer (str): Current answer from founder
            question_number (int): Current question number
            
        Returns:
            str: Next question text
        """
        self.logger.info(f"Generating followup question #{question_number + 1}")
        
        try:
            # Create context from previous Q&A
            context = self._create_conversation_context(previous_qa, current_answer)
            
            # Generate followup using Gemini
            followup_question = self._generate_followup_with_gemini(context, question_number)
            
            self.logger.info(f"Generated followup question: {followup_question[:100]}...")
            return followup_question
            
        except Exception as e:
            self.logger.error(f"Error generating followup question: {e}", exc_info=True)
            # Return a generic followup if generation fails
            return "Can you elaborate on that point? I'd like to understand more about your approach."

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
            # Query by memo_1_id field
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

    def _generate_questions_with_gemini(self, memo1_data: Dict, diligence_results: Dict, diligence_report: Dict) -> List[Dict[str, Any]]:
        """Generate questions using Gemini AI."""
        
        prompt = f"""
You are a senior venture capital analyst conducting due diligence interviews.

Based on the following data, generate 8-10 interview questions that will help validate claims and assess the founder's depth of knowledge:

MEMO 1 DATA:
{json.dumps(memo1_data, indent=2)}

DILIGENCE RESULTS:
{json.dumps(diligence_results, indent=2)}

DILIGENCE REPORT:
{json.dumps(diligence_report, indent=2)}

Generate questions that:
1. Validate unverified claims from the pitch deck
2. Explore any red flags identified in diligence
3. Deep-dive into traction metrics and user acquisition
4. Assess founder's domain knowledge and expertise
5. Probe competitive positioning and differentiation
6. Validate business model and revenue streams
7. Understand team composition and capabilities
8. Explore market understanding and timing

Questions should be:
- Specific to this startup and their claims
- Open-ended to encourage detailed responses
- Professional and respectful
- Designed to reveal depth of knowledge
- Focused on validation and risk assessment

Return ONLY a JSON array of question objects with this structure:
[
  {{
    "questionNumber": 1,
    "question": "Your pitch mentions 50,000 active users. Can you walk me through your user acquisition strategy and the key channels that drove this growth?",
    "category": "traction_validation",
    "purpose": "Validate user growth claims and understand acquisition strategy"
  }},
  {{
    "questionNumber": 2,
    "question": "What specific partnerships with universities have you established, and what's the nature of these relationships?",
    "category": "partnership_validation", 
    "purpose": "Verify partnership claims and understand implementation"
  }}
]

Generate exactly 8-10 questions. Focus on the most important validation points and red flags.
"""

        try:
            response = self.gemini_model.generate_content(prompt)
            questions_json = self._parse_json_from_text(response.text)
            
            # Ensure we have a list of questions
            if isinstance(questions_json, list):
                return questions_json
            else:
                self.logger.warning("Gemini returned non-list format, creating fallback questions")
                return self._create_fallback_questions(memo1_data)
                
        except Exception as e:
            self.logger.error(f"Error generating questions with Gemini: {e}")
            return self._create_fallback_questions(memo1_data)

    def _generate_followup_with_gemini(self, context: str, question_number: int) -> str:
        """Generate followup question using Gemini."""
        
        prompt = f"""
You are conducting an interview with a startup founder. Based on the conversation so far:

CONTEXT:
{context}

Generate a followup question (question #{question_number + 1}) that:
1. Builds on their previous answer
2. Probes deeper into important points
3. Validates specific claims they made
4. Explores any inconsistencies or gaps
5. Assesses their domain expertise

The question should be:
- Natural and conversational
- Specific to what they just said
- Open-ended to encourage detailed response
- Professional

Return ONLY the question text, no additional formatting.
"""

        try:
            response = self.gemini_model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            self.logger.error(f"Error generating followup with Gemini: {e}")
            return "Can you tell me more about that? I'd like to understand your approach better."

    def _create_conversation_context(self, previous_qa: List[Dict], current_answer: str) -> str:
        """Create conversation context for followup generation."""
        context_parts = []
        
        for i, qa in enumerate(previous_qa, 1):
            context_parts.append(f"Q{i}: {qa.get('question', '')}")
            context_parts.append(f"A{i}: {qa.get('answer', '')}")
        
        context_parts.append(f"Current Answer: {current_answer}")
        
        return "\n".join(context_parts)

    def _create_fallback_questions(self, memo1_data: Dict) -> List[Dict[str, Any]]:
        """Create fallback questions if Gemini fails."""
        fallback_questions = [
            {
                "questionNumber": 1,
                "question": "Can you walk me through your user acquisition strategy and how you've grown to your current user base?",
                "category": "traction_validation",
                "purpose": "Understand user acquisition and growth strategy"
            },
            {
                "questionNumber": 2,
                "question": "What specific partnerships or collaborations have you established, and how do they contribute to your business?",
                "category": "partnership_validation",
                "purpose": "Verify partnership claims and understand business relationships"
            },
            {
                "questionNumber": 3,
                "question": "How do you differentiate your solution from competitors in the market?",
                "category": "competitive_analysis",
                "purpose": "Assess competitive positioning and differentiation"
            },
            {
                "questionNumber": 4,
                "question": "Can you explain your revenue model and how you plan to scale it?",
                "category": "business_model",
                "purpose": "Understand revenue model and scalability"
            },
            {
                "questionNumber": 5,
                "question": "What are the biggest challenges you've faced in building this product, and how have you overcome them?",
                "category": "execution_assessment",
                "purpose": "Evaluate problem-solving and execution capabilities"
            }
        ]
        
        return fallback_questions

    def _parse_json_from_text(self, text: str) -> Dict[str, Any]:
        """Safely extract JSON from Gemini response."""
        try:
            # Clean up the text first
            cleaned_text = text.strip()
            
            # Try to find JSON array in the text
            start_idx = cleaned_text.find('[')
            if start_idx != -1:
                # Find matching closing bracket
                bracket_count = 0
                end_idx = start_idx
                for i, char in enumerate(cleaned_text[start_idx:], start_idx):
                    if char == '[':
                        bracket_count += 1
                    elif char == ']':
                        bracket_count -= 1
                        if bracket_count == 0:
                            end_idx = i + 1
                            break
                
                json_str = cleaned_text[start_idx:end_idx]
                return json.loads(json_str)
            
            # Try direct parsing
            return json.loads(cleaned_text)
            
        except json.JSONDecodeError as e:
            self.logger.error(f"Failed to parse JSON from Gemini response: {e}")
            self.logger.error(f"Response text: {text[:500]}...")
            return []


def test_agent(company_id: str, project_id: str):
    """
    Test function to run the QA Generation Agent.
    
    Args:
        company_id (str): The company ID to test with.
        project_id (str): Your Google Cloud project ID.
    """
    if not project_id:
        print("ERROR: Please provide a Google Cloud project ID.")
        return
        
    agent = QAGenerationAgent(project=project_id)
    agent.set_up()
    
    try:
        questions = agent.generate_questions(company_id)
        
        print("\n--- Generated Questions ---")
        for q in questions:
            print(f"Q{q.get('questionNumber', '?')}: {q.get('question', '')}")
            print(f"Category: {q.get('category', 'N/A')}")
            print(f"Purpose: {q.get('purpose', 'N/A')}")
            print("-" * 50)
        
        print(f"\nGenerated {len(questions)} questions successfully.")
        
    except Exception as e:
        print(f"An error occurred during testing: {e}")


if __name__ == "__main__":
    # Test configuration
    GCP_PROJECT_ID = "veritas-472301"
    TEST_COMPANY_ID = "test_company_123"  # Replace with actual company ID
    
    test_agent(company_id=TEST_COMPANY_ID, project_id=GCP_PROJECT_ID)
