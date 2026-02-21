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
              href="/browse"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/browse')
                  ? 'bg-green-500 text-white'
                  : 'text-gray-300 hover:text-green-500'
              }`}
            >
              Browse
            </Link>
            <Link
              href="/matches"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/matches')
                  ? 'bg-green-500 text-white'
                  : 'text-gray-300 hover:text-green-500'
              }`}
            >
              Matches
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

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-[#1a2a1a]">
            <Link
              href="/dashboard"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/dashboard')
                  ? 'bg-green-500 text-white'
                  : 'text-gray-300 hover:text-green-500'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/browse"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/browse')
                  ? 'bg-green-500 text-white'
                  : 'text-gray-300 hover:text-green-500'
              }`}
            >
              Browse
            </Link>
            <Link
              href="/matches"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/matches')
                  ? 'bg-green-500 text-white'
                  : 'text-gray-300 hover:text-green-500'
              }`}
            >
              Matches
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}