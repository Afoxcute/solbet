import { Keypair } from '@solana/web3.js'
import { IProvider } from '@web3auth/base'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ProviderState {
  provider: Keypair | null
  setProvider: (provider: Keypair | null) => void
}

export const useProviderStore = create<ProviderState>()(
  persist(
    (set) => ({
      provider: null,
      setProvider: (provider: Keypair | null) => set(() => ({
        provider
      }))
    }),
    { name: 'provider-store' },
  ),
)

