from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select
from backend.db.db import get_session
from backend.src.schema.model import User
from backend.src.core.security import decode_token


oauth2_scheme = OAuth2PasswordBearer(tokenUrl = "/api/auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session)
) -> User:
    user_id = decode_token(token)
    if not user_id:
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail = "Invalid authentication credentials",
        )
    user = session.exec(
        select(User).where(User.user_id == user_id)
    ).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail = "User not found or inactive",
        )
   
    return user
