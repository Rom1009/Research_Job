from sqlmodel import SQLModel, Field, Column, JSON
from uuid import uuid4, UUID
from typing import Literal, Optional
from datetime import datetime

'''
    Models for the database tables using SQLModel.
'''

class UserProfile(SQLModel, table = True):
    __tablename__ = "user_profiles"

    user_id: UUID = Field(default_factory = uuid4, primary_key = True)
    cv_url: Optional[str] = Field(default = None, nullable = True)
    github_url: Optional[str] = Field(default = None, nullable = True)
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
    syntax_errors: list[str]

class SchemaCVResponse(SQLModel):
    skills: list[str]
    education: list[str]
    work_experience: list[str]

    additional_info: list[str]

    validation_status: Validation

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
    skill_score: Optional[float] = Field(default = None)
    education_score: Optional[float] = Field(default = None)
    work_experience_score: Optional[float] = Field(default = None)
    project_score: Optional[float] = Field(default = None)
    total_score: Optional[float] = Field(default = None)
    ai_analysis_details : Optional[dict] = Field(default = None)

class ScoreRequest(SQLModel):
    profile_id: UUID
    job_id: UUID