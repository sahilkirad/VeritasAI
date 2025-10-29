"use client"

import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  ExternalLink, 
  Download, 
  Edit, 
  Mail, 
  Phone,
  Building2,
  Target,
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
  BarChart3,
  Activity,
  FileText,
  Check,
  Brain,
  Zap,
  User,
  Briefcase,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  MapPin,
  Globe,
  Award,
  PieChart
} from "lucide-react"
import Link from "next/link"
import { useMemoDetails } from "@/hooks/useMemoDetails"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { ScoreBar } from "@/components/admin/ScoreBar"

export default function MemoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const memoId = params.id as string
  
  // Use the custom hook for real-time memo details
  const { memo, loading, error } = useMemoDetails(memoId)

  const formatCurrency = (amount: string | number | undefined) => {
    if (!amount) return 'Not specified'
    const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]/g, '')) || 0 : amount
    if (numAmount >= 1000000) {
      return `$${(numAmount / 1000000).toFixed(1)}M`
    } else if (numAmount >= 1000) {
      return `$${(numAmount / 1000).toFixed(0)}K`
    } else {
      return `$${numAmount.toFixed(0)}`
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/memos">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Memos
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Memo Details</h1>
            <p className="text-muted-foreground">Loading memo information...</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading memo details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !memo) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/memos">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Memos
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Memo Details</h1>
            <p className="text-muted-foreground">Error loading memo information</p>
          </div>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error?.message || 'Memo not found'}</p>
            
            {error?.message?.includes('connection') && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Connection Issue:</strong> This error is often caused by browser extensions or ad blockers. 
                  Try these solutions:
                </p>
                <ul className="text-sm text-yellow-700 mt-2 ml-4 list-disc">
                  <li>Disable ad blockers for this site</li>
                  <li>Try opening in an incognito/private window</li>
                  <li>Clear browser cache and cookies</li>
                </ul>
              </div>
            )}
            
            <div className="mt-4">
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/memos">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Memos
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{memo.startupName}</h1>
          <p className="text-muted-foreground">
            Memo Details • {memo.founderName} • {memo.stage} Stage
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={memo.status} />
          {memo.aiScore && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {memo.aiScore}/10
            </Badge>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memo.status}</div>
            <p className="text-xs text-muted-foreground">
              {memo.memo1Generated && memo.memo2Generated && memo.memo3Generated 
                ? 'All memos generated' 
                : `${[memo.memo1Generated, memo.memo2Generated, memo.memo3Generated].filter(Boolean).length}/3 memos`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memo.aiScore || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              {memo.riskLevel} Risk
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memo.processingTime}s</div>
            <p className="text-xs text-muted-foreground">
              {memo.processingStatus}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDate(memo.lastUpdated)}</div>
            <p className="text-xs text-muted-foreground">
              {memo.originalFilename}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="snapshot">Company Snapshot</TabsTrigger>
          <TabsTrigger value="pitch-deck">Pitch Deck</TabsTrigger>
          <TabsTrigger value="memos">Memos</TabsTrigger>
          <TabsTrigger value="investors">Investor Matching</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Company:</span>
                    <span className="font-medium">{memo.startupName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Founder:</span>
                    <span className="font-medium">{memo.founderName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Email:</span>
                    <span className="font-medium">{memo.founderEmail}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Stage:</span>
                    <Badge variant="outline">{memo.stage}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Sector:</span>
                    <div className="flex gap-1">
                      {memo.sector.map((s, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Score:</span>
                    <span className="font-medium">{memo.aiScore || 'N/A'}/10</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Risk Level:</span>
                    <Badge variant={memo.riskLevel === 'Low' ? 'default' : memo.riskLevel === 'Medium' ? 'secondary' : 'destructive'}>
                      {memo.riskLevel}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Status:</span>
                    <StatusBadge status={memo.status} />
                  </div>
                </div>
                {memo.aiScore && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Score Breakdown</div>
                    <ScoreBar score={memo.aiScore} maxScore={10} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Company Snapshot Tab */}
        <TabsContent value="snapshot" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Company Snapshot
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Stage:</span>
                    <span className="font-medium">{memo.memo_1?.company_stage || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Headquarters:</span>
                    <span className="font-medium">{memo.memo_1?.headquarters || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Founded:</span>
                    <span className="font-medium">{memo.memo_1?.founded_date || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Team Size:</span>
                    <span className="font-medium">{memo.memo_1?.team_size || 'Not specified'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Funding Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Funding Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Amount Raising:</span>
                    <span className="font-medium">{formatCurrency(memo.memo_1?.amount_raising)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Valuation:</span>
                    <span className="font-medium">{formatCurrency(memo.memo_1?.post_money_valuation)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Investment Sought:</span>
                    <span className="font-medium">{formatCurrency(memo.memo_1?.investment_sought)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Ownership Target:</span>
                    <span className="font-medium">{memo.memo_1?.ownership_target || 'Not specified'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Problem Statement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Problem Statement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {memo.memo_1?.problem || 'No problem statement available'}
                </p>
              </CardContent>
            </Card>

            {/* Solution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Solution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {memo.memo_1?.solution || 'No solution details available'}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pitch Deck Tab */}
        <TabsContent value="pitch-deck" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Executive Summary
              </CardTitle>
              <CardDescription>
                Summary of the founder's pitch deck PDF submission
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Original File</h4>
                  <p className="text-sm text-muted-foreground">{memo.originalFilename}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Summary</h4>
                  <p className="text-sm text-muted-foreground">
                    {memo.memo_1?.summary || 'No summary available'}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Detailed Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    {memo.memo_1?.summary_analysis || 'No detailed analysis available'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Memos Tab */}
        <TabsContent value="memos" className="space-y-4">
          <div className="space-y-4">
            {/* Memo 1 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Memo 1 (Intake)
                  {memo.memo1Generated && <CheckCircle className="h-4 w-4 text-green-500" />}
                </CardTitle>
                <CardDescription>
                  Initial intake and analysis from pitch deck
                </CardDescription>
              </CardHeader>
              <CardContent>
                {memo.memo1Generated ? (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Industry & Market Analysis</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Industry Category</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.industry_category || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Market Size</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.market_size || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Memo 1 not yet generated</p>
                )}
              </CardContent>
            </Card>

            {/* Memo 2 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Memo 2 (Due Diligence)
                  {memo.memo2Generated && <CheckCircle className="h-4 w-4 text-green-500" />}
                </CardTitle>
                <CardDescription>
                  Due diligence analysis and validation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {memo.memo2Generated ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Investment Recommendation</h4>
                      <p className="text-sm text-muted-foreground">{memo.memo_2?.investment_recommendation || 'Not specified'}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Overall Score</h4>
                      <p className="text-sm text-muted-foreground">{memo.memo_2?.overall_score || 'Not scored'}/10</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Memo 2 not yet generated</p>
                )}
              </CardContent>
            </Card>

            {/* Memo 3 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Memo 3 (Final)
                  {memo.memo3Generated && <CheckCircle className="h-4 w-4 text-green-500" />}
                </CardTitle>
                <CardDescription>
                  Final investment decision memo
                </CardDescription>
              </CardHeader>
              <CardContent>
                {memo.memo3Generated ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Final Recommendation</h4>
                      <p className="text-sm text-muted-foreground">{memo.memo_3?.investment_recommendation || 'Not specified'}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Final Score</h4>
                      <p className="text-sm text-muted-foreground">{memo.memo_3?.overall_score || 'Not scored'}/10</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Memo 3 not yet generated</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Investor Matching Tab */}
        <TabsContent value="investors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Investor Matching
              </CardTitle>
              <CardDescription>
                Matched investors based on company profile and investment criteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Sarah Chen</CardTitle>
                        <Badge className="bg-green-100 text-green-800">95% Match</Badge>
                      </div>
                      <CardDescription>Partner at TechVentures Capital</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Focus Areas:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Badge variant="outline" className="text-xs">AI/ML</Badge>
                          <Badge variant="outline" className="text-xs">SaaS</Badge>
                          <Badge variant="outline" className="text-xs">B2B</Badge>
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Check Size:</span> $500K - $2M
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Stage:</span> Seed, Series A
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
