import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthUserInfo } from './navStore'

interface SessionState {
  session: AuthUserInfo | null
  setSession: (session: AuthUserInfo | null) => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session: AuthUserInfo | null) => set(() => ({
        session
      }))
    }),
    { name: 'current-user' },
  ),
)
