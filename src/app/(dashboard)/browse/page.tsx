'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Item {
  id: string
  title: string
  description: string | null
  condition: string | null
  images: string[]
  createdAt: string
  category: {
    name: string
    icon: string | null
  } | null
  user: {
    id: string
    name: string
    city: string | null
  }
  wantedBy: any[] // Will contain want record if user already wants this item
}

interface Category {
  id: string
  name: string
  icon: string | null
}

export default function BrowsePage() {
  const { data: session } = useSession()
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [selectedCategory])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load categories
      const categoriesResponse = await fetch('/api/categories')
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData)
      }

      // Load items (excluding user's own items)
      const params = new URLSearchParams({
        excludeOwn: 'true',
      })
      if (selectedCategory) {
        params.set('categoryId', selectedCategory)
      }

      const itemsResponse = await fetch(`/api/items?${params}`)
      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json()
        setItems(itemsData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleWant = async (item: Item) => {
    if (!session?.user?.id) return

    const isWanted = item.wantedBy.length > 0
    setActionLoading(item.id)

    try {
      if (isWanted) {
        // Remove want
        const want = item.wantedBy[0]
        const response = await fetch(`/api/wants/${want.id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          setItems(items.map(i => 
            i.id === item.id 
              ? { ...i, wantedBy: [] }
              : i
          ))
        }
      } else {
        // Add want
        const response = await fetch('/api/wants', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            itemId: item.id,
          }),
        })

        if (response.ok) {
          const want = await response.json()
          setItems(items.map(i => 
            i.id === item.id 
              ? { ...i, wantedBy: [want] }
              : i
          ))
        }
      }
    } catch (error) {
      console.error('Error toggling want:', error)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Browse Items</h1>
        <p className="text-gray-400 mt-2">Discover what others are sharing</p>
      </div>

      {/* Category Filter */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Filter by Category</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-full border transition-colors ${
              selectedCategory === ''
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-[#1a2a1a] text-gray-300 hover:border-green-500'
            }`}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full border transition-colors ${
                selectedCategory === category.id
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-[#1a2a1a] text-gray-300 hover:border-green-500'
              }`}
            >
              {category.icon && `${category.icon} `}{category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      {items.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 text-lg">
            {selectedCategory 
              ? 'No items found in this category' 
              : 'No items available yet'
            }
          </div>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory('')}
              className="mt-4 text-green-500 hover:text-green-400"
            >
              View all categories
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const isWanted = item.wantedBy.length > 0
            const isActionLoading = actionLoading === item.id

            return (
              <div key={item.id} className="card p-6">
                {/* Item Image */}
                <div className="aspect-square bg-[#0a0f0a] rounded-lg mb-4 flex items-center justify-center border border-[#1a2a1a]">
                  {item.images.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent) {
                          parent.innerHTML = `
                            <div class="text-gray-500 text-6xl">📦</div>
                          `
                        }
                      }}
                    />
                  ) : (
                    <div className="text-gray-500 text-6xl">📦</div>
                  )}
                </div>

                {/* Item Info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-lg mb-2">{item.title}</h3>
                  
                  {item.description && (
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {/* Meta Info */}
                  <div className="space-y-2 mb-4">
                    {item.category && (
                      <div className="text-xs text-gray-500">
                        {item.category.icon} {item.category.name}
                      </div>
                    )}
                    {item.condition && (
                      <div className="text-xs text-gray-500">
                        Condition: {item.condition}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      by {item.user.name}
                      {item.user.city && ` • ${item.user.city}`}
                    </div>
                  </div>

                  {/* Want Button */}
                  <button
                    onClick={() => toggleWant(item)}
                    disabled={isActionLoading}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      isWanted
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-transparent border border-green-500 text-green-500 hover:bg-green-500 hover:text-white'
                    }`}
                  >
                    {isActionLoading 
                      ? '...'
                      : isWanted 
                        ? '✓ Wanted' 
                        : 'I want this'
                    }
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}