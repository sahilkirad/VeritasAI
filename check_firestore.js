// Simple script to check Firestore collections
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'veritas-472301'
});

const db = admin.firestore();

async function checkCollections() {
  try {
    console.log('🔍 Checking Firestore collections...\n');
    
    // Check uploads collection
    console.log('📁 Checking uploads collection:');
    const uploadsSnapshot = await db.collection('uploads').limit(5).get();
    console.log(`Found ${uploadsSnapshot.size} uploads`);
    uploadsSnapshot.forEach(doc => {
      console.log(`- ${doc.id}: ${doc.data().originalName} (${doc.data().status})`);
    });
    
    // Check ingestionResults collection
    console.log('\n📄 Checking ingestionResults collection:');
    const ingestionSnapshot = await db.collection('ingestionResults').limit(5).get();
    console.log(`Found ${ingestionSnapshot.size} ingestion results`);
    ingestionSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- ${doc.id}: ${data.fileName || 'Unknown'} (${data.status || 'No status'})`);
    });
    
    // Check diligenceResults collection
    console.log('\n🔍 Checking diligenceResults collection:');
    const diligenceSnapshot = await db.collection('diligenceResults').limit(5).get();
    console.log(`Found ${diligenceSnapshot.size} diligence results`);
    diligenceSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- ${doc.id}: ${data.memoId || 'Unknown'} (${data.status || 'No status'})`);
    });
    
    // Check validationResults collection
    console.log('\n✅ Checking validationResults collection:');
    const validationSnapshot = await db.collection('validationResults').limit(5).get();
    console.log(`Found ${validationSnapshot.size} validation results`);
    validationSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- ${doc.id}: ${data.memo_id || 'Unknown'} (${data.validation_type || 'No type'})`);
    });
    
  } catch (error) {
    console.error('❌ Error checking collections:', error);
  }
}

checkCollections().then(() => {
  console.log('\n✅ Collection check complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
