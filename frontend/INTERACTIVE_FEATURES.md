# Interactive Dashboard Features - Complete Guide

## Overview

The Talentgraph dashboard is now fully interactive with page-based navigation. Each sidebar menu item links to a dedicated full-screen page where you can interact with all features.

## Navigation Structure

### Sidebar Routes

The sidebar (`app/(dashboard)`) contains the main navigation:

| Menu Item | Route | Description |
|-----------|-------|-------------|
| **Overview** | `/dashboard` | KPI cards, profile intake form, and AI analysis charts |
| **Candidates** | `/dashboard/candidates` | Full-screen candidates table with detail panel |
| **Profile Intake** | `/dashboard/profile-intake` | Multi-step form for candidate submission |
| **AI Analysis** | `/dashboard/ai-analysis` | Deep ML insights and analytics |
| **Reports** | `/dashboard/reports` | Comprehensive recruiting metrics |

### Pipelines Section

Quick access to hiring pipelines:
- Backend Squad (24 candidates)
- ML Platform (16 candidates)
- Frontend Guild (11 candidates)

## Page-by-Page Features

### 1. Dashboard Overview (`/dashboard` or `/`)

**Purpose:** Central hub with key metrics and quick actions

**Features:**
- **4 KPI Cards**: Profiles researched, Qualified candidates, Average AI score, In outreach
- **Profile Intake Card**: Quick resume upload and LinkedIn profile linking
- **AI Analysis Charts**: Score trends, distribution, competencies, skill coverage
- **Responsive Grid**: Adapts from mobile (full width) to desktop (3-column layout)

**Interactions:**
- Upload PDF resume for processing
- Input LinkedIn/GitHub profiles
- Start automated research with "Start research" button
- View real-time charts with tabbed analysis

---

### 2. Candidates Page (`/candidates`)

**Purpose:** Browse and interact with candidate profiles

**Features:**
- **Candidate Rankings Table**:
  - 9 qualified candidates (score > 70)
  - Columns: Candidate name, skills, match %, experience, AI score, status, links
  - Searchable by name, role, skills
  - Score > 70 filter enabled by default
  - Sortable by score, skill match, experience
  
- **Interactive Candidate Detail Panel** (Right Sidebar):
  - Appears when you click any candidate row
  - **Profile Tab**:
    - Match percentage and interview status badges
    - Location, experience, source origin
    - GitHub/LinkedIn quick links
    - Top skills as badges
    - Availability and salary expectations
    - Notes section
  
  - **Experience Tab**:
    - Certifications list (e.g., AWS Solutions Architect, CKA)
    - Key projects with descriptions and links
    - Company history with years and roles
  
  - **Analysis Tab**:
    - Scoring breakdown (Technical, Communication, Leadership, Culture, Growth, Consistency)
    - Progress bars for each dimension
    - Culture fit and skill match percentages
    - AI recommendation reasoning

**Interactions:**
- Click any candidate row to view full details in side panel
- Close panel with X button or clicking elsewhere
- Switch between Profile, Experience, Analysis tabs
- Click GitHub/LinkedIn buttons to view profiles
- Search and filter candidates by score

---

### 3. Profile Intake Page (`/profile-intake`)

**Purpose:** Submit new candidate profiles with comprehensive information

**Features:**
- **4-Step Multi-Step Form** (25% completion per step):
  
  **Step 1: Basic Information**
  - Candidate name (required)
  - Email address (required)
  - Job level selector (Junior, Mid, Senior, Lead, Staff)
  
  **Step 2: Skills & Experience**
  - Skill selection from 12+ preset options
  - Custom skill add capability
  - Experience slider (0-30+ years)
  - Difficulty assessment (Self-reported or AI-analyzed)
  
  **Step 3: Preferences**
  - Availability (Immediate, 2 weeks, 1 month, Negotiable)
  - Relocation preference (checkbox)
  - Salary range (min/max input)
  - Work arrangement preference (Remote, Hybrid, On-site)
  
  **Step 4: Review**
  - Summary of all entered information
  - Edit previous steps if needed
  - Confirm and submit

- **Progress Indicator**: Visual progress bar showing form completion
- **Navigation**: Previous/Next buttons with form validation
- **Responsive Design**: Works on mobile, tablet, desktop

**Interactions:**
- Fill form step by step
- Navigate between steps with Previous/Next buttons
- See real-time validation feedback
- Review all information before submission
- Edit steps without losing data

---

### 4. AI Analysis Page (`/ai-analysis`)

**Purpose:** Deep ML-powered insights on candidate pool

**Features:**
- **KPI Section**: Profiles researched, Qualified, Average score, In outreach
- **Two-Column Layout**:
  
  **Left Column - Scoring Charts**:
  - **Score Trend**: Line chart showing average AI scores over 6 weeks (80-100 range)
  - **Distribution**: Candidate distribution by score ranges
  - **Competencies**: Breakdown of technical competencies
  - **Skill Coverage**: By top required skills
  
  **Right Column - AI Insights**:
  - **Skill Gap Analysis**: Required vs Current for System Design, TypeScript, React Patterns, Databases, AWS
  - **Culture Fit Distribution**: 4 levels (Exceptional, Strong, Good, Needs Work)
  - **Experience vs Performance**: Scatter plot correlation
  
- **AI Recommendations Section**:
  - **Fast Track Interview** (High priority): 5 candidates score >85
  - **Skill Gap Training** (Medium): System Design scores 30pts below requirement
  - **Diversity Opportunity** (Medium): Underrepresented backgrounds in current pool
  
- **AI Insights Summary**:
  - Pool Quality: 75th percentile vs industry
  - Trend Analysis: 2-3pts weekly improvement, ML candidate trending highest
  - Diversity Metrics: Geographic and background diversity analysis

**Interactions:**
- View multiple chart types with tab switching
- Hover over charts for detailed values
- Read actionable AI recommendations
- Understand hiring trends and patterns

---

### 5. Reports Page (`/reports`)

**Purpose:** Comprehensive recruiting metrics and performance tracking

**Features:**
- **4 KPI Cards with Trends**:
  - Total Candidates: 247 (+12%)
  - Conversion Rate: 18.2% (+5%)
  - Avg Time to Hire: 9 days (-2d)
  - Success Rate: 92.3% (+8%)

- **3 Tabbed Report Views**:
  
  **Tab 1: Hiring Pipeline**
  - Bar chart: Shortlisted, Interviewed, Hired over 6 months
  - Trend analysis and pipeline flow
  
  **Tab 2: Candidate Sources**
  - Donut/Pie chart: LinkedIn (45%), GitHub (28%), Referral (18%), Direct (9%)
  - Source effectiveness visualization
  
  **Tab 3: Time to Hire**
  - Line chart: Weekly average time to hire improvement (14 → 9 days)
  - Shows optimization over time

**Interactions:**
- Switch between pipeline, sources, and timeline tabs
- Hover on charts for exact values
- Analyze recruiting performance trends
- Identify top-performing recruitment channels

---

## Interactive Components Guide

### Candidate Detail Panel

When you click a candidate row on the `/candidates` page:

1. **Right side panel slides in** (width: 320px on desktop)
2. **Shows 3 tabs**: Profile, Experience, Analysis
3. **Sticky header** with candidate name and close button
4. **ScrollArea** for long content within each tab
5. **Click X** or click outside to close

**Profile Tab Layout:**
```
[Close X]
Name | Job Title
─────────────────
Profile | Experience | Analysis
─────────────────
[Match Badge] [Status Badge]
[Source Badge]
[GitHub] [LinkedIn] buttons
Top Skills (badges)
Availability details
Salary range
Notes
```

**Experience Tab Layout:**
```
[Certifications]
- AWS Solutions Architect
- CKA - Kubernetes

[Key Projects]
- Project Name
  Description
  [View Link]

[Company History]
- Role @ Company (Years)
```

**Analysis Tab Layout:**
```
[Scoring Breakdown]
Technical: 95%
Communication: 88%
Leadership: 90%
Culture: 86%
Growth: 92%
Consistency: 94%

[Culture & Skills]
Culture Fit: 92%
Skill Match: 96%

[Recommendation]
[Reasoning text]
```

---

## Theme Support

### Light & Dark Mode

- **Toggle Button**: In sidebar footer
- **Persistent**: Saved to localStorage
- **Automatic**: Uses system preference if not explicitly set
- **All Pages**: Consistently themed across all routes

**Theme Features:**
- Light mode: Clean, professional appearance
- Dark mode: Reduced eye strain, modern aesthetic
- Smooth transitions between themes
- Proper contrast ratios for accessibility

---

## Responsive Behavior

### Desktop (>1200px)
- Sidebar visible: 240px width
- Content area: Full remaining width
- Detail panel: 320px right sidebar on candidates page

### Tablet (768px - 1200px)
- Sidebar collapsible with hamburger menu
- Content responsive to screen width
- Detail panel: Full modal or drawer behavior

### Mobile (<768px)
- Sidebar drawer overlay
- Detail panels: Full screen or modal
- Tables: Horizontal scroll or card view
- Charts: Responsive sizing

---

## Keyboard Navigation

### Global Shortcuts
- **Sidebar**: Always accessible with hamburger menu
- **Tab Navigation**: All interactive elements tabbable
- **Enter**: Submit forms or activate buttons
- **Escape**: Close modals and detail panels

### Table Navigation
- **Arrow Keys**: Navigate candidate rows (when implemented)
- **Enter**: Open detail panel
- **Escape**: Close detail panel

---

## Data Flow

```
App Layout (dashboard)
├── Sidebar (persistent navigation)
├── Header (breadcrumbs + controls)
└── Page Content
    ├── /dashboard (overview)
    ├── /candidates (table + detail panel)
    ├── /profile-intake (multi-step form)
    ├── /ai-analysis (charts + insights)
    └── /reports (metrics + tabs)
```

### State Management

- **Selected Candidate**: React state in CandidatesPage
- **Form State**: React state in AdvancedProfileIntake
- **Theme State**: React Context (ThemeProvider)
- **Navigation**: Next.js App Router (automatic)

---

## Architecture Files

- **Routes**: `app/(dashboard)/` folder structure
- **Components**: Reusable UI in `components/dashboard/`
- **Data**: Mock candidates in `lib/candidates.ts`
- **Styling**: Design tokens in `app/globals.css`

---

## Next Steps for Enhancement

1. **API Integration**: Connect to real backend for candidate data
2. **Real Authentication**: Implement user sessions
3. **Database**: Persist form submissions to database
4. **Advanced Filtering**: Add more filter options to candidates table
5. **Export**: Add CSV/PDF export for reports
6. **Notifications**: Real-time updates when new candidates added
7. **Permissions**: Role-based access control
8. **Audit Logs**: Track all user interactions

