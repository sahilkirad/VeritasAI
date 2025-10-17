interface GoogleMeetEvent {
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees: Array<{ email: string }>;
  conferenceData: {
    createRequest: {
      conferenceSolutionKey: { type: string };
      requestId: string;
      status: { statusCode: string };
    };
  };
  sendUpdates: string;
  guestsCanInviteOthers: boolean;
  guestsCanModify: boolean;
  guestsCanSeeOtherGuests: boolean;
}

interface MeetCreationResult {
  success: boolean;
  meetLink?: string;
  eventId?: string;
  error?: string;
}

export class GoogleMeetService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL || 
                   'http://127.0.0.1:5001/veritas-472301/asia-south1';
  }

  async createAutomatedMeet(
    founderEmail: string,
    investorEmail: string,
    startupName: string,
    startTime: Date,
    durationMinutes: number = 45
  ): Promise<MeetCreationResult> {
    try {
      const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
      
      const event: GoogleMeetEvent = {
        summary: `Veritas AI Interview - ${startupName}`,
        description: "AI-led founder-investor interview auto-scheduled by Veritas platform. The AI bot will automatically join and conduct the interview.",
        start: {
          dateTime: startTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        attendees: [
          { email: founderEmail },
          { email: investorEmail },
          { email: "ai@veritas.in" } // AI bot email
        ],
        conferenceData: {
          createRequest: {
            conferenceSolutionKey: { type: "hangoutsMeet" },
            requestId: `veritas-meet-ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            status: { statusCode: "success" }
          }
        },
        sendUpdates: "all",
        guestsCanInviteOthers: false,
        guestsCanModify: false,
        guestsCanSeeOtherGuests: true
      };

      const response = await fetch(`${this.baseUrl}/schedule_ai_interview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer bypass-token',
        },
        body: JSON.stringify({
          founder_email: founderEmail,
          investor_email: investorEmail,
          startup_name: startupName,
          event_data: event,
          auto_join: true
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Meet creation failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        meetLink: result.meet_link,
        eventId: result.event_id
      };

    } catch (error) {
      console.error('Error creating Google Meet:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async createImmediateMeet(
    founderEmail: string,
    investorEmail: string,
    startupName: string
  ): Promise<MeetCreationResult> {
    // Create a meet that starts in 2 minutes
    const startTime = new Date(Date.now() + 2 * 60000);
    return this.createAutomatedMeet(founderEmail, investorEmail, startupName, startTime, 45);
  }

  async createScheduledMeet(
    founderEmail: string,
    investorEmail: string,
    startupName: string,
    scheduledTime: string
  ): Promise<MeetCreationResult> {
    const startTime = new Date(scheduledTime);
    return this.createAutomatedMeet(founderEmail, investorEmail, startupName, startTime, 45);
  }

  async joinMeetAsAI(meetLink: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/join_meet_as_ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer bypass-token',
        },
        body: JSON.stringify({
          meet_link: meetLink,
          ai_email: "ai@veritas.in"
        }),
      });

      if (!response.ok) {
        throw new Error(`AI join failed: ${response.status}`);
      }

      const result = await response.json();
      return result.success || false;

    } catch (error) {
      console.error('Error joining meet as AI:', error);
      return false;
    }
  }

  async startAutomatedInterview(meetLink: string, sessionId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/start_automated_interview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer bypass-token',
        },
        body: JSON.stringify({
          meet_link: meetLink,
          session_id: sessionId,
          ai_email: "ai@veritas.in"
        }),
      });

      if (!response.ok) {
        throw new Error(`Automated interview start failed: ${response.status}`);
      }

      const result = await response.json();
      return result.success || false;

    } catch (error) {
      console.error('Error starting automated interview:', error);
      return false;
    }
  }

  generateMeetPayload(
    founderEmail: string,
    investorEmail: string,
    startupName: string,
    startTime: Date,
    durationMinutes: number = 45
  ): GoogleMeetEvent {
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
    
    return {
      summary: `Veritas AI Interview - ${startupName}`,
      description: "AI-led founder-investor interview auto-scheduled by Veritas platform. The AI bot will automatically join and conduct the interview.",
      start: {
        dateTime: startTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      attendees: [
        { email: founderEmail },
        { email: investorEmail },
        { email: "ai@veritas.in" }
      ],
      conferenceData: {
        createRequest: {
          conferenceSolutionKey: { type: "hangoutsMeet" },
          requestId: `veritas-meet-ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          status: { statusCode: "success" }
        }
      },
      sendUpdates: "all",
      guestsCanInviteOthers: false,
      guestsCanModify: false,
      guestsCanSeeOtherGuests: true
    };
  }
}

export const googleMeetService = new GoogleMeetService();
export type { GoogleMeetEvent, MeetCreationResult };
