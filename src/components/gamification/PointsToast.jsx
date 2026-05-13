import { createContext, useCallback, useContext, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Trophy } from 'lucide-react'

/**
 * PointsToast — global notification system for gamification events.
 * Wrap your app with <PointsToastProvider> and call showPointsToast() anywhere.
 */

const PointsToastContext = createContext(null)

export function usePointsToast() {
  return useContext(PointsToastContext)
}

export function PointsToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showPointsToast = useCallback(({ amount, reason, badge } = {}) => {
    const id = Date.now() + Math.random()
    const toast = { id, amount, reason, badge }
    setToasts((prev) => [...prev.slice(-2), toast]) // max 3 visible
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  return (
    <PointsToastContext.Provider value={showPointsToast}>
      {children}
      <ToastContainer toasts={toasts} />
    </PointsToastContext.Provider>
  )
}

function ToastContainer({ toasts }) {
  return (
    <div className="fixed top-20 right-4 z-[60] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="pointer-events-auto"
          >
            {toast.badge ? (
              <BadgeToast badge={toast.badge} />
            ) : (
              <PointToast amount={toast.amount} reason={toast.reason} />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function PointToast({ amount, reason }) {
  const label = reasonLabel(reason)
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-[#E5E7EB] shadow-lg shadow-blue-500/10 min-w-[220px]">
      <motion.span
        initial={{ scale: 0.5, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] shrink-0"
      >
        <Sparkles className="w-4 h-4" />
      </motion.span>
      <div className="min-w-0">
        <motion.div
          initial={{ y: 4, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm font-bold text-[#3B82F6] tabular-nums"
        >
          +{amount} Poin
        </motion.div>
        <div className="text-[11px] text-[#6B7280] truncate">{label}</div>
      </div>
    </div>
  )
}

function BadgeToast({ badge }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-amber-200 shadow-lg shadow-amber-500/10 min-w-[220px]">
      <motion.span
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 shrink-0"
      >
        <Trophy className="w-4 h-4" />
      </motion.span>
      <div className="min-w-0">
        <div className="text-sm font-bold text-[#111827]">Badge Unlocked!</div>
        <div className="text-[11px] text-[#6B7280] truncate">{badge}</div>
      </div>
    </div>
  )
}

function reasonLabel(reason) {
  const map = {
    post_created: 'Insight dipublikasikan',
    like_received: 'Insight kamu disukai',
    comment_received: 'Insight kamu dikomentari',
    bookmark_received: 'Insight kamu disimpan',
    daily_login: 'Login harian',
    trending_bonus: 'Insight masuk trending',
  }
  return map[reason] || 'Aktivitas komunitas'
}
