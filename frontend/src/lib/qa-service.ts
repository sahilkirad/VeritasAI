interface QAQuestion {
  question: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  expectedAnswer: string;
}

interface QAAnalysis {
  gaps: string[];
  questions: QAQuestion[];
  confidence: number;
  recommendations: string[];
}

export class QAService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL || 
                   'http://127.0.0.1:5001/veritas-472301/asia-south1';
  }

  async generateQuestions(memoData: any, transcriptData: any[]): Promise<QAQuestion[]> {
    try {
      const response = await fetch(`${this.baseUrl}/generate_questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer bypass-token',
        },
        body: JSON.stringify({
          memo_data: memoData,
          transcript_data: transcriptData,
          analysis_type: 'gap_analysis'
        }),
      });

      if (!response.ok) {
        throw new Error(`QA service error: ${response.status}`);
      }

      const result = await response.json();
      return result.questions || [];
    } catch (error) {
      console.error('Error generating QA questions:', error);
      // Fallback to local question generation
      return this.generateFallbackQuestions(memoData);
    }
  }

  private generateFallbackQuestions(memoData: any): QAQuestion[] {
    const questions: QAQuestion[] = [];

    // Analyze memo data for gaps
    if (!memoData.business_model || memoData.business_model === "Not specified") {
      questions.push({
        question: "Can you explain your business model and revenue streams in more detail?",
        priority: 'high',
        category: 'business_model',
        expectedAnswer: 'Revenue model explanation'
      });
    }

    if (!memoData.financial_metrics || memoData.financial_metrics === "Not specified") {
      questions.push({
        question: "What are your key financial metrics like CAC, LTV, and burn rate?",
        priority: 'high',
        category: 'financials',
        expectedAnswer: 'Financial metrics'
      });
    }

    if (!memoData.market_opportunity || memoData.market_opportunity === "Not specified") {
      questions.push({
        question: "What's the size of your target market and how do you plan to capture it?",
        priority: 'high',
        category: 'market',
        expectedAnswer: 'Market analysis'
      });
    }

    if (!memoData.team_strength || memoData.team_strength === "Not specified") {
      questions.push({
        question: "Can you tell me more about your founding team's experience and background?",
        priority: 'medium',
        category: 'team',
        expectedAnswer: 'Team information'
      });
    }

    if (!memoData.risks || memoData.risks === "Not specified") {
      questions.push({
        question: "What are the main risks and challenges for your business?",
        priority: 'medium',
        category: 'risks',
        expectedAnswer: 'Risk assessment'
      });
    }

    return questions;
  }

  async analyzeGaps(memoData: any, transcriptData: any[]): Promise<QAAnalysis> {
    try {
      const response = await fetch(`${this.baseUrl}/analyze_gaps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer bypass-token',
        },
        body: JSON.stringify({
          memo_data: memoData,
          transcript_data: transcriptData
        }),
      });

      if (!response.ok) {
        throw new Error(`Gap analysis error: ${response.status}`);
      }

      const result = await response.json();
      return result.analysis || this.createFallbackAnalysis(memoData);
    } catch (error) {
      console.error('Error analyzing gaps:', error);
      return this.createFallbackAnalysis(memoData);
    }
  }

  private createFallbackAnalysis(memoData: any): QAAnalysis {
    const gaps: string[] = [];
    const questions: QAQuestion[] = [];
    let confidence = 1.0;

    // Check for missing information
    if (!memoData.business_model || memoData.business_model === "Not specified") {
      gaps.push("Business model not clearly defined");
      questions.push({
        question: "Can you explain your business model and how you generate revenue?",
        priority: 'high',
        category: 'business_model',
        expectedAnswer: 'Business model explanation'
      });
      confidence -= 0.2;
    }

    if (!memoData.financial_metrics || memoData.financial_metrics === "Not specified") {
      gaps.push("Financial metrics missing");
      questions.push({
        question: "What are your key financial metrics and growth projections?",
        priority: 'high',
        category: 'financials',
        expectedAnswer: 'Financial metrics'
      });
      confidence -= 0.2;
    }

    if (!memoData.market_opportunity || memoData.market_opportunity === "Not specified") {
      gaps.push("Market opportunity not quantified");
      questions.push({
        question: "What's the size of your target market and your go-to-market strategy?",
        priority: 'high',
        category: 'market',
        expectedAnswer: 'Market analysis'
      });
      confidence -= 0.2;
    }

    if (!memoData.team_strength || memoData.team_strength === "Not specified") {
      gaps.push("Team information incomplete");
      questions.push({
        question: "Can you tell me about your founding team's experience and expertise?",
        priority: 'medium',
        category: 'team',
        expectedAnswer: 'Team background'
      });
      confidence -= 0.1;
    }

    if (!memoData.risks || memoData.risks === "Not specified") {
      gaps.push("Risk assessment missing");
      questions.push({
        question: "What are the main risks and challenges for your business?",
        priority: 'medium',
        category: 'risks',
        expectedAnswer: 'Risk analysis'
      });
      confidence -= 0.1;
    }

    const recommendations = this.generateRecommendations(gaps, confidence);

    return {
      gaps,
      questions,
      confidence: Math.max(confidence, 0.1),
      recommendations
    };
  }

  private generateRecommendations(gaps: string[], confidence: number): string[] {
    const recommendations: string[] = [];

    if (confidence < 0.5) {
      recommendations.push("Schedule follow-up interview to gather missing information");
    }

    if (gaps.includes("Business model not clearly defined")) {
      recommendations.push("Request detailed business model documentation");
    }

    if (gaps.includes("Financial metrics missing")) {
      recommendations.push("Request financial statements and projections");
    }

    if (gaps.includes("Market opportunity not quantified")) {
      recommendations.push("Request market research and competitive analysis");
    }

    if (gaps.includes("Team information incomplete")) {
      recommendations.push("Request team resumes and organizational chart");
    }

    if (gaps.includes("Risk assessment missing")) {
      recommendations.push("Request risk assessment and mitigation strategies");
    }

    return recommendations;
  }

  async generateMemo2(memoData: any, qaAnalysis: QAAnalysis, additionalResponses: any[]): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/generate_memo_2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer bypass-token',
        },
        body: JSON.stringify({
          original_memo: memoData,
          qa_analysis: qaAnalysis,
          additional_responses: additionalResponses
        }),
      });

      if (!response.ok) {
        throw new Error(`Memo2 generation error: ${response.status}`);
      }

      const result = await response.json();
      return result.memo2 || this.createFallbackMemo2(memoData, qaAnalysis);
    } catch (error) {
      console.error('Error generating memo2:', error);
      return this.createFallbackMemo2(memoData, qaAnalysis);
    }
  }

  private createFallbackMemo2(memoData: any, qaAnalysis: QAAnalysis): any {
    return {
      ...memoData,
      memo_type: 'memo2',
      qa_analysis: qaAnalysis,
      additional_insights: qaAnalysis.recommendations,
      confidence_score: qaAnalysis.confidence,
      gaps_identified: qaAnalysis.gaps,
      follow_up_required: qaAnalysis.confidence < 0.7,
      generated_at: new Date().toISOString()
    };
  }
}

export const qaService = new QAService();
export type { QAQuestion, QAAnalysis };
