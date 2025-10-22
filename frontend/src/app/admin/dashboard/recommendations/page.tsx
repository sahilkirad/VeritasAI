"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { 
  Search, 
  Users, 
  TrendingUp,
  Send,
  Clock,
  Network,
  Target,
  DollarSign,
  MapPin,
  Building,
  Star,
  ArrowRight,
  RefreshCw
} from "lucide-react"
import { useInvestorRecommendationData } from "@/hooks/useHybridAdminData"

interface InvestorRecommendation {
  investorId: string
  investorName: string
  firmName: string
  matchScore: number
  rationale: string
  sectorAlignment: number
  stageAlignment: number
  ticketSizeMatch: number
  geographyMatch: number
  networkPath: Array<{
    fromId: string
    toId: string
    connectionType: string
  }>
}

interface Company {
  id: string
  name: string
  sector: string
  stage: string
  location: string
}

export default function InvestorRecommendationsPage() {
  // Use hybrid data for investor recommendations
  const { investorMetrics, networkMetrics, loading: hybridLoading } = useInvestorRecommendationData()
  
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<string>("")
  const [recommendations, setRecommendations] = useState<InvestorRecommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    // Simulate loading companies
    const loadCompanies = () => {
      const mockCompanies: Company[] = [
        { id: '1', name: 'TechStartup Inc', sector: 'AI', stage: 'Seed', location: 'San Francisco, CA' },
        { id: '2', name: 'AI Corp', sector: 'AI', stage: 'Series A', location: 'New York, NY' },
        { id: '3', name: 'DataFlow Solutions', sector: 'Data', stage: 'Seed', location: 'Austin, TX' },
        { id: '4', name: 'GreenTech Innovations', sector: 'CleanTech', stage: 'Series B', location: 'Seattle, WA' },
        { id: '5', name: 'FinTech Pro', sector: 'FinTech', stage: 'Seed', location: 'Boston, MA' }
      ]
      setCompanies(mockCompanies)
    }

    loadCompanies()
  }, [])

  const handleGenerateRecommendations = async () => {
    if (!selectedCompany) return

    setGenerating(true)
    
    // Simulate API call
    setTimeout(() => {
      const mockRecommendations: InvestorRecommendation[] = [
        {
          investorId: '1',
          investorName: 'Sarah Chen',
          firmName: 'Accel Partners',
          matchScore: 92,
          rationale: 'Accel has a strong track record in AI startups at the seed stage, with previous investments in similar companies. Their portfolio includes successful AI companies like DataRobot and H2O.ai.',
          sectorAlignment: 95,
          stageAlignment: 88,
          ticketSizeMatch: 90,
          geographyMatch: 85,
          networkPath: [
            { fromId: 'founder', toId: 'angel_1', connectionType: 'direct' },
            { fromId: 'angel_1', toId: 'accel', connectionType: 'co_investor' }
          ]
        },
        {
          investorId: '2',
          investorName: 'Michael Rodriguez',
          firmName: 'Sequoia Capital',
          matchScore: 89,
          rationale: 'Sequoia Capital has extensive experience with AI and machine learning startups. They have a strong network in the San Francisco area and typically invest in companies with strong technical teams.',
          sectorAlignment: 92,
          stageAlignment: 85,
          ticketSizeMatch: 88,
          geographyMatch: 90,
          networkPath: [
            { fromId: 'founder', toId: 'sequoia', connectionType: 'referral' }
          ]
        },
        {
          investorId: '3',
          investorName: 'Jennifer Liu',
          firmName: 'Andreessen Horowitz',
          matchScore: 87,
          rationale: 'a16z has been actively investing in AI infrastructure companies. Their portfolio includes companies like Anthropic and Character.AI, showing strong interest in AI applications.',
          sectorAlignment: 90,
          stageAlignment: 82,
          ticketSizeMatch: 85,
          geographyMatch: 88,
          networkPath: [
            { fromId: 'founder', toId: 'a16z', connectionType: 'direct' }
          ]
        },
        {
          investorId: '4',
          investorName: 'David Park',
          firmName: 'GV (Google Ventures)',
          matchScore: 84,
          rationale: 'GV has a strong focus on AI and machine learning startups. Their Google connection provides valuable technical expertise and potential partnership opportunities.',
          sectorAlignment: 88,
          stageAlignment: 80,
          ticketSizeMatch: 82,
          geographyMatch: 85,
          networkPath: [
            { fromId: 'founder', toId: 'gv', connectionType: 'syndicate' }
          ]
        },
        {
          investorId: '5',
          investorName: 'Lisa Wang',
          firmName: 'Kleiner Perkins',
          matchScore: 81,
          rationale: 'Kleiner Perkins has a history of successful AI investments and strong connections in the tech industry. They typically invest in companies with strong market potential.',
          sectorAlignment: 85,
          stageAlignment: 78,
          ticketSizeMatch: 80,
          geographyMatch: 82,
          networkPath: [
            { fromId: 'founder', toId: 'kp', connectionType: 'co_investor' }
          ]
        }
      ]
      
      setRecommendations(mockRecommendations)
      setGenerating(false)
    }, 2000)
  }

  const handleSendMemo = (investorId: string) => {
    // Simulate sending memo
    console.log(`Sending memo to investor ${investorId}`)
    // In real implementation, this would call the API
  }

  const handleScheduleFollowUp = (investorId: string) => {
    // Simulate scheduling follow-up
    console.log(`Scheduling follow-up for investor ${investorId}`)
    // In real implementation, this would call the API
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-yellow-600'
    if (score >= 70) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100'
    if (score >= 80) return 'bg-yellow-100'
    if (score >= 70) return 'bg-orange-100'
    return 'bg-red-100'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Investor Recommendations</h1>
        <p className="text-gray-600 mt-2">Generate and manage AI-powered investor matches for startups</p>
      </div>

      {/* Company Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Company</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Choose Company
              </label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a company..." />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{company.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {company.sector}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {company.stage}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={handleGenerateRecommendations}
                disabled={!selectedCompany || generating}
                className="w-full"
              >
                {generating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Target className="mr-2 h-4 w-4" />
                    Generate Recommendations
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Recommendations ({recommendations.length})
            </h2>
            <Badge variant="secondary">
              Sorted by Match Score
            </Badge>
          </div>

          {recommendations.map((rec, index) => (
            <Card key={rec.investorId} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-primary-foreground">
                        {rec.investorName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{rec.investorName}</h3>
                      <p className="text-gray-600">{rec.firmName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">
                          <Building className="w-3 h-3 mr-1" />
                          {rec.firmName}
                        </Badge>
                        <Badge variant="outline">
                          <MapPin className="w-3 h-3 mr-1" />
                          San Francisco, CA
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getScoreBgColor(rec.matchScore)}`}>
                      <Star className="w-4 h-4" />
                      <span className={`font-bold ${getScoreColor(rec.matchScore)}`}>
                        {rec.matchScore}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Match Score</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Rationale */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">AI Rationale</h4>
                    <p className="text-gray-600 text-sm">{rec.rationale}</p>
                  </div>

                  {/* Match Breakdown */}
                  <Accordion type="single" collapsible>
                    <AccordionItem value="breakdown">
                      <AccordionTrigger>
                        <span className="font-medium">Match Breakdown</span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{rec.sectorAlignment}%</div>
                            <p className="text-sm text-gray-600">Sector Alignment</p>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{rec.stageAlignment}%</div>
                            <p className="text-sm text-gray-600">Stage Alignment</p>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{rec.ticketSizeMatch}%</div>
                            <p className="text-sm text-gray-600">Ticket Size Match</p>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{rec.geographyMatch}%</div>
                            <p className="text-sm text-gray-600">Geography Match</p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {/* Network Path */}
                  {rec.networkPath.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Network Path</h4>
                      <div className="flex items-center gap-2 text-sm">
                        {rec.networkPath.map((path, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                              {path.fromId}
                            </span>
                            <ArrowRight className="w-3 h-3 text-gray-400" />
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                              {path.toId}
                            </span>
                            {idx < rec.networkPath.length - 1 && (
                              <ArrowRight className="w-3 h-3 text-gray-400" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t">
                    <Button 
                      onClick={() => handleSendMemo(rec.investorId)}
                      className="flex-1"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Send Memo Now
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleScheduleFollowUp(rec.investorId)}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Schedule Follow-up
                    </Button>
                    <Button variant="outline">
                      <Network className="mr-2 h-4 w-4" />
                      View Network
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {recommendations.length === 0 && !generating && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Recommendations Yet</h3>
            <p className="text-gray-600 mb-4">
              Select a company and generate AI-powered investor recommendations.
            </p>
            <Button onClick={handleGenerateRecommendations} disabled={!selectedCompany}>
              <Target className="mr-2 h-4 w-4" />
              Generate Recommendations
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
