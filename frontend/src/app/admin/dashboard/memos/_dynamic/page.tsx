"use client"

import { useEffect, useState } from "react"

// Required for static export
export async function generateStaticParams() {
  // Return empty array for dynamic routes - will be generated at runtime
  return []
}
import { useParams, useRouter } from "next/navigation"
import { useAdminMemos } from "@/hooks/useFirestoreRealtime"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft,
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Edit,
  Save,
  Flag,
  MessageSquare,
  Calendar,
  User,
  TrendingUp,
  Shield,
  FileText
} from "lucide-react"

interface MemoDetail {
  id: string
  companyName: string
  memoVersion: 1 | 2 | 3
  status: 'pending_review' | 'approved' | 'flagged' | 'rejected'
  aiConfidenceScore: number
  riskRating: 'low' | 'medium' | 'high' | 'critical'
  createdAt: string
  reviewedBy?: string
  reviewedAt?: string
  memo1Data?: any
  memo2Data?: any
  memo3Data?: any
  adminNotes: string[]
  flaggedReasons: string[]
}

export default function MemoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [memo, setMemo] = useState<MemoDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("memo1")
  const [adminNote, setAdminNote] = useState("")
  const [flaggedReasons, setFlaggedReasons] = useState<string[]>([])

  // Get real-time memos from Firestore
  const { data: firestoreMemos, loading: memosLoading, error: memosError } = useAdminMemos()

  useEffect(() => {
    if (!memosLoading && firestoreMemos.length > 0) {
      // Find the specific memo by ID
      const foundMemo = firestoreMemos.find((m: any) => m.id === params.id)
      
      if (foundMemo) {
        // Debug: Log the actual memo data structure
        console.log('🔍 Found memo data:', foundMemo);
        console.log('🔍 Memo1 data:', foundMemo.memo1);
        
        const memoDetail: MemoDetail = {
          id: foundMemo.id || 'unknown',
          companyName: String(foundMemo.startupName || foundMemo.companyName || 'Unknown Company'),
          memoVersion: foundMemo.memoVersion === 'Memo 1' ? 1 : foundMemo.memoVersion === 'Memo 2' ? 2 : foundMemo.memoVersion === 'Memo 3' ? 3 : 1,
          status: foundMemo.status || 'pending_review',
          aiConfidenceScore: Number(foundMemo.aiConfidenceScore) || 0,
          riskRating: String(foundMemo.riskRating || 'medium').toLowerCase() as 'low' | 'medium' | 'high' | 'critical',
          createdAt: foundMemo.createdAt || new Date().toISOString(),
          reviewedBy: foundMemo.reviewerId || foundMemo.reviewedBy,
          reviewedAt: foundMemo.reviewedAt,
          adminNotes: Array.isArray(foundMemo.advisoryNotes) ? foundMemo.advisoryNotes : [],
          flaggedReasons: Array.isArray(foundMemo.riskFlags) ? foundMemo.riskFlags : [],
          memo1Data: {
            title: String(foundMemo.startupName || foundMemo.companyName || 'Unknown Company'),
            problem: String(foundMemo.memo1?.problem || foundMemo.problem || 'No information available'),
            solution: String(foundMemo.memo1?.solution || foundMemo.solution || 'No information available'),
            business_model: String(foundMemo.memo1?.businessModel || foundMemo.businessModel || 'No information available'),
            market_size: String(foundMemo.memo1?.marketSize || foundMemo.marketSize || 'No information available'),
            traction: String(foundMemo.memo1?.traction || foundMemo.traction || 'No information available'),
            team: String(foundMemo.memo1?.team || 'No information available'),
            competition: Array.isArray(foundMemo.memo1?.competition) ? foundMemo.memo1.competition : Array.isArray(foundMemo.competition) ? foundMemo.competition : [],
            initial_flags: Array.isArray(foundMemo.memo1?.initialFlags) ? foundMemo.memo1.initialFlags : Array.isArray(foundMemo.riskFlags) ? foundMemo.riskFlags : [],
            validation_points: Array.isArray(foundMemo.memo1?.validationPoints) ? foundMemo.memo1.validationPoints : Array.isArray(foundMemo.validationPoints) ? foundMemo.validationPoints : [],
            // Add all additional fields from memo1
            go_to_market: String(foundMemo.memo1?.goToMarket || ''),
            revenue_model: String(foundMemo.memo1?.revenueModel || foundMemo.revenueModel || ''),
            funding_ask: String(foundMemo.memo1?.fundingAsk || foundMemo.fundingAsk || ''),
            use_of_funds: String(foundMemo.memo1?.useOfFunds || foundMemo.useOfFunds || ''),
            target_market: String(foundMemo.memo1?.targetMarket || foundMemo.targetMarket || ''),
            scalability: String(foundMemo.memo1?.scalability || ''),
            partnerships: Array.isArray(foundMemo.memo1?.partnerships) ? foundMemo.memo1.partnerships : [],
            intellectual_property: String(foundMemo.memo1?.intellectualProperty || ''),
            regulatory_considerations: String(foundMemo.memo1?.regulatoryConsiderations || ''),
            pricing_strategy: String(foundMemo.memo1?.pricingStrategy || ''),
            exit_strategy: String(foundMemo.memo1?.exitStrategy || ''),
            technology_stack: String(foundMemo.memo1?.technologyStack || ''),
            timeline: String(foundMemo.memo1?.timeline || ''),
            founder_linkedin_url: String(foundMemo.memo1?.founderLinkedinUrl || ''),
            company_linkedin_url: String(foundMemo.memo1?.companyLinkedinUrl || ''),
            summary_analysis: String(foundMemo.memo1?.summaryAnalysis || foundMemo.aiSummary || '')
          }
        }
        setMemo(memoDetail)
      }
      setLoading(false)
    }
  }, [memosLoading, firestoreMemos, params.id])

  const handleApprove = () => {
    // Simulate approval
    if (memo) {
      setMemo({
        ...memo,
        status: 'approved',
        reviewedBy: 'admin@veritas.com',
        reviewedAt: new Date().toISOString()
      })
    }
  }

  const handleFlag = () => {
    // Simulate flagging
    if (memo) {
      setMemo({
        ...memo,
        status: 'flagged',
        flaggedReasons: ['Low confidence score', 'Missing financial data']
      })
    }
  }

  const handleReject = () => {
    // Simulate rejection
    if (memo) {
      setMemo({
        ...memo,
        status: 'rejected',
        reviewedBy: 'admin@veritas.com',
        reviewedAt: new Date().toISOString()
      })
    }
  }

  const handleAddNote = () => {
    if (adminNote.trim() && memo) {
      setMemo({
        ...memo,
        adminNotes: [...memo.adminNotes, adminNote]
      })
      setAdminNote("")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'pending_review':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>
      case 'flagged':
        return <Badge variant="destructive" className="bg-orange-100 text-orange-800"><AlertCircle className="w-3 h-3 mr-1" />Flagged</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low':
        return <Badge variant="outline" className="text-green-600 border-green-200">Low Risk</Badge>
      case 'medium':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200">Medium Risk</Badge>
      case 'high':
        return <Badge variant="outline" className="text-orange-600 border-orange-200">High Risk</Badge>
      case 'critical':
        return <Badge variant="destructive">Critical Risk</Badge>
      default:
        return <Badge variant="outline">{risk}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  if (!memo) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Memo not found</h2>
        <p className="text-gray-600 mt-2">The requested memo could not be found.</p>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{memo.companyName}</h1>
            <p className="text-gray-600">Memo {memo.memoVersion} - {getStatusBadge(memo.status)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {memo.status === 'pending_review' && (
            <>
              <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button onClick={handleFlag} variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50">
                <Flag className="mr-2 h-4 w-4" />
                Flag
              </Button>
              <Button onClick={handleReject} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Memo Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">AI Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(memo.aiConfidenceScore * 100)}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full ${
                  memo.aiConfidenceScore >= 0.8 ? 'bg-green-500' : 
                  memo.aiConfidenceScore >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${memo.aiConfidenceScore * 100}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Risk Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getRiskBadge(memo.riskRating)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              {new Date(memo.createdAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Reviewed By</CardTitle>
          </CardHeader>
          <CardContent>
            {memo.reviewedBy ? (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <User className="h-4 w-4" />
                {memo.reviewedBy}
              </div>
            ) : (
              <span className="text-gray-400">Not reviewed</span>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Memo Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="memo1">Memo 1</TabsTrigger>
          <TabsTrigger value="memo2">Memo 2</TabsTrigger>
          <TabsTrigger value="memo3">Memo 3</TabsTrigger>
          <TabsTrigger value="admin">Admin Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="memo1" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Memo 1 Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {memo.memo1Data && (
                <>
                  <div>
                    <h4 className="font-medium text-gray-900">Problem</h4>
                    <p className="text-gray-600 mt-1">{memo.memo1Data.problem}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Solution</h4>
                    <p className="text-gray-600 mt-1">{memo.memo1Data.solution}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Business Model</h4>
                    <p className="text-gray-600 mt-1">{memo.memo1Data.business_model}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Market Size</h4>
                    <p className="text-gray-600 mt-1">{memo.memo1Data.market_size}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Traction</h4>
                    <p className="text-gray-600 mt-1">{memo.memo1Data.traction}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Team</h4>
                    <p className="text-gray-600 mt-1">{memo.memo1Data.team}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Competition</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {memo.memo1Data.competition?.map((competitor: string, index: number) => (
                        <Badge key={index} variant="outline">{competitor}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Initial Flags</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {memo.memo1Data.initial_flags?.map((flag: string, index: number) => (
                        <Badge key={index} variant="destructive">{flag}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Validation Points</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {memo.memo1Data.validation_points?.map((point: string, index: number) => (
                        <Badge key={index} variant="secondary">{point}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Additional detailed sections */}
                  {memo.memo1Data.go_to_market && (
                    <div>
                      <h4 className="font-medium text-gray-900">Go-to-Market Strategy</h4>
                      <p className="text-gray-600 mt-1">{memo.memo1Data.go_to_market}</p>
                    </div>
                  )}
                  
                  {memo.memo1Data.revenue_model && (
                    <div>
                      <h4 className="font-medium text-gray-900">Revenue Model</h4>
                      <p className="text-gray-600 mt-1">{memo.memo1Data.revenue_model}</p>
                    </div>
                  )}
                  
                  {memo.memo1Data.funding_ask && (
                    <div>
                      <h4 className="font-medium text-gray-900">Funding Ask</h4>
                      <p className="text-gray-600 mt-1">{memo.memo1Data.funding_ask}</p>
                    </div>
                  )}
                  
                  {memo.memo1Data.use_of_funds && (
                    <div>
                      <h4 className="font-medium text-gray-900">Use of Funds</h4>
                      <p className="text-gray-600 mt-1">{memo.memo1Data.use_of_funds}</p>
                    </div>
                  )}
                  
                  {memo.memo1Data.target_market && (
                    <div>
                      <h4 className="font-medium text-gray-900">Target Market</h4>
                      <p className="text-gray-600 mt-1">{memo.memo1Data.target_market}</p>
                    </div>
                  )}
                  
                  {memo.memo1Data.scalability && (
                    <div>
                      <h4 className="font-medium text-gray-900">Scalability</h4>
                      <p className="text-gray-600 mt-1">{memo.memo1Data.scalability}</p>
                    </div>
                  )}
                  
                  {memo.memo1Data.partnerships && memo.memo1Data.partnerships.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900">Partnerships</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {memo.memo1Data.partnerships.map((partnership: string, index: number) => (
                          <Badge key={index} variant="outline">{partnership}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {memo.memo1Data.intellectual_property && (
                    <div>
                      <h4 className="font-medium text-gray-900">Intellectual Property</h4>
                      <p className="text-gray-600 mt-1">{memo.memo1Data.intellectual_property}</p>
                    </div>
                  )}
                  
                  {memo.memo1Data.regulatory_considerations && (
                    <div>
                      <h4 className="font-medium text-gray-900">Regulatory Considerations</h4>
                      <p className="text-gray-600 mt-1">{memo.memo1Data.regulatory_considerations}</p>
                    </div>
                  )}
                  
                  {memo.memo1Data.pricing_strategy && (
                    <div>
                      <h4 className="font-medium text-gray-900">Pricing Strategy</h4>
                      <p className="text-gray-600 mt-1">{memo.memo1Data.pricing_strategy}</p>
                    </div>
                  )}
                  
                  {memo.memo1Data.exit_strategy && (
                    <div>
                      <h4 className="font-medium text-gray-900">Exit Strategy</h4>
                      <p className="text-gray-600 mt-1">{memo.memo1Data.exit_strategy}</p>
                    </div>
                  )}
                  
                  {memo.memo1Data.technology_stack && (
                    <div>
                      <h4 className="font-medium text-gray-900">Technology Stack</h4>
                      <p className="text-gray-600 mt-1">{memo.memo1Data.technology_stack}</p>
                    </div>
                  )}
                  
                  {memo.memo1Data.timeline && (
                    <div>
                      <h4 className="font-medium text-gray-900">Timeline</h4>
                      <p className="text-gray-600 mt-1">{memo.memo1Data.timeline}</p>
                    </div>
                  )}
                  
                  {(memo.memo1Data.founder_linkedin_url || memo.memo1Data.company_linkedin_url) && (
                    <div>
                      <h4 className="font-medium text-gray-900">Links</h4>
                      <div className="space-y-1 mt-1">
                        {memo.memo1Data.founder_linkedin_url && (
                          <a href={memo.memo1Data.founder_linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                            Founder LinkedIn
                          </a>
                        )}
                        {memo.memo1Data.company_linkedin_url && (
                          <a href={memo.memo1Data.company_linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm block">
                            Company LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Executive Summary Section */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg border border-purple-200">
                    <h4 className="font-bold text-lg text-purple-900 mb-3 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Executive Summary
                    </h4>
                    <p className="text-sm text-purple-800 leading-relaxed">
                      {memo.memo1Data.executive_summary || 
                       memo.memo1Data.summary_analysis || 
                       memo.memo1Data.problem || 
                       memo.memo1Data.solution || 
                       'Based on the initial document analysis, this company shows potential in the market with a clear problem-solution fit. Key areas for further investigation include market validation and competitive positioning.'}
                    </p>
                  </div>
                  
                  {memo.memo1Data.summary_analysis && (
                    <div>
                      <h4 className="font-medium text-gray-900">Summary Analysis</h4>
                      <p className="text-gray-600 mt-1">{memo.memo1Data.summary_analysis}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memo2">
          <Card>
            <CardHeader>
              <CardTitle>Memo 2 Content</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Memo 2 content not available yet.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memo3">
          <Card>
            <CardHeader>
              <CardTitle>Memo 3 Content</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Memo 3 content not available yet.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Admin Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {memo.adminNotes.length > 0 ? (
                <div className="space-y-2">
                  {memo.adminNotes.map((note, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm">{note}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No admin notes yet.</p>
              )}
              
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add admin note..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAddNote} disabled={!adminNote.trim()}>
                  <Save className="mr-2 h-4 w-4" />
                  Add Note
                </Button>
              </div>
            </CardContent>
          </Card>

          {memo.flaggedReasons.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Flagged Reasons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {memo.flaggedReasons.map((reason, index) => (
                    <div key={index} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-sm text-orange-800">{reason}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
