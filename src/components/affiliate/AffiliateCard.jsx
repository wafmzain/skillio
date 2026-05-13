import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, ExternalLink, Sparkles, MousePointerClick } from 'lucide-react'
import { trackAffiliateClick, buildOutboundUrl } from '../../services/affiliateService'
import { clsx, formatCount, hostnameFrom } from '../../lib/format'

/**
 * AffiliateCard
 *
 * Variants:
 *  - 'default' : full card with image, used inside content & lists
 *  - 'compact' : small horizontal card for sidebars
 *  - 'inline'  : minimal one-liner banner for inline placement in articles
 */
function AffiliateCard({
  product,
  variant = 'default',
  source,
  contextId,
  userId,
  className = '',
}) {
  const [isPending, setIsPending] = useState(false)

  if (!product) return null

  const handleClick = async (e) => {
    if (isPending) return
    setIsPending(true)
    // Fire-and-forget click tracking; we still let the browser navigate.
    trackAffiliateClick({
      productId: product.id,
      source,
      contextId,
      userId,
    }).finally(() => setIsPending(false))
  }

  const outbound = buildOutboundUrl(product.affiliate_link, source)
  const host = hostnameFrom(product.affiliate_link)

  if (variant === 'compact') {
    return (
      <motion.a
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        href={outbound}
        target="_blank"
        rel="noopener nofollow sponsored"
        onClick={handleClick}
        className={clsx(
          'group flex items-center gap-3 p-3 rounded-xl border bg-white border-[#E5E7EB] hover:border-[#3B82F6]/30 hover:shadow-[0_6px_20px_-8px_rgba(59,130,246,0.18)] transition-all',
          'dark:bg-[#0B1220] dark:border-white/10 dark:hover:border-[#3B82F6]/40',
          className
        )}
      >
        <Thumb product={product} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-[#111827] dark:text-white truncate group-hover:text-[#3B82F6] transition-colors">
              {product.title}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#3B82F6]/10 text-[#3B82F6] font-semibold shrink-0">
              Sponsor
            </span>
          </div>
          <div className="text-[11px] text-[#6B7280] dark:text-white/60 truncate">
            {host || product.category}
          </div>
        </div>
        <ArrowUpRight className="w-4 h-4 text-[#6B7280] dark:text-white/60 group-hover:text-[#3B82F6] transition-colors shrink-0" />
      </motion.a>
    )
  }

  if (variant === 'inline') {
    return (
      <a
        href={outbound}
        target="_blank"
        rel="noopener nofollow sponsored"
        onClick={handleClick}
        className={clsx(
          'group block w-full p-4 rounded-xl border border-[#E5E7EB] bg-gradient-to-r from-[#3B82F6]/5 via-white to-white hover:border-[#3B82F6]/40 transition-all',
          'dark:from-[#3B82F6]/10 dark:via-[#0B1220] dark:to-[#0B1220] dark:border-white/10',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#3B82F6]">
                Rekomendasi
              </span>
              <span className="text-[10px] text-[#9CA3AF]">·</span>
              <span className="text-[10px] text-[#6B7280] dark:text-white/60">Sponsor</span>
            </div>
            <div className="text-sm font-semibold text-[#111827] dark:text-white truncate">
              {product.title}
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-[#3B82F6] group-hover:underline shrink-0">
            {product.button_text || 'Lihat'}
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </a>
    )
  }

  /* default variant */
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={clsx(
        'group flex flex-col bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden hover:border-[#3B82F6]/30 hover:shadow-[0_10px_30px_-10px_rgba(59,130,246,0.18)] transition-all',
        'dark:bg-[#0B1220] dark:border-white/10 dark:hover:border-[#3B82F6]/40',
        className
      )}
    >
      <Thumb product={product} size="lg" />

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#F3F4F6] dark:bg-white/10 text-[#6B7280] dark:text-white/70 text-[11px] font-medium">
            {product.category}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#3B82F6]/10 text-[#3B82F6] text-[10px] font-semibold">
            <Sparkles className="w-3 h-3" />
            Sponsor
          </span>
          {product.is_featured && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 text-[10px] font-semibold">
              Featured
            </span>
          )}
        </div>

        <h3 className="text-base font-semibold text-[#111827] dark:text-white mb-1.5 leading-snug">
          {product.title}
        </h3>
        <p className="text-sm text-[#6B7280] dark:text-white/60 leading-relaxed line-clamp-3 mb-4">
          {product.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3">
          <a
            href={outbound}
            target="_blank"
            rel="noopener nofollow sponsored"
            onClick={handleClick}
            className="group/btn inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 transition-all"
          >
            {product.button_text || 'Pelajari lebih'}
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
          </a>
          <span className="inline-flex items-center gap-1 text-[11px] text-[#6B7280] dark:text-white/50">
            <MousePointerClick className="w-3 h-3" />
            {formatCount(product.click_count)}
          </span>
        </div>

        {host && (
          <div className="mt-3 pt-3 border-t border-[#F3F4F6] dark:border-white/5 inline-flex items-center gap-1 text-[11px] text-[#9CA3AF]">
            <ExternalLink className="w-3 h-3" />
            {host}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function Thumb({ product, size = 'lg' }) {
  const tall = size === 'lg'
  const dimensions = tall ? 'aspect-[16/9]' : 'w-12 h-12 rounded-lg'

  if (!product.image_url) {
    return (
      <div
        className={clsx(
          'shrink-0 flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-50 to-white dark:from-[#3B82F6]/20 dark:via-[#0B1220] dark:to-[#0B1220] text-[#3B82F6]',
          dimensions
        )}
      >
        <Sparkles className={tall ? 'w-7 h-7' : 'w-5 h-5'} />
      </div>
    )
  }

  return (
    <div className={clsx('shrink-0 overflow-hidden bg-[#F3F4F6] dark:bg-white/5', dimensions)}>
      <img
        src={product.image_url}
        alt={product.title}
        loading="lazy"
        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
        onError={(e) => {
          e.currentTarget.style.display = 'none'
        }}
      />
    </div>
  )
}

export default AffiliateCard
