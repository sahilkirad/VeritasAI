// lib/admin-api.ts
// Admin API service layer for all backend API calls

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://asia-south1-veritas-472301.cloudfunctions.net'

interface PlatformMetrics {
  totalActiveDeals: number
  pendingMemos: number
  approvedMemos: number
  totalInvestors: number
  totalFounders: number
  conversionRate: number
  conversions: {
    submitted: number
    approved: number
    funded: number
  }
}

interface MemoData {
  id: string
  companyId: string
  companyName: string
  memoVersion: 1 | 2 | 3
  status: 'pending_review' | 'approved' | 'flagged' | 'rejected'
  aiConfidenceScore: number
  riskRating: 'low' | 'medium' | 'high' | 'critical'
  memo1Data?: any
  memo2Data?: any
  memo3Data?: any
  adminNotes: string[]
  flaggedReasons: string[]
  reviewedBy?: string
  reviewedAt?: string
  createdAt: string
  updatedAt: string
}

interface InvestorRecommendation {
  investorId: string
  investorName: string
  firmName: string
  matchScore: number
  rationale: string
  sectorAlignment: number
  stageAlignment: number
  ticketSizeMatch: number
  geographyMatch: number
  networkPath: Array<{
    fromId: string
    toId: string
    connectionType: string
  }>
}

interface NetworkNode {
  id: string
  name: string
  type: 'founder' | 'investor' | 'angel' | 'company'
  x?: number
  y?: number
  z?: number
  size: number
  color: string
  connections: number
}

interface NetworkLink {
  source: string
  target: string
  type: 'direct' | 'co_investor' | 'syndicate' | 'referral'
  strength: number
}

interface NetworkData {
  nodes: NetworkNode[]
  links: NetworkLink[]
}

class AdminAPI {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Platform Metrics
  async fetchPlatformMetrics(): Promise<PlatformMetrics> {
    try {
      return await this.makeRequest<PlatformMetrics>('/fetch-platform-metrics', {
        method: 'GET',
      })
    } catch (error) {
      console.error('Error fetching platform metrics:', error)
      // Return mock data for development
      return {
        totalActiveDeals: 128,
        pendingMemos: 15,
        approvedMemos: 83,
        totalInvestors: 355,
        totalFounders: 892,
        conversionRate: 32.5,
        conversions: {
          submitted: 120,
          approved: 85,
          funded: 40
        }
      }
    }
  }

  // Memo Management
  async fetchPendingMemos(): Promise<MemoData[]> {
    try {
      return await this.makeRequest<MemoData[]>('/fetch-pending-memos', {
        method: 'GET',
      })
    } catch (error) {
      console.error('Error fetching pending memos:', error)
      // Return mock data for development
      return [
        {
          id: '1',
          companyId: 'company_1',
          companyName: 'TechStartup Inc',
          memoVersion: 1,
          status: 'pending_review',
          aiConfidenceScore: 0.87,
          riskRating: 'low',
          adminNotes: [],
          flaggedReasons: [],
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z'
        }
      ]
    }
  }

  async fetchMemoById(memoId: string): Promise<MemoData> {
    try {
      return await this.makeRequest<MemoData>(`/fetch-memo/${memoId}`, {
        method: 'GET',
      })
    } catch (error) {
      console.error('Error fetching memo:', error)
      throw error
    }
  }

  async approveMemo(memoId: string, notes?: string): Promise<{ success: boolean }> {
    try {
      return await this.makeRequest<{ success: boolean }>('/approve-memo', {
        method: 'POST',
        body: JSON.stringify({ memoId, notes }),
      })
    } catch (error) {
      console.error('Error approving memo:', error)
      throw error
    }
  }

  async flagMemo(memoId: string, reasons: string[]): Promise<{ success: boolean }> {
    try {
      return await this.makeRequest<{ success: boolean }>('/flag-memo', {
        method: 'POST',
        body: JSON.stringify({ memoId, reasons }),
      })
    } catch (error) {
      console.error('Error flagging memo:', error)
      throw error
    }
  }

  async rejectMemo(memoId: string, reason: string): Promise<{ success: boolean }> {
    try {
      return await this.makeRequest<{ success: boolean }>('/reject-memo', {
        method: 'POST',
        body: JSON.stringify({ memoId, reason }),
      })
    } catch (error) {
      console.error('Error rejecting memo:', error)
      throw error
    }
  }

  async addMemoNote(memoId: string, note: string): Promise<{ success: boolean }> {
    try {
      return await this.makeRequest<{ success: boolean }>('/add-memo-note', {
        method: 'POST',
        body: JSON.stringify({ memoId, note }),
      })
    } catch (error) {
      console.error('Error adding memo note:', error)
      throw error
    }
  }

  // Investor Recommendations
  async generateInvestorRecommendations(
    companyId: string,
    memoData: any,
    founderProfile?: any
  ): Promise<InvestorRecommendation[]> {
    try {
      const response = await this.makeRequest<{
        recommendations: InvestorRecommendation[]
        status: string
      }>('/generate-investor-recommendations', {
        method: 'POST',
        body: JSON.stringify({
          company_id: companyId,
          memo_data: memoData,
          founder_profile: founderProfile
        }),
      })
      return response.recommendations
    } catch (error) {
      console.error('Error generating investor recommendations:', error)
      throw error
    }
  }

  async sendMemoToInvestors(
    investorIds: string[],
    memoId: string
  ): Promise<{ success: boolean }> {
    try {
      return await this.makeRequest<{ success: boolean }>('/send-memo-to-investors', {
        method: 'POST',
        body: JSON.stringify({ investorIds, memoId }),
      })
    } catch (error) {
      console.error('Error sending memo to investors:', error)
      throw error
    }
  }

  async scheduleFollowUp(
    recommendationId: string,
    days: number
  ): Promise<{ success: boolean }> {
    try {
      return await this.makeRequest<{ success: boolean }>('/schedule-follow-up', {
        method: 'POST',
        body: JSON.stringify({ recommendationId, days }),
      })
    } catch (error) {
      console.error('Error scheduling follow-up:', error)
      throw error
    }
  }

  // Network Graph
  async fetchNetworkData(): Promise<NetworkData> {
    try {
      return await this.makeRequest<NetworkData>('/fetch-network-data', {
        method: 'GET',
      })
    } catch (error) {
      console.error('Error fetching network data:', error)
      // Return mock data for development
      return {
        nodes: [
          { id: 'f1', name: 'Sarah Johnson', type: 'founder', size: 8, color: '#3B82F6', connections: 3 },
          { id: 'i1', name: 'Accel Partners', type: 'investor', size: 12, color: '#8B5CF6', connections: 8 }
        ],
        links: [
          { source: 'f1', target: 'i1', type: 'direct', strength: 0.8 }
        ]
      }
    }
  }

  // Real-time Updates
  async subscribeToUpdates(
    collection: string,
    callback: (data: any) => void
  ): Promise<() => void> {
    // This would typically use Firestore real-time listeners
    // For now, we'll simulate with polling
    const interval = setInterval(async () => {
      try {
        const data = await this.makeRequest(`/subscribe/${collection}`, {
          method: 'GET',
        })
        callback(data)
      } catch (error) {
        console.error('Error in real-time update:', error)
      }
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(interval)
  }

  // Activity Feed
  async fetchRecentActivity(): Promise<any[]> {
    try {
      return await this.makeRequest<any[]>('/fetch-recent-activity', {
        method: 'GET',
      })
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      // Return mock data for development
      return [
        {
          id: '1',
          type: 'memo_approved',
          message: 'Memo for TechStartup Inc approved and published',
          timestamp: '2 minutes ago',
          severity: 'success'
        }
      ]
    }
  }

  // User Management
  async fetchUsers(role?: 'investor' | 'founder' | 'admin'): Promise<any[]> {
    try {
      const params = role ? `?role=${role}` : ''
      return await this.makeRequest<any[]>(`/fetch-users${params}`, {
        method: 'GET',
      })
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  }

  async updateUserStatus(userId: string, status: 'active' | 'inactive'): Promise<{ success: boolean }> {
    try {
      return await this.makeRequest<{ success: boolean }>('/update-user-status', {
        method: 'POST',
        body: JSON.stringify({ userId, status }),
      })
    } catch (error) {
      console.error('Error updating user status:', error)
      throw error
    }
  }

  // Analytics
  async fetchAnalytics(timeRange: '7d' | '30d' | '90d'): Promise<any> {
    try {
      return await this.makeRequest<any>(`/fetch-analytics?range=${timeRange}`, {
        method: 'GET',
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
      throw error
    }
  }

  // System Health
  async checkSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'down'
    services: Record<string, boolean>
  }> {
    try {
      return await this.makeRequest<{
        status: 'healthy' | 'degraded' | 'down'
        services: Record<string, boolean>
      }>('/system-health', {
        method: 'GET',
      })
    } catch (error) {
      console.error('Error checking system health:', error)
      return {
        status: 'down',
        services: {
          database: false,
          ai_services: false,
          storage: false
        }
      }
    }
  }
}

// Export singleton instance
export const adminAPI = new AdminAPI()

// Export types for use in components
export type {
  PlatformMetrics,
  MemoData,
  InvestorRecommendation,
  NetworkNode,
  NetworkLink,
  NetworkData
}
