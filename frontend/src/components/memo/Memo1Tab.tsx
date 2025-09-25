'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, TrendingUp, Target, AlertTriangle, CheckCircle, BarChart3, Globe, DollarSign, FileText } from "lucide-react";

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
}

export default function Memo1Tab({ memo1 }: Memo1TabProps) {
  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Executive Summary
          </CardTitle>
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

          {/* Market Size Data */}
          <div>
            <h4 className="font-semibold mb-2">Market Size Analysis</h4>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h5 className="font-medium text-blue-800">Talent Acquisition Software</h5>
                <p className="text-xs text-blue-600 mt-1">
                  Global market: $5.82B (2024) → $12.98B (2033) at 9.8% CAGR
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h5 className="font-medium text-green-800">Talent Management Software</h5>
                <p className="text-xs text-green-600 mt-1">
                  Global market: $9.96B (2023) → $22.67B (2030) at 12.5% CAGR
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <h5 className="font-medium text-purple-800">Simulation-Based Learning</h5>
                <p className="text-xs text-purple-600 mt-1">
                  Global market: $14.3B (2023) → $44B (2032) at >15% CAGR
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <h5 className="font-medium text-orange-800">AI in HR & Onboarding</h5>
                <p className="text-xs text-orange-600 mt-1">
                  Global market: $5.9B (2023) → $26.5B (2033) at 16.2% CAGR
                </p>
              </div>
            </div>
          </div>

          {/* Combined Market Opportunity */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
            <h4 className="font-semibold text-gray-800 mb-2">Combined Market Opportunity</h4>
            <p className="text-sm text-gray-700">
              The serviceable addressable market for {memo1.title || "the company"} is estimated at <strong>$12-20 billion</strong>, 
              representing a significant opportunity across multiple aligned segments with strong growth trends.
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