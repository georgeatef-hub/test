'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

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
}

interface Want {
  id: string
  createdAt: string
  item: Item & {
    user: {
      id: string
      name: string
      city: string | null
    }
  }
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [userItems, setUserItems] = useState<Item[]>([])
  const [userWants, setUserWants] = useState<Want[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load user's items
      const itemsResponse = await fetch('/api/items')
      if (itemsResponse.ok) {
        const items = await itemsResponse.json()
        setUserItems(items.filter((item: Item & { userId: string }) => item.userId === session?.user?.id))
      }

      // Load user's wants
      const wantsResponse = await fetch('/api/wants')
      if (wantsResponse.ok) {
        const wants = await wantsResponse.json()
        setUserWants(wants)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to remove this item?')) return

    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setUserItems(userItems.filter(item => item.id !== itemId))
      } else {
        alert('Error removing item')
      }
    } catch (error) {
      console.error('Error removing item:', error)
      alert('Error removing item')
    }
  }

  const removeWant = async (wantId: string) => {
    try {
      const response = await fetch(`/api/wants/${wantId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setUserWants(userWants.filter(want => want.id !== wantId))
      } else {
        alert('Error removing want')
      }
    } catch (error) {
      console.error('Error removing want:', error)
      alert('Error removing want')
    }
  }

  // Helper functions for bait score
  const getBaitLevel = (itemCount: number) => {
    if (itemCount === 0) return { text: "No Bait Yet 🪝", color: "text-gray-500" }
    if (itemCount <= 2) return { text: "Beginner Fisher 🐟", color: "text-blue-400" }
    if (itemCount <= 5) return { text: "Getting Hooked 🎣", color: "text-green-400" }
    if (itemCount <= 10) return { text: "Master Angler 🐋", color: "text-purple-400" }
    return { text: "Fishing Legend 👑", color: "text-yellow-400" }
  }

  const getProgressPercentage = (itemCount: number) => {
    if (itemCount === 0) return 0
    if (itemCount <= 2) return (itemCount / 2) * 25
    if (itemCount <= 5) return 25 + ((itemCount - 2) / 3) * 25
    if (itemCount <= 10) return 50 + ((itemCount - 5) / 5) * 25
    return 75 + Math.min((itemCount - 10) / 10, 1) * 25
  }

  const getWantStatus = (_want: Want) => {
    // For now, return placeholder status since we don't have cycle analysis
    const random = Math.random()
    if (random < 0.3) return { text: "MATCHED!", color: "text-green-400", icon: "🟢" }
    if (random < 0.6) return { text: "Almost there! 2 connections away", color: "text-yellow-400", icon: "🟡" }
    return { text: "No cycle yet", color: "text-red-400", icon: "🔴" }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  const baitLevel = getBaitLevel(userItems.length)
  const progressPercentage = getProgressPercentage(userItems.length)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {session?.user?.name}!
        </h1>
        <p className="text-gray-400 mt-1">Cast your bait and start catching great trades</p>
      </div>

      {/* Bait Score Section */}
      <div className="card p-8">
        <div className="text-center mb-6">
          <div className="text-6xl font-bold text-green-500 mb-2">{userItems.length}</div>
          <div className="text-xl text-white mb-1">Bait in the Water</div>
          <div className={`text-lg font-semibold ${baitLevel.color}`}>
            {baitLevel.text}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Add more bait to increase your chances! 🎣</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-[#0a0f0a] rounded-full h-3 border border-[#1a2a1a]">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <Link
          href="/dashboard/add-item"
          className="block w-full text-center bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
        >
          + Add Bait 🎣
        </Link>
      </div>

      {/* Your Bait - Horizontal Scroll */}
      <div className="card p-6">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="mr-2">🎣</span> Your Bait
        </h2>

        {userItems.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-4">🪝</div>
            <p>No bait in the water yet!</p>
            <p className="text-sm mt-1">Add your first item to start attracting trades</p>
          </div>
        ) : (
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {userItems.map((item) => (
              <div key={item.id} className="flex-shrink-0 w-48 bg-[#0a0f0a] border border-[#1a2a1a] rounded-lg p-4">
                <div className="h-32 bg-[#1a2a1a] rounded-lg mb-3 flex items-center justify-center">
                  {item.images.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-2xl">{item.category?.icon || '📦'}</span>
                  )}
                </div>
                <h3 className="font-semibold text-white text-sm mb-1 line-clamp-2">{item.title}</h3>
                <div className="flex items-center justify-between">
                  {item.category && (
                    <span className="text-xs text-gray-500">
                      {item.category.icon} {item.category.name}
                    </span>
                  )}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-400 text-xs"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Your Catches */}
      <div className="card p-6">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="mr-2">🎯</span> Your Catches
        </h2>

        {userWants.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-4">🎯</div>
            <p>No catches yet!</p>
            <p className="text-sm mt-1">Start swiping to catch items you want</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userWants.map((want) => {
              const status = getWantStatus(want)
              return (
                <div key={want.id} className="bg-[#0a0f0a] border border-[#1a2a1a] rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{want.item.title}</h3>
                      <p className="text-gray-400 text-sm mt-1">
                        by {want.item.user.name}
                        {want.item.user.city && ` • ${want.item.user.city}`}
                      </p>
                      <div className={`text-sm mt-2 flex items-center ${status.color}`}>
                        <span className="mr-2">{status.icon}</span>
                        {status.text}
                      </div>
                    </div>
                    <button
                      onClick={() => removeWant(want.id)}
                      className="text-red-500 hover:text-red-400 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-6">
        <div className="card p-6 text-center">
          <div className="text-2xl font-bold text-green-500">{userItems.length}</div>
          <div className="text-gray-400 text-sm">Items offered</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-2xl font-bold text-green-500">{userWants.length}</div>
          <div className="text-gray-400 text-sm">Items wanted</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-2xl font-bold text-green-500">
            {userWants.filter(w => getWantStatus(w).text === "MATCHED!").length}
          </div>
          <div className="text-gray-400 text-sm">Matches found</div>
        </div>
      </div>

      {/* Start Swiping CTA */}
      <div className="text-center">
        <Link
          href="/swipe"
          className="inline-block bg-green-500 text-white px-8 py-4 text-lg rounded-lg hover:bg-green-600 transition-colors font-medium"
        >
          Start Swiping →
        </Link>
      </div>
    </div>
  )
}