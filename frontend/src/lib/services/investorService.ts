// Investor data service for admin dashboard
import { Investor, InvestorFilterOptions, InvestorSortOptions, mockInvestors } from '../types/investor'

// For now, we'll use mock data. In production, this would connect to Firestore
export async function getAllInvestors(): Promise<Investor[]> {
  try {
    console.log('🔄 Fetching investors data...')
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    console.log(`✅ Loaded ${mockInvestors.length} investors`)
    return mockInvestors
  } catch (error) {
    console.error('❌ Error fetching investors:', error)
    throw new Error('Failed to fetch investors data')
  }
}

// Fetch single investor by ID
export async function getInvestorById(id: string): Promise<Investor | null> {
  try {
    console.log('🔄 Fetching investor by ID:', id)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const investor = mockInvestors.find(inv => inv.id === id)
    
    if (!investor) {
      console.log('❌ Investor not found:', id)
      return null
    }
    
    console.log('✅ Successfully fetched investor:', investor.name)
    return investor
  } catch (error) {
    console.error('❌ Error fetching investor by ID:', error)
    throw new Error('Failed to fetch investor data')
  }
}

// Filter and search investors
export function filterInvestors(investors: Investor[], filters: InvestorFilterOptions): Investor[] {
  let filtered = [...investors]
  
  // Search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    filtered = filtered.filter(investor => 
      investor.name.toLowerCase().includes(searchTerm) ||
      investor.firm.toLowerCase().includes(searchTerm) ||
      investor.email.toLowerCase().includes(searchTerm) ||
      investor.sectorFocus.some(sector => sector.toLowerCase().includes(searchTerm))
    )
  }
  
  // Firm filter
  if (filters.firm && filters.firm.length > 0) {
    filtered = filtered.filter(investor => 
      filters.firm!.includes(investor.firm)
    )
  }
  
  // Sector focus filter
  if (filters.sectorFocus && filters.sectorFocus.length > 0) {
    filtered = filtered.filter(investor => 
      investor.sectorFocus.some(sector => filters.sectorFocus!.includes(sector))
    )
  }
  
  // Stage preference filter
  if (filters.stagePreference && filters.stagePreference.length > 0) {
    filtered = filtered.filter(investor => 
      investor.stagePreference.some(stage => filters.stagePreference!.includes(stage))
    )
  }
  
  // Check size range filter
  if (filters.checkSizeRange) {
    filtered = filtered.filter(investor => {
      const minCheck = investor.checkSizeMin
      const maxCheck = investor.checkSizeMax
      return minCheck >= filters.checkSizeRange!.min && maxCheck <= filters.checkSizeRange!.max
    })
  }
  
  // Geography filter
  if (filters.geography && filters.geography.length > 0) {
    filtered = filtered.filter(investor => 
      investor.geography.some(geo => filters.geography!.includes(geo))
    )
  }
  
  // Status filter
  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter(investor => 
      filters.status!.includes(investor.status)
    )
  }
  
  // Engagement score filter
  if (filters.engagementScore) {
    filtered = filtered.filter(investor => 
      investor.engagementScore >= filters.engagementScore!.min && 
      investor.engagementScore <= filters.engagementScore!.max
    )
  }
  
  return filtered
}

// Sort investors
export function sortInvestors(investors: Investor[], sortBy: string): Investor[] {
  const sorted = [...investors]
  
  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
    
    case 'firm':
      return sorted.sort((a, b) => a.firm.localeCompare(b.firm))
    
    case 'dealsSent':
      return sorted.sort((a, b) => b.dealsSent - a.dealsSent)
    
    case 'engagementScore':
      return sorted.sort((a, b) => b.engagementScore - a.engagementScore)
    
    case 'lastActive':
      return sorted.sort((a, b) => 
        new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
      )
    
    case 'createdAt':
      return sorted.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    
    default:
      return sorted
  }
}

// Get unique values for filter options
export function getInvestorFilterOptions(investors: Investor[]) {
  const firms = [...new Set(investors.map(inv => inv.firm))]
  const sectorFocus = [...new Set(investors.flatMap(inv => inv.sectorFocus))]
  const stagePreference = [...new Set(investors.flatMap(inv => inv.stagePreference))]
  const geography = [...new Set(investors.flatMap(inv => inv.geography))]
  const statuses = [...new Set(investors.map(inv => inv.status))]
  
  return {
    firms: firms.sort(),
    sectorFocus: sectorFocus.sort(),
    stagePreference: stagePreference.sort(),
    geography: geography.sort(),
    statuses: statuses.sort()
  }
}

// Calculate engagement score based on activity
export function calculateEngagementScore(investor: Investor): number {
  const openRate = investor.dealsOpened / investor.dealsSent
  const replyRate = investor.dealsReplied / investor.dealsSent
  const responseTimeScore = Math.max(0, 10 - investor.avgResponseTime) / 10
  
  // Weighted score: 40% open rate, 40% reply rate, 20% response time
  const score = (openRate * 0.4 + replyRate * 0.4 + responseTimeScore * 0.2) * 100
  
  return Math.round(Math.min(100, Math.max(0, score)))
}

// Get investor statistics
export function getInvestorStats(investors: Investor[]) {
  const totalInvestors = investors.length
  const activeInvestors = investors.filter(inv => inv.status === 'Active').length
  const avgEngagementScore = investors.reduce((sum, inv) => sum + inv.engagementScore, 0) / totalInvestors
  const totalDealsSent = investors.reduce((sum, inv) => sum + inv.dealsSent, 0)
  const totalDealsOpened = investors.reduce((sum, inv) => sum + inv.dealsOpened, 0)
  const totalDealsReplied = investors.reduce((sum, inv) => sum + inv.dealsReplied, 0)
  
  const openRate = totalDealsSent > 0 ? (totalDealsOpened / totalDealsSent) * 100 : 0
  const replyRate = totalDealsSent > 0 ? (totalDealsReplied / totalDealsSent) * 100 : 0
  
  return {
    totalInvestors,
    activeInvestors,
    avgEngagementScore: Math.round(avgEngagementScore),
    totalDealsSent,
    totalDealsOpened,
    totalDealsReplied,
    openRate: Math.round(openRate),
    replyRate: Math.round(replyRate)
  }
}

// Generate investor matches for a startup (mock implementation)
export function generateInvestorMatches(startupId: string, investors: Investor[]): any[] {
  // This would normally use AI to match investors based on startup profile
  // For now, return mock matches
  return investors.slice(0, 3).map((investor, index) => ({
    id: `match_${startupId}_${investor.id}`,
    investorId: investor.id,
    startupId,
    matchPercentage: 95 - (index * 5), // 95%, 90%, 85%
    fitProfile: investor.sectorFocus.join(', '),
    rationale: `Strong alignment with ${investor.sectorFocus[0]} focus and ${investor.stagePreference[0]} stage preference`,
    checkSize: `$${investor.checkSizeMin.toLocaleString()} - $${investor.checkSizeMax.toLocaleString()}`,
    sectorFocus: investor.sectorFocus,
    stagePreference: investor.stagePreference,
    coInvestors: investor.coInvestorNetwork,
    generatedAt: new Date().toISOString(),
    status: 'Pending' as const
  }))
}
