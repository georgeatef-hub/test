'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [showDropdown, setShowDropdown] = useState(false)

  const isActive = (path: string) => pathname === path

  return (
    <header className="bg-[#111a11] border-b border-[#1a2a1a]">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="text-2xl font-bold text-white">
            Bar<span className="text-green-500">tera</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            <Link
              href="/dashboard"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/dashboard')
                  ? 'bg-green-500 text-white'
                  : 'text-gray-300 hover:text-green-500'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/swipe"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/swipe')
                  ? 'bg-green-500 text-white'
                  : 'text-gray-300 hover:text-green-500'
              }`}
            >
              Swipe
            </Link>
            <Link
              href="/matches"
              className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/matches')
                  ? 'bg-green-500 text-white'
                  : 'text-gray-300 hover:text-green-500'
              }`}
            >
              Matches
              {/* Notification badge (hardcoded for now) */}
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            </Link>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-3 text-gray-300 hover:text-white focus:outline-none focus:text-white"
            >
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <span className="hidden md:block">{session?.user?.name}</span>
              <svg
                className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-[#111a11] rounded-md shadow-lg border border-[#1a2a1a] z-10">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-400 border-b border-[#1a2a1a]">
                    {session?.user?.email}
                  </div>
                  <button
                    onClick={() => {
                      setShowDropdown(false)
                      signOut({ callbackUrl: '/' })
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#1a2a1a] transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation - Bottom Tab Style */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#111a11] border-t border-[#1a2a1a] z-50">
          <div className="grid grid-cols-3">
            <Link
              href="/dashboard"
              className={`flex flex-col items-center py-3 px-2 text-xs transition-colors ${
                isActive('/dashboard')
                  ? 'text-green-500'
                  : 'text-gray-400'
              }`}
            >
              <span className="text-lg mb-1">📊</span>
              Dashboard
            </Link>
            <Link
              href="/swipe"
              className={`flex flex-col items-center py-3 px-2 text-xs transition-colors ${
                isActive('/swipe')
                  ? 'text-green-500'
                  : 'text-gray-400'
              }`}
            >
              <span className="text-lg mb-1">👆</span>
              Swipe
            </Link>
            <Link
              href="/matches"
              className={`relative flex flex-col items-center py-3 px-2 text-xs transition-colors ${
                isActive('/matches')
                  ? 'text-green-500'
                  : 'text-gray-400'
              }`}
            >
              <span className="text-lg mb-1">🎉</span>
              Matches
              <span className="absolute top-1 right-3 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}