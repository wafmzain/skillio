import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

/* ---------------------------------------------------------------------------
 * Icons
 * ------------------------------------------------------------------------- */
const Icon = ({ name, className = 'w-4 h-4' }) => {
  const common = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }
  switch (name) {
    case 'sparkles':
      return <svg {...common}><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z"/></svg>
    case 'check':
      return <svg {...common}><path d="M20 6L9 17l-5-5"/></svg>
    case 'lock':
      return <svg {...common}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
    case 'arrow-right':
      return <svg {...common}><path d="M5 12h14M13 5l7 7-7 7"/></svg>
    case 'x':
      return <svg {...common}><path d="M18 6L6 18M6 6l12 12"/></svg>
    case 'shield':
      return <svg {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    default:
      return null
  }
}

const PERKS = [
  'AI Summary tanpa batas',
  'Creator analytics lengkap',
  'Badge Skillio+ verified',
  'Enhanced creator profile',
  'Early access fitur baru',
  'Prioritas di discovery',
]

/* ---------------------------------------------------------------------------
 * PremiumPaywall
 * ------------------------------------------------------------------------- */
function PremiumPaywall({ onUpgrade, compact = false }) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div
        className={`relative overflow-hidden bg-gradient-to-br from-[#111827] to-[#1F2937] rounded-2xl text-white ${
          compact ? 'p-6' : 'p-6 sm:p-10'
        }`}
      >
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#3B82F6]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-20 w-72 h-72 bg-[#3B82F6]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 text-white">
              <Icon name="lock" className="w-5 h-5" />
            </span>
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/10 text-white text-[10px] font-semibold">
              <Icon name="sparkles" className="w-3 h-3" />
              Skillio+ exclusive
            </div>
          </div>

          <h3
            className={`font-bold tracking-tight leading-tight mb-2 ${
              compact ? 'text-xl' : 'text-2xl sm:text-3xl'
            }`}
          >
            Insight ini hanya untuk member Skillio+
          </h3>
          <p
            className={`text-white/70 leading-relaxed mb-6 ${
              compact ? 'text-sm max-w-md' : 'text-sm sm:text-base max-w-xl'
            }`}
          >
            Skillio+ bukan paywall konten biasa. Ini set tools produktivitas creator — AI assist,
            analytics, dan badge verified untuk bangun personal brand.
          </p>

          {!compact && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-7">
              {PERKS.map((p) => (
                <div
                  key={p}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.04] border border-white/10"
                >
                  <span className="w-5 h-5 rounded-full bg-[#3B82F6]/20 text-[#60A5FA] flex items-center justify-center shrink-0">
                    <Icon name="check" className="w-3 h-3" />
                  </span>
                  <span className="text-sm text-white/90">{p}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-[#111827] bg-white hover:bg-[#F3F4F6] transition-colors"
            >
              Upgrade ke Skillio+
              <Icon
                name="arrow-right"
                className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
              />
            </button>
            <Link
              to="/premium"
              className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-colors"
            >
              Pelajari lebih dulu
            </Link>
          </div>

          <p className="text-[11px] text-white/50 mt-4 flex items-center gap-1.5">
            <Icon name="shield" className="w-3 h-3" />
            Batal kapan saja · Rp 49.000/bulan
          </p>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <UpgradeModal onClose={() => setShowModal(false)} onUpgrade={onUpgrade} />
        )}
      </AnimatePresence>
    </>
  )
}

/* ---------------------------------------------------------------------------
 * UpgradeModal (shared with Premium.jsx but simpler local copy)
 * ------------------------------------------------------------------------- */
function UpgradeModal({ onClose, onUpgrade }) {
  const [selectedPayment, setSelectedPayment] = useState('qris')
  const [processing, setProcessing] = useState(false)

  const paymentMethods = [
    { id: 'qris', name: 'QRIS', sub: 'Scan & bayar', popular: true },
    { id: 'gopay', name: 'GoPay', sub: 'E-wallet' },
    { id: 'dana', name: 'DANA', sub: 'E-wallet' },
    { id: 'bank', name: 'Bank Transfer', sub: 'Virtual account' },
  ]

  async function handlePay() {
    setProcessing(true)
    await new Promise((r) => setTimeout(r, 1200))
    if (onUpgrade) await onUpgrade(selectedPayment)
    setProcessing(false)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors z-10"
          aria-label="Tutup"
        >
          <Icon name="x" className="w-4 h-4" />
        </button>

        <div className="px-6 pt-6 pb-5 border-b border-[#E5E7EB]">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-semibold mb-3">
            <Icon name="sparkles" className="w-3.5 h-3.5" />
            Skillio+
          </div>
          <h2 className="text-xl font-bold text-[#111827] mb-1">Upgrade ke Skillio+</h2>
          <p className="text-sm text-[#6B7280]">
            Unlock creator tools — batal kapan saja.
          </p>
        </div>

        <div className="px-6 py-5 border-b border-[#E5E7EB]">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[#6B7280] mb-0.5">
                Total pembayaran
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[#111827]">Rp 49.000</span>
                <span className="text-xs text-[#6B7280]">/bulan</span>
              </div>
            </div>
            <span className="text-[10px] text-[#6B7280]">Ditagih bulanan</span>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-3">
            Metode pembayaran
          </div>
          <div className="space-y-2">
            {paymentMethods.map((m) => {
              const active = selectedPayment === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedPayment(m.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    active
                      ? 'border-[#3B82F6] bg-[#3B82F6]/5'
                      : 'border-[#E5E7EB] hover:border-[#3B82F6]/40'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      active ? 'border-[#3B82F6]' : 'border-[#E5E7EB]'
                    }`}
                  >
                    {active && <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[#111827]">{m.name}</div>
                    <div className="text-[11px] text-[#6B7280]">{m.sub}</div>
                  </div>
                  {m.popular && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#3B82F6]/10 text-[#3B82F6]">
                      Populer
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <button
            onClick={handlePay}
            disabled={processing}
            className={`w-full mt-5 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-all ${
              processing
                ? 'bg-[#9CA3AF] cursor-not-allowed'
                : 'bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30'
            }`}
          >
            {processing ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <Icon name="lock" className="w-4 h-4" />
                Bayar sekarang
              </>
            )}
          </button>

          <p className="text-[11px] text-[#9CA3AF] text-center mt-3 flex items-center justify-center gap-1.5">
            <Icon name="shield" className="w-3 h-3" />
            Demo payment — tidak ada transaksi nyata
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default PremiumPaywall
