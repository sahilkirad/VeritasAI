// Browser console script to check Firestore collections
// Run this in the browser console on the memo page

async function checkFirestoreCollections() {
  console.log('🔍 Checking Firestore collections...\n');
  
  try {
    // Import Firebase modules (assuming they're already loaded)
    const { getFirestore, collection, getDocs, limit, query } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    
    // Get the existing Firebase app instance
    const db = getFirestore();
    const auth = getAuth();
    
    console.log('📁 Checking uploads collection:');
    const uploadsQuery = query(collection(db, 'uploads'), limit(5));
    const uploadsSnapshot = await getDocs(uploadsQuery);
    console.log(`Found ${uploadsSnapshot.size} uploads`);
    uploadsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- ${doc.id}: ${data.originalName || 'Unknown'} (${data.status || 'No status'})`);
    });
    
    console.log('\n📄 Checking ingestionResults collection:');
    const ingestionQuery = query(collection(db, 'ingestionResults'), limit(5));
    const ingestionSnapshot = await getDocs(ingestionQuery);
    console.log(`Found ${ingestionSnapshot.size} ingestion results`);
    ingestionSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- ${doc.id}: ${data.fileName || 'Unknown'} (${data.status || 'No status'})`);
    });
    
    console.log('\n🔍 Checking diligenceResults collection:');
    const diligenceQuery = query(collection(db, 'diligenceResults'), limit(5));
    const diligenceSnapshot = await getDocs(diligenceQuery);
    console.log(`Found ${diligenceSnapshot.size} diligence results`);
    diligenceSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- ${doc.id}: ${data.memoId || 'Unknown'} (${data.status || 'No status'})`);
    });
    
    console.log('\n✅ Checking validationResults collection:');
    const validationQuery = query(collection(db, 'validationResults'), limit(5));
    const validationSnapshot = await getDocs(validationQuery);
    console.log(`Found ${validationSnapshot.size} validation results`);
    validationSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- ${doc.id}: ${data.memo_id || 'Unknown'} (${data.validation_type || 'No type'})`);
    });
    
    console.log('\n✅ Collection check complete');
    
  } catch (error) {
    console.error('❌ Error checking collections:', error);
  }
}

// Run the check
checkFirestoreCollections();
