// hooks/useReportGeneration.ts
// Custom hook for generating comprehensive admin reports

import { useEffect, useState } from 'react'

interface ReportMetadata {
  generated_at: string
  date_range: {
    start: string
    end: string
  }
  report_type: string
}

interface ExecutiveSummary {
  overall_status: string
  summary: string
  key_metrics: {
    conversion_rate: number
    quality_score: number
    processing_efficiency: number
  }
  recommendations: string[]
}

interface IngestionAnalytics {
  total_submissions: number
  successful_submissions: number
  failed_submissions: number
  success_rate: number
  avg_processing_time: number
  week_submissions: number
  month_submissions: number
  sector_breakdown: Record<string, number>
  stage_breakdown: Record<string, number>
}

interface DiligenceAnalytics {
  total_reports: number
  avg_score: number
  avg_contradictions: number
  avg_discrepancies: number
  high_score_rate: number
  low_score_rate: number
  week_reports: number
  risk_analysis: Record<string, number>
}

interface CombinedAnalytics {
  conversion_metrics: {
    submission_to_analysis_rate: number
    high_quality_rate: number
    processing_efficiency: number
  }
  quality_metrics: {
    avg_diligence_score: number
    risk_identification_rate: number
    contradiction_detection_rate: number
  }
  trend_analysis: {
    weekly_growth: number
    sector_dominance: string
    stage_distribution: Record<string, number>
  }
}

interface Insight {
  type: 'warning' | 'critical' | 'info' | 'success'
  title: string
  description: string
  action: string
}

interface ComprehensiveReport {
  report_metadata: ReportMetadata
  executive_summary: ExecutiveSummary
  ingestion_analytics: IngestionAnalytics
  diligence_analytics: DiligenceAnalytics
  combined_analytics: CombinedAnalytics
  insights_and_recommendations: Insight[]
}

interface UseReportGenerationReturn {
  report: ComprehensiveReport | null
  loading: boolean
  error: Error | null
  lastGenerated: Date | null
  generateReport: (startDate?: string, endDate?: string) => Promise<void>
}

export function useReportGeneration(): UseReportGenerationReturn {
  const [report, setReport] = useState<ComprehensiveReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null)

  const generateReport = async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true)
      setError(null)

      // Build query parameters
      const params = new URLSearchParams()
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)

      const url = `https://asia-south1-veritas-472301.cloudfunctions.net/generate_comprehensive_report?${params.toString()}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ComprehensiveReport = await response.json()
      setReport(data)
      setLastGenerated(new Date())
    } catch (err: any) {
      console.error("Error generating comprehensive report:", err)
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  return {
    report,
    loading,
    error,
    lastGenerated,
    generateReport
  }
}

// Hook for specific report sections
export function useExecutiveSummary() {
  const { report, loading, error, generateReport } = useReportGeneration()
  
  return {
    summary: report?.executive_summary || null,
    loading,
    error,
    generateReport
  }
}

export function useIngestionAnalytics() {
  const { report, loading, error, generateReport } = useReportGeneration()
  
  return {
    analytics: report?.ingestion_analytics || null,
    loading,
    error,
    generateReport
  }
}

export function useDiligenceAnalytics() {
  const { report, loading, error, generateReport } = useReportGeneration()
  
  return {
    analytics: report?.diligence_analytics || null,
    loading,
    error,
    generateReport
  }
}

export function useInsightsAndRecommendations() {
  const { report, loading, error, generateReport } = useReportGeneration()
  
  return {
    insights: report?.insights_and_recommendations || [],
    loading,
    error,
    generateReport
  }
}
