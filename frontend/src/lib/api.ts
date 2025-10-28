import { auth } from './firebase-new';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL || 'https://asia-south1-veritas-472301.cloudfunctions.net';
  }

  private async getAuthToken(): Promise<string> {
    // Skip Firebase authentication for now - using custom auth system
    // TODO: Implement proper authentication
    return 'bypass-token';
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async uploadFile(file: File, founderEmail?: string): Promise<ApiResponse> {
    try {
      // Use the existing on_file_upload HTTP endpoint
      console.log('Uploading file via HTTP endpoint:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('file_type', 'deck');
      formData.append('original_name', file.name);
      const email = founderEmail || 'unknown@example.com';
      formData.append('founder_email', email);
      
      // Make request to on_file_upload endpoint
      const response = await fetch(API_ENDPOINTS.ON_FILE_UPLOAD, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let browser set it with boundary for multipart/form-data
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${errorText}`);
      }
      
      const result = await response.json();
      console.log('File upload response:', result);
      
      return {
        success: true,
        data: {
          fileName: file.name,
          message: result.message || 'File uploaded successfully'
        }
      };
      
    } catch (error) {
      console.error('File upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  async triggerDiligence(memoId: string, gaPropertyId?: string, linkedinUrl?: string): Promise<ApiResponse> {
    return this.makeRequest('trigger_diligence', {
      method: 'POST',
      body: JSON.stringify({
        memo_1_id: memoId,
        ga_property_id: gaPropertyId,
        linkedin_url: linkedinUrl,
      }),
    });
  }

  async scheduleInterview(companyId: string, founderEmail: string, investorEmail: string, startupName: string): Promise<ApiResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.SCHEDULE_INTERVIEW, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_id: companyId,
          founder_email: founderEmail,
          investor_email: investorEmail,
          startup_name: startupName
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async startInterview(interviewId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.START_INTERVIEW, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interview_id: interviewId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getInterviewStatus(interviewId: string): Promise<ApiResponse> {
    // This would typically be a Firestore listener in a real implementation
    // For now, we'll return a mock response
    return Promise.resolve({
      success: true,
      data: {
        status: 'scheduled',
        meetingLink: 'https://meet.google.com/example',
        scheduledFor: new Date().toISOString()
      }
    });
  }

  async getInterviewSummary(interviewId: string): Promise<ApiResponse> {
    // This would fetch from Firestore in a real implementation
    return Promise.resolve({
      success: true,
      data: {
        executiveSummary: "Interview analysis completed successfully.",
        confidenceScore: 8,
        keyInsights: ["Strong technical knowledge", "Clear market understanding"],
        redFlags: [],
        recommendations: "Proceed with due diligence"
      }
    });
  }

  async submitAnswer(interviewId: string, questionNumber: number, answerText: string, videoUrl?: string): Promise<ApiResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.SUBMIT_INTERVIEW_ANSWER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interview_id: interviewId,
          question_number: questionNumber,
          answer_text: answerText,
          answer_audio_url: videoUrl || '' // Backend expects this field
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getAIRecommendations(founderEmail: string): Promise<ApiResponse> {
    return this.makeRequest('ai_feedback', {
      method: 'POST',
      body: JSON.stringify({
        founder_email: founderEmail,
        action: 'recommendations'
      }),
    });
  }

  async askAIQuestion(founderEmail: string, question: string): Promise<ApiResponse> {
    return this.makeRequest('ai_feedback', {
      method: 'POST',
      body: JSON.stringify({
        founder_email: founderEmail,
        action: 'question',
        question: question
      }),
    });
  }

  async validateMemoData(memoData: any, memoId: string, memoType: string = "memo_1"): Promise<ApiResponse> {
    return this.makeRequest('validate_memo_data', {
      method: 'POST',
      body: JSON.stringify({
        memo_data: memoData,
        memo_id: memoId,
        memo_type: memoType
      }),
    });
  }

  async validateMarketSize(marketSizeClaim: string, industryCategory: string, memoId: string, memoType: string = "memo_1"): Promise<ApiResponse> {
    return this.makeRequest('validate_market_size', {
      method: 'POST',
      body: JSON.stringify({
        market_size_claim: marketSizeClaim,
        industry_category: industryCategory,
        memo_id: memoId,
        memo_type: memoType
      }),
    });
  }

  async validateCompetitors(competitors: string[], industryCategory: string, memoId: string, memoType: string = "memo_1"): Promise<ApiResponse> {
    return this.makeRequest('validate_competitors', {
      method: 'POST',
      body: JSON.stringify({
        competitors: competitors,
        industry_category: industryCategory,
        memo_id: memoId,
        memo_type: memoType
      }),
    });
  }
}

export const apiClient = new ApiClient();

export const API_ENDPOINTS = {
  TRIGGER_DILIGENCE: process.env.NEXT_PUBLIC_TRIGGER_DILIGENCE_URL || 'https://trigger-diligence-abvgpbhuca-el.a.run.app',
  ON_FILE_UPLOAD: process.env.NEXT_PUBLIC_ON_FILE_UPLOAD_URL || 'https://on-file-upload-abvgpbhuca-el.a.run.app',
  PROCESS_INGESTION: process.env.NEXT_PUBLIC_PROCESS_INGESTION_URL || 'https://asia-south1-veritas-472301.cloudfunctions.net/process_ingestion_task',
  PROCESS_DILIGENCE: process.env.NEXT_PUBLIC_PROCESS_DILIGENCE_URL || 'https://asia-south1-veritas-472301.cloudfunctions.net/process_diligence_task',
  SCHEDULE_INTERVIEW: process.env.NEXT_PUBLIC_SCHEDULE_INTERVIEW_URL || 'https://schedule-ai-interview-abvgpbhuca-el.a.run.app',
  START_INTERVIEW: process.env.NEXT_PUBLIC_START_INTERVIEW_URL || 'https://asia-south1-veritas-472301.cloudfunctions.net/start_ai_interview',
  SUBMIT_INTERVIEW_ANSWER: process.env.NEXT_PUBLIC_SUBMIT_INTERVIEW_ANSWER_URL || 'https://asia-south1-veritas-472301.cloudfunctions.net/submit_interview_answer',
  CHECK_MEMO: process.env.NEXT_PUBLIC_CHECK_MEMO_URL || 'https://check-memo-abvgpbhuca-el.a.run.app',
  CHECK_DILIGENCE: process.env.NEXT_PUBLIC_CHECK_DILIGENCE_URL || 'https://check-diligence-abvgpbhuca-el.a.run.app',
  VALIDATE_MEMO_DATA: process.env.NEXT_PUBLIC_VALIDATE_MEMO_DATA_URL || 'https://validate-memo-data-abvgpbhuca-el.a.run.app',
  VALIDATE_MARKET_SIZE: process.env.NEXT_PUBLIC_VALIDATE_MARKET_SIZE_URL || 'https://validate-market-size-abvgpbhuca-el.a.run.app',
  VALIDATE_COMPETITORS: process.env.NEXT_PUBLIC_VALIDATE_COMPETITORS_URL || 'https://validate-competitors-abvgpbhuca-el.a.run.app',
  AI_FEEDBACK: process.env.NEXT_PUBLIC_AI_FEEDBACK_URL || 'https://ai-feedback-abvgpbhuca-el.a.run.app',
  QUERY_DILIGENCE: process.env.NEXT_PUBLIC_QUERY_DILIGENCE_URL || 'https://query-diligence-abvgpbhuca-el.a.run.app',
  RUN_DILIGENCE: process.env.NEXT_PUBLIC_RUN_DILIGENCE_URL || 'https://run-diligence-abvgpbhuca-el.a.run.app',
};

// Standalone uploadFile function for backward compatibility
export const uploadFile = async (file: File, founderEmail?: string): Promise<ApiResponse & { fileName?: string }> => {
  try {
    const result = await apiClient.uploadFile(file, founderEmail);
    return {
      ...result,
      fileName: result.data?.fileName || `${Date.now()}-${file.name}`
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
};