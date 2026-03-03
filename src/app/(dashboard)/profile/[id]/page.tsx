'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import TopBar from '@/components/top-bar'
import BottomNav from '@/components/bottom-nav'

interface UserProfile {
  id: string
  name: string
  image?: string
  createdAt: string
  items: {
    id: string
    title: string
    images: string[]
    wantCount: number
    likeCount: number
    condition?: string
    circle?: { id: string; name: string }
  }[]
  circles: {
    id: string
    name: string
    memberCount: number
  }[]
  stats: {
    itemsPosted: number
    wantsReceived: number
    tradesCompleted: number
  }
}

export default function UserProfilePage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Redirect to own profile if viewing self
  useEffect(() => {
    if (session?.user?.id === userId) {
      router.replace('/profile')
      return
    }
  }, [session, userId, router])

  useEffect(() => {
    if (userId && session?.user?.id !== userId) {
      fetchProfile()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, session])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      
      // Fetch all feed items and filter by user
      const feedRes = await fetch('/api/feed', { credentials: 'include' })
      if (!feedRes.ok) throw new Error('Failed to load')
      
      const feedData = await feedRes.json()
      const items = (feedData.items || feedData || [])
        .filter((item: { userId?: string; user?: { id: string } }) => item.userId === userId || item.user?.id === userId)

      // Fetch circles to find shared ones
      const circlesRes = await fetch('/api/circles', { credentials: 'include' })
      const circles = circlesRes.ok ? await circlesRes.json() : []
      
      // Find user name from items
      const userItem = items[0]
      const userName = userItem?.user?.name || 'User'
      const userImage = userItem?.user?.image

      const wantsReceived = items.reduce((total: number, item: { wantCount?: number }) => total + (item.wantCount || 0), 0)

      // Find circles where this user is a member
      const sharedCircles = circles.filter((c: { members?: { userId: string }[] }) => 
        c.members?.some((m: { userId: string }) => m.userId === userId)
      )

      setProfile({
        id: userId,
        name: userName,
        image: userImage,
        createdAt: userItem?.createdAt || new Date().toISOString(),
        items,
        circles: sharedCircles.map((c: { id: string; name: string; memberCount?: number; members?: unknown[] }) => ({
          id: c.id,
          name: c.name,
          memberCount: c.memberCount || c.members?.length || 0
        })),
        stats: {
          itemsPosted: items.length,
          wantsReceived,
          tradesCompleted: 0
        }
      })
    } catch {
      setError('Could not load this profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <TopBar />
        <main className="bt-main flex items-center justify-center min-h-screen">
          <div className="animate-spin w-8 h-8 border-3 border-bt-accent border-t-transparent rounded-full"/>
        </main>
        <BottomNav />
      </>
    )
  }

  if (error || !profile) {
    return (
      <>
        <TopBar />
        <main className="bt-main flex flex-col items-center justify-center min-h-screen px-4">
          <p className="text-4xl mb-4">😔</p>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Profile not found</h2>
          <p className="text-sm text-gray-500 mb-4">{error || 'This user doesn\'t exist or has no items.'}</p>
          <button onClick={() => router.back()} className="px-6 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium">
            Go Back
          </button>
        </main>
        <BottomNav />
      </>
    )
  }

  return (
    <>
      <TopBar />
      <main className="bt-main pb-24">
        <div className="px-4 pt-4">
          {/* Back button */}
          <button onClick={() => router.back()} className="text-sm text-gray-500 mb-4 flex items-center gap-1">
            ← Back
          </button>

          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-bt-accent to-orange-400 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3 overflow-hidden">
              {profile.image ? (
                <Image src={profile.image} alt={profile.name} width={80} height={80} className="w-full h-full object-cover"/>
              ) : (
                profile.name.charAt(0).toUpperCase()
              )}
            </div>
            <h1 className="text-xl font-black text-gray-900">{profile.name}</h1>
            <p className="text-xs text-gray-400 mt-1">
              Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </p>
          </motion.div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-800">{profile.stats.itemsPosted}</p>
              <p className="text-xs text-gray-500">Items</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-800">{profile.stats.wantsReceived}</p>
              <p className="text-xs text-gray-500">Wants</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-800">{profile.stats.tradesCompleted}</p>
              <p className="text-xs text-gray-500">Trades</p>
            </div>
          </div>

          {/* Shared Circles */}
          {profile.circles.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Shared Circles</h3>
              <div className="flex flex-wrap gap-2">
                {profile.circles.map(circle => (
                  <Link
                    key={circle.id}
                    href={`/circles/${circle.id}`}
                    className="px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    {circle.name} · {circle.memberCount} member{circle.memberCount !== 1 ? 's' : ''}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Items Grid */}
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
            {profile.name}&apos;s Items ({profile.items.length})
          </h3>
          
          {profile.items.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-3xl mb-2">📦</p>
              <p className="text-sm text-gray-500">No items posted yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {profile.items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={`/items/${item.id}`}
                    className="block bg-white rounded-2xl border-2 border-gray-100 overflow-hidden hover:border-bt-accent/30 transition-all"
                  >
                    <div className="aspect-square bg-gray-50 flex items-center justify-center">
                      {item.images?.[0] ? (
                        <Image src={item.images[0]} alt={item.title} width={200} height={200} className="w-full h-full object-cover"/>
                      ) : (
                        <span className="text-4xl">📦</span>
                      )}
                    </div>
                    <div className="p-2.5">
                      <h4 className="font-bold text-sm text-gray-800 truncate">{item.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {item.wantCount > 0 && (
                          <span className="text-xs text-bt-accent">💎 {item.wantCount}</span>
                        )}
                        {item.circle && (
                          <span className="text-xs text-gray-400">{item.circle.name}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  )
}
