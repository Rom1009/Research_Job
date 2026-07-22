from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from uuid import UUID
from backend.utils.config import settings

pwd_ctx = CryptContext(schemes = ["bcrypt"], deprecated = "auto")

def hash_password(password: str) -> str:
    return pwd_ctx.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain, hashed)

def create_access_token(user_id: UUID) -> str:
    expire = datetime.utcnow() + timedelta(minutes = settings.JWT_EXPIRATION_MINUTES)
    payload = {
        "sub": str(user_id),
        "exp": expire,
    }

    return jwt.encode(
        payload,
        settings.JWT_SECRET.get_secret_value(),
        algorithm = settings.JWT_ALGORITHM,
    )

def decode_token(token: str) -> UUID | None:
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET.get_secret_value(),
            algorithms = [settings.JWT_ALGORITHM],
        )
        return UUID(payload.get("sub"))
    except (JWTError, KeyError, ValueError):
        return None
   