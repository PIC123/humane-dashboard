"""
Papers Router - Academic Paper Management and Analysis
"""
from fastapi import APIRouter, Request, HTTPException, Query
from typing import List, Optional, Dict, Any
import json

router = APIRouter()

@router.get("/")
async def get_papers(
    request: Request,
    limit: int = Query(50, ge=1, le=1000, description="Number of papers to return"),
    offset: int = Query(0, ge=0, description="Number of papers to skip"),
    search: Optional[str] = Query(None, description="Search in titles and abstracts"),
    tags: Optional[str] = Query(None, description="Filter by tags (comma-separated)"),
    min_strategic_connections: Optional[int] = Query(None, description="Minimum number of strategic connections")
):
    """
    Get academic papers with optional filtering and search
    """
    try:
        # Load connections data to get paper information
        connections_data = getattr(request.app.state, 'connections_data', {})
        connections = connections_data.get('connections', [])
        
        if not connections:
            return {
                "total": 0,
                "papers": [],
                "message": "No paper data available from connections analysis"
            }
        
        # Extract unique papers from connections
        papers_map = {}
        
        for conn in connections:
            # Paper 1
            paper1_title = conn.get('paper1_title', '')
            if paper1_title and paper1_title not in papers_map:
                papers_map[paper1_title] = {
                    "id": conn.get('paper1_id', ''),
                    "title": paper1_title,
                    "strategic_connections": 0,
                    "connection_types": set(),
                    "business_opportunities": [],
                    "shared_themes": set(),
                    "max_strategic_value": 0.0
                }
            
            # Paper 2  
            paper2_title = conn.get('paper2_title', '')
            if paper2_title and paper2_title not in papers_map:
                papers_map[paper2_title] = {
                    "id": conn.get('paper2_id', ''),
                    "title": paper2_title,
                    "strategic_connections": 0,
                    "connection_types": set(),
                    "business_opportunities": [],
                    "shared_themes": set(),
                    "max_strategic_value": 0.0
                }
            
            # Update connection stats
            strategic_value = conn.get('strategic_value', 0)
            connection_type = conn.get('connection_type', '')
            business_opp = conn.get('business_opportunity', '')
            shared_themes = conn.get('shared_themes', [])
            
            if paper1_title in papers_map:
                papers_map[paper1_title]["strategic_connections"] += 1
                papers_map[paper1_title]["connection_types"].add(connection_type)
                if business_opp:
                    papers_map[paper1_title]["business_opportunities"].append(business_opp)
                papers_map[paper1_title]["shared_themes"].update(shared_themes)
                papers_map[paper1_title]["max_strategic_value"] = max(
                    papers_map[paper1_title]["max_strategic_value"], strategic_value
                )
            
            if paper2_title in papers_map:
                papers_map[paper2_title]["strategic_connections"] += 1
                papers_map[paper2_title]["connection_types"].add(connection_type)
                if business_opp:
                    papers_map[paper2_title]["business_opportunities"].append(business_opp)
                papers_map[paper2_title]["shared_themes"].update(shared_themes)
                papers_map[paper2_title]["max_strategic_value"] = max(
                    papers_map[paper2_title]["max_strategic_value"], strategic_value
                )
        
        # Convert sets to lists for JSON serialization
        papers_list = []
        for paper in papers_map.values():
            paper["connection_types"] = list(paper["connection_types"])
            paper["shared_themes"] = list(paper["shared_themes"])
            
            # Calculate paper importance score
            paper["importance_score"] = (
                paper["strategic_connections"] * 0.4 +
                paper["max_strategic_value"] * 0.6
            )
            
            papers_list.append(paper)
        
        # Apply filters
        filtered_papers = papers_list
        
        # Search filter
        if search:
            search_lower = search.lower()
            filtered_papers = [
                paper for paper in filtered_papers
                if search_lower in paper["title"].lower() or
                   any(search_lower in theme.lower() for theme in paper["shared_themes"])
            ]
        
        # Tags filter (using shared_themes as tags)
        if tags:
            tag_list = [tag.strip().lower() for tag in tags.split(',')]
            filtered_papers = [
                paper for paper in filtered_papers
                if any(tag in [theme.lower() for theme in paper["shared_themes"]] for tag in tag_list)
            ]
        
        # Strategic connections filter
        if min_strategic_connections is not None:
            filtered_papers = [
                paper for paper in filtered_papers
                if paper["strategic_connections"] >= min_strategic_connections
            ]
        
        # Sort by importance score
        filtered_papers.sort(key=lambda x: x["importance_score"], reverse=True)
        
        # Apply pagination
        total = len(filtered_papers)
        paginated_papers = filtered_papers[offset:offset + limit]
        
        return {
            "total": total,
            "limit": limit,
            "offset": offset,
            "filters_applied": {
                "search": search,
                "tags": tags,
                "min_strategic_connections": min_strategic_connections
            },
            "papers": paginated_papers,
            "statistics": {
                "total_unique_papers": len(papers_list),
                "avg_connections_per_paper": sum(p["strategic_connections"] for p in papers_list) / len(papers_list) if papers_list else 0,
                "most_connected_paper": max(papers_list, key=lambda x: x["strategic_connections"])["title"] if papers_list else None,
                "top_themes": _get_top_themes(papers_list)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving papers: {str(e)}")

@router.get("/{paper_id}/connections")
async def get_paper_connections(
    paper_id: str,
    request: Request,
    limit: int = Query(20, ge=1, le=100, description="Number of connections to return")
):
    """
    Get strategic connections for a specific paper
    """
    try:
        connections_data = getattr(request.app.state, 'connections_data', {})
        connections = connections_data.get('connections', [])
        
        # Find connections involving this paper
        paper_connections = []
        paper_title = None
        
        for conn in connections:
            if conn.get('paper1_id') == paper_id or conn.get('paper2_id') == paper_id:
                # Determine which is the target paper and which is the connected paper
                if conn.get('paper1_id') == paper_id:
                    paper_title = conn.get('paper1_title')
                    connected_paper = {
                        "id": conn.get('paper2_id'),
                        "title": conn.get('paper2_title')
                    }
                else:
                    paper_title = conn.get('paper2_title')
                    connected_paper = {
                        "id": conn.get('paper1_id'),
                        "title": conn.get('paper1_title')
                    }
                
                connection_info = {
                    "connected_paper": connected_paper,
                    "strategic_value": conn.get('strategic_value', 0),
                    "connection_type": conn.get('connection_type'),
                    "relationship_description": conn.get('relationship_description'),
                    "business_opportunity": conn.get('business_opportunity'),
                    "shared_themes": conn.get('shared_themes', []),
                    "confidence_score": conn.get('confidence_score', 0)
                }
                
                paper_connections.append(connection_info)
        
        if not paper_title:
            raise HTTPException(status_code=404, detail=f"Paper with ID {paper_id} not found")
        
        # Sort by strategic value
        paper_connections.sort(key=lambda x: x["strategic_value"], reverse=True)
        
        # Apply limit
        limited_connections = paper_connections[:limit]
        
        return {
            "paper_id": paper_id,
            "paper_title": paper_title,
            "total_connections": len(paper_connections),
            "returned_connections": len(limited_connections),
            "connections": limited_connections,
            "connection_summary": {
                "high_value_connections": len([c for c in paper_connections if c["strategic_value"] > 0.8]),
                "connection_types": list(set(c["connection_type"] for c in paper_connections)),
                "top_shared_themes": _get_top_shared_themes(paper_connections),
                "business_opportunities": len([c for c in paper_connections if c["business_opportunity"]])
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving paper connections: {str(e)}")

@router.get("/search")
async def search_papers(
    request: Request,
    query: str = Query(..., description="Search query"),
    limit: int = Query(20, ge=1, le=100, description="Number of results to return")
):
    """
    Search papers by title and themes
    """
    try:
        connections_data = getattr(request.app.state, 'connections_data', {})
        connections = connections_data.get('connections', [])
        
        # Build searchable papers index
        papers_index = {}
        
        for conn in connections:
            papers_to_index = [
                (conn.get('paper1_id'), conn.get('paper1_title')),
                (conn.get('paper2_id'), conn.get('paper2_title'))
            ]
            
            for paper_id, paper_title in papers_to_index:
                if paper_id and paper_title and paper_id not in papers_index:
                    papers_index[paper_id] = {
                        "id": paper_id,
                        "title": paper_title,
                        "themes": set(),
                        "connection_count": 0,
                        "max_strategic_value": 0.0
                    }
                
                if paper_id in papers_index:
                    papers_index[paper_id]["themes"].update(conn.get('shared_themes', []))
                    papers_index[paper_id]["connection_count"] += 1
                    papers_index[paper_id]["max_strategic_value"] = max(
                        papers_index[paper_id]["max_strategic_value"],
                        conn.get('strategic_value', 0)
                    )
        
        # Perform search
        query_lower = query.lower()
        search_results = []
        
        for paper in papers_index.values():
            score = 0.0
            match_details = []
            
            # Title match (higher weight)
            if query_lower in paper["title"].lower():
                title_score = 2.0
                if paper["title"].lower().startswith(query_lower):
                    title_score = 3.0  # Boost for prefix matches
                score += title_score
                match_details.append(f"Title match (score: {title_score})")
            
            # Theme match
            theme_matches = [theme for theme in paper["themes"] if query_lower in theme.lower()]
            if theme_matches:
                theme_score = len(theme_matches) * 0.5
                score += theme_score
                match_details.append(f"Theme matches: {theme_matches} (score: {theme_score})")
            
            # Boost by paper importance
            importance_boost = paper["max_strategic_value"] * 0.2
            score += importance_boost
            
            if score > 0:
                search_results.append({
                    "paper": {
                        "id": paper["id"],
                        "title": paper["title"],
                        "themes": list(paper["themes"]),
                        "connection_count": paper["connection_count"],
                        "max_strategic_value": paper["max_strategic_value"]
                    },
                    "relevance_score": round(score, 2),
                    "match_details": match_details
                })
        
        # Sort by relevance score
        search_results.sort(key=lambda x: x["relevance_score"], reverse=True)
        
        # Apply limit
        limited_results = search_results[:limit]
        
        return {
            "query": query,
            "total_results": len(search_results),
            "returned_results": len(limited_results),
            "results": limited_results,
            "search_statistics": {
                "avg_relevance_score": sum(r["relevance_score"] for r in search_results) / len(search_results) if search_results else 0,
                "top_score": search_results[0]["relevance_score"] if search_results else 0,
                "total_searchable_papers": len(papers_index)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching papers: {str(e)}")

@router.get("/analytics")
async def get_papers_analytics(request: Request):
    """
    Get analytics and insights about the paper collection
    """
    try:
        connections_data = getattr(request.app.state, 'connections_data', {})
        connections = connections_data.get('connections', [])
        
        if not connections:
            return {"message": "No paper data available for analytics"}
        
        # Analyze paper network
        papers_analysis = {}
        
        for conn in connections:
            papers_in_connection = [
                (conn.get('paper1_id'), conn.get('paper1_title')),
                (conn.get('paper2_id'), conn.get('paper2_title'))
            ]
            
            for paper_id, paper_title in papers_in_connection:
                if paper_id and paper_title:
                    if paper_id not in papers_analysis:
                        papers_analysis[paper_id] = {
                            "title": paper_title,
                            "connections": 0,
                            "strategic_values": [],
                            "connection_types": set(),
                            "themes": set(),
                            "business_opportunities": 0
                        }
                    
                    papers_analysis[paper_id]["connections"] += 1
                    papers_analysis[paper_id]["strategic_values"].append(conn.get('strategic_value', 0))
                    papers_analysis[paper_id]["connection_types"].add(conn.get('connection_type', ''))
                    papers_analysis[paper_id]["themes"].update(conn.get('shared_themes', []))
                    
                    if conn.get('business_opportunity'):
                        papers_analysis[paper_id]["business_opportunities"] += 1
        
        # Calculate statistics
        if not papers_analysis:
            return {"message": "No papers found in analysis"}
        
        papers_list = list(papers_analysis.values())
        
        # Network statistics
        total_papers = len(papers_list)
        total_connections = sum(p["connections"] for p in papers_list) // 2  # Each connection counted twice
        avg_connections = sum(p["connections"] for p in papers_list) / total_papers
        
        # Find most connected papers
        most_connected = sorted(papers_list, key=lambda x: x["connections"], reverse=True)[:10]
        
        # Find highest strategic value papers
        highest_strategic = []
        for paper in papers_list:
            if paper["strategic_values"]:
                avg_strategic_value = sum(paper["strategic_values"]) / len(paper["strategic_values"])
                highest_strategic.append({
                    "title": paper["title"],
                    "avg_strategic_value": avg_strategic_value,
                    "max_strategic_value": max(paper["strategic_values"]),
                    "connections": paper["connections"]
                })
        
        highest_strategic.sort(key=lambda x: x["avg_strategic_value"], reverse=True)
        
        # Theme analysis
        all_themes = []
        for paper in papers_list:
            all_themes.extend(paper["themes"])
        
        theme_counts = {}
        for theme in all_themes:
            theme_counts[theme] = theme_counts.get(theme, 0) + 1
        
        top_themes = sorted(theme_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        
        # Connection type analysis
        all_connection_types = []
        for paper in papers_list:
            all_connection_types.extend(paper["connection_types"])
        
        connection_type_counts = {}
        for conn_type in all_connection_types:
            connection_type_counts[conn_type] = connection_type_counts.get(conn_type, 0) + 1
        
        return {
            "network_statistics": {
                "total_papers": total_papers,
                "total_connections": total_connections,
                "average_connections_per_paper": round(avg_connections, 2),
                "network_density": round(total_connections / (total_papers * (total_papers - 1) / 2), 4) if total_papers > 1 else 0
            },
            "most_connected_papers": [
                {
                    "title": paper["title"],
                    "connections": paper["connections"],
                    "business_opportunities": paper["business_opportunities"]
                }
                for paper in most_connected[:5]
            ],
            "highest_strategic_value_papers": highest_strategic[:5],
            "theme_analysis": {
                "total_unique_themes": len(theme_counts),
                "top_themes": [{"theme": theme, "frequency": count} for theme, count in top_themes],
                "avg_themes_per_paper": round(len(all_themes) / total_papers, 2)
            },
            "connection_type_distribution": connection_type_counts,
            "business_opportunity_analysis": {
                "papers_with_business_opportunities": len([p for p in papers_list if p["business_opportunities"] > 0]),
                "total_business_opportunities": sum(p["business_opportunities"] for p in papers_list),
                "avg_opportunities_per_paper": round(sum(p["business_opportunities"] for p in papers_list) / total_papers, 2)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating papers analytics: {str(e)}")

def _get_top_themes(papers_list: List[Dict]) -> List[Dict[str, Any]]:
    """Helper function to get top themes across papers"""
    all_themes = []
    for paper in papers_list:
        all_themes.extend(paper.get("shared_themes", []))
    
    theme_counts = {}
    for theme in all_themes:
        theme_counts[theme] = theme_counts.get(theme, 0) + 1
    
    top_themes = sorted(theme_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    return [{"theme": theme, "count": count} for theme, count in top_themes]

def _get_top_shared_themes(connections: List[Dict]) -> List[str]:
    """Helper function to get most common shared themes in connections"""
    all_themes = []
    for conn in connections:
        all_themes.extend(conn.get("shared_themes", []))
    
    theme_counts = {}
    for theme in all_themes:
        theme_counts[theme] = theme_counts.get(theme, 0) + 1
    
    top_themes = sorted(theme_counts.items(), key=lambda x: x[1], reverse=True)[:3]
    return [theme for theme, _ in top_themes]