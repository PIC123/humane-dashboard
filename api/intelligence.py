"""
Vercel Serverless Function - Intelligence API
"""
from http.server import BaseHTTPRequestHandler
import json
import os
import sys
from urllib.parse import urlparse, parse_qs

# Add paths for imports
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Handle GET requests for intelligence data"""
        try:
            # Parse URL
            parsed_url = urlparse(self.path)
            path = parsed_url.path
            query_params = parse_qs(parsed_url.query)
            
            # Set CORS headers
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            # Load intelligence data (would be stored in Vercel KV or similar in production)
            # For now, return mock data structure
            if 'connections' in path:
                response = {
                    "connections": [
                        {
                            "id": "conn_001",
                            "paper1": "Human-Robot Trust in Healthcare",
                            "paper2": "Ethical AI in Medical Robotics", 
                            "relationship": "complementary_research",
                            "strategic_value": 0.95,
                            "business_opportunity": {
                                "revenue_potential": 150000,
                                "market_size": "Healthcare AI/Robotics", 
                                "implementation_timeline": "6-12 months"
                            }
                        }
                    ],
                    "total_connections": 232,
                    "high_value_connections": 231,
                    "message": "Intelligence data loaded successfully"
                }
            elif 'network' in path:
                response = {
                    "nodes": [
                        {"id": "paper_1", "title": "Human-Robot Trust", "category": "Healthcare", "citations": 45},
                        {"id": "paper_2", "title": "Ethical AI", "category": "Ethics", "citations": 67}
                    ],
                    "links": [
                        {"source": "paper_1", "target": "paper_2", "strength": 0.95, "type": "complementary"}
                    ],
                    "message": "Network graph data ready"
                }
            else:
                response = {
                    "summary": {
                        "total_connections": 232,
                        "high_value_opportunities": 231,
                        "revenue_potential": "11.5M - 115M",
                        "strategic_insights": "Research intelligence platform operational"
                    },
                    "status": "ready"
                }
            
            # Send response
            self.wfile.write(json.dumps(response, indent=2).encode())
            
        except Exception as e:
            # Error handling
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            error_response = {
                "error": str(e),
                "message": "Intelligence API error",
                "status": "error"
            }
            self.wfile.write(json.dumps(error_response).encode())
    
    def do_OPTIONS(self):
        """Handle preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()