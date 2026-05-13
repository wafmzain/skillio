import { motion, AnimatePresence } from 'framer-motion'
import ReputationIcon from './ReputationIcons'
import { POINTS_CONFIG } from '../../services/reputation'

/**
 * TrendingCelebration
 * Subtle confetti-free celebration banner for posts that hit trending.
 * Renders inline (e.g. above a PostCard or inside PostDetail).
 */
function TrendingCelebration({ show = true, compact = false, className = '' }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`relative overflow-hidden rounded-xl border bg-gradient-to-r from-[#3B82F6]/8 via-[#3B82F6]/4 to-transparent border-[#3B82F6]/20 ${
            compact ? 'px-3 py-2' : 'px-4 py-3'
          } ${className}`}
        >
          {/* Pulse ring decoration */}
          <motion.span
            aria-hidden
            className="absolute -left-3 -top-3 w-16 h-16 rounded-full bg-[#3B82F6]/15 blur-xl pointer-events-none"
            animate={{ opacity: [0.3, 0.55, 0.3], scale: [1, 1.1, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="relative flex items-center gap-3">
            <motion.span
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#3B82F6]/15 text-[#3B82F6] shrink-0"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ReputationIcon name="flame" className="w-4 h-4" />
            </motion.span>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-[#111827]">
                Insight ini sedang trending
              </div>
              <div className="text-[11px] text-[#6B7280]">
                +{POINTS_CONFIG.TRENDING_BONUS} reputation untuk kontribusi kamu ke komunitas
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-[#3B82F6]/20 text-[#3B82F6] text-[10px] font-semibold shrink-0">
              <ReputationIcon name="sparkles" className="w-2.5 h-2.5" />
              +{POINTS_CONFIG.TRENDING_BONUS} pts
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default TrendingCelebration
