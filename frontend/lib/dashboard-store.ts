'use client'

import { create } from 'zustand'

type TabType = 'overview' | 'candidates' | 'intake' | 'analysis'

interface DashboardStore {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  activeTab: 'overview',
  setActiveTab: (tab: TabType) => set({ activeTab: tab }),
}))
