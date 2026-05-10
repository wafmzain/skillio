import { formatTrendingScore } from '../services/trending'

/**
 * Trending Badge Component
 * Shows when a post is trending with fire icon
 */
function TrendingBadge({ 
  trendingScore = 0, 
  size = 'default',
  showScore = false,
  className = '' 
}) {
  // Don't show badge if score is too low
  if (!trendingScore || trendingScore < 50) return null

  const sizeClasses = {
    small: 'text-xs px-2 py-1',
    default: 'text-sm px-3 py-1.5',
    large: 'text-base px-4 py-2'
  }

  const iconSizes = {
    small: 'text-xs',
    default: 'text-sm', 
    large: 'text-base'
  }

  return (
    <div className={`
      inline-flex items-center gap-1.5 
      bg-gradient-to-r from-orange-500 to-red-500 
      text-white font-bold rounded-full
      shadow-lg shadow-orange-500/30
      hover:shadow-xl hover:shadow-orange-500/40
      transition-all duration-300
      ${sizeClasses[size]}
      ${className}
    `}>
      <span className={`${iconSizes[size]} animate-pulse`}>🔥</span>
      <span>Trending</span>
      {showScore && (
        <span className="opacity-90">
          {formatTrendingScore(trendingScore)}
        </span>
      )}
    </div>
  )
}

/**
 * Compact Trending Badge for cards
 */
export function CompactTrendingBadge({ trendingScore = 0 }) {
  if (!trendingScore || trendingScore < 50) return null

  return (
    <div className="
      inline-flex items-center gap-1 
      bg-gradient-to-r from-orange-500 to-red-500 
      text-white text-xs font-bold 
      px-2 py-1 rounded-full
      shadow-md shadow-orange-500/30
    ">
      <span className="text-xs animate-pulse">🔥</span>
      <span>Hot</span>
    </div>
  )
}

/**
 * Trending Score Display (for debugging/admin)
 */
export function TrendingScoreDisplay({ trendingScore = 0, className = '' }) {
  if (!trendingScore) return null

  return (
    <div className={`
      inline-flex items-center gap-1.5 
      bg-slate-100 text-slate-700 
      text-xs font-medium 
      px-2 py-1 rounded-lg
      ${className}
    `}>
      <span>📊</span>
      <span>Score: {formatTrendingScore(trendingScore)}</span>
    </div>
  )
}

/**
 * Trending Indicator for lists
 */
export function TrendingIndicator({ trendingScore = 0, position = 1 }) {
  if (!trendingScore || trendingScore < 50) return null

  const getPositionColor = (pos) => {
    if (pos === 1) return 'from-yellow-400 to-orange-500' // Gold
    if (pos === 2) return 'from-gray-300 to-gray-500' // Silver  
    if (pos === 3) return 'from-amber-600 to-amber-800' // Bronze
    return 'from-orange-500 to-red-500' // Default trending
  }

  const getPositionIcon = (pos) => {
    if (pos === 1) return '🥇'
    if (pos === 2) return '🥈'
    if (pos === 3) return '🥉'
    return '🔥'
  }

  return (
    <div className={`
      inline-flex items-center gap-1 
      bg-gradient-to-r ${getPositionColor(position)}
      text-white text-xs font-bold 
      px-2 py-1 rounded-full
      shadow-lg
      animate-pulse
    `}>
      <span>{getPositionIcon(position)}</span>
      <span>#{position}</span>
    </div>
  )
}

export default TrendingBadge