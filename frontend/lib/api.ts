const BASE_URL = "http://localhost:8000/api";


async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}


export type UserRequest = { github_url?: string; cv_url?: string };
export type UserResponse = {
  user_id: string;
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


export type UserProfile = {
  user_id: string;
  cv_url?: string;
  github_url?: string;
  cv_markdown?: string;
  cv_structured?: {
    skills?: string[];
    education?: string[];
    work_experience?: string[];
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
    gap_analysis?: string[];
    actionable_advice?: string[];
    evaluation_summary?: string;
    project_impact?: string[];
    technical_complexity?: string[];
  };
  created_at?: string;
};


export const api = {
  submitUser: (body: UserRequest) =>
    request<UserResponse>("/user/", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  listUsers: () => request<UserProfile[]>("/user/"),


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
};