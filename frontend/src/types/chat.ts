// Chat system TypeScript interfaces

export interface ChatRoom {
  id: string; // {investorId}_{founderId}_{memoId}
  investorId: string;
  founderId: string;
  memoId: string;
  companyName: string;
  founderName: string;
  investorName: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
  status: 'active' | 'closed';
  // Additional context
  companyStage?: string;
  fundingAsk?: string;
  sector?: string[];
  investorFirm?: string;
  investorFocus?: string[];
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderType: 'investor' | 'founder';
  senderName: string;
  content: string;
  timestamp: Date;
  read: boolean;
  messageType?: 'text' | 'file' | 'memo' | 'meeting';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'investor' | 'founder';
  avatar?: string;
  firm?: string; // For investors
  company?: string; // For founders
}

export interface ChatContext {
  memoData?: any;
  companyMetrics?: any;
  investorInfo?: any;
  founderInfo?: any;
}
