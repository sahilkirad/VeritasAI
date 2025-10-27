#!/usr/bin/env node

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

console.log('🔄 Fetching build-time data from Firestore...');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Use service account key if available, otherwise use default credentials
    const serviceAccountPath = path.join(__dirname, '../service-account-key.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = require(serviceAccountPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'veritas-472301'
      });
    } else {
      // Use default credentials (for GitHub Actions with GOOGLE_APPLICATION_CREDENTIALS)
      admin.initializeApp({
        projectId: 'veritas-472301'
      });
    }
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error);
    process.exit(1);
  }
}

const db = admin.firestore();

async function fetchBuildData() {
  try {
    console.log('📊 Fetching startup IDs from ingestionResults...');
    
    // Fetch all startup IDs from ingestionResults collection
    const startupsSnapshot = await db.collection('ingestionResults').get();
    const startupIds = [];
    
    startupsSnapshot.forEach(doc => {
      if (doc.id && doc.id.trim() !== '') {
        startupIds.push(doc.id);
      }
    });
    
    console.log(`✅ Found ${startupIds.length} startups`);
    
    // Fetch all investor IDs (using mock data for now since we don't have real investor collection)
    console.log('📊 Fetching investor IDs...');
    const investorIds = [
      'investor-1',
      'investor-2', 
      'investor-3',
      'investor-4',
      'investor-5'
    ];
    
    console.log(`✅ Found ${investorIds.length} investors`);
    
    // Create build data object
    const buildData = {
      startupIds,
      investorIds,
      fetchedAt: new Date().toISOString(),
      totalStartups: startupIds.length,
      totalInvestors: investorIds.length
    };
    
    // Write to JSON file
    const outputPath = path.join(__dirname, '../build-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(buildData, null, 2));
    
    console.log('✅ Build data written to build-data.json');
    console.log(`📁 Output: ${outputPath}`);
    console.log(`📊 Summary: ${startupIds.length} startups, ${investorIds.length} investors`);
    
    return buildData;
    
  } catch (error) {
    console.error('❌ Error fetching build data:', error);
    
    // Create fallback data if Firestore is not accessible
    console.log('🔄 Creating fallback build data...');
    const fallbackData = {
      startupIds: [],
      investorIds: [],
      fetchedAt: new Date().toISOString(),
      totalStartups: 0,
      totalInvestors: 0,
      fallback: true
    };
    
    const outputPath = path.join(__dirname, '../build-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(fallbackData, null, 2));
    
    console.log('⚠️ Using fallback data - some pages may not be pre-rendered');
    return fallbackData;
  }
}

// Run the fetch
fetchBuildData()
  .then(() => {
    console.log('✅ Build data fetch completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Build data fetch failed:', error);
    process.exit(1);
  });
