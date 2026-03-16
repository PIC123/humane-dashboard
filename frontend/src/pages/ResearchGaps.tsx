/**
 * Research Gaps Page - Detailed research opportunities and gap analysis
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material';

import { api } from '../services/api';
import { ResearchGapsPanel } from '../components/dashboard/ResearchGapsPanel';

export const ResearchGaps: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gapsData, setGapsData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const gaps = await api.gaps.getOpportunities();
        setGapsData(gaps);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        🎯 Research Opportunities
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Strategic research gaps, business opportunities, and market positioning
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Research Gap Analysis
              </Typography>
              {gapsData && (
                <ResearchGapsPanel 
                  gaps={gapsData.gaps || []}
                  maxDisplay={20}
                />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};