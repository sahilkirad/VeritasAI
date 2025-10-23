import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Use the original Firebase configuration but with a different approach
const firebaseConfig = {
  apiKey: "AIzaSyDJuzygstsuvpYofxhwnipGTH-3DzAkVQM",
  authDomain: "veritas-472301.firebaseapp.com",
  projectId: "veritas-472301",
  storageBucket: "veritas-472301.firebasestorage.app",
  messagingSenderId: "533015987350",
  appId: "1:533015987350:web:d6080ff950f86137352eb7",
  measurementId: "G-PRT33XGJNS",
};

// Initialize Firebase with error handling
let app: any;
let auth: any, db: any, storage: any;

try {
  // Check if Firebase is already initialized
  const existingApps = getApps();
  if (existingApps.length > 0) {
    app = existingApps[0];
    console.log('✅ Using existing Firebase app');
  } else {
    // Initialize with a consistent name
    app = initializeApp(firebaseConfig, 'veritas-app');
    console.log('✅ Firebase initialized successfully');
  }
  
  // Initialize services
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  
  // Fallback: try to get existing app
  try {
    app = getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log('✅ Using existing Firebase app as fallback');
  } catch (fallbackError) {
    console.error('❌ Fallback also failed:', fallbackError);
    throw new Error('Firebase initialization completely failed');
  }
}

export { auth, db, storage };
export default app;

// Type the db export properly
export type { Firestore } from 'firebase/firestore';
