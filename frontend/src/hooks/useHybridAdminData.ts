// hooks/useHybridAdminData.ts
// Hybrid data hook that combines Firestore real-time + BigQuery analytics

import { useMemo } from 'react'
import { usePlatformStats, useAdminNotifications } from './useFirestoreRealtime'
import { useBigQueryAnalytics } from './useBigQueryAnalytics'

interface LiveMetrics {
  pendingMemos: number
  approvedMemos: number
  totalInvestors: number
  totalFounders: number
  totalActiveDeals: number
}

interface HistoricalMetrics {
  totalSubmissions: number
  avgProcessingTime: number
  successRate: number
  todaySubmissions: number
  weekSubmissions: number
  monthSubmissions: number
}

interface DiligenceMetrics {
  totalReports: number
  avgScore: number
  avgContradictions: number
  avgDiscrepancies: number
  highScoreRate: number
  weekReports: number
}

interface TimeSeriesData {
  dailySubmissions: Array<{
    date: string
    submissions: number
    successfulSubmissions: number
    avgProcessingTime: number
  }>
  totalDays: number
  periodDays: number
}

interface InvestorMetrics {
  totalGenerated: number
  avgMatchScore: number
  weekGenerated: number
  topSectors: string[]
  avgProcessingTime: number
}

interface NetworkMetrics {
  totalConnections: number
  topInvestors: string[]
  connectionTypes: Record<string, number>
  avgConnectionsPerInvestor: number
}

interface HybridData {
  // Real-time counts from Firestore
  liveMetrics: LiveMetrics
  // Historical analytics from BigQuery
  historicalMetrics: HistoricalMetrics
  // Diligence analytics from BigQuery
  diligenceMetrics: DiligenceMetrics
  // Time series for charts
  timeSeries: TimeSeriesData
  // Investor recommendation stats
  investorMetrics: InvestorMetrics
  // Network analytics
  networkMetrics: NetworkMetrics
  // Real-time activity
  recentActivity: Array<{
    id: string
    type: string
    title: string
    message: string
    timestamp: string
    severity: 'info' | 'warning' | 'success' | 'error'
  }>
  // Data freshness
  lastUpdated: Date | null
  dataSource: 'firestore' | 'bigquery' | 'hybrid'
}

export function useHybridAdminData() {
  // Real-time Firestore data (with error handling)
  const firestoreStats = usePlatformStats()
  const firestoreNotifications = useAdminNotifications()
  
  // BigQuery analytics (refreshed every 30s)
  const { analytics, loading: bqLoading, lastFetch } = useBigQueryAnalytics()
  
  // Merge data sources
  const mergedData = useMemo((): HybridData => {
    const liveMetrics: LiveMetrics = {
      pendingMemos: firestoreStats.pendingMemos || 0,
      approvedMemos: firestoreStats.approvedMemos || 0,
      totalInvestors: firestoreStats.totalInvestors || 0,
      totalFounders: firestoreStats.totalFounders || 0,
      totalActiveDeals: (firestoreStats.pendingMemos || 0) + (firestoreStats.approvedMemos || 0)
    }

    const historicalMetrics: HistoricalMetrics = {
      totalSubmissions: analytics?.platform_metrics?.total_submissions || 0,
      avgProcessingTime: analytics?.platform_metrics?.avg_processing_time || 0,
      successRate: analytics?.platform_metrics?.success_rate || 0,
      todaySubmissions: analytics?.platform_metrics?.today_submissions || 0,
      weekSubmissions: analytics?.platform_metrics?.week_submissions || 0,
      monthSubmissions: analytics?.platform_metrics?.month_submissions || 0
    }

    const diligenceMetrics: DiligenceMetrics = {
      totalReports: analytics?.diligence_analytics?.total_reports || 0,
      avgScore: analytics?.diligence_analytics?.avg_score || 0,
      avgContradictions: analytics?.diligence_analytics?.avg_contradictions || 0,
      avgDiscrepancies: analytics?.diligence_analytics?.avg_discrepancies || 0,
      highScoreRate: analytics?.diligence_analytics?.high_score_rate || 0,
      weekReports: analytics?.diligence_analytics?.week_reports || 0
    }

    const timeSeries: TimeSeriesData = {
      dailySubmissions: analytics?.time_series?.daily_submissions || [],
      totalDays: analytics?.time_series?.total_days || 0,
      periodDays: analytics?.time_series?.period_days || 30
    }

    const investorMetrics: InvestorMetrics = {
      totalGenerated: analytics?.investor_stats?.total_generated || 0,
      avgMatchScore: analytics?.investor_stats?.avg_match_score || 0,
      weekGenerated: analytics?.investor_stats?.week_generated || 0,
      topSectors: analytics?.investor_stats?.top_sectors || [],
      avgProcessingTime: analytics?.investor_stats?.avg_processing_time || 0
    }

    const networkMetrics: NetworkMetrics = {
      totalConnections: analytics?.network_analytics?.total_connections || 0,
      topInvestors: analytics?.network_analytics?.top_investors || [],
      connectionTypes: analytics?.network_analytics?.connection_types || {},
      avgConnectionsPerInvestor: analytics?.network_analytics?.avg_connections_per_investor || 0
    }

    return {
      liveMetrics,
      historicalMetrics,
      diligenceMetrics,
      timeSeries,
      investorMetrics,
      networkMetrics,
      recentActivity: firestoreNotifications.notifications || [],
      lastUpdated: lastFetch,
      dataSource: analytics ? 'hybrid' : 'firestore'
    }
  }, [firestoreStats, analytics, firestoreNotifications, lastFetch])
  
  return {
    data: mergedData,
    loading: firestoreStats.loading || bqLoading,
    error: firestoreStats.error
  }
}

// Specific hooks for different sections of the admin dashboard
export function useOverviewData() {
  const { data, loading, error } = useHybridAdminData()
  
  return {
    liveMetrics: data.liveMetrics,
    historicalMetrics: data.historicalMetrics,
    recentActivity: data.recentActivity,
    loading,
    error
  }
}

export function useMemoManagementData() {
  const { data, loading, error } = useHybridAdminData()
  
  return {
    liveMetrics: data.liveMetrics,
    historicalMetrics: data.historicalMetrics,
    diligenceMetrics: data.diligenceMetrics,
    loading,
    error
  }
}

export function useInvestorRecommendationData() {
  const { data, loading, error } = useHybridAdminData()
  
  return {
    investorMetrics: data.investorMetrics,
    networkMetrics: data.networkMetrics,
    loading,
    error
  }
}

export function useNetworkAnalyticsData() {
  const { data, loading, error } = useHybridAdminData()
  
  return {
    networkMetrics: data.networkMetrics,
    timeSeries: data.timeSeries,
    loading,
    error
  }
}
