/**
 * Intelligence Analysis Page - Detailed strategic connections analysis
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

import { api } from '../services/api-production';
import { NetworkVisualization } from '../components/visualization/NetworkVisualization';

export const IntelligenceAnalysis: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [networkData, setNetworkData] = useState<any>(null);
  const [intelligenceData, setIntelligenceData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [network, intelligence] = await Promise.all([
          api.intelligence.getNetworkGraph(0.5), // Lower threshold for more connections
          api.intelligence.getConnections({ min_strategic_value: 0.5 })
        ]);
        
        setNetworkData(network);
        setIntelligenceData(intelligence);
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
        🧠 Strategic Intelligence Analysis
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Detailed analysis of strategic connections and business opportunities
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ height: 700 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Research Connection Network
              </Typography>
              {networkData && (
                <NetworkVisualization 
                  data={networkData}
                  height={600}
                />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};