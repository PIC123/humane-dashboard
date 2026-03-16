"""
Research Gaps Router - Knowledge Gap Analysis and Business Opportunities
"""
from fastapi import APIRouter, Request, HTTPException, Query
from typing import List, Optional, Dict, Any

router = APIRouter()

@router.get("/opportunities")
async def get_research_gaps(
    request: Request,
    min_opportunity_score: float = Query(0.0, ge=0.0, le=1.0, description="Minimum opportunity score filter"),
    min_feasibility_score: float = Query(0.0, ge=0.0, le=1.0, description="Minimum feasibility score filter"), 
    gap_type: Optional[str] = Query(None, description="Filter by gap type"),
    market_potential: Optional[str] = Query(None, description="Filter by market potential level")
):
    """
    Get identified research gaps with business opportunity analysis
    """
    try:
        gaps_data = getattr(request.app.state, 'gaps_data', {})
        gaps = gaps_data.get('gaps', [])
        
        if not gaps:
            raise HTTPException(status_code=404, detail="No research gap data available")
        
        # Apply filters
        filtered_gaps = []
        for gap in gaps:
            # Opportunity score filter
            if gap.get('opportunity_score', 0) < min_opportunity_score:
                continue
                
            # Feasibility score filter
            if gap.get('feasibility_score', 0) < min_feasibility_score:
                continue
                
            # Gap type filter
            if gap_type and gap.get('gap_type') != gap_type:
                continue
                
            # Market potential filter
            if market_potential and market_potential.lower() not in gap.get('market_potential', '').lower():
                continue
                
            filtered_gaps.append(gap)
        
        # Sort by opportunity score
        filtered_gaps.sort(key=lambda x: x.get('opportunity_score', 0), reverse=True)
        
        # Generate gap analysis
        gap_types = {}
        market_levels = {}
        
        for gap in filtered_gaps:
            # Count gap types
            gap_type_val = gap.get('gap_type', 'unknown')
            gap_types[gap_type_val] = gap_types.get(gap_type_val, 0) + 1
            
            # Count market potential levels
            market_pot = gap.get('market_potential', '')
            if 'very high' in market_pot.lower():
                market_levels['Very High'] = market_levels.get('Very High', 0) + 1
            elif 'high' in market_pot.lower():
                market_levels['High'] = market_levels.get('High', 0) + 1
            elif 'medium' in market_pot.lower():
                market_levels['Medium'] = market_levels.get('Medium', 0) + 1
            else:
                market_levels['Low'] = market_levels.get('Low', 0) + 1
        
        return {
            "analysis_date": gaps_data.get('analysis_date'),
            "total_gaps": len(filtered_gaps),
            "high_opportunity_gaps": len([g for g in filtered_gaps if g.get('opportunity_score', 0) > 0.8]),
            "filters_applied": {
                "min_opportunity_score": min_opportunity_score,
                "min_feasibility_score": min_feasibility_score,
                "gap_type": gap_type,
                "market_potential": market_potential
            },
            "gap_distribution": {
                "by_type": gap_types,
                "by_market_potential": market_levels
            },
            "gaps": filtered_gaps,
            "business_analysis": {
                "immediate_opportunities": len([g for g in filtered_gaps if '3-6 months' in g.get('timeline', '')]),
                "short_term_opportunities": len([g for g in filtered_gaps if '6-12 months' in g.get('timeline', '')]),
                "long_term_opportunities": len([g for g in filtered_gaps if '12' in g.get('timeline', '') and 'months' in g.get('timeline', '')]),
                "high_roi_opportunities": len([g for g in filtered_gaps if g.get('opportunity_score', 0) > 0.8 and g.get('feasibility_score', 0) > 0.7])
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving research gaps: {str(e)}")

@router.get("/matrix")
async def get_opportunity_matrix(request: Request):
    """
    Get research gap opportunity matrix for visualization (Opportunity vs Feasibility)
    """
    try:
        gaps_data = getattr(request.app.state, 'gaps_data', {})
        gaps = gaps_data.get('gaps', [])
        
        if not gaps:
            return {"message": "No research gap data available for matrix analysis"}
        
        # Prepare matrix data
        matrix_data = []
        quadrant_analysis = {
            "high_opportunity_high_feasibility": [],  # Top right - Priority
            "high_opportunity_low_feasibility": [],   # Top left - Partnership needed
            "low_opportunity_high_feasibility": [],   # Bottom right - Quick wins
            "low_opportunity_low_feasibility": []     # Bottom left - Avoid
        }
        
        for gap in gaps:
            opportunity = gap.get('opportunity_score', 0)
            feasibility = gap.get('feasibility_score', 0)
            
            # Determine market potential score for sizing
            market_potential = gap.get('market_potential', '')
            if 'very high' in market_potential.lower():
                size_score = 400
                size_label = 'Very High'
            elif 'high' in market_potential.lower():
                size_score = 300
                size_label = 'High'
            elif 'medium' in market_potential.lower():
                size_score = 200
                size_label = 'Medium'
            else:
                size_score = 100
                size_label = 'Low'
            
            matrix_point = {
                "gap_domain": gap.get('gap_domain', 'Unknown Gap'),
                "opportunity_score": opportunity * 100,  # Convert to percentage
                "feasibility_score": feasibility * 100,  # Convert to percentage
                "market_potential": size_label,
                "market_size": size_score,
                "gap_type": gap.get('gap_type', 'unknown'),
                "timeline": gap.get('timeline', 'unknown'),
                "competitive_advantage": gap.get('competitive_advantage', ''),
                "evidence": gap.get('evidence', []),
                "suggested_approach": gap.get('suggested_approach', [])
            }
            
            matrix_data.append(matrix_point)
            
            # Categorize into quadrants
            if opportunity > 0.6 and feasibility > 0.7:
                quadrant_analysis["high_opportunity_high_feasibility"].append(matrix_point)
            elif opportunity > 0.6 and feasibility <= 0.7:
                quadrant_analysis["high_opportunity_low_feasibility"].append(matrix_point)
            elif opportunity <= 0.6 and feasibility > 0.7:
                quadrant_analysis["low_opportunity_high_feasibility"].append(matrix_point)
            else:
                quadrant_analysis["low_opportunity_low_feasibility"].append(matrix_point)
        
        return {
            "matrix_data": matrix_data,
            "quadrant_analysis": quadrant_analysis,
            "strategic_insights": {
                "priority_focus": len(quadrant_analysis["high_opportunity_high_feasibility"]),
                "partnership_needed": len(quadrant_analysis["high_opportunity_low_feasibility"]), 
                "quick_wins": len(quadrant_analysis["low_opportunity_high_feasibility"]),
                "avoid_areas": len(quadrant_analysis["low_opportunity_low_feasibility"])
            },
            "recommendations": {
                "immediate_focus": [
                    {"gap": gap["gap_domain"], "timeline": gap["timeline"]} 
                    for gap in quadrant_analysis["high_opportunity_high_feasibility"][:3]
                ],
                "partnership_opportunities": [
                    {"gap": gap["gap_domain"], "approach": gap["suggested_approach"][:1]}
                    for gap in quadrant_analysis["high_opportunity_low_feasibility"][:3]
                ],
                "quick_development": [
                    {"gap": gap["gap_domain"], "advantage": gap["competitive_advantage"]}
                    for gap in quadrant_analysis["low_opportunity_high_feasibility"][:3]
                ]
            },
            "visualization_config": {
                "x_axis": "feasibility_score",
                "y_axis": "opportunity_score", 
                "size_by": "market_size",
                "color_by": "gap_type",
                "quadrant_labels": {
                    "top_right": "Priority Focus",
                    "top_left": "Partnership Needed",
                    "bottom_right": "Quick Wins", 
                    "bottom_left": "Avoid"
                },
                "size_legend": {
                    "Very High": 400,
                    "High": 300,
                    "Medium": 200,
                    "Low": 100
                }
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating opportunity matrix: {str(e)}")

@router.get("/business-cases")
async def get_gap_business_cases(request: Request):
    """
    Get detailed business cases for high-opportunity research gaps
    """
    try:
        gaps_data = getattr(request.app.state, 'gaps_data', {})
        gaps = gaps_data.get('gaps', [])
        
        if not gaps:
            return {"message": "No research gap data available for business cases"}
        
        # Filter for high-opportunity gaps
        high_opportunity_gaps = [
            gap for gap in gaps 
            if gap.get('opportunity_score', 0) > 0.6
        ]
        
        # Sort by combined opportunity and feasibility score
        high_opportunity_gaps.sort(
            key=lambda x: (x.get('opportunity_score', 0) * x.get('feasibility_score', 0)), 
            reverse=True
        )
        
        business_cases = []
        for i, gap in enumerate(high_opportunity_gaps[:10]):  # Top 10 business cases
            
            # Calculate business potential metrics
            opportunity = gap.get('opportunity_score', 0)
            feasibility = gap.get('feasibility_score', 0)
            combined_score = opportunity * feasibility
            
            # Determine investment level based on timeline and feasibility
            timeline = gap.get('timeline', '')
            if '3-6 months' in timeline:
                investment_level = 'Low'
                time_to_roi = '6 months'
            elif '6-12 months' in timeline:
                investment_level = 'Medium'
                time_to_roi = '12 months'
            else:
                investment_level = 'High'
                time_to_roi = '18+ months'
            
            # Extract revenue potential from market potential
            market_potential = gap.get('market_potential', '')
            if 'very high' in market_potential.lower():
                revenue_potential = '$500K+ annually'
                market_size = 'Very Large'
            elif 'high' in market_potential.lower():
                revenue_potential = '$200-500K annually' 
                market_size = 'Large'
            else:
                revenue_potential = '$50-200K annually'
                market_size = 'Medium'
            
            business_case = {
                "case_id": f"gap_bc_{i+1}",
                "gap_domain": gap.get('gap_domain'),
                "business_case_title": f"{gap.get('gap_domain')} Market Opportunity",
                "executive_summary": {
                    "opportunity_description": gap.get('description'),
                    "market_size": market_size,
                    "competitive_advantage": gap.get('competitive_advantage'),
                    "time_to_market": gap.get('timeline'),
                    "investment_required": investment_level
                },
                "financial_projections": {
                    "revenue_potential": revenue_potential,
                    "time_to_roi": time_to_roi,
                    "market_share_potential": "5-15% (first-mover advantage)",
                    "break_even": "12-18 months"
                },
                "implementation_plan": {
                    "suggested_approach": gap.get('suggested_approach', []),
                    "key_milestones": [
                        f"Phase 1: {gap.get('suggested_approach', ['Research phase'])[0] if gap.get('suggested_approach') else 'Initial research'}",
                        "Phase 2: Prototype development",
                        "Phase 3: Market validation",
                        "Phase 4: Commercial launch"
                    ],
                    "resource_requirements": f"{investment_level} initial investment",
                    "success_metrics": [
                        "Market penetration rate",
                        "Customer acquisition cost",
                        "Revenue per engagement"
                    ]
                },
                "risk_assessment": {
                    "technical_risk": "Medium" if feasibility > 0.7 else "High",
                    "market_risk": "Low" if opportunity > 0.8 else "Medium",
                    "competitive_risk": "Low (first-mover advantage)",
                    "mitigation_strategies": [
                        "Phased implementation approach",
                        "Partnership with domain experts",
                        "Continuous market validation"
                    ]
                },
                "competitive_analysis": {
                    "current_solutions": "Limited existing solutions identified",
                    "competitive_advantage": gap.get('competitive_advantage'),
                    "barriers_to_entry": "High (requires specialized expertise)",
                    "market_positioning": "Premium specialized services"
                },
                "success_probability": {
                    "overall_score": combined_score,
                    "opportunity_score": opportunity,
                    "feasibility_score": feasibility,
                    "confidence_rating": "High" if combined_score > 0.6 else "Medium"
                }
            }
            
            business_cases.append(business_case)
        
        return {
            "total_business_cases": len(business_cases),
            "high_priority_cases": len([bc for bc in business_cases if bc['success_probability']['overall_score'] > 0.7]),
            "business_cases": business_cases,
            "portfolio_analysis": {
                "total_revenue_potential": "Est. $2-5M annually (top 5 cases)",
                "average_time_to_roi": "12-18 months",
                "investment_distribution": {
                    "low": len([bc for bc in business_cases if bc['executive_summary']['investment_required'] == 'Low']),
                    "medium": len([bc for bc in business_cases if bc['executive_summary']['investment_required'] == 'Medium']),
                    "high": len([bc for bc in business_cases if bc['executive_summary']['investment_required'] == 'High'])
                },
                "recommended_portfolio": "Focus on top 3 cases for maximum ROI"
            },
            "strategic_recommendations": {
                "immediate_action": [
                    bc['gap_domain'] for bc in business_cases[:3]
                    if bc['executive_summary']['investment_required'] == 'Low'
                ],
                "short_term_development": [
                    bc['gap_domain'] for bc in business_cases[:5]  
                    if bc['executive_summary']['investment_required'] == 'Medium'
                ],
                "long_term_investment": [
                    bc['gap_domain'] for bc in business_cases
                    if bc['executive_summary']['investment_required'] == 'High'
                ][:2]
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating business cases: {str(e)}")

@router.get("/timeline")
async def get_gap_development_timeline(request: Request):
    """
    Get development timeline visualization for research gap opportunities
    """
    try:
        gaps_data = getattr(request.app.state, 'gaps_data', {})
        gaps = gaps_data.get('gaps', [])
        
        if not gaps:
            return {"message": "No research gap data available for timeline analysis"}
        
        # Organize gaps by timeline
        timeline_buckets = {
            "immediate": {"label": "0-6 months", "gaps": []},
            "short_term": {"label": "6-12 months", "gaps": []},
            "medium_term": {"label": "12-18 months", "gaps": []},
            "long_term": {"label": "18+ months", "gaps": []}
        }
        
        for gap in gaps:
            timeline = gap.get('timeline', '')
            gap_info = {
                "gap_domain": gap.get('gap_domain'),
                "opportunity_score": gap.get('opportunity_score', 0),
                "feasibility_score": gap.get('feasibility_score', 0),
                "market_potential": gap.get('market_potential', ''),
                "competitive_advantage": gap.get('competitive_advantage', ''),
                "suggested_approach": gap.get('suggested_approach', [])[:2]  # Top 2 approaches
            }
            
            # Categorize by timeline
            if '3-6 months' in timeline:
                timeline_buckets["immediate"]["gaps"].append(gap_info)
            elif '6-12 months' in timeline:
                timeline_buckets["short_term"]["gaps"].append(gap_info)
            elif '12-18 months' in timeline:
                timeline_buckets["medium_term"]["gaps"].append(gap_info)
            else:
                timeline_buckets["long_term"]["gaps"].append(gap_info)
        
        # Sort gaps within each bucket by opportunity score
        for bucket in timeline_buckets.values():
            bucket["gaps"].sort(key=lambda x: x["opportunity_score"], reverse=True)
        
        # Create timeline visualization data
        timeline_viz_data = []
        current_month = 0
        
        for period, bucket_data in timeline_buckets.items():
            if period == "immediate":
                start_month, end_month = 0, 6
            elif period == "short_term":
                start_month, end_month = 6, 12
            elif period == "medium_term":
                start_month, end_month = 12, 18
            else:
                start_month, end_month = 18, 24
            
            for gap in bucket_data["gaps"]:
                timeline_viz_data.append({
                    "gap_domain": gap["gap_domain"],
                    "start_month": start_month,
                    "end_month": end_month,
                    "duration": end_month - start_month,
                    "opportunity_score": gap["opportunity_score"],
                    "feasibility_score": gap["feasibility_score"],
                    "priority": "High" if gap["opportunity_score"] > 0.8 else "Medium" if gap["opportunity_score"] > 0.6 else "Low",
                    "market_potential": gap["market_potential"]
                })
        
        return {
            "timeline_buckets": timeline_buckets,
            "timeline_visualization": timeline_viz_data,
            "development_roadmap": {
                "phase_1_immediate": {
                    "timeframe": "0-6 months",
                    "focus": "Quick wins and market entry",
                    "opportunities": len(timeline_buckets["immediate"]["gaps"]),
                    "priority_gaps": [gap["gap_domain"] for gap in timeline_buckets["immediate"]["gaps"][:3]]
                },
                "phase_2_short_term": {
                    "timeframe": "6-12 months", 
                    "focus": "Core capability development",
                    "opportunities": len(timeline_buckets["short_term"]["gaps"]),
                    "priority_gaps": [gap["gap_domain"] for gap in timeline_buckets["short_term"]["gaps"][:3]]
                },
                "phase_3_medium_term": {
                    "timeframe": "12-18 months",
                    "focus": "Advanced research and partnerships",
                    "opportunities": len(timeline_buckets["medium_term"]["gaps"]),
                    "priority_gaps": [gap["gap_domain"] for gap in timeline_buckets["medium_term"]["gaps"][:2]]
                },
                "phase_4_long_term": {
                    "timeframe": "18+ months",
                    "focus": "Strategic positioning and innovation",
                    "opportunities": len(timeline_buckets["long_term"]["gaps"]),
                    "priority_gaps": [gap["gap_domain"] for gap in timeline_buckets["long_term"]["gaps"][:2]]
                }
            },
            "resource_allocation_recommendation": {
                "immediate_investment": "40% of resources",
                "short_term_development": "35% of resources", 
                "medium_term_research": "20% of resources",
                "long_term_innovation": "5% of resources"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating timeline analysis: {str(e)}")