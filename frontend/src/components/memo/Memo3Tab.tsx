'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, CheckCircle, ThumbsUp, ThumbsDown, MessageCircle, Users, TrendingUp, DollarSign, BarChart3, AlertTriangle } from "lucide-react";
import { useRouter } from 'next/navigation';

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

interface Memo3TabProps {
  diligenceData: DiligenceData | null;
}

export default function Memo3Tab({ diligenceData }: Memo3TabProps) {
  const router = useRouter();

  const handleCreateRoom = () => {
    router.push('/dashboard/create-room');
  };

  return (
    <div className="space-y-6">
      {/* Competitor Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Competitor Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Mercor AI */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Mercor AI</h4>
              <div className="space-y-2 text-xs">
                <div><strong>Funding:</strong> $136M USD</div>
                <div><strong>ARR:</strong> $100M USD</div>
                <div><strong>Model:</strong> Commission-based talent marketplace</div>
                <div><strong>Focus:</strong> AI-powered hiring platform</div>
              </div>
            </div>

            {/* Degreed */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Degreed</h4>
              <div className="space-y-2 text-xs">
                <div><strong>Funding:</strong> $450M USD</div>
                <div><strong>ARR:</strong> $120M USD</div>
                <div><strong>Model:</strong> Enterprise subscription</div>
                <div><strong>Focus:</strong> Learning experience platform</div>
              </div>
            </div>

            {/* Skillfully */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2">Skillfully</h4>
              <div className="space-y-2 text-xs">
                <div><strong>Funding:</strong> $2.5M USD</div>
                <div><strong>ARR:</strong> $8M USD</div>
                <div><strong>Model:</strong> B2B SaaS subscriptions</div>
                <div><strong>Focus:</strong> Pre-hire simulations</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border">
            <h4 className="font-semibold text-gray-800 mb-2">Competitive Positioning</h4>
            <p className="text-sm text-gray-700">
              InLustro/Syntra differentiates through experiential, simulation-based learning combined with hiring integration, 
              serving the full education-to-employment pipeline with both campus and corporate solutions.
            </p>
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
          {/* Valuation Breakdown */}
          <div>
            <h4 className="font-semibold mb-2">Valuation Breakdown</h4>
            <div className="grid gap-2 md:grid-cols-3">
              <div className="p-2 bg-blue-50 rounded text-center">
                <div className="text-lg font-bold text-blue-800">INR 18Cr</div>
                <div className="text-xs text-blue-600">Product Business (15x revenue)</div>
              </div>
              <div className="p-2 bg-green-50 rounded text-center">
                <div className="text-lg font-bold text-green-800">INR 4.8Cr</div>
                <div className="text-xs text-green-600">Service Business (6x revenue)</div>
              </div>
              <div className="p-2 bg-purple-50 rounded text-center">
                <div className="text-lg font-bold text-purple-800">INR 3Cr</div>
                <div className="text-xs text-purple-600">Product IP (R&D)</div>
              </div>
            </div>
            <div className="mt-3 p-3 bg-gray-50 rounded-lg text-center">
              <div className="text-xl font-bold text-gray-800">Total Valuation: INR 25.8Cr</div>
            </div>
          </div>

          {/* Fundraising Details */}
          <div>
            <h4 className="font-semibold mb-2">Fundraising Round</h4>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="p-3 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-800">Round Structure</h5>
                <div className="text-xs space-y-1 mt-2">
                  <div><strong>Funding Ask:</strong> INR 2.5 Crores</div>
                  <div><strong>Dilution:</strong> 8-10%</div>
                  <div><strong>Pre-Money:</strong> INR 25 Crores</div>
                  <div><strong>Instrument:</strong> SAFE</div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-800">Investors</h5>
                <div className="text-xs space-y-1 mt-2">
                  <div><strong>Lead:</strong> Looking for lead investor</div>
                  <div><strong>Committed:</strong> INR 1 Cr</div>
                  <div><strong>From:</strong> Soonicorn Ventures, Realtime Angel Fund</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investment Decision */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Investment Decision
            </CardTitle>
            <CardDescription>
              Final recommendation based on comprehensive analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Investment Recommendation</h4>
                <p className="text-sm text-green-700">
                  {diligenceData?.investment_recommendation || "HOLD"}
                </p>
                {diligenceData?.overall_score && (
                  <div className="mt-3 p-3 bg-white rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-800">Overall Score</span>
                      <span className="text-lg font-bold text-green-800">{diligenceData.overall_score}/10</span>
                    </div>
                    <div className="w-full bg-green-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${diligenceData.overall_score * 10}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Investment Thesis</h4>
                <p className="text-sm text-blue-700">
                  {diligenceData?.investment_thesis ||
                   "Strong technical team with proven ability to execute complex solutions in a large and growing market. The company has demonstrated product-market fit with early customers and shows potential for significant scale."}
                </p>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">Key Risks</h4>
                <ul className="text-sm space-y-1">
                  {diligenceData?.key_risks?.map((risk: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertTriangle className="h-3 w-3 text-yellow-500 mt-1 flex-shrink-0" />
                      <span>{risk}</span>
                    </li>
                  )) || [
                    "Unverified traction metrics",
                    "Scalability and reliability of authentication process",
                    "Competition from established and unorganized players",
                    "Reliance on Instagram marketing"
                  ].map((risk, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertTriangle className="h-3 w-3 text-yellow-500 mt-1 flex-shrink-0" />
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">Mitigation Strategies</h4>
                <ul className="text-sm space-y-1">
                  {diligenceData?.mitigation_strategies?.map((strategy: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 text-purple-500 mt-1 flex-shrink-0" />
                      <span>{strategy}</span>
                    </li>
                  )) || [
                    "Obtain and verify Google Analytics data",
                    "Conduct thorough due diligence on authentication process",
                    "Develop a robust multi-channel marketing strategy",
                    "Strengthen competitive positioning through unique value proposition"
                  ].map((strategy, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 text-purple-500 mt-1 flex-shrink-0" />
                      <span>{strategy}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Next Steps
            </CardTitle>
            <CardDescription>
              Recommended actions and due diligence follow-up.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Due Diligence Next Steps</h4>
                <ul className="text-sm space-y-1">
                  {diligenceData?.due_diligence_next_steps?.map((step: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  )) || [
                    "Obtain and analyze verified Google Analytics data",
                    "Deep dive into the authentication process and its scalability",
                    "Conduct customer interviews to validate problem and solution fit",
                    "Competitive analysis and market research"
                  ].map((step, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Investment Terms</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Investment Amount:</span>
                    <p className="text-green-700">INR 2.5 Crores</p>
                  </div>
                  <div>
                    <span className="font-medium">Valuation:</span>
                    <p className="text-green-700">INR 25 Crores Pre-money</p>
                  </div>
                  <div>
                    <span className="font-medium">Equity:</span>
                    <p className="text-green-700">8-10%</p>
                  </div>
                  <div>
                    <span className="font-medium">Instrument:</span>
                    <p className="text-green-700">SAFE</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">Synthesis Notes</h4>
                <p className="text-sm text-purple-700">
                  {diligenceData?.synthesis_notes ||
                   "The LinkedIn data provides a basic overview of the founders' backgrounds but lacks depth. The absence of Google Analytics data hinders validation of key traction metrics, creating a significant information gap. The Memo 1 data presents a compelling narrative, but its claims need further substantiation."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Decision Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Decision
          </CardTitle>
          <CardDescription>
            Log your final decision for this deal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <ThumbsUp className="h-5 w-5" />
              Approve for Partner Meeting
            </Button>

            <Button
              size="lg"
              variant="destructive"
              className="flex items-center gap-2"
            >
              <ThumbsDown className="h-5 w-5" />
              Decline / Pass
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleCreateRoom}
            >
              <MessageCircle className="h-5 w-5" />
              Create a Room & Discuss
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}