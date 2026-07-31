"""
AURORA Utilities — WebSocket Connection Manager
Handles real-time client registrations and per-user event delivery.
"""

from fastapi import WebSocket
from typing import Dict, List
import logging

logger = logging.getLogger("aurora.websocket")


class ConnectionManager:
    """
    Manages active WebSocket connections, keyed by the owning user, so that
    an event is only ever delivered to the sockets belonging to that user.
    """

    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    def _total(self) -> int:
        return sum(len(conns) for conns in self.active_connections.values())

    async def connect(self, websocket: WebSocket, user_id: str):
        """Accept connection and register it against its owning user."""
        await websocket.accept()
        self.active_connections.setdefault(user_id, []).append(websocket)
        logger.info(f"WebSocket client connected for user {user_id}. Total: {self._total()}")

    def disconnect(self, websocket: WebSocket, user_id: str):
        """Unregister client on disconnect."""
        conns = self.active_connections.get(user_id)
        if not conns or websocket not in conns:
            return
        conns.remove(websocket)
        if not conns:
            del self.active_connections[user_id]
        logger.info(f"WebSocket client disconnected for user {user_id}. Total: {self._total()}")

    async def send_to_user(self, user_id: str, message: dict):
        """Send a JSON message to every socket owned by one user."""
        conns = self.active_connections.get(user_id, [])
        logger.info(f"Sending WebSocket event to {len(conns)} sockets for user {user_id}")
        for connection in list(conns):
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.warning(f"Failed to send message to connection: {e}")


# Global connection manager instance
manager = ConnectionManager()
