"use client";


import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CandidateProfile, JobResponse } from "@/lib/api";


type TabType = "overview" | "candidates" | "intake" | "analysis" | "jobs";


type Source = "linkedin" | "glassdoor" | "indeed";
type AccentColor = "blue" | "purple" | "green" | "orange";


interface JobScrapingState {
  // Form state — PERSISTED
  source: Source;
  keywords: string;
  location: string;
  levels: string[];
  page: number;


  // Server data — NOT persisted (luôn refetch)
  jobs: JobResponse[];
  scores: Record<string, number>;


  // Async flags — NOT persisted
  scoringInProgress: boolean;
  scoringStartedAt?: number;
}


interface DashboardStore {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;


  // My profile — global reactive state
  myProfile: CandidateProfile | null;
  profileLoaded: boolean;
  setMyProfile: (p: CandidateProfile | null) => void;


  jobScraping: JobScrapingState;
  setJobScraping: (patch: Partial<JobScrapingState>) => void;
  resetJobScraping: () => void;
  accentColor: AccentColor;
  setAccentColor: (c: AccentColor) => void;
  fontSize: "sm" | "base" | "lg";
  setFontSize: (s: "sm" | "base" | "lg") => void;
}


const defaultJobScraping: JobScrapingState = {
  source: "linkedin",
  keywords: "",
  location: "",
  levels: [],
  page: 1,
  jobs: [],
  scores: {},
  scoringInProgress: false,
  scoringStartedAt: undefined,
};


export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set) => ({
      activeTab: "overview",
      setActiveTab: (tab) => set({ activeTab: tab }),


      myProfile: null,
      profileLoaded: false,
      setMyProfile: (p) => set({ myProfile: p, profileLoaded: true }),


      jobScraping: defaultJobScraping,
      setJobScraping: (patch) =>
        set((s) => ({ jobScraping: { ...s.jobScraping, ...patch } })),
      resetJobScraping: () => set({ jobScraping: defaultJobScraping }),
      accentColor: "blue",
      setAccentColor: (c) => set({ accentColor: c }),
      fontSize: "base",
      setFontSize: (s) => set({ fontSize: s }),
    }),
    {
      name: "talentgraph:dashboard",
      storage: createJSONStorage(() => localStorage),
      // Chỉ persist form filter — không persist jobs/scores/profile
      partialize: (state) => ({
        jobScraping: {
          source: state.jobScraping.source,
          keywords: state.jobScraping.keywords,
          location: state.jobScraping.location,
          levels: state.jobScraping.levels,
          page: state.jobScraping.page,
          accentColor: state.accentColor,
          fontSize: state.fontSize,
        },
      }),
      // Merge: dùng default cho các field không persist
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<DashboardStore>),
        // Force reset runtime state
        myProfile: null,
        profileLoaded: false,
        jobScraping: {
          ...current.jobScraping,
          ...((persisted as any)?.jobScraping ?? {}),
          jobs: [],
          scores: {},
          scoringInProgress: false,
          scoringStartedAt: undefined,
        },
      }),
      version: 3, // bump để invalidate cache cũ
    },
  ),
);



