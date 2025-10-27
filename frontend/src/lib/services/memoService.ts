// Memo data service for admin dashboard
import { MemoSummary, MemoFilterOptions, MemoSortOptions, mockMemoSummaries } from '../types/memo'

// For now, we'll use mock data. In production, this would connect to Firestore
export async function getAllMemoSummaries(): Promise<MemoSummary[]> {
  try {
    console.log('🔄 Fetching memo summaries...')
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    console.log(`✅ Loaded ${mockMemoSummaries.length} memo summaries`)
    return mockMemoSummaries
  } catch (error) {
    console.error('❌ Error fetching memo summaries:', error)
    throw new Error('Failed to fetch memo summaries')
  }
}

// Fetch single memo summary by ID
export async function getMemoSummaryById(id: string): Promise<MemoSummary | null> {
  try {
    console.log('🔄 Fetching memo summary by ID:', id)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const memo = mockMemoSummaries.find(m => m.id === id)
    
    if (!memo) {
      console.log('❌ Memo summary not found:', id)
      return null
    }
    
    console.log('✅ Successfully fetched memo summary:', memo.startupName)
    return memo
  } catch (error) {
    console.error('❌ Error fetching memo summary by ID:', error)
    throw new Error('Failed to fetch memo summary')
  }
}

// Filter and search memo summaries
export function filterMemoSummaries(memos: MemoSummary[], filters: MemoFilterOptions): MemoSummary[] {
  let filtered = [...memos]
  
  // Search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    filtered = filtered.filter(memo => 
      memo.startupName.toLowerCase().includes(searchTerm) ||
      memo.founderName.toLowerCase().includes(searchTerm) ||
      memo.founderEmail.toLowerCase().includes(searchTerm) ||
      memo.sector.some(s => s.toLowerCase().includes(searchTerm))
    )
  }
  
  // Status filter
  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter(memo => 
      filters.status!.includes(memo.status)
    )
  }
  
  // Stage filter
  if (filters.stage && filters.stage.length > 0) {
    filtered = filtered.filter(memo => 
      filters.stage!.includes(memo.stage)
    )
  }
  
  // Sector filter
  if (filters.sector && filters.sector.length > 0) {
    filtered = filtered.filter(memo => 
      memo.sector.some(s => filters.sector!.includes(s))
    )
  }
  
  // Score range filter
  if (filters.scoreRange) {
    filtered = filtered.filter(memo => {
      if (!memo.aiScore) return false
      return memo.aiScore >= filters.scoreRange!.min && 
             memo.aiScore <= filters.scoreRange!.max
    })
  }
  
  // Risk level filter
  if (filters.riskLevel && filters.riskLevel.length > 0) {
    filtered = filtered.filter(memo => 
      filters.riskLevel!.includes(memo.riskLevel)
    )
  }
  
  // Date range filter
  if (filters.dateRange) {
    filtered = filtered.filter(memo => {
      const memoDate = new Date(memo.createdAt)
      const startDate = new Date(filters.dateRange!.start)
      const endDate = new Date(filters.dateRange!.end)
      return memoDate >= startDate && memoDate <= endDate
    })
  }
  
  return filtered
}

// Sort memo summaries
export function sortMemoSummaries(memos: MemoSummary[], sortBy: string): MemoSummary[] {
  const sorted = [...memos]
  
  switch (sortBy) {
    case 'startupName':
      return sorted.sort((a, b) => a.startupName.localeCompare(b.startupName))
    
    case 'status':
      const statusOrder = { 'Intake': 0, 'Memo 1': 1, 'Memo 2': 2, 'Memo 3': 3, 'Sent': 4 }
      return sorted.sort((a, b) => statusOrder[a.status] - statusOrder[b.status])
    
    case 'aiScore':
      return sorted.sort((a, b) => {
        const scoreA = a.aiScore || 0
        const scoreB = b.aiScore || 0
        return scoreB - scoreA // Descending order
      })
    
    case 'createdAt':
      return sorted.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    
    case 'lastUpdated':
      return sorted.sort((a, b) => 
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      )
    
    default:
      return sorted
  }
}

// Get unique values for filter options
export function getMemoFilterOptions(memos: MemoSummary[]) {
  const statuses = [...new Set(memos.map(m => m.status))]
  const stages = [...new Set(memos.map(m => m.stage))]
  const sectors = [...new Set(memos.flatMap(m => m.sector))]
  const riskLevels = [...new Set(memos.map(m => m.riskLevel))]
  
  return {
    statuses: statuses.sort(),
    stages: stages.sort(),
    sectors: sectors.sort(),
    riskLevels: riskLevels.sort()
  }
}

// Get memo statistics
export function getMemoStats(memos: MemoSummary[]) {
  const totalMemos = memos.length
  const memo1Count = memos.filter(m => m.memo1Generated).length
  const memo2Count = memos.filter(m => m.memo2Generated).length
  const memo3Count = memos.filter(m => m.memo3Generated).length
  const avgScore = memos.filter(m => m.aiScore).reduce((sum, m) => sum + (m.aiScore || 0), 0) / memos.filter(m => m.aiScore).length || 0
  const highScoreCount = memos.filter(m => (m.aiScore || 0) >= 7).length
  const lowRiskCount = memos.filter(m => m.riskLevel === 'Low').length
  
  return {
    totalMemos,
    memo1Count,
    memo2Count,
    memo3Count,
    avgScore: Math.round(avgScore * 10) / 10,
    highScoreCount,
    lowRiskCount,
    completionRate: totalMemos > 0 ? Math.round((memo3Count / totalMemos) * 100) : 0
  }
}

// Generate memo (mock implementation)
export function generateMemo(startupId: string, memoType: 'memo1' | 'memo2' | 'memo3'): Promise<boolean> {
  return new Promise((resolve) => {
    console.log(`🔄 Generating ${memoType} for startup ${startupId}`)
    
    // Simulate API delay
    setTimeout(() => {
      console.log(`✅ Successfully generated ${memoType}`)
      resolve(true)
    }, 2000)
  })
}

// Get memo status distribution
export function getMemoStatusDistribution(memos: MemoSummary[]) {
  const distribution = {
    'Intake': 0,
    'Memo 1': 0,
    'Memo 2': 0,
    'Memo 3': 0,
    'Sent': 0
  }
  
  memos.forEach(memo => {
    distribution[memo.status]++
  })
  
  return distribution
}

// Get recent memo activity
export function getRecentMemoActivity(memos: MemoSummary[], limit: number = 10) {
  return memos
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, limit)
    .map(memo => ({
      id: memo.id,
      startupName: memo.startupName,
      status: memo.status,
      lastUpdated: memo.lastUpdated,
      aiScore: memo.aiScore
    }))
}
