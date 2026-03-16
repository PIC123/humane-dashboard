"""
Vercel Serverless Function - Research Intelligence API
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import sys
import json

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from backend.app.api.main import app as fastapi_app

# Configure for Vercel
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # More permissive for Vercel deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Expose the app for Vercel
app = fastapi_app

# Handler for Vercel
def handler(request, response):
    return app(request, response)