'use client'


import { create } from 'zustand'


type TabType = 'overview' | 'candidates' | 'intake' | 'analysis' | 'jobs'


interface DashboardStore {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  activeProfileId?: string
  setActiveProfileId: (id?: string) => void
}


export const useDashboardStore = create<DashboardStore>((set) => ({
  activeTab: 'overview',
  setActiveTab: (tab) => set({ activeTab: tab }),
  activeProfileId: undefined,
  setActiveProfileId: (id) => set({ activeProfileId: id }),
}))