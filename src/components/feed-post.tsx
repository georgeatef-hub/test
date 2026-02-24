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
    
    try {
      const response = await fetch(`/api/items/${item.id}/want`, {
        method: wasWanted ? 'DELETE' : 'POST',
        credentials: 'include'
      })
      if (!response.ok) {
        setIsWanted(wasWanted)
      } else {
        const data = await response.json()
        setIsWanted(data.isWanted)
        onWant(item.id)
      }
    } catch {
      setIsWanted(wasWanted)
    }
    setIsWanting(false)
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    const weeks = Math.floor(diff / 604800000)
    
    if (hours < 1) return 'now'
    if (hours < 24) return `${hours}h`
    if (days < 7) return `${days}d`
    if (weeks < 4) return `${weeks}w`
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="bg-white">
      {/* Header — Instagram exact */}
      <div className="flex items-center justify-between px-3 py-2.5 h-[52px]">
        <div className="flex items-center space-x-3">
          {/* Avatar — 32px, no gradient in post header */}
          <div className="w-8 h-8 rounded-full overflow-hidden">
            {item.user.image ? (
              <Image
                src={item.user.image}
                alt={item.user.name}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                <span className="text-white text-xs font-semibold">
                  {item.user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          {/* Username and time */}
          <div className="flex items-center">
            <Link href={`/profile/${item.userId}`} className="ig-username text-ig-primary">
              {item.user.name.toLowerCase().replace(/\s/g, '')}
            </Link>
            <span className="text-ig-secondary font-normal text-sm mx-1">•</span>
            <span className="text-ig-secondary text-sm">{formatTimeAgo(new Date(item.createdAt))}</span>
          </div>
        </div>
        
        {/* Three dots menu */}
        <button className="p-2 -mr-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#262626">
            <circle cx="12" cy="5" r="1.5"/>
            <circle cx="12" cy="12" r="1.5"/>
            <circle cx="12" cy="19" r="1.5"/>
          </svg>
        </button>
      </div>

      {/* Image — FULL WIDTH, edge to edge, no border radius */}
      <div className="relative w-full aspect-square">
        {item.images && item.images.length > 0 ? (
          <Image
            src={item.images[0]}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        ) : (
          <div className="w-full h-full bg-ig-border-light flex items-center justify-center">
            <span className="text-6xl">📦</span>
          </div>
        )}
      </div>

      {/* Action row — Instagram exact: 40px height */}
      <div className="px-3 h-10 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Like - Heart icon */}
          <motion.button 
            onClick={handleLike} 
            disabled={isLiking || item.userId === currentUserId}
            whileTap={{ scale: 0.85 }}
            className="p-2 -ml-2 disabled:opacity-40"
          >
            <motion.div animate={isLiked ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill={isLiked ? "#ed4956" : "none"} stroke={isLiked ? "#ed4956" : "#262626"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </motion.div>
          </motion.button>

          {/* Comment */}
          <button onClick={() => onComment(item.id)} className="p-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </button>

          {/* Share */}
          <button className="p-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>

        {/* Want button — RIGHT aligned */}
        <motion.button
          onClick={handleWant}
          disabled={isWanting || item.userId === currentUserId}
          whileTap={{ scale: 0.85 }}
          className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold transition-all disabled:opacity-40 ${
            isWanted 
              ? 'bg-ig-want-active text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-amber-50 hover:text-amber-600'
          }`}
        >
          <span>🎣</span>
          <span>Want</span>
        </motion.button>
      </div>

      {/* Content */}
      <div className="px-3 pb-3">
        {/* Like count — Bold, 13px */}
        {localLikeCount > 0 && (
          <div className="mb-1">
            <span className="ig-like-count">{localLikeCount} {localLikeCount === 1 ? 'like' : 'likes'}</span>
          </div>
        )}

        {/* Caption — username bold + description, same line */}
        <div className="mb-1">
          <span className="ig-username mr-2">{item.user.name.toLowerCase().replace(/\s/g, '')}</span>
          <span className="ig-caption">{item.title}</span>
          {item.description && (
            <span className="ig-caption"> {item.description}</span>
          )}
        </div>

        {/* Tags — Instagram blue */}
        {item.tags && item.tags.length > 0 && (
          <div className="mb-1">
            {item.tags.slice(0, 4).map((tag, index) => (
              <span key={index} className="ig-link mr-1 text-ig-caption">#{tag}</span>
            ))}
          </div>
        )}

        {/* View comments */}
        {item.commentCount > 0 && (
          <button onClick={() => onComment(item.id)} className="text-ig-secondary text-ig-caption mb-1 block">
            View all {item.commentCount} comments
          </button>
        )}

        {/* Timestamp — 10px uppercase */}
        <div className="ig-timestamp text-ig-secondary">
          {formatTimeAgo(new Date(item.createdAt)).toUpperCase()}
        </div>
      </div>
    </div>
  )
}