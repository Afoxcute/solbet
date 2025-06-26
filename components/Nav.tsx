"use client"
import React, { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthLogin } from '@/hooks/use-auth-login';
import { trpc } from '@/trpc/client';
import { airdropSol, getSolanaBalance } from '@/utils/solanaHelpers';
import toast from 'react-hot-toast';
import { usePrivy } from '@privy-io/react-auth';
import { usePrivySolana } from '@/hooks/usePrivySolana';

const Nav = () => {
  const pathname = usePathname()
  const router = useRouter();
  const walletMutation = trpc.wallets.createANewWallet.useMutation()
  const { ready, authenticated, user: privyUser, login, logout } = usePrivy();
  const { solanaPublicKey } = usePrivySolana();
  
  const {
    isLoading,
    setLoggedIn,
    setIsLoading,
    login: authLogin,
    setUser,
    user: settedUser
  } = useAuthLogin();

  // State to track scroll position
  const [scrolled, setScrolled] = useState(false);

  // Scroll event handler
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Initial check
    handleScroll();

    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (authenticated && privyUser) {
      setIsLoading(false)
      setLoggedIn(true)
      
      // Get the wallet address from Privy
      const walletAddress = solanaPublicKey ? 
        solanaPublicKey.toString() : 
        privyUser?.wallet?.address || '';
      
      setUser({
        email: privyUser.email || '',
        id: privyUser.id,
        name: privyUser.name || '',
        profileImage: privyUser.avatar || '',
        address: walletAddress,
      })
    }
  }, [privyUser, authenticated, solanaPublicKey, setIsLoading, setLoggedIn, setUser])

  const handleLogin = async () => {
    if (!authenticated) {
      router.push('/login');
    } else {
      await authLogin();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setLoggedIn(false);
      toast.success("Logged out successfully");
      router.push('/');
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  return (
    <nav className={`
      ${scrolled ? 'fixed shadow-md' : pathname !== '/' ? 'fixed' : 'absolute'} 
      top-0 left-0 z-50 right-0 px-3 lg:px-5 py-3 transition-all duration-300 
      ${scrolled ? 'bg-[#ffffff]/95 backdrop-blur-sm' : 'bg-[#ffffff]'} 
      text-black w-full
    `}>
      <div className='flex justify-between items-center'>

        <Link href={'/'}>
          <Image
            src={'/logo.png'}
            width={500}
            height={500}
            alt='Logo'
            quality={100}
            className='size-[32px]'
          />
        </Link>

        <div className="flex items-center gap-3">
          {settedUser !== null && (
            <Link
              href={'/profile'}
              className={` font-semibold text-[0.8rem] cursor-pointer text-black`}
            >
              Profile
            </Link>
          )}
          
          {!ready ? (
            <button disabled className="bg-gray-300 py-2 px-3 rounded-full text-[0.8rem]">
              Loading...
            </button>
          ) : !authenticated ? (
            <Link 
              href="/login" 
              className="bg-blue-500 py-2 px-3 rounded-full font-semibold text-white text-[0.8rem]"
            >
              Login / Sign Up
            </Link>
          ) : (
            <>
              <button
                onClick={handleLogin}
                className='bg-blue-500 flex items-center gap-3 py-2 px-3 rounded-full font-semibold text-white text-[0.8rem] cursor-pointer'
              >
                {settedUser?.profileImage && (
                  <div className="h-5 w-5 rounded-full overflow-hidden">
                    <Image
                      src={settedUser.profileImage}
                      alt={settedUser.name || 'User'}
                      width={500}
                      height={500}
                      quality={100}
                      className="object-cover"
                    />
                  </div>
                )}
                <span>{settedUser?.address ? `${settedUser?.address?.slice(0, 5)}...` : 'Wallet'}</span>
              </button>
              
              <button 
                onClick={handleLogout}
                className="text-white bg-red-600 hover:bg-red-700 py-2 px-3 rounded-full text-[0.8rem]"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Nav
