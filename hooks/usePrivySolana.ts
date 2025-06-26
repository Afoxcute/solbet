"use client";

import { usePrivy } from '@privy-io/react-auth';
import { useCallback, useEffect, useState } from 'react';
import { Connection, PublicKey, Transaction, clusterApiUrl, SendOptions } from '@solana/web3.js';

export function usePrivySolana() {
  const { user, ready, authenticated, createWallet } = usePrivy();
  const [solanaPublicKey, setSolanaPublicKey] = useState<PublicKey | null>(null);
  const [solanaWallet, setSolanaWallet] = useState<any>(null);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Solana connection
  useEffect(() => {
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl("devnet");
    setConnection(new Connection(rpcUrl, "confirmed"));
  }, []);

  // Create a Solana wallet if none exists
  useEffect(() => {
    const createSolanaWallet = async () => {
      if (!ready || !authenticated || !user || isCreatingWallet) return;
      
      try {
        // Check if user already has a Solana wallet
        const hasSolanaWallet = 
          user.linkedAccounts?.some(account => account.type === 'wallet' && account.chain === 'solana') ||
          (user.wallet?.chain === 'solana');
        
        // Check if the user logged in with email (and needs a wallet)
        const isEmailLogin = user.loginMethods?.some(method => method === 'email');
        
        // If no Solana wallet, create one
        if (!hasSolanaWallet && createWallet) {
          console.log("No Solana wallet found, creating one...");
          console.log("User login methods:", user.loginMethods);
          console.log("Is email login:", isEmailLogin);
          
          setIsCreatingWallet(true);
          setError(null);
          
          try {
            await createWallet({ chain: 'solana' });
            console.log("Solana wallet created successfully");
          } catch (error: any) {
            console.error("Error creating Solana wallet:", error);
            setError(error?.message || "Failed to create Solana wallet");
          } finally {
            setIsCreatingWallet(false);
          }
        }
      } catch (err) {
        console.error("Error in createSolanaWallet:", err);
      }
    };
    
    createSolanaWallet();
  }, [ready, authenticated, user, createWallet, isCreatingWallet]);

  // Get Solana wallet from Privy
  useEffect(() => {
    if (ready && authenticated && user) {
      console.log("Checking for Solana wallet...");
      console.log("User:", user);
      console.log("User wallet:", user.wallet);
      console.log("Linked accounts:", user.linkedAccounts);
      console.log("Login methods:", user.loginMethods);
      
      // Find Solana wallet from linked accounts
      const linkedWallet = user.linkedAccounts?.find(account => 
        account.type === 'wallet' && account.chain === 'solana'
      );
      
      // Check embedded wallet
      const embeddedWallet = user.wallet?.chain === 'solana' ? user.wallet : null;
      
      console.log("Linked Solana wallet:", linkedWallet);
      console.log("Embedded Solana wallet:", embeddedWallet);
      
      const activeWallet = linkedWallet || embeddedWallet;
      
      if (activeWallet?.address) {
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
        console.log("No Solana wallet found with address");
        setSolanaPublicKey(null);
        setSolanaWallet(null);
      }
    } else {
      setSolanaPublicKey(null);
      setSolanaWallet(null);
    }
  }, [ready, authenticated, user, isCreatingWallet]);

  // Sign transaction with Solana wallet
  const signTransaction = useCallback(async (transaction: Transaction): Promise<Transaction> => {
    if (!solanaWallet || !authenticated) {
      throw new Error('No Solana wallet connected');
    }

    try {
      const signedTx = await user?.wallet?.signTransaction(transaction);
      return signedTx;
    } catch (e) {
      console.error('Error signing transaction:', e);
      throw e;
    }
  }, [authenticated, user, solanaWallet]);

  // Sign message with Solana wallet
  const signMessage = useCallback(async (message: Uint8Array): Promise<Uint8Array> => {
    if (!solanaWallet || !authenticated) {
      throw new Error('No Solana wallet connected');
    }

    try {
      const signedMessage = await user?.wallet?.signMessage(message);
      return signedMessage;
    } catch (e) {
      console.error('Error signing message:', e);
      throw e;
    }
  }, [authenticated, user, solanaWallet]);

  // Send transaction helper
  const sendTransaction = useCallback(async (
    transaction: Transaction, 
    options?: SendOptions
  ): Promise<string> => {
    if (!connection || !solanaPublicKey || !authenticated) {
      throw new Error('Cannot send transaction: wallet not connected or connection not established');
    }

    try {
      const signedTx = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(
        signedTx.serialize(),
        options
      );
      return signature;
    } catch (e) {
      console.error('Error sending transaction:', e);
      throw e;
    }
  }, [connection, solanaPublicKey, authenticated, signTransaction]);

  // Create wallet function that can be called from components
  const createSolanaWalletManually = useCallback(async () => {
    if (!ready || !authenticated || !createWallet) {
      throw new Error('Cannot create wallet: not authenticated or Privy not ready');
    }
    
    setIsCreatingWallet(true);
    setError(null);
    
    try {
      await createWallet({ chain: 'solana' });
      console.log("Solana wallet created manually");
      return true;
    } catch (e) {
      console.error('Error creating Solana wallet manually:', e);
      setError('Failed to create Solana wallet');
      throw e;
    } finally {
      setIsCreatingWallet(false);
    }
  }, [ready, authenticated, createWallet]);

  return {
    solanaPublicKey,
    solanaWallet,
    connection,
    signTransaction,
    signMessage,
    sendTransaction,
    isReady: ready && authenticated && !!solanaPublicKey,
    isCreatingWallet,
    error,
    createSolanaWallet: createSolanaWalletManually,
  };
} 