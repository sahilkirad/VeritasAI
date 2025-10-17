'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Loader2, 
  MessageCircle,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Bot
} from "lucide-react";
import { qaService, QAQuestion, QAAnalysis } from '@/lib/qa-service';
import { useToast } from "@/hooks/use-toast";

interface QAAnalysisProps {
  memoData: any;
  transcriptData: any[];
  onMemo2Generated?: (memo2: any) => void;
}

export default function QAAnalysis({ memoData, transcriptData, onMemo2Generated }: QAAnalysisProps) {
  const [qaAnalysis, setQaAnalysis] = useState<QAAnalysis | null>(null);
  const [questions, setQuestions] = useState<QAQuestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingMemo2, setIsGeneratingMemo2] = useState(false);
  const [memo2, setMemo2] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (memoData && transcriptData.length > 0) {
      analyzeGaps();
    }
  }, [memoData, transcriptData]);

  const analyzeGaps = async () => {
    setIsAnalyzing(true);
    
    try {
      const analysis = await qaService.analyzeGaps(memoData, transcriptData);
      setQaAnalysis(analysis);
      
      const generatedQuestions = await qaService.generateQuestions(memoData, transcriptData);
      setQuestions(generatedQuestions);
      
      toast({
        title: "Gap Analysis Complete",
        description: `Found ${analysis.gaps.length} gaps and generated ${generatedQuestions.length} follow-up questions.`,
      });
      
    } catch (error) {
      console.error('Error analyzing gaps:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze gaps. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateMemo2 = async () => {
    if (!qaAnalysis) return;
    
    setIsGeneratingMemo2(true);
    
    try {
      const memo2Data = await qaService.generateMemo2(memoData, qaAnalysis, []);
      setMemo2(memo2Data);
      
      if (onMemo2Generated) {
        onMemo2Generated(memo2Data);
      }
      
      toast({
        title: "Memo2 Generated!",
        description: "Enhanced investment memo has been created based on gap analysis.",
      });
      
    } catch (error) {
      console.error('Error generating memo2:', error);
      toast({
        title: "Generation Error",
        description: "Failed to generate memo2. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingMemo2(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isAnalyzing) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Analyzing gaps and generating follow-up questions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!qaAnalysis) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No analysis data available. Please run gap analysis first.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analysis Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            QA Gap Analysis Results
          </CardTitle>
          <CardDescription>
            Analysis of missing information and recommended follow-up questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{qaAnalysis.gaps.length}</div>
              <p className="text-sm text-muted-foreground">Gaps Identified</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
              <p className="text-sm text-muted-foreground">Follow-up Questions</p>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getConfidenceColor(qaAnalysis.confidence)}`}>
                {Math.round(qaAnalysis.confidence * 100)}%
              </div>
              <p className="text-sm text-muted-foreground">Confidence Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Identified Gaps */}
      {qaAnalysis.gaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Identified Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {qaAnalysis.gaps.map((gap, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-800">{gap}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Follow-up Questions */}
      {questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Recommended Follow-up Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {questions.map((question, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium">{question.question}</p>
                    <Badge className={getPriorityColor(question.priority)}>
                      {question.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p><strong>Category:</strong> {question.category}</p>
                    <p><strong>Expected Answer:</strong> {question.expectedAnswer}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {qaAnalysis.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {qaAnalysis.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800">{recommendation}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Memo2 Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Enhanced Investment Memo (Memo2)
          </CardTitle>
          <CardDescription>
            Generate an enhanced investment memo based on gap analysis and follow-up questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {memo2 ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">Memo2 Generated Successfully!</span>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium">Memo Type:</p>
                      <p className="text-sm text-muted-foreground">{memo2.memo_type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Confidence Score:</p>
                      <p className="text-sm text-muted-foreground">{Math.round(memo2.confidence_score * 100)}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Follow-up Required:</p>
                      <p className="text-sm text-muted-foreground">{memo2.follow_up_required ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Gaps Identified:</p>
                      <p className="text-sm text-muted-foreground">{memo2.gaps_identified?.length || 0}</p>
                    </div>
                  </div>
                </div>
                
                {memo2.additional_insights && memo2.additional_insights.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Additional Insights:</h4>
                    <ul className="space-y-1">
                      {memo2.additional_insights.map((insight: string, index: number) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <Button
                onClick={generateMemo2}
                disabled={isGeneratingMemo2}
                className="w-full"
              >
                {isGeneratingMemo2 ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generating Memo2...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Enhanced Memo (Memo2)
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
