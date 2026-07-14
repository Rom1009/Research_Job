# Backend ML Platform Architecture & Implementation Guide

## Overview

This document outlines the backend ML platform for Talentgraph's candidate research and scoring system. The platform ingests candidate data from LinkedIn, GitHub, and resumes, applies ML models for scoring, and provides insights via APIs.

---

## System Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
│  (React, Tailwind, Shadcn, Real-time Updates via SWR)      │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼────┐    ┌────▼────┐   ┌───▼────┐
   │API      │    │Auth     │   │WebSocket
   │Gateway  │    │Service  │   │(Real-time
   │         │    │         │   │updates)
   └────┬────┘    └────┬────┘   └────┬────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼────┐    ┌────▼────┐   ┌───▼────────┐
   │Candidate│    │Scoring  │   │ML Pipeline │
   │Service  │    │Engine   │   │(Async Jobs)│
   └────┬────┘    └────┬────┘   └───┬────────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
        ┌──────────────┼──────────────────┐
        │              │                  │
   ┌────▼─────┐  ┌────▼────┐  ┌─────────▼────┐
   │PostgreSQL│  │Cache    │  │Message Queue │
   │Database  │  │(Redis)  │  │(Bull/RabbitMQ)
   └──────────┘  └─────────┘  └───────────────┘
```

---

## 1. Candidate Data Service

### Endpoint: `POST /api/candidates/ingest`

**Purpose**: Ingest candidate data from various sources

```typescript
interface CandidateIngestRequest {
  sourceType: 'linkedin' | 'github' | 'resume' | 'direct'
  data: {
    name: string
    email: string
    phoneNumber?: string
    linkedinProfile?: string
    githubProfile?: string
    resumeUrl?: string
    skills: string[]
    experience: number
    location: string
    jobTitle: string
  }
}

interface CandidateIngestResponse {
  candidateId: string
  status: 'pending' | 'processing' | 'completed'
  scoringJobId: string
  estimatedCompletionTime: number // milliseconds
}
```

**Implementation** (Pseudo-code):
```typescript
export async function ingestCandidate(req: CandidateIngestRequest) {
  const candidate = await db.candidates.create({
    ...req.data,
    source: req.sourceType,
    createdAt: new Date(),
    status: 'pending',
  })

  // Queue scoring job
  await queue.add('score-candidate', {
    candidateId: candidate.id,
    linkedinProfile: req.data.linkedinProfile,
    githubProfile: req.data.githubProfile,
    resumeUrl: req.data.resumeUrl,
  }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  })

  return {
    candidateId: candidate.id,
    status: 'pending',
    scoringJobId: candidate.scoringJobId,
    estimatedCompletionTime: 45000,
  }
}
```

---

## 2. Scoring Engine

### Core Scoring Components

#### A. Skill Analyzer
```typescript
interface SkillAnalysisResult {
  detectedSkills: {
    skill: string
    confidence: number
    yearsOfExperience: number
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  }[]
  skillMatch: number // 0-100
  missingCriticalSkills: string[]
}

async function analyzeSkills(
  candidateData: ParsedCandidateData
): Promise<SkillAnalysisResult> {
  // 1. Extract from resume/LinkedIn
  const mentionedSkills = extractSkillMentions(candidateData)
  
  // 2. ML model for skill inference from projects
  const inferredSkills = await skillInferenceModel.predict({
    projects: candidateData.projects,
    workHistory: candidateData.workHistory,
  })
  
  // 3. Calculate skill match against job requirements
  const skillMatch = calculateSkillMatch(
    [...mentionedSkills, ...inferredSkills],
    JOB_REQUIREMENTS
  )
  
  return {
    detectedSkills: [...mentionedSkills, ...inferredSkills],
    skillMatch,
    missingCriticalSkills: findMissingSkills(mentionedSkills, JOB_REQUIREMENTS),
  }
}
```

#### B. Culture Fit Calculator
```typescript
interface CultureFitResult {
  score: number // 0-100
  traits: {
    trait: string
    alignment: number
  }[]
  strengths: string[]
  misalignments: string[]
}

async function calculateCultureFit(
  candidateData: ParsedCandidateData,
  companyProfile: CompanyProfile
): Promise<CultureFitResult> {
  // 1. Extract personality traits from resume/CV language
  const extractedTraits = extractTraitsFromText(
    candidateData.resumeText,
    candidateData.coverLetter
  )
  
  // 2. Analyze GitHub activity for collaboration patterns
  const gitHubTraits = analyzeGitHubBehavior(candidateData.githubProfile)
  
  // 3. Score against company values
  const cultureFitScore = await cultureModel.predict({
    candidateTraits: [...extractedTraits, ...gitHubTraits],
    companyValues: companyProfile.values,
    teamComposition: companyProfile.teamComposition,
  })
  
  return {
    score: cultureFitScore.score * 100,
    traits: cultureFitScore.traits,
    strengths: identifyStrengths(cultureFitScore, companyProfile),
    misalignments: identifyMisalignments(cultureFitScore, companyProfile),
  }
}
```

#### C. Overall Score Calculator
```typescript
interface ScoringResult {
  overallScore: number // 0-100
  breakdown: {
    technical: number
    communication: number
    leadership: number
    culture: number
    growth: number
    consistency: number
  }
  recommendation: 'fast_track' | 'interview' | 'hold' | 'reject'
}

async function calculateFinalScore(
  skillAnalysis: SkillAnalysisResult,
  cultureAnalysis: CultureFitResult,
  candidateData: ParsedCandidateData
): Promise<ScoringResult> {
  const weights = {
    technical: 0.35,
    communication: 0.15,
    leadership: 0.15,
    culture: 0.20,
    growth: 0.10,
    consistency: 0.05,
  }
  
  const scores = {
    technical: skillAnalysis.skillMatch,
    communication: analyzeFromLinkedIn(candidateData.linkedinProfile),
    leadership: calculateLeadershipScore(candidateData),
    culture: cultureAnalysis.score,
    growth: calculateGrowthPotential(candidateData),
    consistency: calculateConsistency(candidateData),
  }
  
  const overallScore =
    Object.entries(scores).reduce((sum, [key, score]) => {
      return sum + score * weights[key as keyof typeof weights]
    }, 0)
  
  return {
    overallScore,
    breakdown: scores,
    recommendation: getRecommendation(overallScore, scores),
  }
}
```

### Endpoint: `GET /api/candidates/:id/score`

```typescript
interface ScoreResponse {
  candidateId: string
  status: 'pending' | 'completed' | 'failed'
  result?: ScoringResult
  error?: string
  lastUpdated: string
}
```

---

## 3. Data Extraction Service

### LinkedIn Scraper (Async)
```typescript
interface LinkedInScraperConfig {
  linkedinUrl: string
  includeActivity: boolean
  includeRecommendations: boolean
}

async function scrapeLinkedInProfile(config: LinkedInScraperConfig) {
  // Use Puppeteer or API (if available)
  // Extract:
  // - Full work history
  // - Endorsements & Skills
  // - Recommendations
  // - Activity patterns
  // - Network strength
  // - Post engagement metrics
  
  return {
    workHistory: [...],
    skills: [...],
    recommendations: [...],
    activityScore: number,
  }
}
```

### GitHub Activity Analyzer
```typescript
interface GitHubAnalysisResult {
  repositories: {
    name: string
    stars: number
    forks: number
    language: string
    contributions: number
  }[]
  contributionScore: number // 0-100
  collaborationMetrics: {
    pullRequestsOpened: number
    pullRequestsReviewed: number
    issuesOpened: number
    codeReviewQuality: number
  }
  languageProficiency: Record<string, number>
}

async function analyzeGitHubProfile(username: string) {
  const api = new Octokit({ auth: process.env.GITHUB_TOKEN })
  
  const repos = await api.repos.listForUser({ username })
  const events = await api.activity.listEventsForAuthenticatedUser()
  
  return {
    repositories: extractRepoMetrics(repos),
    contributionScore: calculateContributionScore(events),
    collaborationMetrics: analyzeCollaboration(repos, events),
    languageProficiency: analyzeLanguages(repos),
  }
}
```

### Resume Parser
```typescript
interface ParsedResume {
  personalInfo: {
    name: string
    email: string
    phone: string
    location: string
  }
  workHistory: {
    company: string
    title: string
    startDate: string
    endDate: string
    description: string
  }[]
  education: {
    school: string
    degree: string
    field: string
    graduationYear: number
  }[]
  skills: string[]
  certifications: {
    name: string
    issuedDate: string
    expiryDate?: string
  }[]
}

async function parseResume(resumeUrl: string): Promise<ParsedResume> {
  // Use PDF.js or AWS Textract for extraction
  const text = await extractTextFromPDF(resumeUrl)
  
  return {
    personalInfo: extractPersonalInfo(text),
    workHistory: extractWorkHistory(text),
    education: extractEducation(text),
    skills: extractSkills(text),
    certifications: extractCertifications(text),
  }
}
```

---

## 4. ML Models Integration

### Model Management
```typescript
interface MLModelConfig {
  modelName: string
  version: string
  endpoint: string // Hugging Face, custom endpoint, etc.
  inputFormat: string
  outputFormat: string
  latency: number // ms
  accuracy: number
}

const models = {
  skillClassification: {
    endpoint: process.env.SKILL_MODEL_ENDPOINT,
    version: '1.2.0',
  },
  cultureAlignment: {
    endpoint: process.env.CULTURE_MODEL_ENDPOINT,
    version: '1.0.5',
  },
  growthPotential: {
    endpoint: process.env.GROWTH_MODEL_ENDPOINT,
    version: '1.1.0',
  },
}

async function callMLModel(
  modelKey: keyof typeof models,
  input: any
): Promise<any> {
  const model = models[modelKey]
  
  try {
    const response = await fetch(model.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    
    return await response.json()
  } catch (error) {
    logger.error(`ML model ${modelKey} failed:`, error)
    throw new Error(`Scoring failed for ${modelKey}`)
  }
}
```

---

## 5. Caching Strategy

```typescript
const CACHE_CONFIG = {
  candidateProfile: 3600, // 1 hour
  scoringResult: 86400, // 1 day
  skillData: 604800, // 1 week
  linkedinData: 432000, // 5 days
}

async function getCachedScore(candidateId: string): Promise<ScoringResult | null> {
  const cached = await redis.get(`score:${candidateId}`)
  
  if (cached) {
    return JSON.parse(cached)
  }
  
  return null
}

async function cacheScore(candidateId: string, score: ScoringResult) {
  await redis.setex(
    `score:${candidateId}`,
    CACHE_CONFIG.scoringResult,
    JSON.stringify(score)
  )
}
```

---

## 6. Async Job Queue

### Scoring Pipeline (Pseudo BullMQ)
```typescript
const queue = new Queue('scoring', {
  connection: redisConnection,
})

queue.process('score-candidate', async (job) => {
  const { candidateId } = job.data
  
  try {
    job.progress(20)
    
    const candidateData = await db.candidates.findById(candidateId)
    job.progress(40)
    
    const skillAnalysis = await analyzeSkills(candidateData)
    job.progress(60)
    
    const cultureAnalysis = await calculateCultureFit(candidateData)
    job.progress(80)
    
    const finalScore = await calculateFinalScore(
      skillAnalysis,
      cultureAnalysis,
      candidateData
    )
    
    await db.candidates.update(candidateId, {
      score: finalScore.overallScore,
      breakdown: finalScore.breakdown,
      recommendation: finalScore.recommendation,
      status: 'completed',
    })
    
    await cacheScore(candidateId, finalScore)
    
    job.progress(100)
    
    return { success: true, score: finalScore }
  } catch (error) {
    logger.error(`Scoring failed for ${candidateId}:`, error)
    throw error
  }
})

queue.on('completed', (job) => {
  // WebSocket notification to client
  emitScoreCompleted(job.data.candidateId)
})
```

---

## 7. API Endpoints Reference

### 1. POST `/api/candidates/ingest`
- **Purpose**: Ingest new candidate
- **Auth**: Required
- **Rate Limit**: 100/hour

### 2. GET `/api/candidates/:id/score`
- **Purpose**: Get candidate score
- **Auth**: Required
- **Cache**: 1 day

### 3. POST `/api/candidates/batch-ingest`
- **Purpose**: Bulk ingest (CSV/JSON)
- **Auth**: Required
- **Max**: 1000 candidates

### 4. GET `/api/insights/pool-analysis`
- **Purpose**: Pool metrics & trends
- **Auth**: Required
- **Cache**: 1 hour

### 5. GET `/api/candidates/recommendations`
- **Purpose**: Hiring recommendations
- **Auth**: Required
- **Refresh**: Real-time

### 6. POST `/api/candidates/:id/feedback`
- **Purpose**: Improve scores via feedback loop
- **Auth**: Required
- **Purpose**: Train models on hiring outcomes

---

## 8. Error Handling & Monitoring

```typescript
class ScoringError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message)
  }
}

async function scoringWithRetry(
  candidateId: string,
  maxRetries: number = 3
) {
  let attempts = 0
  
  while (attempts < maxRetries) {
    try {
      return await scoreCandidate(candidateId)
    } catch (error) {
      attempts++
      
      if (error instanceof ScoringError && error.retryable) {
        await delay(1000 * Math.pow(2, attempts - 1)) // Exponential backoff
        continue
      }
      
      throw error
    }
  }
}
```

---

## 9. Deployment Considerations

- **Scale**: Handle 1M+ candidates
- **Latency**: <2 second response time for API
- **Throughput**: 1000+ scoring jobs/minute
- **Availability**: 99.9% uptime SLA

### Infrastructure
- Kubernetes for orchestration
- PostgreSQL for primary database
- Redis for caching & session management
- RabbitMQ/Bull for job queue
- Prometheus + Grafana for monitoring

---

## 10. Future Enhancements

- [ ] Real-time LinkedIn webhooks instead of scraping
- [ ] Custom ML model training on hiring outcomes
- [ ] Video interview analysis integration
- [ ] Compensation benchmarking
- [ ] Skill trajectory predictions
- [ ] Diversity & inclusion scoring
