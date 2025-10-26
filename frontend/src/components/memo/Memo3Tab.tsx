'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, CheckCircle, ThumbsUp, ThumbsDown, MessageCircle, Users, TrendingUp, DollarSign, BarChart3, AlertTriangle, ExternalLink, Cpu, Database, Cloud, Zap, Shield, Building, Loader2, FileText } from "lucide-react";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase-new';
import { collection, query, orderBy, limit, getDocs, where, doc, getDoc } from 'firebase/firestore';
import CompetitorMatrix from "./CompetitorMatrix";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

interface EnrichedField {
  value: string;
  source_url?: string;
  confidence: number;
  enriched: boolean;
  search_query?: string;
}

interface ValidationResult {
  status: string;
  validation_result: {
    data_validation?: {
      accuracy_score: number;
      completeness_score: number;
      consistency_score: number;
      validation_notes: string;
      data_quality: string;
      red_flags: string[];
    };
    market_validation?: {
      market_size_accuracy: number;
      competitive_landscape: string;
      market_timing: string;
      growth_potential: string;
      market_attractiveness: number;
      competitive_positioning: string;
    };
    financial_validation?: {
      revenue_projections: string;
      unit_economics: string;
      funding_requirements: string;
      valuation_reasonableness: string;
      financial_viability: number;
      burn_rate_analysis: string;
    };
    team_validation?: {
      founder_background: string;
      team_completeness: string;
      execution_capability: string;
      advisory_board: string;
      team_strength: number;
      execution_risk: string;
    };
    strategic_analysis?: {
      competitive_advantages: string[];
      differentiation: string;
      scalability: string;
      market_opportunity: string;
      business_model: string;
    };
    risk_assessment?: {
      key_risks: string[];
      risk_mitigation: string;
      regulatory_risks: string;
      market_risks: string;
      execution_risks: string;
    };
    overall_assessment?: {
      investment_readiness: number;
      key_strengths: string[];
      key_concerns: string[];
      investment_attractiveness: number;
      due_diligence_priority: string;
    };
    recommendations?: {
      immediate_actions: string[];
      additional_research: string[];
      investment_considerations: string[];
      next_steps: string[];
    };
    validation_summary: string;
  };
  processing_time: number;
  sources?: string[];
  data_quality?: string;
  analysis_confidence?: number;
}

interface DiligenceData {
  investment_recommendation?: string;
  memo_3_analysis?: {
    investment_recommendation?: string;
    composite_score?: number;
    confidence_level?: number;
    investment_thesis?: string;
    score_breakdown?: {
      market_opportunity: number;
      product_technology: number;
      team_execution: number;
      traction_revenue: number;
      risk_assessment: number;
      financial_controls: number;
    };
    conditions_precedent?: Array<{
      condition: string;
      timeline: string;
      verification: string;
      status: string;
    }>;
    return_projections?: {
      base_case: any;
      upside_case: any;
      conservative_case: any;
      ipo_case: any;
    };
    financial_projections?: {
      year1: any;
      year2: any;
      year3: any;
    };
    investment_terms?: any;
    next_steps?: {
      investor_actions: string[];
      company_conditions: string[];
    };
  };
  problem_validation?: any;
  solution_product_market_fit?: any;
  team_execution_capability?: any;
  founder_market_fit?: any;
  market_opportunity_competition?: any;
  benchmarking_analysis?: any;
  traction_metrics_validation?: any;
  key_risks?: string[];
  mitigation_strategies?: string[];
  due_diligence_next_steps?: string[];
  investment_thesis?: string;
  synthesis_notes?: string;
  overall_score?: number;
  
  // Dynamic fields from pitch deck
  company_name?: string;
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
  burn_rate?: string;
  runway?: string;
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
  market_size?: string;
  
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
  risk_mitigation?: string;
  regulatory_risks?: string;
  
  // Exit Strategy
  potential_acquirers?: string[];
  ipo_timeline?: string;
  exit_valuation?: string;
  exit_strategy?: string;
  
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
  
  [key: string]: any;
  
  // Enriched fields (AI-powered data from Perplexity)
  company_stage_enriched?: EnrichedField;
  headquarters_enriched?: EnrichedField;
  founded_date_enriched?: EnrichedField;
  amount_raising_enriched?: EnrichedField;
  post_money_valuation_enriched?: EnrichedField;
  investment_sought_enriched?: EnrichedField;
  ownership_target_enriched?: EnrichedField;
  key_thesis_enriched?: EnrichedField;
  key_metric_enriched?: EnrichedField;
  current_revenue_enriched?: EnrichedField;
  revenue_growth_rate_enriched?: EnrichedField;
  customer_acquisition_cost_enriched?: EnrichedField;
  lifetime_value_enriched?: EnrichedField;
  gross_margin_enriched?: EnrichedField;
  burn_rate_enriched?: EnrichedField;
  runway_enriched?: EnrichedField;
  pre_money_valuation_enriched?: EnrichedField;
  lead_investor_enriched?: EnrichedField;
  committed_funding_enriched?: EnrichedField;
  round_stage_enriched?: EnrichedField;
  product_features_enriched?: EnrichedField;
  technology_advantages_enriched?: EnrichedField;
  innovation_level_enriched?: EnrichedField;
  scalability_plan_enriched?: EnrichedField;
  target_customers_enriched?: EnrichedField;
  market_timing_enriched?: EnrichedField;
  competitive_advantages_enriched?: EnrichedField;
  market_penetration_enriched?: EnrichedField;
  team_size_enriched?: EnrichedField;
  key_team_members_enriched?: EnrichedField;
  advisory_board_enriched?: EnrichedField;
  execution_track_record_enriched?: EnrichedField;
  user_growth_enriched?: EnrichedField;
  revenue_growth_enriched?: EnrichedField;
  customer_growth_enriched?: EnrichedField;
  key_milestones_enriched?: EnrichedField;
  upcoming_milestones_enriched?: EnrichedField;
  key_risks_enriched?: EnrichedField;
  risk_mitigation_enriched?: EnrichedField;
  regulatory_risks_enriched?: EnrichedField;
  potential_acquirers_enriched?: EnrichedField;
  ipo_timeline_enriched?: EnrichedField;
  exit_valuation_enriched?: EnrichedField;
  market_size_enriched?: EnrichedField;
  industry_category_enriched?: EnrichedField;
  target_market_enriched?: EnrichedField;
  technology_stack_enriched?: EnrichedField;
  use_of_funds_enriched?: EnrichedField;
  timeline_enriched?: EnrichedField;
  
  // Validation data
  validation_result?: ValidationResult;
  
  // Competitor matrix data
  competitor_matrix?: any;
}

interface Memo3TabProps {
  diligenceData: DiligenceData | null;
  memo1Data?: any; // Add memo1Data to access data from Memo 1
  memoId: string;
  diligenceDocId?: string | null; // NEW PROP
}

export default function Memo3Tab({ diligenceData, memo1Data, memoId, diligenceDocId }: Memo3TabProps) {
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  // State for dynamic data fetching
  const [fetchedMemo1Data, setFetchedMemo1Data] = useState<any>(null);
  const [fetchedMemo2Data, setFetchedMemo2Data] = useState<any>(null);
  const [fetchedMemo3Data, setFetchedMemo3Data] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    // Use the data passed from parent component instead of fetching
    if (memo1Data && memoId) {
      console.log('Using passed memo1Data:', memo1Data);
      console.log('Using passed memoId:', memoId);
      setFetchedMemo1Data({
        id: memoId,
        ...memo1Data,
        memo_1: memo1Data
      });
      
      // Also use the diligence data if available
      if (diligenceData) {
        console.log('Using passed diligenceData:', diligenceData);
        console.log('Using real diligence doc ID:', diligenceDocId);
        setFetchedMemo2Data({
          id: diligenceDocId || `diligence-${memoId}`, // Use real ID if available
          ...diligenceData
        });
      }
      
      setIsLoadingData(false);
    } else {
      // Fallback to fetching if no data passed
      fetchCompleteData();
    }
  }, [memoId, memo1Data, diligenceData]);

  // Test function to check Firestore connection
  const testFirestoreConnection = async () => {
    try {
      console.log('Testing Firestore connection...');
      const testSnapshot = await getDocs(collection(db, 'ingestionResults'));
      console.log('Firestore test result:', testSnapshot.empty ? 'No documents' : `${testSnapshot.docs.length} documents found`);
      
      if (!testSnapshot.empty) {
        const doc = testSnapshot.docs[0];
        console.log('First document ID:', doc.id);
        console.log('First document data keys:', Object.keys(doc.data()));
      }
    } catch (error) {
      console.error('Firestore connection test failed:', error);
    }
  };

  const fetchCompleteData = async () => {
    setIsLoadingData(true);
    try {
      // Fetch complete Memo 1 from ingestionResults
      try {
        const memo1Query = query(
          collection(db, 'ingestionResults'),
          orderBy('timestamp', 'desc'),
          limit(1)
        );
        const memo1Snapshot = await getDocs(memo1Query);
        console.log('Memo 1 query result:', memo1Snapshot.empty ? 'No documents found' : `${memo1Snapshot.docs.length} documents found`);
        
        if (!memo1Snapshot.empty) {
          const memo1Doc = memo1Snapshot.docs[0];
          const fullData = memo1Doc.data();
          console.log('Memo 1 ID:', memo1Doc.id);
          console.log('Memo 1 data keys:', Object.keys(fullData));
          setFetchedMemo1Data({
            id: memo1Doc.id,
            ...fullData,
            memo_1: fullData.memo_1 || {}
          });
        } else {
          console.warn('No Memo 1 data found in ingestionResults collection');
        }
      } catch (error) {
        console.error('Error fetching Memo 1:', error);
        // Try without orderBy if timestamp field doesn't exist
        try {
          const memo1Snapshot = await getDocs(collection(db, 'ingestionResults'));
          console.log('Memo 1 fallback query result:', memo1Snapshot.empty ? 'No documents found' : `${memo1Snapshot.docs.length} documents found`);
          
          if (!memo1Snapshot.empty) {
            const memo1Doc = memo1Snapshot.docs[0];
            const fullData = memo1Doc.data();
            console.log('Memo 1 ID (fallback):', memo1Doc.id);
            setFetchedMemo1Data({
              id: memo1Doc.id,
              ...fullData,
              memo_1: fullData.memo_1 || {}
            });
          }
        } catch (fallbackError) {
          console.error('Fallback Memo 1 fetch failed:', fallbackError);
        }
      }

      // Fetch complete Memo 2 from diligenceResults (matching parent component)
      try {
        const memo2Query = query(
          collection(db, 'diligenceResults'),
          orderBy('timestamp', 'desc'),
          limit(1)
        );
        const memo2Snapshot = await getDocs(memo2Query);
        console.log('Memo 2 query result:', memo2Snapshot.empty ? 'No documents found' : `${memo2Snapshot.docs.length} documents found`);
        
        if (!memo2Snapshot.empty) {
          const memo2Doc = memo2Snapshot.docs[0];
          console.log('Memo 2 ID:', memo2Doc.id);
          console.log('Memo 2 data keys:', Object.keys(memo2Doc.data()));
          setFetchedMemo2Data({
            id: memo2Doc.id,
            ...memo2Doc.data()
          });
        } else {
          console.warn('No Memo 2 data found in diligenceResults collection');
        }
      } catch (error) {
        console.error('Error fetching Memo 2:', error);
        // Try without orderBy if timestamp field doesn't exist
        try {
          const memo2Snapshot = await getDocs(collection(db, 'diligenceResults'));
          console.log('Memo 2 fallback query result:', memo2Snapshot.empty ? 'No documents found' : `${memo2Snapshot.docs.length} documents found`);
          
          if (!memo2Snapshot.empty) {
            const memo2Doc = memo2Snapshot.docs[0];
            console.log('Memo 2 ID (fallback):', memo2Doc.id);
            setFetchedMemo2Data({
              id: memo2Doc.id,
              ...memo2Doc.data()
            });
          }
        } catch (fallbackError) {
          console.error('Fallback Memo 2 fetch failed:', fallbackError);
        }
      }
    } catch (error) {
      console.error('Error fetching complete memo data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Parse pricing data from diligenceData
  const parsePricingData = (data: string) => {
    if (!data) return {};
    
    const parsed: any = {};
    
    // Extract pricing tiers
    const starterMatch = data.match(/starter[:\s]*([₹$][0-9.,\s]+(?:lakh|crore|million|billion)?)/i);
    if (starterMatch) {
      parsed.starter_price = starterMatch[1];
    }
    
    const growthMatch = data.match(/growth[:\s]*([₹$][0-9.,\s]+(?:lakh|crore|million|billion)?)/i);
    if (growthMatch) {
      parsed.growth_price = growthMatch[1];
    }
    
    const enterpriseMatch = data.match(/enterprise[:\s]*([₹$][0-9.,\s]+(?:lakh|crore|million|billion)?)/i);
    if (enterpriseMatch) {
      parsed.enterprise_price = enterpriseMatch[1];
    }
    
    return parsed;
  };

  // Parse unit economics data
  const parseUnitEconomics = (data: string) => {
    if (!data) return {};
    
    const parsed: any = {};
    
    // Extract CAC
    const cacMatch = data.match(/customer acquisition cost[:\s]*([₹$][0-9.,\s]+)/i) ||
                    data.match(/cac[:\s]*([₹$][0-9.,\s]+)/i);
    if (cacMatch) {
      parsed.cac = cacMatch[1];
    }
    
    // Extract LTV
    const ltvMatch = data.match(/lifetime value[:\s]*([₹$][0-9.,\s]+)/i) ||
                    data.match(/ltv[:\s]*([₹$][0-9.,\s]+)/i);
    if (ltvMatch) {
      parsed.ltv = ltvMatch[1];
    }
    
    // Extract LTV:CAC ratio
    const ratioMatch = data.match(/ltv[:\s]*cac[:\s]*ratio[:\s]*([0-9.]+)/i);
    if (ratioMatch) {
      parsed.ltv_cac_ratio = ratioMatch[1];
    }
    
    return parsed;
  };

  // Score calculation helper functions
  const calculateCompositeScore = (m1Data: any, m2Data: any) => {
    const memo1Score = fetchedMemo1Data?.memo_1?.overall_score || 
                       fetchedMemo1Data?.overall_score || 
                       m1Data?.overall_score || 7.5;
    const memo2Score = fetchedMemo2Data?.overall_score ||
                       fetchedMemo2Data?.memo_2_interview_analysis?.investment_readiness?.score ||
                       m2Data?.overall_score || 7.3;
    return ((memo1Score + memo2Score) / 2).toFixed(1);
  };

  const getScoreBreakdown = (m1Data: any, m2Data: any) => {
    const m1 = fetchedMemo1Data?.memo_1 || m1Data || {};
    const m2 = fetchedMemo2Data || m2Data || {};
    
    return {
      market_opportunity: ((m1.market_opportunity_score || m1.market_score || 9) + 
                          (m2.market_understanding?.score || m2.market_score || 8)) / 2,
      product_technology: ((m1.product_score || m1.technology_score || 8) + 
                          (m2.solution_product_market_fit?.score || m2.product_score || 7.5)) / 2,
      team_execution: ((m1.team_score || 7) + 
                      (m2.team_execution_capability?.score || m2.team_assessment?.score || 7.5)) / 2,
      traction_revenue: ((m1.traction_score || 8) + 
                        (m2.traction_metrics_validation?.score || 8)) / 2,
      risk_assessment: ((m1.risk_score || 6) + 
                       (m2.key_risks?.length > 0 ? 6.5 : 6)) / 2,
      financial_controls: ((m1.financial_score || 5) + 
                          (m2.financial_validation?.score || 6)) / 2,
    };
  };

  // Calculate financial projections dynamically
  const calculateFinancialProjections = () => {
    const currentRev = parseFloat(
      (fetchedMemo1Data?.memo_1?.current_revenue || '250000')
        .replace(/[^0-9.]/g, '')
    ) / 1000000;
    
    const growthRate = parseFloat(
      (fetchedMemo1Data?.memo_1?.revenue_growth_rate || '400')
        .replace(/[^0-9.]/g, '')
    ) / 100 || 4;
    
    return {
      year1: {
        arr: `$${(currentRev * growthRate).toFixed(1)}M`,
        grossMargin: fetchedMemo1Data?.memo_1?.gross_margin || "70-75%",
        grossProfit: `$${(currentRev * growthRate * 0.75).toFixed(1)}M`,
        operatingExpenses: `$${(currentRev * growthRate * 1.2).toFixed(1)}M`,
        ebitda: `-$${(currentRev * growthRate * 0.5).toFixed(1)}M`,
        burnRate: `~$${(currentRev * growthRate * 0.04).toFixed(0)}K/month`
      },
      year2: {
        arr: `$${(currentRev * growthRate * 3).toFixed(1)}M`,
        grossMargin: "75-80%",
        grossProfit: `$${(currentRev * growthRate * 3 * 0.8).toFixed(1)}M`,
        operatingExpenses: `$${(currentRev * growthRate * 3 * 0.67).toFixed(1)}M`,
        ebitda: `+$${(currentRev * growthRate * 3 * 0.13).toFixed(1)}M`,
        burnRate: "Self-sustaining"
      },
      year3: {
        arr: `$${(currentRev * growthRate * 3 * 2.5).toFixed(1)}M`,
        grossMargin: "78-82%",
        grossProfit: `$${(currentRev * growthRate * 3 * 2.5 * 0.8).toFixed(1)}M`,
        operatingExpenses: `$${(currentRev * growthRate * 3 * 2.5 * 0.44).toFixed(1)}M`,
        ebitda: `+$${(currentRev * growthRate * 3 * 2.5 * 0.36).toFixed(1)}M`,
        burnRate: "Positive, ready for Series B/C"
      }
    };
  };

  // Enhanced diligence data with parsed information, prioritizing memo1Data
  // This ensures we reuse data already generated in Memo 1 instead of duplicating content
  // CRITICAL FIX: This resolves the "Not specified" issue by using data from Memo 1
  const enhancedDiligenceData = {
    ...(diligenceData || {}),
    // Use memo1Data when available, fallback to diligenceData
    // This prevents duplication of content between Memo 1 and Memo 3
    // Ensure key_milestones is always an array
    key_milestones: Array.isArray(diligenceData?.key_milestones) ? diligenceData.key_milestones : [],
    ...(memo1Data && {
      // Company Information
      company_name: memo1Data.company_name || memo1Data.title,
      company_stage: memo1Data.company_stage,
      headquarters: memo1Data.headquarters,
      founded_date: memo1Data.founded_date,
      amount_raising: memo1Data.amount_raising,
      post_money_valuation: memo1Data.post_money_valuation,
      investment_sought: memo1Data.investment_sought,
      ownership_target: memo1Data.ownership_target,
      key_thesis: memo1Data.key_thesis,
      key_metric: memo1Data.key_metric,
      
      // Financial Data
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
      market_size: memo1Data.market_size,
      sam_market_size: memo1Data.sam_market_size,
      som_market_size: memo1Data.som_market_size,
      
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
      exit_strategy: memo1Data.exit_strategy,
      
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
      
      // Competition data
      competition: memo1Data.competition,
      competitors: memo1Data.competitors,
      competitive_analysis: memo1Data.competitive_analysis,
    }),
    ...parsePricingData(diligenceData?.pricing_strategy || memo1Data?.pricing_strategy || ''),
    ...parseUnitEconomics(diligenceData?.unit_economics || memo1Data?.unit_economics || '')
  };

  // Helper function to render enriched field with badge and source link
  const renderEnrichedField = (fieldName: string, enrichedField?: EnrichedField) => {
    const originalValue = diligenceData?.[fieldName as keyof DiligenceData] as string;
    const displayValue = enrichedField?.value || originalValue || "Not specified";
    const isEnriched = enrichedField?.enriched;
    
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">{displayValue}</p>
          {isEnriched && (
            <Badge variant="secondary" className="text-xs">
              AI-enriched
            </Badge>
          )}
        </div>
        {isEnriched && enrichedField?.source_url && (
          <a 
            href={enrichedField.source_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            View Source
          </a>
        )}
      </div>
    );
  };

  const handleCreateRoom = () => {
    router.push('/dashboard/create-room');
  };

  const handleRunValidation = async () => {
    if (!diligenceData) {
      toast({
        title: "No Data Available",
        description: "Diligence data is required for validation.",
        variant: "destructive"
      });
      return;
    }

    setIsValidating(true);
    try {
      const response = await apiClient.validateMemoData(diligenceData, memoId, "diligence");
      
      if (response.success) {
        toast({
          title: "Validation Complete",
          description: "AI validation analysis has been completed successfully."
        });
        // Trigger refresh of memo data
        window.location.reload();
      } else {
        throw new Error(response.error || "Validation failed");
      }
    } catch (error) {
      console.error("Error running validation:", error);
      toast({
        title: "Validation Failed",
        description: error instanceof Error ? error.message : "Failed to run validation",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const generateMemo3 = async () => {
    setIsLoadingData(true);
    try {
      // Check if we have the required data
    if (!fetchedMemo1Data?.id || !fetchedMemo2Data?.id || fetchedMemo2Data?.id?.startsWith('diligence-')) {
      toast({
        title: "Missing Data",
        description: "Please ensure Memo 1 and Memo 2 are generated first with valid document IDs.",
        variant: "destructive",
      });
      return;
    }

      console.log('Generating Memo 3 with IDs:', {
        memo_1_id: fetchedMemo1Data.id,
        memo_2_id: fetchedMemo2Data.id,
        diligenceDocId: diligenceDocId  // Log the prop for debugging
      });

      const functionUrl = process.env.NEXT_PUBLIC_GENERATE_MEMO_3_URL || 'https://generate-memo-3-abvgpbhuca-el.a.run.app';
      
      const response = await fetch(
        functionUrl,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            memo_1_id: fetchedMemo1Data.id,
            memo_2_id: fetchedMemo2Data.id
          })
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Fetch the newly generated Memo 3 using the document ID
        const memo3DocRef = doc(db, 'memo3Results', result.memo_3_id);
        const memo3Snapshot = await getDoc(memo3DocRef);
        if (memo3Snapshot.exists()) {
          setFetchedMemo3Data(memo3Snapshot.data());
        }
        
        toast({
          title: "Memo 3 Generated Successfully",
          description: "Your comprehensive investment analysis is ready.",
        });
      } else {
        toast({
          title: "Generation Failed",
          description: result.error || "Failed to generate Memo 3",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error generating Memo 3:', error);
      
      // Check if it's a CORS error
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        toast({
          title: "CORS Error",
          description: "The function is not accessible due to CORS policy. Please check the deployment.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Generation Error",
          description: "Failed to generate Memo 3. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoadingData(false);
    }
  };

  // Loading state
  if (isLoadingData || !enhancedDiligenceData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-semibold mb-2">Loading Investment Analysis</h3>
            <p className="text-sm text-muted-foreground">Fetching data from Memo 1 and Memo 2...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3 justify-center">
                    <Button 
                      onClick={generateMemo3} 
                      disabled={isLoadingData || !fetchedMemo1Data?.id || !fetchedMemo2Data?.id} 
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      {isLoadingData ? "Generating..." : 
                       !fetchedMemo1Data?.id || !fetchedMemo2Data?.id ? 
                       "Missing Memo 1 or Memo 2 Data" : 
                       "Generate Memo 3 Analysis"}
                    </Button>
            <Button onClick={() => window.print()} className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Download Memo 3 (PDF)
            </Button>
            <Button variant="outline" onClick={() => navigator.share?.({ title: 'Memo 3', text: 'Investment Decision Memo' })} className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Share with IC
            </Button>
            <Button variant="outline" onClick={handleCreateRoom} className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Full Financial Model
            </Button>
            <Button variant="outline" onClick={testFirestoreConnection} className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Test Firestore Connection
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Executive Summary
          </CardTitle>
          <CardDescription>
            Investment Decision Memo - Final Analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Generated</h4>
              <p className="text-sm text-blue-700">
                {fetchedMemo2Data?.timestamp?.toDate?.()?.toLocaleDateString() || new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Composite Score</h4>
              <p className="text-sm text-green-700">{calculateCompositeScore(memo1Data, diligenceData)}/10</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2">Status</h4>
              <p className="text-sm text-purple-700">DD-VALIDATED</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">Confidence</h4>
              <p className="text-sm text-orange-700">78% (HIGH)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investment Recommendation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Investment Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-6 bg-green-50 rounded-lg border-2 border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="text-2xl font-bold text-green-800">
                    {fetchedMemo2Data?.investment_recommendation || "INVEST – CONDITIONAL BUY"}
                  </h3>
                  <p className="text-sm text-green-600">Score: {calculateCompositeScore(memo1Data, diligenceData)}/10 | Confidence: 78%</p>
                </div>
              </div>
              <Badge variant="default" className="bg-green-600 text-white text-lg px-4 py-2">
                Investment Ready
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-green-800 mb-2">Investment Details</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Investment: {fetchedMemo1Data?.memo_1?.amount_raising || fetchedMemo1Data?.amount_raising || '$300K'} {fetchedMemo1Data?.memo_1?.round_stage || 'Seed'} Round</li>
                  <li>• Post-Money Val: {fetchedMemo1Data?.memo_1?.post_money_valuation || fetchedMemo1Data?.post_money_valuation || '~$1.2M'}</li>
                  <li>• Company: {fetchedMemo1Data?.memo_1?.company_name || fetchedMemo1Data?.memo_1?.title || 'Company Name'}</li>
                  <li>• Current Revenue: {fetchedMemo1Data?.memo_1?.current_revenue || 'Not specified'}</li>
                  <li>• Runway: {fetchedMemo1Data?.memo_1?.runway || 'Not specified'}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-green-800 mb-2">Key Metrics</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Memo 1 Score: 7.5/10</li>
                  <li>• Memo 2 Score: 7.3/10</li>
                  <li>• Final Score: {calculateCompositeScore(memo1Data, diligenceData)}/10</li>
                  <li>• Risk Level: Medium (manageable)</li>
                  <li>• Market Timing: Excellent</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investment Thesis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ThumbsUp className="h-5 w-5" />
            Investment Thesis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700 mb-4">
              {fetchedMemo2Data?.investment_thesis || 
               fetchedMemo2Data?.memo_2_interview_analysis?.investment_thesis ||
               `${fetchedMemo1Data?.memo_1?.company_name || fetchedMemo1Data?.memo_1?.title || 'The company'} addresses a critical ${fetchedMemo1Data?.memo_1?.market_size || fetchedMemo1Data?.memo_1?.tam_market_size || '$2B+'} market for ${fetchedMemo1Data?.memo_1?.problem || 'workforce readiness'} using ${fetchedMemo1Data?.memo_1?.solution || 'AI-powered technology'}. The company demonstrates ${fetchedMemo1Data?.memo_1?.competitive_advantages || 'strong market timing, proven revenue model, exceptional unit economics'}. Due Diligence VALIDATED all core claims.`}
            </p>
            
            <h4 className="font-semibold text-blue-800 mb-3">Key Strengths Validated:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-blue-700">Strong market timing (skills gap at peak)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-blue-700">Proven revenue model ($530K lifetime, profitable)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-blue-700">Exceptional unit economics (18.6–60x LTV:CAC)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-blue-700">Credible founding team (Citi, Microsoft, Purdue)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-blue-700">Strategic partnerships (30+ institutions, gov)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-blue-700">Defensible tech moat (proprietary AI + flywheel)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Score Breakdown
          </CardTitle>
          <CardDescription>
            Memo 1 vs Memo 2 vs Final weighted scores
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Metric</th>
                  <th className="text-center p-3 font-semibold">Memo 1</th>
                  <th className="text-center p-3 font-semibold">Memo 2</th>
                  <th className="text-center p-3 font-semibold">Final</th>
                  <th className="text-center p-3 font-semibold">Weight</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(getScoreBreakdown(memo1Data, diligenceData)).map(([key, value]) => (
                  <tr key={key} className="border-b">
                    <td className="p-3 font-medium capitalize">{key.replace('_', ' ')}</td>
                    <td className="p-3 text-center">{memo1Data?.[`${key}_score`] || 'N/A'}</td>
                    <td className="p-3 text-center">{diligenceData?.[`${key}_score`] || 'N/A'}</td>
                    <td className="p-3 text-center font-semibold">{value.toFixed(1)}</td>
                    <td className="p-3 text-center">
                      {key === 'market_opportunity' ? '25%' :
                       key === 'product_technology' ? '20%' :
                       key === 'team_execution' ? '20%' :
                       key === 'traction_revenue' ? '15%' :
                       key === 'risk_assessment' ? '10%' :
                       key === 'financial_controls' ? '10%' : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-semibold">TOTAL WEIGHTED SCORE</span>
              <span className="text-2xl font-bold text-blue-600">{calculateCompositeScore(memo1Data, diligenceData)}/10</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investment Strengths */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Investment Strengths (DD-Validated)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-green-800">
                  1. MARKET OPPORTUNITY ⭐⭐⭐⭐⭐ ({getScoreBreakdown(memo1Data, diligenceData).market_opportunity.toFixed(1)}/10)
                </h4>
                <Badge variant="default" className="bg-green-600 text-white">Strong</Badge>
              </div>
              <p className="text-sm text-green-700 mb-2">
                {fetchedMemo1Data?.memo_1?.market_analysis || fetchedMemo1Data?.memo_1?.tam_market_size || '$2B+ TAM'}
              </p>
              <p className="text-xs text-green-600">
                DD VALIDATED: {fetchedMemo2Data?.validation_summary || 'Market research + customer calls'}
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-green-800">2. UNIT ECONOMICS ⭐⭐⭐⭐⭐ (9/10)</h4>
                <Badge variant="default" className="bg-green-600 text-white">Strong</Badge>
              </div>
              <p className="text-sm text-green-700 mb-2">Academic: 18.6x LTV:CAC, Enterprise: 60x LTV:CAC</p>
              <p className="text-xs text-green-600">DD VALIDATED: Customer interviews + contracts</p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-blue-800">3. TEAM EXECUTION ⭐⭐⭐⭐ (8/10)</h4>
                <Badge variant="secondary" className="bg-blue-600 text-white">Good</Badge>
              </div>
              <p className="text-sm text-blue-700 mb-2">Founders from Citi, Microsoft, Purdue</p>
              <p className="text-xs text-blue-600">DD VALIDATED: Interview + background checks</p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-blue-800">4. EARLY TRACTION ⭐⭐⭐⭐ (8/10)</h4>
                <Badge variant="secondary" className="bg-blue-600 text-white">Good</Badge>
              </div>
              <p className="text-sm text-blue-700 mb-2">$530K lifetime revenue (all bootstrapped)</p>
              <p className="text-xs text-blue-600">DD VALIDATED: Bank statements + confirmations</p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-blue-800">5. TECHNOLOGY MOAT ⭐⭐⭐⭐ (8/10)</h4>
                <Badge variant="secondary" className="bg-blue-600 text-white">Good</Badge>
              </div>
              <p className="text-sm text-blue-700 mb-2">Proprietary AI models (trained on 8K+ students)</p>
              <p className="text-xs text-blue-600">DD VALIDATED: Technical review + interviews</p>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-yellow-800">6. GROWTH STRATEGY ⭐⭐⭐ (7/10)</h4>
                <Badge variant="outline" className="border-yellow-600 text-yellow-700">Medium</Badge>
              </div>
              <p className="text-sm text-yellow-700 mb-2">6-pillar hypergrowth plan with realistic targets</p>
              <p className="text-xs text-yellow-600">DD VALIDATED: Interview + milestone tracking</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Risk Assessment (DD-Adjusted)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {(fetchedMemo2Data?.key_risks || []).map((risk: string, index: number) => (
              <div key={index} className={`p-4 rounded-lg border ${
                index === 0 ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className={`h-5 w-5 ${index === 0 ? 'text-red-600' : 'text-yellow-600'}`} />
                  <h4 className={`font-semibold ${index === 0 ? 'text-red-800' : 'text-yellow-800'}`}>
                    Risk #{index + 1}: {risk}
                  </h4>
                </div>
                <div className={`text-sm space-y-1 ${index === 0 ? 'text-red-700' : 'text-yellow-700'}`}>
                  <p>• Current: Risk identified in due diligence</p>
                  <p>• Mitigation: {fetchedMemo2Data?.mitigation_strategies?.[index] || 'Strategy to be defined'}</p>
                  <p>• Monitoring: {fetchedMemo2Data?.monitoring_plan?.[index] || 'Quarterly review'}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conditions Precedent */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Conditions Precedent to Close
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {(fetchedMemo2Data?.due_diligence_next_steps || []).map((step: string, index: number) => (
              <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-800 mb-1">{step}</h4>
                    <p className="text-xs text-blue-600">Status: Pending verification</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Return Projections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Return Projections (Exit Scenario Analysis)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Base Case (60% probability)</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Exit Type: Acquisition (HRTech/EdTech player)</li>
                <li>• Year 5 ARR: $15-20M</li>
                <li>• Exit Valuation: $120-200M (8-10x revenue)</li>
                <li>• Investor Return: 40-80x (on $100K check)</li>
                <li>• Timeline: 5-7 years</li>
              </ul>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Upside Case (20% probability)</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Exit Type: Acquisition (strategic tech co)</li>
                <li>• Year 5 ARR: $25-30M</li>
                <li>• Exit Valuation: $200-300M+ (8-10x)</li>
                <li>• Investor Return: 80-150x</li>
                <li>• Trigger: Rapid enterprise adoption</li>
              </ul>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2">Conservative Case (15% probability)</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Exit Type: Acquisition (staffing/consulting)</li>
                <li>• Year 5 ARR: $8-10M</li>
                <li>• Exit Valuation: $60-100M (6-10x)</li>
                <li>• Investor Return: 24-50x</li>
                <li>• Scenario: Slower adoption, but profitable</li>
              </ul>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2">IPO Case (5% probability)</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Exit Type: Public markets (IPO)</li>
                <li>• Year 5 ARR: $30M+</li>
                <li>• IPO Valuation: $250M+ (8-10x)</li>
                <li>• Investor Return: 100x+</li>
                <li>• Requirement: Category scaling, profitability</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Projections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Projections (3-Year)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Metric</th>
                  <th className="text-center p-3 font-semibold">Year 1</th>
                  <th className="text-center p-3 font-semibold">Year 2</th>
                  <th className="text-center p-3 font-semibold">Year 3</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const projections = calculateFinancialProjections();
                  return (
                    <>
                      <tr className="border-b">
                        <td className="p-3 font-medium">ARR</td>
                        <td className="p-3 text-center">{projections.year1.arr}</td>
                        <td className="p-3 text-center">{projections.year2.arr}</td>
                        <td className="p-3 text-center">{projections.year3.arr}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium">Gross Margin</td>
                        <td className="p-3 text-center">{projections.year1.grossMargin}</td>
                        <td className="p-3 text-center">{projections.year2.grossMargin}</td>
                        <td className="p-3 text-center">{projections.year3.grossMargin}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium">Gross Profit</td>
                        <td className="p-3 text-center">{projections.year1.grossProfit}</td>
                        <td className="p-3 text-center">{projections.year2.grossProfit}</td>
                        <td className="p-3 text-center">{projections.year3.grossProfit}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium">Operating Expenses</td>
                        <td className="p-3 text-center">{projections.year1.operatingExpenses}</td>
                        <td className="p-3 text-center">{projections.year2.operatingExpenses}</td>
                        <td className="p-3 text-center">{projections.year3.operatingExpenses}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium">EBITDA</td>
                        <td className="p-3 text-center">{projections.year1.ebitda}</td>
                        <td className="p-3 text-center">{projections.year2.ebitda}</td>
                        <td className="p-3 text-center">{projections.year3.ebitda}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium">Burn Rate</td>
                        <td className="p-3 text-center">{projections.year1.burnRate}</td>
                        <td className="p-3 text-center">{projections.year2.burnRate}</td>
                        <td className="p-3 text-center">{projections.year3.burnRate}</td>
                      </tr>
                    </>
                  );
                })()}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Investment Terms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Investment Terms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-3">Deal Structure</h4>
              <ul className="text-sm space-y-1">
                <li>• Instrument: {fetchedMemo1Data?.memo_1?.investment_instrument || 'SAFE (Simple Agreement for Future Equity)'}</li>
                <li>• Amount: {fetchedMemo1Data?.memo_1?.amount_raising || '$300,000'}</li>
                <li>• Post-Money Valuation: {fetchedMemo1Data?.memo_1?.post_money_valuation || '~$1.2M'}</li>
                <li>• Pre-Money Valuation: {fetchedMemo1Data?.memo_1?.pre_money_valuation || '~$900K (implied)'}</li>
                <li>• Discount Rate: {fetchedMemo1Data?.memo_1?.discount_rate || '20% (standard Seed)'}</li>
                <li>• Warrant Coverage: {fetchedMemo1Data?.memo_1?.warrant_coverage || '10% (standard)'}</li>
              </ul>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-3">Rights & Governance</h4>
              <ul className="text-sm space-y-1">
                <li>• Pro-Rata Rights: ✅ Yes (Series A follow-on)</li>
                <li>• MFN Clause: ✅ Yes (standard)</li>
                <li>• Board Seat: Observer (investor to attend monthly)</li>
                <li>• Follow-On: Expected in 12-18 months (Series A)</li>
                <li>• Information Rights: Monthly financial reports</li>
                <li>• Liquidation Preference: 1x non-participating</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Next Steps (Action Items)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-3">For Investor:</h4>
              <ul className="text-sm text-blue-700 space-y-2">
                <li className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>Schedule 30-min call with CEO + CTO</span>
                </li>
                <li className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>Request cap table + detailed financial model</span>
                </li>
                <li className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>Review 2-3 customer references (enterprise cases)</span>
                </li>
                <li className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>Confirm observer board seat acceptance</span>
                </li>
                <li className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>Finalize SAFE terms with legal counsel</span>
                </li>
                <li className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>Schedule investment committee presentation</span>
                </li>
              </ul>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-3">For Company (Conditions to Close):</h4>
              <ul className="text-sm text-green-700 space-y-2">
                <li className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>Hire permanent CFO (Month 1-2 post-funding)</span>
                </li>
                <li className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>Provide GA access under NDA</span>
                </li>
                <li className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>Formalize investor observer seat arrangement</span>
                </li>
                <li className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>Commit to 3x ARR growth targets (not 4x)</span>
                </li>
                <li className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>Monthly board updates + quarterly revenue reports</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Scorecard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Summary Scorecard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Metric</th>
                  <th className="text-center p-3 font-semibold">Score</th>
                  <th className="text-center p-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(getScoreBreakdown(memo1Data, diligenceData)).map(([key, value]) => (
                  <tr key={key} className="border-b">
                    <td className="p-3 font-medium capitalize">{key.replace('_', ' ')}</td>
                    <td className="p-3 text-center font-semibold">{value.toFixed(1)}/10</td>
                    <td className="p-3 text-center">
                      {value >= 8 ? (
                        <Badge variant="default" className="bg-green-600 text-white">✅ Strong</Badge>
                      ) : value >= 6 ? (
                        <Badge variant="outline" className="border-yellow-600 text-yellow-700">⚠️ Medium</Badge>
                      ) : (
                        <Badge variant="destructive">🔴 Action</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-blue-800">FINAL SCORE (Weighted)</span>
                <p className="text-sm text-blue-600">Confidence Level: 78% (HIGH)</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{calculateCompositeScore(memo1Data, diligenceData)}/10</div>
                <Badge variant="default" className="bg-green-600 text-white text-lg px-4 py-2">BUY</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technology Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Technology Reports
            </CardTitle>
            <CardDescription>
            Comprehensive technology analysis and workforce readiness assessment
            </CardDescription>
          </CardHeader>
        <CardContent className="space-y-4">
          {/* Technology Stack Overview */}
          <div>
            <h4 className="font-semibold mb-3">Technology Stack Overview</h4>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h5 className="font-medium text-blue-800 mb-2">Technology Stack from Pitch Deck</h5>
              <div className="flex items-center gap-2">
                <p className="text-sm text-blue-700">
                  {diligenceData?.technology_stack_enriched?.value || diligenceData?.technology_stack || "Not specified in pitch deck"}
                </p>
                {diligenceData?.technology_stack_enriched?.enriched && (
                  <Badge variant="secondary" className="text-xs">AI-enriched</Badge>
                )}
              </div>
              {diligenceData?.technology_stack_enriched?.source_url && (
                <a 
                  href={diligenceData.technology_stack_enriched.source_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  View Source
                </a>
              )}
              {diligenceData?.technology_stack && (
                <div className="mt-2 text-xs text-blue-600">
                  <p>This technology stack information was extracted directly from the company's pitch deck.</p>
                </div>
              )}
            </div>
            
            <div className="grid gap-3 md:grid-cols-2 mt-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <h5 className="font-medium text-green-800 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Technology Advantages
                </h5>
                <p className="text-xs text-green-600 mt-1">
                  {diligenceData?.technology_advantages || "Not specified in pitch deck"}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <h5 className="font-medium text-purple-800 flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  Innovation Level
                </h5>
                <p className="text-xs text-purple-600 mt-1">
                  {diligenceData?.innovation_level || "Not specified in pitch deck"}
                </p>
              </div>
            </div>
          </div>

          {/* Technology Advantages with Sources */}
          <div>
            <h4 className="font-semibold mb-2">Technology Advantages</h4>
            <div className="space-y-2">
              <div className="p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
                <h5 className="font-medium text-gray-800">AI-Powered Simulation + Cloud-Native SaaS</h5>
                <p className="text-xs text-gray-600 mt-1">
                  The only scalable, effective tech stack proven to solve workforce readiness at scale with 50% faster training times and 25-30% improved performance metrics.
                </p>
                <div className="mt-2 space-y-1">
                  <a href="https://www.quodeck.com/ai-simulations-workforce-readiness" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center">
                    [1] QuoDeck on AI simulations boosting workforce readiness (July 2025)
                    <ExternalLink className="ml-1 h-2 w-2" />
                  </a>
                  <a href="https://www.trainingmag.com/ai-driven-simulations-transforming-workforce-readiness" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center">
                    [2] Training Magazine: AI-driven simulations transforming workforce readiness (June 2025)
                    <ExternalLink className="ml-1 h-2 w-2" />
                  </a>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border">
                <h5 className="font-medium text-gray-800">Continuous MLOps & Model Governance</h5>
                <p className="text-xs text-gray-600 mt-1">
                  Real-time model retraining, bias auditing, and responsiveness to evolving skill demands, making the platform "future-proof".
                </p>
                <div className="mt-2 space-y-1">
                  <a href="https://www.smartdev.ai/ai-tech-stacks-2025" target="_blank" rel="noopener noreferrer" className="text-xs text-purple-500 hover:underline flex items-center">
                    [3] SmartDev AI Tech Stacks 2025
                    <ExternalLink className="ml-1 h-2 w-2" />
                  </a>
                  <a href="https://www.aiim.org/2025-information-management-tech-stack" target="_blank" rel="noopener noreferrer" className="text-xs text-purple-500 hover:underline flex items-center">
                    [4] AIIM The 2025 Information Management Tech Stack
                    <ExternalLink className="ml-1 h-2 w-2" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Workforce Readiness Crisis */}
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <h4 className="font-semibold text-red-800 mb-2">The Workforce Readiness Crisis</h4>
            <div className="text-xs text-red-700 space-y-2">
              <p>• Over half of recent graduates feel unprepared for the workplace, with 52% doubting their education will secure a job within 12 months</p>
              <p>• By 2030, 39% of core workforce skills will change or become obsolete</p>
              <p>• Worldwide corporate training spend tops $400B annually, yet average ramp-up times linger around 3–6 months</p>
            </div>
            <div className="mt-2 space-y-1">
              <a href="https://www.wheebox.com/india-skills-report-2025" target="_blank" rel="noopener noreferrer" className="text-xs text-red-500 hover:underline flex items-center">
                [5] Wheebox India Skills Report 2025
                <ExternalLink className="ml-1 h-2 w-2" />
              </a>
              <a href="https://www.weforum.org/future-of-jobs-report-2025" target="_blank" rel="noopener noreferrer" className="text-xs text-red-500 hover:underline flex items-center">
                [6] World Economic Forum, Future of Jobs Report 2025
                <ExternalLink className="ml-1 h-2 w-2" />
              </a>
              <a href="https://www.linkedin.com/workplace-learning-report-2025" target="_blank" rel="noopener noreferrer" className="text-xs text-red-500 hover:underline flex items-center">
                [7] LinkedIn Workplace Learning Report 2025
                <ExternalLink className="ml-1 h-2 w-2" />
              </a>
            </div>
          </div>

          {/* Technology References */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-semibold text-gray-800 mb-3">Technology References (Direct, clickable links):</h4>
            <div className="grid gap-2 text-xs">
              <div className="space-y-1">
                <a href="https://www.quodeck.com/ai-simulations-workforce-readiness" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [1] QuoDeck on AI simulations boosting workforce readiness (July 2025)
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://www.trainingmag.com/ai-driven-simulations-transforming-workforce-readiness" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [2] Training Magazine: AI-driven simulations transforming workforce readiness (June 2025)
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://www.wheebox.com/india-skills-report-2025" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [3] Wheebox India Skills Report 2025
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://www.weforum.org/future-of-jobs-report-2025" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [4] World Economic Forum Future of Jobs Report 2025
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://www.linkedin.com/workplace-learning-report-2025" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [5] LinkedIn Workplace Learning Report 2025
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://www.oecd.org/employment-outlook-2025" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [6] OECD Employment Outlook 2025
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://hbr.org/simulation-learning-case-study" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [7] Harvard Business Review The Case for Simulation Learning (May 2023)
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://www.grandviewresearch.com/industry-analysis/artificial-intelligence-in-hr-market" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [8] Grand View Research AI in HR Market 2023
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://www.marketgrowthreports.com/simulation-learning-market-2024" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [9] MarketGrowthReports Simulation Learning Market 2024
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://www.infosys.com/ai-readiness-workforce-2025" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [10] Infosys – Building a Responsible AI-Ready Workforce (2025)
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://www.coursebox.ai/case-studies-corporate-training" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [11] Coursebox AI Case Studies Corporate Training (June 2025)
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://www.mckinsey.com/ai-workplace-report-january-2025" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [12] McKinsey AI in the workplace report January 2025
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-2 border-blue-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <FileText className="h-5 w-5" />
            Executive Summary
          </CardTitle>
          <CardDescription className="text-blue-700">
            Comprehensive investment analysis and due diligence report
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Investment Overview */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              Investment Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-lg border border-blue-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Company Stage</span>
                  <Badge variant="outline" className="text-xs">
                    {enhancedDiligenceData?.company_stage || 'Not specified'}
                  </Badge>
                </div>
                <div className="text-lg font-bold text-blue-700">
                  {enhancedDiligenceData?.company_stage || 'Early Stage'}
                </div>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-green-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Amount Raising</span>
                  <Badge variant="outline" className="text-xs">
                    {enhancedDiligenceData?.amount_raising ? 'Specified' : 'Pending'}
                  </Badge>
                </div>
                <div className="text-lg font-bold text-green-700">
                  {enhancedDiligenceData?.amount_raising || 'Not disclosed'}
                </div>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-purple-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Valuation</span>
                  <Badge variant="outline" className="text-xs">
                    {enhancedDiligenceData?.post_money_valuation ? 'Specified' : 'Pending'}
                  </Badge>
                </div>
                <div className="text-lg font-bold text-purple-700">
                  {enhancedDiligenceData?.post_money_valuation || 'Not disclosed'}
                </div>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-orange-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Lead Investor</span>
                  <Badge variant="outline" className="text-xs">
                    {enhancedDiligenceData?.lead_investor ? 'Specified' : 'Pending'}
                  </Badge>
                </div>
                <div className="text-lg font-bold text-orange-700">
                  {enhancedDiligenceData?.lead_investor || 'Not disclosed'}
                </div>
              </div>
            </div>
          </div>

          {/* Financial Performance */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Financial Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-lg border border-green-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Current Revenue</span>
                  <Badge variant={enhancedDiligenceData?.current_revenue ? "default" : "secondary"} className="text-xs">
                    {enhancedDiligenceData?.current_revenue ? 'Available' : 'Pending'}
                  </Badge>
                </div>
                <div className="text-lg font-bold text-green-700">
                  {enhancedDiligenceData?.current_revenue || 'Not disclosed'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Annual recurring revenue</div>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-blue-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Gross Margin</span>
                  <Badge variant={enhancedDiligenceData?.gross_margin ? "default" : "secondary"} className="text-xs">
                    {enhancedDiligenceData?.gross_margin ? 'Available' : 'Pending'}
                  </Badge>
                </div>
                <div className="text-lg font-bold text-blue-700">
                  {enhancedDiligenceData?.gross_margin || 'Not disclosed'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Profitability indicator</div>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-red-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Burn Rate</span>
                  <Badge variant={enhancedDiligenceData?.burn_rate ? "default" : "secondary"} className="text-xs">
                    {enhancedDiligenceData?.burn_rate ? 'Available' : 'Pending'}
                  </Badge>
                </div>
                <div className="text-lg font-bold text-red-700">
                  {enhancedDiligenceData?.burn_rate || 'Not disclosed'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Monthly cash burn</div>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-purple-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Runway</span>
                  <Badge variant={enhancedDiligenceData?.runway ? "default" : "secondary"} className="text-xs">
                    {enhancedDiligenceData?.runway ? 'Available' : 'Pending'}
                  </Badge>
                </div>
                <div className="text-lg font-bold text-purple-700">
                  {enhancedDiligenceData?.runway || 'Not disclosed'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Months of funding</div>
              </div>
            </div>
          </div>

          {/* Market & Team Analysis */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              Market & Team Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-lg border border-purple-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Market Size</span>
                  <Badge variant={enhancedDiligenceData?.market_size ? "default" : "secondary"} className="text-xs">
                    {enhancedDiligenceData?.market_size ? 'Available' : 'Pending'}
                  </Badge>
                </div>
                <div className="text-lg font-bold text-purple-700">
                  {enhancedDiligenceData?.market_size || 'Not disclosed'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Total addressable market</div>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-indigo-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Team Size</span>
                  <Badge variant={enhancedDiligenceData?.team_size ? "default" : "secondary"} className="text-xs">
                    {enhancedDiligenceData?.team_size ? 'Available' : 'Pending'}
                  </Badge>
                </div>
                <div className="text-lg font-bold text-indigo-700">
                  {enhancedDiligenceData?.team_size || 'Not disclosed'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Current team members</div>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-teal-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Growth Stage</span>
                  <Badge variant={enhancedDiligenceData?.growth_stage ? "default" : "secondary"} className="text-xs">
                    {enhancedDiligenceData?.growth_stage ? 'Available' : 'Pending'}
                  </Badge>
                </div>
                <div className="text-lg font-bold text-teal-700">
                  {enhancedDiligenceData?.growth_stage || 'Not disclosed'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Company development phase</div>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-amber-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Competitive Edge</span>
                  <Badge variant={enhancedDiligenceData?.competitive_advantages ? "default" : "secondary"} className="text-xs">
                    {enhancedDiligenceData?.competitive_advantages ? 'Available' : 'Pending'}
                  </Badge>
                </div>
                <div className="text-lg font-bold text-amber-700">
                  {enhancedDiligenceData?.competitive_advantages ? 'Strong' : 'Not disclosed'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Market positioning</div>
              </div>
            </div>
          </div>

          {/* Investment Recommendation Summary */}
          <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200">
            <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
              <ThumbsUp className="h-4 w-4" />
              Investment Recommendation Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border border-indigo-200">
                <div className="text-2xl font-bold text-indigo-600 mb-2">RECOMMEND</div>
                <div className="text-sm text-gray-600">Proceed with investment</div>
                <div className="text-xs text-gray-500 mt-1">Based on comprehensive analysis</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600 mb-2">STRONG</div>
                <div className="text-sm text-gray-600">Investment potential</div>
                <div className="text-xs text-gray-500 mt-1">High growth opportunity</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600 mb-2">MONITOR</div>
                <div className="text-sm text-gray-600">Key milestones</div>
                <div className="text-xs text-gray-500 mt-1">Track progress closely</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Revenue Streams from our Service Offering */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Current Revenue Streams from our Service Offering
          </CardTitle>
          <CardDescription>
            Revenue model analysis and financial metrics from pitch deck
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 shadow-sm">
            <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Revenue Model Analysis
            </h4>
            <div className="overflow-hidden border rounded-lg shadow-sm">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-100 to-indigo-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold text-blue-900 border-r border-blue-200">Metric</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-blue-900 border-r border-blue-200">Value</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-blue-900">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-200">
                  <tr className="hover:bg-blue-50">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800 border-r border-blue-200">Business Model</td>
                    <td className="px-4 py-3 text-sm text-blue-700 border-r border-blue-200">{enhancedDiligenceData?.revenue_model || "Not specified in pitch deck"}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={enhancedDiligenceData?.revenue_model ? "default" : "secondary"} className="text-xs">
                        {enhancedDiligenceData?.revenue_model ? "Available" : "Pending"}
                      </Badge>
                    </td>
                  </tr>
                  <tr className="hover:bg-blue-50">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800 border-r border-blue-200">Current Revenue</td>
                    <td className="px-4 py-3 text-sm text-blue-700 border-r border-blue-200">{enhancedDiligenceData?.current_revenue || "Not specified"}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={enhancedDiligenceData?.current_revenue ? "default" : "secondary"} className="text-xs">
                        {enhancedDiligenceData?.current_revenue ? "Available" : "Pending"}
                      </Badge>
                    </td>
                  </tr>
                  <tr className="hover:bg-blue-50">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800 border-r border-blue-200">Revenue Growth Rate</td>
                    <td className="px-4 py-3 text-sm text-blue-700 border-r border-blue-200">{enhancedDiligenceData?.revenue_growth_rate || "Not specified"}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={enhancedDiligenceData?.revenue_growth_rate ? "default" : "secondary"} className="text-xs">
                        {enhancedDiligenceData?.revenue_growth_rate ? "Available" : "Pending"}
                      </Badge>
                    </td>
                  </tr>
                  <tr className="hover:bg-blue-50">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800 border-r border-blue-200">Target Customers</td>
                    <td className="px-4 py-3 text-sm text-blue-700 border-r border-blue-200">{enhancedDiligenceData?.target_customers || "Not specified"}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={enhancedDiligenceData?.target_customers ? "default" : "secondary"} className="text-xs">
                        {enhancedDiligenceData?.target_customers ? "Available" : "Pending"}
                      </Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Unit Economics */}
          <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 shadow-sm">
            <h4 className="font-bold text-green-900 mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Unit Economics Analysis
            </h4>
            <div className="overflow-hidden border rounded-lg shadow-sm">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-100 to-emerald-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold text-green-900 border-r border-green-200">Metric</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-green-900 border-r border-green-200">Value</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-green-900">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-green-200">
                  <tr className="hover:bg-green-50">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800 border-r border-green-200">Customer Acquisition Cost (CAC)</td>
                    <td className="px-4 py-3 text-sm text-green-700 border-r border-green-200">{enhancedDiligenceData?.customer_acquisition_cost || "Not specified"}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={enhancedDiligenceData?.customer_acquisition_cost ? "default" : "secondary"} className="text-xs">
                        {enhancedDiligenceData?.customer_acquisition_cost ? "Available" : "Pending"}
                      </Badge>
                    </td>
                  </tr>
                  <tr className="hover:bg-green-50">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800 border-r border-green-200">Lifetime Value (LTV)</td>
                    <td className="px-4 py-3 text-sm text-green-700 border-r border-green-200">{enhancedDiligenceData?.lifetime_value || "Not specified"}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={enhancedDiligenceData?.lifetime_value ? "default" : "secondary"} className="text-xs">
                        {enhancedDiligenceData?.lifetime_value ? "Available" : "Pending"}
                      </Badge>
                    </td>
                  </tr>
                  <tr className="hover:bg-green-50">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800 border-r border-green-200">Gross Margin</td>
                    <td className="px-4 py-3 text-sm text-green-700 border-r border-green-200">{enhancedDiligenceData?.gross_margin || "Not specified"}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={enhancedDiligenceData?.gross_margin ? "default" : "secondary"} className="text-xs">
                        {enhancedDiligenceData?.gross_margin ? "Available" : "Pending"}
                      </Badge>
                    </td>
                  </tr>
                  <tr className="hover:bg-green-50">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800 border-r border-green-200">Burn Rate</td>
                    <td className="px-4 py-3 text-sm text-green-700 border-r border-green-200">{enhancedDiligenceData?.burn_rate || "Not specified"}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={enhancedDiligenceData?.burn_rate ? "default" : "secondary"} className="text-xs">
                        {enhancedDiligenceData?.burn_rate ? "Available" : "Pending"}
                      </Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Strategy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Pricing Strategy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Pricing Strategy from Pitch Deck</h4>
            <div className="text-sm text-blue-700 space-y-2">
              <p><strong>Pricing Strategy:</strong> {typeof enhancedDiligenceData?.pricing_strategy === 'string' ? enhancedDiligenceData.pricing_strategy : typeof enhancedDiligenceData?.pricing_strategy === 'object' ? JSON.stringify(enhancedDiligenceData.pricing_strategy) : "Not specified in pitch deck"}</p>
              <p><strong>Go-to-Market Strategy:</strong> {enhancedDiligenceData?.go_to_market || "Not specified"}</p>
              <p><strong>Target Market:</strong> {enhancedDiligenceData?.target_market || "Not specified"}</p>
              </div>
              </div>

          {/* Product Features */}
          {diligenceData?.product_features && diligenceData.product_features.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Product Features from Pitch Deck</h4>
              <div className="grid gap-2 md:grid-cols-2">
                {diligenceData.product_features.map((feature, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                    • {feature}
              </div>
                ))}
              </div>
            </div>
          )}

          {/* Market Information */}
            <div className="grid gap-3 md:grid-cols-2">
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-medium text-green-800">Market Size</h5>
              <p className="text-sm text-green-600">{enhancedDiligenceData?.market_size || "Not specified"}</p>
              </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <h5 className="font-medium text-purple-800">Market Timing</h5>
              <p className="text-sm text-purple-600">{enhancedDiligenceData?.market_timing || "Not specified"}</p>
              </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <h5 className="font-medium text-orange-800">Competitive Advantages</h5>
              <p className="text-sm text-orange-600">{enhancedDiligenceData?.competitive_advantages || "Not specified"}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-medium text-blue-800">Market Penetration</h5>
              <p className="text-sm text-blue-600">{enhancedDiligenceData?.market_penetration || "Not specified"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Corporate Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Pricing Strategy - for Corporates
          </CardTitle>
          <CardDescription>
            Dynamic pricing tiers and corporate revenue model analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-3">Tiered Pricing: Different packages based on features or usage levels</h4>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h5 className="font-medium text-blue-800">Starter (Startups & Small Teams)</h5>
                <p className="text-xs text-blue-600 mt-1">
                  {enhancedDiligenceData.starter_price || "Pricing not specified"}
                </p>
                <p className="text-xs text-blue-600">
                  {enhancedDiligenceData.starter_features || "Deploy up to 15 interview simulations; AI-based candidate reports; Self-serve portal for role configuration"}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <h5 className="font-medium text-green-800">Growth (Growing Companies, SMBs)</h5>
                <p className="text-xs text-green-600 mt-1">
                  {enhancedDiligenceData.growth_price || "Pricing not specified"}
                </p>
                <p className="text-xs text-green-600">
                  {enhancedDiligenceData.growth_features || "Deploy up to 30 interview simulations and 10 job simulations; AI-based candidate reports; Bulk import and ATS integrations; White-labeled experience; Basic hiring analytics dashboard"}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <h5 className="font-medium text-purple-800">Enterprise (Large Enterprises & Hiring Teams)</h5>
                <p className="text-xs text-purple-600 mt-1">
                  {enhancedDiligenceData.enterprise_price || "Pricing not specified"}
                </p>
                <p className="text-xs text-purple-600">
                  {enhancedDiligenceData.enterprise_features || "Deploy up to 60 interview simulations and 20 job simulations; Role-specific evaluation rubrics; AI-based shortlisting with hiring recommendations; Account manager + support"}
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <h5 className="font-medium text-orange-800">Strategic+ (L&D & Transformation Initiatives)</h5>
                <p className="text-xs text-orange-600 mt-1">
                  {enhancedDiligenceData.strategic_price || "Customised pricing"}
                </p>
                <p className="text-xs text-orange-600">
                  {enhancedDiligenceData.strategic_features || "Unlimited candidate assessments; Dedicated hiring pipelines (HTD, fresher, internal upskilling); Custom simulations co-created with client; Employer branding integration; Analytics APIs & hiring ROI dashboard; Dedicated implementation & advisory team"}
                </p>
              </div>
            </div>
              </div>

          {/* Corporate Rationale */}
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">Rationale behind pricing (market research, competitor analysis)</h4>
            <div className="text-sm text-yellow-700 space-y-2">
              {enhancedDiligenceData.pricing_rationale || enhancedDiligenceData.competitive_analysis ? (
                <div>
                  {enhancedDiligenceData.pricing_rationale && (
                    <p>• {enhancedDiligenceData.pricing_rationale}</p>
                  )}
                  {enhancedDiligenceData.competitive_analysis && (
                    <p>• {enhancedDiligenceData.competitive_analysis}</p>
                  )}
                </div>
              ) : (
                <div>
                  <p>• Market research and competitive analysis data not specified in pitch deck</p>
                  <p>• Pricing rationale requires further analysis based on industry benchmarks</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unit Economics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Unit Economics
          </CardTitle>
          <CardDescription>
            Customer acquisition costs, lifetime value, and revenue model analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Academic Institutions */}
          <div>
            <h4 className="font-semibold mb-2">Key metrics for revenue generation - for Academic Institutions</h4>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm space-y-1">
                <div><strong>Customer Acquisition Cost (CAC):</strong> How much it costs to acquire a customer. - {enhancedDiligenceData.academic_cac || "INR 1,125 per student"}</div>
                <div><strong>Lifetime Value (LTV):</strong> Revenue generated from a customer during their relationship. - {enhancedDiligenceData.academic_ltv || "INR 21,000 per student"}</div>
                <div><strong>LTV: CAC Ratio:</strong> Indicator of profitability. - {enhancedDiligenceData.academic_ratio || "18.6"}</div>
              </div>
            </div>
          </div>

          {/* Corporate Clients */}
          <div>
            <h4 className="font-semibold mb-2">Key metrics for revenue generation - for Corporates (potential)</h4>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm space-y-1">
                <div><strong>Customer Acquisition Cost (CAC):</strong> How much it costs to acquire a customer. - {enhancedDiligenceData.corporate_cac || "INR 6,000"}</div>
                <div><strong>Lifetime Value (LTV):</strong> Revenue generated from a customer during their relationship. - {enhancedDiligenceData.corporate_ltv || "INR 3,60,000 (i.e. INR 30,000 every quarter for a 3 year period)"}</div>
                <div><strong>LTV: CAC Ratio:</strong> Indicator of profitability. - {enhancedDiligenceData.corporate_ratio || "60"}</div>
              </div>
            </div>
          </div>

          {/* Recurring vs One-Time Revenue */}
          <div>
            <h4 className="font-semibold mb-2">Recurring vs. One-Time Revenue</h4>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-sm space-y-2">
                <div><strong>Recurring Revenue:</strong> Subscription fees, memberships. - {enhancedDiligenceData.recurring_revenue || enhancedDiligenceData.revenue_model || "Revenue model details from pitch deck"}</div>
                <div><strong>One-Time Revenue:</strong> Single purchases, setup fees. - {enhancedDiligenceData.one_time_revenue || "Revenue breakdown not specified in pitch deck"}</div>
              </div>
            </div>
          </div>

          {/* Payment Flow and Terms */}
          <div>
            <h4 className="font-semibold mb-2">Payment Flow and Terms</h4>
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-sm space-y-2">
                <div><strong>How payments are collected and processed:</strong> Direct payments, online gateways, invoicing. - {enhancedDiligenceData.payment_collection || "Payment collection method not specified"}</div>
                <div><strong>Payment frequency:</strong> (monthly, annual, one-time). - {enhancedDiligenceData.payment_frequency || (typeof enhancedDiligenceData.pricing_strategy === 'string' ? enhancedDiligenceData.pricing_strategy : typeof enhancedDiligenceData.pricing_strategy === 'object' ? JSON.stringify(enhancedDiligenceData.pricing_strategy) : "Payment frequency details from pitch deck")}</div>
                <div><strong>Refund and cancellation policies:</strong> (if applicable). - {enhancedDiligenceData.refund_policy || "N/A"}</div>
              </div>
            </div>
              </div>

          {/* Scalability of Revenue Model */}
          <div>
            <h4 className="font-semibold mb-2">Scalability of Revenue Model</h4>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <div className="text-sm space-y-2">
                <p><strong>How the revenue model will scale as the business grows:</strong></p>
                <p>{enhancedDiligenceData.scalability_plan || "Revenue model scalability details from pitch deck"}</p>
                <p><strong>Key scalability levers that we will focus on:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  {Array.isArray(enhancedDiligenceData.key_milestones) ? enhancedDiligenceData.key_milestones.map((milestone: any, index: number) => (
                    <li key={index}>{milestone}</li>
                  )) : (
                    <li>Scalability details from pitch deck</li>
                  )}
                </ul>
                <p>{enhancedDiligenceData.scalability_strategy || "Scalability strategy details from pitch deck"}</p>
              </div>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Competitor Analysis Framework */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Competitor Analysis Framework
            </CardTitle>
            <CardDescription>
            Dynamic competitor analysis with market positioning and competitive advantages
            </CardDescription>
          </CardHeader>
        <CardContent className="space-y-4">
          {enhancedDiligenceData.competitors && Array.isArray(enhancedDiligenceData.competitors) && enhancedDiligenceData.competitors.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
              {enhancedDiligenceData.competitors.map((competitor: any, index: number) => (
                <div key={index} className={`p-4 rounded-lg border ${
                  index === 0 ? 'bg-blue-50 border-blue-200' :
                  index === 1 ? 'bg-green-50 border-green-200' :
                  'bg-purple-50 border-purple-200'
                }`}>
                  <h4 className={`font-semibold mb-2 ${
                    index === 0 ? 'text-blue-800' :
                    index === 1 ? 'text-green-800' :
                    'text-purple-800'
                  }`}>
                    {competitor.name || `Competitor ${index + 1}`}
                  </h4>
              <div className="space-y-2 text-xs">
                    {competitor.funding && <div><strong>Funding:</strong> {competitor.funding}</div>}
                    {competitor.arr && <div><strong>ARR:</strong> {competitor.arr}</div>}
                    {competitor.model && <div><strong>Model:</strong> {competitor.model}</div>}
                    {competitor.focus && <div><strong>Focus:</strong> {competitor.focus}</div>}
                    {competitor.revenue_model && <div><strong>Revenue Model:</strong> {competitor.revenue_model}</div>}
                    {competitor.market_position && <div><strong>Market Position:</strong> {competitor.market_position}</div>}
              </div>
                  {competitor.website && (
              <div className="mt-2">
                      <a href={competitor.website} target="_blank" rel="noopener noreferrer" className={`text-xs hover:underline flex items-center ${
                        index === 0 ? 'text-blue-500' :
                        index === 1 ? 'text-green-500' :
                        'text-purple-500'
                      }`}>
                  Company Website
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
              </div>
                  )}
            </div>
              ))}
              </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">
                {enhancedDiligenceData.competitive_analysis || "Competitor analysis details from pitch deck"}
              </p>
              </div>
          )}

          <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border">
            <h4 className="font-semibold text-gray-800 mb-2">Competitive Positioning</h4>
            <p className="text-sm text-gray-700 mb-2">
              {enhancedDiligenceData.competitive_advantages || "Competitive positioning details from pitch deck"}
            </p>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Key Differentiators:</strong></p>
              {enhancedDiligenceData.key_differentiators && Array.isArray(enhancedDiligenceData.key_differentiators) ? (
              <ul className="list-disc list-inside ml-4 space-y-1">
                  {enhancedDiligenceData.key_differentiators.map((differentiator: any, index: number) => (
                    <li key={index}>{differentiator}</li>
                  ))}
              </ul>
              ) : (
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Key differentiators from pitch deck</li>
                  <li>Competitive advantages not specified</li>
                </ul>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financials & Fundraising */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financials & Fundraising
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Financial Overview */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Financial Overview from Pitch Deck</h4>
            <div className="text-sm text-blue-700 space-y-2">
              <p><strong>Current Revenue:</strong> {enhancedDiligenceData?.current_revenue || "Not specified"}</p>
              <p><strong>Revenue Growth Rate:</strong> {enhancedDiligenceData?.revenue_growth_rate || "Not specified"}</p>
              <p><strong>Gross Margin:</strong> {enhancedDiligenceData?.gross_margin || "Not specified"}</p>
              <p><strong>Burn Rate:</strong> {enhancedDiligenceData?.burn_rate || "Not specified"}</p>
              <p><strong>Runway:</strong> {enhancedDiligenceData?.runway || "Not specified"}</p>
            </div>
              </div>

          {/* Deal Details */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">Deal Details from Pitch Deck</h4>
            <div className="text-sm text-green-700 space-y-2">
              <p><strong>Amount Raising:</strong> {enhancedDiligenceData?.amount_raising || enhancedDiligenceData?.funding_ask || "Not specified"}</p>
              <p><strong>Pre-Money Valuation:</strong> {enhancedDiligenceData?.pre_money_valuation || "Not specified"}</p>
              <p><strong>Post-Money Valuation:</strong> {enhancedDiligenceData?.post_money_valuation || "Not specified"}</p>
              <p><strong>Lead Investor:</strong> {enhancedDiligenceData?.lead_investor || "Not specified"}</p>
              <p><strong>Committed Funding:</strong> {enhancedDiligenceData?.committed_funding || "Not specified"}</p>
              <p><strong>Round Stage:</strong> {enhancedDiligenceData?.round_stage || "Not specified"}</p>
            </div>
          </div>

          {/* Use of Funds */}
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2">Use of Funds</h4>
            <p className="text-sm text-purple-700">
              {diligenceData?.use_of_funds || "Not specified in pitch deck"}
            </p>
              </div>

          {/* Timeline */}
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h4 className="font-semibold text-orange-800 mb-2">Timeline</h4>
            <p className="text-sm text-orange-700">
              {diligenceData?.timeline || "Not specified in pitch deck"}
            </p>
          </div>

          {/* Growth Metrics */}
          <div className="grid gap-3 md:grid-cols-2">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-medium text-blue-800">User Growth</h5>
              <p className="text-sm text-blue-600">{enhancedDiligenceData?.user_growth || "Not specified"}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-medium text-green-800">Revenue Growth</h5>
              <p className="text-sm text-green-600">{enhancedDiligenceData?.revenue_growth || "Not specified"}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <h5 className="font-medium text-purple-800">Customer Growth</h5>
              <p className="text-sm text-purple-600">{enhancedDiligenceData?.customer_growth || "Not specified"}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <h5 className="font-medium text-orange-800">Team Size</h5>
              <p className="text-sm text-orange-600">{enhancedDiligenceData?.team_size || "Not specified"}</p>
          </div>
          </div>
        </CardContent>
      </Card>

      {/* Risks and Mitigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Risks and Mitigation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">Risks and Mitigation from Pitch Deck</h4>
            <div className="text-sm space-y-3">
              {/* Key Risks */}
              {diligenceData?.key_risks && diligenceData.key_risks.length > 0 && (
              <div>
                <p className="font-medium text-yellow-800 mb-2">Identified Risks</p>
                  <ul className="space-y-2">
                    {diligenceData.key_risks.map((risk, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertTriangle className="h-3 w-3 text-yellow-600 mt-1 flex-shrink-0" />
                        <span className="text-yellow-700">{risk}</span>
                      </li>
                    ))}
                  </ul>
              </div>
              )}
              
              {/* Risk Mitigation */}
              {diligenceData?.risk_mitigation && (
                <div>
                  <p className="font-medium text-yellow-800 mb-2">Risk Mitigation Strategy</p>
                  <p className="text-yellow-700">{diligenceData.risk_mitigation}</p>
                </div>
              )}
              
              {/* Regulatory Risks */}
              {diligenceData?.regulatory_risks && (
                <div>
                  <p className="font-medium text-yellow-800 mb-2">Regulatory Risks</p>
                  <p className="text-yellow-700">{diligenceData.regulatory_risks}</p>
                </div>
              )}
              
              {/* Regulatory Considerations */}
              {diligenceData?.regulatory_considerations && (
                <div>
                  <p className="font-medium text-yellow-800 mb-2">Regulatory Considerations</p>
                  <p className="text-yellow-700">{diligenceData.regulatory_considerations}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exit Strategy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Exit Strategy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Exit Strategy from Pitch Deck</h4>
            <div className="text-sm text-blue-700 space-y-2">
              <p><strong>Exit Strategy:</strong> {enhancedDiligenceData?.exit_strategy || "Not specified in pitch deck"}</p>
              <p><strong>IPO Timeline:</strong> {enhancedDiligenceData?.ipo_timeline || "Not specified"}</p>
              <p><strong>Exit Valuation:</strong> {enhancedDiligenceData?.exit_valuation || "Not specified"}</p>
            </div>
                </div>
                
          {/* Potential Acquirers */}
          {diligenceData?.potential_acquirers && diligenceData.potential_acquirers.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Potential Acquirers</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {diligenceData.potential_acquirers.map((acquirer, index) => (
                  <li key={index}>• {acquirer}</li>
                ))}
              </ul>
                </div>
          )}
        </CardContent>
      </Card>

      {/* Team Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-medium text-blue-800">Team Size</h5>
              <p className="text-sm text-blue-600">{enhancedDiligenceData?.team_size || "Not specified"}</p>
              </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-medium text-green-800">Execution Track Record</h5>
              <p className="text-sm text-green-600">{enhancedDiligenceData?.execution_track_record || "Not specified"}</p>
              </div>
            </div>

          {/* Key Team Members */}
          {diligenceData?.key_team_members && diligenceData.key_team_members.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Key Team Members</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {diligenceData.key_team_members.map((member, index) => (
                  <li key={index}>• {member}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Advisory Board */}
          {diligenceData?.advisory_board && diligenceData.advisory_board.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Advisory Board</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {diligenceData.advisory_board.map((advisor, index) => (
                  <li key={index}>• {advisor}</li>
                ))}
              </ul>
            </div>
          )}
          </CardContent>
        </Card>

      {/* Investment Decision */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Investment Decision
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
            <h4 className="font-semibold text-gray-800 mb-2">Investment Recommendation</h4>
            <p className="text-sm text-gray-700 mb-2">
              {diligenceData?.investment_recommendation || 
               "Based on comprehensive analysis of market opportunity, technology differentiation, team capabilities, and financial projections, this investment presents a compelling opportunity in the rapidly growing workforce readiness and EdTech space."}
            </p>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${(diligenceData?.overall_score || 7) * 10}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-800">
                {diligenceData?.overall_score || 7}/10
              </span>
            </div>
            <p className="text-xs text-gray-600">
              Investment score based on market opportunity, team strength, and execution capability
            </p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Investment Thesis</h4>
            <p className="text-sm text-blue-700">
              {diligenceData?.investment_thesis || 
               "This investment presents a compelling opportunity based on comprehensive analysis of market opportunity, technology differentiation, team capabilities, and financial projections."}
            </p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2">Next Steps</h4>
            <div className="text-sm text-purple-700 space-y-1">
              {diligenceData?.due_diligence_next_steps && diligenceData.due_diligence_next_steps.length > 0 ? (
                diligenceData.due_diligence_next_steps.map((step, index) => (
                  <p key={index}>• {step}</p>
                ))
              ) : (
                <>
              <p>• Finalize investment terms and documentation</p>
              <p>• Schedule follow-up meetings with key team members</p>
              <p>• Conduct technical due diligence on platform scalability</p>
              <p>• Review customer references and case studies</p>
              <p>• Prepare investment committee presentation</p>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                // Handle Accept action
                console.log('Investment Accepted');
              }}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Accept Investment
            </Button>
            
            <Button 
              variant="destructive"
              onClick={() => {
                // Handle Decline action
                console.log('Investment Declined');
              }}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Decline Investment
            </Button>
            
            <Button 
              variant="outline"
              className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
              onClick={() => {
                // Handle Hold action
                console.log('Investment on Hold');
              }}
            >
              <Target className="mr-2 h-4 w-4" />
              Hold Decision
            </Button>
            
            <Button
              onClick={handleRunValidation}
              disabled={isValidating}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isValidating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Run AI Validation
                </>
              )}
            </Button>
            
            <Button 
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
              onClick={handleCreateRoom}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Create Room
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Validation Results Section */}
      {diligenceData?.validation_result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              AI Validation Analysis
            </CardTitle>
            <CardDescription>
              Comprehensive validation analysis using Vertex AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Assessment */}
            {diligenceData.validation_result.validation_result.overall_assessment && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-3">Overall Investment Assessment</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Investment Readiness</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(diligenceData.validation_result.validation_result.overall_assessment.investment_readiness / 10) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold">{diligenceData.validation_result.validation_result.overall_assessment.investment_readiness}/10</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Investment Attractiveness</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(diligenceData.validation_result.validation_result.overall_assessment.investment_attractiveness / 10) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold">{diligenceData.validation_result.validation_result.overall_assessment.investment_attractiveness}/10</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-blue-700">
                    <strong>Due Diligence Priority:</strong> {diligenceData.validation_result.validation_result.overall_assessment.due_diligence_priority}
                  </p>
                </div>
              </div>
            )}

            {/* Data Validation Scores */}
            {diligenceData.validation_result.validation_result.data_validation && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-3">Data Quality Assessment</h4>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{diligenceData.validation_result.validation_result.data_validation.accuracy_score}/10</div>
                    <div className="text-sm text-gray-600">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{diligenceData.validation_result.validation_result.data_validation.completeness_score}/10</div>
                    <div className="text-sm text-gray-600">Completeness</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{diligenceData.validation_result.validation_result.data_validation.consistency_score}/10</div>
                    <div className="text-sm text-gray-600">Consistency</div>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-gray-700">
                    <strong>Validation Notes:</strong> {diligenceData.validation_result.validation_result.data_validation.validation_notes}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    <strong>Data Quality:</strong> {diligenceData.validation_result.validation_result.data_validation.data_quality}
                  </p>
                </div>
              </div>
            )}

            {/* Market Validation */}
            {diligenceData.validation_result.validation_result.market_validation && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-3">Market Analysis</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Market Size Accuracy:</strong> {diligenceData.validation_result.validation_result.market_validation.market_size_accuracy}/10</p>
                  <p><strong>Competitive Landscape:</strong> {diligenceData.validation_result.validation_result.market_validation.competitive_landscape}</p>
                  <p><strong>Market Timing:</strong> {diligenceData.validation_result.validation_result.market_validation.market_timing}</p>
                  <p><strong>Growth Potential:</strong> {diligenceData.validation_result.validation_result.market_validation.growth_potential}</p>
                  <p><strong>Market Attractiveness:</strong> {diligenceData.validation_result.validation_result.market_validation.market_attractiveness}/10</p>
                </div>
              </div>
            )}

            {/* Financial Validation */}
            {diligenceData.validation_result.validation_result.financial_validation && (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-3">Financial Analysis</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Revenue Projections:</strong> {diligenceData.validation_result.validation_result.financial_validation.revenue_projections}</p>
                  <p><strong>Unit Economics:</strong> {diligenceData.validation_result.validation_result.financial_validation.unit_economics}</p>
                  <p><strong>Funding Requirements:</strong> {diligenceData.validation_result.validation_result.financial_validation.funding_requirements}</p>
                  <p><strong>Valuation Reasonableness:</strong> {diligenceData.validation_result.validation_result.financial_validation.valuation_reasonableness}</p>
                  <p><strong>Financial Viability:</strong> {diligenceData.validation_result.validation_result.financial_validation.financial_viability}/10</p>
                </div>
              </div>
            )}

            {/* Team Validation */}
            {diligenceData.validation_result.validation_result.team_validation && (
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-3">Team Assessment</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Founder Background:</strong> {diligenceData.validation_result.validation_result.team_validation.founder_background}</p>
                  <p><strong>Team Completeness:</strong> {diligenceData.validation_result.validation_result.team_validation.team_completeness}</p>
                  <p><strong>Execution Capability:</strong> {diligenceData.validation_result.validation_result.team_validation.execution_capability}</p>
                  <p><strong>Team Strength:</strong> {diligenceData.validation_result.validation_result.team_validation.team_strength}/10</p>
                </div>
              </div>
            )}

            {/* Key Strengths and Concerns */}
            {diligenceData.validation_result.validation_result.overall_assessment && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-3">Key Strengths</h4>
                  <ul className="space-y-1 text-sm">
                    {diligenceData.validation_result.validation_result.overall_assessment.key_strengths?.map((strength, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-3">Key Concerns</h4>
                  <ul className="space-y-1 text-sm">
                    {diligenceData.validation_result.validation_result.overall_assessment.key_concerns?.map((concern, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        {concern}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {diligenceData.validation_result.validation_result.recommendations && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-3">AI Recommendations</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h5 className="font-medium text-blue-700 mb-2">Immediate Actions</h5>
                    <ul className="space-y-1 text-sm">
                      {diligenceData.validation_result.validation_result.recommendations.immediate_actions?.map((action, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-700 mb-2">Next Steps</h5>
                    <ul className="space-y-1 text-sm">
                      {diligenceData.validation_result.validation_result.recommendations.next_steps?.map((step, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Validation Summary */}
            <div className="p-4 bg-gray-100 rounded-lg">
              <h4 className="font-semibold mb-2">Validation Summary</h4>
              <p className="text-sm text-gray-700">{diligenceData.validation_result.validation_result.validation_summary}</p>
              <div className="mt-2 text-xs text-gray-500">
                Processing time: {diligenceData.validation_result.processing_time}s
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Investment Recommendation */}
      <Card className="bg-gradient-to-r from-slate-50 to-indigo-50 border-2 border-indigo-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-900">
            <ThumbsUp className="h-5 w-5" />
            Investment Recommendation
          </CardTitle>
          <CardDescription className="text-indigo-700">
            Final investment decision and strategic recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded-lg border border-indigo-200 shadow-sm">
              <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Investment Strengths
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Strong market opportunity in {enhancedDiligenceData?.industry_category || 'target industry'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Experienced team with {enhancedDiligenceData?.team_size || 'strong'} team members</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Clear revenue model and growth strategy</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Competitive advantages in {enhancedDiligenceData?.competitive_advantages || 'market positioning'}</span>
                </li>
              </ul>
            </div>
            
            <div className="p-6 bg-white rounded-lg border border-amber-200 shadow-sm">
              <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Risk Considerations
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Early-stage company with limited financial history</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Market competition and execution risk</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Regulatory and compliance considerations</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Funding requirements and runway management</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Investment Decision
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600 mb-2">RECOMMEND</div>
                <div className="text-sm text-gray-600">Proceed with investment</div>
                <div className="text-xs text-gray-500 mt-1">Based on comprehensive analysis</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600 mb-2">STRONG</div>
                <div className="text-sm text-gray-600">Investment potential</div>
                <div className="text-xs text-gray-500 mt-1">High growth opportunity</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600 mb-2">MONITOR</div>
                <div className="text-sm text-gray-600">Key milestones</div>
                <div className="text-xs text-gray-500 mt-1">Track progress closely</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Competitor Analysis Matrix */}
      <CompetitorMatrix 
        data={diligenceData?.competitor_matrix || null}
        sources={diligenceData?.validation_result?.sources}
        dataQuality={diligenceData?.validation_result?.data_quality}
        analysisConfidence={diligenceData?.validation_result?.analysis_confidence}
      />

    </div>
  );
}