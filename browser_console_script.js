// Copy and paste this script into your browser console on your deployed VeritasAI app
// This will fetch the diligence agent output (AI insight memo 1) from Firestore

console.log('🚀 Fetching Diligence Agent Output (AI Insight Memo 1)');
console.log('='.repeat(60));

// Function to fetch diligence results
async function fetchDiligenceResults() {
  try {
    console.log('🔍 Fetching diligence results from Firestore...');
    
    // Import Firebase functions (assuming they're already available in your app)
    const { getFirestore, collection, query, orderBy, limit, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    // Get the existing Firebase app instance
    const db = getFirestore();
    
    // Query the diligenceResults collection
    const diligenceRef = collection(db, 'diligenceResults');
    const q = query(diligenceRef, orderBy('timestamp', 'desc'), limit(10));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('❌ No diligence results found');
      return;
    }
    
    console.log(`✅ Found ${querySnapshot.docs.length} diligence results`);
    
    querySnapshot.docs.forEach((doc, index) => {
      console.log(`\n📋 Result #${index + 1}`);
      console.log(`Document ID: ${doc.id}`);
      const data = doc.data();
      console.log(`Timestamp: ${data.timestamp}`);
      console.log(`Status: ${data.status}`);
      
      // Check if it has memo1_diligence structure
      const memo1Diligence = data.memo1_diligence || {};
      if (memo1Diligence) {
        console.log(`Investment Recommendation: ${memo1Diligence.investment_recommendation || 'N/A'}`);
        console.log(`Overall Score: ${memo1Diligence.overall_score || 'N/A'}`);
        
        // Show key sections
        const founderFit = memo1Diligence.founder_market_fit || {};
        if (founderFit.score) {
          console.log(`Founder-Market Fit Score: ${founderFit.score}`);
        }
        
        const teamExec = memo1Diligence.team_execution_capability || {};
        if (teamExec.score) {
          console.log(`Team Execution Score: ${teamExec.score}`);
        }
        
        const traction = memo1Diligence.traction_metrics_validation || {};
        if (traction.score) {
          console.log(`Traction Validation Score: ${traction.score}`);
        }
      }
      
      console.log('-'.repeat(40));
    });
    
    // Show detailed analysis of the first result
    if (querySnapshot.docs.length > 0) {
      const firstDoc = querySnapshot.docs[0];
      const firstData = firstDoc.data();
      const memo1Diligence = firstData.memo1_diligence || {};
      
      if (memo1Diligence) {
        console.log('\n' + '='.repeat(80));
        console.log('📋 DETAILED DILIGENCE ANALYSIS');
        console.log('='.repeat(80));
        
        console.log(`\n🎯 Investment Recommendation: ${memo1Diligence.investment_recommendation || 'N/A'}`);
        console.log(`📊 Overall Score: ${memo1Diligence.overall_score || 'N/A'}/10`);
        
        // Investment Thesis
        if (memo1Diligence.investment_thesis) {
          console.log(`\n💡 Investment Thesis:`);
          console.log(`   ${memo1Diligence.investment_thesis}`);
        }
        
        // Founder Market Fit
        const founderFit = memo1Diligence.founder_market_fit || {};
        if (founderFit.score) {
          console.log(`\n👤 Founder-Market Fit: ${founderFit.score}/10`);
          if (founderFit.analysis) {
            console.log(`   Analysis: ${founderFit.analysis}`);
          }
        }
        
        // Team Execution
        const teamExec = memo1Diligence.team_execution_capability || {};
        if (teamExec.score) {
          console.log(`\n⚡ Team Execution: ${teamExec.score}/10`);
          if (teamExec.analysis) {
            console.log(`   Analysis: ${teamExec.analysis}`);
          }
        }
        
        // Traction Validation
        const traction = memo1Diligence.traction_metrics_validation || {};
        if (traction.score) {
          console.log(`\n📈 Traction Validation: ${traction.score}/10`);
          if (traction.analysis) {
            console.log(`   Analysis: ${traction.analysis}`);
          }
        }
        
        // Key Risks
        if (memo1Diligence.key_risks && memo1Diligence.key_risks.length > 0) {
          console.log(`\n⚠️  Key Risks:`);
          memo1Diligence.key_risks.forEach((risk, i) => {
            console.log(`   ${i + 1}. ${risk}`);
          });
        }
        
        // Mitigation Strategies
        if (memo1Diligence.mitigation_strategies && memo1Diligence.mitigation_strategies.length > 0) {
          console.log(`\n🛡️  Mitigation Strategies:`);
          memo1Diligence.mitigation_strategies.forEach((strategy, i) => {
            console.log(`   ${i + 1}. ${strategy}`);
          });
        }
        
        // Due Diligence Next Steps
        if (memo1Diligence.due_diligence_next_steps && memo1Diligence.due_diligence_next_steps.length > 0) {
          console.log(`\n📋 Due Diligence Next Steps:`);
          memo1Diligence.due_diligence_next_steps.forEach((step, i) => {
            console.log(`   ${i + 1}. ${step}`);
          });
        }
        
        // Synthesis Notes
        if (memo1Diligence.synthesis_notes) {
          console.log(`\n🔍 Synthesis Notes:`);
          console.log(`   ${memo1Diligence.synthesis_notes}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error fetching diligence results:', error);
  }
}

// Function to fetch ingestion results
async function fetchIngestionResults() {
  try {
    console.log('\n🔍 Fetching ingestion results from Firestore...');
    
    const { getFirestore, collection, query, orderBy, limit, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const db = getFirestore();
    
    const ingestionRef = collection(db, 'ingestionResults');
    const q = query(ingestionRef, orderBy('timestamp', 'desc'), limit(5));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('❌ No ingestion results found');
      return;
    }
    
    console.log(`✅ Found ${querySnapshot.docs.length} ingestion results`);
    
    querySnapshot.docs.forEach((doc, index) => {
      console.log(`\n📋 Ingestion Result #${index + 1}`);
      console.log(`Document ID: ${doc.id}`);
      const data = doc.data();
      console.log(`Timestamp: ${data.timestamp}`);
      console.log(`Status: ${data.status}`);
      console.log(`Original Filename: ${data.original_filename || 'N/A'}`);
      
      const memo1 = data.memo_1 || {};
      if (memo1.title) {
        console.log(`Company: ${memo1.title}`);
        console.log(`Founder: ${memo1.founder_name || 'N/A'}`);
        console.log(`Problem: ${memo1.problem || 'N/A'}`);
        console.log(`Solution: ${memo1.solution || 'N/A'}`);
      }
      
      console.log('-'.repeat(40));
    });
    
  } catch (error) {
    console.error('❌ Error fetching ingestion results:', error);
  }
}

// Run the functions
fetchDiligenceResults().then(() => {
  fetchIngestionResults();
});
