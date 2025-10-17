"""
SentimentCommunicationAgent - Layer 2 AI Interview System
Purpose: Analyze tone and confidence of founder responses.
API: Vertex Sentiment Analysis + Gemini Emotion Model
Output: {"founder_tone": "Confident", "confidence_score": 0.86}
"""

import os
import json
import time
from typing import Dict, List, Optional
import logging

import vertexai
from vertexai.generative_models import GenerativeModel
from firebase_admin import firestore

class SentimentCommunicationAgent:
    """Agent responsible for analyzing founder tone and confidence."""
    
    def __init__(
        self,
        project: str = "veritas-472301",
        location: str = "asia-south1",
        model: str = "gemini-1.5-pro"
    ):
        self.project = project
        self.location = location
        self.model_name = model
        self.gemini_model = None
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
        """Initialize Vertex AI model and Firestore."""
        try:
            # Initialize Vertex AI
            vertexai.init(project=self.project, location=self.location)
            self.gemini_model = GenerativeModel(self.model_name)
            
            # Initialize Firestore
            self.db = firestore.client()
            
            self.logger.info("SentimentCommunicationAgent initialized successfully")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize SentimentCommunicationAgent: {e}")
            raise
    
    def analyze_sentiment(self, text: str, speaker: str = "founder") -> Dict:
        """
        Analyze sentiment and emotional tone of speaker text.
        
        Args:
            text: Text to analyze
            speaker: Speaker identifier (founder, investor, ai)
        
        Returns:
            Dict with sentiment analysis results
        """
        if not self.gemini_model:
            self.set_up()
        
        try:
            # Use Vertex AI Gemini for sentiment analysis
            prompt = f"""
            Analyze the sentiment and emotional tone of this text from a {speaker}:
            
            Text: "{text}"
            
            Please provide:
            1. Sentiment score (-1 to 1, where -1 is very negative, 0 is neutral, 1 is very positive)
            2. Emotional tone (confident, uncertain, excited, defensive, etc.)
            3. Confidence level (0 to 1, how confident the speaker sounds)
            4. Key emotional indicators
            
            Respond in JSON format:
            {{
                "sentiment_score": <number>,
                "tone": "<string>",
                "confidence_level": <number>,
                "emotional_indicators": ["<indicator1>", "<indicator2>"]
            }}
            """
            
            response = self.gemini_model.generate_content(prompt)
            analysis_text = response.text.strip()
            
            # Parse JSON response
            try:
                analysis = json.loads(analysis_text)
                sentiment_score = analysis.get("sentiment_score", 0.0)
                sentiment_magnitude = abs(sentiment_score)
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                sentiment_score = 0.0
                sentiment_magnitude = 0.0
                analysis = {
                    "tone": "neutral",
                    "confidence_level": 0.5,
                    "emotional_indicators": []
                }
            
            # Extract analysis results
            tone = analysis.get("tone", "neutral")
            confidence_score = analysis.get("confidence_level", 0.5)
            emotional_indicators = analysis.get("emotional_indicators", [])
            
            result = {
                "speaker": speaker,
                "text": text,
                "sentiment_score": sentiment_score,
                "sentiment_magnitude": sentiment_magnitude,
                "tone": tone,
                "confidence_score": confidence_score,
                "emotional_analysis": {
                    "indicators": emotional_indicators,
                    "raw_analysis": analysis_text
                },
                "timestamp": time.time(),
                "status": "SUCCESS"
            }
            
            # Store analysis in Firestore
            self._store_sentiment_analysis(result)
            
            self.logger.info(f"Sentiment analysis completed for {speaker}: {tone} (confidence: {confidence_score:.2f})")
            
            return {
                "status": "success",
                "analysis": result
            }
            
        except Exception as e:
            self.logger.error(f"Failed to analyze sentiment: {e}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    def _analyze_emotional_tone(self, text: str, speaker: str) -> Dict:
        """Use Gemini to analyze emotional tone and communication style."""
        
        prompt = f"""
        Analyze the emotional tone and communication style of this {speaker} response:
        
        Text: "{text}"
        
        Provide analysis in JSON format:
        {{
            "emotional_tone": "confident|uncertain|defensive|enthusiastic|neutral|concerned",
            "communication_style": "direct|evasive|detailed|vague|professional|casual",
            "confidence_indicators": ["specific_metrics", "clear_explanations", "concrete_examples"],
            "concern_indicators": ["hedging_language", "uncertainty_markers", "defensive_phrases"],
            "key_emotions": ["confidence", "uncertainty", "enthusiasm", "concern", "defensiveness"],
            "clarity_score": 0.0-1.0,
            "specificity_score": 0.0-1.0
        }}
        """
        
        try:
            response = self.gemini_model.generate_content(prompt)
            analysis_text = response.text.strip()
            
            # Parse JSON response
            if analysis_text.startswith('```json'):
                analysis_text = analysis_text.replace('```json', '').replace('```', '').strip()
            
            return json.loads(analysis_text)
            
        except Exception as e:
            self.logger.error(f"Failed to analyze emotional tone: {e}")
            # Return fallback analysis
            return {
                "emotional_tone": "neutral",
                "communication_style": "professional",
                "confidence_indicators": [],
                "concern_indicators": [],
                "key_emotions": ["neutral"],
                "clarity_score": 0.5,
                "specificity_score": 0.5
            }
    
    def _calculate_confidence_score(
        self, 
        sentiment_score: float, 
        sentiment_magnitude: float, 
        emotional_analysis: Dict
    ) -> float:
        """Calculate overall confidence score based on multiple factors."""
        
        # Base confidence from sentiment
        sentiment_confidence = (sentiment_score + 1) / 2  # Convert from [-1,1] to [0,1]
        
        # Emotional tone confidence
        tone_confidence = 0.5
        if emotional_analysis.get("emotional_tone") == "confident":
            tone_confidence = 0.9
        elif emotional_analysis.get("emotional_tone") == "enthusiastic":
            tone_confidence = 0.8
        elif emotional_analysis.get("emotional_tone") == "uncertain":
            tone_confidence = 0.3
        elif emotional_analysis.get("emotional_tone") == "defensive":
            tone_confidence = 0.2
        
        # Clarity and specificity scores
        clarity_score = emotional_analysis.get("clarity_score", 0.5)
        specificity_score = emotional_analysis.get("specificity_score", 0.5)
        
        # Weighted average
        confidence_score = (
            sentiment_confidence * 0.3 +
            tone_confidence * 0.3 +
            clarity_score * 0.2 +
            specificity_score * 0.2
        )
        
        return min(max(confidence_score, 0.0), 1.0)  # Clamp to [0,1]
    
    def _determine_tone(self, sentiment_score: float, emotional_analysis: Dict) -> str:
        """Determine overall tone based on sentiment and emotional analysis."""
        
        emotional_tone = emotional_analysis.get("emotional_tone", "neutral")
        
        # Map emotional tones to business-relevant tones
        tone_mapping = {
            "confident": "Confident",
            "enthusiastic": "Enthusiastic", 
            "uncertain": "Uncertain",
            "defensive": "Defensive",
            "concerned": "Concerned",
            "neutral": "Neutral"
        }
        
        base_tone = tone_mapping.get(emotional_tone, "Neutral")
        
        # Adjust based on sentiment score
        if sentiment_score > 0.3:
            if base_tone == "Neutral":
                base_tone = "Positive"
            elif base_tone == "Confident":
                base_tone = "Very Confident"
        elif sentiment_score < -0.3:
            if base_tone == "Neutral":
                base_tone = "Negative"
            elif base_tone == "Uncertain":
                base_tone = "Very Uncertain"
        
        return base_tone
    
    def _store_sentiment_analysis(self, analysis: Dict):
        """Store sentiment analysis in Firestore."""
        try:
            session_id = f"sentiment_{int(time.time())}"
            doc_ref = self.db.collection('sentiment_analyses').document(session_id)
            doc_ref.set(analysis)
        except Exception as e:
            self.logger.error(f"Failed to store sentiment analysis: {e}")
    
    def analyze_conversation_flow(self, transcript_data: List[Dict]) -> Dict:
        """Analyze the overall conversation flow and founder confidence trends."""
        
        try:
            founder_segments = [s for s in transcript_data if s.get('speaker', '').startswith('speaker_')]
            
            if not founder_segments:
                return {
                    "status": "error",
                    "error": "No founder segments found in transcript"
                }
            
            # Analyze each founder segment
            analyses = []
            for segment in founder_segments:
                analysis = self.analyze_sentiment(segment.get('text', ''), 'founder')
                if analysis.get('status') == 'success':
                    analyses.append(analysis['analysis'])
            
            if not analyses:
                return {
                    "status": "error", 
                    "error": "No successful sentiment analyses"
                }
            
            # Calculate trends
            confidence_scores = [a['confidence_score'] for a in analyses]
            tones = [a['tone'] for a in analyses]
            
            # Determine overall trends
            avg_confidence = sum(confidence_scores) / len(confidence_scores)
            confidence_trend = self._calculate_trend(confidence_scores)
            
            # Most common tone
            tone_counts = {}
            for tone in tones:
                tone_counts[tone] = tone_counts.get(tone, 0) + 1
            dominant_tone = max(tone_counts, key=tone_counts.get)
            
            # Generate insights
            insights = self._generate_insights(analyses, avg_confidence, confidence_trend)
            
            result = {
                "total_segments": len(analyses),
                "average_confidence": avg_confidence,
                "confidence_trend": confidence_trend,
                "dominant_tone": dominant_tone,
                "tone_distribution": tone_counts,
                "insights": insights,
                "detailed_analyses": analyses
            }
            
            # Store conversation analysis
            self._store_conversation_analysis(result)
            
            return {
                "status": "success",
                "conversation_analysis": result
            }
            
        except Exception as e:
            self.logger.error(f"Failed to analyze conversation flow: {e}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    def _calculate_trend(self, scores: List[float]) -> str:
        """Calculate trend direction from a list of scores."""
        if len(scores) < 2:
            return "stable"
        
        # Simple trend calculation
        first_half = scores[:len(scores)//2]
        second_half = scores[len(scores)//2:]
        
        first_avg = sum(first_half) / len(first_half)
        second_avg = sum(second_half) / len(second_half)
        
        diff = second_avg - first_avg
        
        if diff > 0.1:
            return "improving"
        elif diff < -0.1:
            return "declining"
        else:
            return "stable"
    
    def _generate_insights(self, analyses: List[Dict], avg_confidence: float, trend: str) -> List[str]:
        """Generate insights about the founder's communication patterns."""
        insights = []
        
        if avg_confidence > 0.8:
            insights.append("Founder demonstrates high confidence throughout the conversation")
        elif avg_confidence < 0.4:
            insights.append("Founder shows signs of uncertainty or lack of confidence")
        
        if trend == "improving":
            insights.append("Founder's confidence appears to be increasing over time")
        elif trend == "declining":
            insights.append("Founder's confidence seems to be decreasing during the conversation")
        
        # Analyze specific patterns
        confident_segments = [a for a in analyses if a['confidence_score'] > 0.7]
        if len(confident_segments) > len(analyses) * 0.6:
            insights.append("Founder maintains confident tone in majority of responses")
        
        uncertain_segments = [a for a in analyses if a['confidence_score'] < 0.4]
        if len(uncertain_segments) > len(analyses) * 0.4:
            insights.append("Founder shows uncertainty in significant portion of responses")
        
        return insights
    
    def _store_conversation_analysis(self, analysis: Dict):
        """Store conversation analysis in Firestore."""
        try:
            session_id = f"conversation_analysis_{int(time.time())}"
            doc_ref = self.db.collection('conversation_analyses').document(session_id)
            doc_ref.set(analysis)
        except Exception as e:
            self.logger.error(f"Failed to store conversation analysis: {e}")
