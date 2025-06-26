'use client';
import React, { useEffect, useState } from 'react'
import Link from 'next/link';
import { Copy, Share2 } from 'lucide-react';
import { useSessionStore } from '@/stores/use-session-store';

interface WagerData {
  forUser: string;
  againstUser: string;
  wagerCondition: string;
  amount: string;
  bookedBy: string;
  wagerLink: string;
}

const BookedWager: React.FC = () => {
  const { session: user } = useSessionStore()
  const [wagerData, setWagerData] = useState<WagerData | null>(null)

  useEffect(() => {
    // Read wager data from sessionStorage
    const storedWager = sessionStorage.getItem('currentWager');
    if (storedWager) {
      setWagerData(JSON.parse(storedWager));
    }
  }, []);

  // Show loading or redirect if no data
  if (!wagerData) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No wager data found</p>
          <Link href="/" className="text-blue-500 underline">Go back to home</Link>
        </div>
      </main>
    );
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(wagerData.wagerLink);
      // You can add a toast notification here
      console.log('Link copied to clipboard');
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const shareOnX = () => {
    const text = `Check out this wager: ${wagerData.wagerCondition}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(wagerData.wagerLink)}`;
    window.open(url, '_blank');
  };

  const shareOnTelegram = () => {
    const text = `Check out this wager: ${wagerData.wagerCondition}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(wagerData.wagerLink)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareOnWhatsApp = () => {
    const text = `Check out this wager: ${wagerData.wagerCondition} ${wagerData.wagerLink}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="pt-20 px-4">
        <div className="max-w-md mx-auto">

          {/* Wager Status Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <h1 className="text-lg font-bold text-black">WAGER BOOKED</h1>
              </div>
              <p className="text-gray-500 text-sm">Awaiting second party</p>
            </div>

            <div className="space-y-6">
              {/* Wager Condition */}
              <div>
                <h3 className="font-semibold text-black text-sm mb-2">WAGER CONDITION</h3>
                <p className="text-gray-700 text-sm">&quot;{wagerData.wagerCondition}</p>
              </div>

              {/* Stake Amount */}
              <div>
                <h3 className="font-semibold text-black text-sm mb-2">STAKE AMOUNT</h3>
                <p className="text-gray-700 font-medium">{wagerData.amount}</p>
              </div>

              {/* Booked By */}
              <div className="text-right">
                <p className="text-gray-500 text-sm">
                  BOOKED: <span className="text-gray-700">{wagerData.bookedBy}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Social Share Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center gap-6 mb-4">
              {/* Copy Link */}
              <button
                onClick={copyToClipboard}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-12 h-12 bg-gray-700 hover:bg-gray-800 transition-colors rounded-full flex items-center justify-center">
                  <Copy className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-gray-700 font-medium">Copy link</span>
              </button>

              {/* X (Twitter) */}
              <button
                onClick={shareOnX}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-12 h-12 bg-black hover:bg-gray-800 transition-colors rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">𝕏</span>
                </div>
                <span className="text-xs text-gray-700 font-medium">X</span>
              </button>

              {/* Telegram */}
              <button
                onClick={shareOnTelegram}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-12 h-12 bg-blue-500 hover:bg-blue-600 transition-colors rounded-full flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-gray-700 font-medium">Telegram</span>
              </button>

              {/* WhatsApp */}
              <button
                onClick={shareOnWhatsApp}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-12 h-12 bg-green-500 hover:bg-green-600 transition-colors rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-700 font-medium">WhatsApp</span>
              </button>
            </div>

            <p className="text-gray-600 text-sm">Share your wager link with friends!</p>
          </div>

          {/* Back to Home */}
          <div className="text-center">
            <Link
              href="/"
              className="text-black font-medium text-sm underline hover:no-underline transition-all"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default BookedWager
