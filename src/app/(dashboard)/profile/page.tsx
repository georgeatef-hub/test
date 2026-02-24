'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import TopBar from '@/components/top-bar'
import BottomNav from '@/components/bottom-nav'
import { User, Item, Circle } from '@/types'

interface ProfileData extends User {
  itemsPosted: number
  wantsReceived: number
  tradesCompleted: number
  items: Item[]
  circles: Circle[]
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'posts' | 'circles'>('posts')

  useEffect(() => {
    if (session?.user) {
      fetchProfile()
    }
  }, [session?.user])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      
      // Fetch user items
      const itemsRes = await fetch('/api/items', { credentials: 'include' })
      const items = itemsRes.ok ? await itemsRes.json() : []

      // Fetch user circles
      const circlesRes = await fetch('/api/circles', { credentials: 'include' })
      const circles = circlesRes.ok ? await circlesRes.json() : []

      // Calculate stats
      const wantsReceived = items.reduce((total: number, item: Item) => total + (item.wantCount || 0), 0)
      
      setProfile({
        id: session?.user?.id || '',
        name: session?.user?.name || '',
        email: session?.user?.email || '',
        image: session?.user?.image || undefined,
        createdAt: new Date(),
        itemsPosted: items.length,
        wantsReceived,
        tradesCompleted: 0, // TODO: Calculate from trades
        items,
        circles
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f0a]">
        <TopBar />
        <div className="flex items-center justify-center py-20">
          <div className="text-[#22c55e]">Loading profile...</div>
        </div>
        <BottomNav />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0a0f0a]">
        <TopBar />
        <div className="flex items-center justify-center py-20">
          <div className="text-red-400">Failed to load profile</div>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0f0a]">
      <TopBar />
      
      <div className="pb-20 max-w-md mx-auto">
        {/* Profile Header */}
        <div className="p-6">
          <div className="flex items-start space-x-4 mb-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-[#1a2a1a] flex items-center justify-center overflow-hidden">
              {profile.image ? (
                <Image
                  src={profile.image}
                  alt={profile.name}
                  width={80}
                  height={80}
                  className="object-cover"
                />
              ) : (
                <span className="text-[#22c55e] font-bold text-2xl">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white mb-1">{profile.name}</h1>
              <p className="text-[#8a9a8a] text-sm mb-3">{profile.email}</p>
              
              {/* Stats */}
              <div className="flex space-x-6 text-center">
                <div>
                  <div className="text-lg font-bold text-white">{profile.itemsPosted}</div>
                  <div className="text-xs text-[#8a9a8a]">Items</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-[#f59e0b]">{profile.wantsReceived}</div>
                  <div className="text-xs text-[#8a9a8a]">Wants</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-[#22c55e]">{profile.tradesCompleted}</div>
                  <div className="text-xs text-[#8a9a8a]">Trades</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mb-6">
            <Link
              href="/items/new"
              className="flex-1 bg-[#22c55e] text-white py-2 px-4 rounded-lg text-center font-semibold"
            >
              Post Item
            </Link>
            <button className="flex-1 bg-[#111a11] border border-[#1a2a1a] text-white py-2 px-4 rounded-lg font-semibold">
              Edit Profile
            </button>
          </div>

          {/* Circles */}
          {profile.circles && profile.circles.length > 0 && (
            <div className="mb-6">
              <div className="text-sm font-medium text-[#8a9a8a] mb-2">Circles</div>
              <div className="flex flex-wrap gap-2">
                {profile.circles.slice(0, 3).map((circle) => (
                  <Link
                    key={circle.id}
                    href={`/circles/${circle.id}`}
                    className="bg-[#111a11] border border-[#1a2a1a] text-[#22c55e] px-3 py-1 rounded-full text-xs font-medium hover:bg-[#1a2a1a] transition-colors"
                  >
                    {circle.name}
                  </Link>
                ))}
                {profile.circles.length > 3 && (
                  <Link
                    href="/circles"
                    className="bg-[#111a11] border border-[#1a2a1a] text-[#8a9a8a] px-3 py-1 rounded-full text-xs font-medium hover:bg-[#1a2a1a] transition-colors"
                  >
                    +{profile.circles.length - 3} more
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-[#1a2a1a] px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('posts')}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'posts'
                  ? 'border-[#22c55e] text-white'
                  : 'border-transparent text-[#8a9a8a]'
              }`}
            >
              📦 Posts ({profile.itemsPosted})
            </button>
            <button
              onClick={() => setActiveTab('circles')}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'circles'
                  ? 'border-[#22c55e] text-white'
                  : 'border-transparent text-[#8a9a8a]'
              }`}
            >
              ⭕ Circles ({profile.circles?.length || 0})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'posts' ? (
            profile.items && profile.items.length > 0 ? (
              <div className="grid grid-cols-3 gap-1">
                {profile.items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={`/items/${item.id}`}
                      className="block aspect-square bg-[#1a2a1a] rounded-lg overflow-hidden relative group"
                    >
                      {item.images && item.images.length > 0 ? (
                        <Image
                          src={item.images[0]}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-2xl">📦</span>
                        </div>
                      )}
                      
                      {/* Overlay with stats */}
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="text-white text-xs text-center">
                          <div>❤️ {item.likeCount || 0}</div>
                          <div>🎣 {item.wantCount || 0}</div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📦</div>
                <h3 className="text-lg font-bold text-white mb-2">No items yet</h3>
                <p className="text-[#8a9a8a] mb-4">Share your first item with your circles</p>
                <Link
                  href="/items/new"
                  className="inline-block bg-[#22c55e] text-white px-6 py-2 rounded-lg font-semibold"
                >
                  Post Your First Item
                </Link>
              </div>
            )
          ) : (
            profile.circles && profile.circles.length > 0 ? (
              <div className="space-y-3">
                {profile.circles.map((circle, index) => (
                  <motion.div
                    key={circle.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={`/circles/${circle.id}`}
                      className="block bg-[#111a11] border border-[#1a2a1a] rounded-lg p-4 hover:bg-[#1a2a1a] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-white mb-1">{circle.name}</h3>
                          <p className="text-[#8a9a8a] text-sm">
                            {circle.memberCount} members · {circle.itemCount} items
                          </p>
                        </div>
                        <div className="text-[#22c55e]">→</div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">⭕</div>
                <h3 className="text-lg font-bold text-white mb-2">No circles yet</h3>
                <p className="text-[#8a9a8a] mb-4">Join or create circles to start trading</p>
                <Link
                  href="/circles"
                  className="inline-block bg-[#22c55e] text-white px-6 py-2 rounded-lg font-semibold"
                >
                  Explore Circles
                </Link>
              </div>
            )
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}