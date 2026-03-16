/**
 * API Service - Research Intelligence Dashboard
 * Communicates with FastAPI backend serving our Enhanced Intelligence Layer
 */

import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api/v1' 
  : 'http://localhost:8000/api/v1';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🔍 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Intelligence API endpoints
export const intelligenceApi = {
  // Get strategic connections
  getConnections: async (params?: {
    min_strategic_value?: number;
    connection_type?: string;
    limit?: number;
  }) => {
    const response = await apiClient.get('/intelligence/connections', { params });
    return response.data;
  },

  // Get network graph data for D3.js visualization
  getNetworkGraph: async (min_strategic_value: number = 0.7) => {
    const response = await apiClient.get('/intelligence/connections/network', {
      params: { min_strategic_value }
    });
    return response.data;
  },

  // Get intelligence summary
  getSummary: async () => {
    const response = await apiClient.get('/intelligence/summary');
    return response.data;
  },

  // Get business opportunities
  getOpportunities: async (params?: {
    min_strategic_value?: number;
    opportunity_type?: string;
  }) => {
    const response = await apiClient.get('/intelligence/opportunities', { params });
    return response.data;
  },

  // Refresh intelligence data
  refreshData: async () => {
    const response = await apiClient.post('/intelligence/refresh');
    return response.data;
  }
};

// Trends API endpoints
export const trendsApi = {
  // Get trend patterns
  getPatterns: async (params?: {
    momentum_filter?: string;
    min_confidence?: number;
    time_horizon?: string;
  }) => {
    const response = await apiClient.get('/trends/patterns', { params });
    return response.data;
  },

  // Get momentum analysis
  getMomentumAnalysis: async () => {
    const response = await apiClient.get('/trends/momentum');
    return response.data;
  },

  // Get competitive intelligence
  getCompetitiveIntelligence: async () => {
    const response = await apiClient.get('/trends/competitive-intelligence');
    return response.data;
  },

  // Get visualization data
  getVisualizationData: async () => {
    const response = await apiClient.get('/trends/visualization');
    return response.data;
  }
};

// Research Gaps API endpoints
export const gapsApi = {
  // Get research gaps and opportunities
  getOpportunities: async (params?: {
    min_opportunity_score?: number;
    min_feasibility_score?: number;
    gap_type?: string;
    market_potential?: string;
  }) => {
    const response = await apiClient.get('/gaps/opportunities', { params });
    return response.data;
  },

  // Get opportunity matrix for visualization
  getOpportunityMatrix: async () => {
    const response = await apiClient.get('/gaps/matrix');
    return response.data;
  },

  // Get business cases
  getBusinessCases: async () => {
    const response = await apiClient.get('/gaps/business-cases');
    return response.data;
  },

  // Get development timeline
  getTimeline: async () => {
    const response = await apiClient.get('/gaps/timeline');
    return response.data;
  }
};

// Papers API endpoints
export const papersApi = {
  // Get papers list
  getPapers: async (params?: {
    limit?: number;
    offset?: number;
    search?: string;
    tags?: string;
    min_strategic_connections?: number;
  }) => {
    const response = await apiClient.get('/papers', { params });
    return response.data;
  },

  // Search papers
  searchPapers: async (query: string, limit: number = 20) => {
    const response = await apiClient.get('/papers/search', {
      params: { query, limit }
    });
    return response.data;
  },

  // Get paper connections
  getPaperConnections: async (paperId: string, limit: number = 20) => {
    const response = await apiClient.get(`/papers/${paperId}/connections`, {
      params: { limit }
    });
    return response.data;
  },

  // Get papers analytics
  getAnalytics: async () => {
    const response = await apiClient.get('/papers/analytics');
    return response.data;
  }
};

// System API endpoints
export const systemApi = {
  // Health check
  getHealthCheck: async () => {
    const response = await apiClient.get('/', { baseURL: 'http://localhost:8000' });
    return response.data;
  },

  // Get API status
  getStatus: async () => {
    const response = await apiClient.get('/status');
    return response.data;
  }
};

// Combined API object for easy imports
export const api = {
  intelligence: intelligenceApi,
  trends: trendsApi,
  gaps: gapsApi,
  papers: papersApi,
  system: systemApi
};

export default api;

// Types for API responses
export interface Connection {
  paper1_id: string;
  paper2_id: string;
  paper1_title: string;
  paper2_title: string;
  connection_type: string;
  strategic_value: number;
  business_opportunity: string;
  shared_themes: string[];
  confidence_score: number;
  relationship_description: string;
}

export interface NetworkNode {
  id: string;
  title: string;
  short_title: string;
  type: string;
  connections: number;
  size: number;
}

export interface NetworkLink {
  source: string;
  target: string;
  strategic_value: number;
  connection_type: string;
  business_opportunity: string;
  shared_themes: string[];
  confidence_score: number;
  relationship_description: string;
}

export interface NetworkGraphData {
  network_stats: {
    total_nodes: number;
    total_links: number;
    min_strategic_value: number;
    max_connections_per_node: number;
  };
  nodes: NetworkNode[];
  links: NetworkLink[];
  visualization_config: {
    force_strength: number;
    link_distance: number;
    node_size_range: [number, number];
    color_scheme: {
      nodes: string;
      links: string;
      high_value: string;
    };
  };
}

export interface ResearchGap {
  gap_domain: string;
  gap_type: string;
  description: string;
  opportunity_score: number;
  feasibility_score: number;
  market_potential: string;
  evidence: string[];
  suggested_approach: string[];
  competitive_advantage: string;
  timeline: string;
}

export interface TrendPattern {
  trend_topic: string;
  momentum: 'emerging' | 'growing' | 'stable' | 'declining';
  confidence: number;
  evidence_strength: number;
  key_indicators: string[];
  business_implications: string[];
  time_horizon: 'immediate' | 'short-term' | 'long-term';
  research_velocity: number;
  competitive_positioning: string;
  market_readiness: string;
}