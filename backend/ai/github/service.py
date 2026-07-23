"""GitHub service — fetch, normalize, and analyze public profiles."""
from __future__ import annotations

import json
import re
from datetime import datetime, timedelta, timezone
from typing import Any, Optional
from urllib.parse import urlparse

import httpx
from groq import Groq

from backend.ai.github.prompts import GITHUB_SUMMARY_SYSTEM, GITHUB_SUMMARY_USER
from backend.ai.github.queries import GITHUB_PROFILE_QUERY
from backend.ai.github.schema import GitHubProfile, GitHubSummary
from backend.utils.config import settings
from backend.utils.logger import setup_logger

logger = setup_logger("github_service")

GITHUB_API = "https://api.github.com/graphql"

_USERNAME_RE = re.compile(r"^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$")
_RESERVED_PATHS = {
    "orgs", "settings", "notifications", "explore", "topics", "marketplace",
    "pulls", "issues", "search", "new", "login", "join", "about",
    "pricing", "features",
}


class GitHubAPIError(Exception):
    """Raised on any GitHub API failure."""


def extract_github_username(url_or_name: str) -> str:
    """Parse GitHub URL or bare username → canonical login."""
    if not url_or_name or not url_or_name.strip():
        raise ValueError("Empty GitHub input")

    s = url_or_name.strip()

    if _USERNAME_RE.fullmatch(s):
        return s

    if not s.startswith(("http://", "https://")):
        s = "https://" + s

    parsed = urlparse(s)
    host = parsed.netloc.lower().removeprefix("www.")

    if host not in ("github.com", "api.github.com"):
        raise ValueError(f"Not a GitHub URL: {url_or_name}")

    parts = [p for p in parsed.path.split("/") if p]
    if not parts:
        raise ValueError("No username in GitHub URL")

    if parts[0] == "users" and len(parts) >= 2:
        return parts[1]

    if parts[0] in _RESERVED_PATHS:
        raise ValueError(f"Reserved GitHub path, not a user: {parts[0]}")

    if not _USERNAME_RE.fullmatch(parts[0]):
        raise ValueError(f"Invalid GitHub username: {parts[0]}")

    return parts[0]


class GitHubService:
    """Async client to fetch + analyze GitHub profiles."""

    def __init__(
        self,
        token: Optional[str] = None,
        timeout: float = 30.0,
        groq_client: Optional[Groq] = None,
    ):
        self.token = token or settings.GITHUB_TOKEN.get_secret_value()
        if not self.token:
            raise ValueError(
                "GITHUB_TOKEN is required. Set it in .env or pass token= explicitly."
            )
        self._client = httpx.AsyncClient(
            timeout=timeout,
            headers={
                "Authorization": f"Bearer {self.token}",
                "Accept": "application/vnd.github+json",
                "User-Agent": "ResearchJob/1.0",
            },
        )
        self._groq = groq_client or Groq(
            api_key=settings.GROQ_API_KEY.get_secret_value()
        )

    async def close(self) -> None:
        await self._client.aclose()

    async def __aenter__(self) -> "GitHubService":
        return self

    async def __aexit__(self, *_) -> None:
        await self.close()

    # ---------- GraphQL ----------
    async def _graphql(self, query: str, variables: dict[str, Any]) -> dict[str, Any]:
        resp = await self._client.post(
            GITHUB_API, json={"query": query, "variables": variables}
        )
        if resp.status_code != 200:
            logger.error("GitHub HTTP %s: %s", resp.status_code, resp.text[:500])
            raise GitHubAPIError(f"HTTP {resp.status_code}: {resp.text[:200]}")

        data = resp.json()
        if "errors" in data:
            logger.error("GraphQL errors: %s", data["errors"])
            raise GitHubAPIError(str(data["errors"]))
        return data.get("data") or {}

    # ---------- Fetch ----------
    async def fetch_raw(self, username: str) -> dict[str, Any]:
        since = (datetime.now(timezone.utc) - timedelta(days=365)).isoformat()
        data = await self._graphql(
            GITHUB_PROFILE_QUERY, {"login": username, "since": since}
        )
        user = data.get("user")
        if not user:
            raise GitHubAPIError(f"GitHub user '{username}' not found")

        rate = data.get("rateLimit", {})
        logger.info(
            "GitHub rate limit: %s/%s (reset %s)",
            rate.get("remaining"), rate.get("limit"), rate.get("resetAt"),
        )
        return user

    async def get_profile(self, url_or_username: str) -> GitHubProfile:
        username = extract_github_username(url_or_username)
        logger.info("Fetching GitHub profile: @%s", username)
        raw = await self.fetch_raw(username)
        return self._normalize(raw)

    # ---------- Normalize ----------
    @staticmethod
    def _normalize(user: dict[str, Any]) -> GitHubProfile:
        repos_raw = (user.get("repositories") or {}).get("nodes") or []
        repos_raw = [r for r in repos_raw if r and not r.get("isArchived")]

        lang_totals: dict[str, int] = {}
        for r in repos_raw:
            for edge in ((r.get("languages") or {}).get("edges") or []):
                name = edge["node"]["name"]
                lang_totals[name] = lang_totals.get(name, 0) + edge["size"]
        total_bytes = sum(lang_totals.values()) or 1
        top_languages = [
            {"name": k, "percent": round(v * 100 / total_bytes, 2), "bytes": v}
            for k, v in sorted(lang_totals.items(), key=lambda x: -x[1])
        ][:10]

        top_repos = [
            {
                "name": r["name"],
                "full_name": r["nameWithOwner"],
                "description": r.get("description"),
                "url": r.get("url"),
                "stars": r.get("stargazerCount", 0),
                "forks": r.get("forkCount", 0),
                "primary_language": (r.get("primaryLanguage") or {}).get("name"),
                "topics": [
                    t["topic"]["name"]
                    for t in ((r.get("repositoryTopics") or {}).get("nodes") or [])
                ],
                "license": (r.get("licenseInfo") or {}).get("spdxId"),
                "pushed_at": r.get("pushedAt"),
                "created_at": r.get("createdAt"),
                "size_kb": r.get("diskUsage"),
                "readme": ((r.get("object") or {}).get("text") or "")[:8000] or None,
            }
            for r in repos_raw
        ]

        contrib = user.get("contributionsCollection") or {}
        cal = contrib.get("contributionCalendar") or {}
        top_contributed = [
            {
                "full_name": c["repository"]["nameWithOwner"],
                "url": c["repository"].get("url"),
                "stars": c["repository"].get("stargazerCount", 0),
                "language": (c["repository"].get("primaryLanguage") or {}).get("name"),
                "owner": c["repository"]["owner"]["login"],
                "is_own": c["repository"]["owner"]["login"] == user["login"],
                "commits": c["contributions"]["totalCount"],
            }
            for c in (contrib.get("commitContributionsByRepository") or [])
        ]

        orgs = [
            {"login": o["login"], "name": o.get("name"), "avatar_url": o.get("avatarUrl")}
            for o in ((user.get("organizations") or {}).get("nodes") or [])
        ]

        return GitHubProfile.model_validate({
            "profile": {
                "login": user["login"],
                "name": user.get("name"),
                "bio": user.get("bio"),
                "avatar_url": user.get("avatarUrl"),
                "company": user.get("company"),
                "location": user.get("location"),
                "website": user.get("websiteUrl"),
                "twitter": user.get("twitterUsername"),
                "created_at": user.get("createdAt"),
                "followers": (user.get("followers") or {}).get("totalCount", 0),
                "following": (user.get("following") or {}).get("totalCount", 0),
                "orgs": orgs,
            },
            "top_repos": top_repos,
            "top_languages": top_languages,
            "contributions": {
                "total_commits": contrib.get("totalCommitContributions", 0),
                "total_prs": contrib.get("totalPullRequestContributions", 0),
                "total_reviews": contrib.get("totalPullRequestReviewContributions", 0),
                "total_issues": contrib.get("totalIssueContributions", 0),
                "total_repos_contributed": contrib.get("totalRepositoryContributions", 0),
                "calendar_total": cal.get("totalContributions", 0),
                "top_contributed_repos": top_contributed,
            },
            "pinned": (user.get("pinnedItems") or {}).get("nodes") or [],
        })

    # ---------- LLM summary ----------
    def summarize_with_llm(
        self, profile: GitHubProfile, model: Optional[str] = None
    ) -> GitHubSummary:
        compact = profile.model_dump()
        for r in compact.get("top_repos", []):
            if r.get("readme"):
                r["readme"] = r["readme"][:1500]

        response = self._groq.chat.completions.create(
            model=model or settings.MODEL_GIT,
            temperature=0.0,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": GITHUB_SUMMARY_SYSTEM},
                {
                    "role": "user",
                    "content": GITHUB_SUMMARY_USER.format(
                        profile_json=json.dumps(compact, ensure_ascii=False)
                    ),
                },
            ],
        )
        content = response.choices[0].message.content or "{}"
        try:
            return GitHubSummary.model_validate_json(content)
        except Exception as exc:
            logger.warning("LLM summary parse failed: %s", exc)
            return GitHubSummary()

    # ---------- One-shot ----------
    async def analyze(self, url_or_username: str) -> dict[str, Any]:
        profile = await self.get_profile(url_or_username)
        summary = self.summarize_with_llm(profile)
        return {
            "profile": profile.model_dump(),
            "summary": summary.model_dump(),
        }