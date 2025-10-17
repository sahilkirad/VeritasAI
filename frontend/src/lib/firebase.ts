import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration with multiple fallback options
const firebaseConfigs = [
  // Primary config from environment
  {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  },
  // Fallback config with hardcoded values
  {
    apiKey: "AIzaSyDJuzygstsuvpYofxhwnipGTH-3DzAkVQM",
    authDomain: "veritas-472301.firebaseapp.com",
    projectId: "veritas-472301",
    storageBucket: "veritas-472301.firebasestorage.app",
    messagingSenderId: "533015987350",
    appId: "1:533015987350:web:d6080ff950f86137352eb7",
    measurementId: "G-PRT33XGJNS",
  },
  // Alternative config for testing
  {
    apiKey: "AIzaSyDJuzygstsuvpYofxhwnipGTH-3DzAkVQM",
    authDomain: "veritas-472301.firebaseapp.com",
    projectId: "veritas-472301",
    storageBucket: "veritas-472301.firebasestorage.app",
    messagingSenderId: "533015987350",
    appId: "1:533015987350:web:d6080ff950f86137352eb7",
  }
];

// Initialize Firebase with fallback
let app;
let auth, db, storage;

for (let i = 0; i < firebaseConfigs.length; i++) {
  try {
    const config = firebaseConfigs[i];
    
    // Skip if config is incomplete
    if (!config.apiKey || !config.projectId) {
      continue;
    }
    
    console.log(`Trying Firebase config ${i + 1}:`, config);
    
    // Check if Firebase is already initialized
    if (getApps().length > 0) {
      app = getApp();
    } else {
      app = initializeApp(config, `veritas-app-${i}`);
    }
    
    // Initialize services
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    console.log('✅ Firebase initialized successfully with config', i + 1);
    break;
    
  } catch (error) {
    console.error(`❌ Firebase config ${i + 1} failed:`, error);
    if (i === firebaseConfigs.length - 1) {
      throw new Error('All Firebase configurations failed');
    }
  }
}

export { auth, db, storage };
export default app;
