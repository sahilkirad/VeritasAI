"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, RefreshCw, Download, Target, Mail } from "lucide-react"
import Link from "next/link"
import { Investor, InvestorFilterOptions } from "@/lib/types/investor"
import { getAllInvestors, getInvestorFilterOptions, filterInvestors, getInvestorStats } from "@/lib/services/investorService"
import { InvestorTable } from "@/components/admin/InvestorTable"
import { FilterPanel } from "@/components/admin/FilterPanel"

export default function AdminInvestorsPage() {
  const [investors, setInvestors] = useState<Investor[]>([])
  const [filteredInvestors, setFilteredInvestors] = useState<Investor[]>([])
  const [filters, setFilters] = useState<InvestorFilterOptions>({})
  const [filterOptions, setFilterOptions] = useState({
    firms: [],
    sectorFocus: [],
    stagePreference: [],
    geography: [],
    statuses: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch investors data
  useEffect(() => {
    const fetchInvestors = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🔄 Fetching investors data...')
        const data = await getAllInvestors()
        setInvestors(data)
        setFilteredInvestors(data)
        
        // Get filter options
        const options = getInvestorFilterOptions(data)
        setFilterOptions(options)
        
        console.log(`✅ Loaded ${data.length} investors`)
      } catch (err) {
        console.error('❌ Error fetching investors:', err)
        setError('Failed to load investors data')
      } finally {
        setLoading(false)
      }
    }

    fetchInvestors()
  }, [])

  // Apply filters when they change
  useEffect(() => {
    const filtered = filterInvestors(investors, filters)
    setFilteredInvestors(filtered)
  }, [investors, filters])

  const handleFiltersChange = (newFilters: InvestorFilterOptions) => {
    setFilters(newFilters)
  }

  const handleRefresh = async () => {
    try {
      setLoading(true)
      const data = await getAllInvestors()
      setInvestors(data)
      setFilteredInvestors(data)
      
      const options = getInvestorFilterOptions(data)
      setFilterOptions(options)
    } catch (err) {
      console.error('Error refreshing data:', err)
      setError('Failed to refresh data')
    } finally {
      setLoading(false)
    }
  }

  const handleSendDeal = (investorId: string) => {
    console.log('Send deal to investor:', investorId)
    // TODO: Implement deal sending
  }

  const handleEdit = (investorId: string) => {
    console.log('Edit investor:', investorId)
    // TODO: Implement edit functionality
  }

  const handleDelete = (investorId: string) => {
    console.log('Delete investor:', investorId)
    // TODO: Implement delete functionality
  }

  const handleExport = () => {
    console.log('Export investors data')
    // TODO: Implement export functionality
  }

  const handleBulkEmail = () => {
    console.log('Send bulk email to selected investors')
    // TODO: Implement bulk email functionality
  }

  const stats = getInvestorStats(investors)

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
            <h1 className="text-3xl font-bold tracking-tight">Investors</h1>
            <p className="text-muted-foreground">
              Manage investor profiles and track engagement
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading investors...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Investors</h1>
            <p className="text-muted-foreground">
              Manage investor profiles and track engagement
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleBulkEmail}>
            <Mail className="h-4 w-4 mr-2" />
            Bulk Email
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Investor
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvestors}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeInvestors} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgEngagementScore}%</div>
            <p className="text-xs text-muted-foreground">
              Overall engagement score
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deals Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDealsSent}</div>
            <p className="text-xs text-muted-foreground">
              {stats.openRate}% open rate
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
              {stats.totalDealsReplied} replies
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

      {/* Investors Table */}
      <InvestorTable
        investors={filteredInvestors}
        onSendDeal={handleSendDeal}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}