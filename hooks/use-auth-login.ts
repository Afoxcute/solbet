"use client"
import { useAtom } from 'jotai';
import { useAuthStore } from '@/stores/authStore';
import { CHAIN_NAMESPACES, CustomChainConfig, IProvider, WEB3AUTH_NETWORK, } from "@web3auth/base";
import { useEffect, useState, useCallback } from 'react'
import { scrolledAtom, loggedInAtom, web3authAtom, isWeb3AuthInitializedAtom, userAtom } from '@/stores/navStore';
import { useWallet, } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { SolanaPrivateKeyProvider, SolanaWallet } from "@web3auth/solana-provider";
import { trpc } from '@/trpc/client';
import { useSessionStore } from '@/stores/use-session-store';
import { useProviderStore } from '@/stores/use-provider-store';
import { PhantomWalletName } from '@solana/wallet-adapter-wallets';
import { usePrivy } from '@privy-io/react-auth';
import { usePrivySolana } from './usePrivySolana';

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.SOLANA,
  chainId: "0x2", // Please use 0x1 for Mainnet, 0x2 for Testnet, 0x3 for Devnet
  rpcTarget: "https://api.testnet.solana.com",
  displayName: "Solana Testnet",
  blockExplorerUrl: "https://explorer.solana.com",
  ticker: "SOL",
  tickerName: "Solana",
  logo: "https://images.toruswallet.io/solana.svg"
};
const privateKeyProvider = new SolanaPrivateKeyProvider({
  config: { chainConfig: chainConfig },
});

export const useAuthLogin = () => {
  const [scrolled, setScrolled] = useAtom(scrolledAtom);
  const {
    setIsAuthenticated,
    isAuthenticated,
  } = useAuthStore();
  const { connected, connect, select, wallet, wallets, publicKey } = useWallet();
  const { provider, setProvider } = useProviderStore();
  const [isLoading, setIsLoading] = useState(false);
  const { session: user, setSession: setUser } = useSessionStore()
  // const [user, setUser] = useAtom(userAtom);
  const [loggedIn, setLoggedIn] = useAtom(loggedInAtom);
  const [web3auth, setWeb3auth] = useAtom(web3authAtom);
  const [isWeb3AuthInitialized, setIsWeb3AuthInitialized] = useAtom(isWeb3AuthInitializedAtom);
  const router = useRouter()
  const loginMutation = trpc.users.login.useMutation()
  const logoutMutation = trpc.users.logout.useMutation()
  const { setSession } = useSessionStore()
  
  // Privy hooks
  const { ready, authenticated, user: privyUser, login: privyLogin, logout: privyLogout } = usePrivy();
  const { solanaPublicKey } = usePrivySolana();

  async function login() {
      setIsLoading(true)
      try {
      if (!authenticated) {
        await privyLogin();
      }
      
      // If we have a Privy user, update the session
      if (privyUser) {
        const walletAddress = solanaPublicKey ? 
          solanaPublicKey.toString() : 
          privyUser?.wallet?.address || '';
          
        setUser({
          email: privyUser.email || '',
          id: privyUser.id,
          name: privyUser.name || '',
          profileImage: privyUser.avatar || '',
          address: walletAddress,
        });
        
        setLoggedIn(true);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function connectToWallet() {
    if (!wallet) {
      select(PhantomWalletName)
    }

    await connect()
    return publicKey?.toBase58()
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    // Add event listener
    window.addEventListener('scroll', handleScroll);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [setScrolled]);

  const getUserInfo = async () => {
    if (authenticated && privyUser) {
      return privyUser;
    }
    return null;
  };
  
  const webAuthLogout = async () => {
    try {
      // Logout from Privy
      if (authenticated) {
        await privyLogout();
      }
      
      // Logout from web3auth if it exists
      if (web3auth?.connected) {
        await web3auth.logout();
      }

      router.push('/')
      setLoggedIn(false);
      setProvider(null);
      setIsAuthenticated(false)
      await logoutMutation.mutateAsync()
      setUser(null)
      setSession(null)
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return {
    scrolled,
    setScrolled,
    isAuthenticated,
    isLoading,
    user,
    logout: webAuthLogout,
    connected,
    connect,
    provider,
    setProvider,
    loggedIn,
    setLoggedIn,
    web3auth,
    isWeb3AuthInitialized,
    login,
    setIsAuthenticated,
    setIsLoading,
    setUser,
    getUserInfo,
    connectToWallet,
  }
}
