// Investor data interfaces for admin dashboard

export interface Investor {
  id: string;
  name: string;
  firm: string;
  title?: string;
  email: string;
  phone?: string;
  linkedin?: string;
  bio?: string;
  
  // Investment preferences
  sectorFocus: string[];
  stagePreference: string[];
  checkSizeMin: number;
  checkSizeMax: number;
  geography: string[];
  investmentThesis?: string;
  
  // Portfolio and engagement
  portfolioCompanies?: PortfolioCompany[];
  coInvestorNetwork?: string[];
  
  // Engagement analytics
  dealsSent: number;
  dealsOpened: number;
  dealsReplied: number;
  avgResponseTime: number; // in days
  lastActive: string;
  
  // Status and metadata
  status: 'Active' | 'Dormant' | 'Inactive';
  engagementScore: number; // 0-100
  createdAt: string;
  lastUpdated: string;
}

export interface PortfolioCompany {
  id: string;
  name: string;
  stage: string;
  sector: string;
  investmentDate: string;
  amount: number;
  status: 'Active' | 'Exited' | 'Failed';
  website?: string;
}

export interface InvestorMatch {
  id: string;
  investorId: string;
  startupId: string;
  matchPercentage: number;
  fitProfile: string;
  rationale: string;
  checkSize: string;
  sectorFocus: string[];
  stagePreference: string[];
  coInvestors: string[];
  generatedAt: string;
  status: 'Pending' | 'Sent' | 'Opened' | 'Replied' | 'Closed';
}

export interface InvestorFilterOptions {
  search?: string;
  firm?: string[];
  sectorFocus?: string[];
  stagePreference?: string[];
  checkSizeRange?: {
    min: number;
    max: number;
  };
  geography?: string[];
  status?: string[];
  engagementScore?: {
    min: number;
    max: number;
  };
}

export interface InvestorSortOptions {
  field: 'name' | 'firm' | 'dealsSent' | 'engagementScore' | 'lastActive' | 'createdAt';
  direction: 'asc' | 'desc';
}

// Mock data for development
export const mockInvestors: Investor[] = [
  {
    id: 'inv_1',
    name: 'Kunal Shah',
    firm: 'Angel Investor',
    title: 'Former CEO, Freecharge',
    email: 'kunal@example.com',
    phone: '+91 98765 43210',
    linkedin: 'https://linkedin.com/in/kunalshah',
    bio: 'Serial entrepreneur and angel investor with focus on fintech and B2B SaaS.',
    sectorFocus: ['Fintech', 'B2B SaaS', 'E-commerce'],
    stagePreference: ['Seed', 'Series A'],
    checkSizeMin: 100000,
    checkSizeMax: 500000,
    geography: ['India', 'Southeast Asia'],
    investmentThesis: 'Focus on early-stage fintech and B2B SaaS companies with strong unit economics.',
    portfolioCompanies: [
      {
        id: 'port_1',
        name: 'Razorpay',
        stage: 'Series D',
        sector: 'Fintech',
        investmentDate: '2020-01-01',
        amount: 200000,
        status: 'Active',
        website: 'https://razorpay.com'
      },
      {
        id: 'port_2',
        name: 'Slice',
        stage: 'Series B',
        sector: 'Fintech',
        investmentDate: '2021-06-01',
        amount: 150000,
        status: 'Active',
        website: 'https://sliceit.com'
      }
    ],
    coInvestorNetwork: ['Chiratae Ventures', 'Titan Capital', 'Better Capital'],
    dealsSent: 12,
    dealsOpened: 8,
    dealsReplied: 3,
    avgResponseTime: 2.5,
    lastActive: '2024-01-15T10:30:00Z',
    status: 'Active',
    engagementScore: 85,
    createdAt: '2023-01-01T00:00:00Z',
    lastUpdated: '2024-01-15T10:30:00Z'
  },
  {
    id: 'inv_2',
    name: 'Ratan Tata',
    firm: 'Tata Sons',
    title: 'Chairman Emeritus',
    email: 'ratan@tata.com',
    phone: '+91 98765 43211',
    linkedin: 'https://linkedin.com/in/ratantata',
    bio: 'Industrialist and philanthropist with investments across various sectors.',
    sectorFocus: ['Technology', 'Healthcare', 'Education', 'Clean Energy'],
    stagePreference: ['Seed', 'Series A', 'Series B'],
    checkSizeMin: 500000,
    checkSizeMax: 2000000,
    geography: ['India', 'Global'],
    investmentThesis: 'Supporting innovative companies that can create positive social impact.',
    portfolioCompanies: [
      {
        id: 'port_3',
        name: 'Ola',
        stage: 'Series H',
        sector: 'Mobility',
        investmentDate: '2015-01-01',
        amount: 1000000,
        status: 'Active',
        website: 'https://olacabs.com'
      }
    ],
    coInvestorNetwork: ['SoftBank', 'Tiger Global', 'Accel'],
    dealsSent: 25,
    dealsOpened: 20,
    dealsReplied: 8,
    avgResponseTime: 4.2,
    lastActive: '2024-01-10T14:20:00Z',
    status: 'Active',
    engagementScore: 92,
    createdAt: '2022-06-01T00:00:00Z',
    lastUpdated: '2024-01-10T14:20:00Z'
  },
  {
    id: 'inv_3',
    name: 'Vaibhav Domkundwar',
    firm: 'Better Capital',
    title: 'Founder & CEO',
    email: 'vaibhav@bettercapital.vc',
    phone: '+91 98765 43212',
    linkedin: 'https://linkedin.com/in/vaibhavdomkundwar',
    bio: 'Early-stage investor focused on consumer internet and B2B SaaS.',
    sectorFocus: ['Consumer Internet', 'B2B SaaS', 'Marketplace'],
    stagePreference: ['Pre-Seed', 'Seed'],
    checkSizeMin: 50000,
    checkSizeMax: 300000,
    geography: ['India'],
    investmentThesis: 'Backing exceptional founders building for the next billion users.',
    portfolioCompanies: [
      {
        id: 'port_4',
        name: 'Meesho',
        stage: 'Series F',
        sector: 'E-commerce',
        investmentDate: '2018-01-01',
        amount: 100000,
        status: 'Active',
        website: 'https://meesho.com'
      }
    ],
    coInvestorNetwork: ['Sequoia Capital', 'Accel', 'Venture Highway'],
    dealsSent: 8,
    dealsOpened: 6,
    dealsReplied: 2,
    avgResponseTime: 1.8,
    lastActive: '2024-01-12T09:15:00Z',
    status: 'Active',
    engagementScore: 78,
    createdAt: '2023-03-01T00:00:00Z',
    lastUpdated: '2024-01-12T09:15:00Z'
  }
];
