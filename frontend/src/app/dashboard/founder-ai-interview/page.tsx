'use client';

import { useState } from 'react';
import FounderAIInterview from '@/components/FounderAIInterview';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bot, MessageCircle, Users, Clock, CheckCircle } from "lucide-react";
import { useRouter } from 'next/navigation';

export default function FounderAIInterviewPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const router = useRouter();

  const handleInterviewStarted = (newSessionId: string) => {
    setSessionId(newSessionId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">AI Interview Session</h1>
            <p className="text-muted-foreground mt-1">
              Participate in an AI-powered interview about your startup
            </p>
          </div>
        </div>
      </div>

      {/* Status Card */}
      {sessionId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Interview Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm">Interview Active - Session: {sessionId}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Founder AI Interview Component */}
      <FounderAIInterview onInterviewStarted={handleInterviewStarted} />

      {/* Features Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              What to Expect
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• AI interviewer will ask about your business model</li>
              <li>• Questions about market opportunity and competition</li>
              <li>• Discussion of your team and execution capabilities</li>
              <li>• Analysis of your financial projections</li>
              <li>• Real-time transcript of the conversation</li>
              <li>• Chat interface for additional interaction</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Interview Process
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Join the Google Meet video call</li>
              <li>• AI will conduct the interview automatically</li>
              <li>• Your responses are transcribed in real-time</li>
              <li>• Analysis generates investment insights</li>
              <li>• Results are shared with investors</li>
              <li>• Follow-up questions may be asked</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Tips for Success */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Tips for a Successful Interview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Preparation</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Review your pitch deck and business plan</li>
                <li>• Prepare key metrics and financial data</li>
                <li>• Think about your competitive advantages</li>
                <li>• Have your team information ready</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">During the Interview</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Speak clearly and at a good pace</li>
                <li>• Provide specific examples and data</li>
                <li>• Be honest about challenges and risks</li>
                <li>• Ask clarifying questions if needed</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
