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

            {/* Team Information */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Founder:</span>
                      <span className="font-medium">{memo.memo_1?.founder_name || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>LinkedIn:</span>
                      <span className="font-medium">{memo.memo_1?.founder_linkedin_url || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Team Size:</span>
                      <span className="font-medium">{memo.memo_1?.team_size || 'Not specified'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Key Team Members</div>
                    <p className="text-sm text-muted-foreground">
                      {memo.memo_1?.key_team_members?.join(', ') || 'No team members listed'}
                    </p>
                  </div>
                </div>
                {memo.memo_1?.execution_track_record && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Execution Track Record</div>
                    <p className="text-sm text-muted-foreground">{memo.memo_1.execution_track_record}</p>
                  </div>
                )}
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
                    {/* Industry & Market Analysis */}
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
                        <div>
                          <h4 className="font-medium mb-2">SAM Market Size</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.sam_market_size || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">SOM Market Size</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.som_market_size || 'Not specified'}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Market Opportunity Summary</h4>
                        <p className="text-sm text-muted-foreground">{memo.memo_1?.market_analysis || 'Not specified'}</p>
                      </div>
                    </div>

                    {/* Problem & Solution */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Problem & Solution</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Problem Statement</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.problem || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Solution</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.solution || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Business Model & Revenue */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Business Model & Revenue</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Business Model</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.business_model || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Revenue Model</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.revenue_model || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Pricing Strategy</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.pricing_strategy || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Go-to-Market</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.go_to_market || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Team & Founder */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Team & Founder Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Founder Name</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.founder_name || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Founder LinkedIn</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.founder_linkedin_url || 'Not provided'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Team Size</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.team_size || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Key Team Members</h4>
                          <p className="text-sm text-muted-foreground">
                            {Array.isArray(memo.memo_1?.key_team_members) 
                              ? memo.memo_1.key_team_members.join(', ') 
                              : memo.memo_1?.key_team_members || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Advisory Board</h4>
                          <p className="text-sm text-muted-foreground">
                            {Array.isArray(memo.memo_1?.advisory_board) 
                              ? memo.memo_1.advisory_board.join(', ') 
                              : memo.memo_1?.advisory_board || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Execution Track Record</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.execution_track_record || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Competition & Product */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Competition & Product</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Competition</h4>
                          <p className="text-sm text-muted-foreground">
                            {Array.isArray(memo.memo_1?.competition) 
                              ? memo.memo_1.competition.join(', ') 
                              : memo.memo_1?.competition || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Competitive Advantages</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.competitive_advantages || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Product Features</h4>
                          <p className="text-sm text-muted-foreground">
                            {Array.isArray(memo.memo_1?.product_features) 
                              ? memo.memo_1.product_features.join(', ') 
                              : memo.memo_1?.product_features || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Technology Stack</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.technology_stack || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Technology Advantages</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.technology_advantages || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Scalability Plan</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.scalability_plan || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Key Metrics & Traction */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Key Metrics & Traction</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Key Metric</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.key_metric || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Traction</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.traction || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">User Growth</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.user_growth || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Revenue Growth</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.revenue_growth || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Customer Growth</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.customer_growth || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Key Milestones</h4>
                          <p className="text-sm text-muted-foreground">
                            {Array.isArray(memo.memo_1?.key_milestones) 
                              ? memo.memo_1.key_milestones.join(', ') 
                              : memo.memo_1?.key_milestones || 'Not specified'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Initial Flags & Validation */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Initial Flags & Validation</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Initial Flags</h4>
                          <div className="flex flex-wrap gap-1">
                            {memo.memo_1?.initial_flags?.map((flag, i) => (
                              <Badge key={i} variant="destructive" className="text-xs">{flag}</Badge>
                            )) || <span className="text-sm text-muted-foreground">No flags identified</span>}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Key Validation Points</h4>
                          <div className="flex flex-wrap gap-1">
                            {memo.memo_1?.validation_points?.map((point, i) => (
                              <Badge key={i} variant="default" className="text-xs">{point}</Badge>
                            )) || <span className="text-sm text-muted-foreground">No validation points</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Financial Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Financial Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Current Revenue</h4>
                          <p className="text-sm text-muted-foreground">{formatCurrency(memo.memo_1?.current_revenue)}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Revenue Growth Rate</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.revenue_growth_rate || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Customer Acquisition Cost</h4>
                          <p className="text-sm text-muted-foreground">{formatCurrency(memo.memo_1?.customer_acquisition_cost)}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Lifetime Value</h4>
                          <p className="text-sm text-muted-foreground">{formatCurrency(memo.memo_1?.lifetime_value)}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Gross Margin</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.gross_margin || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Operating Margin</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.operating_margin || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Net Margin</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.net_margin || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Burn Rate</h4>
                          <p className="text-sm text-muted-foreground">{formatCurrency(memo.memo_1?.burn_rate)}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Runway</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.runway || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Growth Stage</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.growth_stage || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Company Valuation & Funding */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Company Valuation & Funding</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Amount Raising</h4>
                          <p className="text-sm text-muted-foreground">{formatCurrency(memo.memo_1?.amount_raising)}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Pre-Money Valuation</h4>
                          <p className="text-sm text-muted-foreground">{formatCurrency(memo.memo_1?.pre_money_valuation)}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Post-Money Valuation</h4>
                          <p className="text-sm text-muted-foreground">{formatCurrency(memo.memo_1?.post_money_valuation)}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Investment Sought</h4>
                          <p className="text-sm text-muted-foreground">{formatCurrency(memo.memo_1?.investment_sought)}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Ownership Target</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.ownership_target || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Lead Investor</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.lead_investor || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Committed Funding</h4>
                          <p className="text-sm text-muted-foreground">{formatCurrency(memo.memo_1?.committed_funding)}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Round Stage</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.round_stage || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Use of Funds</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.use_of_funds || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Timeline</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.timeline || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Investment Recommendation */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Investment Recommendation</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Key Thesis</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.key_thesis || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Investment Recommendation</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.investment_recommendation || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Financial Context & Business Overview</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.financial_context || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Profitability Analysis</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.profitability_analysis || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Financial Metrics Summary</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.financial_metrics_summary || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Data Limitations</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.data_limitations || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Recommendations</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.recommendations || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Exit Strategy */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Exit Strategy</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Exit Strategy Executive Summary</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.exit_strategy_executive_summary || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Exit Strategy Overview</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.exit_strategy || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Potential Acquirers</h4>
                          <p className="text-sm text-muted-foreground">
                            {Array.isArray(memo.memo_1?.potential_acquirers) 
                              ? memo.memo_1.potential_acquirers.join(', ') 
                              : memo.memo_1?.potential_acquirers || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">IPO Path</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.ipo_timeline || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Exit Strategy Analysis</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.exit_strategy_analysis || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Exit Valuation</h4>
                          <p className="text-sm text-muted-foreground">{formatCurrency(memo.memo_1?.exit_valuation)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Investment Decision Summary */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Investment Decision Summary</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Investment Decision Summary</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.investment_decision_summary || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Risk Assessment</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.risk_assessment || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Key Risks</h4>
                          <div className="flex flex-wrap gap-1">
                            {memo.memo_1?.key_risks?.map((risk, i) => (
                              <Badge key={i} variant="destructive" className="text-xs">{risk}</Badge>
                            )) || <span className="text-sm text-muted-foreground">No risks identified</span>}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Risk Mitigation</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.risk_mitigation || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Regulatory Risk</h4>
                          <p className="text-sm text-muted-foreground">{memo.memo_1?.regulatory_risks || 'Not specified'}</p>
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
                      <h4 className="font-medium mb-2">Key Risks</h4>
                      <div className="flex flex-wrap gap-1">
                        {memo.memo_2?.key_risks?.map((risk, i) => (
                          <Badge key={i} variant="destructive" className="text-xs">{risk}</Badge>
                        )) || <span className="text-sm text-muted-foreground">No risks identified</span>}
                      </div>
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
                      <h4 className="font-medium mb-2">Synthesis Notes</h4>
                      <p className="text-sm text-muted-foreground">{memo.memo_3?.synthesis_notes || 'Not specified'}</p>
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
                {/* Hardcoded investor data for now */}
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
                      <div className="text-sm">
                        <span className="font-medium">Contact:</span> sarah@techventures.com
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Michael Rodriguez</CardTitle>
                        <Badge className="bg-blue-100 text-blue-800">87% Match</Badge>
                      </div>
                      <CardDescription>Principal at Growth Partners</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Focus Areas:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Badge variant="outline" className="text-xs">FinTech</Badge>
                          <Badge variant="outline" className="text-xs">Enterprise</Badge>
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Check Size:</span> $250K - $1M
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Stage:</span> Pre-Seed, Seed
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Contact:</span> mike@growthpartners.com
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Jennifer Liu</CardTitle>
                        <Badge className="bg-yellow-100 text-yellow-800">78% Match</Badge>
                      </div>
                      <CardDescription>Managing Director at Future Fund</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Focus Areas:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Badge variant="outline" className="text-xs">HealthTech</Badge>
                          <Badge variant="outline" className="text-xs">AI</Badge>
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Check Size:</span> $1M - $5M
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Stage:</span> Series A, Series B
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Contact:</span> jennifer@futurefund.com
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">David Park</CardTitle>
                        <Badge className="bg-purple-100 text-purple-800">72% Match</Badge>
                      </div>
                      <CardDescription>Partner at Innovation Ventures</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Focus Areas:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Badge variant="outline" className="text-xs">Deep Tech</Badge>
                          <Badge variant="outline" className="text-xs">Hardware</Badge>
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Check Size:</span> $500K - $3M
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Stage:</span> Seed, Series A
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Contact:</span> david@innovationventures.com
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
