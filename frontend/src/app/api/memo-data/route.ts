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
    const dealId = searchParams.get('dealId');
    const memoType = searchParams.get('type') || 'memo_1';

    const db = getFirestore();
    
    if (dealId) {
      // Get specific memo by dealId
      const docRef = db.collection('ingestionResults').doc(dealId);
      const doc = await docRef.get();

      if (!doc.exists) {
        return NextResponse.json({ error: 'Memo not found' }, { status: 404 });
      }

      const data = doc.data();
      const memo = data?.[memoType] || data?.memo_1;

      if (!memo) {
        return NextResponse.json({ error: 'Memo data not found' }, { status: 404 });
      }

      return NextResponse.json({ 
        memo: {
          id: doc.id,
          ...memo,
          original_filename: data?.original_filename,
          status: data?.status,
          timestamp: data?.timestamp
        }
      });
    } else {
      // Get all memos from ingestionResults collection
      const snapshot = await db.collection('ingestionResults')
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get();

      const memos = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.status === 'SUCCESS' && data.memo_1) {
          memos.push({
            id: doc.id,
            ...data,
            memo_1: data.memo_1
          });
        }
      });

      return NextResponse.json({ memos });
    }
  } catch (error) {
    console.error('Error fetching memo:', error);
    return NextResponse.json(
      { error: 'Failed to fetch memo' },
      { status: 500 }
    );
  }
}