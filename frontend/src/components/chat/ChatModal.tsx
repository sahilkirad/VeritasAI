// Modal wrapper for chat window
import React, { useEffect } from 'react';
import { Dialog, DialogContent } from '../ui/dialog';
import { ChatWindow } from './ChatWindow';
import { ChatRoom, Message } from '../../types/chat';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: ChatRoom | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
  userRole: 'investor' | 'founder';
  loading?: boolean;
  error?: string | null;
}

export function ChatModal({
  isOpen,
  onClose,
  room,
  messages,
  onSendMessage,
  userRole,
  loading = false,
  error = null
}: ChatModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl h-[80vh] p-0 overflow-hidden"
        hideCloseButton
      >
        <ChatWindow
          room={room}
          messages={messages}
          onSendMessage={onSendMessage}
          onClose={onClose}
          userRole={userRole}
          loading={loading}
          error={error}
        />
      </DialogContent>
    </Dialog>
  );
}
