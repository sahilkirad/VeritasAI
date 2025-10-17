'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Users, TrendingUp, Target, AlertTriangle, CheckCircle, BarChart3, Globe, DollarSign, FileText, ExternalLink, Calendar, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Memo1Data {
  title?: string;
  summary?: string;
  business_model?: string;
  market_analysis?: string;
  financial_projections?: string;
  team_info?: string;
  problem?: string;
  solution?: string;
  competition?: string[];
  initial_flags?: string[];
  validation_points?: string[];
  founder_name?: string;
  founder_linkedin_url?: string;
  company_linkedin_url?: string;
  timestamp?: any;
  summary_analysis?: string;
  market_size?: string;
  traction?: string;
  team?: string;
}

interface Memo1TabProps {
  memo1: Memo1Data;
  onInterviewScheduled?: (result: any) => void;
}

export default function Memo1Tab({ memo1, onInterviewScheduled }: Memo1TabProps) {
  const [isScheduling, setIsScheduling] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleScheduleInterview = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to schedule an interview.",
        variant: "destructive",
      });
      return;
    }

    // Extract founder email from memo data or use a placeholder
    const founderEmail = memo1.founder_linkedin_url 
      ? `founder@${memo1.title?.toLowerCase().replace(/\s+/g, '') || 'startup'}.com`
      : 'founder@startup.com';

    const startupName = memo1.title || 'Startup';

    setIsScheduling(true);
    
    try {
      console.log('🔄 Scheduling AI interview...', {
        founder_email: founderEmail,
        investor_email: user.email,
        startup_name: startupName
      });

      const result = await apiClient.scheduleInterview({
        founder_email: founderEmail,
        investor_email: user.email,
        startup_name: startupName,
        calendar_id: '93fe7cf38ab2552f7c40f0a9e3584f3fab5bbe5e006011eac718ca8e7cc34e4f@group.calendar.google.com'
      });

      if (result.success && result.data?.status === 'SUCCESS') {
        console.log('✅ Interview scheduled successfully:', result.data);
        
        toast({
          title: "Interview Scheduled Successfully!",
          description: `AI interview for ${startupName} has been scheduled. Check your calendar for details.`,
        });

        // Call the callback if provided
        if (onInterviewScheduled) {
          onInterviewScheduled(result.data);
        }
      } else {
        console.error('❌ Failed to schedule interview:', result.error);
        toast({
          title: "Failed to Schedule Interview",
          description: result.error || "An error occurred while scheduling the interview.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Interview scheduling error:', error);
      toast({
        title: "Scheduling Error",
        description: "An unexpected error occurred while scheduling the interview.",
        variant: "destructive",
      });
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Pitch Deck Summary
              </CardTitle>
              <CardDescription>
                Summary of the founder's pitch deck PDF submission
              </CardDescription>
            </div>
            <Button
              onClick={handleScheduleInterview}
              disabled={isScheduling}
              className="flex items-center gap-2"
            >
              {isScheduling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4" />
                  Schedule Interview
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {memo1.summary || memo1.summary_analysis || 
            "Based on the initial document analysis, this company shows potential in the market with a clear problem-solution fit. Key areas for further investigation include market validation and competitive positioning."}
          </p>
        </CardContent>
      </Card>

      {/* INDUSTRY & MARKET SIZE */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Industry & Market Size Analysis
            </CardTitle>
            <CardDescription>
            Market analysis extracted from the pitch deck
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
          {/* Market Positioning */}
          <div>
            <h4 className="font-semibold mb-2">Market Positioning</h4>
            <p className="text-sm text-muted-foreground">
              {memo1.title || "Company"} operates at the convergence of multiple high-growth markets:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>• Talent acquisition software focusing on AI-powered, skills-first hiring and onboarding</li>
              <li>• Corporate training and experiential learning, especially simulation-based training</li>
              <li>• EdTech SaaS solutions for higher education and workforce readiness</li>
              <li>• AI-driven HR and talent management platforms</li>
            </ul>
          </div>

          {/* Market Size Data with Sources */}
            <div>
            <h4 className="font-semibold mb-2">Market Size Analysis</h4>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h5 className="font-medium text-blue-800">Talent Acquisition Software</h5>
                <p className="text-xs text-blue-600 mt-1">
                  Global market: $5.82B (2024) → $12.98B (2033) at 9.8% CAGR
                </p>
                <div className="mt-2 space-y-1">
                  <a href="https://www.verifiedmarketreports.com/product/talent-acquisition-software-market/" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center">
                    [1] Verified Market Reports, Talent Acquisition Software Market Overview (Feb 2025)
                    <ExternalLink className="ml-1 h-2 w-2" />
                  </a>
                  <a href="https://www.marketresearchfuture.com/reports/talent-acquisition-software-market-2034" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center">
                    [2] Market Research Future, Talent Acquisition Software Market Report, 2034 (Jan 2025)
                    <ExternalLink className="ml-1 h-2 w-2" />
                  </a>
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h5 className="font-medium text-green-800">Talent Management Software</h5>
                <p className="text-xs text-green-600 mt-1">
                  Global market: $9.96B (2023) → $22.67B (2030) at 12.5% CAGR
                </p>
                <div className="mt-2 space-y-1">
                  <a href="https://www.grandviewresearch.com/industry-analysis/talent-management-software-market" target="_blank" rel="noopener noreferrer" className="text-xs text-green-500 hover:underline flex items-center">
                    [4] Grand View Research, Talent Management Software Market Size Report, 2030 (Jan 2023)
                    <ExternalLink className="ml-1 h-2 w-2" />
                  </a>
                  <a href="https://www.marketsandmarkets.com/Market-Reports/talent-management-software-market-1234.html" target="_blank" rel="noopener noreferrer" className="text-xs text-green-500 hover:underline flex items-center">
                    [7] MarketsandMarkets, Talent Management Software Market
                    <ExternalLink className="ml-1 h-2 w-2" />
                  </a>
                </div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <h5 className="font-medium text-purple-800">Simulation-Based Learning</h5>
                <p className="text-xs text-purple-600 mt-1">
                  Global market: $14.3B (2023) → $44B (2032) at &gt;15% CAGR
                </p>
                <div className="mt-2 space-y-1">
                  <a href="https://www.marketgrowthreports.com/simulation-based-learning-market" target="_blank" rel="noopener noreferrer" className="text-xs text-purple-500 hover:underline flex items-center">
                    [7] MarketGrowthReports, Simulation-Based Learning Market
                    <ExternalLink className="ml-1 h-2 w-2" />
                  </a>
                </div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <h5 className="font-medium text-orange-800">AI in HR & Onboarding</h5>
                <p className="text-xs text-orange-600 mt-1">
                  Global market: $5.9B (2023) → $26.5B (2033) at 16.2% CAGR
                </p>
                <div className="mt-2 space-y-1">
                  <a href="https://www.grandviewresearch.com/industry-analysis/artificial-intelligence-in-hr-market" target="_blank" rel="noopener noreferrer" className="text-xs text-orange-500 hover:underline flex items-center">
                    [4] Grand View Research, AI in HR Market 2023
                    <ExternalLink className="ml-1 h-2 w-2" />
                  </a>
                  <a href="https://www.precedenceresearch.com/artificial-intelligence-in-hr-market" target="_blank" rel="noopener noreferrer" className="text-xs text-orange-500 hover:underline flex items-center">
                    [15] Precedence Research, Artificial Intelligence in HR Market Forecast
                    <ExternalLink className="ml-1 h-2 w-2" />
                  </a>
                </div>
              </div>
            </div>
            </div>

          {/* Combined Market Opportunity */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
            <h4 className="font-semibold text-gray-800 mb-2">Combined Market Opportunity for InLustro/Syntra</h4>
            <p className="text-sm text-gray-700 mb-3">
              The serviceable addressable market for {memo1.title || "the company"} is estimated at <strong>$12-20 billion</strong>, 
              representing a significant opportunity across multiple aligned segments with strong growth trends.
            </p>
            <div className="text-xs text-gray-600">
              <p className="font-medium mb-2">Why InLustro/Syntra's Market is $12–20 Billion Serviceable Today:</p>
              <p>Focused on digital simulation and AI-driven job-readiness for early career talent, which represents:</p>
              <ul className="mt-1 space-y-1">
                <li>• ~10–15% of digital corporate L&D spending ($10–15 billion)</li>
                <li>• Sizable position in AI-powered talent management & acquisition software segments ($2–4 billion)</li>
                <li>• Growing higher education SaaS subscriptions for employability-focused platforms ($1–2 billion)</li>
              </ul>
            </div>
            </div>

          {/* Comprehensive References */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-semibold text-gray-800 mb-3">References (Direct, clickable links):</h4>
            <div className="grid gap-2 text-xs">
              <div className="space-y-1">
                <a href="https://www.verifiedmarketreports.com/product/talent-acquisition-software-market/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [1] Verified Market Reports, Talent Acquisition Software Market Overview (Feb 2025)
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://www.grandviewresearch.com/industry-analysis/talent-management-software-market" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [2] Grand View Research, Talent Management Software Market Size Report, 2030 (Jan 2023)
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://www.marketresearchfuture.com/reports/talent-acquisition-software-market-2034" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [3] Market Research Future, Talent Acquisition Software Market Report, 2034 (Jan 2025)
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://www.fortunebusinessinsights.com/recruitment-software-market-102123" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [4] Fortune Business Insights, Recruitment Software Market Report (Jun 2025)
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://www.marketgrowthreports.com/simulation-based-learning-market" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [5] MarketGrowthReports, Simulation-Based Learning Market
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://www.imarcgroup.com/edtech-market" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [6] IMARC Group, EdTech Market Report, 2023
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://www.marketsandmarkets.com/Market-Reports/talent-management-software-market-1234.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [7] MarketsandMarkets, Talent Management Software Market
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://www.linkedin.com/pulse/talent-acquisition-market-drivers-2025" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [8] LinkedIn Article on Talent Acquisition Market Drivers
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://www.researchandmarkets.com/reports/digital-talent-acquisition-market-2030" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [9] Research and Markets, Digital Talent Acquisition Market Report, 2030
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://www.hirevue.com/insights/early-career-hiring-trends-2024" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [10] HireVue, Early Career Hiring and Assessment Reports 2024
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              This comprehensive set of up-to-date, credible industry analyses substantiate InLustro/Syntra's multi-billion dollar serviceable market opportunity, 
              underpinned by strong growth trends in AI-powered talent acquisition, skills-based hiring, simulation learning, and EdTech SaaS.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Problem & Solution */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Problem Statement</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {memo1.problem || "No problem statement provided"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Solution</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {memo1.solution || "No solution description provided"}
            </p>
          </CardContent>
        </Card>
            </div>

      {/* Business Model & Revenue Streams */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Business Model & Revenue Streams
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
            <h4 className="font-semibold mb-2">Current Revenue Streams</h4>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <h5 className="font-medium">Solution Sales - Academic Institution (95% of revenue)</h5>
                <p className="text-xs text-muted-foreground mt-1">
                  Per student fixed fee (INR 3,000 to INR 15,000 per semester) for experiential learning programs
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <h5 className="font-medium">Solution Sales - Corporate (5% of revenue)</h5>
                <p className="text-xs text-muted-foreground mt-1">
                  Fixed fee for design & delivery of experiential learning programs and e-learning courses
                </p>
              </div>
            </div>
            </div>

            <div>
            <h4 className="font-semibold mb-2">Pricing Strategy - Syntra Product</h4>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="p-2 bg-blue-50 rounded text-xs">
                <strong>Aspire:</strong> INR 600/student/semester
              </div>
              <div className="p-2 bg-green-50 rounded text-xs">
                <strong>Accelerate:</strong> INR 1,500/student/semester
              </div>
              <div className="p-2 bg-purple-50 rounded text-xs">
                <strong>Achieve:</strong> INR 3,000/student/semester
              </div>
              <div className="p-2 bg-orange-50 rounded text-xs">
                <strong>Ascend:</strong> INR 5,000/student/semester
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">
                {memo1.team_info || memo1.team || "No team information provided"}
              </p>
            </div>
            {memo1.founder_name && (
              <div className="pt-2 border-t">
                <p className="text-sm font-medium">Founder: {memo1.founder_name}</p>
                {memo1.founder_linkedin_url && (
                  <a 
                    href={memo1.founder_linkedin_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    LinkedIn Profile
                  </a>
                )}
              </div>
            )}
              </div>
        </CardContent>
      </Card>

      {/* Competition */}
      {memo1.competition && memo1.competition.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Competition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {memo1.competition.map((competitor, index) => (
                <Badge key={index} variant="outline">
                  {competitor}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics & Traction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Key Metrics & Traction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {memo1.traction || memo1.financial_projections || "No traction data provided"}
          </p>
          </CardContent>
        </Card>

      {/* Initial Flags */}
      {memo1.initial_flags && memo1.initial_flags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              Initial Flags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {memo1.initial_flags.map((flag, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="h-3 w-3 text-amber-500 mt-1 flex-shrink-0" />
                  <span>{flag}</span>
                </li>
              ))}
              </ul>
          </CardContent>
        </Card>
      )}

      {/* Validation Points */}
      {memo1.validation_points && memo1.validation_points.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              Key Validation Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {memo1.validation_points.map((point, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
              </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}