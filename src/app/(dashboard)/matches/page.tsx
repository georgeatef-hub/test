'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface TradeMember {
  id: string
  confirmed: boolean
  user: {
    id: string
    name: string
    city: string | null
  }
  givesItem: {
    id: string
    title: string
    category: {
      name: string
      icon: string | null
    } | null
  }
  receivesItem: {
    id: string
    title: string
    category: {
      name: string
      icon: string | null
    } | null
  }
}

interface TradeMatch {
  id: string
  confirmed: boolean
  cycle: {
    id: string
    status: string
    score: number
    createdAt: string
    members: TradeMember[]
  }
  givesItem: {
    id: string
    title: string
    category: {
      name: string
      icon: string | null
    } | null
  }
  receivesItem: {
    id: string
    title: string
    category: {
      name: string
      icon: string | null
    } | null
  }
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<TradeMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    loadMatches()
  }, [])

  const loadMatches = async () => {
    try {
      const response = await fetch('/api/matches')
      if (response.ok) {
        const data = await response.json()
        setMatches(data)
        
        // Show celebration if there are confirmed matches
        if (data.some((match: TradeMatch) => match.cycle.status === 'CONFIRMED')) {
          setShowCelebration(true)
          setTimeout(() => setShowCelebration(false), 5000)
        }
      }
    } catch (error) {
      console.error('Error loading matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const confirmTrade = async (cycleId: string) => {
    setActionLoading(cycleId)

    try {
      const response = await fetch(`/api/matches/${cycleId}/confirm`, {
        method: 'POST',
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.message)
        loadMatches() // Reload to show updated status
      } else {
        const error = await response.json()
        alert(error.error || 'Error confirming trade')
      }
    } catch (error) {
      console.error('Error confirming trade:', error)
      alert('Error confirming trade')
    } finally {
      setActionLoading(null)
    }
  }

  const declineTrade = async (cycleId: string) => {
    if (!confirm('Are you sure you want to decline this trade? This will cancel the entire trade cycle.')) {
      return
    }

    setActionLoading(cycleId)

    try {
      const response = await fetch(`/api/matches/${cycleId}/decline`, {
        method: 'POST',
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.message)
        loadMatches() // Reload to show updated status
      } else {
        const error = await response.json()
        alert(error.error || 'Error declining trade')
      }
    } catch (error) {
      console.error('Error declining trade:', error)
      alert('Error declining trade')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  const confirmedMatches = matches.filter(match => match.cycle.status === 'CONFIRMED')

  return (
    <div className="space-y-8 relative">
      {/* Confetti Animation */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          <div className="confetti">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="confetti-piece"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  backgroundColor: ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6', '#a855f7'][Math.floor(Math.random() * 5)]
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">Your Matches</h1>
        <p className="text-gray-400 mt-2">Trade circles found by the matching algorithm</p>
      </div>

      {/* Celebration View for Active Match */}
      {confirmedMatches.length > 0 && (
        <div className="card p-8 text-center bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/30">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h2 className="text-4xl font-bold text-white mb-4">IT&apos;S A MATCH!</h2>
          
          {confirmedMatches.map((match) => (
            <div key={match.id} className="mb-8">
              {/* Trade Circle Visual */}
              <div className="relative max-w-md mx-auto mb-6">
                <div className="flex items-center justify-center space-x-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#111a11] border-2 border-green-500 rounded-full flex items-center justify-center mb-2">
                      <span className="text-2xl">{match.givesItem.category?.icon || '📦'}</span>
                    </div>
                    <p className="text-sm text-gray-300">You give</p>
                    <p className="text-white font-semibold">{match.givesItem.title}</p>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="text-3xl text-green-500 mb-2">→</div>
                    <div className="text-3xl text-green-500 mb-2">→</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#111a11] border-2 border-green-500 rounded-full flex items-center justify-center mb-2">
                      <span className="text-2xl">{match.receivesItem.category?.icon || '📦'}</span>
                    </div>
                    <p className="text-sm text-gray-300">You get</p>
                    <p className="text-white font-semibold">{match.receivesItem.title}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => declineTrade(match.cycle.id)}
                  disabled={actionLoading === match.cycle.id}
                  className="px-6 py-3 border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === match.cycle.id ? 'Processing...' : 'Decline'}
                </button>
                <button
                  onClick={() => confirmTrade(match.cycle.id)}
                  disabled={actionLoading === match.cycle.id || match.confirmed}
                  className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
                >
                  {match.confirmed 
                    ? '✓ Confirmed' 
                    : actionLoading === match.cycle.id 
                      ? 'Processing...' 
                      : 'Confirm Trade!'
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All Matches List */}
      {matches.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16">
          <div className="text-6xl mb-6">🎣</div>
          <h2 className="text-2xl font-bold text-white mb-4">No matches yet. Keep swiping!</h2>
          <p className="text-gray-400 mb-8">
            Cast more bait and keep swiping to increase your chances of finding the perfect trade circle.
          </p>
          
          {/* Fishing Animation */}
          <div className="mb-8">
            <div className="text-4xl animate-bounce">🎣</div>
            <div className="text-2xl mt-2 animate-pulse">~~~</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard/add-item"
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              Add More Bait 🎣
            </Link>
            <Link
              href="/swipe"
              className="border border-green-500 text-green-500 px-6 py-3 rounded-lg hover:bg-green-500 hover:text-white transition-colors"
            >
              Start Swiping →
            </Link>
          </div>
        </div>
      ) : (
        /* Matches List */
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white">All Matches</h3>
          
          {matches.map((match) => (
            <div key={match.id} className="card p-6">
              {/* Status Badge */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-bold text-white">
                    {match.cycle.members.length}-Way Trade
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full text-white ${
                    match.cycle.status === 'CONFIRMED' ? 'bg-green-500' :
                    match.cycle.status === 'PENDING' ? 'bg-yellow-500' :
                    match.cycle.status === 'CANCELLED' ? 'bg-red-500' : 'bg-gray-500'
                  }`}>
                    {match.cycle.status.toLowerCase()}
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  Score: <span className="text-green-500 font-semibold">{Math.round(match.cycle.score)}</span>
                </div>
              </div>

              {/* Your Trade */}
              <div className="bg-[#0a0f0a] border border-[#1a2a1a] rounded-lg p-4 mb-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">You Give</div>
                    <div className="flex items-center space-x-2">
                      {match.givesItem.category?.icon && (
                        <span>{match.givesItem.category.icon}</span>
                      )}
                      <span className="text-white font-medium">{match.givesItem.title}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">You Receive</div>
                    <div className="flex items-center space-x-2">
                      {match.receivesItem.category?.icon && (
                        <span>{match.receivesItem.category.icon}</span>
                      )}
                      <span className="text-white font-medium">{match.receivesItem.title}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirmation Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-400">Status:</span>
                  {match.cycle.members.map((member) => (
                    <div key={member.id} className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${member.confirmed ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                    </div>
                  ))}
                  <span className="text-gray-400">
                    ({match.cycle.members.filter(m => m.confirmed).length}/{match.cycle.members.length} confirmed)
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(match.cycle.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .confetti-piece {
          position: absolute;
          width: 10px;
          height: 10px;
          background: #22c55e;
          animation: confetti-fall 3s linear infinite;
        }
        
        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}