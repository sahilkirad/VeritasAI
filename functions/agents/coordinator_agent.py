import logging
import os
import re
import json
from datetime import datetime, timedelta
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

class CoordinatorAgent:
    """Agent 3: Schedules the AI Interview with the founder."""
    
    def __init__(self):
        self.scopes = ['https://www.googleapis.com/auth/calendar']
        self.logger = logging.getLogger(self.__class__.__name__)
        self.calendar_service = None
        self.credentials = None

    def set_up(self):
        """Initializes the Google Calendar service using Service Account authentication."""
        self.logger.info("Setting up CoordinatorAgent with Service Account authentication...")
        try:
            # Use Service Account authentication (simple and reliable)
            import google.auth
            from google.oauth2 import service_account
            
            # Use Application Default Credentials (ADC) which automatically uses the service account
            credentials, project = google.auth.default(scopes=self.scopes)
            self.logger.info(f"Using ADC for project: {project}")
            self.logger.info(f"Service account email: {credentials.service_account_email}")
            
            self.calendar_service = build('calendar', 'v3', credentials=credentials)
            self.logger.info("✅ CoordinatorAgent setup complete with Service Account.")
        except Exception as e:
            self.logger.error(f"Failed to initialize CoordinatorAgent: {e}", exc_info=True)
            raise

    def run(self, calendar_id: str, founder_email: str, investor_email: str, startup_name: str) -> dict:
        """Main entry point to schedule a meeting."""
        self.logger.info(f"Attempting to schedule meeting for {startup_name}...")
        self.logger.info(f"Calendar ID: {calendar_id}")
        
        # Validate required parameters
        if not all([calendar_id, founder_email, investor_email, startup_name]):
            return {"status": "FAILED", "error": "Missing required parameters: calendar_id, founder_email, investor_email, startup_name"}
        
        # Validate email format
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, founder_email):
            return {"status": "FAILED", "error": f"Invalid founder email format: {founder_email}"}
        if not re.match(email_pattern, investor_email):
            return {"status": "FAILED", "error": f"Invalid investor email format: {investor_email}"}
        
        # Validate calendar ID format
        if not calendar_id or (calendar_id != "primary" and '@' not in calendar_id):
            return {"status": "FAILED", "error": f"Invalid calendar ID format: {calendar_id}"}
        
        try:
            # Test calendar access first
            self.logger.info("Testing calendar access...")
            self.logger.info(f"Using calendar ID: {calendar_id}")
            
            # Try to access the specific calendar
            try:
                calendar = self.calendar_service.calendars().get(calendarId=calendar_id).execute()
                self.logger.info(f"✅ Calendar accessible: {calendar.get('summary', 'Unknown')}")
                self.logger.info(f"Calendar ID: {calendar.get('id')}")
                self.logger.info(f"Calendar access role: {calendar.get('accessRole', 'Unknown')}")
            except Exception as e:
                self.logger.error(f"❌ Cannot access specified calendar: {e}")
                # Try to list all accessible calendars for debugging
                try:
                    calendar_list = self.calendar_service.calendarList().list().execute()
                    accessible_calendars = [cal.get('id') for cal in calendar_list.get('items', [])]
                    self.logger.info(f"Accessible calendars: {accessible_calendars}")
                except Exception as list_error:
                    self.logger.error(f"Could not list calendars: {list_error}")
                return {"status": "FAILED", "error": f"Cannot access Veritas calendar: {str(e)}"}
            
            # Create the event in Veritas calendar
            event = self._create_calendar_event(calendar_id, founder_email, investor_email, startup_name)
            return {
                "status": "SUCCESS",
                "message": "AI Interview scheduled successfully in Veritas calendar.",
                "eventLink": event.get('htmlLink'),
                "eventId": event.get('id'),
                "calendarId": calendar_id
            }
        except Exception as e:
            self.logger.error(f"Failed to schedule meeting: {e}", exc_info=True)
            return {"status": "FAILED", "error": str(e)}

    def _create_calendar_event(self, calendar_id: str, founder_email: str, investor_email: str, startup_name: str) -> dict:
        """Creates the Google Calendar event with a Meet link (Service Account approach)."""
        # Schedule for tomorrow at 11:00 AM IST
        start_time = (datetime.now() + timedelta(days=1)).replace(hour=11, minute=0, second=0, microsecond=0)
        end_time = start_time + timedelta(minutes=30)

        event_body = {
            'summary': f'AI Interview: Veritas AI <> {startup_name}',
            'description': f'Automated first-round screening interview with the Veritas AI Analyst.\n\nStartup: {startup_name}\nFounder: {founder_email}\nInvestor: {investor_email}\n\nThis is an AI-powered interview session.',
            'start': {'dateTime': start_time.isoformat(), 'timeZone': 'Asia/Kolkata'},
            'end': {'dateTime': end_time.isoformat(), 'timeZone': 'Asia/Kolkata'},
            'reminders': {
                'useDefault': False,
                'overrides': [
                    {'method': 'email', 'minutes': 24 * 60},  # 1 day before
                    {'method': 'popup', 'minutes': 30}        # 30 minutes before
                ]
            }
        }

        self.logger.info(f"Creating event on calendar: {calendar_id}")
        self.logger.info(f"Event time: {start_time.strftime('%Y-%m-%d %H:%M')} IST")
        
        try:
            # Create simple event (no conference data, no attendees)
            event = self.calendar_service.events().insert(
                calendarId=calendar_id,
                body=event_body
            ).execute()
            
            self.logger.info(f"✅ Event created successfully: {event.get('htmlLink')}")
            return event
        except Exception as e:
            self.logger.error(f"Failed to create calendar event: {e}")
            raise