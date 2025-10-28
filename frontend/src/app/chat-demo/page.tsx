// Chat system demo page
'use client';

import React, { useState } from 'react';
import { ChatList } from '../../components/chat/ChatList';
import { ChatWindow } from '../../components/chat/ChatWindow';
import { useChat } from '../../hooks/useChat';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { MessageSquare, Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ChatDemoPage() {
  const [userRole, setUserRole] = useState<'investor' | 'founder'>('investor');
  
  // Mock user data
  const userId = userRole === 'investor' ? 'inv1' : 'founder1';
  
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
      if (userRole === 'investor') {
        await createRoom('founder1', 'memo123', 'John Doe', 'TechCorp AI');
      } else {
        await createRoom('inv1', 'memo123', 'Sarah Chen', 'Accel Partners');
      }
    } catch (err) {
      console.error('Failed to create room:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Chat System Demo</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Role:</span>
              <Button
                variant={userRole === 'investor' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUserRole('investor')}
              >
                Investor
              </Button>
              <Button
                variant={userRole === 'founder' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUserRole('founder')}
              >
                Founder
              </Button>
            </div>
            
            <Button onClick={handleCreateRoom}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Create Demo Room
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rooms.length}</div>
              <p className="text-xs text-muted-foreground">
                {userRole === 'investor' ? 'With founders' : 'With investors'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUnread}</div>
              <p className="text-xs text-muted-foreground">New messages</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Current Role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{userRole}</div>
              <p className="text-xs text-muted-foreground">
                {userRole === 'investor' ? 'Viewing founder conversations' : 'Viewing investor conversations'}
              </p>
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
                    Select a conversation
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Choose a conversation from the sidebar to start chatting
                  </p>
                  <Button onClick={handleCreateRoom}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Create Demo Room
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="max-w-7xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>How to Test the Chat System</CardTitle>
            <CardDescription>
              This demo shows the complete chat frontend implementation with mock data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">As Investor:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• View conversations with founders</li>
                  <li>• Send messages and see founder responses</li>
                  <li>• See company context and funding details</li>
                  <li>• Access from Memo 3 "Create Room" button</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">As Founder:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• View conversations with investors</li>
                  <li>• See investor firm information</li>
                  <li>• Access from "Investor Rooms" dashboard card</li>
                  <li>• Professional green-themed UI</li>
                </ul>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2">Features Demonstrated:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                <div>✓ Real-time UI updates</div>
                <div>✓ Role-based theming</div>
                <div>✓ Message bubbles</div>
                <div>✓ Typing indicators</div>
                <div>✓ Unread badges</div>
                <div>✓ Responsive design</div>
                <div>✓ Empty states</div>
                <div>✓ Loading states</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
