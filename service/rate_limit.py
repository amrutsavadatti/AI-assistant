import redis
from fastapi import HTTPException
from datetime import timedelta

# Connect to Redis (adjust host/port as needed)
r = redis.Redis(host="localhost", port=6379, decode_responses=True)

MAX_REQUESTS_PER_DAY = 5
TTL = timedelta(days=1)

def check_rate_limit(ip: str):
    key = f"rate_limit:{ip}"

    # Increment counter atomically
    count = r.incr(key)

    if count == 1:
        # First request — set expiry to 24h
        r.expire(key, int(TTL.total_seconds()))

    if count > MAX_REQUESTS_PER_DAY:
        ttl_remaining = r.ttl(key)
        hours = ttl_remaining // 3600
        minutes = (ttl_remaining % 3600) // 60
        return 0
    return 1
