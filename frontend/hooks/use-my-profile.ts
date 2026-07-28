'use client'
import { useEffect } from 'react'
import { api } from '@/lib/api'
import { useDashboardStore } from '@/lib/dashboard-store'


export function useMyProfile() {
  const profile = useDashboardStore((s) => s.myProfile)
  const loaded = useDashboardStore((s) => s.profileLoaded)
  const setMyProfile = useDashboardStore((s) => s.setMyProfile)


  useEffect(() => {
    if (loaded) return
    api.listUsers()
      .then((list) => setMyProfile(list[0] ?? null))
      .catch(() => setMyProfile(null))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  const refresh = async () => {
    const list = await api.listUsers()
    setMyProfile(list[0] ?? null)
  }


  return { profile, loading: !loaded, refresh }
}

