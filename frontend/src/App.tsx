import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

// Components
import { Layout } from './components/shared/Layout';
import { WebSocketProvider } from './components/shared/WebSocketProvider';

// Pages
import { Dashboard } from './pages/Dashboard';
import { IntelligenceAnalysis } from './pages/IntelligenceAnalysis';
import { TrendsAnalysis } from './pages/TrendsAnalysis';
import { ResearchGaps } from './pages/ResearchGaps';

// Styles
import './styles/App.css';

// Create dark theme for research dashboard
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1f77b4',
      light: '#63a4ff',
      dark: '#004b73',
    },
    secondary: {
      main: '#ff7f0e',
      light: '#ffb74d',
      dark: '#c56000',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.5px',
    },
    h5: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
          border: '1px solid #333',
          borderRadius: '12px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: '#333',
          color: '#fff',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <WebSocketProvider>
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/intelligence" element={<IntelligenceAnalysis />} />
                <Route path="/trends" element={<TrendsAnalysis />} />
                <Route path="/gaps" element={<ResearchGaps />} />
              </Routes>
            </Layout>
          </Box>
        </Router>
      </WebSocketProvider>
    </ThemeProvider>
  );
}

export default App;