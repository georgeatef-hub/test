'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CirclePreview } from '@/types';

export default function JoinCircleByCodePage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const inviteCode = params.code as string;
  
  const [preview, setPreview] = useState<CirclePreview | null>(null);
  const [circleId, setCircleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (session && inviteCode) {
      previewCircle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, inviteCode]);

  const previewCircle = async () => {
    try {
      const response = await fetch(`/api/circles/join/${inviteCode}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setPreview(data.preview);
        setCircleId(data.circleId);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Invalid invite code');
      }
    } catch {
      setError('Failed to load circle information');
    } finally {
      setLoading(false);
    }
  };

  const joinCircle = async () => {
    if (!circleId || !inviteCode) return;

    setJoining(true);
    setError(null);
    
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
        setSuccess(true);
        // Redirect after a brief success message
        setTimeout(() => {
          router.push(`/circles/${circleId}`);
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to join circle');
      }
    } catch {
      setError('Failed to join circle');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-[#FF6B4A] text-lg">Loading invite...</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to the Circle!</h1>
          <p className="text-[#8a9a8a] mb-8">
            You&apos;ve successfully joined {preview?.name}. Redirecting...
          </p>
          <div className="inline-block w-8 h-8 border-4 border-[#FF6B4A] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !preview) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-4xl mb-6">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invite Not Found</h1>
          <p className="text-[#8a9a8a] mb-8">
            {error || "This invite link is invalid or has expired."}
          </p>
          <div className="space-y-3">
            <Link
              href="/circles"
              className="inline-block px-6 py-3 bg-[#FF6B4A] text-gray-900 rounded-xl font-medium hover:bg-[#E55A41] transition-colors"
            >
              Browse Circles
            </Link>
            <div>
              <Link
                href="/dashboard"
                className="text-[#8a9a8a] hover:text-gray-900 transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">📤</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re Invited!</h1>
          <p className="text-[#8a9a8a]">Someone invited you to join their trading circle</p>
        </div>

        <div className="bg-white border border-[#dbdbdb] rounded-xl p-6">
          {/* Circle Preview */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-[#FF6B4A] rounded-full flex items-center justify-center text-gray-900 text-2xl font-bold mx-auto mb-4">
              ⭕
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{preview.name}</h2>
            <div className="space-y-1 text-[#8a9a8a]">
              <p>{preview.memberCount} members</p>
              <p>Admin: {preview.adminName}</p>
            </div>
          </div>

          {/* Invite Code Display */}
          <div className="bg-[#fafafa] border border-[#dbdbdb] rounded-lg p-3 mb-6 text-center">
            <div className="text-xs text-[#8a9a8a] mb-1">Invite Code</div>
            <div className="text-lg font-mono text-[#FF6B4A] font-bold">{inviteCode}</div>
          </div>

          {/* Join Button */}
          <button
            onClick={joinCircle}
            disabled={joining}
            className="w-full px-6 py-3 bg-[#FF6B4A] text-gray-900 rounded-xl font-bold hover:bg-[#E55A41] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {joining ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Joining...</span>
              </div>
            ) : (
              `Join ${preview.name}`
            )}
          </button>

          {error && (
            <div className="text-[#ef4444] text-sm text-center bg-[#ef4444] bg-opacity-10 border border-[#ef4444] border-opacity-20 rounded-lg p-3 mb-4">
              {error}
            </div>
          )}

          <div className="text-center">
            <Link
              href="/circles"
              className="text-[#8a9a8a] hover:text-gray-900 transition-colors text-sm"
            >
              Not interested? Browse other circles
            </Link>
          </div>
        </div>

        {/* What happens next */}
        <div className="mt-8 bg-white border border-[#dbdbdb] rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">What happens next?</h3>
          <ul className="space-y-1 text-xs text-[#8a9a8a]">
            <li>• You&apos;ll join {preview.name} and can see all items</li>
            <li>• Start swiping on items you want</li>
            <li>• Add your own items for others to swipe</li>
            <li>• Get matched when trade cycles form!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}