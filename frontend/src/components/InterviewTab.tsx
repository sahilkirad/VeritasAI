'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiClient } from '@/lib/api';
import { Calendar, Clock, User, Video, CheckCircle, AlertCircle, PlayCircle } from 'lucide-react';

interface InterviewData {
  id: string;
  status: 'scheduled' | 'waiting_for_founder' | 'in_progress' | 'completed' | 'failed';
  meetingLink: string;
  founderEmail: string;
  investorEmail: string;
  scheduledFor: string;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  transcript?: Array<{
    speaker: 'ai' | 'founder';
    text: string;
    timestamp: string;
    questionNumber?: number;
  }>;
  summary?: {
    executiveSummary: string;
    keyInsights: string[];
    redFlags: string[];
    validationPoints: string[];
    confidenceScore: number;
    recommendations: string;
  };
}

interface InterviewTabProps {
  companyId: string;
  founderEmail: string;
  investorEmail: string;
  startupName: string;
}

export default function InterviewTab({ 
  companyId, 
  founderEmail, 
  investorEmail, 
  startupName 
}: InterviewTabProps) {
  const [interviews, setInterviews] = useState<InterviewData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedInterview, setSelectedInterview] = useState<InterviewData | null>(null);

  // Load interviews on component mount
  useEffect(() => {
    loadInterviews();
  }, [companyId]);

  const loadInterviews = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from Firestore
      // For now, we'll use mock data
      const mockInterviews: InterviewData[] = [
        {
          id: 'interview_123',
          status: 'scheduled',
          meetingLink: 'https://meet.google.com/example',
          founderEmail,
          investorEmail,
          scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          transcript: [],
          summary: undefined
        }
      ];
      setInterviews(mockInterviews);
    } catch (err) {
      setError('Failed to load interviews');
    } finally {
      setLoading(false);
    }
  };

  const scheduleInterview = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.scheduleInterview(
        companyId,
        founderEmail,
        investorEmail,
        startupName
      );
      
      if (response.success) {
        // Add new interview to list
        const newInterview: InterviewData = {
          id: response.data.interviewId,
          status: 'scheduled',
          meetingLink: response.data.meetingLink,
          founderEmail,
          investorEmail,
          scheduledFor: response.data.scheduledFor,
          transcript: [],
          summary: undefined
        };
        setInterviews(prev => [newInterview, ...prev]);
      } else {
        setError(response.error || 'Failed to schedule interview');
      }
    } catch (err) {
      setError('Failed to schedule interview');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { variant: 'secondary' as const, label: 'Scheduled', icon: Calendar },
      waiting_for_founder: { variant: 'outline' as const, label: 'Waiting for Founder', icon: Clock },
      in_progress: { variant: 'default' as const, label: 'In Progress', icon: PlayCircle },
      completed: { variant: 'default' as const, label: 'Completed', icon: CheckCircle },
      failed: { variant: 'destructive' as const, label: 'Failed', icon: AlertCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Interviews</h2>
          <p className="text-muted-foreground">
            Schedule and manage AI-powered interviews with founders
          </p>
        </div>
        <Button 
          onClick={scheduleInterview} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <Video className="h-4 w-4" />
          Schedule Interview
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {interviews.length === 0 && !loading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Video className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Interviews Scheduled</h3>
            <p className="text-muted-foreground text-center mb-4">
              Schedule an AI interview to get started with automated founder interviews.
            </p>
            <Button onClick={scheduleInterview} disabled={loading}>
              Schedule First Interview
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {interviews.map((interview) => (
            <Card key={interview.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader 
                className="pb-3"
                onClick={() => setSelectedInterview(interview)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Video className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        AI Interview with {startupName}
                      </CardTitle>
                      <CardDescription>
                        Scheduled for {formatTimestamp(interview.scheduledFor)}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(interview.status)}
                </div>
              </CardHeader>
              
              {selectedInterview?.id === interview.id && (
                <CardContent className="pt-0">
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="transcript">Transcript</TabsTrigger>
                      <TabsTrigger value="analysis">Analysis</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">Meeting Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>Founder: {interview.founderEmail}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>Investor: {interview.investorEmail}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>Duration: {formatDuration(interview.duration)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Actions</h4>
                          <div className="space-y-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => window.open(interview.meetingLink, '_blank')}
                            >
                              <Video className="h-4 w-4 mr-2" />
                              Join Meeting
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="transcript" className="space-y-4">
                      <ScrollArea className="h-96">
                        {interview.transcript && interview.transcript.length > 0 ? (
                          <div className="space-y-4">
                            {interview.transcript.map((entry, index) => (
                              <div key={index} className="flex gap-3">
                                <div className={`w-2 h-2 rounded-full mt-2 ${
                                  entry.speaker === 'ai' ? 'bg-primary' : 'bg-secondary'
                                }`} />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-sm">
                                      {entry.speaker === 'ai' ? 'AI Analyst' : 'Founder'}
                                    </span>
                                    {entry.questionNumber && (
                                      <Badge variant="outline" className="text-xs">
                                        Q{entry.questionNumber}
                                      </Badge>
                                    )}
                                    <span className="text-xs text-muted-foreground">
                                      {formatTimestamp(entry.timestamp)}
                                    </span>
                                  </div>
                                  <p className="text-sm">{entry.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            No transcript available yet
                          </div>
                        )}
                      </ScrollArea>
                    </TabsContent>
                    
                    <TabsContent value="analysis" className="space-y-4">
                      {interview.summary ? (
                        <div className="space-y-6">
                          <div>
                            <h4 className="font-semibold mb-2">Executive Summary</h4>
                            <p className="text-sm text-muted-foreground">
                              {interview.summary.executiveSummary}
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2">Confidence Score</h4>
                            <div className="flex items-center gap-3">
                              <Progress 
                                value={interview.summary.confidenceScore * 10} 
                                className="flex-1"
                              />
                              <span className="text-sm font-medium">
                                {interview.summary.confidenceScore}/10
                              </span>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2">Key Insights</h4>
                            <ul className="space-y-1">
                              {interview.summary.keyInsights.map((insight, index) => (
                                <li key={index} className="text-sm flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  {insight}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {interview.summary.redFlags.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2 text-red-600">Red Flags</h4>
                              <ul className="space-y-1">
                                {interview.summary.redFlags.map((flag, index) => (
                                  <li key={index} className="text-sm flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                    {flag}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          <div>
                            <h4 className="font-semibold mb-2">Recommendations</h4>
                            <p className="text-sm text-muted-foreground">
                              {interview.summary.recommendations}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          Analysis not available yet
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
