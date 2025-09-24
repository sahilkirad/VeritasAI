import logging
import os
import re
from datetime import datetime, timedelta
from googleapiclient.discovery import build
import google.auth

class CoordinatorAgent:
    """Agent 3: Schedules the AI Interview with the founder."""
    
    def __init__(self):
        self.scopes = ['https://www.googleapis.com/auth/calendar']
        self.logger = logging.getLogger(self.__class__.__name__)
        self.calendar_service = None

    def set_up(self):
        """Initializes the Google Calendar service using Application Default Credentials."""
        self.logger.info("Setting up CoordinatorAgent with Application Default Credentials...")
        try:
            # Use Application Default Credentials - this is the professional approach
            credentials, project = google.auth.default(scopes=self.scopes)
            self.logger.info(f"Using ADC for project: {project}")
            
            # Log which service account is being used (for debugging)
            if hasattr(credentials, 'service_account_email'):
                self.logger.info(f"Service account: {credentials.service_account_email}")
            else:
                self.logger.info(f"Credential type: {type(credentials)}")
            
            self.calendar_service = build('calendar', 'v3', credentials=credentials)
            self.logger.info("✅ CoordinatorAgent setup complete with ADC.")
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
        if not calendar_id or '@' not in calendar_id:
            return {"status": "FAILED", "error": f"Invalid calendar ID format: {calendar_id}"}
        
        try:
            # Test calendar access first
            self.logger.info("Testing calendar access...")
            try:
                calendar = self.calendar_service.calendars().get(calendarId=calendar_id).execute()
                self.logger.info(f"✅ Calendar accessible: {calendar.get('summary', 'Unknown')}")
            except Exception as e:
                self.logger.error(f"❌ Cannot access calendar: {e}")
                return {"status": "FAILED", "error": f"Cannot access calendar: {str(e)}"}
            
            event = self._create_calendar_event(calendar_id, founder_email, investor_email, startup_name)
            return {
                "status": "SUCCESS",
                "message": "AI Interview scheduled successfully.",
                "eventLink": event.get('htmlLink'),
                "eventId": event.get('id'),
                "meetLink": event.get('conferenceData', {}).get('entryPoints', [{}])[0].get('uri', 'N/A')
            }
        except Exception as e:
            self.logger.error(f"Failed to schedule meeting: {e}", exc_info=True)
            return {"status": "FAILED", "error": str(e)}

    def _create_calendar_event(self, calendar_id: str, founder_email: str, investor_email: str, startup_name: str) -> dict:
        """Creates the Google Calendar event with a Meet link."""
        # Schedule for tomorrow at 11:00 AM IST
        start_time = (datetime.now() + timedelta(days=1)).replace(hour=11, minute=0, second=0, microsecond=0)
        end_time = start_time + timedelta(minutes=30)

        event_body = {
            'summary': f'AI Interview: Veritas AI <> {startup_name}',
            'description': f'Automated first-round screening interview with the Veritas AI Analyst.\n\nStartup: {startup_name}\nFounder: {founder_email}\nInvestor: {investor_email}',
            'start': {'dateTime': start_time.isoformat(), 'timeZone': 'Asia/Kolkata'},
            'end': {'dateTime': end_time.isoformat(), 'timeZone': 'Asia/Kolkata'},
            'attendees': [
                {'email': founder_email, 'displayName': 'Founder'},
                {'email': investor_email, 'displayName': 'Investor'}
            ],
            'conferenceData': {
                'createRequest': {
                    'requestId': f'veritas-{startup_name.replace(" ", "-")}-{int(start_time.timestamp())}',
                    'conferenceSolutionKey': {'type': 'hangoutsMeet'}
                }
            },
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
        
        event = self.calendar_service.events().insert(
            calendarId=calendar_id,
            body=event_body,
            conferenceDataVersion=1
        ).execute()
        
        self.logger.info(f"Event created successfully: {event.get('htmlLink')}")
        return event