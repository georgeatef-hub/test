'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import BottomNav from '@/components/bottom-nav'

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

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-ig-background flex items-center justify-center">
        <div className="text-ig-primary text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect
  }

  return (
    <>
      <div className="pb-16">{children}</div>
      <BottomNav />
    </>
  )
}