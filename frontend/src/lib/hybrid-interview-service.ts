interface InterviewMode {
  type: 'webrtc' | 'google_meet' | 'hybrid';
  description: string;
  benefits: string[];
}

interface HybridInterviewConfig {
  primaryMode: 'webrtc' | 'google_meet';
  fallbackMode: 'webrtc' | 'google_meet';
  autoSwitch: boolean;
}

export class HybridInterviewService {
  private config: HybridInterviewConfig;
  private currentMode: InterviewMode['type'] = 'webrtc';

  constructor(config: HybridInterviewConfig) {
    this.config = config;
  }

  // WebRTC Mode - Direct audio/video capture
  async startWebRTCInterview(): Promise<{
    success: boolean;
    stream?: MediaStream;
    error?: string;
  }> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        },
        video: true
      });

      return {
        success: true,
        stream
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'WebRTC failed'
      };
    }
  }

  // Google Meet Mode - Automated meeting creation
  async startGoogleMeetInterview(
    founderEmail: string,
    investorEmail: string,
    startupName: string
  ): Promise<{
    success: boolean;
    meetLink?: string;
    error?: string;
  }> {
    try {
      // Use the Google Meet service we created
      const { googleMeetService } = await import('./google-meet-service');
      const result = await googleMeetService.createImmediateMeet(
        founderEmail,
        investorEmail,
        startupName
      );

      if (result.success) {
        // Auto-join as AI bot
        await googleMeetService.joinMeetAsAI(result.meetLink!);
        return {
          success: true,
          meetLink: result.meetLink
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Google Meet failed'
      };
    }
  }

  // Hybrid Mode - Best of both worlds
  async startHybridInterview(
    founderEmail: string,
    investorEmail: string,
    startupName: string
  ): Promise<{
    success: boolean;
    mode: 'webrtc' | 'google_meet';
    stream?: MediaStream;
    meetLink?: string;
    error?: string;
  }> {
    // Try WebRTC first (faster, no external dependencies)
    const webrtcResult = await this.startWebRTCInterview();
    
    if (webrtcResult.success) {
      this.currentMode = 'webrtc';
      return {
        success: true,
        mode: 'webrtc',
        stream: webrtcResult.stream
      };
    }

    // Fallback to Google Meet if WebRTC fails
    const meetResult = await this.startGoogleMeetInterview(
      founderEmail,
      investorEmail,
      startupName
    );

    if (meetResult.success) {
      this.currentMode = 'google_meet';
      return {
        success: true,
        mode: 'google_meet',
        meetLink: meetResult.meetLink
      };
    }

    return {
      success: false,
      mode: 'webrtc',
      error: `Both modes failed: WebRTC (${webrtcResult.error}), Google Meet (${meetResult.error})`
    };
  }

  // Get available interview modes
  getAvailableModes(): InterviewMode[] {
    return [
      {
        type: 'webrtc',
        description: 'Direct WebRTC audio/video capture',
        benefits: [
          'No external dependencies',
          'Faster setup',
          'Full control over audio/video',
          'No "let someone in" issues',
          'Works offline'
        ]
      },
      {
        type: 'google_meet',
        description: 'Google Meet integration with AI bot',
        benefits: [
          'Familiar interface for users',
          'Built-in recording',
          'Calendar integration',
          'Professional appearance',
          'Automatic AI bot joining'
        ]
      },
      {
        type: 'hybrid',
        description: 'WebRTC with Google Meet fallback',
        benefits: [
          'Best of both worlds',
          'Automatic fallback',
          'Maximum reliability',
          'Flexible deployment'
        ]
      }
    ];
  }

  // Get current mode
  getCurrentMode(): InterviewMode['type'] {
    return this.currentMode;
  }

  // Switch modes dynamically
  async switchMode(
    newMode: InterviewMode['type'],
    founderEmail?: string,
    investorEmail?: string,
    startupName?: string
  ): Promise<boolean> {
    try {
      if (newMode === 'webrtc') {
        const result = await this.startWebRTCInterview();
        if (result.success) {
          this.currentMode = 'webrtc';
          return true;
        }
      } else if (newMode === 'google_meet') {
        if (!founderEmail || !investorEmail || !startupName) {
          throw new Error('Email and startup name required for Google Meet');
        }
        const result = await this.startGoogleMeetInterview(
          founderEmail,
          investorEmail,
          startupName
        );
        if (result.success) {
          this.currentMode = 'google_meet';
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error switching modes:', error);
      return false;
    }
  }

  // Get mode recommendations based on context
  getRecommendedMode(context: {
    hasStableConnection: boolean;
    userPreference: 'speed' | 'familiarity' | 'reliability';
    requiresRecording: boolean;
    hasGoogleMeetAccess: boolean;
  }): InterviewMode['type'] {
    if (context.userPreference === 'speed' || !context.hasGoogleMeetAccess) {
      return 'webrtc';
    }
    
    if (context.userPreference === 'familiarity' && context.hasGoogleMeetAccess) {
      return 'google_meet';
    }
    
    if (context.userPreference === 'reliability') {
      return 'hybrid';
    }
    
    return 'webrtc'; // Default
  }
}

export const hybridInterviewService = new HybridInterviewService({
  primaryMode: 'webrtc',
  fallbackMode: 'google_meet',
  autoSwitch: true
});

export type { InterviewMode, HybridInterviewConfig };
