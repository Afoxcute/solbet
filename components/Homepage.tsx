'use client';
import React from 'react'
import MessageIcon from '@/public/icons/MessageIcon';
import Link from 'next/link';
import { ArrowRight, } from 'lucide-react';

const Homepage = () => {
  return (
    <main className="min-h-screen min-w-screen bg-[#ECF5F5]">
      {/* Hero Section - simplified to match mobile design */}
      <div className="pt-20 pb-12 px-4">

      </div>

      {/* In-Play Wagers Section */}
      <div className="px-1 pb-1">
        <div className="max-w-4xl mx-auto  overflow-hidden">
          <div className="p-2 lg:p-2 text-center">
            <h2 className="text-2xl lg:text-3xl font-bold text-black mb-4">
              In-Play Wagers; Bet on Your Banter
            </h2>
            <p className="text-gray-600 text-sm lg:text-base mb-8 max-w-2xl mx-auto">
              Settle arguments fast and easy on-chain
            </p>

            <Link href={'/wagers'} className="inline-block bg-blue-500 hover:bg-blue-600 transition-colors text-white font-medium py-3 px-8 rounded-full text-sm lg:text-base mb-8">
              BOOK WAGER
            </Link>

            <div className="mb-8">
              <div className="flex items-center justify-between bg-white border-1 border-[#847F83] rounded-full p-2 max-w-md mx-auto mb-6">
                <input
                  type="text"
                  placeholder="Paste wager link to join"
                  className="flex-1 bg-transparent outline-none px-3 text-sm text-gray-600 placeholder-gray-400"
                />
                <button className="bg-white text-black font-medium py-2 px-4 rounded-full text-sm ">
                  Wager
                </button>
              </div>
            </div>

            <div className="bg-white justify-around p-4 rounded-xl ">
              <div className="text-left mx-auto">
                <h3 className="font-semibold text-black mb-4 pb-1">
                  Booked wagers
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-700">Mbappe to score in the second half</span>
                    <div className="flex items-center gap-1.5">
                      <button className="text-blue-500 text-xs underline">View</button>
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">Cancel</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-700">Inter Milan to win the UCL</span>
                    <div className="flex items-center gap-2">
                      <button className="text-blue-500 text-xs underline">View</button>
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">Cancel</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-700">Inter Milan to win the UCL</span>
                    <div className="flex items-center gap-2">
                      <button className="text-blue-500 text-xs underline">View</button>
                      <span className="bg-gray-300 text-gray-600 text-xs px-2 py-1 rounded">Withdraw</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wager Rooms Section */}
      <div className="px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/wager-rooms"
            className="block bg-gray-400 hover:bg-gray-500 transition-colors text-white rounded-2xl p-6 lg:p-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12  flex items-center justify-center">
                  <MessageIcon />
                </div>
                <div>
                  <h3 className="font-semibold text-lg lg:text-xl">Wager rooms</h3>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-white" />
            </div>
          </Link>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className='bg-[#141517] text-white'>
        <div className='border-t border-gray-700'>
          <div className='max-w-4xl mx-auto px-4 py-4 flex justify-between items-center text-xs'>
            <p className='text-gray-400'>© 2025 90+</p>
            <div className='flex gap-2 items-center text-gray-300'>
              <Link href={'/'} className="hover:text-white transition-colors">Support</Link>
              <span className='text-gray-600'>|</span>
              <Link href={'/'} className="hover:text-white transition-colors">Terms & Conditions</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Homepage
