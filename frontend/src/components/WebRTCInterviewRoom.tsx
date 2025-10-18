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
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { agentService } from '@/lib/agent-service';
import LiveTranscript from "./LiveTranscript";
import InterviewChat from "./InterviewChat";
import QAAnalysis from "./QAAnalysis";

interface WebRTCInterviewRoomProps {
  sessionId: string;
  onInterviewComplete?: (transcript: any[], memo: any) => void;
}

export default function WebRTCInterviewRoom({ sessionId, onInterviewComplete }: WebRTCInterviewRoomProps) {
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const [transcript, setTranscript] = useState<any[]>([]);
  const [memoData, setMemoData] = useState<any>(null);
  const [memo2Data, setMemo2Data] = useState<any>(null);

  const [showTranscript, setShowTranscript] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showQAAnalysis, setShowQAAnalysis] = useState(false);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const startWebRTCInterview = async () => {
    setLoading(true);
    setError(null);
    try {
      // Request camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1,
        },
        video: true,
      });
      
      setLocalStream(stream);
      setIsInterviewActive(true);
      
      toast({
        title: "WebRTC Interview Started",
        description: "AI agents are now analyzing your video and audio in real-time.",
        variant: "success",
      });
    } catch (error: any) {
      console.error('Error starting WebRTC interview:', error);
      setError(error.message || 'Failed to start WebRTC interview');
      toast({
        title: "Error",
        description: error.message || "Failed to start WebRTC interview.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const endInterview = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    setIsInterviewActive(false);
    setLocalStream(null);
    toast({
      title: "Interview Ended",
      description: "The WebRTC interview has been concluded. AI agents will continue analyzing.",
    });
  };

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => (track.enabled = isMicMuted));
      setIsMicMuted(!isMicMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => (track.enabled = isVideoOff));
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleTranscriptUpdate = (newTranscript: any[]) => {
    setTranscript(newTranscript);
  };

  const handleMemo1Generated = (memo: any) => {
    setMemoData(memo);
  };

  const handleMemo2Generated = (memo2: any) => {
    setMemo2Data(memo2);
  };

  return (
    <Card className="w-full max-w-6xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Zap className="inline-block mr-2 h-6 w-6 text-blue-500" />
            WebRTC AI Interview Room
          </span>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Instant Connection
          </Badge>
        </CardTitle>
        <CardDescription>
          {isInterviewActive
            ? `Real-time AI analysis in progress. Session ID: ${sessionId}`
            : "Start an instant WebRTC interview with AI agents for real-time analysis."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="flex items-center p-3 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
            <AlertCircle className="flex-shrink-0 inline w-4 h-4 me-3" />
            <span className="sr-only">Error</span>
            <div>
              <span className="font-medium">Error:</span> {error}
            </div>
          </div>
        )}

        {!isInterviewActive ? (
          <div className="flex justify-center">
            <Button onClick={startWebRTCInterview} disabled={loading} className="text-lg px-8 py-4">
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Zap className="mr-2 h-5 w-5" />
              )}
              {loading ? "Starting WebRTC..." : "Start Instant AI Interview"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Video Section */}
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              {localStream ? (
                <video ref={localVideoRef} autoPlay muted className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
                  <Loader2 className="h-10 w-10 animate-spin" />
                  <span className="ml-3 text-lg">Waiting for video stream...</span>
                </div>
              )}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={toggleMic}
                  className={isMicMuted ? "bg-red-500 hover:bg-red-600 text-white" : ""}
                >
                  {isMicMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={toggleVideo}
                  className={isVideoOff ? "bg-red-500 hover:bg-red-600 text-white" : ""}
                >
                  {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                </Button>
                <Button variant="destructive" size="icon" onClick={endInterview}>
                  <PhoneOff className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* AI Agents Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-800">Interview Agent</span>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">Analyzing responses</p>
                </CardContent>
              </Card>
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">Sentiment Agent</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">Communication analysis</p>
                </CardContent>
              </Card>
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-purple-800">QA Agent</span>
                  </div>
                  <p className="text-sm text-purple-600 mt-1">Smart questions</p>
                </CardContent>
              </Card>
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-orange-600" />
                    <span className="font-medium text-orange-800">Gap Analysis</span>
                  </div>
                  <p className="text-sm text-orange-600 mt-1">Knowledge gaps</p>
                </CardContent>
              </Card>
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Mic className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-red-800">Speech Stream</span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">Real-time transcription</p>
                </CardContent>
              </Card>
              <Card className="bg-indigo-50 border-indigo-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    <span className="font-medium text-indigo-800">Synthesis Agent</span>
                  </div>
                  <p className="text-sm text-indigo-600 mt-1">Memo generation</p>
                </CardContent>
              </Card>
            </div>

            {/* Control Panel */}
            <div className="flex justify-center space-x-4 mt-6">
              <Button
                onClick={() => setShowTranscript(!showTranscript)}
                variant="outline"
                size="sm"
                className={showTranscript ? "bg-blue-100" : ""}
              >
                <Monitor className="h-4 w-4 mr-2" />
                {showTranscript ? "Hide Transcript" : "Show Transcript"}
              </Button>
              <Button
                onClick={() => setShowChat(!showChat)}
                variant="outline"
                size="sm"
                className={showChat ? "bg-green-100" : ""}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                {showChat ? "Hide Chat" : "Show Chat"}
              </Button>
              <Button
                onClick={() => setShowQAAnalysis(!showQAAnalysis)}
                variant="outline"
                size="sm"
                className={showQAAnalysis ? "bg-purple-100" : ""}
              >
                <Bot className="h-4 w-4 mr-2" />
                {showQAAnalysis ? "Hide QA Analysis" : "Show QA Analysis"}
              </Button>
            </div>

            {/* Live Transcript */}
            {showTranscript && (
              <LiveTranscript
                sessionId={sessionId}
                onTranscriptUpdate={handleTranscriptUpdate}
                onMemoGenerated={handleMemo1Generated}
              />
            )}

            {/* Chat Interface */}
            {showChat && (
              <InterviewChat
                sessionId={sessionId}
                onClose={() => setShowChat(false)}
              />
            )}

            {/* QA Analysis */}
            {showQAAnalysis && memoData && (
              <QAAnalysis
                memoData={memoData}
                transcriptData={transcript}
                onMemo2Generated={handleMemo2Generated}
              />
            )}

            {/* Final Memo Display */}
            {memo2Data && (
              <Card className="mt-8 border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-800">
                    <CheckCircle className="mr-2 h-6 w-6" />
                    Final AI Analysis Complete
                  </CardTitle>
                  <CardDescription>Generated after comprehensive agent analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-sm bg-white p-4 rounded-md border">
                    {JSON.stringify(memo2Data, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
