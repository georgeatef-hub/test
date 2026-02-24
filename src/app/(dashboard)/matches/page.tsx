'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Trade } from '@/types';
import TradeCycleVisual from '@/components/trade-cycle-visual';

export default function MatchesPage() {
  const { data: session } = useSession();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchTrades();
    }
  }, [session]);

  const fetchTrades = async () => {
    try {
      const response = await fetch('/api/trades', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setTrades(data);
      }
    } catch (error) {
      console.error('Error fetching trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (tradeId: string) => {
    try {
      const response = await fetch(`/api/trades/${tradeId}/complete`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        // Refresh trades to show updated status
        fetchTrades();
      }
    } catch (error) {
      console.error('Error completing trade:', error);
    }
  };

  const getMyTradeMember = (trade: Trade) => {
    return trade.members.find(member => member.userId === session?.user?.id);
  };

  const getTradeDeadline = (trade: Trade) => {
    const createdAt = new Date(trade.createdAt);
    const deadline = new Date(createdAt.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days
    const now = new Date();
    const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    return daysLeft;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-[#22c55e] text-lg">Loading your matches...</div>
      </div>
    );
  }

  const activeTrades = trades.filter(trade => 
    trade.status === 'MATCHED' || trade.status === 'IN_PROGRESS'
  );
  const completedTrades = trades.filter(trade => trade.status === 'COMPLETED');

  return (
    <div className="min-h-screen bg-[#fafafa] px-4 py-6 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Matches 🎉</h1>
          <p className="text-[#8a9a8a]">Trade cycles and completed exchanges</p>
        </div>

        {/* Active Trades */}
        {activeTrades.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Active Trades</h2>
            <div className="space-y-6">
              {activeTrades.map((trade) => {
                const myMember = getMyTradeMember(trade);
                const daysLeft = getTradeDeadline(trade);
                
                return (
                  <div key={trade.id} className="bg-white border border-[#dbdbdb] rounded-xl p-6">
                    {/* Trade Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          Trade in {trade.circle.name}
                        </h3>
                        <p className="text-[#8a9a8a] text-sm">
                          {trade.members.length}-way trade cycle
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-sm font-medium ${
                          daysLeft > 2 ? 'text-[#22c55e]' : 
                          daysLeft > 0 ? 'text-[#f59e0b]' : 'text-[#ef4444]'
                        }`}>
                          {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                        </div>
                        <div className="text-xs text-[#8a9a8a] mt-1">
                          Status: {trade.status.replace('_', ' ')}
                        </div>
                      </div>
                    </div>

                    {/* Trade Visualization */}
                    <TradeCycleVisual 
                      trade={trade} 
                      currentUserId={session?.user?.id || ''} 
                    />

                    {/* Participants Status */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-[#8a9a8a] mb-3">Completion Status:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {trade.members.map((member) => (
                          <div key={member.id} className="flex items-center space-x-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-gray-900 text-sm ${
                              member.isCompleted ? 'bg-[#22c55e]' : 'bg-[#8a9a8a]'
                            }`}>
                              {member.isCompleted ? '✅' : '⏳'}
                            </div>
                            <div>
                              <div className="text-gray-900 font-medium">{member.user.name}</div>
                              <div className="text-xs text-[#8a9a8a]">
                                Giving: {member.item.title}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    {myMember && !myMember.isCompleted && (
                      <button
                        onClick={() => handleMarkComplete(trade.id)}
                        className="w-full px-4 py-3 bg-[#22c55e] text-gray-900 rounded-lg font-medium hover:bg-green-600 transition-colors"
                      >
                        ✅ Mark My Part Complete
                      </button>
                    )}

                    {myMember?.isCompleted && (
                      <div className="text-center py-3 text-[#22c55e]">
                        ✅ You&apos;ve completed your part! Waiting for others...
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Completed Trades */}
        {completedTrades.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Completed Trades</h2>
            <div className="space-y-4">
              {completedTrades.map((trade) => {
                const myMember = getMyTradeMember(trade);
                
                return (
                  <div key={trade.id} className="bg-white border border-[#dbdbdb] rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">✅</div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Trade completed in {trade.circle.name}
                          </h3>
                          <p className="text-sm text-[#8a9a8a]">
                            You gave: {myMember?.item.title} → Got: {myMember?.receivesItem.title}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-[#8a9a8a]">
                        {trade.completedAt && new Date(trade.completedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {activeTrades.length === 0 && completedTrades.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🎣</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No matches yet!</h2>
            <p className="text-[#8a9a8a] mb-8 max-w-md mx-auto">
              Keep swiping to find items you want. Our algorithm will create trade cycles when opportunities arise.
            </p>
            <div className="space-y-4">
              <Link
                href="/circles"
                className="inline-block px-6 py-3 bg-[#22c55e] text-gray-900 rounded-xl font-medium hover:bg-green-600 transition-colors mr-4"
              >
                Start Swiping
              </Link>
              <Link
                href="/dashboard/add-item"
                className="inline-block px-6 py-3 bg-white border border-[#dbdbdb] text-gray-900 rounded-xl font-medium hover:bg-[#f5f5f5] transition-colors"
              >
                Add More Items
              </Link>
            </div>
          </div>
        )}

        {/* Fishing Animation for Empty State */}
        {activeTrades.length === 0 && completedTrades.length === 0 && (
          <div className="fixed bottom-10 right-10 text-4xl animate-bounce">
            🎣
          </div>
        )}
      </div>
    </div>
  );
}