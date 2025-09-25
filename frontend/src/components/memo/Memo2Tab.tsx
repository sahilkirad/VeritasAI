'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Building, Cpu, Database, Cloud, Shield, Zap, TrendingUp, DollarSign, BarChart3 } from "lucide-react";

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
      {/* Technology Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Technology Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Technology Stack Overview */}
          <div>
            <h4 className="font-semibold mb-3">Technology Stack Overview</h4>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h5 className="font-medium text-blue-800 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Backend Framework
                </h5>
                <p className="text-xs text-blue-600 mt-1">
                  Python FastAPI for AI-Processing and NestJS/Node.js for Simulation APIs
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h5 className="font-medium text-green-800 flex items-center gap-2">
                  <Cloud className="h-4 w-4" />
                  Frontend Stack
                </h5>
                <p className="text-xs text-green-600 mt-1">
                  React and Next.js for dynamic dashboards and real-time feedback
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <h5 className="font-medium text-purple-800 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  AI Engine
                </h5>
                <p className="text-xs text-purple-600 mt-1">
                  GPT-based LLM fine-tuned for coaching behavior and AI mentorship
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <h5 className="font-medium text-orange-800 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Infrastructure
                </h5>
                <p className="text-xs text-orange-600 mt-1">
                  GCP hosting with Docker containerization and automated CI/CD
                </p>
              </div>
            </div>
          </div>

          {/* Technology Advantages */}
          <div>
            <h4 className="font-semibold mb-2">Technology Advantages</h4>
            <div className="space-y-2">
              <div className="p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
                <h5 className="font-medium text-gray-800">AI-Powered Simulation + Cloud-Native SaaS</h5>
                <p className="text-xs text-gray-600 mt-1">
                  The only scalable, effective tech stack proven to solve workforce readiness at scale with 50% faster training times and 25-30% improved performance metrics.
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border">
                <h5 className="font-medium text-gray-800">Continuous MLOps & Model Governance</h5>
                <p className="text-xs text-gray-600 mt-1">
                  Real-time model retraining, bias auditing, and responsiveness to evolving skill demands, making the platform "future-proof".
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Streams & Unit Economics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Revenue Streams & Unit Economics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Financials */}
          <div>
            <h4 className="font-semibold mb-2">Current Financials (Provisional as of March 2025)</h4>
            <div className="grid gap-2 md:grid-cols-3">
              <div className="p-2 bg-blue-50 rounded text-center">
                <div className="text-lg font-bold text-blue-800">INR 10.33L</div>
                <div className="text-xs text-blue-600">Monthly Recurring Revenue</div>
              </div>
              <div className="p-2 bg-green-50 rounded text-center">
                <div className="text-lg font-bold text-green-800">INR 1.24Cr</div>
                <div className="text-xs text-green-600">Annual Recurring Revenue</div>
              </div>
              <div className="p-2 bg-purple-50 rounded text-center">
                <div className="text-lg font-bold text-purple-800">70.25%</div>
                <div className="text-xs text-purple-600">Gross Margin</div>
              </div>
            </div>
          </div>

          {/* Unit Economics */}
          <div>
            <h4 className="font-semibold mb-2">Unit Economics</h4>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="p-3 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-800">Academic Institutions</h5>
                <div className="text-xs space-y-1 mt-2">
                  <div><strong>CAC:</strong> INR 1,125 per student</div>
                  <div><strong>LTV:</strong> INR 21,000 per student</div>
                  <div><strong>LTV:CAC Ratio:</strong> 18.6</div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-800">Corporate Clients</h5>
                <div className="text-xs space-y-1 mt-2">
                  <div><strong>CAC:</strong> INR 6,000</div>
                  <div><strong>LTV:</strong> INR 3,60,000 (3 years)</div>
                  <div><strong>LTV:CAC Ratio:</strong> 60</div>
                </div>
              </div>
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