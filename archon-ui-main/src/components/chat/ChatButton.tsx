import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ChatInterface } from './ChatInterface';

interface ChatButtonProps {
  className?: string;
}

export function ChatButton({ className }: ChatButtonProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      {/* Floating Chat Button */}
      <div className={cn("fixed bottom-6 right-6 z-50", className)}>
        <button
          onClick={() => setIsChatOpen(true)}
          className={cn(
            'w-14 h-14 rounded-full flex items-center justify-center',
            'bg-blue-500',
            'group',
            isChatOpen && 'opacity-0 pointer-events-none'
          )}
          aria-label="Open Knowledge Assistant"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </button>
        
        {/* Tooltip */}
        <div className={cn(
          'absolute bottom-full right-0 mb-2 px-3 py-2',
          'bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-lg shadow-lg',
          'opacity-0 group-hover:opacity-100',
          'pointer-events-none whitespace-nowrap',
          isChatOpen && 'hidden'
        )}>
          <div className="font-medium">Knowledge Assistant</div>
          <div className="text-xs text-gray-300">Ask questions about your knowledge base</div>
          <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900 dark:bg-gray-800"></div>
        </div>
      </div>

      {/* Chat Interface */}
      <ChatInterface 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </>
  );
}
