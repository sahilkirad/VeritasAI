#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Building static export for admin dashboard...');

try {
  // Step 1: Build static export
  console.log('🏗️ Building static export...');
  execSync('NODE_ENV=production npm run build', { 
    stdio: 'inherit',
    cwd: __dirname 
  });

  // Step 2: Verify admin pages were generated
  const adminOutPath = path.join(__dirname, 'out/admin');
  if (fs.existsSync(adminOutPath)) {
    const adminFiles = fs.readdirSync(adminOutPath);
    console.log(`✅ Admin pages generated: ${adminFiles.length} files`);
    
    // List all admin files
    adminFiles.forEach(file => {
      console.log(`  - ${file}`);
    });
    
    // Check for main admin pages
    const hasDashboard = adminFiles.some(file => file.includes('dashboard'));
    const hasStartups = adminFiles.some(file => file.includes('startups'));
    const hasInvestors = adminFiles.some(file => file.includes('investors'));
    const hasMemos = adminFiles.some(file => file.includes('memos'));
    const hasDeals = adminFiles.some(file => file.includes('deals'));
    const hasSettings = adminFiles.some(file => file.includes('settings'));
    
    console.log('📊 Admin page status:');
    console.log(`  - Dashboard: ${hasDashboard ? '✅' : '❌'}`);
    console.log(`  - Startups: ${hasStartups ? '✅' : '❌'}`);
    console.log(`  - Investors: ${hasInvestors ? '✅' : '❌'}`);
    console.log(`  - Memos: ${hasMemos ? '✅' : '❌'}`);
    console.log(`  - Deals: ${hasDeals ? '✅' : '❌'}`);
    console.log(`  - Settings: ${hasSettings ? '✅' : '❌'}`);
  } else {
    console.log('❌ Admin folder not found in build output');
  }

  console.log('✅ Static build completed successfully!');
  console.log('📁 Output directory: out/');
  console.log('🚀 Admin dashboard ready for deployment');
  console.log('ℹ️  Dynamic routes will work via catch-all routing');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
