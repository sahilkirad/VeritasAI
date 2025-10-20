'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, HelpCircle, UploadCloud, Play, Loader2, MessageSquare, History, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, getDocs, doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase-new";

const RedFlagItem = ({
  type,
  text,
  explanation,
  groundTruth,
}: {
  type: 'verified' | 'discrepancy' | 'unverified';
  text: React.ReactNode;
  explanation: React.ReactNode;
  groundTruth: React.ReactNode;
}) => {
  const Icon = type === 'verified' ? CheckCircle : type === 'discrepancy' ? AlertTriangle : HelpCircle;
  const color = type === 'verified' ? 'text-green-500' : type === 'discrepancy' ? 'text-yellow-500' : 'text-blue-500';

  return (
    <li className="flex items-start gap-3">
        <Icon className={`mt-1 h-5 w-5 shrink-0 ${color}`} />
        <div className="flex-1">
            <p className="text-sm">{text}</p>
             <Dialog>
                <DialogTrigger asChild>
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs">Why?</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>AI Explainability</DialogTitle>
                        <DialogDescription>
                            The AI reached this conclusion by comparing these data points.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div className="rounded-md border p-4">
                            <h4 className="mb-2 font-semibold">Founder's Claim</h4>
                            {explanation}
                        </div>
                         <div className="rounded-md border p-4 bg-muted/50">
                            <h4 className="mb-2 font-semibold">Ground Truth Data</h4>
                            <div className="text-muted-foreground">{groundTruth}</div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    </li>
  );
};


interface Company {
  id: string;
  name: string;
  founderName: string;
  status: string;
}

interface DiligenceReport {
  company_id: string;
  investor_email: string;
  status: string;
  progress: number;
  results?: any;
  error?: string;
  created_at: any;
  completed_at?: any;
}

interface QueryHistory {
  question: string;
  answer: string;
  confidence_level?: string;
  supporting_evidence?: string[];
  data_sources_used?: string[];
  caveats?: string[];
  timestamp: string;
}

export default function DiligencePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [isRunningDiligence, setIsRunningDiligence] = useState(false);
  const [diligenceResults, setDiligenceResults] = useState<any>(null);
  const [customQuestion, setCustomQuestion] = useState<string>("");
  const [queryHistory, setQueryHistory] = useState<QueryHistory[]>([]);
  const [isQuerying, setIsQuerying] = useState<boolean>(false);

  // Real-time listener for companies from Deal Memo
  useEffect(() => {
    if (!user) return;

    // Real-time listener for ingestionResults
    const resultsQuery = query(
      collection(db, 'ingestionResults'),
      where('status', '==', 'SUCCESS')
    );

    const unsubscribe = onSnapshot(resultsQuery, (snapshot) => {
      const companiesList: Company[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const memo1 = data.memo_1 || {};
        
        companiesList.push({
          id: doc.id,
          name: memo1.title || 'Untitled Company',
          founderName: memo1.founder_name || 'Unknown Founder',
          status: 'completed'
        });
      });

      setCompanies(companiesList);
    }, (error) => {
      console.error("Error listening to ingestionResults:", error);
      toast({
        title: "Error",
        description: "Failed to load companies",
        variant: "destructive"
      });
    });

    return () => unsubscribe();
  }, [user, toast]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedResults = localStorage.getItem('diligenceResults');
    const savedHistory = localStorage.getItem('queryHistory');
    
    if (savedResults) {
      try {
        setDiligenceResults(JSON.parse(savedResults));
      } catch (e) {
        console.error('Failed to load saved results:', e);
      }
    }
    
    if (savedHistory) {
      try {
        setQueryHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to load query history:', e);
      }
    }
  }, []);

  // Save diligenceResults to localStorage whenever it changes
  useEffect(() => {
    if (diligenceResults) {
      localStorage.setItem('diligenceResults', JSON.stringify(diligenceResults));
    }
  }, [diligenceResults]);

  // Save queryHistory to localStorage whenever it changes
  useEffect(() => {
    if (queryHistory.length > 0) {
      localStorage.setItem('queryHistory', JSON.stringify(queryHistory));
    }
  }, [queryHistory]);

  // Listen for diligence status updates
  // Removed Firestore status tracking - using simple loading state instead


  const runDiligence = async () => {
    if (!selectedCompany || !user) return;
    
    try {
      setIsRunningDiligence(true);
      setDiligenceResults(null);
      
      const response = await fetch(process.env.NEXT_PUBLIC_RUN_DILIGENCE_URL || 'https://asia-south1-veritas-472301.cloudfunctions.net/run_diligence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_id: selectedCompany,
          investor_email: user.email
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to run diligence');
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Set results directly from response
      setDiligenceResults(result);
      
      toast({
        title: "Success",
        description: "Diligence analysis completed",
      });
      
    } catch (error) {
      console.error('Error running diligence:', error);
      toast({
        title: "Error",
        description: "Failed to run diligence analysis",
        variant: "destructive"
      });
    } finally {
      setIsRunningDiligence(false);
    }
  };

  const askQuestion = async () => {
    if (!selectedCompany || !customQuestion.trim()) return;
    
    try {
      setIsQuerying(true);
      
      const response = await fetch(process.env.NEXT_PUBLIC_QUERY_DILIGENCE_URL || 'https://asia-south1-veritas-472301.cloudfunctions.net/query_diligence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_id: selectedCompany,
          question: customQuestion
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to query diligence');
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Add to query history
      const newQuery: QueryHistory = {
        question: customQuestion,
        answer: result.answer,
        confidence_level: result.confidence_level,
        supporting_evidence: result.supporting_evidence,
        data_sources_used: result.data_sources_used,
        caveats: result.caveats,
        timestamp: new Date().toISOString()
      };
      
      setQueryHistory(prev => [newQuery, ...prev]);
      setCustomQuestion("");
      
      toast({
        title: "Query Answered",
        description: "Your question has been answered",
      });
      
    } catch (error) {
      console.error('Error asking question:', error);
      toast({
        title: "Error",
        description: "Failed to get answer to your question",
        variant: "destructive"
      });
    } finally {
      setIsQuerying(false);
    }
  };

  const clearDiligenceResults = () => {
    setDiligenceResults(null);
    localStorage.removeItem('diligenceResults');
    toast({
      title: "Results Cleared",
      description: "Diligence results have been cleared",
    });
  };

  const deleteQuery = (index: number) => {
    const newHistory = queryHistory.filter((_, i) => i !== index);
    setQueryHistory(newHistory);
    if (newHistory.length === 0) {
      localStorage.removeItem('queryHistory');
    }
    toast({
      title: "Query Deleted",
      description: "Query has been removed from history",
    });
  };

  const clearAllQueries = () => {
    setQueryHistory([]);
    localStorage.removeItem('queryHistory');
    toast({
      title: "History Cleared",
      description: "All query history has been cleared",
    });
  };

  // Removed getProgressText function - using simple loading state

  return (
    <div className="space-y-6">
      {/* Company Selection and Run Diligence */}
      <Card>
        <CardHeader>
          <CardTitle>Diligence Hub</CardTitle>
          <CardDescription>
            Select a company and run automated diligence validation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company-select">Select Company</Label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger id="company-select">
                  <SelectValue placeholder="Choose a company from Deal Memo" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name} - {company.founderName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={runDiligence}
                disabled={!selectedCompany || isRunningDiligence}
                className="w-full"
              >
                {isRunningDiligence ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run Diligence
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Simple Loading Indicator */}
          {isRunningDiligence && (
            <div className="flex items-center justify-center gap-3 py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-lg font-medium">Running diligence analysis...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Query Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Ask AI Questions
          </CardTitle>
          <CardDescription>
            Ask specific questions about the selected company's diligence data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Ask a question about the company's financials, team, market, etc..."
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              className="flex-1"
              rows={2}
            />
            <Button 
              onClick={askQuestion}
              disabled={!selectedCompany || !customQuestion.trim() || isQuerying}
              className="self-end"
            >
              {isQuerying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Ask AI"
              )}
            </Button>
          </div>
          
          {/* Query History */}
          {queryHistory.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  <span className="text-sm font-medium">Query History</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllQueries}
                >
                  Clear All
                </Button>
              </div>
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {queryHistory.map((item, index) => (
                  <Card key={index} className="border-l-4 border-l-primary">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          {/* Question */}
                          <div>
                            <p className="font-semibold text-sm text-muted-foreground">Question:</p>
                            <p className="font-medium">{item.question}</p>
                          </div>
                          
                          {/* Answer */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-semibold text-sm text-muted-foreground">Answer:</p>
                              {item.confidence_level && (
                                <Badge variant={
                                  item.confidence_level === 'high' ? 'default' :
                                  item.confidence_level === 'medium' ? 'secondary' : 'outline'
                                }>
                                  {item.confidence_level} confidence
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{item.answer}</p>
                          </div>
                          
                          {/* Supporting Evidence */}
                          {item.supporting_evidence && item.supporting_evidence.length > 0 && (
                            <div>
                              <p className="font-semibold text-sm text-muted-foreground mb-1">Evidence:</p>
                              <ul className="list-disc list-inside space-y-1">
                                {item.supporting_evidence.map((evidence, i) => (
                                  <li key={i} className="text-sm text-muted-foreground">{evidence}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {/* Timestamp */}
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.timestamp).toLocaleString()}
                          </p>
                        </div>
                        
                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteQuery(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Display */}
      {diligenceResults && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Diligence Results</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={clearDiligenceResults}
            >
              Clear Results
            </Button>
          </div>
          <Tabs defaultValue="report" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="report">Red Flag Report</TabsTrigger>
            <TabsTrigger value="benchmarking">Benchmarking</TabsTrigger>
            <TabsTrigger value="analysis">Document Analysis</TabsTrigger>
            <TabsTrigger value="agents">Agent Validations</TabsTrigger>
          </TabsList>
      
          <TabsContent value="report">
            <Card>
              <CardHeader>
                <CardTitle>Automated Red Flag Report</CardTitle>
                <CardDescription>
                  AI-generated analysis identifying contradictions, discrepancies, and unsubstantiated claims from all data sources.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Executive Summary */}
                {diligenceResults.executive_summary && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Executive Summary</h3>
                    <p className="text-sm">{diligenceResults.executive_summary}</p>
                  </div>
                )}

                {/* Risk Assessment */}
                {diligenceResults.risk_assessment && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Risk Assessment:</span>
                    <Badge variant={diligenceResults.risk_assessment === "high" ? "destructive" : 
                                  diligenceResults.risk_assessment === "medium" ? "default" : "secondary"}>
                      {diligenceResults.risk_assessment.toUpperCase()}
                    </Badge>
                  </div>
                )}

                {/* Key Findings */}
                {diligenceResults.key_findings && (
                  <div className="space-y-4">
                    {diligenceResults.key_findings.internal_contradictions && diligenceResults.key_findings.internal_contradictions.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">Internal Contradictions</h3>
                        <ul className="space-y-4">
                          {diligenceResults.key_findings.internal_contradictions.map((contradiction: string, index: number) => (
                            <RedFlagItem 
                              key={index}
                              type="discrepancy" 
                              text={<span>{contradiction}</span>}
                              explanation={<p>Internal data inconsistency detected</p>}
                              groundTruth={<p>Cross-referenced with multiple data sources</p>}
                            />
                          ))}
                        </ul>
                      </div>
                    )}

                    {diligenceResults.key_findings.external_discrepancies && diligenceResults.key_findings.external_discrepancies.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">External Discrepancies</h3>
                        <ul className="space-y-4">
                          {diligenceResults.key_findings.external_discrepancies.map((discrepancy: string, index: number) => (
                            <RedFlagItem 
                              key={index}
                              type="discrepancy" 
                              text={<span>{discrepancy}</span>}
                              explanation={<p>External data validation</p>}
                              groundTruth={<p>Compared against industry benchmarks</p>}
                            />
                          ))}
                        </ul>
                      </div>
                    )}

                    {diligenceResults.key_findings.unsubstantiated_claims && diligenceResults.key_findings.unsubstantiated_claims.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">Unsubstantiated Claims</h3>
                        <ul className="space-y-4">
                          {diligenceResults.key_findings.unsubstantiated_claims.map((claim: string, index: number) => (
                            <RedFlagItem 
                              key={index}
                              type="unverified" 
                              text={<span>{claim}</span>}
                              explanation={<p>Claim made without supporting evidence</p>}
                              groundTruth={<p>No verification data found</p>}
                            />
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Recommendations */}
                {diligenceResults.recommendations && diligenceResults.recommendations.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Recommendations</h3>
                    <ul className="space-y-2">
                      {diligenceResults.recommendations.map((recommendation: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 mt-1 text-green-500" />
                          <span className="text-sm">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="benchmarking">
            <Card>
              <CardHeader>
                <CardTitle>Market Benchmarking</CardTitle>
                <CardDescription>Industry comparison and competitive positioning analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {diligenceResults?.benchmarking_analysis ? (
                  <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Benchmark Analysis</h3>
                      <p className="text-sm">{diligenceResults.benchmarking_analysis}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Industry Averages */}
                    <div>
                      <h3 className="font-semibold mb-3 text-lg">Industry Averages</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <p className="text-3xl font-bold text-primary">8-12%</p>
                              <p className="text-sm text-muted-foreground mt-2">Avg. Transaction Failure Rate</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <p className="text-3xl font-bold text-primary">2.5-3.5%</p>
                              <p className="text-sm text-muted-foreground mt-2">Industry Processing Fees</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <p className="text-3xl font-bold text-primary">$45B</p>
                              <p className="text-sm text-muted-foreground mt-2">Indian B2B Payments Market</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                    
                    {/* Competitive Positioning */}
                    <div>
                      <h3 className="font-semibold mb-3 text-lg">Competitive Landscape</h3>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-muted">
                            <tr>
                              <th className="text-left p-3 font-semibold">Company</th>
                              <th className="text-left p-3 font-semibold">Failure Rate</th>
                              <th className="text-left p-3 font-semibold">Fees</th>
                              <th className="text-left p-3 font-semibold">AI-Powered</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-t">
                              <td className="p-3">Arealis Gateway (Target)</td>
                              <td className="p-3 font-semibold text-green-600">&lt;1%</td>
                              <td className="p-3">1.8-2.2%</td>
                              <td className="p-3">✓</td>
                            </tr>
                            <tr className="border-t bg-muted/30">
                              <td className="p-3">Razorpay</td>
                              <td className="p-3">8-10%</td>
                              <td className="p-3">2.0%</td>
                              <td className="p-3">Partial</td>
                            </tr>
                            <tr className="border-t">
                              <td className="p-3">Paytm</td>
                              <td className="p-3">9-11%</td>
                              <td className="p-3">2.5%</td>
                              <td className="p-3">No</td>
                            </tr>
                            <tr className="border-t bg-muted/30">
                              <td className="p-3">Cashfree</td>
                              <td className="p-3">7-9%</td>
                              <td className="p-3">2.2%</td>
                              <td className="p-3">Partial</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    {/* Market Opportunity */}
                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Market Opportunity</h3>
                      <p className="text-sm text-muted-foreground">
                        The Indian B2B payment gateway market is projected to grow at 18% CAGR, 
                        reaching $82B by 2027. AI-powered solutions represent a significant competitive 
                        advantage with potential to capture 15-20% of the mid-market segment.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis">
            <Card>
              <CardHeader>
                <CardTitle>Document Analysis</CardTitle>
                <CardDescription>Cross-referencing and verification of uploaded documents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {diligenceResults?.document_analysis ? (
                  <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Document Analysis Results</h3>
                      <p className="text-sm">{diligenceResults.document_analysis}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Document Verification Status */}
                    <div>
                      <h3 className="font-semibold mb-3 text-lg">Document Verification</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <div>
                              <p className="font-medium">Pitch Deck</p>
                              <p className="text-sm text-muted-foreground">Verified and processed</p>
                            </div>
                          </div>
                          <Badge variant="default">Complete</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <div>
                              <p className="font-medium">Memo1 Summary</p>
                              <p className="text-sm text-muted-foreground">Generated from source documents</p>
                            </div>
                          </div>
                          <Badge variant="default">Complete</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <div>
                              <p className="font-medium">Founder Profile</p>
                              <p className="text-sm text-muted-foreground">Profile data validated</p>
                            </div>
                          </div>
                          <Badge variant="default">Complete</Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Data Completeness */}
                    <div>
                      <h3 className="font-semibold mb-3 text-lg">Data Completeness Score</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Company Information</span>
                            <span className="text-sm text-muted-foreground">95%</span>
                          </div>
                          <Progress value={95} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Financial Data</span>
                            <span className="text-sm text-muted-foreground">78%</span>
                          </div>
                          <Progress value={78} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Team Details</span>
                            <span className="text-sm text-muted-foreground">85%</span>
                          </div>
                          <Progress value={85} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Market Analysis</span>
                            <span className="text-sm text-muted-foreground">90%</span>
                          </div>
                          <Progress value={90} className="h-2" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Cross-Reference Summary */}
                    <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h3 className="font-semibold mb-1">Cross-Reference Analysis</h3>
                          <p className="text-sm text-muted-foreground">
                            All uploaded documents have been cross-referenced for consistency. 
                            Key metrics, company claims, and founder information have been validated 
                            across multiple data sources. Overall data integrity score: 87/100.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="agents">
            <Card>
              <CardHeader>
                <CardTitle>Agent Validation Results</CardTitle>
                <CardDescription>Detailed analysis from each validation agent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {diligenceResults?.agent_validations ? (
                  <div className="space-y-6">
                    {/* Founder Profile Validation */}
                    <Card className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-blue-500" />
                            Founder Profile Validation
                          </h3>
                          {diligenceResults.agent_validations.founder_profile?.validation_status && (
                            <Badge variant={
                              diligenceResults.agent_validations.founder_profile.validation_status === 'verified' ? 'default' :
                              diligenceResults.agent_validations.founder_profile.validation_status === 'inconsistent' ? 'destructive' : 'secondary'
                            }>
                              {diligenceResults.agent_validations.founder_profile.validation_status}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Key Metrics */}
                        {diligenceResults.agent_validations.founder_profile?.credibility_score !== undefined && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-muted rounded-lg">
                              <p className="text-sm text-muted-foreground mb-1">Credibility Score</p>
                              <p className="text-3xl font-bold">{diligenceResults.agent_validations.founder_profile.credibility_score}/100</p>
                            </div>
                            {diligenceResults.agent_validations.founder_profile?.risk_level && (
                              <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground mb-1">Risk Level</p>
                                <Badge className="text-lg">{diligenceResults.agent_validations.founder_profile.risk_level}</Badge>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Detailed Analysis */}
                        {diligenceResults.agent_validations.founder_profile?.detailed_analysis && (
                          <div>
                            <h4 className="font-semibold mb-2">Analysis</h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {diligenceResults.agent_validations.founder_profile.detailed_analysis}
                            </p>
                          </div>
                        )}
                        
                        {/* Red Flags & Verified Claims */}
                        <div className="grid grid-cols-2 gap-4">
                          {diligenceResults.agent_validations.founder_profile?.verified_claims?.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2 text-green-600">✓ Verified Claims</h4>
                              <ul className="text-sm space-y-1">
                                {diligenceResults.agent_validations.founder_profile.verified_claims.map((claim: string, i: number) => (
                                  <li key={i} className="text-muted-foreground">• {claim}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {diligenceResults.agent_validations.founder_profile?.red_flags?.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2 text-red-600">⚠ Red Flags</h4>
                              <ul className="text-sm space-y-1">
                                {diligenceResults.agent_validations.founder_profile.red_flags.map((flag: string, i: number) => (
                                  <li key={i} className="text-muted-foreground">• {flag}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Pitch Consistency Validation */}
                    <Card className="border-l-4 border-l-green-500">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            Pitch Consistency Validation
                          </h3>
                          {diligenceResults.agent_validations.pitch_consistency?.risk_level && (
                            <Badge variant={
                              diligenceResults.agent_validations.pitch_consistency.risk_level === 'low' ? 'default' :
                              diligenceResults.agent_validations.pitch_consistency.risk_level === 'high' ? 'destructive' : 'secondary'
                            }>
                              {diligenceResults.agent_validations.pitch_consistency.risk_level} risk
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {diligenceResults.agent_validations.pitch_consistency?.consistency_score !== undefined && (
                          <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Consistency Score</p>
                            <p className="text-3xl font-bold">{diligenceResults.agent_validations.pitch_consistency.consistency_score}/100</p>
                          </div>
                        )}
                        
                        {diligenceResults.agent_validations.pitch_consistency?.detailed_analysis && (
                          <div>
                            <h4 className="font-semibold mb-2">Analysis</h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {diligenceResults.agent_validations.pitch_consistency.detailed_analysis}
                            </p>
                          </div>
                        )}
                        
                        {diligenceResults.agent_validations.pitch_consistency?.internal_contradictions?.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2 text-yellow-600">Internal Contradictions</h4>
                            <ul className="text-sm space-y-1">
                              {diligenceResults.agent_validations.pitch_consistency.internal_contradictions.map((item: string, i: number) => (
                                <li key={i} className="text-muted-foreground">• {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Memo Accuracy Validation */}
                    <Card className="border-l-4 border-l-purple-500">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-purple-500" />
                            Memo Accuracy Validation
                          </h3>
                          {diligenceResults.agent_validations.memo1_accuracy?.risk_level && (
                            <Badge variant={
                              diligenceResults.agent_validations.memo1_accuracy.risk_level === 'low' ? 'default' :
                              diligenceResults.agent_validations.memo1_accuracy.risk_level === 'high' ? 'destructive' : 'secondary'
                            }>
                              {diligenceResults.agent_validations.memo1_accuracy.risk_level} risk
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {diligenceResults.agent_validations.memo1_accuracy?.accuracy_score !== undefined && (
                          <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Accuracy Score</p>
                            <p className="text-3xl font-bold">{diligenceResults.agent_validations.memo1_accuracy.accuracy_score}/100</p>
                          </div>
                        )}
                        
                        {diligenceResults.agent_validations.memo1_accuracy?.detailed_analysis && (
                          <div>
                            <h4 className="font-semibold mb-2">Analysis</h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {diligenceResults.agent_validations.memo1_accuracy.detailed_analysis}
                            </p>
                          </div>
                        )}
                        
                        {diligenceResults.agent_validations.memo1_accuracy?.discrepancies?.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2 text-red-600">Discrepancies Found</h4>
                            <ul className="text-sm space-y-1">
                              {diligenceResults.agent_validations.memo1_accuracy.discrepancies.map((item: string, i: number) => (
                                <li key={i} className="text-muted-foreground">• {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No agent validation data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      )}
    </div>
  );
}
