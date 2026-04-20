"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

/* ------------------------------------------------------------------ */
/*  AuthContext — demo auth with localStorage persistence              */
/* ------------------------------------------------------------------ */

export interface AuthUser {
  email: string
  name: string
  /** Optional profile photo URL. Falls back to initials if absent. */
  avatar?: string
}

interface AuthContextValue {
  user: AuthUser | null
  signIn: (user: AuthUser) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_KEY = "legaldrama.user"

/**
 * Deterministic DiceBear "initials" avatar URL. Gives every signed-in
 * user a consistent noir-gold initial badge without asking for a file
 * upload. When a real photo is supplied it takes priority.
 */
export function buildInitialsAvatar(name: string): string {
  const seed = encodeURIComponent(name || "counselor")
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=0a0a0a&textColor=b3a369&fontWeight=700&radius=50`
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [hydrated, setHydrated] = useState(false)

  // Rehydrate from localStorage on first client render
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as AuthUser
        if (parsed?.email) setUser(parsed)
      }
    } catch {
      /* ignore hydrate errors */
    } finally {
      setHydrated(true)
    }
  }, [])

  const signIn = useCallback((next: AuthUser) => {
    const withAvatar: AuthUser = {
      ...next,
      avatar: next.avatar || buildInitialsAvatar(next.name || next.email),
    }
    setUser(withAvatar)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(withAvatar))
    } catch {
      /* ignore write errors */
    }
  }, [])

  const signOut = useCallback(() => {
    setUser(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  // Avoid flash-of-unauth state during hydrate
  const value: AuthContextValue = { user: hydrated ? user : null, signIn, signOut }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    // Graceful no-op fallback when provider is missing (keeps the
    // existing pages that use local user state from crashing while we
    // migrate them onto the context).
    return {
      user: null,
      signIn: () => {},
      signOut: () => {},
    }
  }
  return ctx
}
