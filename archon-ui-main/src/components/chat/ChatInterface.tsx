import { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle, Minimize2, Maximize2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { EnhancedLoader } from '../ui/EnhancedLoader';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: string;
}

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function ChatInterface({ isOpen, onClose, className }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Create session when chat opens
  useEffect(() => {
    if (isOpen && !sessionId) {
      createSession();
    }
  }, [isOpen, sessionId]);

  const createSession = async () => {
    try {
      const response = await fetch('/api/agent-chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_type: 'rag' })
      });
      const data = await response.json();
      setSessionId(data.session_id);
      
      // Fetch any existing messages for this session
      try {
        const messagesResponse = await fetch(`/api/agent-chat/sessions/${data.session_id}/messages`);
        const allMessages = await messagesResponse.json();
        
        // Convert backend messages to frontend format
        const formattedMessages = allMessages.map((msg: {id: string, content: string, sender: string, timestamp: string}) => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender,
          timestamp: msg.timestamp
        }));
        
        setMessages(formattedMessages);
      } catch (error) {
        console.error('Failed to fetch initial messages:', error);
        // Fallback to empty messages array
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to create chat session:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !sessionId || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send message to backend
      await fetch(`/api/agent-chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input.trim() })
      });

      // Get updated messages including assistant response
      const messagesResponse = await fetch(`/api/agent-chat/sessions/${sessionId}/messages`);
      const allMessages = await messagesResponse.json();
      
      // Convert backend messages to frontend format
      const formattedMessages = allMessages.map((msg: {id: string, content: string, sender: string, timestamp: string}) => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender,
        timestamp: msg.timestamp
      }));
      
      setMessages(formattedMessages.filter((msg: Message) => msg.id !== 'welcome'));
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={cn(
      'fixed bottom-6 right-6 z-[100] glass-card border-white/20 dark:border-white/10',
      'shadow-[0_20px_60px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)]',
      '',
      isMinimized ? 'w-80 h-14' : 'w-96 h-[500px]',
      '',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Knowledge Assistant</h3>
            <p className="text-xs text-muted-foreground">
              {sessionId ? 'Connected' : 'Connecting...'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/10 dark:hover:bg-white/5 rounded transition-colors"
          >
            {isMinimized ? (
              <Maximize2 className="w-4 h-4" />
            ) : (
              <Minimize2 className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 dark:hover:bg-white/5 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : 'bg-white/10 dark:bg-white/5 text-foreground border border-white/10 dark:border-white/5'
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 dark:bg-white/5 rounded-lg px-3 py-2 border border-white/10 dark:border-white/5">
                  <EnhancedLoader size="sm" variant="dots" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10 dark:border-white/5">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your knowledge base..."
                disabled={isLoading}
                className={cn(
                  'flex-1 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10',
                  'rounded-lg px-3 py-2 text-sm placeholder-muted-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50',
                  // Removed transition for performance
                  isLoading && 'opacity-50 cursor-not-allowed'
                )}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className={cn(
                  'p-2 rounded-lg',
                  'bg-gradient-to-r from-blue-500 to-purple-500',
                  'hover:scale-105 hover:shadow-lg',
                  'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
                  'text-white'
                )}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
