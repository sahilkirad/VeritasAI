'use client';

import { useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import StartInterviewButton from '@/components/StartInterviewButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function InterviewPage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  
  // Get interview ID from URL path or search params
  const getInterviewId = () => {
    // First try to get from search params
    const searchId = searchParams.get('id') || searchParams.get('interviewId');
    if (searchId) return searchId;
    
    // Then try to extract from pathname
    // Pathname will be like "/interview/interview_1761684472943_cSeGeVxkZaijUbXpoidz"
    const pathParts = pathname.split('/');
    if (pathParts.length >= 3 && pathParts[1] === 'interview') {
      return pathParts[2]; // Return the interview ID part
    }
    
    return null;
  };
  
  const interviewId = getInterviewId();
  
  const [interviewData, setInterviewData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 Interview page - pathname:', pathname);
    console.log('🔍 Interview page - searchParams:', Object.fromEntries(searchParams.entries()));
    console.log('🔍 Interview page - extracted interviewId:', interviewId);
    
    if (!interviewId) {
      console.log('❌ No interview ID found, redirecting to dashboard');
      // Redirect to dashboard if no interview ID
      router.push('/dashboard');
      return;
    }

    console.log('✅ Interview ID found:', interviewId);
    
    // Load interview data from Firestore
    // For now, mock data - in production this would fetch from Firestore
    setInterviewData({
      id: interviewId,
      startupName: 'DataCorp',
      status: 'scheduled'
    });
    setLoading(false);
  }, [interviewId, router, pathname, searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!interviewData || !interviewId) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Interview Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The interview you're looking for doesn't exist or has been removed.
              </p>
              <button 
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Back to Dashboard
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>AI Interview - {interviewData.startupName}</CardTitle>
        </CardHeader>
        <CardContent>
          <StartInterviewButton
            interviewId={interviewId}
            meetingLink=""
          />
        </CardContent>
      </Card>
    </div>
  );
}