"""Simple in-memory fixed-window rate limiting middleware.

Suitable for a single-process deployment. For horizontally-scaled deployments,
swap the in-memory store for a shared backend (e.g. Redis) behind the same
interface.
"""

from __future__ import annotations

import threading
import time

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

# Path prefixes that must never be rate limited (docs, static).
_EXEMPT_PREFIXES = ("/docs", "/redoc", "/openapi.json", "/favicon")


def _is_exempt(path: str) -> bool:
    return path == "/" or path.endswith("/health") or path.startswith(_EXEMPT_PREFIXES)


class _FixedWindowCounter:
    """Per-key fixed-window counter with a background-free lazy reset."""

    def __init__(self, limit: int, window_seconds: int) -> None:
        self.limit = limit
        self.window = window_seconds
        self._lock = threading.Lock()
        self._buckets: dict[str, tuple[int, float]] = {}

    def hit(self, key: str) -> tuple[bool, int, float]:
        """Register a hit. Returns (allowed, remaining, reset_epoch)."""
        now = time.time()
        with self._lock:
            count, window_start = self._buckets.get(key, (0, now))
            if now - window_start >= self.window:
                count, window_start = 0, now
            count += 1
            self._buckets[key] = (count, window_start)
            reset_at = window_start + self.window
            allowed = count <= self.limit
            remaining = max(0, self.limit - count)
            return allowed, remaining, reset_at


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(
        self, app, limit: int, window_seconds: int, enabled: bool = True,
        trust_proxy_headers: bool = False,
    ) -> None:
        super().__init__(app)
        self.enabled = enabled
        self.limit = limit
        self.window = window_seconds
        self.trust_proxy_headers = trust_proxy_headers
        self._counter = _FixedWindowCounter(limit, window_seconds)

    def _client_key(self, request: Request) -> str:
        # Honor a proxy-provided client IP when present.
        forwarded = request.headers.get("X-Forwarded-For") if self.trust_proxy_headers else None
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        path = request.url.path
        if not self.enabled or _is_exempt(path):
            return await call_next(request)

        allowed, remaining, reset_at = self._counter.hit(self._client_key(request))
        retry_after = max(0, int(reset_at - time.time()))

        if not allowed:
            response: Response = JSONResponse(
                status_code=429,
                content={
                    "message": "Too many requests. Please slow down and try again shortly.",
                    "code": "rate_limited",
                },
            )
            response.headers["Retry-After"] = str(retry_after)
        else:
            response = await call_next(request)

        response.headers["X-RateLimit-Limit"] = str(self.limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(int(reset_at))
        return response
