'use client';

import { useState } from 'react';
import AIInterviewTest from '@/components/AIInterviewTest';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bot, MessageCircle } from "lucide-react";
import { useRouter } from 'next/navigation';

export default function AIInterviewTestPage() {
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
            <h1 className="text-3xl font-bold">AI Interview Test</h1>
            <p className="text-muted-foreground mt-1">
              Test the AI interview system with live transcript and chat functionality
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

      {/* AI Interview Test Component */}
      <AIInterviewTest onInterviewStarted={handleInterviewStarted} />

      {/* Features Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Live Transcript Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Real-time transcription updates</li>
              <li>• Speaker identification (Founder, Investor, AI)</li>
              <li>• Confidence scores for accuracy</li>
              <li>• Timestamps for each segment</li>
              <li>• Interim vs final transcript indicators</li>
              <li>• Auto-scrolling to latest content</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Interview Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Hardcoded interview link integration</li>
              <li>• Session management and tracking</li>
              <li>• Chat interface for interaction</li>
              <li>• Real-time status updates</li>
              <li>• Error handling and recovery</li>
              <li>• Responsive design for all devices</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
