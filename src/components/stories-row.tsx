'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface StoryUser {
  id: string
  name: string
  image?: string
  hasNewItems: boolean
  lastPostAt: Date
}

interface StoriesRowProps {
  onFilterByUser?: (userId: string | null) => void
  selectedUserId?: string | null
}

export default function StoriesRow({ onFilterByUser, selectedUserId }: StoriesRowProps) {
  const { data: session } = useSession()
  const [storyUsers, setStoryUsers] = useState<StoryUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStoryUsers()
  }, [])

  const fetchStoryUsers = async () => {
    try {
      setLoading(true)
      
      // Fetch users from shared circles who posted recently
      const response = await fetch('/api/feed/stories', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setStoryUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching story users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserClick = (userId: string) => {
    if (selectedUserId === userId) {
      // Clicking again removes filter
      onFilterByUser?.(null)
    } else {
      onFilterByUser?.(userId)
    }
  }

  const currentUser = session?.user

  return (
    <div className="bg-white border-b border-bt-border py-4">
      <div className="flex gap-4 px-4 overflow-x-auto bt-hide-scrollbar">
        
        {/* Your Circle / Add Item */}
        <Link href="/dashboard/add-item" className="flex-none group">
          <div className="flex flex-col items-center gap-2 w-18">
            <div className="relative">
              <div className="
                w-16 h-16 rounded-2xl bg-gradient-to-br 
                from-bt-accent to-bt-accent-dark
                flex items-center justify-center overflow-hidden
                shadow-lg group-hover:shadow-xl
                transition-all duration-200 group-hover:scale-105
              ">
                {currentUser?.image ? (
                  <Image
                    src={currentUser.image}
                    alt="Your story"
                    width={60}
                    height={60}
                    className="rounded-2xl object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {currentUser?.name?.charAt(0)?.toUpperCase() || 'Y'}
                    </span>
                  </div>
                )}
              </div>
              {/* Add icon overlay */}
              <div className="
                absolute -bottom-1 -right-1 w-6 h-6 
                bg-bt-accent border-2 border-white rounded-full 
                flex items-center justify-center shadow-md
              ">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </div>
            </div>
            <span className="bt-small text-center font-medium text-bt-text-primary">
              Add Item
            </span>
          </div>
        </Link>

        {/* Circle Members */}
        {loading ? (
          // Loading skeletons
          [...Array(6)].map((_, i) => (
            <div key={i} className="flex-none">
              <div className="flex flex-col items-center gap-2 w-18">
                <div className="w-16 h-16 bg-bt-surface-secondary rounded-2xl animate-pulse"></div>
                <div className="w-14 h-3 bg-bt-surface-secondary rounded animate-pulse"></div>
              </div>
            </div>
          ))
        ) : (
          storyUsers.map((user) => {
            const isSelected = selectedUserId === user.id
            
            return (
              <motion.button
                key={user.id}
                onClick={() => handleUserClick(user.id)}
                className="flex-none group"
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex flex-col items-center gap-2 w-18">
                  <div className="relative">
                    {/* Active ring for new posts */}
                    {user.hasNewItems && !isSelected && (
                      <div className="
                        absolute inset-0 rounded-2xl
                        bg-gradient-to-br from-bt-accent via-bt-accent-dark to-bt-accent
                        p-0.5
                      ">
                        <div className="w-full h-full bg-white rounded-2xl"></div>
                      </div>
                    )}
                    
                    {/* Avatar */}
                    <div className={`
                      relative w-16 h-16 rounded-2xl overflow-hidden
                      transition-all duration-200 group-hover:scale-105
                      ${isSelected 
                        ? 'ring-3 ring-bt-accent shadow-lg scale-95' 
                        : user.hasNewItems 
                          ? 'ring-2 ring-white shadow-md' 
                          : 'shadow-sm group-hover:shadow-md'
                      }
                    `}>
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={user.name}
                          width={60}
                          height={60}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="
                          w-full h-full bg-gradient-to-br 
                          from-bt-surface-secondary to-bt-surface-tertiary
                          flex items-center justify-center
                        ">
                          <span className="text-bt-text-secondary font-bold text-lg">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      
                      {/* Selected overlay */}
                      {isSelected && (
                        <div className="
                          absolute inset-0 bg-bt-accent/20 
                          flex items-center justify-center
                        ">
                          <div className="
                            w-6 h-6 bg-bt-accent rounded-full 
                            flex items-center justify-center shadow-sm
                          ">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* New item indicator */}
                    {user.hasNewItems && !isSelected && (
                      <div className="
                        absolute -top-1 -right-1 w-3 h-3 
                        bg-bt-accent rounded-full 
                        border-2 border-white shadow-sm
                      "/>
                    )}
                  </div>
                  
                  {/* Name */}
                  <span className={`
                    bt-small text-center font-medium leading-tight
                    ${isSelected 
                      ? 'text-bt-accent' 
                      : user.hasNewItems 
                        ? 'text-bt-text-primary' 
                        : 'text-bt-text-secondary'
                    }
                  `}>
                    {user.name.split(' ')[0]}
                  </span>
                </div>
              </motion.button>
            )
          })
        )}
        
        {/* Browse circles CTA */}
        {!loading && storyUsers.length === 0 && (
          <Link href="/circles" className="flex-none group">
            <div className="flex flex-col items-center gap-2 w-18">
              <div className="
                w-16 h-16 rounded-2xl 
                bg-bt-surface-secondary border-2 border-dashed border-bt-border
                flex items-center justify-center
                group-hover:border-bt-accent group-hover:bg-bt-accent/5
                transition-all duration-200
              ">
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="text-bt-text-tertiary group-hover:text-bt-accent"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <span className="bt-small text-center font-medium text-bt-text-tertiary group-hover:text-bt-accent">
                Find Friends
              </span>
            </div>
          </Link>
        )}
      </div>
      
      {/* Filter indicator */}
      {selectedUserId && (
        <div className="px-4 mt-3 pt-3 border-t border-bt-border-light">
          <div className="flex items-center justify-between">
            <span className="bt-caption">
              Showing items from {storyUsers.find(u => u.id === selectedUserId)?.name || 'this friend'}
            </span>
            <button
              onClick={() => onFilterByUser?.(null)}
              className="bt-button-small bt-button-ghost text-bt-accent"
            >
              Show All
            </button>
          </div>
        </div>
      )}
    </div>
  )
}