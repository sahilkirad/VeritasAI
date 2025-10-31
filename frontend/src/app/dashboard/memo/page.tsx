'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, TrendingUp, Users, Upload } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase-new';
import { collection, query, orderBy, limit, getDocs, where, onSnapshot, DocumentData, getDoc, doc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/lib/api';
import { stripCodeFences, tryParseJsonFlexible } from '@/lib/llm';

// Import our new components
import MemoHeader from '@/components/memo/MemoHeader';
import Memo1Tab from '@/components/memo/Memo1Tab';
import Memo2Tab from '@/components/memo/Memo2Tab';
import Memo3Tab from '@/components/memo/Memo3Tab';
import MemoDebug from '@/components/memo/MemoDebug';

// Helper function to safely convert market size data to string
function convertMarketSizeToString(marketSizeData: any): string {
  console.log('convertMarketSizeToString input:', marketSizeData);
  console.log('convertMarketSizeToString input type:', typeof marketSizeData);
  
  if (typeof marketSizeData === 'string') {
    console.log('Returning string as-is:', marketSizeData);
    return marketSizeData;
  }
  if (typeof marketSizeData === 'object' && marketSizeData !== null) {
    console.log('Converting object to string:', marketSizeData);
    const parts = [];
    if (marketSizeData.TAM) parts.push(`TAM: ${marketSizeData.TAM}`);
    if (marketSizeData.SAM) parts.push(`SAM: ${marketSizeData.SAM}`);
    if (marketSizeData.SOM) parts.push(`SOM: ${marketSizeData.SOM}`);
    const result = parts.length > 0 ? parts.join(' | ') : 'Not specified';
    console.log('Object conversion result:', result);
    return result;
  }
  const result = marketSizeData?.toString() || 'Not specified';
  console.log('Fallback conversion result:', result);
  return result;
}

interface MemoData {
  id: string;
  company_id?: string;
  memo_1?: {
    title?: string;
    founder_email?: string;
    summary?: string;
    business_model?: string;
    market_analysis?: string;
    financial_projections?: string;
    team_info?: string;
    problem?: string;
    solution?: string;
    competition?: any[];
    initial_flags?: any[];
    validation_points?: any[];
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
    growth_stage?: string;
    pre_money_valuation?: string;
    lead_investor?: string;
    committed_funding?: string;
    round_stage?: string;
    
    // Product & Technology
    product_features?: any[];
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
    key_team_members?: any[];
    advisory_board?: any[];
    execution_track_record?: string;
    
    // Growth & Traction
    user_growth?: string;
    revenue_growth?: string;
    customer_growth?: string;
    key_milestones?: any[];
    upcoming_milestones?: any[];
    
    // Risk & Mitigation
    key_risks?: any[];
    risk_mitigation?: string;
    regulatory_risks?: string;
    
    // Exit Strategy
    potential_acquirers?: any[];
    ipo_timeline?: string;
    exit_valuation?: string;
    
    // Additional fields
    revenue_model?: string;
    pricing_strategy?: string;
    go_to_market?: string;
    funding_ask?: string;
    use_of_funds?: string;
    timeline?: string;
    partnerships?: string[];
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
  const [interviewData, setInterviewData] = useState<any>(null);
  const [availableMemos, setAvailableMemos] = useState<MemoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("memo1");
  const [hasRecentData, setHasRecentData] = useState(false);
  const [liveListening, setLiveListening] = useState(false);
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

      // Fetch all available memos - PRIORITIZE memo1_validated for enriched data
      console.log('Fetching all available memos directly...');
      
      // First, get all ingestionResults to get the list of memos
      const allMemosQuery = query(
        collection(db, 'ingestionResults'),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      const allMemosSnapshot = await getDocs(allMemosQuery);
      
      console.log(`Found ${allMemosSnapshot.docs.length} memos in Firestore`);
      
      if (!allMemosSnapshot.docs.length) {
        setLoading(false);
        return;
      }

      // Process memos - check memo1_validated for enriched data
        const memos: MemoData[] = [];
      for (const ingestionDoc of allMemosSnapshot.docs) {
        const data = ingestionDoc.data();
        const memoId = ingestionDoc.id;
        console.log('Processing memo doc:', memoId, data);
        
        // PRIORITY: Check memo1_validated FIRST for enriched data
        let memo1Data: any = {};
        try {
          const validatedDoc = await getDoc(doc(db, 'memo1_validated', memoId));
          if (validatedDoc.exists()) {
            const validatedData = validatedDoc.data();
            memo1Data = validatedData.memo_1 || {};
            console.log(`✅ Using enriched data from memo1_validated for ${memoId}`);
          } else {
            // Fallback to original data if no enriched version exists
            memo1Data = data.memo_1 || {};
            console.log(`⚠️ Using original data from ingestionResults for ${memoId}`);
          }
        } catch (e) {
          // Fallback to original data on error
          memo1Data = data.memo_1 || {};
          console.log(`⚠️ Error fetching memo1_validated, using original data:`, e);
        }
          // Merge parsed raw_response (if present) to populate missing fields
          if (memo1Data && typeof memo1Data.raw_response === 'string') {
            const parsed = tryParseJsonFlexible(stripCodeFences(memo1Data.raw_response));
            if (parsed && typeof parsed === 'object') {
              memo1Data = { ...parsed, ...memo1Data };
            }
          }
          console.log('Raw memo1Data from Firestore:', memo1Data);
          console.log('Company stage from Firestore:', memo1Data.company_stage);
          console.log('Headquarters from Firestore:', memo1Data.headquarters);
          console.log('Amount raising from Firestore:', memo1Data.amount_raising);
          console.log('Market size from Firestore:', memo1Data.market_size);
          console.log('Market size type:', typeof memo1Data.market_size);
          const memo: MemoData = {
            id: memoId,
            company_id: data.company_id || memo1Data.company_id,
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
              founder_email: memo1Data.founder_email,
              founder_linkedin_url: memo1Data.founder_linkedin_url || memo1Data.founder_linkedin || '',
              company_linkedin_url: memo1Data.company_linkedin_url || memo1Data.company_linkedin || '',
              timestamp: data.timestamp,
              // Additional fields that might be in the data
              summary_analysis: memo1Data.summary_analysis || memo1Data.executive_summary,
              market_size: (() => {
                const converted = convertMarketSizeToString(memo1Data.market_size || memo1Data.total_addressable_market);
                console.log('Converted market_size:', converted);
                return converted;
              })(),
              sam_market_size: (() => {
                const converted = convertMarketSizeToString(memo1Data.sam_market_size || memo1Data.serviceable_available_market);
                console.log('Converted sam_market_size:', converted);
                return converted;
              })(),
              som_market_size: (() => {
                const converted = convertMarketSizeToString(memo1Data.som_market_size || memo1Data.serviceable_obtainable_market);
                console.log('Converted som_market_size:', converted);
                return converted;
              })(),
              traction: memo1Data.traction || memo1Data.key_metrics,
              team: memo1Data.team || memo1Data.team_overview,
              
              // Company Snapshot Fields - add robust fallbacks to avoid "Not specified"
              company_stage: memo1Data.company_stage || memo1Data.stage || memo1Data.growth_stage,
              headquarters: memo1Data.headquarters || memo1Data.location || memo1Data.hq,
              founded_date: memo1Data.founded_date || memo1Data.founded_year || memo1Data.founded,
              amount_raising: memo1Data.amount_raising || memo1Data.funding_ask || memo1Data.raise_amount,
              post_money_valuation: memo1Data.post_money_valuation || memo1Data.post_money || memo1Data.valuation,
              investment_sought: memo1Data.investment_sought || memo1Data.funding_ask || memo1Data.amount_raising,
              ownership_target: memo1Data.ownership_target || memo1Data.target_ownership || memo1Data.equity_offered,
              key_thesis: memo1Data.key_thesis || memo1Data.investment_thesis || memo1Data.summary_analysis,
              key_metric: memo1Data.key_metric || memo1Data.key_metrics || memo1Data.traction,
              
              // Financial & Deal Details
              current_revenue: memo1Data.current_revenue || memo1Data.revenue || memo1Data.arr,
              revenue_growth_rate: memo1Data.revenue_growth_rate || memo1Data.growth_rate || memo1Data.revenue_growth,
              customer_acquisition_cost: memo1Data.customer_acquisition_cost || memo1Data.cac,
              lifetime_value: memo1Data.lifetime_value || memo1Data.ltv,
              gross_margin: memo1Data.gross_margin || memo1Data.margin,
              operating_margin: memo1Data.operating_margin,
              net_margin: memo1Data.net_margin,
              burn_rate: memo1Data.burn_rate || memo1Data.monthly_burn,
              runway: memo1Data.runway,
              growth_stage: memo1Data.growth_stage || memo1Data.company_stage,
              pre_money_valuation: memo1Data.pre_money_valuation || memo1Data.pre_money,
              lead_investor: memo1Data.lead_investor || memo1Data.lead,
              committed_funding: memo1Data.committed_funding || memo1Data.committed,
              round_stage: memo1Data.round_stage || memo1Data.round,
              
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
              industry_category: Array.isArray(memo1Data.industry_category) 
                ? memo1Data.industry_category.join(', ') 
                : memo1Data.industry_category,
              target_market: memo1Data.target_market,
              
              // Team & Execution
              team_size: memo1Data.team_size,
              key_team_members: memo1Data.key_team_members || [],
              advisory_board: memo1Data.advisory_board || [],
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
        }
        
        console.log('Setting available memos:', memos);
        console.log('First memo memo_1 data:', memos[0]?.memo_1);
        console.log('Company stage in mapped data:', memos[0]?.memo_1?.company_stage);
        console.log('Headquarters in mapped data:', memos[0]?.memo_1?.headquarters);
        
        // Debug critical fields that are showing as "Not specified"
        if (memos[0]?.memo_1) {
          console.log('=== FIRESTORE DATA DEBUG ===');
          console.log('Raw Firestore memo1Data:', allMemosSnapshot.docs[0].data().memo_1);
          console.log('Mapped company_stage:', memos[0].memo_1.company_stage);
          console.log('Mapped headquarters:', memos[0].memo_1.headquarters);
          console.log('Mapped founded_date:', memos[0].memo_1.founded_date);
          console.log('Mapped amount_raising:', memos[0].memo_1.amount_raising);
          console.log('Mapped post_money_valuation:', memos[0].memo_1.post_money_valuation);
          console.log('Mapped current_revenue:', memos[0].memo_1.current_revenue);
          console.log('Mapped customer_acquisition_cost:', memos[0].memo_1.customer_acquisition_cost);
          console.log('Mapped gross_margin:', memos[0].memo_1.gross_margin);
          console.log('Mapped use_of_funds:', memos[0].memo_1.use_of_funds);
          console.log('Mapped potential_acquirers:', memos[0].memo_1.potential_acquirers);
          console.log('=== END FIRESTORE DATA DEBUG ===');
        }
        // If exactly one memo, auto-select; if multiple, show selection list
        if (memos.length === 1) {
          setMemoData(memos[0]);
          setHasRecentData(true);
          setAvailableMemos([]);
          // Also fetch related diligence/interview data for selected memo
          fetchDiligenceData(memos[0].id);
          setLoading(false);
          return;
        } else if (memos.length > 1) {
          setAvailableMemos(memos);
          setHasRecentData(false);
          setLoading(false);
          return;
        }
        setLoading(false);
        return;
      
      // If no memos found, try to get the most recent one for single display
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
        const memoId = ingestionDoc.id;

        console.log('Ingestion Data:', ingestionData);
        console.log('Memo 1 Data:', ingestionData.memo_1);

        // PRIORITY: Check for enriched/validated memo in memo1_validated collection FIRST
        let enrichedMemo1Data: any = null;
        let memo1Data: any = {};
        try {
          const validatedDoc = await getDoc(doc(db, 'memo1_validated', memoId));
          if (validatedDoc.exists()) {
            const validatedData = validatedDoc.data();
            enrichedMemo1Data = validatedData.memo_1;
            memo1Data = enrichedMemo1Data || {};
            console.log('✅ Found enriched memo in memo1_validated, using enriched data');
            console.log('Enriched fields:', Object.keys(memo1Data));
          } else {
            console.log('⚠️ No enriched memo found in memo1_validated, using original data');
            memo1Data = ingestionData.memo_1 || {};
          }
        } catch (e) {
          console.log('⚠️ Error fetching memo1_validated, using original data:', e);
          memo1Data = ingestionData.memo_1 || {};
        }

        // Always prefer enriched data from memo1_validated, fallback to original
        
        // Merge parsed raw_response (if present) to populate missing fields
        if (memo1Data && typeof memo1Data.raw_response === 'string') {
          const parsed = tryParseJsonFlexible(stripCodeFences(memo1Data.raw_response));
          if (parsed && typeof parsed === 'object') {
            memo1Data = { ...parsed, ...memo1Data };
          }
        }
        
        // Merge enriched fields if available (enriched data takes precedence)
        if (enrichedMemo1Data) {
          memo1Data = { ...memo1Data, ...enrichedMemo1Data };
        }
        const memoData: MemoData = {
          id: ingestionDoc.id,
          company_id: ingestionData.company_id || memo1Data.company_id,
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
          const resultsBlock = diligenceData.results || {};

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

          // Hydrate Market & Claim Validation + Benchmarking from results block if available
          // - claims: results.market_validation.claims, summary
          // - benchmarking: results.market_benchmarking or results.market_benchmarking.data
          if (resultsBlock) {
            if (resultsBlock.market_validation) {
              (mappedDiligenceData as any).market_validation = {
                claims: resultsBlock.market_validation.claims || [],
                summary: resultsBlock.market_validation.summary || ''
              };
            }
            const rbm = resultsBlock.market_benchmarking;
            if (rbm) {
              (mappedDiligenceData as any).market_benchmarking = rbm.data || rbm;
            }
            // Optional: pitch consistency from results
            if (resultsBlock.pitch_consistency) {
              (mappedDiligenceData as any).pitch_consistency_check = resultsBlock.pitch_consistency;
            }
            // Optional: overall recommendation block if present
            if (resultsBlock.overall_dd_score_recommendation) {
              (mappedDiligenceData as any).overall_dd_score_recommendation = resultsBlock.overall_dd_score_recommendation;
            }
            if (resultsBlock.red_flags_concerns) {
              (mappedDiligenceData as any).red_flags_concerns = resultsBlock.red_flags_concerns;
            }
            if (resultsBlock.financial_validation) {
              (mappedDiligenceData as any).financial_validation = resultsBlock.financial_validation;
            }
          }

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
    // Start live listeners for dynamic updates
    startLiveListeners(selectedMemo.id);
  };

  // Function to fetch diligence data for a specific memo
  const fetchDiligenceData = async (memoId: string) => {
    try {
      // Try to find diligence data by memo_1_id first, then fallback to memoId
      let diligenceQuery = query(
        collection(db, 'diligenceReports'),
        where('memo_1_id', '==', memoId),
        limit(1)
      );

      let diligenceSnapshot = await getDocs(diligenceQuery);

      // If no results found with memo_1_id, try with memoId
      if (diligenceSnapshot.empty) {
        console.log('No diligence data found with memo_1_id, trying memoId...');
        diligenceQuery = query(
          collection(db, 'diligenceReports'),
          where('memoId', '==', memoId),
          limit(1)
        );
        diligenceSnapshot = await getDocs(diligenceQuery);
      }

      // Additional fallbacks: use company_id and alternative collections used by Diligence Hub
      if (diligenceSnapshot.empty) {
        const companyId = memoData?.company_id || memoData?.memo_1?.company_id || null;
        if (companyId) {
          console.log('Trying diligenceReports by company_id...', companyId);
          diligenceQuery = query(
            collection(db, 'diligenceReports'),
            where('company_id', '==', companyId),
            limit(1)
          );
          diligenceSnapshot = await getDocs(diligenceQuery);

          const altCollections = ['diligenceHub', 'diligence_hub'];
          for (const col of altCollections) {
            if (!diligenceSnapshot.empty) break;
            console.log(`Trying ${col} by company_id...`, companyId);
            const altSnap = await getDocs(
              query(collection(db, col), where('company_id', '==', companyId), limit(1))
            );
            if (!altSnap.empty) {
              diligenceSnapshot = altSnap;
              break;
            }
          }
        }
      }

      // Fetch interview data
      let interviewData = null;
      try {
        const interviewQuery = query(
          collection(db, 'interviews'),
          where('companyId', '==', memoId),
          where('status', '==', 'completed'),
          orderBy('createdAt', 'desc'),
          limit(1)
        );
        const interviewSnapshot = await getDocs(interviewQuery);
        
        if (!interviewSnapshot.empty) {
          const interviewDoc = interviewSnapshot.docs[0];
          interviewData = interviewDoc.data();
          console.log('Interview Data:', interviewData);
          setInterviewData(interviewData);
        }
      } catch (interviewError) {
        console.log('No interview data found:', interviewError);
        setInterviewData(null);
      }

      if (!diligenceSnapshot.empty) {
        const diligenceDoc = diligenceSnapshot.docs[0];
        const diligenceData = diligenceDoc.data();

        console.log('✅ Fetched Diligence Data from diligenceReports:', diligenceData);

        // Extract from the structure: results.agent_validations, results.validation_results
        const resultsBlock = diligenceData.results || {};
        const agentValidations = resultsBlock.agent_validations || {};
        const validationResults = resultsBlock.validation_results || {};

        // Map founder profile from agent_validations or validation_results
        const founderProfile = agentValidations.founder_profile || validationResults.founder_profile || {};
        const memo1Accuracy = agentValidations.memo1_accuracy || validationResults.memo1_accuracy || {};
        const pitchConsistency = agentValidations.pitch_consistency || validationResults.pitch_consistency || {};
        
        // Extract market benchmarking
        const marketBenchmarking = resultsBlock.market_benchmarking || agentValidations.market_benchmarking || validationResults.market_benchmarking || {};

        // Extract key findings properly
        const keyFindings = resultsBlock.key_findings || {};
        const redFlagsArray = keyFindings.red_flags || [];
        const unsubstantiatedClaims = keyFindings.unsubstantiated_claims || [];
        const externalDiscrepancies = keyFindings.external_discrepancies || [];
        
        // Map diligence data to our interface - using the correct structure from diligenceReports
        const mappedDiligenceData: DiligenceData = {
          // Metadata from document root
          investor_email: diligenceData.investor_email,
          company_id: diligenceData.company_id,
          created_at: diligenceData.created_at,
          completed_at: diligenceData.completed_at,
          last_updated: diligenceData.last_updated,
          progress: diligenceData.progress,
          status: diligenceData.status || resultsBlock.status || 'completed',
          validation_timestamp: resultsBlock.validation_results?.memo1_accuracy?.validation_timestamp || 
                               resultsBlock.validation_results?.founder_profile?.validation_timestamp ||
                               resultsBlock.validation_results?.pitch_consistency?.validation_timestamp || null,
          
          // Overall scores and summary
          overall_score: resultsBlock.overall_score || diligenceData.overall_score || 0,
          executive_summary: {
            overall_dd_score: resultsBlock.overall_score || diligenceData.overall_score || 0,
            overall_dd_status: resultsBlock.risk_assessment || 'N/A',
            recommendation: resultsBlock.recommendations?.[0] || 'N/A',
            key_findings: keyFindings,
            validation_gaps: keyFindings.unsubstantiated_claims?.length || 0,
            company_name: memoData?.memo_1?.title || 'Company Analysis'
          },
          
          // Founder Credibility Assessment (from agent_validations.founder_profile)
          founder_credibility_assessment: {
            overall_score: founderProfile.credibility_score || founderProfile.overall_score || 0,
            credibility_rating: founderProfile.recommendation || (founderProfile.credibility_score >= 70 ? 'High' : founderProfile.credibility_score >= 50 ? 'Medium' : 'Low'),
            detailed_analysis: founderProfile.detailed_analysis || '',
            missing_information: founderProfile.missing_information || [],
            recommendation: founderProfile.recommendation || '',
            red_flags: founderProfile.red_flags || [],
            validation_status: founderProfile.validation_status || '',
            verified_claims: founderProfile.verified_claims || []
          },
          
          // Memo1 Accuracy (from agent_validations.memo1_accuracy)
          memo1_accuracy_data: {
            accuracy_score: memo1Accuracy.accuracy_score || 0,
            detailed_analysis: memo1Accuracy.detailed_analysis || '',
            discrepancies: memo1Accuracy.discrepancies || [],
            exaggerations: memo1Accuracy.exaggerations || [],
            omissions: memo1Accuracy.omissions || [],
            risk_level: memo1Accuracy.risk_level || '',
            verified_facts: memo1Accuracy.verified_facts || []
          },
          
          // Pitch Consistency (from agent_validations.pitch_consistency)
          pitch_consistency_check: {
            consistency_score: pitchConsistency.consistency_score || 0,
            match_percentage: pitchConsistency.match_percentage || pitchConsistency.consistency_score || 0,
            data_gaps: pitchConsistency.data_gaps || [],
            detailed_analysis: pitchConsistency.detailed_analysis || '',
            internal_contradictions: pitchConsistency.internal_contradictions || [],
            risk_level: pitchConsistency.risk_level || '',
            unrealistic_claims: pitchConsistency.unrealistic_claims || []
          },
          
          // Red Flags and Concerns
          red_flags_concerns: {
            total_flags: redFlagsArray.length,
            critical_blockers: redFlagsArray.filter((f: any) => typeof f === 'string' ? f.toLowerCase().includes('critical') || f.toLowerCase().includes('blocker') : (f.severity === 'critical' || f.flag_type === 'critical')).length,
            flags: redFlagsArray.map((f: any) => {
              if (typeof f === 'string') {
                return { flag_type: 'Risk', description: f, severity: 'Medium' };
              }
              return f;
            }),
            mitigation_level: resultsBlock.risk_assessment === 'high' ? 'High Risk' : resultsBlock.risk_assessment === 'medium' ? 'Medium Risk' : 'Low Risk'
          },
          
          // Market Benchmarking
          market_benchmarking: marketBenchmarking.data || marketBenchmarking,
          
          // Key Findings (structured)
          key_findings: {
            red_flags: redFlagsArray,
            unsubstantiated_claims: unsubstantiatedClaims,
            external_discrepancies: externalDiscrepancies,
            internal_contradictions: keyFindings.internal_contradictions || []
          },
          
          // Recommendations and Priority Actions
          recommendations: resultsBlock.recommendations || [],
          priority_actions: resultsBlock.priority_actions || [],
          
          // Risk Assessment
          risk_assessment: resultsBlock.risk_assessment || 'N/A',
          
          // Confidence and Executive Summary
          confidence_level: resultsBlock.confidence_level || 'N/A',
          executive_summary_text: resultsBlock.executive_summary || resultsBlock.detailed_analysis || '',
          
          // Overall DD Score Recommendation (combining scores)
          overall_dd_score_recommendation: {
            overall_dd_score: resultsBlock.overall_score || 0,
            confidence_level: resultsBlock.confidence_level || 'N/A',
            investment_recommendation: resultsBlock.recommendations?.[0] || 'N/A',
            component_scores: {
              founder_credibility: founderProfile.credibility_score || 0,
              memo1_accuracy: memo1Accuracy.accuracy_score || 0,
              pitch_consistency: pitchConsistency.consistency_score || 0,
              overall_score: resultsBlock.overall_score || 0
            }
          }
        };

        console.log('✅ Mapped Diligence Data:', mappedDiligenceData);

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

  // Live listeners for dynamic updates of Memo 2 data (diligence + interview)
  useEffect(() => {
    if (memoData?.id && !liveListening) {
      startLiveListeners(memoData.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memoData?.id]);

  const startLiveListeners = (memoId: string) => {
    try {
      setLiveListening(true);
      
      // Real-time listener for enriched memo data from memo1_validated
      const validatedRef = doc(db, 'memo1_validated', memoId);
      const unsubValidated = onSnapshot(
        validatedRef,
        (doc) => {
          if (doc.exists()) {
            const validatedData = doc.data();
            const enrichedMemo1 = validatedData.memo_1;
            
            if (enrichedMemo1 && memoData) {
              console.log('🔄 Real-time update: Enriched memo data received from memo1_validated');
              console.log('Enriched fields received:', Object.keys(enrichedMemo1));
              
              // Update memoData with enriched data, preserving existing structure
              setMemoData({
                ...memoData,
                memo_1: {
                  ...memoData.memo_1,
                  ...enrichedMemo1,
                  // Preserve metadata fields
                  timestamp: memoData.memo_1.timestamp || validatedData.timestamp,
                }
              });
              
              toast({
                title: "Data Enriched",
                description: "Memo has been enriched with real company information.",
              });
            }
          }
        },
        (error) => {
          console.error('Error listening to memo1_validated:', error);
        }
      );

      // Diligence live updates
      const diligenceQ = query(
        collection(db, 'diligenceReports'),
        where('memo_1_id', '==', memoId),
        limit(1)
      );
      const unsubDiligence = onSnapshot(diligenceQ, (snapshot) => {
        if (!snapshot.empty) {
          const diligenceDataDoc: DocumentData = snapshot.docs[0].data();
          const memo1Diligence = diligenceDataDoc.memo1_diligence || {};
          const mapped: DiligenceData = {
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
            overall_score: memo1Diligence.overall_score,
          };
          setDiligenceData(mapped);
        }
      });

      // Interview live updates
      const interviewsQ = query(
        collection(db, 'interviews'),
        where('companyId', '==', memoId),
        where('status', '==', 'completed'),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      const unsubInterviews = onSnapshot(interviewsQ, (snapshot) => {
        if (!snapshot.empty) {
          setInterviewData(snapshot.docs[0].data());
        }
      });

      // Clean up listeners on unmount or memo change
      return () => {
        try { unsubValidated(); } catch {}
        try { unsubDiligence(); } catch {}
        try { unsubInterviews(); } catch {}
        setLiveListening(false);
      };
    } catch (e) {
      console.log('Live listeners setup failed:', e);
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
      <div className="space-y-2 max-w-6xl mx-auto px-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Available Deal Memos</h1>
            <p className="text-muted-foreground text-sm">
              Select a deal memo to review and analyze
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {availableMemos.map((memo) => (
            <Card key={memo.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => selectMemo(memo)}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{memo.memo_1?.title || 'Company Analysis'}</CardTitle>
                <CardDescription className="text-sm">
                  {memo.memo_1?.founder_name || 'Unknown Founder'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    <strong>File:</strong> {memo.filename}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <strong>Company:</strong> {memo.memo_1?.title || 'Unknown Company'}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {memo.memo_1?.summary || 'No summary available'}
                  </p>
                </div>
                <Button className="w-full mt-3" size="sm">
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
      <div className="space-y-2 max-w-6xl mx-auto px-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Deal Memo</h1>
            <p className="text-muted-foreground text-sm">
              AI-powered analysis for your investment opportunities
            </p>
          </div>
        </div>

        <div className="text-center py-4">
          <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-3">
            <Upload className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Deal Memos Found</h3>
          <p className="text-muted-foreground mb-3 max-w-md mx-auto text-xs">
            Create investment rooms to connect with founders and access AI-powered deal analysis and due diligence reports.
          </p>
          <div className="space-y-2">
            <Button
              onClick={() => window.location.href = '/dashboard/create-room'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="mr-2 h-4 w-4" />
              Create Investment Room
            </Button>
            <div className="text-xs text-muted-foreground">
              <p>Supported formats: PDF, PowerPoint, Video (MP4), Audio (MP3)</p>
            </div>
            {/* Debug button */}
            <div className="mt-3">
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

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-4 w-4" />
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
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-4 w-4" />
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
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-4 w-4" />
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
    <div className="space-y-2 max-w-6xl mx-auto px-2">
      {/* Data Status Banner - Ultra Compact */}
      {memoData && (
        <div className="bg-blue-50 border border-blue-200 rounded p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-blue-800">Live</span>
              <span className="text-xs text-blue-600">
                {memoData.memo_1?.timestamp ? 
                  new Date(memoData.memo_1.timestamp.seconds * 1000).toLocaleTimeString() : 
                  'Recent'
                }
              </span>
            </div>
            <button 
              onClick={fetchMemoData}
              className="text-xs text-blue-600 hover:text-blue-800 px-1 py-0.5 rounded hover:bg-blue-100"
            >
              ↻
            </button>
          </div>
        </div>
      )}

      {/* Debug Information - Ultra Compact */}
      {process.env.NODE_ENV === 'development' && memoData && (
        <div className="bg-gray-50 border border-gray-200 rounded p-1">
          <details className="text-xs">
            <summary className="cursor-pointer font-medium text-gray-700 text-xs">
              🔍 Debug
            </summary>
            <div className="mt-1 text-xs">
              ID: {memoData.id.slice(0,8)}... | File: {memoData.filename} | Diligence: {diligenceData ? 'Yes' : 'No'}
            </div>
          </details>
        </div>
      )}

      <MemoHeader 
        memoData={memoData}
        diligenceData={diligenceData}
        onTriggerDiligence={handleTriggerDiligence}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-1">
        <TabsList className="grid w-full grid-cols-3 h-8">
          <TabsTrigger value="memo1" className="text-xs">Initial</TabsTrigger>
          <TabsTrigger value="memo2" className="text-xs">Interview</TabsTrigger>
          <TabsTrigger value="memo3" className="text-xs">Decision</TabsTrigger>
        </TabsList>

        <TabsContent value="memo1" className="mt-1">
          <Memo1Tab 
            memo1={(() => {
              const memo1Data = memoData.memo_1 || {};
              console.log('Passing memo1 data to Memo1Tab:', memo1Data);
              console.log('Market size in memo1:', memo1Data.market_size);
              console.log('Market size type in memo1:', typeof memo1Data.market_size);
              console.log('Founder email in memo1:', memo1Data.founder_email);
              return memo1Data;
            })()} 
            memoId={memoData.id}
            onInterviewScheduled={(result) => {
              console.log('Interview scheduled:', result);
              toast({
                title: "Interview Scheduled",
                description: "Interview invitation has been sent to the founder successfully.",
              });
            }}
          />
        </TabsContent>

        <TabsContent value="memo2" className="mt-1">
          <Memo2Tab 
            diligenceData={diligenceData} 
            interviewData={interviewData} 
            memo1={memoData.memo_1}
            memoId={memoData.id}
            onDiligenceDataUpdate={(data) => {
              setDiligenceData(data);
              toast({
                title: "Data Updated",
                description: "Diligence data has been refreshed successfully.",
              });
            }}
          />
        </TabsContent>

        <TabsContent value="memo3" className="mt-1">
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
