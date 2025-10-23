'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, TrendingUp, Users, Upload } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase-new';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/lib/api';

// Import our new components
import MemoHeader from '@/components/memo/MemoHeader';
import Memo1Tab from '@/components/memo/Memo1Tab';
import Memo2Tab from '@/components/memo/Memo2Tab';
import Memo3Tab from '@/components/memo/Memo3Tab';
import MemoDebug from '@/components/memo/MemoDebug';

// Helper function to safely convert market size data to string
function convertMarketSizeToString(marketSizeData: any): string {
  if (typeof marketSizeData === 'string') {
    return marketSizeData;
  }
  if (typeof marketSizeData === 'object' && marketSizeData !== null) {
    const parts = [];
    if (marketSizeData.TAM) parts.push(`TAM: ${marketSizeData.TAM}`);
    if (marketSizeData.SAM) parts.push(`SAM: ${marketSizeData.SAM}`);
    if (marketSizeData.SOM) parts.push(`SOM: ${marketSizeData.SOM}`);
    return parts.length > 0 ? parts.join(' | ') : 'Not specified';
  }
  return marketSizeData?.toString() || 'Not specified';
}

interface MemoData {
  id: string;
  memo_1?: {
    title?: string;
    summary?: string;
    business_model?: string;
    market_analysis?: string;
    financial_projections?: string;
    team_info?: string;
    problem?: string;
    solution?: string;
    competition?: string[];
    initial_flags?: string[];
    validation_points?: string[];
    founder_name?: string;
    founder_linkedin_url?: string;
    company_linkedin_url?: string;
    timestamp?: any;
    summary_analysis?: string;
    market_size?: string;
    sam_market_size?: string;
    som_market_size?: string;
    traction?: string;
    team?: string;
    
    // Company Snapshot Fields
    company_stage?: string;
    headquarters?: string;
    founded_date?: string;
    amount_raising?: string;
    post_money_valuation?: string;
    investment_sought?: string;
    ownership_target?: string;
    key_thesis?: string;
    key_metric?: string;
    
    // Financial & Deal Details
    current_revenue?: string;
    revenue_growth_rate?: string;
    customer_acquisition_cost?: string;
    lifetime_value?: string;
    gross_margin?: string;
    operating_margin?: string;
    net_margin?: string;
    burn_rate?: string;
    runway?: string;
    business_model?: string;
    growth_stage?: string;
    pre_money_valuation?: string;
    lead_investor?: string;
    committed_funding?: string;
    round_stage?: string;
    
    // Product & Technology
    product_features?: string[];
    technology_advantages?: string;
    innovation_level?: string;
    scalability_plan?: string;
    technology_stack?: string;
    
    // Market & Competition
    target_customers?: string;
    market_timing?: string;
    competitive_advantages?: string;
    market_penetration?: string;
    industry_category?: string;
    target_market?: string;
    
    // Team & Execution
    team_size?: string;
    key_team_members?: string[];
    advisory_board?: string[];
    execution_track_record?: string;
    
    // Growth & Traction
    user_growth?: string;
    revenue_growth?: string;
    customer_growth?: string;
    key_milestones?: string[];
    upcoming_milestones?: string[];
    
    // Risk & Mitigation
    key_risks?: string[];
    risk_mitigation?: string;
    regulatory_risks?: string;
    
    // Exit Strategy
    potential_acquirers?: string[];
    ipo_timeline?: string;
    exit_valuation?: string;
    
    // Additional fields
    revenue_model?: string;
    pricing_strategy?: string;
    go_to_market?: string;
    funding_ask?: string;
    use_of_funds?: string;
    timeline?: string;
    partnerships?: string;
    regulatory_considerations?: string;
    scalability?: string;
    intellectual_property?: string;
    exit_strategy?: string;
    
    // Enriched fields (for AI-enriched data display)
    headquarters_enriched?: any;
    amount_raising_enriched?: any;
    post_money_valuation_enriched?: any;
    current_revenue_enriched?: any;
    customer_acquisition_cost_enriched?: any;
    gross_margin_enriched?: any;
    founded_date_enriched?: any;
    committed_funding_enriched?: any;
    exit_valuation_enriched?: any;
  };
  filename?: string;
}

interface DiligenceData {
  investment_recommendation?: string;
  problem_validation?: { analysis: string; market_size_assessment?: string; score?: number };
  solution_product_market_fit?: { analysis: string; competitive_advantages?: string[]; score?: number };
  team_execution_capability?: { analysis: string; relevant_experience?: string[]; score?: number };
  founder_market_fit?: { analysis: string; founder_profile?: { name: string; role_and_contributions: string; company_founded: string }; key_insights?: string[]; score?: number };
  market_opportunity_competition?: { analysis: string; market_opportunities?: string; competitive_landscape?: string; score?: number };
  benchmarking_analysis?: { analysis: string; competitive_positioning?: string; confidence_score?: number; differentiation_factors?: string[]; competitive_threats?: string[]; score?: number };
  traction_metrics_validation?: { analysis: string; growth_trajectory?: string; metrics_validation?: string; score?: number };
  key_risks?: string[];
  mitigation_strategies?: string[];
  due_diligence_next_steps?: string[];
  investment_thesis?: string;
  synthesis_notes?: string;
  overall_score?: number;
  [key: string]: any;
}

export default function DealMemoPage() {
  const [memoData, setMemoData] = useState<MemoData | null>(null);
  const [diligenceData, setDiligenceData] = useState<DiligenceData | null>(null);
  const [availableMemos, setAvailableMemos] = useState<MemoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("memo1");
  const [hasRecentData, setHasRecentData] = useState(false);
  const { user, loading: loadingAuth } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    console.log('useEffect triggered:', { loadingAuth, user: !!user });
    if (!loadingAuth) {
      console.log('Calling fetchMemoData...');
      fetchMemoData();
      
      // Auto-refresh disabled to prevent clearing viewed memos
      // Users can manually refresh if needed
    }
  }, [user, loadingAuth]);

  const fetchMemoData = async () => {
    // Temporarily bypass user check for testing
    // if (!user) {
    //   setLoading(false);
    //   return;
    // }

    try {
      console.log('Fetching memo data from Firestore...');
      console.log('Current user:', user?.uid || 'No user');
      console.log('Firestore db object:', db);

      // Test Firestore connection first
      console.log('Testing Firestore connection...');
      const testCollection = collection(db, 'ingestionResults');
      console.log('Collection reference created:', testCollection);

      // Fetch all available memos directly
      console.log('Fetching all available memos directly...');
      
      const allMemosQuery = query(
        collection(db, 'ingestionResults'),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      const allMemosSnapshot = await getDocs(allMemosQuery);
      
      console.log(`Found ${allMemosSnapshot.docs.length} memos in Firestore`);
      
      if (!allMemosSnapshot.empty) {
        const memos: MemoData[] = [];
        allMemosSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          console.log('Processing memo doc:', doc.id, data);
          const memo1Data = data.memo_1 || {};
          console.log('Raw memo1Data from Firestore:', memo1Data);
          console.log('Company stage from Firestore:', memo1Data.company_stage);
          console.log('Headquarters from Firestore:', memo1Data.headquarters);
          console.log('Amount raising from Firestore:', memo1Data.amount_raising);
          const memo: MemoData = {
            id: doc.id,
            filename: data.original_filename || 'Unknown File',
            memo_1: {
              title: memo1Data.title || memo1Data.company_name || 'Company Analysis',
              summary: memo1Data.summary_analysis || memo1Data.summary || 'No summary available',
              business_model: memo1Data.business_model || memo1Data.business_model_description || 'No business model data',
              market_analysis: memo1Data.market_size || memo1Data.market_analysis || memo1Data.target_market || 'No market analysis',
              financial_projections: memo1Data.traction || memo1Data.financial_projections || memo1Data.revenue_model || 'No financial data',
              team_info: memo1Data.team || memo1Data.team_description || memo1Data.founding_team || 'No team information',
              problem: memo1Data.problem || memo1Data.problem_statement || 'No problem statement',
              solution: memo1Data.solution || memo1Data.solution_description || 'No solution description',
              competition: memo1Data.competition || memo1Data.competitors || [],
              initial_flags: memo1Data.initial_flags || memo1Data.red_flags || [],
              validation_points: memo1Data.validation_points || memo1Data.key_validation_points || [],
              founder_name: memo1Data.founder_name || memo1Data.founder || 'Unknown',
              founder_linkedin_url: memo1Data.founder_linkedin_url || memo1Data.founder_linkedin || '',
              company_linkedin_url: memo1Data.company_linkedin_url || memo1Data.company_linkedin || '',
              timestamp: data.timestamp,
              // Additional fields that might be in the data
              summary_analysis: memo1Data.summary_analysis || memo1Data.executive_summary,
              market_size: convertMarketSizeToString(memo1Data.market_size || memo1Data.total_addressable_market),
              sam_market_size: convertMarketSizeToString(memo1Data.sam_market_size || memo1Data.serviceable_available_market),
              som_market_size: convertMarketSizeToString(memo1Data.som_market_size || memo1Data.serviceable_obtainable_market),
              traction: memo1Data.traction || memo1Data.key_metrics,
              team: memo1Data.team || memo1Data.team_overview,
              
              // Company Snapshot Fields - CRITICAL FIX
              company_stage: memo1Data.company_stage,
              headquarters: memo1Data.headquarters,
              founded_date: memo1Data.founded_date,
              amount_raising: memo1Data.amount_raising,
              post_money_valuation: memo1Data.post_money_valuation,
              investment_sought: memo1Data.investment_sought,
              ownership_target: memo1Data.ownership_target,
              key_thesis: memo1Data.key_thesis,
              key_metric: memo1Data.key_metric,
              
              // Financial & Deal Details
              current_revenue: memo1Data.current_revenue,
              revenue_growth_rate: memo1Data.revenue_growth_rate,
              customer_acquisition_cost: memo1Data.customer_acquisition_cost,
              lifetime_value: memo1Data.lifetime_value,
              gross_margin: memo1Data.gross_margin,
              operating_margin: memo1Data.operating_margin,
              net_margin: memo1Data.net_margin,
              burn_rate: memo1Data.burn_rate,
              runway: memo1Data.runway,
              business_model: memo1Data.business_model,
              growth_stage: memo1Data.growth_stage,
              pre_money_valuation: memo1Data.pre_money_valuation,
              lead_investor: memo1Data.lead_investor,
              committed_funding: memo1Data.committed_funding,
              round_stage: memo1Data.round_stage,
              
              // Product & Technology
              product_features: memo1Data.product_features,
              technology_advantages: memo1Data.technology_advantages,
              innovation_level: memo1Data.innovation_level,
              scalability_plan: memo1Data.scalability_plan,
              technology_stack: memo1Data.technology_stack,
              
              // Market & Competition
              target_customers: memo1Data.target_customers,
              market_timing: memo1Data.market_timing,
              competitive_advantages: memo1Data.competitive_advantages,
              market_penetration: memo1Data.market_penetration,
              industry_category: memo1Data.industry_category,
              target_market: memo1Data.target_market,
              
              // Team & Execution
              team_size: memo1Data.team_size,
              key_team_members: memo1Data.key_team_members,
              advisory_board: memo1Data.advisory_board,
              execution_track_record: memo1Data.execution_track_record,
              
              // Growth & Traction
              user_growth: memo1Data.user_growth,
              revenue_growth: memo1Data.revenue_growth,
              customer_growth: memo1Data.customer_growth,
              key_milestones: memo1Data.key_milestones,
              upcoming_milestones: memo1Data.upcoming_milestones,
              
              // Risk & Mitigation
              key_risks: memo1Data.key_risks,
              risk_mitigation: memo1Data.risk_mitigation,
              regulatory_risks: memo1Data.regulatory_risks,
              
              // Exit Strategy
              potential_acquirers: memo1Data.potential_acquirers,
              ipo_timeline: memo1Data.ipo_timeline,
              exit_valuation: memo1Data.exit_valuation,
              
              // Additional fields
              revenue_model: memo1Data.revenue_model,
              pricing_strategy: memo1Data.pricing_strategy,
              go_to_market: memo1Data.go_to_market,
              funding_ask: memo1Data.funding_ask,
              use_of_funds: memo1Data.use_of_funds,
              timeline: memo1Data.timeline,
              partnerships: memo1Data.partnerships,
              regulatory_considerations: memo1Data.regulatory_considerations,
              scalability: memo1Data.scalability,
              intellectual_property: memo1Data.intellectual_property,
              exit_strategy: memo1Data.exit_strategy,
              
              // Enriched fields (for AI-enriched data display)
              headquarters_enriched: memo1Data.headquarters_enriched,
              amount_raising_enriched: memo1Data.amount_raising_enriched,
              post_money_valuation_enriched: memo1Data.post_money_valuation_enriched,
              current_revenue_enriched: memo1Data.current_revenue_enriched,
              customer_acquisition_cost_enriched: memo1Data.customer_acquisition_cost_enriched,
              gross_margin_enriched: memo1Data.gross_margin_enriched,
              founded_date_enriched: memo1Data.founded_date_enriched,
              committed_funding_enriched: memo1Data.committed_funding_enriched,
              exit_valuation_enriched: memo1Data.exit_valuation_enriched
            }
          };
          memos.push(memo);
        });
        console.log('Setting available memos:', memos);
        console.log('First memo memo_1 data:', memos[0]?.memo_1);
        console.log('Company stage in mapped data:', memos[0]?.memo_1?.company_stage);
        console.log('Headquarters in mapped data:', memos[0]?.memo_1?.headquarters);
        setAvailableMemos(memos);
        setLoading(false);
        return;
      }
      
      // If no memos found at all, try to get the most recent one for single display
      console.log('No memos found, trying single memo query...');
      const singleMemoQuery = query(
        collection(db, 'ingestionResults'),
        orderBy('timestamp', 'desc'),
        limit(1)
      );
      const singleMemoSnapshot = await getDocs(singleMemoQuery);

      if (!singleMemoSnapshot.empty) {
        const ingestionDoc = singleMemoSnapshot.docs[0];
        const ingestionData = ingestionDoc.data();

        console.log('Ingestion Data:', ingestionData);
        console.log('Memo 1 Data:', ingestionData.memo_1);

        // Create memo data structure - the actual data is in memo_1 field
        const memo1Data = ingestionData.memo_1 || {};
        const memoData: MemoData = {
          id: ingestionDoc.id,
          filename: ingestionData.original_filename || 'Unknown File',
          memo_1: {
            title: memo1Data.title || memo1Data.company_name || 'Company Analysis',
            summary: memo1Data.summary_analysis || memo1Data.summary || 'No summary available',
            business_model: memo1Data.business_model || memo1Data.business_model_description || 'No business model data',
            market_analysis: memo1Data.market_size || memo1Data.market_analysis || memo1Data.target_market || 'No market analysis',
            financial_projections: memo1Data.traction || memo1Data.financial_projections || memo1Data.revenue_model || 'No financial data',
            team_info: memo1Data.team || memo1Data.team_description || memo1Data.founding_team || 'No team information',
            problem: memo1Data.problem || memo1Data.problem_statement || 'No problem statement',
            solution: memo1Data.solution || memo1Data.solution_description || 'No solution description',
            competition: memo1Data.competition || memo1Data.competitors || [],
            initial_flags: memo1Data.initial_flags || memo1Data.red_flags || [],
            validation_points: memo1Data.validation_points || memo1Data.key_validation_points || [],
            founder_name: memo1Data.founder_name || memo1Data.founder || 'Unknown',
            founder_linkedin_url: memo1Data.founder_linkedin_url || memo1Data.founder_linkedin || '',
            company_linkedin_url: memo1Data.company_linkedin_url || memo1Data.company_linkedin || '',
            timestamp: ingestionData.timestamp,
            // Additional fields that might be in the data
            summary_analysis: memo1Data.summary_analysis || memo1Data.executive_summary,
            market_size: memo1Data.market_size || memo1Data.total_addressable_market,
            traction: memo1Data.traction || memo1Data.key_metrics,
            team: memo1Data.team || memo1Data.team_overview
          }
        };

        setMemoData(memoData);
        setHasRecentData(true);

        // Fetch diligence data from diligenceResults collection
        try {
          // Try to find diligence data by memo_1_id first, then fallback to memoId
          let diligenceQuery = query(
            collection(db, 'diligenceResults'),
            where('memo_1_id', '==', ingestionDoc.id),
            orderBy('timestamp', 'desc'),
            limit(1)
          );

          let diligenceSnapshot = await getDocs(diligenceQuery);

          // If no results found with memo_1_id, try with memoId
          if (diligenceSnapshot.empty) {
            console.log('No diligence data found with memo_1_id, trying memoId...');
            diligenceQuery = query(
              collection(db, 'diligenceResults'),
              where('memoId', '==', ingestionDoc.id),
              orderBy('timestamp', 'desc'),
              limit(1)
            );
            diligenceSnapshot = await getDocs(diligenceQuery);
          }

          if (!diligenceSnapshot.empty) {
            const diligenceDoc = diligenceSnapshot.docs[0];
            const diligenceData = diligenceDoc.data();

            console.log('Diligence Data:', diligenceData);

            // Extract data from memo1_diligence field (as shown in your Firestore structure)
            const memo1Diligence = diligenceData.memo1_diligence || {};

            console.log('Memo1 Diligence Data:', memo1Diligence);

            // Map diligence data to our interface - using the exact structure from your Firestore
            const mappedDiligenceData: DiligenceData = {
              investment_recommendation: memo1Diligence.investment_recommendation,
              problem_validation: memo1Diligence.problem_validation,
              solution_product_market_fit: memo1Diligence.solution_product_market_fit,
              team_execution_capability: memo1Diligence.team_execution_capability,
              founder_market_fit: memo1Diligence.founder_market_fit,
              market_opportunity_competition: memo1Diligence.market_opportunity_competition,
              benchmarking_analysis: memo1Diligence.benchmarking_analysis,
              traction_metrics_validation: memo1Diligence.traction_metrics_validation,
              key_risks: memo1Diligence.key_risks,
              mitigation_strategies: memo1Diligence.mitigation_strategies,
              due_diligence_next_steps: memo1Diligence.due_diligence_next_steps,
              investment_thesis: memo1Diligence.investment_thesis,
              synthesis_notes: memo1Diligence.synthesis_notes,
              overall_score: memo1Diligence.overall_score
            };

            setDiligenceData(mappedDiligenceData);
          } else {
            console.log('No diligence data found');
            setDiligenceData(null);
          }
        } catch (diligenceError) {
          console.error('Error fetching diligence data:', diligenceError);
          setDiligenceData(null);
        }
      } else {
        console.log('No ingestion data found');
        setMemoData(null);
        setDiligenceData(null);
        setHasRecentData(false);
      }
    } catch (error) {
      console.error('Error fetching memo data:', error);
      console.error('Error details:', error);
      setMemoData(null);
      setDiligenceData(null);
      setHasRecentData(false);
      setAvailableMemos([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to select a memo from available memos
  const selectMemo = (selectedMemo: MemoData) => {
    setMemoData(selectedMemo);
    setHasRecentData(true);
    setAvailableMemos([]);
    
    // Fetch diligence data for the selected memo
    fetchDiligenceData(selectedMemo.id);
  };

  // Function to fetch diligence data for a specific memo
  const fetchDiligenceData = async (memoId: string) => {
    try {
      // Try to find diligence data by memo_1_id first, then fallback to memoId
      let diligenceQuery = query(
        collection(db, 'diligenceResults'),
        where('memo_1_id', '==', memoId),
        orderBy('timestamp', 'desc'),
        limit(1)
      );

      let diligenceSnapshot = await getDocs(diligenceQuery);

      // If no results found with memo_1_id, try with memoId
      if (diligenceSnapshot.empty) {
        console.log('No diligence data found with memo_1_id, trying memoId...');
        diligenceQuery = query(
          collection(db, 'diligenceResults'),
          where('memoId', '==', memoId),
          orderBy('timestamp', 'desc'),
          limit(1)
        );
        diligenceSnapshot = await getDocs(diligenceQuery);
      }

      if (!diligenceSnapshot.empty) {
        const diligenceDoc = diligenceSnapshot.docs[0];
        const diligenceData = diligenceDoc.data();

        console.log('Diligence Data:', diligenceData);

        // Extract data from memo1_diligence field (as shown in your Firestore structure)
        const memo1Diligence = diligenceData.memo1_diligence || {};

        console.log('Memo1 Diligence Data:', memo1Diligence);

        // Map diligence data to our interface - using the exact structure from your Firestore
        const mappedDiligenceData: DiligenceData = {
          investment_recommendation: memo1Diligence.investment_recommendation,
          problem_validation: memo1Diligence.problem_validation,
          solution_product_market_fit: memo1Diligence.solution_product_market_fit,
          team_execution_capability: memo1Diligence.team_execution_capability,
          founder_market_fit: memo1Diligence.founder_market_fit,
          market_opportunity_competition: memo1Diligence.market_opportunity_competition,
          benchmarking_analysis: memo1Diligence.benchmarking_analysis,
          traction_metrics_validation: memo1Diligence.traction_metrics_validation,
          key_risks: memo1Diligence.key_risks,
          mitigation_strategies: memo1Diligence.mitigation_strategies,
          due_diligence_next_steps: memo1Diligence.due_diligence_next_steps,
          investment_thesis: memo1Diligence.investment_thesis,
          synthesis_notes: memo1Diligence.synthesis_notes,
          overall_score: memo1Diligence.overall_score
        };

        setDiligenceData(mappedDiligenceData);
      } else {
        console.log('No diligence data found');
        setDiligenceData(null);
      }
    } catch (diligenceError) {
      console.error('Error fetching diligence data:', diligenceError);
      setDiligenceData(null);
    }
  };

  // Function to trigger diligence analysis
  const handleTriggerDiligence = async () => {
    if (!memoData?.id) {
      toast({
        title: "Error",
        description: "No memo data available to trigger diligence",
        variant: "destructive",
      });
      return;
    }

    try {
      const requestBody = {
        memo_1_id: memoData.id,
        timestamp: Date.now(),
      };

      console.log('Triggering diligence with data:', requestBody);
      console.log('API Endpoint:', API_ENDPOINTS.TRIGGER_DILIGENCE);

      const response = await fetch(API_ENDPOINTS.TRIGGER_DILIGENCE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to trigger diligence: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Success result:', result);
      
      toast({
        title: "Diligence Triggered",
        description: "Due diligence analysis has been started. This may take a few minutes.",
      });

      // Refresh the page after a short delay to show updated status
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Error triggering diligence:', error);
      toast({
        title: "Error",
        description: `Failed to trigger diligence: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  // Test function to verify memo display
  const testMemoDisplay = () => {
    const testMemoData: MemoData = {
      id: 'test-123',
      filename: 'test-pitch-deck.pdf',
      memo_1: {
        title: 'Test Company Inc.',
        summary: 'This is a test company for verifying memo display functionality.',
        business_model: 'SaaS subscription model with enterprise clients',
        market_analysis: '$50B TAM in the enterprise software market',
        financial_projections: '$1M ARR with 20% month-over-month growth',
        team_info: 'Experienced team with 10+ years in enterprise software',
        problem: 'Enterprise companies struggle with inefficient data processing',
        solution: 'AI-powered data processing platform that reduces processing time by 80%',
        competition: ['Competitor A', 'Competitor B', 'Competitor C'],
        initial_flags: ['High customer acquisition cost', 'Limited market validation'],
        validation_points: ['Customer references', 'Technical due diligence', 'Market size validation'],
        founder_name: 'John Doe',
        founder_linkedin_url: 'https://linkedin.com/in/johndoe',
        company_linkedin_url: 'https://linkedin.com/company/test-company',
        timestamp: new Date().toISOString()
      }
    };

    setMemoData(testMemoData);
    setHasRecentData(true);
    setLoading(false);

    toast({
      title: "Test Data Loaded",
      description: "Mock memo data has been loaded for testing display.",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Debug logging
  console.log('Render state:', { 
    loading, 
    hasRecentData, 
    memoData: !!memoData, 
    availableMemosLength: availableMemos.length,
    availableMemos: availableMemos 
  });

  // Show available memos selection if we have multiple memos
  if (availableMemos.length > 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Available Deal Memos</h1>
            <p className="text-muted-foreground mt-1">
              Select a deal memo to review and analyze
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {availableMemos.map((memo) => (
            <Card key={memo.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => selectMemo(memo)}>
              <CardHeader>
                <CardTitle className="text-lg">{memo.memo_1?.title || 'Company Analysis'}</CardTitle>
                <CardDescription>
                  {memo.memo_1?.founder_name || 'Unknown Founder'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <strong>File:</strong> {memo.filename}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Company:</strong> {memo.memo_1?.title || 'Unknown Company'}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {memo.memo_1?.summary || 'No summary available'}
                  </p>
                </div>
                <Button className="w-full mt-4" size="sm">
                  View Memo
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button
            onClick={() => window.location.href = '/dashboard/create-room'}
            variant="outline"
            className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
          >
            <Upload className="mr-2 h-4 w-4" />
            Create New Investment Room
          </Button>
        </div>
      </div>
    );
  }

  // Show upload prompt if no recent data
  if (!hasRecentData || !memoData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Deal Memo</h1>
            <p className="text-muted-foreground mt-1">
              AI-powered analysis for your investment opportunities
            </p>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <Upload className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-2xl font-semibold mb-4">No Deal Memos Found</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create investment rooms to connect with founders and access AI-powered deal analysis and due diligence reports.
          </p>
          <div className="space-y-4">
            <Button
              onClick={() => window.location.href = '/dashboard/create-room'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="mr-2 h-4 w-4" />
              Create Investment Room
            </Button>
            <div className="text-sm text-muted-foreground">
              <p>Supported formats: PDF, PowerPoint, Video (MP4), Audio (MP3)</p>
            </div>
            {/* Debug button */}
            <div className="mt-4">
              <Button
                onClick={fetchMemoData}
                variant="outline"
                className="text-xs"
              >
                🔍 Debug: Fetch Memos
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Upload pitch decks and business documents for comprehensive AI analysis.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Due Diligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get detailed investment analysis with risk assessment and recommendations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                AI Interview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Schedule AI-powered interviews for deeper founder and team analysis.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Data Status Banner */}
      {memoData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-800">Live Data</span>
              <span className="text-xs text-blue-600">
                Last updated: {memoData.memo_1?.timestamp ? 
                  new Date(memoData.memo_1.timestamp.seconds * 1000).toLocaleString() : 
                  'Recently'
                }
              </span>
            </div>
            <button 
              onClick={fetchMemoData}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Refresh Data
            </button>
          </div>
        </div>
      )}

      {/* Debug Information */}
      {process.env.NODE_ENV === 'development' && memoData && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <details className="text-xs">
            <summary className="cursor-pointer font-medium text-gray-700 mb-2">
              🔍 Debug: Raw Data Structure
            </summary>
            <div className="space-y-2">
              <div>
                <strong>Memo Data ID:</strong> {memoData.id}
              </div>
              <div>
                <strong>Filename:</strong> {memoData.filename}
              </div>
              <div>
                <strong>Has Diligence Data:</strong> {diligenceData ? 'Yes' : 'No'}
              </div>
              {diligenceData && (
                <div>
                  <strong>Diligence Data Keys:</strong> {Object.keys(diligenceData).join(', ')}
                </div>
              )}
              <div className="mt-2">
                <strong>Raw Memo1 Data:</strong>
                <pre className="bg-white p-2 rounded border text-xs overflow-auto max-h-32">
                  {JSON.stringify(memoData.memo_1, null, 2)}
                </pre>
              </div>
            </div>
          </details>
        </div>
      )}

      <MemoHeader 
        memoData={memoData}
        diligenceData={diligenceData}
        onTriggerDiligence={handleTriggerDiligence}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="memo1">Memo 1: Initial Analysis</TabsTrigger>
          <TabsTrigger value="memo2">Memo 2: Interview Analysis</TabsTrigger>
          <TabsTrigger value="memo3">Memo 3: Final Decision</TabsTrigger>
        </TabsList>

        <TabsContent value="memo1">
          <Memo1Tab 
            memo1={memoData.memo_1 || {}} 
            memoId={memoData.id}
            onInterviewScheduled={(result) => {
              console.log('Interview scheduled:', result);
              toast({
                title: "Interview Scheduled",
                description: "The AI interview has been successfully scheduled in your calendar.",
              });
            }}
          />
        </TabsContent>

        <TabsContent value="memo2">
          <Memo2Tab diligenceData={diligenceData} />
        </TabsContent>

        <TabsContent value="memo3">
          <Memo3Tab diligenceData={diligenceData} memo1Data={memoData.memo_1} memoId={memoData.id} />
        </TabsContent>
      </Tabs>

      <MemoDebug
        user={user}
        loading={loading}
        hasRecentData={hasRecentData}
        memoData={memoData}
        diligenceData={diligenceData}
        onRefresh={fetchMemoData}
        onTestMemo={testMemoDisplay}
      />
    </div>
  );
}
