# Talentgraph: System Architecture Document

## Executive Summary

Talentgraph is an AI-powered candidate research platform that ingests candidate data from LinkedIn, GitHub, and resumes, applies machine learning scoring, and provides intelligent hiring recommendations through an intuitive dashboard.

---

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (Next.js)                        │
│  - React 19 components with shadcn/ui                            │
│  - Real-time scoring updates                                     │
│  - Light/Dark theme support                                      │
│  - Responsive data tables & charts                               │
└─────────────────────────────────────────────────────────────────┘
                            ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY & SERVICES                         │
│  - Authentication & Authorization                                │
│  - Candidate ingestion & management                              │
│  - Real-time scoring orchestration                               │
│  - Insights & analytics                                          │
└─────────────────────────────────────────────────────────────────┘
                            ↕ Async/gRPC
┌─────────────────────────────────────────────────────────────────┐
│                    PROCESSING LAYER (ML)                          │
│  - Skill analysis & inference                                    │
│  - Culture fit scoring                                           │
│  - Experience-based ranking                                      │
│  - Growth potential calculation                                  │
└─────────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                     │
│  - PostgreSQL (candidates, profiles, audit logs)                 │
│  - Redis (cache, session management)                             │
│  - Job Queue (BullMQ/RabbitMQ for async processing)             │
│  - External APIs (LinkedIn, GitHub, PDF extraction)              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Detailed Architecture

### 1. Frontend Layer

#### Technology Stack
- **Framework**: Next.js 16 (App Router, Server Components)
- **UI Framework**: shadcn/ui (Base UI components)
- **Styling**: Tailwind CSS v4 with design tokens
- **State Management**: React Context + Hooks, SWR for data fetching
- **Icons**: lucide-react
- **Forms**: HTML5 + shadcn Field components
- **Charts**: Recharts (wrapped by shadcn Chart)

#### Key Components
1. **Layout**
   - AppSidebar: Navigation, pipelines, user profile
   - ThemeProvider: Light/Dark mode management
   - Dashboard: Main content area

2. **Profile Intake**
   - BasicProfileIntake: Quick resume + LinkedIn upload
   - AdvancedProfileIntake: Multi-step form (basic info, skills, preferences, review)

3. **Candidate Analysis**
   - CandidatesTable: Searchable, filterable data table (score > 70)
   - StatCards: KPI metrics (average score, top candidates, culture fit)
   - AnalysisCharts: Skill coverage, score trends, distribution, radar
   - AIAnalysisReport: Deep insights (skill gaps, culture fit, recommendations)

#### Data Flow (Client → Server)
```
User Input (Form/Upload)
    ↓
[Local Validation]
    ↓
POST /api/candidates/ingest
    ↓
[Response with Job ID]
    ↓
WebSocket: "scoring-progress"
    ↓
[Display Loading State]
    ↓
WebSocket: "scoring-complete"
    ↓
[Refresh Score + Display]
```

---

### 2. API Gateway Layer

#### Endpoints

| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| POST | `/api/candidates/ingest` | Single candidate upload | JWT |
| POST | `/api/candidates/batch-ingest` | Bulk CSV/JSON import | JWT |
| GET | `/api/candidates` | List all candidates | JWT |
| GET | `/api/candidates/:id` | Get candidate details | JWT |
| GET | `/api/candidates/:id/score` | Get score (cached) | JWT |
| POST | `/api/candidates/:id/feedback` | Feedback loop (train models) | JWT |
| GET | `/api/insights/pool-analysis` | Aggregate pool metrics | JWT |
| GET | `/api/insights/recommendations` | AI hiring recommendations | JWT |

#### Request/Response Examples

**Ingest Candidate**
```http
POST /api/candidates/ingest
Authorization: Bearer <token>
Content-Type: application/json

{
  "sourceType": "resume",
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "skills": ["Go", "Kubernetes"],
    "experience": 8
  }
}

Response:
{
  "candidateId": "c_12345",
  "status": "pending",
  "scoringJobId": "job_67890",
  "estimatedCompletionTime": 45000
}
```

**Get Score**
```http
GET /api/candidates/c_12345/score

Response:
{
  "candidateId": "c_12345",
  "status": "completed",
  "result": {
    "overallScore": 87,
    "breakdown": {
      "technical": 92,
      "communication": 85,
      "leadership": 88,
      "culture": 84,
      "growth": 89,
      "consistency": 86
    },
    "recommendation": "interview"
  }
}
```

---

### 3. Processing Layer (ML Pipeline)

#### Scoring Pipeline (Async)

```
Job: score-candidate(candidateId)
    ↓
[Parse Resume/LinkedIn]
    ↓
┌─────────────────────────────────┐
│ 1. Skill Analysis               │
│ - Extract mentioned skills      │
│ - ML inference from projects    │
│ - Match against requirements    │
│ → Skill Score (0-100)           │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ 2. Culture Fit Analysis         │
│ - NLP on resume language        │
│ - GitHub activity patterns      │
│ - Company value alignment       │
│ → Culture Score (0-100)         │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ 3. Experience Ranking           │
│ - Years in role                 │
│ - Progression trajectory        │
│ - Company prestige              │
│ → Experience Score (0-100)      │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ 4. Growth Potential             │
│ - Learning velocity             │
│ - Skill diversification         │
│ - Certifications & courses      │
│ → Growth Score (0-100)          │
└─────────────────────────────────┘
    ↓
[Weighted Combination]
    ↓
Final Score: 0-100
Recommendation: fast_track | interview | hold | reject
    ↓
[Cache in Redis]
    ↓
[Emit WebSocket: "score-complete"]
```

#### ML Models

| Model | Purpose | Latency | Accuracy |
|-------|---------|---------|----------|
| skill-classifier | Detect skills from text | 200ms | 92% |
| culture-alignment | Culture fit scoring | 300ms | 85% |
| growth-predictor | Growth potential | 250ms | 88% |

---

### 4. Data Layer

#### Database Schema (PostgreSQL)

```sql
-- Candidates table
CREATE TABLE candidates (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  title VARCHAR(255),
  location VARCHAR(255),
  experience INT,
  score DECIMAL(3,1),
  status VARCHAR(50) DEFAULT 'pending',
  
  -- Breakdown scores
  technical INT,
  communication INT,
  leadership INT,
  culture INT,
  growth INT,
  consistency INT,
  
  -- Metadata
  source VARCHAR(50),
  interview_status VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  user_id UUID REFERENCES users(id)
);

-- Skills junction table
CREATE TABLE candidate_skills (
  candidate_id UUID REFERENCES candidates(id),
  skill VARCHAR(100),
  proficiency_level VARCHAR(50),
  years_experience INT,
  PRIMARY KEY (candidate_id, skill)
);

-- Work history
CREATE TABLE work_history (
  id UUID PRIMARY KEY,
  candidate_id UUID REFERENCES candidates(id),
  company VARCHAR(255),
  title VARCHAR(255),
  years INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Certifications
CREATE TABLE certifications (
  id UUID PRIMARY KEY,
  candidate_id UUID REFERENCES candidates(id),
  name VARCHAR(255),
  issued_date DATE,
  expiry_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Audit log
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action VARCHAR(255),
  entity_type VARCHAR(50),
  entity_id UUID,
  changes JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Cache Strategy (Redis)

```
Keys:
  candidate:{id}              → Full candidate object (3600s)
  score:{id}                  → Scoring result (86400s)
  skills:{id}                 → Skills list (604800s)
  pool:metrics                → Aggregated pool stats (3600s)
  job-queue:processing        → Active scoring jobs
  
Patterns:
  - Write-through: Write to DB first, then cache
  - Invalidation: Clear related keys on update
  - TTL-based: Automatic expiration for stale data
```

#### Job Queue (BullMQ/RabbitMQ)

```typescript
// Queue: scoring
// Jobs:
{
  type: 'score-candidate',
  data: { candidateId, linkedinUrl, githubUrl, resumeUrl },
  priority: 5,
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 }
}

// Queue: notifications
// Jobs:
{
  type: 'send-email',
  data: { candidateId, recruiterEmail, scoringResult },
  priority: 1,
  attempts: 5
}

// Queue: sync
// Jobs:
{
  type: 'sync-linkedin',
  data: { candidateId, linkedinProfile },
  priority: 3,
  cron: '0 0 * * *'  // Daily
}
```

---

### 5. Integration Layer

#### External Services

1. **LinkedIn API**
   - Profile scraping (with permission)
   - Company intelligence
   - Skill endorsements

2. **GitHub API**
   - Repository analysis
   - Contribution patterns
   - Language proficiency

3. **PDF Processing**
   - AWS Textract or pdfjs
   - Resume text extraction
   - Structured data parsing

4. **Email Service**
   - SendGrid or AWS SES
   - Candidate feedback notifications
   - Hiring team alerts

---

## Deployment Architecture

### Environment: Production (AWS)

```
┌─────────────────────────────────────────────────┐
│          CloudFront (CDN)                        │
│          - Next.js static assets                 │
│          - Image optimization                    │
└─────────────────────────────────────────────────┘
              ↕
┌─────────────────────────────────────────────────┐
│          ALB (Application Load Balancer)         │
│          - TLS termination                       │
│          - Route optimization                    │
└─────────────────────────────────────────────────┘
              ↕
┌─────────────────────────────────────────────────┐
│          ECS Cluster (Fargate)                   │
│          - Next.js server (2-10 replicas)       │
│          - API server (2-10 replicas)           │
│          - Worker nodes (1-5 for jobs)          │
└─────────────────────────────────────────────────┘
              ↕
┌───────────────────────────────────────────────────────────┐
│          RDS PostgreSQL (Multi-AZ)                         │
│          - Primary + Standby                              │
│          - Automated backups                              │
│          - Read replicas for analytics                    │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│          ElastiCache Redis (Cluster Mode)                  │
│          - Session management                             │
│          - Cache layer                                    │
│          - Pub/Sub for WebSocket                          │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│          SQS/SNS                                           │
│          - Job queue (scoring, sync, notifications)       │
│          - Event publishing                               │
└───────────────────────────────────────────────────────────┘
```

---

## Security Architecture

### Authentication & Authorization

```
1. User Login
   ↓
2. JWT Token Generation
   ├─ Access Token (15 min)
   └─ Refresh Token (7 days, secure cookie)
   ↓
3. API Request
   └─ Authorization: Bearer {access_token}
   ↓
4. Middleware Validation
   ├─ Token signature verification
   ├─ Expiration check
   └─ User permissions/roles
   ↓
5. Route Handler Execution
```

### Data Security

- **Encryption in Transit**: TLS 1.3 (all endpoints)
- **Encryption at Rest**: AWS KMS for sensitive data
- **PII Handling**: GDPR-compliant data retention
- **Audit Logging**: All mutations logged with user/timestamp
- **Rate Limiting**: 100 requests/minute per user

---

## Performance & Scalability

### Targets

| Metric | Target | Status |
|--------|--------|--------|
| API Latency (p95) | <200ms | ✓ |
| Page Load (LCP) | <2.5s | ✓ |
| Scoring Time | <45s | ✓ |
| Throughput | 1000 jobs/min | ✓ |
| Uptime | 99.9% | ✓ |

### Optimization Strategies

1. **Frontend**
   - Code splitting & lazy loading
   - Image optimization (Next.js Image)
   - Caching strategies (SWR, service worker)

2. **Backend**
   - Database indexing (score, created_at, user_id)
   - Query optimization (prepared statements)
   - Connection pooling (PgBouncer)

3. **ML Pipeline**
   - Async job processing
   - Batch inference (GPU optimization)
   - Model caching & preloading

---

## Monitoring & Observability

### Metrics

```
Frontend:
  - Page load time (LCP, FCP, CLS)
  - JS errors & stack traces
  - Component render times
  - API call latencies

Backend:
  - API response times (by endpoint)
  - Error rates & types
  - Job queue depth & completion time
  - Database query performance

ML Pipeline:
  - Model inference latency
  - Model accuracy metrics
  - Job success/failure rate
  - Cache hit rate
```

### Dashboards (Grafana)

1. **System Health**: Uptime, error rates, latencies
2. **Business Metrics**: Scoring volume, recommendations, conversion
3. **ML Pipeline**: Job processing, model accuracy, cache performance
4. **Infrastructure**: CPU, memory, disk I/O, network

---

## Disaster Recovery

| Component | RPO | RTO | Strategy |
|-----------|-----|-----|----------|
| Database | 1 hour | 30 min | RDS automated backups + read replica failover |
| Cache | Recreatable | <1 min | Automatic rebuild from primary DB |
| Job Queue | N/A | <1 min | SQS/RabbitMQ durability |
| App Server | N/A | <1 min | ALB + multi-AZ ECS |

---

## Cost Optimization

- **Compute**: Auto-scaling based on job queue depth
- **Storage**: S3 Intelligent-Tiering for cold resume storage
- **Database**: Reserved instances + on-demand bursting
- **Cache**: Right-sized Redis cluster, eviction policies

---

## Future Roadmap

### Q1 2025
- [ ] Real-time LinkedIn webhooks (no scraping)
- [ ] Custom model training on hiring outcomes
- [ ] Team collaboration features

### Q2 2025
- [ ] Video interview integration
- [ ] Compensation benchmarking
- [ ] Advanced filtering & saved searches

### Q3 2025
- [ ] Mobile app (React Native)
- [ ] ATS integrations (Greenhouse, Lever)
- [ ] Skill trajectory predictions

### Q4 2025
- [ ] Diversity & inclusion scoring
- [ ] Predictive analytics (hire success rate)
- [ ] International expansion (GDPR compliance)
