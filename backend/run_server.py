#!/usr/bin/env python3
"""
Research Intelligence Dashboard - Backend Server Startup
Run the FastAPI server with our intelligence data
"""

import uvicorn
import os
import sys
import json
from pathlib import Path

def validate_intelligence_data():
    """Validate that intelligence data files exist before starting server"""
    
    intelligence_files = [
        "/workspace/connections_graph.json",
        "/workspace/research_gaps_opportunities.json", 
        "/workspace/trend_patterns.json"
    ]
    
    print("🔍 Validating intelligence data files...")
    
    missing_files = []
    file_stats = {}
    
    for file_path in intelligence_files:
        if os.path.exists(file_path):
            try:
                with open(file_path, 'r') as f:
                    data = json.load(f)
                    
                if 'connections_graph.json' in file_path:
                    file_stats['connections'] = data.get('total_connections', 0)
                elif 'gaps' in file_path:
                    file_stats['gaps'] = data.get('total_gaps', 0)
                elif 'trends' in file_path:
                    file_stats['trends'] = data.get('total_trends', 0)
                    
                print(f"✅ {file_path} - Found and validated")
                
            except json.JSONDecodeError as e:
                print(f"❌ {file_path} - Invalid JSON: {e}")
                missing_files.append(file_path)
        else:
            print(f"❌ {file_path} - File not found")
            missing_files.append(file_path)
    
    if missing_files:
        print(f"\n⚠️  Missing or invalid intelligence files: {len(missing_files)}")
        print("   Run the intelligence analysis first:")
        print("   python3 cross_paper_analysis.py")
        print("   python3 gap_identification.py") 
        print("   python3 trend_detection.py")
        return False
    
    print(f"\n✅ All intelligence data validated!")
    print(f"📊 Data Summary:")
    print(f"   • Strategic Connections: {file_stats.get('connections', 0)}")
    print(f"   • Research Gaps: {file_stats.get('gaps', 0)}")
    print(f"   • Trend Patterns: {file_stats.get('trends', 0)}")
    
    return True

def main():
    """Main server startup function"""
    
    print("🚀 Research Intelligence Dashboard - Backend Starting...")
    print("=" * 60)
    
    # Validate intelligence data
    if not validate_intelligence_data():
        print("\n❌ Cannot start server without valid intelligence data")
        print("   Please run intelligence analysis first")
        sys.exit(1)
    
    # Set up environment
    os.environ.setdefault("ENVIRONMENT", "development")
    
    # Server configuration
    config = {
        "app": "app.api.main:app",
        "host": "0.0.0.0", 
        "port": 8000,
        "reload": True,
        "log_level": "info",
        "access_log": True
    }
    
    print(f"\n🌐 Starting server at http://{config['host']}:{config['port']}")
    print(f"📚 API Documentation: http://{config['host']}:{config['port']}/docs")
    print(f"📊 Intelligence Status: http://{config['host']}:{config['port']}/api/v1/status")
    print(f"🔗 WebSocket Endpoint: ws://{config['host']}:{config['port']}/ws")
    print("\n" + "=" * 60)
    print("🎯 THREE AMIGOS BACKEND IS LIVE! 🤠🤖🤖")
    print("=" * 60)
    
    try:
        # Start the server
        uvicorn.run(**config)
        
    except KeyboardInterrupt:
        print("\n🔄 Server stopped by user")
        
    except Exception as e:
        print(f"\n❌ Server error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()