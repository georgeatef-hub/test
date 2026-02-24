'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import FeedPost from '@/components/feed-post'
import TopBar from '@/components/top-bar'
import BottomNav from '@/components/bottom-nav'
import { FeedItem } from '@/types'

export default function HomePage() {
  const { data: session } = useSession()
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

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
      url.searchParams.set('limit', '10')

      const response = await fetch(url.toString(), {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        
        if (isRefresh || !cursor) {
          setFeedItems(data.items)
        } else {
          setFeedItems(prev => [...prev, ...data.items])
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
  }, [session?.user])

  useEffect(() => {
    fetchFeed()
  }, [fetchFeed])

  const handleLoadMore = () => {
    if (hasMore && !loadingMore && nextCursor) {
      fetchFeed(nextCursor)
    }
  }

  // const handleRefresh = () => {
  //   fetchFeed(undefined, true)
  // }

  const handleLike = (itemId: string) => {
    // Optimistic update handled in FeedPost component
    console.log('Item liked:', itemId)
  }

  const handleWant = (itemId: string) => {
    // Optimistic update handled in FeedPost component
    console.log('Item wanted:', itemId)
  }

  const handleComment = (itemId: string) => {
    // Open item detail page for commenting
    window.open(`/items/${itemId}`, '_blank')
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-[#0a0f0a] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🎣</div>
          <div className="text-white text-lg mb-2">Welcome to Bartera</div>
          <div className="text-[#8a9a8a]">Sign in to see your feed</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0f0a]">
      <TopBar />
      
      <div className="pb-20"> {/* Space for bottom nav */}
        <div className="max-w-md mx-auto">
          {/* Pull to refresh indicator */}
          {refreshing && (
            <div className="text-center py-4">
              <div className="text-[#22c55e]">Refreshing...</div>
            </div>
          )}

          {loading ? (
            <div className="px-4 py-8">
              {/* Loading skeleton */}
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-[#111a11] border border-[#1a2a1a] rounded-xl mb-4 overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-[#1a2a1a] rounded-full animate-pulse"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-3 bg-[#1a2a1a] rounded animate-pulse w-1/3"></div>
                        <div className="h-2 bg-[#1a2a1a] rounded animate-pulse w-1/4"></div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full aspect-square bg-[#1a2a1a] animate-pulse"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-[#1a2a1a] rounded animate-pulse w-3/4"></div>
                    <div className="h-3 bg-[#1a2a1a] rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : feedItems.length === 0 ? (
            <div className="px-4 py-16 text-center">
              <div className="text-6xl mb-6">🎣</div>
              <h2 className="text-xl font-bold text-white mb-3">No items in your feed</h2>
              <p className="text-[#8a9a8a] mb-6">
                Join circles to see items from friends, or be the first to post!
              </p>
              <div className="space-y-3">
                <motion.button
                  onClick={() => window.location.href = '/circles'}
                  className="w-full bg-[#22c55e] text-white py-3 px-6 rounded-xl font-semibold"
                  whileTap={{ scale: 0.95 }}
                >
                  Join Circles
                </motion.button>
                <motion.button
                  onClick={() => window.location.href = '/items/new'}
                  className="w-full border border-[#1a2a1a] text-[#8a9a8a] py-3 px-6 rounded-xl font-semibold hover:bg-[#111a11]"
                  whileTap={{ scale: 0.95 }}
                >
                  Post Your First Item
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="px-4 py-4 space-y-0">
              {feedItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
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

              {/* Load more */}
              {hasMore && (
                <div className="py-8 text-center">
                  {loadingMore ? (
                    <div className="text-[#8a9a8a]">Loading more items...</div>
                  ) : (
                    <motion.button
                      onClick={handleLoadMore}
                      className="bg-[#111a11] border border-[#1a2a1a] text-[#8a9a8a] py-2 px-6 rounded-lg hover:bg-[#1a2a1a] transition-colors"
                      whileTap={{ scale: 0.95 }}
                    >
                      Load More
                    </motion.button>
                  )}
                </div>
              )}

              {/* End of feed */}
              {!hasMore && feedItems.length > 0 && (
                <div className="py-8 text-center text-[#8a9a8a] text-sm">
                  🎣 That&apos;s all for now! Come back later for more items.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}