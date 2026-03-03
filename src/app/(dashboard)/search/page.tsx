'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import TopBar from '@/components/top-bar'
import BottomNav from '@/components/bottom-nav'

interface SearchItem {
  id: string
  title: string
  description?: string
  condition?: string
  tags: string[]
  images: string[]
  wantCount: number
  createdAt: string
  user: {
    id: string
    name: string
    image?: string
  }
  circle?: {
    id: string
    name: string
  }
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchItem[]>([])
  const [allItems, setAllItems] = useState<SearchItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [popularTags, setPopularTags] = useState<string[]>([])

  // Fetch all items on mount
  useEffect(() => {
    fetchAllItems()
  }, [])

  const fetchAllItems = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/feed', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        const items = data.items || data || []
        setAllItems(items)
        setResults(items)
        
        // Extract popular tags
        const tagCounts: Record<string, number> = {}
        items.forEach((item: SearchItem) => {
          item.tags?.forEach((tag: string) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1
          })
        })
        const sorted = Object.entries(tagCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([tag]) => tag)
        setPopularTags(sorted)
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter on query/tag change
  useEffect(() => {
    let filtered = allItems

    if (query.trim()) {
      const q = query.toLowerCase()
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.tags?.some(tag => tag.toLowerCase().includes(q)) ||
        item.user.name.toLowerCase().includes(q)
      )
    }

    if (selectedTag) {
      filtered = filtered.filter(item =>
        item.tags?.some(tag => tag.toLowerCase() === selectedTag.toLowerCase())
      )
    }

    setResults(filtered)
  }, [query, selectedTag, allItems])

  const conditionLabel = (c?: string) => {
    const map: Record<string, string> = {
      NEW: '✨ New', LIKE_NEW: '👌 Like New', GOOD: '👍 Good',
      FAIR: '🤷 Fair', FOR_PARTS: '🔧 Parts'
    }
    return c ? map[c] || c : ''
  }

  return (
    <>
      <TopBar />
      <main className="bt-main pb-24">
        <div className="px-4 pt-4">
          {/* Search Input */}
          <div className="relative mb-4">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search items, tags, people..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-bt-accent/30 transition-all"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Popular Tags */}
          {popularTags.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {popularTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedTag === tag
                        ? 'bg-bt-accent text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin w-8 h-8 border-3 border-bt-accent border-t-transparent rounded-full"/>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-3">🔍</p>
              <h2 className="text-lg font-bold text-gray-800 mb-1">No items found</h2>
              <p className="text-sm text-gray-500">
                {query || selectedTag ? 'Try a different search term' : 'No items available yet'}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs text-gray-500 mb-3">{results.length} item{results.length !== 1 ? 's' : ''}</p>
              <div className="space-y-3">
                <AnimatePresence>
                  {results.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        href={`/items/${item.id}`}
                        className="flex items-center gap-3 p-3 bg-white rounded-2xl border-2 border-gray-100 hover:border-bt-accent/30 transition-all"
                      >
                        {/* Image */}
                        <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {item.images?.[0] ? (
                            <Image src={item.images[0]} alt={item.title} width={64} height={64} className="w-full h-full object-cover"/>
                          ) : (
                            <span className="text-2xl">📦</span>
                          )}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-gray-800 truncate">{item.title}</h3>
                          <p className="text-xs text-gray-500">{item.user.name} {item.circle ? `· ${item.circle.name}` : ''}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {item.condition && (
                              <span className="text-xs text-gray-400">{conditionLabel(item.condition)}</span>
                            )}
                            {item.wantCount > 0 && (
                              <span className="text-xs text-bt-accent font-medium">💎 {item.wantCount}</span>
                            )}
                          </div>
                        </div>

                        {/* Arrow */}
                        <span className="text-gray-300">›</span>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  )
}
