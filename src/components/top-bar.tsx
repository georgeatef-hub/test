'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'

export default function TopBar() {
  const { data: session } = useSession()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <div className="sticky top-0 bg-[#111a11] border-b border-[#1a2a1a] z-40">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-[#22c55e]">🎣</span>
          <span className="text-xl font-bold text-white">Bartera</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="text-[#8a9a8a] hover:text-white transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </button>

          {/* User Menu */}
          {session?.user && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-[#1a2a1a] flex items-center justify-center overflow-hidden">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-[#22c55e] font-bold text-sm">
                      {session.user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
              </button>

              {showUserMenu && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-[#111a11] border border-[#1a2a1a] rounded-lg shadow-lg py-1"
                  onBlur={() => setShowUserMenu(false)}
                >
                  <div className="px-3 py-2 border-b border-[#1a2a1a]">
                    <div className="text-sm font-medium text-white">
                      {session.user.name}
                    </div>
                    <div className="text-xs text-[#8a9a8a]">
                      {session.user.email}
                    </div>
                  </div>
                  
                  <Link
                    href="/profile"
                    className="block px-3 py-2 text-sm text-[#8a9a8a] hover:text-white hover:bg-[#1a2a1a] transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    View Profile
                  </Link>
                  
                  <Link
                    href="/items/new"
                    className="block px-3 py-2 text-sm text-[#8a9a8a] hover:text-white hover:bg-[#1a2a1a] transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Post Item
                  </Link>
                  
                  <Link
                    href="/circles"
                    className="block px-3 py-2 text-sm text-[#8a9a8a] hover:text-white hover:bg-[#1a2a1a] transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    My Circles
                  </Link>
                  
                  <div className="border-t border-[#1a2a1a] my-1"></div>
                  
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      handleSignOut()
                    }}
                    className="block w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-[#1a2a1a] transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}