'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Building, Cpu, Database, Cloud, Shield, Zap, TrendingUp, DollarSign, BarChart3, ExternalLink, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface DiligenceData {
  investment_recommendation?: string;
  memo_2_interview_analysis?: {
    founder_credibility?: {
      score: number;
      confidence_level: string;
      analysis: string;
      communication_quality: string;
    };
    pitch_consistency?: {
      score: number;
      contradictions: string[];
      verified_claims: string[];
      unverified_claims: string[];
    };
    market_understanding?: {
      score: number;
      insights: string;
      concerns: string;
    };
    team_assessment?: {
      score: number;
      strengths: string;
      gaps: string;
    };
    red_flags?: Array<{
      flag: string;
      severity: string;
      founder_response_quality: string;
    }>;
    investment_readiness?: {
      score: number;
      recommendation: string;
      investor_confidence: string;
    };
  };
  problem_validation?: any;
  solution_product_market_fit?: any;
  team_execution_capability?: any;
  founder_market_fit?: any;
  market_opportunity_competition?: any;
  benchmarking_analysis?: any;
  market_benchmarking?: {
    industry_averages?: {
      metrics?: Array<{label: string, value: string}>
    };
    competitive_landscape?: Array<{
      company_name: string;
      is_target: boolean;
      metric1_value: string;
      metric2_value: string;
      fees: string;
      ai_powered: string;
      notes: string;
    }>;
    metric_labels?: {
      metric1: string;
      metric2: string;
    };
    market_opportunity?: {
      description: string;
    };
  };
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
  const interviewData = diligenceData?.memo_2_interview_analysis;
  
  return (
    <div className="space-y-6">
      {/* Founder Credibility & Communication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Founder Credibility & Communication
          </CardTitle>
          <CardDescription>
            AI interview analysis of founder's communication quality and credibility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-blue-800">Credibility Score</h4>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-blue-200 rounded-full h-2 w-32">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${interviewData?.founder_credibility?.score || 75}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-blue-800">
                  {interviewData?.founder_credibility?.score || 75}/100
                </span>
              </div>
            </div>
            <p className="text-sm text-blue-700 mb-2">
              <strong>Analysis:</strong> {interviewData?.founder_credibility?.analysis || 
               "Founder demonstrated deep domain knowledge, answered tough questions directly, acknowledged challenges"}
            </p>
            <p className="text-sm text-blue-700">
              <strong>Communication Quality:</strong> {interviewData?.founder_credibility?.communication_quality || 
               "Excellent - clear, concise, data-backed responses"}
            </p>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                {interviewData?.founder_credibility?.confidence_level || "High"} Confidence
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pitch Consistency Check */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Pitch Consistency Check
          </CardTitle>
          <CardDescription>
            Cross-validation of interview responses against pitch deck claims
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-green-800">Consistency Score</h4>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-green-200 rounded-full h-2 w-32">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${interviewData?.pitch_consistency?.score || 88}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-green-800">
                  {interviewData?.pitch_consistency?.score || 88}/100
                </span>
              </div>
            </div>
            
            {interviewData?.pitch_consistency?.verified_claims && interviewData.pitch_consistency.verified_claims.length > 0 && (
              <div className="mb-3">
                <h5 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Verified Claims:
                </h5>
                <ul className="text-sm text-green-700 space-y-1">
                  {interviewData.pitch_consistency.verified_claims.map((claim: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>{claim}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {interviewData?.pitch_consistency?.unverified_claims && interviewData.pitch_consistency.unverified_claims.length > 0 && (
              <div className="mb-3">
                <h5 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Unverified Claims:
                </h5>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {interviewData.pitch_consistency.unverified_claims.map((claim: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">•</span>
                      <span>{claim}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {interviewData?.pitch_consistency?.contradictions && interviewData.pitch_consistency.contradictions.length > 0 && (
              <div>
                <h5 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Contradictions Found:
                </h5>
                <ul className="text-sm text-red-700 space-y-1">
                  {interviewData.pitch_consistency.contradictions.map((contradiction: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>{contradiction}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Market Understanding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Market Understanding
          </CardTitle>
          <CardDescription>
            Assessment of founder's market knowledge and strategic thinking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-purple-800">Market Understanding Score</h4>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-purple-200 rounded-full h-2 w-32">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${interviewData?.market_understanding?.score || 85}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-purple-800">
                  {interviewData?.market_understanding?.score || 85}/100
                </span>
              </div>
            </div>
            <p className="text-sm text-purple-700 mb-2">
              <strong>Key Insights:</strong> {interviewData?.market_understanding?.insights || 
               "Founder articulated TAM clearly, understands competitive positioning well"}
            </p>
            <p className="text-sm text-purple-700">
              <strong>Concerns:</strong> {interviewData?.market_understanding?.concerns || 
               "Slightly vague on go-to-market execution timelines"}
            </p>
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
            Evaluation of team composition and execution capabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-orange-800">Team Assessment Score</h4>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-orange-200 rounded-full h-2 w-32">
                  <div 
                    className="bg-orange-600 h-2 rounded-full" 
                    style={{ width: `${interviewData?.team_assessment?.score || 79}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-orange-800">
                  {interviewData?.team_assessment?.score || 79}/100
                </span>
              </div>
            </div>
            <p className="text-sm text-orange-700 mb-2">
              <strong>Strengths:</strong> {interviewData?.team_assessment?.strengths || 
               "Technical co-founder brings 5 years banking experience, product lead from [Company]"}
            </p>
            <p className="text-sm text-orange-700">
              <strong>Gaps:</strong> {interviewData?.team_assessment?.gaps || 
               "No CFO-level finance experience on team yet"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Red Flags Detection */}
      {interviewData?.red_flags && interviewData.red_flags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Red Flags Detected
            </CardTitle>
            <CardDescription>
              Issues identified during the interview that require attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {interviewData.red_flags.map((flag: any, index: number) => (
              <div key={index} className={`p-4 rounded-lg border ${
                flag.severity === 'High' ? 'bg-red-50 border-red-200' :
                flag.severity === 'Medium' ? 'bg-yellow-50 border-yellow-200' :
                'bg-orange-50 border-orange-200'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`p-1 rounded-full ${
                    flag.severity === 'High' ? 'bg-red-100' :
                    flag.severity === 'Medium' ? 'bg-yellow-100' :
                    'bg-orange-100'
                  }`}>
                    <AlertTriangle className={`h-4 w-4 ${
                      flag.severity === 'High' ? 'text-red-600' :
                      flag.severity === 'Medium' ? 'text-yellow-600' :
                      'text-orange-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold mb-1 ${
                      flag.severity === 'High' ? 'text-red-800' :
                      flag.severity === 'Medium' ? 'text-yellow-800' :
                      'text-orange-800'
                    }`}>
                      {flag.flag}
                    </h4>
                    <p className={`text-sm ${
                      flag.severity === 'High' ? 'text-red-700' :
                      flag.severity === 'Medium' ? 'text-yellow-700' :
                      'text-orange-700'
                    }`}>
                      <strong>Founder Response Quality:</strong> {flag.founder_response_quality}
                    </p>
                    <Badge 
                      variant="outline" 
                      className={`mt-2 text-xs ${
                        flag.severity === 'High' ? 'border-red-300 text-red-700' :
                        flag.severity === 'Medium' ? 'border-yellow-300 text-yellow-700' :
                        'border-orange-300 text-orange-700'
                      }`}
                    >
                      {flag.severity} Severity
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Investment Readiness */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Investment Readiness
          </CardTitle>
          <CardDescription>
            Overall assessment of investment readiness and investor confidence
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-green-800">Investment Readiness Score</h4>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-green-200 rounded-full h-2 w-32">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${interviewData?.investment_readiness?.score || 83}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-green-800">
                  {interviewData?.investment_readiness?.score || 83}/100
                </span>
              </div>
            </div>
            <p className="text-sm text-green-700 mb-2">
              <strong>Recommendation:</strong> {interviewData?.investment_readiness?.recommendation || 
               "READY for Series A conversations"}
            </p>
            <p className="text-sm text-green-700">
              <strong>Investor Confidence:</strong> {interviewData?.investment_readiness?.investor_confidence || 
               "High - founder instills trust, articulate on business"}
            </p>
            <div className="mt-3">
              <Badge variant="default" className="bg-green-600 text-white text-xs">
                Investment Ready
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}