"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  FileText, 
  Eye, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Search,
  Filter
} from "lucide-react"
import Link from "next/link"

export default function AdminMemosPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check authentication for static export
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('veritas_session')
      if (session) {
        try {
          const user = JSON.parse(session)
          if (user.role === 'admin') {
            setIsAuthenticated(true)
          }
        } catch (error) {
          console.error('Invalid session:', error)
        }
      }
      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please log in as an admin to access this page.</p>
          <Button asChild>
            <Link href="/admin">Go to Admin Login</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Static data for demonstration
  const memos = [
    {
      id: "1",
      companyName: "SIA",
      memoVersion: 1,
      status: "approved",
      aiConfidenceScore: 0.92,
      riskRating: "low",
      createdAt: "2024-01-15",
      founderName: "John Doe",
      industry: "Technology"
    },
    {
      id: "2", 
      companyName: "AREALIS GATEWAY",
      memoVersion: 2,
      status: "pending_review",
      aiConfidenceScore: 0.87,
      riskRating: "medium",
      createdAt: "2024-01-14",
      founderName: "Jane Smith",
      industry: "Fintech"
    },
    {
      id: "3",
      companyName: "we360.ai",
      memoVersion: 1,
      status: "approved",
      aiConfidenceScore: 0.95,
      riskRating: "low",
      createdAt: "2024-01-13",
      founderName: "Mike Johnson",
      industry: "AI/ML"
    },
    {
      id: "4",
      companyName: "TimBuckDo",
      memoVersion: 3,
      status: "flagged",
      aiConfidenceScore: 0.78,
      riskRating: "high",
      createdAt: "2024-01-12",
      founderName: "Sarah Wilson",
      industry: "EdTech"
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 'pending_review':
        return <Badge className="bg-orange-100 text-orange-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'flagged':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" />Flagged</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low Risk</Badge>
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High Risk</Badge>
      default:
        return <Badge variant="outline">{risk}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Memo Management</h1>
          <p className="text-gray-600 mt-1">Review and manage AI-generated memos</p>
        </div>
        <Button asChild>
          <Link href="/admin/dashboard/overview">Back to Overview</Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search companies..." className="pl-10" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">All Status</Button>
              <Button variant="outline" size="sm">Pending</Button>
              <Button variant="outline" size="sm">Approved</Button>
              <Button variant="outline" size="sm">Flagged</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Memos Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            AI-Generated Memos ({memos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {memos.map((memo) => (
              <div key={memo.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{memo.companyName}</h3>
                      {getStatusBadge(memo.status)}
                      {getRiskBadge(memo.riskRating)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Founder:</span> {memo.founderName}
                      </div>
                      <div>
                        <span className="font-medium">Industry:</span> {memo.industry}
                      </div>
                      <div>
                        <span className="font-medium">Memo Version:</span> {memo.memoVersion}
                      </div>
                      <div>
                        <span className="font-medium">AI Confidence:</span> {(memo.aiConfidenceScore * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/dashboard/memos/${memo.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Link>
                    </Button>
                    {memo.status === 'pending_review' && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
