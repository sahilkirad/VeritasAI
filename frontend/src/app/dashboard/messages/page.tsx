'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChatList } from '../../../components/chat/ChatList';
import { ChatWindow } from '../../../components/chat/ChatWindow';
import { useChat } from '../../../hooks/useChat';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import { Plus, MessageSquare, TrendingUp, Clock, Target, ArrowLeft, Users, X, Check } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

// Sample founder data for frontend-only functionality
const SAMPLE_FOUNDERS = [
  {
    id: 'founder1',
    name: 'Arnav Gupta',
    email: 'arnav@we360.ai',
    company: 'we360.ai',
    industry: 'HRTech',
    stage: 'Series A'
  },
  {
    id: 'founder2',
    name: 'Utkarsh Choudhary',
    email: 'utkarsh@cashvisory.com',
    company: 'CASHVISORY',
    industry: 'FinTech',
    stage: 'Seed / Pre-Series A'
  },
  {
    id: 'founder3',
    name: 'Priya Sharma',
    email: 'priya@techstart.ai',
    company: 'TechStart Inc.',
    industry: 'SaaS',
    stage: 'Series B'
  },
  {
    id: 'founder4',
    name: 'Raj Patel',
    email: 'raj@healthtech.io',
    company: 'HealthTech Solutions',
    industry: 'HealthTech',
    stage: 'Series A'
  },
  {
    id: 'founder5',
    name: 'Sarah Johnson',
    email: 'sarah@edtech.co',
    company: 'EduTech Platform',
    industry: 'EdTech',
    stage: 'Seed'
  }
];

export default function InvestorMessagesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showFounderList, setShowFounderList] = useState(false);
  const [selectedFounder, setSelectedFounder] = useState<string | null>(null);
  const [founderName, setFounderName] = useState('');
  const [founderEmail, setFounderEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  const [autoCreating, setAutoCreating] = useState(false);
  const { user } = useAuth();
  
  // Use actual user data or fallback to mock data
  const userId = user?.uid || 'inv1';
  const userRole = 'investor' as const;

  const {
    rooms,
    activeRoom,
    totalUnread,
    openRoom,
    closeRoom,
    createRoom,
    messages,
    sendMessage,
    markAsRead,
    loading,
    error
  } = useChat(userId, userRole);

  // Auto-create room when coming from Memo 3
  useEffect(() => {
    const autoCreate = searchParams.get('autoCreate');
    const paramFounderName = searchParams.get('founderName');
    const paramFounderEmail = searchParams.get('founderEmail');
    const paramCompanyName = searchParams.get('companyName');

    if (autoCreate === 'true' && paramFounderName && paramFounderEmail && paramCompanyName && !autoCreating) {
      const autoCreateRoom = async () => {
        setAutoCreating(true);
        try {
          // Create the room
          const newRoom = await createRoom(
            paramFounderEmail.toLowerCase().replace(/[^a-z0-9]/g, ''),
            `memo_${Date.now()}`,
            paramFounderName.trim(),
            paramCompanyName.trim()
          );

          // Clean up URL params immediately
          router.replace('/dashboard/messages');

          // Wait a moment for the room to be in the rooms list, then open it and send greeting
          setTimeout(async () => {
            try {
              // Open the room
              openRoom(newRoom.id);

              // Wait a bit more for the room to be fully active, then send greeting message
              setTimeout(async () => {
                const greetingMessage = `Hello ${paramFounderName}! 👋\n\nI've reviewed your pitch and would like to discuss the investment opportunity for ${paramCompanyName}. I have some questions about your traction, unit economics, and market opportunity that I'd love to explore with you.\n\nLooking forward to our conversation!`;
                
                try {
                  await sendMessage(greetingMessage);
                } catch (err) {
                  console.error('Failed to send greeting message:', err);
                }
              }, 1500);
            } catch (err) {
              console.error('Failed to open room:', err);
            }
            
            setAutoCreating(false);
          }, 800);
        } catch (err) {
          console.error('Failed to auto-create room:', err);
          setAutoCreating(false);
          router.replace('/dashboard/messages');
        }
      };

      autoCreateRoom();
    }
  }, [searchParams, createRoom, sendMessage, openRoom, router, autoCreating]);

  const handleSelectFounder = (founder: typeof SAMPLE_FOUNDERS[0]) => {
    setFounderName(founder.name);
    setFounderEmail(founder.email);
    setCompanyName(founder.company);
    setSelectedFounder(founder.id);
    setShowFounderList(false);
  };

  const handleCreateRoom = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!founderName.trim() || !founderEmail.trim() || !companyName.trim()) {
      return;
    }

    try {
      // Create room on frontend - this will work with the useChat hook
      await createRoom(
        founderEmail.toLowerCase().replace(/[^a-z0-9]/g, ''),
        `memo_${Date.now()}`,
        founderName.trim(),
        companyName.trim()
      );
      
      // Send initial message if provided
      if (initialMessage.trim()) {
        // The message will be sent after room is created
        setTimeout(() => {
          if (initialMessage.trim()) {
            // This will be handled by the chat system
            console.log('Initial message:', initialMessage);
          }
        }, 500);
      }
      
      // Reset form
      setFounderName('');
      setFounderEmail('');
      setCompanyName('');
      setInitialMessage('');
      setSelectedFounder(null);
      setShowCreateRoom(false);
    } catch (err) {
      console.error('Failed to create room:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
            <p className="text-muted-foreground mt-1">Connect with founders and evaluate investment opportunities</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold flex items-center justify-center gap-2">
              {rooms.length}
              {totalUnread > 0 && (
                <Badge variant="destructive" className="text-xs animate-pulse">
                  {totalUnread} new
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Active conversations</p>
          </div>
          
          <Button onClick={() => setShowCreateRoom(true)} variant="default" className="gap-2">
            <Plus className="h-4 w-4" />
            New Conversation
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Conversations</p>
                <p className="text-xl font-bold mt-0.5">{rooms.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg border border-red-100">
                <Clock className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unread Messages</p>
                <p className="text-xl font-bold mt-0.5">{totalUnread}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg border border-green-100">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Chats</p>
                <p className="text-xl font-bold mt-0.5">
                  {rooms.filter(room => room.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg border border-purple-100">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Response Rate</p>
                <p className="text-xl font-bold mt-0.5">98%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Interface */}
      <Card className="border">
        <CardContent className="p-0">
          <div className="h-[600px] flex">
            {/* Chat List Sidebar */}
            <div className="w-1/3 border-r">
              <ChatList
                rooms={rooms}
                activeRoomId={activeRoom?.id || null}
                onRoomSelect={openRoom}
                userRole={userRole}
                loading={loading}
              />
            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col">
              {autoCreating ? (
                <div className="flex-1 flex items-center justify-center bg-muted/20">
                  <div className="text-center max-w-md">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <h3 className="text-lg font-semibold mb-2">
                      Creating conversation...
                    </h3>
                    <p className="text-muted-foreground">
                      Setting up your chat with the founder
                    </p>
                  </div>
                </div>
              ) : activeRoom ? (
                <ChatWindow
                  room={activeRoom}
                  messages={messages}
                  onSendMessage={sendMessage}
                  userRole={userRole}
                  loading={loading}
                  error={error}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center bg-muted/20">
                  <div className="text-center max-w-md">
                    <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Choose a conversation from the sidebar to start chatting, or start a new conversation with a founder.
                    </p>
                    <Button onClick={() => setShowCreateRoom(true)} variant="default" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Start New Conversation
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Room Modal */}
      {showCreateRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full border">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle>Start New Conversation</CardTitle>
                <CardDescription className="mt-1">
                  Select a founder or enter custom details to start a conversation
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCreateRoom(false);
                  setFounderName('');
                  setFounderEmail('');
                  setCompanyName('');
                  setInitialMessage('');
                  setSelectedFounder(null);
                  setShowFounderList(false);
                }}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Founder Selection */}
              <div className="space-y-2">
                <Label>Select Founder</Label>
                {!showFounderList && !selectedFounder ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowFounderList(true)}
                    className="w-full justify-start"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Choose from sample founders
                  </Button>
                ) : showFounderList ? (
                  <div className="space-y-2 border rounded-lg p-3 max-h-64 overflow-y-auto">
                    {SAMPLE_FOUNDERS.map((founder) => (
                      <div
                        key={founder.id}
                        onClick={() => handleSelectFounder(founder)}
                        className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{founder.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{founder.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{founder.company} • {founder.industry}</p>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowFounderList(false);
                        setFounderName('');
                        setFounderEmail('');
                        setCompanyName('');
                        setSelectedFounder(null);
                      }}
                      className="w-full mt-2"
                    >
                      Enter custom details instead
                    </Button>
                  </div>
                ) : selectedFounder ? (
                  <div className="border rounded-lg p-3 bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{founderName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{founderName}</p>
                          <p className="text-xs text-muted-foreground">{companyName} • {founderEmail}</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFounder(null);
                          setFounderName('');
                          setFounderEmail('');
                          setCompanyName('');
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>

              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="founder-name">Founder Name *</Label>
                  <Input
                    id="founder-name"
                    value={founderName}
                    onChange={(e) => {
                      setFounderName(e.target.value);
                      if (selectedFounder) setSelectedFounder(null);
                    }}
                    placeholder="Enter founder's full name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="founder-email">Founder Email *</Label>
                  <Input
                    id="founder-email"
                    type="email"
                    value={founderEmail}
                    onChange={(e) => {
                      setFounderEmail(e.target.value);
                      if (selectedFounder) setSelectedFounder(null);
                    }}
                    placeholder="founder@company.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name *</Label>
                  <Input
                    id="company-name"
                    value={companyName}
                    onChange={(e) => {
                      setCompanyName(e.target.value);
                      if (selectedFounder) setSelectedFounder(null);
                    }}
                    placeholder="Enter company name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="initial-message">Initial Message (Optional)</Label>
                  <Textarea
                    id="initial-message"
                    value={initialMessage}
                    onChange={(e) => setInitialMessage(e.target.value)}
                    placeholder="Add an optional message to start the conversation..."
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2 justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateRoom(false);
                      setFounderName('');
                      setFounderEmail('');
                      setCompanyName('');
                      setInitialMessage('');
                      setSelectedFounder(null);
                      setShowFounderList(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!founderName.trim() || !founderEmail.trim() || !companyName.trim()}>
                    <Check className="h-4 w-4 mr-2" />
                    Create Conversation
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
