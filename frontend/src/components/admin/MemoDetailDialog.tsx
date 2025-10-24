"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
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

interface MemoDetailDialogProps {
  memo: MemoDetail | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function MemoDetailDialog({ memo, open, onOpenChange }: MemoDetailDialogProps) {
  const [activeTab, setActiveTab] = useState("memo1")
  const [adminNote, setAdminNote] = useState("")
  const [flaggedReasons, setFlaggedReasons] = useState<string[]>([])
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (memo) {
      setAdminNote("")
      setFlaggedReasons(memo.flaggedReasons || [])
    }
  }, [memo])

  if (!memo) return null

  const handleApprove = () => {
    // TODO: Implement approve functionality
    console.log("Approving memo:", memo.id)
  }

  const handleFlag = () => {
    // TODO: Implement flag functionality
    console.log("Flagging memo:", memo.id)
  }

  const handleReject = () => {
    // TODO: Implement reject functionality
    console.log("Rejecting memo:", memo.id)
  }

  const handleAddNote = () => {
    if (adminNote.trim()) {
      // TODO: Implement add note functionality
      console.log("Adding note:", adminNote)
      setAdminNote("")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50 border-green-200'
      case 'flagged': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-purple-600" />
            <span className="text-xl font-bold">{memo.companyName}</span>
            <Badge variant="outline" className={getStatusColor(memo.status)}>
              {memo.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">AI Confidence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(memo.aiConfidenceScore * 100).toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">
                  {memo.aiConfidenceScore > 0.8 ? 'High' : memo.aiConfidenceScore > 0.6 ? 'Medium' : 'Low'} Confidence
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Risk Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={getRiskColor(memo.riskRating)}>
                  {memo.riskRating.toUpperCase()}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Created</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">
                  {new Date(memo.createdAt).toLocaleDateString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(memo.createdAt).toLocaleTimeString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={memo.status === 'approved'}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button 
              onClick={handleFlag}
              variant="outline"
              className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
              disabled={memo.status === 'flagged'}
            >
              <Flag className="h-4 w-4 mr-2" />
              Flag
            </Button>
            <Button 
              onClick={handleReject}
              variant="outline"
              className="border-red-500 text-red-600 hover:bg-red-50"
              disabled={memo.status === 'rejected'}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>

          {/* Memo Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="memo1">Memo 1</TabsTrigger>
              <TabsTrigger value="memo2">Memo 2</TabsTrigger>
              <TabsTrigger value="memo3">Memo 3</TabsTrigger>
            </TabsList>

            <TabsContent value="memo1" className="space-y-4">
              {memo.memo1Data && (
                <div className="space-y-6">
                  {/* Executive Summary */}
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

                  {/* Problem & Solution */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                          Problem Statement
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {memo.memo1Data.problem}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          Solution
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {memo.memo1Data.solution}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Business Model & Market */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-blue-500" />
                          Business Model
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {memo.memo1Data.business_model}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Shield className="h-5 w-5 text-purple-500" />
                          Market Size
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {memo.memo1Data.market_size}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Traction & Team */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-green-500" />
                          Traction
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {memo.memo1Data.traction}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <User className="h-5 w-5 text-indigo-500" />
                          Team
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {memo.memo1Data.team}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Competition */}
                  {memo.memo1Data.competition && memo.memo1Data.competition.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Shield className="h-5 w-5 text-orange-500" />
                          Competition
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {memo.memo1Data.competition.map((competitor: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {competitor}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Risk Flags */}
                  {memo.memo1Data.initial_flags && memo.memo1Data.initial_flags.length > 0 && (
                    <Card className="border-red-200 bg-red-50">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                          <AlertCircle className="h-5 w-5" />
                          Risk Flags
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {memo.memo1Data.initial_flags.map((flag: string, index: number) => (
                            <li key={index} className="text-sm text-red-600 flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              {flag}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Validation Points */}
                  {memo.memo1Data.validation_points && memo.memo1Data.validation_points.length > 0 && (
                    <Card className="border-green-200 bg-green-50">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2 text-green-700">
                          <CheckCircle className="h-5 w-5" />
                          Validation Points
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {memo.memo1Data.validation_points.map((point: string, index: number) => (
                            <li key={index} className="text-sm text-green-600 flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="memo2" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Memo 2 - Deep Dive Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Memo 2 content will be available after deep dive analysis is completed.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="memo3" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Memo 3 - Final Diligence</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Memo 3 content will be available after final diligence is completed.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Admin Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Admin Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a note about this memo..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAddNote} disabled={!adminNote.trim()}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </div>
              
              {memo.adminNotes?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Previous Notes:</h4>
                  {memo.adminNotes?.map((note, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg text-sm">
                      {note}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
