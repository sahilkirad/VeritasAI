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
import { Investor } from "@/lib/types/investor"
import { getInvestorById } from "@/lib/services/investorService"
import { EngagementScore } from "@/components/admin/EngagementScore"
import { PortfolioView } from "@/components/admin/PortfolioView"

// Generate static params for static export
export async function generateStaticParams() {
  // Return empty array to let dynamic routes be handled client-side
  return []
}

export default function InvestorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const investorId = params.id as string
  
  const [investor, setInvestor] = useState<Investor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInvestor = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🔄 Fetching investor:', investorId)
        const data = await getInvestorById(investorId)
        
        if (!data) {
          setError('Investor not found')
          return
        }
        
        setInvestor(data)
        console.log('✅ Loaded investor:', data.name)
      } catch (err) {
        console.error('❌ Error fetching investor:', err)
        setError('Failed to load investor data')
      } finally {
        setLoading(false)
      }
    }

    if (investorId) {
      fetchInvestor()
    }
  }, [investorId])

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
          <Link href="/admin/investors">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Investors
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Loading...</h1>
          </div>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading investor details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !investor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/investors">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Investors
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Investor Not Found</h1>
          </div>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error || 'Investor not found'}</p>
            <Link href="/admin/investors">
              <Button variant="outline" className="mt-2">
                Return to Investors List
              </Button>
            </Link>
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
          <Link href="/admin/investors">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Investors
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{investor.name}</h1>
            <p className="text-muted-foreground">
              {investor.firm} • {investor.title}
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
            Send Deal
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{investor.engagementScore}%</div>
            <p className="text-xs text-muted-foreground">
              Based on activity and response rates
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deals Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{investor.dealsSent}</div>
            <p className="text-xs text-muted-foreground">
              {investor.dealsOpened} opened ({Math.round((investor.dealsOpened / investor.dealsSent) * 100)}%)
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reply Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((investor.dealsReplied / investor.dealsSent) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {investor.dealsReplied} replies
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{investor.avgResponseTime.toFixed(1)}d</div>
            <p className="text-xs text-muted-foreground">
              Days to respond
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Firm:</span>
                    <span className="text-sm">{investor.firm}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Title:</span>
                    <span className="text-sm">{investor.title || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Email:</span>
                    <a href={`mailto:${investor.email}`} className="text-sm text-primary hover:underline">
                      {investor.email}
                    </a>
                  </div>
                  {investor.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Phone:</span>
                      <a href={`tel:${investor.phone}`} className="text-sm text-primary hover:underline">
                        {investor.phone}
                      </a>
                    </div>
                  )}
                  {investor.linkedin && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">LinkedIn:</span>
                      <a href={investor.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                        View Profile
                      </a>
                    </div>
                  )}
                </div>
                
                {investor.bio && (
                  <div>
                    <span className="text-sm font-medium">Bio:</span>
                    <p className="text-sm text-muted-foreground mt-1">{investor.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Investment Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Investment Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Check Size:</span>
                    <span className="text-sm font-semibold">
                      {formatCurrency(investor.checkSizeMin)} - {formatCurrency(investor.checkSizeMax)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Sector Focus:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {investor.sectorFocus.map((sector, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {sector}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Stage Preference:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {investor.stagePreference.map((stage, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {stage}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Geography:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {investor.geography.map((geo, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {geo}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                {investor.investmentThesis && (
                  <div>
                    <span className="text-sm font-medium">Investment Thesis:</span>
                    <p className="text-sm text-muted-foreground mt-1">{investor.investmentThesis}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Engagement Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Engagement Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EngagementScore
                  score={investor.engagementScore}
                  dealsSent={investor.dealsSent}
                  dealsOpened={investor.dealsOpened}
                  dealsReplied={investor.dealsReplied}
                  avgResponseTime={investor.avgResponseTime}
                  showDetails={true}
                />
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge 
                      variant={investor.status === 'Active' ? 'default' : 'secondary'}
                      className={
                        investor.status === 'Active' 
                          ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                          : ''
                      }
                    >
                      {investor.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Last Active:</span>
                    <span className="text-sm">{formatDate(investor.lastActive)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Added:</span>
                    <span className="text-sm">{formatDate(investor.createdAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-4">
          <PortfolioView portfolio={investor.portfolioCompanies || []} />
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Detailed Investment Preferences
              </CardTitle>
              <CardDescription>
                Comprehensive view of investment criteria and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Sector Focus</h4>
                  <div className="flex flex-wrap gap-1">
                    {investor.sectorFocus.map((sector, index) => (
                      <Badge key={index} variant="outline">
                        {sector}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Stage Preference</h4>
                  <div className="flex flex-wrap gap-1">
                    {investor.stagePreference.map((stage, index) => (
                      <Badge key={index} variant="outline">
                        {stage}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Geographic Focus</h4>
                  <div className="flex flex-wrap gap-1">
                    {investor.geography.map((geo, index) => (
                      <Badge key={index} variant="outline">
                        {geo}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Check Size Range</h4>
                  <div className="text-lg font-semibold">
                    {formatCurrency(investor.checkSizeMin)} - {formatCurrency(investor.checkSizeMax)}
                  </div>
                </div>
              </div>
              
              {investor.investmentThesis && (
                <div>
                  <h4 className="font-medium mb-2">Investment Thesis</h4>
                  <p className="text-muted-foreground">{investor.investmentThesis}</p>
                </div>
              )}
              
              {investor.coInvestorNetwork && investor.coInvestorNetwork.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Co-Investor Network</h4>
                  <div className="flex flex-wrap gap-1">
                    {investor.coInvestorNetwork.map((coInvestor, index) => (
                      <Badge key={index} variant="secondary">
                        {coInvestor}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deals Tab */}
        <TabsContent value="deals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Deal History
              </CardTitle>
              <CardDescription>
                Track all deals sent to this investor
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Deal Tracking Coming Soon</h3>
              <p className="text-muted-foreground mb-4">
                Detailed deal tracking and analytics will be available in the next phase.
              </p>
              <Button variant="outline">
                <Target className="h-4 w-4 mr-2" />
                Send New Deal
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activity Timeline
              </CardTitle>
              <CardDescription>
                Complete history of interactions and activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <div>
                    <p className="font-medium">Investor profile created</p>
                    <p className="text-sm text-muted-foreground">{formatDate(investor.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div>
                    <p className="font-medium">First deal sent</p>
                    <p className="text-sm text-muted-foreground">Deal engagement started</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <div>
                    <p className="font-medium">Profile last updated</p>
                    <p className="text-sm text-muted-foreground">{formatDate(investor.lastUpdated)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <div>
                    <p className="font-medium">Last active</p>
                    <p className="text-sm text-muted-foreground">{formatDate(investor.lastActive)}</p>
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
