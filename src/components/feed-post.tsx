'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FeedItem } from '@/types'

interface FeedPostProps {
  item: FeedItem
  onLike: (itemId: string) => void
  onWant: (itemId: string) => void
  onComment: (itemId: string) => void
  currentUserId: string
}

export default function FeedPost({ item, onLike, onWant, onComment, currentUserId }: FeedPostProps) {
  const [isLiking, setIsLiking] = useState(false)
  const [isWanting, setIsWanting] = useState(false)
  const [localLikeCount, setLocalLikeCount] = useState(item.likeCount)
  const [localWantCount, setLocalWantCount] = useState(item.wantCount)
  const [isLiked, setIsLiked] = useState(item.isLikedByCurrentUser)
  const [isWanted, setIsWanted] = useState(item.isWantedByCurrentUser)

  const handleLike = async () => {
    if (isLiking || item.userId === currentUserId) return
    
    setIsLiking(true)
    const wasLiked = isLiked

    // Optimistic update
    setIsLiked(!wasLiked)
    setLocalLikeCount(prev => wasLiked ? prev - 1 : prev + 1)

    try {
      const response = await fetch(`/api/items/${item.id}/like`, {
        method: wasLiked ? 'DELETE' : 'POST',
        credentials: 'include'
      })

      if (!response.ok) {
        // Revert on error
        setIsLiked(wasLiked)
        setLocalLikeCount(prev => wasLiked ? prev + 1 : prev - 1)
      } else {
        const data = await response.json()
        setLocalLikeCount(data.likeCount)
        setIsLiked(data.isLiked)
        onLike(item.id)
      }
    } catch {
      // Revert on error
      setIsLiked(wasLiked)
      setLocalLikeCount(prev => wasLiked ? prev + 1 : prev - 1)
    }
    
    setIsLiking(false)
  }

  const handleWant = async () => {
    if (isWanting || item.userId === currentUserId) return
    
    setIsWanting(true)
    const wasWanted = isWanted

    // Optimistic update
    setIsWanted(!wasWanted)
    setLocalWantCount(prev => wasWanted ? prev - 1 : prev + 1)

    try {
      const response = await fetch(`/api/items/${item.id}/want`, {
        method: wasWanted ? 'DELETE' : 'POST',
        credentials: 'include'
      })

      if (!response.ok) {
        // Revert on error
        setIsWanted(wasWanted)
        setLocalWantCount(prev => wasWanted ? prev + 1 : prev - 1)
      } else {
        const data = await response.json()
        setLocalWantCount(data.wantCount)
        setIsWanted(data.isWanted)
        onWant(item.id)
      }
    } catch {
      // Revert on error
      setIsWanted(wasWanted)
      setLocalWantCount(prev => wasWanted ? prev + 1 : prev - 1)
    }
    
    setIsWanting(false)
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    if (days < 7) return `${days}d`
    return new Date(date).toLocaleDateString()
  }

  const getConditionBadgeColor = (condition: string) => {
    switch (condition) {
      case 'NEW': return 'bg-[#22c55e]'
      case 'LIKE_NEW': return 'bg-[#10b981]'
      case 'GOOD': return 'bg-[#f59e0b]'
      case 'FAIR': return 'bg-[#f97316]'
      case 'FOR_PARTS': return 'bg-[#6b7280]'
      default: return 'bg-[#6b7280]'
    }
  }

  const formatCondition = (condition: string) => {
    switch (condition) {
      case 'LIKE_NEW': return 'Like New'
      case 'FOR_PARTS': return 'For Parts'
      default: return condition.charAt(0) + condition.slice(1).toLowerCase()
    }
  }

  return (
    <div className="bg-[#111a11] border border-[#1a2a1a] rounded-xl overflow-hidden mb-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#1a2a1a] flex items-center justify-center">
            {item.user.image ? (
              <Image
                src={item.user.image}
                alt={item.user.name}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            ) : (
              <span className="text-[#22c55e] font-bold">
                {item.user.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-white">{item.user.name}</span>
              {item.circles && item.circles.length > 0 && (
                <span className="text-xs text-[#8a9a8a]">
                  · {item.circles[0].name}
                </span>
              )}
            </div>
            <div className="text-xs text-[#8a9a8a]">
              {formatTimeAgo(new Date(item.createdAt))}
            </div>
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="relative w-full aspect-square">
        {item.images && item.images.length > 0 ? (
          <Image
            src={item.images[0]}
            alt={item.title}
            fill
            className="object-cover cursor-pointer"
            onClick={() => window.open(`/items/${item.id}`, '_blank')}
          />
        ) : (
          <div 
            className="w-full h-full bg-[#1a2a1a] flex items-center justify-center cursor-pointer"
            onClick={() => window.open(`/items/${item.id}`, '_blank')}
          >
            <span className="text-4xl">📦</span>
          </div>
        )}
        
        {/* Condition badge */}
        {item.condition && (
          <div className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-medium text-white ${getConditionBadgeColor(item.condition)}`}>
            {formatCondition(item.condition)}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3">
        <div className="flex items-center space-x-4 mb-2">
          {/* Like Button */}
          <motion.button
            onClick={handleLike}
            disabled={isLiking || item.userId === currentUserId}
            className="flex items-center space-x-1 disabled:opacity-50"
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              animate={isLiked ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill={isLiked ? "#ef4444" : "none"}
                stroke={isLiked ? "#ef4444" : "#8a9a8a"}
                strokeWidth="2"
                className="transition-colors"
              >
                <path d="20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </motion.div>
            <span className="text-sm text-[#8a9a8a]">{localLikeCount}</span>
          </motion.button>

          {/* Want Button */}
          <motion.button
            onClick={handleWant}
            disabled={isWanting || item.userId === currentUserId}
            className="flex items-center space-x-1 disabled:opacity-50"
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              animate={isWanted ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <div className={`p-1 rounded transition-colors ${isWanted ? 'text-[#f59e0b]' : 'text-[#8a9a8a]'}`}>
                🎣
              </div>
            </motion.div>
            <span className="text-sm text-[#8a9a8a]">{localWantCount}</span>
          </motion.button>

          {/* Comment Button */}
          <button
            onClick={() => onComment(item.id)}
            className="flex items-center space-x-1"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8a9a8a" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span className="text-sm text-[#8a9a8a]">{item.commentCount}</span>
          </button>
        </div>

        {/* Item title and description */}
        <Link href={`/items/${item.id}`} className="block">
          <h3 className="font-semibold text-white hover:text-[#22c55e] transition-colors mb-1">
            {item.title}
          </h3>
          {item.description && (
            <p className="text-[#8a9a8a] text-sm mb-2 line-clamp-2">
              {item.description}
            </p>
          )}
        </Link>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="text-xs text-[#22c55e]">
                #{tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="text-xs text-[#8a9a8a]">
                +{item.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}