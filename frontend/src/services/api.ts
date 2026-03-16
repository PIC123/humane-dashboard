/**
 * API Service - Type definitions only  
 * Actual API functionality is in api-production.ts
 */

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