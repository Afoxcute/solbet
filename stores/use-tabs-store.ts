import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TabsState {
  selected: string
  setSelected: (tab: string) => void
}

export const useTabsStore = create<TabsState>()(
  persist(
    (set) => ({
      selected: "All",
      setSelected: (tab: string) => set(() => ({
        selected: tab
      }))
    }),
    { name: 'tabs-store' },
  ),
)


