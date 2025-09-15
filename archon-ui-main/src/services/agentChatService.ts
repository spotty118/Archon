/**
 * Agent Chat Service
 * Handles communication with AI agents via REST API
 */

import { serverHealthService } from './serverHealthService';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  agent_type?: string;
}

interface ChatSession {
  session_id: string;
  project_id?: string;
  messages: ChatMessage[];
  agent_type: string;
  created_at: Date;
}

interface ChatRequest {
  message: string;
  project_id?: string;
  context?: Record<string, unknown>;
}

class AgentChatService {
  private baseUrl: string;
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private messageHandlers: Map<string, (message: ChatMessage) => void> = new Map();
  private errorHandlers: Map<string, (error: Error) => void> = new Map();
  private pollAttempts: Map<string, number> = new Map(); // Track polling attempts for backoff
  private isTabVisible: boolean = true; // Track tab visibility

  constructor() {
    // In development, the API is proxied through Vite, so we use the same origin
    // In production, this would be the actual API URL
    this.baseUrl = '';
    
    // Listen to visibility changes to pause polling when tab is hidden
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        this.isTabVisible = !document.hidden;
        // Don't immediately restart polling - let it resume naturally on next interval
      });
    }
  }

  /**
   * Clean up polling for a session
   */
  private cleanupConnection(sessionId: string): void {
    const interval = this.pollingIntervals.get(sessionId);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(sessionId);
    }
    
    this.messageHandlers.delete(sessionId);
    this.errorHandlers.delete(sessionId);
    this.pollAttempts.delete(sessionId); // Clean up backoff tracking
  }

  /**
   * Check if the chat server is online
   */
  private async checkServerStatus(): Promise<'online' | 'offline'> {
    try {
      const response = await fetch(`${this.baseUrl}/api/agent-chat/status`, {
        method: 'GET',
      });
      
      if (response.ok) {
        return 'online';
      } else {
        return 'offline';
      }
    } catch (error) {
  // console.error('Failed to check chat server status:', error);
      return 'offline';
    }
  }

  /**
   * Validate a session exists
   */
  async validateSession(sessionId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/agent-chat/sessions/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
  // console.error('Failed to validate session:', error);
      return false;
    }
  }

  /**
   * Create or get an existing chat session
   */
  async createSession(agentType: string, projectId?: string): Promise<ChatSession> {
    try {
      const response = await fetch(`${this.baseUrl}/api/agent-chat/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_type: agentType,
          project_id: projectId
        }),
      });

      if (!response.ok) {
        // If we get a 404, the agent service is not running
        if (response.status === 404) {
  // console.log('Agent chat service not available - service may be disabled');
          throw new Error('Agent chat service is not available. The service may be disabled.');
        }
        throw new Error(`Failed to create session: ${response.statusText}`);
      }

      const session = await response.json();
      return session;
    } catch (error) {
      // Don't log fetch errors for disabled service
      if (error instanceof Error && !error.message.includes('not available')) {
  // console.error('Failed to create chat session:', error);
      }
      throw error;
    }
  }

  /**
   * Send a message to an existing chat session
   */
  async sendMessage(sessionId: string, request: ChatRequest): Promise<ChatMessage> {
    const response = await fetch(`${this.baseUrl}/api/agent-chat/sessions/${sessionId}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }

    const message = await response.json();
    return message;
  }

  /**
   * Stream messages from a chat session using smart polling with exponential backoff
   */
  async streamMessages(
    sessionId: string,
    onMessage: (message: ChatMessage) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    // Store handlers
    this.messageHandlers.set(sessionId, onMessage);
    if (onError) {
      this.errorHandlers.set(sessionId, onError);
    }

    // Initialize polling attempt counter
    this.pollAttempts.set(sessionId, 0);

    // Start polling for new messages with smart intervals
    let lastMessageId: string | null = null;
    
    const createPollFunction = () => {
      const pollInterval = setInterval(async () => {
        // Skip polling if tab is not visible (saves CPU and battery)
        if (!this.isTabVisible) {
          return;
        }

        try {
          const response = await fetch(`${this.baseUrl}/api/agent-chat/sessions/${sessionId}/messages${lastMessageId ? `?after=${lastMessageId}` : ''}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            // If we get a 404, the service is not available - stop polling
            if (response.status === 404) {
    // console.log('Agent chat service not available (404) - stopping polling');
              clearInterval(pollInterval);
              this.pollingIntervals.delete(sessionId);
              const errorHandler = this.errorHandlers.get(sessionId);
              if (errorHandler) {
                errorHandler(new Error('Agent chat service is not available'));
              }
              return;
            }
            throw new Error(`Failed to fetch messages: ${response.statusText}`);
          }

          const messages: ChatMessage[] = await response.json();
          
          // Reset polling attempts on successful response
          this.pollAttempts.set(sessionId, 0);
          
          // Process new messages
          for (const message of messages) {
            lastMessageId = message.id;
            const handler = this.messageHandlers.get(sessionId);
            if (handler) {
              handler(message);
            }
          }

          // If we received messages, use faster polling temporarily
          if (messages.length > 0) {
            clearInterval(pollInterval);
            this.pollingIntervals.delete(sessionId);
            // Restart with faster polling for active conversations
            this.startPollingWithInterval(sessionId, onMessage, onError, lastMessageId, 2000);
          }
        } catch (error) {
          // Increment polling attempts for exponential backoff
          const attempts = this.pollAttempts.get(sessionId) || 0;
          this.pollAttempts.set(sessionId, attempts + 1);
          
          // Only log non-404 errors (404s are handled above)
          if (error instanceof Error && !error.message.includes('404')) {
    // console.error('Failed to poll messages:', error);
          }
          const errorHandler = this.errorHandlers.get(sessionId);
          if (errorHandler) {
            errorHandler(error instanceof Error ? error : new Error('Unknown error'));
          }
        }
      }, this.calculatePollInterval(sessionId));

      this.pollingIntervals.set(sessionId, pollInterval);
    };

    createPollFunction();
  }

  /**
   * Calculate intelligent polling interval with exponential backoff
   */
  private calculatePollInterval(sessionId: string): number {
    const attempts = this.pollAttempts.get(sessionId) || 0;
    const baseInterval = 3000; // Start at 3 seconds instead of 1 second
    const maxInterval = 30000; // Max 30 seconds for inactive chats
    
    // Exponential backoff: 3s -> 6s -> 12s -> 24s -> 30s (max)
    return Math.min(maxInterval, baseInterval * Math.pow(2, attempts));
  }

  /**
   * Start polling with a specific interval (used for active conversations)
   */
  private startPollingWithInterval(
    sessionId: string,
    onMessage: (message: ChatMessage) => void,
    onError?: (error: Error) => void,
    lastMessageId?: string | null,
    interval: number = 3000
  ): void {
    const pollInterval = setInterval(async () => {
      if (!this.isTabVisible) {
        return;
      }

      try {
        const response = await fetch(`${this.baseUrl}/api/agent-chat/sessions/${sessionId}/messages${lastMessageId ? `?after=${lastMessageId}` : ''}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            clearInterval(pollInterval);
            this.pollingIntervals.delete(sessionId);
            if (onError) {
              onError(new Error('Agent chat service is not available'));
            }
            return;
          }
          throw new Error(`Failed to fetch messages: ${response.statusText}`);
        }

        const messages: ChatMessage[] = await response.json();
        
        this.pollAttempts.set(sessionId, 0); // Reset on success
        
        for (const message of messages) {
          lastMessageId = message.id;
          onMessage(message);
        }
      } catch (error) {
        if (onError) {
          onError(error instanceof Error ? error : new Error('Unknown error'));
        }
      }
    }, interval);

    this.pollingIntervals.set(sessionId, pollInterval);
  }

  /**
   * Stop streaming messages from a session
   */
  stopStreaming(sessionId: string): void {
    this.cleanupConnection(sessionId);
  }

  /**
   * Get chat history for a session
   */
  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    const response = await fetch(`${this.baseUrl}/api/agent-chat/sessions/${sessionId}/messages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get chat history: ${response.statusText}`);
    }

    const messages = await response.json();
    return messages;
  }

  /**
   * Delete a chat session
   */
  async deleteSession(sessionId: string): Promise<void> {
    // Clean up any active connections first
    this.cleanupConnection(sessionId);

    const response = await fetch(`${this.baseUrl}/api/agent-chat/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete session: ${response.statusText}`);
    }
  }

  /**
   * Get server status
   */
  async getServerStatus(): Promise<'online' | 'offline' | 'unknown'> {
    const serverHealthy = await serverHealthService.checkHealth();
    if (!serverHealthy) {
      return 'offline';
    }

    return this.checkServerStatus();
  }

  /**
   * Clean up all connections
   */
  cleanup(): void {
    // Clean up all active polling
    this.pollingIntervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.pollingIntervals.clear();
    this.messageHandlers.clear();
    this.errorHandlers.clear();
    this.pollAttempts.clear(); // Clean up backoff tracking
  }
}

export const agentChatService = new AgentChatService();