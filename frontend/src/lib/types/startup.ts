// Startup data interfaces for admin dashboard

export interface Startup {
  id: string;
  companyName: string;
  founderName: string;
  founderEmail: string;
  founderLinkedIn?: string;
  stage: 'Pre-Seed' | 'Seed' | 'Series A' | 'Series B';
  sector: string[];
  fundingAsk: string;
  valuation?: string;
  status: 'Intake' | 'Memo 1' | 'Memo 2' | 'Memo 3' | 'Sent';
  aiScore?: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  lastUpdated: string;
  createdAt: string;
  
  // Memo data
  memo_1?: MemoOneData;
  memo_2?: MemoTwoData;
  memo_3?: MemoThreeData;
  
  // Additional fields
  website?: string;
  teamSize?: number;
  headquarters?: string;
  foundedYear?: string;
  pitchDeckUrl?: string;
}

export interface MemoOneData {
  title?: string;
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
}

export interface MemoTwoData {
  // Similar structure to MemoOneData but for due diligence
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
}

export interface MemoThreeData {
  // Similar structure for final investment decision memo
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
}

export interface FilterOptions {
  search?: string;
  stage?: string[];
  status?: string[];
  scoreRange?: {
    min: number;
    max: number;
  };
  sector?: string[];
  riskLevel?: string[];
}

export interface SortOptions {
  field: 'name' | 'stage' | 'status' | 'score' | 'lastUpdated' | 'createdAt';
  direction: 'asc' | 'desc';
}

export interface InvestorMatch {
  id: string;
  name: string;
  firm: string;
  matchPercentage: number;
  fitProfile: string;
  rationale: string;
  checkSize: string;
  sectorFocus: string[];
  stagePreference: string[];
  coInvestors: string[];
}
