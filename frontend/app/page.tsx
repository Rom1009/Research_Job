'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'

export default function Page() {
  const { user, isLoading } = useAuth()
  const router = useRouter()


  useEffect(() => {
    if (isLoading) return
    router.replace(user ? '/dashboard' : '/login')
  }, [user, isLoading, router])


  return null
}