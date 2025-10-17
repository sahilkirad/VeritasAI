"""
QAGenerationAgent - Layer 2 AI Interview System
Purpose: Generate AI follow-up questions based on memo and missing data.
API: Gemini 1.5 Pro
Logic: Detects knowledge gaps and asks prioritized questions.
Output: {"question": "What's your CAC and LTV ratio?", "priority": "high"}
"""

import os
import json
import time
from typing import Dict, List, Optional
import logging

import vertexai
from vertexai.generative_models import GenerativeModel
from firebase_admin import firestore

class QAGenerationAgent:
    """Agent responsible for generating intelligent follow-up questions."""
    
    def __init__(
        self,
        project: str = "veritas-472301",
        location: str = "asia-south1",
        model: str = "gemini-1.5-pro"
    ):
        self.project = project
        self.location = location
        self.model_name = model
        self.model = None
        self.db = None
        
        # Setup logging
        self.logger = logging.getLogger(__name__)
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter('%(levelname)s:%(name)s:%(message)s')
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
            self.logger.setLevel(logging.INFO)
    
    def set_up(self):
        """Initialize Vertex AI model and Firestore client."""
        try:
            # Initialize Vertex AI
            vertexai.init(project=self.project, location=self.location)
            
            # Initialize Gemini model
            self.model = GenerativeModel(self.model_name)
            
            # Initialize Firestore
            self.db = firestore.client()
            
            self.logger.info("QAGenerationAgent initialized successfully")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize QAGenerationAgent: {e}")
            raise
    
    def generate_questions(
        self, 
        memo_data: Dict, 
        transcript_data: List[Dict],
        missing_fields: List[str] = None
    ) -> Dict:
        """
        Generate intelligent follow-up questions based on memo and transcript.
        
        Args:
            memo_data: Memo 1 data with startup information
            transcript_data: Current meeting transcript
            missing_fields: List of missing fields from memo analysis
        
        Returns:
            Dict with generated questions and their priorities
        """
        if not self.model:
            self.set_up()
        
        try:
            # Analyze current conversation context
            context_analysis = self._analyze_conversation_context(memo_data, transcript_data)
            
            # Generate questions based on gaps
            questions = self._generate_contextual_questions(
                memo_data, 
                context_analysis, 
                missing_fields or []
            )
            
            # Prioritize questions
            prioritized_questions = self._prioritize_questions(questions, memo_data)
            
            # Store questions in Firestore
            session_id = f"qa_session_{int(time.time())}"
            self._store_questions(session_id, prioritized_questions)
            
            self.logger.info(f"Generated {len(prioritized_questions)} questions")
            
            return {
                "status": "success",
                "session_id": session_id,
                "questions": prioritized_questions,
                "context_analysis": context_analysis
            }
            
        except Exception as e:
            self.logger.error(f"Failed to generate questions: {e}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    def _analyze_conversation_context(self, memo_data: Dict, transcript_data: List[Dict]) -> Dict:
        """Analyze the current conversation to understand what's been discussed."""
        
        # Extract key topics from transcript
        discussed_topics = []
        for segment in transcript_data:
            if segment.get('is_final', False):
                text = segment.get('text', '').lower()
                
                # Identify key business topics
                if any(keyword in text for keyword in ['revenue', 'sales', 'income', 'mrr', 'arr']):
                    discussed_topics.append('revenue')
                if any(keyword in text for keyword in ['customer', 'client', 'user', 'acquisition']):
                    discussed_topics.append('customers')
                if any(keyword in text for keyword in ['market', 'tam', 'sam', 'som']):
                    discussed_topics.append('market')
                if any(keyword in text for keyword in ['competitor', 'competition', 'rival']):
                    discussed_topics.append('competition')
                if any(keyword in text for keyword in ['team', 'founder', 'employee', 'hiring']):
                    discussed_topics.append('team')
                if any(keyword in text for keyword in ['technology', 'tech', 'product', 'development']):
                    discussed_topics.append('technology')
        
        return {
            "discussed_topics": list(set(discussed_topics)),
            "transcript_length": len(transcript_data),
            "final_segments": len([s for s in transcript_data if s.get('is_final', False)])
        }
    
    def _generate_contextual_questions(
        self, 
        memo_data: Dict, 
        context_analysis: Dict, 
        missing_fields: List[str]
    ) -> List[Dict]:
        """Generate questions based on context and missing information."""
        
        # Create prompt for Gemini
        prompt = f"""
        You are an AI investment analyst conducting a due diligence interview. 
        Based on the memo data and current conversation, generate 3-5 intelligent follow-up questions.
        
        MEMO DATA:
        {json.dumps(memo_data, indent=2)}
        
        CONVERSATION CONTEXT:
        - Topics discussed: {', '.join(context_analysis.get('discussed_topics', []))}
        - Missing fields: {', '.join(missing_fields)}
        
        Generate questions that:
        1. Fill knowledge gaps from the memo
        2. Clarify vague or missing information
        3. Validate key business metrics
        4. Explore competitive advantages
        5. Understand market positioning
        
        Return as JSON array with format:
        [
            {{
                "question": "What's your customer acquisition cost (CAC) and how does it compare to industry benchmarks?",
                "priority": "high",
                "category": "financial_metrics",
                "reasoning": "CAC is critical for unit economics validation"
            }}
        ]
        """
        
        try:
            response = self.model.generate_content(prompt)
            questions_text = response.text.strip()
            
            # Parse JSON response
            if questions_text.startswith('```json'):
                questions_text = questions_text.replace('```json', '').replace('```', '').strip()
            
            questions = json.loads(questions_text)
            
            # Ensure proper format
            formatted_questions = []
            for q in questions:
                formatted_questions.append({
                    "question": q.get("question", ""),
                    "priority": q.get("priority", "medium"),
                    "category": q.get("category", "general"),
                    "reasoning": q.get("reasoning", ""),
                    "timestamp": time.time()
                })
            
            return formatted_questions
            
        except Exception as e:
            self.logger.error(f"Failed to generate questions with Gemini: {e}")
            # Fallback to predefined questions
            return self._get_fallback_questions(missing_fields)
    
    def _get_fallback_questions(self, missing_fields: List[str]) -> List[Dict]:
        """Fallback questions when AI generation fails."""
        
        fallback_questions = [
            {
                "question": "What's your customer acquisition cost (CAC) and how does it compare to industry benchmarks?",
                "priority": "high",
                "category": "financial_metrics",
                "reasoning": "CAC is critical for unit economics validation"
            },
            {
                "question": "Can you provide more details about your total addressable market (TAM) and how you're capturing it?",
                "priority": "high",
                "category": "market_analysis",
                "reasoning": "Market size validation is essential for investment decisions"
            },
            {
                "question": "What are your key competitive advantages and how defensible is your business model?",
                "priority": "medium",
                "category": "competitive_analysis",
                "reasoning": "Understanding competitive moats is crucial for long-term success"
            }
        ]
        
        return fallback_questions
    
    def _prioritize_questions(self, questions: List[Dict], memo_data: Dict) -> List[Dict]:
        """Prioritize questions based on business importance and memo gaps."""
        
        # Define priority weights
        priority_weights = {
            "high": 3,
            "medium": 2,
            "low": 1
        }
        
        # Define category importance
        category_weights = {
            "financial_metrics": 3,
            "market_analysis": 3,
            "competitive_analysis": 2,
            "team": 2,
            "technology": 2,
            "general": 1
        }
        
        # Score and sort questions
        for question in questions:
            priority_score = priority_weights.get(question.get("priority", "medium"), 2)
            category_score = category_weights.get(question.get("category", "general"), 1)
            question["score"] = priority_score + category_score
        
        # Sort by score (highest first)
        sorted_questions = sorted(questions, key=lambda x: x.get("score", 0), reverse=True)
        
        return sorted_questions
    
    def _store_questions(self, session_id: str, questions: List[Dict]):
        """Store generated questions in Firestore."""
        try:
            doc_ref = self.db.collection('qa_sessions').document(session_id)
            doc_ref.set({
                'session_id': session_id,
                'questions': questions,
                'created_at': firestore.SERVER_TIMESTAMP,
                'status': 'active'
            })
        except Exception as e:
            self.logger.error(f"Failed to store questions: {e}")
    
    def get_next_question(self, session_id: str) -> Dict:
        """Get the next question to ask based on priority."""
        try:
            doc_ref = self.db.collection('qa_sessions').document(session_id)
            doc = doc_ref.get()
            
            if doc.exists:
                data = doc.to_dict()
                questions = data.get('questions', [])
                
                # Find the highest priority unanswered question
                for question in questions:
                    if not question.get('asked', False):
                        return {
                            "status": "success",
                            "question": question,
                            "remaining_count": len([q for q in questions if not q.get('asked', False)])
                        }
                
                return {
                    "status": "success",
                    "question": None,
                    "message": "All questions have been asked"
                }
            else:
                return {
                    "status": "error",
                    "error": "Session not found"
                }
                
        except Exception as e:
            self.logger.error(f"Error getting next question: {e}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    def mark_question_asked(self, session_id: str, question_index: int) -> Dict:
        """Mark a question as asked."""
        try:
            doc_ref = self.db.collection('qa_sessions').document(session_id)
            doc = doc_ref.get()
            
            if doc.exists:
                data = doc.to_dict()
                questions = data.get('questions', [])
                
                if 0 <= question_index < len(questions):
                    questions[question_index]['asked'] = True
                    questions[question_index]['asked_at'] = time.time()
                    
                    doc_ref.update({'questions': questions})
                    
                    return {
                        "status": "success",
                        "message": "Question marked as asked"
                    }
                else:
                    return {
                        "status": "error",
                        "error": "Invalid question index"
                    }
            else:
                return {
                    "status": "error",
                    "error": "Session not found"
                }
                
        except Exception as e:
            self.logger.error(f"Error marking question as asked: {e}")
            return {
                "status": "error",
                "error": str(e)
            }
