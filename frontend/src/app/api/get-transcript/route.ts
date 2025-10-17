import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    const meetingId = searchParams.get('meeting_id');

    if (!sessionId && !meetingId) {
      return NextResponse.json(
        { error: 'Missing session_id or meeting_id' },
        { status: 400 }
      );
    }

    // Call the Firebase Function to get transcript
    const functionsUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL || 
                        'http://127.0.0.1:5001/veritas-472301/asia-south1';
    
    const response = await fetch(`${functionsUrl}/get_transcript`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer bypass-token',
      },
      body: JSON.stringify({
        session_id: sessionId,
        meeting_id: meetingId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Firebase Function error:', errorText);
      return NextResponse.json(
        { error: 'Failed to get transcript from backend service' },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in get-transcript API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
