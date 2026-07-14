export type Candidate = {
  id: string
  name: string
  title: string
  location: string
  avatarInitials: string
  score: number
  skillMatch: number
  experience: number // years
  github: string
  linkedin: string
  topSkills: string[]
  status: "Reviewed" | "Shortlisted" | "Contacted" | "New"
  // AI breakdown (0-100)
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

export const candidates: Candidate[] = [
  {
    id: "c1",
    name: "Ava Thornton",
    title: "Senior Backend Engineer",
    location: "Austin, TX",
    avatarInitials: "AT",
    score: 94,
    skillMatch: 96,
    experience: 8,
    github: "ava-thornton",
    linkedin: "ava-thornton",
    topSkills: ["Go", "Kubernetes", "PostgreSQL", "gRPC"],
    status: "Shortlisted",
    breakdown: { technical: 95, communication: 88, leadership: 90, culture: 86, growth: 92, consistency: 94 },
    certifications: ["AWS Solutions Architect", "CKA - Kubernetes"],
    projects: [
      { name: "Microservice Migration", description: "Led 50+ service migration to Kubernetes", link: "github.com/ava-thornton/k8s-migration" },
      { name: "gRPC Gateway", description: "Built high-performance API gateway", link: "github.com/ava-thornton/grpc-gateway" },
    ],
    companyHistory: [
      { company: "TechCorp", years: 3, role: "Senior Backend Engineer" },
      { company: "CloudInc", years: 3, role: "Backend Engineer" },
      { company: "StartupXYZ", years: 2, role: "Junior Backend Engineer" },
    ],
    interviewStatus: "completed",
    notes: "Strong technical foundation, excellent communication. Ready for lead role.",
    source: "linkedin",
    cultureFit: 92,
    availability: "immediate",
    salaryExpectation: { min: 180000, max: 220000 },
  },
  {
    id: "c2",
    name: "Marcus Lee",
    title: "Staff ML Engineer",
    location: "Seattle, WA",
    avatarInitials: "ML",
    score: 91,
    skillMatch: 89,
    experience: 10,
    github: "marcus-lee",
    linkedin: "marcuslee",
    topSkills: ["PyTorch", "CUDA", "Python", "Distributed"],
    status: "Contacted",
    breakdown: { technical: 96, communication: 82, leadership: 85, culture: 80, growth: 88, consistency: 90 },
    certifications: ["TensorFlow Specialization", "Published 3 papers on distributed training"],
    projects: [
      { name: "GPU-Optimized Training", description: "40% speedup for transformer training", link: "github.com/marcus-lee/gpu-training" },
      { name: "MLOps Pipeline", description: "End-to-end training pipeline at scale", link: "github.com/marcus-lee/mlops" },
    ],
    companyHistory: [
      { company: "AILabs", years: 4, role: "Staff ML Engineer" },
      { company: "DataCo", years: 4, role: "Senior ML Engineer" },
      { company: "ResearchInst", years: 2, role: "ML Researcher" },
    ],
    interviewStatus: "scheduled",
    notes: "Exceptional technical depth. Paper publications strengthen candidacy.",
    source: "github",
    cultureFit: 80,
    availability: "1month",
    salaryExpectation: { min: 220000, max: 280000 },
  },
  {
    id: "c3",
    name: "Priya Nair",
    title: "Full-Stack Engineer",
    location: "Remote",
    avatarInitials: "PN",
    score: 88,
    skillMatch: 90,
    experience: 6,
    github: "priya-nair",
    linkedin: "priyanair",
    topSkills: ["TypeScript", "React", "Node", "AWS"],
    status: "Reviewed",
    breakdown: { technical: 88, communication: 91, leadership: 78, culture: 90, growth: 89, consistency: 85 },
  },
  {
    id: "c4",
    name: "Diego Ramirez",
    title: "Platform Engineer",
    location: "Denver, CO",
    avatarInitials: "DR",
    score: 84,
    skillMatch: 82,
    experience: 7,
    github: "diego-ramirez",
    linkedin: "diegoramirez",
    topSkills: ["Rust", "Terraform", "AWS", "Observability"],
    status: "Reviewed",
    breakdown: { technical: 87, communication: 80, leadership: 82, culture: 84, growth: 83, consistency: 86 },
  },
  {
    id: "c5",
    name: "Sophie Chen",
    title: "Frontend Engineer",
    location: "San Francisco, CA",
    avatarInitials: "SC",
    score: 81,
    skillMatch: 85,
    experience: 5,
    github: "sophie-chen",
    linkedin: "sophiechen",
    topSkills: ["React", "Next.js", "CSS", "Design Systems"],
    status: "New",
    breakdown: { technical: 80, communication: 88, leadership: 72, culture: 86, growth: 84, consistency: 79 },
  },
  {
    id: "c6",
    name: "Jamal Okafor",
    title: "Data Engineer",
    location: "Chicago, IL",
    avatarInitials: "JO",
    score: 78,
    skillMatch: 76,
    experience: 4,
    github: "jamal-okafor",
    linkedin: "jamalokafor",
    topSkills: ["Spark", "Airflow", "Python", "Snowflake"],
    status: "New",
    breakdown: { technical: 79, communication: 75, leadership: 68, culture: 80, growth: 82, consistency: 74 },
  },
  {
    id: "c7",
    name: "Elena Volkov",
    title: "Security Engineer",
    location: "Boston, MA",
    avatarInitials: "EV",
    score: 74,
    skillMatch: 71,
    experience: 6,
    github: "elena-volkov",
    linkedin: "elenavolkov",
    topSkills: ["AppSec", "Go", "Threat Modeling", "SIEM"],
    status: "New",
    breakdown: { technical: 82, communication: 70, leadership: 66, culture: 72, growth: 71, consistency: 76 },
  },
  {
    id: "c8",
    name: "Tom Becker",
    title: "Junior Backend Engineer",
    location: "Remote",
    avatarInitials: "TB",
    score: 66,
    skillMatch: 62,
    experience: 2,
    github: "tom-becker",
    linkedin: "tombecker",
    topSkills: ["Node", "Express", "MongoDB"],
    status: "New",
    breakdown: { technical: 64, communication: 72, leadership: 55, culture: 70, growth: 78, consistency: 60 },
  },
  {
    id: "c9",
    name: "Nina Patel",
    title: "QA Automation Engineer",
    location: "Phoenix, AZ",
    avatarInitials: "NP",
    score: 61,
    skillMatch: 58,
    experience: 3,
    github: "nina-patel",
    linkedin: "ninapatel",
    topSkills: ["Playwright", "TypeScript", "CI/CD"],
    status: "New",
    breakdown: { technical: 60, communication: 74, leadership: 52, culture: 68, growth: 70, consistency: 63 },
  },
]

// AI analysis aggregates for charts.
export const skillCoverage = [
  { skill: "Backend", value: 88, fill: "var(--color-chart-1)" },
  { skill: "Frontend", value: 74, fill: "var(--color-chart-2)" },
  { skill: "Infra / DevOps", value: 81, fill: "var(--color-chart-3)" },
  { skill: "Data / ML", value: 69, fill: "var(--color-chart-4)" },
  { skill: "Security", value: 58, fill: "var(--color-chart-5)" },
]

export const scoreTrend = [
  { week: "W1", avgScore: 68, candidates: 12 },
  { week: "W2", avgScore: 71, candidates: 19 },
  { week: "W3", avgScore: 74, candidates: 24 },
  { week: "W4", avgScore: 77, candidates: 31 },
  { week: "W5", avgScore: 79, candidates: 28 },
  { week: "W6", avgScore: 83, candidates: 35 },
]

export const scoreDistribution = [
  { band: "50-59", count: 6 },
  { band: "60-69", count: 11 },
  { band: "70-79", count: 18 },
  { band: "80-89", count: 14 },
  { band: "90-100", count: 7 },
]

export const competencyRadar = [
  { dimension: "Technical", pool: 84, top: 95 },
  { dimension: "Communication", pool: 79, top: 88 },
  { dimension: "Leadership", pool: 72, top: 90 },
  { dimension: "Culture Fit", pool: 81, top: 86 },
  { dimension: "Growth", pool: 83, top: 92 },
  { dimension: "Consistency", pool: 80, top: 94 },
]
