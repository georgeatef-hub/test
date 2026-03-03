'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import BottomNav from '@/components/bottom-nav'
import { motion, AnimatePresence } from 'framer-motion'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!session) {
      router.push('/login')
      return
    }
  }, [session, status, router])

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-bt-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          {/* Loading spinner */}
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-2xl bg-bt-accent/10 flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-bt-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          
          <div className="bt-body text-bt-text-secondary">Loading your trades...</div>
        </motion.div>
      </div>
    )
  }

  // Unauthenticated state - will redirect
  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-bt-background">
      {/* Main content with proper spacing for fixed nav elements */}
      <AnimatePresence mode="wait">
        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="pb-16" // Bottom nav padding
          style={{ paddingBottom: 'var(--bt-bottom-nav-height)' }}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      
      {/* Fixed bottom navigation */}
      <BottomNav />
    </div>
  )
}