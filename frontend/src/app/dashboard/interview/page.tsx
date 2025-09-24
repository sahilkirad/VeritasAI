'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import React, { useState, useTransition, useEffect } from "react";
import { useSearchParams } from 'next/navigation'

type ConductAiInterviewOutput = {
    interviewSummary: string;
    interviewTranscript: string;
    meetingLink: string;
};

const conductAiInterview = async (params: any): Promise<ConductAiInterviewOutput> => {
    // Mock implementation
    return {
        interviewSummary: "Mock interview summary",
        interviewTranscript: "Mock interview transcript",
        meetingLink: "https://meet.google.com/mock-meeting"
    };
};

const initialInterviewTranscript = `
**AI Interviewer:** "Good afternoon, Priya. Thanks for your time. Let's start with your go-to-market. Your deck mentions a $500 CAC, which is impressive. Can you walk me through the primary channels that allow you to acquire customers so efficiently?"

**Priya Founder:** "Absolutely. Our primary channel is organic. We published a series of deep technical blog posts that have achieved top Google rankings for key industry terms. This drives about 60% of our inbound leads. The rest comes from targeted LinkedIn outreach, where our sales cycle is incredibly short because the prospects have already read our content. We spend very little on paid ads."

**AI Interviewer:** "That's helpful, thank you. Let's turn to the team. The deck lists 15 engineers, but the provided employee list has 11. Can you clarify this discrepancy?"

**Priya Founder:** "Ah, yes. A bit of a timing issue. We have 11 full-time engineers. We also have four long-term, exclusive contractors who have been with us for over a year. We consider them core to the team, so we included them in the pitch deck count. I can provide their details for verification."

**AI Interviewer:** "Understood. Final question on strategy. Your financial model shows a focus on enterprise clients, but your efficient CAC seems more aligned with a PLG or SMB motion. How do you plan to bridge that gap and land large enterprise accounts?"

**Priya Founder:** "Great question. Our organic inbound brings in a lot of SMBs and individual teams within large companies. That's our 'land' motion. We're now building out a dedicated enterprise sales team of two reps to 'expand' within those accounts. The model's enterprise-heavy forecast reflects that expansion strategy kicking in over the next 12 months."
`;

const initialInterviewSummary = `
**1. CAC Validation:** Founder attributes the low $500 CAC primarily to a strong organic, content-driven inbound motion (60% of leads), supplemented by targeted outreach. This reduces dependency on paid marketing and appears credible, but requires verification via web analytics and lead source data.

**2. Team Size Clarification:** The discrepancy of 4 engineers is explained by the inclusion of long-term exclusive contractors. This seems reasonable, but the investor should confirm their roles and tenure to ensure they represent core engineering capacity.

**3. Go-to-Market Strategy:** Founder articulates a classic "land and expand" strategy. The low-cost organic motion lands SMBs and teams within enterprises. A newly formed sales team is tasked with expanding these initial footholds into larger enterprise contracts. The strategy is logical but the execution risk of the "expand" motion is high and unproven.
`;

type InterviewStatus = 'idle' | 'scheduling' | 'conducting' | 'generating' | 'done' | 'error';

export default function InterviewPage() {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const searchParams = useSearchParams()

    const [founderName, setFounderName] = useState('');
    const [founderEmail, setFounderEmail] = useState('');
    const [interviewQuestions, setInterviewQuestions] = useState('');

    useEffect(() => {
        const founder = searchParams.get('founderName') || 'Priya Founder';
        const company = searchParams.get('companyName') || 'QuantumLeap AI';
        const questionsParam = searchParams.get('questions');
        
        let parsedQuestions: string[] = [];
        try {
            if (questionsParam) {
                parsedQuestions = JSON.parse(questionsParam);
            }
        } catch (error) {
            console.error("Failed to parse interview questions:", error);
        }

        const defaultQuestions = `1. Your Customer Acquisition Cost is exceptionally low. Can you provide a detailed breakdown of the channels and strategies that make a $500 CAC possible?
2. There's a discrepancy between the 15 engineers listed in your deck and the 11 in your team document. Can you clarify the roles of the four additional individuals?
3. Your GTM seems to be bottom-up, but your financial model is enterprise-heavy. Can you elaborate on the specific strategies you'll use to bridge this gap and successfully sell into large organizations?`;

        setFounderName(founder);
        setFounderEmail(`${founder.split(' ')[0].toLowerCase()}@${company.toLowerCase().replace(/\s/g, '')}.ai`);
        setInterviewQuestions(parsedQuestions.length > 0 ? parsedQuestions.join('\n') : defaultQuestions);

    }, [searchParams]);

    const [status, setStatus] = useState<InterviewStatus>('idle');
    const [apiResponse, setApiResponse] = useState<ConductAiInterviewOutput | null>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        startTransition(async () => {
            try {
                setStatus('scheduling');
                const response = await conductAiInterview({
                    founderName,
                    founderCalendarId: founderEmail,
                    interviewQuestions: interviewQuestions.split('\n').filter(q => q.trim() !== ''),
                });
                setApiResponse(response);
                setStatus('done');
                toast({
                    title: "Interview Scheduled & Processed",
                    description: "The AI interview flow has completed successfully.",
                });

            } catch (error) {
                console.error("Failed to conduct AI interview:", error);
                setStatus('error');
                toast({
                    variant: 'destructive',
                    title: "Scheduling Failed",
                    description: "There was an error scheduling the AI interview.",
                });
            }
        });
    }

    const interviewSummary = apiResponse ? apiResponse.interviewSummary : initialInterviewSummary;
    const interviewTranscript = apiResponse ? apiResponse.interviewTranscript : initialInterviewTranscript;

    const renderStatusItem = (
        step: number,
        label: string,
        stepStatus: 'completed' | 'in-progress' | 'pending' | 'error'
    ) => {
        let bgColor = 'bg-muted';
        let textColor = 'text-muted-foreground';
        let icon: React.ReactNode = step;
        let subtext = 'Pending';

        if (stepStatus === 'completed') {
            bgColor = 'bg-green-500';
            textColor = 'text-white';
            icon = '✓';
            subtext = 'Completed';
        } else if (stepStatus === 'in-progress') {
            bgColor = 'bg-blue-500';
            textColor = 'text-white animate-pulse';
            icon = <Loader2 className="h-4 w-4 animate-spin" />;
            subtext = 'In Progress';
        } else if (stepStatus === 'error') {
            bgColor = 'bg-destructive';
            textColor = 'text-white';
            icon = '✕';
            subtext = 'Error';
        }

        return (
            <li className={`flex items-center gap-3 ${stepStatus === 'pending' ? 'opacity-60' : ''}`}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${bgColor} ${textColor}`}>
                    {icon}
                </div>
                <div>
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-muted-foreground">{subtext}</p>
                </div>
            </li>
        )
    }

    return (
        <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Initiate AI Interviewer</CardTitle>
                        <CardDescription>
                           Schedule and conduct a standardized, scalable screening interview with the founder.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="founder-name">Founder Name</Label>
                                <Input id="founder-name" value={founderName} onChange={e => setFounderName(e.target.value)} disabled={isPending} />
                            </div>
                            <div>
                                <Label htmlFor="founder-email">Founder Calendar (Email)</Label>
                                <Input id="founder-email" type="email" value={founderEmail} onChange={e => setFounderEmail(e.target.value)} disabled={isPending} />
                            </div>
                            <div>
                                <Label htmlFor="interview-questions">Intelligently Generated Questions</Label>
                                <Textarea 
                                    id="interview-questions" 
                                    rows={6}
                                    value={interviewQuestions}
                                    onChange={e => setInterviewQuestions(e.target.value)}
                                    disabled={isPending}
                                />
                                 <p className="text-xs text-muted-foreground mt-1">Questions are auto-generated by the Diligence Agent based on the Red Flag Report.</p>
                            </div>
                            <Button className="w-full" type="submit" disabled={isPending}>
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {status === 'idle' && 'Schedule AI Interview'}
                                {status === 'scheduling' && 'Scheduling...'}
                                {status === 'done' && 'Interview Complete'}
                                {status === 'error' && 'Retry Schedule'}
                                {(status !== 'idle' && status !== 'scheduling' && status !== 'done' && status !== 'error') && 'Processing...'}
                            </Button>
                             {apiResponse?.meetingLink && (
                                <p className="text-sm text-center">
                                    Meeting scheduled!{' '}
                                    <a href={apiResponse.meetingLink} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline">
                                        Join here
                                    </a>
                                </p>
                            )}
                        </form>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Interview Process</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <ul className="space-y-4">
                            {renderStatusItem(1, 'Generate Questions', (status === 'idle' || isPending) ? 'completed' : status === 'error' ? 'error' : 'completed')}
                            {renderStatusItem(2, 'Schedule Google Meet', status === 'scheduling' ? 'in-progress' : status === 'idle' ? 'pending' : status === 'error' ? 'error' : 'completed')}
                            {renderStatusItem(3, 'Conduct Voice Interview', (status === 'done' || status === 'idle') ? (apiResponse ? 'completed' : 'pending') : status === 'scheduling' ? 'pending' : status === 'error' ? 'error' : 'in-progress')}
                            {renderStatusItem(4, 'Generate Transcript & Summary', status === 'done' ? 'completed' : status === 'idle' ? 'pending' : isPending ? 'in-progress' : status === 'error' ? 'error' : 'pending')}
                        </ul>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-3 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Interview Summary (Memo 2)</CardTitle>
                         <CardDescription>AI-generated summary of the key takeaways from the interview.</CardDescription>
                    </CardHeader>
                    <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                       <pre className="whitespace-pre-wrap font-body text-sm">{interviewSummary}</pre>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Full Transcript</CardTitle>
                         <CardDescription>A complete, word-for-word transcript of the automated interview.</CardDescription>
                    </CardHeader>
                    <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap font-body text-sm">{interviewTranscript}</pre>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
