'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Lightbulb, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface QAPair {
  question: string;
  answer: string;
  timestamp: string;
}

export default function FeedbackPage() {
  const { user } = useAuth();
  
  // AI Feedback state
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [qaHistory, setQaHistory] = useState<QAPair[]>([]);
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);

  // Load persisted data on mount
  useEffect(() => {
    if (user?.email) {
      const savedRecommendations = localStorage.getItem(`recommendations_${user.email}`);
      const savedQAHistory = localStorage.getItem(`qa_history_${user.email}`);
      
      if (savedRecommendations) {
        try {
          setRecommendations(JSON.parse(savedRecommendations));
        } catch (e) {
          console.error('Failed to parse saved recommendations:', e);
        }
      }
      
      if (savedQAHistory) {
        try {
          setQaHistory(JSON.parse(savedQAHistory));
        } catch (e) {
          console.error('Failed to parse saved Q&A history:', e);
        }
      }
    }
  }, [user?.email]);

  // AI Feedback handlers
  const handleGetRecommendations = async () => {
    if (!user?.email) {
      console.error('No user email found');
      return;
    }

    setIsLoadingRecommendations(true);
    try {
      const result = await apiClient.getAIRecommendations(user.email);
      if (result.success && result.data?.recommendations) {
        setRecommendations(result.data.recommendations);
        // Save to localStorage
        localStorage.setItem(`recommendations_${user.email}`, JSON.stringify(result.data.recommendations));
      } else {
        console.error('Failed to get recommendations:', result.error);
        setRecommendations([]);
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      setRecommendations([]);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!user?.email || !question.trim()) {
      console.error('No user email or question provided');
      return;
    }

    setIsLoadingAnswer(true);
    try {
      const result = await apiClient.askAIQuestion(user.email, question);
      if (result.success && result.data?.answer) {
        const newQA: QAPair = {
          question: question,
          answer: result.data.answer,
          timestamp: new Date().toISOString()
        };
        
        setAnswer(result.data.answer);
        const updatedHistory = [newQA, ...qaHistory];
        setQaHistory(updatedHistory);
        
        // Save to localStorage
        localStorage.setItem(`qa_history_${user.email}`, JSON.stringify(updatedHistory));
        
        // Clear question input
        setQuestion('');
      } else {
        console.error('Failed to get answer:', result.error);
        setAnswer('Sorry, I could not process your question. Please try again.');
      }
    } catch (error) {
      console.error('Error asking question:', error);
      setAnswer('Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoadingAnswer(false);
    }
  };

  const handleClearHistory = () => {
    if (user?.email && confirm('Are you sure you want to clear your Q&A history?')) {
      setQaHistory([]);
      localStorage.removeItem(`qa_history_${user.email}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Get Recommendations Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Get Recommendations
          </CardTitle>
          <CardDescription>
            Get AI-powered recommendations to improve your pitch deck based on your uploaded data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-blue-50 border-blue-200 text-blue-900 [&>svg]:text-blue-600">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Wait for a sometime to get your desired recommendations and AI feedback for your question.
            </AlertDescription>
          </Alert>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Click the button below to get personalized recommendations for your pitch deck
              </p>
            </div>
            <Button
              onClick={handleGetRecommendations}
              disabled={isLoadingRecommendations}
              className="flex items-center gap-2"
            >
              {isLoadingRecommendations ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Lightbulb className="h-4 w-4" />
              )}
              {isLoadingRecommendations ? 'Analyzing...' : 'Get Recommendations'}
            </Button>
          </div>

          {/* Recommendations Display */}
          {recommendations.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-lg">AI Recommendations:</h4>
              {recommendations.map((rec, index) => (
                <div key={index} className="p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      rec.priority === 'High' ? 'bg-red-100 text-red-800' :
                      rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {rec.priority}
                    </span>
                    <span className="font-medium">{rec.category}</span>
                  </div>
                  <h5 className="font-medium mb-2">{rec.title}</h5>
                  <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                  {rec.action_items && rec.action_items.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">Action Items:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {rec.action_items.map((item: string, itemIndex: number) => (
                          <li key={itemIndex} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ask Question Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Ask a Question
          </CardTitle>
          <CardDescription>
            Ask specific questions about your pitch deck to get personalized insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-blue-50 border-blue-200 text-blue-900 [&>svg]:text-blue-600">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Wait for a sometime to get your desired recommendations and AI feedback for your question.
            </AlertDescription>
          </Alert>
          <div className="space-y-3">
            <Textarea
              placeholder="Ask a question about your pitch deck... (e.g., 'What are the main strengths of my pitch deck?', 'How can I improve my market positioning?')"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[120px]"
            />
            <Button
              onClick={handleAskQuestion}
              disabled={isLoadingAnswer || !question.trim()}
              className="w-full"
            >
              {isLoadingAnswer ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Analyzing...
                </div>
              ) : (
                'Ask Question'
              )}
            </Button>
          </div>

          {/* Q&A History */}
          {qaHistory.length > 0 && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-lg">Conversation History</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearHistory}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear History
                </Button>
              </div>
              
              <div className="space-y-6 max-h-[600px] overflow-y-auto">
                {qaHistory.map((qa, index) => (
                  <div key={index} className="space-y-3">
                    {/* Question */}
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-primary mb-1">Your Question:</p>
                          <p className="text-sm">{qa.question}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(qa.timestamp).toLocaleString()}
                      </p>
                    </div>
                    
                    {/* Answer */}
                    <div className="p-4 border rounded-lg bg-muted/30">
                      <div className="flex items-start gap-2 mb-3">
                        <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <p className="font-semibold">AI Answer:</p>
                      </div>
                      <div className="prose prose-sm max-w-none">
                        {qa.answer.split('\n\n').map((paragraph, pIdx) => {
                          // Handle bold text
                          const parts = paragraph.split(/(\*\*.*?\*\*)/g);
                          return (
                            <p key={pIdx} className="mb-3 text-sm leading-relaxed">
                              {parts.map((part, partIdx) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                  return (
                                    <strong key={partIdx} className="font-semibold text-primary">
                                      {part.slice(2, -2)}
                                    </strong>
                                  );
                                }
                                // Handle bullet points
                                if (part.includes('•')) {
                                  const lines = part.split('\n');
                                  return (
                                    <span key={partIdx}>
                                      {lines.map((line, lineIdx) => (
                                        line.trim().startsWith('•') ? (
                                          <div key={lineIdx} className="flex items-start gap-2 ml-4 my-1">
                                            <span className="text-primary mt-1">•</span>
                                            <span>{line.replace('•', '').trim()}</span>
                                          </div>
                                        ) : (
                                          <span key={lineIdx}>{line}</span>
                                        )
                                      ))}
                                    </span>
                                  );
                                }
                                return <span key={partIdx}>{part}</span>;
                              })}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
