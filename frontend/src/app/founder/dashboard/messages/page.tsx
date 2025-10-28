// Founder messages page
'use client';

import React, { useState } from 'react';
import { ChatList } from '../../../../components/chat/ChatList';
import { ChatWindow } from '../../../../components/chat/ChatWindow';
import { useChat } from '../../../../hooks/useChat';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Plus, MessageSquare, Users, TrendingUp, Clock, Target, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function FounderMessagesPage() {
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  
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

  const handleCreateRoom = async () => {
    try {
      await createRoom('inv1', 'memo123', 'Sarah Chen', 'Accel Partners');
      setShowCreateRoom(false);
    } catch (err) {
      console.error('Failed to create room:', err);
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
            {activeRoom ? (
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
