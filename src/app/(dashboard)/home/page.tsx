'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import FeedPost from '@/components/feed-post'
import StoriesRow from '@/components/stories-row'
import TopBar from '@/components/top-bar'
import BottomNav from '@/components/bottom-nav'
import { FeedItem } from '@/types'

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
          const newItems = [...allFeedItems, ...data.items]
          setAllFeedItems(newItems)
          setFeedItems(newItems)
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
  }, [session?.user, allFeedItems])

  useEffect(() => {
    fetchFeed()
  }, [])

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

  // Refresh handler removed - not currently used

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

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-ig-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🎣</div>
          <div className="text-ig-primary text-lg mb-2">Welcome to Bartera</div>
          <div className="text-ig-secondary">Sign in to see your feed</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ig-background">
      <TopBar />
      
      {/* Main content area */}
      <div style={{ 
        marginTop: '44px', 
        marginBottom: '48px',
        minHeight: 'calc(100vh - 92px)'
      }}>
        {/* Stories Row */}
        <StoriesRow 
          onFilterByUser={handleFilterByUser}
          selectedUserId={selectedUserId}
        />

        {/* Feed */}
        <div className="max-w-md mx-auto">
          {/* Pull to refresh indicator */}
          {refreshing && (
            <div className="text-center py-4 bg-white">
              <div className="text-ig-secondary text-sm">Refreshing...</div>
            </div>
          )}

          {/* Filter indicator */}
          {selectedUserId && (
            <div className="bg-white border-b border-ig-border-light px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ig-secondary">
                  Showing items from {feedItems[0]?.user.name || 'this user'}
                </span>
                <button
                  onClick={() => setSelectedUserId(null)}
                  className="text-sm text-ig-link font-medium"
                >
                  Show All
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="space-y-0">
              {/* Loading skeletons */}
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white">
                  {/* Header skeleton */}
                  <div className="flex items-center space-x-3 px-3 py-2.5">
                    <div className="w-8 h-8 bg-ig-border-light rounded-full animate-pulse"></div>
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-ig-border-light rounded animate-pulse w-1/3"></div>
                      <div className="h-2 bg-ig-border-light rounded animate-pulse w-1/4"></div>
                    </div>
                  </div>
                  {/* Image skeleton */}
                  <div className="w-full aspect-square bg-ig-border-light animate-pulse"></div>
                  {/* Content skeleton */}
                  <div className="px-3 py-3 space-y-2">
                    <div className="h-3 bg-ig-border-light rounded animate-pulse w-3/4"></div>
                    <div className="h-3 bg-ig-border-light rounded animate-pulse w-1/2"></div>
                    <div className="h-2 bg-ig-border-light rounded animate-pulse w-1/4"></div>
                  </div>
                  {/* Separator */}
                  <div className="h-px bg-ig-border-light"></div>
                </div>
              ))}
            </div>
          ) : feedItems.length === 0 ? (
            <div className="bg-white px-4 py-16 text-center">
              <div className="text-6xl mb-6">🎣</div>
              <h2 className="text-xl font-bold text-ig-primary mb-3">
                {selectedUserId ? 'No items from this user' : 'No items in your feed'}
              </h2>
              <p className="text-ig-secondary mb-6">
                {selectedUserId 
                  ? 'This user hasn\'t posted any items recently.' 
                  : 'Join circles to see items from friends, or be the first to post!'
                }
              </p>
              <div className="space-y-3">
                {selectedUserId ? (
                  <button
                    onClick={() => setSelectedUserId(null)}
                    className="w-full bg-ig-primary text-white py-3 px-6 rounded-lg font-semibold"
                  >
                    Show All Posts
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => window.location.href = '/circles'}
                      className="w-full bg-ig-primary text-white py-3 px-6 rounded-lg font-semibold"
                    >
                      Join Circles
                    </button>
                    <button
                      onClick={() => window.location.href = '/dashboard/add-item'}
                      className="w-full border border-ig-border text-ig-primary py-3 px-6 rounded-lg font-semibold hover:bg-gray-50"
                    >
                      Post Your First Item
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div>
              {feedItems.map((item, index) => (
                <div key={item.id}>
                  <FeedPost
                    item={item}
                    onLike={handleLike}
                    onWant={handleWant}
                    onComment={handleComment}
                    currentUserId={session.user.id || ''}
                  />
                  {/* Thin separator between posts */}
                  {index < feedItems.length - 1 && (
                    <div className="h-px bg-ig-border-light"></div>
                  )}
                </div>
              ))}

              {/* Load more */}
              {hasMore && !selectedUserId && (
                <div className="bg-white py-8 text-center">
                  {loadingMore ? (
                    <div className="text-ig-secondary">Loading more items...</div>
                  ) : (
                    <button
                      onClick={handleLoadMore}
                      className="bg-white border border-ig-border text-ig-primary py-2 px-6 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Load More
                    </button>
                  )}
                </div>
              )}

              {/* End of feed */}
              {(!hasMore || selectedUserId) && feedItems.length > 0 && (
                <div className="bg-white py-8 text-center text-ig-secondary text-sm">
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