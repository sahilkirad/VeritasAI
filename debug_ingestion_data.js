// Debug script to check ingestion results data structure
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBvQZ8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8",
  authDomain: "veritas-472301.firebaseapp.com",
  projectId: "veritas-472301",
  storageBucket: "veritas-472301.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456789"
};

async function debugIngestionData() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('🔍 Fetching ingestion results...');
    const snapshot = await getDocs(collection(db, 'ingestionResults'));
    
    console.log(`Found ${snapshot.docs.length} ingestion results`);
    
    snapshot.docs.forEach((doc, index) => {
      console.log(`\n📋 Document #${index + 1} (ID: ${doc.id})`);
      const data = doc.data();
      
      console.log('Available fields:', Object.keys(data));
      console.log('Company name fields:', {
        title: data.title,
        company_name: data.company_name,
        companyName: data.companyName
      });
      
      if (data.memo_1) {
        console.log('Memo_1 fields:', Object.keys(data.memo_1));
        console.log('Company from memo_1:', data.memo_1.title);
        console.log('Problem from memo_1:', data.memo_1.problem);
        console.log('Solution from memo_1:', data.memo_1.solution);
      } else {
        console.log('No memo_1 field found');
      }
      
      console.log('Summary fields:', {
        summary_analysis: data.summary_analysis,
        key_thesis: data.memo_1?.key_thesis,
        memo_1_summary: data.memo_1?.summary_analysis
      });
      
      console.log('-'.repeat(50));
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugIngestionData();
