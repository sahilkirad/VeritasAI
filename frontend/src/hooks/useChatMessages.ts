// Hook for managing chat messages
import { useState, useEffect } from 'react';
import { Message } from '../types/chat';
import { getMessagesForRoom } from '../lib/mockChatData';

interface UseChatMessagesReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  markAsRead: () => Promise<void>;
  refreshMessages: () => void;
}

export function useChatMessages(roomId: string | null): UseChatMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load messages when roomId changes
  useEffect(() => {
    if (!roomId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const roomMessages = getMessagesForRoom(roomId);
        setMessages(roomMessages);
      } catch (err) {
        setError('Failed to load messages');
        console.error('Error loading messages:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [roomId]);

  const sendMessage = async (content: string): Promise<void> => {
    if (!roomId || !content.trim()) return;

    try {
      setError(null);
      
      // Create optimistic message
      const tempMessage: Message = {
        id: `temp_${Date.now()}`,
        roomId,
        senderId: 'current-user', // Will be replaced with actual user ID
        senderType: 'investor', // Will be determined by user role
        senderName: 'You',
        content: content.trim(),
        timestamp: new Date(),
        read: false
      };

      // Add message immediately for optimistic UI
      setMessages(prev => [...prev, tempMessage]);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Replace temp message with real one
      const realMessage: Message = {
        ...tempMessage,
        id: `msg_${Date.now()}`,
        senderId: 'current-user',
        senderType: 'investor',
        read: true
      };

      setMessages(prev => 
        prev.map(msg => msg.id === tempMessage.id ? realMessage : msg)
      );

      // Simulate founder response after 2-3 seconds
      setTimeout(() => {
        const founderResponse: Message = {
          id: `msg_${Date.now() + 1}`,
          roomId,
          senderId: 'founder',
          senderType: 'founder',
          senderName: 'Founder',
          content: 'Thank you for your message! I\'ll get back to you soon with more details.',
          timestamp: new Date(),
          read: false
        };

        setMessages(prev => [...prev, founderResponse]);
      }, 2000 + Math.random() * 1000);

    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
      
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== `temp_${Date.now()}`));
    }
  };

  const markAsRead = async (): Promise<void> => {
    if (!roomId) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Mark all messages as read
      setMessages(prev => 
        prev.map(msg => ({ ...msg, read: true }))
      );
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  const refreshMessages = () => {
    if (roomId) {
      const roomMessages = getMessagesForRoom(roomId);
      setMessages(roomMessages);
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    markAsRead,
    refreshMessages
  };
}
