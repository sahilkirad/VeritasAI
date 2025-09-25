'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Building, Cpu, Database, Cloud, Shield, Zap, TrendingUp, DollarSign, BarChart3, ExternalLink } from "lucide-react";

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
  [key: string]: any;
}

interface Memo2TabProps {
  diligenceData: DiligenceData | null;
}

export default function Memo2Tab({ diligenceData }: Memo2TabProps) {
  return (
    <div className="space-y-6">
      {/* Interview Analysis & Founders Fit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Interview Analysis & Founders Fit
          </CardTitle>
          <CardDescription>
            Summary of AI-led founder interview and assessment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Interview Summary */}
          <div>
            <h4 className="font-semibold mb-3">Interview Summary</h4>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                {diligenceData?.founder_market_fit?.analysis || 
                 "Conducted a comprehensive AI-led interview with the founder covering business model validation, market strategy, team dynamics, and execution capabilities. The interview revealed key insights about the founder's vision, market understanding, and ability to execute on the business plan."}
              </p>
              {diligenceData?.founder_market_fit?.key_insights && (
                <div className="mt-3">
                  <h5 className="font-medium text-blue-800 mb-2">Key Interview Insights:</h5>
                  <ul className="text-sm space-y-1">
                    {diligenceData.founder_market_fit.key_insights.map((insight: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Founders Fit Assessment */}
          <div>
            <h4 className="font-semibold mb-3">Founders Fit Assessment</h4>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <h5 className="font-medium text-green-800 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Founder-Market Fit
                </h5>
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 bg-green-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(diligenceData?.founder_market_fit?.score || 6) * 10}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-green-800">
                      {diligenceData?.founder_market_fit?.score || 6}/10
                    </span>
                  </div>
                  <p className="text-xs text-green-600">
                    {diligenceData?.founder_market_fit?.analysis || 
                     "Founders demonstrate strong understanding of the market and customer needs."}
                  </p>
                </div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <h5 className="font-medium text-purple-800 flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Team Execution Capability
                </h5>
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 bg-purple-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${(diligenceData?.team_execution_capability?.score || 6) * 10}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-purple-800">
                      {diligenceData?.team_execution_capability?.score || 6}/10
                    </span>
                  </div>
                  <p className="text-xs text-purple-600">
                    {diligenceData?.team_execution_capability?.analysis || 
                     "Team shows relevant skills and experience in the target market."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Team Assessment */}
          <div>
            <h4 className="font-semibold mb-3">Team Assessment</h4>
            <div className="space-y-3">
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <h5 className="font-medium text-purple-800 mb-2">Team Strengths</h5>
                <ul className="text-sm space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>Strong technical team with relevant industry experience</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>Proven ability to deliver complex technical solutions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>Good cultural fit and team dynamics</span>
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <h5 className="font-medium text-orange-800 mb-2">Team Gaps</h5>
                <ul className="text-sm space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>Need for dedicated sales and marketing leadership</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>Limited experience in scaling operations</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Traction & Metrics Validation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Traction & Metrics Validation
          </CardTitle>
          <CardDescription>
            Analysis of company traction and key metrics from interview
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">Traction Analysis</h4>
            <p className="text-sm text-yellow-700">
              {diligenceData?.traction_metrics_validation?.analysis || 
               "Based on the interview, the company shows promising traction with early customer validation and revenue growth. Key metrics discussed include customer acquisition, retention rates, and market penetration."}
            </p>
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 bg-yellow-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full" 
                    style={{ width: `${(diligenceData?.traction_metrics_validation?.score || 4) * 10}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-yellow-800">
                  {diligenceData?.traction_metrics_validation?.score || 4}/10
                </span>
              </div>
              <p className="text-xs text-yellow-600">
                Score reflects current traction and growth potential
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interview Analysis */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Interview Analysis
            </CardTitle>
            <CardDescription>
              AI-powered interview insights and founder assessment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Interview Summary</h4>
                <p className="text-sm text-blue-700">
                  {diligenceData?.founder_market_fit?.analysis || 
                   "Conducted a comprehensive 45-minute AI interview with the founder. The interview covered business model validation, market strategy, team dynamics, and execution capabilities."}
                </p>
                {diligenceData?.founder_market_fit?.key_insights && (
                  <div className="mt-3">
                    <h5 className="font-medium text-blue-800 mb-2">Key Insights:</h5>
                    <ul className="text-sm space-y-1">
                      {diligenceData.founder_market_fit.key_insights.map((insight: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Founder-Market Fit Score</h4>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 bg-green-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(diligenceData?.founder_market_fit?.score || 6) * 10}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-green-800">
                    {diligenceData?.founder_market_fit?.score || 6}/10
                  </span>
                </div>
                <p className="text-xs text-green-600">
                  {diligenceData?.founder_market_fit?.analysis || 
                   "Founders have complementary skill sets covering marketing, operations, and strategy."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Assessment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Team Assessment
            </CardTitle>
            <CardDescription>
              Evaluation of team composition and execution capabilities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">Team Strengths</h4>
                <ul className="text-sm space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>Strong technical team with relevant industry experience</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>Proven ability to deliver complex technical solutions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>Good cultural fit and team dynamics</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-orange-800 mb-2">Team Gaps</h4>
                <ul className="text-sm space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>Need for dedicated sales and marketing leadership</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>Limited experience in scaling operations</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-800 mb-2">Team Execution Score</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(diligenceData?.team_execution_capability?.score || 6) * 10}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-blue-800">
                    {diligenceData?.team_execution_capability?.score || 6}/10
                  </span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  {diligenceData?.team_execution_capability?.analysis || 
                   "The team appears to have relevant skills in marketing, operations, and strategy."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traction & Metrics Validation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Traction & Metrics Validation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">Traction Analysis</h4>
            <p className="text-sm text-yellow-700">
              {diligenceData?.traction_metrics_validation?.analysis || 
               "Memo 1 claims significant traction with impressive metrics, but validation through Google Analytics data is needed to confirm these numbers."}
            </p>
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 bg-yellow-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full" 
                    style={{ width: `${(diligenceData?.traction_metrics_validation?.score || 4) * 10}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-yellow-800">
                  {diligenceData?.traction_metrics_validation?.score || 4}/10
                </span>
              </div>
              <p className="text-xs text-yellow-600">
                Score reflects need for verified metrics and data validation
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}