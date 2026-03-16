"""
Research Intelligence Dashboard - FastAPI Backend
Serving our breakthrough intelligence data through REST API
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import json
from typing import Dict, List
import asyncio
import uvicorn

from .routers import intelligence, papers, trends, gaps
from ..core.websocket import WebSocketManager
from ..core.config import get_settings

# Application lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Research Intelligence API starting up...")
    print("📊 Loading intelligence data...")
    
    # Load our breakthrough intelligence results
    try:
        with open('/workspace/connections_graph.json', 'r') as f:
            app.state.connections_data = json.load(f)
        with open('/workspace/research_gaps_opportunities.json', 'r') as f:
            app.state.gaps_data = json.load(f)
        with open('/workspace/trend_patterns.json', 'r') as f:
            app.state.trends_data = json.load(f)
        
        print(f"✅ Loaded {app.state.connections_data['total_connections']} strategic connections")
        print(f"✅ Loaded {app.state.gaps_data['total_gaps']} research gaps")  
        print(f"✅ Loaded {app.state.trends_data['total_trends']} trend patterns")
        
    except Exception as e:
        print(f"❌ Error loading intelligence data: {e}")
        # Initialize empty data structures
        app.state.connections_data = {"connections": [], "total_connections": 0}
        app.state.gaps_data = {"gaps": [], "total_gaps": 0}
        app.state.trends_data = {"trends": [], "total_trends": 0}
    
    yield
    
    # Shutdown
    print("🔄 Research Intelligence API shutting down...")

# Create FastAPI app
app = FastAPI(
    title="🧠 Research Intelligence API",
    description="Automated Research Dashboard Backend - Powered by Enhanced Intelligence Layer",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server
        "http://localhost:3001", 
        "http://127.0.0.1:3000",
        # Add your production domains here
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket manager for real-time updates
websocket_manager = WebSocketManager()

# Include routers
app.include_router(intelligence.router, prefix="/api/v1/intelligence", tags=["Intelligence"])
app.include_router(papers.router, prefix="/api/v1/papers", tags=["Papers"])
app.include_router(trends.router, prefix="/api/v1/trends", tags=["Trends"]) 
app.include_router(gaps.router, prefix="/api/v1/gaps", tags=["Research Gaps"])

# Health check endpoint
@app.get("/", tags=["Health"])
async def root():
    """API health check and status"""
    return {
        "status": "🚀 Research Intelligence API Online",
        "version": "1.0.0",
        "message": "Enhanced Intelligence Layer serving strategic insights!",
        "data_status": {
            "connections": getattr(app.state, 'connections_data', {}).get('total_connections', 0),
            "gaps": getattr(app.state, 'gaps_data', {}).get('total_gaps', 0),
            "trends": getattr(app.state, 'trends_data', {}).get('total_trends', 0)
        }
    }

@app.get("/api/v1/status", tags=["Health"])  
async def api_status():
    """Detailed API status and intelligence data summary"""
    connections_data = getattr(app.state, 'connections_data', {})
    gaps_data = getattr(app.state, 'gaps_data', {})
    trends_data = getattr(app.state, 'trends_data', {})
    
    return {
        "api_status": "online",
        "intelligence_summary": {
            "total_strategic_connections": connections_data.get('total_connections', 0),
            "high_value_connections": connections_data.get('high_value_connections', 0),
            "research_gaps_identified": gaps_data.get('total_gaps', 0),
            "trend_patterns_analyzed": trends_data.get('total_trends', 0),
            "last_analysis": connections_data.get('analysis_date', 'unknown')
        },
        "business_opportunities": {
            "immediate_consulting_prospects": connections_data.get('high_value_connections', 0),
            "methodology_bridges": len([
                c for c in connections_data.get('connections', []) 
                if c.get('connection_type') == 'methodological_bridge'
            ]),
            "gap_based_opportunities": len([
                g for g in gaps_data.get('gaps', [])
                if g.get('opportunity_score', 0) > 0.8
            ])
        }
    }

# WebSocket endpoint for real-time updates
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket connection for real-time intelligence updates"""
    await websocket_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and send periodic updates
            await asyncio.sleep(30)  # Heartbeat every 30 seconds
            
            # Send intelligence update if available
            await websocket_manager.send_personal_message({
                "type": "heartbeat",
                "timestamp": str(asyncio.get_event_loop().time()),
                "status": "Intelligence system online"
            }, websocket)
            
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)
        print("📡 WebSocket client disconnected")

# Utility endpoint to trigger intelligence refresh
@app.post("/api/v1/intelligence/refresh", tags=["Intelligence"])
async def refresh_intelligence_data():
    """Manually refresh intelligence data from files"""
    try:
        # Reload data
        with open('/workspace/connections_graph.json', 'r') as f:
            app.state.connections_data = json.load(f)
        with open('/workspace/research_gaps_opportunities.json', 'r') as f:
            app.state.gaps_data = json.load(f)
        with open('/workspace/trend_patterns.json', 'r') as f:
            app.state.trends_data = json.load(f)
        
        # Notify WebSocket clients
        await websocket_manager.broadcast({
            "type": "intelligence_refresh",
            "message": "Intelligence data refreshed",
            "data": {
                "connections": app.state.connections_data.get('total_connections', 0),
                "gaps": app.state.gaps_data.get('total_gaps', 0),
                "trends": app.state.trends_data.get('total_trends', 0)
            }
        })
        
        return {
            "status": "success",
            "message": "Intelligence data refreshed successfully",
            "data_summary": {
                "connections": app.state.connections_data.get('total_connections', 0),
                "gaps": app.state.gaps_data.get('total_gaps', 0),
                "trends": app.state.trends_data.get('total_trends', 0)
            }
        }
        
    except Exception as e:
        return {
            "status": "error", 
            "message": f"Failed to refresh intelligence data: {str(e)}"
        }

if __name__ == "__main__":
    print("🚀 Starting Research Intelligence API server...")
    uvicorn.run(
        "app.api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )