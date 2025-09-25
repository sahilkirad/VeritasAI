'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building } from "lucide-react";

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
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Interview Analysis Card */}
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
                <h4 className="font-semibold text-green-800 mb-2">Key Insights</h4>
                <ul className="text-sm space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Strong technical background and deep domain expertise</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Clear vision for market expansion and growth strategy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Demonstrated ability to build and lead technical teams</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Realistic understanding of market challenges and competition</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">Areas of Concern</h4>
                <ul className="text-sm space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">•</span>
                    <span>Limited experience in enterprise sales and business development</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">•</span>
                    <span>Need for stronger go-to-market strategy for enterprise clients</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Assessment Card */}
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
                      style={{ width: `${(diligenceData?.team_execution_capability?.score || 8) * 10}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-blue-800">
                    {diligenceData?.team_execution_capability?.score || 8}/10
                  </span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  {diligenceData?.team_execution_capability?.analysis || 
                   "Strong technical execution, needs business development support"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
