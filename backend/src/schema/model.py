from sqlmodel import SQLModel, Field, Column, JSON
from uuid import uuid4, UUID
from typing import Literal, Optional
from datetime import datetime
from pydantic import Field as PydField
'''
    Models for the database tables using SQLModel.
'''


class UserProfile(SQLModel, table = True):
    __tablename__ = "user_profiles"


    user_id: UUID = Field(default_factory = uuid4, primary_key = True)
    github_url: Optional[str] = Field(default = None, nullable = True)
    cv_url: Optional[str] = Field(default = None, nullable = True)
    cv_hash: Optional[str] = Field(default=None, index=True, nullable=True)  # ← THÊM
    version: int = Field(default = 1)
    cv_markdown: Optional[str] = Field(default = None, nullable = True)
    cv_structured: Optional[dict] = Field(default = None, sa_column = Column(JSON , nullable = True))
    github_summary: Optional[str] = Field(default = None, nullable = True)
    created_at: datetime = Field(default_factory = datetime.utcnow, nullable = False)


class LinkedInJobs(SQLModel, table = True):
    __tablename__ = "linkedin_jobs"


    job_id: UUID = Field(default_factory = uuid4, primary_key = True)
    title: Optional[str] = Field(default = None, nullable = True)
    company: Optional[str] = Field(default = None, nullable = True)
    location: Optional[str] = Field(default = None, nullable = True)
    job_url: Optional[str] = Field(default = None, nullable = True)
    description: Optional[str] = Field(default = None, nullable = True)
    created_at: datetime = Field(default_factory = datetime.utcnow, nullable = False)


class MatchResults(SQLModel, table = True):
    __tablename__ = "match_results"


    match_id: UUID = Field(default_factory = uuid4, primary_key = True)
    profile_id: UUID = Field(foreign_key = "user_profiles.user_id", nullable = False)
    job_id: UUID = Field(foreign_key = "linkedin_jobs.job_id", nullable = False)
    skill_score: Optional[float] = Field(default = None, nullable = True)
    education_score: Optional[float] = Field(default = None, nullable = True)
    work_experience_score: Optional[float] = Field(default = None, nullable = True)
    project_score: Optional[float] = Field(default = None, nullable = True)
    total_score: Optional[float] = Field(default = None, nullable = True)
    ai_analysis_details : Optional[dict] = Field(default = None, sa_column = Column(JSON , nullable = True))
    created_at: datetime = Field(default_factory = datetime.utcnow, nullable = False)


'''
    Define models for input and output data validation using Pydantic.
'''


class UserRequest(SQLModel):
    # user_id: UUID
    github_url: Optional[str] = Field(default = None)
    cv_url: Optional[str] = Field(default = None)

class UserResponse(SQLModel):
    user_id: UUID
    cv_markdown: Optional[str] = Field(default = None)
    github_summary: Optional[str] = Field(default = None)


class Validation(SQLModel):
    is_valid: bool
    syntax_errors: list[str] = []


class EducationItem(SQLModel):
    institution: Optional[str] = None
    degree: Optional[str] = None
    location: Optional[str] = None
    period: Optional[str] = None
    coursework: Optional[str] = None
    gpa: Optional[str] = None

class WorkExperienceItem(SQLModel):
    company: Optional[str] = None
    title: Optional[str] = None
    location: Optional[str] = None
    period: Optional[str] = None
    achievements: list[str] = []

class ProjectItem(SQLModel):
    name: Optional[str] = None
    technologies: list[str] = []
    period: Optional[str] = None
    descriptions: list[str] = []


class SchemaCVResponse(SQLModel):
    skills: list[str] = []
    education: list[EducationItem] = []
    work_experience: list[WorkExperienceItem] = []
    project: list[ProjectItem] = []
    additional_info: list[str] = []
    validation_status: Optional[Validation] = None


class JobRequest(SQLModel):
    # job_id: UUID
    keywords: Optional[str] = Field(default = None)
    location_search: Optional[str] = Field(default = None)
    page_to_scrape: Optional[int] = Field(default = 1)
    filter_level: Optional[str] = Field(default = None)


class JobResponse(SQLModel):
    job_id: UUID
    title: Optional[str] = Field(default = None)
    company: Optional[str] = Field(default = None)
    location: Optional[str] = Field(default = None)
    job_url: Optional[str] = Field(default = None)
    description: Optional[str] = Field(default = None)


class ScoreResponse(SQLModel):
    match_id: UUID
    job_id: UUID
    profile_id: UUID
    skill_score: Optional[float] = None
    education_score: Optional[float] = None
    work_experience_score: Optional[float] = None
    project_score: Optional[float] = None
    total_score: Optional[float] = None
    ai_analysis_details: Optional[dict] = None
    # Thông tin job đính kèm để frontend không cần join thêm
    job_title: Optional[str] = None
    job_company: Optional[str] = None
    job_location: Optional[str] = None


class ScoreRequest(SQLModel):
    profile_id: UUID


class ScoreCV(SQLModel):
    skill_score: int
    education_score: int
    work_experience_score: int
    project_score: int


    matched_skills: list[str] = PydField(min_length=3)
    gap_analysis: list[str] = PydField(min_length=2)
    actionable_advice: list[str] = PydField(min_length=3)
    evaluation_summary: str = PydField(min_length=1)
    project_impact: list[str] = PydField(min_length=2)
    technical_complexity: list[str] = PydField(min_length=2)