// API configuration and utility functions

export const API_ENDPOINTS = {
  // Backend Function URLs - Use deployed functions directly
  PROCESS_INGESTION: 'https://asia-south1-veritas-472301.cloudfunctions.net/process_ingestion_task',
  ON_FILE_UPLOAD: 'https://asia-south1-veritas-472301.cloudfunctions.net/on_file_upload',
  TRIGGER_DILIGENCE: 'https://asia-south1-veritas-472301.cloudfunctions.net/trigger_diligence',
  PROCESS_DILIGENCE: 'https://asia-south1-veritas-472301.cloudfunctions.net/process_diligence_task',
  SCHEDULE_INTERVIEW: 'https://asia-south1-veritas-472301.cloudfunctions.net/schedule_ai_interview',
  CHECK_MEMO: 'https://asia-south1-veritas-472301.cloudfunctions.net/check-memo',
  CHECK_DILIGENCE: 'https://asia-south1-veritas-472301.cloudfunctions.net/check-diligence',
  MEMO_DATA: 'https://asia-south1-veritas-472301.cloudfunctions.net/memo-data',
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

// File upload function - call deployed Cloud Function directly
export async function uploadFile(
  file: File,
  type: 'deck' | 'video' | 'audio'
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Convert file to base64 for Cloud Function
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix to get just the base64 data
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const response = await fetch(API_ENDPOINTS.ON_FILE_UPLOAD, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        content_type: type,
        file_data: base64Data,
        timestamp: Date.now(),
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    return { 
      success: true, 
      url: result.download_url,
      memoId: result.memo_id 
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Upload failed' 
    };
  }
}