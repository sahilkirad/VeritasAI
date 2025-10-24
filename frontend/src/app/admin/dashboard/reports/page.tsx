"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Download,
  RefreshCw,
  Calendar,
  BarChart3,
  Target,
  Lightbulb
} from "lucide-react"
import { useReportGeneration, useExecutiveSummary, useInsightsAndRecommendations } from "@/hooks/useReportGeneration"
import { FirebaseLoading } from "@/components/admin/FirebaseLoading"
import { FirebaseErrorBoundary } from "@/components/admin/FirebaseErrorBoundary"

export default function AdminReportsPage() {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  
  const { report, loading, error, generateReport, lastGenerated } = useReportGeneration()
  const { summary } = useExecutiveSummary()
  const { insights } = useInsightsAndRecommendations()

  const handleGenerateReport = async () => {
    await generateReport(startDate || undefined, endDate || undefined)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'excellent':
        return 'bg-green-100 text-green-800'
      case 'good':
        return 'bg-blue-100 text-blue-800'
      case 'needs attention':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info':
        return <Lightbulb className="h-4 w-4 text-blue-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <FirebaseErrorBoundary>
      <FirebaseLoading>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Comprehensive Reports</h1>
              <p className="text-gray-600 mt-2">
                Generate detailed analytics reports from ingestion and diligence data
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleGenerateReport} 
                disabled={loading}
                className="bg-primary hover:bg-primary/90"
              >
                {loading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                {loading ? "Generating..." : "Generate Report"}
              </Button>
              {report && (
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
              )}
            </div>
          </div>

          {/* Date Range Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Report Date Range
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date (Optional)</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="Leave empty for last 30 days"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date (Optional)</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="Leave empty for today"
                  />
                </div>
              </div>
              {lastGenerated && (
                <p className="text-sm text-muted-foreground mt-2">
                  Last generated: {lastGenerated.toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>

          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Error generating report:</span>
                </div>
                <p className="text-red-700 mt-1">{error.message}</p>
              </CardContent>
            </Card>
          )}

          {report && (
            <div className="space-y-6">
              {/* Executive Summary */}
              {summary && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Executive Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Badge className={getStatusColor(summary.overall_status)}>
                        {summary.overall_status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Generated: {new Date(report.report_metadata.generated_at).toLocaleString()}
                      </span>
                    </div>
                    
                    <p className="text-gray-700">{summary.summary}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {summary.key_metrics.conversion_rate}%
                        </div>
                        <div className="text-sm text-muted-foreground">Conversion Rate</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {summary.key_metrics.quality_score}/10
                        </div>
                        <div className="text-sm text-muted-foreground">Quality Score</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {summary.key_metrics.processing_efficiency}s
                        </div>
                        <div className="text-sm text-muted-foreground">Avg Processing Time</div>
                      </div>
                    </div>

                    {summary.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Key Recommendations:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                          {summary.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Insights and Recommendations */}
              {insights.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Insights & Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {insights.map((insight, index) => (
                        <div key={index} className="flex gap-3 p-4 border rounded-lg">
                          <div className="flex-shrink-0 mt-1">
                            {getInsightIcon(insight.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{insight.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {insight.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">
                              {insight.description}
                            </p>
                            <p className="text-sm font-medium text-primary">
                              💡 {insight.action}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Detailed Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ingestion Analytics */}
                {report.ingestion_analytics && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Ingestion Analytics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-xl font-bold text-blue-600">
                            {report.ingestion_analytics.total_submissions}
                          </div>
                          <div className="text-xs text-blue-700">Total Submissions</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-xl font-bold text-green-600">
                            {report.ingestion_analytics.success_rate}%
                          </div>
                          <div className="text-xs text-green-700">Success Rate</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Successful:</span>
                          <span className="font-medium">{report.ingestion_analytics.successful_submissions}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Failed:</span>
                          <span className="font-medium">{report.ingestion_analytics.failed_submissions}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Avg Processing Time:</span>
                          <span className="font-medium">{report.ingestion_analytics.avg_processing_time}s</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Diligence Analytics */}
                {report.diligence_analytics && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Diligence Analytics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-xl font-bold text-purple-600">
                            {report.diligence_analytics.total_reports}
                          </div>
                          <div className="text-xs text-purple-700">Total Reports</div>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <div className="text-xl font-bold text-orange-600">
                            {report.diligence_analytics.avg_score}/10
                          </div>
                          <div className="text-xs text-orange-700">Avg Score</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>High Score Rate:</span>
                          <span className="font-medium">{report.diligence_analytics.high_score_rate}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Avg Contradictions:</span>
                          <span className="font-medium">{report.diligence_analytics.avg_contradictions}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Avg Discrepancies:</span>
                          <span className="font-medium">{report.diligence_analytics.avg_discrepancies}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {!report && !loading && !error && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Report Generated</h3>
                  <p className="text-muted-foreground mb-4">
                    Click "Generate Report" to create a comprehensive analytics report.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </FirebaseLoading>
    </FirebaseErrorBoundary>
  )
}
