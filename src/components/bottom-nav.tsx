'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/home') return pathname === '/home' || pathname === '/dashboard' || pathname === '/'
    return pathname.startsWith(path)
  }

  const navItems = [
    { href: '/home', label: 'Home' },
    { href: '/circles', label: 'Circles' },
    { href: '/dashboard/add-item', label: 'Post', isPost: true },
    { href: '/matches', label: 'Trades' },
    { href: '/profile', label: 'Profile' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#dbdbdb] z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around h-12">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="flex-1 flex items-center justify-center h-full">
            {item.isPost ? (
              /* Plus icon — Instagram style */
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            ) : item.label === 'Home' ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive(item.href) ? '#262626' : 'none'} stroke="#262626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            ) : item.label === 'Circles' ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isActive(item.href) ? '#262626' : '#262626'} strokeWidth={isActive(item.href) ? '2.5' : '1.5'} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="4"/>
              </svg>
            ) : item.label === 'Trades' ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isActive(item.href) ? '#262626' : '#262626'} strokeWidth={isActive(item.href) ? '2.5' : '1.5'} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/>
                <polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
            ) : item.label === 'Profile' ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive(item.href) ? '#262626' : 'none'} stroke="#262626" strokeWidth={isActive(item.href) ? '2.5' : '1.5'} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  )
}
