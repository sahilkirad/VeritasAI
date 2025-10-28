// Empty state component for chat
import React from 'react';
import { MessageCircle, Users, Search } from 'lucide-react';
import { Button } from '../ui/button';

interface EmptyStateProps {
  type: 'no-conversations' | 'no-messages' | 'no-search-results';
  onAction?: () => void;
  actionText?: string;
}

export function EmptyState({ type, onAction, actionText }: EmptyStateProps) {
  const getContent = () => {
    switch (type) {
      case 'no-conversations':
        return {
          icon: <MessageCircle className="h-12 w-12 text-gray-400" />,
          title: 'No conversations yet',
          description: 'Start your first conversation with a founder or investor',
          actionText: actionText || 'Find Investors'
        };
      
      case 'no-messages':
        return {
          icon: <MessageCircle className="h-12 w-12 text-gray-400" />,
          title: 'Start the conversation',
          description: 'Send a message to begin your discussion',
          actionText: actionText || 'Send Message'
        };
      
      case 'no-search-results':
        return {
          icon: <Search className="h-12 w-12 text-gray-400" />,
          title: 'No results found',
          description: 'Try adjusting your search terms',
          actionText: actionText || 'Clear Search'
        };
      
      default:
        return {
          icon: <Users className="h-12 w-12 text-gray-400" />,
          title: 'Nothing here',
          description: 'This area is empty',
          actionText: actionText || 'Get Started'
        };
    }
  };

  const content = getContent();

  return (
    <div className="flex flex-col items-center justify-center h-64 text-center p-6">
      <div className="mb-4">
        {content.icon}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {content.title}
      </h3>
      
      <p className="text-gray-500 mb-6 max-w-sm">
        {content.description}
      </p>
      
      {onAction && (
        <Button onClick={onAction} variant="default">
          {content.actionText}
        </Button>
      )}
    </div>
  );
}
