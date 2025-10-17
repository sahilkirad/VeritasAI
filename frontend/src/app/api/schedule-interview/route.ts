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

    // Call the Firebase Function
    const functionsUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL || 
                        'http://127.0.0.1:5001/veritas-472301/asia-south1';
    
    const response = await fetch(`${functionsUrl}/schedule_ai_interview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer bypass-token', // Using bypass token for local development
      },
      body: JSON.stringify({
        memo_id,
        founder_email,
        investor_email,
        startup_name,
        calendar_id: calendar_id || 'primary',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Firebase Function error:', errorText);
      return NextResponse.json(
        { error: 'Failed to schedule interview with backend service' },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in schedule-interview API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
