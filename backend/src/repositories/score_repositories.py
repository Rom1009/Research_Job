from uuid import UUID
from sqlmodel import Session, select


from backend.src.schema.model import MatchResults
from backend.utils.logger import setup_logger


logger = setup_logger("Score Repository")


class ScoreRepository:
    def __init__(self, session: Session):
        self.session = session


    def create_match_result(self, match_data):
        logger.info(f"Creating match result with data: {match_data}")


        match_result = MatchResults(**match_data)
        self.session.add(match_result)
        self.session.commit()
        self.session.refresh(match_result)
       
        return match_result


    def get_match_result(self, match_id):
        logger.info(f"Fetching match result with ID: {match_id}")
       
        statement = select(MatchResults).where(MatchResults.match_id == match_id)
        result = self.session.exec(statement).first()


        if result:
            logger.info(f"Match result found: {result}")
        else:
            logger.warning(f"No match result found with ID: {match_id}")


        return result


    def get_all_scores(self) -> list[MatchResults]:
        logger.info("Fetching all match results")
        return list(self.session.exec(select(MatchResults)).all())


    def get_scores_by_profile(self, profile_id: UUID) -> list[MatchResults]:
        logger.info(f"Fetching match results for profile: {profile_id}")
        statement = select(MatchResults).where(MatchResults.profile_id == profile_id)
        return list(self.session.exec(statement).all())



