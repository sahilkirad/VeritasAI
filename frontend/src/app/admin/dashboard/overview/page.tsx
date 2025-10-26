"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Activity,
  ArrowUpRight,
  Clock,
  DollarSign
} from "lucide-react"
import Link from "next/link"
import { useOverviewData } from "@/hooks/useHybridAdminData"
import { FirebaseErrorBoundary } from "@/components/admin/FirebaseErrorBoundary"
import { FirebaseLoading } from "@/components/admin/FirebaseLoading"
import { AdminDashboardFallback } from "@/components/admin/AdminDashboardFallback"
import { DataInitializer } from "@/components/admin/DataInitializer"

interface PlatformMetrics {
  totalActiveDeals: number
  pendingMemos: number
  approvedMemos: number
  totalInvestors: number
  totalFounders: number
  conversionRate: number
  conversions: {
    submitted: number
    approved: number
    funded: number
  }
}

interface ActivityItem {
  id: string
  type: 'memo_approved' | 'memo_flagged' | 'recommendation_generated' | 'user_registered'
  message: string
  timestamp: string
  severity: 'info' | 'warning' | 'success' | 'error'
}

export default function AdminOverviewPage() {
  // Debug logging
  console.log('🔍 AdminOverviewPage rendered')
  
  // Use hybrid data (Firestore + BigQuery)
  const { liveMetrics, historicalMetrics, recentActivity, loading, error } = useOverviewData()
  
  const [conversionRate] = useState(32.5) // This would come from analytics
  const [conversions] = useState({
    submitted: historicalMetrics?.totalSubmissions || 0,
    approved: liveMetrics?.approvedMemos || 0,
    funded: Math.floor((liveMetrics?.approvedMemos || 0) * 0.4) // Estimate funded as 40% of approved
  })


  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'error': return 'text-red-600'
      default: return 'text-blue-600'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'success': return <CheckCircle className="h-4 w-4" />
      case 'warning': return <AlertCircle className="h-4 w-4" />
      case 'error': return <AlertCircle className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // If Firebase is not available, show fallback with BigQuery data only
  if (error && error.message.includes('Firebase not initialized')) {
    return <AdminDashboardFallback />
  }

  return (
    <FirebaseLoading>
      <FirebaseErrorBoundary error={error}>
        <div className="space-y-6">
        {/* DEBUG: Admin Dashboard Overview Page */}
        <div className="bg-red-100 border-2 border-red-500 p-4 rounded-lg text-center">
          <h1 className="text-2xl font-bold text-red-700">🔍 ADMIN DASHBOARD OVERVIEW PAGE</h1>
          <p className="text-red-600">This is the admin dashboard, not the landing page!</p>
        </div>
        
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor platform activity and manage AI-generated content</p>
        </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deals (Live)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveMetrics?.totalActiveDeals || 0}</div>
            <p className="text-xs text-muted-foreground">
              Real-time count
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{liveMetrics?.pendingMemos || 0}</div>
            <p className="text-xs text-muted-foreground">
              Memos awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Memos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{liveMetrics?.approvedMemos || 0}</div>
            <p className="text-xs text-muted-foreground">
              Published to investors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{historicalMetrics?.successRate?.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Historical average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions (All Time)</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{historicalMetrics?.totalSubmissions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Avg processing: {historicalMetrics?.avgProcessingTime?.toFixed(2)}s
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{historicalMetrics?.weekSubmissions || 0}</div>
            <p className="text-xs text-muted-foreground">
              New submissions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-medium">Submitted</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{conversions.submitted}</div>
                <div className="text-sm text-muted-foreground">Startups</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <ArrowUpRight className="h-6 w-6 text-gray-400" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="font-medium">Approved</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{conversions.approved}</div>
                <div className="text-sm text-muted-foreground">
                  {Math.round((conversions.approved / conversions.submitted) * 100)}% conversion
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <ArrowUpRight className="h-6 w-6 text-gray-400" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">Funded</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{conversions.funded}</div>
                <div className="text-sm text-muted-foreground">
                  {Math.round((conversions.funded / conversions.submitted) * 100)}% conversion
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/admin/dashboard/memos">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Review Pending Memos
                <Badge variant="secondary" className="ml-auto">
                  {liveMetrics?.pendingMemos || 0}
                </Badge>
              </Button>
            </Link>
            
            <Link href="/admin/dashboard/memos?filter=flagged">
              <Button variant="outline" className="w-full justify-start">
                <AlertCircle className="mr-2 h-4 w-4" />
                Deals Needing Attention
                <Badge variant="destructive" className="ml-auto">
                  3
                </Badge>
              </Button>
            </Link>
            
            <Link href="/admin/dashboard/recommendations">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Investor Matches Generated
                <Badge variant="secondary" className="ml-auto">
                  12
                </Badge>
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`mt-1 ${getSeverityColor(activity.severity)}`}>
                    {getSeverityIcon(activity.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{activity.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Initialization */}
        <DataInitializer />
      </div>
    </div>
    </FirebaseErrorBoundary>
    </FirebaseLoading>
  )
}
