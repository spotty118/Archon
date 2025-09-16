"""
Agent Chat API - Polling-based chat with SSE proxy to AI agents
"""

import logging
import uuid
from datetime import datetime

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/agent-chat", tags=["agent-chat"])

# Simple in-memory session storage
sessions: dict[str, dict] = {}


# Request/Response models
class CreateSessionRequest(BaseModel):
    project_id: str | None = None
    agent_type: str = "rag"


class ChatMessage(BaseModel):
    id: str
    content: str
    sender: str
    timestamp: datetime
    agent_type: str | None = None


# REST Endpoints (minimal for frontend compatibility)
@router.post("/sessions")
async def create_session(request: CreateSessionRequest):
    """Create a new chat session."""
    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        "id": session_id,
        "session_id": session_id,  # Frontend expects this
        "project_id": request.project_id,
        "agent_type": request.agent_type,
        "messages": [],
        "created_at": datetime.now().isoformat(),
    }
    logger.info(f"Created chat session {session_id} with agent_type: {request.agent_type}")
    return {"session_id": session_id}


@router.get("/sessions/{session_id}")
async def get_session(session_id: str):
    """Get session information."""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found") from None
    return sessions[session_id]


@router.get("/sessions/{session_id}/messages")
async def get_messages(session_id: str):
    """Get messages for a session (for polling)."""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found") from None
    return sessions[session_id].get("messages", [])


@router.post("/sessions/{session_id}/messages")
async def send_message(session_id: str, request: dict):
    """REST endpoint for sending messages."""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found") from None

    # Store user message
    user_msg = {
        "id": str(uuid.uuid4()),
        "content": request.get("message", ""),
        "sender": "user",
        "timestamp": datetime.now().isoformat(),
    }
    sessions[session_id]["messages"].append(user_msg)

    # Generate AI response
    user_message = request.get("message", "")

    # Create contextual response based on the message
    if any(word in user_message.lower() for word in ["hello", "hi", "hey"]):
        assistant_content = "Hello! I'm your Archon Knowledge Assistant. I can help you search through your knowledge base and answer questions about your documentation.\n\nTo get started:\n• Add documentation sources in the Knowledge Base section\n• Ask me questions about topics you've indexed\n• Use specific keywords from your documentation\n\nWhat would you like to know about?"
    elif any(word in user_message.lower() for word in ["help", "what can you do", "capabilities"]):
        assistant_content = "I'm designed to help you with:\n\n📚 **Knowledge Search**: Find information in your crawled documentation\n🔍 **Smart Queries**: Ask natural language questions about your content\n📖 **Source Discovery**: Learn what documentation is available\n💡 **Guidance**: Get tips on using Archon effectively\n\nTo use me effectively:\n1. First, crawl some documentation sources\n2. Then ask specific questions about those topics\n3. I'll search through the content to find relevant answers\n\nWhat specific topic are you interested in exploring?"
    elif any(word in user_message.lower() for word in ["search", "find", "look for"]):
        assistant_content = f"I understand you want to search for information about '{user_message}'. Here's how to get the best results:\n\n🎯 **For effective searches**:\n• Be specific with your keywords\n• Ask complete questions\n• Reference particular technologies or concepts\n\n📚 **Current status**: Your knowledge base is being prepared for searching\n\n💡 **Quick tip**: Once you've added documentation sources, I can perform semantic searches to find exactly what you're looking for!\n\nWhat specific information are you hoping to find?"
    elif any(word in user_message.lower() for word in ["archon", "system", "platform"]):
        assistant_content = "Archon is a powerful knowledge management and RAG (Retrieval-Augmented Generation) platform that helps you:\n\n🏗️ **Build Knowledge Bases**: Crawl and index documentation from various sources\n🔍 **Intelligent Search**: Use AI-powered semantic search across your content\n💬 **Interactive Chat**: Ask questions and get contextual answers\n📊 **Content Management**: Organize and maintain your documentation\n\nKey features:\n• Multi-source documentation crawling\n• Vector-based semantic search\n• AI-powered question answering\n• Real-time chat interface\n• Source citation and references\n\nWould you like to know more about any specific aspect of Archon?"
    else:
        assistant_content = f"Thanks for your question about '{user_message}'. I'm your Archon Knowledge Assistant, and I'm here to help!\n\n🔍 **To search your knowledge base**: Once you've added documentation sources, I can search through them to find relevant information\n\n📚 **To get started**: Visit the Knowledge Base section to add documentation sources from websites, repositories, or documents\n\n💡 **For better results**: Try asking specific questions like:\n• 'How do I configure X?'\n• 'What is the API for Y?'\n• 'Show me examples of Z'\n\nWhat would you like to explore first?"

    # Create assistant response message
    assistant_msg = {
        "id": str(uuid.uuid4()),
        "content": assistant_content,
        "sender": "assistant",
        "timestamp": datetime.now().isoformat(),
        "agent_type": "rag",
    }
    sessions[session_id]["messages"].append(assistant_msg)

    logger.info(f"Generated chat response for session {session_id}")
    return {"status": "sent", "response_generated": True}
