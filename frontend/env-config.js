// Environment configuration for the frontend
// This file contains the correct Cloud Functions URLs

const envConfig = {
  // Cloud Functions URLs - UPDATED WITH CORRECT URLS
  NEXT_PUBLIC_PROCESS_INGESTION_URL: 'https://asia-south1-veritas-472301.cloudfunctions.net/process_ingestion_task',
  NEXT_PUBLIC_ON_FILE_UPLOAD_URL: 'https://on-file-upload-abvgpbhuca-el.a.run.app',
  NEXT_PUBLIC_TRIGGER_DILIGENCE_URL: 'https://trigger-diligence-abvgpbhuca-el.a.run.app',
  NEXT_PUBLIC_PROCESS_DILIGENCE_URL: 'https://asia-south1-veritas-472301.cloudfunctions.net/process_diligence_task',
  NEXT_PUBLIC_SCHEDULE_INTERVIEW_URL: 'https://schedule-ai-interview-abvgpbhuca-el.a.run.app',
  
  // Firebase Configuration
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'veritas-472301',
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'veritas-472301.firebaseapp.com',
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'veritas-472301.firebasestorage.app',
  
  // Analytics and App Configuration
  NEXT_PUBLIC_GA_PROPERTY_ID: '213025502',
  NEXT_PUBLIC_APP_NAME: 'Veritas',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000'
};

// Export for use in the application
module.exports = envConfig;

// Also set them as environment variables for build time
Object.keys(envConfig).forEach(key => {
  process.env[key] = envConfig[key];
});
