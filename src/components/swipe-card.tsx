'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Item } from '@/types';

interface SwipeCardProps {
  item: Item;
  onSwipeLeft: (itemId: string) => void;
  onSwipeRight: (itemId: string) => void;
  isTop: boolean;
}

export default function SwipeCard({ item, onSwipeLeft, onSwipeRight, isTop }: SwipeCardProps) {
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [flyAway, setFlyAway] = useState<'left' | 'right' | null>(null);
  const [springBack, setSpringBack] = useState(false);
  const dragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const currentOffset = useRef({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const didSwipe = useRef(false);

  const SWIPE_THRESHOLD = 100;
  const MAX_ROTATION = 15;

  const handleEnd = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    const offset = currentOffset.current;

    if (Math.abs(offset.x) > SWIPE_THRESHOLD) {
      didSwipe.current = true;
      const direction = offset.x > 0 ? 'right' : 'left';
      setFlyAway(direction);
      // Delay callback to let animation play
      setTimeout(() => {
        if (direction === 'right') {
          onSwipeRight(item.id);
        } else {
          onSwipeLeft(item.id);
        }
      }, 300);
    } else {
      // Spring back
      setSpringBack(true);
      setDragOffset({ x: 0, y: 0 });
      currentOffset.current = { x: 0, y: 0 };
      setTimeout(() => setSpringBack(false), 400);
    }
  }, [item.id, onSwipeLeft, onSwipeRight]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!dragging.current) return;
    const deltaX = clientX - startPos.current.x;
    const deltaY = clientY - startPos.current.y;
    currentOffset.current = { x: deltaX, y: deltaY };
    setDragOffset({ x: deltaX, y: deltaY });
  }, []);

  useEffect(() => {
    if (!isTop) return;

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      handleMove(t.clientX, t.clientY);
    };
    const onMouseUp = () => handleEnd();
    const onTouchEnd = () => handleEnd();

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchend', onTouchEnd);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [isTop, handleMove, handleEnd]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isTop || e.button !== 0) return;
    e.preventDefault();
    dragging.current = true;
    didSwipe.current = false;
    startPos.current = { x: e.clientX, y: e.clientY };
    currentOffset.current = { x: 0, y: 0 };
    setDragOffset({ x: 0, y: 0 });
    setFlyAway(null);
    setSpringBack(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isTop) return;
    // Don't preventDefault - allow scroll detection
    const t = e.touches[0];
    dragging.current = true;
    didSwipe.current = false;
    startPos.current = { x: t.clientX, y: t.clientY };
    currentOffset.current = { x: 0, y: 0 };
    setDragOffset({ x: 0, y: 0 });
    setFlyAway(null);
    setSpringBack(false);
  };

  // Programmatic swipe (called from parent via buttons)
  // Exposed via the key-based re-render approach

  const rotation = (dragOffset.x / SWIPE_THRESHOLD) * MAX_ROTATION;
  const overlayOpacity = Math.min(Math.abs(dragOffset.x) / SWIPE_THRESHOLD, 1);

  // Stack styling for background cards
  const stackIndex = isTop ? 1 : 0;
  const scale = isTop ? 1 : 0.95;
  const yOffset = isTop ? 0 : 10;

  // Fly-away transform
  let transform: string;
  let transition: string;

  if (flyAway) {
    const flyX = flyAway === 'right' ? 1200 : -1200;
    const flyRotation = flyAway === 'right' ? 30 : -30;
    transform = `translate(${flyX}px, -100px) rotate(${flyRotation}deg) scale(${scale})`;
    transition = 'transform 0.3s ease-in, opacity 0.3s ease-in';
  } else if (dragging.current && !springBack) {
    transform = `translate(${dragOffset.x}px, ${dragOffset.y + yOffset}px) rotate(${rotation}deg) scale(${scale})`;
    transition = 'none';
  } else {
    transform = `translate(0px, ${yOffset}px) rotate(0deg) scale(${scale})`;
    transition = springBack
      ? 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      : 'transform 0.3s ease-out';
  }

  return (
    <div
      ref={cardRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={`absolute inset-0 bg-white border-2 border-bt-border rounded-2xl shadow-2xl overflow-hidden select-none ${
        isTop && !dragging.current ? 'cursor-grab' : ''
      } ${dragging.current ? 'cursor-grabbing' : ''} ${
        isTop ? 'shadow-xl' : ''
      }`}
      style={{
        zIndex: stackIndex,
        transform,
        transition,
        opacity: flyAway ? 0 : 1,
        willChange: 'transform',
        filter: isTop ? 'none' : 'brightness(0.95)',
      }}
    >
      {/* Enhanced Swipe Overlays */}
      {isTop && (
        <>
          {/* Teal glow overlay for right swipe (WANT) */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-bt-teal/90 to-bt-teal/70 flex items-center justify-center z-20 pointer-events-none bt-animate-swipe-glow"
            style={{
              opacity: dragOffset.x > 20 ? overlayOpacity : 0,
              transition: dragging.current ? 'none' : 'opacity 0.2s',
              boxShadow: dragOffset.x > 20 ? `0 0 50px var(--bt-teal)` : 'none',
            }}
          >
            <div
              className="flex flex-col items-center text-white font-bold"
              style={{
                transform: `scale(${0.8 + overlayOpacity * 0.4})`,
                transition: dragging.current ? 'none' : 'transform 0.2s',
              }}
            >
              <div className="text-8xl mb-2">💎</div>
              <div className="text-2xl tracking-wider">WANT!</div>
            </div>
          </div>

          {/* Red overlay for left swipe (PASS) */}
          <div
            className="absolute inset-0 bg-gradient-to-l from-gray-400/80 to-gray-500/70 flex items-center justify-center z-20 pointer-events-none"
            style={{
              opacity: dragOffset.x < -20 ? overlayOpacity : 0,
              transition: dragging.current ? 'none' : 'opacity 0.2s',
            }}
          >
            <div
              className="flex flex-col items-center text-white font-bold"
              style={{
                transform: `scale(${0.8 + overlayOpacity * 0.4})`,
                transition: dragging.current ? 'none' : 'transform 0.2s',
              }}
            >
              <div className="text-8xl mb-2">👎</div>
              <div className="text-2xl tracking-wider">PASS</div>
            </div>
          </div>
        </>
      )}

      {/* Card Content */}
      <div className="h-full flex flex-col">
        {/* Item Image - 60% of card height */}
        <div className="h-3/5 relative overflow-hidden">
          {item.images && item.images.length > 0 ? (
            <Image
              src={item.images[0]}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-bt-surface-secondary to-bt-surface-tertiary flex items-center justify-center">
              <span className="text-8xl opacity-60">📦</span>
            </div>
          )}

          {/* Enhanced Condition Badge */}
          <div className="absolute top-6 left-6">
            <span className={`px-3 py-2 rounded-xl text-sm font-bold text-white shadow-lg ${
              item.condition === 'NEW' ? 'bg-bt-success' :
              item.condition === 'LIKE_NEW' ? 'bg-bt-success/80' :
              item.condition === 'GOOD' ? 'bg-bt-warning' :
              item.condition === 'FAIR' ? 'bg-bt-warning/80' :
              'bg-bt-text-tertiary'
            }`}>
              {item.condition?.replace('_', ' ') ?? 'UNKNOWN'}
            </span>
          </div>

          {/* Want Count - enhanced */}
          {item.wantCount > 0 && (
            <div className="absolute top-6 right-6">
              <span className="bg-bt-teal text-white px-3 py-2 rounded-xl text-sm font-bold shadow-lg bt-animate-pulse-glow">
                💎 {item.wantCount} want{item.wantCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Hot item badge */}
          {item.wantCount >= 3 && (
            <div className="absolute bottom-6 right-6">
              <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-2 rounded-xl text-sm font-bold shadow-lg bt-animate-hot-badge">
                🔥 HOT
              </span>
            </div>
          )}
        </div>

        {/* Item Details - 40% of card height */}
        <div className="h-2/5 p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-bt-text-primary">
              {item.title}
            </h3>

            {item.description && (
              <p className="text-bt-text-secondary text-sm line-clamp-2">
                {item.description}
              </p>
            )}

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {item.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-bt-teal/20 text-bt-teal rounded-lg text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Owner Info */}
          <div className="flex items-center space-x-3 pt-4 border-t border-bt-border">
            <div className="w-12 h-12 bg-bt-accent rounded-full flex items-center justify-center text-white font-bold text-lg">
              {item.user.name[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="text-bt-text-primary font-semibold">{item.user.name}</div>
              <div className="text-bt-text-secondary text-sm">Owner</div>
            </div>
            <div className="text-2xl">👋</div>
          </div>
        </div>
      </div>
    </div>
  );
}
