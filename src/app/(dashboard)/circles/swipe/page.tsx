'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import TopBar from '@/components/top-bar'

interface Circle {
  id: string
  name: string
  description: string | null
  image: string | null
  code: string
  _count?: { members: number; items: number }
  memberCount?: number
  itemCount?: number
}

export default function SwipeHubPage() {
  useSession()
  const [circles, setCircles] = useState<Circle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCircles = async () => {
      try {
        const res = await fetch('/api/circles', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setCircles(data)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchCircles()
  }, [])

  return (
    <div className="min-h-screen bg-bt-background pb-24">
      <TopBar />
      
      <div className="max-w-md mx-auto" style={{ paddingTop: 'var(--bt-header-height)' }}>
        {/* Header */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">💎</span>
            <div>
              <h1 className="bt-heading text-2xl text-bt-text-primary">Swipe</h1>
              <p className="bt-caption">Pick a circle to start swiping items</p>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="mx-5 mb-5 p-4 rounded-xl bg-gradient-to-r from-bt-accent/10 to-bt-teal/10 border border-bt-accent/20">
          <h3 className="bt-label text-bt-text-primary text-sm mb-2">How swiping works</h3>
          <div className="space-y-1.5 text-xs text-bt-text-secondary">
            <p>👉 <strong>Swipe right</strong> on items you want</p>
            <p>👈 <strong>Swipe left</strong> to pass</p>
            <p>🔄 When someone wants your item too → <strong>trade match!</strong></p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 px-5">
            {[1,2,3].map(i => (
              <div key={i} className="bt-card p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-bt-surface-secondary rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-bt-surface-secondary rounded w-1/2" />
                    <div className="h-3 bg-bt-surface-secondary rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : circles.length === 0 ? (
          <div className="px-8 py-12 text-center">
            <div className="text-6xl mb-4">🎣</div>
            <h2 className="bt-heading text-xl text-bt-text-primary mb-2">No circles yet</h2>
            <p className="bt-body text-bt-text-secondary mb-6">Join or create a circle to start swiping on items!</p>
            <Link href="/circles" className="bt-button bt-button-primary inline-block px-8 py-3">
              Browse Circles
            </Link>
          </div>
        ) : (
          <div className="space-y-3 px-5">
            {circles.map((circle, i) => {
              const memberCount = circle._count?.members ?? circle.memberCount ?? 0
              const itemCount = circle._count?.items ?? circle.itemCount ?? 0
              return (
                <motion.div
                  key={circle.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={`/circles/${circle.id}/swipe`}
                    className="bt-card p-4 flex items-center gap-4 hover:shadow-md transition-shadow active:scale-[0.98]"
                  >
                    {/* Circle avatar */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-bt-accent to-bt-teal flex items-center justify-center flex-shrink-0">
                      {circle.image ? (
                        <Image src={circle.image} alt={circle.name} width={56} height={56} className="object-cover w-full h-full" />
                      ) : (
                        <span className="text-2xl text-white font-bold">{circle.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="bt-heading text-base text-bt-text-primary truncate">{circle.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="bt-small">👥 {memberCount}</span>
                        <span className="bt-small">📦 {itemCount}</span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="px-3 py-2 rounded-xl bg-bt-accent text-white font-bold text-sm">
                      Swipe →
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
