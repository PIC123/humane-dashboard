/**
 * Layout Component - Main application layout with navigation
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  IconButton,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Psychology as IntelligenceIcon,
  TrendingUp as TrendsIcon,
  Lightbulb as GapsIcon,
  Wifi as ConnectionIcon,
  WifiOff as DisconnectedIcon
} from '@mui/icons-material';

import { useWebSocket } from './WebSocketProvider';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { connected, connectionStats } = useWebSocket();

  const navItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: <DashboardIcon />,
      description: 'Overview and KPIs'
    },
    {
      path: '/intelligence',
      label: 'Intelligence',
      icon: <IntelligenceIcon />,
      description: 'Strategic Connections'
    },
    {
      path: '/trends',
      label: 'Trends',
      icon: <TrendsIcon />,
      description: 'Market Analysis'
    },
    {
      path: '/gaps',
      label: 'Opportunities',
      icon: <GapsIcon />,
      description: 'Research Gaps'
    }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top Navigation */}
      <AppBar 
        position="sticky" 
        sx={{ 
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
          borderBottom: '1px solid #333'
        }}
      >
        <Toolbar>
          {/* Logo/Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <IntelligenceIcon sx={{ mr: 1, color: '#1f77b4' }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              🧠 Research Intelligence Dashboard
            </Typography>
            
            {/* Version Badge */}
            <Chip 
              label="v1.0" 
              size="small" 
              sx={{ ml: 2, backgroundColor: '#1f77b4', color: 'white' }} 
            />
          </Box>

          {/* Navigation Items */}
          <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
            {navItems.map((item) => (
              <Tooltip key={item.path} title={item.description}>
                <IconButton
                  component={Link}
                  to={item.path}
                  color="inherit"
                  sx={{
                    backgroundColor: location.pathname === item.path ? '#1f77b4' : 'transparent',
                    '&:hover': {
                      backgroundColor: location.pathname === item.path ? '#1565c0' : 'rgba(255, 255, 255, 0.1)'
                    },
                    borderRadius: 2,
                    px: 2,
                    mx: 0.5
                  }}
                >
                  {item.icon}
                  <Typography variant="caption" sx={{ ml: 1, display: { xs: 'none', sm: 'block' } }}>
                    {item.label}
                  </Typography>
                </IconButton>
              </Tooltip>
            ))}
          </Box>

          {/* Connection Status */}
          <Tooltip title={connected ? 'Real-time updates connected' : 'Connecting...'}>
            <Chip
              icon={connected ? <ConnectionIcon /> : <DisconnectedIcon />}
              label={connected ? 'LIVE' : 'OFFLINE'}
              size="small"
              color={connected ? 'success' : 'error'}
              variant="outlined"
            />
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ flexGrow: 1, py: 3 }}>
        {children}
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 2,
          px: 3,
          backgroundColor: '#1a1a1a',
          borderTop: '1px solid #333',
          mt: 'auto'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Enhanced Intelligence Layer • Three Amigos Platform 🤠🤖🤖
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            {connected && connectionStats.client_id && (
              <Typography variant="caption" color="text.secondary">
                Client: {connectionStats.client_id}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              {new Date().toLocaleTimeString()}
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};