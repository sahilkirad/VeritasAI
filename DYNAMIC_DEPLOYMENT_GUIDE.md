# Dynamic Admin Dashboard Deployment Guide

## Problem
The admin dashboard needs to be **dynamic** with real-time data, not static. Static export doesn't support:
- Real-time Firestore data
- Dynamic routes like `/admin/dashboard/memos/[id]`
- Interactive admin functions
- Live data updates

## Solution: Deploy to Vercel (Recommended)

### Why Vercel?
- ✅ **Native Next.js support** - Built for Next.js applications
- ✅ **Dynamic routes** - Supports `[id]` dynamic routes
- ✅ **Server-side rendering** - Full SSR support
- ✅ **Real-time data** - Firestore integration works
- ✅ **Easy deployment** - Simple git-based deployment

### Deployment Steps:

#### 1. Prepare for Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from frontend directory
cd frontend
vercel --prod
```

#### 2. Environment Variables
Set these in Vercel dashboard:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=veritas-472301.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=veritas-472301
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=veritas-472301.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=533015987350
NEXT_PUBLIC_FIREBASE_APP_ID=1:533015987350:web:d6080ff950f86137352eb7
```

#### 3. Build Configuration
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Alternative: Firebase Functions + Hosting

If you prefer to stay with Firebase:

#### 1. Update Firebase Configuration
```json
{
  "hosting": {
    "rewrites": [
      {
        "source": "**",
        "function": "nextjs"
      }
    ]
  }
}
```

#### 2. Deploy Next.js as Firebase Function
```bash
# Build the Next.js app
cd frontend
npm run build

# Deploy to Firebase
firebase deploy --only functions,hosting
```

## Current Status

### ✅ Dynamic Features Now Available:
- **Real-time data** - Firestore integration restored
- **Dynamic routes** - `/admin/dashboard/memos/[id]` works
- **Interactive admin** - Full admin functionality
- **Live updates** - Real-time dashboard metrics
- **Memo management** - View, approve, flag memos
- **Authentication** - Full Firebase auth integration

### 🔄 What Changed:
1. **Removed static export** - `output: 'export'` disabled
2. **Restored Firebase dependencies** - `useAuth()` and Firestore hooks
3. **Dynamic admin pages** - Real-time data and interactions
4. **Memo detail pages** - `/admin/dashboard/memos/[id]` restored

### 📊 Admin Dashboard Features:
- **Live Metrics**: Real-time data from Firestore
- **Memo Management**: View, approve, flag memos
- **Dynamic Routes**: Individual memo detail pages
- **Real-time Updates**: Live dashboard metrics
- **Full Authentication**: Firebase auth integration

## Deployment Commands

### For Vercel (Recommended):
```bash
cd frontend
vercel --prod
```

### For Firebase Functions:
```bash
cd frontend
npm run build
cd ..
firebase deploy --only functions,hosting
```

The admin dashboard is now fully dynamic with real-time data! 🚀
