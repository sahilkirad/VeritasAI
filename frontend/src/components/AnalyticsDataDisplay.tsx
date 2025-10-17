'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Eye, Clock, TrendingUp, Globe, BarChart3 } from 'lucide-react';
import type { AnalyticsData } from '@/lib/google-analytics';

interface AnalyticsDataDisplayProps {
  data: AnalyticsData;
}

export function AnalyticsDataDisplay({ data }: AnalyticsDataDisplayProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.activeUsers)}</div>
            <p className="text-xs text-muted-foreground">
              {data.newUsers} new, {data.returningUsers} returning
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.pageViews)}</div>
            <p className="text-xs text-muted-foreground">
              {data.sessions} sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(data.avgSessionDuration)}</div>
            <p className="text-xs text-muted-foreground">
              {data.bounceRate.toFixed(1)}% bounce rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.newUsers)}</div>
            <p className="text-xs text-muted-foreground">
              {((data.newUsers / data.activeUsers) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Pages
            </CardTitle>
            <CardDescription>Most viewed pages in the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topPages.slice(0, 5).map((page, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{page.page}</p>
                  </div>
                  <Badge variant="secondary">{formatNumber(page.views)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Traffic Sources
            </CardTitle>
            <CardDescription>Where your users come from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.trafficSources.slice(0, 5).map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{source.source}</p>
                    <p className="text-xs text-muted-foreground">{source.percentage.toFixed(1)}%</p>
                  </div>
                  <Badge variant="outline">{formatNumber(source.sessions)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Countries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            User Geography
          </CardTitle>
          <CardDescription>Active users by country</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.userCountries.slice(0, 6).map((country, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">{country.country}</p>
                  <p className="text-xs text-muted-foreground">{country.percentage.toFixed(1)}%</p>
                </div>
                <Badge variant="secondary">{formatNumber(country.users)}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
