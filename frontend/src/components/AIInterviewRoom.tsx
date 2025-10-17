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
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LiveTranscript from "./LiveTranscript";
import InterviewChat from "./InterviewChat";
import QAAnalysis from "./QAAnalysis";

interface AIInterviewRoomProps {
  onInterviewComplete?: (transcript: any[], memo: any) => void;
}

export default function AIInterviewRoom({ onInterviewComplete }: AIInterviewRoomProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [interviewPhase, setInterviewPhase] = useState<'preparation' | 'interview' | 'analysis' | 'complete'>('preparation');
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [transcript, setTranscript] = useState<any[]>([]);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showQAAnalysis, setShowQAAnalysis] = useState(false);
  const [memoData, setMemoData] = useState<any>(null);
  const [memo2Data, setMemo2Data] = useState<any>(null);
  
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const { toast } = useToast();

  // AI Interview Questions
  const interviewQuestions = [
    "Welcome! I'm your AI interviewer. Let's start with your company overview. Can you tell me about your startup and what problem you're solving?",
    "That's interesting! What's your business model and how do you plan to generate revenue?",
    "Great! What's the size of your target market and how do you plan to capture market share?",
    "Excellent! Can you tell me about your founding team and their relevant experience?",
    "Impressive! What are your key financial metrics and growth projections?",
    "Thank you! What do you see as the main risks and challenges for your business?",
    "Perfect! Based on our conversation, I have enough information to generate an investment memo. The interview is now complete."
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const startInterview = async () => {
    try {
      // Request microphone and camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        },
        video: true
      });

      mediaStreamRef.current = stream;
      setIsConnected(true);
      setInterviewPhase('interview');
      
      // Start audio analysis for visualization
      startAudioAnalysis(stream);
      
      // Start the AI interview process
      startAIInterview();
      
      toast({
        title: "Interview Started!",
        description: "AI interviewer is now active. Please answer the questions clearly.",
      });
      
    } catch (error) {
      console.error('Error starting interview:', error);
      toast({
        title: "Error",
        description: "Failed to start interview. Please check your microphone and camera permissions.",
        variant: "destructive"
      });
    }
  };

  const startAudioAnalysis = (stream: MediaStream) => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    
    source.connect(analyser);
    analyser.fftSize = 256;
    
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    
    // Start audio visualization
    visualizeAudio();
  };

  const visualizeAudio = () => {
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // You can use dataArray for audio visualization
      // For now, we'll just continue the animation
      
      animationRef.current = requestAnimationFrame(draw);
    };
    
    draw();
  };

  const startAIInterview = () => {
    setCurrentQuestion(interviewQuestions[0]);
    
    // Simulate AI asking questions with delays
    const askNextQuestion = (index: number) => {
      if (index >= interviewQuestions.length) {
        endInterview();
        return;
      }
      
      setCurrentQuestion(interviewQuestions[index]);
      setCurrentQuestionIndex(index);
      
      // Simulate AI speaking time (3-5 seconds)
      const speakingTime = 3000 + Math.random() * 2000;
      
      setTimeout(() => {
        // Simulate user response time (10-30 seconds)
        const responseTime = 10000 + Math.random() * 20000;
        
        setTimeout(() => {
          // Add to transcript
          const newTranscript = {
            id: `segment_${Date.now()}`,
            text: `AI: ${interviewQuestions[index]}`,
            speaker: 'ai',
            timestamp: Date.now() / 1000,
            confidence: 0.95,
            is_final: true
          };
          
          setTranscript(prev => [...prev, newTranscript]);
          
          // Ask next question
          askNextQuestion(index + 1);
        }, responseTime);
      }, speakingTime);
    };
    
    // Start with first question
    askNextQuestion(0);
  };

  const endInterview = () => {
    setInterviewPhase('analysis');
    
    // Generate memo based on transcript
    setTimeout(() => {
      generateMemoFromTranscript();
    }, 2000);
  };

  const generateMemoFromTranscript = () => {
    // Simulate memo generation
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
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsConnected(false);
    setInterviewPhase('preparation');
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
                {isConnected && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Connected
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {!isConnected ? (
                  <Button onClick={startInterview} className="flex items-center gap-2">
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

            {/* Controls */}
            {isConnected && (
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
                  <span>{currentQuestionIndex + 1} / {interviewQuestions.length}</span>
                </div>
                <Progress value={((currentQuestionIndex + 1) / interviewQuestions.length) * 100} />
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
          sessionId="ai-interview-session"
          onClose={() => setShowTranscript(false)}
        />
      )}

      {/* Chat Interface */}
      {showChat && (
        <InterviewChat 
          sessionId="ai-interview-session"
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
