"use client"

import { useState, useEffect } from "react"
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
import { ArrowLeft, Plus, RefreshCw, Download, MoreHorizontal, Eye, Mail, Calendar, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Deal, DealFilterOptions } from "@/lib/types/deal"
import { getAllDeals, getDealFilterOptions, filterDeals, getDealStats } from "@/lib/services/dealService"
import { FilterPanel } from "@/components/admin/FilterPanel"
import { StatusBadge } from "@/components/admin/StatusBadge"

export default function AdminDealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([])
  const [filters, setFilters] = useState<DealFilterOptions>({})
  const [filterOptions, setFilterOptions] = useState({
    statuses: [],
    investorFirms: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch deals data
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🔄 Fetching deals data...')
        const data = await getAllDeals()
        setDeals(data)
        setFilteredDeals(data)
        
        // Get filter options
        const options = getDealFilterOptions(data)
        setFilterOptions(options)
        
        console.log(`✅ Loaded ${data.length} deals`)
      } catch (err) {
        console.error('❌ Error fetching deals:', err)
        setError('Failed to load deals data')
      } finally {
        setLoading(false)
      }
    }

    fetchDeals()
  }, [])

  // Apply filters when they change
  useEffect(() => {
    const filtered = filterDeals(deals, filters)
    setFilteredDeals(filtered)
  }, [deals, filters])

  const handleFiltersChange = (newFilters: DealFilterOptions) => {
    setFilters(newFilters)
  }

  const handleRefresh = async () => {
    try {
      setLoading(true)
      const data = await getAllDeals()
      setDeals(data)
      setFilteredDeals(data)
      
      const options = getDealFilterOptions(data)
      setFilterOptions(options)
    } catch (err) {
      console.error('Error refreshing data:', err)
      setError('Failed to refresh data')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDeal = (dealId: string) => {
    console.log('View deal:', dealId)
    // TODO: Navigate to deal detail page
  }

  const handleSendFollowUp = (dealId: string) => {
    console.log('Send follow-up for deal:', dealId)
    // TODO: Implement follow-up functionality
  }

  const handleScheduleCall = (dealId: string) => {
    console.log('Schedule call for deal:', dealId)
    // TODO: Implement call scheduling
  }

  const handleExport = () => {
    console.log('Export deals data')
    // TODO: Implement export functionality
  }

  const stats = getDealStats(deals)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Sent':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'Opened':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'Replied':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'Scheduled':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      case 'Closed':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'Rejected':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return '';
    }
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
            <h1 className="text-3xl font-bold tracking-tight">Deals</h1>
            <p className="text-muted-foreground">
              Track and manage investment deals and transactions
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading deals...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Deals</h1>
            <p className="text-muted-foreground">
              Track and manage investment deals and transactions
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
            Send New Deal
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDeals}</div>
            <p className="text-xs text-muted-foreground">
              {stats.sentDeals} sent
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.openedDeals} opened
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reply Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.replyRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.repliedDeals} replied
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.closedDeals} closed
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

      {/* Deals Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Startup</TableHead>
              <TableHead>Investor</TableHead>
              <TableHead>Match %</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent Date</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDeals.map((deal) => (
              <TableRow key={deal.id}>
                <TableCell className="font-medium">
                  <div>
                    <div className="font-semibold">{deal.startupName}</div>
                    <div className="text-sm text-muted-foreground">
                      ID: {deal.startupId}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{deal.investorName}</div>
                    <div className="text-sm text-muted-foreground">
                      {deal.investorFirm}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-center">
                    <div className="font-semibold">{deal.matchPercentage}%</div>
                    <div className="w-16 h-2 bg-muted rounded-full mx-auto mt-1">
                      <div 
                        className="h-2 bg-primary rounded-full" 
                        style={{ width: `${deal.matchPercentage}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={getStatusColor(deal.status)}
                  >
                    {deal.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {deal.sentAt ? formatDate(deal.sentAt) : 'Not sent'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(deal.lastUpdated)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDeal(deal.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open(`/admin/deals/${deal.id}`, '_blank')}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in New Tab
                      </DropdownMenuItem>
                      {deal.status === 'Sent' && (
                        <DropdownMenuItem onClick={() => handleSendFollowUp(deal.id)}>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Follow-up
                        </DropdownMenuItem>
                      )}
                      {deal.status === 'Replied' && (
                        <DropdownMenuItem onClick={() => handleScheduleCall(deal.id)}>
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Call
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

      {filteredDeals.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No deals found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or search terms.
          </p>
        </div>
      )}
    </div>
  )
}
