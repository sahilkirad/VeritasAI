"""
MeetingAgent - Layer 2 AI Interview System
Purpose: Schedule AI-led Google Meet calls between founders & investors.
APIs: Google Calendar API, Meet API
"""

from typing import Callable, Sequence, Dict, List, Any, Optional, Iterable
import os
import json
import uuid
from datetime import datetime, timedelta
import logging
from pathlib import Path
from collections import Counter

import google.auth
from googleapiclient.discovery import build
from firebase_admin import firestore

class MeetingAgent:
    """Agent responsible for scheduling AI-led Google Meet calls."""
    
    def __init__(
        self,
        project_id: str = "veritas-472301",
        calendar_id: str = "primary",
        organizer_email: str = "swaroopthakare@gmail.com",
        meeting_duration_hours: int = 1,
        send_notifications: bool = True
    ):
        self.project_id = project_id
        self.calendar_id = calendar_id
        self.organizer_email = organizer_email
        self.meeting_duration_hours = meeting_duration_hours
        self.send_notifications = send_notifications
        
        self.calendar_service = None
        self.db = None
        
        # Setup logging
        self.logger = logging.getLogger(__name__)
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter('%(levelname)s:%(name)s:%(message)s')
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
            self.logger.setLevel(logging.INFO)
        
        # Google Calendar and Meet scopes
        self.scopes = [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events'
        ]
    
    def set_up(self):
        """Initialize Google Calendar service and Firestore client."""
        try:
            # Use Application Default Credentials (ADC) - Firebase service account
            credentials, project = google.auth.default(scopes=self.scopes)
            self.logger.info(f"Using Firebase service account for project: {project}")
            
            # Initialize Calendar service
            self.calendar_service = build('calendar', 'v3', credentials=credentials)
            
            # Initialize Firestore
            self.db = firestore.client()
            
            self.logger.info("MeetingAgent initialized successfully")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize MeetingAgent: {e}")
            raise
    
    def query(self, memo_id: str, founder_email: str, investor_email: str, 
              startup_name: str, **kwargs) -> Dict[str, Any]:
        """Main query method to schedule AI interview meeting"""
        start_time = datetime.now()
        
        try:
            # Schedule the meeting
            meeting_result = self.schedule_ai_interview(
                memo_id=memo_id,
                founder_email=founder_email,
                investor_email=investor_email,
                startup_name=startup_name
            )
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            return {
                "timestamp": datetime.now().isoformat(),
                "memo_id": memo_id,
                "startup_name": startup_name,
                "processing_time_seconds": processing_time,
                "meeting_details": meeting_result,
                "status": "SUCCESS"
            }
            
        except Exception as e:
            self.logger.error(f"Error scheduling AI interview: {str(e)}")
            processing_time = (datetime.now() - start_time).total_seconds()
            
            return {
                "timestamp": datetime.now().isoformat(),
                "memo_id": memo_id,
                "startup_name": startup_name,
                "processing_time_seconds": processing_time,
                "meeting_details": self._get_empty_meeting_result(),
                "status": "FAILED",
                "error": str(e)
            }

    def schedule_ai_interview(
        self, 
        memo_id: str, 
        founder_email: str, 
        investor_email: str, 
        startup_name: str,
        calendar_id: Optional[str] = None
    ) -> Dict:
        """
        Schedule an AI-led interview meeting.
        
        Args:
            memo_id: ID of the memo being discussed
            founder_email: Email of the founder
            investor_email: Email of the investor
            startup_name: Name of the startup
            calendar_id: Calendar ID (defaults to Veritas calendar)
        
        Returns:
            Dict with meeting details including meet_link and participants
        """
        if not self.calendar_service:
            self.set_up()
        
        # Use provided calendar_id or default to Veritas calendar
        if not calendar_id:
            calendar_id = self.calendar_id
        
        try:
            # Generate unique meeting ID
            meeting_id = f"ai_interview_{memo_id}_{uuid.uuid4().hex[:8]}"
            
            # Create calendar event with Google Meet
            event = self._create_meeting_event(
                calendar_id=calendar_id,
                founder_email=founder_email,
                investor_email=investor_email,
                startup_name=startup_name,
                meeting_id=meeting_id
            )
            
            # Extract Meet link
            meet_link = self._extract_meet_link(event)
            
            # Store meeting details in Firestore
            meeting_data = {
                'meeting_id': meeting_id,
                'memo_id': memo_id,
                'founder_email': founder_email,
                'investor_email': investor_email,
                'startup_name': startup_name,
                'meet_link': meet_link,
                'event_id': event.get('id'),
                'status': 'scheduled',
                'created_at': firestore.SERVER_TIMESTAMP,
                'scheduled_for': event.get('start', {}).get('dateTime'),
                'participants': [founder_email, investor_email, "ai@veritas.bot"]
            }
            
            # Store in Firestore
            doc_ref = self.db.collection('ai_interviews').document(meeting_id)
            doc_ref.set(meeting_data)
            
            self.logger.info(f"AI Interview scheduled successfully: {meeting_id}")
            
            return {
                "status": "success",
                "meeting_id": meeting_id,
                "meet_link": meet_link,
                "participants": [founder_email, investor_email, "AI Analyst"],
                "event_id": event.get('id'),
                "scheduled_for": event.get('start', {}).get('dateTime')
            }
            
        except Exception as e:
            self.logger.error(f"Failed to schedule AI interview: {e}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    def _create_meeting_event(
        self, 
        calendar_id: str, 
        founder_email: str, 
        investor_email: str, 
        startup_name: str,
        meeting_id: str
    ) -> Dict:
        """Create a Google Calendar event with Google Meet link."""
        
        # Schedule for tomorrow at 11:00 AM IST
        start_time = datetime.now() + timedelta(days=1)
        start_time = start_time.replace(hour=11, minute=0, second=0, microsecond=0)
        end_time = start_time + timedelta(hours=1)
        
        event_body = {
            'summary': f'🤖 AI Interview: {startup_name}',
            'description': f'''🤖 AI-Powered Investment Interview Session

📋 MEETING DETAILS:
• Startup: {startup_name}
• Founder: {founder_email}
• Investor: {investor_email}
• AI Analyst: ai@veritas.bot (Veritas AI)

🆔 Meeting ID: {meeting_id}
⏱️ Duration: 60 minutes
📅 Date: {start_time.strftime('%A, %B %d, %Y')}
🕐 Time: {start_time.strftime('%I:%M %p')} IST

🎯 WHAT TO EXPECT:
• AI Analyst will join the meeting to assist with diligence questions
• Real-time transcription and analysis
• Dynamic Q&A based on Memo 1 insights
• Post-meeting: AI will generate Memo 2 (Deep Dive Summary)

📧 This is an automated AI Interview session scheduled by Veritas AI.
Please join the Google Meet link when the meeting starts.

---
Veritas AI - Intelligent Investment Analysis Platform''',
            'start': {
                'dateTime': start_time.isoformat(),
                'timeZone': 'Asia/Kolkata'
            },
            'end': {
                'dateTime': end_time.isoformat(),
                'timeZone': 'Asia/Kolkata'
            },
            # Note: Attendees removed to avoid service account permission issues
            # The meeting will be created without email invitations
            'conferenceData': {
                'createRequest': {
                    'requestId': meeting_id,
                    'conferenceSolutionKey': {'type': 'hangoutsMeet'}
                }
            },
            'conferenceDataVersion': 1,
            'reminders': {
                'useDefault': False,
                'overrides': [
                    {'method': 'email', 'minutes': 60},
                    {'method': 'popup', 'minutes': 10}
                ]
            }
        }
        
        # Create the event
        event = self.calendar_service.events().insert(
            calendarId=calendar_id,
            body=event_body,
            conferenceDataVersion=1
            # Note: sendUpdates removed to avoid service account permission issues
        ).execute()
        
        self.logger.info(f"Calendar event created: {event.get('id')}")
        return event
    
    def _extract_meet_link(self, event: Dict) -> str:
        """Extract Google Meet link from calendar event."""
        try:
            conference_data = event.get('conferenceData', {})
            entry_points = conference_data.get('entryPoints', [])
            
            if entry_points:
                meet_link = entry_points[0].get('uri', '')
                if meet_link:
                    self.logger.info(f"Meet link extracted: {meet_link}")
                    return meet_link
            
            # Fallback: create basic Meet link
            event_id = event.get('id', '')
            if event_id:
                fallback_link = f"https://meet.google.com/new?authuser=0&hs=179&pli=1&authuser=0#meeting/{event_id}"
                self.logger.info(f"Using fallback Meet link: {fallback_link}")
                return fallback_link
            
            return 'N/A'
            
        except Exception as e:
            self.logger.error(f"Error extracting Meet link: {e}")
            return 'N/A'
    
    def get_meeting_status(self, meeting_id: str) -> Dict:
        """Get the current status of a meeting."""
        try:
            doc_ref = self.db.collection('ai_interviews').document(meeting_id)
            doc = doc_ref.get()
            
            if doc.exists:
                return {
                    "status": "success",
                    "meeting_data": doc.to_dict()
                }
            else:
                return {
                    "status": "error",
                    "error": "Meeting not found"
                }
                
        except Exception as e:
            self.logger.error(f"Error getting meeting status: {e}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    def _get_empty_meeting_result(self) -> Dict[str, Any]:
        """Return empty meeting result for error cases"""
        return {
            "meeting_id": "N/A",
            "meet_link": "N/A",
            "participants": [],
            "event_id": "N/A",
            "scheduled_for": "N/A"
        }
    
    def summarize(self, result: Dict[str, Any]) -> str:
        """Convert meeting results to human-readable summary"""
        if result.get("status") == "FAILED":
            return f"❌ MEETING SCHEDULING FAILED: {result.get('error', 'Unknown error')}"
        
        meeting_details = result.get("meeting_details", {})
        
        lines = []
        lines.append("=== AI INTERVIEW MEETING SCHEDULED ===")
        
        startup_name = result.get("startup_name", "Unknown Startup")
        memo_id = result.get("memo_id", "Unknown Memo")
        lines.append(f"Startup: {startup_name}")
        lines.append(f"Memo ID: {memo_id}")
        
        meet_link = meeting_details.get("meet_link", "N/A")
        if meet_link != "N/A":
            lines.append(f"Google Meet Link: {meet_link}")
        else:
            lines.append("Google Meet Link: Not available")
        
        participants = meeting_details.get("participants", [])
        if participants:
            lines.append(f"Participants: {', '.join(participants)}")
        else:
            lines.append("Participants: Not specified")
        
        scheduled_for = meeting_details.get("scheduled_for", "N/A")
        if scheduled_for != "N/A":
            lines.append(f"Scheduled for: {scheduled_for}")
        else:
            lines.append("Scheduled for: Not specified")
        
        lines.append("\n=== MEETING STATUS ===")
        lines.append(f"Status: {result.get('status', 'UNKNOWN')}")
        lines.append(f"Processing Time: {result.get('processing_time_seconds', 0):.2f} seconds")
        lines.append(f"Timestamp: {result.get('timestamp', 'N/A')}")
        
        return "\n".join(lines)
