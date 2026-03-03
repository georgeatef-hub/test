'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function TopBar() {
  const { data: session } = useSession()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (session) {
      fetchNotificationCount()
      // Poll every 30 seconds for new notifications
      const interval = setInterval(fetchNotificationCount, 30000)
      return () => clearInterval(interval)
    }
  }, [session])

  const fetchNotificationCount = async () => {
    try {
      const response = await fetch('/api/notifications', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error fetching notification count:', error)
    }
  }

  return (
    <div className="
      fixed top-0 left-0 right-0 z-50
      bg-white/95 backdrop-blur-lg 
      border-b-2 border-bt-border
      bt-safe-area-top
      shadow-sm
    ">
      <div className="
        flex items-center justify-between 
        px-4 py-2 max-w-md mx-auto
      " style={{ height: 'var(--bt-header-height)' }}>
        
        {/* Left side - Logo */}
        <Link 
          href="/home" 
          className="
            bt-logo hover:scale-105 transition-transform duration-200
            flex items-center gap-2
          "
        >
          {/* Trading icon */}
          <div className="
            w-8 h-8 bg-bt-accent rounded-lg
            flex items-center justify-center
            shadow-sm
          ">
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="white" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M8 3L4 7l4 4"/>
              <path d="M4 7h11a4 4 0 0 1 4 4v1"/>
              <path d="M16 21l4-4-4-4"/>
              <path d="M20 17H9a4 4 0 0 1-4-4v-1"/>
            </svg>
          </div>
          Bartera
        </Link>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <Link 
            href="/search" 
            className="
              p-2.5 rounded-xl transition-all duration-200
              text-bt-text-secondary hover:text-bt-text-primary
              hover:bg-bt-surface-secondary
              bt-focus
            "
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </Link>

          {/* Notifications */}
          <Link 
            href="/notifications" 
            className="
              relative p-2.5 rounded-xl transition-all duration-200
              text-bt-text-secondary hover:text-bt-text-primary
              hover:bg-bt-surface-secondary
              bt-focus
            "
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
            </svg>
            
            {/* Notification badge */}
            {unreadCount > 0 && (
              <div className="
                absolute -top-0.5 -right-0.5 min-w-4 h-4
                bg-bt-accent rounded-full px-1
                flex items-center justify-center
                text-white text-xs font-bold
                shadow-sm
              ">
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            )}
          </Link>

          {/* Profile avatar */}
          {session?.user && (
            <Link 
              href="/settings" 
              className="
                relative transition-all duration-200
                hover:scale-105 bt-focus
              "
            >
              <div className="
                w-8 h-8 rounded-lg overflow-hidden
                ring-2 ring-transparent hover:ring-bt-accent/30
                transition-all duration-200
              ">
                {session.user.image ? (
                  <img 
                    src={session.user.image} 
                    alt={session.user.name || 'Profile'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="
                    w-full h-full bg-gradient-to-br 
                    from-bt-accent to-bt-accent-dark
                    flex items-center justify-center text-white text-sm font-bold
                  ">
                    {session.user.name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
              </div>
              
              {/* Online indicator */}
              <div className="
                absolute -bottom-0.5 -right-0.5 w-3 h-3
                bg-bt-success border-2 border-white
                rounded-full
              "/>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}