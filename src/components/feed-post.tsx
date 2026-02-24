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
    setIsLiked(!wasLiked)
    setLocalLikeCount(prev => wasLiked ? prev - 1 : prev + 1)
    try {
      const response = await fetch(`/api/items/${item.id}/like`, {
        method: wasLiked ? 'DELETE' : 'POST',
        credentials: 'include'
      })
      if (!response.ok) {
        setIsLiked(wasLiked)
        setLocalLikeCount(prev => wasLiked ? prev + 1 : prev - 1)
      } else {
        const data = await response.json()
        setLocalLikeCount(data.likeCount)
        setIsLiked(data.isLiked)
        onLike(item.id)
      }
    } catch {
      setIsLiked(wasLiked)
      setLocalLikeCount(prev => wasLiked ? prev + 1 : prev - 1)
    }
    setIsLiking(false)
  }

  const handleWant = async () => {
    if (isWanting || item.userId === currentUserId) return
    setIsWanting(true)
    const wasWanted = isWanted
    setIsWanted(!wasWanted)
    setLocalWantCount(prev => wasWanted ? prev - 1 : prev + 1)
    try {
      const response = await fetch(`/api/items/${item.id}/want`, {
        method: wasWanted ? 'DELETE' : 'POST',
        credentials: 'include'
      })
      if (!response.ok) {
        setIsWanted(wasWanted)
        setLocalWantCount(prev => wasWanted ? prev + 1 : prev - 1)
      } else {
        const data = await response.json()
        setLocalWantCount(data.wantCount)
        setIsWanted(data.isWanted)
        onWant(item.id)
      }
    } catch {
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

  const formatCondition = (condition: string) => {
    switch (condition) {
      case 'LIKE_NEW': return 'Like New'
      case 'FOR_PARTS': return 'For Parts'
      default: return condition.charAt(0) + condition.slice(1).toLowerCase()
    }
  }

  return (
    <div className="bg-white border-b border-[#efefef]">
      {/* Header — Instagram style */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600 p-[2px]">
            <div className="w-full h-full rounded-full bg-white p-[1px]">
              <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {item.user.image ? (
                  <Image src={item.user.image} alt={item.user.name} width={30} height={30} className="rounded-full object-cover" />
                ) : (
                  <span className="text-xs font-semibold text-gray-600">
                    {item.user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Link href={`/profile/${item.userId}`} className="text-sm font-semibold text-gray-900">
              {item.user.name.toLowerCase().replace(/\s/g, '')}
            </Link>
            {item.circles && item.circles.length > 0 && (
              <span className="text-xs text-gray-400 font-normal">
                • {item.circles[0].name}
              </span>
            )}
          </div>
        </div>
        <button className="text-gray-900">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="1.5"/>
            <circle cx="12" cy="12" r="1.5"/>
            <circle cx="12" cy="19" r="1.5"/>
          </svg>
        </button>
      </div>

      {/* Image — full width, no padding, no rounded corners */}
      <div className="relative w-full aspect-square">
        {item.images && item.images.length > 0 ? (
          <Link href={`/items/${item.id}`}>
            <Image
              src={item.images[0]}
              alt={item.title}
              fill
              className="object-cover"
            />
          </Link>
        ) : (
          <Link href={`/items/${item.id}`} className="block w-full h-full bg-gray-50 flex items-center justify-center">
            <span className="text-6xl">📦</span>
          </Link>
        )}
      </div>

      {/* Action buttons — Instagram layout */}
      <div className="px-3 pt-2.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-4">
            {/* Like */}
            <motion.button onClick={handleLike} disabled={isLiking || item.userId === currentUserId} whileTap={{ scale: 0.85 }} className="disabled:opacity-40">
              <motion.div animate={isLiked ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill={isLiked ? "#ef4444" : "none"} stroke={isLiked ? "#ef4444" : "#262626"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </motion.div>
            </motion.button>

            {/* Comment */}
            <button onClick={() => onComment(item.id)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </button>

            {/* Share/Send */}
            <button>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>

          {/* Want button — distinct, right side */}
          <motion.button
            onClick={handleWant}
            disabled={isWanting || item.userId === currentUserId}
            whileTap={{ scale: 0.85 }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all disabled:opacity-40 ${
              isWanted 
                ? 'bg-amber-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-amber-50 hover:text-amber-600'
            }`}
          >
            <span>🎣</span>
            <span>{isWanted ? 'Wanted' : 'Want'}</span>
          </motion.button>
        </div>

        {/* Like count */}
        {(localLikeCount > 0 || localWantCount > 0) && (
          <div className="flex items-center space-x-3 mb-1">
            {localLikeCount > 0 && (
              <span className="text-sm font-semibold text-gray-900">{localLikeCount} {localLikeCount === 1 ? 'like' : 'likes'}</span>
            )}
            {localWantCount > 0 && (
              <span className="text-sm font-semibold text-amber-600">{localWantCount} {localWantCount === 1 ? 'want' : 'wants'}</span>
            )}
          </div>
        )}

        {/* Caption — Instagram style: username + description */}
        <div className="mb-1">
          <Link href={`/items/${item.id}`} className="inline">
            <span className="text-sm font-semibold text-gray-900 mr-1.5">
              {item.user.name.toLowerCase().replace(/\s/g, '')}
            </span>
            <span className="text-sm text-gray-900">{item.title}</span>
          </Link>
          {item.description && (
            <p className="text-sm text-gray-900 line-clamp-2 mt-0.5">{item.description}</p>
          )}
        </div>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="mb-1">
            {item.tags.slice(0, 4).map((tag, index) => (
              <span key={index} className="text-sm text-[#00376b] mr-1">#{tag}</span>
            ))}
          </div>
        )}

        {/* View comments link */}
        {item.commentCount > 0 && (
          <button onClick={() => onComment(item.id)} className="text-sm text-gray-400 mb-1 block">
            View all {item.commentCount} comments
          </button>
        )}

        {/* Condition + Time */}
        <div className="flex items-center space-x-2 pb-3">
          {item.condition && (
            <span className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">
              {formatCondition(item.condition)}
            </span>
          )}
          <span className="text-[10px] uppercase tracking-wide text-gray-400">
            {formatTimeAgo(new Date(item.createdAt))}
          </span>
        </div>
      </div>
    </div>
  )
}
