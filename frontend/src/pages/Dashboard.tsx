/**
 * Dashboard Page - Main overview of research intelligence
 */

import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp,
  Psychology,
  Lightbulb,
  Timeline
} from '@mui/icons-material';

import { api } from '../services/api-production';
import { useWebSocket, useIntelligenceUpdates } from '../components/shared/WebSocketProvider';
import { NetworkVisualization } from '../components/visualization/NetworkVisualization';
import { KPICards } from '../components/dashboard/KPICards';
import { TrendChart } from '../components/dashboard/TrendChart';
import { ResearchGapsPanel } from '../components/dashboard/ResearchGapsPanel';
import { IntelligenceFeed } from '../components/dashboard/IntelligenceFeed';

export const Dashboard: React.FC = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Intelligence data
  const [intelligenceSummary, setIntelligenceSummary] = useState<any>(null);
  const [networkData, setNetworkData] = useState<any>(null);
  const [trendsData, setTrendsData] = useState<any>(null);
  const [gapsData, setGapsData] = useState<any>(null);

  // WebSocket connection
  const { connected } = useWebSocket();

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 Loading dashboard data...');

      // Parallel data loading for better performance
      const [summary, network, trends, gaps] = await Promise.all([
        api.intelligence.getSummary(),
        api.intelligence.getNetworkGraph(0.7),
        api.trends.getPatterns(),
        api.gaps.getOpportunities({ min_opportunity_score: 0.6 })
      ]);

      setIntelligenceSummary(summary);
      setNetworkData(network);
      setTrendsData(trends);
      setGapsData(gaps);
      setLastUpdated(new Date());

      console.log('✅ Dashboard data loaded successfully');
      console.log('📈 Summary:', summary);
      console.log('🔗 Network:', network?.network_stats);
      console.log('📊 Trends:', trends?.total_trends);
      console.log('🎯 Gaps:', gaps?.total_gaps);

    } catch (err: any) {
      console.error('❌ Error loading dashboard data:', err);
      setError(`Failed to load data: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle real-time intelligence updates
  useIntelligenceUpdates((data) => {
    console.log('🔄 Real-time update received, refreshing data...');
    loadDashboardData();
  });

  // Initial data load
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Manual refresh handler
  const handleRefresh = () => {
    loadDashboardData();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6">Loading Research Intelligence...</Typography>
          <Typography variant="body2" color="text.secondary">
            Analyzing strategic connections and trends
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          action={
            <IconButton color="inherit" size="small" onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          }
        >
          <Typography variant="subtitle1">Dashboard Error</Typography>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            🧠 Research Intelligence Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Strategic insights from Enhanced Intelligence Layer analysis
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {/* Connection Status */}
          <Chip
            icon={connected ? <Timeline /> : <RefreshIcon />}
            label={connected ? 'Live Updates' : 'Static'}
            color={connected ? 'success' : 'default'}
            variant="outlined"
            size="small"
          />
          
          {/* Last Updated */}
          <Typography variant="caption" color="text.secondary">
            Updated: {lastUpdated.toLocaleTimeString()}
          </Typography>
          
          {/* Refresh Button */}
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* KPI Overview Cards */}
      {intelligenceSummary && (
        <KPICards
          totalConnections={intelligenceSummary.executive_summary?.total_strategic_connections || 0}
          highValueConnections={intelligenceSummary.executive_summary?.high_value_opportunities || 0}
          researchGaps={gapsData?.total_gaps || 0}
          emergingTrends={trendsData?.trend_distribution?.emerging || 0}
          businessReadiness={intelligenceSummary.executive_summary?.business_readiness || 'Unknown'}
        />
      )}

      {/* Main Content Grid */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Strategic Connections Network */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: 600 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Psychology color="primary" />
                  Strategic Research Connections
                </Typography>
                
                {networkData?.network_stats && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label={`${networkData.network_stats.total_nodes} Papers`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={`${networkData.network_stats.total_links} Connections`}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  </Box>
                )}
              </Box>
              
              {networkData ? (
                <NetworkVisualization 
                  data={networkData}
                  height={480}
                />
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 480 }}>
                  <Typography color="text.secondary">No network data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Intelligence Feed & Insights */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: 600 }}>
            {/* Research Gaps Panel */}
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Lightbulb color="secondary" />
                  Research Opportunities
                </Typography>
                
                <ResearchGapsPanel gaps={gapsData?.gaps || []} />
              </CardContent>
            </Card>

            {/* Live Intelligence Feed */}
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <TrendingUp color="success" />
                  Intelligence Feed
                </Typography>
                
                <IntelligenceFeed 
                  summary={intelligenceSummary}
                  connected={connected}
                />
              </CardContent>
            </Card>
          </Box>
        </Grid>

        {/* Trend Analysis Chart */}
        {trendsData && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <TrendingUp color="primary" />
                  Trend Patterns & Business Intelligence
                </Typography>
                
                <TrendChart 
                  trends={trendsData.trends || []}
                  height={300}
                />
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Strategic Summary */}
      {intelligenceSummary?.strategic_recommendations && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🎯 Strategic Recommendations
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Priority 1
                </Typography>
                <Typography variant="body2">
                  {intelligenceSummary.strategic_recommendations.priority_1}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Priority 2
                </Typography>
                <Typography variant="body2">
                  {intelligenceSummary.strategic_recommendations.priority_2}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Market Entry
                </Typography>
                <Typography variant="body2">
                  {intelligenceSummary.strategic_recommendations.market_entry}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};