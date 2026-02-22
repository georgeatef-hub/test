'use client'

import { useState, useRef, useEffect } from 'react'

interface SwipeCardProps {
  item: {
    id: string
    title: string
    description?: string | null
    category?: { name: string; icon: string | null } | null
    condition?: string | null
    user: { name: string; city?: string | null }
    wantCount: number
    images: string[]
  }
  onSwipeLeft: () => void
  onSwipeRight: () => void
  isTop: boolean // only top card is interactive
}

export default function SwipeCard({ item, onSwipeLeft, onSwipeRight, isTop }: SwipeCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isAnimating, setIsAnimating] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleStart = (clientX: number, clientY: number) => {
    if (!isTop || isAnimating) return
    setIsDragging(true)
    setDragStart({ x: clientX, y: clientY })
  }

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || !isTop) return
    
    const deltaX = clientX - dragStart.x
    const deltaY = clientY - dragStart.y
    setDragOffset({ x: deltaX, y: deltaY })
  }

  const handleEnd = () => {
    if (!isDragging || !isTop) return
    setIsDragging(false)

    const threshold = 100
    const { x } = dragOffset

    if (Math.abs(x) > threshold) {
      // Animate card off screen
      setIsAnimating(true)
      if (x > 0) {
        // Swipe right
        onSwipeRight()
      } else {
        // Swipe left
        onSwipeLeft()
      }
    } else {
      // Snap back
      setDragOffset({ x: 0, y: 0 })
    }
  }

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    handleStart(e.clientX, e.clientY)
  }

  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientX, e.clientY)
  }

  const handleMouseUp = () => {
    handleEnd()
  }

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    handleStart(touch.clientX, touch.clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    handleMove(touch.clientX, touch.clientY)
  }

  const handleTouchEnd = () => {
    handleEnd()
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging])

  // Calculate rotation and opacity for visual feedback
  const rotation = dragOffset.x * 0.1 // Slight rotation based on horizontal drag
  const opacity = Math.abs(dragOffset.x) > 50 ? Math.min(Math.abs(dragOffset.x) / 150, 0.8) : 0

  return (
    <div
      ref={cardRef}
      className={`absolute inset-0 bg-[#111a11] border-2 border-[#1a2a1a] rounded-2xl shadow-2xl transition-transform duration-300 ${
        isTop ? 'cursor-grab active:cursor-grabbing z-10' : 'z-0'
      } ${isAnimating ? 'pointer-events-none' : ''}`}
      style={{
        transform: isTop 
          ? `translateX(${dragOffset.x}px) translateY(${dragOffset.y * 0.1}px) rotate(${rotation}deg)`
          : 'scale(0.95) translateY(10px)',
        transition: isAnimating ? 'transform 0.3s ease-out, opacity 0.3s ease-out' : isDragging ? 'none' : 'transform 0.3s ease-out'
      }}
      onMouseDown={isTop ? handleMouseDown : undefined}
      onTouchStart={isTop ? handleTouchStart : undefined}
      onTouchMove={isTop ? handleTouchMove : undefined}
      onTouchEnd={isTop ? handleTouchEnd : undefined}
    >
      {/* Color overlay based on swipe direction */}
      {isTop && dragOffset.x !== 0 && (
        <>
          {/* Green overlay for right swipe */}
          <div
            className="absolute inset-0 bg-green-500 rounded-2xl flex items-center justify-center pointer-events-none"
            style={{
              opacity: dragOffset.x > 50 ? opacity : 0,
              transition: 'opacity 0.1s ease-out'
            }}
          >
            <div className="text-white text-6xl font-bold">✓</div>
          </div>

          {/* Red overlay for left swipe */}
          <div
            className="absolute inset-0 bg-red-500 rounded-2xl flex items-center justify-center pointer-events-none"
            style={{
              opacity: dragOffset.x < -50 ? opacity : 0,
              transition: 'opacity 0.1s ease-out'
            }}
          >
            <div className="text-white text-6xl font-bold">✗</div>
          </div>
        </>
      )}

      {/* Card content */}
      <div className="p-6 h-full flex flex-col">
        {/* Item image */}
        <div className="h-48 bg-[#0a0f0a] rounded-xl mb-4 flex items-center justify-center border border-[#1a2a1a] overflow-hidden">
          {item.images.length > 0 ? (
            <img
              src={item.images[0]}
              alt={item.title}
              className="w-full h-full object-cover rounded-xl"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const parent = target.parentElement
                if (parent) {
                  parent.innerHTML = `<div class="text-gray-500 text-6xl">${item.category?.icon || '📦'}</div>`
                }
              }}
            />
          ) : (
            <div className="text-gray-500 text-6xl">
              {item.category?.icon || '📦'}
            </div>
          )}
        </div>

        {/* Item info */}
        <h2 className="text-2xl font-bold text-white mb-2 line-clamp-2">
          {item.title}
        </h2>

        {item.description && (
          <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-1">
            {item.description}
          </p>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {item.category && (
            <span className="bg-[#0a0f0a] border border-[#1a2a1a] text-gray-300 px-3 py-1 rounded-full text-sm">
              {item.category.icon} {item.category.name}
            </span>
          )}
          {item.condition && (
            <span className="bg-[#0a0f0a] border border-[#1a2a1a] text-gray-300 px-3 py-1 rounded-full text-sm">
              {item.condition}
            </span>
          )}
        </div>

        {/* Owner info */}
        <div className="mt-auto">
          <div className="text-gray-400 text-sm mb-2">
            by {item.user.name}
            {item.user.city && ` • ${item.user.city}`}
          </div>
          
          {/* Want count */}
          <div className="text-amber-400 text-sm flex items-center">
            🔥 {item.wantCount} {item.wantCount === 1 ? 'person wants' : 'people want'} this
          </div>
        </div>
      </div>
    </div>
  )
}