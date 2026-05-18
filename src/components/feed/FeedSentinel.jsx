import { motion } from 'framer-motion'

/**
 * FeedSentinel
 * Renders the bottom-of-list loader element used by `useInfiniteFeed`.
 * Mount the `loaderRef` returned by the hook on this component so the
 * IntersectionObserver triggers when it scrolls into view.
 *
 *   <FeedSentinel
 *     loaderRef={feed.loaderRef}
 *     hasMore={feed.hasMore}
 *     loading={feed.loadingMore}
 *   />
 */
function FeedSentinel({ loaderRef, hasMore, loading, label = 'Memuat lebih banyak insight…', endLabel = 'Kamu sudah sampai bawah ✦' }) {
  return (
    <div ref={loaderRef} className="py-8 flex items-center justify-center">
      {hasMore ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: loading ? 1 : 0.5 }}
          transition={{ duration: 0.2 }}
          className="inline-flex items-center gap-2 text-xs text-[#6B7280]"
          aria-live="polite"
        >
          <span className="w-3.5 h-3.5 inline-block rounded-full border-2 border-[#E5E7EB] border-t-[#3B82F6] animate-spin" />
          {label}
        </motion.div>
      ) : (
        <span className="text-[11px] text-[#9CA3AF]">{endLabel}</span>
      )}
    </div>
  )
}

export default FeedSentinel
