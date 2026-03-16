/**
 * WebSocket Provider - Real-time Intelligence Updates
 * Connects to FastAPI WebSocket endpoint for live dashboard updates
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp?: string;
  message?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface WebSocketContextType {
  socket: Socket | null;
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
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionStats, setConnectionStats] = useState<any>({});

  useEffect(() => {
    console.log('🔌 Initializing WebSocket connection...');
    
    // Create socket connection to FastAPI WebSocket endpoint
    const newSocket = io('ws://localhost:8000', {
      transports: ['websocket'],
      upgrade: true,
      rememberUpgrade: true,
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected:', newSocket.id);
      setConnected(true);
      setSocket(newSocket);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      setConnected(false);
    });

    // Intelligence update handlers
    newSocket.on('message', (data) => {
      console.log('📨 WebSocket message received:', data);
      
      try {
        const message = typeof data === 'string' ? JSON.parse(data) : data;
        setLastMessage(message);
        
        // Handle different message types
        switch (message.type) {
          case 'connection_established':
            console.log('🎯 WebSocket connection established:', message);
            setConnectionStats({
              connected_at: message.timestamp,
              client_id: message.client_id,
              subscriptions: message.available_channels
            });
            break;
            
          case 'intelligence_update':
            console.log('🧠 Intelligence update received:', message);
            // Trigger intelligence data refresh
            window.dispatchEvent(new CustomEvent('intelligence-update', { 
              detail: message.data 
            }));
            break;
            
          case 'trend_alert':
            console.log('📈 Trend alert received:', message);
            // Show notification for trend changes
            window.dispatchEvent(new CustomEvent('trend-alert', { 
              detail: message 
            }));
            break;
            
          case 'gap_discovery':
            console.log('🎯 Gap discovery received:', message);
            // Show notification for new research gaps
            window.dispatchEvent(new CustomEvent('gap-discovery', { 
              detail: message 
            }));
            break;
            
          case 'connection_insight':
            console.log('🔗 Connection insight received:', message);
            // Show notification for new strategic connections
            window.dispatchEvent(new CustomEvent('connection-insight', { 
              detail: message 
            }));
            break;
            
          case 'system_status':
            console.log('⚙️ System status update:', message);
            break;
            
          case 'heartbeat':
            console.log('💓 Heartbeat received');
            break;
            
          default:
            console.log('📝 Unknown message type:', message.type);
        }
        
      } catch (error) {
        console.error('❌ Error processing WebSocket message:', error);
      }
    });

    // Cleanup on unmount
    return () => {
      console.log('🔌 Cleaning up WebSocket connection');
      newSocket.disconnect();
    };
  }, []);

  const sendMessage = (message: any) => {
    if (socket && connected) {
      console.log('📤 Sending WebSocket message:', message);
      socket.emit('message', message);
    } else {
      console.warn('⚠️ Cannot send message: WebSocket not connected');
    }
  };

  const subscribe = (channels: string[]) => {
    if (socket && connected) {
      console.log('📡 Subscribing to channels:', channels);
      socket.emit('message', {
        type: 'subscribe',
        channels: channels
      });
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