import { useState } from 'react'

/**
 * AI Summary Button Component
 * Modern button with loading states and smooth animations
 */
function AISummaryButton({ onClick, loading = false, disabled = false }) {
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    if (!loading && !disabled && onClick) {
      onClick()
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading || disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative overflow-hidden
        px-8 py-4 rounded-full
        font-semibold text-white text-base
        bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600
        hover:from-purple-700 hover:via-purple-600 hover:to-indigo-700
        transform transition-all duration-300 ease-out
        ${loading || disabled 
          ? 'opacity-50 cursor-not-allowed scale-100' 
          : 'hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30'
        }
        ${isHovered && !loading && !disabled 
          ? 'shadow-xl shadow-purple-500/25' 
          : 'shadow-lg shadow-purple-500/20'
        }
        focus:outline-none focus:ring-4 focus:ring-purple-500/30
        active:scale-95
      `}
    >
      {/* Background glow effect */}
      <div className={`
        absolute inset-0 rounded-full
        bg-gradient-to-r from-purple-400 to-indigo-400
        opacity-0 transition-opacity duration-300
        ${isHovered && !loading && !disabled ? 'opacity-20' : 'opacity-0'}
      `} />
      
      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
      
      {/* Button content */}
      <div className={`
        relative flex items-center gap-3
        transition-opacity duration-200
        ${loading ? 'opacity-0' : 'opacity-100'}
      `}>
        <span className="text-xl">✨</span>
        <span className="font-semibold">
          {loading ? 'AI sedang merangkum insight...' : 'Ringkas dengan AI'}
        </span>
        <div className="inline-flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-xs font-bold">
          <span>✦</span>
          <span>Premium</span>
        </div>
      </div>
      
      {/* Shimmer effect */}
      <div className={`
        absolute inset-0 -skew-x-12
        bg-gradient-to-r from-transparent via-white/20 to-transparent
        transform translate-x-[-100%]
        transition-transform duration-1000
        ${isHovered && !loading && !disabled 
          ? 'translate-x-[100%]' 
          : 'translate-x-[-100%]'
        }
      `} />
    </button>
  )
}

export default AISummaryButton