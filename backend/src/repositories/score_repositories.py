from uuid import UUID
from sqlmodel import Session, select
from backend.src.schema.model import MatchResults, CandidateProfile, LinkedInJobs
from backend.utils.logger import setup_logger
from sqlmodel import delete

logger = setup_logger("Score Repository")

class ScoreRepository:
    def __init__(self, session: Session):
        self.session = session

    def create_match_result(self, match_data: dict) -> MatchResults:
        match = MatchResults(**match_data)
        self.session.add(match)
        self.session.commit()
        self.session.refresh(match)
        return match

    def get_all_scores_by_owner(self, owner_id: UUID) -> list[MatchResults]:
        """List tất cả match của recruiter — JOIN qua CandidateProfile."""
        stmt = (
            select(MatchResults)
            .join(CandidateProfile,
                  CandidateProfile.candidate_id == MatchResults.profile_id)
            .where(CandidateProfile.owner_id == owner_id)
            .order_by(MatchResults.created_at.desc())
        )
        return list(self.session.exec(stmt).all())

    def get_scores_by_profile(
        self, profile_id: UUID, owner_id: UUID,
    ) -> list[MatchResults]:
        """Filter cả profile_id lẫn owner để chắc chắn."""
        stmt = (
            select(MatchResults)
            .join(CandidateProfile,
                  CandidateProfile.candidate_id == MatchResults.profile_id)
            .where(
                MatchResults.profile_id == profile_id,
                CandidateProfile.owner_id == owner_id,
            )
        )
        return list(self.session.exec(stmt).all())

    def get_scores_with_jobs_by_owner(
        self, owner_id: UUID,
    ) -> list[tuple[MatchResults, LinkedInJobs]]:
        """List match kèm thông tin job (1 query)."""
        stmt = (
            select(MatchResults, LinkedInJobs)
            .join(CandidateProfile,
                  CandidateProfile.candidate_id == MatchResults.profile_id)
            .join(LinkedInJobs, LinkedInJobs.job_id == MatchResults.job_id)
            .where(CandidateProfile.owner_id == owner_id)
            .order_by(MatchResults.total_score.desc())
        )
        return list(self.session.exec(stmt).all())


    def find_by_profile_and_job(
        self, profile_id: UUID, job_id: UUID
    ) -> MatchResults | None:
        statement = (
            select(MatchResults)
            .where(
                MatchResults.profile_id == profile_id,
                MatchResults.job_id == job_id
            )
        ).order_by(MatchResults.created_at.desc()).limit(1)


        return self.session.exec(statement).first()


    def delete_by_profile(self, profile_id: UUID) -> int:
        stmt = select(MatchResults).where(MatchResults.profile_id == profile_id)
        matches = self.session.exec(stmt).all()
        for m in matches:
            self.session.delete(m)
        self.session.commit()
        return len(matches)

    def delete_by_job_ids(self, job_ids: list[UUID]) -> int:
        stmt = delete(MatchResults).where(MatchResults.job_id.in_(job_ids))
        result = self.session.exec(stmt)
        self.session.commit()
        return result.rowcount or 0