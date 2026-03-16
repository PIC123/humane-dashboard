/**
 * Intelligence Feed - Live updates and strategic insights
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  Alert,
  Fade
} from '@mui/material';
import {
  Psychology,
  TrendingUp,
  Lightbulb,
  Link as LinkIcon,
  Schedule,
  Business,
  Wifi,
  WifiOff
} from '@mui/icons-material';

import { 
  useWebSocket, 
  useIntelligenceUpdates, 
  useTrendAlerts, 
  useGapDiscoveries,
  useConnectionInsights 
} from '../shared/WebSocketProvider';

interface IntelligenceFeedProps {
  summary: any;
  connected: boolean;
}

interface FeedItem {
  id: string;
  type: 'intelligence' | 'trend' | 'gap' | 'connection' | 'system';
  timestamp: Date;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  data?: any;
}

export const IntelligenceFeed: React.FC<IntelligenceFeedProps> = ({
  summary,
  connected
}) => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  
  const { lastMessage } = useWebSocket();

  // Initialize feed with summary data
  useEffect(() => {
    if (summary) {
      const initialItems: FeedItem[] = [
        {
          id: 'init-summary',
          type: 'intelligence',
          timestamp: new Date(),
          title: '🧠 Intelligence Analysis Complete',
          description: `Found ${summary.executive_summary?.total_strategic_connections || 0} strategic connections with ${summary.executive_summary?.business_readiness || 'Unknown'} market readiness`,
          priority: 'high'
        }
      ];

      // Add key findings as feed items
      if (summary.key_findings) {
        Object.entries(summary.key_findings).forEach(([key, value], index) => {
          initialItems.push({
            id: `finding-${index}`,
            type: 'intelligence',
            timestamp: new Date(Date.now() - index * 1000),
            title: `💡 ${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
            description: String(value),
            priority: 'medium'
          });
        });
      }

      setFeedItems(initialItems);
    }
  }, [summary]);

  // Handle intelligence updates
  useIntelligenceUpdates((data) => {
    const newItem: FeedItem = {
      id: `intelligence-${Date.now()}`,
      type: 'intelligence',
      timestamp: new Date(),
      title: '🔄 Intelligence Updated',
      description: `New analysis results: ${data.connections || 0} connections, ${data.gaps || 0} gaps, ${data.trends || 0} trends`,
      priority: 'high',
      data
    };
    
    setFeedItems(prev => [newItem, ...prev].slice(0, 20)); // Keep last 20 items
  });

  // Handle trend alerts
  useTrendAlerts((data) => {
    const newItem: FeedItem = {
      id: `trend-${Date.now()}`,
      type: 'trend',
      timestamp: new Date(),
      title: `📈 Trend Alert: ${data.trend_topic}`,
      description: `${data.momentum} momentum with ${(data.confidence * 100).toFixed(0)}% confidence. ${data.business_implications?.[0] || 'Strategic implications identified.'}`,
      priority: data.urgency === 'high' ? 'high' : 'medium',
      data
    };
    
    setFeedItems(prev => [newItem, ...prev].slice(0, 20));
  });

  // Handle gap discoveries
  useGapDiscoveries((data) => {
    const newItem: FeedItem = {
      id: `gap-${Date.now()}`,
      type: 'gap',
      timestamp: new Date(),
      title: `🎯 Research Gap: ${data.gap_domain}`,
      description: `${data.business_potential} potential with ${(data.opportunity_score * 100).toFixed(0)}% opportunity score`,
      priority: data.action_required ? 'high' : 'medium',
      data
    };
    
    setFeedItems(prev => [newItem, ...prev].slice(0, 20));
  });

  // Handle connection insights
  useConnectionInsights((data) => {
    const newItem: FeedItem = {
      id: `connection-${Date.now()}`,
      type: 'connection',
      timestamp: new Date(),
      title: `🔗 New Strategic Connection`,
      description: `${data.papers?.[0]?.substring(0, 30)}... ↔ ${data.papers?.[1]?.substring(0, 30)}... (${(data.strategic_value * 100).toFixed(0)}% value)`,
      priority: data.significance === 'high' ? 'high' : 'medium',
      data
    };
    
    setFeedItems(prev => [newItem, ...prev].slice(0, 20));
  });

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'intelligence': return <Psychology />;
      case 'trend': return <TrendingUp />;
      case 'gap': return <Lightbulb />;
      case 'connection': return <LinkIcon />;
      default: return <Business />;
    }
  };

  const getItemColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Connection Status */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        {connected ? (
          <>
            <Wifi color="success" fontSize="small" />
            <Typography variant="caption" color="success.main">
              Live Feed Active
            </Typography>
            <Chip label="Real-time" size="small" color="success" variant="outlined" />
          </>
        ) : (
          <>
            <WifiOff color="error" fontSize="small" />
            <Typography variant="caption" color="error.main">
              Offline Mode
            </Typography>
            <Chip label="Static" size="small" color="error" variant="outlined" />
          </>
        )}
      </Box>



      {/* Feed Items */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {feedItems.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Psychology sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No intelligence updates yet.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {connected ? 'Waiting for real-time updates...' : 'Connect to see live updates.'}
            </Typography>
          </Box>
        ) : (
          <List dense sx={{ p: 0 }}>
            {feedItems.map((item, index) => (
              <Fade in timeout={300} key={item.id}>
                <Box>
                  <ListItem
                    sx={{
                      px: 0,
                      py: 1,
                      borderRadius: 1,
                      mb: 0.5,
                      backgroundColor: item.priority === 'high' ? 'rgba(244, 67, 54, 0.1)' : 
                                     item.priority === 'medium' ? 'rgba(255, 152, 0, 0.1)' : 
                                     'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Box sx={{ color: getItemColor(item.priority) + '.main' }}>
                        {getItemIcon(item.type)}
                      </Box>
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                          {item.title}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            {item.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                            <Schedule fontSize="small" sx={{ fontSize: 12, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {formatTimeAgo(item.timestamp)}
                            </Typography>
                            <Chip
                              label={item.type}
                              size="small"
                              sx={{ 
                                fontSize: '0.6rem', 
                                height: 16,
                                ml: 1,
                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                              }}
                            />
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < feedItems.length - 1 && <Divider sx={{ my: 0.5, opacity: 0.3 }} />}
                </Box>
              </Fade>
            ))}
          </List>
        )}
      </Box>

      {/* Last Message Debug (in development) */}
      {process.env.NODE_ENV === 'development' && lastMessage && (
        <Alert severity="info" sx={{ mt: 1, fontSize: '0.7rem' }}>
          <Typography variant="caption">
            Last WebSocket: {lastMessage.type} at {new Date().toLocaleTimeString()}
          </Typography>
        </Alert>
      )}
    </Box>
  );
};