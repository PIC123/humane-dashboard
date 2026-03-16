#!/usr/bin/env python3
"""
Research Intelligence Dashboard - Development Server
Runs both FastAPI backend and React frontend in development mode
"""

import subprocess
import time
import os
import sys
import signal
import threading
from pathlib import Path

class DashboardServer:
    def __init__(self):
        self.backend_process = None
        self.frontend_process = None
        self.running = True
        
    def start_backend(self):
        """Start FastAPI backend server"""
        print("🚀 Starting FastAPI backend server...")
        
        backend_dir = Path(__file__).parent / "backend"
        
        try:
            self.backend_process = subprocess.Popen(
                [sys.executable, "run_server.py"],
                cwd=backend_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1,
                universal_newlines=True
            )
            
            print("✅ Backend server started (PID: {})".format(self.backend_process.pid))
            print("📚 Backend API: http://localhost:8000")
            print("📊 API Docs: http://localhost:8000/docs")
            
        except Exception as e:
            print(f"❌ Failed to start backend server: {e}")
            return False
            
        return True
    
    def start_frontend(self):
        """Start React development server"""
        print("🎨 Starting React frontend server...")
        
        frontend_dir = Path(__file__).parent / "frontend"
        
        # Check if node_modules exists
        if not (frontend_dir / "node_modules").exists():
            print("📦 Installing npm dependencies...")
            try:
                subprocess.run(["npm", "install"], cwd=frontend_dir, check=True)
            except subprocess.CalledProcessError:
                print("❌ Failed to install npm dependencies")
                return False
        
        try:
            # Set environment variables for React
            env = os.environ.copy()
            env['BROWSER'] = 'none'  # Don't auto-open browser
            env['PORT'] = '3000'
            
            self.frontend_process = subprocess.Popen(
                ["npm", "start"],
                cwd=frontend_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                env=env,
                bufsize=1,
                universal_newlines=True
            )
            
            print("✅ Frontend server started (PID: {})".format(self.frontend_process.pid))
            print("🌐 Frontend URL: http://localhost:3000")
            
        except Exception as e:
            print(f"❌ Failed to start frontend server: {e}")
            return False
            
        return True
    
    def monitor_processes(self):
        """Monitor both processes and restart if they crash"""
        while self.running:
            time.sleep(5)
            
            # Check backend
            if self.backend_process and self.backend_process.poll() is not None:
                print("⚠️ Backend process died, restarting...")
                self.start_backend()
            
            # Check frontend
            if self.frontend_process and self.frontend_process.poll() is not None:
                print("⚠️ Frontend process died, restarting...")
                self.start_frontend()
    
    def stop_servers(self):
        """Stop both servers gracefully"""
        print("\n🔄 Shutting down servers...")
        self.running = False
        
        if self.backend_process:
            try:
                self.backend_process.terminate()
                self.backend_process.wait(timeout=5)
                print("✅ Backend server stopped")
            except subprocess.TimeoutExpired:
                self.backend_process.kill()
                print("🔨 Backend server force killed")
        
        if self.frontend_process:
            try:
                self.frontend_process.terminate()
                self.frontend_process.wait(timeout=5)
                print("✅ Frontend server stopped")
            except subprocess.TimeoutExpired:
                self.frontend_process.kill()
                print("🔨 Frontend server force killed")
    
    def run(self):
        """Run the complete dashboard system"""
        print("🧠 Research Intelligence Dashboard - Development Mode")
        print("=" * 60)
        
        # Set up signal handlers for graceful shutdown
        def signal_handler(signum, frame):
            self.stop_servers()
            sys.exit(0)
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        
        # Start backend
        if not self.start_backend():
            sys.exit(1)
        
        # Wait for backend to start up
        print("⏳ Waiting for backend to initialize...")
        time.sleep(3)
        
        # Start frontend
        if not self.start_frontend():
            self.stop_servers()
            sys.exit(1)
        
        # Wait for frontend to start up
        print("⏳ Waiting for frontend to initialize...")
        time.sleep(5)
        
        print("\n" + "=" * 60)
        print("🎉 DASHBOARD ONLINE! THREE AMIGOS DEPLOYED! 🤠🤖🤖")
        print("=" * 60)
        print("🌐 Frontend:     http://localhost:3000")
        print("🚀 Backend API:  http://localhost:8000")
        print("📚 API Docs:     http://localhost:8000/docs")
        print("🔗 WebSocket:    ws://localhost:8000/ws")
        print("=" * 60)
        print("\n📊 Intelligence Features Available:")
        print("   • 232 Strategic Connections Visualization")
        print("   • Research Gap Opportunity Matrix")
        print("   • Trend Analysis & Business Intelligence")
        print("   • Real-time WebSocket Updates")
        print("   • Interactive D3.js Network Graphs")
        print("\n⚠️  Press Ctrl+C to stop all servers")
        print("=" * 60)
        
        # Start monitoring in background thread
        monitor_thread = threading.Thread(target=self.monitor_processes)
        monitor_thread.daemon = True
        monitor_thread.start()
        
        try:
            # Keep main thread alive
            while self.running:
                time.sleep(1)
        except KeyboardInterrupt:
            pass
        finally:
            self.stop_servers()

def validate_environment():
    """Validate that required tools are available"""
    print("🔍 Validating development environment...")
    
    # Check Python
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ required")
        return False
    print(f"✅ Python {sys.version.split()[0]}")
    
    # Check Node.js
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Node.js {result.stdout.strip()}")
        else:
            print("❌ Node.js not found")
            return False
    except FileNotFoundError:
        print("❌ Node.js not found")
        return False
    
    # Check npm
    try:
        result = subprocess.run(["npm", "--version"], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ npm {result.stdout.strip()}")
        else:
            print("❌ npm not found")
            return False
    except FileNotFoundError:
        print("❌ npm not found")
        return False
    
    # Check intelligence data
    data_files = [
        "connections_graph.json",
        "research_gaps_opportunities.json", 
        "trend_patterns.json"
    ]
    
    workspace_path = Path(__file__).parent.parent
    missing_files = []
    
    for file in data_files:
        if not (workspace_path / file).exists():
            missing_files.append(file)
    
    if missing_files:
        print(f"⚠️ Missing intelligence data: {missing_files}")
        print("   Run intelligence analysis first:")
        print("   python3 cross_paper_analysis.py")
        print("   python3 gap_identification.py")
        print("   python3 trend_detection.py")
    else:
        print("✅ Intelligence data ready")
    
    return True

def main():
    """Main entry point"""
    
    if not validate_environment():
        print("\n❌ Environment validation failed")
        sys.exit(1)
    
    print("✅ Environment validation passed\n")
    
    # Run dashboard
    dashboard = DashboardServer()
    dashboard.run()

if __name__ == "__main__":
    main()