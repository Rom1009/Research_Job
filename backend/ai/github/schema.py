"""Pydantic schemas for GitHub profile data."""
from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, Field


class RepoInfo(BaseModel):
    name: str
    full_name: str
    description: Optional[str] = None
    url: Optional[str] = None
    stars: int = 0
    forks: int = 0
    primary_language: Optional[str] = None
    topics: list[str] = Field(default_factory=list)
    license: Optional[str] = None
    pushed_at: Optional[str] = None
    created_at: Optional[str] = None
    size_kb: Optional[int] = None
    readme: Optional[str] = None


class LanguageStat(BaseModel):
    name: str
    percent: float
    bytes: int


class ContributedRepo(BaseModel):
    full_name: str
    url: Optional[str] = None
    stars: int = 0
    language: Optional[str] = None
    owner: str
    is_own: bool = False
    commits: int = 0


class ContributionStats(BaseModel):
    total_commits: int = 0
    total_prs: int = 0
    total_reviews: int = 0
    total_issues: int = 0
    total_repos_contributed: int = 0
    calendar_total: int = 0
    top_contributed_repos: list[ContributedRepo] = Field(default_factory=list)


class OrgInfo(BaseModel):
    login: str
    name: Optional[str] = None
    avatar_url: Optional[str] = None


class ProfileInfo(BaseModel):
    login: str
    name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    twitter: Optional[str] = None
    created_at: Optional[str] = None
    followers: int = 0
    following: int = 0
    orgs: list[OrgInfo] = Field(default_factory=list)


class GitHubProfile(BaseModel):
    profile: ProfileInfo
    top_repos: list[RepoInfo] = Field(default_factory=list)
    top_languages: list[LanguageStat] = Field(default_factory=list)
    contributions: ContributionStats
    pinned: list[dict] = Field(default_factory=list)


class NotableProject(BaseModel):
    name: str
    why: str


class GitHubSummary(BaseModel):
    """LLM-generated evaluation of a GitHub profile."""
    primary_tech_stack: list[str] = Field(default_factory=list)
    seniority_estimate: str = "unknown"       # junior | mid | senior | staff
    seniority_reasoning: str = ""
    domains: list[str] = Field(default_factory=list)
    notable_projects: list[NotableProject] = Field(default_factory=list)
    open_source_engagement: str = "low"       # low | medium | high
    activity_level: str = "inactive"          # inactive | occasional | active | prolific
    red_flags: list[str] = Field(default_factory=list)
    strengths: list[str] = Field(default_factory=list)