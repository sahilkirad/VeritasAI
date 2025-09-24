import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function FeedbackPage() {
  return (
    <Card>
        <CardHeader>
            <CardTitle>AI Feedback</CardTitle>
            <CardDescription>Automated feedback on your submitted pitch deck.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="rounded-lg border bg-card p-4">
                <p className="text-sm font-medium">Clarity Score: 8/10</p>
                <p className="text-xs text-muted-foreground mt-1">Your problem and solution are clearly articulated. Consider adding a more detailed competitive analysis to strengthen your positioning.</p>
            </div>
             <div className="rounded-lg border bg-card p-4">
                <p className="text-sm font-medium">TAM Realism: 6/10</p>
                <p className="text-xs text-muted-foreground mt-1">The Total Addressable Market seems optimistic. Break it down into Serviceable Addressable Market (SAM) and Serviceable Obtainable Market (SOM) for more credibility.</p>
            </div>
             <div className="rounded-lg border bg-card p-4">
                <p className="text-sm font-medium">Team Strength: 9/10</p>
                <p className="text-xs text-muted-foreground mt-1">Your team's background is impressive and well-aligned with the problem space. Highlight specific achievements in your bios.</p>
            </div>
             <div className="rounded-lg border bg-card p-4">
                <p className="text-sm font-medium">Financial Projections: 7/10</p>
                <p className="text-xs text-muted-foreground mt-1">The revenue growth projections are aggressive. Ensure your assumptions for customer acquisition and conversion rates are well-defended in the appendix.</p>
            </div>
        </CardContent>
    </Card>
  );
}
