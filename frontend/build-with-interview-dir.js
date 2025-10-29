const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building Next.js application...');

// Run Next.js build
execSync('npm run build', { stdio: 'inherit' });

console.log('📁 Creating interview directory structure...');

// Ensure interview directory exists
const outDir = path.join(__dirname, 'out');
const interviewDir = path.join(outDir, 'interview');

if (!fs.existsSync(interviewDir)) {
  fs.mkdirSync(interviewDir, { recursive: true });
}

// Copy interview.html to interview/index.html
const interviewHtml = path.join(outDir, 'interview.html');
const interviewIndex = path.join(interviewDir, 'index.html');

if (fs.existsSync(interviewHtml)) {
  fs.copyFileSync(interviewHtml, interviewIndex);
  console.log('✅ Created interview/index.html');
} else {
  console.log('⚠️ interview.html not found, creating empty index.html');
  fs.writeFileSync(interviewIndex, '<!DOCTYPE html><html><head><title>Interview</title></head><body><div id="__next"></div></body></html>');
}

console.log('✅ Build completed with proper directory structure!');
