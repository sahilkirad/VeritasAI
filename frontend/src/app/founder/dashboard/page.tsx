'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, DollarSign, Users, TrendingUp, CheckCircle, PlusCircle, LineChart, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";

const kpiData = [
    {
        title: 'Monthly Recurring Revenue',
        value: '$42,500',
        change: '+8.2%',
        icon: DollarSign,
        source: 'Stripe',
        sourceConnected: true,
    },
    {
        title: 'Active Users',
        value: '1,200',
        change: '+15.3%',
        icon: Users,
        source: 'Google Analytics',
        sourceConnected: true,
    },
    {
        title: 'User Growth (WoW)',
        value: '5.1%',
        change: 'vs 4.8% last week',
        icon: TrendingUp,
        source: 'Internal DB',
        sourceConnected: false,
    },
     {
        title: 'Net Burn',
        value: '-$18,500',
        change: 'vs -$21k last month',
        icon: LineChart,
        source: 'QuickBooks',
        sourceConnected: false,
    },
]

const sources = [
    { name: 'Stripe', description: 'Sync financial data', connected: true },
    { name: 'Google Analytics', description: 'Track user engagement', connected: true },
    { name: 'QuickBooks', description: 'Manage accounting', connected: false },
    { name: 'HubSpot', description: 'Sync CRM data', connected: false },
]

export default function FounderDashboardPage() {
  return (
    <div className="grid gap-8">
       <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {kpiData.map((kpi) => (
                 <Card key={kpi.title} className="relative">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                        <kpi.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpi.value}</div>
                        <p className="text-xs text-muted-foreground">{kpi.change}</p>
                    </CardContent>
                    <div className={`absolute bottom-2 right-2 text-xs flex items-center gap-1 ${kpi.sourceConnected ? 'text-green-500' : 'text-muted-foreground/50'}`}>
                        {kpi.sourceConnected ? <CheckCircle className="h-3 w-3"/> : <PlusCircle className="h-3 w-3"/>}
                        <span>{kpi.source}</span>
                    </div>
                </Card>
            ))}
       </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Connect Your Data</CardTitle>
                <CardDescription>Create a single source of truth for your business. Connect your core systems to display live KPIs and impress investors.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {sources.map(source => (
                      <Card key={source.name} className="flex flex-col items-center justify-center p-4 text-center">
                          <p className="font-semibold text-lg">{source.name}</p>
                          <p className="text-xs text-muted-foreground mb-4">{source.description}</p>
                          {source.connected ? (
                              <Button variant="outline" disabled className="w-full">
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                Connected
                              </Button>
                          ) : (
                              <Button variant="outline" className="w-full">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Connect
                              </Button>
                          )}
                      </Card>
                  ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Fundraising Checklist</CardTitle>
                <CardDescription>Complete these steps to improve your visibility to investors.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <span>Company Profile Created</span>
                  </li>
                   <li className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <span>Upload Pitch Deck</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <span>Connect Stripe & GA</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <span>Record Video Pitch</span>
                  </li>
                  <li className="flex items-center gap-3 opacity-60">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-dashed border-primary text-primary font-bold">5</div>
                    <span>Create First "Investor Room"</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
        </div>
    </div>
  );
}
