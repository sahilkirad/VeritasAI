"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, RefreshCw, Download } from "lucide-react"
import Link from "next/link"
import { Startup, FilterOptions } from "@/lib/types/startup"
import { getAllStartups, getFilterOptions, filterStartups, sortStartups } from "@/lib/services/startupService"
import { StartupTable } from "@/components/admin/StartupTable"
import { FilterPanel } from "@/components/admin/FilterPanel"

export default function AdminStartupsPage() {
  const [startups, setStartups] = useState<Startup[]>([])
  const [filteredStartups, setFilteredStartups] = useState<Startup[]>([])
  const [filters, setFilters] = useState<FilterOptions>({})
  const [filterOptions, setFilterOptions] = useState({
    stages: [],
    statuses: [],
    sectors: [],
    riskLevels: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch startups data
  useEffect(() => {
    const fetchStartups = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🔄 Fetching startups data...')
        const data = await getAllStartups()
        setStartups(data)
        setFilteredStartups(data)
        
        // Get filter options
        const options = getFilterOptions(data)
        setFilterOptions(options)
        
        console.log(`✅ Loaded ${data.length} startups`)
      } catch (err) {
        console.error('❌ Error fetching startups:', err)
        setError('Failed to load startups data')
      } finally {
        setLoading(false)
      }
    }

    fetchStartups()
  }, [])

  // Apply filters when they change
  useEffect(() => {
    const filtered = filterStartups(startups, filters)
    setFilteredStartups(filtered)
  }, [startups, filters])

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
  }

  const handleRefresh = async () => {
    try {
      setLoading(true)
      const data = await getAllStartups()
      setStartups(data)
      setFilteredStartups(data)
      
      const options = getFilterOptions(data)
      setFilterOptions(options)
    } catch (err) {
      console.error('Error refreshing data:', err)
      setError('Failed to refresh data')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateMemo = (startupId: string) => {
    console.log('Generate memo for startup:', startupId)
    // TODO: Implement memo generation
  }

  const handleDelete = (startupId: string) => {
    console.log('Delete startup:', startupId)
    // TODO: Implement delete functionality
  }

  const handleExport = () => {
    console.log('Export startups data')
    // TODO: Implement export functionality
  }

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
            <h1 className="text-3xl font-bold tracking-tight">Startups</h1>
            <p className="text-muted-foreground">
              Manage and monitor startup profiles and applications
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading startups...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Startups</h1>
            <p className="text-muted-foreground">
              Manage and monitor startup profiles and applications
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
            Add Startup
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Startups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{startups.length}</div>
            <p className="text-xs text-muted-foreground">
              {filteredStartups.length} shown
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memo 3 Ready</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {startups.filter(s => s.status === 'Memo 3').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for investor matching
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {startups.filter(s => (s.aiScore || 0) >= 7).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Score 7+ out of 10
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {startups.filter(s => s.riskLevel === 'Low').length}
            </div>
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

      {/* Startups Table */}
      <StartupTable
        startups={filteredStartups}
        onGenerateMemo={handleGenerateMemo}
        onDelete={handleDelete}
      />
    </div>
  )
}
