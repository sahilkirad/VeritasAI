'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, TrendingUp } from "lucide-react";

interface Memo1Data {
  title?: string;
  summary?: string;
  business_model?: string;
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
}

interface Memo1TabProps {
  memo1: Memo1Data;
}

export default function Memo1Tab({ memo1 }: Memo1TabProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pitch Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Pitch Summary
            </CardTitle>
            <CardDescription>
              A concise summary of the initial pitch deck and documents for {memo1.title || 'the company'}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                Problem Statement
              </h4>
              <p className="text-sm leading-relaxed">{memo1.problem || 'No problem statement available'}</p>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                Solution
              </h4>
              <p className="text-sm leading-relaxed">{memo1.solution || 'No solution description available'}</p>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                Business Model
              </h4>
              <p className="text-sm leading-relaxed">{memo1.business_model || 'No business model data available'}</p>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                Market Size
              </h4>
              <p className="text-sm leading-relaxed">{memo1.market_analysis || 'No market analysis available'}</p>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                Traction
              </h4>
              <p className="text-sm leading-relaxed">{memo1.financial_projections || 'No traction data available'}</p>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                Team
              </h4>
              <p className="text-sm leading-relaxed">{memo1.team_info || 'No team information available'}</p>
            </div>

            {memo1.competition && memo1.competition.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                  Competition
                </h4>
                <ul className="text-sm space-y-1">
                  {memo1.competition.map((competitor: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{competitor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {memo1.initial_flags && memo1.initial_flags.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                  Initial Red Flags
                </h4>
                <ul className="text-sm space-y-1">
                  {memo1.initial_flags.map((flag: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">⚠</span>
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {memo1.validation_points && memo1.validation_points.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                  Key Validation Points
                </h4>
                <ul className="text-sm space-y-1">
                  {memo1.validation_points.map((point: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                Comprehensive Analysis
              </h4>
              <p className="text-sm leading-relaxed">{memo1.summary || 'No comprehensive analysis available'}</p>
            </div>
          </CardContent>
        </Card>

        {/* AI Insights Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              AI Insights (Memo 1)
            </CardTitle>
            <CardDescription>
              Comprehensive AI analysis and due diligence insights.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Initial Assessment</h4>
              <p className="text-sm text-blue-700">
                Based on the initial document analysis, this company shows potential in the market with a clear problem-solution fit. 
                Key areas for further investigation include market validation and competitive positioning.
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Strengths</h4>
              <ul className="text-sm space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Clear problem identification and solution approach</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Experienced founding team with relevant background</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Large addressable market opportunity</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2">Areas of Concern</h4>
              <ul className="text-sm space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>Limited market validation and customer traction</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>High competition in the target market</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>Need for stronger go-to-market strategy</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2">Next Steps</h4>
              <ul className="text-sm space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">1.</span>
                  <span>Conduct detailed market research and competitive analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">2.</span>
                  <span>Validate customer demand through interviews and surveys</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">3.</span>
                  <span>Assess technical feasibility and development roadmap</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
