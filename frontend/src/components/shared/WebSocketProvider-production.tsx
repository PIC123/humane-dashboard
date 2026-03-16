/**
 * WebSocket Provider - Production Ready
 * Uses mock WebSocket in production, real WebSocket in development
 */

// Conditional import based on environment
const USE_MOCK = process.env.NODE_ENV === 'production';

let WebSocketProvider: any;
let useWebSocket: any;
let useIntelligenceUpdates: any;
let useTrendAlerts: any;
let useGapDiscoveries: any;
let useConnectionInsights: any;

if (USE_MOCK) {
  // Import mock WebSocket provider for production
  const mockModule = require('./WebSocketProvider-mock');
  WebSocketProvider = mockModule.WebSocketProvider;
  useWebSocket = mockModule.useWebSocket;
  useIntelligenceUpdates = mockModule.useIntelligenceUpdates;
  useTrendAlerts = mockModule.useTrendAlerts;
  useGapDiscoveries = mockModule.useGapDiscoveries;
  useConnectionInsights = mockModule.useConnectionInsights;
} else {
  // Import real WebSocket provider for development
  const realModule = require('./WebSocketProvider');
  WebSocketProvider = realModule.WebSocketProvider;
  useWebSocket = realModule.useWebSocket;
  useIntelligenceUpdates = realModule.useIntelligenceUpdates;
  useTrendAlerts = realModule.useTrendAlerts;
  useGapDiscoveries = realModule.useGapDiscoveries;
  useConnectionInsights = realModule.useConnectionInsights;
}

export {
  WebSocketProvider,
  useWebSocket,
  useIntelligenceUpdates,
  useTrendAlerts,
  useGapDiscoveries,
  useConnectionInsights
};