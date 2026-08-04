import redis
import redis.asyncio as aioredis
from backend.utils.config import settings

redis_client : redis.Redis = redis.from_url(
    settings.REDIS_URL,
    decode_responses = True,
    socket_timeout = 5,  
    socket_connect_timeout = 5,
    health_check_interval = 30,
)

redis_async_client : aioredis.Redis = aioredis.from_url(
    settings.REDIS_URL,
    decode_responses = True,
    socket_timeout = 5,  
    socket_connect_timeout = 5,
    health_check_interval = 30,
)