'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { apiClient } from '@/lib/api';
import { 
  PlayCircle, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Video, 
  Mic, 
  Headphones,
  Loader2,
  MicOff,
  CircleDot
} from 'lucide-react';

interface StartInterviewButtonProps {
  interviewId: string;
  meetingLink?: string; // Optional, no longer needed
  onInterviewStarted?: () => void;
  onInterviewCompleted?: () => void;
}

export default function StartInterviewButton({ 
  interviewId, 
  meetingLink = "", // Default empty string
  onInterviewStarted,
  onInterviewCompleted 
}: StartInterviewButtonProps) {
  const [status, setStatus] = useState<'idle' | 'starting' | 'in_progress' | 'completed' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [interviewStatus, setInterviewStatus] = useState<string>('waiting_for_founder');
  
  // Permission state
  const [permissionStatus, setPermissionStatus] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [permissionChecked, setPermissionChecked] = useState(false);
  
  // Web Speech API state
  const [recognition, setRecognition] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionText, setCurrentQuestionText] = useState<string>('');
  const [transcript, setTranscript] = useState<any[]>([]);
  
  // Video/Audio recording state
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState<string>('');

  // Add refs for immediate access (no closure/batching issues)
  const recognitionRef = useRef<any>(null);
  const isRecordingRef = useRef(false);
  const manualStopRef = useRef(false); // Track if user manually stopped

  // Initialize Web Speech API - SIMPLE VERSION (No Auto-Restart)
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true; // Keep listening without manual restarts
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        // Only get the LAST result (most recent speech)
        const lastResultIndex = event.results.length - 1;
        const lastResult = event.results[lastResultIndex];
        
        if (lastResult.isFinal) {
          const newTranscript = lastResult[0].transcript;
          console.log('Speech Result (final):', newTranscript);
          
          // Append to existing answer instead of replacing
          setCurrentAnswer(prev => {
            const combined = prev ? `${prev} ${newTranscript}` : newTranscript;
            console.log('Total accumulated:', combined);
            return combined;
          });
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        // Only stop on actual errors, not on no-speech or aborted
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          setIsRecording(false);
        }
      };
      
      recognition.onend = () => {
        console.log('Speech recognition ended');
        // Only restart if it wasn't a manual stop AND recording is still active
        if (!manualStopRef.current && isRecordingRef.current) {
          console.log('🔄 Auto-restarting speech recognition after pause');
          try {
            recognitionRef.current.start();
          } catch (err) {
            console.log('Restart error:', err);
          }
        }
      };
      
      recognitionRef.current = recognition;
      setRecognition(recognition);
    }
  }, []);

  // Sync ref with state changes
  useEffect(() => {
    isRecordingRef.current = isRecording;
    console.log('isRecording changed to:', isRecording);
  }, [isRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaStream]);

  const requestMediaPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      setMediaStream(stream);
      setPermissionStatus('granted');
      setPermissionChecked(true);
      
      // Show preview
      if (videoElement) {
        videoElement.srcObject = stream;
      }
    } catch (err) {
      console.error('Failed to get media access:', err);
      setPermissionStatus('denied');
      setPermissionChecked(true);
      setError('Camera/microphone access denied. Please enable to continue.');
    }
  };

  const requestMediaAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      setMediaStream(stream);
      
      // Attach to video element if it exists
      if (videoElement) {
        videoElement.srcObject = stream;
      }
    } catch (err) {
      console.error('Failed to get media access:', err);
      setError('Camera/microphone access denied. Please enable to continue.');
    }
  };

  const startInterview = async () => {
    if (permissionStatus !== 'granted') {
      setError('Please enable camera and microphone first');
      return;
    }
    
    setStatus('starting');
    setError(null);
    
    try {
      const response = await apiClient.startInterview(interviewId);
      
      if (response.success) {
        // Poll Firestore for questions until they're ready
        setStatus('starting');
        setInterviewStatus('generating_questions');
        
        const pollForQuestions = async () => {
          const maxAttempts = 30; // Poll for up to 60 seconds
          let attempts = 0;
          
          const checkQuestions = setInterval(async () => {
            try {
              const { db } = await import('@/lib/firebase-new');
              const { doc, getDoc } = await import('firebase/firestore');
              
              const interviewRef = doc(db, 'interviews', interviewId);
              const interviewSnap = await getDoc(interviewRef);
              
              if (interviewSnap.exists()) {
                const data = interviewSnap.data();
                const fetchedQuestions = data.questions;
                const status = data.status;
                
                if (fetchedQuestions && fetchedQuestions.length > 0 && status === 'ready') {
                  clearInterval(checkQuestions);
                  setQuestions(fetchedQuestions);
                  setCurrentQuestion(0);
                  setCurrentQuestionText(fetchedQuestions[0]?.question || '');
                  setStatus('in_progress');
                  setInterviewStatus('in_progress');
                  console.log(`✅ Loaded ${fetchedQuestions.length} questions from Firestore`);
                  return;
                }
              }
              
              attempts++;
              if (attempts >= maxAttempts) {
                clearInterval(checkQuestions);
                setError('Questions generation timed out. Please try again.');
                setStatus('error');
              }
            } catch (err) {
              console.error('Error polling for questions:', err);
              clearInterval(checkQuestions);
              setError('Failed to load questions. Please try again.');
              setStatus('error');
            }
          }, 2000); // Poll every 2 seconds
        };
        
        pollForQuestions();
        onInterviewStarted?.();
        
      } else {
        setError(response.error || 'Failed to start interview');
        setStatus('error');
      }
    } catch (err) {
      setError('Failed to start interview');
      setStatus('error');
    }
  };

  const startRecording = async () => {
    if (!mediaStream) {
      setError('Media stream not available');
      return;
    }
    
    try {
      setCurrentAnswer(''); // Clear previous answer
      
      // Start speech recognition ONLY (no video recording)
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          console.log('✅ Speech recognition started');
        } catch (err) {
          console.log('Recognition start error:', err);
        }
      }
      
      setIsRecording(true);
      console.log('🎙️ Recording started (speech-to-text only)');
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to start recording');
    }
  };

  const stopRecording = async () => {
    console.log('🛑 Stop & Submit clicked');
    
    // Set manual stop flag BEFORE stopping
    manualStopRef.current = true;
    
    // Stop speech recognition
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop();
        console.log('✅ Speech recognition stopped');
      } catch (err) {
        console.log('Recognition stop error:', err);
      }
    }
    
    setIsRecording(false);
    
    // Immediately submit answer (no video upload, no delay)
    await handleAnswerSubmit(currentAnswer.trim());
    
    // Reset manual stop flag for next question
    manualStopRef.current = false;
  };


  const handleAnswerSubmit = async (answerText: string) => {
    console.log('📝 Submitting answer:', answerText);
    
    if (!answerText) {
      setError('No speech was detected. Please try again.');
      return;
    }
    
    try {
      const newTranscriptEntry = {
        speaker: 'founder',
        text: answerText,
        timestamp: new Date().toISOString(),
        questionNumber: currentQuestion + 1
      };
      
      setTranscript(prev => [...prev, newTranscriptEntry]);
      
      // Submit answer to backend (NO video URL)
      const response = await apiClient.submitAnswer(
        interviewId, 
        currentQuestion, 
        answerText,
        '' // Empty video URL
      );
      
      if (response.success) {
        console.log('✅ Answer submitted successfully');
        
        if (response.data.status === 'continue') {
          // Move to next question immediately
          const nextQ = currentQuestion + 1;
          setCurrentQuestion(nextQ);
          setCurrentQuestionText(questions[nextQ]?.question || '');
          setCurrentAnswer(''); // Clear for next question
          console.log(`➡️ Moving to question ${nextQ + 1}`);
        } else if (response.data.status === 'completed') {
          setStatus('completed');
          setInterviewStatus('completed');
          onInterviewCompleted?.();
          console.log('🎉 Interview completed!');
        }
      } else {
        setError(response.error || 'Failed to submit answer');
        setStatus('error');
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
      setError('Failed to submit answer');
      setStatus('error');
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'idle':
        return {
          variant: 'default' as const,
          label: 'Start AI Interview',
          icon: PlayCircle,
          description: 'Click to begin your AI-powered interview'
        };
      case 'starting':
        return {
          variant: 'secondary' as const,
          label: 'Starting Interview...',
          icon: Loader2,
          description: 'The AI interviewer is preparing questions'
        };
      case 'in_progress':
        return {
          variant: 'default' as const,
          label: 'Interview in Progress',
          icon: Video,
          description: 'The AI is conducting your interview'
        };
      case 'completed':
        return {
          variant: 'default' as const,
          label: 'Interview Completed',
          icon: CheckCircle,
          description: 'Your interview has been completed'
        };
      case 'error':
        return {
          variant: 'destructive' as const,
          label: 'Start Failed',
          icon: AlertCircle,
          description: 'There was an error starting the interview'
        };
      default:
        return {
          variant: 'default' as const,
          label: 'Start AI Interview',
          icon: PlayCircle,
          description: 'Click to begin your AI-powered interview'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const Icon = statusConfig.icon;

  return (
    <div className="space-y-4">
      {/* Permission Check Card */}
      {!permissionChecked && (
        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Video className="h-5 w-5 text-orange-600" />
              Step 1: Enable Camera & Microphone
            </CardTitle>
            <CardDescription>
              We need access to your camera and microphone to conduct the interview
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={requestMediaPermissions}
              variant="default"
              size="lg"
              className="w-full"
            >
              <Video className="mr-2 h-4 w-4" />
              Enable Camera & Microphone
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Video Preview After Permission */}
      {permissionChecked && permissionStatus === 'granted' && status === 'idle' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Camera & Microphone Ready
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={(el) => {
                  setVideoElement(el);
                  if (el && mediaStream) {
                    el.srcObject = mediaStream;
                  }
                }}
                autoPlay
                muted
                playsInline
                className="w-full h-auto max-h-64"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Interview Card */}
      <Card className="border-2 border-dashed border-primary/20 bg-primary/5">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <Video className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">AI Interview Ready</CardTitle>
          <CardDescription>
            Your AI interviewer is ready to conduct a 10-minute interview
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge 
              variant={statusConfig.variant}
              className="flex items-center gap-2 px-3 py-1"
            >
              <Icon className={`h-4 w-4 ${status === 'starting' ? 'animate-spin' : ''}`} />
              {statusConfig.label}
            </Badge>
          </div>

          {/* Description */}
          <p className="text-center text-sm text-muted-foreground">
            {statusConfig.description}
          </p>

          {/* Action Button */}
          <div className="flex justify-center">
            <Button
              onClick={startInterview}
              disabled={
                permissionStatus !== 'granted' || 
                status === 'starting' || 
                status === 'in_progress' || 
                status === 'completed'
              }
              variant={status === 'error' ? 'destructive' : 'default'}
              size="lg"
              className="min-w-[200px]"
            >
              {status === 'starting' && (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Starting...
                </>
              )}
              {status === 'idle' && (
                <>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Start AI Interview
                </>
              )}
              {status === 'in_progress' && (
                <>
                  <Video className="h-4 w-4 mr-2" />
                  Interview Running
                </>
              )}
              {status === 'completed' && (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Completed
                </>
              )}
              {status === 'error' && (
                <>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Try Again
                </>
              )}
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Interview Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Headphones className="h-5 w-5" />
            Interview Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-1 bg-primary/10 rounded-full mt-0.5">
              <Mic className="h-3 w-3 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Audio Setup</p>
              <p className="text-xs text-muted-foreground">
                Ensure your microphone is working and you're in a quiet environment
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-1 bg-primary/10 rounded-full mt-0.5">
              <Clock className="h-3 w-3 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Questions</p>
              <p className="text-xs text-muted-foreground">
                You'll be asked 8-10 questions about your company
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-1 bg-primary/10 rounded-full mt-0.5">
              <Video className="h-3 w-3 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">AI Bot</p>
              <p className="text-xs text-muted-foreground">
                An AI interviewer will ask you questions automatically
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-1 bg-primary/10 rounded-full mt-0.5">
              <CircleDot className="h-3 w-3 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Recording Process</p>
              <p className="text-xs text-muted-foreground">
                Click the record button to start recording your answer. Once you have finished, click stop and submit. You will automatically receive the next question. After completing the interview, navigate to the Interview section of the memo page, wait a moment, then click the Refresh button to view your updated interview data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Interview Progress with Video */}
      {status === 'in_progress' && questions.length > 0 && (
        <div className="space-y-6">
          {/* Video Preview */}
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={(el) => {
                setVideoElement(el);
                if (el && mediaStream) {
                  el.srcObject = mediaStream;
                }
              }}
              autoPlay
              muted
              playsInline
              className="w-full h-auto max-h-96"
            />
            {isRecording && (
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-sm font-medium">Recording</span>
              </div>
            )}
          </div>
          
          {/* Question Display */}
          <Card>
            <CardHeader>
              <CardTitle>Question {currentQuestion + 1} of {questions.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg mb-4">{currentQuestionText}</p>
              
              {/* Current Answer Display */}
              {currentAnswer && (
                <div className="bg-muted p-4 rounded-lg mb-4">
                  <p className="text-sm text-muted-foreground mb-1">Your answer:</p>
                  <p>{currentAnswer}</p>
                </div>
              )}
              
              {/* Recording Controls */}
              <div className="flex gap-2">
                <Button
                  onClick={startRecording}
                  disabled={isRecording || !mediaStream}
                  variant="default"
                >
                  <Mic className="mr-2 h-4 w-4" />
                  {isRecording ? 'Recording...' : 'Record Answer'}
                </Button>
                
                <Button
                  onClick={stopRecording}
                  disabled={!isRecording}
                  variant="destructive"
                >
                  <MicOff className="mr-2 h-4 w-4" />
                  Stop & Submit
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Progress */}
          <Progress value={(currentQuestion / questions.length) * 100} />
        </div>
      )}

      {/* Transcript Display */}
      {transcript.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Interview Transcript</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {transcript.map((entry, index) => (
                <div key={index} className="flex gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    entry.speaker === 'founder' ? 'bg-blue-500' : 'bg-green-500'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">
                        {entry.speaker === 'founder' ? 'You' : 'AI'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm">{entry.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completion Message */}
      {status === 'completed' && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Interview Completed!</p>
                <p className="text-sm text-green-600">
                  The investor will review your interview shortly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
