"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
// import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/utils/useAuth';

// Import the Solana wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';
import { useAuthLogin } from '@/hooks/use-auth-login';
import dynamic from 'next/dynamic';
import { useSessionStore } from '@/stores/use-session-store';

interface SolanaWalletConnectorProps {
  className?: string;
}

const SolanaWalletConnector: React.FC<SolanaWalletConnectorProps> = ({ className = '' }) => {
  const { connection } = useConnection();
  const { session: user } = useSessionStore()
  const { publicKey, signMessage, connected, disconnect } = useWallet();
  const [authenticating, setAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Fetch wallet balance
  const fetchBalance = useCallback(async () => {
    if (!publicKey || !connection) return;

    try {
      const balance = await connection.getBalance(publicKey);
      setWalletBalance(balance / 1e9); // Convert lamports to SOL
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  }, [publicKey, connection]);

  // Connect wallet
  const handleConnect = useCallback(async () => {
    if (!publicKey || !signMessage) {
      setError('Wallet not connected or does not support signMessage');
      return;
    }

    setAuthenticating(true);
    setError(null);

    try {
      // Create a message for the user to sign
      const message = `Sign this message to authenticate with our app: ${Date.now()}`;

      // Sign the message with the wallet
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await signMessage(encodedMessage);
      const signature = bs58.encode(signedMessage);

      // Send the signed message to our API
      // const response = await fetch('/api/auth/solana-auth', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     publicKey: publicKey.toBase58(),
      //     message,
      //     signature,
      //   }),
      // });

      // const data = await response.json();

      // if (!response.ok) {
      //   throw new Error(data.error || 'Authentication failed');
      // }

      // Authentication successful
      setIsAuthenticated(true);
      await fetchBalance();

      // // Redirect to wallet page or refresh
      // if (data.success) {
      //   router.refresh();
      // }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setAuthenticating(false);
    }
  }, [publicKey, signMessage, fetchBalance]);

  // Handle wallet connection changes
  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance();
    } else {
      setWalletBalance(null);
      setIsAuthenticated(false);
    }
  }, [connected, publicKey, fetchBalance]);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="mb-4">
        <WalletMultiButton className='bg-darkGreen flex items-center gap-3 py-2 px-3 rounded-2xl  font-semibold text-white text-[0.8rem] cursor-pointer' />
      </div>

      {connected && publicKey && (
        <div className="mt-3 flex flex-col items-center">
          <p className="text-sm font-medium">
            Connected: {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
          </p>

          {walletBalance !== null && (
            <p className="text-sm text-gray-600 mt-1">
              Balance: {walletBalance.toFixed(4)} SOL
            </p>
          )}

          {!isAuthenticated && (
            <button
              onClick={handleConnect}
              disabled={authenticating}
              className="mt-3 px-4 py-2 bg-ctaButton text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition"
            >
              {authenticating ? 'Authenticating...' : 'Authenticate Wallet'}
            </button>
          )}

          {isAuthenticated && (
            <div className="mt-3 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
              Wallet Authenticated
            </div>
          )}

          {error && (
            <div className="mt-3 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs">
              {error}
            </div>
          )}
        </div>
      )}

      {status === 'authenticated' && !connected && (
        <p className="text-sm text-gray-600 mt-2">
          Link your Solana wallet to your account for additional features
        </p>
      )}
    </div>
  );
};

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  {
    ssr: false,
    loading: () => {
      return (
        <div
          className="bg-black border border-gray-800 rounded-md animate-pulse flex items-center"
          style={{
            width: "173.47px",
            height: "48px",
            padding: "0 12px",
            gap: "8px",
          }}
        >
          <div
            className="rounded-full bg-purple-400/30"
            style={{ width: "24px", height: "24px" }}
          ></div>
          <div
            className="h-4 bg-white/10 rounded-sm"
            style={{ width: "100px" }}
          ></div>
        </div>
      );
    },
  }
);


export default SolanaWalletConnector; 
