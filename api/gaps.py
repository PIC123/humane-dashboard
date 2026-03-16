"""
Vercel Serverless Function - Research Gaps API
"""
from http.server import BaseHTTPRequestHandler
import json
import os
import sys
from urllib.parse import urlparse, parse_qs

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Handle GET requests for research gaps data"""
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
            
            # Return research gaps data
            if 'opportunities' in path:
                response = {
                    "gaps": [
                        {
                            "id": "gap_001",
                            "title": "Intergenerational HRI Communication Patterns",
                            "description": "Limited research on how different age groups interact with social robots",
                            "feasibility_score": 0.87,
                            "opportunity_score": 0.92,
                            "business_case": {
                                "market_potential": "high",
                                "development_timeline": "12-18 months",
                                "estimated_roi": "300-500%",
                                "revenue_potential": 180000
                            },
                            "categories": ["social_robotics", "user_experience", "demographics"]
                        }
                    ],
                    "total_gaps": 1,
                    "high_opportunity": 1,
                    "message": "Research gaps identified successfully"
                }
            elif 'matrix' in path:
                response = {
                    "matrix_data": [
                        {
                            "x": 0.87,  # feasibility
                            "y": 0.92,  # opportunity
                            "title": "Intergenerational HRI",
                            "revenue": 180000,
                            "category": "social_robotics"
                        }
                    ],
                    "quadrants": {
                        "high_opportunity_high_feasibility": 1,
                        "high_opportunity_low_feasibility": 0,
                        "low_opportunity_high_feasibility": 0,
                        "low_opportunity_low_feasibility": 0
                    }
                }
            elif 'business-cases' in path:
                response = {
                    "business_cases": [
                        {
                            "gap_id": "gap_001",
                            "investment_required": 50000,
                            "expected_revenue": 180000,
                            "roi_percentage": 360,
                            "payback_period": "8-12 months",
                            "risk_level": "medium",
                            "market_readiness": "high"
                        }
                    ]
                }
            else:
                response = {
                    "summary": {
                        "total_opportunities": 1,
                        "high_value_gaps": 1,
                        "estimated_revenue": 180000,
                        "development_ready": 1
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