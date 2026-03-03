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
    {
      path: '/home',
      label: 'Home',
      icon: (active: boolean) => (
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill={active ? 'currentColor' : 'none'} 
          stroke="currentColor" 
          strokeWidth={active ? '0' : '2'} 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="transition-all duration-200"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      )
    },
    {
      path: '/circles',
      label: 'Circles',
      icon: (active: boolean) => (
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth={active ? '2.5' : '2'} 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="transition-all duration-200"
        >
          <circle cx="12" cy="12" r="3" fill={active ? 'currentColor' : 'none'}/>
          <circle cx="12" cy="12" r="10"/>
          <path d="M7 12h.01M17 12h.01"/>
        </svg>
      )
    },
    {
      path: '/circles/swipe',
      label: 'Swipe',
      isCenter: true,
      icon: (active: boolean) => (
        <div className={`
          w-16 h-12 rounded-2xl flex items-center justify-center transition-all duration-200
          ${active 
            ? 'bg-gradient-to-r from-bt-teal to-bt-accent shadow-2xl scale-110 bt-animate-pulse-glow' 
            : 'bg-gradient-to-r from-bt-teal/80 to-bt-accent/80 shadow-lg hover:scale-105'
          }
        `}>
          <span className="text-2xl">💎</span>
        </div>
      )
    },
    {
      path: '/matches',
      label: 'Trades',
      icon: (active: boolean) => (
        <div className="relative">
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth={active ? '2.5' : '2'} 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="transition-all duration-200"
          >
            <path d="M8 3L4 7l4 4"/>
            <path d="M4 7h11a4 4 0 0 1 4 4v1"/>
            <path d="M16 21l4-4-4-4"/>
            <path d="M20 17H9a4 4 0 0 1-4-4v-1"/>
            {active && <circle cx="12" cy="12" r="2" fill="currentColor"/>}
          </svg>
          {/* Badge count for pending matches - could be connected to real data in future */}
        </div>
      )
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: (active: boolean) => (
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill={active ? 'currentColor' : 'none'} 
          stroke="currentColor" 
          strokeWidth={active ? '0' : '2'} 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="transition-all duration-200"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      )
    }
  ]

  return (
    <div className="
      fixed bottom-0 left-0 right-0 z-50
      bg-white/95 backdrop-blur-lg 
      border-t-2 border-bt-border
      bt-safe-area-bottom
      shadow-lg
    ">
      {/* Navigation Container */}
      <div className="
        flex items-center justify-around 
        px-2 py-1
        max-w-md mx-auto
      " style={{ height: 'var(--bt-bottom-nav-height)' }}>
        
        {navItems.map((item) => {
          const active = isActive(item.path)
          const isCenter = item.isCenter
          
          return (
            <Link 
              key={item.path}
              href={item.path} 
              className={`
                bt-nav-item flex-1 flex flex-col items-center justify-center
                py-1 px-2 rounded-xl transition-all duration-200
                min-h-[48px] relative group
                ${isCenter 
                  ? 'text-white' 
                  : active 
                    ? 'text-bt-accent' 
                    : 'text-bt-text-tertiary hover:text-bt-text-secondary'
                }
                ${isCenter ? 'transform -translate-y-2' : ''}
              `}
            >
              {/* Icon */}
              <div className={isCenter ? 'mb-2' : 'mb-1'}>
                {item.icon(active)}
              </div>
              
              {/* Label */}
              <span className={`
                bt-small font-medium transition-all duration-200
                ${isCenter 
                  ? 'text-bt-text-primary font-bold' 
                  : active 
                    ? 'text-bt-accent' 
                    : 'text-bt-text-tertiary group-hover:text-bt-text-secondary'
                }
              `}>
                {item.label}
              </span>
              
              {/* Active indicator dot - skip for center item */}
              {active && !isCenter && (
                <div className="
                  absolute -top-1 w-1 h-1 
                  bg-bt-accent rounded-full
                  bt-animate-scale
                "/>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}