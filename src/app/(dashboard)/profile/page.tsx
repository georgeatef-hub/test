'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import TopBar from '@/components/top-bar'
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
  const [activeTab, setActiveTab] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    if (session?.user) {
      fetchProfile()
    }
  }, [session?.user, fetchProfile])

  const fetchProfile = useCallback(async () => {
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
  }, [session?.user])

  if (loading) {
    return (
      <div className="min-h-screen bg-ig-background">
        <TopBar />
        <div style={{ marginTop: '44px', marginBottom: '48px' }}>
          <div className="flex items-center justify-center py-20">
            <div className="text-ig-primary">Loading profile...</div>
          </div>
        </div>

      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-ig-background">
        <TopBar />
        <div style={{ marginTop: '44px', marginBottom: '48px' }}>
          <div className="flex items-center justify-center py-20">
            <div className="text-red-500">Failed to load profile</div>
          </div>
        </div>

      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ig-background">
      <TopBar />
      
      <div style={{ marginTop: '44px', marginBottom: '48px' }}>
        <div className="max-w-md mx-auto bg-white">
          {/* Profile Header - Instagram style */}
          <div className="p-4">
            <div className="flex items-start mb-4">
              {/* Avatar - 77px Instagram size */}
              <div className="w-[77px] h-[77px] rounded-full overflow-hidden mr-7">
                {profile.image ? (
                  <Image
                    src={profile.image}
                    alt={profile.name}
                    width={77}
                    height={77}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {profile.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex-1">
                <div className="flex justify-around text-center mb-4">
                  <div>
                    <div className="text-lg font-bold text-ig-primary">{profile.itemsPosted}</div>
                    <div className="text-sm text-ig-primary">posts</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-ig-primary">{profile.wantsReceived}</div>
                    <div className="text-sm text-ig-primary">wants</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-ig-primary">{profile.tradesCompleted}</div>
                    <div className="text-sm text-ig-primary">trades</div>
                  </div>
                </div>

                {/* Edit Profile button */}
                <button className="w-full ig-button-secondary py-1.5 text-sm">
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Name and bio */}
            <div className="mb-4">
              <div className="font-semibold text-sm text-ig-primary mb-1">
                {profile.name}
              </div>
              <div className="text-sm text-ig-primary">
                Trading enthusiast 🎣
              </div>
            </div>

            {/* Circles as badges */}
            {profile.circles && profile.circles.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {profile.circles.slice(0, 3).map((circle) => (
                    <Link
                      key={circle.id}
                      href={`/circles/${circle.id}`}
                      className="bg-ig-border-light text-ig-primary px-2 py-1 rounded text-xs font-medium"
                    >
                      {circle.name}
                    </Link>
                  ))}
                  {profile.circles.length > 3 && (
                    <Link
                      href="/circles"
                      className="bg-ig-border-light text-ig-secondary px-2 py-1 rounded text-xs font-medium"
                    >
                      +{profile.circles.length - 3}
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tab navigation */}
          <div className="border-t border-ig-border">
            <div className="flex">
              <button
                onClick={() => setActiveTab('grid')}
                className={`flex-1 flex items-center justify-center py-3 border-t-2 transition-colors ${
                  activeTab === 'grid'
                    ? 'border-ig-primary'
                    : 'border-transparent'
                }`}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill={activeTab === 'grid' ? '#262626' : '#8e8e8e'} stroke="none">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
              </button>
              <button
                onClick={() => setActiveTab('list')}
                className={`flex-1 flex items-center justify-center py-3 border-t-2 transition-colors ${
                  activeTab === 'list'
                    ? 'border-ig-primary'
                    : 'border-transparent'
                }`}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={activeTab === 'list' ? '#262626' : '#8e8e8e'} strokeWidth="1.5">
                  <line x1="8" y1="6" x2="21" y2="6"/>
                  <line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/>
                  <line x1="3" y1="12" x2="3.01" y2="12"/>
                  <line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div>
            {profile.items && profile.items.length > 0 ? (
              activeTab === 'grid' ? (
                <div className="grid grid-cols-3 gap-px bg-ig-border-light">
                  {profile.items.map((item) => (
                    <Link
                      key={item.id}
                      href={`/items/${item.id}`}
                      className="block aspect-square bg-white relative overflow-hidden"
                    >
                      {item.images && item.images.length > 0 ? (
                        <Image
                          src={item.images[0]}
                          alt={item.title}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-200"
                          sizes="(max-width: 768px) 33vw, 130px"
                        />
                      ) : (
                        <div className="w-full h-full bg-ig-border-light flex items-center justify-center">
                          <span className="text-2xl">📦</span>
                        </div>
                      )}
                      
                      {/* Hover overlay with stats */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                        <div className="text-white text-sm font-semibold opacity-0 hover:opacity-100 flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                            <span>{item.likeCount || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>🎣</span>
                            <span>{item.wantCount || 0}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-ig-border-light">
                  {profile.items.map((item) => (
                    <Link
                      key={item.id}
                      href={`/items/${item.id}`}
                      className="flex items-center p-4 hover:bg-gray-50"
                    >
                      <div className="w-16 h-16 rounded bg-ig-border-light mr-4 overflow-hidden flex-shrink-0">
                        {item.images && item.images.length > 0 ? (
                          <Image
                            src={item.images[0]}
                            alt={item.title}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-xl">📦</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-ig-primary truncate">
                          {item.title}
                        </div>
                        <div className="text-sm text-ig-secondary truncate">
                          {item.description || 'No description'}
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-ig-secondary">
                            ❤️ {item.likeCount || 0}
                          </span>
                          <span className="text-xs text-ig-secondary">
                            🎣 {item.wantCount || 0}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-lg font-bold text-ig-primary mb-2">No Posts Yet</h3>
                <p className="text-ig-secondary mb-6">When you share photos, they will appear on your profile.</p>
                <Link
                  href="/dashboard/add-item"
                  className="inline-block bg-ig-link text-white px-6 py-2 rounded text-sm font-semibold"
                >
                  Share your first photo
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>


    </div>
  )
}