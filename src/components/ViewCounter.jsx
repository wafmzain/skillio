import { formatViews, getViewsDisplayText } from '../utils/formatViews'

/**
 * View Counter Component
 * Displays view count with modern creator-platform styling
 */
function ViewCounter({ 
  viewCount = 0, 
  loading = false, 
  size = 'default',
  showIcon = true,
  className = ''
}) {
  // Size variants
  const sizeClasses = {
    small: 'text-xs',
    default: 'text-sm',
    large: 'text-base'
  }

  const iconSizes = {
    small: 'w-3 h-3',
    default: 'w-4 h-4', 
    large: 'w-5 h-5'
  }

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-slate-400 ${sizeClasses[size]} ${className}`}>
        {showIcon && (
          <div className={`${iconSizes[size]} animate-pulse bg-slate-300 rounded`}></div>
        )}
        <div className="animate-pulse bg-slate-300 rounded h-4 w-12"></div>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 text-slate-500 ${sizeClasses[size]} ${className}`}>
      {showIcon && (
        <svg 
          className={`${iconSizes[size]} flex-shrink-0`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
          />
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
          />
        </svg>
      )}
      <span className="font-medium">
        {getViewsDisplayText(viewCount)}
      </span>
    </div>
  )
}

/**
 * Compact View Counter for cards and lists
 */
export function CompactViewCounter({ viewCount = 0, loading = false }) {
  if (loading) {
    return (
      <div className="flex items-center gap-1.5 text-slate-400">
        <div className="w-3 h-3 animate-pulse bg-slate-300 rounded"></div>
        <div className="animate-pulse bg-slate-300 rounded h-3 w-8"></div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 text-slate-500 text-xs">
      <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
      <span className="font-medium">
        {formatViews(viewCount)}
      </span>
    </div>
  )
}

/**
 * Detailed View Counter with stats
 */
export function DetailedViewCounter({ 
  viewCount = 0, 
  loading = false,
  showTooltip = false 
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-400">
        <div className="w-4 h-4 animate-pulse bg-slate-300 rounded"></div>
        <div className="animate-pulse bg-slate-300 rounded h-4 w-16"></div>
      </div>
    )
  }

  const content = (
    <div className="flex items-center gap-2 text-slate-600 text-sm hover:text-slate-800 transition-colors cursor-default">
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
      <span className="font-medium">
        {getViewsDisplayText(viewCount)}
      </span>
    </div>
  )

  if (showTooltip && viewCount > 0) {
    return (
      <div className="relative group">
        {content}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
          {viewCount.toLocaleString()} total views
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
        </div>
      </div>
    )
  }

  return content
}

export default ViewCounter