import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationData, companyInfo } = body;

    if (!conversationData || !Array.isArray(conversationData)) {
      return NextResponse.json(
        { error: 'Invalid conversation data' },
        { status: 400 }
      );
    }

    // Simulate AI analysis and memo generation
    const memo = await generateInvestmentMemo(conversationData, companyInfo);

    return NextResponse.json({
      success: true,
      memo,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating memo:', error);
    return NextResponse.json(
      { error: 'Failed to generate memo' },
      { status: 500 }
    );
  }
}

async function generateInvestmentMemo(conversationData: any[], companyInfo: any) {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Extract key information from conversation
  const extractedInfo = extractKeyInformation(conversationData);
  
  // Generate memo sections
  const memo = {
    company_name: companyInfo?.name || extractedInfo.companyName || "Unknown Company",
    business_model: extractedInfo.businessModel || "Not specified",
    market_opportunity: extractedInfo.marketOpportunity || "Not specified",
    team_strength: extractedInfo.teamStrength || "Not specified",
    financial_metrics: extractedInfo.financialMetrics || "Not specified",
    risks: extractedInfo.risks || "Not specified",
    recommendation: generateRecommendation(extractedInfo),
    investment_amount: calculateInvestmentAmount(extractedInfo),
    valuation: calculateValuation(extractedInfo),
    confidence_score: calculateConfidenceScore(extractedInfo),
    key_insights: generateKeyInsights(extractedInfo),
    next_steps: generateNextSteps(extractedInfo)
  };

  return memo;
}

function extractKeyInformation(conversationData: any[]) {
  const info = {
    companyName: "",
    businessModel: "",
    marketOpportunity: "",
    teamStrength: "",
    financialMetrics: "",
    risks: ""
  };

  // Simple extraction logic
  conversationData.forEach((message: any) => {
    if (message.sender === 'user') {
      const content = message.content.toLowerCase();
      
      if (content.includes('company') || content.includes('startup')) {
        info.companyName = extractCompanyName(message.content);
      }
      if (content.includes('business model') || content.includes('revenue')) {
        info.businessModel = message.content;
      }
      if (content.includes('market') || content.includes('opportunity')) {
        info.marketOpportunity = message.content;
      }
      if (content.includes('team') || content.includes('founder')) {
        info.teamStrength = message.content;
      }
      if (content.includes('financial') || content.includes('metrics') || content.includes('revenue')) {
        info.financialMetrics = message.content;
      }
      if (content.includes('risk') || content.includes('challenge')) {
        info.risks = message.content;
      }
    }
  });

  return info;
}

function extractCompanyName(content: string): string {
  // Simple pattern matching
  const patterns = [
    /(?:we are|our company is|we're)\s+([A-Z][a-zA-Z\s]+)/i,
    /([A-Z][a-zA-Z\s]+)\s+(?:is|are)\s+(?:a|an|the)/i,
    /(?:company|startup|business)\s+([A-Z][a-zA-Z\s]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  return "Unknown Company";
}

function generateRecommendation(info: any): string {
  const hasStrongTeam = info.teamStrength?.length > 50;
  const hasClearModel = info.businessModel?.length > 50;
  const hasMarketSize = info.marketOpportunity?.toLowerCase().includes('billion') ||
                       info.marketOpportunity?.toLowerCase().includes('million');

  if (hasStrongTeam && hasClearModel && hasMarketSize) {
    return "STRONG BUY - Excellent team, clear business model, and large market opportunity. Recommended investment amount: $500K - $2M";
  } else if (hasStrongTeam || hasClearModel) {
    return "BUY - Promising opportunity with some areas for improvement. Recommended investment amount: $250K - $1M";
  } else {
    return "HOLD - Needs more development in key areas. Consider follow-up in 6 months. Recommended investment amount: $100K - $500K";
  }
}

function calculateInvestmentAmount(info: any): string {
  const hasStrongMetrics = info.financialMetrics?.toLowerCase().includes('revenue') ||
                          info.financialMetrics?.toLowerCase().includes('growth');
  
  if (hasStrongMetrics) {
    return "$1M - $2M";
  } else {
    return "$250K - $1M";
  }
}

function calculateValuation(info: any): string {
  const hasStrongMetrics = info.financialMetrics?.toLowerCase().includes('revenue') ||
                          info.financialMetrics?.toLowerCase().includes('growth');
  
  if (hasStrongMetrics) {
    return "$5M - $10M";
  } else {
    return "$2M - $5M";
  }
}

function calculateConfidenceScore(info: any): number {
  let score = 0;
  
  if (info.companyName && info.companyName !== "Unknown Company") score += 0.2;
  if (info.businessModel && info.businessModel.length > 50) score += 0.2;
  if (info.marketOpportunity && info.marketOpportunity.length > 50) score += 0.2;
  if (info.teamStrength && info.teamStrength.length > 50) score += 0.2;
  if (info.financialMetrics && info.financialMetrics.length > 50) score += 0.2;
  
  return Math.min(score, 1.0);
}

function generateKeyInsights(info: any): string[] {
  const insights = [];
  
  if (info.businessModel?.toLowerCase().includes('saas')) {
    insights.push("SaaS business model with recurring revenue potential");
  }
  if (info.marketOpportunity?.toLowerCase().includes('billion')) {
    insights.push("Large market opportunity identified");
  }
  if (info.teamStrength?.toLowerCase().includes('experience')) {
    insights.push("Experienced founding team");
  }
  
  return insights.length > 0 ? insights : ["Standard startup opportunity"];
}

function generateNextSteps(info: any): string[] {
  return [
    "Schedule follow-up meeting with founding team",
    "Conduct technical due diligence",
    "Review financial projections in detail",
    "Assess competitive landscape",
    "Prepare term sheet if interested"
  ];
}
