'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  ShieldCheck, 
  FileText, 
  MessageCircle, 
  TrendingUp,
  ArrowRight,
  BarChart3,
  Users,
  Clock,
  CheckCircle
} from "lucide-react";
import Link from 'next/link';

export default function InvestorDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Investor Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Analyze startups and manage your investment pipeline
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Interview Test</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ready</div>
            <p className="text-xs text-muted-foreground">
              Test AI interview system
            </p>
            <Button asChild className="mt-2 w-full">
              <Link href="/dashboard/investor/ai-interview-test">
                Start Test
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diligence Hub</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Active diligences
            </p>
            <Button asChild variant="outline" className="mt-2 w-full">
              <Link href="/dashboard/diligence">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deal Memos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Generated memos
            </p>
            <Button asChild variant="outline" className="mt-2 w-full">
              <Link href="/dashboard/memo">
                View Memos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Create Room</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">New</div>
            <p className="text-xs text-muted-foreground">
              Start new session
            </p>
            <Button asChild variant="outline" className="mt-2 w-full">
              <Link href="/dashboard/create-room">
                Create Room
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent AI Interviews</CardTitle>
            <CardDescription>
              Latest interview sessions and results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">TechCorp AI Interview</p>
                  <p className="text-xs text-muted-foreground">Completed 1 hour ago</p>
                </div>
                <Badge variant="secondary">Completed</Badge>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">StartupXYZ Interview</p>
                  <p className="text-xs text-muted-foreground">In progress</p>
                </div>
                <Badge variant="outline">Active</Badge>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">InnovateAI Session</p>
                  <p className="text-xs text-muted-foreground">Scheduled for tomorrow</p>
                </div>
                <Badge variant="outline">Scheduled</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Investment Pipeline</CardTitle>
            <CardDescription>
              Current deals and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Series A - TechCorp</p>
                  <p className="text-xs text-muted-foreground">Due diligence completed</p>
                </div>
                <Badge variant="secondary">$2M</Badge>
              </div>
              <div className="flex items-center space-x-4">
                <Clock className="h-4 w-4 text-yellow-500" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Seed - StartupXYZ</p>
                  <p className="text-xs text-muted-foreground">AI interview in progress</p>
                </div>
                <Badge variant="outline">$500K</Badge>
              </div>
              <div className="flex items-center space-x-4">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Pre-Seed - InnovateAI</p>
                  <p className="text-xs text-muted-foreground">Initial screening</p>
                </div>
                <Badge variant="outline">$100K</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Overview</CardTitle>
          <CardDescription>
            Your current investment portfolio performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold">$15.2M</div>
              <p className="text-xs text-muted-foreground">Total Invested</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">$23.8M</div>
              <p className="text-xs text-muted-foreground">Current Value</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">56.6%</div>
              <p className="text-xs text-muted-foreground">IRR</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Active Investments</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
