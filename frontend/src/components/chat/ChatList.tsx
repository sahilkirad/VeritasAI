// Chat list component
import React, { useState } from 'react';
import { ChatRoom } from '../../types/chat';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search, Filter, MessageCircle } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { cn } from '../../lib/utils';

interface ChatListProps {
  rooms: ChatRoom[];
  activeRoomId: string | null;
  onRoomSelect: (roomId: string) => void;
  userRole: 'investor' | 'founder';
  loading?: boolean;
}

export function ChatList({
  rooms,
  activeRoomId,
  onRoomSelect,
  userRole,
  loading = false
}: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'lastMessage' | 'unread' | 'name'>('lastMessage');

  // Filter and sort rooms
  const filteredRooms = rooms
    .filter(room => {
      const searchTerm = searchQuery.toLowerCase();
      const displayName = userRole === 'investor' ? room.founderName : room.investorName;
      const companyName = userRole === 'investor' ? room.companyName : room.investorFirm || '';
      
      return (
        displayName.toLowerCase().includes(searchTerm) ||
        companyName.toLowerCase().includes(searchTerm) ||
        room.lastMessage.toLowerCase().includes(searchTerm)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'unread':
          return b.unreadCount - a.unreadCount;
        case 'name':
          const nameA = userRole === 'investor' ? a.founderName : a.investorName;
          const nameB = userRole === 'investor' ? b.founderName : b.investorName;
          return nameA.localeCompare(nameB);
        case 'lastMessage':
        default:
          return b.lastMessageAt.getTime() - a.lastMessageAt.getTime();
      }
    });

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3 p-3">
              <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            {userRole === 'investor' ? 'Founders' : 'Investors'}
          </h2>
        </div>
        <div className="flex-1">
          <EmptyState 
            type="no-conversations"
            actionText={userRole === 'investor' ? 'Find Founders' : 'Find Investors'}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <MessageCircle className="h-5 w-5" />
          {userRole === 'investor' ? 'Founders' : 'Investors'}
        </h2>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Sort options */}
        <div className="flex gap-2">
          <Button
            variant={sortBy === 'lastMessage' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('lastMessage')}
          >
            Recent
          </Button>
          <Button
            variant={sortBy === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('unread')}
          >
            Unread
          </Button>
          <Button
            variant={sortBy === 'name' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('name')}
          >
            Name
          </Button>
        </div>
      </div>

      {/* Room list */}
      <div className="flex-1 overflow-y-auto">
        {filteredRooms.length === 0 ? (
          <EmptyState type="no-search-results" />
        ) : (
          <div className="divide-y">
            {filteredRooms.map((room) => {
              const displayName = userRole === 'investor' ? room.founderName : room.investorName;
              const displayCompany = userRole === 'investor' ? room.companyName : room.investorFirm || '';
              const isActive = room.id === activeRoomId;

              return (
                <div
                  key={room.id}
                  onClick={() => onRoomSelect(room.id)}
                  className={cn(
                    'p-4 cursor-pointer hover:bg-gray-50 transition-colors',
                    isActive && 'bg-blue-50 border-r-2 border-blue-500'
                  )}
                >
                  <div className="flex gap-3">
                    {/* Avatar */}
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarFallback className={cn(
                        'text-white font-semibold',
                        userRole === 'investor' ? 'bg-green-500' : 'bg-blue-500'
                      )}>
                        {displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-sm truncate">
                          {displayName}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatTime(room.lastMessageAt)}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 truncate mb-2">
                        {displayCompany}
                      </p>

                      <p className="text-sm text-gray-500 truncate">
                        {room.lastMessage}
                      </p>

                      {/* Context badges */}
                      <div className="flex gap-1 mt-2">
                        {room.companyStage && (
                          <Badge variant="outline" className="text-xs px-2 py-0">
                            {room.companyStage}
                          </Badge>
                        )}
                        {room.fundingAsk && (
                          <Badge variant="outline" className="text-xs px-2 py-0">
                            {room.fundingAsk}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Unread badge */}
                    {room.unreadCount > 0 && (
                      <div className="flex-shrink-0">
                        <Badge 
                          variant="destructive" 
                          className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                          {room.unreadCount > 9 ? '9+' : room.unreadCount}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
