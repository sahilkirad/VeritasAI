'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, TrendingUp, Users, DollarSign, Target, AlertTriangle, CheckCircle, BarChart3, User, Building, Shield, Upload, ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from 'next/navigation';
import { safeJsonResponse, API_ENDPOINTS } from '@/lib/api';
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

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
  const [user, loadingAuth] = useAuthState(auth);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loadingAuth && user) {
      fetchMemoData();
    } else if (!loadingAuth && !user) {
      setLoading(false);
    }
  }, [user, loadingAuth]);

  const fetchMemoData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching memo data from Firestore...');
      
      // Fetch from ingestionResults collection (Memo1 data)
      const ingestionQuery = query(
        collection(db, 'ingestionResults'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(1)
      );
      
      const ingestionSnapshot = await getDocs(ingestionQuery);
      
      if (!ingestionSnapshot.empty) {
        const ingestionDoc = ingestionSnapshot.docs[0];
        const ingestionData = ingestionDoc.data();
        
        console.log('Ingestion Data:', ingestionData);
        console.log('Memo 1 Data:', ingestionData.memo_1);
        
        // Create memo data structure - the actual data is in memo_1 field
        const memo1Data = ingestionData.memo_1 || {};
        const memoData: MemoData = {
          id: ingestionDoc.id,
          filename: ingestionData.original_filename || 'Unknown File',
          memo_1: {
            title: memo1Data.title || 'Company Analysis',
            summary: memo1Data.summary_analysis || 'No summary available',
            business_model: memo1Data.business_model || 'No business model data',
            market_analysis: memo1Data.market_size || 'No market analysis',
            financial_projections: memo1Data.traction || 'No financial data',
            team_info: memo1Data.team || 'No team information',
            problem: memo1Data.problem || 'No problem statement',
            solution: memo1Data.solution || 'No solution description',
            competition: memo1Data.competition || [],
            initial_flags: memo1Data.initial_flags || [],
            validation_points: memo1Data.validation_points || [],
            founder_name: memo1Data.founder_name || 'Unknown',
            founder_linkedin_url: memo1Data.founder_linkedin_url || '',
            company_linkedin_url: memo1Data.company_linkedin_url || '',
            timestamp: ingestionData.timestamp
          }
        };
        
        setMemoData(memoData);
        setHasRecentData(true);
        
        // Fetch diligence data from diligenceResults collection
        try {
          const diligenceQuery = query(
            collection(db, 'diligenceResults'),
            where('memoId', '==', ingestionDoc.id),
            orderBy('timestamp', 'desc'),
            limit(1)
          );
          
          const diligenceSnapshot = await getDocs(diligenceQuery);
          
          if (!diligenceSnapshot.empty) {
            const diligenceDoc = diligenceSnapshot.docs[0];
            const diligenceData = diligenceDoc.data();
            
            console.log('Diligence Data:', diligenceData);
            
            // Map diligence data to our interface
            const mappedDiligenceData: DiligenceData = {
              investment_recommendation: diligenceData.investment_recommendation,
              problem_validation: diligenceData.problem_validation,
              solution_product_market_fit: diligenceData.solution_product_market_fit,
              team_execution_capability: diligenceData.team_execution_capability,
              founder_market_fit: diligenceData.founder_market_fit,
              market_opportunity_competition: diligenceData.market_opportunity_competition,
              benchmarking_analysis: diligenceData.benchmarking_analysis,
              traction_metrics_validation: diligenceData.traction_metrics_validation,
              key_risks: diligenceData.key_risks,
              mitigation_strategies: diligenceData.mitigation_strategies,
              due_diligence_next_steps: diligenceData.due_diligence_next_steps,
              investment_thesis: diligenceData.investment_thesis,
              synthesis_notes: diligenceData.synthesis_notes,
              overall_score: diligenceData.overall_score
            };
            
            setDiligenceData(mappedDiligenceData);
          } else {
            console.log('No diligence data found');
            setDiligenceData(null);
          }
        } catch (diligenceError) {
          console.error('Error fetching diligence data:', diligenceError);
          setDiligenceData(null);
        }
      } else {
        console.log('No ingestion data found');
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

  const handleTriggerDiligence = async () => {
    if (!memoData?.id) {
      toast({
        title: "Error",
        description: "No memo data available to trigger diligence",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.TRIGGER_DILIGENCE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          memoId: memoData.id,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to trigger diligence: ${response.status}`);
      }

      const result = await response.json();
      
      toast({
        title: "Diligence Triggered",
        description: "Due diligence analysis has been started. This may take a few minutes.",
      });

      // Refresh the page after a short delay to show updated status
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Error triggering diligence:', error);
      toast({
        title: "Error",
        description: "Failed to trigger diligence. Please try again.",
        variant: "destructive",
      });
    }
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
          {diligenceData ? (
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              Diligence Complete
            </Badge>
          ) : (
            <Button 
              onClick={handleTriggerDiligence}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Start Diligence
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="memo1">Memo 1: Initial Analysis</TabsTrigger>
          <TabsTrigger value="memo2">Memo 2: Interview Analysis</TabsTrigger>
          <TabsTrigger value="memo3">Memo 3: Final Decision</TabsTrigger>
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

        <TabsContent value="memo2" className="space-y-6">
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
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                      </div>
                      <span className="text-sm font-medium text-blue-800">8.0/10</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">Strong technical execution, needs business development support</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="memo3">
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
                </TabsContent>
            </Tabs>

            {/* Debug Section - Remove this in production */}
            {process.env.NODE_ENV === 'development' && memoData && (
              <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-semibold mb-2">Debug Information</h3>
                <div className="text-xs space-y-2">
                  <div><strong>Document ID:</strong> {memoData.id}</div>
                  <div><strong>Filename:</strong> {memoData.filename}</div>
                  <div><strong>Has Memo Data:</strong> {memoData.memo_1 ? 'Yes' : 'No'}</div>
                  <div><strong>Has Diligence Data:</strong> {diligenceData ? 'Yes' : 'No'}</div>
                  <details className="mt-2">
                    <summary className="cursor-pointer font-medium">Raw Memo Data</summary>
                    <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-40">
                      {JSON.stringify(memoData.memo_1, null, 2)}
                    </pre>
                  </details>
                  {diligenceData && (
                    <details className="mt-2">
                      <summary className="cursor-pointer font-medium">Raw Diligence Data</summary>
                      <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-40">
                        {JSON.stringify(diligenceData, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            )}
        </div>
    );
}
