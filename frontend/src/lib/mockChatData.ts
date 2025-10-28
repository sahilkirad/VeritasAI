// Mock data for chat system testing
import { ChatRoom, Message } from '../types/chat';

export const mockRooms: ChatRoom[] = [
  {
    id: 'inv1_founder1_memo123',
    investorId: 'inv1',
    founderId: 'founder1',
    memoId: 'memo123',
    investorName: 'Sarah Chen',
    founderName: 'John Doe',
    companyName: 'TechCorp AI',
    lastMessage: 'Thanks for the detailed explanation about your AI model. I have a few follow-up questions...',
    lastMessageAt: new Date(Date.now() - 3600000), // 1 hour ago
    unreadCount: 2,
    status: 'active',
    companyStage: 'Series A',
    fundingAsk: '$2M',
    sector: ['AI', 'SaaS'],
    investorFirm: 'Accel Partners',
    investorFocus: ['AI', 'Enterprise Software']
  },
  {
    id: 'inv2_founder1_memo124',
    investorId: 'inv2',
    founderId: 'founder1',
    memoId: 'memo124',
    investorName: 'Michael Rodriguez',
    founderName: 'John Doe',
    companyName: 'TechCorp AI',
    lastMessage: 'Your traction metrics look impressive. When can we schedule a demo?',
    lastMessageAt: new Date(Date.now() - 7200000), // 2 hours ago
    unreadCount: 0,
    status: 'active',
    companyStage: 'Series A',
    fundingAsk: '$2M',
    sector: ['AI', 'SaaS'],
    investorFirm: 'Sequoia Capital',
    investorFocus: ['AI', 'B2B']
  },
  {
    id: 'inv1_founder2_memo125',
    investorId: 'inv1',
    founderId: 'founder2',
    memoId: 'memo125',
    investorName: 'Sarah Chen',
    founderName: 'Emma Wilson',
    companyName: 'GreenTech Solutions',
    lastMessage: 'The sustainability angle is very compelling. Let me review your financial projections.',
    lastMessageAt: new Date(Date.now() - 86400000), // 1 day ago
    unreadCount: 1,
    status: 'active',
    companyStage: 'Seed',
    fundingAsk: '$500K',
    sector: ['CleanTech', 'Sustainability'],
    investorFirm: 'Accel Partners',
    investorFocus: ['AI', 'Enterprise Software']
  },
  {
    id: 'inv3_founder2_memo126',
    investorId: 'inv3',
    founderId: 'founder2',
    memoId: 'memo126',
    investorName: 'David Kim',
    founderName: 'Emma Wilson',
    companyName: 'GreenTech Solutions',
    lastMessage: 'Thanks for sharing the additional materials. I\'ll get back to you by Friday.',
    lastMessageAt: new Date(Date.now() - 172800000), // 2 days ago
    unreadCount: 0,
    status: 'active',
    companyStage: 'Seed',
    fundingAsk: '$500K',
    sector: ['CleanTech', 'Sustainability'],
    investorFirm: 'Andreessen Horowitz',
    investorFocus: ['CleanTech', 'Climate']
  }
];

export const mockMessages: { [roomId: string]: Message[] } = {
  'inv1_founder1_memo123': [
    {
      id: 'msg1',
      roomId: 'inv1_founder1_memo123',
      senderId: 'inv1',
      senderType: 'investor',
      senderName: 'Sarah Chen',
      content: 'Hi John, I reviewed your Memo 3 and I\'m very impressed with your AI solution. The technical architecture looks solid.',
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      read: true
    },
    {
      id: 'msg2',
      roomId: 'inv1_founder1_memo123',
      senderId: 'founder1',
      senderType: 'founder',
      senderName: 'John Doe',
      content: 'Thank you Sarah! I\'m glad you found the technical details compelling. We\'ve been working on this for over 2 years now.',
      timestamp: new Date(Date.now() - 7000000), // 1.9 hours ago
      read: true
    },
    {
      id: 'msg3',
      roomId: 'inv1_founder1_memo123',
      senderId: 'inv1',
      senderType: 'investor',
      senderName: 'Sarah Chen',
      content: 'The market opportunity you\'ve identified is significant. What\'s your go-to-market strategy for the next 12 months?',
      timestamp: new Date(Date.now() - 6800000), // 1.8 hours ago
      read: true
    },
    {
      id: 'msg4',
      roomId: 'inv1_founder1_memo123',
      senderId: 'founder1',
      senderType: 'founder',
      senderName: 'John Doe',
      content: 'We\'re focusing on enterprise customers initially, starting with Fortune 500 companies in the financial sector. We already have 3 pilot customers.',
      timestamp: new Date(Date.now() - 6600000), // 1.7 hours ago
      read: true
    },
    {
      id: 'msg5',
      roomId: 'inv1_founder1_memo123',
      senderId: 'inv1',
      senderType: 'investor',
      senderName: 'Sarah Chen',
      content: 'That\'s excellent traction. I\'d love to learn more about your pilot customers and their feedback.',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      read: false
    },
    {
      id: 'msg6',
      roomId: 'inv1_founder1_memo123',
      senderId: 'founder1',
      senderType: 'founder',
      senderName: 'John Doe',
      content: 'Absolutely! I can share some case studies and connect you with our pilot customers for references.',
      timestamp: new Date(Date.now() - 3500000), // 58 minutes ago
      read: false
    }
  ],
  'inv2_founder1_memo124': [
    {
      id: 'msg7',
      roomId: 'inv2_founder1_memo124',
      senderId: 'inv2',
      senderType: 'investor',
      senderName: 'Michael Rodriguez',
      content: 'Hi John, I\'m Michael from Sequoia. I\'ve been following your company and I\'m very interested in your AI platform.',
      timestamp: new Date(Date.now() - 14400000), // 4 hours ago
      read: true
    },
    {
      id: 'msg8',
      roomId: 'inv2_founder1_memo124',
      senderId: 'founder1',
      senderType: 'founder',
      senderName: 'John Doe',
      content: 'Hi Michael! Great to hear from you. I\'d be happy to discuss our platform and answer any questions you have.',
      timestamp: new Date(Date.now() - 14000000), // 3.9 hours ago
      read: true
    },
    {
      id: 'msg9',
      roomId: 'inv2_founder1_memo124',
      senderId: 'inv2',
      senderType: 'investor',
      senderName: 'Michael Rodriguez',
      content: 'Your traction metrics look impressive. When can we schedule a demo?',
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      read: true
    }
  ],
  'inv1_founder2_memo125': [
    {
      id: 'msg10',
      roomId: 'inv1_founder2_memo125',
      senderId: 'inv1',
      senderType: 'investor',
      senderName: 'Sarah Chen',
      content: 'Hi Emma, I reviewed your GreenTech proposal. The sustainability angle is very compelling in today\'s market.',
      timestamp: new Date(Date.now() - 172800000), // 2 days ago
      read: true
    },
    {
      id: 'msg11',
      roomId: 'inv1_founder2_memo125',
      senderId: 'founder2',
      senderType: 'founder',
      senderName: 'Emma Wilson',
      content: 'Thank you Sarah! We\'re really passionate about making a positive environmental impact through technology.',
      timestamp: new Date(Date.now() - 172000000), // 1.9 days ago
      read: true
    },
    {
      id: 'msg12',
      roomId: 'inv1_founder2_memo125',
      senderId: 'inv1',
      senderType: 'investor',
      senderName: 'Sarah Chen',
      content: 'Let me review your financial projections and get back to you with some questions.',
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      read: false
    }
  ]
};

// Helper function to get messages for a room
export const getMessagesForRoom = (roomId: string): Message[] => {
  return mockMessages[roomId] || [];
};

// Helper function to get rooms for a user
export const getRoomsForUser = (userId: string, userRole: 'investor' | 'founder'): ChatRoom[] => {
  if (userRole === 'investor') {
    return mockRooms.filter(room => room.investorId === userId);
  } else {
    return mockRooms.filter(room => room.founderId === userId);
  }
};
