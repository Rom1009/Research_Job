# Frontend Architecture & Implementation Guide

## Project Overview

**Talentgraph** is a modern job candidate research dashboard built with Next.js 16, React 19, Tailwind CSS v4, and shadcn/ui (Base UI variant).

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **UI Library**: shadcn/ui (nova preset, Base UI)
- **Styling**: Tailwind CSS v4
- **State Management**: React Hooks + Context API, SWR for data fetching
- **Icons**: lucide-react v1.17+
- **Toast Notifications**: sonner
- **Form Handling**: HTML5 + shadcn fields

---

## Project Structure

```
app/
├── layout.tsx              # Root layout with theme provider
├── page.tsx                # Dashboard main page
└── globals.css             # Theme tokens (light/dark mode)

components/
├── theme-provider.tsx      # Theme toggle context & logic
├── ui/                     # shadcn/ui components (generated)
│   ├── button.tsx
│   ├── card.tsx
│   ├── table.tsx
│   ├── chart.tsx
│   ├── tabs.tsx
│   ├── sidebar.tsx
│   ├── input.tsx
│   ├── slider.tsx
│   ├── progress.tsx
│   ├── badge.tsx
│   ├── field.tsx
│   ├── checkbox.tsx
│   ├── select.tsx
│   ├── skeleton.tsx
│   ├── tooltip.tsx
│   ├── avatar.tsx
│   └── sonner.tsx
│
└── dashboard/              # Feature components
    ├── app-sidebar.tsx     # Main navigation sidebar
    ├── theme-toggle.tsx    # Light/dark mode toggle button
    ├── brand-icons.tsx     # GitHub & LinkedIn SVG icons
    ├── profile-intake.tsx  # Basic profile upload form
    ├── advanced-profile-intake.tsx  # Multi-step intake form
    ├── candidates-table.tsx # Data table with filtering
    ├── stat-cards.tsx      # KPI cards (4-column layout)
    ├── analysis-charts.tsx  # Chart components (tabs)
    └── ai-analysis-report.tsx  # Deep AI insights

lib/
├── candidates.ts           # Mock candidate data & types
└── utils.ts               # Utility functions (cn, etc)

public/
└── [static assets]
```

---

## Component Inventory

### Layout Components

#### `app-sidebar.tsx`
- **Purpose**: Main navigation and user profile
- **Features**:
  - Research section (Overview, Candidates, Profile Intake, AI Analysis, Reports)
  - Pipelines section (Backend Squad, ML Platform, Frontend Guild)
  - Settings & Support
  - User profile footer with theme toggle
- **Props**: None (self-contained)
- **Dependencies**: Sidebar (shadcn), Avatar, ThemeToggle

```tsx
<AppSidebar />
```

#### `theme-provider.tsx`
- **Purpose**: Global theme state management
- **Features**:
  - Reads from localStorage
  - Respects system preference
  - Applies class to html element
- **Context Export**: `ThemeContext`
- **Usage**: Wrap root layout children

```tsx
<ThemeProvider>
  {children}
</ThemeProvider>
```

#### `theme-toggle.tsx`
- **Purpose**: Sun/Moon button to switch themes
- **Features**: Reads from ThemeContext, shows appropriate icon
- **Usage**: Place in sidebar footer

```tsx
<ThemeToggle />
```

---

### Profile Intake Components

#### `profile-intake.tsx` (Basic)
- **Purpose**: Simple resume upload + LinkedIn link
- **Features**:
  - PDF file upload
  - LinkedIn URL input with validation
  - Loading spinner for "Start research"
  - Success/error toast notifications
- **Props**: None
- **State**: Local (file, linkedinUrl, isLoading)

```tsx
<ProfileIntake />
```

#### `advanced-profile-intake.tsx` (Multi-step)
- **Purpose**: Comprehensive 4-step candidate profile builder
- **Features**:
  - Step 1: Basic info (name, email, job level)
  - Step 2: Skills (select from list or add custom)
  - Step 3: Preferences (availability, relocation, salary range)
  - Step 4: Review & submit
  - Progress bar and step indicator
- **Props**: None
- **State**: Manages form data, current step
- **Validation**: Required fields on submit

```tsx
<AdvancedProfileIntake />
```

---

### Data Display Components

#### `candidates-table.tsx`
- **Purpose**: Display filtered candidates with score > 70
- **Features**:
  - Sortable columns (name, score, skills, status)
  - Search input (real-time filtering)
  - Status filter dropdown
  - Score badges (color coded)
  - GitHub/LinkedIn icon buttons
  - Expandable details row (on click)
  - Responsive (scrollable on mobile)
- **Props**: None
- **State**: Local search, filter, expanded row

```tsx
<CandidatesTable />
```

#### `stat-cards.tsx`
- **Purpose**: KPI metrics display (4-column grid)
- **Features**:
  - Average Score
  - Top Candidates (>85)
  - Culture Fit Avg
  - Ready Now (Immediate)
  - Shows trends (green up/down indicators)
- **Props**: None
- **Data**: Hardcoded from mock data

```tsx
<StatCards />
```

---

### Chart & Analytics Components

#### `analysis-charts.tsx`
- **Purpose**: Interactive AI analysis with tabbed views
- **Features**:
  - Skill Coverage Bar Chart
  - Score Trend Line Chart
  - Score Distribution Histogram
  - Competency Radar Chart
- **Tabs**:
  1. Skills
  2. Trends
  3. Distribution
  4. Radar
- **Props**: None
- **Dependencies**: Recharts, Chart (shadcn wrapper)

```tsx
<AnalysisCharts />
```

#### `ai-analysis-report.tsx`
- **Purpose**: Comprehensive AI-driven insights
- **Features**:
  - Key metrics (4 cards)
  - Skill gap analysis with progress bars
  - Culture fit distribution
  - Experience vs Score scatter plot
  - AI recommendations (high/medium priority)
  - AI insights summary (pool quality, trends, diversity)
- **Props**: None
- **Dependencies**: Recharts, icons

```tsx
<AIAnalysisReport />
```

---

## Data Flow

### Candidate Data Structure

```typescript
type Candidate = {
  id: string
  name: string
  title: string
  location: string
  avatarInitials: string
  score: number
  skillMatch: number
  experience: number
  github: string
  linkedin: string
  topSkills: string[]
  status: 'Reviewed' | 'Shortlisted' | 'Contacted' | 'New'
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
  interviewStatus: 'not_started' | 'scheduled' | 'completed' | 'rejected'
  notes: string
  source: 'linkedin' | 'github' | 'referral' | 'direct' | 'recruiter'
  cultureFit: number
  availability: 'immediate' | '2weeks' | '1month' | 'negotiable'
  salaryExpectation?: { min: number; max: number }
}
```

### Data Sources

1. **Mock Data**: `lib/candidates.ts`
   - 9 candidate profiles
   - Skill coverage aggregates
   - Score trends
   - Competency metrics

2. **Real API** (Future):
   - `/api/candidates` - List all
   - `/api/candidates/:id` - Get single
   - `/api/candidates/ingest` - Add new
   - `/api/insights/pool-analysis` - Aggregates

---

## State Management Pattern

### Theme State (Global)

```tsx
// ThemeContext provides theme + toggleTheme
const { theme, toggleTheme } = useContext(ThemeContext)
```

### Component-Level State (Local)

```tsx
// Form inputs
const [name, setName] = useState('')
const [skills, setSkills] = useState<string[]>([])

// Search/Filter
const [searchTerm, setSearchTerm] = useState('')
const [filterStatus, setFilterStatus] = useState('All')

// UI State
const [expandedRow, setExpandedRow] = useState<string | null>(null)
const [currentStep, setCurrentStep] = useState<Step>('basic')
```

### Data Fetching (Future with SWR)

```tsx
import useSWR from 'swr'

function CandidatesList() {
  const { data: candidates, isLoading } = useSWR(
    '/api/candidates',
    fetcher,
    { revalidateOnFocus: false }
  )
  
  if (isLoading) return <Skeleton />
  return <CandidatesTable candidates={candidates} />
}
```

---

## Styling System

### Design Tokens (Dark Mode)

```css
:root {
  --background: oklch(0.17 0.008 256);         /* Deep slate */
  --foreground: oklch(0.97 0.004 256);         /* Off white */
  --primary: oklch(0.68 0.15 245);             /* Bright blue */
  --secondary: oklch(0.27 0.012 256);          /* Slate-700 */
  --accent: oklch(0.3 0.02 245);               /* Softer blue */
  --muted: oklch(0.27 0.012 256);              /* Muted gray */
  --destructive: oklch(0.62 0.2 25);           /* Red */
  --border: oklch(1 0 0 / 9%);                 /* Subtle white/9% */
  --radius: 0.7rem;
}

.light {
  --background: oklch(0.98 0.001 256);         /* Almost white */
  --foreground: oklch(0.15 0.01 256);          /* Deep slate */
  --primary: oklch(0.55 0.2 245);              /* Deeper blue */
  --secondary: oklch(0.94 0.008 256);          /* Light gray */
  --accent: oklch(0.92 0.01 245);              /* Light blue */
  /* ... etc */
}
```

### Utility Classes (Tailwind v4)

```tsx
// Flexbox layouts
<div className="flex items-center justify-between gap-4">

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

// Text styling
<p className="text-sm font-medium text-muted-foreground">

// Backgrounds
<Card className="bg-card border border-border">

// Spacing
<div className="p-4 space-y-2">
```

---

## Theme Implementation

### Color Scheme Toggle

1. **HTML Root Class**: `class="dark"` or `class="light"`
2. **Stored Preference**: `localStorage.theme`
3. **System Preference**: `prefers-color-scheme`
4. **CSS Variables**: Automatically switch via `:root` and `.light` / `.dark`

### Adding New Colors

Edit `app/globals.css` and update both `:root` and `.light`:

```css
:root {
  --my-new-color: oklch(0.68 0.15 245);
}

.light {
  --my-new-color: oklch(0.55 0.2 245);
}

@theme inline {
  --color-my-new-color: var(--my-new-color);
}
```

Then use: `className="bg-my-new-color"`

---

## Common Patterns

### Form Layout (shadcn Field)

```tsx
<FieldGroup className="space-y-4">
  <Field>
    <FieldLabel htmlFor="name">Full Name *</FieldLabel>
    <Input id="name" value={name} onChange={e => setName(e.target.value)} />
    <FieldError>Required field</FieldError>
  </Field>
</FieldGroup>
```

### Data Table with Sorting

```tsx
const [sortBy, setSortBy] = useState<'score' | 'name'>('score')
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

const sorted = candidates.sort((a, b) => {
  const aVal = a[sortBy]
  const bVal = b[sortBy]
  return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
})
```

### Conditional Rendering

```tsx
{isLoading ? (
  <Skeleton />
) : candidates.length > 0 ? (
  <CandidatesTable candidates={candidates} />
) : (
  <Empty title="No candidates" description="Upload resumes to get started" />
)}
```

### Toast Notifications

```tsx
import { toast } from 'sonner'

// Success
toast.success('Profile uploaded successfully!')

// Error
toast.error('Failed to upload. Please try again.')

// Custom
toast('Custom message', { description: 'Subtitle' })
```

---

## Performance Optimization

### 1. Component Splitting
- Keep heavy components (charts, tables) lazy-loadable
- Use React.memo for list items

```tsx
const CandidateRow = React.memo(({ candidate }: Props) => (
  // Row content
))
```

### 2. Image Optimization
- Use Next.js `Image` component (if needed)
- Lazy load charts when visible

```tsx
<ChartContainer config={config}>
  <ResponsiveContainer>
    {/* Recharts renders only on viewport */}
  </ResponsiveContainer>
</ChartContainer>
```

### 3. Data Fetching with SWR
- Automatic revalidation & caching
- Deduplication across components

```tsx
const { data, isLoading, error } = useSWR('/api/candidates')
```

### 4. CSS-in-JS Avoidance
- Use Tailwind @apply for shared styles
- Define reusable component styles once

---

## Accessibility

### ARIA Labels
```tsx
<Button aria-label="Toggle dark mode">
  <Sun />
</Button>
```

### Semantic HTML
```tsx
<main className="flex-1">
  <section className="mb-8">
    <h1 className="text-3xl font-bold">Candidate Rankings</h1>
  </section>
</main>
```

### Color Contrast
- All text meets WCAG AA standards (4.5:1 ratio)
- Icons have text labels or aria-label
- Form errors indicated by color + text

---

## Deployment

### Build
```bash
npm run build
```

### Environment Variables
```env
NEXT_PUBLIC_API_URL=https://api.talentgraph.com
```

### Vercel Deployment
```bash
vercel deploy
```

---

## Future Enhancements

- [ ] Real-time scoring updates via WebSocket
- [ ] Advanced filtering (multi-select, date ranges)
- [ ] Candidate detail modal
- [ ] Export reports (PDF)
- [ ] Interview scheduling integration
- [ ] Team collaboration features
- [ ] Custom scoring rules
- [ ] Batch operations (bulk actions)
