interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
  metadata?: {
    type?: 'question' | 'response' | 'memo_generation';
    confidence?: number;
    topic?: string;
  };
}

interface MemoData {
  company_name: string;
  business_model: string;
  market_opportunity: string;
  team_strength: string;
  financial_metrics: string;
  risks: string;
  recommendation: string;
  investment_amount?: string;
  valuation?: string;
}

class AIChatService {
  private conversationHistory: ChatMessage[] = [];
  private memoData: Partial<MemoData> = {};
  private isGeneratingMemo = false;

  // AI Interview Questions
  private interviewQuestions = [
    "Welcome! I'm your AI interviewer. Let's start with your company overview. Can you tell me about your startup and what problem you're solving?",
    "That's interesting! What's your business model and how do you plan to generate revenue?",
    "Great! What's the size of your target market and how do you plan to capture market share?",
    "Excellent! Can you tell me about your founding team and their relevant experience?",
    "Impressive! What are your key financial metrics and growth projections?",
    "Thank you! What do you see as the main risks and challenges for your business?",
    "Perfect! Based on our conversation, I have enough information to generate an investment memo. Would you like me to create one now?"
  ];

  private currentQuestionIndex = 0;

  async sendMessage(message: string): Promise<ChatMessage> {
    // Add user message to history
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      content: message,
      timestamp: new Date(),
      metadata: {
        type: 'response',
        topic: this.getCurrentTopic()
      }
    };
    this.conversationHistory.push(userMessage);

    // Process user response and extract information
    this.extractInformationFromResponse(message);

    // Generate AI response
    const aiResponse = await this.generateAIResponse(message);
    
    const aiMessage: ChatMessage = {
      id: `msg_${Date.now() + 1}`,
      sender: 'ai',
      content: aiResponse.content,
      timestamp: new Date(),
      metadata: {
        type: aiResponse.type,
        confidence: aiResponse.confidence,
        topic: this.getCurrentTopic()
      }
    };
    this.conversationHistory.push(aiMessage);

    return aiMessage;
  }

  private extractInformationFromResponse(message: string): void {
    const lowerMessage = message.toLowerCase();
    
    // Extract company information
    if (this.currentQuestionIndex === 0) {
      this.memoData.company_name = this.extractCompanyName(message);
    }
    
    // Extract business model
    if (this.currentQuestionIndex === 1) {
      this.memoData.business_model = message;
    }
    
    // Extract market opportunity
    if (this.currentQuestionIndex === 2) {
      this.memoData.market_opportunity = message;
    }
    
    // Extract team information
    if (this.currentQuestionIndex === 3) {
      this.memoData.team_strength = message;
    }
    
    // Extract financial metrics
    if (this.currentQuestionIndex === 4) {
      this.memoData.financial_metrics = message;
    }
    
    // Extract risks
    if (this.currentQuestionIndex === 5) {
      this.memoData.risks = message;
    }
  }

  private extractCompanyName(message: string): string {
    // Simple extraction - look for common patterns
    const patterns = [
      /(?:we are|our company is|we're)\s+([A-Z][a-zA-Z\s]+)/i,
      /([A-Z][a-zA-Z\s]+)\s+(?:is|are)\s+(?:a|an|the)/i,
      /(?:company|startup|business)\s+([A-Z][a-zA-Z\s]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return "Unknown Company";
  }

  private async generateAIResponse(userMessage: string): Promise<{content: string, type: 'question' | 'response' | 'memo_generation', confidence: number}> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    if (this.isGeneratingMemo) {
      return {
        content: "I'm analyzing your responses and generating a comprehensive investment memo. This will include market analysis, team assessment, financial projections, and investment recommendations.",
        type: 'memo_generation',
        confidence: 0.95
      };
    }

    // Check if we should generate memo
    if (this.currentQuestionIndex >= this.interviewQuestions.length - 1) {
      this.isGeneratingMemo = true;
      return {
        content: "Excellent! I have all the information I need. Let me generate a comprehensive investment memo based on our conversation.",
        type: 'memo_generation',
        confidence: 0.9
      };
    }

    // Generate contextual follow-up questions
    const contextualResponse = this.generateContextualResponse(userMessage);
    
    return {
      content: contextualResponse,
      type: 'question',
      confidence: 0.85
    };
  }

  private generateContextualResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    
    // Generate contextual follow-ups based on user response
    if (this.currentQuestionIndex === 0) {
      if (lowerMessage.includes('ai') || lowerMessage.includes('artificial intelligence')) {
        return "Fascinating! AI is a rapidly growing field. What specific AI technology are you using, and how does it differentiate you from competitors?";
      } else if (lowerMessage.includes('saas') || lowerMessage.includes('software')) {
        return "Great! SaaS businesses have excellent scalability potential. What's your customer acquisition strategy and how do you plan to reduce churn?";
      } else {
        return "Interesting! What's your business model and how do you plan to generate revenue?";
      }
    }
    
    if (this.currentQuestionIndex === 1) {
      if (lowerMessage.includes('subscription') || lowerMessage.includes('recurring')) {
        return "Excellent! Recurring revenue models are very attractive to investors. What's your customer lifetime value and how do you plan to increase it?";
      } else {
        return "Good approach! What's the size of your target market and how do you plan to capture market share?";
      }
    }
    
    if (this.currentQuestionIndex === 2) {
      return "Impressive market analysis! Can you tell me about your founding team and their relevant experience in this space?";
    }
    
    if (this.currentQuestionIndex === 3) {
      return "Strong team! What are your key financial metrics and growth projections for the next 3 years?";
    }
    
    if (this.currentQuestionIndex === 4) {
      return "Solid financial planning! What do you see as the main risks and challenges for your business?";
    }
    
    // Default to next question
    this.currentQuestionIndex++;
    return this.interviewQuestions[this.currentQuestionIndex];
  }

  private getCurrentTopic(): string {
    const topics = [
      'Company Overview',
      'Business Model',
      'Market Opportunity',
      'Team',
      'Financials',
      'Risks',
      'Memo Generation'
    ];
    return topics[Math.min(this.currentQuestionIndex, topics.length - 1)];
  }

  async generateMemo(): Promise<MemoData> {
    // Simulate memo generation delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Analyze the actual conversation history
    const analysis = this.analyzeConversation();
    
    const memo: MemoData = {
      company_name: analysis.companyName || "Unknown Company",
      business_model: analysis.businessModel || "Not specified",
      market_opportunity: analysis.marketOpportunity || "Not specified",
      team_strength: analysis.teamStrength || "Not specified",
      financial_metrics: analysis.financialMetrics || "Not specified",
      risks: analysis.risks || "Not specified",
      recommendation: this.generateRecommendationFromAnalysis(analysis),
      investment_amount: this.calculateInvestmentAmountFromAnalysis(analysis),
      valuation: this.calculateValuationFromAnalysis(analysis)
    };

    return memo;
  }

  private analyzeConversation(): {
    companyName: string;
    businessModel: string;
    marketOpportunity: string;
    teamStrength: string;
    financialMetrics: string;
    risks: string;
    confidence: number;
    keyInsights: string[];
  } {
    const userMessages = this.conversationHistory.filter(msg => msg.sender === 'user');
    const allText = userMessages.map(msg => msg.content).join(' ').toLowerCase();
    
    // Extract company name from conversation
    const companyName = this.extractCompanyNameFromConversation(userMessages);
    
    // Extract business model
    const businessModel = this.extractBusinessModel(userMessages);
    
    // Extract market opportunity
    const marketOpportunity = this.extractMarketOpportunity(userMessages);
    
    // Extract team information
    const teamStrength = this.extractTeamStrength(userMessages);
    
    // Extract financial metrics
    const financialMetrics = this.extractFinancialMetrics(userMessages);
    
    // Extract risks
    const risks = this.extractRisks(userMessages);
    
    // Calculate confidence based on data completeness
    const confidence = this.calculateConfidence({
      companyName, businessModel, marketOpportunity, teamStrength, financialMetrics, risks
    });
    
    // Generate key insights
    const keyInsights = this.generateKeyInsights(allText);
    
    return {
      companyName,
      businessModel,
      marketOpportunity,
      teamStrength,
      financialMetrics,
      risks,
      confidence,
      keyInsights
    };
  }

  private extractCompanyNameFromConversation(messages: ChatMessage[]): string {
    for (const message of messages) {
      const content = message.content;
      const patterns = [
        /(?:we are|our company is|we're)\s+([A-Z][a-zA-Z\s]+)/i,
        /([A-Z][a-zA-Z\s]+)\s+(?:is|are)\s+(?:a|an|the)/i,
        /(?:company|startup|business)\s+([A-Z][a-zA-Z\s]+)/i,
        /(?:called|named)\s+([A-Z][a-zA-Z\s]+)/i
      ];
      
      for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match && match[1].length > 2) {
          return match[1].trim();
        }
      }
    }
    return "Unknown Company";
  }

  private extractBusinessModel(messages: ChatMessage[]): string {
    const businessModelKeywords = ['business model', 'revenue', 'monetize', 'pricing', 'subscription', 'saas', 'b2b', 'b2c'];
    
    for (const message of messages) {
      const content = message.content.toLowerCase();
      if (businessModelKeywords.some(keyword => content.includes(keyword))) {
        return message.content;
      }
    }
    return "Not specified";
  }

  private extractMarketOpportunity(messages: ChatMessage[]): string {
    const marketKeywords = ['market', 'opportunity', 'size', 'billion', 'million', 'customers', 'users', 'target'];
    
    for (const message of messages) {
      const content = message.content.toLowerCase();
      if (marketKeywords.some(keyword => content.includes(keyword))) {
        return message.content;
      }
    }
    return "Not specified";
  }

  private extractTeamStrength(messages: ChatMessage[]): string {
    const teamKeywords = ['team', 'founder', 'co-founder', 'experience', 'background', 'education', 'previous'];
    
    for (const message of messages) {
      const content = message.content.toLowerCase();
      if (teamKeywords.some(keyword => content.includes(keyword))) {
        return message.content;
      }
    }
    return "Not specified";
  }

  private extractFinancialMetrics(messages: ChatMessage[]): string {
    const financialKeywords = ['revenue', 'profit', 'growth', 'metrics', 'kpi', 'financial', 'funding', 'investment'];
    
    for (const message of messages) {
      const content = message.content.toLowerCase();
      if (financialKeywords.some(keyword => content.includes(keyword))) {
        return message.content;
      }
    }
    return "Not specified";
  }

  private extractRisks(messages: ChatMessage[]): string {
    const riskKeywords = ['risk', 'challenge', 'difficult', 'problem', 'concern', 'threat', 'competition'];
    
    for (const message of messages) {
      const content = message.content.toLowerCase();
      if (riskKeywords.some(keyword => content.includes(keyword))) {
        return message.content;
      }
    }
    return "Not specified";
  }

  private calculateConfidence(data: any): number {
    let score = 0;
    const fields = ['companyName', 'businessModel', 'marketOpportunity', 'teamStrength', 'financialMetrics', 'risks'];
    
    fields.forEach(field => {
      if (data[field] && data[field] !== "Not specified" && data[field].length > 20) {
        score += 1/fields.length;
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
    
    return insights.length > 0 ? insights : ["Standard startup opportunity"];
  }

  private generateRecommendationFromAnalysis(analysis: any): string {
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

  private calculateInvestmentAmountFromAnalysis(analysis: any): string {
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

  private calculateValuationFromAnalysis(analysis: any): string {
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

  getConversationHistory(): ChatMessage[] {
    return this.conversationHistory;
  }

  resetConversation(): void {
    this.conversationHistory = [];
    this.memoData = {};
    this.currentQuestionIndex = 0;
    this.isGeneratingMemo = false;
  }
}

export const aiChatService = new AIChatService();
export type { ChatMessage, MemoData };
