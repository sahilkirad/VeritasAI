// Main chat window component
import React, { useEffect, useRef, useState } from 'react';
import { ChatRoom, Message } from '../../types/chat';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { EmptyState } from './EmptyState';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';

interface ChatWindowProps {
  room: ChatRoom | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onClose?: () => void;
  userRole: 'investor' | 'founder';
  loading?: boolean;
  error?: string | null;
}

export function ChatWindow({
  room,
  messages,
  onSendMessage,
  onClose,
  userRole,
  loading = false,
  error = null
}: ChatWindowProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [currentUserId] = useState('current-user'); // Mock current user ID

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Simulate typing indicator when sending messages
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.senderId === currentUserId) {
        setIsTyping(true);
        const timer = setTimeout(() => setIsTyping(false), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [messages, currentUserId]);

  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState 
          type="no-conversations" 
          onAction={() => {/* Handle action */}}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Error</h3>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <ChatHeader 
        room={room} 
        onClose={onClose} 
        userRole={userRole}
      />

      {/* Messages area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="p-4 space-y-1">
            {messages.length === 0 ? (
              <EmptyState 
                type="no-messages"
                onAction={() => {/* Focus input */}}
              />
            ) : (
              messages.map((message, index) => {
                const isCurrentUser = message.senderId === currentUserId;
                const prevMessage = index > 0 ? messages[index - 1] : null;
                const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId;
                const showName = !isCurrentUser && (!prevMessage || prevMessage.senderId !== message.senderId);

                return (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isCurrentUser={isCurrentUser}
                    showAvatar={showAvatar}
                    showName={showName}
                  />
                );
              })
            )}

            {/* Typing indicator */}
            <TypingIndicator 
              userName={userRole === 'investor' ? room.founderName : room.investorName}
              isVisible={isTyping}
            />
          </div>
        </ScrollArea>
      </div>

      {/* Input area */}
      <ChatInput
        onSendMessage={onSendMessage}
        disabled={loading}
        placeholder={`Message ${userRole === 'investor' ? room.founderName : room.investorName}...`}
      />
    </div>
  );
}
