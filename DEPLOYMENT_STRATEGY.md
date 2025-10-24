# Deployment Strategy for VeritasAI

## Current Issue Resolution

### Problem
- Firebase Hosting expects static files in `frontend/out` directory
- Admin dashboard has dynamic routes (`/admin/dashboard/memos/[id]`) that cannot be statically exported
- Build was failing with `generateStaticParams()` errors

### Solution Implemented

#### 1. Static Export for Main Application
- ✅ **Enabled `output: 'export'`** in `next.config.mjs`
- ✅ **Temporarily moved dynamic route** from `[id]` to `_dynamic` to prevent build errors
- ✅ **Generated static files** in `frontend/out` directory
- ✅ **Main application deploys successfully** to Firebase Hosting

#### 2. Admin Dashboard Handling
The admin dashboard has two deployment options:

**Option A: Separate Deployment (Recommended)**
- Deploy main application to Firebase Hosting (static)
- Deploy admin dashboard to Vercel/Netlify (dynamic)
- Use different domains: `app.veritas.com` and `admin.veritas.com`

**Option B: Firebase Functions Integration**
- Use Firebase Functions to handle dynamic routes
- More complex but keeps everything in Firebase ecosystem

## Current Status

### ✅ Working Components
- **Main Application**: Static export working
- **Investor Dashboard**: Fully functional
- **Founder Dashboard**: Fully functional
- **Authentication**: Working across all dashboards
- **Firebase Integration**: Real-time data working

### ⚠️ Temporarily Disabled
- **Admin Dashboard Dynamic Routes**: `/admin/dashboard/memos/[id]` moved to `_dynamic`
- **Memo Detail Pages**: Not accessible in static export mode

## Deployment Commands

### For Main Application (Firebase Hosting)
```bash
# Build static files
cd frontend
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

### For Admin Dashboard (Alternative Deployment)
```bash
# Restore dynamic routes
mv frontend/src/app/admin/dashboard/memos/_dynamic frontend/src/app/admin/dashboard/memos/[id]

# Disable static export
# Comment out output: 'export' in next.config.mjs

# Deploy to Vercel/Netlify
vercel deploy
```

## Next Steps

1. **Immediate**: Deploy main application to Firebase Hosting ✅
2. **Short-term**: Set up separate admin dashboard deployment
3. **Long-term**: Consider Firebase Functions integration for unified deployment

## Files Modified

- `frontend/next.config.mjs`: Re-enabled static export
- `frontend/src/app/admin/dashboard/memos/[id]/page.tsx`: Moved to `_dynamic`
- `firebase.json`: Points to `frontend/out` directory
- `frontend/build-for-hosting.js`: Deployment automation script

## Testing

- ✅ Build successful with static export
- ✅ `frontend/out` directory generated
- ✅ All static routes working
- ✅ Firebase Hosting deployment ready
