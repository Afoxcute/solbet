'use client';
import React, { useState } from 'react'
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useSessionStore } from '@/stores/use-session-store';
import { useRouter } from 'next/navigation';

const Wager = () => {
  const { session: user } = useSessionStore()
  const router = useRouter()
  const [forUser, setForUser] = useState('')
  const [againstUser, setAgainstUser] = useState('')
  const [wagerCondition, setWagerCondition] = useState('')
  const [amount, setAmount] = useState('')

  const handleBookWager = () => {
    // Validate required fields
    if (!wagerCondition.trim() || !amount.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    // Create wager data object
    const wagerData = {
      forUser: forUser || user?.name || '@user',
      againstUser,
      wagerCondition,
      amount,
      bookedBy: user?.name || '@user',
      wagerLink: `${window.location.origin}/wager/${Date.now()}` // Generate unique link
    }

    // Store in sessionStorage for the BookedWager component to read
    sessionStorage.setItem('currentWager', JSON.stringify(wagerData));

    // Navigate to booked wager page
    router.push('/booked-wager');
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <div className="pt-20 pb-6 px-4">
        <div className="max-w-md mx-auto">
          <Link href="/" className="inline-flex items-center justify-center w-10 h-10 bg-gray-300 hover:bg-gray-400 transition-colors rounded-full mb-6">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </Link>
        </div>
      </div>

      {/* Wager Form */}
      <div className="px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm p-6">
          <h1 className="text-xl font-bold text-center text-black mb-8">
            BOOK WAGER
          </h1>

          <div className="space-y-6">
            {/* FOR and AGAINST sections */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  FOR
                </label>
                <input
                  type="text"
                  value={forUser}
                  onChange={(e) => setForUser(e.target.value)}
                  placeholder="@username1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  AGAINST
                </label>
                <input
                  type="text"
                  value={againstUser}
                  onChange={(e) => setAgainstUser(e.target.value)}
                  placeholder=""
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Wager Condition */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                WAGER CONDITION<span className="text-red-500">*</span>
              </label>
              <textarea
                value={wagerCondition}
                onChange={(e) => setWagerCondition(e.target.value)}
                placeholder=""
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                AMOUNT<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder=""
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Book Button */}
            <button
              onClick={handleBookWager}
              className="w-full bg-blue-500 hover:bg-blue-600 transition-colors text-white font-semibold py-3 px-6 rounded-full text-sm mt-8"
            >
              BOOK
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Wager
