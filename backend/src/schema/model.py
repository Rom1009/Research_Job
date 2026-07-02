from sqlmodel import SQLModel, Field, Column, JSON
from uuid import uuid4
from typing import Literal, Optional
from datetime import datetime

class UserProfile(SQLModel, table = True):
    __tablename__ = "user_profiles"

    user_id: uuid4 = Field(default_factory = uuid4, primary_key = True)
    github_url: Optional[str] = Field(default = None, nullable = True)
    cv_markdown: Optional[str] = Field(default = None, nullable = True)
    cv_structured: Optional[dict] = Field(default = None, sa_column = Column(JSON), nullable = True)
    github_summary: Optional[dict] = Field(default = None, sa_column = Column(JSON), nullable = True)
    created_at: datetime = Field(default_factory = datetime.utcnow, nullable = False)

class LinkedInJobs(SQLModel, table = True):
    __tablename__ = "linkedin_jobs"

    job_id: uuid4 = Field(default_factory = uuid4, primary_key = True)
    title: Optional[str] = Field(default = None, nullable = True)
    company: Optional[str] = Field(default = None, nullable = True)
    location: Optional[str] = Field(default = None, nullable = True)
    job_url: Optional[str] = Field(default = None, nullable = True)
    description: Optional[str] = Field(default = None, nullable = True)
    created_at: datetime = Field(default_factory = datetime.utcnow, nullable = False)

class MatchResults(SQLModel, table = True):
    __tablename__ = "match_results"

    match_id: uuid4 = Field(default_factory = uuid4, primary_key = True)
    profile_id: uuid4 = Field(foreign_key = "user_profiles.user_id", nullable = False)
    job_id: uuid4 = Field(foreign_key = "linkedin_jobs.job_id", nullable = False)
    skill_score: Optional[float] = Field(default = None, nullable = True)
    education_score: Optional[float] = Field(default = None, nullable = True)
    work_experience_score: Optional[float] = Field(default = None, nullable = True)
    project_score: Optional[float] = Field(default = None, nullable = True)
    total_score: Optional[float] = Field(default = None, nullable = True)
    ai_analysis_details : Optional[dict] = Field(default = None, sa_column = Column(JSON), nullable = True)
    created_at: datetime = Field(default_factory = datetime.utcnow, nullable = False)