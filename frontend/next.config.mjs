// Environment configuration - inline for ES modules
const envConfig = {
  NEXT_PUBLIC_PROCESS_INGESTION_URL: 'https://asia-south1-veritas-472301.cloudfunctions.net/process_ingestion_task',
  NEXT_PUBLIC_ON_FILE_UPLOAD_URL: 'https://asia-south1-veritas-472301.cloudfunctions.net/on_file_upload',
  NEXT_PUBLIC_TRIGGER_DILIGENCE_URL: 'https://asia-south1-veritas-472301.cloudfunctions.net/trigger_diligence',
  NEXT_PUBLIC_PROCESS_DILIGENCE_URL: 'https://asia-south1-veritas-472301.cloudfunctions.net/process_diligence_task',
  NEXT_PUBLIC_SCHEDULE_INTERVIEW_URL: 'https://asia-south1-veritas-472301.cloudfunctions.net/schedule_ai_interview',
  NEXT_PUBLIC_RUN_DILIGENCE_URL: 'https://asia-south1-veritas-472301.cloudfunctions.net/run_diligence',
  NEXT_PUBLIC_QUERY_DILIGENCE_URL: 'https://asia-south1-veritas-472301.cloudfunctions.net/query_diligence',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'veritas-472301',
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'your_firebase_api_key',
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'veritas-472301.firebaseapp.com',
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'veritas-472301.firebasestorage.app',
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '533015987350',
  NEXT_PUBLIC_FIREBASE_APP_ID: '1:533015987350:web:d6080ff950f86137352eb7',
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: 'G-PRT33XGJNS',
  NEXT_PUBLIC_GA_PROPERTY_ID: '213025502',
  NEXT_PUBLIC_APP_NAME: 'Veritas',
  NEXT_PUBLIC_APP_URL: 'https://veritas-472301.web.app'
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use static export but with dynamic routes support
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true
  },
  experimental: {
    esmExternals: false
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Enable dynamic routes for interview functionality
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  // Optimize for dynamic pages
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  // Enable client-side routing for dynamic pages
  async rewrites() {
    return [
      {
        source: '/interview/:path*',
        destination: '/interview'
      },
      {
        source: '/dashboard/:path*',
        destination: '/dashboard'
      },
      {
        source: '/founder/dashboard/:path*',
        destination: '/founder/dashboard'
      }
    ]
  },
  env: {
    // Set environment variables for build time
    NEXT_PUBLIC_PROCESS_INGESTION_URL: envConfig.NEXT_PUBLIC_PROCESS_INGESTION_URL,
    NEXT_PUBLIC_ON_FILE_UPLOAD_URL: envConfig.NEXT_PUBLIC_ON_FILE_UPLOAD_URL,
    NEXT_PUBLIC_TRIGGER_DILIGENCE_URL: envConfig.NEXT_PUBLIC_TRIGGER_DILIGENCE_URL,
    NEXT_PUBLIC_PROCESS_DILIGENCE_URL: envConfig.NEXT_PUBLIC_PROCESS_DILIGENCE_URL,
    NEXT_PUBLIC_SCHEDULE_INTERVIEW_URL: envConfig.NEXT_PUBLIC_SCHEDULE_INTERVIEW_URL,
    NEXT_PUBLIC_RUN_DILIGENCE_URL: envConfig.NEXT_PUBLIC_RUN_DILIGENCE_URL,
    NEXT_PUBLIC_QUERY_DILIGENCE_URL: envConfig.NEXT_PUBLIC_QUERY_DILIGENCE_URL,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: envConfig.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_API_KEY: envConfig.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: envConfig.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: envConfig.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: envConfig.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: envConfig.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: envConfig.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
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
  
  // Ensure proper asset serving
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
}

export default nextConfig