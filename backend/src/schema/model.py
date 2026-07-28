from sqlmodel import SQLModel, Field, Column, JSON
from uuid import uuid4, UUID
from typing import Literal, Optional
from datetime import datetime
from pydantic import Field as PydField
'''
    Models for the database tables using SQLModel.
'''


class User(SQLModel, table = True):
    __tablename__ = "users"

    user_id: UUID = Field(default_factory = uuid4, primary_key = True)
    email: str = Field(index=True, unique=True, nullable=False)
    hashed_password: str = Field(nullable=False)
    full_name: Optional[str] = Field(default=None, nullable=True)
    role: str = Field(default="recruiter", nullable=False)  # recruiter | admin
    is_active: bool = Field(default=True, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

class CandidateProfile(SQLModel, table = True):
    __tablename__ = "candidate_profiles"

    candidate_id: UUID = Field(default_factory = uuid4, primary_key = True)
    owner_id: UUID = Field(foreign_key = "users.user_id", nullable = False, index = True)
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
    owner_id: UUID = Field(foreign_key = "users.user_id", nullable = False, index = True)
    title: Optional[str] = Field(default = None, nullable = True)
    company: Optional[str] = Field(default = None, nullable = True)
    location: Optional[str] = Field(default = None, nullable = True)
    job_url: Optional[str] = Field(default = None, nullable = True)
    description: Optional[str] = Field(default = None, nullable = True)
    created_at: datetime = Field(default_factory = datetime.utcnow, nullable = False)


class MatchResults(SQLModel, table = True):
    __tablename__ = "match_results"

    match_id: UUID = Field(default_factory = uuid4, primary_key = True)
    profile_id: UUID = Field(foreign_key = "candidate_profiles.candidate_id", nullable = False)
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
class RegisterRequest(SQLModel):
    email: str
    password: str = PydField(min_length=6)
    full_name: Optional[str] = None

class LoginRequest(SQLModel):
    email: str
    password: str

class UserPublic(SQLModel):
    user_id: UUID
    email: str
    full_name: Optional[str] = None
    role: str

class TokenResponse(SQLModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic

class UserRequest(SQLModel):
    # user_id: UUID
    github_url: Optional[str] = Field(default = None)
    cv_url: Optional[str] = Field(default = None)

class UserResponse(SQLModel):
    candidate_id: UUID
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
    owner_id: Optional[UUID] = None       # ← THÊM (optional)
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
    job_url: Optional[str] = None


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

class ChangePasswordRequest(SQLModel):
    current_password: str
    new_password: str = PydField(min_length=6)

class JobAction(SQLModel, table=True):
    __tablename__ = "job_actions"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(
        foreign_key="users.user_id", nullable=False, index=True,
    )
    job_id: UUID = Field(
        foreign_key="linkedin_jobs.job_id", nullable=False, index=True,
    )
    saved: bool = Field(default=False)
    hidden: bool = Field(default=False)
    apply_status: str = Field(default="not_applied")
    # not_applied | applied | interviewed | offered | rejected
    notes: Optional[str] = Field(default=None, nullable=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class JobActionUpdate(SQLModel):
    saved: Optional[bool] = None
    hidden: Optional[bool] = None
    apply_status: Optional[str] = None
    notes: Optional[str] = None

class JobActionResponse(SQLModel):
    id: UUID
    job_id: UUID
    saved: bool
    hidden: bool
    apply_status: str
    notes: Optional[str] = None
    updated_at: datetime

# schema/model.py
class Notification(SQLModel, table=True):
    __tablename__ = "notifications"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(
        foreign_key="users.user_id", nullable=False, index=True,
    )
    title: str = Field(nullable=False)
    description: Optional[str] = Field(default=None, nullable=True)
    read: bool = Field(default=False)
    link: Optional[str] = Field(default=None, nullable=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)


class NotificationResponse(SQLModel):
    id: UUID
    title: str
    description: Optional[str] = None
    read: bool
    link: Optional[str] = None
    created_at: datetime

