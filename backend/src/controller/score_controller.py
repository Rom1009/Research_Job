from sqlmodel import Session
from fastapi import Depends

from backend.src.schema.model import ScoreRequest, ScoreResponse
from backend.db.db import get_session
from backend.utils.logger import setup_logger
from backend.src.services.score_service import ScoreService

logger = setup_logger("Score Controller")

class ScoreController:
    def calculate_score(self, session: Session = Depends(get_session)) -> list[ScoreResponse]:
        score_service = ScoreService(session)

        content_score = score_service.calculate_score()
        return content_score