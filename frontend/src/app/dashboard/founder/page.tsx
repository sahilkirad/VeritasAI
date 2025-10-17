'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Building2, 
  TrendingUp, 
  Users, 
  FileText, 
  Clock, 
  CheckCircle,
  ArrowRight,
  BarChart3
} from "lucide-react";
import Link from 'next/link';

export default function FounderDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Founder Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage your startup profile and participate in AI interviews
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Interview</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ready</div>
            <p className="text-xs text-muted-foreground">
              Participate in AI-powered interviews
            </p>
            <Button asChild className="mt-2 w-full">
              <Link href="/dashboard/founder/ai-interview">
                Start Interview
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Company Profile</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              Profile completion
            </p>
            <Button asChild variant="outline" className="mt-2 w-full">
              <Link href="/dashboard/founder-profile">
                Update Profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pitch Deck</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Versions uploaded
            </p>
            <Button asChild variant="outline" className="mt-2 w-full">
              <Link href="/dashboard/founder-pitch">
                Upload New
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
              Your latest interview sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">AI Interview Session #1</p>
                  <p className="text-xs text-muted-foreground">Completed 2 hours ago</p>
                </div>
                <Badge variant="secondary">Completed</Badge>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">AI Interview Session #2</p>
                  <p className="text-xs text-muted-foreground">In progress</p>
                </div>
                <Badge variant="outline">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Investment Insights</CardTitle>
            <CardDescription>
              AI-generated analysis of your startup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Market Analysis</p>
                  <p className="text-xs text-muted-foreground">Strong market opportunity identified</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Team Assessment</p>
                  <p className="text-xs text-muted-foreground">Experienced founding team</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Clock className="h-4 w-4 text-yellow-500" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Financial Review</p>
                  <p className="text-xs text-muted-foreground">Pending analysis</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Startup Metrics</CardTitle>
          <CardDescription>
            Key performance indicators for your startup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold">$2.5M</div>
              <p className="text-xs text-muted-foreground">Revenue Run Rate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">15%</div>
              <p className="text-xs text-muted-foreground">MoM Growth</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">1,250</div>
              <p className="text-xs text-muted-foreground">Active Users</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">$50K</div>
              <p className="text-xs text-muted-foreground">MRR</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
