// Real-time data service for admin dashboard
import { collection, getDocs, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { db } from '../firebase-new';

// Real-time data service
export class RealtimeService {
  private static instance: RealtimeService;
  private unsubscribeFunctions: (() => void)[] = [];

  static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService();
    }
    return RealtimeService.instance;
  }

  // Subscribe to real-time memo updates from ingestionResults
  subscribeToMemos(
    onUpdate: (memos: any[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    try {
      console.log('🔄 Setting up real-time memo listener from ingestionResults...');
      
      const memosRef = collection(db, 'ingestionResults');
      const q = query(memosRef, orderBy('timestamp', 'desc'), limit(50));
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          console.log(`📊 Real-time update: ${snapshot.docs.length} memos from ingestionResults`);
          
          const memos = snapshot.docs.map(doc => {
            const data = doc.data();
            return this.transformToMemoSummary(doc.id, data);
          });
          
          onUpdate(memos);
        },
        (error) => {
          console.error('❌ Real-time memo listener error:', error);
          onError?.(error);
        }
      );

      this.unsubscribeFunctions.push(unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('❌ Error setting up memo listener:', error);
      onError?.(error as Error);
      return () => {};
    }
  }

  // Subscribe to real-time user updates
  subscribeToUsers(
    onUpdate: (users: any[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    try {
      console.log('🔄 Setting up real-time user listener...');
      
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'), limit(100));
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          console.log(`📊 Real-time update: ${snapshot.docs.length} users`);
          
          const users = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          onUpdate(users);
        },
        (error) => {
          console.error('❌ Real-time user listener error:', error);
          onError?.(error);
        }
      );

      this.unsubscribeFunctions.push(unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('❌ Error setting up user listener:', error);
      onError?.(error as Error);
      return () => {};
    }
  }

  // Clean up all listeners
  cleanup() {
    this.unsubscribeFunctions.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (error) {
        console.error('❌ Error cleaning up listener:', error);
      }
    });
    this.unsubscribeFunctions = [];
  }

  // Transform ingestionResults document to MemoSummary format
  private transformToMemoSummary(id: string, data: any): any {
    try {
      const memo1 = data.memo_1 || {};
      const memo2 = data.memo_2 || {};
      const memo3 = data.memo_3 || {};
      
      // Extract company name from various sources
      const startupName = memo1.title || 
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
      
      // Determine stage
      const stage = memo1.company_stage || 
                   memo3.company_stage || 
                   memo2.company_stage || 
                   'Seed';
      
      // Extract sector information
      const sector = memo1.industry_category || 
                    memo3.industry_category || 
                    memo2.industry_category || 
                    'Technology';
      
      // Ensure sector is an array for consistency
      const sectorArray = Array.isArray(sector) ? sector : [sector];
      
      // Calculate status based on memo generation
      const status = this.calculateStatus(memo1, memo2, memo3);
      
      // Calculate AI score (mock calculation)
      const aiScore = this.calculateAIScore(memo1, memo2, memo3);
      
      // Calculate risk level
      const riskLevel = this.calculateRiskLevel(memo1, memo2, memo3);
      
      // Extract timestamps
      const createdAt = data.timestamp?.toDate?.() || new Date();
      const lastUpdated = data.lastUpdated?.toDate?.() || createdAt;
      
      return {
        id,
        startupName,
        founderName,
        founderEmail,
        stage,
        sector: sectorArray,
        status,
        aiScore,
        riskLevel,
        lastUpdated,
        createdAt,
        memo1Generated: !!memo1 && Object.keys(memo1).length > 0,
        memo2Generated: !!memo2 && Object.keys(memo2).length > 0,
        memo3Generated: !!memo3 && Object.keys(memo3).length > 0,
        originalFilename: data.original_filename || 'Unknown',
        processingTime: data.processing_time_seconds || 0,
        // Include the full memo data for detail pages
        memo_1: memo1,
        memo_2: memo2,
        memo_3: memo3,
        // Additional fields for compatibility
        companyName: startupName,
        founderLinkedIn: memo1.founder_linkedin_url || memo3.founder_linkedin_url || memo2.founder_linkedin_url,
        fundingAsk: memo1.amount_raising || memo3.amount_raising || memo2.amount_raising,
        valuation: memo1.pre_money_valuation || memo3.pre_money_valuation || memo2.pre_money_valuation,
        website: memo1.website || memo3.website || memo2.website,
        headquarters: memo1.headquarters || memo3.headquarters || memo2.headquarters,
        foundedYear: memo1.founded_year || memo3.founded_year || memo2.founded_year,
        pitchDeckUrl: data.pitch_deck_url || data.original_filename,
        teamSize: memo1.team_size || memo3.team_size || memo2.team_size,
        // UI-specific fields
        industry: Array.isArray(sector) ? sector[0] : sector,
        location: memo1.headquarters || memo3.headquarters || memo2.headquarters,
        description: memo1.problem || memo3.problem || memo2.problem,
        revenue: memo1.current_revenue || memo3.current_revenue || memo2.current_revenue,
        revenueGrowth: memo1.revenue_growth || memo3.revenue_growth || memo2.revenue_growth,
        memoStatus: status,
        runway: memo1.runway || memo3.runway || memo2.runway,
        burnRate: memo1.burn_rate || memo3.burn_rate || memo2.burn_rate,
        founderBackground: memo1.founder_background || memo3.founder_background || memo2.founder_background,
        founderExperience: memo1.founder_experience || memo3.founder_experience || memo2.founder_experience,
        marketScore: this.calculateMarketScore(memo1, memo2, memo3),
        teamScore: this.calculateTeamScore(memo1, memo2, memo3),
        productScore: this.calculateProductScore(memo1, memo2, memo3)
      };
    } catch (error) {
      console.error('❌ Error transforming memo data:', error, 'Data:', data);
      return {
        id,
        startupName: 'Error loading data',
        founderName: 'Unknown',
        founderEmail: 'unknown@example.com',
        stage: 'Unknown',
        sector: ['Unknown'],
        status: 'Error',
        aiScore: 0,
        riskLevel: 'High',
        lastUpdated: new Date(),
        createdAt: new Date(),
        memo1Generated: false,
        memo2Generated: false,
        memo3Generated: false,
        originalFilename: 'Unknown',
        processingTime: 0,
        memo_1: {},
        memo_2: {},
        memo_3: {}
      };
    }
  }

  private calculateStatus(memo1: any, memo2: any, memo3: any): string {
    if (memo3 && Object.keys(memo3).length > 0) return 'Memo 3';
    if (memo2 && Object.keys(memo2).length > 0) return 'Memo 2';
    if (memo1 && Object.keys(memo1).length > 0) return 'Memo 1';
    return 'Intake';
  }

  private calculateAIScore(memo1: any, memo2: any, memo3: any): number {
    // Mock AI score calculation based on data completeness and quality
    let score = 0;
    if (memo1 && Object.keys(memo1).length > 0) score += 3;
    if (memo2 && Object.keys(memo2).length > 0) score += 3;
    if (memo3 && Object.keys(memo3).length > 0) score += 4;
    return Math.min(score, 10);
  }

  private calculateRiskLevel(memo1: any, memo2: any, memo3: any): string {
    const aiScore = this.calculateAIScore(memo1, memo2, memo3);
    if (aiScore >= 8) return 'Low';
    if (aiScore >= 5) return 'Medium';
    return 'High';
  }

  private calculateMarketScore(memo1: any, memo2: any, memo3: any): number {
    // Mock market score calculation
    return Math.floor(Math.random() * 3) + 7; // 7-9
  }

  private calculateTeamScore(memo1: any, memo2: any, memo3: any): number {
    // Mock team score calculation
    return Math.floor(Math.random() * 3) + 6; // 6-8
  }

  private calculateProductScore(memo1: any, memo2: any, memo3: any): number {
    // Mock product score calculation
    return Math.floor(Math.random() * 3) + 7; // 7-9
  }
}

export const realtimeService = RealtimeService.getInstance();