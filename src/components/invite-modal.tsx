'use client';

import { useState } from 'react';

interface InviteModalProps {
  inviteCode: string;
  circleName: string;
  onClose: () => void;
}

export default function InviteModal({ inviteCode, circleName, onClose }: InviteModalProps) {
  const [copied, setCopied] = useState(false);
  const [copyType, setCopyType] = useState<'code' | 'link' | null>(null);

  const inviteLink = `${window.location.origin}/circles/join/${inviteCode}`;

  const copyToClipboard = async (text: string, type: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyType(type);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setCopyType(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const shareViaSystem = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${circleName} on Bartera`,
          text: `You're invited to join the trading circle "${circleName}" on Bartera!`,
          url: inviteLink,
        });
      } catch {
        // User cancelled sharing or sharing failed
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback to copying the link
      copyToClipboard(inviteLink, 'link');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#111a11] border border-[#1a2a1a] rounded-xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">📤</div>
          <h2 className="text-xl font-bold text-white mb-2">Invite Friends</h2>
          <p className="text-[#8a9a8a]">Share this code to invite people to &quot;{circleName}&quot;</p>
        </div>

        {/* Invite Code */}
        <div className="bg-[#0a0f0a] border border-[#1a2a1a] rounded-lg p-4 mb-4">
          <div className="text-center mb-3">
            <div className="text-2xl font-mono font-bold text-[#22c55e] mb-2">
              {inviteCode}
            </div>
            <button
              onClick={() => copyToClipboard(inviteCode, 'code')}
              className="text-sm text-[#8a9a8a] hover:text-[#22c55e] transition-colors"
            >
              {copied && copyType === 'code' ? (
                <span className="text-[#22c55e]">✓ Copied!</span>
              ) : (
                'Click to copy code'
              )}
            </button>
          </div>
        </div>

        {/* Invite Link */}
        <div className="bg-[#0a0f0a] border border-[#1a2a1a] rounded-lg p-4 mb-6">
          <p className="text-xs text-[#8a9a8a] mb-2 text-center">Or share this link:</p>
          <div className="break-all text-xs text-[#22c55e] mb-2 text-center">
            {inviteLink}
          </div>
          <button
            onClick={() => copyToClipboard(inviteLink, 'link')}
            className="w-full text-sm text-[#8a9a8a] hover:text-[#22c55e] transition-colors"
          >
            {copied && copyType === 'link' ? (
              <span className="text-[#22c55e]">✓ Copied link!</span>
            ) : (
              'Click to copy link'
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={shareViaSystem}
            className="w-full px-4 py-3 bg-[#22c55e] text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            📱 Share Invite
          </button>
          
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-[#1a2a1a] text-[#8a9a8a] rounded-lg hover:bg-[#2a3a2a] transition-colors"
          >
            Done
          </button>
        </div>

        {/* Tips */}
        <div className="mt-6 pt-4 border-t border-[#1a2a1a]">
          <p className="text-xs text-[#4a5a4a] text-center">
            💡 Friends can enter the code in the app or click the link to join instantly
          </p>
        </div>
      </div>
    </div>
  );
}