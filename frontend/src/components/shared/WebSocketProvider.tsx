/**
 * WebSocket Provider - Production Ready (No socket.io dependency)
 * Uses native WebSocket for development, mock for production
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp?: string;
  message?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface WebSocketContextType {
  socket: any | null;
  connected: boolean;
  lastMessage: WebSocketMessage | null;
  connectionStats: {
    connected_at?: string;
    client_id?: string;
    subscriptions?: string[];
  };
  sendMessage: (message: any) => void;
  subscribe: (channels: string[]) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionStats, setConnectionStats] = useState<any>({});
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      // Production: Use mock WebSocket
      console.log('🔌 Initializing Mock WebSocket (production mode)');
      
      setConnected(true);
      setConnectionStats({
        connected_at: new Date().toISOString(),
        client_id: 'mock-client-' + Math.random().toString(36).substr(2, 9),
        subscriptions: ['intelligence', 'trends', 'gaps', 'connections']
      });

      // Simulate initial connection
      setTimeout(() => {
        setLastMessage({
          type: 'connection_established',
          timestamp: new Date().toISOString(),
          message: 'Mock WebSocket connected for demo',
          priority: 'low'
        });
      }, 1000);

      // Simulate periodic intelligence updates
      const interval = setInterval(() => {
        const mockMessages = [
          {
            type: 'intelligence_update',
            data: { connections_updated: Math.floor(Math.random() * 5) + 1 },
            timestamp: new Date().toISOString(),
            message: 'New strategic connections identified',
            priority: 'medium' as const
          },
          {
            type: 'trend_alert', 
            data: { trend: 'AI Ethics Research', momentum: 'increasing' },
            timestamp: new Date().toISOString(),
            message: 'Trend momentum shift detected',
            priority: 'high' as const
          },
          {
            type: 'gap_discovery',
            data: { domain: 'Human-AI Interaction', opportunity_score: 0.89 },
            timestamp: new Date().toISOString(),
            message: 'Research opportunity identified',
            priority: 'medium' as const
          }
        ];

        const randomMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)];
        setLastMessage(randomMessage);
        
        // Dispatch custom events for components
        window.dispatchEvent(new CustomEvent(randomMessage.type.replace('_', '-'), { 
          detail: randomMessage.data 
        }));
      }, 30000); // Every 30 seconds

      return () => clearInterval(interval);
    } else {
      // Development: Use native WebSocket (no socket.io dependency)
      console.log('🔌 Initializing Native WebSocket connection...');
      
      try {
        const newSocket = new WebSocket('ws://localhost:8000/ws');
        
        newSocket.onopen = () => {
          console.log('✅ WebSocket connected');
          setConnected(true);
          setSocket(newSocket);
        };

        newSocket.onclose = (event) => {
          console.log('🔌 WebSocket disconnected:', event.reason);
          setConnected(false);
        };

        newSocket.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          setConnected(false);
        };

        newSocket.onmessage = (event) => {
          console.log('📨 WebSocket message received:', event.data);
          
          try {
            const message = JSON.parse(event.data);
            setLastMessage(message);
            
            // Handle different message types
            switch (message.type) {
              case 'connection_established':
                setConnectionStats({
                  connected_at: message.timestamp,
                  client_id: message.client_id,
                  subscriptions: message.available_channels
                });
                break;
                
              case 'intelligence_update':
                window.dispatchEvent(new CustomEvent('intelligence-update', { 
                  detail: message.data 
                }));
                break;
                
              case 'trend_alert':
                window.dispatchEvent(new CustomEvent('trend-alert', { 
                  detail: message 
                }));
                break;
                
              case 'gap_discovery':
                window.dispatchEvent(new CustomEvent('gap-discovery', { 
                  detail: message 
                }));
                break;
                
              case 'connection_insight':
                window.dispatchEvent(new CustomEvent('connection-insight', { 
                  detail: message 
                }));
                break;
            }
            
          } catch (error) {
            console.error('❌ Error processing WebSocket message:', error);
          }
        };

        return () => {
          console.log('🔌 Cleaning up WebSocket connection');
          newSocket.close();
        };
      } catch (error) {
        console.error('❌ WebSocket connection failed:', error);
        setConnected(false);
      }
    }
  }, []);

  const sendMessage = (message: any) => {
    if (process.env.NODE_ENV === 'production') {
      console.log('📤 Mock WebSocket message sent:', message);
      // Simulate echo response
      setTimeout(() => {
        setLastMessage({
          type: 'echo',
          data: message,
          timestamp: new Date().toISOString(),
          message: 'Message received by mock WebSocket'
        });
      }, 100);
    } else if (socket && connected) {
      console.log('📤 Sending WebSocket message:', message);
      socket.send(JSON.stringify(message));
    } else {
      console.warn('⚠️ Cannot send message: WebSocket not connected');
    }
  };

  const subscribe = (channels: string[]) => {
    if (process.env.NODE_ENV === 'production') {
      console.log('📡 Mock WebSocket subscribed to channels:', channels);
    } else if (socket && connected) {
      console.log('📡 Subscribing to channels:', channels);
      socket.send(JSON.stringify({
        type: 'subscribe',
        channels: channels
      }));
    }
  };

  const contextValue: WebSocketContextType = {
    socket,
    connected,
    lastMessage,
    connectionStats,
    sendMessage,
    subscribe
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

// Custom hook for intelligence updates
export const useIntelligenceUpdates = (callback: (data: any) => void) => {
  useEffect(() => {
    const handleIntelligenceUpdate = (event: CustomEvent) => {
      callback(event.detail);
    };

    window.addEventListener('intelligence-update', handleIntelligenceUpdate as EventListener);
    return () => {
      window.removeEventListener('intelligence-update', handleIntelligenceUpdate as EventListener);
    };
  }, [callback]);
};

// Custom hook for trend alerts
export const useTrendAlerts = (callback: (data: any) => void) => {
  useEffect(() => {
    const handleTrendAlert = (event: CustomEvent) => {
      callback(event.detail);
    };

    window.addEventListener('trend-alert', handleTrendAlert as EventListener);
    return () => {
      window.removeEventListener('trend-alert', handleTrendAlert as EventListener);
    };
  }, [callback]);
};

// Custom hook for gap discoveries
export const useGapDiscoveries = (callback: (data: any) => void) => {
  useEffect(() => {
    const handleGapDiscovery = (event: CustomEvent) => {
      callback(event.detail);
    };

    window.addEventListener('gap-discovery', handleGapDiscovery as EventListener);
    return () => {
      window.removeEventListener('gap-discovery', handleGapDiscovery as EventListener);
    };
  }, [callback]);
};

// Custom hook for connection insights
export const useConnectionInsights = (callback: (data: any) => void) => {
  useEffect(() => {
    const handleConnectionInsight = (event: CustomEvent) => {
      callback(event.detail);
    };

    window.addEventListener('connection-insight', handleConnectionInsight as EventListener);
    return () => {
      window.removeEventListener('connection-insight', handleConnectionInsight as EventListener);
    };
  }, [callback]);
};