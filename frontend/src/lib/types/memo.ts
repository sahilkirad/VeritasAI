// Memo data interfaces for admin dashboard

export interface MemoSummary {
  id: string;
  startupId: string;
  startupName: string;
  founderName: string;
  founderEmail: string;
  stage: string;
  sector: string[];
  fundingAsk: string;
  status: 'Intake' | 'Memo 1' | 'Memo 2' | 'Memo 3' | 'Sent';
  aiScore?: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  createdAt: string;
  lastUpdated: string;
  memo1Generated?: boolean;
  memo2Generated?: boolean;
  memo3Generated?: boolean;
  memo1Score?: number;
  memo2Score?: number;
  memo3Score?: number;
}

export interface MemoFilterOptions {
  search?: string;
  status?: string[];
  stage?: string[];
  sector?: string[];
  scoreRange?: {
    min: number;
    max: number;
  };
  riskLevel?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface MemoSortOptions {
  field: 'startupName' | 'status' | 'aiScore' | 'createdAt' | 'lastUpdated';
  direction: 'asc' | 'desc';
}

// Mock data for development
export const mockMemoSummaries: MemoSummary[] = [
  {
    id: 'memo_1',
    startupId: 'startup_1',
    startupName: 'Syntra Private Limited',
    founderName: 'Arjun Singh',
    founderEmail: 'arjun@syntra.com',
    stage: 'Seed',
    sector: ['Fintech', 'B2B SaaS'],
    fundingAsk: '$300K',
    status: 'Memo 3',
    aiScore: 7.1,
    riskLevel: 'Low',
    createdAt: '2024-01-15T00:00:00Z',
    lastUpdated: '2024-01-26T10:30:00Z',
    memo1Generated: true,
    memo2Generated: true,
    memo3Generated: true,
    memo1Score: 7.5,
    memo2Score: 7.3,
    memo3Score: 7.1
  },
  {
    id: 'memo_2',
    startupId: 'startup_2',
    startupName: 'FinTechEd',
    founderName: 'Priya Sharma',
    founderEmail: 'priya@finteched.com',
    stage: 'Pre-Seed',
    sector: ['EdTech', 'Fintech'],
    fundingAsk: '$150K',
    status: 'Memo 2',
    aiScore: 6.8,
    riskLevel: 'Medium',
    createdAt: '2024-01-20T00:00:00Z',
    lastUpdated: '2024-01-25T14:20:00Z',
    memo1Generated: true,
    memo2Generated: true,
    memo3Generated: false,
    memo1Score: 7.2,
    memo2Score: 6.8
  },
  {
    id: 'memo_3',
    startupId: 'startup_3',
    startupName: 'WorkIQ',
    founderName: 'Raj Patel',
    founderEmail: 'raj@workiq.com',
    stage: 'Series A',
    sector: ['HR Tech', 'AI'],
    fundingAsk: '$1.5M',
    status: 'Memo 1',
    aiScore: 8.2,
    riskLevel: 'Low',
    createdAt: '2024-01-22T00:00:00Z',
    lastUpdated: '2024-01-24T09:15:00Z',
    memo1Generated: true,
    memo2Generated: false,
    memo3Generated: false,
    memo1Score: 8.2
  },
  {
    id: 'memo_4',
    startupId: 'startup_4',
    startupName: 'CloudScale',
    founderName: 'Sarah Chen',
    founderEmail: 'sarah@cloudscale.com',
    stage: 'Seed',
    sector: ['Cloud Infrastructure', 'DevOps'],
    fundingAsk: '$500K',
    status: 'Intake',
    riskLevel: 'High',
    createdAt: '2024-01-23T00:00:00Z',
    lastUpdated: '2024-01-23T16:45:00Z',
    memo1Generated: false,
    memo2Generated: false,
    memo3Generated: false
  }
];
