interface InterviewQuestion {
  id: string;
  category: 'company_overview' | 'business_model' | 'market_opportunity' | 'team' | 'financials' | 'risks' | 'competition';
  question: string;
  followUpQuestions: string[];
  expectedKeywords: string[];
  importance: 'high' | 'medium' | 'low';
}

interface InterviewResponse {
  questionId: string;
  response: string;
  keywords: string[];
  confidence: number;
  gaps: string[];
  followUpNeeded: boolean;
}

interface InterviewAnalysis {
  companyName: string;
  businessModel: string;
  marketOpportunity: string;
  teamStrength: string;
  financialMetrics: string;
  risks: string;
  competition: string;
  gaps: string[];
  overallScore: number;
  recommendation: string;
}

export class AIInterviewer {
  private questions: InterviewQuestion[] = [];
  private responses: InterviewResponse[] = [];
  private currentQuestionIndex: number = 0;
  private isActive: boolean = false;

  constructor() {
    this.initializeQuestions();
  }

  private initializeQuestions() {
    this.questions = [
      {
        id: 'company_overview',
        category: 'company_overview',
        question: "Welcome! I'm your AI interviewer. Let's start with your company overview. Can you tell me about your startup and what problem you're solving?",
        followUpQuestions: [
          "What specific problem does your company solve?",
          "Who is your target customer?",
          "What makes your solution unique?"
        ],
        expectedKeywords: ['problem', 'solution', 'customer', 'unique', 'startup', 'company'],
        importance: 'high'
      },
      {
        id: 'business_model',
        category: 'business_model',
        question: "That's interesting! What's your business model and how do you plan to generate revenue?",
        followUpQuestions: [
          "How do you monetize your product or service?",
          "What are your pricing strategies?",
          "Do you have any recurring revenue streams?"
        ],
        expectedKeywords: ['revenue', 'monetize', 'pricing', 'subscription', 'saas', 'b2b', 'b2c', 'business model'],
        importance: 'high'
      },
      {
        id: 'market_opportunity',
        category: 'market_opportunity',
        question: "Great! What's the size of your target market and how do you plan to capture market share?",
        followUpQuestions: [
          "What's the total addressable market (TAM)?",
          "How do you plan to acquire customers?",
          "What's your go-to-market strategy?"
        ],
        expectedKeywords: ['market', 'size', 'tam', 'customers', 'acquisition', 'strategy', 'billion', 'million'],
        importance: 'high'
      },
      {
        id: 'team',
        category: 'team',
        question: "Excellent! Can you tell me about your founding team and their relevant experience?",
        followUpQuestions: [
          "What's your team's background and expertise?",
          "Do you have any advisors or mentors?",
          "What roles are you looking to fill?"
        ],
        expectedKeywords: ['team', 'founder', 'experience', 'background', 'expertise', 'advisor', 'mentor'],
        importance: 'high'
      },
      {
        id: 'financials',
        category: 'financials',
        question: "Impressive! What are your key financial metrics and growth projections?",
        followUpQuestions: [
          "What's your current revenue and growth rate?",
          "What are your key performance indicators (KPIs)?",
          "What's your burn rate and runway?"
        ],
        expectedKeywords: ['revenue', 'growth', 'kpi', 'metrics', 'burn rate', 'runway', 'financial', 'projections'],
        importance: 'high'
      },
      {
        id: 'risks',
        category: 'risks',
        question: "Thank you! What do you see as the main risks and challenges for your business?",
        followUpQuestions: [
          "What are your biggest operational challenges?",
          "How do you plan to mitigate these risks?",
          "What keeps you up at night?"
        ],
        expectedKeywords: ['risk', 'challenge', 'problem', 'threat', 'mitigate', 'operational'],
        importance: 'medium'
      },
      {
        id: 'competition',
        category: 'competition',
        question: "Good point! Who are your main competitors and how do you differentiate from them?",
        followUpQuestions: [
          "What's your competitive advantage?",
          "How do you plan to defend your market position?",
          "What barriers to entry exist in your market?"
        ],
        expectedKeywords: ['competitor', 'competitive', 'advantage', 'differentiate', 'barrier', 'defend'],
        importance: 'medium'
      }
    ];
  }

  startInterview(): string {
    this.isActive = true;
    this.currentQuestionIndex = 0;
    return this.questions[0].question;
  }

  getCurrentQuestion(): string {
    if (!this.isActive || this.currentQuestionIndex >= this.questions.length) {
      return "Interview complete. Thank you for your time!";
    }
    return this.questions[this.currentQuestionIndex].question;
  }

  processResponse(response: string): {
    nextQuestion: string;
    isComplete: boolean;
    analysis: InterviewResponse;
  } {
    if (!this.isActive) {
      return {
        nextQuestion: "Interview not active",
        isComplete: true,
        analysis: this.createEmptyResponse()
      };
    }

    const currentQuestion = this.questions[this.currentQuestionIndex];
    const analysis = this.analyzeResponse(response, currentQuestion);
    
    this.responses.push(analysis);

    // Check if we need follow-up questions
    if (analysis.followUpNeeded && this.currentQuestionIndex < this.questions.length - 1) {
      // Ask follow-up question
      const followUpQuestion = this.getFollowUpQuestion(currentQuestion, analysis);
      return {
        nextQuestion: followUpQuestion,
        isComplete: false,
        analysis
      };
    }

    // Move to next question
    this.currentQuestionIndex++;
    
    if (this.currentQuestionIndex >= this.questions.length) {
      this.isActive = false;
      return {
        nextQuestion: "Interview complete! Thank you for your time. I'll now analyze your responses and generate an investment memo.",
        isComplete: true,
        analysis
      };
    }

    return {
      nextQuestion: this.questions[this.currentQuestionIndex].question,
      isComplete: false,
      analysis
    };
  }

  private analyzeResponse(response: string, question: InterviewQuestion): InterviewResponse {
    const responseLower = response.toLowerCase();
    const foundKeywords = question.expectedKeywords.filter(keyword => 
      responseLower.includes(keyword.toLowerCase())
    );
    
    const confidence = foundKeywords.length / question.expectedKeywords.length;
    const gaps = this.identifyGaps(response, question);
    const followUpNeeded = confidence < 0.5 || gaps.length > 0;

    return {
      questionId: question.id,
      response,
      keywords: foundKeywords,
      confidence,
      gaps,
      followUpNeeded
    };
  }

  private identifyGaps(response: string, question: InterviewQuestion): string[] {
    const gaps: string[] = [];
    const responseLower = response.toLowerCase();

    // Check for missing important keywords
    const missingKeywords = question.expectedKeywords.filter(keyword => 
      !responseLower.includes(keyword.toLowerCase())
    );

    if (missingKeywords.length > 0) {
      gaps.push(`Missing information about: ${missingKeywords.join(', ')}`);
    }

    // Check response length
    if (response.length < 50) {
      gaps.push("Response seems too brief, more detail needed");
    }

    // Check for specific gaps based on question category
    switch (question.category) {
      case 'business_model':
        if (!responseLower.includes('revenue') && !responseLower.includes('monetize')) {
          gaps.push("No clear revenue model mentioned");
        }
        break;
      case 'market_opportunity':
        if (!responseLower.includes('market') && !responseLower.includes('customer')) {
          gaps.push("No market size or customer information provided");
        }
        break;
      case 'team':
        if (!responseLower.includes('experience') && !responseLower.includes('background')) {
          gaps.push("No team experience or background mentioned");
        }
        break;
      case 'financials':
        if (!responseLower.includes('revenue') && !responseLower.includes('growth')) {
          gaps.push("No financial metrics or growth projections mentioned");
        }
        break;
    }

    return gaps;
  }

  private getFollowUpQuestion(question: InterviewQuestion, analysis: InterviewResponse): string {
    // Select appropriate follow-up question based on gaps
    if (analysis.gaps.length > 0) {
      const gap = analysis.gaps[0];
      if (gap.includes('revenue') || gap.includes('monetize')) {
        return "Can you elaborate on your revenue model and how you plan to monetize your product?";
      }
      if (gap.includes('market') || gap.includes('customer')) {
        return "Can you provide more details about your target market and customer base?";
      }
      if (gap.includes('experience') || gap.includes('background')) {
        return "Can you tell me more about your team's experience and background?";
      }
      if (gap.includes('financial') || gap.includes('growth')) {
        return "Can you share more about your financial metrics and growth projections?";
      }
    }

    // Default follow-up question
    return question.followUpQuestions[0];
  }

  private createEmptyResponse(): InterviewResponse {
    return {
      questionId: '',
      response: '',
      keywords: [],
      confidence: 0,
      gaps: [],
      followUpNeeded: false
    };
  }

  analyzeInterview(): InterviewAnalysis {
    const analysis: InterviewAnalysis = {
      companyName: this.extractCompanyName(),
      businessModel: this.extractBusinessModel(),
      marketOpportunity: this.extractMarketOpportunity(),
      teamStrength: this.extractTeamStrength(),
      financialMetrics: this.extractFinancialMetrics(),
      risks: this.extractRisks(),
      competition: this.extractCompetition(),
      gaps: this.identifyOverallGaps(),
      overallScore: this.calculateOverallScore(),
      recommendation: this.generateRecommendation()
    };

    return analysis;
  }

  private extractCompanyName(): string {
    const companyResponses = this.responses.filter(r => r.questionId === 'company_overview');
    if (companyResponses.length === 0) return "Unknown Company";
    
    const response = companyResponses[0].response;
    const patterns = [
      /(?:we are|our company is|we're)\s+([A-Z][a-zA-Z\s]+)/i,
      /([A-Z][a-zA-Z\s]+)\s+(?:is|are)\s+(?:a|an|the)/i,
      /(?:company|startup|business)\s+([A-Z][a-zA-Z\s]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = response.match(pattern);
      if (match && match[1].length > 2) {
        return match[1].trim();
      }
    }
    
    return "Unknown Company";
  }

  private extractBusinessModel(): string {
    const businessResponses = this.responses.filter(r => r.questionId === 'business_model');
    return businessResponses.length > 0 ? businessResponses[0].response : "Not specified";
  }

  private extractMarketOpportunity(): string {
    const marketResponses = this.responses.filter(r => r.questionId === 'market_opportunity');
    return marketResponses.length > 0 ? marketResponses[0].response : "Not specified";
  }

  private extractTeamStrength(): string {
    const teamResponses = this.responses.filter(r => r.questionId === 'team');
    return teamResponses.length > 0 ? teamResponses[0].response : "Not specified";
  }

  private extractFinancialMetrics(): string {
    const financialResponses = this.responses.filter(r => r.questionId === 'financials');
    return financialResponses.length > 0 ? financialResponses[0].response : "Not specified";
  }

  private extractRisks(): string {
    const riskResponses = this.responses.filter(r => r.questionId === 'risks');
    return riskResponses.length > 0 ? riskResponses[0].response : "Not specified";
  }

  private extractCompetition(): string {
    const competitionResponses = this.responses.filter(r => r.questionId === 'competition');
    return competitionResponses.length > 0 ? competitionResponses[0].response : "Not specified";
  }

  private identifyOverallGaps(): string[] {
    const gaps: string[] = [];
    
    this.responses.forEach(response => {
      if (response.confidence < 0.5) {
        gaps.push(`Low confidence in ${response.questionId} response`);
      }
      if (response.gaps.length > 0) {
        gaps.push(...response.gaps);
      }
    });

    return gaps;
  }

  private calculateOverallScore(): number {
    if (this.responses.length === 0) return 0;
    
    const totalConfidence = this.responses.reduce((sum, response) => sum + response.confidence, 0);
    return totalConfidence / this.responses.length;
  }

  private generateRecommendation(): string {
    const score = this.calculateOverallScore();
    const gaps = this.identifyOverallGaps();
    
    if (score >= 0.8 && gaps.length === 0) {
      return "STRONG BUY - Excellent responses with comprehensive information";
    } else if (score >= 0.6 && gaps.length <= 2) {
      return "BUY - Good responses with minor gaps";
    } else if (score >= 0.4) {
      return "HOLD - Moderate responses with some gaps";
    } else {
      return "PASS - Insufficient information or low confidence responses";
    }
  }

  getResponses(): InterviewResponse[] {
    return this.responses;
  }

  isInterviewActive(): boolean {
    return this.isActive;
  }

  getProgress(): number {
    return (this.currentQuestionIndex / this.questions.length) * 100;
  }
}

export type { InterviewQuestion, InterviewResponse, InterviewAnalysis };
