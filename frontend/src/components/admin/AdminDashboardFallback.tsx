// components/admin/AdminDashboardFallback.tsx
// Fallback component when Firebase is not available

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Activity, 
  FileText, 
  CheckCircle, 
  TrendingUp, 
  Clock,
  Users,
  AlertCircle
} from "lucide-react"
import { useBigQueryOnly } from "@/hooks/useBigQueryOnly"

export function AdminDashboardFallback() {
  const { historicalMetrics, diligenceMetrics, timeSeries, loading } = useBigQueryOnly()
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor platform activity and manage AI-generated content</p>
        <div className="mt-2">
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            <AlertCircle className="h-3 w-3 mr-1" />
            Offline Mode - Using BigQuery Data Only
          </Badge>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions (All Time)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : historicalMetrics.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              Historical data from BigQuery
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : `${historicalMetrics.successRate.toFixed(1)}%`}</div>
            <p className="text-xs text-muted-foreground">
              Historical average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : historicalMetrics.weekSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              New submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : `${historicalMetrics.avgProcessingTime.toFixed(1)}s`}</div>
            <p className="text-xs text-muted-foreground">
              Historical average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* BigQuery Analytics Section */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Analytics (BigQuery)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Loading Historical Data...</h3>
              <p className="text-sm">
                Fetching analytics from BigQuery. Real-time data is unavailable offline.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Real-time Data Unavailable</h3>
              <p className="text-sm">
                Firestore connection is not available. Historical data will be shown from BigQuery.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
