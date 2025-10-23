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
let app: any = null;
let auth: any = null, db: any = null, storage: any = null;

try {
  console.log('🔄 Initializing Firebase...');
  console.log('🔄 Firebase config:', firebaseConfig);
  
  // Check if Firebase is already initialized
  const existingApps = getApps();
  console.log('🔄 Existing apps:', existingApps.length);
  
  if (existingApps.length > 0) {
    app = existingApps[0];
    console.log('✅ Using existing Firebase app');
  } else {
    // Initialize with a consistent name
    app = initializeApp(firebaseConfig, 'veritas-app');
    console.log('✅ Firebase initialized successfully');
  }
  
  // Initialize services
  console.log('🔄 Initializing Firebase services...');
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
  console.error('❌ Firebase initialization error details:', {
    message: error.message,
    stack: error.stack,
    name: error.name
  });
  
  // Fallback: try to get existing app
  try {
    console.log('🔄 Trying fallback initialization...');
    app = getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log('✅ Using existing Firebase app as fallback');
  } catch (fallbackError) {
    console.error('❌ Fallback also failed:', fallbackError);
    console.error('❌ Fallback error details:', {
      message: fallbackError.message,
      stack: fallbackError.stack,
      name: fallbackError.name
    });
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
