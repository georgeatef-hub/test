'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

export default function BottomNav() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/' || pathname === '/dashboard'
    return pathname.startsWith(path)
  }

  const navItems = [
    { 
      href: '/', 
      label: 'Home', 
      icon: '🏠',
      activeIcon: '🏠'
    },
    { 
      href: '/circles', 
      label: 'Circles', 
      icon: '⭕',
      activeIcon: '⭕'
    },
    { 
      href: '/items/new', 
      label: 'Post', 
      icon: '➕',
      activeIcon: '➕',
      isSpecial: true
    },
    { 
      href: '/trades', 
      label: 'Trades', 
      icon: '🔄',
      activeIcon: '🔄'
    },
    { 
      href: '/profile', 
      label: 'Profile', 
      icon: '👤',
      activeIcon: '👤'
    }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#dbdbdb] safe-area-pb z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="relative">
            <motion.div
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
                item.isSpecial 
                  ? 'bg-[#22c55e] text-gray-900'
                  : isActive(item.href)
                  ? 'text-[#22c55e]'
                  : 'text-[#8a9a8a]'
              }`}
              whileTap={{ scale: 0.9 }}
            >
              <div className={`text-lg ${item.isSpecial ? 'text-xl' : ''}`}>
                {isActive(item.href) ? item.activeIcon : item.icon}
              </div>
              <span className={`text-xs font-medium ${item.isSpecial ? 'text-gray-900' : ''}`}>
                {item.label}
              </span>
            </motion.div>

            {isActive(item.href) && !item.isSpecial && (
              <motion.div
                className="absolute -top-1 left-1/2 w-1 h-1 bg-[#22c55e] rounded-full"
                layoutId="activeIndicator"
                initial={false}
                style={{ x: '-50%' }}
              />
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}