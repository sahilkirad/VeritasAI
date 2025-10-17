# 🔐 Firebase Authentication Test Guide

## ✅ What's Fixed

1. **Firebase Configuration** - Added fallback values to prevent "configuration-not-found" error
2. **User Profiles** - Store user data (name, email, role) in Firestore
3. **Role Management** - Both investor and founder can sign up with roles
4. **Google OAuth** - Works for both signup and login
5. **Dashboard Display** - Shows user name and role in sidebar

## 🧪 Test Steps

### Step 1: Start the Application
```bash
cd frontend
npm run dev
```

### Step 2: Test Email/Password Signup
1. Go to `http://localhost:3000/signup`
2. Fill in:
   - **Full Name**: "John Investor"
   - **Email**: "john@investor.com"
   - **Password**: "password123"
   - **Role**: Select "Investor"
3. Click "Create Account"
4. Should redirect to dashboard showing "John Investor" and "Investor" role

### Step 3: Test Google OAuth Signup
1. Go to `http://localhost:3000/signup`
2. Select "Founder" role
3. Click "Sign up with Google"
4. Complete Google OAuth
5. Should redirect to dashboard showing your Google name and "Founder" role

### Step 4: Test Login
1. Go to `http://localhost:3000/login`
2. Use email/password or Google sign-in
3. Should redirect to dashboard with correct user info

### Step 5: Test Protected Routes
1. Go to `http://localhost:3000/dashboard` without logging in
2. Should redirect to login page
3. After login, should show dashboard with user info

## 🔍 What to Look For

### ✅ Success Indicators:
- No "configuration-not-found" errors
- User name appears in dashboard sidebar
- Role (Investor/Founder) shows in sidebar
- Google OAuth popup works
- Email/password signup works
- Protected routes redirect properly

### ❌ Common Issues:
- **Firebase config error**: Check `.env.local` file
- **Google OAuth not working**: Enable Google auth in Firebase Console
- **User profile not showing**: Check Firestore database for user documents

## 🛠️ Firebase Console Setup

### Enable Google Authentication:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project `veritas-472301`
3. **Authentication** → **Sign-in method**
4. **Google** → **Enable**
5. Set support email → **Save**

### Check Firestore:
1. **Firestore Database** → **Data**
2. Look for `users` collection
3. Should see documents with user profiles

## 📊 Expected Results

### Dashboard Sidebar Should Show:
```
[Avatar] John Investor
        Investor • john@investor.com
```

### Firestore Should Have:
```json
{
  "users": {
    "user_uid": {
      "uid": "user_uid",
      "email": "john@investor.com", 
      "displayName": "John Investor",
      "role": "investor",
      "createdAt": "2025-01-26T..."
    }
  }
}
```

## 🎯 Test Checklist

- [ ] Email/password signup works
- [ ] Google OAuth signup works  
- [ ] Email/password login works
- [ ] Google OAuth login works
- [ ] User name shows in dashboard
- [ ] User role shows in dashboard
- [ ] Protected routes work
- [ ] Logout works
- [ ] No Firebase config errors

## 🚀 Ready for Production!

Once all tests pass, your authentication system is fully functional for both investors and founders!
