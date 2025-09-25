'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, CheckCircle, ThumbsUp, ThumbsDown, MessageCircle, Users, TrendingUp, DollarSign, BarChart3, AlertTriangle, ExternalLink } from "lucide-react";
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
      {/* Competitor Analysis Framework */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Competitor Analysis Framework
          </CardTitle>
          <CardDescription>
            Cover 2-3 competitors operating in similar revenue model or advanced revenue model in comparison to your company
          </CardDescription>
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
                <div><strong>Revenue Model:</strong> Transaction fees from successful placements</div>
                <div><strong>Market Position:</strong> Global talent acquisition platform</div>
              </div>
              <div className="mt-2">
                <a href="https://www.mercor.ai" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center">
                  Company Website
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
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
                <div><strong>Revenue Model:</strong> SaaS subscriptions for enterprise clients</div>
                <div><strong>Market Position:</strong> Enterprise learning and development</div>
              </div>
              <div className="mt-2">
                <a href="https://www.degreed.com" target="_blank" rel="noopener noreferrer" className="text-xs text-green-500 hover:underline flex items-center">
                  Company Website
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
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
                <div><strong>Revenue Model:</strong> Subscription-based assessment platform</div>
                <div><strong>Market Position:</strong> Skills assessment and simulation platform</div>
              </div>
              <div className="mt-2">
                <a href="https://www.skillfully.com" target="_blank" rel="noopener noreferrer" className="text-xs text-purple-500 hover:underline flex items-center">
                  Company Website
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border">
            <h4 className="font-semibold text-gray-800 mb-2">Competitive Positioning</h4>
            <p className="text-sm text-gray-700 mb-2">
              InLustro/Syntra differentiates through experiential, simulation-based learning combined with hiring integration, 
              serving the full education-to-employment pipeline with both campus and corporate solutions.
            </p>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Key Differentiators:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Only platform combining AI-powered job simulations with L&D tools</li>
                <li>Hands-on, contextual, and outcome-driven approach vs content-only competitors</li>
                <li>Full education-to-employment pipeline coverage</li>
                <li>High stickiness across stakeholders (students, institutions, employers)</li>
              </ul>
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
          {/* Key Problem Solved */}
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <h4 className="font-semibold text-red-800 mb-2">Key Problem Solved</h4>
            <p className="text-sm text-red-700">
              Hiring and training for early-career roles is broken. Manual interviews and generic assignments fail to assess or prepare candidates for the real job. Meanwhile, companies spend months and significant resources onboarding fresh talent who still struggle to perform.
            </p>
          </div>

          {/* Business Model */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Business Model</h4>
            <p className="text-sm text-blue-700">
              InLustro operates on a B2B and B2B2C model, delivering high-impact, simulation-based learning and hiring solutions to academic institutions and corporates. Our primary revenue comes from institutional contracts where we design and deliver experiential training programs to bridge the employability gap. With the launch of our product Syntra, our job simulation platform, we will be transitioning toward a scalable SaaS model offering tiered and pay-per-use pricing to institutions and corporates. Our business combines high-touch service delivery with high-scale product adoption to drive recurring, high-margin revenue.
            </p>
          </div>

          {/* Pipeline */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">Pipeline</h4>
            <div className="text-sm text-green-700 space-y-2">
              <div>
                <strong>Sales Pipeline Value:</strong> As of July 2025, InLustro's qualified sales pipeline stands at INR 4.8 Cr+, spanning ongoing conversations with over 30 new academic institutions and 10 new corporate clients across India. These prospects are in various stages of the conversion funnel - ranging from pilot discussions to proposal negotiations and MoU finalization.
              </div>
              <div>
                <strong>Projected Growth Opportunities:</strong> With the new NEP-aligned emphasis on employability and skill-based credits, colleges are actively seeking partners like InLustro to bridge the industry-readiness gap. We aim to expand from our current footprint of 45+ institutions to 100+ partner colleges over the next 12–15 months.
              </div>
            </div>
          </div>

          {/* Why Now */}
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2">Why Now</h4>
            <div className="text-sm text-purple-700 space-y-2">
              <div>
                <strong>Market Trends:</strong> AI adoption in HR and EdTech is accelerating. Companies are actively replacing manual assessments and training with automation and AI-powered tools. The NEP 2020 and UGC guidelines now emphasize experiential learning and industry alignment.
              </div>
              <div>
                <strong>Competitive Edge:</strong> Syntra is the only experiential JobTech platform that combines AI-based job simulations, custom role evaluators, and L&D tools into a single platform.
              </div>
              <div>
                <strong>Urgency/Opportunity:</strong> We are at the cusp of a major shift in how early talent is trained and hired. InLustro, through Syntra, is positioned to become the infrastructure layer for future-ready talent pipelines.
              </div>
            </div>
          </div>

          {/* Fundraising Details */}
          <div>
            <h4 className="font-semibold mb-2">Fundraising Details</h4>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="p-3 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-800">Round Structure</h5>
                <div className="text-xs space-y-1 mt-2">
                  <div><strong>Funding Ask:</strong> INR 2.5 Crores</div>
                  <div><strong>Structure:</strong> We are raising our Seed round through a SAFE instrument, with a valuation cap and discount structure designed to align long-term interests with our early backers.</div>
                  <div><strong>Valuation Cap and Floor:</strong> INR 20 Crores to 30 Crores</div>
                  <div><strong>Current Commitments:</strong> INR 1 Crore from Soonicorn Ventures & Realtime Angel Fund</div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-800">Investors</h5>
                <div className="text-xs space-y-1 mt-2">
                  <div><strong>Lead:</strong> We are looking for an investor to lead the round</div>
                  <div><strong>Incoming Investors:</strong> Soonicorn Ventures, Realtime Angel Fund, & an Angel Investor</div>
                  <div><strong>Existing Investors:</strong> N/A</div>
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
                <h4 className="font-semibold text-yellow-800 mb-2">Risks and Mitigation</h4>
                <div className="text-sm space-y-3">
                  <div>
                    <p className="font-medium text-yellow-800 mb-2">Identified Risks</p>
                    <p className="text-yellow-700 mb-2">As with any early-stage venture, we have proactively identified 5 risks and developed mitigation strategies to ensure sustainable growth.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="p-2 bg-white rounded border">
                      <p className="font-medium text-gray-800">Adoption Resistance from Academic Institutions</p>
                      <p className="text-xs text-gray-600">Traditional institutions may resist adopting new AI-based training and evaluation models due to legacy mindsets, slow decision cycles, or budgetary concerns.</p>
                      <p className="text-xs text-green-600 mt-1"><strong>Mitigation:</strong> Offer freemium and pilot programs to demonstrate value and outcomes before upselling. Align Syntra's offerings with NEP 2020 and UGC guidelines to make it easier for institutions to adopt.</p>
                    </div>
                    
                    <div className="p-2 bg-white rounded border">
                      <p className="font-medium text-gray-800">Delayed Payment Cycles from Academic Institutions</p>
                      <p className="text-xs text-gray-600">Payment delays from colleges can affect cash flow.</p>
                      <p className="text-xs text-green-600 mt-1"><strong>Mitigation:</strong> Structure contracts with advance payments, milestone-based billing, or co-payments from students. Target a balanced mix of private, self-financed institutions with faster payment cycles.</p>
                    </div>
                    
                    <div className="p-2 bg-white rounded border">
                      <p className="font-medium text-gray-800">Competitive Market in Skilling & Hiring Tech</p>
                      <p className="text-xs text-gray-600">Presence of large players (e.g., Unstop, Naukri, HackerRank) in the skilling and assessment space could impact market share in India.</p>
                      <p className="text-xs text-green-600 mt-1"><strong>Mitigation:</strong> Differentiate through experiential, simulation-based learning, which few others offer. Focus on role-based job readiness + hiring integration, not just generic content or assessments.</p>
                    </div>
                    
                    <div className="p-2 bg-white rounded border">
                      <p className="font-medium text-gray-800">Technology & Platform Scalability</p>
                      <p className="text-xs text-gray-600">As usage grows, the platform must scale reliably while maintaining quality, performance, and security.</p>
                      <p className="text-xs text-green-600 mt-1"><strong>Mitigation:</strong> Built on modular architecture that enables scaling in phases. Partnering with trusted cloud providers (e.g., AWS) for infrastructure.</p>
                    </div>
                    
                    <div className="p-2 bg-white rounded border">
                      <p className="font-medium text-gray-800">Talent Acquisition & Retention in a Startup Environment</p>
                      <p className="text-xs text-gray-600">Difficulty in attracting and retaining top talent, especially in tech and operations.</p>
                      <p className="text-xs text-green-600 mt-1"><strong>Mitigation:</strong> Offer competitive ESOPs and flexible work culture to attract mission-aligned individuals. Build a culture of ownership and impact, especially for early hires.</p>
                    </div>
                  </div>
                </div>
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