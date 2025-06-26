"use client";

import { usePrivy } from '@privy-io/react-auth';
import { usePrivySolana } from '@/hooks/usePrivySolana';
import { useEffect, useState } from 'react';
import { Connection, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';
import EmailLogin from './EmailLogin';
import { toast } from 'react-hot-toast';

export default function PrivyLogin() {
  const { ready, authenticated, user, login, logout, connectWallet } = usePrivy();
  const { 
    solanaPublicKey, 
    isReady, 
    isCreatingWallet, 
    error, 
    createSolanaWallet 
  } = usePrivySolana();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showEmailLogin, setShowEmailLogin] = useState(false);

  // Fetch Solana balance when wallet is connected
  useEffect(() => {
    const fetchBalance = async () => {
      if (!isReady || !solanaPublicKey) return;
      
      setLoading(true);
      try {
        const connection = new Connection(
          process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl("devnet"),
          "confirmed"
        );
        const balance = await connection.getBalance(solanaPublicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error("Error fetching balance:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBalance();
  }, [isReady, solanaPublicKey]);

  const handleConnectWallet = async () => {
    try {
      if (!authenticated) {
        await login();
      } else if (!solanaPublicKey) {
        await createSolanaWallet();
        toast.success("Solana wallet created successfully");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("Failed to connect wallet");
    }
  };

  if (!ready) {
    return <div className="p-4">Initializing Solana wallet...</div>;
  }

  if (isCreatingWallet) {
    return <div className="p-4">Creating your Solana wallet...</div>;
  }

  if (!authenticated) {
    return (
      <div className="p-4 max-w-md mx-auto">
        {showEmailLogin ? (
          <>
            <EmailLogin />
            <button 
              onClick={() => setShowEmailLogin(false)}
              className="mt-4 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Back to Login Options
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4">Connect to 90+</h2>
            <p className="text-gray-600 mb-4">
              Choose your preferred login method to continue.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleConnectWallet}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Connect Solana Wallet
              </button>
              <button
                onClick={() => setShowEmailLogin(true)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Login with Email
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // Get wallet address to display
  const walletAddress = solanaPublicKey ? 
    solanaPublicKey.toString() : 
    user?.wallet?.address;

  const displayAddress = walletAddress ? 
    `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 
    'No wallet connected';

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Solana Wallet Connected</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      <div className="mb-4 p-4 bg-gray-100 rounded-lg">
        <div className="mb-2">
          <p className="text-sm text-gray-600">Wallet Address:</p>
          <p className="font-mono text-sm break-all">{displayAddress}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Balance:</p>
          <p className="font-mono">
            {loading ? "Loading..." : balance !== null ? `${balance.toFixed(4)} SOL` : "Error fetching balance"}
          </p>
        </div>
        <p className="text-sm text-gray-600 mt-2">Network: {process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet"}</p>
      </div>
      <div className="flex flex-col space-y-2">
        {!solanaPublicKey && (
          <button
            onClick={createSolanaWallet}
            disabled={isCreatingWallet}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {isCreatingWallet ? "Creating..." : "Create Solana Wallet"}
          </button>
        )}
        <button
          onClick={() => connectWallet({ chain: 'solana' })}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Connect Another Solana Wallet
        </button>
        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Disconnect Wallet
        </button>
      </div>
    </div>
  );
} 