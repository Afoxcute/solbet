"use client";

import PrivyLogin from "@/components/PrivyLogin";
import { usePrivySolana } from "@/hooks/usePrivySolana";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { Connection, clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";

export default function PrivyWalletPage() {
  const { ready, authenticated, user } = usePrivy();
  const { solanaPublicKey, isReady } = usePrivySolana();
  const [balance, setBalance] = useState<number | null>(null);

  // Fetch balance when wallet is connected
  useEffect(() => {
    async function fetchBalance() {
      if (!isReady || !solanaPublicKey) return;
      
      try {
        // Use Solana connection to fetch balance
        const connection = new Connection(
          process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl("devnet"),
          "confirmed"
        );
        const balance = await connection.getBalance(solanaPublicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    }
    
    fetchBalance();
  }, [isReady, solanaPublicKey]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Privy Solana Wallet Authentication</h1>
      
      {!ready ? (
        <div>Loading Privy...</div>
      ) : (
        <>
          <PrivyLogin />
          
          {authenticated && (
            <div className="mt-8 p-6 bg-gray-100 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Your Wallet Information</h2>
              
              {isReady ? (
                <div className="space-y-2">
                  <p><span className="font-medium">Wallet Address:</span> {solanaPublicKey?.toString()}</p>
                  <p><span className="font-medium">Balance:</span> {balance !== null ? `${balance.toFixed(4)} SOL` : 'Loading...'}</p>
                  <p><span className="font-medium">Network:</span> {process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet"}</p>
                </div>
              ) : (
                <p>No Solana wallet connected yet.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
} 