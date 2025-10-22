// hooks/useBigQueryAnalytics.ts
// Custom hook for BigQuery analytics data with periodic refresh

import { useState, useEffect, useCallback } from 'react'

interface PlatformMetrics {
  total_submissions: number
  avg_processing_time: number
  success_rate: number
  today_submissions: number
  week_submissions: number
  month_submissions: number
}

interface DiligenceAnalytics {
  total_reports: number
  avg_score: number
  avg_contradictions: number
  avg_discrepancies: number
  high_score_rate: number
  week_reports: number
}

interface TimeSeriesData {
  daily_submissions: Array<{
    date: string
    submissions: number
    successful_submissions: number
    avg_processing_time: number
  }>
  total_days: number
  period_days: number
}

interface InvestorStats {
  total_generated: number
  avg_match_score: number
  week_generated: number
  top_sectors: string[]
  avg_processing_time: number
}

interface NetworkAnalytics {
  total_connections: number
  top_investors: string[]
  connection_types: Record<string, number>
  avg_connections_per_investor: number
}

interface AnalyticsData {
  platform_metrics: PlatformMetrics
  diligence_analytics: DiligenceAnalytics
  time_series: TimeSeriesData
  investor_stats: InvestorStats
  network_analytics: NetworkAnalytics
  timestamp: string
}

export function useBigQueryAnalytics(refreshInterval = 30000) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(
        'https://asia-south1-veritas-472301.cloudfunctions.net/get_admin_analytics',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setAnalytics(data)
      setLastFetch(new Date())
      setLoading(false)
    } catch (err) {
      console.error('Error fetching BigQuery analytics:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Initial fetch
    fetchAnalytics()

    // Set up periodic refresh
    const interval = setInterval(fetchAnalytics, refreshInterval)

    return () => clearInterval(interval)
  }, [fetchAnalytics, refreshInterval])

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return {
    analytics,
    loading,
    error,
    lastFetch,
    refresh
  }
}

// Specific hooks for different analytics sections
export function usePlatformMetrics() {
  const { analytics, loading, error } = useBigQueryAnalytics()
  
  return {
    metrics: analytics?.platform_metrics || null,
    loading,
    error
  }
}

export function useDiligenceAnalytics() {
  const { analytics, loading, error } = useBigQueryAnalytics()
  
  return {
    analytics: analytics?.diligence_analytics || null,
    loading,
    error
  }
}

export function useTimeSeriesData() {
  const { analytics, loading, error } = useBigQueryAnalytics()
  
  return {
    timeSeries: analytics?.time_series || null,
    loading,
    error
  }
}

export function useInvestorStats() {
  const { analytics, loading, error } = useBigQueryAnalytics()
  
  return {
    stats: analytics?.investor_stats || null,
    loading,
    error
  }
}

export function useNetworkAnalytics() {
  const { analytics, loading, error } = useBigQueryAnalytics()
  
  return {
    analytics: analytics?.network_analytics || null,
    loading,
    error
  }
}
