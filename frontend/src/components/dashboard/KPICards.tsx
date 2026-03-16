/**
 * KPI Cards - Key Performance Indicators Overview
 */

import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  Psychology,
  TrendingUp,
  Lightbulb,
  BusinessCenter,
  Speed
} from '@mui/icons-material';

interface KPICardsProps {
  totalConnections: number;
  highValueConnections: number;
  researchGaps: number;
  emergingTrends: number;
  businessReadiness: string;
}

export const KPICards: React.FC<KPICardsProps> = ({
  totalConnections,
  highValueConnections,
  researchGaps,
  emergingTrends,
  businessReadiness
}) => {
  // Calculate percentages and metrics
  const connectionQuality = totalConnections > 0 ? (highValueConnections / totalConnections) * 100 : 0;
  const businessReadinessScore = businessReadiness === 'High' ? 90 : businessReadiness === 'Medium' ? 60 : 30;

  const kpiData = [
    {
      title: 'Strategic Connections',
      value: totalConnections,
      subtitle: `${highValueConnections} high-value`,
      progress: connectionQuality,
      progressLabel: `${connectionQuality.toFixed(1)}% quality`,
      icon: <Psychology />,
      color: '#1f77b4',
      trend: connectionQuality > 80 ? 'excellent' : connectionQuality > 60 ? 'good' : 'needs-improvement'
    },
    {
      title: 'Research Opportunities',
      value: researchGaps,
      subtitle: 'Gap-based opportunities',
      progress: Math.min((researchGaps / 10) * 100, 100), // Scale to 10 max
      progressLabel: `${researchGaps} identified`,
      icon: <Lightbulb />,
      color: '#ff7f0e',
      trend: researchGaps > 5 ? 'excellent' : researchGaps > 2 ? 'good' : 'needs-improvement'
    },
    {
      title: 'Market Trends',
      value: emergingTrends,
      subtitle: 'Emerging patterns',
      progress: Math.min((emergingTrends / 5) * 100, 100), // Scale to 5 max
      progressLabel: `${emergingTrends} emerging`,
      icon: <TrendingUp />,
      color: '#2ca02c',
      trend: emergingTrends > 2 ? 'excellent' : emergingTrends > 0 ? 'good' : 'stable'
    },
    {
      title: 'Business Readiness',
      value: businessReadinessScore,
      subtitle: businessReadiness,
      progress: businessReadinessScore,
      progressLabel: `${businessReadiness} confidence`,
      icon: <BusinessCenter />,
      color: '#d62728',
      trend: businessReadiness === 'High' ? 'excellent' : businessReadiness === 'Medium' ? 'good' : 'needs-improvement',
      isPercentage: true
    }
  ];

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'excellent': return '#2ca02c';
      case 'good': return '#1f77b4';
      case 'stable': return '#ff7f0e';
      case 'needs-improvement': return '#d62728';
      default: return '#999';
    }
  };

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'excellent': return 'Excellent';
      case 'good': return 'Good';
      case 'stable': return 'Stable';
      case 'needs-improvement': return 'Needs Focus';
      default: return 'Unknown';
    }
  };

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {kpiData.map((kpi, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card 
            sx={{ 
              height: '100%',
              background: `linear-gradient(135deg, ${kpi.color}15 0%, ${kpi.color}25 100%)`,
              border: `1px solid ${kpi.color}40`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 25px ${kpi.color}30`
              }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ color: kpi.color }}>
                  {kpi.icon}
                </Box>
                <Chip
                  label={getTrendLabel(kpi.trend)}
                  size="small"
                  sx={{ 
                    backgroundColor: getTrendColor(kpi.trend),
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.7rem'
                  }}
                />
              </Box>

              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {kpi.isPercentage ? `${kpi.value}%` : kpi.value.toLocaleString()}
              </Typography>
              
              <Typography variant="h6" color="text.primary" gutterBottom>
                {kpi.title}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {kpi.subtitle}
              </Typography>

              {/* Progress indicator */}
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Progress
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {kpi.progressLabel}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(kpi.progress, 100)}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: `${kpi.color}20`,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: kpi.color,
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
      
      {/* Performance Summary Card */}
      <Grid item xs={12}>
        <Card sx={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)', border: '1px solid #333' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Speed color="primary" />
              <Typography variant="h6">
                Intelligence Performance
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
                <Chip
                  label={`${highValueConnections} Business Opportunities`}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
                <Chip
                  label={`${((highValueConnections / Math.max(totalConnections, 1)) * 100).toFixed(0)}% Success Rate`}
                  color="success"
                  variant="outlined"
                  size="small"
                />
                <Chip
                  label={businessReadiness + ' Market Readiness'}
                  color={businessReadiness === 'High' ? 'success' : businessReadiness === 'Medium' ? 'warning' : 'error'}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Your Enhanced Intelligence Layer has identified <strong>{totalConnections} strategic connections</strong> with 
              <strong> {((highValueConnections / Math.max(totalConnections, 1)) * 100).toFixed(0)}% high-value rate</strong>, 
              revealing <strong>{researchGaps} research opportunities</strong> and tracking <strong>{emergingTrends} emerging trends</strong> 
              for competitive advantage.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};