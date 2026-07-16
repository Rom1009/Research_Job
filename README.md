# Research Job — AI-Powered Candidate Research Platform


An end-to-end recruiting tool that ingests candidate CVs, scrapes job postings from LinkedIn (and — soon — other boards), and uses an LLM to score profile ↔ job fit with detailed AI analysis.


---


## Overview


**Research Job** helps recruiters and hiring teams:


1. **Ingest a candidate profile** — upload a PDF CV and connect a public GitHub URL. The backend extracts structured data (skills, education, work history) via [Docling](https://github.com/DS4SD/docling) + Groq LLM, and summarizes GitHub activity.
2. **Scrape open positions** — collect job postings from LinkedIn public search with configurable keywords, location, experience level, and pagination.
3. **Score & match** — for every scraped job, the Groq LLM compares it against the candidate CV and produces:
   - `skill_score`, `education_score`, `work_experience_score`, `project_score` (0–100)
   - Weighted `total_score`
   - `matched_skills`, `gap_analysis`, `actionable_advice`
   - Free-text `evaluation_summary`, `project_impact`, `technical_complexity`
4. **Visualize insights** — a Next.js dashboard shows candidate list, radar/bar charts of competencies, and per-job match ranking.


---


## Tech Stack


### Backend
| Layer | Tech |
|---|---|
| API | **FastAPI** + **Uvicorn** |
| ORM | **SQLModel** (Pydantic + SQLAlchemy) |
| Database | **PostgreSQL** |
| LLM | **Groq** (Llama-3 / Mixtral, JSON-schema output) |
| CV parsing | **Docling** (`DocumentConverter`) |
| Scraping | **httpx** + **BeautifulSoup4** + **fake-useragent** |
| Config | **pydantic-settings** (`config/input.yml`) |
| Logging | Custom logger utility |


### Frontend
| Layer | Tech |
|---|---|
| Framework | **Next.js 16** (App Router, React 19) |
| Language | **TypeScript** (strict) |
| Styling | **TailwindCSS v4** (CSS-first config) |
| UI primitives | **shadcn/ui** + **Base UI** |
| State | **Zustand** |
| Charts | **Recharts** |
| Notifications | **Sonner** |
| Icons | **Lucide** |


---


## Project Structure


```
Research_Job/
├── backend/                    # FastAPI application
│   ├── main.py                 # App factory + Uvicorn entrypoint
│   ├── ai/                     # (reserved for AI utilities)
│   ├── db/
│   │   └── db.py               # DB engine + session dependency
│   ├── src/
│   │   ├── api.py              # Module registration
│   │   ├── controller/         # HTTP-level handlers (thin layer)
│   │   ├── core/               # BaseModule, middleware, error handlers
│   │   ├── exceptions/         # Custom AppError hierarchy
│   │   ├── module/             # Route bundles per domain
│   │   ├── repositories/       # DB access
│   │   ├── schema/model.py     # SQLModel tables + Pydantic DTOs
│   │   └── services/           # Business logic (LLM + scraping)
│   └── utils/                  # Config, logger, helpers
│
├── frontend/                   # Next.js dashboard
│   ├── app/                    # Routes (App Router)
│   │   ├── layout.tsx          # Root layout (theme, fonts, toaster)
│   │   ├── page.tsx            # Redirects to /dashboard
│   │   ├── dashboard/          # Main dashboard (tab-based)
│   │   └── (dashboard)/        # Route group with sidebar layout
│   ├── components/
│   │   ├── dashboard/          # Business components
│   │   │   ├── profile-intake.tsx    # Upload CV + GitHub
│   │   │   ├── job-scraping.tsx      # Keyword search + results
│   │   │   ├── ai-analysis-report.tsx
│   │   │   ├── analysis-charts.tsx
│   │   │   ├── candidates-table.tsx
│   │   │   ├── stat-cards.tsx
│   │   │   ├── app-sidebar.tsx / custom-sidebar.tsx
│   │   │   └── ...
│   │   └── ui/                 # shadcn primitives (Button, Card, ...)
│   ├── hooks/                  # useIsMobile
│   ├── lib/
│   │   ├── api.ts              # Typed fetch client
│   │   ├── dashboard-store.ts  # Zustand global state
│   │   ├── candidates.ts       # Mock data (transitional)
│   │   └── utils.ts            # cn() helper
│   └── public/                 # Static assets
│
├── config/
│   └── input.yml               # Backend config (secrets, model, URLs)
├── docs/                       # PDF samples + guides
├── notebook/
│   └── Research.ipynb          # Prototyping notebook
├── tests/
│   └── test_api.py             # API tests
├── myenv/                      # Python virtualenv (gitignored)
├── docker-compose.yml          # Placeholder for full-stack orchestration
├── requirements.txt            # Python dependencies
└── setup.py                    # Package metadata
```


---


## Architecture


```
┌─────────────────────────────┐
│      Next.js Dashboard      │
│   (localhost:3000)          │
│                             │
│   Zustand store             │
│   ├─ activeTab              │
│   └─ activeProfileId        │
└──────────────┬──────────────┘
               │ fetch (JSON)
               ▼
┌─────────────────────────────┐
│       FastAPI Backend       │
│    (localhost:8000/api)     │
│                             │
│   /user/       CV + GitHub  │
│   /job/scrape  LinkedIn     │
│   /score/calculate  Match   │
└─────┬───────────┬───────────┘
      │           │
      ▼           ▼
┌───────────┐ ┌──────────┐
│ Groq LLM  │ │ Postgres │
│ + Docling │ │  (SQL)   │
└───────────┘ └──────────┘
```


### Domain flow


```
1. User uploads CV + GitHub URL
   → Docling extracts markdown from PDF
   → Groq LLM structures CV into JSON (skills, education, work_experience)
   → GitHub page fetched and stored as summary
   → Row inserted into user_profiles


2. User enters keywords / location / experience filters
   → JobService scrapes LinkedIn public listings via httpx
   → Each job detail page parsed for description
   → Rows inserted into linkedin_jobs


3. User triggers scoring
   → For every job × profile pair, Groq compares CV vs JD
   → Structured JSON output validated against ScoreCV schema
   → Weighted total_score = 0.4·skill + 0.15·edu + 0.05·work + 0.4·project
   → Rows inserted into match_results
```


---


## API Endpoints


All routes prefixed with `/api`.


| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/user/` | `{ github_url, cv_url }` | `UserResponse` |
| POST | `/job/scrape` | `{ keywords, location_search, page_to_scrape, filter_level }` | `JobResponse[]` |
| POST | `/score/calculate` | *(none — uses first user + all jobs)* | `ScoreResponse[]` |


Interactive docs: `http://localhost:8000/docs`


### `filter_level` values (LinkedIn `f_E` parameter)
`1` = Internship · `2` = Entry · `3` = Associate · `4` = Mid-Senior · `5` = Director · `6` = Executive


Multiple levels can be sent CSV-style: `"1,2,3"`.


---


## Data Model


### `user_profiles`
```
user_id           UUID PK
cv_url            str
github_url        str
cv_markdown       text
cv_structured     jsonb   { skills, education, work_experience, additional_info }
github_summary    text
created_at        timestamp
```


### `linkedin_jobs`
```
job_id            UUID PK
title, company, location, job_url, description
created_at        timestamp
```


### `match_results`
```
match_id          UUID PK
profile_id        FK → user_profiles
job_id            FK → linkedin_jobs
skill_score, education_score, work_experience_score, project_score  float
total_score       float
ai_analysis_details  jsonb  { gap_analysis, actionable_advice, evaluation_summary, project_impact, technical_complexity }
created_at        timestamp
```


---


## Getting Started


### Prerequisites
- **Python 3.11+**
- **Node.js 20+** with **pnpm**
- **PostgreSQL 15+** running locally (or via Docker)
- A **Groq API key** ([console.groq.com](https://console.groq.com))


### 1. Backend setup


```powershell
# From repo root
python -m venv myenv
.\myenv\Scripts\Activate.ps1
pip install -r requirements.txt
```


Edit `config/input.yml` with your credentials:
```yaml
GROQ_API_KEY: sk-...
DB_URL: postgresql://user:pass@localhost:5432/research_job
MODEL_NAME: llama-3.3-70b-versatile
BASE_SEARCH_URL: https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search
DETAIL_SEARCH_URL: https://www.linkedin.com/jobs-guest/jobs/api/jobPosting
```


Run:
```powershell
python -m backend.main
```
The API is available at `http://localhost:8000` and Swagger docs at `/docs`.


### 2. Frontend setup


```powershell
cd frontend
pnpm install
```


Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```


Run:
```powershell
pnpm dev
```
Open `http://localhost:3000`.


### 3. CORS


The backend must allow the frontend origin. In `backend/main.py`:
```python
from fastapi.middleware.cors import CORSMiddleware


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```


---


## User Workflow


1. Open the dashboard → click **Upload CV** in the sidebar.
2. Drop a PDF resume and paste a GitHub URL → **Start research**.
3. Once saved, click **Find matching jobs** on the success card.
4. On the **Job Scraping** page, enter keywords (e.g. *Senior Backend Engineer*), choose location, experience level(s), and page count → **Start scraping**.
5. Click **Start scoring** to rank scraped jobs against your uploaded profile.
6. Results are sorted by `total_score`; badges are color-coded green (≥80), amber (60–79), muted (<60).


---


## Roadmap


### Short term
- [ ] Persist scraped file uploads (multipart endpoint or presigned URL upload).
- [ ] `GET /api/user/`, `GET /api/user/{id}`, `GET /api/score/{profile_id}` for listing views.
- [ ] Wire `CandidatesTable` and `DashboardRightPanel` to real data (currently mock).
- [ ] Batch scoring endpoint to reduce per-job LLM latency.
- [ ] Add `source` field to `JobRequest` for future scrapers.


### Mid term
- [ ] Additional job sources: **Glassdoor**, **Indeed**.
- [ ] Job cache + dedupe by URL.
- [ ] User authentication + multi-tenant isolation.
- [ ] Background job queue (Celery / RQ) for long-running scrape & score.
- [ ] Rate-limit and proxy rotation for scraping.


### Long term
- [ ] Auto-generated `openapi-typescript` types shared between FE/BE.
- [ ] TanStack Query on the frontend for cache + retries.
- [ ] Notifications when new matches appear.
- [ ] Export analysis as PDF report.
- [ ] Docker Compose for one-command spin-up.


---


## Development Notes


- **Do not commit** `config/input.yml` if it contains real secrets — use `.env` or a secrets manager.
- The frontend has **two dashboard implementations** (`app/dashboard/` and `app/(dashboard)/`) — consolidate before releasing.
- `next.config.mjs` has `typescript.ignoreBuildErrors: true` — turn this **off** for production builds.
- Scraping LinkedIn public search is best-effort; behavior may change if selectors update. Log responses on failure.
- Groq JSON-schema mode is used to guarantee valid structured output — do **not** trust free-text LLM output for scores.


---


## License


Private / internal — not yet published.


## Author


Thomas Nguyễn — research prototype.