'use client';

import { useState } from 'react';
import { Circle, CirclePreview } from '@/types';

interface JoinCircleModalProps {
  onClose: () => void;
  onCircleJoined: (circle: Circle) => void;
}

export default function JoinCircleModal({ onClose, onCircleJoined }: JoinCircleModalProps) {
  const [inviteCode, setInviteCode] = useState('');
  const [preview, setPreview] = useState<CirclePreview | null>(null);
  const [circleId, setCircleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value.toUpperCase().slice(0, 12); // Max 12 chars
    setInviteCode(code);
    setError(null);
    setPreview(null);
    setCircleId(null);
  };

  const previewCircle = async () => {
    if (!inviteCode.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/circles/join/${inviteCode}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setPreview({
          name: data.name,
          memberCount: data.memberCount,
          adminName: data.adminName,
        });
        setCircleId(data.id);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Invalid invite code');
      }
    } catch {
      setError('Failed to preview circle');
    } finally {
      setLoading(false);
    }
  };

  const joinCircle = async () => {
    if (!circleId || !inviteCode) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/circles/${circleId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ inviteCode }),
      });

      if (response.ok) {
        const joinedCircle = await response.json();
        onCircleJoined(joinedCircle);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to join circle');
      }
    } catch {
      setError('Failed to join circle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-[#dbdbdb] rounded-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Join Circle</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#8a9a8a] mb-2">
              Invite Code
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={inviteCode}
                onChange={handleCodeChange}
                className="flex-1 px-3 py-2 bg-[#fafafa] border border-[#dbdbdb] rounded-lg text-gray-900 placeholder-[#4a5a4a] focus:border-[#FF6B4A] focus:outline-none font-mono text-center uppercase"
                placeholder="ABCDEF123"
                maxLength={12}
              />
              <button
                onClick={previewCircle}
                disabled={loading || !inviteCode.trim()}
                className="px-4 py-2 bg-[#FF6B4A] text-gray-900 rounded-lg hover:bg-[#E55A41] transition-colors disabled:opacity-50 disabled:hover:bg-[#FF6B4A]"
              >
                {loading ? '...' : 'Look Up'}
              </button>
            </div>
            {error && (
              <p className="text-[#ef4444] text-sm mt-2">{error}</p>
            )}
          </div>

          {preview && (
            <div className="bg-[#fafafa] border border-[#dbdbdb] rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="text-2xl">⭕</div>
                <div>
                  <h3 className="font-semibold text-gray-900">{preview.name}</h3>
                  <p className="text-sm text-[#8a9a8a]">
                    {preview.memberCount} members • Admin: {preview.adminName}
                  </p>
                </div>
              </div>
              
              <button
                onClick={joinCircle}
                disabled={loading}
                className="w-full px-4 py-2 bg-[#FF6B4A] text-gray-900 rounded-lg hover:bg-[#E55A41] transition-colors disabled:opacity-50"
              >
                {loading ? 'Joining...' : `Join ${preview.name}`}
              </button>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-[#f5f5f5] text-[#8a9a8a] rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            {!preview && (
              <button
                onClick={previewCircle}
                disabled={loading || !inviteCode.trim()}
                className="flex-1 px-4 py-2 bg-[#FF6B4A] text-white rounded-lg hover:bg-[#E55A41] transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Join Circle'}
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#dbdbdb]">
          <p className="text-xs text-[#4a5a4a] text-center">
            💡 Tip: Ask a friend for their circle&apos;s invite code, or click an invite link they shared
          </p>
        </div>
      </div>
    </div>
  );
}