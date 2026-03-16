"""
Trends Router - Research Trend Analysis and Business Intelligence
"""
from fastapi import APIRouter, Request, HTTPException, Query
from typing import List, Optional, Dict, Any

router = APIRouter()

@router.get("/patterns")
async def get_trend_patterns(
    request: Request,
    momentum_filter: Optional[str] = Query(None, description="Filter by momentum: emerging, growing, stable, declining"),
    min_confidence: float = Query(0.0, ge=0.0, le=1.0, description="Minimum confidence threshold"),
    time_horizon: Optional[str] = Query(None, description="Filter by time horizon: immediate, short-term, long-term")
):
    """
    Get trend patterns with business intelligence and market positioning analysis
    """
    try:
        trends_data = getattr(request.app.state, 'trends_data', {})
        trends = trends_data.get('trends', [])
        
        if not trends:
            raise HTTPException(status_code=404, detail="No trend data available")
        
        # Apply filters
        filtered_trends = []
        for trend in trends:
            # Momentum filter
            if momentum_filter and trend.get('momentum') != momentum_filter:
                continue
                
            # Confidence filter  
            if trend.get('confidence', 0) < min_confidence:
                continue
                
            # Time horizon filter
            if time_horizon and trend.get('time_horizon') != time_horizon:
                continue
                
            filtered_trends.append(trend)
        
        # Generate trend analysis
        momentum_counts = {}
        business_implications = {}
        
        for trend in filtered_trends:
            momentum = trend.get('momentum', 'unknown')
            momentum_counts[momentum] = momentum_counts.get(momentum, 0) + 1
            
            # Collect business implications
            for implication in trend.get('business_implications', []):
                if implication not in business_implications:
                    business_implications[implication] = []
                business_implications[implication].append(trend.get('trend_topic'))
        
        return {
            "analysis_date": trends_data.get('analysis_date'),
            "total_trends": len(filtered_trends),
            "filters_applied": {
                "momentum_filter": momentum_filter,
                "min_confidence": min_confidence,
                "time_horizon": time_horizon
            },
            "trend_distribution": momentum_counts,
            "trends": filtered_trends,
            "business_analysis": {
                "emerging_opportunities": len([t for t in filtered_trends if t.get('momentum') == 'emerging']),
                "stable_markets": len([t for t in filtered_trends if t.get('momentum') == 'stable']),
                "high_confidence_trends": len([t for t in filtered_trends if t.get('confidence', 0) > 0.75]),
                "immediate_action_required": len([t for t in filtered_trends if t.get('time_horizon') == 'immediate'])
            },
            "strategic_implications": business_implications
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving trend patterns: {str(e)}")

@router.get("/momentum")
async def get_momentum_analysis(request: Request):
    """
    Get detailed momentum analysis across all trend categories
    """
    try:
        trends_data = getattr(request.app.state, 'trends_data', {})
        trends = trends_data.get('trends', [])
        
        if not trends:
            return {"message": "No trend data available", "momentum_analysis": {}}
        
        # Analyze momentum distribution
        momentum_analysis = {
            "emerging": [],
            "growing": [], 
            "stable": [],
            "declining": []
        }
        
        confidence_by_momentum = {
            "emerging": [],
            "growing": [],
            "stable": [],
            "declining": []
        }
        
        business_potential_by_momentum = {
            "emerging": [],
            "growing": [],
            "stable": [],
            "declining": []
        }
        
        for trend in trends:
            momentum = trend.get('momentum', 'stable')
            confidence = trend.get('confidence', 0)
            
            trend_info = {
                "topic": trend.get('trend_topic'),
                "confidence": confidence,
                "research_velocity": trend.get('research_velocity', 0),
                "competitive_positioning": trend.get('competitive_positioning'),
                "market_readiness": trend.get('market_readiness'),
                "key_indicators": trend.get('key_indicators', [])[:2]  # Top 2 indicators
            }
            
            if momentum in momentum_analysis:
                momentum_analysis[momentum].append(trend_info)
                confidence_by_momentum[momentum].append(confidence)
                
                # Extract business potential from market readiness
                readiness = trend.get('market_readiness', '')
                if 'high reward' in readiness.lower():
                    business_potential_by_momentum[momentum].append('high')
                elif 'good timing' in readiness.lower() or 'ready' in readiness.lower():
                    business_potential_by_momentum[momentum].append('medium')
                else:
                    business_potential_by_momentum[momentum].append('low')
        
        # Calculate statistics
        momentum_stats = {}
        for momentum, trend_list in momentum_analysis.items():
            confidences = confidence_by_momentum[momentum]
            potentials = business_potential_by_momentum[momentum]
            
            momentum_stats[momentum] = {
                "count": len(trend_list),
                "avg_confidence": sum(confidences) / len(confidences) if confidences else 0,
                "avg_velocity": sum([t['research_velocity'] for t in trend_list]) / len(trend_list) if trend_list else 0,
                "high_potential_count": potentials.count('high'),
                "medium_potential_count": potentials.count('medium'),
                "low_potential_count": potentials.count('low')
            }
        
        return {
            "momentum_distribution": momentum_analysis,
            "momentum_statistics": momentum_stats,
            "strategic_insights": {
                "top_emerging": momentum_analysis['emerging'][:3],
                "top_growing": momentum_analysis['growing'][:3],
                "most_stable": momentum_analysis['stable'][:3],
                "attention_required": momentum_analysis['declining']
            },
            "business_recommendations": {
                "immediate_focus": [
                    t['topic'] for t in momentum_analysis['emerging'] 
                    if t['confidence'] > 0.7
                ][:3],
                "short_term_investment": [
                    t['topic'] for t in momentum_analysis['growing']
                    if t['confidence'] > 0.6
                ][:3],
                "market_positioning": [
                    t['topic'] for t in momentum_analysis['stable']
                    if t['research_velocity'] > 1.0
                ][:3]
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing trend momentum: {str(e)}")

@router.get("/competitive-intelligence") 
async def get_competitive_intelligence(request: Request):
    """
    Get competitive intelligence and market positioning analysis from trends
    """
    try:
        trends_data = getattr(request.app.state, 'trends_data', {})
        trends = trends_data.get('trends', [])
        
        if not trends:
            return {"message": "No trend data available for competitive analysis"}
        
        # Analyze competitive positioning
        positioning_analysis = {
            "lead": [],          # First-mover advantage opportunities
            "follow-fast": [],   # Fast follower opportunities  
            "differentiate": [], # Differentiation required
            "monitor": []        # Monitor and evaluate
        }
        
        market_readiness_analysis = {
            "ready": [],         # Market ready for entry
            "development": [],   # Market in development phase
            "mature": [],        # Mature market
            "declining": []      # Declining opportunities
        }
        
        for trend in trends:
            positioning = trend.get('competitive_positioning', 'monitor')
            readiness = trend.get('market_readiness', '')
            
            trend_summary = {
                "topic": trend.get('trend_topic'),
                "momentum": trend.get('momentum'),
                "confidence": trend.get('confidence', 0),
                "business_implications": trend.get('business_implications', [])[:2],
                "market_readiness": readiness,
                "time_horizon": trend.get('time_horizon', 'unknown')
            }
            
            # Group by competitive positioning
            if positioning in positioning_analysis:
                positioning_analysis[positioning].append(trend_summary)
            
            # Group by market readiness
            if 'ready' in readiness.lower() and 'development' not in readiness.lower():
                market_readiness_analysis['ready'].append(trend_summary)
            elif 'development' in readiness.lower():
                market_readiness_analysis['development'].append(trend_summary)
            elif 'mature' in readiness.lower() or 'established' in readiness.lower():
                market_readiness_analysis['mature'].append(trend_summary)
            elif 'declining' in readiness.lower():
                market_readiness_analysis['declining'].append(trend_summary)
        
        # Generate strategic recommendations
        strategic_priorities = {
            "priority_1_lead": positioning_analysis['lead'][:2],  # Top lead opportunities
            "priority_2_follow_fast": positioning_analysis['follow-fast'][:2],  # Top follow-fast  
            "priority_3_differentiate": positioning_analysis['differentiate'][:2]  # Top differentiation
        }
        
        return {
            "competitive_positioning": positioning_analysis,
            "market_readiness": market_readiness_analysis,
            "strategic_priorities": strategic_priorities,
            "competitive_intelligence": {
                "first_mover_opportunities": len(positioning_analysis['lead']),
                "fast_follower_opportunities": len(positioning_analysis['follow-fast']),
                "differentiation_required": len(positioning_analysis['differentiate']),
                "markets_ready_for_entry": len(market_readiness_analysis['ready']),
                "emerging_markets": len(market_readiness_analysis['development'])
            },
            "risk_assessment": {
                "high_risk_high_reward": len([
                    t for t in trends 
                    if t.get('momentum') == 'emerging' and t.get('confidence', 0) < 0.7
                ]),
                "safe_investments": len([
                    t for t in trends
                    if t.get('momentum') in ['growing', 'stable'] and t.get('confidence', 0) > 0.75
                ]),
                "market_disruption_potential": len([
                    t for t in trends
                    if 'first-mover' in str(t.get('business_implications', [])).lower()
                ])
            },
            "action_recommendations": {
                "immediate_investment": [
                    t['topic'] for t in positioning_analysis['lead'] 
                    if t['confidence'] > 0.8
                ][:2],
                "monitor_closely": [
                    t['topic'] for t in market_readiness_analysis['development']
                    if t['momentum'] == 'emerging'
                ][:3],
                "market_entry_timing": {
                    "now": len(market_readiness_analysis['ready']),
                    "6_months": len(market_readiness_analysis['development']),
                    "12_months": len([t for t in trends if t.get('time_horizon') == 'short-term'])
                }
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating competitive intelligence: {str(e)}")

@router.get("/visualization")
async def get_trend_visualization_data(request: Request):
    """
    Get trend data formatted for frontend visualizations (charts, timelines, etc.)
    """
    try:
        trends_data = getattr(request.app.state, 'trends_data', {})
        trends = trends_data.get('trends', [])
        
        if not trends:
            return {"message": "No trend data available for visualization"}
        
        # Prepare data for different chart types
        
        # 1. Momentum vs Confidence Scatter Plot
        scatter_data = []
        for trend in trends:
            momentum_score = {
                'emerging': 4,
                'growing': 3, 
                'stable': 2,
                'declining': 1
            }.get(trend.get('momentum', 'stable'), 2)
            
            scatter_data.append({
                "topic": trend.get('trend_topic'),
                "momentum_score": momentum_score,
                "momentum_label": trend.get('momentum'),
                "confidence": trend.get('confidence', 0) * 100,  # Convert to percentage
                "research_velocity": trend.get('research_velocity', 0),
                "market_readiness": trend.get('market_readiness'),
                "business_implications": len(trend.get('business_implications', []))
            })
        
        # 2. Business Potential Timeline
        timeline_data = []
        for trend in trends:
            time_score = {
                'immediate': 1,
                'short-term': 6,
                'medium-term': 12,
                'long-term': 24
            }.get(trend.get('time_horizon', 'long-term'), 24)
            
            timeline_data.append({
                "topic": trend.get('trend_topic'),
                "time_to_impact": time_score,
                "time_horizon": trend.get('time_horizon'),
                "confidence": trend.get('confidence', 0),
                "momentum": trend.get('momentum'),
                "competitive_positioning": trend.get('competitive_positioning')
            })
        
        # 3. Momentum Distribution (for pie/donut chart)
        momentum_distribution = {}
        for trend in trends:
            momentum = trend.get('momentum', 'stable')
            momentum_distribution[momentum] = momentum_distribution.get(momentum, 0) + 1
        
        pie_data = [
            {"name": momentum.title(), "value": count, "percentage": round(count/len(trends)*100, 1)}
            for momentum, count in momentum_distribution.items()
        ]
        
        # 4. Research Velocity Bar Chart
        velocity_data = [
            {
                "topic": trend.get('trend_topic'),
                "velocity": trend.get('research_velocity', 0),
                "confidence": trend.get('confidence', 0),
                "momentum": trend.get('momentum')
            }
            for trend in trends
        ]
        velocity_data.sort(key=lambda x: x['velocity'], reverse=True)
        
        return {
            "visualization_datasets": {
                "momentum_confidence_scatter": {
                    "data": scatter_data,
                    "chart_config": {
                        "x_axis": "confidence",
                        "y_axis": "momentum_score", 
                        "size_by": "research_velocity",
                        "color_by": "momentum_label",
                        "tooltip_fields": ["topic", "market_readiness", "business_implications"]
                    }
                },
                "business_timeline": {
                    "data": timeline_data,
                    "chart_config": {
                        "x_axis": "time_to_impact",
                        "y_axis": "confidence",
                        "color_by": "momentum",
                        "shape_by": "competitive_positioning"
                    }
                },
                "momentum_distribution": {
                    "data": pie_data,
                    "chart_config": {
                        "type": "donut",
                        "value_field": "value",
                        "label_field": "name",
                        "colors": {
                            "Emerging": "#ff7f0e",
                            "Growing": "#2ca02c", 
                            "Stable": "#1f77b4",
                            "Declining": "#d62728"
                        }
                    }
                },
                "research_velocity": {
                    "data": velocity_data[:10],  # Top 10
                    "chart_config": {
                        "type": "horizontal_bar",
                        "x_field": "velocity",
                        "y_field": "topic",
                        "color_by": "momentum"
                    }
                }
            },
            "summary_stats": {
                "total_trends": len(trends),
                "avg_confidence": sum([t.get('confidence', 0) for t in trends]) / len(trends) if trends else 0,
                "avg_velocity": sum([t.get('research_velocity', 0) for t in trends]) / len(trends) if trends else 0,
                "high_confidence_count": len([t for t in trends if t.get('confidence', 0) > 0.75]),
                "immediate_opportunities": len([t for t in trends if t.get('time_horizon') == 'immediate'])
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating trend visualization data: {str(e)}")