'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, CheckCircle, ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";
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
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Investment Decision Card */}
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
                  {diligenceData?.investment_recommendation ||
                   "RECOMMEND: Proceed with investment based on strong technical execution, validated market opportunity, and experienced founding team. Key risks are manageable with proper support and monitoring."}
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
                      <span className="text-yellow-500 mt-1">•</span>
                      <span>{risk}</span>
                    </li>
                  )) || [
                    "Market competition from established players",
                    "Execution risk in scaling operations",
                    "Dependency on key team members",
                    "Regulatory changes in target market"
                  ].map((risk, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">•</span>
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
                      <span className="text-purple-500 mt-1">•</span>
                      <span>{strategy}</span>
                    </li>
                  )) || [
                    "Implement strong governance and regular board oversight",
                    "Provide operational support and strategic guidance",
                    "Build redundancy in key roles and processes",
                    "Monitor market conditions and competitive landscape"
                  ].map((strategy, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">•</span>
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
                    "Conduct technical due diligence with independent experts",
                    "Validate customer references and case studies",
                    "Assess team's ability to scale business operations",
                    "Review financial projections and unit economics"
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
                    <p className="text-green-700">$2.5M Series A</p>
                  </div>
                  <div>
                    <span className="font-medium">Valuation:</span>
                    <p className="text-green-700">$15M Pre-money</p>
                  </div>
                  <div>
                    <span className="font-medium">Equity:</span>
                    <p className="text-green-700">14.3%</p>
                  </div>
                  <div>
                    <span className="font-medium">Board Seats:</span>
                    <p className="text-green-700">1 Board Seat</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">Synthesis Notes</h4>
                <p className="text-sm text-purple-700">
                  {diligenceData?.synthesis_notes ||
                   "This investment opportunity presents a compelling combination of strong technical execution, validated market demand, and an experienced founding team. While there are execution risks in scaling operations, the company has demonstrated the ability to deliver value to customers and shows strong potential for growth."}
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
