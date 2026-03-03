'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
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
  const [showMenu, setShowMenu] = useState(false)

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

  useEffect(() => {
    if (session?.user) {
      fetchProfile()
    }
  }, [session?.user, fetchProfile])

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' })
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Delete this item?')) return
    try {
      const res = await fetch(`/api/items/${itemId}`, { method: 'DELETE', credentials: 'include' })
      if (res.ok) {
        fetchProfile()
      }
    } catch (e) {
      console.error('Delete failed:', e)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bt-background">
        <TopBar />
        <div 
          className="flex items-center justify-center"
          style={{ 
            paddingTop: 'var(--bt-header-height)',
            minHeight: 'calc(100vh - var(--bt-header-height))'
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-bt-accent/10 flex items-center justify-center mb-4">
              <div className="w-8 h-8 border-3 border-bt-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="bt-body text-bt-text-secondary">Loading your profile...</div>
          </motion.div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-bt-background">
        <TopBar />
        <div 
          className="flex items-center justify-center"
          style={{ 
            paddingTop: 'var(--bt-header-height)',
            minHeight: 'calc(100vh - var(--bt-header-height))'
          }}
        >
          <div className="text-center">
            <div className="text-bt-error">Failed to load profile</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bt-background">
      <TopBar />
      
      <div 
        className="max-w-md mx-auto"
        style={{ paddingTop: 'var(--bt-header-height)' }}
      >
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6"
        >
          <div className="flex items-start gap-6 mb-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden ring-3 ring-bt-border">
                {profile.image ? (
                  <Image
                    src={profile.image}
                    alt={profile.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="
                    w-full h-full bg-gradient-to-br 
                    from-bt-accent to-bt-accent-dark
                    flex items-center justify-center text-white font-bold text-2xl
                  ">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              {/* Online indicator */}
              <div className="
                absolute -bottom-1 -right-1 w-6 h-6
                bg-bt-success border-3 border-white
                rounded-full flex items-center justify-center
              ">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1">
              <div className="flex justify-between text-center mb-4">
                <div>
                  <div className="bt-heading text-lg text-bt-text-primary">{profile.itemsPosted}</div>
                  <div className="bt-small text-bt-text-secondary">posts</div>
                </div>
                <div>
                  <div className="bt-heading text-lg text-bt-text-primary">{profile.wantsReceived}</div>
                  <div className="bt-small text-bt-text-secondary">wants</div>
                </div>
                <div>
                  <div className="bt-heading text-lg text-bt-text-primary">{profile.tradesCompleted}</div>
                  <div className="bt-small text-bt-text-secondary">trades</div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button className="bt-button bt-button-secondary flex-1 bt-button-small">
                  Edit Profile
                </button>
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="
                    bt-button bt-button-secondary bt-button-small 
                    w-10 h-8 p-0 flex items-center justify-center
                  "
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="1.5"/>
                    <circle cx="12" cy="12" r="1.5"/>
                    <circle cx="12" cy="19" r="1.5"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Name and bio */}
          <div className="mb-4">
            <h2 className="bt-heading text-lg text-bt-text-primary mb-1">
              {profile.name}
            </h2>
            <p className="bt-body text-bt-text-secondary text-sm">
              Trading enthusiast 🎣 • Making connections through exchange
            </p>
          </div>

          {/* Circles badges */}
          {profile.circles && profile.circles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {profile.circles.slice(0, 3).map((circle) => (
                <Link
                  key={circle.id}
                  href={`/circles/${circle.id}`}
                  className="
                    px-3 py-1.5 bg-bt-accent/10 text-bt-accent 
                    rounded-lg text-xs font-medium
                    hover:bg-bt-accent/20 transition-colors duration-200
                  "
                >
                  {circle.name}
                </Link>
              ))}
              {profile.circles.length > 3 && (
                <Link
                  href="/circles"
                  className="
                    px-3 py-1.5 bg-bt-surface-secondary text-bt-text-secondary 
                    rounded-lg text-xs font-medium
                    hover:bg-bt-surface-tertiary transition-colors duration-200
                  "
                >
                  +{profile.circles.length - 3} more
                </Link>
              )}
            </div>
          )}
        </motion.div>

        {/* Tab navigation */}
        <div className="bg-white border-t border-bt-border">
          <div className="flex">
            <motion.button
              onClick={() => setActiveTab('grid')}
              className={`
                flex-1 flex items-center justify-center py-4 
                transition-colors duration-200 relative
                ${activeTab === 'grid' ? 'text-bt-accent' : 'text-bt-text-tertiary'}
              `}
              whileTap={{ scale: 0.95 }}
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill={activeTab === 'grid' ? 'currentColor' : 'none'} 
                stroke="currentColor" 
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              
              {activeTab === 'grid' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-bt-accent"
                />
              )}
            </motion.button>
            
            <motion.button
              onClick={() => setActiveTab('list')}
              className={`
                flex-1 flex items-center justify-center py-4 
                transition-colors duration-200 relative
                ${activeTab === 'list' ? 'text-bt-accent' : 'text-bt-text-tertiary'}
              `}
              whileTap={{ scale: 0.95 }}
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5"
              >
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
              
              {activeTab === 'list' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-bt-accent"
                />
              )}
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {profile.items && profile.items.length > 0 ? (
              activeTab === 'grid' ? (
                <div className="grid grid-cols-3 gap-1 bg-bt-border-light">
                  {profile.items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div
                        className="block aspect-square bg-white relative overflow-hidden group"
                      >
                        {item.images && item.images.length > 0 ? (
                          <Image
                            src={item.images[0]}
                            alt={item.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                            sizes="(max-width: 768px) 33vw, 130px"
                          />
                        ) : (
                          <div className="
                            w-full h-full bg-gradient-to-br 
                            from-bt-surface-secondary to-bt-surface-tertiary
                            flex items-center justify-center
                          ">
                            <span className="text-3xl opacity-60">📦</span>
                          </div>
                        )}
                        
                        {/* Delete button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id) }}
                          className="absolute top-1 right-1 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-md"
                          style={{ opacity: 1 }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                        
                        {/* Stats overlay */}
                        <Link href={`/items/${item.id}`} className="absolute inset-0 flex items-end">
                          <div className="w-full p-1.5 bg-gradient-to-t from-black/40 to-transparent">
                            <div className="text-white text-xs font-medium flex items-center gap-3">
                              <span>❤️ {item.likeCount || 0}</span>
                              <span>🎣 {item.wantCount || 0}</span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white divide-y divide-bt-border-light">
                  {profile.items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center p-4 hover:bg-bt-surface-secondary transition-colors duration-200">
                        <Link href={`/items/${item.id}`} className="flex items-center flex-1 min-w-0">
                          <div className="w-16 h-16 rounded-xl bg-bt-surface-secondary mr-4 overflow-hidden flex-shrink-0">
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
                                <span className="text-2xl opacity-60">📦</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="bt-heading text-sm text-bt-text-primary truncate mb-1">
                              {item.title}
                            </h3>
                            <p className="bt-caption truncate mb-2">
                              {item.description || 'No description'}
                            </p>
                            <div className="flex items-center gap-4">
                              <span className="bt-small flex items-center gap-1">
                                ❤️ {item.likeCount || 0}
                              </span>
                              <span className="bt-small flex items-center gap-1">
                                🎣 {item.wantCount || 0}
                              </span>
                            </div>
                          </div>
                        </Link>
                        
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="ml-2 p-2 rounded-lg text-bt-error hover:bg-bt-error/10 transition-colors"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white text-center py-16 px-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                  className="text-8xl mb-6"
                >
                  📦
                </motion.div>
                
                <h3 className="bt-heading text-lg text-bt-text-primary mb-2">
                  No Items Yet
                </h3>
                <p className="bt-body text-bt-text-secondary mb-8">
                  Share your first item to get started trading with friends
                </p>
                
                <Link
                  href="/dashboard/add-item"
                  className="bt-button bt-button-primary"
                >
                  Add Your First Item
                </Link>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="
                fixed top-16 right-4 bg-white rounded-xl shadow-xl
                border border-bt-border overflow-hidden z-50
              "
            >
              <div className="py-2">
                <button
                  onClick={handleSignOut}
                  className="
                    w-full px-4 py-3 text-left text-bt-error
                    hover:bg-bt-error/5 transition-colors duration-200
                    bt-label text-sm
                  "
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Backdrop for menu */}
        {showMenu && (
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
        )}
      </div>
    </div>
  )
}