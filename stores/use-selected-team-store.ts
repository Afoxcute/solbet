import { Game } from '@/data'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SelectedTeamState {
  selectedTeam: Game | null
  setSelectedTeam: (tab: Game) => void
}

export const useSelectedTeamStore = create<SelectedTeamState>()(
  persist(
    (set) => ({
      selectedTeam: null,
      setSelectedTeam: (team: Game) => set(() => ({
        selectedTeam: team
      }))
    }),
    { name: 'selected-team-store' },
  ),
)



