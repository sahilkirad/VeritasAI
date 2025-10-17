'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bot, Play, MessageCircle, Mic, MicOff, Volume2, VolumeX, Loader2, Users, Clock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LiveTranscript from "@/components/LiveTranscript";
import InterviewChat from "@/components/InterviewChat";

interface FounderAIInterviewProps {
  onInterviewStarted?: (sessionId: string) => void;
}

export default function FounderAIInterview({ onInterviewStarted }: FounderAIInterviewProps) {
  const [isStarting, setIsStarting] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [interviewStatus, setInterviewStatus] = useState<'pending' | 'active' | 'completed'>('pending');
  const { toast } = useToast();

  // Google Meet link for the AI interview
  const AI_INTERVIEW_LINK = "https://meet.google.com/rdi-okjo-qnh";
  
  const handleStartInterview = async () => {
    setIsStarting(true);
    
    try {
      // Simulate starting the interview
      const mockSessionId = `founder_session_${Date.now()}`;
      
      // Show loading for 2 seconds to simulate setup
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSessionId(mockSessionId);
      setIsActive(true);
      setShowTranscript(true);
      setShowChat(true);
      setInterviewStatus('active');
      
      toast({
        title: "AI Interview Started!",
        description: "Welcome to your AI interview session. The AI interviewer is ready to ask you questions about your startup.",
      });
      
      // Call the callback if provided
      if (onInterviewStarted) {
        onInterviewStarted(mockSessionId);
      }
      
    } catch (error) {
      console.error('Error starting interview:', error);
      toast({
        title: "Error",
        description: "Failed to start interview. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsStarting(false);
    }
  };

  const handleOpenInterview = () => {
    // Open the Google Meet link in a new tab
    window.open(AI_INTERVIEW_LINK, '_blank');
    
    toast({
      title: "Interview Link Opened",
      description: "The AI interview meeting has been opened in a new tab. You can now join the video call.",
    });
  };

  const handleCompleteInterview = () => {
    setInterviewStatus('completed');
    setIsActive(false);
    
    toast({
      title: "Interview Completed!",
      description: "Thank you for participating in the AI interview. Your responses will be analyzed and a memo will be generated.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Founder AI Interview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Interview Session
              </CardTitle>
              <CardDescription>
                Participate in an AI-powered interview about your startup
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={
                interviewStatus === 'active' ? "default" : 
                interviewStatus === 'completed' ? "secondary" : 
                "outline"
              }>
                {interviewStatus === 'active' ? 'Active' : 
                 interviewStatus === 'completed' ? 'Completed' : 
                 'Pending'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Start Interview Button */}
            <Button
              onClick={handleStartInterview}
              disabled={isStarting || isActive}
              className="flex items-center gap-2 h-12"
              size="lg"
            >
              {isStarting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Starting Interview...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Start AI Interview
                </>
              )}
            </Button>
            
            {/* Open Interview Link */}
            <Button
              onClick={handleOpenInterview}
              disabled={!isActive}
              variant="outline"
              className="flex items-center gap-2 h-12"
              size="lg"
            >
              <Users className="h-5 w-5" />
              Join Video Meeting
            </Button>
          </div>
          
          {isActive && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-800">Interview Active</span>
              </div>
              <p className="text-sm text-blue-700">
                Session ID: {sessionId}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                The AI interviewer is ready to ask you questions about your startup, business model, and vision.
              </p>
            </div>
          )}

          {interviewStatus === 'completed' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Interview Completed</span>
              </div>
              <p className="text-sm text-green-700">
                Thank you for participating! Your responses will be analyzed to generate investment insights.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Transcript */}
      {showTranscript && sessionId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Live Interview Transcript
                </CardTitle>
                <CardDescription>
                  Real-time transcription of your AI interview session
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTranscript(false)}
              >
                Hide Transcript
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <LiveTranscript 
              sessionId={sessionId} 
              onClose={() => setShowTranscript(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* Chat Interface */}
      {showChat && (
        <InterviewChat 
          sessionId={sessionId} 
          onClose={() => setShowChat(false)}
        />
      )}

      {/* Interview Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Interview Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 mt-0.5 text-blue-600" />
              <div>
                <p className="font-medium">Duration</p>
                <p className="text-muted-foreground">The interview typically takes 30-45 minutes</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MessageCircle className="h-4 w-4 mt-0.5 text-green-600" />
              <div>
                <p className="font-medium">Questions</p>
                <p className="text-muted-foreground">Be prepared to discuss your business model, market, and growth plans</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Bot className="h-4 w-4 mt-0.5 text-purple-600" />
              <div>
                <p className="font-medium">AI Analysis</p>
                <p className="text-muted-foreground">Your responses will be analyzed for investment insights</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {isActive && (
        <div className="flex justify-center">
          <Button
            onClick={handleCompleteInterview}
            variant="outline"
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Complete Interview
          </Button>
        </div>
      )}
    </div>
  );
}
