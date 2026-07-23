GITHUB_PROFILE_QUERY = """
query GetUserProfile($login: String!, $since: DateTime!) {
  user(login: $login) {
    # Profile info
    login
    name
    bio
    avatarUrl
    company
    location
    email
    websiteUrl
    twitterUsername
    createdAt
    followers { totalCount }
    following { totalCount }

    # Organizations (public)
    organizations(first: 10) {
      nodes {
        login
        name
        avatarUrl
      }
    }

    # Top 20 owned repos (not fork, sort by stars + recent push)
    repositories(
      first: 20
      ownerAffiliations: [OWNER]
      isFork: false
      orderBy: { field: STARGAZERS, direction: DESC }
      privacy: PUBLIC
    ) {
      totalCount
      nodes {
        name
        nameWithOwner
        description
        url
        homepageUrl
        stargazerCount
        forkCount
        watchers { totalCount }
        primaryLanguage { name color }
        languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
          edges {
            size
            node { name color }
          }
          totalSize
        }
        repositoryTopics(first: 10) {
          nodes { topic { name } }
        }
        licenseInfo { name spdxId }
        createdAt
        pushedAt
        updatedAt
        diskUsage
        isArchived
        object(expression: "HEAD:README.md") {
          ... on Blob { text }
        }
      }
    }

    # Contribution graph (365 days)
    contributionsCollection(from: $since) {
      totalCommitContributions
      totalIssueContributions
      totalPullRequestContributions
      totalPullRequestReviewContributions
      totalRepositoryContributions
      restrictedContributionsCount
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            weekday
          }
        }
      }

      # Top 10 repos user contributed to (NOT owner)
      commitContributionsByRepository(maxRepositories: 10) {
        repository {
          nameWithOwner
          url
          stargazerCount
          primaryLanguage { name }
          owner { login }
          isPrivate
        }
        contributions { totalCount }
      }

      pullRequestContributionsByRepository(maxRepositories: 10) {
        repository {
          nameWithOwner
          stargazerCount
        }
        contributions { totalCount }
      }
    }

    # Pinned repos (user tự chọn để show)
    pinnedItems(first: 6, types: REPOSITORY) {
      nodes {
        ... on Repository {
          nameWithOwner
          description
          stargazerCount
          primaryLanguage { name }
        }
      }
    }
  }

  # Rate limit info (debug)
  rateLimit {
    limit
    remaining
    resetAt
  }
}
"""