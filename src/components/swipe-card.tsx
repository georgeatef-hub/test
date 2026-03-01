'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Item } from '@/types';

interface SwipeCardProps {
  item: Item;
  onSwipeLeft: (itemId: string) => void;
  onSwipeRight: (itemId: string) => void;
  isTop: boolean;
}

export default function SwipeCard({ item, onSwipeLeft, onSwipeRight, isTop }: SwipeCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const SWIPE_THRESHOLD = 100;
  const MAX_ROTATION = 15;

  useEffect(() => {
    if (!isTop) return;

    const card = cardRef.current;
    if (!card) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // Only left click
      e.preventDefault();
      setIsDragging(true);
      setStartPos({ x: e.clientX, y: e.clientY });
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      setIsDragging(true);
      const touch = e.touches[0];
      setStartPos({ x: touch.clientX, y: touch.clientY });
    };

    card.addEventListener('mousedown', handleMouseDown);
    card.addEventListener('touchstart', handleTouchStart);

    return () => {
      card.removeEventListener('mousedown', handleMouseDown);
      card.removeEventListener('touchstart', handleTouchStart);
    };
  }, [isTop]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startPos.x;
      const deltaY = e.clientY - startPos.y;
      setDragOffset({ x: deltaX, y: deltaY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const deltaX = touch.clientX - startPos.x;
      const deltaY = touch.clientY - startPos.y;
      setDragOffset({ x: deltaX, y: deltaY });
    };

    const handleEnd = () => {
      setIsDragging(false);
      
      // Check if we've swiped far enough
      if (Math.abs(dragOffset.x) > SWIPE_THRESHOLD) {
        if (dragOffset.x > 0) {
          onSwipeRight(item.id);
        } else {
          onSwipeLeft(item.id);
        }
      }
      
      // Reset position
      setDragOffset({ x: 0, y: 0 });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, startPos, dragOffset, item.id, onSwipeLeft, onSwipeRight]);

  const rotation = (dragOffset.x / 100) * MAX_ROTATION;
  const opacity = Math.abs(dragOffset.x) / SWIPE_THRESHOLD;
  
  // Calculate scale for cards in background
  const scale = isTop ? 1 : 0.95;
  const translateY = isTop ? 0 : 8;

  return (
    <div
      ref={cardRef}
      className={`absolute inset-0 bg-white border border-[#dbdbdb] rounded-xl shadow-2xl overflow-hidden transition-all duration-200 ${
        isTop && !isDragging ? 'cursor-grab' : ''
      } ${isDragging ? 'cursor-grabbing' : ''} ${isTop ? 'z-10' : 'z-0'}`}
      style={{
        transform: `translate(${dragOffset.x}px, ${dragOffset.y + translateY}px) rotate(${rotation}deg) scale(${scale})`,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out',
      }}
    >
      {/* Swipe Overlays */}
      {isTop && Math.abs(dragOffset.x) > 20 && (
        <>
          {/* Green overlay for right swipe */}
          <div
            className="absolute inset-0 bg-[#22c55e] bg-opacity-80 flex items-center justify-center z-20"
            style={{ 
              opacity: dragOffset.x > 0 ? Math.min(opacity, 1) : 0,
            }}
          >
            <div className="text-6xl text-gray-900 font-bold">✓</div>
          </div>
          
          {/* Red overlay for left swipe */}
          <div
            className="absolute inset-0 bg-[#ef4444] bg-opacity-80 flex items-center justify-center z-20"
            style={{ 
              opacity: dragOffset.x < 0 ? Math.min(opacity, 1) : 0,
            }}
          >
            <div className="text-6xl text-gray-900 font-bold">✗</div>
          </div>
        </>
      )}

      {/* Card Content */}
      <div className="h-full flex flex-col">
        {/* Item Image */}
        <div className="flex-1 relative overflow-hidden">
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
            <div className="w-full h-full bg-[#f5f5f5] flex items-center justify-center">
              <span className="text-6xl">📦</span>
            </div>
          )}
          
          {/* Condition Badge */}
          <div className="absolute top-4 left-4">
            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
              item.condition === 'NEW' ? 'bg-[#22c55e] text-gray-900' :
              item.condition === 'LIKE_NEW' ? 'bg-[#22c55e] bg-opacity-80 text-gray-900' :
              item.condition === 'GOOD' ? 'bg-[#f59e0b] text-gray-900' :
              item.condition === 'FAIR' ? 'bg-[#f59e0b] bg-opacity-80 text-gray-900' :
              'bg-[#8a9a8a] text-gray-900'
            }`}>
              {item.condition.replace('_', ' ')}
            </span>
          </div>

          {/* Want Count */}
          {item.wantCount > 0 && (
            <div className="absolute top-4 right-4">
              <span className="bg-[#f59e0b] text-gray-900 px-2 py-1 rounded-lg text-sm font-medium">
                🔥 {item.wantCount} want this
              </span>
            </div>
          )}
        </div>

        {/* Item Details */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {item.title}
            </h3>
            
            {item.description && (
              <p className="text-[#8a9a8a] text-sm line-clamp-2 mb-3">
                {item.description}
              </p>
            )}
          </div>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-[#22c55e] bg-opacity-20 text-[#22c55e] rounded-lg text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Owner Info */}
          <div className="flex items-center justify-between pt-2 border-t border-[#dbdbdb]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#22c55e] rounded-full flex items-center justify-center text-gray-900 font-bold">
                {item.user.name[0].toUpperCase()}
              </div>
              <div>
                <div className="text-gray-900 font-medium">{item.user.name}</div>
                <div className="text-[#8a9a8a] text-sm">Owner</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}