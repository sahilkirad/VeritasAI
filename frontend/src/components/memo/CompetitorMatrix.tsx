'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, TrendingUp, Target, ExternalLink, Users, DollarSign, Globe, Calendar } from "lucide-react";

interface Competitor {
  name: string;
  market_position: string;
  funding_status: string;
  market_share: string;
  key_differentiators: string[];
  geographic_presence: string;
  recent_developments: string;
  competitive_strengths: string[];
  competitive_weaknesses: string[];
  funding_amount?: string;
  employee_count?: string;
  founded_year?: string;
  key_products: string[];
  target_market: string;
  business_model: string;
  competitive_threat_level: string;
  founder_linkedin_urls?: string[];
  founder_backgrounds?: string[];
  key_executives?: string[];
}

interface CompetitorMatrixData {
  industry_category: string;
  analysis_timestamp: string;
  competitors: Competitor[];
  market_leaders: string[];
  emerging_players: string[];
  competitive_intensity: string;
  market_concentration: string;
  total_competitors_analyzed: number;
  market_gaps_identified: string[];
  key_market_trends: string[];
}

interface CompetitorMatrixProps {
  data: CompetitorMatrixData | null;
  sources?: string[];
  dataQuality?: string;
  analysisConfidence?: number;
}

export default function CompetitorMatrix({ data, sources, dataQuality, analysisConfidence }: CompetitorMatrixProps) {
  if (!data || !data.competitors || data.competitors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Competitive Analysis Matrix
          </CardTitle>
          <CardDescription>
            No competitor data available for analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Competitor analysis data not available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPositionColor = (position: string) => {
    switch (position.toLowerCase()) {
      case 'leader':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'challenger':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'niche':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'emerging':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-2 border-blue-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Target className="h-5 w-5" />
          Competitive Analysis Matrix
        </CardTitle>
        <CardDescription className="text-blue-700">
          Comprehensive competitor analysis for {data.industry_category} industry
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-lg border border-blue-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Total Competitors</span>
            </div>
            <div className="text-2xl font-bold text-blue-700">{data.total_competitors_analyzed}</div>
          </div>
          
          <div className="p-4 bg-white rounded-lg border border-green-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Market Leaders</span>
            </div>
            <div className="text-2xl font-bold text-green-700">{data.market_leaders.length}</div>
          </div>
          
          <div className="p-4 bg-white rounded-lg border border-orange-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-gray-600">Emerging Players</span>
            </div>
            <div className="text-2xl font-bold text-orange-700">{data.emerging_players.length}</div>
          </div>
          
          <div className="p-4 bg-white rounded-lg border border-purple-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Competitive Intensity</span>
            </div>
            <div className="text-2xl font-bold text-purple-700">{data.competitive_intensity}</div>
          </div>
        </div>

        {/* Competitor Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 rounded-lg shadow-sm">
            <thead className="bg-gradient-to-r from-blue-100 to-indigo-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-bold text-blue-900 border-r border-blue-200">Company</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-blue-900 border-r border-blue-200">Position</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-blue-900 border-r border-blue-200">Funding</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-blue-900 border-r border-blue-200">Market Share</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-blue-900 border-r border-blue-200">Key Differentiators</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-blue-900 border-r border-blue-200">Geographic Presence</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-blue-900 border-r border-blue-200">Threat Level</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-blue-900 border-r border-blue-200">Founder LinkedIn</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-blue-900">Recent Developments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.competitors.map((competitor, index) => (
                <tr key={index} className="hover:bg-blue-50">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800 border-r border-gray-200">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      {competitor.name}
                    </div>
                    {competitor.founded_year && (
                      <div className="text-xs text-gray-500 mt-1">Founded: {competitor.founded_year}</div>
                    )}
                  </td>
                  
                  <td className="px-4 py-3 text-sm border-r border-gray-200">
                    <Badge className={`text-xs ${getPositionColor(competitor.market_position)}`}>
                      {competitor.market_position}
                    </Badge>
                  </td>
                  
                  <td className="px-4 py-3 text-sm border-r border-gray-200">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-green-600" />
                      <span className="text-green-700">{competitor.funding_status}</span>
                    </div>
                    {competitor.funding_amount && (
                      <div className="text-xs text-gray-500 mt-1">{competitor.funding_amount}</div>
                    )}
                  </td>
                  
                  <td className="px-4 py-3 text-sm border-r border-gray-200">
                    <div className="text-blue-700 font-medium">{competitor.market_share}</div>
                  </td>
                  
                  <td className="px-4 py-3 text-sm border-r border-gray-200">
                    <div className="space-y-1">
                      {competitor.key_differentiators.slice(0, 2).map((diff, idx) => (
                        <div key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {diff}
                        </div>
                      ))}
                      {competitor.key_differentiators.length > 2 && (
                        <div className="text-xs text-gray-500">+{competitor.key_differentiators.length - 2} more</div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-4 py-3 text-sm border-r border-gray-200">
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3 text-purple-600" />
                      <span className="text-purple-700">{competitor.geographic_presence}</span>
                    </div>
                  </td>
                  
                  <td className="px-4 py-3 text-sm border-r border-gray-200">
                    <Badge className={`text-xs ${getThreatLevelColor(competitor.competitive_threat_level)}`}>
                      {competitor.competitive_threat_level}
                    </Badge>
                  </td>
                  
                  <td className="px-4 py-3 text-sm border-r border-gray-200">
                    <div className="space-y-1">
                      {competitor.founder_linkedin_urls && competitor.founder_linkedin_urls.length > 0 ? (
                        competitor.founder_linkedin_urls.slice(0, 2).map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Founder {idx + 1}
                          </a>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">Not available</span>
                      )}
                      {competitor.founder_linkedin_urls && competitor.founder_linkedin_urls.length > 2 && (
                        <div className="text-xs text-gray-500">+{competitor.founder_linkedin_urls.length - 2} more</div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-4 py-3 text-sm">
                    <div className="text-gray-700 text-xs">
                      {competitor.recent_developments}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Market Trends & Gaps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-white rounded-lg border border-green-200 shadow-sm">
            <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Key Market Trends
            </h4>
            <div className="space-y-2">
              {data.key_market_trends.map((trend, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-green-700">{trend}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-4 bg-white rounded-lg border border-orange-200 shadow-sm">
            <h4 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Market Gaps Identified
            </h4>
            <div className="space-y-2">
              {data.market_gaps_identified.map((gap, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-orange-700">{gap}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Data Quality & Sources */}
        {(sources || dataQuality || analysisConfidence) && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-bold text-gray-800 mb-3">Analysis Quality & Sources</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysisConfidence && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analysisConfidence}/10</div>
                  <div className="text-sm text-gray-600">Analysis Confidence</div>
                </div>
              )}
              {dataQuality && (
                <div className="text-center">
                  <div className="text-sm text-gray-700">{dataQuality}</div>
                  <div className="text-sm text-gray-600">Data Quality</div>
                </div>
              )}
              {sources && sources.length > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{sources.length}</div>
                  <div className="text-sm text-gray-600">Sources</div>
                </div>
              )}
            </div>
            
            {sources && sources.length > 0 && (
              <div className="mt-4">
                <h5 className="font-semibold text-gray-800 mb-2">References:</h5>
                <div className="space-y-1">
                  {sources.map((source, index) => (
                    <a
                      key={index}
                      href={source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {source}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
