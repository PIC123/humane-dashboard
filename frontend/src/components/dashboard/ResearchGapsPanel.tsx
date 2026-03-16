/**
 * Research Gaps Panel - Displays research opportunities and gaps
 */

import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Lightbulb,
  TrendingUp,
  Schedule,
  Business,
  OpenInNew
} from '@mui/icons-material';
import { ResearchGap } from '../../services/api';

interface ResearchGapsPanelProps {
  gaps: ResearchGap[];
  maxDisplay?: number;
  onGapClick?: (gap: ResearchGap) => void;
}

export const ResearchGapsPanel: React.FC<ResearchGapsPanelProps> = ({
  gaps,
  maxDisplay = 5,
  onGapClick
}) => {
  if (!gaps || gaps.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Lightbulb sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          No research gaps identified yet.
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Run gap analysis to discover opportunities.
        </Typography>
      </Box>
    );
  }

  // Sort gaps by opportunity score
  const sortedGaps = [...gaps]
    .sort((a, b) => b.opportunity_score - a.opportunity_score)
    .slice(0, maxDisplay);

  // Calculate statistics
  const stats = {
    highOpportunity: gaps.filter(g => g.opportunity_score > 0.8).length,
    highFeasibility: gaps.filter(g => g.feasibility_score > 0.7).length,
    immediate: gaps.filter(g => g.timeline.includes('3-6 months')).length,
    totalPotential: gaps.reduce((sum, g) => sum + g.opportunity_score, 0)
  };

  const getTimelineColor = (timeline: string) => {
    if (timeline.includes('3-6 months')) return 'success';
    if (timeline.includes('6-12 months')) return 'warning';
    return 'info';
  };

  const getTimelineIcon = (timeline: string) => {
    if (timeline.includes('3-6 months')) return '🚀';
    if (timeline.includes('6-12 months')) return '⚡';
    return '📅';
  };

  const getMarketPotentialColor = (potential: string) => {
    if (potential.toLowerCase().includes('very high')) return 'error';
    if (potential.toLowerCase().includes('high')) return 'warning';
    return 'info';
  };

  return (
    <Box>
      {/* Summary Statistics */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
          <Chip
            icon={<TrendingUp />}
            label={`${stats.highOpportunity} High Opportunity`}
            size="small"
            color="success"
            variant="outlined"
          />
          <Chip
            icon={<Business />}
            label={`${stats.highFeasibility} High Feasibility`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            icon={<Schedule />}
            label={`${stats.immediate} Immediate`}
            size="small"
            color="success"
          />
          <Chip
            label={`${(stats.totalPotential / gaps.length).toFixed(1)} Avg Score`}
            size="small"
            variant="outlined"
          />
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Research Gaps List */}
      <List dense sx={{ p: 0 }}>
        {sortedGaps.map((gap, index) => (
          <ListItem
            key={index}
            sx={{
              p: 1,
              mb: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              cursor: onGapClick ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                transform: 'translateY(-1px)'
              }
            }}
            onClick={() => onGapClick && onGapClick(gap)}
          >
            <Box sx={{ width: '100%' }}>
              {/* Gap Title and Action Button */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', flex: 1, mr: 1 }}>
                  {getTimelineIcon(gap.timeline)} {gap.gap_domain}
                </Typography>
                
                {onGapClick && (
                  <Tooltip title="View details">
                    <IconButton size="small" sx={{ p: 0.5 }}>
                      <OpenInNew fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              {/* Gap Description */}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8rem' }}>
                {gap.description}
              </Typography>

              {/* Opportunity Score Progress */}
              <Box sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Opportunity Score
                  </Typography>
                  <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold' }}>
                    {(gap.opportunity_score * 100).toFixed(0)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={gap.opportunity_score * 100}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 2,
                      backgroundColor: gap.opportunity_score > 0.8 ? '#4caf50' : gap.opportunity_score > 0.6 ? '#ff9800' : '#2196f3'
                    }
                  }}
                />
              </Box>

              {/* Feasibility Score Progress */}
              <Box sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Feasibility Score
                  </Typography>
                  <Typography variant="caption" color="secondary" sx={{ fontWeight: 'bold' }}>
                    {(gap.feasibility_score * 100).toFixed(0)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={gap.feasibility_score * 100}
                  color="secondary"
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 2
                    }
                  }}
                />
              </Box>

              {/* Tags and Metadata */}
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
                <Chip
                  label={gap.timeline.replace(/^\d+-/, '')} // Remove "12-18 months - " prefix
                  size="small"
                  color={getTimelineColor(gap.timeline) as any}
                  sx={{ fontSize: '0.65rem', height: 20 }}
                />
                <Chip
                  label={gap.market_potential.replace(' - ', ' ').split(' ').slice(0, 2).join(' ')}
                  size="small"
                  color={getMarketPotentialColor(gap.market_potential) as any}
                  variant="outlined"
                  sx={{ fontSize: '0.65rem', height: 20 }}
                />
                <Chip
                  label={gap.gap_type}
                  size="small"
                  sx={{ 
                    fontSize: '0.65rem', 
                    height: 20,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'text.secondary'
                  }}
                />
              </Box>

              {/* Competitive Advantage (if available) */}
              {gap.competitive_advantage && (
                <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
                  💡 {gap.competitive_advantage}
                </Typography>
              )}
            </Box>
          </ListItem>
        ))}
      </List>

      {/* Show More Indicator */}
      {gaps.length > maxDisplay && (
        <Box sx={{ textAlign: 'center', mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Showing {maxDisplay} of {gaps.length} opportunities
          </Typography>
          {onGapClick && (
            <Typography variant="caption" color="primary" sx={{ display: 'block' }}>
              Click any gap to view all opportunities
            </Typography>
          )}
        </Box>
      )}

      {/* No Immediate Opportunities Warning */}
      {stats.immediate === 0 && gaps.length > 0 && (
        <Box sx={{ mt: 2, p: 1, backgroundColor: 'warning.dark', borderRadius: 1 }}>
          <Typography variant="caption" color="warning.contrastText">
            ⚠️ No immediate opportunities (3-6 months). Consider long-term strategic planning.
          </Typography>
        </Box>
      )}
    </Box>
  );
};