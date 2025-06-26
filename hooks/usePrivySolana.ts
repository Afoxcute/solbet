"use client";

import { usePrivy } from '@privy-io/react-auth';
import { useCallback, useEffect, useState } from 'react';
import { Connection, PublicKey, Transaction, clusterApiUrl, SendOptions } from '@solana/web3.js';

interface SolanaWalletInterface {
  walletClientType: 'solana';
  address: string;
  signTransaction?: (transaction: Transaction) => Promise<Transaction>;
}

function isSolanaWallet(wallet: unknown): wallet is SolanaWalletInterface {
  if (!wallet || typeof wallet !== 'object') return false;
  const w = wallet as any;
  return w.walletClientType === 'solana' && typeof w.address === 'string';
}

export function usePrivySolana() {
  const { user, ready, authenticated, createWallet } = usePrivy();
  const [solanaPublicKey, setSolanaPublicKey] = useState<PublicKey | null>(null);
  const [solanaWallet, setSolanaWallet] = useState<SolanaWalletInterface | null>(null);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Solana connection
  useEffect(() => {
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl("devnet");
    setConnection(new Connection(rpcUrl, "confirmed"));
  }, []);

  // Get Solana wallet from Privy
  useEffect(() => {
    if (ready && authenticated && user) {
      console.log("Checking for Solana wallet...");
      
      // Find Solana wallet from linked accounts
      const linkedWallet = user.linkedAccounts?.find(account => {
        try {
          return isSolanaWallet(account);
        } catch {
          return false;
        }
      });
      
      // Check embedded wallet
      const embeddedWallet = user.wallet && isSolanaWallet(user.wallet) ? user.wallet : null;
      
      console.log("Linked Solana wallet:", linkedWallet);
      console.log("Embedded Solana wallet:", embeddedWallet);
      
      const activeWallet = linkedWallet || embeddedWallet;
      
      if (activeWallet && isSolanaWallet(activeWallet)) {
        console.log("Found Solana wallet with address:", activeWallet.address);
        setSolanaWallet(activeWallet);
        try {
          const pubkey = new PublicKey(activeWallet.address);
          setSolanaPublicKey(pubkey);
          console.log("Valid Solana public key:", pubkey.toString());
        } catch (e) {
          console.error('Invalid Solana address:', e);
          setError('Invalid Solana address');
        }
      } else {
        console.log("No Solana wallet found");
        setSolanaPublicKey(null);
        setSolanaWallet(null);
      }
    } else {
      setSolanaPublicKey(null);
      setSolanaWallet(null);
    }
  }, [ready, authenticated, user, isCreatingWallet]);

  // Create wallet if needed
  const createSolanaWallet = useCallback(async () => {
    if (!createWallet) return;
    
    setIsCreatingWallet(true);
    try {
      // Using type assertion since Privy's types don't expose all options
      await createWallet({ walletClientType: 'solana' } as any);
    } catch (e) {
      console.error('Error creating wallet:', e);
      setError('Failed to create wallet');
    } finally {
      setIsCreatingWallet(false);
    }
  }, [createWallet]);

  // Send transaction helper
  const sendTransaction = useCallback(async (
    transaction: Transaction,
    options?: SendOptions
  ): Promise<string> => {
    if (!connection || !solanaPublicKey || !solanaWallet || !authenticated) {
      throw new Error('Cannot send transaction: wallet not connected or connection not established');
    }

    try {
      if (!solanaWallet.signTransaction) {
        throw new Error('Wallet does not support transaction signing');
      }

      const signedTx = await solanaWallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(
        signedTx.serialize(),
        options
      );
      await connection.confirmTransaction(signature, 'confirmed');
      return signature;
    } catch (e) {
      console.error('Error sending transaction:', e);
      throw e;
    }
  }, [connection, solanaPublicKey, solanaWallet, authenticated]);

  return {
    solanaPublicKey,
    solanaWallet,
    connection,
    isCreatingWallet,
    error,
    createSolanaWallet,
    sendTransaction,
    isReady: ready && authenticated && !!solanaPublicKey && !!connection
  };
} 