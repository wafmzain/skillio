import { formatTrendingScore } from '../services/trending'

const FireIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M14 7h7v7" />
  </svg>
)

/**
 * TrendingBadge — soft-blue pill used on cards and lists.
 */
function TrendingBadge({
  trendingScore = 0,
  size = 'default',
  showScore = false,
  className = '',
}) {
  if (!trendingScore || trendingScore < 50) return null

  const sizeClasses = {
    small: 'text-[10px] px-2 py-0.5 gap-1',
    default: 'text-xs px-2.5 py-1 gap-1',
    large: 'text-sm px-3 py-1.5 gap-1.5',
  }

  const iconSizes = {
    small: 'w-2.5 h-2.5',
    default: 'w-3 h-3',
    large: 'w-3.5 h-3.5',
  }

  return (
    <span
      className={`inline-flex items-center rounded-md bg-[#3B82F6]/10 text-[#3B82F6] font-semibold ${sizeClasses[size]} ${className}`}
    >
      <FireIcon className={iconSizes[size]} />
      <span>Trending</span>
      {showScore && (
        <span className="opacity-80 font-medium">· {formatTrendingScore(trendingScore)}</span>
      )}
    </span>
  )
}

/**
 * CompactTrendingBadge — tiny chip for dense grids.
 */
export function CompactTrendingBadge({ trendingScore = 0 }) {
  if (!trendingScore || trendingScore < 50) return null
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-[#3B82F6]/10 text-[#3B82F6] text-[10px] font-semibold px-2 py-0.5">
      <FireIcon className="w-2.5 h-2.5" />
      Trending
    </span>
  )
}

/**
 * TrendingScoreDisplay — neutral slate chip for debug/admin views.
 */
export function TrendingScoreDisplay({ trendingScore = 0, className = '' }) {
  if (!trendingScore) return null
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md bg-[#F3F4F6] text-[#6B7280] text-xs font-medium px-2 py-1 ${className}`}
    >
      <FireIcon className="w-3 h-3" />
      Score {formatTrendingScore(trendingScore)}
    </span>
  )
}

/**
 * TrendingIndicator — rank pill shown on the top-N items.
 */
export function TrendingIndicator({ trendingScore = 0, position = 1 }) {
  if (!trendingScore || trendingScore < 50) return null
  return (
    <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-md bg-[#111827] text-white text-[10px] font-bold ring-2 ring-white">
      #{position}
    </span>
  )
}

export default TrendingBadge
