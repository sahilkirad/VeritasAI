"use client"

import { useState, useEffect } from "react"
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
  Activity
} from "lucide-react"
import Link from "next/link"
import { Startup } from "@/lib/types/startup"
import { getStartupById } from "@/lib/services/startupService"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { ScoreBar } from "@/components/admin/ScoreBar"

export default function StartupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string[]
  const startupId = slug?.[0] // Get the first part of the slug as the ID
  
  const [startup, setStartup] = useState<Startup | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStartup = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Validate startup ID
        if (!startupId || startupId.trim() === '') {
          setError('Invalid startup ID')
          return
        }
        
        console.log('🔄 Fetching startup:', startupId)
        const data = await getStartupById(startupId)
        
        if (!data) {
          setError('Startup not found. Please check the URL or try again.')
          return
        }
        
        setStartup(data)
        console.log('✅ Loaded startup:', data.companyName)
      } catch (err: any) {
        console.error('❌ Error fetching startup:', err)
        
        // Provide more specific error messages
        if (err.message?.includes('connection') || err.message?.includes('Receiving end does not exist')) {
          setError('Connection error. This might be caused by browser extensions or network issues. Please try disabling ad blockers or try in an incognito window.')
        } else if (err.message?.includes('Invalid startup ID')) {
          setError('Invalid startup ID. Please navigate back to the startups list.')
        } else if (err.message?.includes('Failed to fetch startup data after')) {
          setError('Unable to load startup data. Please try again in a moment.')
        } else {
          setError('Failed to load startup data. Please try again.')
        }
      } finally {
        setLoading(false)
      }
    }

    if (startupId) {
      fetchStartup()
    }
  }, [startupId])

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    } else {
      return `$${amount.toFixed(0)}`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/startups">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Startups
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Loading...</h1>
          </div>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading startup details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !startup) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/startups">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Startups
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Startup Not Found</h1>
          </div>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error || 'Startup not found'}</p>
            
            {error?.includes('connection') && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Connection Issue:</strong> This error is often caused by browser extensions or ad blockers. 
                  Try these solutions:
                </p>
                <ul className="text-sm text-yellow-700 mt-2 ml-4 list-disc">
                  <li>Disable ad blockers or privacy extensions temporarily</li>
                  <li>Try opening the page in an incognito/private window</li>
                  <li>Refresh the page and try again</li>
                  <li>Check your internet connection</li>
                </ul>
              </div>
            )}
            
            <div className="flex gap-2 mt-4">
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
              >
                Try Again
              </Button>
              <Link href="/admin/startups">
                <Button variant="outline">
                  Return to Startups List
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/startups">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Startups
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{startup.companyName}</h1>
            <p className="text-muted-foreground">
              {startup.industry} • {startup.stage} • Founded {startup.foundedYear}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Target className="h-4 w-4 mr-2" />
            Send to Investors
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{startup.aiScore}/10</div>
            <ScoreBar score={startup.aiScore} maxScore={10} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funding Ask</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(startup.fundingAsk)}</div>
            <p className="text-xs text-muted-foreground">
              {startup.stage} stage
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(startup.revenue)}</div>
            <p className="text-xs text-muted-foreground">
              {startup.revenueGrowth}% growth
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge status={startup.status} />
            <p className="text-xs text-muted-foreground mt-1">
              {startup.memoStatus}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pitch">Pitch Deck</TabsTrigger>
          <TabsTrigger value="memos">Memos</TabsTrigger>
          <TabsTrigger value="interview">Interview</TabsTrigger>
          <TabsTrigger value="investors">Investor Matches</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Industry:</span>
                    <span className="text-sm">{startup.industry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Stage:</span>
                    <Badge variant="outline">{startup.stage}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Founded:</span>
                    <span className="text-sm">{startup.foundedYear}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Location:</span>
                    <span className="text-sm">{startup.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Team Size:</span>
                    <span className="text-sm">{startup.teamSize} employees</span>
                  </div>
                </div>
                
                {startup.description && (
                  <div>
                    <span className="text-sm font-medium">Description:</span>
                    <p className="text-sm text-muted-foreground mt-1">{startup.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Revenue:</span>
                    <span className="text-sm font-semibold">{formatCurrency(startup.revenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Growth Rate:</span>
                    <span className="text-sm text-green-600">{startup.revenueGrowth}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Funding Ask:</span>
                    <span className="text-sm font-semibold">{formatCurrency(startup.fundingAsk)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Valuation:</span>
                    <span className="text-sm">{formatCurrency(startup.valuation)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Runway:</span>
                    <span className="text-sm">{startup.runway} months</span>
                  </div>
                </div>
                
                {startup.burnRate && (
                  <div>
                    <span className="text-sm font-medium">Monthly Burn:</span>
                    <span className="text-sm font-semibold ml-2">{formatCurrency(startup.burnRate)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Founder Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Founder Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Founder:</span>
                    <span className="text-sm">{startup.founderName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Background:</span>
                    <span className="text-sm">{startup.founderBackground}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Experience:</span>
                    <span className="text-sm">{startup.founderExperience} years</span>
                  </div>
                </div>
                
                {startup.founderEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${startup.founderEmail}`} className="text-sm text-primary hover:underline">
                      {startup.founderEmail}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Score</span>
                      <span>{startup.aiScore}/10</span>
                    </div>
                    <ScoreBar score={startup.aiScore} maxScore={10} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Market Potential</span>
                      <span>{startup.marketScore}/10</span>
                    </div>
                    <ScoreBar score={startup.marketScore} maxScore={10} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Team Strength</span>
                      <span>{startup.teamScore}/10</span>
                    </div>
                    <ScoreBar score={startup.teamScore} maxScore={10} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Product Quality</span>
                      <span>{startup.productScore}/10</span>
                    </div>
                    <ScoreBar score={startup.productScore} maxScore={10} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Other tabs with placeholder content */}
        <TabsContent value="pitch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Pitch Deck
              </CardTitle>
              <CardDescription>
                Company presentation and pitch materials
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <ExternalLink className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Pitch Deck Coming Soon</h3>
              <p className="text-muted-foreground mb-4">
                Pitch deck viewing and management will be available in the next phase.
              </p>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Pitch Deck
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Investment Memos
              </CardTitle>
              <CardDescription>
                AI-generated investment analysis and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Memos Coming Soon</h3>
              <p className="text-muted-foreground mb-4">
                Investment memo viewing and management will be available in the next phase.
              </p>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                View Memos
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                AI Interview Insights
              </CardTitle>
              <CardDescription>
                Automated interview analysis and founder credibility assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Interview Analysis Coming Soon</h3>
              <p className="text-muted-foreground mb-4">
                AI-powered interview insights and founder credibility scoring will be available in the next phase.
              </p>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Interview
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                AI Investor Recommendations
              </CardTitle>
              <CardDescription>
                Intelligent matching with potential investors based on preferences and criteria
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Investor Matching Coming Soon</h3>
              <p className="text-muted-foreground mb-4">
                AI-powered investor matching and recommendation engine will be available in the next phase.
              </p>
              <Button>
                <Target className="h-4 w-4 mr-2" />
                Run Investor Matching
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activity Timeline
              </CardTitle>
              <CardDescription>
                Complete history of actions and updates for this startup
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <div>
                    <p className="font-medium">Startup profile created</p>
                    <p className="text-sm text-muted-foreground">{formatDate(startup.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div>
                    <p className="font-medium">Memo 1 generated</p>
                    <p className="text-sm text-muted-foreground">Initial analysis completed</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <div>
                    <p className="font-medium">Memo 2 generated</p>
                    <p className="text-sm text-muted-foreground">Due diligence completed</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <div>
                    <p className="font-medium">Profile last updated</p>
                    <p className="text-sm text-muted-foreground">{formatDate(startup.lastUpdated)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
