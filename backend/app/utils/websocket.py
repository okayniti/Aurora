"""
AURORA Utilities — WebSocket Connection Manager
Handles real-time client registrations and event broadcasts.
"""

from fastapi import WebSocket
from typing import List
import logging

logger = logging.getLogger("aurora.websocket")


class ConnectionManager:
    """
    Manages active WebSocket connections for push updates to the client.
    """

    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        """Accept connection and register client."""
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        """Unregister client on disconnect."""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        """Send JSON message to all active WebSocket clients."""
        logger.info(f"Broadcasting WebSocket event to {len(self.active_connections)} clients: {message}")
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.warning(f"Failed to send message to connection: {e}")


# Global connection manager instance
manager = ConnectionManager()
