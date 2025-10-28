// Main chat orchestration hook
import { useState, useEffect } from 'react';
import { ChatRoom } from '../types/chat';
import { useChatRooms } from './useChatRooms';
import { useChatMessages } from './useChatMessages';

interface UseChatReturn {
  // Room management
  rooms: ChatRoom[];
  activeRoom: ChatRoom | null;
  totalUnread: number;
  
  // Room actions
  openRoom: (roomId: string) => void;
  closeRoom: () => void;
  createRoom: (founderId: string, memoId: string, founderName: string, companyName: string) => Promise<ChatRoom>;
  
  // Message management
  messages: any[];
  sendMessage: (content: string) => Promise<void>;
  markAsRead: () => Promise<void>;
  
  // Loading states
  loading: boolean;
  error: string | null;
}

export function useChat(userId: string, userRole: 'investor' | 'founder'): UseChatReturn {
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  
  // Use chat rooms hook
  const {
    rooms,
    loading: roomsLoading,
    error: roomsError,
    createRoom,
    getRoomById
  } = useChatRooms(userId, userRole);

  // Use chat messages hook
  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    sendMessage,
    markAsRead
  } = useChatMessages(activeRoomId);

  // Get active room
  const activeRoom = activeRoomId ? getRoomById(activeRoomId) : null;

  // Calculate total unread count
  const totalUnread = rooms.reduce((total, room) => total + room.unreadCount, 0);

  // Open a room
  const openRoom = (roomId: string) => {
    setActiveRoomId(roomId);
    // Mark messages as read when opening room
    markAsRead();
  };

  // Close active room
  const closeRoom = () => {
    setActiveRoomId(null);
  };

  // Auto-open first room if none is active and rooms exist
  useEffect(() => {
    if (!activeRoomId && rooms.length > 0) {
      setActiveRoomId(rooms[0].id);
    }
  }, [rooms, activeRoomId]);

  return {
    // Room management
    rooms,
    activeRoom,
    totalUnread,
    
    // Room actions
    openRoom,
    closeRoom,
    createRoom,
    
    // Message management
    messages,
    sendMessage,
    markAsRead,
    
    // Loading states
    loading: roomsLoading || messagesLoading,
    error: roomsError || messagesError
  };
}
