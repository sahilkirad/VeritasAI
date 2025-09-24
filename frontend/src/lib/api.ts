// API configuration and utility functions

export const API_ENDPOINTS = {
  // Backend Function URLs - Use deployed functions directly
  PROCESS_INGESTION: 'https://asia-south1-veritas-472301.cloudfunctions.net/process_ingestion_task',
  ON_FILE_UPLOAD: 'https://asia-south1-veritas-472301.cloudfunctions.net/on_file_upload',
  TRIGGER_DILIGENCE: 'https://asia-south1-veritas-472301.cloudfunctions.net/trigger_diligence',
  PROCESS_DILIGENCE: 'https://asia-south1-veritas-472301.cloudfunctions.net/process_diligence_task',
  SCHEDULE_INTERVIEW: 'https://asia-south1-veritas-472301.cloudfunctions.net/schedule_ai_interview',
  
  // Local API routes
  UPLOAD_FILE: '/api/upload',
  GET_DEALS: '/api/deals',
  CREATE_DEAL: '/api/deals',
  GET_MEMO: '/api/memo',
};

// Generic API call function
export async function apiCall(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, defaultOptions);
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }
  
  return response;
}

// Safe JSON parsing function
export async function safeJsonResponse(response: Response): Promise<any> {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    console.error('Non-JSON response received:', text);
    throw new Error('Server returned non-JSON response');
  }
  
  return await response.json();
}

// File upload function - call deployed function directly
export async function uploadFile(
  file: File,
  type: 'deck' | 'video' | 'audio'
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const response = await fetch(API_ENDPOINTS.UPLOAD_FILE, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    const result = await response.json();
    return { success: true, url: result.url };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Upload failed' 
    };
  }
}