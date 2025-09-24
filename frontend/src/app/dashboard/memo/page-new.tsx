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

  return (
    <div className="space-y-6">
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
