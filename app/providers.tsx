"use client";
import { SessionProvider } from "next-auth/react";
import { TRPCProvider } from "@/trpc/client";
import { HydrateClient } from "@/trpc/server";
import SolanaWalletProvider from "./providers/SolanaWalletProvider";
import { PrivyProvider } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";

// Dynamically import SolanaWalletProvider to avoid SSR issues
// const SolanaWalletProvider = dynamic(
//   () => import('./providers/SolanaWalletProvider'),
//   { ssr: false }
// );

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children, }: ProvidersProps) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        loginMethods: ['email', 'wallet'],
        embeddedWallets: {
          createOnLogin: 'all-users',
          solana: {
            createOnLogin: 'all-users'
          }
        },
        appearance: {
          theme: 'light',
          accentColor: '#3182CE', // Blue color matching your UI
          logo: '/logo.png',
          showWalletLoginFirst: false,
          walletChainType: 'solana-only'
        },
        externalWallets: {
          solana: {
            connectors: toSolanaWalletConnectors()
          }
        },
        solanaClusters: [
          { name: 'devnet', rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com' }
        ]
      }}
    >
      <SessionProvider>
        <TRPCProvider>
          {/* <HydrateClient> */}
            <SolanaWalletProvider>
              {children}
            </SolanaWalletProvider>
          {/* </HydrateClient> */}
        </TRPCProvider>
      </SessionProvider>
    </PrivyProvider>
  );
} 
