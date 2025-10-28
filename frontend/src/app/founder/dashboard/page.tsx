'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, DollarSign, Users, TrendingUp, CheckCircle, PlusCircle, LineChart, BarChart, RefreshCw, User, MessageSquare, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleAnalyticsDialog } from "@/components/GoogleAnalyticsDialog";
import { AnalyticsDataDisplay } from "@/components/AnalyticsDataDisplay";
import { googleAnalyticsService, type AnalyticsData } from "@/lib/google-analytics";
import { useChat } from "@/hooks/useChat";
import { Badge } from "@/components/ui/badge";


export default function FounderDashboardPage() {
  const [isGoogleAnalyticsDialogOpen, setIsGoogleAnalyticsDialogOpen] = useState(false);
  const [isGoogleAnalyticsConnected, setIsGoogleAnalyticsConnected] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  
  // Mock user data - in real app, get from auth context
  const userId = 'founder1';
  const userRole = 'founder' as const;
  
  const { rooms, totalUnread } = useChat(userId, userRole);
  

  const sources = [
    { name: 'Stripe', description: 'Sync financial data', connected: true },
    { name: 'Google Analytics', description: 'Track user engagement', connected: isGoogleAnalyticsConnected },
    { name: 'QuickBooks', description: 'Manage accounting', connected: false },
    { name: 'HubSpot', description: 'Sync CRM data', connected: false },
  ];

  // Check Google Analytics connection status on component mount
  useEffect(() => {
    const isConnected = googleAnalyticsService.isGoogleAnalyticsConnected();
    setIsGoogleAnalyticsConnected(isConnected);
    
    if (isConnected) {
      loadAnalyticsData();
    }
  }, []);

  const loadAnalyticsData = async () => {
    setIsLoadingAnalytics(true);
    try {
      console.log('🔄 Loading Google Analytics data...');
      const data = await googleAnalyticsService.fetchAnalyticsData();
      if (data) {
        console.log('✅ Analytics data loaded successfully:', data);
        setAnalyticsData(data);
      } else {
        console.warn('⚠️ No analytics data received');
      }
    } catch (error) {
      console.error('❌ Failed to load analytics data:', error);
      // Don't set analytics data on error - this ensures we only show real data
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const handleGoogleAnalyticsConnect = () => {
    setIsGoogleAnalyticsDialogOpen(true);
  };

  const handleGoogleAnalyticsConnected = () => {
    setIsGoogleAnalyticsConnected(true);
    loadAnalyticsData();
  };

  const handleGoogleAnalyticsDisconnect = async () => {
    await googleAnalyticsService.disconnect();
    setIsGoogleAnalyticsConnected(false);
    setAnalyticsData(null);
  };


  // Update KPI data with real Google Analytics data
  const getKpiData = () => {
    const baseKpiData = [
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
        value: analyticsData ? `${(analyticsData.activeUsers / 1000).toFixed(1)}K` : '1,200',
        change: analyticsData ? `+${((analyticsData.newUsers / analyticsData.activeUsers) * 100).toFixed(1)}%` : '+15.3%',
        icon: Users,
        source: 'Google Analytics',
        sourceConnected: isGoogleAnalyticsConnected,
      },
      {
        title: 'User Growth (WoW)',
        value: analyticsData ? `${((analyticsData.newUsers / analyticsData.activeUsers) * 100).toFixed(1)}%` : '5.1%',
        change: analyticsData ? `vs ${((analyticsData.returningUsers / analyticsData.activeUsers) * 100).toFixed(1)}% returning` : 'vs 4.8% last week',
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
    ];

    return baseKpiData;
  };
  return (
    <>
    <div className="grid gap-8">
       <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {getKpiData().map((kpi) => (
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

        {/* Investor Rooms Card */}
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <MessageSquare className="h-5 w-5" />
              Investor Rooms
            </CardTitle>
            <CardDescription className="text-green-700">
              Connect with investors who are interested in your company. Build relationships and advance your funding conversations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stats Section */}
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-900 flex items-center justify-center gap-2">
                    {rooms.length}
                    {totalUnread > 0 && (
                      <Badge variant="destructive" className="text-xs animate-pulse">
                        {totalUnread} new
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-green-700 font-medium">Active Conversations</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-white/60 rounded-lg p-3">
                    <div className="text-lg font-semibold text-green-900">
                      {rooms.filter(room => room.status === 'active').length}
                    </div>
                    <p className="text-xs text-green-600">Active</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <div className="text-lg font-semibold text-green-900">
                      {rooms.filter(room => room.unreadCount > 0).length}
                    </div>
                    <p className="text-xs text-green-600">Unread</p>
                  </div>
                </div>
              </div>

              {/* Recent Conversations */}
              <div className="space-y-3">
                <h4 className="font-semibold text-green-900 text-sm">Recent Conversations</h4>
                {rooms.length > 0 ? (
                  <div className="space-y-2">
                    {rooms.slice(0, 3).map((room, index) => (
                      <div key={room.id} className="bg-white/60 rounded-lg p-3 hover:bg-white/80 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-green-900 text-sm truncate">
                              {room.investorName}
                            </p>
                            <p className="text-xs text-green-600 truncate">
                              {room.investorFirm || 'Independent Investor'}
                            </p>
                          </div>
                          {room.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                              {room.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-green-700 mt-1 truncate">
                          {room.lastMessage}
                        </p>
                      </div>
                    ))}
                    {rooms.length > 3 && (
                      <p className="text-xs text-green-600 text-center">
                        +{rooms.length - 3} more conversations
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <MessageSquare className="h-8 w-8 text-green-300 mx-auto mb-2" />
                    <p className="text-sm text-green-600">No conversations yet</p>
                    <p className="text-xs text-green-500">Investors will reach out after reviewing your Memo 3</p>
                  </div>
                )}
              </div>

              {/* Actions Section */}
              <div className="space-y-3">
                <h4 className="font-semibold text-green-900 text-sm">Quick Actions</h4>
                <div className="space-y-2">
                  <Link href="/founder/dashboard/messages" className="block">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      View All Messages
                    </Button>
                  </Link>
                  
                  <Button variant="outline" className="w-full border-green-300 text-green-700 hover:bg-green-50">
                    <Users className="mr-2 h-4 w-4" />
                    Find More Investors
                  </Button>
                  
                  <Button variant="ghost" className="w-full text-green-600 hover:bg-green-50">
                    <FileText className="mr-2 h-4 w-4" />
                    Share Pitch Deck
                  </Button>
                </div>

                {/* Tips */}
                <div className="bg-green-100/50 rounded-lg p-3 mt-4">
                  <h5 className="font-medium text-green-900 text-xs mb-1">💡 Pro Tip</h5>
                  <p className="text-xs text-green-700">
                    Respond quickly to investor messages to maintain their interest and momentum.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Completion Call-to-Action */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <User className="h-5 w-5" />
              Complete Your Founder Profile
            </CardTitle>
            <CardDescription className="text-blue-700">
              Help investors understand your background and expertise. Complete your profile to enable advanced diligence validation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-blue-800">
                  Add your professional background, education, and experience to help investors make informed decisions.
                </p>
                <p className="text-xs text-blue-600">
                  This data will be used for AI-powered diligence analysis and validation.
                </p>
              </div>
              <Link href="/founder/dashboard/profile">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <User className="h-4 w-4 mr-2" />
                  Complete Profile
                  <ArrowUpRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

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
                          {source.name === 'Google Analytics' ? (
                            source.connected ? (
                              <div className="w-full space-y-2">
                                <Button variant="outline" disabled className="w-full">
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                  Connected
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={handleGoogleAnalyticsDisconnect}
                                  className="w-full text-xs"
                                >
                                  Disconnect
                                </Button>
                              </div>
                            ) : (
                              <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={handleGoogleAnalyticsConnect}
                              >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Connect
                              </Button>
                            )
                          ) : source.connected ? (
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
                    <Link href="/founder/dashboard/profile" className="flex items-center gap-3 hover:bg-muted/50 p-2 rounded-md transition-colors">
                      <User className="h-6 w-6 text-blue-500" />
                      <span className="text-blue-600 font-medium">Complete Founder Profile</span>
                      <ArrowUpRight className="h-4 w-4 text-blue-500" />
                    </Link>
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
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-dashed border-primary text-primary font-bold">6</div>
                    <span>Create First "Investor Room"</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
        </div>


        {/* Google Analytics Data Display */}
        {isGoogleAnalyticsConnected && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-5 w-5" />
                    Google Analytics Data
                  </CardTitle>
                  <CardDescription>
                    Analytics data from your connected Google Analytics account
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadAnalyticsData}
                  disabled={isLoadingAnalytics}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoadingAnalytics ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading analytics data...</p>
                  </div>
                </div>
              ) : analyticsData ? (
                <AnalyticsDataDisplay data={analyticsData} />
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">No analytics data available. Click refresh to load data.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
    </div>

    {/* Google Analytics Connection Dialog */}
    <GoogleAnalyticsDialog
      open={isGoogleAnalyticsDialogOpen}
      onOpenChange={setIsGoogleAnalyticsDialogOpen}
      onConnected={handleGoogleAnalyticsConnected}
    />
    </>
  );
}
