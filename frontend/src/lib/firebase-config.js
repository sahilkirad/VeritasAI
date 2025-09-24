// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "your_firebase_api_key",
  authDomain: "veritas-472301.firebaseapp.com",
  projectId: "veritas-472301",
  storageBucket: "veritas-472301.firebasestorage.app",
  messagingSenderId: "533015987350",
  appId: "1:533015987350:web:d6080ff950f86137352eb7",
  measurementId: "G-PRT33XGJNS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
export default app;
