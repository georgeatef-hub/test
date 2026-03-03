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
    <div className="bt-card mb-4 mx-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <Link href={`/profile/${item.userId}`} className="block">
            <div className="
              w-10 h-10 rounded-xl overflow-hidden
              ring-2 ring-bt-border hover:ring-bt-accent/30
              transition-all duration-200
            ">
              {item.user.image ? (
                <Image
                  src={item.user.image}
                  alt={item.user.name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="
                  w-full h-full bg-gradient-to-br 
                  from-bt-accent to-bt-accent-dark
                  flex items-center justify-center text-white text-sm font-bold
                ">
                  {item.user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </Link>
          
          {/* User info */}
          <div className="flex flex-col">
            <Link href={`/profile/${item.userId}`} className="
              bt-label text-bt-text-primary hover:text-bt-accent
              transition-colors duration-200
            ">
              {item.user.name}
            </Link>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="bt-small">
                {formatTimeAgo(new Date(item.createdAt))}
              </span>
              {item.circles && item.circles.length > 0 && (
                <>
                  <span className="bt-small">·</span>
                  <span className="bt-small text-bt-teal font-medium">
                    {item.circles[0].name}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Menu button */}
        <button className="
          p-2 rounded-lg text-bt-text-tertiary 
          hover:text-bt-text-primary hover:bg-bt-surface-secondary
          transition-all duration-200 bt-focus
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="1.5"/>
            <circle cx="12" cy="12" r="1.5"/>
            <circle cx="12" cy="19" r="1.5"/>
          </svg>
        </button>
      </div>

      {/* Image */}
      <div className="relative w-full aspect-[4/3] bg-bt-surface-secondary">
        {item.images && item.images.length > 0 ? (
          <Image
            src={item.images[0]}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        ) : (
          <div className="
            w-full h-full bg-gradient-to-br 
            from-bt-surface-secondary to-bt-surface-tertiary
            flex items-center justify-center
          ">
            <span className="text-6xl opacity-60">📦</span>
          </div>
        )}

        {/* Want count badge - prominent display */}
        {item.wantCount > 0 && (
          <div className="
            absolute top-3 right-3 
            bg-bt-teal text-white px-3 py-2 rounded-xl
            text-sm font-bold shadow-lg bt-animate-pulse-glow
          ">
            <span className="mr-1">💎</span>
            {item.wantCount} want{item.wantCount !== 1 ? 's' : ''} this
          </div>
        )}

        {/* Hot items badge */}
        {item.wantCount >= 5 && (
          <div className="
            absolute top-3 left-3 
            bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-2 rounded-xl
            text-sm font-bold shadow-lg bt-animate-hot-badge
          ">
            <span className="mr-1">🔥</span>
            HOT
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title & Description */}
        <div className="mb-3">
          <h3 className="bt-heading text-lg text-bt-text-primary mb-1">
            {item.title}
          </h3>
          {item.description && (
            <p className="bt-body text-bt-text-secondary text-sm line-clamp-2">
              {item.description}
            </p>
          )}
        </div>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {item.tags.slice(0, 4).map((tag, index) => (
              <span key={index} className="
                px-2 py-1 bg-bt-accent-light text-bt-accent 
                rounded-lg text-xs font-medium
              ">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Action row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {/* Like button */}
            <motion.button 
              onClick={handleLike} 
              disabled={isLiking || item.isOwnItem}
              whileTap={{ scale: 0.9 }}
              className={`
                flex items-center gap-1.5 px-3 py-2 rounded-xl
                transition-all duration-200 bt-focus
                disabled:opacity-40
                ${isLiked 
                  ? 'bg-bt-accent/10 text-bt-accent bt-animate-heart-beat' 
                  : 'text-bt-text-secondary hover:text-bt-accent hover:bg-bt-accent/5'
                }
              `}
            >
              <motion.div 
                animate={isLiked ? { scale: [1, 1.2, 1] } : {}} 
                transition={{ duration: 0.3 }}
              >
                <svg 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill={isLiked ? "currentColor" : "none"} 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </motion.div>
              {localLikeCount > 0 && (
                <span className="text-sm font-medium">{localLikeCount}</span>
              )}
            </motion.button>

            {/* Comment button */}
            <button 
              onClick={() => onComment(item.id)} 
              className="
                flex items-center gap-1.5 px-3 py-2 rounded-xl
                text-bt-text-secondary hover:text-bt-text-primary 
                hover:bg-bt-surface-secondary transition-all duration-200 bt-focus
              "
            >
              <svg 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              {item.commentCount > 0 && (
                <span className="text-sm font-medium">{item.commentCount}</span>
              )}
            </button>
          </div>

          {/* PROMINENT Want button - hidden on own items */}
          {!item.isOwnItem && (
            <motion.button
              onClick={handleWant}
              disabled={isWanting}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold
                transition-all duration-200 shadow-md
                disabled:opacity-40
                ${isWanted 
                  ? 'bg-bt-teal text-white shadow-lg bt-animate-pulse-glow' 
                  : 'bg-white text-bt-teal border-2 border-bt-teal hover:bg-bt-teal hover:text-white hover:shadow-lg'
                }
              `}
            >
              <span className="text-lg">💎</span>
              <span className="text-sm font-bold">{isWanted ? 'WANTED!' : 'WANT'}</span>
              {isWanted && <span className="text-sm">✨</span>}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  )
}