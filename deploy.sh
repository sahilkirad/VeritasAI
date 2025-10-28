#!/bin/bash

# Veritas AI Deployment Script
# This script handles the deployment of the frontend to Firebase Hosting

set -e  # Exit on any error

echo "🚀 Starting Veritas AI Frontend Deployment..."

# Check if Node.js version is correct
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Error: Node.js version 20 or higher is required. Current version: $(node -v)"
    echo "Please update Node.js to version 20 or higher."
    exit 1
fi

echo "✅ Node.js version check passed: $(node -v)"

# Navigate to frontend directory
cd frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Check if build was successful
if [ ! -d "out" ]; then
    echo "❌ Build failed - 'out' directory not found"
    exit 1
fi

echo "✅ Build completed successfully"

# Deploy to Firebase
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo "🎉 Deployment completed successfully!"
echo "🌐 Your app is now live at: https://veritas-472301.web.app"
