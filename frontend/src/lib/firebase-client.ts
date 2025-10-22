// lib/firebase-client.ts
// Client-side only Firebase initialization with dynamic imports

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDJuzygstsuvpYofxhwnipGTH-3DzAkVQM",
  authDomain: "veritas-472301.firebaseapp.com",
  projectId: "veritas-472301",
  storageBucket: "veritas-472301.firebasestorage.app",
  messagingSenderId: "533015987350",
  appId: "1:533015987350:web:d6080ff950f86137352eb7",
  measurementId: "G-PRT33XGJNS",
};

// Initialize Firebase only on client side
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

export function initializeFirebase() {
  // Only run on client side
  if (typeof window === 'undefined') {
    return { app: null, auth: null, db: null, storage: null };
  }

  try {
    // Check if Firebase is already initialized
    const existingApps = getApps();
    if (existingApps.length > 0) {
      app = existingApps[0];
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
      console.log('✅ Firebase already initialized');
    } else {
      // Initialize Firebase
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
      console.log('✅ Firebase initialized successfully');
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
    // Return null values if initialization fails
    app = null;
    auth = null;
    db = null;
    storage = null;
  }

  return { app, auth, db, storage };
}

// Initialize Firebase immediately on client side
if (typeof window !== 'undefined') {
  const firebase = initializeFirebase();
  app = firebase.app;
  auth = firebase.auth;
  db = firebase.db;
  storage = firebase.storage;
}

export { app, auth, db, storage };
export default app;
