'use client'


import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { authApi, setAuthToken, getAuthToken, AuthUserApi } from '@/lib/api'


export type AuthUser = {
  user_id: string
  email: string
  name: string
  role: string
}


type AuthContextValue = {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}


const AuthContext = createContext<AuthContextValue | null>(null)


function toAuthUser(u: AuthUserApi): AuthUser {
  return {
    user_id: u.user_id,
    email: u.email,
    name: u.full_name || u.email.split('@')[0],
    role: u.role,
  }
}


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)


  // Rehydrate từ token có sẵn
  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      setIsLoading(false)
      return
    }
    authApi
      .me()
      .then((u) => setUser(toAuthUser(u)))
      .catch(() => {
        setAuthToken(null)
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [])


  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password)
    setAuthToken(res.access_token)
    setUser(toAuthUser(res.user))
  }


  const register = async (name: string, email: string, password: string) => {
    const res = await authApi.register(email, password, name)
    setAuthToken(res.access_token)
    setUser(toAuthUser(res.user))
  }


  const logout = () => {
    setAuthToken(null)
    setUser(null)
  }


  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}