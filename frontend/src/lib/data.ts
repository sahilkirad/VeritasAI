import { placeholderImages } from './placeholder-images.json';

export const user = {
  name: 'Rohan Investor',
  email: 'rohan@vcfirm.com',
  avatar: placeholderImages.find(p => p.id === 'user-avatar-1')?.imageUrl || '',
};

export const deals = [
  {
    id: '1',
    companyName: 'Arealis Gateway',
    stage: 'Seed',
    status: 'Diligence',
    lastUpdate: '2 days ago',
    logoUrl: placeholderImages.find(p => p.id === 'company-logo-1')?.imageUrl || '',
  },
  {
    id: '2',
    companyName: 'BioSynth',
    stage: 'Series A',
    status: 'AI Interview',
    lastUpdate: '5 hours ago',
    logoUrl: placeholderImages.find(p => p.id === 'company-logo-2')?.imageUrl || '',
  },
  {
    id: '3',
    companyName: 'CarbonCapture Inc.',
    stage: 'Seed',
    status: 'Memo Generated',
    lastUpdate: '1 week ago',
    logoUrl: placeholderImages.find(p => p.id === 'company-logo-3')?.imageUrl || '',
  },
    {
    id: '4',
    companyName: 'Fintech Solutions',
    stage: 'Pre-seed',
    status: 'Diligence',
    lastUpdate: '3 days ago',
    logoUrl: placeholderImages.find(p => p.id === 'company-logo-4')?.imageUrl || '',
  },
   {
    id: '5',
    companyName: 'HealthWell',
    stage: 'Series B',
    status: 'AI Interview',
    lastUpdate: '1 day ago',
    logoUrl: placeholderImages.find(p => p.id === 'company-logo-5')?.imageUrl || '',
  },
  {
    id: '6',
    companyName: 'DevTools X',
    stage: 'Seed',
    status: 'Diligence',
    lastUpdate: '4 days ago',
    logoUrl: placeholderImages.find(p => p.id === 'company-logo-6')?.imageUrl || '',
  }
];


export const recentActivities = [
    {
        id: 1,
        user: 'AI Assistant',
        action: 'generated a Red Flag Report for',
        target: 'Arealis Gateway',
        time: '15 minutes ago',
        avatarUrl: placeholderImages.find(p => p.id === 'user-avatar-bot')?.imageUrl || '',
    },
    {
        id: 2,
        user: 'Abhishek Shirsath',
        action: 'uploaded a new Financial Model for',
        target: 'Arealis Gateway',
        time: '2 hours ago',
        avatarUrl: placeholderImages.find(p => p.id === 'user-avatar-2')?.imageUrl || '',
    },
    {
        id: 3,
        user: user.name,
        action: 'initiated an AI Interview for',
        target: 'BioSynth',
        time: 'Yesterday',
        avatarUrl: user.avatar,
    },
];

export const arealisData = {
  "memo_1": {
    "business_model": "Commission-based (0.25%-0.35% per transaction), Subscription model (₹7,999/month for premium tools), Loyalty program sponsorships (₹8-₹12 contracts).",
    "company_linkedin_url": "",
    "competition": [
      "Razorpay",
      "Stripe",
      "PayPal",
      "CashFree",
      "CCAvenue"
    ],
    "founder_linkedin_url": "",
    "founder_name": "Abhishek Shirsath, Kshitij Kokate, Swaroop Thakare",
    "initial_flags": [
      "Limited information on the founding team's business experience outside of hackathons.",
      "Ambitious revenue projections with limited details on the go-to-market strategy beyond initial pilot programs."
    ],
    "market_size": "$15 trillion B2B payment market in India, growing at 11.9% CAGR (2023-2028). $1T+ annual digital transactions by 2025.",
    "problem": "Indian businesses lose 8-12% of sales due to payment failures, unpredictable compliance bans, and delayed international payouts. Existing financial processes are inefficient, relying on manual reconciliation and multiple vendor portals.",
    "solution": "Arealis Gateway is an AI-powered, compliance-ready financial infrastructure that unifies fragmented payment systems, intelligently routes transactions, and adapts instantly to RBI mandates. This enables Indian businesses, especially MSMEs, to grow without operational or regulatory bottlenecks.",
    "summary_analysis": "Arealis Gateway presents a compelling solution to address the fragmented and inefficient payment landscape in India. By leveraging AI and focusing on compliance, they aim to significantly reduce payment failures and streamline financial operations for businesses, particularly MSMEs. The large and growing Indian digital payments market, coupled with the inefficiencies of existing solutions, offers a significant opportunity. The company's early traction, including pilot program metrics and competitor migration, suggests promising initial validation. The team's technical expertise in AI, evident from their hackathon success and patent, further strengthens the investment thesis. However, further due diligence is needed to assess the team's business acumen and execution capabilities beyond the technical domain. The financial projections appear aggressive, and a thorough evaluation of the go-to-market strategy, particularly regarding scaling beyond the pilot phase, is crucial. Overall, Arealis Gateway offers an intriguing investment opportunity in a large and growing market. The key strengths lie in their AI-driven solution, early traction, and team's technical background. However, potential concerns include the need for further validation of key claims, a detailed assessment of the team's business experience, and a critical review of the ambitious financial projections and the scalability of their go-to-market plan.",
    "team": "Abhishek Shirsath, founder & CEO, has experience in AI and led Arealis from a hackathon idea to an ISO 27001 certified startup. Kshitij Kokate & Swaroop Thakare are co-founders with experience in AI, winning national hackathons and holding a patent for an IoT-based system.",
    "title": "Arealis Gateway",
    "traction": "10+ pilot merchants, ₹28+ Cr transaction volume processed, 92% merchant retention rate, 35% migration rate from competitors (Razorpay, PayU, Instamojo)",
    "validation_points": [
      "Validate the claimed 90% reduction in payment failures and the underlying AI-driven routing mechanism.",
      "Verify the 35% migration rate from established competitors and understand the reasons for switching.",
      "Confirm the regulatory compliance claims and the ability to adapt to RBI mandates within minutes."
    ],
    "original_filename": "Startup-2.pdf",
    "status": "SUCCESS"
  }
};
