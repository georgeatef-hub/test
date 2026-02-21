'use client'

import { useState, useEffect } from 'react'

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

  useEffect(() => {
    loadMatches()
  }, [])

  const loadMatches = async () => {
    try {
      const response = await fetch('/api/matches')
      if (response.ok) {
        const data = await response.json()
        setMatches(data)
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

  const getStatusBadge = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-500',
      CONFIRMED: 'bg-green-500',
      COMPLETED: 'bg-blue-500',
      CANCELLED: 'bg-red-500'
    }

    return (
      <span className={`px-2 py-1 text-xs rounded-full text-white ${colors[status as keyof typeof colors] || 'bg-gray-500'}`}>
        {status.toLowerCase()}
      </span>
    )
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
      <div>
        <h1 className="text-3xl font-bold text-white">Your Matches</h1>
        <p className="text-gray-400 mt-2">Trade cycles found by the matching algorithm</p>
      </div>

      {/* Matches */}
      {matches.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 text-lg mb-4">No matches found yet</div>
          <p className="text-gray-500 mb-6">
            Make sure you have items to offer and items you want, then run the matching algorithm from your dashboard.
          </p>
          <a
            href="/dashboard"
            className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {matches.map((match) => (
            <div key={match.id} className="card p-6">
              {/* Status and Score */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-bold text-white">
                    {match.cycle.members.length}-Way Trade
                  </h2>
                  {getStatusBadge(match.cycle.status)}
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Match Score</div>
                  <div className="text-lg font-bold text-green-500">
                    {Math.round(match.cycle.score)}
                  </div>
                </div>
              </div>

              {/* Your Trade */}
              <div className="bg-[#0a0f0a] border border-[#1a2a1a] rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-white mb-4">Your Part of the Trade</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-400 mb-2">You Give</div>
                    <div className="flex items-center space-x-2">
                      {match.givesItem.category?.icon && (
                        <span>{match.givesItem.category.icon}</span>
                      )}
                      <span className="text-white font-medium">{match.givesItem.title}</span>
                    </div>
                    {match.givesItem.category && (
                      <div className="text-xs text-gray-500 mt-1">
                        {match.givesItem.category.name}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-2">You Receive</div>
                    <div className="flex items-center space-x-2">
                      {match.receivesItem.category?.icon && (
                        <span>{match.receivesItem.category.icon}</span>
                      )}
                      <span className="text-white font-medium">{match.receivesItem.title}</span>
                    </div>
                    {match.receivesItem.category && (
                      <div className="text-xs text-gray-500 mt-1">
                        {match.receivesItem.category.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Trade Chain */}
              <div className="mb-6">
                <h3 className="font-semibold text-white mb-4">Complete Trade Chain</h3>
                <div className="space-y-3">
                  {match.cycle.members.map((member, index) => {
                    const nextIndex = (index + 1) % match.cycle.members.length
                    const nextMember = match.cycle.members[nextIndex]
                    
                    return (
                      <div key={member.id} className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${member.confirmed ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                          <span className="text-gray-300">{member.user.name}</span>
                          {member.user.city && (
                            <span className="text-gray-500">({member.user.city})</span>
                          )}
                        </div>
                        <span className="text-gray-400">gives</span>
                        <span className="text-white">{member.givesItem.title}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-gray-300">{nextMember.user.name}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Confirmation Status */}
              <div className="mb-6">
                <h3 className="font-semibold text-white mb-3">Confirmation Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {match.cycle.members.map((member) => (
                    <div key={member.id} className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${member.confirmed ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                      <span className="text-gray-300">{member.user.name}</span>
                      <span className={`text-xs ${member.confirmed ? 'text-green-500' : 'text-gray-500'}`}>
                        {member.confirmed ? '✓ Confirmed' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {match.cycle.status === 'PENDING' && (
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => declineTrade(match.cycle.id)}
                    disabled={actionLoading === match.cycle.id}
                    className="px-6 py-2 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === match.cycle.id ? 'Processing...' : 'Decline'}
                  </button>
                  <button
                    onClick={() => confirmTrade(match.cycle.id)}
                    disabled={actionLoading === match.cycle.id || match.confirmed}
                    className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {match.confirmed 
                      ? '✓ Confirmed' 
                      : actionLoading === match.cycle.id 
                        ? 'Processing...' 
                        : 'Confirm Trade'
                    }
                  </button>
                </div>
              )}

              {match.cycle.status === 'CONFIRMED' && (
                <div className="bg-green-500 bg-opacity-10 border border-green-500 text-green-400 p-4 rounded">
                  <div className="flex items-center space-x-2">
                    <span>🎉</span>
                    <span>Trade confirmed! All participants have agreed. Coordinate with other members to execute the trade.</span>
                  </div>
                </div>
              )}

              {match.cycle.status === 'CANCELLED' && (
                <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-400 p-4 rounded">
                  <div className="flex items-center space-x-2">
                    <span>❌</span>
                    <span>This trade was cancelled by one of the participants.</span>
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500 mt-4">
                Created {new Date(match.cycle.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}