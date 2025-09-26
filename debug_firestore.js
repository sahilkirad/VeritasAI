// Simple script to check Firestore collections
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkCollections() {
  console.log('🔍 Checking Firestore collections...\n');
  
  try {
    // Check uploads collection
    console.log('📁 Checking uploads collection:');
    const uploadsSnapshot = await db.collection('uploads').limit(5).get();
    console.log(`Found ${uploadsSnapshot.size} uploads`);
    uploadsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- ${doc.id}: ${data.originalName || 'Unknown'} (${data.status || 'No status'})`);
    });
    console.log('');
    
    // Check ingestionResults collection
    console.log('📄 Checking ingestionResults collection:');
    const ingestionSnapshot = await db.collection('ingestionResults').limit(5).get();
    console.log(`Found ${ingestionSnapshot.size} ingestion results`);
    ingestionSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- ${doc.id}: ${data.fileName || 'Unknown'} (${data.status || 'No status'})`);
    });
    console.log('');
    
    // Check diligenceResults collection
    console.log('🔍 Checking diligenceResults collection:');
    const diligenceSnapshot = await db.collection('diligenceResults').limit(5).get();
    console.log(`Found ${diligenceSnapshot.size} diligence results`);
    diligenceSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- ${doc.id}: ${data.memoId || 'Unknown'} (${data.status || 'No status'})`);
    });
    console.log('');
    
    console.log('✅ Collection check complete');
    
  } catch (error) {
    console.error('❌ Error checking collections:', error);
  }
}

checkCollections().then(() => process.exit(0));

