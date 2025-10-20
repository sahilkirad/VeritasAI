"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Clock, AlertTriangle, XCircle, Loader2 } from 'lucide-react';

interface DiligenceProgressProps {
  companyId: string;
  onComplete?: (results: any) => void;
  onError?: (error: string) => void;
}

interface DiligenceStatus {
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  steps: {
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    description: string;
  }[];
  results?: any;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

const DiligenceProgress: React.FC<DiligenceProgressProps> = ({ 
  companyId, 
  onComplete, 
  onError 
}) => {
  const [status, setStatus] = useState<DiligenceStatus | null>(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (!companyId) return;

    // Start listening to Firestore for status updates
    const startListening = async () => {
      try {
        const { db } = await import('@/lib/firebase-new');
        const { onSnapshot, doc } = await import('firebase/firestore');
        
        setIsListening(true);
        
        const statusRef = doc(db, 'diligenceReports', companyId);
        
        const unsubscribe = onSnapshot(statusRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            const diligenceStatus: DiligenceStatus = {
              status: data.status || 'pending',
              progress: data.progress || 0,
              currentStep: data.currentStep || '',
              steps: data.steps || [],
              results: data.results,
              error: data.error,
              startedAt: data.startedAt,
              completedAt: data.completedAt
            };
            
            setStatus(diligenceStatus);
            
            // Handle completion
            if (diligenceStatus.status === 'completed' && diligenceStatus.results) {
              onComplete?.(diligenceStatus.results);
            }
            
            // Handle errors
            if (diligenceStatus.status === 'failed' && diligenceStatus.error) {
              onError?.(diligenceStatus.error);
            }
          } else {
            // Document doesn't exist yet, create initial status
            const initialStatus: DiligenceStatus = {
              status: 'pending',
              progress: 0,
              currentStep: 'Initializing diligence process...',
              steps: [
                {
                  name: 'Data Collection',
                  status: 'pending',
                  description: 'Gathering founder profile, pitch deck, and memo1 data'
                },
                {
                  name: 'Founder Profile Validation',
                  status: 'pending',
                  description: 'Validating founder background and experience'
                },
                {
                  name: 'Pitch Consistency Check',
                  status: 'pending',
                  description: 'Cross-referencing pitch deck claims with available data'
                },
                {
                  name: 'Memo1 Accuracy Analysis',
                  status: 'pending',
                  description: 'Verifying memo1 content against source materials'
                },
                {
                  name: 'Synthesis & Reporting',
                  status: 'pending',
                  description: 'Generating comprehensive diligence report'
                }
              ]
            };
            setStatus(initialStatus);
          }
        }, (error) => {
          console.error('Error listening to diligence status:', error);
          setIsListening(false);
        });
        
        return unsubscribe;
      } catch (error) {
        console.error('Error setting up Firestore listener:', error);
        setIsListening(false);
      }
    };

    const unsubscribe = startListening();
    
    return () => {
      if (unsubscribe) {
        unsubscribe.then(unsub => unsub());
      }
    };
  }, [companyId, onComplete, onError]);

  const getStatusIcon = (stepStatus: string) => {
    switch (stepStatus) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (stepStatus: string) => {
    switch (stepStatus) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOverallStatusIcon = () => {
    if (!status) return <Clock className="h-5 w-5 text-gray-400" />;
    
    switch (status.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'running':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getOverallStatusColor = () => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-200';
    
    switch (status.status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Initializing Diligence Process
          </CardTitle>
          <CardDescription>
            Setting up the diligence analysis for company {companyId}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getOverallStatusIcon()}
            Diligence Progress
            <Badge className={getOverallStatusColor()}>
              {status.status.toUpperCase()}
            </Badge>
          </CardTitle>
          <CardDescription>
            {status.currentStep}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{status.progress}%</span>
              </div>
              <Progress value={status.progress} className="w-full" />
            </div>
            
            {status.startedAt && (
              <div className="text-sm text-gray-600">
                Started: {new Date(status.startedAt).toLocaleString()}
              </div>
            )}
            
            {status.completedAt && (
              <div className="text-sm text-gray-600">
                Completed: {new Date(status.completedAt).toLocaleString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {status.error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {status.error}
          </AlertDescription>
        </Alert>
      )}

      {/* Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Steps</CardTitle>
          <CardDescription>
            Detailed breakdown of the diligence process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {status.steps.map((step, index) => (
              <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  {getStatusIcon(step.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900">{step.name}</h4>
                    <Badge className={getStatusColor(step.status)}>
                      {step.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Connection Status */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-500' : 'bg-red-500'}`}></div>
            {isListening ? 'Connected to real-time updates' : 'Disconnected from updates'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiligenceProgress;
