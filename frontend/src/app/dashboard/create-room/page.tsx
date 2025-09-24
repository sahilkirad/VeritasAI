'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send, Users, Clock, ArrowLeft } from "lucide-react";
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  sender: 'investor' | 'founder';
  senderName: string;
  content: string;
  timestamp: Date;
  avatar?: string;
}

interface Room {
  id: string;
  title: string;
  founderName: string;
  founderEmail: string;
  companyName: string;
  status: 'active' | 'pending' | 'closed';
  createdAt: Date;
  lastMessage?: Date;
}

export default function CreateRoomPage() {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Create a new room when component mounts
    createNewRoom();
  }, []);

  const createNewRoom = () => {
    const newRoom: Room = {
      id: `room_${Date.now()}`,
      title: 'Investment Discussion',
      founderName: 'Abhishek Shirsath',
      founderEmail: 'abhishek@arealisgateway.com',
      companyName: 'Arealis Gateway',
      status: 'pending',
      createdAt: new Date(),
    };
    setRoom(newRoom);

    // Add welcome message
    const welcomeMessage: Message = {
      id: 'welcome',
      sender: 'investor',
      senderName: 'You',
      content: 'Hello! I\'d like to discuss the investment opportunity for Arealis Gateway. I\'ve reviewed your pitch and have some questions.',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !room) return;

    const message: Message = {
      id: `msg_${Date.now()}`,
      sender: 'investor',
      senderName: 'You',
      content: newMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setIsLoading(true);

    // Simulate founder response (in real app, this would be a WebSocket or API call)
    setTimeout(() => {
      const founderResponse: Message = {
        id: `msg_${Date.now() + 1}`,
        sender: 'founder',
        senderName: room.founderName,
        content: 'Thank you for your interest! I\'d be happy to answer any questions you have about our business model, traction, or future plans.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, founderResponse]);
      setIsLoading(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!room) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Deal Memo
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create a Room</h1>
            <p className="text-muted-foreground mt-1">
              Discuss investment opportunities with founders
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            {room.status === 'pending' ? 'Pending Response' : 'Active'}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Room Info Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Room Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{room.founderName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{room.founderName}</p>
                  <p className="text-sm text-muted-foreground">{room.founderEmail}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Company</p>
                  <p className="text-sm">{room.companyName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Room ID</p>
                  <p className="text-sm font-mono">{room.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <p className="text-sm">{room.createdAt.toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={room.status === 'active' ? 'default' : 'secondary'}>
                    {room.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Discussion with {room.founderName}
              </CardTitle>
              <CardDescription>
                Ask questions about the investment opportunity
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.sender === 'investor' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.sender === 'founder' && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        message.sender === 'investor'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'investor' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                    
                    {message.sender === 'investor' && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>Y</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{room.founderName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 rounded-lg px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isLoading}
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!newMessage.trim() || isLoading}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              Schedule Follow-up Call
            </Button>
            <Button variant="outline" size="sm">
              Request Additional Documents
            </Button>
            <Button variant="outline" size="sm">
              Share Room with Team
            </Button>
            <Button variant="outline" size="sm">
              Export Conversation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
