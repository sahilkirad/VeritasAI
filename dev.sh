#!/bin/bash

# Veritas AI Development Script
# This script starts the development server with proper Node.js version

set -e  # Exit on any error

echo "🚀 Starting Veritas AI Development Server..."

# Check if Node.js version is correct
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Error: Node.js version 20 or higher is required. Current version: $(node -v)"
    echo "Please update Node.js to version 20 or higher."
    echo ""
    echo "You can use nvm to switch to Node.js 20:"
    echo "  nvm install 20"
    echo "  nvm use 20"
    exit 1
fi

echo "✅ Node.js version check passed: $(node -v)"

# Navigate to frontend directory
cd frontend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start development server
echo "🔨 Starting development server..."
npm run dev
