'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, AlertTriangle, HelpCircle, UploadCloud } from "lucide-react";
import React from "react";

const RedFlagItem = ({
  type,
  text,
  explanation,
  groundTruth,
}: {
  type: 'verified' | 'discrepancy' | 'unverified';
  text: React.ReactNode;
  explanation: React.ReactNode;
  groundTruth: React.ReactNode;
}) => {
  const Icon = type === 'verified' ? CheckCircle : type === 'discrepancy' ? AlertTriangle : HelpCircle;
  const color = type === 'verified' ? 'text-green-500' : type === 'discrepancy' ? 'text-yellow-500' : 'text-blue-500';

  return (
    <li className="flex items-start gap-3">
        <Icon className={`mt-1 h-5 w-5 shrink-0 ${color}`} />
        <div className="flex-1">
            <p className="text-sm">{text}</p>
             <Dialog>
                <DialogTrigger asChild>
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs">Why?</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>AI Explainability</DialogTitle>
                        <DialogDescription>
                            The AI reached this conclusion by comparing these data points.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div className="rounded-md border p-4">
                            <h4 className="mb-2 font-semibold">Founder's Claim</h4>
                            {explanation}
                        </div>
                         <div className="rounded-md border p-4 bg-muted/50">
                            <h4 className="mb-2 font-semibold">Ground Truth Data</h4>
                            <div className="text-muted-foreground">{groundTruth}</div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    </li>
  );
};


export default function DiligencePage() {
  return (
    <Tabs defaultValue="report" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="report">Red Flag Report</TabsTrigger>
        <TabsTrigger value="benchmarking">Benchmarking</TabsTrigger>
        <TabsTrigger value="analysis">Document Analysis</TabsTrigger>
      </TabsList>
      
      <TabsContent value="report">
        <Card>
          <CardHeader>
            <CardTitle>Automated Red Flag Report</CardTitle>
            <CardDescription>
              AI-generated analysis identifying contradictions, discrepancies, and unsubstantiated claims from all data sources.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Internal Contradictions</h3>
              <ul className="space-y-4">
                 <RedFlagItem 
                    type="discrepancy" 
                    text={<>The Pitch Deck claims a <strong>$1.2M ARR</strong>, but the Financial Model shows an ARR of <strong>$850k</strong> (a 29% difference).</>}
                    explanation={<p>Pitch Deck (Slide 8): "Current ARR at $1.2M".</p>}
                    groundTruth={<p>Financial Model (Q4 Tab, F12): "=SUM(B12:E12)*12" which calculates to $850k.</p>}
                 />
                 <RedFlagItem 
                    type="discrepancy" 
                    text={<>The deck lists <strong>15 engineers</strong>, but the team bio document only contains <strong>11 engineering roles</strong>.</>}
                    explanation={<p>Pitch Deck "Team" slide lists 15 engineers.</p>}
                    groundTruth={<p>The attached 'Team_Bios.docx' details only 11 individuals with engineering titles.</p>}
                 />
              </ul>
            </div>
             <div>
              <h3 className="font-semibold mb-3">External Discrepancies & Benchmarking</h3>
              <ul className="space-y-4">
                 <RedFlagItem 
                    type="discrepancy" 
                    text={<>Claimed Customer Acquisition Cost (CAC) of <strong>$500</strong> is 60% lower than the industry average for B2B SaaS ($1,200-$1,800).</>}
                     explanation={<p>The company's financial model claims a CAC of $500.</p>}
                     groundTruth={<p>Industry benchmark data for B2B SaaS indicates an average CAC of $1,200 - $1,800.</p>}
                 />
                  <RedFlagItem 
                    type="verified" 
                    text={<>Founder's previous company, "DataViz Inc.", had a successful exit, as verified by public news articles.</>}
                     explanation={<p>Founder's bio mentions exiting "DataViz Inc."</p>}
                     groundTruth={<p>News search confirms the acquisition by a larger tech firm in a 2021 article.</p>}
                 />
              </ul>
            </div>
             <div>
              <h3 className="font-semibold mb-3">Unsubstantiated Claims</h3>
              <ul className="space-y-4">
                 <RedFlagItem 
                    type="unverified" 
                    text={<>Claim of a <strong>"Proprietary AI Algorithm"</strong> is made without technical details or patents.</>}
                     explanation={<p>The term "Proprietary AI" is used multiple times in the pitch deck.</p>}
                     groundTruth={<p>No patents were found via USPTO search and no technical whitepaper was provided.</p>}
                 />
                 <RedFlagItem 
                    type="unverified" 
                    text={<>A <strong>"Key Partnership with Microsoft"</strong> is mentioned, but no public announcement or co-marketing material was found.</>}
                     explanation={<p>The deck mentions a partnership on the "Go-To-Market" slide.</p>}
                     groundTruth={<p>A search of Microsoft's official partner directory and recent press releases yielded no results for "QuantumLeap AI".</p>}
                 />
              </ul>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="benchmarking">
        <Card>
          <CardHeader>
            <CardTitle>Deep Benchmarking</CardTitle>
            <CardDescription>
              Benchmark key metrics against industry averages from premium data sources.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label htmlFor="company">Company</Label>
                <Select>
                  <SelectTrigger id="company">
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quantumleap">QuantumLeap AI</SelectItem>
                    <SelectItem value="biosynth">BioSynth</SelectItem>
                    <SelectItem value="carboncapture">CarbonCapture Inc.</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                 <Label htmlFor="metric">Metric</Label>
                <Select>
                  <SelectTrigger id="metric">
                    <SelectValue placeholder="Select a metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cac">Customer Acquisition Cost (CAC)</SelectItem>
                    <SelectItem value="ltv">Lifetime Value (LTV)</SelectItem>
                    <SelectItem value="churn">Churn Rate</SelectItem>
                    <SelectItem value="revenue-per-employee">Revenue per Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <Label htmlFor="value">Claimed Value</Label>
                <Input id="value" placeholder="$500" />
              </div>
               <div className="space-y-4 self-end">
                <Button className="w-full md:w-auto">Benchmark Metric</Button>
              </div>
            </div>
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-base">Benchmark Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  The claimed CAC of <span className="font-bold text-foreground">$500</span> is <span className="font-bold text-accent">60% lower</span> than the industry average for B2B SaaS, which ranges from $1,200 to $1,800. This level of efficiency is highly attractive if accurate.
                  <br /><br />
                  <span className="font-semibold text-foreground">Recommendation:</span> This is a top-decile claim. The investor should dedicate a significant portion of diligence to validating their customer acquisition channels, marketing spend, and sales cycle efficiency. Ask for a detailed breakdown of CAC calculation.
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="analysis">
        <Card>
          <CardHeader>
            <CardTitle>Document Analysis</CardTitle>
            <CardDescription>
              Upload and cross-reference documents like pitch decks, financial models, and memos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex h-32 w-full items-center justify-center rounded-md border-2 border-dashed">
                <div className="text-center">
                    <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Drag & drop files here, or click to browse</p>
                </div>
            </div>
             <div>
                <h3 className="mb-2 font-semibold">Uploaded Documents</h3>
                <ul className="space-y-2">
                    <li className="flex items-center justify-between rounded-md border p-3">
                        <span className="font-medium">QuantumLeap_Pitch_Deck_Q4.pdf</span>
                        <span className="text-sm text-muted-foreground">12.4 MB</span>
                    </li>
                    <li className="flex items-center justify-between rounded-md border p-3">
                        <span className="font-medium">Financial_Model_v3.1.xlsx</span>
                        <span className="text-sm text-muted-foreground">2.1 MB</span>
                    </li>
                     <li className="flex items-center justify-between rounded-md border p-3">
                        <span className="font-medium">Team_Bios.docx</span>
                        <span className="text-sm text-muted-foreground">800 KB</span>
                    </li>
                </ul>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
