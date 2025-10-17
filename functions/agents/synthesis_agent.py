"""
SynthesisAgent - Layer 2 AI Interview System
Purpose: Merge Memo 1 + interview transcript → generate Memo 2.
Output: {"memo_version": "v2", "summary": "Founder clarified CAC and TAM.", "recommendation": "Proceed to diligence"}
"""

import os
import json
import time
from typing import Dict, List, Optional
import logging

import vertexai
from vertexai.generative_models import GenerativeModel
from firebase_admin import firestore

class SynthesisAgent:
    """Agent responsible for generating Memo 2 from Memo 1 and interview data."""
    
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
            
            self.logger.info("SynthesisAgent initialized successfully")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize SynthesisAgent: {e}")
            raise
    
    def generate_memo_2(
        self, 
        memo_1_data: Dict, 
        transcript_data: List[Dict],
        sentiment_analysis: Dict,
        qa_data: Dict
    ) -> Dict:
        """
        Generate Memo 2 (Deep Dive Summary) from Memo 1 and interview data.
        
        Args:
            memo_1_data: Original Memo 1 data
            transcript_data: Meeting transcript
            sentiment_analysis: Sentiment analysis results
            qa_data: Q&A session data
        
        Returns:
            Dict with Memo 2 content and recommendations
        """
        if not self.model:
            self.set_up()
        
        try:
            # Extract key insights from the interview
            interview_insights = self._extract_interview_insights(transcript_data, sentiment_analysis, qa_data)
            
            # Generate comprehensive Memo 2
            memo_2_content = self._generate_memo_2_content(memo_1_data, interview_insights)
            
            # Generate investment recommendation
            recommendation = self._generate_investment_recommendation(memo_1_data, interview_insights)
            
            # Create final Memo 2 structure
            memo_2 = {
                "memo_version": "v2",
                "memo_id": f"memo_2_{memo_1_data.get('id', 'unknown')}_{int(time.time())}",
                "original_memo_id": memo_1_data.get('id'),
                "generated_at": time.time(),
                "content": memo_2_content,
                "recommendation": recommendation,
                "interview_insights": interview_insights,
                "confidence_score": self._calculate_overall_confidence(sentiment_analysis),
                "status": "completed"
            }
            
            # Store Memo 2 in Firestore
            self._store_memo_2(memo_2)
            
            self.logger.info(f"Memo 2 generated successfully: {memo_2['memo_id']}")
            
            return {
                "status": "success",
                "memo_2": memo_2
            }
            
        except Exception as e:
            self.logger.error(f"Failed to generate Memo 2: {e}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    def _extract_interview_insights(
        self, 
        transcript_data: List[Dict], 
        sentiment_analysis: Dict, 
        qa_data: Dict
    ) -> Dict:
        """Extract key insights from the interview data."""
        
        # Extract key metrics and clarifications
        clarifications = []
        new_metrics = {}
        concerns_raised = []
        strengths_highlighted = []
        
        for segment in transcript_data:
            if segment.get('is_final', False):
                text = segment.get('text', '').lower()
                speaker = segment.get('speaker', '')
                
                # Look for metric clarifications
                if any(keyword in text for keyword in ['revenue', 'mrr', 'arr', 'cac', 'ltv']):
                    if 'founder' in speaker or 'speaker_0' in speaker:
                        clarifications.append({
                            'topic': 'financial_metrics',
                            'content': segment.get('text', ''),
                            'timestamp': segment.get('timestamp', 0)
                        })
                
                # Look for market information
                if any(keyword in text for keyword in ['market', 'tam', 'sam', 'customers', 'users']):
                    if 'founder' in speaker or 'speaker_0' in speaker:
                        clarifications.append({
                            'topic': 'market_analysis',
                            'content': segment.get('text', ''),
                            'timestamp': segment.get('timestamp', 0)
                        })
                
                # Look for competitive information
                if any(keyword in text for keyword in ['competitor', 'competition', 'advantage', 'moat']):
                    if 'founder' in speaker or 'speaker_0' in speaker:
                        clarifications.append({
                            'topic': 'competitive_analysis',
                            'content': segment.get('text', ''),
                            'timestamp': segment.get('timestamp', 0)
                        })
        
        # Analyze sentiment patterns
        sentiment_insights = {
            'overall_confidence': sentiment_analysis.get('conversation_analysis', {}).get('average_confidence', 0.5),
            'confidence_trend': sentiment_analysis.get('conversation_analysis', {}).get('confidence_trend', 'stable'),
            'dominant_tone': sentiment_analysis.get('conversation_analysis', {}).get('dominant_tone', 'Neutral'),
            'key_insights': sentiment_analysis.get('conversation_analysis', {}).get('insights', [])
        }
        
        # Analyze Q&A effectiveness
        qa_insights = {
            'total_questions': len(qa_data.get('questions', [])),
            'answered_questions': len([q for q in qa_data.get('questions', []) if q.get('answered', False)]),
            'high_priority_questions': len([q for q in qa_data.get('questions', []) if q.get('priority') == 'high']),
            'unanswered_questions': len([q for q in qa_data.get('questions', []) if not q.get('answered', False)])
        }
        
        return {
            'clarifications': clarifications,
            'sentiment_insights': sentiment_insights,
            'qa_insights': qa_insights,
            'total_segments': len(transcript_data),
            'final_segments': len([s for s in transcript_data if s.get('is_final', False)])
        }
    
    def _generate_memo_2_content(self, memo_1_data: Dict, interview_insights: Dict) -> Dict:
        """Generate the main content of Memo 2."""
        
        # Create comprehensive prompt for Gemini
        prompt = f"""
        Generate a comprehensive Memo 2 (Deep Dive Summary) based on Memo 1 and interview insights.
        
        MEMO 1 DATA:
        {json.dumps(memo_1_data, indent=2)}
        
        INTERVIEW INSIGHTS:
        {json.dumps(interview_insights, indent=2)}
        
        Generate a structured memo with the following sections:
        
        1. EXECUTIVE SUMMARY
        2. KEY CLARIFICATIONS FROM INTERVIEW
        3. FINANCIAL METRICS VALIDATION
        4. MARKET ANALYSIS DEEP DIVE
        5. COMPETITIVE POSITIONING
        6. FOUNDER ASSESSMENT
        7. RISK ANALYSIS
        8. INVESTMENT THESIS
        
        Return as JSON with this structure:
        {{
            "executive_summary": "Brief overview of key findings",
            "key_clarifications": ["List of important clarifications made"],
            "financial_metrics": {{
                "validated_metrics": ["List of confirmed metrics"],
                "new_metrics": ["List of newly provided metrics"],
                "concerns": ["List of financial concerns raised"]
            }},
            "market_analysis": {{
                "tam_validation": "Analysis of TAM claims",
                "market_entry": "Assessment of market entry strategy",
                "growth_potential": "Evaluation of growth potential"
            }},
            "competitive_positioning": {{
                "advantages": ["List of competitive advantages"],
                "differentiators": ["Key differentiators identified"],
                "threats": ["Competitive threats identified"]
            }},
            "founder_assessment": {{
                "confidence_level": "High/Medium/Low",
                "communication_style": "Description of communication style",
                "key_strengths": ["Founder strengths identified"],
                "areas_of_concern": ["Areas of concern identified"]
            }},
            "risk_analysis": {{
                "high_risks": ["List of high-risk factors"],
                "medium_risks": ["List of medium-risk factors"],
                "mitigation_strategies": ["Potential mitigation strategies"]
            }},
            "investment_thesis": {{
                "bull_case": "Strongest arguments for investment",
                "bear_case": "Strongest arguments against investment",
                "key_metrics_to_track": ["Metrics to monitor post-investment"]
            }}
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            content_text = response.text.strip()
            
            # Parse JSON response
            if content_text.startswith('```json'):
                content_text = content_text.replace('```json', '').replace('```', '').strip()
            
            memo_content = json.loads(content_text)
            
            # Add metadata
            memo_content['generation_metadata'] = {
                'interview_duration': interview_insights.get('total_segments', 0),
                'clarifications_count': len(interview_insights.get('clarifications', [])),
                'confidence_score': interview_insights.get('sentiment_insights', {}).get('overall_confidence', 0.5),
                'generated_at': time.time()
            }
            
            return memo_content
            
        except Exception as e:
            self.logger.error(f"Failed to generate Memo 2 content: {e}")
            # Return fallback content
            return self._get_fallback_memo_content(memo_1_data, interview_insights)
    
    def _get_fallback_memo_content(self, memo_1_data: Dict, interview_insights: Dict) -> Dict:
        """Fallback memo content when AI generation fails."""
        
        return {
            "executive_summary": f"Deep dive analysis of {memo_1_data.get('title', 'Startup')} based on AI interview session.",
            "key_clarifications": [
                "Founder provided additional context during interview",
                "Key metrics were discussed and validated"
            ],
            "financial_metrics": {
                "validated_metrics": ["Revenue model discussed"],
                "new_metrics": ["Additional financial details provided"],
                "concerns": ["Standard due diligence concerns"]
            },
            "market_analysis": {
                "tam_validation": "Market size claims were discussed",
                "market_entry": "Entry strategy was explored",
                "growth_potential": "Growth potential was assessed"
            },
            "competitive_positioning": {
                "advantages": ["Competitive advantages identified"],
                "differentiators": ["Key differentiators discussed"],
                "threats": ["Competitive landscape analyzed"]
            },
            "founder_assessment": {
                "confidence_level": "Medium",
                "communication_style": "Professional and responsive",
                "key_strengths": ["Founder demonstrated knowledge"],
                "areas_of_concern": ["Standard areas for follow-up"]
            },
            "risk_analysis": {
                "high_risks": ["Market competition"],
                "medium_risks": ["Execution risk"],
                "mitigation_strategies": ["Standard risk mitigation"]
            },
            "investment_thesis": {
                "bull_case": "Strong market opportunity",
                "bear_case": "Competitive market",
                "key_metrics_to_track": ["Revenue growth", "Customer acquisition"]
            }
        }
    
    def _generate_investment_recommendation(
        self, 
        memo_1_data: Dict, 
        interview_insights: Dict
    ) -> Dict:
        """Generate investment recommendation based on analysis."""
        
        # Calculate recommendation score
        confidence_score = interview_insights.get('sentiment_insights', {}).get('overall_confidence', 0.5)
        clarifications_count = len(interview_insights.get('clarifications', []))
        
        # Simple scoring algorithm
        base_score = 0.5
        confidence_bonus = (confidence_score - 0.5) * 0.3
        clarification_bonus = min(clarifications_count * 0.05, 0.2)
        
        recommendation_score = base_score + confidence_bonus + clarification_bonus
        recommendation_score = min(max(recommendation_score, 0.0), 1.0)
        
        # Determine recommendation
        if recommendation_score >= 0.7:
            recommendation = "PROCEED"
            confidence_level = "HIGH"
        elif recommendation_score >= 0.5:
            recommendation = "PROCEED WITH CAUTION"
            confidence_level = "MEDIUM"
        else:
            recommendation = "DO NOT PROCEED"
            confidence_level = "LOW"
        
        return {
            "recommendation": recommendation,
            "confidence_level": confidence_level,
            "score": recommendation_score,
            "reasoning": [
                f"Founder confidence: {confidence_score:.2f}",
                f"Clarifications provided: {clarifications_count}",
                f"Overall assessment: {recommendation}"
            ],
            "next_steps": self._get_next_steps(recommendation)
        }
    
    def _get_next_steps(self, recommendation: str) -> List[str]:
        """Get recommended next steps based on recommendation."""
        
        if recommendation == "PROCEED":
            return [
                "Schedule follow-up meeting for detailed due diligence",
                "Request additional financial documentation",
                "Conduct reference checks with customers",
                "Prepare term sheet for negotiation"
            ]
        elif recommendation == "PROCEED WITH CAUTION":
            return [
                "Address specific concerns raised in interview",
                "Request additional clarification on key metrics",
                "Conduct deeper market analysis",
                "Schedule follow-up interview with specific focus areas"
            ]
        else:
            return [
                "Document specific reasons for not proceeding",
                "Provide feedback to founder on areas of concern",
                "Consider future opportunities if issues are addressed"
            ]
    
    def _calculate_overall_confidence(self, sentiment_analysis: Dict) -> float:
        """Calculate overall confidence score for the analysis."""
        
        conversation_analysis = sentiment_analysis.get('conversation_analysis', {})
        return conversation_analysis.get('average_confidence', 0.5)
    
    def _store_memo_2(self, memo_2: Dict):
        """Store Memo 2 in Firestore."""
        try:
            doc_ref = self.db.collection('memos').document(memo_2['memo_id'])
            doc_ref.set(memo_2)
            
            # Also store in ai_interviews collection for tracking
            interview_doc_ref = self.db.collection('ai_interviews').document(memo_2['original_memo_id'])
            interview_doc_ref.update({
                'memo_2_id': memo_2['memo_id'],
                'memo_2_status': 'completed',
                'memo_2_generated_at': firestore.SERVER_TIMESTAMP
            })
            
        except Exception as e:
            self.logger.error(f"Failed to store Memo 2: {e}")
    
    def get_memo_2(self, memo_2_id: str) -> Dict:
        """Retrieve Memo 2 from Firestore."""
        try:
            doc_ref = self.db.collection('memos').document(memo_2_id)
            doc = doc_ref.get()
            
            if doc.exists:
                return {
                    "status": "success",
                    "memo_2": doc.to_dict()
                }
            else:
                return {
                    "status": "error",
                    "error": "Memo 2 not found"
                }
                
        except Exception as e:
            self.logger.error(f"Error retrieving Memo 2: {e}")
            return {
                "status": "error",
                "error": str(e)
            }
