"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Edit,
  MoreHorizontal,
  Calendar,
  User,
  RefreshCw,
  Database
} from "lucide-react"
import Link from "next/link"
import { useMemoManagementData } from "@/hooks/useHybridAdminData"
import { useAdminMemos } from "@/hooks/useFirestoreRealtime"
import { FirebaseErrorBoundary } from "@/components/admin/FirebaseErrorBoundary"
import { FirebaseLoading } from "@/components/admin/FirebaseLoading"

interface MemoData {
  id: string
  companyName: string
  memoVersion: 1 | 2 | 3
  status: 'pending_review' | 'approved' | 'flagged' | 'rejected'
  aiConfidenceScore: number
  riskRating: 'low' | 'medium' | 'high' | 'critical'
  createdAt: string
  reviewedBy?: string
  reviewedAt?: string
}

export default function MemoManagementPage() {
  // Use hybrid data for memo management
  const { liveMetrics, historicalMetrics, diligenceMetrics, loading: hybridLoading } = useMemoManagementData()
  
  // Get real-time memos from Firestore
  const { data: firestoreMemos, loading: memosLoading, error: memosError } = useAdminMemos()
  
  const [filteredMemos, setFilteredMemos] = useState<MemoData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [versionFilter, setVersionFilter] = useState<string>("all")
  const [riskFilter, setRiskFilter] = useState<string>("all")

  // Convert Firestore data to MemoData format - memoized to prevent infinite loops
  const memos: MemoData[] = useMemo(() => 
    firestoreMemos.map((memo: any) => ({
      id: memo.id || 'unknown',
      companyName: String(memo.startupName || memo.companyName || 'Unknown Company'),
      memoVersion: memo.memoVersion === 'Memo 1' ? 1 : memo.memoVersion === 'Memo 2' ? 2 : memo.memoVersion === 'Memo 3' ? 3 : 1,
      status: memo.status || 'pending_review',
      aiConfidenceScore: Number(memo.aiConfidenceScore) || 0,
      riskRating: String(memo.riskRating || 'medium').toLowerCase(),
      createdAt: memo.createdAt || new Date().toISOString(),
      reviewedBy: memo.reviewerId || memo.reviewedBy,
      reviewedAt: memo.reviewedAt
    })),
    [firestoreMemos] // Only recreate when Firestore data changes
  )

  useEffect(() => {
    // Filter memos based on search and filters
    let filtered = memos

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(memo => 
        String(memo.companyName || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(memo => memo.status === statusFilter)
    }

    // Version filter
    if (versionFilter !== "all") {
      filtered = filtered.filter(memo => memo.memoVersion === parseInt(versionFilter))
    }

    // Risk filter
    if (riskFilter !== "all") {
      filtered = filtered.filter(memo => memo.riskRating === riskFilter)
    }

    setFilteredMemos(filtered)
  }, [memos, searchTerm, statusFilter, versionFilter, riskFilter])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'pending_review':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>
      case 'flagged':
        return <Badge variant="destructive" className="bg-orange-100 text-orange-800"><AlertCircle className="w-3 h-3 mr-1" />Flagged</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low':
        return <Badge variant="outline" className="text-green-600 border-green-200">Low</Badge>
      case 'medium':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200">Medium</Badge>
      case 'high':
        return <Badge variant="outline" className="text-orange-600 border-orange-200">High</Badge>
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>
      default:
        return <Badge variant="outline">{risk}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setVersionFilter("all")
    setRiskFilter("all")
  }

  const loading = memosLoading || hybridLoading

  if (loading) {
    return (
      <FirebaseLoading>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </FirebaseLoading>
    )
  }

  if (memosError) {
    return (
      <FirebaseErrorBoundary>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Memo Management</h1>
              <p className="text-gray-600 mt-2">Review and approve AI-generated memos</p>
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error loading memos: {memosError.message}</p>
          </div>
        </div>
      </FirebaseErrorBoundary>
    )
  }

  return (
    <FirebaseErrorBoundary>
      <FirebaseLoading>
        <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Memo Management</h1>
          <p className="text-gray-600 mt-2">Review and approve AI-generated memos</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1 text-sm text-green-600">
              <Database className="h-3 w-3" />
              <span>Live Data</span>
            </div>
            <div className="text-sm text-gray-500">
              {memos.length} memos loaded
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Bulk Actions
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending_review">Pending Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={versionFilter} onValueChange={setVersionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Memo Version" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Versions</SelectItem>
                <SelectItem value="1">Memo 1</SelectItem>
                <SelectItem value="2">Memo 2</SelectItem>
                <SelectItem value="3">Memo 3</SelectItem>
              </SelectContent>
            </Select>

            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Risk Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
                <SelectItem value="critical">Critical Risk</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="w-full" onClick={clearFilters}>
              <Filter className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Memos Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Memos ({filteredMemos.length})</CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Real-time updates</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>AI Confidence</TableHead>
                  <TableHead>Risk Rating</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Reviewed By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMemos.map((memo) => (
                  <TableRow key={memo.id}>
                    <TableCell className="font-medium">{memo.companyName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">Memo {memo.memoVersion}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(memo.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`font-medium ${getConfidenceColor(memo.aiConfidenceScore)}`}>
                          {Math.round(memo.aiConfidenceScore * 100)}%
                        </div>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              memo.aiConfidenceScore >= 0.8 ? 'bg-green-500' : 
                              memo.aiConfidenceScore >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${memo.aiConfidenceScore * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRiskBadge(memo.riskRating)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {formatDate(memo.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {memo.reviewedBy ? (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <User className="h-3 w-3" />
                          {memo.reviewedBy}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/dashboard/memos/${memo.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
        </div>
      </FirebaseLoading>
    </FirebaseErrorBoundary>
  )
}
