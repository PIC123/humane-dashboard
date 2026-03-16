"""
WebSocket Manager - Real-time Intelligence Updates
"""
from fastapi import WebSocket
from typing import List, Dict, Any
import json
import asyncio
from datetime import datetime

class WebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.connection_metadata: Dict[WebSocket, Dict[str, Any]] = {}
    
    async def connect(self, websocket: WebSocket):
        """Accept new WebSocket connection"""
        await websocket.accept()
        self.active_connections.append(websocket)
        
        # Store connection metadata
        self.connection_metadata[websocket] = {
            "connected_at": datetime.now().isoformat(),
            "client_id": f"client_{len(self.active_connections)}",
            "subscriptions": ["intelligence_updates", "system_status"]
        }
        
        print(f"🔌 WebSocket client connected. Total connections: {len(self.active_connections)}")
        
        # Send welcome message
        await self.send_personal_message({
            "type": "connection_established",
            "message": "Connected to Research Intelligence Dashboard",
            "client_id": self.connection_metadata[websocket]["client_id"],
            "available_channels": ["intelligence_updates", "trend_alerts", "gap_discoveries", "connection_insights"]
        }, websocket)
    
    def disconnect(self, websocket: WebSocket):
        """Remove WebSocket connection"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            
        if websocket in self.connection_metadata:
            client_id = self.connection_metadata[websocket]["client_id"]
            del self.connection_metadata[websocket]
            print(f"📡 WebSocket client {client_id} disconnected. Total connections: {len(self.active_connections)}")
    
    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket):
        """Send message to specific WebSocket connection"""
        try:
            # Add timestamp to all messages
            message["timestamp"] = datetime.now().isoformat()
            await websocket.send_text(json.dumps(message))
            
        except Exception as e:
            print(f"❌ Error sending personal message: {e}")
            # Remove broken connection
            self.disconnect(websocket)
    
    async def broadcast(self, message: Dict[str, Any], channel: str = "all"):
        """Broadcast message to all connected clients"""
        if not self.active_connections:
            return
            
        # Add metadata to broadcast message
        broadcast_message = {
            **message,
            "broadcast": True,
            "channel": channel,
            "timestamp": datetime.now().isoformat(),
            "total_recipients": len(self.active_connections)
        }
        
        # Send to all active connections
        disconnected_websockets = []
        for websocket in self.active_connections:
            try:
                # Check if client is subscribed to this channel
                client_subscriptions = self.connection_metadata.get(websocket, {}).get("subscriptions", [])
                if channel == "all" or channel in client_subscriptions:
                    await websocket.send_text(json.dumps(broadcast_message))
                    
            except Exception as e:
                print(f"❌ Error broadcasting to client: {e}")
                disconnected_websockets.append(websocket)
        
        # Clean up disconnected clients
        for websocket in disconnected_websockets:
            self.disconnect(websocket)
        
        print(f"📢 Broadcasted to {len(self.active_connections)} clients on channel '{channel}'")
    
    async def send_intelligence_update(self, update_type: str, data: Dict[str, Any]):
        """Send intelligence-specific updates"""
        
        intelligence_update = {
            "type": "intelligence_update",
            "update_type": update_type,
            "data": data,
            "priority": self._get_update_priority(update_type)
        }
        
        await self.broadcast(intelligence_update, channel="intelligence_updates")
    
    async def send_trend_alert(self, trend_topic: str, momentum: str, confidence: float, implications: List[str]):
        """Send trend analysis alerts"""
        
        trend_alert = {
            "type": "trend_alert",
            "trend_topic": trend_topic,
            "momentum": momentum,
            "confidence": confidence,
            "business_implications": implications,
            "urgency": "high" if momentum == "emerging" and confidence > 0.8 else "medium"
        }
        
        await self.broadcast(trend_alert, channel="trend_alerts")
    
    async def send_gap_discovery(self, gap_domain: str, opportunity_score: float, feasibility_score: float):
        """Send research gap discovery notifications"""
        
        gap_alert = {
            "type": "gap_discovery",
            "gap_domain": gap_domain,
            "opportunity_score": opportunity_score,
            "feasibility_score": feasibility_score,
            "business_potential": "High" if opportunity_score > 0.8 else "Medium",
            "action_required": opportunity_score > 0.8 and feasibility_score > 0.7
        }
        
        await self.broadcast(gap_alert, channel="gap_discoveries")
    
    async def send_connection_insight(self, paper1_title: str, paper2_title: str, strategic_value: float, business_opportunity: str):
        """Send new strategic connection discoveries"""
        
        connection_alert = {
            "type": "connection_insight",
            "papers": [paper1_title, paper2_title],
            "strategic_value": strategic_value,
            "business_opportunity": business_opportunity,
            "significance": "high" if strategic_value > 0.9 else "medium"
        }
        
        await self.broadcast(connection_alert, channel="connection_insights")
    
    async def send_system_status(self, status: str, message: str, details: Dict[str, Any] = None):
        """Send system status updates"""
        
        status_update = {
            "type": "system_status",
            "status": status,
            "message": message,
            "details": details or {},
            "system_health": "good" if status == "online" else "warning"
        }
        
        await self.broadcast(status_update, channel="system_status")
    
    def _get_update_priority(self, update_type: str) -> str:
        """Determine priority level for different update types"""
        
        priority_map = {
            "new_connections": "medium",
            "intelligence_refresh": "low", 
            "gap_identified": "high",
            "trend_shift": "high",
            "system_error": "high",
            "data_update": "low"
        }
        
        return priority_map.get(update_type, "medium")
    
    async def get_connection_stats(self) -> Dict[str, Any]:
        """Get current WebSocket connection statistics"""
        
        return {
            "total_connections": len(self.active_connections),
            "connection_details": [
                {
                    "client_id": metadata["client_id"],
                    "connected_at": metadata["connected_at"],
                    "subscriptions": metadata["subscriptions"]
                }
                for metadata in self.connection_metadata.values()
            ],
            "active_channels": {
                "intelligence_updates": len([c for c in self.connection_metadata.values() if "intelligence_updates" in c["subscriptions"]]),
                "trend_alerts": len([c for c in self.connection_metadata.values() if "trend_alerts" in c["subscriptions"]]),
                "gap_discoveries": len([c for c in self.connection_metadata.values() if "gap_discoveries" in c["subscriptions"]]),
                "connection_insights": len([c for c in self.connection_metadata.values() if "connection_insights" in c["subscriptions"]])
            }
        }
    
    async def subscribe_client(self, websocket: WebSocket, channels: List[str]):
        """Update client subscriptions"""
        
        if websocket in self.connection_metadata:
            self.connection_metadata[websocket]["subscriptions"] = channels
            
            await self.send_personal_message({
                "type": "subscription_updated",
                "subscriptions": channels,
                "message": f"Subscribed to {len(channels)} channels"
            }, websocket)
    
    async def heartbeat_check(self):
        """Periodic heartbeat to check connection health"""
        
        if not self.active_connections:
            return
        
        heartbeat_message = {
            "type": "heartbeat",
            "server_time": datetime.now().isoformat(),
            "active_connections": len(self.active_connections)
        }
        
        await self.broadcast(heartbeat_message, channel="system_status")

# Global WebSocket manager instance
websocket_manager = WebSocketManager()

# Background task for periodic heartbeat
async def periodic_heartbeat():
    """Background task to send periodic heartbeats"""
    while True:
        await asyncio.sleep(60)  # Every minute
        await websocket_manager.heartbeat_check()