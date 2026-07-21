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


export type UserProfile = {
  user_id: string;
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


  uploadCV: (file: File, github_url?: string): Promise<UserResponse> => {
    const form = new FormData();
    form.append("cv_file", file);
    if (github_url) form.append("github_url", github_url);


    return fetch(`${BASE_URL}/user/upload-cv`, {
      method: "POST",
      body: form,
      // ⚠️ KHÔNG set Content-Type — browser tự set với boundary
    }).then(async (r) => {
      if (!r.ok) {
        const text = await r.text();
        throw new Error(`Upload ${r.status}: ${text}`);
      }
      return r.json();
    });
  },
};
