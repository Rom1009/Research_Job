"""GitHub AI module — fetch & analyze public GitHub profiles."""
from backend.ai.github.service import (
    GitHubService,
    GitHubAPIError,
    extract_github_username,
)
from backend.ai.github.schema import GitHubProfile, GitHubSummary

__all__ = [
    "GitHubService",
    "GitHubAPIError",
    "extract_github_username",
    "GitHubProfile",
    "GitHubSummary",
]