// Startup data service for admin dashboard
import { collection, getDocs, doc, getDoc, query, orderBy, limit } from 'firebase/firestore';
import { db, getFirebaseDb } from '../firebase-new';
import { Startup, FilterOptions, SortOptions, MemoOneData, MemoTwoData, MemoThreeData } from '../types/startup';

// Fetch all startups from Firestore
export async function getAllStartups(): Promise<Startup[]> {
  try {
    console.log('🔄 Fetching startups from Firestore...');
    
    const startupsRef = collection(db, 'ingestionResults');
    const q = query(startupsRef, orderBy('timestamp', 'desc'), limit(50));
    const querySnapshot = await getDocs(q);
    
    console.log(`📊 Found ${querySnapshot.docs.length} startup records`);
    
    const startups: Startup[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return transformToStartup(doc.id, data);
    });
    
    console.log('✅ Successfully transformed startups data');
    return startups;
  } catch (error) {
    console.error('❌ Error fetching startups:', error);
    throw new Error('Failed to fetch startups data');
  }
}

// Fetch single startup by ID with retry logic and better error handling
export async function getStartupById(id: string): Promise<Startup | null> {
  // Check if Firebase is properly initialized
  const firebaseDb = getFirebaseDb();
  if (!firebaseDb) {
    console.error('❌ Firebase not initialized');
    throw new Error('Database connection not available. Please refresh the page.');
  }

  // Validate and sanitize ID
  if (!id || typeof id !== 'string') {
    console.error('❌ Invalid startup ID:', id);
    throw new Error('Invalid startup ID provided');
  }

  // Decode URL-encoded ID if needed
  const decodedId = decodeURIComponent(id);
  console.log('🔄 Fetching startup by ID:', decodedId);

  // Retry logic for Firestore queries
  const maxRetries = 3;
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries} to fetch startup:`, decodedId);
      
      // Add a small delay to avoid rapid-fire requests
      if (attempt > 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const startupRef = doc(firebaseDb, 'ingestionResults', decodedId);
      const startupSnap = await getDoc(startupRef);
      
      if (!startupSnap.exists()) {
        console.log('❌ Startup not found in Firestore:', decodedId);
        return null;
      }
      
      const data = startupSnap.data();
      if (!data) {
        console.log('❌ Startup data is empty:', decodedId);
        return null;
      }
      
      const startup = transformToStartup(decodedId, data);
      
      console.log('✅ Successfully fetched startup:', startup.companyName);
      return startup;
    } catch (error: any) {
      lastError = error;
      console.error(`❌ Attempt ${attempt}/${maxRetries} failed:`, error);
      
      // Check if it's a connection error
      if (error.message?.includes('connection') || 
          error.message?.includes('network') ||
          error.message?.includes('Receiving end does not exist') ||
          error.code === 'unavailable' ||
          error.code === 'unauthenticated') {
        console.log(`🔄 Connection error on attempt ${attempt}, retrying...`, error.message);
        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          continue;
        }
      }
      
      // For non-connection errors, don't retry
      break;
    }
  }

  // All retries failed - try fallback approach
  console.error('❌ All attempts failed to fetch startup:', decodedId, lastError);
  
  // If it's a WebSocket/connection error, try a different approach
  if (lastError?.message?.includes('Receiving end does not exist') || 
      lastError?.message?.includes('connection')) {
    console.log('🔄 Trying fallback approach for connection error...');
    
    try {
      // Try to get all startups and find the one we need
      const allStartups = await getAllStartups();
      const foundStartup = allStartups.find(s => s.id === decodedId);
      
      if (foundStartup) {
        console.log('✅ Found startup via fallback method:', foundStartup.companyName);
        return foundStartup;
      }
    } catch (fallbackError) {
      console.error('❌ Fallback method also failed:', fallbackError);
    }
  }
  
  throw new Error(`Failed to fetch startup data after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
}

// Transform Firestore document to Startup interface
function transformToStartup(id: string, data: any): Startup {
  try {
    const memo1 = data.memo_1 || {};
    const memo2 = data.memo_2 || {};
    const memo3 = data.memo_3 || {};
  
  // Extract company name from various sources
  const companyName = memo1.title || 
                     memo3.company_name || 
                     memo2.company_name || 
                     data.companyName || 
                     'Unknown Company';
  
  // Extract founder information
  const founderName = memo1.founder_name || 
                     memo3.founder_name || 
                     memo2.founder_name || 
                     'Unknown Founder';
  
  const founderEmail = memo1.founder_email || 
                      memo3.founder_email || 
                      memo2.founder_email || 
                      'unknown@example.com';
  
  const founderLinkedIn = memo1.founder_linkedin_url || 
                         memo3.founder_linkedin_url || 
                         memo2.founder_linkedin_url;
  
  // Determine stage
  const stage = memo1.company_stage || 
               memo3.company_stage || 
               memo2.company_stage || 
               'Seed';
  
  // Extract sector information
  const sector = memo1.industry_category ? 
                [memo1.industry_category] : 
                memo3.industry_category ? 
                [memo3.industry_category] : 
                memo2.industry_category ? 
                [memo2.industry_category] : 
                ['Technology'];
  
  // Extract funding information
  const fundingAsk = memo1.amount_raising || 
                    memo3.amount_raising || 
                    memo2.amount_raising || 
                    memo1.funding_ask || 
                    memo3.funding_ask || 
                    memo2.funding_ask || 
                    'Not specified';
  
  const valuation = memo1.post_money_valuation || 
                   memo3.post_money_valuation || 
                   memo2.post_money_valuation || 
                   memo1.pre_money_valuation || 
                   memo3.pre_money_valuation || 
                   memo2.pre_money_valuation;
  
  // Calculate status based on which memos exist
  const status = calculateStatus(data);
  
  // Calculate AI score
  const aiScore = memo3.overall_score || 
                 memo2.overall_score || 
                 memo1.overall_score || 
                 undefined;
  
  // Calculate risk level
  const riskLevel = calculateRiskLevel(data);
  
  // Extract additional information
  const website = memo1.company_website || 
                 memo3.company_website || 
                 memo2.company_website;
  
  const teamSize = memo1.team_size ? 
                  parseInt(memo1.team_size) : 
                  memo3.team_size ? 
                  parseInt(memo3.team_size) : 
                  memo2.team_size ? 
                  parseInt(memo2.team_size) : 
                  undefined;
  
  const headquarters = memo1.headquarters || 
                     memo3.headquarters || 
                     memo2.headquarters;
  
  const foundedYear = memo1.founded_date || 
                     memo3.founded_date || 
                     memo2.founded_date;
  
  // Determine last updated timestamp with safe conversion
  const getSafeTimestamp = (timestamp: any) => {
    try {
      if (timestamp && timestamp.seconds) {
        const date = new Date(timestamp.seconds * 1000);
        return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
      }
      return new Date().toISOString();
    } catch (error) {
      console.warn('Invalid timestamp:', timestamp, error);
      return new Date().toISOString();
    }
  };

  const lastUpdated = data.createdAt || getSafeTimestamp(data.timestamp);
  const createdAt = data.createdAt || getSafeTimestamp(data.timestamp);

  return {
    id,
    companyName,
    founderName,
    founderEmail,
    founderLinkedIn,
    stage: stage as 'Pre-Seed' | 'Seed' | 'Series A' | 'Series B',
    sector,
    fundingAsk,
    valuation,
    status: status as 'Intake' | 'Memo 1' | 'Memo 2' | 'Memo 3' | 'Sent',
    aiScore,
    riskLevel,
    lastUpdated,
    createdAt,
    memo_1: memo1 as MemoOneData,
    memo_2: memo2 as MemoTwoData,
    memo_3: memo3 as MemoThreeData,
    website,
    teamSize,
    headquarters,
    foundedYear,
    pitchDeckUrl: data.pitchDeckUrl
  };
  } catch (error) {
    console.error('❌ Error transforming startup data:', error, 'Data:', data);
    // Return a minimal startup object to prevent complete failure
    return {
      id,
      companyName: data.title || 'Unknown Company',
      founderName: 'Unknown Founder',
      status: 'Intake',
      riskLevel: 'Medium',
      aiScore: 0,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      memo_1: {} as MemoOneData,
      memo_2: {} as MemoTwoData,
      memo_3: {} as MemoThreeData,
      website: '',
      teamSize: 0,
      headquarters: '',
      foundedYear: new Date().getFullYear(),
      pitchDeckUrl: ''
    };
  }
}

// Calculate startup status based on memos
export function calculateStatus(data: any): string {
  const hasMemo1 = data.memo_1 && Object.keys(data.memo_1).length > 0;
  const hasMemo2 = data.memo_2 && Object.keys(data.memo_2).length > 0;
  const hasMemo3 = data.memo_3 && Object.keys(data.memo_3).length > 0;
  
  if (hasMemo3) return 'Memo 3';
  if (hasMemo2) return 'Memo 2';
  if (hasMemo1) return 'Memo 1';
  return 'Intake';
}

// Calculate risk level based on flags/score
export function calculateRiskLevel(data: any): 'Low' | 'Medium' | 'High' {
  const memo1 = data.memo_1 || {};
  const memo2 = data.memo_2 || {};
  const memo3 = data.memo_3 || {};
  
  // Check for red flags
  const redFlags = [
    ...(memo1.initial_flags || []),
    ...(memo2.key_risks || []),
    ...(memo3.key_risks || [])
  ];
  
  // Get AI score
  const score = memo3.overall_score || memo2.overall_score || memo1.overall_score || 5;
  
  // High risk: Many red flags or low score
  if (redFlags.length > 3 || score < 4) return 'High';
  
  // Medium risk: Some red flags or medium score
  if (redFlags.length > 1 || score < 7) return 'Medium';
  
  // Low risk: Few flags and good score
  return 'Low';
}

// Filter and search startups
export function filterStartups(startups: Startup[], filters: FilterOptions): Startup[] {
  let filtered = [...startups];
  
  // Search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter(startup => 
      startup.companyName.toLowerCase().includes(searchTerm) ||
      startup.founderName.toLowerCase().includes(searchTerm) ||
      startup.founderEmail.toLowerCase().includes(searchTerm)
    );
  }
  
  // Stage filter
  if (filters.stage && filters.stage.length > 0) {
    filtered = filtered.filter(startup => 
      filters.stage!.includes(startup.stage)
    );
  }
  
  // Status filter
  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter(startup => 
      filters.status!.includes(startup.status)
    );
  }
  
  // Score range filter
  if (filters.scoreRange) {
    filtered = filtered.filter(startup => {
      if (!startup.aiScore) return false;
      return startup.aiScore >= filters.scoreRange!.min && 
             startup.aiScore <= filters.scoreRange!.max;
    });
  }
  
  // Sector filter
  if (filters.sector && filters.sector.length > 0) {
    filtered = filtered.filter(startup => 
      startup.sector.some(s => filters.sector!.includes(s))
    );
  }
  
  // Risk level filter
  if (filters.riskLevel && filters.riskLevel.length > 0) {
    filtered = filtered.filter(startup => 
      filters.riskLevel!.includes(startup.riskLevel)
    );
  }
  
  return filtered;
}

// Sort startups
export function sortStartups(startups: Startup[], sortBy: string): Startup[] {
  const sorted = [...startups];
  
  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => a.companyName.localeCompare(b.companyName));
    
    case 'stage':
      const stageOrder = { 'Pre-Seed': 0, 'Seed': 1, 'Series A': 2, 'Series B': 3 };
      return sorted.sort((a, b) => stageOrder[a.stage] - stageOrder[b.stage]);
    
    case 'status':
      const statusOrder = { 'Intake': 0, 'Memo 1': 1, 'Memo 2': 2, 'Memo 3': 3, 'Sent': 4 };
      return sorted.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
    
    case 'score':
      return sorted.sort((a, b) => {
        const scoreA = a.aiScore || 0;
        const scoreB = b.aiScore || 0;
        return scoreB - scoreA; // Descending order
      });
    
    case 'lastUpdated':
      return sorted.sort((a, b) => 
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      );
    
    case 'createdAt':
      return sorted.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    
    default:
      return sorted;
  }
}

// Get unique values for filter options
export function getFilterOptions(startups: Startup[]) {
  const stages = [...new Set(startups.map(s => s.stage))];
  const statuses = [...new Set(startups.map(s => s.status))];
  const sectors = [...new Set(startups.flatMap(s => s.sector))];
  const riskLevels = [...new Set(startups.map(s => s.riskLevel))];
  
  return {
    stages: stages.sort(),
    statuses: statuses.sort(),
    sectors: sectors.sort(),
    riskLevels: riskLevels.sort()
  };
}
