from sqlmodel import Session
from fastapi import Depends
from uuid import UUID


from backend.src.schema.model import ScoreRequest, ScoreResponse
from backend.db.db import get_session
from backend.utils.logger import setup_logger
from backend.src.services.score_service import ScoreService


logger = setup_logger("Score Controller")




class ScoreController:
    def calculate_score(
        self,
        req: ScoreRequest,                                # ← nhận body
        session: Session = Depends(get_session),
    ) -> list[ScoreResponse]:
        logger.info(f"Calculating score for profile_id={req.profile_id}")
        score_service = ScoreService(session)
        return score_service.calculate_score(req.profile_id)   # ← truyền xuống


    def list_scores(self, session: Session = Depends(get_session)) -> list[ScoreResponse]:
        return ScoreService(session).list_scores()


    def get_scores_by_profile(
        self,
        profile_id: UUID,
        session: Session = Depends(get_session),
    ) -> list[ScoreResponse]:
        return ScoreService(session).get_scores_by_profile(profile_id)



