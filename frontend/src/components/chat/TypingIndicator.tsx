// Typing indicator component
import React from 'react';
import { Avatar, AvatarFallback } from '../ui/avatar';

interface TypingIndicatorProps {
  userName: string;
  isVisible: boolean;
}

export function TypingIndicator({ userName, isVisible }: TypingIndicatorProps) {
  if (!isVisible) return null;

  return (
    <div className="flex gap-3 justify-start mb-4">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-gray-100 text-gray-600">
          {userName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="bg-gray-100 rounded-lg px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div 
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
              style={{ animationDelay: '0.1s' }}
            ></div>
            <div 
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
              style={{ animationDelay: '0.2s' }}
            ></div>
          </div>
          <span className="text-xs text-gray-500">typing...</span>
        </div>
      </div>
    </div>
  );
}
