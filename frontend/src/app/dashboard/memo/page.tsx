'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, TrendingUp, Users, Upload } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

// Import our new components
import MemoHeader from '@/components/memo/MemoHeader';
import Memo1Tab from '@/components/memo/Memo1Tab';
import Memo2Tab from '@/components/memo/Memo2Tab';
import Memo3Tab from '@/components/memo/Memo3Tab';
import MemoDebug from '@/components/memo/MemoDebug';

interface MemoData {
  id: string;
  memo_1?: {
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
    summary_analysis?: string;
    market_size?: string;
    traction?: string;
    team?: string;
  };
  filename?: string;
}

interface DiligenceData {
  investment_recommendation?: string;
  problem_validation?: { analysis: string; market_size_assessment?: string; score?: number };
  solution_product_market_fit?: { analysis: string; competitive_advantages?: string[]; score?: number };
  team_execution_capability?: { analysis: string; relevant_experience?: string[]; score?: number };
  founder_market_fit?: { analysis: string; founder_profile?: { name: string; role_and_contributions: string; company_founded: string }; key_insights?: string[]; score?: number };
  market_opportunity_competition?: { analysis: string; market_opportunities?: string; competitive_landscape?: string; score?: number };
  benchmarking_analysis?: { analysis: string; competitive_positioning?: string; confidence_score?: number; differentiation_factors?: string[]; competitive_threats?: string[]; score?: number };
  traction_metrics_validation?: { analysis: string; growth_trajectory?: string; metrics_validation?: string; score?: number };
  key_risks?: string[];
  mitigation_strategies?: string[];
  due_diligence_next_steps?: string[];
  investment_thesis?: string;
  synthesis_notes?: string;
  overall_score?: number;
  [key: string]: any;
}

export default function DealMemoPage() {
  const [memoData, setMemoData] = useState<MemoData | null>(null);
  const [diligenceData, setDiligenceData] = useState<DiligenceData | null>(null);
  const [availableMemos, setAvailableMemos] = useState<MemoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("memo1");
  const [hasRecentData, setHasRecentData] = useState(false);
  const [user, loadingAuth] = useAuthState(auth);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loadingAuth && user) {
      fetchMemoData();
      
      // Set up real-time listener for new data
      const unsubscribe = () => {
        // Refresh data every 30 seconds to catch new memos
        const interval = setInterval(() => {
          if (user) {
            fetchMemoData();
          }
        }, 30000);
        
        return () => clearInterval(interval);
      };
      
      const cleanup = unsubscribe();
      return cleanup;
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

      // First, try to fetch memos created by the current user
      let ingestionQuery = query(
        collection(db, 'ingestionResults'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(1)
      );

      let ingestionSnapshot = await getDocs(ingestionQuery);

      // If no memos found for current user, try to fetch all available memos
      // This allows investors to see memos created by founders
      if (ingestionSnapshot.empty) {
        console.log('No memos found for current user, fetching all available memos...');
        
        // Fetch multiple memos for selection
        const allMemosQuery = query(
          collection(db, 'ingestionResults'),
          orderBy('timestamp', 'desc'),
          limit(10)
        );
        const allMemosSnapshot = await getDocs(allMemosQuery);
        
        if (!allMemosSnapshot.empty) {
          const memos: MemoData[] = [];
          allMemosSnapshot.docs.forEach((doc) => {
            const data = doc.data();
            const memo1Data = data.memo_1 || {};
            const memo: MemoData = {
              id: doc.id,
              filename: data.original_filename || 'Unknown File',
              memo_1: {
                title: memo1Data.title || memo1Data.company_name || 'Company Analysis',
                summary: memo1Data.summary_analysis || memo1Data.summary || 'No summary available',
                business_model: memo1Data.business_model || memo1Data.business_model_description || 'No business model data',
                market_analysis: memo1Data.market_size || memo1Data.market_analysis || memo1Data.target_market || 'No market analysis',
                financial_projections: memo1Data.traction || memo1Data.financial_projections || memo1Data.revenue_model || 'No financial data',
                team_info: memo1Data.team || memo1Data.team_description || memo1Data.founding_team || 'No team information',
                problem: memo1Data.problem || memo1Data.problem_statement || 'No problem statement',
                solution: memo1Data.solution || memo1Data.solution_description || 'No solution description',
                competition: memo1Data.competition || memo1Data.competitors || [],
                initial_flags: memo1Data.initial_flags || memo1Data.red_flags || [],
                validation_points: memo1Data.validation_points || memo1Data.key_validation_points || [],
                founder_name: memo1Data.founder_name || memo1Data.founder || 'Unknown',
                founder_linkedin_url: memo1Data.founder_linkedin_url || memo1Data.founder_linkedin || '',
                company_linkedin_url: memo1Data.company_linkedin_url || memo1Data.company_linkedin || '',
                timestamp: data.timestamp,
                // Additional fields that might be in the data
                summary_analysis: memo1Data.summary_analysis || memo1Data.executive_summary,
                market_size: memo1Data.market_size || memo1Data.total_addressable_market,
                traction: memo1Data.traction || memo1Data.key_metrics,
                team: memo1Data.team || memo1Data.team_overview
              }
            };
            memos.push(memo);
          });
          setAvailableMemos(memos);
          setLoading(false);
          return;
        }
        
        // Fallback to single memo if no multiple memos found
        ingestionQuery = query(
          collection(db, 'ingestionResults'),
          orderBy('timestamp', 'desc'),
          limit(1)
        );
        ingestionSnapshot = await getDocs(ingestionQuery);
      }

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
            title: memo1Data.title || memo1Data.company_name || 'Company Analysis',
            summary: memo1Data.summary_analysis || memo1Data.summary || 'No summary available',
            business_model: memo1Data.business_model || memo1Data.business_model_description || 'No business model data',
            market_analysis: memo1Data.market_size || memo1Data.market_analysis || memo1Data.target_market || 'No market analysis',
            financial_projections: memo1Data.traction || memo1Data.financial_projections || memo1Data.revenue_model || 'No financial data',
            team_info: memo1Data.team || memo1Data.team_description || memo1Data.founding_team || 'No team information',
            problem: memo1Data.problem || memo1Data.problem_statement || 'No problem statement',
            solution: memo1Data.solution || memo1Data.solution_description || 'No solution description',
            competition: memo1Data.competition || memo1Data.competitors || [],
            initial_flags: memo1Data.initial_flags || memo1Data.red_flags || [],
            validation_points: memo1Data.validation_points || memo1Data.key_validation_points || [],
            founder_name: memo1Data.founder_name || memo1Data.founder || 'Unknown',
            founder_linkedin_url: memo1Data.founder_linkedin_url || memo1Data.founder_linkedin || '',
            company_linkedin_url: memo1Data.company_linkedin_url || memo1Data.company_linkedin || '',
            timestamp: ingestionData.timestamp,
            // Additional fields that might be in the data
            summary_analysis: memo1Data.summary_analysis || memo1Data.executive_summary,
            market_size: memo1Data.market_size || memo1Data.total_addressable_market,
            traction: memo1Data.traction || memo1Data.key_metrics,
            team: memo1Data.team || memo1Data.team_overview
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

  // Function to select a memo from available memos
  const selectMemo = (selectedMemo: MemoData) => {
    setMemoData(selectedMemo);
    setHasRecentData(true);
    setAvailableMemos([]);
    
    // Fetch diligence data for the selected memo
    fetchDiligenceData(selectedMemo.id);
  };

  // Function to fetch diligence data for a specific memo
  const fetchDiligenceData = async (memoId: string) => {
    try {
      const diligenceQuery = query(
        collection(db, 'diligenceResults'),
        where('memoId', '==', memoId),
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
  };

  // Test function to verify memo display
  const testMemoDisplay = () => {
    const testMemoData: MemoData = {
      id: 'test-123',
      filename: 'test-pitch-deck.pdf',
      memo_1: {
        title: 'Test Company Inc.',
        summary: 'This is a test company for verifying memo display functionality.',
        business_model: 'SaaS subscription model with enterprise clients',
        market_analysis: '$50B TAM in the enterprise software market',
        financial_projections: '$1M ARR with 20% month-over-month growth',
        team_info: 'Experienced team with 10+ years in enterprise software',
        problem: 'Enterprise companies struggle with inefficient data processing',
        solution: 'AI-powered data processing platform that reduces processing time by 80%',
        competition: ['Competitor A', 'Competitor B', 'Competitor C'],
        initial_flags: ['High customer acquisition cost', 'Limited market validation'],
        validation_points: ['Customer references', 'Technical due diligence', 'Market size validation'],
        founder_name: 'John Doe',
        founder_linkedin_url: 'https://linkedin.com/in/johndoe',
        company_linkedin_url: 'https://linkedin.com/company/test-company',
        timestamp: new Date().toISOString()
      }
    };

    setMemoData(testMemoData);
    setHasRecentData(true);
    setLoading(false);

    toast({
      title: "Test Data Loaded",
      description: "Mock memo data has been loaded for testing display.",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show available memos selection if we have multiple memos
  if (availableMemos.length > 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Available Deal Memos</h1>
            <p className="text-muted-foreground mt-1">
              Select a deal memo to review and analyze
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {availableMemos.map((memo) => (
            <Card key={memo.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => selectMemo(memo)}>
              <CardHeader>
                <CardTitle className="text-lg">{memo.memo_1?.title || 'Company Analysis'}</CardTitle>
                <CardDescription>
                  {memo.memo_1?.founder_name || 'Unknown Founder'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <strong>File:</strong> {memo.filename}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Company:</strong> {memo.memo_1?.title || 'Unknown Company'}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {memo.memo_1?.summary || 'No summary available'}
                  </p>
                </div>
                <Button className="w-full mt-4" size="sm">
                  View Memo
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button
            onClick={() => window.location.href = '/dashboard/create-room'}
            variant="outline"
            className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
          >
            <Upload className="mr-2 h-4 w-4" />
            Create New Investment Room
          </Button>
        </div>
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
            Create investment rooms to connect with founders and access AI-powered deal analysis and due diligence reports.
          </p>
          <div className="space-y-4">
            <Button
              onClick={() => window.location.href = '/dashboard/create-room'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="mr-2 h-4 w-4" />
              Create Investment Room
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

  return (
    <div className="space-y-6">
      {/* Data Status Banner */}
      {memoData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-800">Live Data</span>
              <span className="text-xs text-blue-600">
                Last updated: {memoData.memo_1?.timestamp ? 
                  new Date(memoData.memo_1.timestamp.seconds * 1000).toLocaleString() : 
                  'Recently'
                }
              </span>
            </div>
            <button 
              onClick={fetchMemoData}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Refresh Data
            </button>
          </div>
        </div>
      )}

      <MemoHeader 
        memoData={memoData}
        diligenceData={diligenceData}
        onTriggerDiligence={() => {}}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="memo1">Memo 1: Initial Analysis</TabsTrigger>
          <TabsTrigger value="memo2">Memo 2: Interview Analysis</TabsTrigger>
          <TabsTrigger value="memo3">Memo 3: Final Decision</TabsTrigger>
        </TabsList>

        <TabsContent value="memo1">
          <Memo1Tab memo1={memoData.memo_1 || {}} />
        </TabsContent>

        <TabsContent value="memo2">
          <Memo2Tab diligenceData={diligenceData} />
        </TabsContent>

        <TabsContent value="memo3">
          <Memo3Tab diligenceData={diligenceData} />
        </TabsContent>
      </Tabs>

      <MemoDebug
        user={user}
        loading={loading}
        hasRecentData={hasRecentData}
        memoData={memoData}
        diligenceData={diligenceData}
        onRefresh={fetchMemoData}
        onTestMemo={testMemoDisplay}
      />
    </div>
  );
}
