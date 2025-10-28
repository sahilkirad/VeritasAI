'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import StartInterviewButton from '@/components/StartInterviewButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// For static export compatibility
export function generateStaticParams() {
  return [];
}

// Dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

export default function InterviewPage() {
  const params = useParams();
  const interviewId = params.interviewId as string;
  const [interviewData, setInterviewData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load interview data from Firestore
    setInterviewData({
      id: interviewId,
      startupName: 'DataCorp',
      status: 'scheduled'
    });
    setLoading(false);
  }, [interviewId]);

  if (loading) {
    return <div>Loading interview...</div>;
  }

  if (!interviewData) {
    return <div>Interview not found</div>;
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