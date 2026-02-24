'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Circle } from '@/types';
import CreateCircleModal from '@/components/create-circle-modal';
import JoinCircleModal from '@/components/join-circle-modal';

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
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-[#22c55e] text-lg">Loading circles...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] px-4 py-6 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Circles ⭕</h1>
            <p className="text-[#8a9a8a]">Trade with trusted friends and communities</p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="px-4 py-2 bg-white border border-[#dbdbdb] text-gray-900 rounded-lg hover:bg-[#f5f5f5] transition-colors"
            >
              Join Circle
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-[#22c55e] text-gray-900 rounded-lg hover:bg-green-600 transition-colors"
            >
              + Create Circle
            </button>
          </div>
        </div>

        {/* Circles Grid */}
        {circles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {circles.map((circle) => (
              <Link
                key={circle.id}
                href={`/circles/${circle.id}`}
                className="bg-white border border-[#dbdbdb] rounded-xl p-6 hover:bg-[#f5f5f5] transition-colors group"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-[#22c55e] transition-colors">
                    {circle.name}
                  </h3>
                  <div className="text-[#8a9a8a] group-hover:text-[#22c55e] transition-colors">
                    →
                  </div>
                </div>
                
                {circle.description && (
                  <p className="text-[#8a9a8a] text-sm mb-4 line-clamp-2">
                    {circle.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex space-x-4 text-[#8a9a8a]">
                    <span>{circle.memberCount} members</span>
                    <span>{circle.itemCount} items</span>
                    <span>{circle.tradeCount} trades</span>
                  </div>
                  
                  {circle.itemCount > 0 && (
                    <span className="bg-[#22c55e] bg-opacity-20 text-[#22c55e] px-2 py-1 rounded text-xs">
                      New!
                    </span>
                  )}
                </div>

                {/* Member avatars preview */}
                {circle.members && circle.members.length > 0 && (
                  <div className="flex -space-x-2 mt-4">
                    {circle.members.slice(0, 4).map((member) => (
                      <div
                        key={member.id}
                        className="w-8 h-8 bg-[#22c55e] rounded-full border-2 border-[#111a11] flex items-center justify-center text-gray-900 text-sm font-bold"
                      >
                        {member.user.name[0].toUpperCase()}
                      </div>
                    ))}
                    {circle.memberCount > 4 && (
                      <div className="w-8 h-8 bg-[#f5f5f5] rounded-full border-2 border-[#111a11] flex items-center justify-center text-[#8a9a8a] text-xs">
                        +{circle.memberCount - 4}
                      </div>
                    )}
                  </div>
                )}
              </Link>
            ))}

            {/* Create Circle Card */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-white border border-[#dbdbdb] border-dashed rounded-xl p-6 hover:bg-[#f5f5f5] transition-colors group text-center min-h-[200px] flex flex-col items-center justify-center"
            >
              <div className="text-4xl text-[#22c55e] mb-3 group-hover:scale-110 transition-transform">
                +
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Circle</h3>
              <p className="text-[#8a9a8a] text-sm">
                Start trading with friends
              </p>
            </button>
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="text-6xl mb-6">⭕</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No circles yet!</h2>
            <p className="text-[#8a9a8a] mb-8 max-w-md mx-auto">
              Create your first circle or join an existing one to start trading with friends.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-[#22c55e] text-gray-900 rounded-xl font-medium hover:bg-green-600 transition-colors"
              >
                Create Circle
              </button>
              <button
                onClick={() => setShowJoinModal(true)}
                className="px-6 py-3 bg-white border border-[#dbdbdb] text-gray-900 rounded-xl font-medium hover:bg-[#f5f5f5] transition-colors"
              >
                Join Circle
              </button>
            </div>
          </div>
        )}

        {/* Modals */}
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
      </div>
    </div>
  );
}