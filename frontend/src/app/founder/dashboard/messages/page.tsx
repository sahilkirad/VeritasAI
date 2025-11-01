// Founder messages page
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChatList } from '../../../../components/chat/ChatList';
import { ChatWindow } from '../../../../components/chat/ChatWindow';
import { useChat } from '../../../../hooks/useChat';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Plus, MessageSquare, Users, TrendingUp, Clock, Target, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function FounderMessagesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [autoCreating, setAutoCreating] = useState(false);
  const { toast } = useToast();
  
  // Mock user data - in real app, get from auth context
  const userId = 'founder1';
  const userRole = 'founder' as const;

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

  // Auto-create room when coming from Investor Match page
  useEffect(() => {
    const autoCreate = searchParams.get('autoCreate');
    const investorName = searchParams.get('investorName');
    const investorFirm = searchParams.get('investorFirm');
    const investorId = searchParams.get('investorId');

    if (autoCreate === 'true' && investorName && investorFirm && investorId && !autoCreating) {
      const autoCreateRoom = async () => {
        setAutoCreating(true);
        
        // Show professional loading toast
        const loadingToast = toast({
          title: "✨ Creating Investor Room",
          description: `Setting up your chat with ${investorFirm}. This will just take a moment...`,
          duration: 5000,
        });

        try {
          // Create the room with investor details
          const newRoom = await createRoom(
            investorId,
            `investor_${investorId}_${Date.now()}`,
            investorName,
            investorFirm
          );

          // Clean up URL params
          router.replace('/founder/dashboard/messages');

          // Wait for room to be ready, then open it
          setTimeout(async () => {
            try {
              openRoom(newRoom.id);

              // Send a greeting message from the founder
              setTimeout(async () => {
                const greetingMessage = `Hello ${investorName}! 👋\n\nThank you for your interest in our startup. I'm excited to discuss the investment opportunity and answer any questions you may have.\n\nLooking forward to our conversation!`;
                
                try {
                  await sendMessage(greetingMessage);
                  
                  // Show success toast
                  loadingToast.dismiss();
                  toast({
                    title: "🎉 Investor Room Created Successfully!",
                    description: `Your chat with ${investorFirm} is now active. You can start the conversation!`,
                    duration: 6000,
                  });
                } catch (err) {
                  console.error('Failed to send greeting message:', err);
                  loadingToast.dismiss();
                  toast({
                    title: "✅ Room Created",
                    description: `Chat with ${investorFirm} is ready. You can now send messages.`,
                    duration: 5000,
                  });
                }
              }, 1500);
            } catch (err) {
              console.error('Failed to open room:', err);
              loadingToast.dismiss();
              toast({
                title: "✅ Room Created",
                description: `Your chat with ${investorFirm} is ready. Select it from the sidebar to start chatting.`,
                duration: 5000,
              });
            }
            
            setAutoCreating(false);
          }, 800);
        } catch (err) {
          console.error('Failed to auto-create room:', err);
          loadingToast.dismiss();
          setAutoCreating(false);
          toast({
            title: "❌ Error Creating Room",
            description: `Failed to create chat room with ${investorFirm}. Please try again.`,
            variant: "destructive",
            duration: 5000,
          });
        }
      };

      autoCreateRoom();
    }
  }, [searchParams, autoCreating, createRoom, openRoom, sendMessage, router, toast]);

  const handleCreateRoom = async () => {
    try {
      await createRoom('inv1', 'memo123', 'Sarah Chen', 'Accel Partners');
      setShowCreateRoom(false);
      toast({
        title: "✅ Room Created",
        description: "Your chat room with the investor has been created successfully.",
        duration: 5000,
      });
    } catch (err) {
      console.error('Failed to create room:', err);
      toast({
        title: "❌ Error",
        description: "Failed to create chat room. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/founder/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Investor Conversations</h1>
                <p className="text-gray-600">Connect with investors and advance your funding discussions</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600 flex items-center gap-2">
                  {rooms.length}
                  {totalUnread > 0 && (
                    <Badge variant="destructive" className="text-xs animate-pulse">
                      {totalUnread} unread
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">Active conversations</p>
              </div>
              
              <Button onClick={() => setShowCreateRoom(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Connect with Investor
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Conversations</p>
                  <p className="text-xl font-bold text-gray-900">{rooms.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Clock className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Unread Messages</p>
                  <p className="text-xl font-bold text-gray-900">{totalUnread}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Chats</p>
                  <p className="text-xl font-bold text-gray-900">
                    {rooms.filter(room => room.status === 'active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Response Rate</p>
                  <p className="text-xl font-bold text-gray-900">95%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm border h-[600px] flex">
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
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6"></div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">
                    Creating Investor Room...
                  </h3>
                  <p className="text-gray-600 text-base">
                    Setting up your chat. This will just take a moment.
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
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Select an investor conversation
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Choose a conversation from the sidebar to start chatting with investors
                  </p>
                  <Button onClick={() => setShowCreateRoom(true)} className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Connect with Investor
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Room Modal (placeholder) */}
      {showCreateRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Connect with Investor</h3>
            <p className="text-gray-600 mb-4">
              Investors will reach out to you after reviewing your Memo 3. 
              You can also share your profile to attract more investors.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCreateRoom(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRoom}>
                Create Demo Room
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
