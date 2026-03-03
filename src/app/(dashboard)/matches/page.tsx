'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Trade } from '@/types';
import TradeCycleVisual from '@/components/trade-cycle-visual';
import TopBar from '@/components/top-bar';

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
      <div className="min-h-screen bg-bt-background">
        <TopBar />
        <div 
          className="flex items-center justify-center"
          style={{ 
            paddingTop: 'var(--bt-header-height)',
            minHeight: 'calc(100vh - var(--bt-header-height))'
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-bt-accent/10 flex items-center justify-center mb-4">
              <div className="w-8 h-8 border-3 border-bt-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="bt-body text-bt-text-secondary">Loading your matches...</div>
          </motion.div>
        </div>
      </div>
    );
  }

  const activeTrades = trades.filter(trade => 
    trade.status === 'MATCHED' || trade.status === 'IN_PROGRESS'
  );
  const completedTrades = trades.filter(trade => trade.status === 'COMPLETED');

  return (
    <div className="min-h-screen bg-bt-background">
      <TopBar />
      
      <div 
        className="px-4 py-6 max-w-md mx-auto"
        style={{ paddingTop: 'calc(var(--bt-header-height) + 1.5rem)' }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-bt-accent rounded-xl flex items-center justify-center">
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="white" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M8 3L4 7l4 4"/>
                <path d="M4 7h11a4 4 0 0 1 4 4v1"/>
                <path d="M16 21l4-4-4-4"/>
                <path d="M20 17H9a4 4 0 0 1-4-4v-1"/>
              </svg>
            </div>
            <div className="flex-1">
              <h1 className="bt-heading text-2xl text-bt-text-primary">Your Trades</h1>
              <p className="bt-caption">Active cycles and completed exchanges</p>
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {/* Active Trades */}
          {activeTrades.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h2 className="bt-heading text-lg text-bt-text-primary mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-bt-success rounded-full animate-pulse"></span>
                Active Trades
              </h2>
              
              <div className="space-y-4">
                {activeTrades.map((trade, index) => {
                  const myMember = getMyTradeMember(trade);
                  const daysLeft = getTradeDeadline(trade);
                  
                  return (
                    <motion.div 
                      key={trade.id} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bt-card p-4"
                    >
                      {/* Trade Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="bt-heading text-base text-bt-text-primary mb-1">
                            Trade in {trade.circle.name}
                          </h3>
                          <p className="bt-caption">
                            {trade.members.length}-way cycle
                          </p>
                        </div>
                        
                        <div className="text-right ml-3">
                          <div className={`text-xs font-medium px-2 py-1 rounded-lg ${
                            daysLeft > 2 
                              ? 'bg-bt-success/10 text-bt-success' 
                              : daysLeft > 0 
                                ? 'bg-bt-warning/10 text-bt-warning' 
                                : 'bg-bt-error/10 text-bt-error'
                          }`}>
                            {daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'}
                          </div>
                        </div>
                      </div>

                      {/* Trade Visualization */}
                      <div className="mb-4">
                        <TradeCycleVisual 
                          trade={trade} 
                          currentUserId={session?.user?.id || ''} 
                        />
                      </div>

                      {/* Participants Status */}
                      <div className="mb-4">
                        <h4 className="bt-label text-xs text-bt-text-secondary mb-2 uppercase tracking-wide">
                          Completion Status
                        </h4>
                        <div className="space-y-2">
                          {trade.members.map((member) => (
                            <div key={member.id} className="flex items-center gap-3">
                              <div className={`
                                w-6 h-6 rounded-full flex items-center justify-center text-white text-xs
                                ${member.isCompleted 
                                  ? 'bg-bt-success' 
                                  : 'bg-bt-text-tertiary'
                                }
                              `}>
                                {member.isCompleted ? '✓' : '○'}
                              </div>
                              <div className="flex-1">
                                <div className="bt-label text-sm text-bt-text-primary">
                                  {member.user.name}
                                </div>
                                <div className="bt-small text-bt-text-secondary">
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
                          className="bt-button bt-button-primary w-full"
                        >
                          <span>✓</span>
                          <span>Mark Complete</span>
                        </button>
                      )}

                      {myMember?.isCompleted && (
                        <div className="
                          text-center py-3 px-4 
                          bg-bt-success/10 text-bt-success 
                          rounded-xl border border-bt-success/20
                        ">
                          <span className="bt-label text-sm">✓ Completed! Waiting for others...</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Completed Trades */}
          {completedTrades.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="bt-heading text-lg text-bt-text-primary mb-4 flex items-center gap-2">
                <span>✓</span>
                Completed Trades
              </h2>
              
              <div className="space-y-3">
                {completedTrades.map((trade, index) => {
                  const myMember = getMyTradeMember(trade);
                  
                  return (
                    <motion.div 
                      key={trade.id} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bt-card p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="text-2xl">✅</div>
                          <div className="flex-1">
                            <h3 className="bt-label text-sm text-bt-text-primary">
                              Trade in {trade.circle.name}
                            </h3>
                            <p className="bt-small text-bt-text-secondary">
                              Gave: {myMember?.item.title} → Got: {myMember?.receivesItem.title}
                            </p>
                          </div>
                        </div>
                        <div className="bt-small text-bt-text-tertiary">
                          {trade.completedAt && new Date(trade.completedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {activeTrades.length === 0 && completedTrades.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
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
                No matches yet!
              </h2>
              
              <p className="bt-body text-bt-text-secondary mb-8 max-w-xs mx-auto">
                Keep swiping to find items you want. Our algorithm creates trade cycles when opportunities arise.
              </p>
              
              <div className="space-y-3">
                <Link
                  href="/circles"
                  className="bt-button bt-button-primary w-full inline-flex items-center justify-center"
                >
                  Start Swiping
                </Link>
                <Link
                  href="/dashboard/add-item"
                  className="bt-button bt-button-secondary w-full inline-flex items-center justify-center"
                >
                  Add More Items
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating trade animation for empty state */}
        {activeTrades.length === 0 && completedTrades.length === 0 && (
          <motion.div
            className="fixed bottom-20 right-6 text-4xl"
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0] 
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            🎣
          </motion.div>
        )}
      </div>
    </div>
  );
}