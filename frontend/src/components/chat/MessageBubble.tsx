// Individual message bubble component
import React from 'react';
import { Message } from '../../types/chat';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { cn } from '../../lib/utils';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  showAvatar?: boolean;
  showName?: boolean;
}

export function MessageBubble({ 
  message, 
  isCurrentUser, 
  showAvatar = true, 
  showName = true 
}: MessageBubbleProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={cn(
      'flex gap-3 mb-4',
      isCurrentUser ? 'justify-end' : 'justify-start'
    )}>
      {/* Avatar for received messages */}
      {!isCurrentUser && showAvatar && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-gray-100 text-gray-600">
            {message.senderName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message content */}
      <div className={cn(
        'flex flex-col max-w-[70%]',
        isCurrentUser ? 'items-end' : 'items-start'
      )}>
        {/* Sender name for received messages */}
        {!isCurrentUser && showName && (
          <span className="text-xs text-gray-500 mb-1 px-1">
            {message.senderName}
          </span>
        )}

        {/* Message bubble */}
        <div className={cn(
          'rounded-lg px-4 py-2 shadow-sm',
          isCurrentUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-900'
        )}>
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>

        {/* Timestamp */}
        <span className={cn(
          'text-xs mt-1 px-1',
          isCurrentUser ? 'text-blue-100' : 'text-gray-500'
        )}>
          {formatTime(message.timestamp)}
        </span>
      </div>

      {/* Avatar for sent messages */}
      {isCurrentUser && showAvatar && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-blue-600 text-white">
            You
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
