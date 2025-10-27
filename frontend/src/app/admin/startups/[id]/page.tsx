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
  FileText, 
  Users, 
  Target,
  Activity,
  Bot,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp
} from "lucide-react"
import Link from "next/link"
import { Startup } from "@/lib/types/startup"
import { getStartupById } from "@/lib/services/startupService"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { ScoreBar } from "@/components/admin/ScoreBar"

// Generate static params for static export
export async function generateStaticParams() {
  // Return empty array to let dynamic routes be handled client-side
  return []
}

export default function StartupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const startupId = params.id as string
  
  const [startup, setStartup] = useState<Startup | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStartup = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🔄 Fetching startup:', startupId)
        const data = await getStartupById(startupId)
        
        if (!data) {
          setError('Startup not found')
          return
        }
        
        setStartup(data)
        console.log('✅ Loaded startup:', data.companyName)
      } catch (err) {
        console.error('❌ Error fetching startup:', err)
        setError('Failed to load startup data')
      } finally {
        setLoading(false)
      }
    }

    if (startupId) {
      fetchStartup()
    }
  }, [startupId])

  const formatCurrency = (value: string) => {
    if (!value || value === 'Not specified') return value;
    
    const match = value.match(/(\d+(?:\.\d+)?)/);
    if (match) {
      const num = parseFloat(match[1]);
      if (num >= 1000000) {
        return `$${(num / 1000000).toFixed(1)}M`;
      } else if (num >= 1000) {
        return `$${(num / 1000).toFixed(0)}K`;
      } else {
        return `$${num.toFixed(0)}`;
      }
    }
    return value;
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
            <Link href="/admin/startups">
              <Button variant="outline" className="mt-2">
                Return to Startups List
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
          <Link href="/admin/startups">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Startups
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{startup.companyName}</h1>
            <p className="text-muted-foreground">
              {startup.founderName} • {startup.stage} • {startup.sector.join(', ')}
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
            <Mail className="h-4 w-4 mr-2" />
            Send to Investors
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge status={startup.status} type="status" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {startup.aiScore ? `${startup.aiScore.toFixed(1)}/10` : 'N/A'}
            </div>
            <ScoreBar score={startup.aiScore} showLabel={false} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge status={startup.riskLevel} type="risk" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funding Ask</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(startup.fundingAsk)}
            </div>
            <p className="text-xs text-muted-foreground">
              {startup.valuation && `Valuation: ${formatCurrency(startup.valuation)}`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pitch-deck">Pitch Deck</TabsTrigger>
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
                  <FileText className="h-5 w-5" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Headquarters:</span>
                    <span className="text-sm">{startup.headquarters || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Founded:</span>
                    <span className="text-sm">{startup.foundedYear || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Team Size:</span>
                    <span className="text-sm">{startup.teamSize || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Website:</span>
                    {startup.website ? (
                      <a href={startup.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                        {startup.website}
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground">Not provided</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <span className="text-sm font-medium">Sector:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {startup.sector.map((sector, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {sector}
                      </Badge>
                    ))}
                  </div>
                </div>
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
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Name:</span>
                    <span className="text-sm">{startup.founderName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Email:</span>
                    <a href={`mailto:${startup.founderEmail}`} className="text-sm text-primary hover:underline">
                      {startup.founderEmail}
                    </a>
                  </div>
                  {startup.founderLinkedIn && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">LinkedIn:</span>
                      <a href={startup.founderLinkedIn} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                        View Profile
                      </a>
                    </div>
                  )}
                </div>
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
                    <span className="text-sm font-medium">Funding Ask:</span>
                    <span className="text-sm font-semibold">{formatCurrency(startup.fundingAsk)}</span>
                  </div>
                  {startup.valuation && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Valuation:</span>
                      <span className="text-sm">{formatCurrency(startup.valuation)}</span>
                    </div>
                  )}
                  {startup.memo_1?.current_revenue && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Current Revenue:</span>
                      <span className="text-sm">{formatCurrency(startup.memo_1.current_revenue)}</span>
                    </div>
                  )}
                  {startup.memo_1?.burn_rate && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Burn Rate:</span>
                      <span className="text-sm">{formatCurrency(startup.memo_1.burn_rate)}</span>
                    </div>
                  )}
                  {startup.memo_1?.runway && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Runway:</span>
                      <span className="text-sm">{startup.memo_1.runway}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Stage:</span>
                    <Badge variant="outline">{startup.stage}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <StatusBadge status={startup.status} type="status" />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Risk Level:</span>
                    <StatusBadge status={startup.riskLevel} type="risk" />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Last Updated:</span>
                    <span className="text-sm">{formatDate(startup.lastUpdated)}</span>
                  </div>
                </div>
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
                Pitch Deck
              </CardTitle>
              <CardDescription>
                Upload and manage the startup's pitch deck
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Pitch Deck Not Available</h3>
              <p className="text-muted-foreground mb-4">
                No pitch deck has been uploaded for this startup yet.
              </p>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Upload Pitch Deck
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Memos Tab */}
        <TabsContent value="memos" className="space-y-4">
          <div className="space-y-4">
            {/* Memo 1 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Memo 1 - Intake & Curation
                  </span>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={startup.memo_1 ? 'Memo 1' : 'Intake'} type="status" />
                    {startup.memo_1 && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                    )}
                  </div>
                </CardTitle>
                <CardDescription>
                  {startup.memo_1 ? 'Generated and ready for review' : 'Not generated yet'}
                </CardDescription>
              </CardHeader>
              {startup.memo_1 && (
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm"><strong>Summary:</strong> {startup.memo_1.summary || 'No summary available'}</p>
                    <p className="text-sm"><strong>Problem:</strong> {startup.memo_1.problem || 'Not specified'}</p>
                    <p className="text-sm"><strong>Solution:</strong> {startup.memo_1.solution || 'Not specified'}</p>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        View Full Memo
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Memo 2 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Memo 2 - Due Diligence & Validation
                  </span>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={startup.memo_2 ? 'Memo 2' : 'Intake'} type="status" />
                    {startup.memo_2 && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                    )}
                  </div>
                </CardTitle>
                <CardDescription>
                  {startup.memo_2 ? 'Due diligence analysis completed' : 'Not generated yet'}
                </CardDescription>
              </CardHeader>
              {startup.memo_2 && (
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm"><strong>Investment Recommendation:</strong> {startup.memo_2.investment_recommendation || 'Not specified'}</p>
                    <p className="text-sm"><strong>Key Risks:</strong> {startup.memo_2.key_risks?.join(', ') || 'None identified'}</p>
                    <p className="text-sm"><strong>Overall Score:</strong> {startup.memo_2.overall_score || 'Not scored'}/10</p>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        View Full Memo
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Memo 3 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Memo 3 - Final Investment Decision
                  </span>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={startup.memo_3 ? 'Memo 3' : 'Intake'} type="status" />
                    {startup.memo_3 && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                    )}
                  </div>
                </CardTitle>
                <CardDescription>
                  {startup.memo_3 ? 'Final investment decision ready' : 'Not generated yet'}
                </CardDescription>
              </CardHeader>
              {startup.memo_3 && (
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm"><strong>Investment Recommendation:</strong> {startup.memo_3.investment_recommendation || 'Not specified'}</p>
                    <p className="text-sm"><strong>Investment Thesis:</strong> {startup.memo_3.investment_thesis || 'Not specified'}</p>
                    <p className="text-sm"><strong>Overall Score:</strong> {startup.memo_3.overall_score || 'Not scored'}/10</p>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        View Full Memo
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* Interview Tab */}
        <TabsContent value="interview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Interview Insights
              </CardTitle>
              <CardDescription>
                Interview analysis and founder credibility assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Interview Feature Coming Soon</h3>
              <p className="text-muted-foreground mb-4">
                AI-powered interview analysis will be available in the next phase.
              </p>
              <Button variant="outline">
                <Bot className="h-4 w-4 mr-2" />
                Schedule Interview
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Investor Matches Tab */}
        <TabsContent value="investors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                AI Investor Recommendations
              </CardTitle>
              <CardDescription>
                AI-powered investor matching based on startup profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Investor Matching Coming Soon</h3>
                <p className="text-muted-foreground mb-4">
                  AI-powered investor recommendations will be available in the next phase.
                </p>
                <Button>
                  <Target className="h-4 w-4 mr-2" />
                  Run Investor Matching
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Log Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activity Timeline
              </CardTitle>
              <CardDescription>
                Complete history of actions and system events
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
                
                {startup.memo_1 && (
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div>
                      <p className="font-medium">Memo 1 generated</p>
                      <p className="text-sm text-muted-foreground">AI intake and curation completed</p>
                    </div>
                  </div>
                )}
                
                {startup.memo_2 && (
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <div>
                      <p className="font-medium">Memo 2 generated</p>
                      <p className="text-sm text-muted-foreground">Due diligence analysis completed</p>
                    </div>
                  </div>
                )}
                
                {startup.memo_3 && (
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div>
                      <p className="font-medium">Memo 3 generated</p>
                      <p className="text-sm text-muted-foreground">Final investment decision ready</p>
                    </div>
                  </div>
                )}
                
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
