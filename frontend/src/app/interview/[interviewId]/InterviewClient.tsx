'use client';

import { useState, useEffect } from 'react';
import StartInterviewButton from '@/components/StartInterviewButton';

interface InterviewClientProps {
  interviewId: string;
}

export default function InterviewClient({ interviewId }: InterviewClientProps) {
  const [interviewData, setInterviewData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load interview data from Firestore
    // For now, mock data
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
    <StartInterviewButton
      interviewId={interviewId}
      meetingLink="" // No longer needed
    />
  );
}
