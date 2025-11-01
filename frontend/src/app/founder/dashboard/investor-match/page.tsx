'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Search, 
  Star, 
  MessageSquare, 
  Calendar, 
  ExternalLink, 
  TrendingUp,
  Users,
  DollarSign,
  Building2,
  MapPin,
  Link as LinkIcon,
  FileText,
  Sparkles,
  X,
  CheckCircle2,
  ArrowRight,
  Briefcase,
  Target,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-new";

interface Investor {
  id: string;
  name: string;
  firm: string;
  designation?: string;
  location: string;
  matchScore: number;
  sectorFocus: string[];
  stage: string[];
  avgTicketSize: string;
  whyMatch: string;
  logo?: string;
  investmentRange: {
    min: string;
    max: string;
  };
  portfolioCompanies: string[];
  investmentFocus: string[];
  linkedinUrl?: string;
  crunchbaseUrl?: string;
  aiNotes: string;
  dealHistory: Array<{
    company: string;
    amount: string;
    sector: string;
    date: string;
  }>;
  connectionPath?: {
    sharedContact: string;
    mutualIntro: string;
  };
  saved?: boolean;
}

interface Company {
  id: string;
  name: string;
  founderName: string;
  status: string;
}

// Mock data - replace with API call
const mockInvestors: Investor[] = [
  {
    id: '1',
    name: 'Ravi Kumar',
    firm: 'Lightspeed Ventures',
    designation: 'Partner',
    location: 'Bangalore, India',
    matchScore: 92,
    sectorFocus: ['SaaS', 'FinTech', 'B2B'],
    stage: ['Seed', 'Series A'],
    avgTicketSize: '₹1.5 Cr',
    whyMatch: 'Your startup aligns with their SaaS portfolio. Founder\'s IIT background and traction match their pattern of investing in data-driven SaaS plays.',
    investmentRange: { min: '₹50L', max: '₹5Cr' },
    portfolioCompanies: ['Zomentum', 'Credflow', 'Razorpay', 'Freshworks', 'Unacademy'],
    investmentFocus: ['SaaS', 'FinTech', 'AI'],
    linkedinUrl: 'https://linkedin.com/in/ravi-kumar',
    crunchbaseUrl: 'https://crunchbase.com/lightspeed',
    aiNotes: 'Prefers early traction stage startups with strong founding teams. Has invested in 3 SaaS companies from IIT background founders.',
    dealHistory: [
      { company: 'Zomentum', amount: '₹2Cr', sector: 'SaaS', date: '2024-01' },
      { company: 'Credflow', amount: '₹1.8Cr', sector: 'FinTech', date: '2023-11' },
      { company: 'DataSync', amount: '₹3Cr', sector: 'AI', date: '2023-09' },
    ],
    connectionPath: {
      sharedContact: 'Abhishek Jain',
      mutualIntro: 'Mutual LinkedIn connection → "Abhishek Jain" (former colleague)'
    }
  },
  {
    id: '2',
    name: 'Priya Sharma',
    firm: 'Accel Partners',
    designation: 'Principal',
    location: 'Mumbai, India',
    matchScore: 88,
    sectorFocus: ['HealthTech', 'EdTech', 'B2B SaaS'],
    stage: ['Seed', 'Pre-Series A'],
    avgTicketSize: '₹2 Cr',
    whyMatch: 'Strong fit in HealthTech sector with your AI-powered solution. Portfolio includes similar stage companies.',
    investmentRange: { min: '₹1Cr', max: '₹6Cr' },
    portfolioCompanies: ['Practo', 'Unacademy', 'Swiggy'],
    investmentFocus: ['HealthTech', 'EdTech'],
    linkedinUrl: 'https://linkedin.com/in/priya-sharma',
    aiNotes: 'Focuses on product-market fit and team strength. Looks for startups solving critical healthcare problems.',
    dealHistory: [
      { company: 'HealthApp', amount: '₹2.5Cr', sector: 'HealthTech', date: '2024-02' },
      { company: 'EduPlatform', amount: '₹1.5Cr', sector: 'EdTech', date: '2023-12' },
    ],
  },
  {
    id: '3',
    name: 'Anil Patel',
    firm: 'Sequoia Capital',
    designation: 'Partner',
    location: 'San Francisco, USA',
    matchScore: 85,
    sectorFocus: ['AI/ML', 'Enterprise Software'],
    stage: ['Series A', 'Series B'],
    avgTicketSize: '₹5 Cr',
    whyMatch: 'Alignment with AI/ML focus, though stage preference is slightly later. Strong portfolio in enterprise software.',
    investmentRange: { min: '₹3Cr', max: '₹15Cr' },
    portfolioCompanies: ['Zoom', 'WhatsApp', 'Stripe'],
    investmentFocus: ['AI/ML', 'Enterprise'],
    linkedinUrl: 'https://linkedin.com/in/anil-patel',
    aiNotes: 'Prefers Series A+ companies with proven traction. However, shows interest in exceptional early-stage AI startups.',
    dealHistory: [
      { company: 'AICorp', amount: '₹8Cr', sector: 'AI', date: '2024-01' },
      { company: 'EnterpriseApp', amount: '₹12Cr', sector: 'Enterprise', date: '2023-10' },
    ],
  },
  {
    id: '4',
    name: 'Meera Reddy',
    firm: 'Blume Ventures',
    designation: 'Investment Director',
    location: 'Delhi, India',
    matchScore: 91,
    sectorFocus: ['FinTech', 'SaaS', 'Marketplace'],
    stage: ['Pre-Seed', 'Seed'],
    avgTicketSize: '₹75L',
    whyMatch: 'Perfect stage alignment (Seed focus) and strong FinTech expertise. Active in Indian market with multiple successful exits.',
    investmentRange: { min: '₹25L', max: '₹2Cr' },
    portfolioCompanies: ['Razorpay', 'Unacademy', 'Exotel'],
    investmentFocus: ['FinTech', 'SaaS'],
    linkedinUrl: 'https://linkedin.com/in/meera-reddy',
    aiNotes: 'Very active in seed stage. Values strong founding teams and clear problem-solution fit. Quick decision maker.',
    dealHistory: [
      { company: 'FinStartup', amount: '₹1.2Cr', sector: 'FinTech', date: '2024-03' },
      { company: 'SaaSPlatform', amount: '₹90L', sector: 'SaaS', date: '2023-12' },
    ],
  },
];

export default function InvestorMatchPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Companies from Deal Memo
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  
  // Investors and loading state
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [filteredInvestors, setFilteredInvestors] = useState<Investor[]>([]);
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  
  // Filters
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [geoFilter, setGeoFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('match');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Real-time listener for companies from Deal Memo
  useEffect(() => {
    if (!user) return;

    // Real-time listener for ingestionResults
    const resultsQuery = query(
      collection(db, 'ingestionResults'),
      where('status', '==', 'SUCCESS')
    );

    const unsubscribe = onSnapshot(resultsQuery, (snapshot) => {
      const companiesList: Company[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const memo1 = data.memo_1 || {};
        
        // Extract founder name - handle both string and array
        let founderName = 'Unknown Founder';
        const founderNameRaw = memo1.founder_name || '';
        if (Array.isArray(founderNameRaw) && founderNameRaw.length > 0) {
          founderName = founderNameRaw[0];
        } else if (typeof founderNameRaw === 'string') {
          founderName = founderNameRaw;
        }
        
        companiesList.push({
          id: doc.id,
          name: memo1.title || 'Untitled Company',
          founderName: founderName,
          status: 'completed'
        });
      });

      setCompanies(companiesList);
    }, (error) => {
      console.error("Error listening to ingestionResults:", error);
      toast({
        title: "Error",
        description: "Failed to load companies",
        variant: "destructive"
      });
    });

    return () => unsubscribe();
  }, [user, toast]);

  // Fetch investor matches when company is selected
  const fetchInvestorMatches = async (memoId: string, forceRecompute: boolean = false) => {
    if (!memoId) return;
    
    try {
      setIsLoadingMatches(true);
      
      // First, try to fetch from Firestore directly (optional - faster)
      if (!forceRecompute) {
        try {
          const matchDocRef = doc(db, "investor_matches", memoId);
          const matchDocSnap = await getDoc(matchDocRef);
          
          if (matchDocSnap.exists()) {
            const cachedData = matchDocSnap.data();
            console.log("✅ Found cached matches in Firestore");
            
            // Transform cached data to Investor interface
            const transformedInvestors: Investor[] = (cachedData.matches || []).map((match: any) => ({
              id: match.investor_id || match.firm_name || '',
              name: match.investor_name || '',
              firm: match.firm_name || '',
              designation: '',
              location: match.investment_profile?.geography?.[0] || '',
              matchScore: match.match_score || 0,
              sectorFocus: match.investment_profile?.sector_focus || [],
              stage: match.investment_profile?.stage_preference || [],
              avgTicketSize: _formatTicketSize(match.investment_profile?.ticket_size?.avg || 0),
              whyMatch: match.why_match || '',
              investmentRange: {
                min: _formatTicketSize(match.investment_profile?.ticket_size?.min || 0),
                max: _formatTicketSize(match.investment_profile?.ticket_size?.max || 0),
              },
              portfolioCompanies: match.past_investments || [],
              investmentFocus: match.investment_profile?.sector_focus || [],
              linkedinUrl: match.contact?.linkedin,
              crunchbaseUrl: match.contact?.crunchbase,
              aiNotes: match.thesis || '',
              dealHistory: [],
              saved: false,
            }));
            
            setInvestors(transformedInvestors);
            setFilteredInvestors(transformedInvestors);
            setIsLoadingMatches(false);
            
            toast({
              title: "Success",
              description: `Loaded ${transformedInvestors.length} cached investor matches`,
            });
            return;
          }
        } catch (firestoreError) {
          console.log("No cached results in Firestore, fetching from API...", firestoreError);
        }
      }
      
      // If no cache or force recompute, fetch from API
      const response = await fetch('https://asia-south1-veritas-472301.cloudfunctions.net/investor_match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          memo_id: memoId,
          force_recompute: forceRecompute 
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch investor matches: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'ERROR') {
        throw new Error(data.error || 'Failed to fetch matches');
      }

      // Transform API response to Investor interface
      const transformedInvestors: Investor[] = (data.matches || []).map((match: any) => ({
        id: match.investor_id || match.firm_name || '',
        name: match.investor_name || '',
        firm: match.firm_name || '',
        designation: '',
        location: match.investment_profile?.geography?.[0] || '',
        matchScore: match.match_score || 0,
        sectorFocus: match.investment_profile?.sector_focus || [],
        stage: match.investment_profile?.stage_preference || [],
        avgTicketSize: _formatTicketSize(match.investment_profile?.ticket_size?.avg || 0),
        whyMatch: match.why_match || '',
        investmentRange: {
          min: _formatTicketSize(match.investment_profile?.ticket_size?.min || 0),
          max: _formatTicketSize(match.investment_profile?.ticket_size?.max || 0),
        },
        portfolioCompanies: match.past_investments || [],
        investmentFocus: match.investment_profile?.sector_focus || [],
        linkedinUrl: match.contact?.linkedin,
        crunchbaseUrl: match.contact?.crunchbase,
        aiNotes: match.thesis || '',
        dealHistory: [],
        saved: false,
      }));

      setInvestors(transformedInvestors);
      setFilteredInvestors(transformedInvestors);
      
      toast({
        title: "Success",
        description: `Found ${transformedInvestors.length} investor matches`,
      });
      
    } catch (error) {
      console.error('Error fetching investor matches:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch investor matches",
        variant: "destructive"
      });
      setInvestors([]);
      setFilteredInvestors([]);
    } finally {
      setIsLoadingMatches(false);
    }
  };

  // Helper function to format ticket size
  const _formatTicketSize = (amount: number): string => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(0)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}K`;
    }
    return `₹${amount}`;
  };

  // Reset investors when company selection changes (but don't auto-fetch)
  useEffect(() => {
    if (!selectedCompany) {
      setInvestors([]);
      setFilteredInvestors([]);
    }
  }, [selectedCompany]);

  // Calculate stats
  const totalMatches = filteredInvestors.length;
  const avgMatchScore = filteredInvestors.length > 0
    ? Math.round(filteredInvestors.reduce((sum, inv) => sum + inv.matchScore, 0) / filteredInvestors.length)
    : 0;
  const topSector = filteredInvestors.length > 0
    ? filteredInvestors[0].sectorFocus[0] || 'N/A'
    : 'N/A';

  // Filter and sort investors
  useEffect(() => {
    let filtered = [...investors];

    // Apply filters
    if (stageFilter !== 'all') {
      filtered = filtered.filter(inv => inv.stage.includes(stageFilter));
    }
    if (sectorFilter !== 'all') {
      filtered = filtered.filter(inv => inv.sectorFocus.includes(sectorFilter));
    }
    if (geoFilter !== 'all') {
      filtered = filtered.filter(inv => {
        if (geoFilter === 'india') return inv.location.includes('India');
        if (geoFilter === 'asia') return inv.location.includes('Asia') || inv.location.includes('Singapore');
        return true;
      });
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(inv => 
        inv.name.toLowerCase().includes(query) ||
        inv.firm.toLowerCase().includes(query) ||
        inv.sectorFocus.some(s => s.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'match':
          return b.matchScore - a.matchScore;
        case 'ticket':
          // Parse ticket size for sorting (simplified)
          return parseFloat(b.avgTicketSize.replace(/[₹,CrL]/g, '')) - parseFloat(a.avgTicketSize.replace(/[₹,CrL]/g, ''));
        case 'recent':
          return 0; // Would need activity data
        default:
          return 0;
      }
    });

    setFilteredInvestors(filtered);
  }, [investors, stageFilter, sectorFilter, geoFilter, sortBy, searchQuery]);

  const handleViewProfile = (investor: Investor) => {
    setSelectedInvestor(investor);
    setIsSheetOpen(true);
  };

  const handleRequestIntro = (investor: Investor) => {
    toast({
      title: "Introduction Requested",
      description: `Request sent to ${investor.firm} via Investor Room.`,
    });
    // TODO: Create investor room
  };

  const handleSave = (investor: Investor) => {
    setInvestors(prev => prev.map(inv => 
      inv.id === investor.id ? { ...inv, saved: !inv.saved } : inv
    ));
    toast({
      title: investor.saved ? "Removed from favorites" : "Saved to favorites",
      description: `${investor.firm} has been ${investor.saved ? 'removed from' : 'added to'} your favorites.`,
    });
  };

  const handleStartChat = async (investor: Investor) => {
    try {
      // Show loading toast
      const loadingToast = toast({
        title: "🔄 Creating Investor Room...",
        description: `Setting up your chat with ${investor.firm}. Please wait...`,
        duration: 3000,
      });

      // Navigate to messages page with investor data for auto-creation
      const params = new URLSearchParams({
        investorName: investor.name,
        investorFirm: investor.firm,
        investorId: investor.id,
        autoCreate: 'true'
      });
      
      // Navigate to founder messages page
      window.location.href = `/founder/dashboard/messages?${params.toString()}`;
      
    } catch (error) {
      console.error('Failed to start chat:', error);
      toast({
        title: "❌ Error",
        description: `Failed to create chat room with ${investor.firm}. Please try again.`,
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleScheduleCall = (investor: Investor) => {
    toast({
      title: "Schedule Call",
      description: `Opening calendar to schedule with ${investor.firm}.`,
    });
    // TODO: Open calendar
  };

  const getMatchBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 75) return 'bg-blue-100 text-blue-800 border-blue-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900">Investor Match</h1>
        </div>
        <p className="text-gray-600">
          AI-curated investor recommendations tailored to your sector, funding stage, and traction profile.
        </p>
      </div>

      {/* Company Selection Dropdown */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Select Your Company</CardTitle>
          <CardDescription>
            Choose a company from Deal Memo to find matching investors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="company-select">Company</Label>
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger id="company-select" className="w-full">
                    <SelectValue placeholder="Choose a company from Deal Memo" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.length === 0 ? (
                      <SelectItem value="none" disabled>No companies found</SelectItem>
                    ) : (
                      companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name} - {company.founderName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button
                  onClick={() => {
                    if (selectedCompany) {
                      fetchInvestorMatches(selectedCompany);
                    } else {
                      toast({
                        title: "No Company Selected",
                        description: "Please select a company first",
                        variant: "destructive"
                      });
                    }
                  }}
                  disabled={!selectedCompany || isLoadingMatches}
                  className="w-full"
                >
                  {isLoadingMatches ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Finding...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Find Investors
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {isLoadingMatches && (
              <div className="flex items-center justify-center gap-3 py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm text-gray-600">Finding investor matches...</span>
              </div>
            )}
            
            {selectedCompany && !isLoadingMatches && investors.length === 0 && (
              <div className="text-center py-4 text-sm text-gray-500">
                Click "Find Investors" to see matches for this company
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filter Bar */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="Pre-Seed">Pre-Seed</SelectItem>
                <SelectItem value="Seed">Seed</SelectItem>
                <SelectItem value="Series A">Series A</SelectItem>
                <SelectItem value="Series B">Series B</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                <SelectItem value="FinTech">FinTech</SelectItem>
                <SelectItem value="SaaS">SaaS</SelectItem>
                <SelectItem value="HealthTech">HealthTech</SelectItem>
                <SelectItem value="AI">AI/ML</SelectItem>
                <SelectItem value="EdTech">EdTech</SelectItem>
              </SelectContent>
            </Select>

            <Select value={geoFilter} onValueChange={setGeoFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Geography" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="india">India</SelectItem>
                <SelectItem value="asia">SE Asia</SelectItem>
                <SelectItem value="global">Global</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="match">Match %</SelectItem>
                <SelectItem value="ticket">Ticket Size</SelectItem>
                <SelectItem value="recent">Recent Activity</SelectItem>
              </SelectContent>
            </Select>

            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search investors or firms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Matches</p>
                <p className="text-2xl font-bold text-gray-900">{totalMatches}</p>
                <p className="text-xs text-gray-500 mt-1">investors found</p>
              </div>
              <Users className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Match Score</p>
                <p className="text-2xl font-bold text-gray-900">{avgMatchScore}%</p>
                <p className="text-xs text-gray-500 mt-1">across all matches</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Top Sector Fit</p>
                <p className="text-2xl font-bold text-gray-900">{topSector}</p>
                <p className="text-xs text-gray-500 mt-1">best alignment</p>
              </div>
              <Target className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investor Cards Grid */}
      {!selectedCompany && (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-8 text-center">
            <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Company to Get Started</h3>
            <p className="text-sm text-gray-600">
              Choose a company from Deal Memo above to see AI-curated investor matches
            </p>
          </CardContent>
        </Card>
      )}
      
      {selectedCompany && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInvestors.map((investor) => (
          <Card 
            key={investor.id} 
            className="border-gray-200 shadow-md hover:shadow-lg transition-shadow"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex items-center justify-center size-12 rounded-lg bg-primary/10 ring-2 ring-primary/20">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-bold text-gray-900 truncate">
                      {investor.firm}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      {investor.name}
                      {investor.designation && ` • ${investor.designation}`}
                    </CardDescription>
                  </div>
                </div>
                <Badge className={cn("ml-2", getMatchBadgeColor(investor.matchScore))}>
                  {investor.matchScore}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sector & Stage */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {investor.sectorFocus.slice(0, 3).map((sector) => (
                    <Badge key={sector} variant="secondary" className="text-xs">
                      {sector}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-600">
                  Stage: {investor.stage.join(', ')} • Ticket: {investor.avgTicketSize}
                </p>
              </div>

              {/* Why Match */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-blue-900 mb-1">Why This Match:</p>
                <p className="text-xs text-blue-800 leading-relaxed">{investor.whyMatch}</p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewProfile(investor)}
                  className="flex-1"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  View Profile
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRequestIntro(investor)}
                  className="flex-1"
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Request Intro
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSave(investor)}
                  className={investor.saved ? "text-yellow-600" : ""}
                >
                  <Star className={cn("h-4 w-4", investor.saved && "fill-yellow-500")} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      {/* Investor Profile Sidebar */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedInvestor && (
            <div className="space-y-6">
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-16 rounded-xl bg-primary/10 ring-2 ring-primary/20">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <SheetTitle className="text-2xl">{selectedInvestor.firm}</SheetTitle>
                    <SheetDescription className="text-base">
                      {selectedInvestor.name}
                      {selectedInvestor.designation && ` • ${selectedInvestor.designation}`}
                    </SheetDescription>
                  </div>
                  <Badge className={cn("ml-auto", getMatchBadgeColor(selectedInvestor.matchScore))}>
                    {selectedInvestor.matchScore}% Match
                  </Badge>
                </div>
              </SheetHeader>

              {/* Overview */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Investor Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{selectedInvestor.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">
                      Investment Range: {selectedInvestor.investmentRange.min} – {selectedInvestor.investmentRange.max}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Portfolio */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Portfolio Companies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedInvestor.portfolioCompanies.map((company) => (
                      <Badge key={company} variant="secondary">
                        {company}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Investment Focus */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Investment Focus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedInvestor.investmentFocus.map((focus) => (
                      <Badge key={focus} className="bg-primary/10 text-primary border-primary/20">
                        {focus}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Public Links */}
              {(selectedInvestor.linkedinUrl || selectedInvestor.crunchbaseUrl) && (
                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <LinkIcon className="h-5 w-5" />
                      Public Links
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedInvestor.linkedinUrl && (
                      <a
                        href={selectedInvestor.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        LinkedIn Profile
                      </a>
                    )}
                    {selectedInvestor.crunchbaseUrl && (
                      <a
                        href={selectedInvestor.crunchbaseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Crunchbase Profile
                      </a>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* AI Notes */}
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
                    <Sparkles className="h-5 w-5" />
                    AI Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-blue-800 leading-relaxed">{selectedInvestor.aiNotes}</p>
                </CardContent>
              </Card>

              {/* Deal History */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">Deal History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedInvestor.dealHistory.map((deal, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{deal.company}</p>
                          <p className="text-xs text-gray-600">{deal.sector} • {deal.date}</p>
                        </div>
                        <Badge variant="outline" className="font-semibold">
                          {deal.amount}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Connection Path */}
              {selectedInvestor.connectionPath && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-green-900">
                      <Users className="h-5 w-5" />
                      Connection Path
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-green-800">
                      <span className="font-semibold">Shared LinkedIn contact:</span> {selectedInvestor.connectionPath.sharedContact}
                    </p>
                    <p className="text-sm text-green-800 mt-2">
                      {selectedInvestor.connectionPath.mutualIntro}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  onClick={() => {
                    handleStartChat(selectedInvestor);
                    setIsSheetOpen(false);
                  }}
                  className="flex-1"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start Chat in Investor Room
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleScheduleCall(selectedInvestor);
                    setIsSheetOpen(false);
                  }}
                  className="flex-1"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Intro Call
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Bottom CTA Section */}
      {filteredInvestors.filter(inv => inv.matchScore >= 90).length >= 3 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 p-4">
          <div className="container mx-auto max-w-7xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="font-semibold text-gray-900">
                  💡 Tip: Found {filteredInvestors.filter(inv => inv.matchScore >= 90).length} investors with &gt;90% match — ready to reach out?
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => {
                  const topMatch = filteredInvestors.filter(inv => inv.matchScore >= 90)[0];
                  if (topMatch) handleRequestIntro(topMatch);
                }}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Create Intro Room
                </Button>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule AI Pitch Call
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

