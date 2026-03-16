"""
Configuration Management - Research Intelligence Dashboard
"""
from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    """Application settings and configuration"""
    
    # API Configuration
    API_TITLE: str = "🧠 Research Intelligence API"
    API_DESCRIPTION: str = "Enhanced Intelligence Layer serving strategic research insights"
    API_VERSION: str = "1.0.0"
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    
    # CORS Configuration
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",  # React dev server
        "http://localhost:3001", 
        "http://127.0.0.1:3000",
        "http://localhost:8080",  # Alternative frontend ports
    ]
    
    # Intelligence Data Paths
    CONNECTIONS_DATA_PATH: str = "/workspace/connections_graph.json"
    GAPS_DATA_PATH: str = "/workspace/research_gaps_opportunities.json"  
    TRENDS_DATA_PATH: str = "/workspace/trend_patterns.json"
    STRATEGIC_SUMMARY_PATH: str = "/workspace/strategic_intelligence_summary.md"
    
    # Notion Integration (Optional)
    NOTION_TOKEN: Optional[str] = None
    NOTION_ACADEMIC_DB_ID: Optional[str] = None
    NOTION_PUBLIC_DB_ID: Optional[str] = None
    
    # Database Configuration (Future enhancement)
    DATABASE_URL: Optional[str] = None
    
    # Redis Configuration (Future caching)
    REDIS_URL: Optional[str] = None
    
    # WebSocket Configuration
    WEBSOCKET_HEARTBEAT_INTERVAL: int = 60  # seconds
    MAX_WEBSOCKET_CONNECTIONS: int = 100
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS_PER_MINUTE: int = 100
    RATE_LIMIT_BURST: int = 200
    
    # Logging Configuration
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Intelligence Processing
    MIN_STRATEGIC_VALUE_THRESHOLD: float = 0.7
    MIN_OPPORTUNITY_SCORE_THRESHOLD: float = 0.6
    MIN_TREND_CONFIDENCE_THRESHOLD: float = 0.5
    
    # API Response Configuration
    DEFAULT_PAGE_SIZE: int = 50
    MAX_PAGE_SIZE: int = 1000
    
    # Feature Flags
    ENABLE_WEBSOCKETS: bool = True
    ENABLE_NOTION_SYNC: bool = False
    ENABLE_RATE_LIMITING: bool = False
    ENABLE_CACHING: bool = False
    
    # Development Configuration
    DEBUG: bool = False
    RELOAD: bool = False
    
    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        case_sensitive = True

class DevelopmentSettings(Settings):
    """Development-specific settings"""
    DEBUG: bool = True
    RELOAD: bool = True
    LOG_LEVEL: str = "DEBUG"
    ENABLE_RATE_LIMITING: bool = False
    
    # More permissive CORS for development
    CORS_ORIGINS: List[str] = ["*"]

class ProductionSettings(Settings):
    """Production-specific settings"""
    DEBUG: bool = False
    RELOAD: bool = False
    LOG_LEVEL: str = "WARNING"
    ENABLE_RATE_LIMITING: bool = True
    ENABLE_CACHING: bool = True
    
    # Stricter security for production
    MAX_WEBSOCKET_CONNECTIONS: int = 50
    RATE_LIMIT_REQUESTS_PER_MINUTE: int = 60

def get_settings() -> Settings:
    """Get settings based on environment"""
    
    environment = os.getenv("ENVIRONMENT", "development").lower()
    
    if environment == "production":
        return ProductionSettings()
    elif environment == "development":
        return DevelopmentSettings()
    else:
        return Settings()

# Global settings instance
settings = get_settings()

# Intelligence data file paths with validation
def validate_intelligence_files():
    """Validate that intelligence data files exist"""
    
    files_to_check = [
        settings.CONNECTIONS_DATA_PATH,
        settings.GAPS_DATA_PATH,
        settings.TRENDS_DATA_PATH
    ]
    
    missing_files = []
    for file_path in files_to_check:
        if not os.path.exists(file_path):
            missing_files.append(file_path)
    
    if missing_files:
        print(f"⚠️  Warning: Missing intelligence data files: {missing_files}")
        print("   Run intelligence analysis to generate these files.")
    else:
        print("✅ All intelligence data files found")
    
    return len(missing_files) == 0

# API Configuration helpers
def get_cors_config():
    """Get CORS configuration for FastAPI"""
    return {
        "allow_origins": settings.CORS_ORIGINS,
        "allow_credentials": True,
        "allow_methods": ["*"],
        "allow_headers": ["*"],
    }

def get_websocket_config():
    """Get WebSocket configuration"""
    return {
        "enabled": settings.ENABLE_WEBSOCKETS,
        "heartbeat_interval": settings.WEBSOCKET_HEARTBEAT_INTERVAL,
        "max_connections": settings.MAX_WEBSOCKET_CONNECTIONS
    }

def get_api_config():
    """Get API server configuration"""
    return {
        "title": settings.API_TITLE,
        "description": settings.API_DESCRIPTION,
        "version": settings.API_VERSION,
        "host": settings.API_HOST,
        "port": settings.API_PORT,
        "debug": settings.DEBUG,
        "reload": settings.RELOAD
    }