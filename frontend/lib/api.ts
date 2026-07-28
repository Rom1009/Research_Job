const BASE_URL = "http://localhost:8000/api";
const TOKEN_KEY = "talentgraph:token";


export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}


export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}


async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;


  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 401) setAuthToken(null);
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}


export type UserRequest = { github_url?: string; cv_url?: string };
export type UserResponse = {
  candidate_id: string;
  cv_markdown?: string;
  github_summary?: string;
};


export type JobRequest = {
  keywords?: string;
  location_search?: string;
  page_to_scrape?: number;
  filter_level?: string;
};
export type JobResponse = {
  job_id: string;
  title?: string;
  company?: string;
  location?: string;
  job_url?: string;
  description?: string;
};


export type ScoreRequest = { profile_id: string };
export type ScoreResponse = {
  match_id: string;
  job_id: string;
  profile_id: string;
  total_score?: number;
  ai_analysis_details?: Record<string, unknown>;
};


export type EducationItem = {
  institution?: string;
  degree?: string;
  location?: string;
  period?: string;
  coursework?: string;
  gpa?: string;
};


export type WorkExperienceItem = {
  company?: string;
  title?: string;
  location?: string;
  period?: string;
  achievements?: string[];
};


export type ProjectItem = {
  name?: string;
  technologies?: string[];
  period?: string;
  description?: string[];
};


export type CandidateProfile = {
  candidate_id: string;
  cv_url?: string;
  github_url?: string;
  cv_markdown?: string;
  cv_structured?: {
    skills?: string[];
    education?: EducationItem[];
    work_experience?: WorkExperienceItem[];
    project?: ProjectItem[];
    additional_info?: string[];
  };
  github_summary?: string;
  created_at?: string;
};


export type MatchResult = {
  match_id: string;
  profile_id: string;
  job_id: string;
  skill_score?: number;
  education_score?: number;
  work_experience_score?: number;
  project_score?: number;
  total_score?: number;
  ai_analysis_details?: {
    matched_skills?: string[];
    gap_analysis?: string[];
    actionable_advice?: string[];
    evaluation_summary?: string;
    project_impact?: string[];
    technical_complexity?: string[];
  };
  job_title?: string;
  job_company?: string;
  job_location?: string;
  job_url?: string; // ← THÊM
  created_at?: string;
};


// ---- Auth API ----
export type AuthUserApi = {
  user_id: string;
  email: string;
  full_name?: string;
  role: string;
};


export type TokenResponse = {
  access_token: string;
  token_type: string;
  user: AuthUserApi;
};


// frontend/lib/api.ts (thêm vào cuối phần types)


export type GithubProfileData = {
  profile: {
    profile: {
      login: string;
      name?: string;
      bio?: string;
      avatar_url?: string;
      company?: string | null;
      location?: string | null;
      website?: string | null;
      followers: number;
      following: number;
      created_at: string;
      orgs?: string[];
    };
    top_repos: Array<{
      name: string;
      full_name: string;
      description?: string | null;
      url: string;
      stars: number;
      forks: number;
      primary_language?: string | null;
      pushed_at: string;
      readme?: string | null;
    }>;
    top_languages: Array<{ name: string; percent: number; bytes: number }>;
    contributions: {
      total_commits: number;
      total_prs: number;
      total_reviews: number;
      total_issues: number;
      total_repos_contributed: number;
      calendar_total: number;
      top_contributed_repos: Array<{
        full_name: string;
        url: string;
        stars: number;
        language?: string;
        commits: number;
      }>;
    };
  };
  summary: {
    primary_tech_stack: string[];
    seniority_estimate: "junior" | "mid" | "senior" | string;
    seniority_reasoning: string;
    domains: string[];
    notable_projects: Array<{ name: string; why: string }>;
    open_source_engagement: "low" | "medium" | "high" | string;
    activity_level: "inactive" | "moderate" | "active" | string;
    red_flags: string[];
    strengths: string[];
  };
};


export function parseGithubSummary(
  raw?: string | null,
): GithubProfileData | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.error) return null;
    return parsed as GithubProfileData;
  } catch {
    return null;
  }
}


export const authApi = {
  register: (email: string, password: string, full_name?: string) =>
    request<TokenResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name }),
    }),


  login: (email: string, password: string) =>
    request<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),


  me: () => request<AuthUserApi>("/auth/me"),


  changePassword: (current_password: string, new_password: string) =>
    request<{ message: string }>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ current_password, new_password }),
    }),
};


export const jobApi = {
  list: () => request<JobResponse[]>("/job/"),
  get: (jobId: string) => request<JobResponse>(`/job/${jobId}`),
  scrape: (payload: JobRequest) =>
    request<JobResponse[]>("/job/scrape", {
      method: "POST",
      body: JSON.stringify(payload),
    }),


  // trong jobApi:
  getAction: (jobId: string) =>
    request<JobAction | null>(`/job/${jobId}/action`),


  updateAction: (jobId: string, patch: Partial<JobAction>) =>
    request<JobAction>(`/job/${jobId}/action`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),


  listActions: (savedOnly = false) =>
    request<JobAction[]>(`/job/actions/?saved_only=${savedOnly}`),


  deleteAction: (jobId: string) =>
    request<{ deleted: boolean }>(`/job/${jobId}/action`, {
      method: "DELETE",
    }),


  clearAll: () =>
    request<{
      deleted: number;
      scores_deleted: number;
      actions_deleted: number;
    }>("/job/clear-all", { method: "DELETE" }),
};


export type JobAction = {
  id: string;
  job_id: string;
  saved: boolean;
  hidden: boolean;
  apply_status:
    | "not_applied"
    | "applied"
    | "interviewed"
    | "offered"
    | "rejected";
  notes?: string;
  updated_at: string;
};


export const api = {
  submitUser: (body: UserRequest) =>
    request<UserResponse>("/user/", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  listUsers: () => request<CandidateProfile[]>("/user/"),


  scrapeJobs: (body: JobRequest) =>
    request<JobResponse[]>("/job/scrape", {
      method: "POST",
      body: JSON.stringify(body),
    }),


  listScores: () => request<MatchResult[]>("/score/"),
  getUserScores: (profileId: string) =>
    request<MatchResult[]>(`/score/${profileId}`),


  calcScore: (body: ScoreRequest) =>
    request<ScoreResponse[]>("/score/calculate", {
      method: "POST",
      body: JSON.stringify(body),
    }),


  updateGithub: (profileId: string, github_url: string) =>
    request<UserResponse>(`/user/${profileId}/github`, {
      method: "PATCH",
      body: JSON.stringify({ github_url }),
    }),


  uploadCV: (file: File, github_url?: string): Promise<UserResponse> => {
    const form = new FormData();
    form.append("cv_file", file);
    if (github_url) form.append("github_url", github_url);


    const token = getAuthToken(); // ← THÊM
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`; // ← THÊM
    // ⚠️ KHÔNG set Content-Type — browser tự set với boundary


    return fetch(`${BASE_URL}/user/upload-cv`, {
      method: "POST",
      headers, // ← THÊM
      body: form,
    }).then(async (r) => {
      if (!r.ok) {
        if (r.status === 401) setAuthToken(null); // ← auto logout
        const text = await r.text();
        throw new Error(`Upload ${r.status}: ${text}`);
      }
      return r.json();
    });
  },
};



