"use client";

import { useEffect, useState } from "react";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { usePrivySolana } from "@/hooks/usePrivySolana";
import { usePrivy } from "@privy-io/react-auth";

const PrivyWallet = () => {
  const { solanaPublicKey, isReady } = usePrivySolana();
  const { ready, authenticated } = usePrivy();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

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
        setBalance(balance / 1e9); // Convert lamports to SOL
      } catch (error) {
        console.error("Error fetching balance:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBalance();
  }, [isReady, solanaPublicKey]);

  if (!ready || !authenticated) {
    return null;
  }

  if (!isReady || !solanaPublicKey) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-sm">No Solana wallet connected</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <p className="text-sm font-medium">Wallet address: {solanaPublicKey.toString().slice(0, 5)}...{solanaPublicKey.toString().slice(-5)}</p>
      <p className="text-sm mt-1">
        Balance: {loading ? "Loading..." : balance !== null ? `${balance.toFixed(4)} SOL` : "Error fetching balance"}
      </p>
    </div>
  );
};

export default PrivyWallet; 