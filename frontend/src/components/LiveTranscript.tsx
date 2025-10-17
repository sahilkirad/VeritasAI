'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MicOff, Volume2, VolumeX, User, Bot, MessageCircle, Loader2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TranscriptAnalyzer } from '@/lib/transcript-analyzer';
import InvestmentMemo from './InvestmentMemo';

interface TranscriptSegment {
  text: string;
  confidence: number;
  speaker: string;
  timestamp: number;
  is_final: boolean;
}

interface LiveTranscriptProps {
  sessionId?: string;
  meetingId?: string;
  onClose?: () => void;
}

export default function LiveTranscript({ sessionId, meetingId, onClose }: LiveTranscriptProps) {
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMemo, setShowMemo] = useState(false);
  const [memoData, setMemoData] = useState<any>(null);
  const [isGeneratingMemo, setIsGeneratingMemo] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new transcript segments arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [transcript]);

  // Poll for transcript updates
  useEffect(() => {
    if (!sessionId && !meetingId) return;

    const pollTranscript = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/get-transcript?session_id=${sessionId}&meeting_id=${meetingId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to get transcript: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.status === 'success') {
          setTranscript(result.transcript || []);
          setError(null);
        } else {
          setError(result.error || 'Failed to get transcript');
        }
      } catch (err) {
        console.error('Error fetching transcript:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch transcript');
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    pollTranscript();

    // Set up polling every 2 seconds
    const interval = setInterval(pollTranscript, 2000);

    return () => clearInterval(interval);
  }, [sessionId, meetingId]);

  const getSpeakerInfo = (speaker: string) => {
    switch (speaker) {
      case 'speaker_0':
      case 'founder':
        return { name: 'Founder', icon: User, color: 'bg-blue-100 text-blue-800' };
      case 'speaker_1':
      case 'investor':
        return { name: 'Investor', icon: User, color: 'bg-green-100 text-green-800' };
      case 'speaker_2':
      case 'ai':
        return { name: 'AI Analyst', icon: Bot, color: 'bg-purple-100 text-purple-800' };
      default:
        return { name: 'Unknown', icon: MessageCircle, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const generateMemoFromTranscript = async () => {
    if (transcript.length === 0) {
      toast({
        title: "No Transcript Data",
        description: "Please wait for transcript data to be available.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingMemo(true);
    
    try {
      // Convert transcript to the format expected by TranscriptAnalyzer
      const transcriptData = transcript.map(segment => ({
        text: segment.text,
        speaker: segment.speaker,
        timestamp: segment.timestamp,
        is_final: segment.is_final
      }));

      // Analyze the transcript
      const analyzer = new TranscriptAnalyzer(transcriptData);
      const analysis = analyzer.analyzeTranscript();
      
      // Generate investment memo
      const memo = analyzer.generateInvestmentMemo(analysis);
      
      setMemoData(memo);
      setShowMemo(true);
      
      toast({
        title: "Investment Memo Generated!",
        description: "Memo has been generated based on the interview transcript.",
      });
      
    } catch (error) {
      console.error('Error generating memo:', error);
      toast({
        title: "Error",
        description: "Failed to generate memo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingMemo(false);
    }
  };

  if (showMemo && memoData) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Investment Memo Generated from Transcript!</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMemo(false)}
          >
            Back to Transcript
          </Button>
        </div>
        <InvestmentMemo memoData={memoData} onClose={() => setShowMemo(false)} />
      </div>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Live Transcript
            </CardTitle>
            <CardDescription>
              Real-time transcription of the AI interview
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={generateMemoFromTranscript}
              disabled={isGeneratingMemo || transcript.length === 0}
              size="sm"
              className="flex items-center gap-2"
            >
              {isGeneratingMemo ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Generate Memo
                </>
              )}
            </Button>
            <Badge variant={isListening ? "default" : "secondary"} className="flex items-center gap-1">
              {isListening ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
              {isListening ? 'Listening' : 'Paused'}
            </Badge>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
          <div className="space-y-3">
            {transcript.length === 0 && !isLoading && !error && (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Waiting for transcript data...</p>
              </div>
            )}
            
            {transcript.map((segment, index) => {
              const speakerInfo = getSpeakerInfo(segment.speaker);
              const SpeakerIcon = speakerInfo.icon;
              
              return (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${speakerInfo.color}`}>
                      <SpeakerIcon className="h-4 w-4" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{speakerInfo.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(segment.timestamp)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(segment.confidence * 100)}%
                      </Badge>
                      {!segment.is_final && (
                        <Badge variant="secondary" className="text-xs">
                          Interim
                        </Badge>
                      )}
                    </div>
                    
                    <p className={`text-sm leading-relaxed ${
                      segment.is_final ? 'text-gray-900' : 'text-gray-600 italic'
                    }`}>
                      {segment.text}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`text-xs ${getConfidenceColor(segment.confidence)}`}>
                        Confidence: {Math.round(segment.confidence * 100)}%
                      </div>
                      {segment.is_final && (
                        <div className="text-xs text-green-600">✓ Final</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Updating transcript...</span>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="mt-4 pt-3 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Total segments: {transcript.length}</span>
            <span>Auto-refresh: 2s</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
