// hooks/useBigQueryOnly.ts
// Hook for BigQuery-only data when Firebase is not available

import { useState, useEffect } from 'react'
import { useBigQueryAnalytics } from './useBigQueryAnalytics'

interface BigQueryOnlyData {
  historicalMetrics: {
    totalSubmissions: number
    avgProcessingTime: number
    successRate: number
    todaySubmissions: number
    weekSubmissions: number
    monthSubmissions: number
  }
  diligenceMetrics: {
    totalReports: number
    avgScore: number
    avgContradictions: number
    avgDiscrepancies: number
    highScoreRate: number
    weekReports: number
  }
  timeSeries: {
    dailySubmissions: Array<{
      date: string
      submissions: number
      successfulSubmissions: number
      avgProcessingTime: number
    }>
    totalDays: number
    periodDays: number
  }
  loading: boolean
  error: Error | null
}

export function useBigQueryOnly(): BigQueryOnlyData {
  const { analytics, loading, error } = useBigQueryAnalytics()

  const historicalMetrics = {
    totalSubmissions: analytics?.platform_metrics?.total_submissions || 0,
    avgProcessingTime: analytics?.platform_metrics?.avg_processing_time || 0,
    successRate: analytics?.platform_metrics?.success_rate || 0,
    todaySubmissions: analytics?.platform_metrics?.today_submissions || 0,
    weekSubmissions: analytics?.platform_metrics?.week_submissions || 0,
    monthSubmissions: analytics?.platform_metrics?.month_submissions || 0
  }

  const diligenceMetrics = {
    totalReports: analytics?.diligence_analytics?.total_reports || 0,
    avgScore: analytics?.diligence_analytics?.avg_score || 0,
    avgContradictions: analytics?.diligence_analytics?.avg_contradictions || 0,
    avgDiscrepancies: analytics?.diligence_analytics?.avg_discrepancies || 0,
    highScoreRate: analytics?.diligence_analytics?.high_score_rate || 0,
    weekReports: analytics?.diligence_analytics?.week_reports || 0
  }

  const timeSeries = {
    dailySubmissions: analytics?.time_series?.daily_submissions || [],
    totalDays: analytics?.time_series?.total_days || 0,
    periodDays: analytics?.time_series?.period_days || 30
  }

  return {
    historicalMetrics,
    diligenceMetrics,
    timeSeries,
    loading,
    error
  }
}
