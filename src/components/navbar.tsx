'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);

  const isActive = (path: string) => pathname === path;

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block bg-[#fafafa] border-b border-[#dbdbdb] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="text-2xl font-bold text-[#FF6B4A]">
            Bartera 🎣
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-8">
            <Link
              href="/dashboard"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive('/dashboard')
                  ? 'bg-[#FF6B4A] text-gray-900'
                  : 'text-[#8a9a8a] hover:text-gray-900'
              }`}
            >
              📊 Dashboard
            </Link>
            <Link
              href="/circles"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                pathname.startsWith('/circles')
                  ? 'bg-[#FF6B4A] text-gray-900'
                  : 'text-[#8a9a8a] hover:text-gray-900'
              }`}
            >
              ⭕ Circles
            </Link>
            <Link
              href="/matches"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive('/matches')
                  ? 'bg-[#FF6B4A] text-gray-900'
                  : 'text-[#8a9a8a] hover:text-gray-900'
              }`}
            >
              🎉 Matches
            </Link>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center space-x-2 text-[#8a9a8a] hover:text-gray-900 transition-colors"
            >
              <div className="w-8 h-8 bg-[#FF6B4A] rounded-full flex items-center justify-center text-gray-900 font-bold">
                {session?.user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span>{session?.user?.name}</span>
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-[#dbdbdb] rounded-xl shadow-lg py-2 z-50">
                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-2 text-left text-[#8a9a8a] hover:text-gray-900 hover:bg-[#f5f5f5] transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#dbdbdb] z-40">
        <div className="grid grid-cols-4 h-16">
          <Link
            href="/dashboard"
            className={`flex flex-col items-center justify-center space-y-1 ${
              isActive('/dashboard') ? 'text-[#FF6B4A]' : 'text-[#8a9a8a]'
            }`}
          >
            <span className="text-xl">📊</span>
            <span className="text-xs font-medium">Dashboard</span>
          </Link>
          
          <Link
            href="/circles"
            className={`flex flex-col items-center justify-center space-y-1 ${
              pathname.startsWith('/circles') ? 'text-[#FF6B4A]' : 'text-[#8a9a8a]'
            }`}
          >
            <span className="text-xl">⭕</span>
            <span className="text-xs font-medium">Circles</span>
          </Link>
          
          <Link
            href="/circles"
            className={`flex flex-col items-center justify-center space-y-1 ${
              pathname.includes('/swipe') ? 'text-[#FF6B4A]' : 'text-[#8a9a8a]'
            }`}
          >
            <span className="text-xl">👆</span>
            <span className="text-xs font-medium">Swipe</span>
          </Link>
          
          <Link
            href="/matches"
            className={`flex flex-col items-center justify-center space-y-1 ${
              isActive('/matches') ? 'text-[#FF6B4A]' : 'text-[#8a9a8a]'
            }`}
          >
            <span className="text-xl">🎉</span>
            <span className="text-xs font-medium">Matches</span>
          </Link>
        </div>
      </nav>

      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowMenu(false)}
        />
      )}
    </>
  );
}