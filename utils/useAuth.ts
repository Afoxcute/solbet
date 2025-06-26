"use client";

import { useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useAuthStore } from '@/stores/authStore';

export function useAuth() {
  const { data: session, status } = useSession();
  const { 
    setUser, 
    setIsAuthenticated, 
    setIsLoading,
    user,
    isAuthenticated,
    isLoading
  } = useAuthStore();

  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true);
      return;
    }

    setIsLoading(false);
    
    if (status === 'authenticated' && session) {
      setIsAuthenticated(true);
      setUser({
        id: session.user.twitterId,
        name: session.user.name || undefined,
        image: session.user.image || undefined,
        username: session.user.name || undefined, // Twitter doesn't provide username via NextAuth by default
      });
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [session, status, setIsAuthenticated, setIsLoading, setUser]);

  const login = async () => {
    await signIn('twitter', { callbackUrl: '/' });
  };

  const logout = async () => {
    await signOut({ callbackUrl: '/' });
    useAuthStore.getState().logout();
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    session
  };
} 