import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { memo_id, founder_email, investor_email, startup_name, calendar_id } = body;

    // Validate required fields
    if (!memo_id || !founder_email || !investor_email || !startup_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Call the Firebase Function to schedule the interview
    const functionsUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL || 
                        'http://127.0.0.1:5001/veritas-472301/asia-south1';
    
    const scheduleResponse = await fetch(`${functionsUrl}/schedule_ai_interview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer bypass-token',
      },
      body: JSON.stringify({
        memo_id,
        founder_email,
        investor_email,
        startup_name,
        calendar_id: calendar_id || 'primary',
      }),
    });

    if (!scheduleResponse.ok) {
      const errorText = await scheduleResponse.text();
      console.error('Firebase Function error:', errorText);
      return NextResponse.json(
        { error: 'Failed to schedule interview with backend service' },
        { status: scheduleResponse.status }
      );
    }

    const scheduleResult = await scheduleResponse.json();

    // Now start the transcription/meeting
    const startResponse = await fetch(`${functionsUrl}/start_transcription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer bypass-token',
      },
      body: JSON.stringify({
        meeting_id: scheduleResult.meeting_id || `meeting_${Date.now()}`,
        audio_config: {
          encoding: 'WEBM_OPUS',
          sample_rate_hertz: 48000,
          language_code: 'en-US',
        },
      }),
    });

    if (!startResponse.ok) {
      console.warn('Failed to start transcription, but interview is scheduled');
    }

    return NextResponse.json({
      ...scheduleResult,
      started: true,
      message: 'Interview scheduled and started successfully',
      session_id: scheduleResult.session_id || `session_${Date.now()}`
    });

  } catch (error) {
    console.error('Error in start-interview API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
