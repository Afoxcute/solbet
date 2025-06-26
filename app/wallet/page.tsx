"use client";

import React, { useEffect, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useRouter } from 'next/navigation';
import SolanaWalletConnector from '@/components/SolanaWalletConnector';
import { useAuth } from '@/utils/useAuth';

interface TokenInfo {
  mint: string;
  symbol?: string;
  name?: string;
  balance: number;
  decimals: number;
  uiBalance: number;
}

const WalletPage = () => {
  const { publicKey, connected, disconnect } = useWallet();
  const { connection } = useConnection();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [airdropLoading, setAirdropLoading] = useState(false);
  const [airdropMessage, setAirdropMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchWalletData = async () => {
    if (!publicKey || !connection) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch SOL balance
      const solBalance = await connection.getBalance(publicKey);
      setBalance(solBalance / LAMPORTS_PER_SOL);
      
      // Fetch token accounts
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      );
      
      // Process token data
      const tokenInfos: TokenInfo[] = tokenAccounts.value.map(tokenAccount => {
        const accountData = tokenAccount.account.data.parsed.info;
        const mint = accountData.mint;
        const balance = accountData.tokenAmount.amount;
        const decimals = accountData.tokenAmount.decimals;
        const uiBalance = Number(balance) / Math.pow(10, decimals);
        
        return {
          mint,
          balance: Number(balance),
          decimals,
          uiBalance
        };
      });
      
      setTokens(tokenInfos);
    } catch (err) {
      console.error('Error fetching wallet data:', err);
      setError('Failed to load wallet data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const requestAirdrop = async () => {
    if (!publicKey || !isAuthenticated) return;
    
    setAirdropLoading(true);
    setAirdropMessage(null);
    
    try {
      const response = await fetch('/api/wallet/airdrop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          amount: 1 // Request 1 SOL
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Airdrop failed');
      }
      
      setAirdropMessage(data.message || 'Airdrop successful!');
      
      // Refresh balance after airdrop
      setTimeout(() => {
        fetchWalletData();
      }, 2000);
    } catch (err) {
      console.error('Airdrop error:', err);
      setAirdropMessage(err instanceof Error ? err.message : 'Airdrop failed. Try again later.');
    } finally {
      setAirdropLoading(false);
    }
  };

  useEffect(() => {
    if (connected && publicKey) {
      fetchWalletData();
    } else {
      // Reset data if wallet disconnected
      setBalance(null);
      setTokens([]);
    }
  }, [connected, publicKey, connection]);

  const handleDisconnect = () => {
    disconnect();
    router.push('/profile');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Your Solana Wallet</h1>
        
        {!connected && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-4">Connect your Solana wallet to view your balance and tokens.</p>
            {/* <SolanaWalletConnector /> */}
          </div>
        )}
        
        {connected && publicKey && (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Wallet Address</h2>
                  <p className="text-sm text-gray-600 break-all">{publicKey.toString()}</p>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                >
                  Disconnect
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">SOL Balance</h2>
                <button
                  onClick={requestAirdrop}
                  disabled={airdropLoading || !isAuthenticated}
                  className="px-3 py-1 bg-ctaButton text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {airdropLoading ? 'Requesting...' : 'Request 1 SOL (Devnet)'}
                </button>
              </div>
              
              {airdropMessage && (
                <div className={`p-2 mb-3 text-sm rounded ${airdropMessage.includes('failed') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {airdropMessage}
                </div>
              )}
              
              {loading ? (
                <p className="text-gray-600">Loading balance...</p>
              ) : balance !== null ? (
                <p className="text-2xl font-bold">{balance.toFixed(6)} SOL</p>
              ) : (
                <p className="text-gray-600">Unable to fetch balance</p>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Token Holdings</h2>
              
              {loading ? (
                <p className="text-gray-600">Loading tokens...</p>
              ) : error ? (
                <p className="text-red-600">{error}</p>
              ) : tokens.length > 0 ? (
                <div className="space-y-4">
                  {tokens.map((token, index) => (
                    <div key={index} className="border-b pb-3 last:border-b-0">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium">{token.name || token.symbol || 'Unknown Token'}</h3>
                          <p className="text-xs text-gray-500 mt-1">{token.mint.slice(0, 8)}...{token.mint.slice(-8)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{token.uiBalance.toLocaleString(undefined, {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 6
                          })}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No tokens found in this wallet</p>
              )}
              
              <button
                onClick={fetchWalletData}
                disabled={loading || !connected}
                className="mt-4 px-4 py-2 bg-ctaButton text-white rounded-md text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WalletPage; 