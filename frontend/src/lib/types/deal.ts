// Deal data interfaces for admin dashboard

export interface Deal {
  id: string;
  startupId: string;
  startupName: string;
  investorId: string;
  investorName: string;
  investorFirm: string;
  status: 'Draft' | 'Sent' | 'Opened' | 'Replied' | 'Scheduled' | 'Closed' | 'Rejected';
  matchPercentage: number;
  sentAt?: string;
  openedAt?: string;
  repliedAt?: string;
  scheduledAt?: string;
  closedAt?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
  lastUpdated: string;
}

export interface DealFilterOptions {
  search?: string;
  status?: string[];
  investorFirm?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

// Mock data for development
export const mockDeals: Deal[] = [
  {
    id: 'deal_1',
    startupId: 'startup_1',
    startupName: 'Syntra Private Limited',
    investorId: 'inv_1',
    investorName: 'Kunal Shah',
    investorFirm: 'Angel Investor',
    status: 'Sent',
    matchPercentage: 96,
    sentAt: '2024-01-25T10:30:00Z',
    createdAt: '2024-01-25T10:00:00Z',
    lastUpdated: '2024-01-25T10:30:00Z'
  },
  {
    id: 'deal_2',
    startupId: 'startup_1',
    startupName: 'Syntra Private Limited',
    investorId: 'inv_2',
    investorName: 'Ratan Tata',
    investorFirm: 'Tata Sons',
    status: 'Opened',
    matchPercentage: 91,
    sentAt: '2024-01-24T14:20:00Z',
    openedAt: '2024-01-25T09:15:00Z',
    createdAt: '2024-01-24T14:00:00Z',
    lastUpdated: '2024-01-25T09:15:00Z'
  },
  {
    id: 'deal_3',
    startupId: 'startup_2',
    startupName: 'FinTechEd',
    investorId: 'inv_3',
    investorName: 'Vaibhav Domkundwar',
    investorFirm: 'Better Capital',
    status: 'Replied',
    matchPercentage: 88,
    sentAt: '2024-01-23T11:45:00Z',
    openedAt: '2024-01-23T15:30:00Z',
    repliedAt: '2024-01-24T08:20:00Z',
    notes: 'Interested in scheduling a call next week',
    createdAt: '2024-01-23T11:30:00Z',
    lastUpdated: '2024-01-24T08:20:00Z'
  },
  {
    id: 'deal_4',
    startupId: 'startup_3',
    startupName: 'WorkIQ',
    investorId: 'inv_1',
    investorName: 'Kunal Shah',
    investorFirm: 'Angel Investor',
    status: 'Scheduled',
    matchPercentage: 85,
    sentAt: '2024-01-22T16:00:00Z',
    openedAt: '2024-01-22T18:30:00Z',
    repliedAt: '2024-01-23T10:15:00Z',
    scheduledAt: '2024-01-26T14:00:00Z',
    notes: 'Call scheduled for Friday 2 PM',
    createdAt: '2024-01-22T15:45:00Z',
    lastUpdated: '2024-01-23T10:15:00Z'
  },
  {
    id: 'deal_5',
    startupId: 'startup_4',
    startupName: 'CloudScale',
    investorId: 'inv_2',
    investorName: 'Ratan Tata',
    investorFirm: 'Tata Sons',
    status: 'Rejected',
    matchPercentage: 72,
    sentAt: '2024-01-20T09:00:00Z',
    openedAt: '2024-01-20T11:30:00Z',
    repliedAt: '2024-01-21T14:45:00Z',
    closedAt: '2024-01-21T14:45:00Z',
    rejectionReason: 'Not aligned with current investment thesis',
    createdAt: '2024-01-20T08:45:00Z',
    lastUpdated: '2024-01-21T14:45:00Z'
  }
];
