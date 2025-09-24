// Environment configuration - inline for ES modules
const envConfig = {
  NEXT_PUBLIC_PROCESS_INGESTION_URL: 'https://asia-south1-veritas-472301.cloudfunctions.net/process_ingestion_task',
  NEXT_PUBLIC_ON_FILE_UPLOAD_URL: 'https://on-file-upload-abvgpbhuca-el.a.run.app',
  NEXT_PUBLIC_TRIGGER_DILIGENCE_URL: 'https://trigger-diligence-abvgpbhuca-el.a.run.app',
  NEXT_PUBLIC_PROCESS_DILIGENCE_URL: 'https://asia-south1-veritas-472301.cloudfunctions.net/process_diligence_task',
  NEXT_PUBLIC_SCHEDULE_INTERVIEW_URL: 'https://schedule-ai-interview-abvgpbhuca-el.a.run.app',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'veritas-472301',
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'veritas-472301.firebaseapp.com',
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'veritas-472301.firebasestorage.app',
  NEXT_PUBLIC_GA_PROPERTY_ID: '213025502',
  NEXT_PUBLIC_APP_NAME: 'Veritas',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000'
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    // Set environment variables for build time
    NEXT_PUBLIC_PROCESS_INGESTION_URL: envConfig.NEXT_PUBLIC_PROCESS_INGESTION_URL,
    NEXT_PUBLIC_ON_FILE_UPLOAD_URL: envConfig.NEXT_PUBLIC_ON_FILE_UPLOAD_URL,
    NEXT_PUBLIC_TRIGGER_DILIGENCE_URL: envConfig.NEXT_PUBLIC_TRIGGER_DILIGENCE_URL,
    NEXT_PUBLIC_PROCESS_DILIGENCE_URL: envConfig.NEXT_PUBLIC_PROCESS_DILIGENCE_URL,
    NEXT_PUBLIC_SCHEDULE_INTERVIEW_URL: envConfig.NEXT_PUBLIC_SCHEDULE_INTERVIEW_URL,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: envConfig.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: envConfig.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: envConfig.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_GA_PROPERTY_ID: envConfig.NEXT_PUBLIC_GA_PROPERTY_ID,
    NEXT_PUBLIC_APP_NAME: envConfig.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL: envConfig.NEXT_PUBLIC_APP_URL,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      net: false,
      fs: false,
      tls: false,
    };
    return config;
  },
}

export default nextConfig