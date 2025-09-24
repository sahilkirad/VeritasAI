import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dealId = searchParams.get('dealId');
    const memoType = searchParams.get('type') || 'memo1';

    if (!dealId) {
      return NextResponse.json({ error: 'Deal ID required' }, { status: 400 });
    }

    // Get memo from Firestore
    const memoRef = collection(db, 'memoResults');
    const q = query(memoRef, where('dealId', '==', dealId), where('type', '==', memoType));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json({ error: 'Memo not found' }, { status: 404 });
    }

    const memo = snapshot.docs[0].data();
    return NextResponse.json({ memo });
  } catch (error) {
    console.error('Error fetching memo:', error);
    return NextResponse.json(
      { error: 'Failed to fetch memo' },
      { status: 500 }
    );
  }
}