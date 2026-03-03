'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import FeedPost from '@/components/feed-post'
import StoriesRow from '@/components/stories-row'
import TopBar from '@/components/top-bar'
import { FeedItem } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'

export default function HomePage() {
  const { data: session } = useSession()
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [allFeedItems, setAllFeedItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [heroStats, setHeroStats] = useState({ wants: 0, matches: 0, swipes: 0 })

  // Fetch hero stats
  useEffect(() => {
    if (!session?.user) return
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setHeroStats({
            wants: data.catchesCount || 0,
            matches: data.tradesCount || 0,
            swipes: data.catchesCount || 0,
          })
        }
      } catch { /* silent */ }
    }
    fetchStats()
  }, [session?.user])

  const fetchFeed = useCallback(async (cursor?: string, isRefresh = false) => {
    if (!session?.user) return

    try {
      if (isRefresh) {
        setRefreshing(true)
      } else if (cursor) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      const url = new URL('/api/feed', window.location.origin)
      if (cursor) url.searchParams.set('cursor', cursor)
      url.searchParams.set('limit', '20')

      const response = await fetch(url.toString(), {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        
        if (isRefresh || !cursor) {
          setAllFeedItems(data.items)
          setFeedItems(data.items)
        } else {
          setAllFeedItems(prev => {
            const newItems = [...prev, ...data.items]
            setFeedItems(newItems)
            return newItems
          })
        }
        
        setNextCursor(data.nextCursor)
        setHasMore(data.hasMore)
      } else {
        console.error('Failed to fetch feed')
      }
    } catch (error) {
      console.error('Error fetching feed:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
      setRefreshing(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id])

  useEffect(() => {
    if (session?.user) fetchFeed()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id])

  useEffect(() => {
    // Filter feed items when user is selected
    if (selectedUserId) {
      setFeedItems(allFeedItems.filter(item => item.userId === selectedUserId))
    } else {
      setFeedItems(allFeedItems)
    }
  }, [selectedUserId, allFeedItems])

  const handleLoadMore = () => {
    if (hasMore && !loadingMore && nextCursor && !selectedUserId) {
      fetchFeed(nextCursor)
    }
  }

  const handleFilterByUser = (userId: string | null) => {
    setSelectedUserId(userId)
  }

  const handleLike = (itemId: string) => {
    console.log('Item liked:', itemId)
  }

  const handleWant = (itemId: string) => {
    console.log('Item wanted:', itemId)
  }

  const handleComment = (itemId: string) => {
    window.open(`/items/${itemId}`, '_blank')
  }

  // Loading state for unauthenticated users
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-bt-background flex items-center justify-center">
        <div className="text-center px-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="text-6xl mb-6"
          >
            🎣
          </motion.div>
          <h1 className="bt-heading text-2xl text-bt-text-primary mb-3">
            Welcome to Bartera
          </h1>
          <p className="bt-body text-bt-text-secondary">
            Sign in to see your trading feed
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bt-background">
      <TopBar />
      
      {/* Main content area */}
      <div 
        className="pt-14 pb-16 min-h-screen"
        style={{ 
          marginTop: 'var(--bt-header-height)', 
          marginBottom: 'var(--bt-bottom-nav-height)',
          minHeight: 'calc(100vh - var(--bt-header-height) - var(--bt-bottom-nav-height))'
        }}
      >
        {/* Hero Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-bt-accent to-bt-teal mx-4 mb-4 p-4 rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-around text-white">
            <div className="text-center">
              <div className="text-2xl font-bold bt-animate-heart-beat">{heroStats.wants}</div>
              <div className="text-xs opacity-90">wants on your items</div>
              <div className="text-lg">🔥</div>
            </div>
            <div className="w-px h-8 bg-white/30"></div>
            <div className="text-center">
              <div className="text-2xl font-bold bt-animate-pulse-glow">{heroStats.matches}</div>
              <div className="text-xs opacity-90">trades completed</div>
              <div className="text-lg">⚡</div>
            </div>
            <div className="w-px h-8 bg-white/30"></div>
            <div className="text-center">
              <div className="text-2xl font-bold">{heroStats.swipes}</div>
              <div className="text-xs opacity-90">items wanted</div>
              <div className="text-lg">🎯</div>
            </div>
          </div>
        </motion.div>

        {/* Match notifications will show here when real matches happen */}

        {/* Stories/Circles Row */}
        <StoriesRow 
          onFilterByUser={handleFilterByUser}
          selectedUserId={selectedUserId}
        />

        {/* Pull to refresh indicator */}
        <AnimatePresence>
          {refreshing && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-4 bg-bt-surface"
            >
              <div className="inline-flex items-center gap-2 text-bt-text-secondary">
                <div className="w-4 h-4 border-2 border-bt-accent border-t-transparent rounded-full animate-spin"></div>
                <span className="bt-caption">Refreshing...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feed Container */}
        <div className="max-w-md mx-auto">
          {loading ? (
            /* Loading skeletons */
            <div className="space-y-4 px-4 pt-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bt-card p-4">
                  {/* Header skeleton */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-bt-surface-secondary rounded-xl animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-bt-surface-secondary rounded animate-pulse w-1/3"></div>
                      <div className="h-3 bg-bt-surface-secondary rounded animate-pulse w-1/4"></div>
                    </div>
                  </div>
                  {/* Image skeleton */}
                  <div className="w-full aspect-[4/3] bg-bt-surface-secondary rounded-xl animate-pulse mb-4"></div>
                  {/* Content skeleton */}
                  <div className="space-y-3">
                    <div className="h-5 bg-bt-surface-secondary rounded animate-pulse w-3/4"></div>
                    <div className="h-4 bg-bt-surface-secondary rounded animate-pulse w-1/2"></div>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <div className="h-8 bg-bt-surface-secondary rounded-xl animate-pulse w-16"></div>
                        <div className="h-8 bg-bt-surface-secondary rounded-xl animate-pulse w-16"></div>
                      </div>
                      <div className="h-9 bg-bt-surface-secondary rounded-xl animate-pulse w-20"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : feedItems.length === 0 ? (
            /* Empty state */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-8 py-16 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                className="text-8xl mb-8"
              >
                🎣
              </motion.div>
              
              <h2 className="bt-heading text-xl text-bt-text-primary mb-4">
                {selectedUserId ? 'No items from this friend' : 'Your feed is empty'}
              </h2>
              
              <p className="bt-body text-bt-text-secondary mb-8">
                {selectedUserId 
                  ? 'This friend hasn\'t posted any items recently.' 
                  : 'Join circles to see items from friends, or be the first to post!'
                }
              </p>
              
              <div className="space-y-3 max-w-xs mx-auto">
                {selectedUserId ? (
                  <button
                    onClick={() => setSelectedUserId(null)}
                    className="bt-button bt-button-primary w-full"
                  >
                    Show All Posts
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => window.location.href = '/circles'}
                      className="bt-button bt-button-primary w-full"
                    >
                      Join Circles
                    </button>
                    <button
                      onClick={() => window.location.href = '/dashboard/add-item'}
                      className="bt-button bt-button-secondary w-full"
                    >
                      Post Your First Item
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ) : (
            /* Feed items */
            <div className="pt-4">
              <AnimatePresence>
                {feedItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <FeedPost
                      item={item}
                      onLike={handleLike}
                      onWant={handleWant}
                      onComment={handleComment}
                      currentUserId={session.user.id || ''}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Load more section */}
              {hasMore && !selectedUserId && (
                <div className="px-4 py-8 text-center">
                  {loadingMore ? (
                    <div className="inline-flex items-center gap-2 text-bt-text-secondary">
                      <div className="w-4 h-4 border-2 border-bt-accent border-t-transparent rounded-full animate-spin"></div>
                      <span className="bt-caption">Loading more items...</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleLoadMore}
                      className="bt-button bt-button-secondary"
                    >
                      Load More
                    </button>
                  )}
                </div>
              )}

              {/* End of feed indicator */}
              {(!hasMore || selectedUserId) && feedItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-4 py-8 text-center"
                >
                  <div className="bt-caption text-bt-text-tertiary">
                    🎣 That&apos;s all for now! Come back later for more items.
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}