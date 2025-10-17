'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Bot, User, Mic, MicOff, FileText, Loader2 } from "lucide-react";
import { aiChatService, ChatMessage, MemoData } from '@/lib/ai-chat-service';
import InvestmentMemo from './InvestmentMemo';

interface InterviewChatProps {
  sessionId?: string;
  onClose?: () => void;
}

export default function InterviewChat({ sessionId, onClose }: InterviewChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showMemo, setShowMemo] = useState(false);
  const [memoData, setMemoData] = useState<MemoData | null>(null);
  const [isGeneratingMemo, setIsGeneratingMemo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add welcome message on mount
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      sender: 'ai',
      content: 'Hello! I\'m your AI interviewer. I\'ll be asking you questions about your startup. Are you ready to begin?',
      timestamp: new Date(),
      metadata: {
        type: 'question',
        confidence: 0.95,
        topic: 'Introduction'
      }
    };
    setMessages([welcomeMessage]);
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsTyping(true);
    
    try {
      // Use the intelligent AI chat service
      const aiResponse = await aiChatService.sendMessage(newMessage.trim());
      
      // Update messages with both user and AI responses
      setMessages(aiChatService.getConversationHistory());
      
      // Check if we should generate memo
      if (aiResponse.metadata?.type === 'memo_generation') {
        setIsGeneratingMemo(true);
        const memo = await aiChatService.generateMemo();
        setMemoData(memo);
        setShowMemo(true);
        setIsGeneratingMemo(false);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsTyping(false);
    }
    
    setNewMessage('');
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

  if (showMemo && memoData) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Investment Memo Generated!</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMemo(false)}
          >
            Back to Chat
          </Button>
        </div>
        <InvestmentMemo memoData={memoData} onClose={() => setShowMemo(false)} />
      </div>
    );
  }

  return (
    <Card className="h-96 flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Interview Chat
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsListening(!isListening)}
              className={isListening ? 'bg-red-100 text-red-600' : ''}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.sender === 'ai' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-purple-100 text-purple-600">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
              
              {message.sender === 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3 justify-start">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-purple-100 text-purple-600">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
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

          {isGeneratingMemo && (
            <div className="flex gap-3 justify-start">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-green-100 text-green-600">
                  <FileText className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-green-50 rounded-lg px-4 py-2 border border-green-200">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                  <span className="text-sm text-green-700">Generating investment memo...</span>
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
            placeholder="Type your response..."
            disabled={isTyping}
          />
          <Button 
            onClick={sendMessage} 
            disabled={!newMessage.trim() || isTyping}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
