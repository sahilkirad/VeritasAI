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

  async scheduleInterview(interviewData: any): Promise<ApiResponse> {
    return this.makeRequest('schedule_ai_interview', {
      method: 'POST',
      body: JSON.stringify(interviewData),
    });
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
}

export const apiClient = new ApiClient();

export const API_ENDPOINTS = {
  TRIGGER_DILIGENCE: process.env.NEXT_PUBLIC_TRIGGER_DILIGENCE_URL || 'https://asia-south1-veritas-472301.cloudfunctions.net/trigger_diligence',
  ON_FILE_UPLOAD: process.env.NEXT_PUBLIC_ON_FILE_UPLOAD_URL || 'https://asia-south1-veritas-472301.cloudfunctions.net/on_file_upload',
  PROCESS_INGESTION: process.env.NEXT_PUBLIC_PROCESS_INGESTION_URL || 'https://asia-south1-veritas-472301.cloudfunctions.net/process_ingestion_task',
  PROCESS_DILIGENCE: process.env.NEXT_PUBLIC_PROCESS_DILIGENCE_URL || 'https://asia-south1-veritas-472301.cloudfunctions.net/process_diligence_task',
  SCHEDULE_INTERVIEW: process.env.NEXT_PUBLIC_SCHEDULE_INTERVIEW_URL || 'https://asia-south1-veritas-472301.cloudfunctions.net/schedule_ai_interview',
  CHECK_MEMO: process.env.NEXT_PUBLIC_CHECK_MEMO_URL || 'https://asia-south1-veritas-472301.cloudfunctions.net/check_memo',
  CHECK_DILIGENCE: process.env.NEXT_PUBLIC_CHECK_DILIGENCE_URL || 'https://asia-south1-veritas-472301.cloudfunctions.net/check_diligence',
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