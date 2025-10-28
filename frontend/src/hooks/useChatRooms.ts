// Hook for managing chat rooms
import { useState, useEffect } from 'react';
import { ChatRoom } from '../types/chat';
import { getRoomsForUser } from '../lib/mockChatData';

interface UseChatRoomsReturn {
  rooms: ChatRoom[];
  loading: boolean;
  error: string | null;
  createRoom: (founderId: string, memoId: string, founderName: string, companyName: string) => Promise<ChatRoom>;
  getRoomById: (roomId: string) => ChatRoom | undefined;
  refreshRooms: () => void;
}

export function useChatRooms(userId: string, userRole: 'investor' | 'founder'): UseChatRoomsReturn {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load rooms on mount and when userId/userRole changes
  useEffect(() => {
    const loadRooms = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const userRooms = getRoomsForUser(userId, userRole);
        setRooms(userRooms);
      } catch (err) {
        setError('Failed to load chat rooms');
        console.error('Error loading rooms:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId && userRole) {
      loadRooms();
    }
  }, [userId, userRole]);

  const createRoom = async (founderId: string, memoId: string, founderName: string, companyName: string): Promise<ChatRoom> => {
    try {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if room already exists
      const existingRoom = rooms.find(room => 
        room.founderId === founderId && 
        room.memoId === memoId && 
        room.investorId === userId
      );
      
      if (existingRoom) {
        return existingRoom;
      }
      
      // Create new room
      const newRoom: ChatRoom = {
        id: `${userId}_${founderId}_${memoId}`,
        investorId: userId,
        founderId,
        memoId,
        companyName,
        founderName,
        investorName: 'You', // Will be replaced with actual name
        lastMessage: 'Chat started',
        lastMessageAt: new Date(),
        unreadCount: 0,
        status: 'active',
        companyStage: 'Unknown',
        fundingAsk: 'Unknown',
        sector: ['Technology']
      };
      
      // Add to rooms list
      setRooms(prev => [newRoom, ...prev]);
      
      return newRoom;
    } catch (err) {
      setError('Failed to create chat room');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getRoomById = (roomId: string): ChatRoom | undefined => {
    return rooms.find(room => room.id === roomId);
  };

  const refreshRooms = () => {
    if (userId && userRole) {
      const userRooms = getRoomsForUser(userId, userRole);
      setRooms(userRooms);
    }
  };

  return {
    rooms,
    loading,
    error,
    createRoom,
    getRoomById,
    refreshRooms
  };
}
