import redis
import os
from fastapi import HTTPException
from datetime import timedelta

# Connect to Redis using environment variables
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD")

r = redis.Redis(
    host=REDIS_HOST, 
    port=REDIS_PORT, 
    password=REDIS_PASSWORD,
    decode_responses=True
)

MAX_REQUESTS_PER_DAY = 5
TTL = timedelta(days=1)

def check_rate_limit(email: str):
    key = f"rate_limit:{email}"

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
