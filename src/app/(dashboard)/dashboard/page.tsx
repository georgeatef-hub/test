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

interface MatchingResult {
  cyclesFound: number
  cyclesCreated: number
  totalParticipants: number
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [userItems, setUserItems] = useState<Item[]>([])
  const [userWants, setUserWants] = useState<Want[]>([])
  const [loading, setLoading] = useState(true)
  const [matchingLoading, setMatchingLoading] = useState(false)
  const [matchingResult, setMatchingResult] = useState<MatchingResult | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load user's items
      const itemsResponse = await fetch('/api/items')
      if (itemsResponse.ok) {
        const items = await itemsResponse.json()
        setUserItems(items.filter((item: any) => item.userId === session?.user?.id))
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

  const runMatching = async () => {
    setMatchingLoading(true)
    setMatchingResult(null)

    try {
      const response = await fetch('/api/matching/run', {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        setMatchingResult(data.result)
      } else {
        alert('Error running matching algorithm')
      }
    } catch (error) {
      console.error('Error running matching:', error)
      alert('Error running matching algorithm')
    } finally {
      setMatchingLoading(false)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {session?.user?.name}!
          </h1>
          <p className="text-gray-400 mt-1">Manage your items and discover new trades</p>
        </div>

        <button
          onClick={runMatching}
          disabled={matchingLoading}
          className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {matchingLoading ? 'Running...' : '🔄 Run Matching'}
        </button>
      </div>

      {/* Matching Result */}
      {matchingResult && (
        <div className="card p-6">
          <h3 className="text-xl font-bold text-white mb-4">🎉 Matching Complete!</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-500">{matchingResult.cyclesFound}</div>
              <div className="text-gray-400">Cycles Found</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">{matchingResult.cyclesCreated}</div>
              <div className="text-gray-400">Cycles Created</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">{matchingResult.totalParticipants}</div>
              <div className="text-gray-400">Participants</div>
            </div>
          </div>
          {matchingResult.cyclesCreated > 0 && (
            <div className="mt-4">
              <Link
                href="/matches"
                className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
              >
                View Your Matches →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-green-500">{userItems.length}</div>
          <div className="text-gray-400">Items Offered</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-green-500">{userWants.length}</div>
          <div className="text-gray-400">Items Wanted</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-green-500">0</div>
          <div className="text-gray-400">Active Matches</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Your Offers */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Your Offers</h2>
            <Link
              href="/dashboard/add-item"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
            >
              + Add Item
            </Link>
          </div>

          <div className="space-y-4">
            {userItems.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No items yet. Add your first item to start trading!</p>
              </div>
            ) : (
              userItems.map((item) => (
                <div key={item.id} className="bg-[#0a0f0a] border border-[#1a2a1a] rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{item.title}</h3>
                      {item.description && (
                        <p className="text-gray-400 text-sm mt-1">{item.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        {item.category && (
                          <span>
                            {item.category.icon} {item.category.name}
                          </span>
                        )}
                        {item.condition && <span>{item.condition}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-400 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Your Wants */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Your Wants</h2>
            <Link
              href="/browse"
              className="btn-secondary"
            >
              Browse Items
            </Link>
          </div>

          <div className="space-y-4">
            {userWants.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No wants yet. Browse items to find what you need!</p>
              </div>
            ) : (
              userWants.map((want) => (
                <div key={want.id} className="bg-[#0a0f0a] border border-[#1a2a1a] rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{want.item.title}</h3>
                      <p className="text-gray-400 text-sm mt-1">
                        by {want.item.user.name}
                        {want.item.user.city && ` • ${want.item.user.city}`}
                      </p>
                      {want.item.category && (
                        <div className="text-xs text-gray-500 mt-2">
                          {want.item.category.icon} {want.item.category.name}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeWant(want.id)}
                      className="text-red-500 hover:text-red-400 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}