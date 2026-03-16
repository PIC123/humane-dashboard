/**
 * Trend Chart - Visualizes trend patterns and business intelligence
 */

import React from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { Box, Typography, Chip } from '@mui/material';
import { TrendPattern } from '../../services/api';

interface TrendChartProps {
  trends: TrendPattern[];
  height: number;
}

export const TrendChart: React.FC<TrendChartProps> = ({ trends, height }) => {
  if (!trends || trends.length === 0) {
    return (
      <Box 
        sx={{ 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          border: '2px dashed #333',
          borderRadius: 2
        }}
      >
        <Typography color="text.secondary">
          No trend data available
        </Typography>
      </Box>
    );
  }

  // Transform data for visualization
  const chartData = trends.map((trend, index) => {
    // Convert momentum to numeric scale
    const momentumScore = {
      'emerging': 4,
      'growing': 3,
      'stable': 2,
      'declining': 1
    }[trend.momentum] || 2;

    // Convert time horizon to numeric scale (months)
    const timeHorizonMonths = {
      'immediate': 3,
      'short-term': 12,
      'long-term': 24
    }[trend.time_horizon] || 12;

    return {
      name: trend.trend_topic,
      momentum: momentumScore,
      momentumLabel: trend.momentum,
      confidence: trend.confidence * 100, // Convert to percentage
      timeHorizon: timeHorizonMonths,
      timeHorizonLabel: trend.time_horizon,
      researchVelocity: trend.research_velocity,
      businessImplications: trend.business_implications.length,
      marketReadiness: trend.market_readiness,
      positioning: trend.competitive_positioning
    };
  });

  // Color scheme for momentum
  const momentumColors = {
    'emerging': '#ff7f0e',
    'growing': '#2ca02c',
    'stable': '#1f77b4',
    'declining': '#d62728'
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            p: 2,
            borderRadius: 2,
            border: '1px solid #333',
            maxWidth: 300
          }}
        >
          <Typography variant="subtitle2" color="primary" gutterBottom>
            {data.name}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Momentum:</strong> {data.momentumLabel}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Confidence:</strong> {data.confidence.toFixed(1)}%
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Time Horizon:</strong> {data.timeHorizonLabel}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Research Velocity:</strong> {data.researchVelocity.toFixed(1)} papers/year
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Business Implications:</strong> {data.businessImplications} identified
          </Typography>
          <Typography variant="body2">
            <strong>Positioning:</strong> {data.positioning}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  // Chart statistics
  const stats = {
    emerging: trends.filter(t => t.momentum === 'emerging').length,
    growing: trends.filter(t => t.momentum === 'growing').length,
    stable: trends.filter(t => t.momentum === 'stable').length,
    declining: trends.filter(t => t.momentum === 'declining').length,
    avgConfidence: trends.reduce((sum, t) => sum + t.confidence, 0) / trends.length,
    highConfidence: trends.filter(t => t.confidence > 0.75).length
  };

  return (
    <Box>
      {/* Chart Statistics */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Chip
          label={`${stats.emerging} Emerging`}
          size="small"
          sx={{ backgroundColor: momentumColors.emerging, color: 'white' }}
        />
        <Chip
          label={`${stats.growing} Growing`}
          size="small"
          sx={{ backgroundColor: momentumColors.growing, color: 'white' }}
        />
        <Chip
          label={`${stats.stable} Stable`}
          size="small"
          sx={{ backgroundColor: momentumColors.stable, color: 'white' }}
        />
        {stats.declining > 0 && (
          <Chip
            label={`${stats.declining} Declining`}
            size="small"
            sx={{ backgroundColor: momentumColors.declining, color: 'white' }}
          />
        )}
        <Chip
          label={`${(stats.avgConfidence * 100).toFixed(0)}% Avg Confidence`}
          size="small"
          variant="outlined"
          sx={{ ml: 1 }}
        />
        <Chip
          label={`${stats.highConfidence} High Confidence`}
          size="small"
          variant="outlined"
          color="success"
        />
      </Box>

      {/* Scatter Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis
            type="number"
            dataKey="confidence"
            name="Confidence"
            domain={[0, 100]}
            tickFormatter={(value: any) => `${value}%`}
            stroke="#999"
          />
          <YAxis
            type="number"
            dataKey="momentum"
            name="Momentum"
            domain={[0.5, 4.5]}
            tickFormatter={(value: any) => {
              const labels = { 1: 'Declining', 2: 'Stable', 3: 'Growing', 4: 'Emerging' };
              return labels[value as keyof typeof labels] || '';
            }}
            stroke="#999"
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Separate scatter for each momentum type */}
          <Scatter
            name="Emerging"
            data={chartData.filter(d => d.momentumLabel === 'emerging')}
            fill={momentumColors.emerging}
          />
          <Scatter
            name="Growing"
            data={chartData.filter(d => d.momentumLabel === 'growing')}
            fill={momentumColors.growing}
          />
          <Scatter
            name="Stable"
            data={chartData.filter(d => d.momentumLabel === 'stable')}
            fill={momentumColors.stable}
          />
          <Scatter
            name="Declining"
            data={chartData.filter(d => d.momentumLabel === 'declining')}
            fill={momentumColors.declining}
          />
          
          <Legend />
        </ScatterChart>
      </ResponsiveContainer>

      {/* Analysis Summary */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Analysis:</strong> {stats.emerging} emerging trends show first-mover opportunities, 
          while {stats.growing} growing trends indicate market expansion potential. 
          {stats.highConfidence} trends have high confidence scores (&gt;75%) for strategic investment.
        </Typography>
        
        {stats.emerging > 0 && (
          <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
            🚀 <strong>Action Required:</strong> {stats.emerging} emerging trends need immediate attention 
            for competitive advantage.
          </Typography>
        )}
        
        {stats.highConfidence === 0 && (
          <Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
            ⚠️ <strong>Low Confidence:</strong> Consider additional research to validate trend patterns.
          </Typography>
        )}
      </Box>
    </Box>
  );
};