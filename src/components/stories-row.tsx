'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'

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
    <div className="bg-white border-b border-ig-border-light py-2">
      <div className="flex space-x-4 px-4 overflow-x-auto hide-scrollbar">
        {/* Your Story / Add Item */}
        <Link href="/dashboard/add-item" className="flex-none">
          <div className="flex flex-col items-center space-y-1 w-16">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-ig-border-light border-2 border-ig-border flex items-center justify-center overflow-hidden">
                {currentUser?.image ? (
                  <Image
                    src={currentUser.image}
                    alt="Your story"
                    width={52}
                    height={52}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {currentUser?.name?.charAt(0)?.toUpperCase() || 'Y'}
                    </span>
                  </div>
                )}
              </div>
              {/* Blue plus icon overlay */}
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </div>
            </div>
            <span className="text-xs text-ig-primary font-normal leading-tight text-center truncate w-full">
              Your Story
            </span>
          </div>
        </Link>

        {/* Story Users */}
        {loading ? (
          // Loading skeletons
          [...Array(5)].map((_, i) => (
            <div key={i} className="flex-none">
              <div className="flex flex-col items-center space-y-1 w-16">
                <div className="w-14 h-14 bg-ig-border-light rounded-full animate-pulse"></div>
                <div className="w-12 h-3 bg-ig-border-light rounded animate-pulse"></div>
              </div>
            </div>
          ))
        ) : (
          storyUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => handleUserClick(user.id)}
              className="flex-none"
            >
              <div className="flex flex-col items-center space-y-1 w-16">
                <div className={`relative ${selectedUserId === user.id ? 'opacity-50' : ''}`}>
                  {/* Instagram gradient ring */}
                  <div className="ig-story-ring w-16 h-16">
                    <div className="ig-story-ring-inner w-full h-full">
                      <div className="w-full h-full rounded-full bg-ig-border-light flex items-center justify-center overflow-hidden">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt={user.name}
                            width={52}
                            height={52}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                            <span className="text-white font-semibold text-lg">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Selected indicator */}
                  {selectedUserId === user.id && (
                    <div className="absolute inset-0 rounded-full bg-black bg-opacity-30 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                  )}
                </div>
                <span className="text-xs text-ig-primary font-normal leading-tight text-center truncate w-full">
                  {user.name.toLowerCase().replace(/\s/g, '').slice(0, 10)}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}