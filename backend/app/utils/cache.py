"""
AURORA Utilities — Thread-Safe TTLCache
Pure Python implementation of a size-limited cache with TTL eviction.
"""

import time
from threading import Lock
from typing import Dict, Tuple, Any


class TTLCache:
    """
    Thread-safe, size-limited cache with automatic Time-To-Live (TTL) eviction.
    """

    def __init__(self, max_size: int = 128, default_ttl: float = 60.0):
        self.max_size = max_size
        self.default_ttl = default_ttl
        self._cache: Dict[str, Tuple[float, Any]] = {}
        self._lock = Lock()

    def get(self, key: str) -> Any:
        """Retrieve value from cache if it exists and has not expired."""
        with self._lock:
            self._evict_expired()
            if key in self._cache:
                return self._cache[key][1]
            return None

    def set(self, key: str, value: Any, ttl: float = None) -> None:
        """Store a value in the cache with a specific or default TTL."""
        with self._lock:
            self._evict_expired()
            
            # Size-limit eviction (FIFO-like simplification)
            if len(self._cache) >= self.max_size and key not in self._cache:
                oldest_key = next(iter(self._cache))
                del self._cache[oldest_key]
                
            expiration = time.time() + (ttl if ttl is not None else self.default_ttl)
            self._cache[key] = (expiration, value)

    def _evict_expired(self) -> None:
        """Evict all expired items from the cache. Must be called under lock."""
        now = time.time()
        expired = [k for k, (exp, _) in self._cache.items() if now > exp]
        for k in expired:
            del self._cache[k]


# Global cache instance for API responses (60 seconds default TTL)
api_cache = TTLCache(max_size=256, default_ttl=60.0)
