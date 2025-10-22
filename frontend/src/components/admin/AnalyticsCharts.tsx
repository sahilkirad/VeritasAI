// components/admin/AnalyticsCharts.tsx
// Chart components for time-series data from BigQuery

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

interface TimeSeriesData {
  date: string
  submissions: number
  successful_submissions: number
  avg_processing_time: number
}

interface SubmissionTrendChartProps {
  data: TimeSeriesData[]
  loading?: boolean
}

export function SubmissionTrendChart({ data, loading = false }: SubmissionTrendChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Submission Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-muted-foreground">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Submissions Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value, name) => [
                  value, 
                  name === 'submissions' ? 'Total Submissions' : 
                  name === 'successful_submissions' ? 'Successful' : 'Avg Processing Time'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="submissions" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="submissions"
              />
              <Line 
                type="monotone" 
                dataKey="successful_submissions" 
                stroke="#82ca9d" 
                strokeWidth={2}
                name="successful_submissions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

interface ConversionFunnelData {
  stage: string
  count: number
  percentage: number
}

interface ConversionFunnelChartProps {
  data: ConversionFunnelData[]
  loading?: boolean
}

export function ConversionFunnelChart({ data, loading = false }: ConversionFunnelChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-muted-foreground">Loading funnel data...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((stage, index) => (
            <div key={stage.stage} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{stage.stage}</span>
                <span className="text-sm text-muted-foreground">
                  {stage.count} ({stage.percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stage.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface ProcessingTimeData {
  date: string
  avg_processing_time: number
}

interface ProcessingTimeChartProps {
  data: ProcessingTimeData[]
  loading?: boolean
}

export function ProcessingTimeChart({ data, loading = false }: ProcessingTimeChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Processing Time Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-muted-foreground">Loading processing time data...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Average Processing Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value) => [`${value}s`, 'Avg Processing Time']}
              />
              <Bar dataKey="avg_processing_time" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

interface SectorDistributionData {
  sector: string
  count: number
  percentage: number
}

interface SectorDistributionChartProps {
  data: SectorDistributionData[]
  loading?: boolean
}

export function SectorDistributionChart({ data, loading = false }: SectorDistributionChartProps) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sector Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-muted-foreground">Loading sector data...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sector Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ sector, percentage }) => `${sector} (${percentage}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

interface NetworkConnectionsData {
  connection_type: string
  count: number
}

interface NetworkConnectionsChartProps {
  data: NetworkConnectionsData[]
  loading?: boolean
}

export function NetworkConnectionsChart({ data, loading = false }: NetworkConnectionsChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Network Connections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-muted-foreground">Loading network data...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connection Types Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="connection_type" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
