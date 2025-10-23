#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Script to prepare the app for Firebase Hosting
// This temporarily enables static export for deployment

console.log('🔧 Preparing app for Firebase Hosting deployment...');

// Read the current next.config.mjs
const configPath = path.join(__dirname, 'next.config.mjs');
let config = fs.readFileSync(configPath, 'utf8');

// Enable static export
config = config.replace(
  '// output: \'export\',  // Disabled - admin dashboard needs dynamic routes',
  'output: \'export\',  // Enabled for Firebase Hosting deployment'
);

// Write the modified config
fs.writeFileSync(configPath, config);

console.log('✅ Static export enabled for deployment');
console.log('📦 Building application...');

// The build will be handled by the CI/CD pipeline
console.log('🚀 Ready for Firebase Hosting deployment');
