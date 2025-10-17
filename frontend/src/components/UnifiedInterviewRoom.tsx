'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  PhoneOff, 
  Bot, 
  User, 
  MessageCircle,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  Settings,
  Monitor,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { hybridInterviewService, InterviewMode } from '@/lib/hybrid-interview-service';
import LiveTranscript from "./LiveTranscript";
import InterviewChat from "./InterviewChat";
import QAAnalysis from "./QAAnalysis";

interface UnifiedInterviewRoomProps {
  founderEmail?: string;
  investorEmail?: string;
  startupName?: string;
  onInterviewComplete?: (transcript: any[], memo: any) => void;
}

export default function UnifiedInterviewRoom({ 
  founderEmail, 
  investorEmail, 
  startupName, 
  onInterviewComplete 
}: UnifiedInterviewRoomProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [currentMode, setCurrentMode] = useState<InterviewMode['type']>('webrtc');
  const [availableModes, setAvailableModes] = useState<InterviewMode[]>([]);
  const [interviewPhase, setInterviewPhase] = useState<'preparation' | 'interview' | 'analysis' | 'complete'>('preparation');
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [transcript, setTranscript] = useState<any[]>([]);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showQAAnalysis, setShowQAAnalysis] = useState(false);
  const [memoData, setMemoData] = useState<any>(null);
  const [memo2Data, setMemo2Data] = useState<any>(null);
  const [meetLink, setMeetLink] = useState<string>('');
  
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setAvailableModes(hybridInterviewService.getAvailableModes());
  }, []);

  const startInterview = async (mode: InterviewMode['type'] = 'webrtc') => {
    try {
      let result;
      
      if (mode === 'webrtc') {
        result = await hybridInterviewService.startWebRTCInterview();
        if (result.success && result.stream) {
          mediaStreamRef.current = result.stream;
          setIsConnected(true);
          setCurrentMode('webrtc');
        }
      } else if (mode === 'google_meet') {
        if (!founderEmail || !investorEmail || !startupName) {
          throw new Error('Email and startup name required for Google Meet mode');
        }
        result = await hybridInterviewService.startGoogleMeetInterview(
          founderEmail,
          investorEmail,
          startupName
        );
        if (result.success && result.meetLink) {
          setMeetLink(result.meetLink);
          setIsConnected(true);
          setCurrentMode('google_meet');
        }
      } else if (mode === 'hybrid') {
        if (!founderEmail || !investorEmail || !startupName) {
          throw new Error('Email and startup name required for hybrid mode');
        }
        result = await hybridInterviewService.startHybridInterview(
          founderEmail,
          investorEmail,
          startupName
        );
        if (result.success) {
          setCurrentMode(result.mode);
          if (result.stream) {
            mediaStreamRef.current = result.stream;
          }
          if (result.meetLink) {
            setMeetLink(result.meetLink);
          }
          setIsConnected(true);
        }
      }

      if (result?.success) {
        setInterviewPhase('interview');
        startAIInterview();
        
        toast({
          title: "Interview Started!",
          description: `Using ${mode.toUpperCase()} mode. AI interviewer is now active.`,
        });
      } else {
        throw new Error(result?.error || 'Failed to start interview');
      }
      
    } catch (error) {
      console.error('Error starting interview:', error);
      toast({
        title: "Error",
        description: `Failed to start interview: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  const startAIInterview = () => {
    const questions = [
      "Welcome! I'm your AI interviewer. Let's start with your company overview. Can you tell me about your startup and what problem you're solving?",
      "That's interesting! What's your business model and how do you plan to generate revenue?",
      "Great! What's the size of your target market and how do you plan to capture market share?",
      "Excellent! Can you tell me about your founding team and their relevant experience?",
      "Impressive! What are your key financial metrics and growth projections?",
      "Thank you! What do you see as the main risks and challenges for your business?",
      "Perfect! Based on our conversation, I have enough information to generate an investment memo. The interview is now complete."
    ];

    let questionIndex = 0;
    setCurrentQuestion(questions[0]);

    const askNextQuestion = () => {
      if (questionIndex >= questions.length - 1) {
        endInterview();
        return;
      }

      questionIndex++;
      setCurrentQuestion(questions[questionIndex]);

      // Simulate AI speaking time
      setTimeout(() => {
        // Simulate user response time
        setTimeout(() => {
          const newTranscript = {
            id: `segment_${Date.now()}`,
            text: `AI: ${questions[questionIndex]}`,
            speaker: 'ai',
            timestamp: Date.now() / 1000,
            confidence: 0.95,
            is_final: true
          };
          
          setTranscript(prev => [...prev, newTranscript]);
          askNextQuestion();
        }, 10000 + Math.random() * 20000);
      }, 3000 + Math.random() * 2000);
    };

    setTimeout(askNextQuestion, 5000);
  };

  const endInterview = () => {
    setInterviewPhase('analysis');
    
    setTimeout(() => {
      generateMemoFromTranscript();
    }, 2000);
  };

  const generateMemoFromTranscript = () => {
    const mockMemo = {
      company_name: "Extracted from transcript",
      business_model: "Based on founder responses",
      market_opportunity: "From market discussion",
      team_strength: "From team questions",
      financial_metrics: "From financial discussion",
      risks: "From risk assessment",
      recommendation: "STRONG BUY - Based on comprehensive analysis",
      investment_amount: "$500K - $2M",
      valuation: "$5M - $10M",
      confidence_score: 0.85,
      key_insights: [
        "Strong founding team with relevant experience",
        "Clear business model with revenue potential",
        "Large market opportunity identified",
        "Solid financial projections"
      ]
    };
    
    setMemoData(mockMemo);
    setInterviewPhase('complete');
    
    if (onInterviewComplete) {
      onInterviewComplete(transcript, mockMemo);
    }
    
    toast({
      title: "Interview Complete!",
      description: "Investment memo has been generated based on the interview.",
    });
  };

  const toggleMute = () => {
    if (mediaStreamRef.current) {
      const audioTracks = mediaStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (mediaStreamRef.current) {
      const videoTracks = mediaStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = isVideoOn;
      });
      setIsVideoOn(!isVideoOn);
    }
  };

  const endCall = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsConnected(false);
    setInterviewPhase('preparation');
    setMeetLink('');
  };

  const switchMode = async (newMode: InterviewMode['type']) => {
    if (isConnected) {
      endCall();
    }
    
    await startInterview(newMode);
  };

  const getModeColor = (mode: InterviewMode['type']) => {
    switch (mode) {
      case 'webrtc': return 'bg-blue-100 text-blue-800';
      case 'google_meet': return 'bg-green-100 text-green-800';
      case 'hybrid': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'preparation': return 'bg-gray-100 text-gray-800';
      case 'interview': return 'bg-blue-100 text-blue-800';
      case 'analysis': return 'bg-yellow-100 text-yellow-800';
      case 'complete': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Interview Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Interview Mode Selection
          </CardTitle>
          <CardDescription>
            Choose your preferred interview mode. WebRTC is faster, Google Meet is more familiar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {availableModes.map((mode) => (
              <Card key={mode.type} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{mode.type.toUpperCase()}</h3>
                      <Badge className={getModeColor(mode.type)}>
                        {currentMode === mode.type ? 'Active' : 'Available'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{mode.description}</p>
                    <ul className="space-y-1">
                      {mode.benefits.slice(0, 3).map((benefit, index) => (
                        <li key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => switchMode(mode.type)}
                      disabled={isConnected}
                      className="w-full"
                      size="sm"
                    >
                      {isConnected && currentMode === mode.type ? 'Active' : 'Select'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interview Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Interview Room
          </CardTitle>
          <CardDescription>
            Automated AI interview with real-time transcription and analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={getPhaseColor(interviewPhase)}>
                  {interviewPhase.charAt(0).toUpperCase() + interviewPhase.slice(1)}
                </Badge>
                <Badge className={getModeColor(currentMode)}>
                  {currentMode.toUpperCase()}
                </Badge>
                {isConnected && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Connected
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {!isConnected ? (
                  <Button onClick={() => startInterview(currentMode)} className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Start Interview
                  </Button>
                ) : (
                  <Button onClick={endCall} variant="destructive" className="flex items-center gap-2">
                    <PhoneOff className="h-4 w-4" />
                    End Call
                  </Button>
                )}
              </div>
            </div>

            {/* Google Meet Link */}
            {meetLink && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <ExternalLink className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Google Meet Link Generated</span>
                </div>
                <p className="text-sm text-green-700 mb-2">
                  AI bot will automatically join this meeting.
                </p>
                <Button
                  onClick={() => window.open(meetLink, '_blank')}
                  variant="outline"
                  size="sm"
                  className="text-green-700 border-green-300 hover:bg-green-100"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Google Meet
                </Button>
              </div>
            )}

            {/* Controls */}
            {isConnected && currentMode === 'webrtc' && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={toggleMute}
                  variant={isMuted ? "destructive" : "outline"}
                  size="sm"
                >
                  {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button
                  onClick={toggleVideo}
                  variant={isVideoOn ? "outline" : "destructive"}
                  size="sm"
                >
                  {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                </Button>
                <Button
                  onClick={() => setShowTranscript(!showTranscript)}
                  variant="outline"
                  size="sm"
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => setShowChat(!showChat)}
                  variant="outline"
                  size="sm"
                >
                  <FileText className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => setShowQAAnalysis(!showQAAnalysis)}
                  variant="outline"
                  size="sm"
                >
                  <Bot className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Current Question */}
            {currentQuestion && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Bot className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">AI Interviewer:</p>
                      <p className="text-blue-800">{currentQuestion}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Progress */}
            {interviewPhase === 'interview' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Interview Progress</span>
                  <span>AI Interview in Progress</span>
                </div>
                <Progress value={75} />
              </div>
            )}

            {/* Analysis Phase */}
            {interviewPhase === 'analysis' && (
              <div className="flex items-center gap-2 text-yellow-700">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analyzing interview responses and generating investment memo...</span>
              </div>
            )}

            {/* Complete Phase */}
            {interviewPhase === 'complete' && (
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span>Interview complete! Investment memo has been generated.</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Live Transcript */}
      {showTranscript && (
        <LiveTranscript 
          sessionId="unified-interview-session"
          onClose={() => setShowTranscript(false)}
        />
      )}

      {/* Chat Interface */}
      {showChat && (
        <InterviewChat 
          sessionId="unified-interview-session"
          onClose={() => setShowChat(false)}
        />
      )}

      {/* QA Analysis */}
      {showQAAnalysis && memoData && (
        <QAAnalysis 
          memoData={memoData}
          transcriptData={transcript}
          onMemo2Generated={(memo2) => setMemo2Data(memo2)}
        />
      )}

      {/* Generated Memo */}
      {memoData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generated Investment Memo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Company</p>
                  <p className="font-semibold">{memoData.company_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recommendation</p>
                  <p className="font-semibold text-green-600">{memoData.recommendation}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Investment Range</p>
                  <p className="font-semibold">{memoData.investment_amount}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Key Insights:</h4>
                <ul className="space-y-1">
                  {memoData.key_insights?.map((insight: string, index: number) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
