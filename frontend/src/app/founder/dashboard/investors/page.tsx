import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function InvestorsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Investor Interest</CardTitle>
        <CardDescription>Firms that have recently viewed your profile or documents.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border p-4">
              <img src="https://picsum.photos/seed/vc1/80/80" alt="VC Firm 1" className="h-16 w-16 rounded-full" data-ai-hint="logo" />
              <p className="text-sm font-medium text-center">Momentum Ventures</p>
              <p className="text-xs text-muted-foreground">Viewed Profile</p>
              <p className="text-xs text-muted-foreground">2 days ago</p>
          </div>
           <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border p-4">
              <img src="https://picsum.photos/seed/vc2/80/80" alt="VC Firm 2" className="h-16 w-16 rounded-full" data-ai-hint="logo" />
              <p className="text-sm font-medium text-center">Starlight Capital</p>
              <p className="text-xs text-muted-foreground">Downloaded Deck</p>
              <p className="text-xs text-muted-foreground">5 days ago</p>
          </div>
           <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border p-4 opacity-70">
              <img src="https://picsum.photos/seed/vc3/80/80" alt="VC Firm 3" className="h-16 w-16 rounded-full" data-ai-hint="logo" />
              <p className="text-sm font-medium text-center">Apex Investors</p>
               <p className="text-xs text-muted-foreground">Viewed Profile</p>
               <p className="text-xs text-muted-foreground">1 week ago</p>
          </div>
           <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border p-4 opacity-70">
              <img src="https://picsum.photos/seed/vc4/80/80" alt="VC Firm 4" className="h-16 w-16 rounded-full" data-ai-hint="logo" />
              <p className="text-sm font-medium text-center">Nexus Partners</p>
              <p className="text-xs text-muted-foreground">Viewed Profile</p>
               <p className="text-xs text-muted-foreground">2 weeks ago</p>
          </div>
          <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border p-4">
              <img src="https://picsum.photos/seed/vc5/80/80" alt="VC Firm 5" className="h-16 w-16 rounded-full" data-ai-hint="logo" />
              <p className="text-sm font-medium text-center">Horizon Ventures</p>
              <p className="text-xs text-muted-foreground">Downloaded Model</p>
              <p className="text-xs text-muted-foreground">3 days ago</p>
          </div>
      </CardContent>
    </Card>
  );
}
