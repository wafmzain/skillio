import { clsx } from '../../lib/format'

/**
 * Loading skeleton that matches AffiliateCard variants 1:1 to avoid CLS.
 */
function AffiliateCardSkeleton({ variant = 'default', className = '' }) {
  if (variant === 'compact') {
    return (
      <div
        className={clsx(
          'flex items-center gap-3 p-3 rounded-xl border border-[#E5E7EB] bg-white dark:bg-[#0B1220] dark:border-white/10',
          className
        )}
      >
        <div className="w-12 h-12 rounded-lg bg-[#F3F4F6] dark:bg-white/5 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="w-3/4 h-3 bg-[#F3F4F6] dark:bg-white/5 rounded animate-pulse" />
          <div className="w-1/2 h-2.5 bg-[#F3F4F6] dark:bg-white/5 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div
        className={clsx(
          'p-4 rounded-xl border border-[#E5E7EB] bg-white dark:bg-[#0B1220] dark:border-white/10 animate-pulse',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#F3F4F6] dark:bg-white/5" />
          <div className="flex-1 space-y-2">
            <div className="w-1/4 h-2 bg-[#F3F4F6] dark:bg-white/5 rounded" />
            <div className="w-2/3 h-3 bg-[#F3F4F6] dark:bg-white/5 rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={clsx(
        'rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden dark:bg-[#0B1220] dark:border-white/10',
        className
      )}
    >
      <div className="aspect-[16/9] bg-[#F3F4F6] dark:bg-white/5 animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <div className="w-16 h-4 bg-[#F3F4F6] dark:bg-white/5 rounded animate-pulse" />
          <div className="w-12 h-4 bg-[#F3F4F6] dark:bg-white/5 rounded animate-pulse" />
        </div>
        <div className="w-3/4 h-4 bg-[#F3F4F6] dark:bg-white/5 rounded animate-pulse" />
        <div className="w-full h-3 bg-[#F3F4F6] dark:bg-white/5 rounded animate-pulse" />
        <div className="w-5/6 h-3 bg-[#F3F4F6] dark:bg-white/5 rounded animate-pulse" />
        <div className="flex items-center justify-between pt-2">
          <div className="w-28 h-9 bg-[#F3F4F6] dark:bg-white/5 rounded-xl animate-pulse" />
          <div className="w-12 h-3 bg-[#F3F4F6] dark:bg-white/5 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export default AffiliateCardSkeleton
