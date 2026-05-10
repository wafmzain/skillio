import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * AI Summary Card — result display in the soft-blue theme.
 */
function AISummaryCard({ summary, onClose }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60)
    return () => clearTimeout(t)
  }, [])

  function handleClose() {
    setVisible(false)
    setTimeout(() => onClose?.(), 200)
  }

  if (!summary) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-[#F3F4F6] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] shrink-0">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z" />
                  <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
                </svg>
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-semibold text-[#111827]">AI Summary</h3>
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[#3B82F6]/10 text-[#3B82F6] text-[10px] font-semibold">
                    Skillio+
                  </span>
                </div>
                <p className="text-[11px] text-[#6B7280]">
                  Dirangkum oleh Groq AI · hanya untuk bantu baca cepat
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
              aria-label="Tutup"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-5 py-5">
            <div className="text-sm text-[#111827] leading-relaxed whitespace-pre-line">
              {summary}
            </div>
          </div>

          <div className="px-5 py-3 border-t border-[#F3F4F6] flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-[#6B7280]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Summary selesai
            </span>
            <span className="text-[10px] text-[#9CA3AF]">Powered by Groq AI</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AISummaryCard
