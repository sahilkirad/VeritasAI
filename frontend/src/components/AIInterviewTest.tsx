'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bot, Play, MessageCircle, Mic, MicOff, Volume2, VolumeX, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LiveTranscript from "@/components/LiveTranscript";
import InterviewChat from "@/components/InterviewChat";

interface AIInterviewTestProps {
  onInterviewStarted?: (sessionId: string) => void;
}

export default function AIInterviewTest({ onInterviewStarted }: AIInterviewTestProps) {
  const [isStarting, setIsStarting] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const { toast } = useToast();

  // Hardcoded AI interview link - replace with your actual link
  const AI_INTERVIEW_LINK = "https://meet.google.com/rdi-okjo-qnh"; // Your actual Google Meet link
  
  const handleStartInterview = async () => {
    setIsStarting(true);
    
    try {
      // Simulate starting the interview
      const mockSessionId = `session_${Date.now()}`;
      
      // Show loading for 2 seconds to simulate setup
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSessionId(mockSessionId);
      setIsActive(true);
      setShowTranscript(true);
      setShowChat(true);
      
      toast({
        title: "AI Interview Started!",
        description: "The AI interview is now active. You can view the live transcript and chat below.",
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
    // Open the hardcoded interview link in a new tab
    window.open(AI_INTERVIEW_LINK, '_blank');
    
    toast({
      title: "Interview Link Opened",
      description: "The AI interview has been opened in a new tab. You can now participate in the interview.",
    });
  };

  return (
    <div className="space-y-6">
      {/* AI Interview Test Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Interview Test
              </CardTitle>
              <CardDescription>
                Test the AI interview system with live transcript and chat functionality
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isActive ? "default" : "secondary"}>
                {isActive ? 'Active' : 'Inactive'}
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
              <MessageCircle className="h-5 w-5" />
              Open Interview Link
            </Button>
          </div>
          
          {isActive && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-800">Interview Active</span>
              </div>
              <p className="text-sm text-green-700">
                Session ID: {sessionId}
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
                  Real-time transcription of the AI interview
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

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Test Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>1.</strong> Click "Start AI Interview" to begin the test</p>
            <p><strong>2.</strong> Click "Open Interview Link" to open the hardcoded interview URL</p>
            <p><strong>3.</strong> View the live transcript as it updates in real-time</p>
            <p><strong>4.</strong> Use the chat interface to interact with the AI</p>
            <p><strong>5.</strong> Monitor the transcript for speaker identification and confidence scores</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
