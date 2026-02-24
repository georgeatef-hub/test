'use client'

import Link from 'next/link'

export default function TopBar() {
  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-[#dbdbdb] z-50">
      <div className="flex items-center justify-between h-11 px-4">
        {/* Logo — Instagram style text logo */}
        <Link href="/home" className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Billabong', cursive, sans-serif" }}>
          Bartera
        </Link>

        {/* Right actions */}
        <div className="flex items-center space-x-5">
          {/* Notifications */}
          <Link href="/notifications" className="relative">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </Link>

          {/* Messages/DM */}
          <Link href="/circles">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
