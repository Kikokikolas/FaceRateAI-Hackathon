import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { useAuth as useClerkAuth, useUser } from '@clerk/react'
import { setAuthTokenProvider } from '../api/axios'
import { API_BASE_URL } from '../api/config'

export interface User {
  id: number
  email: string
  username: string
  created_at: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    isLoaded,
    isSignedIn,
    getToken,
    signOut,
  } = useClerkAuth()
  const { user: clerkUser } = useUser()
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    setAuthTokenProvider(async () => getToken())
    return () => setAuthTokenProvider(null)
  }, [getToken])

  useEffect(() => {
    let cancelled = false

    async function syncBackendUser() {
      if (!isLoaded || !isSignedIn) {
        setToken(null)
        setUser(null)
        return
      }

      const currentToken = await getToken()
      if (cancelled) return
      setToken(currentToken)

      if (!currentToken) {
        setUser(null)
        return
      }

      try {
        const res = await fetch(`${API_BASE_URL}/user/me`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        })
        if (!res.ok) throw new Error('Could not sync Clerk user.')
        const backendUser = await res.json()
        if (!cancelled) setUser(backendUser)
      } catch {
        if (!cancelled) {
          setUser({
            id: 0,
            email: clerkUser?.primaryEmailAddress?.emailAddress ?? '',
            username:
              clerkUser?.username ||
              clerkUser?.firstName ||
              clerkUser?.primaryEmailAddress?.emailAddress?.split('@')[0] ||
              'User',
            created_at: new Date().toISOString(),
          })
        }
      }
    }

    syncBackendUser()

    return () => {
      cancelled = true
    }
  }, [clerkUser, getToken, isLoaded, isSignedIn])

  const logout = () => {
    setToken(null)
    setUser(null)
    signOut({ redirectUrl: '/' })
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!isSignedIn, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
