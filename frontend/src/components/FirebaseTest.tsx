'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase-new';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function FirebaseTest() {
  const [status, setStatus] = useState<string>('Testing Firebase connection...');
  const [authStatus, setAuthStatus] = useState<string>('Checking auth...');
  const [firestoreStatus, setFirestoreStatus] = useState<string>('Checking Firestore...');

  useEffect(() => {
    // Test Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthStatus('✅ Firebase Auth: Connected (User logged in)');
      } else {
        setAuthStatus('✅ Firebase Auth: Connected (No user)');
      }
    });

    // Test Firestore
    const testFirestore = async () => {
      try {
        const testDoc = doc(db, 'test', 'connection');
        await setDoc(testDoc, { timestamp: new Date().toISOString() });
        const docSnap = await getDoc(testDoc);
        if (docSnap.exists()) {
          setFirestoreStatus('✅ Firestore: Connected and working');
        } else {
          setFirestoreStatus('❌ Firestore: Connected but write failed');
        }
      } catch (error) {
        setFirestoreStatus(`❌ Firestore: Error - ${error}`);
      }
    };

    testFirestore();

    // Overall status
    setTimeout(() => {
      setStatus('✅ Firebase connection test complete');
    }, 2000);

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-2">Firebase Connection Test</h3>
      <div className="space-y-1 text-sm">
        <div>{status}</div>
        <div>{authStatus}</div>
        <div>{firestoreStatus}</div>
      </div>
    </div>
  );
}
