'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Item, SwipeData } from '@/types';
import SwipeCard from '@/components/swipe-card';

export default function CircleSwipePage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const circleId = params.id as string;
  
  const [items, setItems] = useState<Item[]>([]);
  const [circleName, setCircleName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canUndo, setCanUndo] = useState(false);
  const [lastSwipedId, setLastSwipedId] = useState<string | null>(null);
  const [swiping, setSwiping] = useState(false);

  useEffect(() => {
    if (session && circleId) {
      fetchSwipeData();
      fetchCircleName();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, circleId]);

  const fetchSwipeData = async () => {
    try {
      const response = await fetch(`/api/circles/${circleId}/swipe`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data: SwipeData = await response.json();
        setItems(data.items);
      } else {
        router.push('/circles');
      }
    } catch (error) {
      console.error('Error fetching swipe data:', error);
      router.push('/circles');
    } finally {
      setLoading(false);
    }
  };

  const fetchCircleName = async () => {
    try {
      const response = await fetch(`/api/circles/${circleId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const circle = await response.json();
        setCircleName(circle.name);
      }
    } catch (error) {
      console.error('Error fetching circle name:', error);
    }
  };

  const handleSwipe = async (itemId: string, direction: 'LEFT' | 'RIGHT') => {
    if (swiping) return;
    setSwiping(true);

    try {
      const response = await fetch(`/api/circles/${circleId}/swipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          itemId,
          direction,
        }),
      });

      if (response.ok) {
        setLastSwipedId(itemId);
        setCanUndo(direction === 'LEFT'); // Can only undo left swipes
        
        // Move to next card with animation delay
        setTimeout(() => {
          setCurrentIndex(prev => prev + 1);
          setSwiping(false);
        }, 300);
      }
    } catch (error) {
      console.error('Error swiping:', error);
      setSwiping(false);
    }
  };

  const handleUndo = async () => {
    if (!canUndo || !lastSwipedId) return;

    try {
      const response = await fetch(`/api/circles/${circleId}/swipe/undo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          itemId: lastSwipedId,
        }),
      });

      if (response.ok) {
        setCurrentIndex(prev => prev - 1);
        setCanUndo(false);
        setLastSwipedId(null);
      }
    } catch (error) {
      console.error('Error undoing swipe:', error);
    }
  };

  const handleButtonSwipe = (direction: 'LEFT' | 'RIGHT') => {
    const currentItem = items[currentIndex];
    if (currentItem) {
      handleSwipe(currentItem.id, direction);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-[#22c55e] text-lg">Loading swipe cards...</div>
      </div>
    );
  }

  const currentItem = items[currentIndex];
  const nextItem = items[currentIndex + 1];
  const hasMoreItems = currentIndex < items.length;

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#dbdbdb]">
        <div className="flex items-center justify-between">
          <Link
            href={`/circles/${circleId}`}
            className="text-[#8a9a8a] hover:text-gray-900 transition-colors"
          >
            ← Back
          </Link>
          
          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-900">{circleName}</h1>
            <p className="text-sm text-[#8a9a8a]">
              {items.length - currentIndex} items remaining
            </p>
          </div>
          
          <div className="w-16"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Card Stack Area */}
      <div className="flex-1 relative p-4">
        {hasMoreItems ? (
          <div className="relative w-full max-w-sm mx-auto h-full">
            {/* Next card (background) */}
            {nextItem && (
              <SwipeCard
                key={`${nextItem.id}-next`}
                item={nextItem}
                onSwipeLeft={() => {}}
                onSwipeRight={() => {}}
                isTop={false}
              />
            )}
            
            {/* Current card (top) */}
            {currentItem && (
              <SwipeCard
                key={`${currentItem.id}-current`}
                item={currentItem}
                onSwipeLeft={(itemId) => handleSwipe(itemId, 'LEFT')}
                onSwipeRight={(itemId) => handleSwipe(itemId, 'RIGHT')}
                isTop={true}
              />
            )}
          </div>
        ) : (
          /* Empty State */
          <div className="h-full flex items-center justify-center text-center">
            <div>
              <div className="text-6xl mb-6">🎣</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">You&apos;ve seen everything!</h2>
              <p className="text-[#8a9a8a] mb-8 max-w-md">
                Invite more friends or add more bait to keep the trading flowing.
              </p>
              <div className="space-y-3">
                <Link
                  href={`/circles/${circleId}`}
                  className="block px-6 py-3 bg-[#22c55e] text-gray-900 rounded-xl font-medium hover:bg-green-600 transition-colors"
                >
                  📤 Invite Friends
                </Link>
                <Link
                  href="/dashboard/add-item"
                  className="block px-6 py-3 bg-white border border-[#dbdbdb] text-gray-900 rounded-xl font-medium hover:bg-[#f5f5f5] transition-colors"
                >
                  🎣 Add More Bait
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      {hasMoreItems && (
        <div className="p-6 border-t border-[#dbdbdb]">
          <div className="flex items-center justify-center space-x-6">
            {/* Pass Button */}
            <button
              onClick={() => handleButtonSwipe('LEFT')}
              disabled={swiping}
              className="w-16 h-16 bg-[#ef4444] rounded-full flex items-center justify-center text-gray-900 text-2xl hover:bg-red-600 transition-colors shadow-lg disabled:opacity-50"
            >
              ✗
            </button>
            
            {/* Undo Button */}
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className="w-12 h-12 bg-[#8a9a8a] rounded-full flex items-center justify-center text-gray-900 hover:bg-[#9aaa9a] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ↩️
            </button>
            
            {/* Want Button */}
            <button
              onClick={() => handleButtonSwipe('RIGHT')}
              disabled={swiping}
              className="w-16 h-16 bg-[#22c55e] rounded-full flex items-center justify-center text-gray-900 text-2xl hover:bg-green-600 transition-colors shadow-lg disabled:opacity-50"
            >
              ✓
            </button>
          </div>
          
          {/* Instructions */}
          <p className="text-center text-[#8a9a8a] text-sm mt-4">
            Drag cards or use buttons • ← Pass | Undo | Want →
          </p>
        </div>
      )}
    </div>
  );
}