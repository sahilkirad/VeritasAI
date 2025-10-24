import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

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

// Initialize Firebase with proper singleton pattern
let app: any = null;
let auth: any = null, db: any = null, storage: any = null;

// Only initialize Firebase once
if (typeof window !== 'undefined') {
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
    
    console.log('✅ Firebase services initialized:', {
      auth: !!auth,
      db: !!db,
      storage: !!storage
    });
    
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    // Don't throw error, just set to null and handle gracefully
    app = null;
    auth = null;
    db = null;
    storage = null;
    console.warn('⚠️ Firebase services not available - some features may not work');
  }
}

// Export with null checks
export { auth, db, storage };
export default app;

// Add safety checks for Firebase services
export const getFirebaseAuth = () => auth;
export const getFirebaseDb = () => db;
export const getFirebaseStorage = () => storage;

// Type the db export properly
export type { Firestore } from 'firebase/firestore';
