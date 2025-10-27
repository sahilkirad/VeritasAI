"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  FileText, 
  TrendingUp, 
  Bot, 
  CheckCircle, 
  Clock, 
  Activity,
  ArrowRight,
  BarChart3,
  Target,
  Zap
} from "lucide-react"
import Link from "next/link"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase-new"

interface DashboardStats {
  totalStartups: number
  totalMemos: number
  totalInvestors: number
  totalDeals: number
}

interface AISystemStatus {
  name: string
  status: 'active' | 'running' | 'ready' | 'error'
  details: string
  accuracy?: number
  score?: number
}

interface RecentActivity {
  id: string
  startup: string
  action: string
  timestamp: string
  status: 'success' | 'pending' | 'error'
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStartups: 0,
    totalMemos: 0,
    totalInvestors: 0,
    totalDeals: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // AI System Status (static for now)
  const aiSystems: AISystemStatus[] = [
    {
      name: "Memo 1 Agent",
      status: "active",
      details: "Intake & Curation",
      accuracy: 92
    },
    {
      name: "Memo 2 Agent", 
      status: "running",
      details: "Due Diligence & Validation"
    },
    {
      name: "Memo 3 Agent",
      status: "active", 
      details: "Final Investment Decision",
      score: 7.2
    },
    {
      name: "Investor Matcher",
      status: "ready",
      details: "AI-powered investor recommendations"
    }
  ]

  // Recent Activity (mock data for now)
  const recentActivity: RecentActivity[] = [
    {
      id: "1",
      startup: "Syntra",
      action: "Memo 3 Generated",
      timestamp: "Oct 26, 2:00 AM",
      status: "success"
    },
    {
      id: "2", 
      startup: "FinTechEd",
      action: "AI Interview Complete",
      timestamp: "Oct 25",
      status: "success"
    },
    {
      id: "3",
      startup: "WorkIQ", 
      action: "Sent to 3 Investors",
      timestamp: "Oct 24",
      status: "success"
    },
    {
      id: "4",
      startup: "CloudScale",
      action: "Approval Pending",
      timestamp: "Oct 23",
      status: "pending"
    }
  ]

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch data from Firestore collections
        const [usersSnapshot, memosSnapshot, ingestionSnapshot] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'adminMemos')),
          getDocs(collection(db, 'ingestionResults'))
        ])

        // Count users by role
        const users = usersSnapshot.docs.map(doc => doc.data())
        const totalInvestors = users.filter(user => user.role === 'investor').length
        const totalFounders = users.filter(user => user.role === 'founder').length

        // Count memos and deals
        const totalMemos = memosSnapshot.docs.length
        const totalIngestionResults = ingestionSnapshot.docs.length

        setStats({
          totalStartups: totalFounders, // Using founders as proxy for startups
          totalMemos: totalMemos + totalIngestionResults,
          totalInvestors,
          totalDeals: Math.floor(totalMemos * 0.3) // Mock calculation
        })

      } catch (err) {
        console.error('Error fetching dashboard stats:', err)
        setError('Failed to load dashboard data')
        // Set fallback stats
        setStats({
          totalStartups: 42,
          totalMemos: 120,
          totalInvestors: 25,
          totalDeals: 15
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <Activity className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the Veritas Admin Console. Monitor your platform performance and manage operations.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Startups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStartups}</div>
            <p className="text-xs text-muted-foreground">
              Active startup profiles
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMemos}</div>
            <p className="text-xs text-muted-foreground">
              Generated investment memos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investors</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvestors}</div>
            <p className="text-xs text-muted-foreground">
              Registered investors
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDeals}</div>
            <p className="text-xs text-muted-foreground">
              Active deal processes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI System Status
          </CardTitle>
          <CardDescription>
            Monitor the health and performance of AI agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {aiSystems.map((system, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(system.status)}
                  <div>
                    <p className="font-medium">{system.name}</p>
                    <p className="text-sm text-muted-foreground">{system.details}</p>
                    {system.accuracy && (
                      <p className="text-xs text-green-600">Accuracy: {system.accuracy}%</p>
                    )}
                    {system.score && (
                      <p className="text-xs text-blue-600">Avg Score: {system.score}/10</p>
                    )}
                  </div>
                </div>
                <Badge variant={system.status === 'active' ? 'default' : 'secondary'}>
                  {system.status.charAt(0).toUpperCase() + system.status.slice(1)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common administrative tasks and navigation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin/startups">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Users className="h-6 w-6" />
                <span>View Startups</span>
              </Button>
            </Link>
            <Link href="/admin/investors">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <TrendingUp className="h-6 w-6" />
                <span>View Investors</span>
              </Button>
            </Link>
            <Link href="/admin/memos">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <FileText className="h-6 w-6" />
                <span>View Memos</span>
              </Button>
            </Link>
            <Link href="/admin/deals">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <BarChart3 className="h-6 w-6" />
                <span>View Deals</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest platform activities and system events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <div>
                    <p className="font-medium">{activity.startup}</p>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(activity.status)}>
                    {activity.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{activity.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
            <p className="text-sm text-red-500 mt-1">
              Showing fallback data. Some metrics may not be accurate.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
