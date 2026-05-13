import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Search,
  Sparkles,
  TrendingUp,
  MousePointerClick,
  Package,
  X,
} from 'lucide-react'

import AffiliateCard from '../components/affiliate/AffiliateCard'
import AffiliateCardSkeleton from '../components/affiliate/AffiliateCardSkeleton'
import { useAffiliates, useAffiliateAnalytics } from '../hooks/useAffiliates'
import { trackAffiliateClick } from '../services/affiliateService'
import { AFFILIATE_CATEGORIES, AFFILIATE_SOURCES } from '../types/affiliate'
import { clsx, formatCount } from '../lib/format'

/**
 * /tools — Affiliate recommendations gallery
 * Soft blue + neutral aesthetic, consistent with the rest of Skillio.
 */
function Tools({ user }) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const { items, loading, error } = useAffiliates({
    category: selectedCategory,
    limit: 60,
  })

  const { analytics, loading: analyticsLoading } = useAffiliateAnalytics()

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return items
    return items.filter((p) =>
      [p.title, p.description, p.category].some((field) =>
        (field || '').toLowerCase().includes(q)
      )
    )
  }, [items, searchQuery])

  const featured = useMemo(() => filtered.find((p) => p.is_featured), [filtered])
  const rest = useMemo(
    () => (featured ? filtered.filter((p) => p.id !== featured.id) : filtered),
    [filtered, featured]
  )

  return (
    <div className="min-h-screen bg-white dark:bg-white">
      {/* =================================================================
       * HEADER
       * ============================================================== */}
      <header className="relative overflow-hidden border-b border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 left-1/4 w-96 h-96 bg-blue-100/40 dark:bg-[#3B82F6]/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 right-1/4 w-[28rem] h-[28rem] bg-blue-50/60 dark:bg-[#3B82F6]/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 pt-10 pb-8 lg:pt-14 lg:pb-10">
          <Link
            to="/home"
            className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] dark:text-white/60 hover:text-[#111827] dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke feed
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Tools Recommendation
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] dark:text-white tracking-tight leading-tight mb-3">
              Tools Pilihan untuk Komunitas
            </h1>
            <p className="text-base text-[#6B7280] dark:text-white/60 leading-relaxed max-w-2xl">
              Kumpulan tools dan produk yang direkomendasikan platform untuk bantu kamu
              produktif, belajar, dan berkarya. Sebagian link bersifat sponsor.
            </p>
          </motion.div>

          {/* Search + categories */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.16 }}
            className="mt-6 flex items-center gap-2 max-w-3xl"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari tools, kategori, atau kata kunci..."
                className="w-full pl-11 pr-10 py-3 text-sm bg-white dark:bg-[#0B1220] border border-[#E5E7EB] dark:border-white/10 rounded-full outline-none placeholder:text-[#9CA3AF] focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/10 transition-all dark:text-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]"
                  aria-label="Bersihkan pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </motion.div>

          {/* Category chips */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.22 }}
            className="mt-5 flex gap-2 overflow-x-auto scrollbar-none pb-0.5 -mx-1 px-1"
          >
            {AFFILIATE_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={clsx(
                    'shrink-0 inline-flex items-center px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 border',
                    active
                      ? 'bg-[#3B82F6] text-white border-[#3B82F6] shadow-sm shadow-blue-500/20'
                      : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:text-[#111827] hover:border-[#3B82F6]/40 dark:bg-[#0B1220] dark:text-white/70 dark:border-white/10'
                  )}
                >
                  {cat === 'All' ? 'Semua' : cat}
                </button>
              )
            })}
          </motion.div>
        </div>
      </header>

      {/* =================================================================
       * BODY
       * ============================================================== */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 lg:py-10">
        {error ? (
          <div className="p-6 rounded-2xl border border-red-100 bg-red-50 text-sm text-red-700">
            {error}
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <AffiliateCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            onReset={() => {
              setSelectedCategory('All')
              setSearchQuery('')
            }}
          />
        ) : (
          <div className="space-y-10">
            {/* Featured */}
            {featured && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 text-[11px] font-semibold">
                    <Sparkles className="w-3 h-3" />
                    Featured
                  </span>
                  <h2 className="text-sm font-semibold text-[#111827] dark:text-white">
                    Pilihan platform minggu ini
                  </h2>
                </div>
                <FeaturedAffiliate
                  product={featured}
                  source={AFFILIATE_SOURCES.TOOLS_PAGE}
                  userId={user?.id}
                />
              </section>
            )}

            {/* Top clicked widget */}
            {analytics.topProducts.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#3B82F6]/10 text-[#3B82F6] text-[11px] font-semibold">
                    <TrendingUp className="w-3 h-3" />
                    Top picks
                  </span>
                  <h2 className="text-sm font-semibold text-[#111827] dark:text-white">
                    Paling banyak diklik komunitas
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {analytics.topProducts.slice(0, 3).map((p) => (
                    <AffiliateCard
                      key={p.id}
                      product={p}
                      variant="compact"
                      source={AFFILIATE_SOURCES.TOOLS_PAGE}
                      userId={user?.id}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Main grid */}
            <section>
              <div className="flex items-end justify-between gap-2 mb-4 flex-wrap">
                <h2 className="text-sm font-semibold text-[#111827] dark:text-white">
                  {selectedCategory === 'All' ? 'Semua tools' : selectedCategory}
                </h2>
                <span className="text-xs text-[#6B7280] dark:text-white/60">
                  {filtered.length} tools
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rest.map((product) => (
                  <AffiliateCard
                    key={product.id}
                    product={product}
                    source={AFFILIATE_SOURCES.TOOLS_PAGE}
                    userId={user?.id}
                  />
                ))}
              </div>
            </section>

          </div>
        )}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Sub-components
 * ------------------------------------------------------------------------- */

function StatTile({ label, value, icon: Icon, accent = false }) {
  return (
    <div
      className={clsx(
        'inline-flex items-center gap-3 px-4 py-3 rounded-xl border',
        accent
          ? 'bg-[#3B82F6]/10 border-[#3B82F6]/20 text-[#3B82F6]'
          : 'bg-white border-[#E5E7EB] text-[#111827] dark:bg-[#0B1220] dark:border-white/10 dark:text-white'
      )}
    >
      <span
        className={clsx(
          'inline-flex items-center justify-center w-8 h-8 rounded-lg shrink-0',
          accent
            ? 'bg-white text-[#3B82F6]'
            : 'bg-[#F3F4F6] text-[#6B7280] dark:bg-white/5 dark:text-white/70'
        )}
      >
        <Icon className="w-4 h-4" />
      </span>
      <div>
        <div
          className={clsx(
            'text-base font-semibold leading-none tabular-nums',
            accent ? 'text-[#3B82F6]' : 'text-[#111827] dark:text-white'
          )}
        >
          {value}
        </div>
        <div
          className={clsx(
            'text-[10px] uppercase tracking-wider mt-1',
            accent ? 'text-[#3B82F6]/70' : 'text-[#6B7280] dark:text-white/50'
          )}
        >
          {label}
        </div>
      </div>
    </div>
  )
}

function FeaturedAffiliate({ product, source, userId }) {
  // Larger, dual-column layout for the top featured product
  return (
    <div className="grid sm:grid-cols-5 gap-0 rounded-2xl border border-[#3B82F6]/20 overflow-hidden bg-white dark:bg-[#0B1220] dark:border-white/10 shadow-[0_12px_30px_-12px_rgba(59,130,246,0.25)]">
      <div className="sm:col-span-2 aspect-[16/10] sm:aspect-auto bg-gradient-to-br from-blue-100 via-blue-50 to-white dark:from-[#3B82F6]/15 dark:via-[#0B1220] dark:to-[#0B1220] relative">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#3B82F6]">
            <Sparkles className="w-12 h-12" />
          </div>
        )}
      </div>
      <div className="sm:col-span-3 p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#F3F4F6] dark:bg-white/10 text-[#6B7280] dark:text-white/70 text-[11px] font-medium">
            {product.category}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 text-[10px] font-semibold">
            Featured
          </span>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-[#111827] dark:text-white leading-tight mb-2">
          {product.title}
        </h3>
        <p className="text-sm text-[#6B7280] dark:text-white/60 leading-relaxed mb-5 line-clamp-3">
          {product.description}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 flex-wrap">
          <a
            href={product.affiliate_link}
            target="_blank"
            rel="noopener nofollow sponsored"
            onClick={() => {
              trackAffiliateClick({
                productId: product.id,
                source,
                userId,
              })
            }}
            className="group/btn inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 transition-all"
          >
            {product.button_text || 'Coba sekarang'}
            <Sparkles className="w-4 h-4 transition-transform group-hover/btn:rotate-12" />
          </a>
          <span className="inline-flex items-center gap-1 text-xs text-[#6B7280] dark:text-white/60">
            <MousePointerClick className="w-3.5 h-3.5" />
            {formatCount(product.click_count)} klik
          </span>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ onReset }) {
  return (
    <div className="bg-white dark:bg-[#0B1220] border border-dashed border-[#E5E7EB] dark:border-white/10 rounded-2xl p-10 sm:p-14 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#3B82F6]/10 text-[#3B82F6] mb-4">
        <Sparkles className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-[#111827] dark:text-white mb-2">
        Tidak ada tools yang cocok
      </h3>
      <p className="text-sm text-[#6B7280] dark:text-white/60 mb-6 max-w-sm mx-auto">
        Coba ubah kata kunci atau pilih kategori lain.
      </p>
      <button
        onClick={onReset}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-[#111827] bg-[#F3F4F6] hover:bg-[#E5E7EB] transition-colors dark:bg-white/10 dark:text-white"
      >
        <X className="w-4 h-4" />
        Reset filter
      </button>
    </div>
  )
}

function topCategoryName(map) {
  let best = null
  let max = 0
  Object.entries(map).forEach(([key, value]) => {
    if (value > max) {
      max = value
      best = key
    }
  })
  return best
}

export default Tools
