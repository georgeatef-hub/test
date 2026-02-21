'use client'

interface ItemCardProps {
  id: string
  title: string
  description: string | null
  condition: string | null
  images: string[]
  category?: {
    name: string
    icon: string | null
  } | null
  user?: {
    id: string
    name: string
    city: string | null
  }
  isWanted?: boolean
  onWantToggle?: (itemId: string) => void
  onRemove?: (itemId: string) => void
  showActions?: boolean
  actionLoading?: boolean
  className?: string
}

export default function ItemCard({
  id,
  title,
  description,
  condition,
  images,
  category,
  user,
  isWanted = false,
  onWantToggle,
  onRemove,
  showActions = true,
  actionLoading = false,
  className = ''
}: ItemCardProps) {
  return (
    <div className={`card p-6 ${className}`}>
      {/* Item Image */}
      <div className="aspect-square bg-[#0a0f0a] rounded-lg mb-4 flex items-center justify-center border border-[#1a2a1a]">
        {images.length > 0 ? (
          <img
            src={images[0]}
            alt={title}
            className="w-full h-full object-cover rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const parent = target.parentElement
              if (parent) {
                parent.innerHTML = `<div class="text-gray-500 text-6xl">📦</div>`
              }
            }}
          />
        ) : (
          <div className="text-gray-500 text-6xl">📦</div>
        )}
      </div>

      {/* Item Info */}
      <div className="flex-1">
        <h3 className="font-semibold text-white text-lg mb-2">{title}</h3>
        
        {description && (
          <p className="text-gray-400 text-sm mb-3 line-clamp-3">
            {description}
          </p>
        )}

        {/* Meta Info */}
        <div className="space-y-2 mb-4">
          {category && (
            <div className="text-xs text-gray-500">
              {category.icon} {category.name}
            </div>
          )}
          {condition && (
            <div className="text-xs text-gray-500">
              Condition: {condition}
            </div>
          )}
          {user && (
            <div className="text-xs text-gray-500">
              by {user.name}
              {user.city && ` • ${user.city}`}
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex space-x-2">
            {onWantToggle && (
              <button
                onClick={() => onWantToggle(id)}
                disabled={actionLoading}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isWanted
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-transparent border border-green-500 text-green-500 hover:bg-green-500 hover:text-white'
                }`}
              >
                {actionLoading 
                  ? '...'
                  : isWanted 
                    ? '✓ Wanted' 
                    : 'I want this'
                }
              </button>
            )}
            
            {onRemove && (
              <button
                onClick={() => onRemove(id)}
                className="px-3 py-2 text-red-500 hover:text-red-400 border border-red-500 rounded-lg hover:bg-red-500 hover:bg-opacity-10 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}