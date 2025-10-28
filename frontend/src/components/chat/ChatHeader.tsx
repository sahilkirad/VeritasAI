// Chat window header component
import React from 'react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { MoreVertical, X, Phone, Video } from 'lucide-react';
import { ChatRoom } from '../../types/chat';
import { cn } from '../../lib/utils';

interface ChatHeaderProps {
  room: ChatRoom;
  onClose?: () => void;
  userRole: 'investor' | 'founder';
}

export function ChatHeader({ room, onClose, userRole }: ChatHeaderProps) {
  const displayName = userRole === 'investor' ? room.founderName : room.investorName;
  const displayCompany = userRole === 'investor' ? room.companyName : room.investorFirm || 'Investor';

  return (
    <div className={cn(
      'flex items-center justify-between p-4 border-b',
      userRole === 'investor' 
        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
        : 'bg-gradient-to-r from-green-600 to-green-700 text-white'
    )}>
      {/* Left side - User info */}
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className={cn(
            'text-white font-semibold',
            userRole === 'investor' ? 'bg-blue-500' : 'bg-green-500'
          )}>
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col">
          <h3 className="font-semibold text-sm">{displayName}</h3>
          <p className="text-xs opacity-90">{displayCompany}</p>
          
          {/* Context badges */}
          <div className="flex gap-1 mt-1">
            <Badge variant="secondary" className="text-xs px-2 py-0">
              {room.companyStage || 'Unknown Stage'}
            </Badge>
            {room.fundingAsk && (
              <Badge variant="secondary" className="text-xs px-2 py-0">
                {room.fundingAsk}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        {/* Online status indicator */}
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-xs opacity-90">Online</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {/* Call buttons (placeholder) */}
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 p-2"
          >
            <Phone className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 p-2"
          >
            <Video className="h-4 w-4" />
          </Button>

          {/* More options */}
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 p-2"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>

          {/* Close button */}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
