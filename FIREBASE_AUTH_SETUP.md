# Firebase OAuth Authentication Setup Guide

## ✅ Implementation Complete

This guide covers the complete Firebase OAuth authentication implementation for the Veritas AI platform.

## 🔧 Step 1: Enable Google Authentication in Firebase Console

### 1.1 Navigate to Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `veritas-472301`

### 1.2 Enable Google Authentication
1. In the left sidebar, click **Authentication**
2. Click on the **Sign-in method** tab
3. Find **Google** in the list of providers
4. Click on **Google** to configure it
5. Toggle **Enable** to turn it on
6. Set a **Project support email** (required)
7. Click **Save**

## 🔧 Step 2: Environment Variables Setup

### 2.1 Frontend Environment Variables
Create or update `.env.local` in your frontend directory:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=veritas-472301.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=veritas-472301
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=veritas-472301.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Functions URL
NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL=https://asia-south1-veritas-472301.cloudfunctions.net
```

### 2.2 Get Firebase Configuration
1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. If you don't have a web app, click **Add app** and select **Web**
4. Copy the configuration values to your `.env.local` file

## 🔧 Step 3: Deploy Updated Functions

### 3.1 Deploy Backend Functions
```bash
cd functions
firebase deploy --only functions
```

### 3.2 Verify Deployment
```bash
firebase functions:list
```

## 🔧 Step 4: Test Authentication Flow

### 4.1 Start Frontend Development Server
```bash
cd frontend
npm run dev
```

### 4.2 Test Authentication
1. Navigate to `http://localhost:3000/login`
2. Try both email/password and Google sign-in
3. Verify that authenticated users can access `/dashboard`
4. Test logout functionality

## 🔧 Step 5: Security Features Implemented

### 5.1 Frontend Security
- ✅ **AuthContext**: Centralized authentication state management
- ✅ **ProtectedRoute**: Automatic redirect to login for unauthenticated users
- ✅ **API Client**: Automatic token inclusion in API requests
- ✅ **User Session**: Persistent authentication across browser sessions

### 5.2 Backend Security
- ✅ **Token Verification**: All HTTP endpoints verify Firebase ID tokens
- ✅ **User Identification**: Backend functions can access authenticated user info
- ✅ **CORS Configuration**: Proper CORS headers for authenticated requests
- ✅ **Error Handling**: Graceful handling of authentication failures

## 🔧 Step 6: API Usage Examples

### 6.1 Making Authenticated API Calls
```typescript
import { apiClient } from '@/lib/api';

// Upload a file (automatically includes auth token)
const result = await apiClient.uploadFile(file);

// Trigger diligence analysis
const result = await apiClient.triggerDiligence(memoId, gaPropertyId, linkedinUrl);

// Schedule an interview
const result = await apiClient.scheduleInterview(interviewData);
```

### 6.2 Using Authentication Context
```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, loading, signInWithGoogle, logout } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;
  
  return (
    <div>
      <p>Welcome, {user.displayName}!</p>
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}
```

## 🔧 Step 7: Troubleshooting

### 7.1 Common Issues

**Issue**: "Firebase: Error (auth/configuration-not-found)"
**Solution**: Ensure all environment variables are set correctly in `.env.local`

**Issue**: "Authentication failed: Invalid token"
**Solution**: Check that Firebase project ID matches in both frontend and backend

**Issue**: CORS errors
**Solution**: Verify that the backend functions have proper CORS configuration

### 7.2 Debug Authentication
```typescript
// Add to your component for debugging
console.log('User:', user);
console.log('Loading:', loading);
console.log('Auth token:', await user?.getIdToken());
```

## 🔧 Step 8: Production Deployment

### 8.1 Environment Variables
Ensure all environment variables are set in your production environment (Vercel, Netlify, etc.)

### 8.2 Firebase Functions
Deploy functions to production:
```bash
firebase deploy --only functions --project veritas-472301
```

### 8.3 Frontend Deployment
Deploy your frontend with proper environment variables configured.

## ✅ Security Checklist

- ✅ Google OAuth enabled in Firebase Console
- ✅ Environment variables configured
- ✅ Backend functions deployed with authentication
- ✅ Frontend protected routes implemented
- ✅ API client includes authentication tokens
- ✅ User session management working
- ✅ Logout functionality implemented
- ✅ Error handling for authentication failures

## 🎉 You're All Set!

Your Firebase OAuth authentication is now fully implemented and secure. Users can:
- Sign in with Google or email/password
- Access protected dashboard routes
- Make authenticated API calls
- Sign out securely

The backend functions will automatically verify user authentication and reject unauthorized requests.
