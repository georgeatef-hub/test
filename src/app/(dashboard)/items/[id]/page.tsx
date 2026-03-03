'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import TopBar from '@/components/top-bar'

interface ItemDetail {
  id: string
  title: string
  description: string | null
  condition: string | null
  tags: string[]
  images: string[]
  status: string
  createdAt: string
  user: { id: string; name: string; image: string | null }
  likeCount: number
  wantCount: number
  commentCount: number
  isLikedByCurrentUser: boolean
  isWantedByCurrentUser: boolean
  isOwner: boolean
  comments: Array<{
    id: string
    text: string
    createdAt: string
    user: { id: string; name: string; image: string | null }
  }>
}

const CONDITIONS: Record<string, string> = {
  NEW: '🆕 New',
  LIKE_NEW: '✨ Like New',
  GOOD: '👍 Good',
  FAIR: '🤝 Fair',
  FOR_PARTS: '🔧 For Parts',
}

export default function ItemDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  useSession() // ensure authenticated
  const [item, setItem] = useState<ItemDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImage, setCurrentImage] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isWanted, setIsWanted] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  useEffect(() => {
    if (!id) return
    const fetchItem = async () => {
      try {
        const res = await fetch(`/api/items/${id}`, { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setItem(data)
          setIsLiked(data.isLikedByCurrentUser)
          setIsWanted(data.isWantedByCurrentUser)
          setLikeCount(data.likeCount)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchItem()
  }, [id])

  const handleLike = async () => {
    if (!item) return
    const was = isLiked
    setIsLiked(!was)
    setLikeCount(c => was ? c - 1 : c + 1)
    try {
      await fetch(`/api/items/${item.id}/like`, {
        method: was ? 'DELETE' : 'POST',
        credentials: 'include',
      })
    } catch {
      setIsLiked(was)
      setLikeCount(c => was ? c + 1 : c - 1)
    }
  }

  const handleWant = async () => {
    if (!item) return
    const was = isWanted
    setIsWanted(!was)
    try {
      await fetch(`/api/items/${item.id}/want`, {
        method: was ? 'DELETE' : 'POST',
        credentials: 'include',
      })
    } catch {
      setIsWanted(was)
    }
  }

  const handleDelete = async () => {
    if (!item || !confirm('Delete this item?')) return
    const res = await fetch(`/api/items/${item.id}`, { method: 'DELETE', credentials: 'include' })
    if (res.ok) router.push('/profile')
  }

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime()
    const h = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (h < 1) return 'just now'
    if (h < 24) return `${h}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(d).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bt-background">
        <TopBar />
        <div className="flex items-center justify-center" style={{ paddingTop: '80px' }}>
          <div className="w-8 h-8 border-3 border-bt-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-bt-background">
        <TopBar />
        <div className="text-center pt-24 px-8">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="bt-heading text-xl text-bt-text-primary mb-2">Item not found</h2>
          <button onClick={() => router.back()} className="bt-button bt-button-primary mt-4">Go Back</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bt-background pb-24">
      <TopBar />
      
      <div className="max-w-md mx-auto" style={{ paddingTop: 'var(--bt-header-height)' }}>
        {/* Back button */}
        <div className="px-4 py-3">
          <button onClick={() => router.back()} className="text-bt-accent font-medium text-sm flex items-center gap-1">
            ← Back
          </button>
        </div>

        {/* Images */}
        <div className="relative w-full aspect-square bg-bt-surface-secondary">
          {item.images && item.images.length > 0 ? (
            <>
              <Image
                src={item.images[currentImage]}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
              />
              {item.images.length > 1 && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                  {item.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className="w-2 h-2 rounded-full transition-all"
                      style={{
                        background: i === currentImage ? '#FF6B4A' : 'rgba(255,255,255,0.5)',
                        transform: i === currentImage ? 'scale(1.3)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-8xl opacity-40">📦</span>
            </div>
          )}

          {item.wantCount > 0 && (
            <div className="absolute top-3 right-3 bg-bt-teal text-white px-3 py-1.5 rounded-xl text-sm font-bold shadow-lg">
              💎 {item.wantCount} want{item.wantCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-white p-5">
          {/* Title & condition */}
          <div className="flex items-start justify-between mb-3">
            <h1 className="bt-heading text-2xl text-bt-text-primary flex-1">{item.title}</h1>
            {item.condition && (
              <span className="ml-3 px-3 py-1 bg-bt-accent-light text-bt-accent rounded-lg text-xs font-semibold whitespace-nowrap">
                {CONDITIONS[item.condition] || item.condition}
              </span>
            )}
          </div>

          {/* Owner */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-bt-border-light">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-bt-accent flex items-center justify-center text-white font-bold">
              {item.user.image ? (
                <Image src={item.user.image} alt={item.user.name} width={40} height={40} className="object-cover" />
              ) : (
                item.user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <p className="bt-label text-bt-text-primary text-sm">{item.user.name}</p>
              <p className="bt-small">{timeAgo(item.createdAt)}</p>
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <p className="bt-body text-bt-text-secondary mb-4">{item.description}</p>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {item.tags.map((tag, i) => (
                <span key={i} className="px-2.5 py-1 bg-bt-accent-light text-bt-accent rounded-lg text-xs font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-bt-border-light">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all ${
                isLiked ? 'bg-bt-accent/10 text-bt-accent' : 'bg-bt-surface-secondary text-bt-text-secondary'
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {likeCount}
            </motion.button>

            {!item.isOwner && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleWant}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all shadow-md ${
                  isWanted
                    ? 'bg-bt-teal text-white shadow-lg'
                    : 'bg-white text-bt-teal border-2 border-bt-teal hover:bg-bt-teal hover:text-white'
                }`}
              >
                💎 {isWanted ? 'WANTED!' : 'WANT THIS'}
              </motion.button>
            )}

            {item.isOwner && (
              <button
                onClick={handleDelete}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold bg-bt-error/10 text-bt-error"
              >
                🗑️ Delete Item
              </button>
            )}
          </div>
        </div>

        {/* Comments */}
        {item.comments && item.comments.length > 0 && (
          <div className="bg-white mt-2 p-5">
            <h3 className="bt-heading text-sm text-bt-text-primary mb-3">
              Comments ({item.commentCount})
            </h3>
            <div className="space-y-3">
              {item.comments.map(c => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-bt-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {c.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="bt-label text-bt-text-primary">{c.user.name}</span>
                      {' '}
                      <span className="text-bt-text-secondary">{c.text}</span>
                    </p>
                    <p className="bt-small mt-0.5">{timeAgo(c.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
