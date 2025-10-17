"""
SpeechStreamAgent - Layer 2 AI Interview System
Purpose: Real-time transcription of meeting audio.
API: Vertex AI Speech-to-Text
Output: Time-stamped transcripts with speaker tags
"""

from typing import Callable, Sequence, Dict, List, Any, Optional, Iterable
import os
import json
import time
import logging
from pathlib import Path
from collections import Counter
from datetime import datetime

from google.cloud import speech
from firebase_admin import firestore

class SpeechStreamAgent:
    """Agent responsible for real-time audio transcription."""
    
    def __init__(
        self,
        project_id: str = "veritas-472301",
        language_code: str = "en-US",
        sample_rate: int = 16000,
        enable_speaker_diarization: bool = True,
        speaker_count: int = 3,
        confidence_threshold: float = 0.7
    ):
        self.project_id = project_id
        self.language_code = language_code
        self.sample_rate = sample_rate
        self.enable_speaker_diarization = enable_speaker_diarization
        self.speaker_count = speaker_count
        self.confidence_threshold = confidence_threshold
        
        self.speech_client = None
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
        """Initialize Speech-to-Text client and Firestore."""
        try:
            # Initialize Speech-to-Text client
            self.speech_client = speech.SpeechClient()
            
            # Initialize Firestore
            self.db = firestore.client()
            
            self.logger.info("SpeechStreamAgent initialized successfully")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize SpeechStreamAgent: {e}")
            raise
    
    def query(self, meeting_id: str, audio_data: bytes = None, **kwargs) -> Dict[str, Any]:
        """Main query method to start transcription or process audio"""
        start_time = datetime.now()
        
        try:
            if audio_data:
                # Process audio chunk
                result = self.process_audio_chunk(meeting_id, audio_data)
            else:
                # Start transcription session
                result = self.start_transcription(meeting_id, kwargs.get("audio_config", {}))
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            return {
                "timestamp": datetime.now().isoformat(),
                "meeting_id": meeting_id,
                "processing_time_seconds": processing_time,
                "transcription_result": result,
                "status": "SUCCESS"
            }
            
        except Exception as e:
            self.logger.error(f"Error in transcription: {str(e)}")
            processing_time = (datetime.now() - start_time).total_seconds()
            
            return {
                "timestamp": datetime.now().isoformat(),
                "meeting_id": meeting_id,
                "processing_time_seconds": processing_time,
                "transcription_result": self._get_empty_transcription_result(),
                "status": "FAILED",
                "error": str(e)
            }
    
    def start_transcription(self, meeting_id: str, audio_config: Dict) -> Dict:
        """
        Start real-time transcription for a meeting.
        
        Args:
            meeting_id: ID of the meeting to transcribe
            audio_config: Audio configuration settings
        
        Returns:
            Dict with transcription session details
        """
        if not self.speech_client:
            self.set_up()
        
        try:
            # Configure recognition settings
            config = speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
                sample_rate_hertz=16000,
                language_code="en-US",
                enable_automatic_punctuation=True,
                enable_word_time_offsets=True,
                model="latest_long"
            )
            
            # Configure streaming settings
            streaming_config = speech.StreamingRecognitionConfig(
                config=config,
                interim_results=True
            )
            
            # Create transcription session
            session_id = f"transcription_{meeting_id}_{int(time.time())}"
            
            # Store session in Firestore
            session_data = {
                'session_id': session_id,
                'meeting_id': meeting_id,
                'status': 'active',
                'started_at': firestore.SERVER_TIMESTAMP,
                'transcript': [],
                'speakers': {
                    'founder': {'name': 'Founder', 'confidence': 0.0},
                    'investor': {'name': 'Investor', 'confidence': 0.0},
                    'ai': {'name': 'AI Analyst', 'confidence': 0.0}
                }
            }
            
            doc_ref = self.db.collection('transcription_sessions').document(session_id)
            doc_ref.set(session_data)
            
            self.logger.info(f"Transcription started for meeting: {meeting_id}")
            
            return {
                "status": "success",
                "session_id": session_id,
                "meeting_id": meeting_id,
                "config": {
                    "language": "en-US",
                    "speaker_diarization": True,
                    "interim_results": True
                }
            }
            
        except Exception as e:
            self.logger.error(f"Failed to start transcription: {e}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    def process_audio_chunk(self, session_id: str, audio_data: bytes) -> Dict:
        """
        Process an audio chunk and return transcription results.
        
        Args:
            session_id: Transcription session ID
            audio_data: Raw audio data bytes
        
        Returns:
            Dict with transcription results
        """
        if not self.speech_client:
            self.set_up()
        
        try:
            # Configure streaming recognition
            config = speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
                sample_rate_hertz=16000,
                language_code="en-US",
                enable_automatic_punctuation=True,
                enable_word_time_offsets=True,
                enable_speaker_diarization=True,
                diarization_speaker_count=3
            )
            
            streaming_config = speech.StreamingRecognitionConfig(
                config=config,
                interim_results=True
            )
            
            # Create audio request
            audio_request = speech.StreamingRecognizeRequest(
                streaming_config=streaming_config,
                audio_content=audio_data
            )
            
            # Process the audio
            responses = self.speech_client.streaming_recognize([audio_request])
            
            transcript_segments = []
            
            for response in responses:
                if not response.results:
                    continue
                
                result = response.results[0]
                if not result.alternatives:
                    continue
                
                alternative = result.alternatives[0]
                transcript_text = alternative.transcript
                confidence = alternative.confidence
                
                # Extract speaker information
                speaker_tag = "unknown"
                if hasattr(alternative, 'words') and alternative.words:
                    # Get speaker from first word
                    first_word = alternative.words[0]
                    if hasattr(first_word, 'speaker_tag'):
                        speaker_tag = f"speaker_{first_word.speaker_tag}"
                
                # Create transcript segment
                segment = {
                    'text': transcript_text,
                    'confidence': confidence,
                    'speaker': speaker_tag,
                    'timestamp': time.time(),
                    'is_final': result.is_final
                }
                
                transcript_segments.append(segment)
                
                # Update Firestore with new transcript
                self._update_transcript(session_id, segment)
            
            return {
                "status": "success",
                "session_id": session_id,
                "segments": transcript_segments
            }
            
        except Exception as e:
            self.logger.error(f"Failed to process audio chunk: {e}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    def _update_transcript(self, session_id: str, segment: Dict):
        """Update the transcript in Firestore."""
        try:
            doc_ref = self.db.collection('transcription_sessions').document(session_id)
            doc_ref.update({
                'transcript': firestore.ArrayUnion([segment]),
                'last_updated': firestore.SERVER_TIMESTAMP
            })
        except Exception as e:
            self.logger.error(f"Failed to update transcript: {e}")
    
    def get_transcript(self, session_id: str) -> Dict:
        """Get the current transcript for a session."""
        try:
            doc_ref = self.db.collection('transcription_sessions').document(session_id)
            doc = doc_ref.get()
            
            if doc.exists:
                data = doc.to_dict()
                return {
                    "status": "success",
                    "transcript": data.get('transcript', []),
                    "session_info": {
                        'session_id': session_id,
                        'status': data.get('status'),
                        'started_at': data.get('started_at'),
                        'last_updated': data.get('last_updated')
                    }
                }
            else:
                return {
                    "status": "error",
                    "error": "Session not found"
                }
                
        except Exception as e:
            self.logger.error(f"Error getting transcript: {e}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    def stop_transcription(self, session_id: str) -> Dict:
        """Stop transcription and finalize the session."""
        try:
            doc_ref = self.db.collection('transcription_sessions').document(session_id)
            doc_ref.update({
                'status': 'completed',
                'ended_at': firestore.SERVER_TIMESTAMP
            })
            
            self.logger.info(f"Transcription stopped for session: {session_id}")
            
            return {
                "status": "success",
                "session_id": session_id,
                "message": "Transcription stopped successfully"
            }
            
        except Exception as e:
            self.logger.error(f"Failed to stop transcription: {e}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    def _get_empty_transcription_result(self) -> Dict[str, Any]:
        """Return empty transcription result for error cases"""
        return {
            "session_id": "N/A",
            "meeting_id": "N/A",
            "status": "failed",
            "transcript": [],
            "segments": []
        }
    
    def summarize(self, result: Dict[str, Any]) -> str:
        """Convert transcription results to human-readable summary"""
        if result.get("status") == "FAILED":
            return f"❌ TRANSCRIPTION FAILED: {result.get('error', 'Unknown error')}"
        
        transcription_result = result.get("transcription_result", {})
        meeting_id = result.get("meeting_id", "Unknown Meeting")
        
        lines = []
        lines.append("=== SPEECH TRANSCRIPTION ANALYSIS ===")
        lines.append(f"Meeting ID: {meeting_id}")
        
        session_id = transcription_result.get("session_id", "N/A")
        if session_id != "N/A":
            lines.append(f"Session ID: {session_id}")
        else:
            lines.append("Session ID: Not available")
        
        segments = transcription_result.get("segments", [])
        if segments:
            lines.append(f"Transcription Segments: {len(segments)}")
            
            # Show sample segments
            for i, segment in enumerate(segments[:3]):  # Show first 3 segments
                speaker = segment.get("speaker", "unknown")
                text = segment.get("text", "")[:50] + "..." if len(segment.get("text", "")) > 50 else segment.get("text", "")
                confidence = segment.get("confidence", 0)
                lines.append(f"  {i+1}. [{speaker}] {text} (confidence: {confidence:.2f})")
            
            if len(segments) > 3:
                lines.append(f"  ... and {len(segments) - 3} more segments")
        else:
            lines.append("Transcription Segments: None available")
        
        lines.append("\n=== TRANSCRIPTION STATUS ===")
        lines.append(f"Status: {result.get('status', 'UNKNOWN')}")
        lines.append(f"Processing Time: {result.get('processing_time_seconds', 0):.2f} seconds")
        lines.append(f"Timestamp: {result.get('timestamp', 'N/A')}")
        
        return "\n".join(lines)
