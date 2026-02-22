'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Circle } from '@/types';
import InviteModal from '@/components/invite-modal';

export default function CircleDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const circleId = params.id as string;
  
  const [circle, setCircle] = useState<Circle | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    if (session && circleId) {
      fetchCircle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, circleId]);

  const fetchCircle = async () => {
    try {
      const response = await fetch(`/api/circles/${circleId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setCircle(data);
        setEditName(data.name);
        setEditDescription(data.description || '');
      } else {
        router.push('/circles');
      }
    } catch (error) {
      console.error('Error fetching circle:', error);
      router.push('/circles');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = circle?.adminId === session?.user?.id;

  const handleLeaveCircle = async () => {
    if (!circle) return;
    
    try {
      const response = await fetch(`/api/circles/${circle.id}/leave`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        router.push('/circles');
      }
    } catch (error) {
      console.error('Error leaving circle:', error);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!circle || !confirm('Remove this member from the circle?')) return;
    
    try {
      const response = await fetch(`/api/circles/${circle.id}/members/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setCircle(prev => prev ? {
          ...prev,
          members: prev.members?.filter(m => m.userId !== userId) || [],
          memberCount: prev.memberCount - 1
        } : null);
      }
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const handleUpdateCircle = async () => {
    if (!circle || !editName.trim()) return;
    
    try {
      const response = await fetch(`/api/circles/${circle.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim() || undefined,
        }),
      });
      
      if (response.ok) {
        const updatedCircle = await response.json();
        setCircle(updatedCircle);
        setEditMode(false);
      }
    } catch (error) {
      console.error('Error updating circle:', error);
    }
  };

  const handleDeleteCircle = async () => {
    if (!circle) return;
    
    try {
      const response = await fetch(`/api/circles/${circle.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        router.push('/circles');
      }
    } catch (error) {
      console.error('Error deleting circle:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f0a] flex items-center justify-center">
        <div className="text-[#22c55e] text-lg">Loading circle...</div>
      </div>
    );
  }

  if (!circle) {
    return (
      <div className="min-h-screen bg-[#0a0f0a] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⭕</div>
          <h2 className="text-xl text-white mb-2">Circle not found</h2>
          <Link href="/circles" className="text-[#22c55e] hover:text-green-400">
            Back to circles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f0a] px-4 py-6 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              href="/circles"
              className="text-[#8a9a8a] hover:text-white transition-colors"
            >
              ← Back to circles
            </Link>
          </div>

          <div className="bg-[#111a11] border border-[#1a2a1a] rounded-xl p-6">
            {editMode ? (
              // Edit Mode
              <div className="space-y-4">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-2xl font-bold bg-[#0a0f0a] border border-[#1a2a1a] rounded-lg px-3 py-2 text-white w-full focus:border-[#22c55e] focus:outline-none"
                  maxLength={50}
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-[#0a0f0a] border border-[#1a2a1a] rounded-lg px-3 py-2 text-[#8a9a8a] resize-none focus:border-[#22c55e] focus:outline-none"
                  placeholder="Circle description..."
                  rows={2}
                  maxLength={200}
                />
                <div className="flex space-x-3">
                  <button
                    onClick={handleUpdateCircle}
                    className="px-4 py-2 bg-[#22c55e] text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setEditName(circle.name);
                      setEditDescription(circle.description || '');
                    }}
                    className="px-4 py-2 bg-[#1a2a1a] text-[#8a9a8a] rounded-lg hover:bg-[#2a3a2a] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // Display Mode
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {circle.name}
                      {isAdmin && (
                        <span className="ml-3 px-2 py-1 bg-[#22c55e] bg-opacity-20 text-[#22c55e] text-sm rounded-lg">
                          Admin
                        </span>
                      )}
                    </h1>
                    {circle.description && (
                      <p className="text-[#8a9a8a] mb-4">{circle.description}</p>
                    )}
                    <div className="flex space-x-6 text-sm text-[#8a9a8a]">
                      <span>{circle.memberCount} members</span>
                      <span>{circle.itemCount} items</span>
                      <span>{circle.tradeCount} trades</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="px-4 py-2 bg-[#22c55e] text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      📤 Invite
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => setEditMode(true)}
                        className="px-4 py-2 bg-[#111a11] border border-[#1a2a1a] text-white rounded-lg hover:bg-[#1a2a1a] transition-colors"
                      >
                        ✏️ Edit
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#1a2a1a]">
                  <Link
                    href={`/circles/${circle.id}/swipe`}
                    className="inline-block bg-[#22c55e] text-white px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition-colors"
                  >
                    🎯 Swipe in this Circle →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Members Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Members</h2>
          <div className="bg-[#111a11] border border-[#1a2a1a] rounded-xl divide-y divide-[#1a2a1a]">
            {circle.members?.map((member) => (
              <div key={member.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#22c55e] rounded-full flex items-center justify-center text-white font-bold">
                    {member.user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {member.user.name}
                      {member.userId === circle.adminId && (
                        <span className="ml-2 px-2 py-0.5 bg-[#22c55e] bg-opacity-20 text-[#22c55e] text-xs rounded">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-[#8a9a8a]">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                {member.userId !== session?.user?.id && (
                  <button
                    onClick={() => handleRemoveMember(member.userId)}
                    className="text-[#ef4444] hover:bg-[#ef4444] hover:bg-opacity-10 px-2 py-1 rounded transition-colors text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Settings Section */}
        <div className="bg-[#111a11] border border-[#1a2a1a] rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Settings</h2>
          
          <div className="space-y-3">
            {!isAdmin && (
              <button
                onClick={handleLeaveCircle}
                className="w-full px-4 py-2 bg-[#ef4444] text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Leave Circle
              </button>
            )}
            
            {isAdmin && (
              <>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full px-4 py-2 bg-[#ef4444] text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete Circle
                </button>
              </>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-[#111a11] border border-[#1a2a1a] rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-white mb-4">Delete Circle</h3>
              <p className="text-[#8a9a8a] mb-6">
                Are you sure you want to delete &quot;{circle.name}&quot;? This action cannot be undone.
                All members will be removed and ongoing trades will be cancelled.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-[#1a2a1a] text-[#8a9a8a] rounded-lg hover:bg-[#2a3a2a] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCircle}
                  className="flex-1 px-4 py-2 bg-[#ef4444] text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invite Modal */}
        {showInviteModal && circle && (
          <InviteModal
            inviteCode={circle.inviteCode}
            circleName={circle.name}
            onClose={() => setShowInviteModal(false)}
          />
        )}
      </div>
    </div>
  );
}