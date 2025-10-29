import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import InterviewClient from './InterviewClient';

export const dynamicParams = true;

// Required for static export
export async function generateStaticParams(): Promise<{ interviewId: string }[]> {
  return [];
}

export default function InterviewPage({ params }: { params: { interviewId: string } }) {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>AI Interview</CardTitle>
        </CardHeader>
        <CardContent>
          <InterviewClient interviewId={params.interviewId} />
        </CardContent>
      </Card>
    </div>
  );
}