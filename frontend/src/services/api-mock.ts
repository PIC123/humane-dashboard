/**
 * API Service with Mock Data - For Vercel Deployment
 */

// Mock data for production deployment
const mockData = {
  intelligence: {
    connections: Array.from({ length: 20 }, (_, i) => ({
      paper1_id: `paper_${i + 1}`,
      paper2_id: `paper_${i + 2}`,
      paper1_title: `Research Paper ${i + 1}: Human-Robot Interaction`,
      paper2_title: `Research Paper ${i + 2}: Ethical AI Systems`,
      connection_type: ["complementary_research", "overlapping_themes", "methodological_alignment"][i % 3],
      strategic_value: 0.7 + (Math.random() * 0.3),
      business_opportunity: `Business opportunity ${i + 1}: Market size $${(50 + Math.random() * 200).toFixed(0)}K`,
      shared_themes: ["human-robot trust", "ethical considerations", "user experience"],
      confidence_score: 0.8 + (Math.random() * 0.2),
      relationship_description: `Strategic connection identifying synergies between papers ${i + 1} and ${i + 2}`
    })),
    total_connections: 232,
    high_value_connections: 231
  },

  networkGraph: {
    network_stats: {
      total_nodes: 25,
      total_links: 45,
      min_strategic_value: 0.7,
      max_connections_per_node: 8
    },
    nodes: Array.from({ length: 25 }, (_, i) => ({
      id: `paper_${i + 1}`,
      title: `Research Paper ${i + 1}`,
      short_title: `Paper ${i + 1}`,
      type: ["research", "survey", "technical"][i % 3],
      connections: Math.floor(Math.random() * 8) + 1,
      size: Math.floor(Math.random() * 50) + 20
    })),
    links: Array.from({ length: 45 }, (_, i) => ({
      source: `paper_${Math.floor(i / 2) + 1}`,
      target: `paper_${Math.floor(i / 2) + 2}`,
      strategic_value: 0.7 + (Math.random() * 0.3),
      connection_type: ["complementary", "overlapping", "methodological"][i % 3],
      business_opportunity: `Opportunity ${i + 1}`,
      shared_themes: ["AI", "robotics", "human factors"],
      confidence_score: 0.8 + (Math.random() * 0.2),
      relationship_description: `Connection ${i + 1}`
    })),
    visualization_config: {
      force_strength: -300,
      link_distance: 50,
      node_size_range: [20, 80],
      color_scheme: {
        nodes: "#1f77b4",
        links: "#aaa",
        high_value: "#ff7f0e"
      }
    }
  },

  trends: {
    trends: [
      {
        trend_topic: "Human-AI Collaboration in Healthcare",
        momentum: "emerging" as const,
        confidence: 0.89,
        evidence_strength: 0.85,
        key_indicators: ["Increased research funding", "Industry adoption", "Regulatory support"],
        business_implications: ["First-mover advantage", "Market expansion", "Regulatory compliance"],
        time_horizon: "short-term" as const,
        research_velocity: 0.78,
        competitive_positioning: "Strong market position with early entry opportunity",
        market_readiness: "High readiness with growing demand"
      },
      {
        trend_topic: "Ethical AI in Autonomous Systems",
        momentum: "growing" as const,
        confidence: 0.92,
        evidence_strength: 0.88,
        key_indicators: ["Policy development", "Academic focus", "Industry guidelines"],
        business_implications: ["Compliance requirements", "Competitive differentiation", "Risk mitigation"],
        time_horizon: "immediate" as const,
        research_velocity: 0.85,
        competitive_positioning: "Critical for market entry and sustainability",
        market_readiness: "Immediate demand from enterprise customers"
      }
    ],
    total_trends: 8,
    emerging_trends: 3
  },

  gaps: {
    gaps: [
      {
        gap_domain: "Human-Robot Interaction",
        gap_type: "methodological_gap",
        description: "Limited research on intergenerational communication patterns with social robots",
        opportunity_score: 0.92,
        feasibility_score: 0.87,
        market_potential: "high",
        evidence: [
          "Only 3 studies address age-specific HRI patterns",
          "Growing elderly care market ($460B by 2025)",
          "Insufficient design guidelines for diverse age groups"
        ],
        suggested_approach: [
          "Longitudinal study across age cohorts",
          "Mixed-methods research design",
          "Industry partnership for real-world validation"
        ],
        competitive_advantage: "First comprehensive framework for age-inclusive robot design",
        timeline: "12-18 months for initial results"
      }
    ],
    total_gaps: 1,
    high_opportunity: 1
  }
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API Functions that return mock data
export const intelligenceApi = {
  getConnections: async (params?: any) => {
    await delay(300);
    return mockData.intelligence;
  },

  getNetworkGraph: async (min_strategic_value: number = 0.7) => {
    await delay(500);
    return mockData.networkGraph;
  },

  getSummary: async () => {
    await delay(200);
    return {
      summary: {
        total_connections: 232,
        high_value_opportunities: 231,
        revenue_potential: "11.5M - 115M",
        strategic_insights: "Research intelligence platform operational"
      },
      status: "ready"
    };
  },

  getOpportunities: async (params?: any) => {
    await delay(300);
    return mockData.intelligence;
  },

  refreshData: async () => {
    await delay(1000);
    return { message: "Data refreshed", status: "success" };
  }
};

export const trendsApi = {
  getPatterns: async (params?: any) => {
    await delay(300);
    return mockData.trends;
  },

  getMomentumAnalysis: async () => {
    await delay(200);
    return {
      momentum_analysis: {
        emerging: 3,
        growing: 2,
        stable: 2,
        declining: 1
      },
      confidence_metrics: {
        high_confidence: 6,
        medium_confidence: 2,
        low_confidence: 0
      }
    };
  },

  getCompetitiveIntelligence: async () => {
    await delay(300);
    return mockData.trends;
  },

  getVisualizationData: async () => {
    await delay(200);
    return {
      visualization_data: mockData.trends.trends.map(trend => ({
        x: trend.confidence,
        y: trend.research_velocity,
        trend: trend.trend_topic,
        size: 50000 + Math.random() * 200000
      })),
      axes: {
        x: "Confidence",
        y: "Research Velocity", 
        size: "Revenue Potential"
      }
    };
  }
};

export const gapsApi = {
  getOpportunities: async (params?: any) => {
    await delay(300);
    return mockData.gaps;
  },

  getOpportunityMatrix: async () => {
    await delay(200);
    return {
      matrix_data: mockData.gaps.gaps.map(gap => ({
        x: gap.feasibility_score,
        y: gap.opportunity_score,
        title: gap.gap_domain,
        revenue: 180000,
        category: "social_robotics"
      })),
      quadrants: {
        high_opportunity_high_feasibility: 1,
        high_opportunity_low_feasibility: 0,
        low_opportunity_high_feasibility: 0,
        low_opportunity_low_feasibility: 0
      }
    };
  },

  getBusinessCases: async () => {
    await delay(300);
    return {
      business_cases: [
        {
          gap_id: "gap_001",
          investment_required: 50000,
          expected_revenue: 180000,
          roi_percentage: 360,
          payback_period: "8-12 months",
          risk_level: "medium",
          market_readiness: "high"
        }
      ]
    };
  },

  getTimeline: async () => {
    await delay(200);
    return mockData.gaps;
  }
};

export const papersApi = {
  getPapers: async (params?: any) => {
    await delay(300);
    return { papers: [], total: 0, message: "Mock papers API" };
  },

  searchPapers: async (query: string, limit: number = 20) => {
    await delay(300);
    return { results: [], query, message: "Mock search API" };
  },

  getPaperConnections: async (paperId: string, limit: number = 20) => {
    await delay(300);
    return mockData.intelligence;
  },

  getAnalytics: async () => {
    await delay(200);
    return { analytics: {}, message: "Mock analytics API" };
  }
};

export const systemApi = {
  getHealthCheck: async () => {
    await delay(100);
    return { status: "healthy", message: "Mock system API" };
  },

  getStatus: async () => {
    await delay(100);
    return { status: "operational", message: "Mock status API" };
  }
};

export const api = {
  intelligence: intelligenceApi,
  trends: trendsApi,
  gaps: gapsApi,
  papers: papersApi,
  system: systemApi
};