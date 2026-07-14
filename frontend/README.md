# Talentgraph - AI-Powered Candidate Research Dashboard

![Status](https://img.shields.io/badge/status-complete-brightgreen)
![Next.js](https://img.shields.io/badge/next.js-16-black)
![React](https://img.shields.io/badge/react-19-blue)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-v4-06B6D4)

A modern, full-featured candidate research and scoring dashboard built with Next.js, React, and shadcn/ui. Ingest candidates from LinkedIn, GitHub, and resumes, apply AI-driven scoring, and get intelligent hiring insights.

## ✨ Features

### 🎨 UI/UX
- **Light & Dark Mode**: Complete theme system with persistence
- **Responsive Design**: Desktop-optimized with mobile support
- **Tabbed Navigation**: Overview, Candidates, Intake, AI Report
- **Modern Components**: shadcn/ui (Base UI) with beautiful styling
- **Real-time Updates**: Chart animations and smooth transitions

### 🔍 Candidate Management
- **Data Ingestion**: Resume upload + LinkedIn/GitHub profile links
- **Rich Profiles**: Candidates include certifications, projects, work history
- **Filtering**: Score-based filtering (>70), status filters, search
- **Sorting**: Sortable columns by name, score, skills, status
- **Expandable Details**: Click rows to view full candidate information

### 📊 Analytics & Insights
- **Skill Gap Analysis**: Heatmap showing required vs current skills
- **Culture Fit Distribution**: Visual breakdown of candidate alignment
- **Experience vs Performance**: Scatter plot correlation analysis
- **Score Trends**: Line chart showing pool quality over time
- **AI Recommendations**: Actionable hiring insights with priority levels

### 📋 Advanced Forms
- **Multi-Step Intake**: 4-step candidate profile builder
- **Skill Selection**: Predefined list + custom skill addition
- **Dynamic Ranges**: Experience slider, salary range input
- **Progress Tracking**: Visual step indicator with percentage
- **Validation**: Real-time field validation with error messages

### 🏗️ Architecture & Documentation
- **604-line Backend ML Guide**: Complete scoring pipeline, API endpoints, ML models
- **547-line Frontend Guide**: Component inventory, patterns, state management
- **561-line Architecture Doc**: System design, infrastructure, deployment
- **Mock Data**: 9 enriched candidate profiles for testing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (we use pnpm)
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone or download the project
cd talentgraph

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Build for Production

```bash
pnpm build
pnpm start
```

## 📁 Project Structure

```
app/                          # Next.js app directory
├── layout.tsx               # Root layout with theme provider
├── page.tsx                 # Main dashboard page
└── globals.css              # Design tokens (light/dark)

components/
├── theme-provider.tsx       # Global theme state management
├── dashboard/               # Feature components
│   ├── app-sidebar.tsx      # Navigation sidebar
│   ├── theme-toggle.tsx     # Light/dark mode button
│   ├── profile-intake.tsx   # Basic resume upload form
│   ├── advanced-profile-intake.tsx  # Multi-step form
│   ├── candidates-table.tsx # Searchable data table
│   ├── stat-cards.tsx       # KPI metrics
│   ├── analysis-charts.tsx  # Tabbed chart views
│   └── ai-analysis-report.tsx  # Deep AI insights
└── ui/                      # shadcn/ui components

lib/
├── candidates.ts            # Mock candidate data & types
└── utils.ts                 # Utility functions

Documentation/
├── PROJECT_SUMMARY.md       # Project overview & completion status
├── BACKEND_ML_GUIDE.md      # ML platform architecture & implementation
├── FRONTEND_GUIDE.md        # Frontend patterns & component inventory
└── ARCHITECTURE.md          # Full system architecture
```

## 🎨 Design System

### Colors
**Dark Mode (Default)**
- Primary: `oklch(0.68 0.15 245)` - Bright blue
- Secondary: `oklch(0.27 0.012 256)` - Slate gray
- Background: `oklch(0.17 0.008 256)` - Deep slate
- Foreground: `oklch(0.97 0.004 256)` - Off white

**Light Mode**
- Primary: `oklch(0.55 0.2 245)` - Deeper blue
- Secondary: `oklch(0.94 0.008 256)` - Light gray
- Background: `oklch(0.98 0.001 256)` - Almost white
- Foreground: `oklch(0.15 0.01 256)` - Deep slate

### Typography
- **Sans**: Geist (Google Font)
- **Mono**: Geist Mono
- **Weights**: 400 (regular), 600 (semibold), 700 (bold)

### Components
- Button, Card, Input, Select, Checkbox, Slider, Badge, Avatar, Tabs
- Chart (Recharts wrapper), Table, Sidebar, Progress, Tooltip
- Field, FieldLabel, FieldDescription, FieldError

## 📊 Data Model

### Candidate Type

```typescript
type Candidate = {
  id: string
  name: string
  title: string
  location: string
  experience: number
  score: number (0-100)
  skillMatch: number (0-100)
  
  // Breakdown scores
  breakdown: {
    technical: number
    communication: number
    leadership: number
    culture: number
    growth: number
    consistency: number
  }
  
  // Enhanced fields
  certifications: string[]
  projects: { name: string; description: string; link: string }[]
  companyHistory: { company: string; years: number; role: string }[]
  interviewStatus: "not_started" | "scheduled" | "completed" | "rejected"
  notes: string
  source: "linkedin" | "github" | "referral" | "direct" | "recruiter"
  cultureFit: number
  availability: "immediate" | "2weeks" | "1month" | "negotiable"
  salaryExpectation?: { min: number; max: number }
}
```

## 🔗 API Endpoints (Documented)

See `BACKEND_ML_GUIDE.md` for full implementation details:

- `POST /api/candidates/ingest` - Ingest single candidate
- `POST /api/candidates/batch-ingest` - Bulk import (CSV/JSON)
- `GET /api/candidates` - List all candidates
- `GET /api/candidates/:id` - Get candidate details
- `GET /api/candidates/:id/score` - Get scoring result (cached)
- `GET /api/insights/pool-analysis` - Aggregated pool metrics
- `GET /api/insights/recommendations` - AI hiring recommendations

## 🎯 Key Screens

### Overview Dashboard
- **4 KPI Cards**: Profiles researched, Qualified (>70), Average score, In outreach
- **Profile Intake**: Resume + LinkedIn/GitHub inputs
- **AI Analysis Charts**: Tabs for skills, trends, distribution, competencies

### Candidates Tab
- **Searchable Table**: Filter by name, skills, status
- **Score Badges**: Color-coded (red <60, amber 60-80, green >80)
- **Quick Links**: GitHub and LinkedIn profile buttons
- **Row Details**: Click to expand full candidate information

### Profile Intake Tab
- **Step 1**: Basic info (name, email, job level)
- **Step 2**: Skills (select or add custom, experience slider)
- **Step 3**: Preferences (availability, relocation, salary range)
- **Step 4**: Review & submit with progress tracking

### AI Report Tab
- **Key Metrics**: 4 cards with trend indicators
- **Skill Gaps**: Required vs current pool heatmap
- **Culture Fit**: Distribution chart by alignment level
- **Experience vs Score**: Scatter plot correlation
- **Recommendations**: High/medium priority action items

## 🛠️ Technology Stack

| Layer | Tech |
|-------|------|
| **Frontend** | Next.js 16, React 19 |
| **UI Framework** | shadcn/ui (Base UI) |
| **Styling** | Tailwind CSS v4 |
| **State Management** | React Context, Hooks, SWR |
| **Charts** | Recharts (shadcn wrapper) |
| **Icons** | lucide-react |
| **Forms** | HTML5, shadcn Fields |
| **Notifications** | sonner |
| **Fonts** | Google Fonts (Geist) |

## 🚀 Deployment

### Vercel (Recommended)

```bash
# One-click deploy
vercel deploy

# Or push to GitHub and connect Vercel project
git push origin main
```

### Docker

```bash
docker build -t talentgraph .
docker run -p 3000:3000 talentgraph
```

### Manual

```bash
pnpm build
pnpm start
```

## 📚 Documentation

- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Overview of all features (330 lines)
- **[BACKEND_ML_GUIDE.md](./BACKEND_ML_GUIDE.md)** - ML platform & API architecture (604 lines)
- **[FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md)** - Frontend patterns & components (547 lines)
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Full system architecture (561 lines)

## 🎓 Key Patterns

### Theme Toggle
```tsx
import { useContext } from 'react'
import { ThemeContext } from '@/components/theme-provider'

function MyComponent() {
  const { theme, toggleTheme } = useContext(ThemeContext)
  return <button onClick={toggleTheme}>{theme}</button>
}
```

### Data Fetching (Future with SWR)
```tsx
import useSWR from 'swr'

function Candidates() {
  const { data, isLoading } = useSWR('/api/candidates', fetcher)
  return isLoading ? <Skeleton /> : <CandidatesTable data={data} />
}
```

### Responsive Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Content */}
</div>
```

## 🤝 Contributing

1. Clone the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 🙌 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Styling with [Tailwind CSS](https://tailwindcss.com)
- Charts by [Recharts](https://recharts.org)
- Icons from [lucide-react](https://lucide.dev)
- Hosted on [Vercel](https://vercel.com)

---

**Version**: 1.0.0  
**Last Updated**: Q1 2025  
**Status**: Production Ready ✅
