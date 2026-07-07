from sqlmodel import Session
from fastapi import Depends

from backend.src.schema.model import ScoreRequest, ScoreResponse
from backend.db.db import get_session
from backend.utils.logger import setup_logger
from backend.src.services.score_service import ScoreService

logger = setup_logger("Score Controller")

class ScoreController:
    def calculate_score(self, score_request: ScoreRequest, session: Session = Depends(get_session)):
        score_service = ScoreService(session)

        scores = score_service.calculate_score()
        return scores