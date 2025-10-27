// Deal data service for admin dashboard
import { Deal, DealFilterOptions, mockDeals } from '../types/deal'

// For now, we'll use mock data. In production, this would connect to Firestore
export async function getAllDeals(): Promise<Deal[]> {
  try {
    console.log('🔄 Fetching deals data...')
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    console.log(`✅ Loaded ${mockDeals.length} deals`)
    return mockDeals
  } catch (error) {
    console.error('❌ Error fetching deals:', error)
    throw new Error('Failed to fetch deals data')
  }
}

// Filter and search deals
export function filterDeals(deals: Deal[], filters: DealFilterOptions): Deal[] {
  let filtered = [...deals]
  
  // Search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    filtered = filtered.filter(deal => 
      deal.startupName.toLowerCase().includes(searchTerm) ||
      deal.investorName.toLowerCase().includes(searchTerm) ||
      deal.investorFirm.toLowerCase().includes(searchTerm)
    )
  }
  
  // Status filter
  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter(deal => 
      filters.status!.includes(deal.status)
    )
  }
  
  // Investor firm filter
  if (filters.investorFirm && filters.investorFirm.length > 0) {
    filtered = filtered.filter(deal => 
      filters.investorFirm!.includes(deal.investorFirm)
    )
  }
  
  // Date range filter
  if (filters.dateRange) {
    filtered = filtered.filter(deal => {
      const dealDate = new Date(deal.createdAt)
      const startDate = new Date(filters.dateRange!.start)
      const endDate = new Date(filters.dateRange!.end)
      return dealDate >= startDate && dealDate <= endDate
    })
  }
  
  return filtered
}

// Get unique values for filter options
export function getDealFilterOptions(deals: Deal[]) {
  const statuses = [...new Set(deals.map(d => d.status))]
  const investorFirms = [...new Set(deals.map(d => d.investorFirm))]
  
  return {
    statuses: statuses.sort(),
    investorFirms: investorFirms.sort()
  }
}

// Get deal statistics
export function getDealStats(deals: Deal[]) {
  const totalDeals = deals.length
  const sentDeals = deals.filter(d => d.status === 'Sent').length
  const openedDeals = deals.filter(d => d.status === 'Opened').length
  const repliedDeals = deals.filter(d => d.status === 'Replied').length
  const scheduledDeals = deals.filter(d => d.status === 'Scheduled').length
  const closedDeals = deals.filter(d => d.status === 'Closed').length
  const rejectedDeals = deals.filter(d => d.status === 'Rejected').length
  
  const openRate = totalDeals > 0 ? (openedDeals / totalDeals) * 100 : 0
  const replyRate = totalDeals > 0 ? (repliedDeals / totalDeals) * 100 : 0
  const conversionRate = totalDeals > 0 ? (closedDeals / totalDeals) * 100 : 0
  
  return {
    totalDeals,
    sentDeals,
    openedDeals,
    repliedDeals,
    scheduledDeals,
    closedDeals,
    rejectedDeals,
    openRate: Math.round(openRate),
    replyRate: Math.round(replyRate),
    conversionRate: Math.round(conversionRate)
  }
}
