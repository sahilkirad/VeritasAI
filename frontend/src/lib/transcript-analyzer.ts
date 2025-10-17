interface TranscriptSegment {
  text: string;
  speaker: string;
  timestamp: number;
  is_final: boolean;
}

interface TranscriptAnalysis {
  companyName: string;
  businessModel: string;
  marketOpportunity: string;
  teamStrength: string;
  financialMetrics: string;
  risks: string;
  confidence: number;
  keyInsights: string[];
  speakerAnalysis: {
    founder: string[];
    investor: string[];
    ai: string[];
  };
}

export class TranscriptAnalyzer {
  private transcript: TranscriptSegment[] = [];

  constructor(transcript: TranscriptSegment[]) {
    this.transcript = transcript;
  }

  analyzeTranscript(): TranscriptAnalysis {
    // Filter by speaker and extract relevant information
    const founderMessages = this.transcript
      .filter(segment => segment.speaker.toLowerCase().includes('founder'))
      .map(segment => segment.text);

    const investorMessages = this.transcript
      .filter(segment => segment.speaker.toLowerCase().includes('investor'))
      .map(segment => segment.text);

    const aiMessages = this.transcript
      .filter(segment => segment.speaker.toLowerCase().includes('ai'))
      .map(segment => segment.text);

    // Combine all text for analysis
    const allText = this.transcript.map(segment => segment.text).join(' ').toLowerCase();
    const founderText = founderMessages.join(' ').toLowerCase();

    return {
      companyName: this.extractCompanyName(founderMessages),
      businessModel: this.extractBusinessModel(founderMessages),
      marketOpportunity: this.extractMarketOpportunity(founderMessages),
      teamStrength: this.extractTeamStrength(founderMessages),
      financialMetrics: this.extractFinancialMetrics(founderMessages),
      risks: this.extractRisks(founderMessages),
      confidence: this.calculateConfidence(founderText),
      keyInsights: this.generateKeyInsights(allText),
      speakerAnalysis: {
        founder: founderMessages,
        investor: investorMessages,
        ai: aiMessages
      }
    };
  }

  private extractCompanyName(messages: string[]): string {
    for (const message of messages) {
      const patterns = [
        /(?:we are|our company is|we're)\s+([A-Z][a-zA-Z\s]+)/i,
        /([A-Z][a-zA-Z\s]+)\s+(?:is|are)\s+(?:a|an|the)/i,
        /(?:company|startup|business)\s+([A-Z][a-zA-Z\s]+)/i,
        /(?:called|named)\s+([A-Z][a-zA-Z\s]+)/i
      ];
      
      for (const pattern of patterns) {
        const match = message.match(pattern);
        if (match && match[1].length > 2) {
          return match[1].trim();
        }
      }
    }
    return "Unknown Company";
  }

  private extractBusinessModel(messages: string[]): string {
    const businessModelKeywords = ['business model', 'revenue', 'monetize', 'pricing', 'subscription', 'saas', 'b2b', 'b2c'];
    
    for (const message of messages) {
      const content = message.toLowerCase();
      if (businessModelKeywords.some(keyword => content.includes(keyword))) {
        return message;
      }
    }
    return "Not specified";
  }

  private extractMarketOpportunity(messages: string[]): string {
    const marketKeywords = ['market', 'opportunity', 'size', 'billion', 'million', 'customers', 'users', 'target'];
    
    for (const message of messages) {
      const content = message.toLowerCase();
      if (marketKeywords.some(keyword => content.includes(keyword))) {
        return message;
      }
    }
    return "Not specified";
  }

  private extractTeamStrength(messages: string[]): string {
    const teamKeywords = ['team', 'founder', 'co-founder', 'experience', 'background', 'education', 'previous'];
    
    for (const message of messages) {
      const content = message.toLowerCase();
      if (teamKeywords.some(keyword => content.includes(keyword))) {
        return message;
      }
    }
    return "Not specified";
  }

  private extractFinancialMetrics(messages: string[]): string {
    const financialKeywords = ['revenue', 'profit', 'growth', 'metrics', 'kpi', 'financial', 'funding', 'investment'];
    
    for (const message of messages) {
      const content = message.toLowerCase();
      if (financialKeywords.some(keyword => content.includes(keyword))) {
        return message;
      }
    }
    return "Not specified";
  }

  private extractRisks(messages: string[]): string {
    const riskKeywords = ['risk', 'challenge', 'difficult', 'problem', 'concern', 'threat', 'competition'];
    
    for (const message of messages) {
      const content = message.toLowerCase();
      if (riskKeywords.some(keyword => content.includes(keyword))) {
        return message;
      }
    }
    return "Not specified";
  }

  private calculateConfidence(founderText: string): number {
    let score = 0;
    const requiredElements = [
      'company', 'business', 'market', 'team', 'revenue', 'growth'
    ];
    
    requiredElements.forEach(element => {
      if (founderText.includes(element)) {
        score += 1/requiredElements.length;
      }
    });
    
    return Math.min(score, 1.0);
  }

  private generateKeyInsights(allText: string): string[] {
    const insights = [];
    
    if (allText.includes('saas') || allText.includes('subscription')) {
      insights.push("SaaS business model with recurring revenue potential");
    }
    if (allText.includes('ai') || allText.includes('artificial intelligence')) {
      insights.push("AI-powered solution with technology differentiation");
    }
    if (allText.includes('billion')) {
      insights.push("Large market opportunity identified");
    }
    if (allText.includes('experience') || allText.includes('expertise')) {
      insights.push("Experienced founding team");
    }
    if (allText.includes('revenue') || allText.includes('growth')) {
      insights.push("Strong financial metrics and growth potential");
    }
    if (allText.includes('competition') || allText.includes('competitive')) {
      insights.push("Competitive landscape considerations");
    }
    
    return insights.length > 0 ? insights : ["Standard startup opportunity"];
  }

  generateInvestmentMemo(analysis: TranscriptAnalysis): {
    company_name: string;
    business_model: string;
    market_opportunity: string;
    team_strength: string;
    financial_metrics: string;
    risks: string;
    recommendation: string;
    investment_amount: string;
    valuation: string;
    confidence_score: number;
    key_insights: string[];
  } {
    const recommendation = this.generateRecommendation(analysis);
    const investmentAmount = this.calculateInvestmentAmount(analysis);
    const valuation = this.calculateValuation(analysis);

    return {
      company_name: analysis.companyName,
      business_model: analysis.businessModel,
      market_opportunity: analysis.marketOpportunity,
      team_strength: analysis.teamStrength,
      financial_metrics: analysis.financialMetrics,
      risks: analysis.risks,
      recommendation,
      investment_amount: investmentAmount,
      valuation,
      confidence_score: analysis.confidence,
      key_insights: analysis.keyInsights
    };
  }

  private generateRecommendation(analysis: TranscriptAnalysis): string {
    const hasStrongTeam = analysis.teamStrength?.toLowerCase().includes('experience') || 
                         analysis.teamStrength?.toLowerCase().includes('expertise');
    const hasClearModel = analysis.businessModel?.length > 50;
    const hasMarketSize = analysis.marketOpportunity?.toLowerCase().includes('billion') ||
                         analysis.marketOpportunity?.toLowerCase().includes('million');
    const hasFinancials = analysis.financialMetrics?.toLowerCase().includes('revenue') ||
                         analysis.financialMetrics?.toLowerCase().includes('growth');

    if (hasStrongTeam && hasClearModel && hasMarketSize && hasFinancials) {
      return "STRONG BUY - Excellent team, clear business model, large market opportunity, and strong financial metrics. Recommended investment amount: $500K - $2M";
    } else if ((hasStrongTeam && hasClearModel) || (hasMarketSize && hasFinancials)) {
      return "BUY - Promising opportunity with strong fundamentals. Recommended investment amount: $250K - $1M";
    } else if (hasStrongTeam || hasClearModel || hasMarketSize) {
      return "HOLD - Potential opportunity with some areas for improvement. Recommended investment amount: $100K - $500K";
    } else {
      return "PASS - Insufficient information or weak fundamentals. Consider follow-up in 6 months.";
    }
  }

  private calculateInvestmentAmount(analysis: TranscriptAnalysis): string {
    const hasStrongMetrics = analysis.financialMetrics?.toLowerCase().includes('revenue') ||
                            analysis.financialMetrics?.toLowerCase().includes('growth');
    const hasLargeMarket = analysis.marketOpportunity?.toLowerCase().includes('billion');
    const hasStrongTeam = analysis.teamStrength?.toLowerCase().includes('experience');
    
    if (hasStrongMetrics && hasLargeMarket && hasStrongTeam) {
      return "$1M - $2M";
    } else if (hasStrongMetrics || hasLargeMarket) {
      return "$500K - $1M";
    } else {
      return "$100K - $500K";
    }
  }

  private calculateValuation(analysis: TranscriptAnalysis): string {
    const hasStrongMetrics = analysis.financialMetrics?.toLowerCase().includes('revenue') ||
                            analysis.financialMetrics?.toLowerCase().includes('growth');
    const hasLargeMarket = analysis.marketOpportunity?.toLowerCase().includes('billion');
    const hasStrongTeam = analysis.teamStrength?.toLowerCase().includes('experience');
    
    if (hasStrongMetrics && hasLargeMarket && hasStrongTeam) {
      return "$5M - $10M";
    } else if (hasStrongMetrics || hasLargeMarket) {
      return "$2M - $5M";
    } else {
      return "$500K - $2M";
    }
  }
}

export type { TranscriptSegment, TranscriptAnalysis };
