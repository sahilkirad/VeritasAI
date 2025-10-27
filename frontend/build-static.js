#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Building static export with dynamic routes...');

// Paths to dynamic route folders
const dynamicRoutes = [
  'src/app/admin/startups/[id]',
  'src/app/admin/investors/[id]'
];

// Backup folders
const backupFolders = [
  'src/app/admin/startups/_id_backup',
  'src/app/admin/investors/_id_backup'
];

try {
  // Step 1: Backup dynamic route folders
  console.log('📦 Backing up dynamic route folders...');
  dynamicRoutes.forEach((route, index) => {
    const sourcePath = path.join(__dirname, route);
    const backupPath = path.join(__dirname, backupFolders[index]);
    
    if (fs.existsSync(sourcePath)) {
      if (fs.existsSync(backupPath)) {
        fs.rmSync(backupPath, { recursive: true });
      }
      fs.renameSync(sourcePath, backupPath);
      console.log(`✅ Backed up ${route} to ${backupFolders[index]}`);
    }
  });

  // Step 2: Build static export
  console.log('🏗️ Building static export...');
  execSync('NODE_ENV=production npm run build', { 
    stdio: 'inherit',
    cwd: __dirname 
  });

  // Step 3: Restore dynamic route folders
  console.log('🔄 Restoring dynamic route folders...');
  backupFolders.forEach((backup, index) => {
    const backupPath = path.join(__dirname, backup);
    const originalPath = path.join(__dirname, dynamicRoutes[index]);
    
    if (fs.existsSync(backupPath)) {
      if (fs.existsSync(originalPath)) {
        fs.rmSync(originalPath, { recursive: true });
      }
      fs.renameSync(backupPath, originalPath);
      console.log(`✅ Restored ${dynamicRoutes[index]} from ${backup}`);
    }
  });

  console.log('✅ Static build completed successfully!');
  console.log('📁 Output directory: out/');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  
  // Restore folders even if build failed
  console.log('🔄 Restoring dynamic route folders after error...');
  backupFolders.forEach((backup, index) => {
    const backupPath = path.join(__dirname, backup);
    const originalPath = path.join(__dirname, dynamicRoutes[index]);
    
    if (fs.existsSync(backupPath)) {
      if (fs.existsSync(originalPath)) {
        fs.rmSync(originalPath, { recursive: true });
      }
      fs.renameSync(backupPath, originalPath);
      console.log(`✅ Restored ${dynamicRoutes[index]} from ${backup}`);
    }
  });
  
  process.exit(1);
}
