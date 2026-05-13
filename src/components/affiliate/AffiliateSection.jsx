import { Link } from 'react-router-dom'
import { Sparkles, ChevronRight } from 'lucide-react'
import AffiliateCard from './AffiliateCard'
import AffiliateCardSkeleton from './AffiliateCardSkeleton'
import { useAffiliates } from '../../hooks/useAffiliates'
import { clsx } from '../../lib/format'

/**
 * AffiliateSection
 * Reusable container that pulls affiliate products and renders them as a row,
 * grid, or compact list — whichever matches the placement.
 *
 * Props:
 *  - title, subtitle  : section header copy
 *  - layout           : 'grid' | 'list' | 'compact'
 *  - variant          : card variant ('default' | 'compact' | 'inline')
 *  - source           : analytics source tag forwarded to click tracker
 *  - contextId        : optional id (e.g. post id) forwarded to click tracker
 *  - userId           : optional auth user id
 *  - category         : filter by category
 *  - featuredOnly     : only show featured products
 *  - limit            : max items
 *  - showHeader       : toggle the title row
 *  - showSeeAll       : show "Lihat semua" link to /tools
 *  - emptyHidden      : if true, render nothing when there are no items
 */
function AffiliateSection({
  title = 'Rekomendasi Tools',
  subtitle = 'Tools yang sering dipakai komunitas',
  layout = 'grid',
  variant = 'default',
  source = 'inline',
  contextId,
  userId,
  category = null,
  featuredOnly = false,
  limit = 6,
  showHeader = true,
  showSeeAll = true,
  emptyHidden = true,
  className = '',
}) {
  const { items, loading, error } = useAffiliates({ category, featuredOnly, limit })

  if (!loading && !error && items.length === 0 && emptyHidden) return null

  const wrapClass = clsx(
    layout === 'grid'
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
      : 'space-y-3',
    className && layout === 'grid' ? '' : ''
  )

  const skeletonCount = layout === 'compact' ? Math.min(3, limit) : Math.min(3, limit)

  return (
    <section className={clsx('w-full', className)}>
      {showHeader && (
        <header className="flex items-end justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] shrink-0">
              <Sparkles className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm sm:text-base font-semibold text-[#111827] dark:text-white truncate">
                  {title}
                </h2>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#3B82F6]/10 text-[#3B82F6] font-semibold">
                  Sponsor
                </span>
              </div>
              {subtitle && (
                <p className="text-xs text-[#6B7280] dark:text-white/60 truncate">{subtitle}</p>
              )}
            </div>
          </div>
          {showSeeAll && (
            <Link
              to="/tools"
              className="inline-flex items-center gap-1 text-xs font-medium text-[#3B82F6] hover:text-[#2563EB] transition-colors shrink-0"
            >
              Lihat semua
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </header>
      )}

      {error ? (
        <div className="p-4 rounded-xl border border-red-100 bg-red-50 text-xs text-red-700">
          {error}
        </div>
      ) : loading ? (
        <div className={wrapClass}>
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <AffiliateCardSkeleton key={i} variant={variant} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="p-6 rounded-2xl border border-dashed border-[#E5E7EB] dark:border-white/10 text-center">
          <p className="text-sm text-[#6B7280] dark:text-white/60">
            Belum ada rekomendasi tools.
          </p>
        </div>
      ) : (
        <div className={wrapClass}>
          {items.map((product) => (
            <AffiliateCard
              key={product.id}
              product={product}
              variant={variant}
              source={source}
              contextId={contextId}
              userId={userId}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default AffiliateSection
