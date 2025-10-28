'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  FileText, 
  Link as LinkIcon, 
  PlusCircle, 
  Shield, 
  MessageSquare, 
  Users, 
  Calendar, 
  TrendingUp, 
  Settings, 
  MoreVertical,
  Download,
  Share2,
  Lock,
  Unlock,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Search,
  Filter,
  BarChart3,
  Target,
  Zap
} from "lucide-react";
import Link from "next/link";

const investorList = [
    { 
        id: 'vc1', 
        name: 'Momentum Ventures', 
        avatar: 'https://picsum.photos/seed/vc1/80/80',
        focus: ['AI/ML', 'Enterprise Software'],
        checkSize: '$500K - $2M',
        stage: 'Series A',
        status: 'active',
        lastActivity: '2 hours ago',
        engagement: 'high'
    },
    { 
        id: 'vc2', 
        name: 'Starlight Capital', 
        avatar: 'https://picsum.photos/seed/vc2/80/80',
        focus: ['Fintech', 'B2B SaaS'],
        checkSize: '$1M - $5M',
        stage: 'Series A',
        status: 'active',
        lastActivity: '1 day ago',
        engagement: 'medium'
    },
    { 
        id: 'vc3', 
        name: 'Horizon Ventures', 
        avatar: 'https://picsum.photos/seed/vc3/80/80',
        focus: ['Deep Tech', 'Climate'],
        checkSize: '$2M - $10M',
        stage: 'Series B',
        status: 'pending',
        lastActivity: '3 days ago',
        engagement: 'low'
    },
    { 
        id: 'vc4', 
        name: 'TechFlow Partners', 
        avatar: 'https://picsum.photos/seed/vc4/80/80',
        focus: ['AI', 'Healthcare'],
        checkSize: '$1M - $3M',
        stage: 'Series A',
        status: 'active',
        lastActivity: '5 hours ago',
        engagement: 'high'
    },
];

const documents = [
    { id: 'deck', name: 'QuantumLeap_Deck_Q2.pdf', type: 'deck', size: '2.4 MB', updated: '2 days ago' },
    { id: 'model', name: 'Financial_Model_v3.xlsx', type: 'model', size: '1.8 MB', updated: '1 week ago' },
    { id: 'video', name: 'Founder_Video_Pitch.mp4', type: 'video', size: '45.2 MB', updated: '3 days ago' },
    { id: 'bios', name: 'Team_Bios.docx', type: 'doc', size: '890 KB', updated: '1 week ago' },
    { id: 'metrics', name: 'Product_Metrics_Dashboard.pdf', type: 'metrics', size: '3.1 MB', updated: '1 day ago' },
    { id: 'legal', name: 'Legal_Documents_Package.zip', type: 'legal', size: '12.5 MB', updated: '2 weeks ago' },
];

const rooms = [
    {
        id: 'room1',
        name: 'First Look Room',
        description: 'For initial outreach. Contains high-level info.',
        type: 'first-look',
        status: 'active',
        participants: investorList.slice(0, 2),
        documents: documents.slice(0, 1),
        views: 12,
        lastActivity: '2 hours ago',
        engagement: 'high',
        created: '1 week ago',
        color: 'blue'
    },
    {
        id: 'room2',
        name: 'Diligence Room',
        description: 'For investors in the diligence phase.',
        type: 'diligence',
        status: 'active',
        participants: investorList.slice(2, 3),
        documents: documents.slice(0, 3),
        views: 8,
        lastActivity: '1 day ago',
        engagement: 'medium',
        created: '2 weeks ago',
        color: 'green'
    },
    {
        id: 'room3',
        name: 'Series A Prospects',
        description: 'Targeted room for Series A investors.',
        type: 'series-a',
        status: 'pending',
        participants: investorList.slice(3, 4),
        documents: documents.slice(0, 4),
        views: 3,
        lastActivity: '3 days ago',
        engagement: 'low',
        created: '3 days ago',
        color: 'purple'
    }
];


export default function DataRoomsPage() {
  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoomColor = (color: string) => {
    switch (color) {
      case 'blue': return 'border-blue-200 bg-blue-50/50';
      case 'green': return 'border-green-200 bg-green-50/50';
      case 'purple': return 'border-purple-200 bg-purple-50/50';
      default: return 'border-gray-200 bg-gray-50/50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Investor Rooms</h1>
              <p className="text-gray-600 mt-2">Control your narrative. Create secure rooms and grant specific investors access to specific information.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 gap-2">
                <PlusCircle className="h-4 w-4" />
                Create New Room
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Rooms</p>
                  <p className="text-2xl font-bold text-gray-900">{rooms.filter(r => r.status === 'active').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Investors</p>
                  <p className="text-2xl font-bold text-gray-900">{investorList.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900">{rooms.reduce((sum, room) => sum + room.views, 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Engagement Rate</p>
                  <p className="text-2xl font-bold text-gray-900">87%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Rooms List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Your Rooms</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="Search rooms..." className="pl-10 w-64" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {rooms.map((room) => (
                <Card key={room.id} className={`${getRoomColor(room.color)} hover:shadow-lg transition-all duration-200`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                          <Badge className={getStatusColor(room.status)}>
                            {room.status}
                          </Badge>
                          <Badge className={getEngagementColor(room.engagement)}>
                            {room.engagement} engagement
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-4">{room.description}</p>
                        
                        {/* Participants */}
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center -space-x-2">
                            {room.participants.map((participant, index) => (
                              <Avatar key={participant.id} className="h-8 w-8 border-2 border-white">
                                <AvatarImage src={participant.avatar} />
                                <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            {room.participants.length} investor{room.participants.length !== 1 ? 's' : ''}
                          </span>
                        </div>

                        {/* Documents */}
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Documents ({room.documents.length})</p>
                          <div className="flex flex-wrap gap-2">
                            {room.documents.map((doc) => (
                              <div key={doc.id} className="flex items-center gap-2 bg-white/60 rounded-lg px-3 py-1 text-sm">
                                <FileText className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-700">{doc.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{room.views} views</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>Last activity: {room.lastActivity}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Created: {room.created}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        View Room
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="h-4 w-4 mr-2" />
                        Edit Settings
                      </Button>
                      <Link href="/founder/dashboard/messages">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Start Chat
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create New Room
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Invite Investors
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Upload Documents
                </Button>
                <Link href="/founder/dashboard/messages">
                  <Button className="w-full justify-start bg-green-600 hover:bg-green-700">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    View All Chats
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Eye className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">First Look Room viewed</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New message received</p>
                    <p className="text-xs text-gray-500">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Download className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Document downloaded</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investor Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Investor Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Most Engaged</span>
                    <span className="text-sm font-medium">Momentum Ventures</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Most Downloads</span>
                    <span className="text-sm font-medium">Pitch Deck</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg. Response Time</span>
                    <span className="text-sm font-medium">2.3 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
