"""
Simple health endpoint server for MCP
Runs alongside the MCP server to provide health checks
"""

import asyncio
import os
from datetime import datetime

import uvicorn
from fastapi import FastAPI

app = FastAPI()


@app.get("/health")
async def health():
    """Health check endpoint for MCP server."""
    return {"status": "healthy", "service": "mcp", "timestamp": datetime.now().isoformat()}


async def start_health_server():
    """Start the health server on port 8051."""
    port = int(os.getenv("ARCHON_MCP_PORT", 8051))
    config = uvicorn.Config(app, host="0.0.0.0", port=port, log_level="info")
    server = uvicorn.Server(config)
    await server.serve()


if __name__ == "__main__":
    asyncio.run(start_health_server())
