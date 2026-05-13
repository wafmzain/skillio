import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import ReputationIcon from './ReputationIcons'
import { formatPoints } from '../../services/reputation'

/**
 * PointsCounter
 * Animated counter that smoothly counts up to the target points value.
 */
function PointsCounter({ value = 0, size = 'default', showIcon = true, className = '' }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const start = display
    const end = Math.max(0, Math.floor(value || 0))
    if (start === end) return

    const duration = Math.min(1200, 400 + Math.abs(end - start) * 3)
    const startedAt = performance.now()
    let raf = 0

    const tick = (now) => {
      const t = Math.min(1, (now - startedAt) / duration)
      const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
      setDisplay(Math.round(start + (end - start) * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])

  const sizes = {
    tiny: { wrap: 'text-xs', num: 'text-sm', icon: 'w-3 h-3' },
    small: { wrap: 'text-xs', num: 'text-base', icon: 'w-3.5 h-3.5' },
    default: { wrap: 'text-xs', num: 'text-xl', icon: 'w-4 h-4' },
    large: { wrap: 'text-xs', num: 'text-3xl', icon: 'w-5 h-5' },
  }
  const sz = sizes[size] || sizes.default

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${sz.wrap} ${className}`}
    >
      {showIcon && (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#3B82F6]/10 text-[#3B82F6]">
          <ReputationIcon name="sparkles" className={sz.icon} />
        </span>
      )}
      <motion.span
        key={value}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={`font-bold tabular-nums text-[#111827] ${sz.num}`}
      >
        {formatPoints(display)}
      </motion.span>
      <span className="text-[#6B7280] font-medium">pts</span>
    </span>
  )
}

export default PointsCounter
