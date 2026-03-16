"""
Intelligence Router - Strategic Research Intelligence Endpoints
Serving our breakthrough Enhanced Intelligence Layer results
"""
from fastapi import APIRouter, Request, HTTPException, Query
from typing import List, Optional, Dict, Any
from datetime import datetime

router = APIRouter()

@router.get("/connections")
async def get_strategic_connections(
    request: Request,
    min_strategic_value: float = Query(0.7, ge=0.0, le=1.0, description="Minimum strategic value filter"),
    connection_type: Optional[str] = Query(None, description="Filter by connection type"),
    limit: Optional[int] = Query(100, ge=1, le=1000, description="Maximum number of connections to return")
):
    """
    Get strategic research paper connections from our Enhanced Intelligence Layer
    
    Returns connections with business opportunities and strategic insights
    """
    try:
        connections_data = getattr(request.app.state, 'connections_data', {})
        
        if not connections_data.get('connections'):
            raise HTTPException(status_code=404, detail="No connection data available")
        
        # Filter connections by criteria
        filtered_connections = []
        for conn in connections_data['connections']:
            # Strategic value filter
            if conn.get('strategic_value', 0) < min_strategic_value:
                continue
                
            # Connection type filter
            if connection_type and conn.get('connection_type') != connection_type:
                continue
                
            filtered_connections.append(conn)
            
            # Limit results
            if len(filtered_connections) >= limit:
                break
        
        # Generate summary statistics
        high_value_count = len([c for c in filtered_connections if c.get('strategic_value', 0) > 0.8])
        connection_types = {}
        for conn in filtered_connections:
            conn_type = conn.get('connection_type', 'unknown')
            connection_types[conn_type] = connection_types.get(conn_type, 0) + 1
        
        return {
            "analysis_date": connections_data.get('analysis_date'),
            "total_connections": len(filtered_connections),
            "high_value_connections": high_value_count,
            "connection_types": connection_types,
            "filters_applied": {
                "min_strategic_value": min_strategic_value,
                "connection_type": connection_type,
                "limit": limit
            },
            "connections": filtered_connections,
            "business_intelligence": {
                "immediate_opportunities": high_value_count,
                "consulting_prospects": len([c for c in filtered_connections 
                                           if 'consulting' in c.get('business_opportunity', '').lower()]),
                "methodology_bridges": len([c for c in filtered_connections 
                                          if c.get('connection_type') == 'methodological_bridge'])
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving connections: {str(e)}")

@router.get("/connections/network")
async def get_network_graph(
    request: Request,
    min_strategic_value: float = Query(0.7, description="Minimum strategic value for network inclusion")
):
    """
    Get network graph data optimized for D3.js visualization
    
    Returns nodes and links in format suitable for force-directed graph
    """
    try:
        connections_data = getattr(request.app.state, 'connections_data', {})
        connections = connections_data.get('connections', [])
        
        # Filter high-value connections for network
        filtered_connections = [
            c for c in connections 
            if c.get('strategic_value', 0) >= min_strategic_value
        ]
        
        # Build nodes and links for network graph
        nodes_map = {}
        links = []
        
        for conn in filtered_connections:
            paper1_title = conn.get('paper1_title', 'Unknown Paper 1')
            paper2_title = conn.get('paper2_title', 'Unknown Paper 2')
            
            # Create nodes (deduplicated)
            if paper1_title not in nodes_map:
                nodes_map[paper1_title] = {
                    "id": paper1_title,
                    "title": paper1_title,
                    "short_title": paper1_title[:50] + ("..." if len(paper1_title) > 50 else ""),
                    "type": "paper",
                    "connections": 0
                }
            if paper2_title not in nodes_map:
                nodes_map[paper2_title] = {
                    "id": paper2_title,
                    "title": paper2_title, 
                    "short_title": paper2_title[:50] + ("..." if len(paper2_title) > 50 else ""),
                    "type": "paper",
                    "connections": 0
                }
            
            # Increment connection counts
            nodes_map[paper1_title]["connections"] += 1
            nodes_map[paper2_title]["connections"] += 1
            
            # Create link
            links.append({
                "source": paper1_title,
                "target": paper2_title,
                "strategic_value": conn.get('strategic_value', 0),
                "connection_type": conn.get('connection_type', 'unknown'),
                "business_opportunity": conn.get('business_opportunity', ''),
                "shared_themes": conn.get('shared_themes', []),
                "confidence_score": conn.get('confidence_score', 0),
                "relationship_description": conn.get('relationship_description', '')
            })
        
        nodes = list(nodes_map.values())
        
        # Add node sizing based on connections
        max_connections = max([node["connections"] for node in nodes]) if nodes else 1
        for node in nodes:
            node["size"] = 8 + (node["connections"] / max_connections) * 20  # Scale node size 8-28
        
        return {
            "network_stats": {
                "total_nodes": len(nodes),
                "total_links": len(links),
                "min_strategic_value": min_strategic_value,
                "max_connections_per_node": max_connections
            },
            "nodes": nodes,
            "links": links,
            "visualization_config": {
                "force_strength": -300,
                "link_distance": 100,
                "node_size_range": [8, 28],
                "color_scheme": {
                    "nodes": "#1f77b4",
                    "links": "#999999", 
                    "high_value": "#ff7f0e"
                }
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating network graph: {str(e)}")

@router.get("/summary")
async def get_intelligence_summary(request: Request):
    """
    Get comprehensive strategic intelligence summary
    
    Returns high-level insights and key findings from all intelligence components
    """
    try:
        connections_data = getattr(request.app.state, 'connections_data', {})
        gaps_data = getattr(request.app.state, 'gaps_data', {})
        trends_data = getattr(request.app.state, 'trends_data', {})
        
        # Calculate strategic insights
        connections = connections_data.get('connections', [])
        gaps = gaps_data.get('gaps', [])
        trends = trends_data.get('trends', [])
        
        # Business opportunity analysis
        methodology_bridges = len([c for c in connections if c.get('connection_type') == 'methodological_bridge'])
        high_value_connections = len([c for c in connections if c.get('strategic_value', 0) > 0.8])
        high_opportunity_gaps = len([g for g in gaps if g.get('opportunity_score', 0) > 0.8])
        emerging_trends = len([t for t in trends if t.get('momentum') == 'emerging'])
        
        # Most common themes analysis
        all_themes = []
        for conn in connections:
            all_themes.extend(conn.get('shared_themes', []))
        
        theme_counts = {}
        for theme in all_themes:
            theme_counts[theme] = theme_counts.get(theme, 0) + 1
        
        top_themes = sorted(theme_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return {
            "analysis_date": connections_data.get('analysis_date', str(datetime.now())),
            "executive_summary": {
                "total_strategic_connections": len(connections),
                "high_value_opportunities": high_value_connections,
                "research_gaps_identified": len(gaps),
                "trend_patterns_analyzed": len(trends),
                "business_readiness": "High" if high_value_connections > 100 else "Medium"
            },
            "key_findings": {
                "primary_opportunity": "Methodology consulting across HRI domains" if methodology_bridges > len(connections) * 0.5 else "Cross-sector research bridges",
                "market_positioning": "Framework development and standardization services",
                "competitive_advantage": f"First-mover advantage in {high_opportunity_gaps} gap areas",
                "immediate_revenue_potential": f"{high_value_connections} consulting prospects identified"
            },
            "business_intelligence": {
                "methodology_consulting_opportunities": methodology_bridges,
                "cross_domain_bridges": len([c for c in connections if c.get('connection_type') in ['thematic_overlap', 'complementary_research']]),
                "gap_based_opportunities": high_opportunity_gaps,
                "trend_momentum": {
                    "emerging": emerging_trends,
                    "growing": len([t for t in trends if t.get('momentum') == 'growing']),
                    "stable": len([t for t in trends if t.get('momentum') == 'stable'])
                }
            },
            "research_landscape": {
                "most_common_themes": [{"theme": theme, "frequency": count} for theme, count in top_themes],
                "connection_types": {
                    "methodological_bridge": methodology_bridges,
                    "thematic_overlap": len([c for c in connections if c.get('connection_type') == 'thematic_overlap']),
                    "complementary_research": len([c for c in connections if c.get('connection_type') == 'complementary_research'])
                }
            },
            "strategic_recommendations": {
                "priority_1": "Focus on methodology consulting services (highest opportunity density)",
                "priority_2": f"Develop expertise in {top_themes[0][0] if top_themes else 'key research themes'}",
                "priority_3": f"Address {high_opportunity_gaps} high-opportunity research gaps",
                "market_entry": "Immediate - consulting pipeline ready"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating intelligence summary: {str(e)}")

@router.get("/opportunities")
async def get_business_opportunities(
    request: Request,
    min_strategic_value: float = Query(0.8, description="Minimum strategic value for opportunity inclusion"),
    opportunity_type: Optional[str] = Query(None, description="Filter by opportunity type")
):
    """
    Get ranked business opportunities from strategic connections
    
    Returns actionable business opportunities with revenue potential
    """
    try:
        connections_data = getattr(request.app.state, 'connections_data', {})
        connections = connections_data.get('connections', [])
        
        # Filter and rank opportunities
        opportunities = []
        for conn in connections:
            if conn.get('strategic_value', 0) < min_strategic_value:
                continue
                
            business_opp = conn.get('business_opportunity', '')
            if opportunity_type and opportunity_type.lower() not in business_opp.lower():
                continue
            
            opportunities.append({
                "id": f"opp_{len(opportunities) + 1}",
                "title": f"{conn.get('connection_type', 'Connection').replace('_', ' ').title()} Opportunity",
                "description": business_opp,
                "papers_involved": [conn.get('paper1_title'), conn.get('paper2_title')],
                "strategic_value": conn.get('strategic_value', 0),
                "connection_type": conn.get('connection_type'),
                "shared_themes": conn.get('shared_themes', []),
                "relationship": conn.get('relationship_description', ''),
                "revenue_potential": "High" if conn.get('strategic_value', 0) > 0.9 else "Medium",
                "time_to_market": "Immediate" if conn.get('connection_type') == 'methodological_bridge' else "Short-term",
                "competitive_advantage": "First-mover advantage through systematic analysis"
            })
        
        # Sort by strategic value
        opportunities.sort(key=lambda x: x['strategic_value'], reverse=True)
        
        # Group by opportunity type
        opportunity_groups = {}
        for opp in opportunities:
            opp_type = opp['connection_type']
            if opp_type not in opportunity_groups:
                opportunity_groups[opp_type] = []
            opportunity_groups[opp_type].append(opp)
        
        return {
            "total_opportunities": len(opportunities),
            "high_value_opportunities": len([o for o in opportunities if o['strategic_value'] > 0.9]),
            "filters_applied": {
                "min_strategic_value": min_strategic_value,
                "opportunity_type": opportunity_type
            },
            "opportunity_groups": opportunity_groups,
            "top_opportunities": opportunities[:10],  # Top 10 opportunities
            "market_analysis": {
                "immediate_opportunities": len([o for o in opportunities if o['time_to_market'] == 'Immediate']),
                "total_addressable_market": f"{len(opportunities)} distinct business opportunities",
                "competitive_positioning": "Market leader through systematic intelligence",
                "revenue_projection": f"Est. ${len(opportunities) * 50}K - ${len(opportunities) * 500}K potential (50-500K per engagement)"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving business opportunities: {str(e)}")