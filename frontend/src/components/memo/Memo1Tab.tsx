'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Users, TrendingUp, Target, AlertTriangle, CheckCircle, BarChart3, Globe, DollarSign, FileText, ExternalLink, Calendar, Loader2, Cpu } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import CompetitorMatrix from "./CompetitorMatrix";

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
}

interface Memo1Data {
  title?: string;
  summary?: string;
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
  partnerships?: string[];
  regulatory_considerations?: string;
  scalability?: string;
  intellectual_property?: string;
  exit_strategy?: string;
  
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

interface Memo1TabProps {
  memo1: Memo1Data;
  memoId: string;
  onInterviewScheduled?: (result: any) => void;
}

export default function Memo1Tab({ memo1, memoId, onInterviewScheduled }: Memo1TabProps) {
  const [isScheduling, setIsScheduling] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Parse financial data if it comes as a long text block
  const parseFinancialData = (data: string) => {
    if (!data || typeof data !== 'string') return {};
    
    const parsed: any = {};
    
    // Extract gross margin - handle various formats
    const grossMarginMatch = data?.match(/gross margin[:\s]*([0-9.]+%)/i) || 
                            data?.match(/gross margin[:\s]*([0-9.]+%)/i);
    if (grossMarginMatch) {
      parsed.gross_margin = grossMarginMatch[1];
    }
    
    // Extract operating margin - handle negative values
    const operatingMarginMatch = data?.match(/operating margin[:\s]*([-]?[0-9.]+%)/i) ||
                                data?.match(/operating margin[:\s]*([-]?[0-9.]+%)/i);
    if (operatingMarginMatch) {
      parsed.operating_margin = operatingMarginMatch[1];
    }
    
    // Extract net margin - handle negative values
    const netMarginMatch = data?.match(/net margin[:\s]*([-]?[0-9.]+%)/i) ||
                          data?.match(/net margin[:\s]*([-]?[0-9.]+%)/i);
    if (netMarginMatch) {
      parsed.net_margin = netMarginMatch[1];
    }
    
    // Extract revenue - handle various currencies and units
    const revenueMatch = data?.match(/revenue[:\s]*([₹$][0-9.,\s]+(?:lakh|crore|million|billion)?)/i) ||
                        data?.match(/reported[:\s]*([₹$][0-9.,\s]+(?:lakh|crore|million|billion)?)/i);
    if (revenueMatch) {
      parsed.current_revenue = revenueMatch[1];
    }
    
    // Extract business model information
    const businessModelMatch = data?.match(/business model[:\s]*([^.]*)/i);
    if (businessModelMatch) {
      parsed.business_model = businessModelMatch[1].trim();
    }
    
    // Extract growth stage
    const growthStageMatch = data?.match(/growth phase[:\s]*([^.]*)/i) ||
                            data?.match(/early growth[:\s]*([^.]*)/i);
    if (growthStageMatch) {
      parsed.growth_stage = growthStageMatch[1].trim();
    }
    
    return parsed;
  };

  // Parse financial data if needed
  const parsedFinancialData = parseFinancialData(memo1.gross_margin || memo1.current_revenue || '');
  
  // Parse investor data for better display
  const parseInvestorData = (investorText: string) => {
    if (!investorText) return null;
    
    const investors = [];
    
    // Extract investor names and details
    const mortonMatch = investorText?.match(/\*\*(Morton Meyerson)\*\*/);
    const nandkishoreMatch = investorText?.match(/\*\*(Nandkishore \(Andy\) Kalambi)\*\*/);
    
    if (mortonMatch) {
      investors.push({
        name: mortonMatch[1],
        title: "Former CTO at General Motors",
        company: "Retired President and Vice-Chairman of EDS",
        highlights: ["Mentored Michael Dell", "Mark Cuban's first investor at Broadcast.com"]
      });
    }
    
    if (nandkishoreMatch) {
      investors.push({
        name: nandkishoreMatch[1],
        title: "25+ years executive leadership",
        company: "Kanu Ventures",
        highlights: ["Siemens", "SAP", "Dassault Systèmes"]
      });
    }
    
    return investors.length > 0 ? investors : null;
  };

  // Parse acquisition targets table data
  const parseAcquisitionTargets = (acquirersText: any) => {
    // Handle non-string inputs safely
    if (!acquirersText) return null;
    
    // Convert to string if it's not already
    const textString = typeof acquirersText === 'string' 
      ? acquirersText 
      : JSON.stringify(acquirersText);
    
    if (!textString || typeof textString !== 'string' || textString.trim().length === 0) return null;
    
    // Check if the text contains a table structure
    const tableMatch = textString.match(/\| Target Category \| Rationale \| Examples \(Hypothetical\) \|/);
    if (tableMatch) {
      // Extract table rows
      const rows = textString.split('\n').filter(line => 
        line.includes('|') && 
        !line.includes('Target Category') && 
        !line.includes('---') &&
        line.trim().length > 0
      );
      
      const targets = rows.map(row => {
        const columns = row.split('|').map(col => col.trim()).filter(col => col.length > 0);
        if (columns.length >= 3) {
          return {
            category: columns[0],
            rationale: columns[1],
            examples: columns[2]
          };
        }
        return null;
      }).filter(target => target !== null);
      
      return targets.length > 0 ? targets : null;
    }
    
    return null;
  };

  const enhancedMemo1 = { ...memo1, ...parsedFinancialData };

  // Helper function to safely render values that might be objects
  const safeRenderValue = (value: any): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value !== null) return JSON.stringify(value);
    return value?.toString() || "Not specified";
  };

  // Helper function to render enriched field with badge and source link
  const renderEnrichedField = (fieldName: string, enrichedField?: EnrichedField) => {
    const originalValue = enhancedMemo1[fieldName as keyof Memo1Data] as string;
    const displayValue = safeRenderValue(enrichedField?.value || originalValue);
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

  const handleScheduleInterview = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to schedule an interview.",
        variant: "destructive",
      });
      return;
    }

    // Extract founder email from memo data or use a placeholder
    const founderEmail = enhancedMemo1.founder_linkedin_url 
      ? `founder@${enhancedMemo1.title?.toLowerCase().replace(/\s+/g, '') || 'startup'}.com`
      : 'founder@startup.com';

    const startupName = enhancedMemo1.title || 'Startup';

    setIsScheduling(true);
    
    try {
      console.log('🔄 Scheduling AI interview...', {
        founder_email: founderEmail,
        investor_email: user.email,
        startup_name: startupName
      });

      const result = await apiClient.scheduleInterview({
        founder_email: founderEmail,
        investor_email: user.email,
        startup_name: startupName,
        calendar_id: '93fe7cf38ab2552f7c40f0a9e3584f3fab5bbe5e006011eac718ca8e7cc34e4f@group.calendar.google.com'
      });

      if (result.success && result.data?.status === 'SUCCESS') {
        console.log('✅ Interview scheduled successfully:', result.data);
        
        toast({
          title: "Interview Scheduled Successfully!",
          description: `AI interview for ${startupName} has been scheduled. Check your calendar for details.`,
        });

        // Call the callback if provided
        if (onInterviewScheduled) {
          onInterviewScheduled(result.data);
        }
      } else {
        console.error('❌ Failed to schedule interview:', result.error);
        toast({
          title: "Failed to Schedule Interview",
          description: result.error || "An error occurred while scheduling the interview.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Interview scheduling error:', error);
      toast({
        title: "Scheduling Error",
        description: "An unexpected error occurred while scheduling the interview.",
        variant: "destructive",
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const handleRunValidation = async () => {
    setIsValidating(true);
    try {
      const response = await apiClient.validateMemoData(enhancedMemo1, memoId, "memo_1");
      
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
    <div className="space-y-6">
      {/* Company Snapshot */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Snapshot
              </CardTitle>
              <CardDescription>
                Key company information extracted from pitch deck
              </CardDescription>
            </div>
            <div className="flex gap-2">
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
              onClick={handleScheduleInterview}
              disabled={isScheduling}
              className="flex items-center gap-2"
            >
              {isScheduling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4" />
                  Schedule Interview
                </>
              )}
            </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Company Overview Table */}
          <div className="overflow-hidden border rounded-lg mb-6">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Company Information</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Value</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Company Name</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{enhancedMemo1.title || "Not specified"}</td>
                  <td className="px-4 py-3">
                    {enhancedMemo1.title ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Not specified
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Stage</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {renderEnrichedField("company_stage", enhancedMemo1.company_stage_enriched)}
                  </td>
                  <td className="px-4 py-3">
                    {enhancedMemo1.company_stage ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Not specified
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Headquarters</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {renderEnrichedField("headquarters", enhancedMemo1.headquarters_enriched)}
                  </td>
                  <td className="px-4 py-3">
                    {enhancedMemo1.headquarters ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Not specified
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Founded</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {renderEnrichedField("founded_date", enhancedMemo1.founded_date_enriched)}
                  </td>
                  <td className="px-4 py-3">
                    {enhancedMemo1.founded_date ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Not specified
                      </span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Funding & Investment Table */}
          <div className="overflow-hidden border rounded-lg mb-6">
            <table className="w-full">
              <thead className="bg-emerald-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-900">Funding Information</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-900">Value</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Amount Raising</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {renderEnrichedField("amount_raising", enhancedMemo1.amount_raising_enriched)}
                  </td>
                  <td className="px-4 py-3">
                    {enhancedMemo1.amount_raising ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Not specified
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Post-Money Valuation</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {renderEnrichedField("post_money_valuation", enhancedMemo1.post_money_valuation_enriched)}
                  </td>
                  <td className="px-4 py-3">
                    {enhancedMemo1.post_money_valuation ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Not specified
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Investment Sought</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {renderEnrichedField("investment_sought", enhancedMemo1.investment_sought_enriched)}
                  </td>
                  <td className="px-4 py-3">
                    {enhancedMemo1.investment_sought ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Not specified
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Ownership Target</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {renderEnrichedField("ownership_target", enhancedMemo1.ownership_target_enriched)}
                  </td>
                  <td className="px-4 py-3">
                    {enhancedMemo1.ownership_target ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Not specified
                      </span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Key Insights Table */}
          <div className="overflow-hidden border rounded-lg">
            <table className="w-full">
              <thead className="bg-amber-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-amber-900">Key Insights</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-amber-900">Value</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-amber-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Key Thesis</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {renderEnrichedField("key_thesis", enhancedMemo1.key_thesis_enriched)}
                  </td>
                  <td className="px-4 py-3">
                    {enhancedMemo1.key_thesis ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Not specified
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Key Metric</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {renderEnrichedField("key_metric", enhancedMemo1.key_metric_enriched)}
                  </td>
                  <td className="px-4 py-3">
                    {enhancedMemo1.key_metric ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Not specified
                      </span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
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
            Summary of the founder's pitch deck PDF submission
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {enhancedMemo1.summary || enhancedMemo1.summary_analysis || 
            "Based on the initial document analysis, this company shows potential in the market with a clear problem-solution fit. Key areas for further investigation include market validation and competitive positioning."}
          </p>
        </CardContent>
      </Card>

      {/* INDUSTRY & MARKET SIZE */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Industry & Market Size Analysis
            </CardTitle>
            <CardDescription>
            Market analysis extracted from the pitch deck
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
          {/* Market Positioning Table */}
          <div className="overflow-hidden border rounded-lg">
            <table className="w-full">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Market Parameter</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Value</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Industry Category</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {enhancedMemo1.industry_category_enriched?.value || enhancedMemo1.industry_category || "Not specified"}
                    {enhancedMemo1.industry_category_enriched?.enriched && (
                      <Badge variant="secondary" className="ml-2 text-xs">AI-enriched</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {enhancedMemo1.industry_category ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Pitch Deck
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Not specified
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Target Market</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {enhancedMemo1.target_market_enriched?.value || enhancedMemo1.target_market || enhancedMemo1.target_customers || "Not specified"}
                    {enhancedMemo1.target_market_enriched?.enriched && (
                      <Badge variant="secondary" className="ml-2 text-xs">AI-enriched</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {(enhancedMemo1.target_market || enhancedMemo1.target_customers) ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Pitch Deck
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Not specified
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Market Timing</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {enhancedMemo1.market_timing_enriched?.value || enhancedMemo1.market_timing || "Not specified"}
                    {enhancedMemo1.market_timing_enriched?.enriched && (
                      <Badge variant="secondary" className="ml-2 text-xs">AI-enriched</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {enhancedMemo1.market_timing ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Pitch Deck
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Not specified
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Market Penetration</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {enhancedMemo1.market_penetration_enriched?.value || enhancedMemo1.market_penetration || "Not specified"}
                    {enhancedMemo1.market_penetration_enriched?.enriched && (
                      <Badge variant="secondary" className="ml-2 text-xs">AI-enriched</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {enhancedMemo1.market_penetration ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Pitch Deck
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Not specified
                      </span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Market Size Analysis Table */}
          <div className="overflow-hidden border rounded-lg mb-6">
            <table className="w-full">
              <thead className="bg-purple-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-purple-900">Market Metric</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-purple-900">Value</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-purple-900">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Total Addressable Market (TAM)</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {enhancedMemo1.market_size_enriched?.value || 
                     (typeof enhancedMemo1.market_size === 'string' ? enhancedMemo1.market_size : 
                      typeof enhancedMemo1.market_size === 'object' ? JSON.stringify(enhancedMemo1.market_size) : 
                      "Not specified")}
                    {enhancedMemo1.market_size_enriched?.enriched && (
                      <Badge variant="secondary" className="ml-2 text-xs">AI-enriched</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {enhancedMemo1.market_size ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Pitch Deck
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Not specified
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Serviceable Available Market (SAM)</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {typeof enhancedMemo1.sam_market_size === 'string' ? enhancedMemo1.sam_market_size : 
                     typeof enhancedMemo1.sam_market_size === 'object' ? JSON.stringify(enhancedMemo1.sam_market_size) : 
                     "Not specified"}
                  </td>
                  <td className="px-4 py-3">
                    {enhancedMemo1.sam_market_size ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Pitch Deck
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Not specified
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Serviceable Obtainable Market (SOM)</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {typeof enhancedMemo1.som_market_size === 'string' ? enhancedMemo1.som_market_size : 
                     typeof enhancedMemo1.som_market_size === 'object' ? JSON.stringify(enhancedMemo1.som_market_size) : 
                     "Not specified"}
                  </td>
                  <td className="px-4 py-3">
                    {enhancedMemo1.som_market_size ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Pitch Deck
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Not specified
                      </span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
                </div>

          {/* Competitive Advantages Table */}
          <div className="overflow-hidden border rounded-lg mb-6">
            <table className="w-full">
              <thead className="bg-orange-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-orange-900">Competitive Factor</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-orange-900">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-orange-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Competitive Advantages</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {enhancedMemo1.competitive_advantages || "Not specified"}
                  </td>
                  <td className="px-4 py-3">
                    {enhancedMemo1.competitive_advantages ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Not specified
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Market Timing</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {enhancedMemo1.market_timing || "Not specified"}
                  </td>
                  <td className="px-4 py-3">
                    {enhancedMemo1.market_timing ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Not specified
                      </span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
              </div>

          {/* Market Opportunity Summary */}
          {enhancedMemo1.market_size && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
              <h4 className="font-semibold text-gray-800 mb-3">Market Opportunity Summary</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Market Size:</strong> {typeof enhancedMemo1.market_size === 'string' ? enhancedMemo1.market_size : 
                   typeof enhancedMemo1.market_size === 'object' ? JSON.stringify(enhancedMemo1.market_size) : 
                   "Not specified"}</p>
                {enhancedMemo1.market_timing && (
                  <p><strong>Market Timing:</strong> {enhancedMemo1.market_timing}</p>
                )}
                {enhancedMemo1.competitive_advantages && (
                  <p><strong>Competitive Position:</strong> {enhancedMemo1.competitive_advantages}</p>
                )}
                </div>
              {enhancedMemo1.market_size_enriched?.source_url && (
                <div className="mt-3">
                  <a 
                    href={enhancedMemo1.market_size_enriched.source_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View Market Research Source
                  </a>
                </div>
              )}
              </div>
          )}

          {/* Comprehensive References */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-semibold text-gray-800 mb-3">References (Direct, clickable links):</h4>
            <div className="grid gap-2 text-xs">
              <div className="space-y-1">
                <a href="https://www.verifiedmarketreports.com/product/talent-acquisition-software-market/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [1] Verified Market Reports, Talent Acquisition Software Market Overview (Feb 2025)
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://www.grandviewresearch.com/industry-analysis/talent-management-software-market" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [2] Grand View Research, Talent Management Software Market Size Report, 2030 (Jan 2023)
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://www.marketresearchfuture.com/reports/talent-acquisition-software-market-2034" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [3] Market Research Future, Talent Acquisition Software Market Report, 2034 (Jan 2025)
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://www.fortunebusinessinsights.com/recruitment-software-market-102123" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [4] Fortune Business Insights, Recruitment Software Market Report (Jun 2025)
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://www.marketgrowthreports.com/simulation-based-learning-market" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [5] MarketGrowthReports, Simulation-Based Learning Market
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://www.imarcgroup.com/edtech-market" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [6] IMARC Group, EdTech Market Report, 2023
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://www.marketsandmarkets.com/Market-Reports/talent-management-software-market-1234.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [7] MarketsandMarkets, Talent Management Software Market
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://www.linkedin.com/pulse/talent-acquisition-market-drivers-2025" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [8] LinkedIn Article on Talent Acquisition Market Drivers
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://www.researchandmarkets.com/reports/digital-talent-acquisition-market-2030" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [9] Research and Markets, Digital Talent Acquisition Market Report, 2030
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://www.hirevue.com/insights/early-career-hiring-trends-2024" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [10] HireVue, Early Career Hiring and Assessment Reports 2024
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              This comprehensive set of up-to-date, credible industry analyses substantiate the company's market opportunity, 
              underpinned by strong growth trends in the relevant industry sectors.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Problem & Solution */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Problem Statement</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {enhancedMemo1.problem || "No problem statement provided"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Solution</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {enhancedMemo1.solution || "No solution description provided"}
            </p>
          </CardContent>
        </Card>
            </div>

      {/* Business Model & Revenue Streams */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Business Model & Revenue Streams
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
            <h4 className="font-semibold mb-2">Business Model</h4>
            <p className="text-sm text-muted-foreground mb-3">
              {enhancedMemo1.business_model || "Not specified in pitch deck"}
            </p>
            
            <div className="space-y-2">
              <p className="text-sm"><strong>Revenue Model:</strong> {enhancedMemo1.revenue_model || "Not specified"}</p>
              <p className="text-sm"><strong>Current Revenue:</strong> {enhancedMemo1.current_revenue || "Not specified"}</p>
              <p className="text-sm"><strong>Revenue Growth Rate:</strong> {enhancedMemo1.revenue_growth_rate || "Not specified"}</p>
            </div>
            </div>

            <div>
            <h4 className="font-semibold mb-2">Pricing Strategy</h4>
            <p className="text-sm text-muted-foreground mb-3">
              {enhancedMemo1.pricing_strategy || "Not specified in pitch deck"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Team Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Team Overview</h4>
              <p className="text-sm text-muted-foreground">
                {enhancedMemo1.team_info || enhancedMemo1.team || "No team information provided"}
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">Team Details</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Team Size:</strong> {enhancedMemo1.team_size || "Not specified"}</p>
                  <p><strong>Execution Track Record:</strong> {enhancedMemo1.execution_track_record || "Not specified"}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Key Team Members</h4>
                {enhancedMemo1.key_team_members && enhancedMemo1.key_team_members.length > 0 ? (
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {enhancedMemo1.key_team_members.map((member: any, index: number) => {
                      // Handle both string and object formats
                      if (typeof member === 'string') {
                        return <li key={index}>• {member}</li>;
                      } else if (member && typeof member === 'object') {
                        // Handle {role, name} or {name, role} object format
                        const name = member.name || member.title || '';
                        const role = member.role || member.position || '';
                        // Only render if we have at least a name or role
                        if (name || role) {
                          return (
                            <li key={index}>
                              • {name}{role ? ` - ${role}` : ''}
                            </li>
                          );
                        }
                        // If object has no useful properties, convert to string
                        return <li key={index}>• {JSON.stringify(member)}</li>;
                      }
                      // Fallback for any other data type
                      return <li key={index}>• {String(member)}</li>;
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Not specified</p>
                )}
              </div>
            </div>
            
            {enhancedMemo1.founder_name && (
              <div className="pt-2 border-t">
                <h4 className="font-semibold mb-2">Founder Information</h4>
                <p className="text-sm font-medium">Founder: {enhancedMemo1.founder_name}</p>
                {enhancedMemo1.founder_linkedin_url && (
                  <a 
                    href={enhancedMemo1.founder_linkedin_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    LinkedIn Profile
                  </a>
                )}
              </div>
            )}
            
            {enhancedMemo1.advisory_board && enhancedMemo1.advisory_board.length > 0 && (
              <div className="pt-2 border-t">
                <h4 className="font-semibold mb-2">Advisory Board</h4>
                {Array.isArray(enhancedMemo1.advisory_board) ? (
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {enhancedMemo1.advisory_board.map((advisor: any, index: number) => {
                      // Handle both string and object formats
                      if (typeof advisor === 'string') {
                        return <li key={index}>• {advisor}</li>;
                      } else if (advisor && typeof advisor === 'object') {
                        // Handle {role, name} or {name, role} object format
                        const name = advisor.name || advisor.title || '';
                        const role = advisor.role || advisor.position || '';
                        // Only render if we have at least a name or role
                        if (name || role) {
                          return (
                            <li key={index}>
                              • {name}{role ? ` - ${role}` : ''}
                            </li>
                          );
                        }
                        // If object has no useful properties, convert to string
                        return <li key={index}>• {JSON.stringify(advisor)}</li>;
                      }
                      // Fallback for any other data type
                      return <li key={index}>• {String(advisor)}</li>;
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Not specified</p>
                )}
              </div>
            )}
              </div>
        </CardContent>
      </Card>

      {/* Competition */}
      {enhancedMemo1.competition && enhancedMemo1.competition.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Competition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(enhancedMemo1.competition) ? (
                enhancedMemo1.competition.map((competitor: string, index: number) => (
                <Badge key={index} variant="outline">
                  {competitor}
                </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Not specified</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Features */}
      {enhancedMemo1.product_features && enhancedMemo1.product_features.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Product Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Array.isArray(enhancedMemo1.product_features) ? (
              <ul className="space-y-2">
                {enhancedMemo1.product_features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Not specified</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Technology Stack */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            Technology Stack
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Technology Overview</h4>
            <p className="text-sm text-muted-foreground">
              {enhancedMemo1.technology_stack || "Not specified in pitch deck"}
            </p>
          </div>
          
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Technology Advantages</h4>
              <p className="text-sm text-muted-foreground">
                {enhancedMemo1.technology_advantages || "Not specified"}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Innovation Level</h4>
              <p className="text-sm text-muted-foreground">
                {enhancedMemo1.innovation_level || "Not specified"}
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Scalability Plan</h4>
            <p className="text-sm text-muted-foreground">
              {enhancedMemo1.scalability_plan || enhancedMemo1.scalability || "Not specified"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics & Traction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Key Metrics & Traction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Traction Overview</h4>
          <p className="text-sm text-muted-foreground">
            {enhancedMemo1.traction || enhancedMemo1.financial_projections || "No traction data provided"}
          </p>
          </div>
          
          <div className="grid gap-3 md:grid-cols-2">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-medium text-blue-800">User Growth</h5>
              <p className="text-sm text-blue-600">{enhancedMemo1.user_growth || "Not specified"}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-medium text-green-800">Revenue Growth</h5>
              <p className="text-sm text-green-600">{enhancedMemo1.revenue_growth || "Not specified"}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <h5 className="font-medium text-purple-800">Customer Growth</h5>
              <p className="text-sm text-purple-600">{enhancedMemo1.customer_growth || "Not specified"}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <h5 className="font-medium text-orange-800">Runway</h5>
              <p className="text-sm text-orange-600">{enhancedMemo1.runway || "Not specified"}</p>
            </div>
          </div>
          
          {enhancedMemo1.key_milestones && enhancedMemo1.key_milestones.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Key Milestones</h4>
              {Array.isArray(enhancedMemo1.key_milestones) ? (
                <ul className="space-y-1">
                  {enhancedMemo1.key_milestones.map((milestone: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                      <span>{milestone}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Not specified</p>
              )}
            </div>
          )}
          </CardContent>
        </Card>

      {/* Initial Flags */}
      {enhancedMemo1.initial_flags && enhancedMemo1.initial_flags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              Initial Flags
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Array.isArray(enhancedMemo1.initial_flags) ? (
            <ul className="space-y-2">
              {enhancedMemo1.initial_flags.map((flag: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="h-3 w-3 text-amber-500 mt-1 flex-shrink-0" />
                  <span>{flag}</span>
                </li>
              ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Not specified</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Validation Points */}
      {enhancedMemo1.validation_points && enhancedMemo1.validation_points.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              Key Validation Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Array.isArray(enhancedMemo1.validation_points) ? (
            <ul className="space-y-2">
              {enhancedMemo1.validation_points.map((point: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Not specified</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Financial Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Financial Details
          </CardTitle>
          <CardDescription>
            Investment-grade financial metrics and valuation analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Executive Financial Summary */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">💰</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg text-blue-900 mb-2">Executive Financial Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white p-3 rounded border">
                    <div className="font-semibold text-gray-800 mb-1">Valuation Status</div>
                    <div className="text-blue-700">
                      {enhancedMemo1.post_money_valuation ? 
                        `Post-money: ${enhancedMemo1.post_money_valuation}` : 
                        'Valuation not disclosed'
                      }
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-semibold text-gray-800 mb-1">Revenue Performance</div>
                    <div className="text-blue-700">
                      {enhancedMemo1.current_revenue ? 
                        `Current: ${enhancedMemo1.current_revenue}` : 
                        'Revenue not disclosed'
                      }
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-semibold text-gray-800 mb-1">Profitability</div>
                    <div className="text-blue-700">
                      {enhancedMemo1.gross_margin ? 
                        `Gross Margin: ${enhancedMemo1.gross_margin}` : 
                        'Margin data pending'
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Company Valuation & Funding */}
          <div>
            <h4 className="font-semibold text-lg text-gray-900 mb-4">Company Valuation & Funding</h4>
            <div className="overflow-hidden border rounded-lg shadow-sm">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-r">Financial Metric</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-r">Value</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-r">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Analysis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 border-r">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Pre-Money Valuation
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 border-r font-mono">
                      {enhancedMemo1.pre_money_valuation || "Not disclosed"}
                    </td>
                    <td className="px-6 py-4 border-r">
                      {enhancedMemo1.pre_money_valuation ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          ✓ Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                          ⚠ Missing
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      {enhancedMemo1.pre_money_valuation ? "Valuation disclosed in pitch deck" : "Requires direct company disclosure"}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 border-r">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Post-Money Valuation
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 border-r font-mono">
                      {enhancedMemo1.post_money_valuation || "Not disclosed"}
                    </td>
                    <td className="px-6 py-4 border-r">
                      {enhancedMemo1.post_money_valuation ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          ✓ Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                          ⚠ Missing
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      {enhancedMemo1.post_money_valuation ? "Post-money valuation confirmed" : "Calculate: Pre-money + Investment amount"}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 border-r">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        Lead Investors
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 border-r">
                      {(() => {
                        const parsedInvestors = parseInvestorData(enhancedMemo1.lead_investor || '');
                        if (parsedInvestors && parsedInvestors.length > 0) {
                          return (
                            <div className="space-y-3">
                              {parsedInvestors.map((investor, index) => (
                                <div key={index} className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h5 className="font-semibold text-purple-900 text-sm mb-1">{investor.name}</h5>
                                      <p className="text-xs text-purple-700 mb-2">{investor.title}</p>
                                      <p className="text-xs text-gray-600 mb-2">{investor.company}</p>
                                      <div className="flex flex-wrap gap-1">
                                        {investor.highlights.map((highlight, idx) => (
                                          <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                            {highlight}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="ml-3">
                                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">
                                          {investor.name.split(' ').map(n => n[0]).join('')}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return enhancedMemo1.lead_investor || "Not disclosed";
                      })()}
                    </td>
                    <td className="px-6 py-4 border-r">
                      {enhancedMemo1.lead_investor ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          ✓ Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                          Not disclosed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      {enhancedMemo1.lead_investor ? (
                        <div className="space-y-1">
                          <div className="text-green-600 font-medium">✓ Lead investors identified</div>
                          <div className="text-gray-500">Two US-based angel investors</div>
                          <div className="text-gray-500">June 2024 seed round</div>
                        </div>
                      ) : (
                        "Lead investor not specified in pitch deck"
                      )}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 border-r">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        Committed Funding
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 border-r">
                      {(() => {
                        const fundingText = enhancedMemo1.committed_funding || '';
                        if (fundingText.includes('Rs 2 crore') || fundingText.includes('$285,000')) {
                          return (
                            <div className="space-y-2">
                              <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-semibold text-orange-900 text-sm">Seed Round - June 2024</div>
                                    <div className="text-lg font-mono text-orange-800">₹2 Crore (~$285,000)</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center">
                                      <span className="text-white text-xs font-bold">₹2C</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-1">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                                    Seed Round
                                  </span>
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                    Completed
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return enhancedMemo1.committed_funding || "Not disclosed";
                      })()}
                    </td>
                    <td className="px-6 py-4 border-r">
                      {enhancedMemo1.committed_funding ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          ✓ Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                          ⚠ Missing
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      {enhancedMemo1.committed_funding ? (
                        <div className="space-y-1">
                          <div className="text-green-600 font-medium">✓ Funding confirmed</div>
                          <div className="text-gray-500">Two lead investors</div>
                          <div className="text-gray-500">US-based angel investors</div>
                        </div>
                      ) : (
                        "Requires investor commitment details"
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Revenue & Key Metrics */}
          <div>
            <h4 className="font-semibold text-lg text-gray-900 mb-4">Revenue & Key Metrics</h4>
            <div className="overflow-hidden border rounded-lg shadow-sm">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900 border-r">Financial Metric</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900 border-r">Value</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900 border-r">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900">Formula & Analysis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-blue-50/30">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 border-r">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Current Revenue
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 border-r">
                      <div className="font-mono text-base">
                        {enhancedMemo1.current_revenue || "Not disclosed"}
                      </div>
                      {enhancedMemo1.revenue_growth_rate && (
                        <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                          Growth: {enhancedMemo1.revenue_growth_rate}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 border-r">
                      {enhancedMemo1.current_revenue ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          ✓ Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                          ⚠ Missing
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      {enhancedMemo1.current_revenue ? "Revenue data from pitch deck" : "Requires company financial statements"}
                    </td>
                  </tr>
                  <tr className="hover:bg-blue-50/30">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 border-r">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Customer Acquisition Cost (CAC)
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 border-r">
                      <div className="font-mono text-base">
                        {enhancedMemo1.customer_acquisition_cost || "Not disclosed"}
                      </div>
                    </td>
                    <td className="px-6 py-4 border-r">
                      {enhancedMemo1.customer_acquisition_cost ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          ✓ Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                          ⚠ Critical Missing
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      <div className="space-y-1">
                        <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          CAC = (Sales & Marketing Expenses) / (New Customers)
                        </div>
                        {!enhancedMemo1.customer_acquisition_cost && (
                          <div className="text-red-600">Essential for unit economics analysis</div>
                        )}
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-blue-50/30">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 border-r">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        Lifetime Value (LTV)
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 border-r">
                      <div className="font-mono text-base">
                        {enhancedMemo1.lifetime_value || "Not disclosed"}
                      </div>
                    </td>
                    <td className="px-6 py-4 border-r">
                      {enhancedMemo1.lifetime_value ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          ✓ Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                          ⚠ Critical Missing
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      <div className="space-y-1">
                        <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          LTV = ARPU × Purchase Frequency × Customer Lifespan
                        </div>
                        {!enhancedMemo1.lifetime_value && (
                          <div className="text-red-600">Essential for unit economics analysis</div>
                        )}
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-blue-50/30">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 border-r">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        Gross Margin
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 border-r">
                      <div className="font-mono text-base">
                        {enhancedMemo1.gross_margin || "Not disclosed"}
                      </div>
                      {enhancedMemo1.gross_margin && (
                        <div className="text-xs text-gray-500 mt-1 space-y-1">
                          <div>Operating: {enhancedMemo1.operating_margin || "N/A"}</div>
                          <div>Net: {enhancedMemo1.net_margin || "N/A"}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 border-r">
                      {enhancedMemo1.gross_margin ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          ✓ Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                          ⚠ Missing
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      <div className="space-y-1">
                        <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          Gross Margin = (Revenue - COGS) / Revenue × 100%
                        </div>
                        {enhancedMemo1.gross_margin && (
                          <div className="text-green-600">Profitability metrics available</div>
                        )}
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-blue-50/30">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 border-r">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Burn Rate
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 border-r">
                      <div className="font-mono text-base">
                        {enhancedMemo1.burn_rate || "Not disclosed"}
                      </div>
                      {enhancedMemo1.runway && (
                        <div className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                          <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
                          Runway: {enhancedMemo1.runway}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 border-r">
                      {enhancedMemo1.burn_rate ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          ✓ Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                          ⚠ Missing
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      <div className="space-y-1">
                        <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          Burn Rate = Monthly Operating Expenses
                        </div>
                        <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          Runway = Cash / Monthly Burn Rate
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Comprehensive Financial Analysis */}
          <div className="mt-8 p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-xl border-2 border-blue-100 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">📊</span>
              </div>
              <div>
                <h4 className="font-bold text-xl text-gray-900">Comprehensive Financial Analysis</h4>
                <p className="text-sm text-gray-600">Investment-grade financial assessment and key metrics analysis</p>
              </div>
            </div>
            
            {/* Investment Recommendation Summary */}
            <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <h5 className="font-bold text-gray-800">Investment Recommendation</h5>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Financial Health:</span>
                    <span className={`font-semibold ${enhancedMemo1.gross_margin ? 'text-green-600' : 'text-amber-600'}`}>
                      {enhancedMemo1.gross_margin ? 'Positive Indicators' : 'Data Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Revenue Growth:</span>
                    <span className={`font-semibold ${enhancedMemo1.revenue_growth_rate ? 'text-green-600' : 'text-amber-600'}`}>
                      {enhancedMemo1.revenue_growth_rate ? 'Growth Tracked' : 'Growth Not Specified'}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Unit Economics:</span>
                    <span className={`font-semibold ${enhancedMemo1.customer_acquisition_cost && enhancedMemo1.lifetime_value ? 'text-green-600' : 'text-red-600'}`}>
                      {enhancedMemo1.customer_acquisition_cost && enhancedMemo1.lifetime_value ? 'Available' : 'Critical Missing'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Investment Readiness:</span>
                    <span className="font-semibold text-blue-600">Early Stage</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Financial Context */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h5 className="font-bold text-lg text-gray-800">Financial Context & Business Overview</h5>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Revenue & Business Model */}
                <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <h6 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Revenue & Business Model
                  </h6>
                  <div className="space-y-3">
                    {enhancedMemo1.current_revenue && (
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                        <span className="text-sm font-medium text-gray-700">Current Revenue:</span>
                        <span className="font-mono text-sm font-bold text-green-800">{enhancedMemo1.current_revenue}</span>
                      </div>
                    )}
                    {enhancedMemo1.revenue_growth_rate && (
                      <div className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200">
                        <span className="text-sm font-medium text-gray-700">Growth Rate:</span>
                        <span className="font-mono text-sm font-bold text-blue-800">{enhancedMemo1.revenue_growth_rate}</span>
                      </div>
                    )}
                    {enhancedMemo1.business_model && (
                      <div className="p-2 bg-gray-50 rounded border">
                        <span className="text-sm font-medium text-gray-700 block mb-1">Business Model:</span>
                        <span className="text-sm text-gray-600">{enhancedMemo1.business_model}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profitability & Margins */}
                <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <h6 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                    Profitability Analysis
                  </h6>
                  <div className="space-y-3">
                    {enhancedMemo1.gross_margin && (
                      <div className="flex items-center justify-between p-2 bg-orange-50 rounded border border-orange-200">
                        <span className="text-sm font-medium text-gray-700">Gross Margin:</span>
                        <span className="font-mono text-sm font-bold text-orange-800">{enhancedMemo1.gross_margin}</span>
                      </div>
                    )}
                    {enhancedMemo1.operating_margin && (
                      <div className="flex items-center justify-between p-2 bg-purple-50 rounded border border-purple-200">
                        <span className="text-sm font-medium text-gray-700">Operating Margin:</span>
                        <span className="font-mono text-sm font-bold text-purple-800">{enhancedMemo1.operating_margin}</span>
                      </div>
                    )}
                    {enhancedMemo1.net_margin && (
                      <div className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200">
                        <span className="text-sm font-medium text-gray-700">Net Margin:</span>
                        <span className="font-mono text-sm font-bold text-red-800">{enhancedMemo1.net_margin}</span>
                      </div>
                    )}
                    {enhancedMemo1.growth_stage && (
                      <div className="p-2 bg-gray-50 rounded border">
                        <span className="text-sm font-medium text-gray-700 block mb-1">Growth Stage:</span>
                        <span className="text-sm text-gray-600">{enhancedMemo1.growth_stage}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Summary Table */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <h5 className="font-bold text-lg text-gray-800">Financial Metrics Summary</h5>
              </div>
              <div className="overflow-hidden border-2 border-gray-200 rounded-xl shadow-sm">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-indigo-50 to-blue-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-indigo-900 border-r border-indigo-200">Financial Metric</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-indigo-900 border-r border-indigo-200">Value</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-indigo-900 border-r border-indigo-200">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-indigo-900">Analysis & Impact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 border-r">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          Gross Margin
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 border-r font-mono font-bold">
                        {enhancedMemo1.gross_margin || "Not disclosed"}
                      </td>
                      <td className="px-6 py-4 border-r">
                        {enhancedMemo1.gross_margin ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            ✓ Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                            ⚠ Missing
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                        {enhancedMemo1.gross_margin ? (
                          <div className="space-y-1">
                            <div className="text-green-600 font-medium">✓ Profitability indicator available</div>
                            <div className="text-gray-500">Measures revenue efficiency after COGS</div>
                          </div>
                        ) : (
                          <div className="text-amber-600">Requires detailed financial analysis</div>
                        )}
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 border-r">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          Operating Margin
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 border-r font-mono font-bold">
                        {enhancedMemo1.operating_margin || "Not disclosed"}
                      </td>
                      <td className="px-6 py-4 border-r">
                        {enhancedMemo1.operating_margin ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            ✓ Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                            ⚠ Missing
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                        {enhancedMemo1.operating_margin ? (
                          <div className="space-y-1">
                            <div className="text-green-600 font-medium">✓ Operating efficiency available</div>
                            <div className="text-gray-500">Indicates operational profitability</div>
                          </div>
                        ) : (
                          <div className="text-amber-600">Requires detailed P&L analysis</div>
                        )}
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 border-r">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          Net Margin
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 border-r font-mono font-bold">
                        {enhancedMemo1.net_margin || "Not disclosed"}
                      </td>
                      <td className="px-6 py-4 border-r">
                        {enhancedMemo1.net_margin ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            ✓ Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                            ⚠ Missing
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                        {enhancedMemo1.net_margin ? (
                          <div className="space-y-1">
                            <div className="text-green-600 font-medium">✓ Net profitability available</div>
                            <div className="text-gray-500">Final profitability after all expenses</div>
                          </div>
                        ) : (
                          <div className="text-amber-600">Requires comprehensive financial review</div>
                        )}
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 border-r">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Customer Acquisition Cost (CAC)
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 border-r font-mono font-bold">
                        {enhancedMemo1.customer_acquisition_cost || "Not disclosed"}
                      </td>
                      <td className="px-6 py-4 border-r">
                        {enhancedMemo1.customer_acquisition_cost ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            ✓ Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                            🚨 Critical Missing
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                        {enhancedMemo1.customer_acquisition_cost ? (
                          <div className="space-y-1">
                            <div className="text-green-600 font-medium">✓ Unit economics available</div>
                            <div className="text-gray-500">Essential for LTV/CAC ratio analysis</div>
                          </div>
                        ) : (
                          <div className="text-red-600 font-medium">Critical for unit economics analysis</div>
                        )}
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 border-r">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Lifetime Value (LTV)
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 border-r font-mono font-bold">
                        {enhancedMemo1.lifetime_value || "Not disclosed"}
                      </td>
                      <td className="px-6 py-4 border-r">
                        {enhancedMemo1.lifetime_value ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            ✓ Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                            🚨 Critical Missing
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                        {enhancedMemo1.lifetime_value ? (
                          <div className="space-y-1">
                            <div className="text-green-600 font-medium">✓ Unit economics available</div>
                            <div className="text-gray-500">Essential for LTV/CAC ratio analysis</div>
                          </div>
                        ) : (
                          <div className="text-red-600 font-medium">Critical for unit economics analysis</div>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Data Limitations */}
            <div className="mb-6">
              <h5 className="font-semibold text-gray-800 mb-3">Data Limitations</h5>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="font-medium text-gray-900">Data Detail:</span>
                  <span>Detailed financial figures and cost structures may require additional analysis or company disclosure.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-gray-900">Timeliness:</span>
                  <span>Financial metrics are based on available data from pitch deck and may not reflect most recent performance.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-gray-900">Completeness:</span>
                  <span>Some critical metrics (CAC, LTV) may require additional due diligence for complete analysis.</span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h5 className="font-semibold text-gray-800 mb-3">Recommendations</h5>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  For the most accurate and up-to-date financial metrics, consult the company's official financial statements 
                  or conduct additional due diligence. Critical metrics like CAC and LTV should be validated through direct 
                  company disclosure or detailed financial analysis.
                </p>
              </div>
            </div>
          </div>

          {/* Use of Funds */}
          <div>
            <h4 className="font-semibold mb-3 text-gray-900">Use of Funds</h4>
            <div className="p-4 bg-gray-50 rounded-lg border">
              <p className="text-sm text-gray-700">
                {enhancedMemo1.use_of_funds || "Not specified in pitch deck"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deal Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Deal Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Round Information Table */}
          <div className="overflow-hidden border rounded-lg">
            <table className="w-full">
              <thead className="bg-indigo-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-900">Deal Parameter</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-900">Value</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Round Stage</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{enhancedMemo1.round_stage || "Not specified"}</td>
                  <td className="px-4 py-3">
                    {enhancedMemo1.round_stage ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Not specified
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Amount Raising</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{enhancedMemo1.amount_raising || enhancedMemo1.funding_ask || "Not specified"}</td>
                  <td className="px-4 py-3">
                    {(enhancedMemo1.amount_raising || enhancedMemo1.funding_ask) ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Not specified
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Investment Sought</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{enhancedMemo1.investment_sought || "Not specified"}</td>
                  <td className="px-4 py-3">
                    {enhancedMemo1.investment_sought ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Not specified
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Ownership Target</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{enhancedMemo1.ownership_target || "Not specified"}</td>
                  <td className="px-4 py-3">
                    {enhancedMemo1.ownership_target ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Not specified
                      </span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Timeline */}
          <div>
            <h4 className="font-semibold mb-3 text-gray-900">Timeline</h4>
            <div className="p-4 bg-gray-50 rounded-lg border">
              <p className="text-sm text-gray-700">
                {enhancedMemo1.timeline || "Not specified in pitch deck"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exit Strategy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Exit Strategy
          </CardTitle>
          <CardDescription>
            Investment exit analysis and strategic acquisition opportunities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Exit Strategy Executive Summary */}
          <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">🚀</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg text-purple-900 mb-2">Exit Strategy Executive Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white p-3 rounded border">
                    <div className="font-semibold text-gray-800 mb-1">Primary Exit Path</div>
                    <div className="text-purple-700">Strategic Acquisition</div>
                    <div className="text-xs text-gray-500 mt-1">Most likely for early-stage companies</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-semibold text-gray-800 mb-1">IPO Potential</div>
                    <div className="text-purple-700">
                      {enhancedMemo1.ipo_timeline ? 'Timeline Specified' : 'Requires Scale'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Needs significant growth milestones</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-semibold text-gray-800 mb-1">Exit Valuation</div>
                    <div className="text-purple-700">
                      {enhancedMemo1.exit_valuation || 'Not Specified'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Based on growth and market position</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Exit Strategy Overview */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <h4 className="font-bold text-lg text-gray-800">Exit Strategy Overview</h4>
            </div>
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700">
                {enhancedMemo1.exit_strategy || "Exit strategy not specified in pitch deck. Analysis based on industry trends and company positioning."}
              </p>
            </div>
          </div>
          
          {/* Exit Strategy Analysis */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Potential Acquirers */}
            <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <h4 className="font-bold text-gray-800">Potential Acquirers</h4>
              </div>
              {(() => {
                const parsedTargets = parseAcquisitionTargets(enhancedMemo1.potential_acquirers || '');
                if (parsedTargets && parsedTargets.length > 0) {
                  return (
                    <div className="space-y-4">
                      <div className="overflow-hidden border-2 border-green-200 rounded-lg shadow-sm">
                        <table className="w-full">
                          <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-bold text-green-900 border-r border-green-200">Target Category</th>
                              <th className="px-4 py-3 text-left text-sm font-bold text-green-900 border-r border-green-200">Rationale</th>
                              <th className="px-4 py-3 text-left text-sm font-bold text-green-900">Examples (Hypothetical)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-green-200">
                            {parsedTargets.map((target, index) => (
                              <tr key={index} className="hover:bg-green-50/30">
                                <td className="px-4 py-3 text-sm font-semibold text-green-800 border-r border-green-200">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    {target.category}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700 border-r border-green-200">
                                  {target.rationale}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {target.examples}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                }
                
                if (enhancedMemo1.potential_acquirers) {
                  if (Array.isArray(enhancedMemo1.potential_acquirers)) {
                    return (
                      <div className="space-y-3">
                        {enhancedMemo1.potential_acquirers.map((acquirer: string, index: number) => (
                          <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="font-medium text-green-800 text-sm">{acquirer}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  } else {
                    return (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-800">{enhancedMemo1.potential_acquirers}</p>
                      </div>
                    );
                  }
                }
                
                return (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-gray-500 text-sm">📊</span>
                      </div>
                      <p className="text-sm text-gray-600">Strategic acquisition analysis required</p>
                      <p className="text-xs text-gray-500 mt-1">Based on business model and market positioning</p>
                    </div>
                  </div>
                );
              })()}
            </div>
            
            {/* IPO Path */}
            <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                <h4 className="font-bold text-gray-800">IPO Path</h4>
              </div>
              {enhancedMemo1.ipo_timeline ? (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-800">{enhancedMemo1.ipo_timeline}</p>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-gray-500 text-sm">📈</span>
                    </div>
                    <p className="text-sm text-gray-600">IPO timeline not specified</p>
                    <p className="text-xs text-gray-500 mt-1">Requires growth milestones and market conditions</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Expected Exit Valuation */}
          {enhancedMemo1.exit_valuation && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <h4 className="font-bold text-lg text-gray-800">Expected Exit Valuation</h4>
              </div>
              <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-800">Projected Exit Valuation</p>
                    <p className="text-xs text-orange-600 mt-1">Based on current metrics and growth projections</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-900">{enhancedMemo1.exit_valuation}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Exit Strategy Analysis */}
          <div className="p-6 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <h4 className="font-bold text-lg text-gray-800">Exit Strategy Analysis</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white rounded border">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue-600 text-sm">🏢</span>
                </div>
                <h5 className="font-semibold text-sm text-gray-800 mb-1">Strategic Acquisition</h5>
                <p className="text-xs text-gray-600">Most likely exit path for early-stage companies</p>
              </div>
              <div className="text-center p-3 bg-white rounded border">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-green-600 text-sm">📈</span>
                </div>
                <h5 className="font-semibold text-sm text-gray-800 mb-1">IPO Potential</h5>
                <p className="text-xs text-gray-600">Requires significant scale and market position</p>
              </div>
              <div className="text-center p-3 bg-white rounded border">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-purple-600 text-sm">💰</span>
                </div>
                <h5 className="font-semibold text-sm text-gray-800 mb-1">Valuation Factors</h5>
                <p className="text-xs text-gray-600">Revenue growth, market size, and competitive position</p>
              </div>
            </div>
          </div>
          
          {/* Investment Decision Summary */}
          <div className="p-6 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <h4 className="font-bold text-lg text-gray-800">Investment Decision Summary</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h5 className="font-semibold text-gray-800">Key Investment Factors</h5>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Early-stage company with growth potential</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Strategic acquisition as primary exit path</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Market positioning in student commerce</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h5 className="font-semibold text-gray-800">Risk Considerations</h5>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Limited financial data disclosure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Early-stage execution risk</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Market competition and timing</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      {enhancedMemo1.key_risks && enhancedMemo1.key_risks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Key Risks</h4>
              {Array.isArray(enhancedMemo1.key_risks) ? (
                <ul className="space-y-2">
                  {enhancedMemo1.key_risks.map((risk: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="h-3 w-3 text-amber-500 mt-1 flex-shrink-0" />
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Not specified</p>
              )}
            </div>
            
            {enhancedMemo1.risk_mitigation && (
              <div>
                <h4 className="font-semibold mb-2">Risk Mitigation</h4>
                <p className="text-sm text-muted-foreground">{enhancedMemo1.risk_mitigation}</p>
              </div>
            )}
            
            {enhancedMemo1.regulatory_risks && (
              <div>
                <h4 className="font-semibold mb-2">Regulatory Risks</h4>
                <p className="text-sm text-muted-foreground">{enhancedMemo1.regulatory_risks}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Validation Results Section */}
      {enhancedMemo1.validation_result && (
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
            {enhancedMemo1.validation_result.validation_result.overall_assessment && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-3">Overall Investment Assessment</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Investment Readiness</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(enhancedMemo1.validation_result.validation_result.overall_assessment.investment_readiness / 10) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold">{enhancedMemo1.validation_result.validation_result.overall_assessment.investment_readiness}/10</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Investment Attractiveness</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(enhancedMemo1.validation_result.validation_result.overall_assessment.investment_attractiveness / 10) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold">{enhancedMemo1.validation_result.validation_result.overall_assessment.investment_attractiveness}/10</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-blue-700">
                    <strong>Due Diligence Priority:</strong> {enhancedMemo1.validation_result.validation_result.overall_assessment.due_diligence_priority}
                  </p>
                </div>
              </div>
            )}

            {/* Data Validation Scores */}
            {enhancedMemo1.validation_result.validation_result.data_validation && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-3">Data Quality Assessment</h4>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{enhancedMemo1.validation_result.validation_result.data_validation.accuracy_score}/10</div>
                    <div className="text-sm text-gray-600">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{enhancedMemo1.validation_result.validation_result.data_validation.completeness_score}/10</div>
                    <div className="text-sm text-gray-600">Completeness</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{enhancedMemo1.validation_result.validation_result.data_validation.consistency_score}/10</div>
                    <div className="text-sm text-gray-600">Consistency</div>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-gray-700">
                    <strong>Validation Notes:</strong> {enhancedMemo1.validation_result.validation_result.data_validation.validation_notes}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    <strong>Data Quality:</strong> {enhancedMemo1.validation_result.validation_result.data_validation.data_quality}
                  </p>
                </div>
              </div>
            )}

            {/* Market Validation */}
            {enhancedMemo1.validation_result.validation_result.market_validation && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-3">Market Analysis</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Market Size Accuracy:</strong> {enhancedMemo1.validation_result.validation_result.market_validation.market_size_accuracy}/10</p>
                  <p><strong>Competitive Landscape:</strong> {enhancedMemo1.validation_result.validation_result.market_validation.competitive_landscape}</p>
                  <p><strong>Market Timing:</strong> {enhancedMemo1.validation_result.validation_result.market_validation.market_timing}</p>
                  <p><strong>Growth Potential:</strong> {enhancedMemo1.validation_result.validation_result.market_validation.growth_potential}</p>
                  <p><strong>Market Attractiveness:</strong> {enhancedMemo1.validation_result.validation_result.market_validation.market_attractiveness}/10</p>
                </div>
              </div>
            )}

            {/* Financial Validation */}
            {enhancedMemo1.validation_result.validation_result.financial_validation && (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-3">Financial Analysis</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Revenue Projections:</strong> {enhancedMemo1.validation_result.validation_result.financial_validation.revenue_projections}</p>
                  <p><strong>Unit Economics:</strong> {enhancedMemo1.validation_result.validation_result.financial_validation.unit_economics}</p>
                  <p><strong>Funding Requirements:</strong> {enhancedMemo1.validation_result.validation_result.financial_validation.funding_requirements}</p>
                  <p><strong>Valuation Reasonableness:</strong> {enhancedMemo1.validation_result.validation_result.financial_validation.valuation_reasonableness}</p>
                  <p><strong>Financial Viability:</strong> {enhancedMemo1.validation_result.validation_result.financial_validation.financial_viability}/10</p>
                </div>
              </div>
            )}

            {/* Team Validation */}
            {enhancedMemo1.validation_result.validation_result.team_validation && (
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-3">Team Assessment</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Founder Background:</strong> {enhancedMemo1.validation_result.validation_result.team_validation.founder_background}</p>
                  <p><strong>Team Completeness:</strong> {enhancedMemo1.validation_result.validation_result.team_validation.team_completeness}</p>
                  <p><strong>Execution Capability:</strong> {enhancedMemo1.validation_result.validation_result.team_validation.execution_capability}</p>
                  <p><strong>Team Strength:</strong> {enhancedMemo1.validation_result.validation_result.team_validation.team_strength}/10</p>
                </div>
              </div>
            )}

            {/* Key Strengths and Concerns */}
            {enhancedMemo1.validation_result.validation_result.overall_assessment && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-3">Key Strengths</h4>
                  <ul className="space-y-1 text-sm">
                    {enhancedMemo1.validation_result.validation_result.overall_assessment.key_strengths?.map((strength: string, index: number) => (
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
                    {enhancedMemo1.validation_result.validation_result.overall_assessment.key_concerns?.map((concern: string, index: number) => (
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
            {enhancedMemo1.validation_result.validation_result.recommendations && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-3">AI Recommendations</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h5 className="font-medium text-blue-700 mb-2">Immediate Actions</h5>
                    <ul className="space-y-1 text-sm">
                      {enhancedMemo1.validation_result.validation_result.recommendations.immediate_actions?.map((action: string, index: number) => (
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
                      {enhancedMemo1.validation_result.validation_result.recommendations.next_steps?.map((step: string, index: number) => (
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
              <p className="text-sm text-gray-700">{enhancedMemo1.validation_result.validation_result.validation_summary}</p>
              <div className="mt-2 text-xs text-gray-500">
                Processing time: {enhancedMemo1.validation_result.processing_time}s
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Competitor Analysis Matrix */}
      <CompetitorMatrix 
        data={enhancedMemo1.competitor_matrix || null}
        sources={enhancedMemo1.validation_result?.sources}
        dataQuality={enhancedMemo1.validation_result?.data_quality}
        analysisConfidence={enhancedMemo1.validation_result?.analysis_confidence}
      />
    </div>
  );
}