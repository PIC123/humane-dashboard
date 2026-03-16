"""
Vercel Serverless Function - Trends API
"""
from http.server import BaseHTTPRequestHandler
import json
import os
import sys
from urllib.parse import urlparse, parse_qs

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Handle GET requests for trends data"""
        try:
            # Parse URL
            parsed_url = urlparse(self.path)
            path = parsed_url.path
            
            # Set CORS headers
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            # Return trends data
            if 'patterns' in path:
                response = {
                    "trends": [
                        {
                            "id": "trend_001",
                            "name": "Human-AI Collaboration in Healthcare",
                            "momentum": 0.89,
                            "confidence": 0.93,
                            "trajectory": "emerging",
                            "business_implications": {
                                "market_timing": "optimal_entry", 
                                "competitive_advantage": "high",
                                "revenue_potential": 250000
                            }
                        }
                    ],
                    "total_trends": 8,
                    "emerging_trends": 3,
                    "message": "Trend patterns analyzed successfully"
                }
            elif 'momentum' in path:
                response = {
                    "momentum_analysis": {
                        "emerging": 3,
                        "growing": 2, 
                        "stable": 2,
                        "declining": 1
                    },
                    "confidence_metrics": {
                        "high_confidence": 6,
                        "medium_confidence": 2,
                        "low_confidence": 0
                    }
                }
            else:
                response = {
                    "visualization_data": [
                        {"x": 0.89, "y": 0.93, "trend": "Human-AI Collaboration", "size": 250000}
                    ],
                    "axes": {
                        "x": "Momentum",
                        "y": "Confidence",
                        "size": "Revenue Potential"
                    }
                }
            
            self.wfile.write(json.dumps(response, indent=2).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            error_response = {"error": str(e), "status": "error"}
            self.wfile.write(json.dumps(error_response).encode())
    
    def do_OPTIONS(self):
        """Handle preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()