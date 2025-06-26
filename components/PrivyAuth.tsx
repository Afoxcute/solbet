"use client";

import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { usePrivySolana } from '@/hooks/usePrivySolana';

interface PrivyAuthProps {
  children: React.ReactNode;
}

export default function PrivyAuth({ children }: PrivyAuthProps) {
  const { ready, authenticated, user, login } = usePrivy();
  const { solanaPublicKey, isReady } = usePrivySolana();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (ready) {
      setIsLoading(false);
    }
  }, [ready]);

  // Log Privy authentication status for debugging
  useEffect(() => {
    if (ready) {
      console.log('Privy Auth Status:', { 
        authenticated, 
        hasSolanaWallet: !!solanaPublicKey,
        walletAddress: solanaPublicKey?.toString() || 'None'
      });
    }
  }, [ready, authenticated, solanaPublicKey]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">Initializing Solana wallet...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 