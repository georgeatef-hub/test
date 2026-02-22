'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import SwipeCard from '@/components/swipe-card'

interface Item {
  id: string
  title: string
  description: string | null
  condition: string | null
  images: string[]
  createdAt: string
  category: {
    name: string
    icon: string | null
  } | null
  user: {
    id: string
    name: string
    city: string | null
  }
  wantCount: number
}

export default function SwipePage() {
  const [items, setItems] = useState<Item[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/items?mode=swipe')
      if (response.ok) {
        const data = await response.json()
        setItems(data)
      }
    } catch (error) {
      console.error('Error loading items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSwipeLeft = async () => {
    if (actionLoading) return
    // Just skip this item (pass)
    nextCard()
  }

  const handleSwipeRight = async () => {
    if (actionLoading || currentIndex >= items.length) return

    const currentItem = items[currentIndex]
    setActionLoading(true)

    try {
      const response = await fetch('/api/wants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: currentItem.id,
        }),
      })

      if (response.ok) {
        // Successfully added want
        nextCard()
      } else {
        console.error('Error adding want')
      }
    } catch (error) {
      console.error('Error adding want:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const nextCard = () => {
    setCurrentIndex(prev => prev + 1)
  }

  const handleButtonClick = (isLike: boolean) => {
    if (isLike) {
      handleSwipeRight()
    } else {
      handleSwipeLeft()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-white text-lg">Loading items...</div>
      </div>
    )
  }

  const hasMoreItems = currentIndex < items.length
  const remainingCount = items.length - currentIndex

  return (
    <div className="max-w-md mx-auto h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 text-center border-b border-[#1a2a1a]">
        <h1 className="text-2xl font-bold text-white">Swipe to Trade</h1>
        <p className="text-gray-400 text-sm mt-1">
          {hasMoreItems ? `${remainingCount} items remaining` : 'No more items'}
        </p>
      </div>

      {/* Main swipe area */}
      <div className="flex-1 relative p-6">
        {hasMoreItems ? (
          <div className="relative h-full max-h-[70vh]">
            {/* Show current and next card for stack effect */}
            {items.slice(currentIndex, currentIndex + 2).map((item, index) => (
              <SwipeCard
                key={`${item.id}-${currentIndex + index}`}
                item={item}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                isTop={index === 0}
              />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="text-6xl mb-6">🎣</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              You&apos;ve seen everything!
            </h2>
            <p className="text-gray-400 mb-8">
              Add more bait to attract new items to trade
            </p>
            <Link
              href="/dashboard"
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              Add Bait 🎣
            </Link>
          </div>
        )}
      </div>

      {/* Bottom action buttons */}
      {hasMoreItems && (
        <div className="p-6 flex justify-center space-x-8">
          <button
            onClick={() => handleButtonClick(false)}
            disabled={actionLoading}
            className="w-16 h-16 bg-red-500 hover:bg-red-600 disabled:opacity-50 rounded-full flex items-center justify-center text-white text-2xl transition-colors shadow-lg"
          >
            ✗
          </button>
          <button
            onClick={() => handleButtonClick(true)}
            disabled={actionLoading}
            className="w-16 h-16 bg-green-500 hover:bg-green-600 disabled:opacity-50 rounded-full flex items-center justify-center text-white text-2xl transition-colors shadow-lg"
          >
            ✓
          </button>
        </div>
      )}

      {/* Loading overlay */}
      {actionLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#111a11] rounded-lg p-4">
            <div className="text-white">Processing...</div>
          </div>
        </div>
      )}
    </div>
  )
}