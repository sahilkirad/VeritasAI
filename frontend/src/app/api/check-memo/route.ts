import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
let firebaseInitialized = false;
if (!getApps().length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  
  if (!privateKey || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    console.error('Firebase Admin SDK environment variables are not properly configured');
    console.error('Required: FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  } else {
    try {
      initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
      firebaseInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Firebase Admin SDK:', error);
    }
  }
} else {
  firebaseInitialized = true;
}

export async function GET(request: NextRequest) {
  try {
    // Check if Firebase is properly initialized
    if (!firebaseInitialized) {
      return NextResponse.json(
        { error: 'Firebase Admin SDK not properly configured. Please check environment variables.' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');

    if (!fileName) {
      return NextResponse.json({ error: 'File name required' }, { status: 400 });
    }

    const db = getFirestore();
    
    // Search for memo by filename in ingestionResults
    const query = await db.collection('ingestionResults')
      .where('filename', '==', fileName)
      .limit(1)
      .get();

    if (!query.empty) {
      const doc = query.docs[0];
      return NextResponse.json({ 
        memoId: doc.id,
        status: 'found'
      });
    }

    return NextResponse.json({ status: 'not_found' });

  } catch (error) {
    console.error('Error checking memo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}