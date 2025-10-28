# Veritas AI Deployment Guide

## Prerequisites

- **Node.js 20+** (required for Firebase packages)
- **npm 10+**
- **Firebase CLI** (`npm install -g firebase-tools`)
- **Firebase project access** (veritas-472301)

## Quick Start

### 1. Check Node.js Version
```bash
node -v  # Should be 20.0.0 or higher
```

If you need to update Node.js:
```bash
# Using nvm (recommended)
nvm install 20
nvm use 20

# Or download from nodejs.org
```

### 2. Install Dependencies
```bash
cd frontend
npm install
```

### 3. Development
```bash
# Start development server
./dev.sh

# Or manually
cd frontend
npm run dev
```

### 4. Deployment
```bash
# Deploy to Firebase Hosting
./deploy.sh

# Or manually
cd frontend
npm run build
firebase deploy --only hosting
```

## Project Structure

```
VeritasAI/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # React components
│   │   ├── lib/            # Utilities and API client
│   │   └── contexts/       # React contexts
│   ├── out/                # Built static files (generated)
│   ├── package.json        # Dependencies and scripts
│   ├── next.config.mjs     # Next.js configuration
│   └── apphosting.yaml     # Firebase App Hosting config
├── functions/              # Firebase Cloud Functions (Python)
├── firebase.json          # Firebase project configuration
├── .firebaserc           # Firebase project settings
├── .nvmrc                # Node.js version specification
├── deploy.sh             # Deployment script
└── dev.sh               # Development script
```

## Configuration Files

### Node.js Version
- `.nvmrc` - Specifies Node.js 20
- `frontend/package.json` - Engine requirements
- `frontend/apphosting.yaml` - Firebase App Hosting runtime

### Firebase Configuration
- `firebase.json` - Project configuration
- `.firebaserc` - Project ID settings
- `firestore.rules` - Database security rules
- `storage.rules` - Storage security rules

### Next.js Configuration
- `frontend/next.config.mjs` - Static export configuration
- `frontend/tailwind.config.ts` - Styling configuration
- `frontend/tsconfig.json` - TypeScript configuration

## Environment Variables

The application uses environment variables defined in `frontend/next.config.mjs`:

```javascript
NEXT_PUBLIC_FIREBASE_PROJECT_ID=veritas-472301
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=veritas-472301.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=veritas-472301.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=533015987350
NEXT_PUBLIC_FIREBASE_APP_ID=1:533015987350:web:d6080ff950f86137352eb7
```

## Deployment Process

1. **Build**: Next.js creates static files in `frontend/out/`
2. **Deploy**: Firebase Hosting serves files from `frontend/out/`
3. **CDN**: Files are distributed via Firebase CDN

## Troubleshooting

### Node.js Version Issues
```bash
# Check current version
node -v

# If not 20+, update using nvm
nvm install 20
nvm use 20

# Verify
node -v
```

### Firebase CLI Issues
```bash
# Install/update Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Check project access
firebase projects:list
```

### Build Issues
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Deployment Issues
```bash
# Check Firebase project
firebase use veritas-472301

# Deploy with verbose output
firebase deploy --only hosting --debug
```

## URLs

- **Development**: http://localhost:3000
- **Production**: https://veritas-472301.web.app
- **Firebase Console**: https://console.firebase.google.com/project/veritas-472301

## Support

For deployment issues:
1. Check Node.js version (must be 20+)
2. Verify Firebase CLI installation
3. Check Firebase project access
4. Review build logs for errors
