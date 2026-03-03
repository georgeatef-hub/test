'use client';

import { useEffect, useState, useCallback } from 'react';
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
  const [totalItemCount, setTotalItemCount] = useState(0);
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
        // Track total to differentiate "no items" vs "all swiped"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setTotalItemCount((data as Record<string, any>).totalCount ?? data.items.length);
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

  const handleSwipe = useCallback(async (itemId: string, direction: 'LEFT' | 'RIGHT') => {
    if (swiping) return;
    setSwiping(true);

    try {
      const response = await fetch(`/api/circles/${circleId}/swipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ itemId, direction }),
      });

      if (response.ok) {
        setLastSwipedId(itemId);
        setCanUndo(direction === 'LEFT');

        setTimeout(() => {
          setCurrentIndex(prev => prev + 1);
          setSwiping(false);
        }, 350);
      } else {
        setSwiping(false);
      }
    } catch (error) {
      console.error('Error swiping:', error);
      setSwiping(false);
    }
  }, [swiping, circleId]);

  const handleUndo = async () => {
    if (!canUndo || !lastSwipedId) return;

    try {
      const response = await fetch(`/api/circles/${circleId}/swipe/undo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ itemId: lastSwipedId }),
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
    if (currentItem && !swiping) {
      handleSwipe(currentItem.id, direction);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#FF6B4A] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#8a9a8a] text-sm">Loading cards…</span>
        </div>
      </div>
    );
  }

  const currentItem = items[currentIndex];
  const nextItem = items[currentIndex + 1];
  const hasMoreItems = currentIndex < items.length;
  const allSwiped = !hasMoreItems && items.length > 0;
  const noItems = !hasMoreItems && items.length === 0 && totalItemCount === 0;

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      {/* Enhanced Header with Gamification */}
      <div className="p-4 border-b border-bt-border bg-gradient-to-r from-bt-accent/5 to-bt-teal/5">
        <div className="flex items-center justify-between mb-4">
          <Link
            href={`/circles/${circleId}`}
            className="text-bt-text-secondary hover:text-bt-text-primary transition-colors flex items-center gap-2"
          >
            <span>←</span> Back
          </Link>

          <div className="text-center">
            <h1 className="text-lg font-bold text-bt-text-primary">{circleName}</h1>
            <div className="text-sm text-bt-text-secondary">
              Swipe Mode 🎯
            </div>
          </div>

          <div className="w-16" />
        </div>

        {/* Progress indicator */}
        {hasMoreItems && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-bt-text-secondary">Progress</span>
              <span className="text-bt-accent font-bold">
                {currentIndex + 1} of {items.length}
              </span>
            </div>
            <div className="w-full bg-bt-surface-secondary rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-bt-accent to-bt-teal h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Swipe counter */}
        <div className="mt-3 text-center">
          <div className="inline-flex items-center gap-2 bg-bt-surface px-4 py-2 rounded-xl shadow-sm">
            <span className="text-2xl">🎯</span>
            <span className="text-sm font-medium text-bt-text-primary">
              You&apos;ve swiped <strong className="text-bt-accent">{currentIndex}</strong> items today!
            </span>
          </div>
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
          /* Empty State - differentiated */
          <div className="h-full flex items-center justify-center text-center">
            <div>
              {allSwiped ? (
                <>
                  <div className="text-6xl mb-6">✅</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">You&apos;ve seen them all!</h2>
                  <p className="text-[#8a9a8a] mb-8 max-w-md">
                    You&apos;ve swiped through every item in this circle. Check back later for new ones!
                  </p>
                </>
              ) : noItems ? (
                <>
                  <div className="text-6xl mb-6">🎣</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">No items yet</h2>
                  <p className="text-[#8a9a8a] mb-8 max-w-md">
                    This circle doesn&apos;t have any items to swipe on. Invite friends or add some bait!
                  </p>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-6">🎣</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Nothing to swipe</h2>
                  <p className="text-[#8a9a8a] mb-8 max-w-md">
                    No more items available right now.
                  </p>
                </>
              )}
              <div className="space-y-3">
                <Link
                  href={`/circles/${circleId}`}
                  className="block px-6 py-3 bg-[#FF6B4A] text-white rounded-xl font-medium hover:bg-[#E55A41] transition-colors"
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

      {/* Enhanced Bottom Controls */}
      {hasMoreItems && (
        <div className="p-6 border-t border-bt-border bg-gradient-to-t from-bt-surface to-transparent">
          <div className="flex items-center justify-center space-x-8">
            {/* Pass Button */}
            <button
              onClick={() => handleButtonSwipe('LEFT')}
              disabled={swiping}
              className="w-18 h-18 bg-bt-pass rounded-full flex items-center justify-center text-white text-3xl hover:bg-gray-500 active:scale-90 transition-all shadow-lg disabled:opacity-50 relative"
            >
              <span>👎</span>
              <div className="absolute -bottom-8 text-xs font-medium text-bt-text-secondary">
                PASS
              </div>
            </button>

            {/* Undo Button */}
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className="w-12 h-12 bg-bt-text-tertiary rounded-full flex items-center justify-center text-white hover:bg-bt-text-secondary transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md"
            >
              <span className="text-lg">↩</span>
            </button>

            {/* Want Button - PROMINENT with teal */}
            <button
              onClick={() => handleButtonSwipe('RIGHT')}
              disabled={swiping}
              className="w-18 h-18 bg-bt-teal rounded-full flex items-center justify-center text-white text-3xl hover:bg-bt-teal-dark active:scale-90 transition-all shadow-xl disabled:opacity-50 relative bt-animate-pulse-glow"
            >
              <span>💎</span>
              <div className="absolute -bottom-8 text-xs font-bold text-bt-teal">
                WANT!
              </div>
            </button>
          </div>

          <div className="text-center text-bt-text-secondary text-sm mt-8 space-y-1">
            <div>Drag cards or use buttons</div>
            <div className="flex items-center justify-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <span>👎</span> Pass
              </span>
              <span className="flex items-center gap-1">
                <span>↩</span> Undo
              </span>
              <span className="flex items-center gap-1">
                <span>💎</span> Want
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
