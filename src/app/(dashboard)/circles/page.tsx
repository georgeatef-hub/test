'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Circle } from '@/types';
import CreateCircleModal from '@/components/create-circle-modal';
import JoinCircleModal from '@/components/join-circle-modal';
import TopBar from '@/components/top-bar';

export default function CirclesPage() {
  const { data: session } = useSession();
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    if (session) {
      fetchCircles();
    }
  }, [session]);

  const fetchCircles = async () => {
    try {
      const response = await fetch('/api/circles', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setCircles(data);
      }
    } catch (error) {
      console.error('Error fetching circles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCircleCreated = (newCircle: Circle) => {
    setCircles(prev => [...prev, newCircle]);
    setShowCreateModal(false);
  };

  const handleCircleJoined = (joinedCircle: Circle) => {
    setCircles(prev => [...prev, joinedCircle]);
    setShowJoinModal(false);
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
            <div className="bt-body text-bt-text-secondary">Loading your circles...</div>
          </motion.div>
        </div>
      </div>
    );
  }

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
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="4"/>
                <path d="M21.17 8a3 3 0 0 0-2.35-2.35"/>
                <path d="M2.83 16a3 3 0 0 0 2.35 2.35"/>
                <path d="M12 2a3 3 0 0 1 2.35 2.35"/>
                <path d="M12 22a3 3 0 0 1-2.35-2.35"/>
              </svg>
            </div>
            <div className="flex-1">
              <h1 className="bt-heading text-2xl text-bt-text-primary">Your Circles</h1>
              <p className="bt-caption">Trade with trusted friends</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowJoinModal(true)}
              className="bt-button bt-button-secondary flex-1"
            >
              Join Circle
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bt-button bt-button-primary flex-1"
            >
              Create Circle
            </button>
          </div>
        </motion.div>

        {/* Circles List */}
        <AnimatePresence>
          {circles.length > 0 ? (
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {circles.map((circle, index) => (
                <motion.div
                  key={circle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={`/circles/${circle.id}`}
                    className="block bt-card bt-card-elevated p-4 hover:scale-102 transition-all duration-200"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="bt-heading text-lg text-bt-text-primary mb-1">
                          {circle.name}
                        </h3>
                        {circle.description && (
                          <p className="bt-caption line-clamp-2">
                            {circle.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="ml-3 p-2 rounded-lg bg-bt-accent/10 text-bt-accent">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 18l6-6-6-6"/>
                        </svg>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex gap-4">
                        <div className="text-center">
                          <div className="bt-label text-sm text-bt-text-primary">{circle.memberCount}</div>
                          <div className="bt-small text-bt-text-tertiary">{circle.memberCount === 1 ? 'member' : 'members'}</div>
                        </div>
                        <div className="text-center">
                          <div className="bt-label text-sm text-bt-text-primary">{circle.itemCount}</div>
                          <div className="bt-small text-bt-text-tertiary">items</div>
                        </div>
                        <div className="text-center">
                          <div className="bt-label text-sm text-bt-text-primary">{circle.tradeCount}</div>
                          <div className="bt-small text-bt-text-tertiary">trades</div>
                        </div>
                      </div>
                      
                      {circle.itemCount > 0 && (
                        <div className="px-2 py-1 bg-bt-success/10 text-bt-success rounded-lg">
                          <span className="text-xs font-medium">New!</span>
                        </div>
                      )}
                    </div>

                    {/* Member avatars preview */}
                    {circle.members && circle.members.length > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {circle.members.slice(0, 4).map((member) => (
                            <div
                              key={member.id}
                              className="
                                w-8 h-8 rounded-full border-2 border-white
                                bg-gradient-to-br from-bt-accent to-bt-accent-dark
                                flex items-center justify-center text-white text-xs font-bold
                                shadow-sm
                              "
                            >
                              {member.user.name[0].toUpperCase()}
                            </div>
                          ))}
                          {circle.memberCount > 4 && (
                            <div className="
                              w-8 h-8 rounded-full border-2 border-white
                              bg-bt-surface-secondary
                              flex items-center justify-center text-bt-text-tertiary text-xs font-medium
                            ">
                              +{circle.memberCount - 4}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-bt-accent text-sm font-medium">
                          View →
                        </div>
                      </div>
                    )}
                  </Link>
                </motion.div>
              ))}

              {/* Create Circle Card */}
              <motion.button
                onClick={() => setShowCreateModal(true)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: circles.length * 0.1 + 0.2 }}
                className="
                  w-full p-6 bt-card
                  border-2 border-dashed border-bt-border hover:border-bt-accent
                  bg-bt-surface hover:bg-bt-accent/5
                  transition-all duration-200 group
                  text-center
                "
              >
                <div className="
                  text-3xl text-bt-accent mb-3 
                  group-hover:scale-110 transition-transform duration-200
                ">
                  +
                </div>
                <h3 className="bt-heading text-lg text-bt-text-primary mb-2">
                  Create New Circle
                </h3>
                <p className="bt-caption">
                  Start trading with friends
                </p>
              </motion.button>
            </motion.div>
          ) : (
            /* Empty State */
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
                ⭕
              </motion.div>
              
              <h2 className="bt-heading text-xl text-bt-text-primary mb-4">
                No circles yet!
              </h2>
              
              <p className="bt-body text-bt-text-secondary mb-8 max-w-xs mx-auto">
                Create your first circle or join an existing one to start trading with friends.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bt-button bt-button-primary w-full"
                >
                  Create Circle
                </button>
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="bt-button bt-button-secondary w-full"
                >
                  Join Circle
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modals */}
        <AnimatePresence>
          {showCreateModal && (
            <CreateCircleModal
              onClose={() => setShowCreateModal(false)}
              onCircleCreated={handleCircleCreated}
            />
          )}

          {showJoinModal && (
            <JoinCircleModal
              onClose={() => setShowJoinModal(false)}
              onCircleJoined={handleCircleJoined}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}