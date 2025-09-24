'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, TrendingUp, Users, DollarSign, Target, AlertTriangle, CheckCircle, BarChart3, User, Building, Shield, Upload, ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from 'next/navigation';
import { safeJsonResponse } from '@/lib/api';

interface MemoData {
  id: string;
  memo_1?: any;
  filename?: string;
  timestamp?: any;
}

interface DiligenceData {
  id: string;
  memo_1_id?: string;
  status?: string;
  timestamp?: any;
  // Direct fields from the actual data structure
  problem_validation?: any;
  solution_product_market_fit?: any;
  team_execution_capability?: any;
  traction_metrics_validation?: any;
  founder_market_fit?: any;
  market_opportunity_competition?: any;
  benchmarking_analysis?: any;
  investment_recommendation?: string;
  investment_thesis?: string;
  key_risks?: string[];
  mitigation_strategies?: string[];
  due_diligence_next_steps?: string[];
  synthesis_notes?: string;
  [key: string]: any;
}

export default function DealMemoPage() {
  const [memoData, setMemoData] = useState<MemoData | null>(null);
  const [diligenceData, setDiligenceData] = useState<DiligenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("memo1");
  const [hasRecentData, setHasRecentData] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchMemoData();
  }, []);

  const fetchMemoData = async () => {
    try {
      console.log('Fetching memo data...');
      const response = await fetch('/api/memo-data');
      const data = await safeJsonResponse(response);
      console.log('API Response:', data);
      
      if (data.memos && data.memos.length > 0) {
        // Get the most recent memo
        const latestMemo = data.memos[0];
        console.log('Latest Memo:', latestMemo);
        
        // Check if the memo has actual content (not just an empty document)
        if (latestMemo.memo_1 && Object.keys(latestMemo.memo_1).length > 0) {
          setMemoData(latestMemo);
          setHasRecentData(true);
          
          // Fetch diligence data separately using the memo ID
          try {
            const diligenceResponse = await fetch(`/api/check-diligence?memoId=${latestMemo.id}`);
            const diligenceData = await safeJsonResponse(diligenceResponse);
            console.log('Diligence Response:', diligenceData);
            
            if (diligenceData.status === 'completed' && diligenceData.results) {
              setDiligenceData(diligenceData.results);
            } else {
              setDiligenceData(null);
            }
          } catch (diligenceError) {
            console.error('Error fetching diligence data:', diligenceError);
            setDiligenceData(null);
          }
        } else {
          // Memo exists but has no content
          console.log('Memo exists but has no content');
          setMemoData(null);
          setDiligenceData(null);
          setHasRecentData(false);
        }
      } else {
        console.log('No memos found');
        setMemoData(null);
        setDiligenceData(null);
        setHasRecentData(false);
      }
    } catch (error) {
      console.error('Error fetching memo data:', error);
      setMemoData(null);
      setDiligenceData(null);
      setHasRecentData(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = () => {
    // Navigate to the Create Room page
    router.push('/dashboard/create-room');
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch {
      return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );
}

  // Show upload prompt if no recent data
  if (!hasRecentData || !memoData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Deal Memo</h1>
            <p className="text-muted-foreground mt-1">
              AI-powered analysis for your investment opportunities
            </p>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <Upload className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-2xl font-semibold mb-4">No Deal Memos Found</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Upload pitch decks, documents, or media files to generate AI-powered investment analysis and due diligence reports.
          </p>
          <div className="space-y-4">
            <Button 
              onClick={() => window.location.href = '/founder/dashboard/documents'} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Documents
            </Button>
            <div className="text-sm text-muted-foreground">
              <p>Supported formats: PDF, PowerPoint, Video (MP4), Audio (MP3)</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Upload pitch decks and business documents for comprehensive AI analysis.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Due Diligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get detailed investment analysis with risk assessment and recommendations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                AI Interview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Schedule AI-powered interviews for deeper founder and team analysis.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const memo1 = memoData.memo_1 || {};

  console.log('Memo1 data:', memo1);
  console.log('Diligence data:', diligenceData);

    return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deal Memo</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered analysis for {memo1.title || memoData.filename || 'Unknown Company'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            {memoData.memo_1 ? 'Analysis Complete' : 'Processing'}
          </Badge>
          {diligenceData && (
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              Diligence Complete
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="memo1">Memo 1: Initial Analysis</TabsTrigger>
          <TabsTrigger value="memo2" disabled={!diligenceData}>Memo 2: Interview Analysis</TabsTrigger>
          <TabsTrigger value="final" disabled={!diligenceData}>Final Memo: Decision</TabsTrigger>
                </TabsList>
                
        <TabsContent value="memo1" className="space-y-6">
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
                {memo1.problem && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                      Problem
                    </h4>
                    <p className="text-sm leading-relaxed">{memo1.problem}</p>
                  </div>
                )}

                {memo1.solution && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                      Solution
                    </h4>
                    <p className="text-sm leading-relaxed">{memo1.solution}</p>
                  </div>
                )}

                {memo1.traction && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                      Traction
                    </h4>
                    <p className="text-sm leading-relaxed">{memo1.traction}</p>
                  </div>
                )}

                {memo1.team && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                      Team
                    </h4>
                    <p className="text-sm leading-relaxed">{memo1.team}</p>
                  </div>
                )}

                {memo1.business_model && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                      Business Model
                    </h4>
                    <p className="text-sm leading-relaxed">{memo1.business_model}</p>
                  </div>
                )}

                {memo1.market_size && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                      Market Size
                    </h4>
                    <p className="text-sm leading-relaxed">{memo1.market_size}</p>
                                </div>
                )}
                            </CardContent>
                        </Card>

            {/* AI Insights Card - Updated with all sections */}
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
                {diligenceData ? (
                  <>
                    {/* Investment Recommendation */}
                    {diligenceData.investment_recommendation && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-blue-800">Investment Recommendation</span>
                          <Badge variant="outline" className="text-blue-600 border-blue-600">
                            {diligenceData.investment_recommendation}
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* Problem Validation */}
                    {diligenceData.problem_validation && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                          <Target className="h-4 w-4 text-green-500" />
                          Problem Validation
                        </h4>
                        <p className="text-sm leading-relaxed mb-2">{diligenceData.problem_validation.analysis}</p>
                        {diligenceData.problem_validation.market_size_assessment && (
                          <p className="text-xs text-muted-foreground">
                            <strong>Market Size:</strong> {diligenceData.problem_validation.market_size_assessment}
                          </p>
                        )}
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-muted-foreground">Score:</span>
                          <Badge variant="outline" className="text-green-600">
                            {diligenceData.problem_validation.score}/10
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* Solution & Product-Market Fit */}
                    {diligenceData.solution_product_market_fit && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-500" />
                          Solution & Product-Market Fit
                        </h4>
                        <p className="text-sm leading-relaxed mb-2">{diligenceData.solution_product_market_fit.analysis}</p>
                        {diligenceData.solution_product_market_fit.competitive_advantages && (
                          <div className="mb-2">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Competitive Advantages:</p>
                            <ul className="text-xs space-y-1">
                              {diligenceData.solution_product_market_fit.competitive_advantages.map((advantage: string, index: number) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-blue-500 mt-1">•</span>
                                  <span>{advantage}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-muted-foreground">Score:</span>
                          <Badge variant="outline" className="text-blue-600">
                            {diligenceData.solution_product_market_fit.score}/10
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* Team Execution Capability */}
                    {diligenceData.team_execution_capability && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                          <Users className="h-4 w-4 text-purple-500" />
                          Team Execution Capability
                        </h4>
                        <p className="text-sm leading-relaxed mb-2">{diligenceData.team_execution_capability.analysis}</p>
                        {diligenceData.team_execution_capability.relevant_experience && (
                          <div className="mb-2">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Relevant Experience:</p>
                            <ul className="text-xs space-y-1">
                              {diligenceData.team_execution_capability.relevant_experience.map((exp: string, index: number) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-purple-500 mt-1">•</span>
                                  <span>{exp}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-muted-foreground">Score:</span>
                          <Badge variant="outline" className="text-purple-600">
                            {diligenceData.team_execution_capability.score}/10
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* Founder-Market Fit */}
                    {diligenceData.founder_market_fit && (
                                     <div>
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                          <User className="h-4 w-4 text-indigo-500" />
                          Founder-Market Fit
                        </h4>
                        <p className="text-sm leading-relaxed mb-2">{diligenceData.founder_market_fit.analysis}</p>
                        {diligenceData.founder_market_fit.founder_profile && (
                          <div className="mb-2 p-2 bg-gray-50 rounded text-xs">
                            <p><strong>Name:</strong> {diligenceData.founder_market_fit.founder_profile.name}</p>
                            <p><strong>Role:</strong> {diligenceData.founder_market_fit.founder_profile.role_and_contributions}</p>
                            <p><strong>Company:</strong> {diligenceData.founder_market_fit.founder_profile.company_founded}</p>
                          </div>
                        )}
                        {diligenceData.founder_market_fit.key_insights && (
                          <div className="mb-2">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Key Insights:</p>
                            <ul className="text-xs space-y-1">
                              {diligenceData.founder_market_fit.key_insights.map((insight: string, index: number) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-indigo-500 mt-1">•</span>
                                  <span>{insight}</span>
                                </li>
                              ))}
                                        </ul>
                                    </div>
                        )}
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-muted-foreground">Score:</span>
                          <Badge variant="outline" className="text-indigo-600">
                            {diligenceData.founder_market_fit.score}/10
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* Market Opportunity & Competition */}
                    {diligenceData.market_opportunity_competition && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                          <Building className="h-4 w-4 text-orange-500" />
                          Market Opportunity & Competition
                        </h4>
                        <p className="text-sm leading-relaxed mb-2">{diligenceData.market_opportunity_competition.analysis}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                          <div>
                            <p className="font-medium text-muted-foreground">Market Opportunities:</p>
                            <p>{diligenceData.market_opportunity_competition.market_opportunities}</p>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground">Competitive Landscape:</p>
                            <p>{diligenceData.market_opportunity_competition.competitive_landscape}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-muted-foreground">Score:</span>
                          <Badge variant="outline" className="text-orange-600">
                            {diligenceData.market_opportunity_competition.score}/10
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* Benchmarking Analysis */}
                    {diligenceData.benchmarking_analysis && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-teal-500" />
                          Benchmarking Analysis
                        </h4>
                        <p className="text-sm leading-relaxed mb-2">{diligenceData.benchmarking_analysis.analysis}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                          <div>
                            <p className="font-medium text-muted-foreground">Competitive Positioning:</p>
                            <p>{diligenceData.benchmarking_analysis.competitive_positioning}</p>
                          </div>
                                    <div>
                            <p className="font-medium text-muted-foreground">Confidence Score:</p>
                            <p>{diligenceData.benchmarking_analysis.confidence_score}/5</p>
                          </div>
                        </div>
                        {diligenceData.benchmarking_analysis.differentiation_factors && (
                          <div className="mb-2">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Differentiation Factors:</p>
                            <ul className="text-xs space-y-1">
                              {diligenceData.benchmarking_analysis.differentiation_factors.map((factor: string, index: number) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-teal-500 mt-1">•</span>
                                  <span>{factor}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {diligenceData.benchmarking_analysis.competitive_threats && (
                          <div className="mb-2">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Competitive Threats:</p>
                            <ul className="text-xs space-y-1">
                              {diligenceData.benchmarking_analysis.competitive_threats.map((threat: string, index: number) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-red-500 mt-1">•</span>
                                  <span>{threat}</span>
                                </li>
                              ))}
                                        </ul>
                                    </div>
                        )}
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-muted-foreground">Score:</span>
                          <Badge variant="outline" className="text-teal-600">
                            {diligenceData.benchmarking_analysis.score}/10
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* Traction Metrics Validation */}
                    {diligenceData.traction_metrics_validation && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-yellow-500" />
                          Traction Metrics Validation
                        </h4>
                        <p className="text-sm leading-relaxed mb-2">{diligenceData.traction_metrics_validation.analysis}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                          <div>
                            <p className="font-medium text-muted-foreground">Growth Trajectory:</p>
                            <p>{diligenceData.traction_metrics_validation.growth_trajectory || 'Not available'}</p>
                          </div>
                                     <div>
                            <p className="font-medium text-muted-foreground">Metrics Validation:</p>
                            <p>{diligenceData.traction_metrics_validation.metrics_validation || 'Not available'}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-muted-foreground">Score:</span>
                          <Badge variant="outline" className="text-yellow-600">
                            {diligenceData.traction_metrics_validation.score}/10
                          </Badge>
                                    </div>
                                </div>
                    )}

                    {/* Key Risks */}
                    {diligenceData.key_risks && diligenceData.key_risks.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          Key Risks
                        </h4>
                        <ul className="text-sm space-y-1">
                          {diligenceData.key_risks.map((risk: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-red-500 mt-1">•</span>
                              <span>{risk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Mitigation Strategies */}
                    {diligenceData.mitigation_strategies && diligenceData.mitigation_strategies.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                          <Shield className="h-4 w-4 text-green-500" />
                          Mitigation Strategies
                        </h4>
                        <ul className="text-sm space-y-1">
                          {diligenceData.mitigation_strategies.map((strategy: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-green-500 mt-1">•</span>
                              <span>{strategy}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Due Diligence Next Steps */}
                    {diligenceData.due_diligence_next_steps && diligenceData.due_diligence_next_steps.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                          Due Diligence Next Steps
                        </h4>
                        <ul className="text-sm space-y-1">
                          {diligenceData.due_diligence_next_steps.map((step: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Investment Thesis */}
                    {diligenceData.investment_thesis && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                          Investment Thesis
                        </h4>
                        <p className="text-sm leading-relaxed">{diligenceData.investment_thesis}</p>
                      </div>
                    )}

                    {/* Synthesis Notes */}
                    {diligenceData.synthesis_notes && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                          Synthesis Notes
                        </h4>
                        <p className="text-sm leading-relaxed">{diligenceData.synthesis_notes}</p>
                      </div>
                    )}

                    {/* Overall Scores Summary */}
                    <div className="pt-4 border-t">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                        Overall Analysis Scores
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {diligenceData.problem_validation?.score && (
                          <div className="flex justify-between">
                            <span>Problem Validation:</span>
                            <span className="font-medium">{diligenceData.problem_validation.score}/10</span>
                          </div>
                        )}
                        {diligenceData.solution_product_market_fit?.score && (
                          <div className="flex justify-between">
                            <span>Product-Market Fit:</span>
                            <span className="font-medium">{diligenceData.solution_product_market_fit.score}/10</span>
                          </div>
                        )}
                        {diligenceData.team_execution_capability?.score && (
                          <div className="flex justify-between">
                            <span>Team Execution:</span>
                            <span className="font-medium">{diligenceData.team_execution_capability.score}/10</span>
                          </div>
                        )}
                        {diligenceData.traction_metrics_validation?.score && (
                          <div className="flex justify-between">
                            <span>Traction Validation:</span>
                            <span className="font-medium">{diligenceData.traction_metrics_validation.score}/10</span>
                          </div>
                        )}
                        {diligenceData.founder_market_fit?.score && (
                          <div className="flex justify-between">
                            <span>Founder-Market Fit:</span>
                            <span className="font-medium">{diligenceData.founder_market_fit.score}/10</span>
                          </div>
                        )}
                        {diligenceData.market_opportunity_competition?.score && (
                          <div className="flex justify-between">
                            <span>Market Opportunity:</span>
                            <span className="font-medium">{diligenceData.market_opportunity_competition.score}/10</span>
                          </div>
                        )}
                        {diligenceData.benchmarking_analysis?.score && (
                          <div className="flex justify-between">
                            <span>Benchmarking:</span>
                            <span className="font-medium">{diligenceData.benchmarking_analysis.score}/10</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No diligence data found
                    </p>
                                        </div>
                )}
                                </CardContent>
                            </Card>
                        </div>

          {diligenceData && (
            <div className="flex justify-center">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule AI Interview
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="memo2">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Interview Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Interview Summary
                </CardTitle>
                <CardDescription>
                  Key insights from the AI-powered interview with the founder.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                    Interview Overview
                  </h4>
                  <p className="text-sm leading-relaxed">
                    Conducted a comprehensive 45-minute AI interview with Abhishek Shirsath, Founder & CEO of Arealis Gateway. The interview covered business model validation, market strategy, team dynamics, and execution capabilities.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                    Key Discussion Points
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Revenue model validation and pricing strategy</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Customer acquisition and retention metrics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Technical architecture and scalability plans</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Competitive positioning and differentiation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Team expansion and hiring strategy</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                    Interview Duration
                  </h4>
                  <p className="text-sm">45 minutes | 23 questions asked | 18 follow-up clarifications</p>
                </div>
              </CardContent>
            </Card>

            {/* Founder Assessment Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Founder Assessment
                </CardTitle>
                <CardDescription>
                  Analysis of founder's responses and leadership qualities.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                    Communication Style
                  </h4>
                  <p className="text-sm leading-relaxed">
                    Clear and articulate in explaining complex technical concepts. Demonstrates strong product vision but occasionally struggles with specific metrics and timelines.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                    Leadership Indicators
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Strong technical background and hands-on approach</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Clear vision for product-market fit</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">⚠</span>
                      <span>Limited experience in enterprise sales</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">⚠</span>
                      <span>Uncertain about scaling team beyond current size</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                    Risk Assessment
                  </h4>
                  <p className="text-sm leading-relaxed">
                    Moderate risk profile. Strong technical execution but concerns about business development and enterprise sales capabilities.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Business Model Validation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Business Model Validation
              </CardTitle>
              <CardDescription>
                Detailed analysis of revenue streams and business sustainability.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                    Revenue Streams
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">Transaction Fees (0.25-0.35%)</span>
                      <Badge variant="outline">Primary</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">Subscription (₹7,999/month)</span>
                      <Badge variant="outline">Secondary</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">Loyalty Program Sponsorships</span>
                      <Badge variant="outline">Future</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                    Unit Economics
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Average Transaction Value:</span>
                      <span className="font-medium">₹2,500</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Commission per Transaction:</span>
                      <span className="font-medium">₹7.50</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Customer Acquisition Cost:</span>
                      <span className="font-medium">₹1,200</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payback Period:</span>
                      <span className="font-medium">160 transactions</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                  Key Insights
                </h4>
                <ul className="text-sm space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Revenue model is transaction-heavy, creating dependency on volume</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Subscription model needs stronger value proposition to drive adoption</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>Payback period is reasonable but requires consistent transaction volume</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Technical Deep Dive */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Technical Deep Dive
              </CardTitle>
              <CardDescription>
                Assessment of technical architecture and scalability.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                    Architecture Strengths
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Microservices-based architecture</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>AI-powered transaction routing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Real-time compliance monitoring</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Unified API for multiple payment gateways</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                    Scalability Concerns
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">⚠</span>
                      <span>Database optimization for high-volume transactions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">⚠</span>
                      <span>AI model training and inference costs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">⚠</span>
                      <span>Third-party API rate limits and reliability</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">⚠</span>
                      <span>Security and compliance at scale</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                  Technical Recommendations
                </h4>
                <p className="text-sm leading-relaxed">
                  Implement comprehensive load testing, establish disaster recovery protocols, and develop a clear roadmap for AI model optimization. Consider implementing edge computing for real-time processing and establish partnerships with cloud providers for better scalability.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Market Strategy Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Market Strategy Analysis
              </CardTitle>
              <CardDescription>
                Evaluation of go-to-market strategy and competitive positioning.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                    Target Market
                  </h4>
                  <p className="text-sm leading-relaxed">
                    Primary focus on Indian MSMEs (10-500 employees) with digital payment needs. Secondary market includes mid-market enterprises seeking compliance automation.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                    Competitive Advantage
                  </h4>
                  <p className="text-sm leading-relaxed">
                    AI-driven smart routing reduces transaction costs by 15-20% compared to traditional payment processors. Real-time compliance adaptation provides regulatory advantage.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                    Go-to-Market
                  </h4>
                  <p className="text-sm leading-relaxed">
                    Content-driven approach with focus on educational content about payment optimization. Partnership strategy with fintech consultants and business advisors.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                  Market Validation
                </h4>
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-800">Strong Market Demand</p>
                    <p className="text-xs text-green-600">92% merchant retention rate indicates product-market fit</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm font-medium text-yellow-800">Competitive Pressure</p>
                    <p className="text-xs text-yellow-600">Established players with significant market share</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interview Conclusion */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Interview Conclusion
              </CardTitle>
              <CardDescription>
                Overall assessment and next steps based on the interview.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                  Key Takeaways
                </h4>
                <ul className="text-sm space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Strong technical foundation with innovative AI-driven approach</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Clear product-market fit demonstrated through retention metrics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>Execution risk in scaling to enterprise market</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>Need for stronger business development capabilities</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                  Recommended Next Steps
                </h4>
                <ul className="text-sm space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">1.</span>
                    <span>Conduct technical due diligence with independent experts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">2.</span>
                    <span>Validate customer references and case studies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">3.</span>
                    <span>Assess team's ability to scale business operations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">4.</span>
                    <span>Review financial projections and unit economics</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-800 mb-2">Interview Confidence Score</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-blue-800">7.5/10</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">Strong technical execution, moderate business development risk</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="final">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Final Summary Card */}
                            <Card>
                                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Final Summary
                </CardTitle>
                <CardDescription>
                  A synthesized overview combining Memo 1 and Memo 2.
                </CardDescription>
                                </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm leading-relaxed">
                    {memo1.title || 'This company'} represents a high-risk, high-reward opportunity. The core thesis rests on a game-changing, efficient GTM strategy explained by the founder as "content-driven." However, there are significant execution risks in moving to enterprise clients, clarification needed on initial ARR discrepancy, lack of polish, and an aggressive valuation predicated on a future state (successful enterprise sales) that is entirely unproven.
                  </p>
                </div>
                                </CardContent>
                            </Card>

            {/* Investment Recommendation Card */}
                            <Card>
                                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Investment Recommendation
                </CardTitle>
                <CardDescription>
                  The AI's final recommendation based on all available data.
                </CardDescription>
                                </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="font-semibold text-blue-800">
                      <strong>Proceed to Partner Meeting with Caution.</strong>
                    </p>
                  </div>
                  <p className="text-sm leading-relaxed">
                    The potential upside from the GTM efficiency warrants further investigation, but the execution risk on the enterprise side must be the central focus of the next diligence stage. The investment should be contingent on strong validation of organic lead sources and a deeper assessment of the new enterprise sales strategy.
                  </p>
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
                </TabsContent>
            </Tabs>
        </div>
    );
}
