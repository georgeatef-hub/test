'use client';

import { useState } from 'react';
import { Circle } from '@/types';

interface CreateCircleModalProps {
  onClose: () => void;
  onCircleCreated: (circle: Circle) => void;
}

export default function CreateCircleModal({ onClose, onCircleCreated }: CreateCircleModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/circles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
        }),
      });

      if (response.ok) {
        const newCircle = await response.json();
        setInviteCode(newCircle.inviteCode);
        onCircleCreated(newCircle);
      } else {
        console.error('Failed to create circle');
      }
    } catch (error) {
      console.error('Error creating circle:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = async () => {
    if (inviteCode) {
      try {
        await navigator.clipboard.writeText(inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy invite code:', error);
      }
    }
  };

  const copyInviteLink = async () => {
    if (inviteCode) {
      const link = `${window.location.origin}/circles/join/${inviteCode}`;
      try {
        await navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy invite link:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-[#dbdbdb] rounded-xl max-w-md w-full p-6">
        {!inviteCode ? (
          // Create Circle Form
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Circle</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#8a9a8a] mb-2">
                  Circle Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#fafafa] border border-[#dbdbdb] rounded-lg text-gray-900 placeholder-[#4a5a4a] focus:border-[#22c55e] focus:outline-none"
                  placeholder="e.g., Bay Area Traders"
                  maxLength={50}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#8a9a8a] mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#fafafa] border border-[#dbdbdb] rounded-lg text-gray-900 placeholder-[#4a5a4a] focus:border-[#22c55e] focus:outline-none resize-none"
                  placeholder="What's this circle for?"
                  rows={3}
                  maxLength={200}
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-[#f5f5f5] text-[#8a9a8a] rounded-lg hover:bg-[#2a3a2a] transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#22c55e] text-gray-900 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  disabled={loading || !name.trim()}
                >
                  {loading ? 'Creating...' : 'Create Circle'}
                </button>
              </div>
            </form>
          </>
        ) : (
          // Success State with Invite Code
          <>
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🎉</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Circle Created!</h2>
              <p className="text-[#8a9a8a]">Invite friends with this code:</p>
            </div>
            
            <div className="bg-[#fafafa] border border-[#dbdbdb] rounded-lg p-4 mb-4">
              <div className="text-center mb-3">
                <div className="text-3xl font-mono font-bold text-[#22c55e] mb-2">
                  {inviteCode}
                </div>
                <button
                  onClick={copyInviteCode}
                  className="text-sm text-[#8a9a8a] hover:text-[#22c55e] transition-colors"
                >
                  {copied ? 'Copied! ✓' : 'Click to copy code'}
                </button>
              </div>
              
              <div className="border-t border-[#dbdbdb] pt-3">
                <p className="text-xs text-[#8a9a8a] mb-2 text-center">Or share this link:</p>
                <button
                  onClick={copyInviteLink}
                  className="w-full text-xs text-[#22c55e] hover:text-green-600 transition-colors break-all"
                >
                  {window.location.origin}/circles/join/{inviteCode}
                </button>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-[#22c55e] text-gray-900 rounded-lg hover:bg-green-600 transition-colors"
            >
              Done
            </button>
          </>
        )}
      </div>
    </div>
  );
}