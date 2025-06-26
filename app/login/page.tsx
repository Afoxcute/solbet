"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import EmailLogin from "@/components/EmailLogin";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const { ready, authenticated, login, createWallet } = usePrivy();
  const [activeTab, setActiveTab] = useState<"email" | "wallet">("email");
  const router = useRouter();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (ready && authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  const handleWalletLogin = async () => {
    try {
      await login();
      // Wallet creation is handled in the usePrivySolana hook
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("Failed to connect wallet. Please try again.");
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <p className="text-xl">Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl">You&apos;re already logged in!</p>
          <p className="mt-2">Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Welcome to 90+</h1>
          <p className="mt-2 text-sm text-gray-600">
            The Future of Live Football Engagement
          </p>
        </div>

        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-2 px-4 text-center ${
              activeTab === "email"
                ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("email")}
          >
            Email Login
          </button>
          <button
            className={`flex-1 py-2 px-4 text-center ${
              activeTab === "wallet"
                ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("wallet")}
          >
            Wallet Login
          </button>
        </div>

        <div className="mt-6">
          {activeTab === "email" ? (
            <EmailLogin />
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Connect your Solana wallet to access the platform. A wallet will be automatically created for you if you don&apos;t have one.
              </p>
              <button
                onClick={handleWalletLogin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Connect Solana Wallet
              </button>
              <div className="text-xs text-gray-500 text-center mt-2">
                Supports Phantom, Solflare, and other Solana wallets
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 