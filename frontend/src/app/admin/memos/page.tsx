"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowLeft, Plus, RefreshCw, Download, MoreHorizontal, Eye, FileText, Brain, Zap, ExternalLink } from "lucide-react"
import Link from "next/link"
import { MemoSummary, MemoFilterOptions } from "@/lib/types/memo"
import { getMemoFilterOptions, filterMemoSummaries, getMemoStats } from "@/lib/services/memoService"
import { realtimeService } from "@/lib/services/realtimeService"
import { FilterPanel } from "@/components/admin/FilterPanel"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { ScoreBar } from "@/components/admin/ScoreBar"

export default function AdminMemosPage() {
  const router = useRouter()
  const [memos, setMemos] = useState<MemoSummary[]>([])
  const [filteredMemos, setFilteredMemos] = useState<MemoSummary[]>([])
  const [filters, setFilters] = useState<MemoFilterOptions>({})
  const [filterOptions, setFilterOptions] = useState({
    statuses: [],
    stages: [],
    sectors: [],
    riskLevels: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Set up real-time memos data
  useEffect(() => {
    let unsubscribe: (() => void) | null = null

    const setupRealtimeMemos = () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🔄 Setting up real-time memos listener...')
        
        unsubscribe = realtimeService.subscribeToMemos(
          (data) => {
            console.log(`📊 Real-time memos update: ${data.length} memos`)
            setMemos(data)
            setFilteredMemos(data)
            
            // Get filter options
            const options = getMemoFilterOptions(data)
            setFilterOptions(options)
            
            setLoading(false)
          },
          (error) => {
            console.error('❌ Real-time memos error:', error)
            setError('Failed to load memos data')
            setLoading(false)
          }
        )
      } catch (err) {
        console.error('❌ Error setting up memos listener:', err)
        setError('Failed to initialize memos data')
        setLoading(false)
      }
    }

    setupRealtimeMemos()

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  // Apply filters when they change
  useEffect(() => {
    const filtered = filterMemoSummaries(memos, filters)
    setFilteredMemos(filtered)
  }, [memos, filters])

  const handleFiltersChange = (newFilters: MemoFilterOptions) => {
    setFilters(newFilters)
  }

  const handleRefresh = () => {
    // Real-time data automatically refreshes, just show loading state briefly
    setLoading(true)
    setTimeout(() => setLoading(false), 1000)
  }

  const handleViewMemo = (memoId: string) => {
    if (!memoId || typeof memoId !== 'string' || memoId.trim() === '') {
      console.error('❌ Invalid memo ID for navigation:', memoId)
      return
    }
    console.log('🔄 Navigating to memo details:', memoId)
    try {
      router.push(`/admin/memos/${memoId}`)
    } catch (error) {
      console.error('❌ Navigation error:', error)
      window.location.href = `/admin/memos/${memoId}`
    }
  }

  const handleGenerateMemo = (memoId: string, memoType: string) => {
    console.log('Generate memo:', memoId, memoType)
    // TODO: Implement memo generation
  }

  const handleExport = () => {
    console.log('Export memos data')
    // TODO: Implement export functionality
  }

  const stats = getMemoStats(memos)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Memos</h1>
            <p className="text-muted-foreground">
              Manage and monitor AI-generated investment memos
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading memos...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Memos</h1>
            <p className="text-muted-foreground">
              Manage and monitor AI-generated investment memos
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Generate Memo
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Memos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMemos}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completionRate}% complete
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memo 3 Ready</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.memo3Count}</div>
            <p className="text-xs text-muted-foreground">
              Ready for investors
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgScore}/10</div>
            <p className="text-xs text-muted-foreground">
              {stats.highScoreCount} high scores
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowRiskCount}</div>
            <p className="text-xs text-muted-foreground">
              Low risk investments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="mt-2"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <FilterPanel
        filters={filters}
        onFiltersChange={handleFiltersChange}
        filterOptions={filterOptions}
      />

      {/* Memos Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Startup</TableHead>
              <TableHead>Founder</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>AI Score</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMemos.map((memo) => (
              <TableRow key={memo.id}>
                <TableCell className="font-medium">
                  <div>
                    <div className="font-semibold">{memo.startupName}</div>
                    <div className="text-sm text-muted-foreground">
                      {memo.sector?.join(', ') || 'Not specified'}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{memo.founderName}</div>
                    <div className="text-sm text-muted-foreground">
                      {memo.founderEmail}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{memo.stage}</Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status={memo.status} type="status" />
                </TableCell>
                <TableCell>
                  <ScoreBar score={memo.aiScore} showLabel={false} className="w-20" />
                </TableCell>
                <TableCell>
                  <StatusBadge status={memo.riskLevel} type="risk" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Badge variant={memo.memo1Generated ? "default" : "outline"} className="text-xs">
                      M1
                    </Badge>
                    <Badge variant={memo.memo2Generated ? "default" : "outline"} className="text-xs">
                      M2
                    </Badge>
                    <Badge variant={memo.memo3Generated ? "default" : "outline"} className="text-xs">
                      M3
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(memo.lastUpdated)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewMemo(memo.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open(`/admin/memos/${memo.id}`, '_blank')}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in New Tab
                      </DropdownMenuItem>
                      {!memo.memo1Generated && (
                        <DropdownMenuItem onClick={() => handleGenerateMemo(memo.id, 'memo1')}>
                          <FileText className="h-4 w-4 mr-2" />
                          Generate Memo 1
                        </DropdownMenuItem>
                      )}
                      {memo.memo1Generated && !memo.memo2Generated && (
                        <DropdownMenuItem onClick={() => handleGenerateMemo(memo.id, 'memo2')}>
                          <Brain className="h-4 w-4 mr-2" />
                          Generate Memo 2
                        </DropdownMenuItem>
                      )}
                      {memo.memo2Generated && !memo.memo3Generated && (
                        <DropdownMenuItem onClick={() => handleGenerateMemo(memo.id, 'memo3')}>
                          <Zap className="h-4 w-4 mr-2" />
                          Generate Memo 3
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredMemos.length === 0 && (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No memos found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or search terms.
          </p>
        </div>
      )}
    </div>
  )
}