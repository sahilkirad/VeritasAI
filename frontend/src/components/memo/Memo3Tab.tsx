'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, CheckCircle, ThumbsUp, ThumbsDown, MessageCircle, Users, TrendingUp, DollarSign, BarChart3, AlertTriangle, ExternalLink, Cpu, Database, Cloud, Zap, Shield, Building, Loader2, FileText } from "lucide-react";
import CompetitorMatrix from "./CompetitorMatrix";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
}

export default function Memo3Tab({ diligenceData, memo1Data, memoId }: Memo3TabProps) {
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  // Calculate confidence level from diligence report data
  const calculateConfidenceLevel = (): number => {
    if (!diligenceData) return 0;

    // Try to get confidence level directly first
    const directConfidence = (diligenceData as any)?.overall_dd_score_recommendation?.confidence_level;
    if (typeof directConfidence === 'number') {
      return directConfidence;
    }
    
    const confidenceLevelStr = diligenceData?.confidence_level as any;
    if (typeof confidenceLevelStr === 'number') {
      return confidenceLevelStr;
    }
    if (typeof confidenceLevelStr === 'string') {
      // Parse string confidence levels like "low", "medium", "high"
      const lower = confidenceLevelStr.toLowerCase();
      if (lower === 'high') return 85;
      if (lower === 'medium') return 60;
      if (lower === 'low') return 35;
    }

    // Calculate confidence based on component scores and data completeness
    const componentScores = (diligenceData as any)?.overall_dd_score_recommendation?.component_scores || {};
    const overallScore = (diligenceData as any)?.overall_dd_score_recommendation?.overall_dd_score ?? diligenceData?.overall_score ?? 0;
    
    // Get individual component scores
    const founderCredibility = componentScores.founder_credibility || (diligenceData as any)?.founder_credibility_assessment?.overall_score || 0;
    const memo1Accuracy = componentScores.memo1_accuracy || (diligenceData as any)?.memo1_accuracy_data?.accuracy_score || 0;
    const pitchConsistency = componentScores.pitch_consistency || (diligenceData as any)?.pitch_consistency_check?.consistency_score || 0;
    
    // Count available components (non-zero scores indicate data is present)
    const availableComponents = [
      founderCredibility > 0,
      memo1Accuracy > 0,
      pitchConsistency > 0,
      overallScore > 0
    ].filter(Boolean).length;

    // Base confidence on overall score and data completeness
    let confidence = overallScore * 0.6; // 60% weight on overall score
    
    // Add bonus for component completeness (40% weight)
    const completenessBonus = (availableComponents / 4) * 40;
    confidence += completenessBonus;
    
    // Adjust based on risk level
    const riskAssessment = (diligenceData as any)?.risk_assessment;
    if (riskAssessment) {
      const riskLevel = typeof riskAssessment === 'string' ? riskAssessment.toLowerCase() : '';
      if (riskLevel === 'high') confidence *= 0.85; // Reduce confidence for high risk
      if (riskLevel === 'medium') confidence *= 0.92;
      // Low risk = no reduction
    }
    
    // Adjust based on number of red flags
    const redFlagsCount = (diligenceData as any)?.red_flags_concerns?.total_flags || 
                         ((diligenceData as any)?.key_findings?.red_flags?.length || 0);
    if (redFlagsCount > 5) confidence *= 0.8;
    else if (redFlagsCount > 3) confidence *= 0.9;
    
    // Clamp between 0 and 100
    return Math.max(0, Math.min(100, Math.round(confidence)));
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

  // Enhanced diligence data with parsed information, prioritizing memo1Data
  // This ensures we reuse data already generated in Memo 1 instead of duplicating content
  // CRITICAL FIX: This resolves the "Not specified" issue by using data from Memo 1
  const enhancedDiligenceData = {
    ...diligenceData,
    // Use memo1Data when available, fallback to diligenceData
    // This prevents duplication of content between Memo 1 and Memo 3
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

  return (
    <div className="space-y-2">
      

      {/* Executive Summary */}
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-3 w-3" />
            Executive Summary
          </CardTitle>
          <CardDescription className="text-xs">
            Comprehensive investment analysis and due diligence report
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Investment Overview */}
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Target className="h-3 w-3" />
              Investment Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3 bg-white rounded border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Company Stage</span>
                  <Badge variant="outline" className="text-xs">
                    {enhancedDiligenceData?.company_stage || 'Not specified'}
                  </Badge>
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {enhancedDiligenceData?.company_stage || 'Early Stage'}
                </div>
              </div>
              
              <div className="p-3 bg-white rounded border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Amount Raising</span>
                  <Badge variant="outline" className="text-xs">
                    {enhancedDiligenceData?.amount_raising ? 'Specified' : 'Pending'}
                  </Badge>
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {enhancedDiligenceData?.amount_raising || 'Not disclosed'}
                </div>
              </div>
              
              <div className="p-3 bg-white rounded border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Valuation</span>
                  <Badge variant="outline" className="text-xs">
                    {enhancedDiligenceData?.post_money_valuation ? 'Specified' : 'Pending'}
                  </Badge>
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {enhancedDiligenceData?.post_money_valuation || 'Not disclosed'}
                </div>
              </div>
              
              <div className="p-3 bg-white rounded border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Lead Investor</span>
                  <Badge variant="outline" className="text-xs">
                    {enhancedDiligenceData?.lead_investor ? 'Specified' : 'Pending'}
                  </Badge>
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {enhancedDiligenceData?.lead_investor || 'Not disclosed'}
                </div>
              </div>
            </div>
          </div>

          {/* Financial Performance */}
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <TrendingUp className="h-3 w-3" />
              Financial Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3 bg-white rounded border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Current Revenue</span>
                  <Badge variant={enhancedDiligenceData?.current_revenue ? "default" : "secondary"} className="text-xs">
                    {enhancedDiligenceData?.current_revenue ? 'Available' : 'Pending'}
                  </Badge>
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {enhancedDiligenceData?.current_revenue || 'Not disclosed'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Annual recurring revenue</div>
              </div>
              
              <div className="p-3 bg-white rounded border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Gross Margin</span>
                  <Badge variant={enhancedDiligenceData?.gross_margin ? "default" : "secondary"} className="text-xs">
                    {enhancedDiligenceData?.gross_margin ? 'Available' : 'Pending'}
                  </Badge>
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {enhancedDiligenceData?.gross_margin || 'Not disclosed'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Profitability indicator</div>
              </div>
              
              <div className="p-3 bg-white rounded border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Burn Rate</span>
                  <Badge variant={enhancedDiligenceData?.burn_rate ? "default" : "secondary"} className="text-xs">
                    {enhancedDiligenceData?.burn_rate ? 'Available' : 'Pending'}
                  </Badge>
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {enhancedDiligenceData?.burn_rate || 'Not disclosed'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Monthly cash burn</div>
              </div>
              
              <div className="p-3 bg-white rounded border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Runway</span>
                  <Badge variant={enhancedDiligenceData?.runway ? "default" : "secondary"} className="text-xs">
                    {enhancedDiligenceData?.runway ? 'Available' : 'Pending'}
                  </Badge>
                </div>
                <div className="text-sm font-semibold text-gray-900">
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

          {/* Investment Recommendation Summary (dynamic) */}
          <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200">
            <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
              <ThumbsUp className="h-4 w-4" />
              Investment Recommendation Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border border-indigo-200">
                <div className="text-2xl font-bold text-indigo-600 mb-2">{(diligenceData as any)?.overall_dd_score_recommendation?.investment_recommendation || diligenceData?.investment_recommendation || '—'}</div>
                <div className="text-sm text-gray-600">Recommendation</div>
                <div className="text-xs text-gray-500 mt-1">From diligence report</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600 mb-2">{((diligenceData as any)?.overall_dd_score_recommendation?.overall_dd_score ?? diligenceData?.overall_score ?? '—')}</div>
                <div className="text-sm text-gray-600">Overall DD Score (/100)</div>
                <div className="text-xs text-gray-500 mt-1">Composite score</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600 mb-2">{diligenceData ? `${calculateConfidenceLevel()}%` : '—'}</div>
                <div className="text-sm text-gray-600">Confidence Level</div>
                <div className="text-xs text-gray-500 mt-1">Analyst confidence</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Revenue Streams from our Service Offering */}
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-3 w-3" />
            Current Revenue Streams from our Service Offering
          </CardTitle>
          <CardDescription className="text-xs">
            Revenue model analysis and financial metrics from pitch deck
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="p-3 bg-gray-50 rounded border">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <TrendingUp className="h-3 w-3" />
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
          <div className="p-3 bg-gray-50 rounded border">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <BarChart3 className="h-3 w-3" />
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
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-3 w-3" />
            Pricing Strategy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Pricing Strategy from Pitch Deck</h4>
            <div className="text-sm text-blue-700 space-y-2">
              <p><strong>Pricing Strategy:</strong> {typeof enhancedDiligenceData?.pricing_strategy === 'string' ? enhancedDiligenceData.pricing_strategy : typeof enhancedDiligenceData?.pricing_strategy === 'object' ? JSON.stringify(enhancedDiligenceData.pricing_strategy) : "Not specified in pitch deck"}</p>
              <p><strong>Go-to-Market Strategy:</strong> {enhancedDiligenceData?.go_to_market || "Not specified"}</p>
              <p><strong>Target Market:</strong> {enhancedDiligenceData?.target_market || "Not specified"}</p>
              </div>
              </div>

          {/* Product Features */}
          {diligenceData?.product_features && Array.isArray(diligenceData.product_features) && diligenceData.product_features.length > 0 && (
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
        <CardContent className="space-y-2">
          {/* Academic Institutions */}
          <div>
            <h4 className="font-semibold mb-2">Key metrics for revenue generation - for Academic Institutions</h4>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm space-y-1">
                <div><strong>Customer Acquisition Cost (CAC):</strong> {enhancedDiligenceData.academic_cac || enhancedDiligenceData.cac || enhancedDiligenceData.customer_acquisition_cost || "—"}</div>
                <div><strong>Lifetime Value (LTV):</strong> {enhancedDiligenceData.academic_ltv || enhancedDiligenceData.ltv || enhancedDiligenceData.lifetime_value || "—"}</div>
                <div><strong>LTV:CAC Ratio:</strong> {enhancedDiligenceData.academic_ratio || enhancedDiligenceData.ltv_cac_ratio || "—"}</div>
              </div>
            </div>
          </div>

          {/* Corporate Clients */}
          <div>
            <h4 className="font-semibold mb-2">Key metrics for revenue generation - for Corporates (potential)</h4>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm space-y-1">
                <div><strong>Customer Acquisition Cost (CAC):</strong> {enhancedDiligenceData.corporate_cac || enhancedDiligenceData.cac || enhancedDiligenceData.customer_acquisition_cost || "—"}</div>
                <div><strong>Lifetime Value (LTV):</strong> {enhancedDiligenceData.corporate_ltv || enhancedDiligenceData.ltv || enhancedDiligenceData.lifetime_value || "—"}</div>
                <div><strong>LTV:CAC Ratio:</strong> {enhancedDiligenceData.corporate_ratio || enhancedDiligenceData.ltv_cac_ratio || "—"}</div>
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
                  {Array.isArray(enhancedDiligenceData.key_milestones) && enhancedDiligenceData.key_milestones.length > 0 ? (
                    enhancedDiligenceData.key_milestones.map((milestone: any, index: number) => (
                      <li key={index}>{typeof milestone === 'string' ? milestone : JSON.stringify(milestone)}</li>
                    ))
                  ) : (
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
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-3 w-3" />
            Competitor Analysis Framework
            </CardTitle>
            <CardDescription className="text-xs">
            Dynamic competitor analysis with market positioning and competitive advantages
            </CardDescription>
          </CardHeader>
        <CardContent className="space-y-2">
          {/* Prefer benchmarking competitive landscape from diligence report/results */}
          {(diligenceData as any)?.market_benchmarking?.competitive_landscape?.length ? (
            <div className="overflow-hidden border rounded">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-1 text-left font-semibold">Company</th>
                    <th className="px-2 py-1 text-left font-semibold">{(diligenceData as any)?.market_benchmarking?.metric_labels?.metric1 || 'Metric 1'}</th>
                    <th className="px-2 py-1 text-left font-semibold">{(diligenceData as any)?.market_benchmarking?.metric_labels?.metric2 || 'Metric 2'}</th>
                    <th className="px-2 py-1 text-left font-semibold">Fees</th>
                    <th className="px-2 py-1 text-left font-semibold">AI Powered</th>
                    <th className="px-2 py-1 text-left font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {(diligenceData as any).market_benchmarking.competitive_landscape.map((row: any, i: number) => (
                    <tr key={i} className={row.is_target ? 'bg-blue-50' : ''}>
                      <td className="px-2 py-1 font-medium">{row.company_name || '-'}</td>
                      <td className="px-2 py-1">{row.metric1_value || '-'}</td>
                      <td className="px-2 py-1">{row.metric2_value || '-'}</td>
                      <td className="px-2 py-1">{row.fees || '-'}</td>
                      <td className="px-2 py-1">{row.ai_powered || '-'}</td>
                      <td className="px-2 py-1 text-gray-600">{row.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : enhancedDiligenceData.competitors && Array.isArray(enhancedDiligenceData.competitors) && enhancedDiligenceData.competitors.length > 0 ? (
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
        <CardContent className="space-y-2">
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
        <CardContent className="space-y-2">
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">Risks and Mitigation from Pitch Deck</h4>
            <div className="text-sm space-y-3">
              {/* Key Risks */}
                  {(enhancedDiligenceData as any)?.key_risks && Array.isArray((enhancedDiligenceData as any).key_risks) && (enhancedDiligenceData as any).key_risks.length > 0 && (
              <div>
                <p className="font-medium text-yellow-800 mb-2">Identified Risks</p>
                  <ul className="space-y-2">
                        {(enhancedDiligenceData as any).key_risks.map((risk: any, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertTriangle className="h-3 w-3 text-yellow-600 mt-1 flex-shrink-0" />
                        <span className="text-yellow-700">{risk}</span>
                      </li>
                    ))}
                  </ul>
              </div>
              )}
              
              {/* Risk Mitigation */}
                  {(enhancedDiligenceData as any)?.risk_mitigation && (
                <div>
                  <p className="font-medium text-yellow-800 mb-2">Risk Mitigation Strategy</p>
                      <p className="text-yellow-700">{(enhancedDiligenceData as any).risk_mitigation}</p>
                </div>
              )}
              
              {/* Regulatory Risks */}
                  {(enhancedDiligenceData as any)?.regulatory_risks && (
                <div>
                  <p className="font-medium text-yellow-800 mb-2">Regulatory Risks</p>
                      <p className="text-yellow-700">{(enhancedDiligenceData as any).regulatory_risks}</p>
                </div>
              )}
              
              {/* Regulatory Considerations */}
                  {(enhancedDiligenceData as any)?.regulatory_considerations && (
                <div>
                  <p className="font-medium text-yellow-800 mb-2">Regulatory Considerations</p>
                      <p className="text-yellow-700">{(enhancedDiligenceData as any).regulatory_considerations}</p>
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
        <CardContent className="space-y-2">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Exit Strategy from Pitch Deck</h4>
            <div className="text-sm text-blue-700 space-y-2">
              <p><strong>Exit Strategy:</strong> {enhancedDiligenceData?.exit_strategy || "Not specified in pitch deck"}</p>
              <p><strong>IPO Timeline:</strong> {enhancedDiligenceData?.ipo_timeline || "Not specified"}</p>
              <p><strong>Exit Valuation:</strong> {enhancedDiligenceData?.exit_valuation || "Not specified"}</p>
            </div>
                </div>
                
          {/* Potential Acquirers */}
          {diligenceData?.potential_acquirers && Array.isArray(diligenceData.potential_acquirers) && diligenceData.potential_acquirers.length > 0 && (
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
        <CardContent className="space-y-2">
          <div className="grid gap-3 md:grid-cols-2">
              <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-medium text-blue-800">Team Size</h5>
                <p className="text-sm text-blue-600">{enhancedDiligenceData?.team_size || (enhancedDiligenceData as any)?.team || "Not specified"}</p>
              </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-medium text-green-800">Execution Track Record</h5>
              <p className="text-sm text-green-600">{enhancedDiligenceData?.execution_track_record || "Not specified"}</p>
              </div>
            </div>

          {/* Key Team Members */}
          {diligenceData?.key_team_members && Array.isArray(diligenceData.key_team_members) && diligenceData.key_team_members.length > 0 && (
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
          {diligenceData?.advisory_board && Array.isArray(diligenceData.advisory_board) && diligenceData.advisory_board.length > 0 && (
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
        <CardContent className="space-y-2">
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
                  style={{ width: `${diligenceData?.overall_score || 70}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-800">
                {diligenceData?.overall_score || 70}/100
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
              {diligenceData?.due_diligence_next_steps && Array.isArray(diligenceData.due_diligence_next_steps) && diligenceData.due_diligence_next_steps.length > 0 ? (
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
                    {diligenceData.validation_result.validation_result.overall_assessment.key_strengths && Array.isArray(diligenceData.validation_result.validation_result.overall_assessment.key_strengths) ? (
                      diligenceData.validation_result.validation_result.overall_assessment.key_strengths.map((strength, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        {strength}
                      </li>
                      ))
                    ) : (
                      <li className="text-gray-500">No key strengths identified</li>
                    )}
                  </ul>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-3">Key Concerns</h4>
                  <ul className="space-y-1 text-sm">
                    {diligenceData.validation_result.validation_result.overall_assessment.key_concerns && Array.isArray(diligenceData.validation_result.validation_result.overall_assessment.key_concerns) ? (
                      diligenceData.validation_result.validation_result.overall_assessment.key_concerns.map((concern, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        {concern}
                      </li>
                      ))
                    ) : (
                      <li className="text-gray-500">No key concerns identified</li>
                    )}
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
                      {diligenceData.validation_result.validation_result.recommendations.immediate_actions && Array.isArray(diligenceData.validation_result.validation_result.recommendations.immediate_actions) ? (
                        diligenceData.validation_result.validation_result.recommendations.immediate_actions.map((action, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          {action}
                        </li>
                        ))
                      ) : (
                        <li className="text-gray-500">No immediate actions identified</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-700 mb-2">Next Steps</h5>
                    <ul className="space-y-1 text-sm">
                      {diligenceData.validation_result.validation_result.recommendations.next_steps && Array.isArray(diligenceData.validation_result.validation_result.recommendations.next_steps) ? (
                        diligenceData.validation_result.validation_result.recommendations.next_steps.map((step, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                          {step}
                        </li>
                        ))
                      ) : (
                        <li className="text-gray-500">No next steps identified</li>
                      )}
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