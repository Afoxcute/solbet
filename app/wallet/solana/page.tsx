"use client";

import { useEffect, useState } from "react";
import PrivyLogin from "@/components/PrivyLogin";
import { usePrivySolana } from "@/hooks/usePrivySolana";
import { usePrivy } from '@privy-io/react-auth';
import { LAMPORTS_PER_SOL, SystemProgram, Transaction } from "@solana/web3.js";
import { toast } from "react-hot-toast";

export default function SolanaWalletPage() {
  const { ready, authenticated, user } = usePrivy();
  const { 
    solanaPublicKey, 
    connection, 
    sendTransaction, 
    isReady, 
    isCreatingWallet,
    createSolanaWallet
  } = usePrivySolana();
  const [airdropStatus, setAirdropStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [txStatus, setTxStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  // Fetch balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!isReady || !solanaPublicKey || !connection) return;
      
      setLoadingBalance(true);
      try {
        const balance = await connection.getBalance(solanaPublicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error("Error fetching balance:", error);
      } finally {
        setLoadingBalance(false);
      }
    };
    
    fetchBalance();
    
    // Set up balance refresh interval
    const intervalId = setInterval(fetchBalance, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(intervalId);
  }, [isReady, solanaPublicKey, connection]);

  // Request airdrop of 1 SOL (only works on devnet/testnet)
  const requestAirdrop = async () => {
    if (!isReady || !solanaPublicKey || !connection) {
      toast.error("Wallet not ready. Please connect first.");
      return;
    }
    
    setAirdropStatus('loading');
    try {
      const signature = await connection.requestAirdrop(solanaPublicKey, LAMPORTS_PER_SOL);
      await connection.confirmTransaction(signature);
      setAirdropStatus('success');
      toast.success("Airdrop successful! 1 SOL received.");
      
      // Refresh balance
      const newBalance = await connection.getBalance(solanaPublicKey);
      setBalance(newBalance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error("Airdrop error:", error);
      setAirdropStatus('error');
      toast.error("Airdrop failed. See console for details.");
    }
  };

  // Send a simple SOL transfer to yourself (for testing)
  const sendTestTransaction = async () => {
    if (!isReady || !solanaPublicKey || !connection) {
      toast.error("Wallet not ready. Please connect first.");
      return;
    }
    
    setTxStatus('loading');
    try {
      // Create a simple transaction that sends a tiny amount of SOL to yourself
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: solanaPublicKey,
          toPubkey: solanaPublicKey,
          lamports: 100, // 0.0000001 SOL
        })
      );
      
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = solanaPublicKey;
      
      // Send transaction
      const signature = await sendTransaction(transaction);
      setTxSignature(signature);
      setTxStatus('success');
      toast.success("Transaction successful!");
      
      // Refresh balance after transaction
      const newBalance = await connection.getBalance(solanaPublicKey);
      setBalance(newBalance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error("Transaction error:", error);
      setTxStatus('error');
      toast.error("Transaction failed. See console for details.");
    }
  };

  const handleCreateWallet = async () => {
    try {
      await createSolanaWallet();
      toast.success("Solana wallet created successfully!");
    } catch (error) {
      console.error("Error creating wallet:", error);
      toast.error("Failed to create wallet. See console for details.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Solana Wallet Demo</h1>
      
      <PrivyLogin />
      
      {authenticated && !isReady && !isCreatingWallet && (
        <div className="mt-8 p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">No Solana Wallet Detected</h2>
          <p className="mb-4">You&apos;re logged in, but you don&apos;t have a Solana wallet yet.</p>
          <button
            onClick={handleCreateWallet}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
          >
            Create Solana Wallet
          </button>
        </div>
      )}
      
      {isReady && (
        <div className="mt-8 space-y-6">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Wallet Information</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600">Address:</p>
              <p className="font-mono text-sm break-all">{solanaPublicKey?.toString()}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">Balance:</p>
              <p className="font-mono">
                {loadingBalance ? "Loading..." : balance !== null ? `${balance.toFixed(4)} SOL` : "Error fetching balance"}
              </p>
            </div>
            <p className="text-sm text-gray-600">Network: {process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet"}</p>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Solana Actions</h2>
            
            <div className="space-y-4">
              <div>
                <button 
                  onClick={requestAirdrop}
                  disabled={airdropStatus === 'loading'}
                  className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded disabled:opacity-50"
                >
                  {airdropStatus === 'loading' ? 'Requesting...' : 'Request 1 SOL Airdrop (Devnet)'}
                </button>
                
                {airdropStatus === 'success' && (
                  <p className="text-green-600 mt-2">Airdrop successful!</p>
                )}
                
                {airdropStatus === 'error' && (
                  <p className="text-red-600 mt-2">Airdrop failed. See console for details.</p>
                )}
              </div>
              
              <div>
                <button 
                  onClick={sendTestTransaction}
                  disabled={txStatus === 'loading'}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:opacity-50"
                >
                  {txStatus === 'loading' ? 'Sending...' : 'Send Test Transaction'}
                </button>
                
                {txStatus === 'success' && (
                  <div className="mt-2">
                    <p className="text-green-600">Transaction successful!</p>
                    {txSignature && (
                      <a 
                        href={`https://explorer.solana.com/tx/${txSignature}?cluster=${process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet'}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View on Solana Explorer
                      </a>
                    )}
                  </div>
                )}
                
                {txStatus === 'error' && (
                  <p className="text-red-600 mt-2">Transaction failed. See console for details.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 