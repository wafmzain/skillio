import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from './services/supabaseClient'
import { usePremium } from './hooks/usePremium'
import { upgradeToPremium, cancelSubscription } from './services/premiumService'

/* ---------------------------------------------------------------------------
 * Icons
 * ------------------------------------------------------------------------- */
const Icon = ({ name, className = 'w-5 h-5' }) => {
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
    case 'arrow-right':
      return <svg {...common}><path d="M5 12h14M13 5l7 7-7 7"/></svg>
    case 'trending':
      return <svg {...common}><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>
    case 'chart':
      return <svg {...common}><path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/></svg>
    case 'brain':
      return <svg {...common}><path d="M12 5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3 3 3 0 0 0 3-3V8a3 3 0 0 0-3-3z"/><path d="M12 5a3 3 0 1 0-4.5 2.6A3 3 0 0 0 6 10.5M12 5a3 3 0 1 1 4.5 2.6A3 3 0 0 1 18 10.5M6 10.5A3 3 0 0 0 6 15M18 10.5a3 3 0 0 1 0 4.5M9 18H7a3 3 0 0 1 0-6M15 18h2a3 3 0 0 0 0-6"/></svg>
    case 'badge':
      return <svg {...common}><path d="M12 2l2.4 2.8L18 4l.4 3.7L22 9l-1.6 3.4L22 15l-3.6 1.3L18 20l-3.6-.8L12 22l-2.4-2.8L6 20l-.4-3.7L2 15l1.6-3.4L2 9l3.6-1.3L6 4l3.6.8L12 2z"/><path d="M9 12l2 2 4-4"/></svg>
    case 'user-plus':
      return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/></svg>
    case 'zap':
      return <svg {...common}><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>
    case 'calendar':
      return <svg {...common}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
    case 'eye':
      return <svg {...common}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
    case 'heart':
      return <svg {...common}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6z"/></svg>
    case 'users':
      return <svg {...common}><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M21 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13A4 4 0 0 1 16 11"/></svg>
    case 'x':
      return <svg {...common}><path d="M18 6L6 18M6 6l12 12"/></svg>
    case 'shield':
      return <svg {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    case 'lock':
      return <svg {...common}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
    case 'message':
      return <svg {...common}><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z"/></svg>
    default:
      return null
  }
}

/* ---------------------------------------------------------------------------
 * Data
 * ------------------------------------------------------------------------- */
const FEATURES = [
  {
    icon: 'brain',
    title: 'AI Summary',
    description:
      'Ringkas insight panjang jadi poin utama dalam hitungan detik. Tulisan lebih tajam, research lebih cepat.',
    tag: 'AI Tools',
  },
  {
    icon: 'chart',
    title: 'Creator Analytics',
    description:
      'Lihat reach, retention, dan konversi follower per insight. Pahami konten mana yang benar-benar resonate.',
    tag: 'Insights',
  },
  {
    icon: 'badge',
    title: 'Premium Creator Badge',
    description:
      'Badge Skillio+ di profil dan setiap insight kamu. Tingkatkan kredibilitas di feed dan discovery.',
    tag: 'Identity',
  },
  {
    icon: 'trending',
    title: 'Advanced Insights',
    description:
      'Data audience mendalam: demografi, waktu aktif, topik yang mereka cari. Buat konten yang tepat sasaran.',
    tag: 'Growth',
  },
  {
    icon: 'zap',
    title: 'Early Features Access',
    description:
      'Jadi yang pertama coba fitur baru. Feedback kamu langsung membentuk arah produk Skillio.',
    tag: 'Access',
  },
  {
    icon: 'user-plus',
    title: 'Enhanced Creator Profile',
    description:
      'Layout profil yang lebih kaya, highlight insight terbaik, dan featured work untuk bangun personal brand.',
    tag: 'Branding',
  },
]

const BENEFITS = [
  {
    icon: 'zap',
    title: 'Tingkatkan produktivitas creator',
    desc: 'Workflow lebih cepat dengan AI assist, draft sync, dan scheduled posting.',
  },
  {
    icon: 'user-plus',
    title: 'Bangun personal brand lebih cepat',
    desc: 'Badge verified, profil enhanced, dan featured placement di discovery.',
  },
  {
    icon: 'chart',
    title: 'Analisis engagement creator',
    desc: 'Dashboard analytics real-time untuk memahami performa setiap insight.',
  },
  {
    icon: 'brain',
    title: 'AI tools untuk insight lebih efisien',
    desc: 'Summarize, outline, dan improve tulisan otomatis tanpa kehilangan suara khas kamu.',
  },
]

/* ---------------------------------------------------------------------------
 * Premium page
 * ------------------------------------------------------------------------- */
function Premium() {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [toast, setToast] = useState(null)

  const { isPremium, subscription, loading: premiumLoading, refetch } =
    usePremium(currentUser?.id)

  useEffect(() => {
    getCurrentUser()
  }, [])

  async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
    setLoading(false)
  }

  function showToast(message, tone = 'success') {
    setToast({ message, tone })
    setTimeout(() => setToast(null), 3500)
  }

  async function handleUpgrade(paymentType) {
    if (!currentUser) return
    const result = await upgradeToPremium(currentUser.id, paymentType)
    if (result.success) {
      await refetch()
      showToast('Selamat datang di Skillio+')
    } else {
      showToast('Gagal upgrade: ' + result.error, 'error')
    }
  }

  async function handleCancel() {
    if (!confirm('Batalkan membership Skillio+? Kamu tetap bisa pakai semua fitur gratis.')) return
    const result = await cancelSubscription(currentUser.id)
    if (result.success) {
      await refetch()
      showToast('Membership dibatalkan')
    } else {
      showToast('Gagal membatalkan: ' + result.error, 'error')
    }
  }

  if (loading || premiumLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#E5E7EB] border-t-[#3B82F6] rounded-full animate-spin" />
      </div>
    )
  }

  const memberSince = subscription?.started_at
    ? new Date(subscription.started_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  const activeUntil = subscription?.expired_at
    ? new Date(subscription.expired_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  const daysLeft =
    subscription?.expired_at
      ? Math.max(
          0,
          Math.ceil(
            (new Date(subscription.expired_at).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : null

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50"
          >
            <div
              className={`px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg border ${
                toast.tone === 'error'
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-white border-[#E5E7EB] text-[#111827]'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Icon
                  name={toast.tone === 'error' ? 'x' : 'check'}
                  className="w-4 h-4"
                />
                {toast.message}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================================
       * HERO
       * ===================================================================*/}
      <section className="relative overflow-hidden border-b border-[#E5E7EB]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/4 w-[32rem] h-[32rem] bg-blue-200/40 rounded-full blur-3xl" />
          <div className="absolute top-40 right-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 pt-12 pb-16 lg:pt-20 lg:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: copy */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-semibold mb-5">
                <Icon name="sparkles" className="w-3.5 h-3.5" />
                Skillio+ · Creator productivity
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111827] tracking-tight leading-[1.1] mb-5">
                Creator Tools untuk{' '}
                <span className="text-[#3B82F6]">Berkembang Lebih Cepat</span>
              </h1>

              <p className="text-base sm:text-lg text-[#6B7280] leading-relaxed max-w-[540px] mb-8">
                Akses fitur premium untuk membantu creator membangun audience, meningkatkan
                produktivitas, dan berkembang lebih cepat di Skillio.
              </p>

              {/* Primary CTA area */}
              {!isPremium ? (
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all"
                  >
                    Upgrade ke Skillio+
                    <Icon
                      name="arrow-right"
                      className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                    />
                  </button>
                  <a
                    href="#features"
                    className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl text-sm font-semibold text-[#111827] bg-white border border-[#E5E7EB] hover:border-[#3B82F6]/40 transition-all"
                  >
                    Lihat fitur
                  </a>
                </div>
              ) : (
                <MembershipActiveCard
                  memberSince={memberSince}
                  activeUntil={activeUntil}
                  daysLeft={daysLeft}
                  onCancel={handleCancel}
                />
              )}

              {/* Trust indicators */}
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#6B7280]">
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="check" className="w-3.5 h-3.5 text-[#3B82F6]" />
                  Batal kapan saja
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="check" className="w-3.5 h-3.5 text-[#3B82F6]" />
                  Semua feed tetap gratis
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="check" className="w-3.5 h-3.5 text-[#3B82F6]" />
                  Dukungan lokal
                </span>
              </div>
            </motion.div>

            {/* Right: preview visuals */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
              className="relative lg:pl-6"
            >
              <HeroPreview />
            </motion.div>
          </div>
        </div>
      </section>

      {/* =====================================================================
       * FEATURE GRID
       * ===================================================================*/}
      <section id="features" className="px-4 sm:px-6 py-16 lg:py-24">
        <div className="max-w-[1200px] mx-auto">
          <div className="max-w-[640px] mb-10">
            <div className="inline-flex items-center gap-2 text-[#3B82F6] mb-2">
              <Icon name="sparkles" className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Creator tools
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight leading-tight mb-3">
              Dibangun untuk creator yang ingin serius
            </h2>
            <p className="text-base text-[#6B7280] leading-relaxed">
              Skillio+ adalah set tools produktivitas creator — bukan paywall konten. Semua insight
              di feed tetap bisa diakses bebas.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.05 } },
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  show: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="group p-6 bg-white border border-[#E5E7EB] rounded-2xl hover:border-[#3B82F6]/30 hover:shadow-[0_10px_30px_-10px_rgba(59,130,246,0.18)] hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center group-hover:bg-[#3B82F6] group-hover:text-white transition-colors">
                    <Icon name={f.icon} className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                    {f.tag}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-[#111827] mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* =====================================================================
       * ANALYTICS PREVIEW
       * ===================================================================*/}
      <section className="px-4 sm:px-6 py-16 lg:py-20">
        <div className="max-w-[1200px] mx-auto">
          <div className="relative bg-gradient-to-br from-[#111827] to-[#1F2937] rounded-3xl overflow-hidden p-6 sm:p-10 lg:p-14">
            <div className="absolute top-0 right-0 w-[28rem] h-[28rem] bg-[#3B82F6]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#3B82F6]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-medium text-white mb-5">
                  <Icon name="chart" className="w-3.5 h-3.5" />
                  Creator Analytics
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight mb-4">
                  Pahami audiens, optimize insight, tumbuh lebih sengaja
                </h2>
                <p className="text-base text-white/70 leading-relaxed mb-6 max-w-[520px]">
                  Dashboard analytics real-time untuk setiap insight yang kamu publish. Lihat
                  performa, pola engagement, dan temukan apa yang benar-benar resonate dengan
                  audience kamu.
                </p>

                <ul className="space-y-3">
                  {[
                    'Reach, retention, dan konversi per insight',
                    'Pola waktu aktif audience kamu',
                    'Topik yang paling banyak di-bookmark',
                    'Growth follower mingguan dan bulanan',
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-3 text-sm text-white/90">
                      <span className="w-5 h-5 rounded-full bg-[#3B82F6]/20 text-[#3B82F6] flex items-center justify-center shrink-0 mt-0.5">
                        <Icon name="check" className="w-3 h-3" />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              <AnalyticsPreview />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
       * BENEFITS
       * ===================================================================*/}
      <section className="px-4 sm:px-6 py-16 lg:py-20">
        <div className="max-w-[1200px] mx-auto">
          <div className="max-w-[640px] mb-10">
            <div className="inline-flex items-center gap-2 text-[#3B82F6] mb-2">
              <Icon name="trending" className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Kenapa Skillio+
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight leading-tight mb-3">
              Tools yang terasa seperti partner pertumbuhan
            </h2>
            <p className="text-base text-[#6B7280] leading-relaxed">
              Setiap fitur dirancang untuk satu hal: bantu kamu build audience dan bikin insight
              yang lebih tajam.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="flex items-start gap-4 p-5 bg-white border border-[#E5E7EB] rounded-2xl hover:border-[#3B82F6]/30 transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center shrink-0">
                  <Icon name={b.icon} className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-[#111827] mb-1.5">
                    {b.title}
                  </h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
       * PRICING
       * ===================================================================*/}
      <section className="px-4 sm:px-6 py-16 lg:py-20">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center max-w-[580px] mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-semibold mb-3">
              <Icon name="sparkles" className="w-3.5 h-3.5" />
              Harga sederhana
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight leading-tight">
              Satu paket, semua creator tools
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5 max-w-[960px] mx-auto">
            {/* Free plan */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-7">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-[#111827]">Free</h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  Selamanya
                </span>
              </div>
              <p className="text-sm text-[#6B7280] mb-5">
                Semua yang kamu butuhkan untuk mulai berbagi insight.
              </p>

              <div className="mb-6">
                <span className="text-3xl font-bold text-[#111827]">Rp 0</span>
                <span className="text-sm text-[#6B7280] ml-1">/bulan</span>
              </div>

              <ul className="space-y-3 mb-7">
                {[
                  'Akses penuh ke feed creator',
                  'Posting insight tanpa batas',
                  'Follow, like, komentar, bookmark',
                  'Discovery trending creator',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-sm text-[#111827]">
                    <span className="w-4 h-4 rounded-full bg-[#F3F4F6] text-[#6B7280] flex items-center justify-center shrink-0 mt-0.5">
                      <Icon name="check" className="w-2.5 h-2.5" />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>

              <Link to="/home">
                <button className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-[#111827] bg-[#F3F4F6] hover:bg-[#E5E7EB] transition-colors">
                  Lanjut dengan Free
                </button>
              </Link>
            </div>

            {/* Skillio+ plan */}
            <div className="relative bg-white border-2 border-[#3B82F6] rounded-2xl p-7 shadow-[0_20px_50px_-20px_rgba(59,130,246,0.35)]">
              <span className="absolute -top-3 right-6 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#3B82F6] text-white text-[11px] font-semibold shadow-sm">
                <Icon name="sparkles" className="w-3 h-3" />
                Rekomendasi
              </span>

              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-[#111827]">Skillio+</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#3B82F6]/10 text-[#3B82F6] text-[10px] font-semibold">
                  <Icon name="sparkles" className="w-3 h-3" />
                  Creator tools
                </span>
              </div>
              <p className="text-sm text-[#6B7280] mb-5">
                Tools produktivitas untuk creator yang ingin tumbuh lebih cepat.
              </p>

              <div className="mb-6">
                <span className="text-3xl font-bold text-[#111827]">Rp 49.000</span>
                <span className="text-sm text-[#6B7280] ml-1">/bulan</span>
              </div>

              <ul className="space-y-3 mb-7">
                {[
                  'AI Summary tanpa batas',
                  'Creator analytics lengkap',
                  'Badge Skillio+ verified',
                  'Early access fitur baru',
                  'Enhanced creator profile',
                  'Prioritas di discovery',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-sm text-[#111827]">
                    <span className="w-4 h-4 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center shrink-0 mt-0.5">
                      <Icon name="check" className="w-2.5 h-2.5" />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>

              {!isPremium ? (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="group w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                >
                  Upgrade ke Skillio+
                  <Icon
                    name="arrow-right"
                    className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                  />
                </button>
              ) : (
                <button
                  onClick={handleCancel}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-[#111827] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
                >
                  Kelola Membership
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
       * FAQ
       * ===================================================================*/}
      <section className="px-4 sm:px-6 py-16 lg:py-20">
        <div className="max-w-[880px] mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight leading-tight mb-3">
              Pertanyaan umum
            </h2>
            <p className="text-base text-[#6B7280]">
              Hal-hal yang sering ditanyakan tentang Skillio+.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'Apakah konten di feed dikunci kalau saya tidak upgrade?',
                a: 'Tidak. Semua insight yang di-post creator bisa diakses bebas di feed. Skillio+ fokus ke tools produktivitas untuk creator, bukan paywall konten.',
              },
              {
                q: 'Bisa batal kapan saja?',
                a: 'Bisa. Kamu bisa cancel kapan pun dari halaman ini. Akses Skillio+ tetap aktif sampai akhir periode berjalan.',
              },
              {
                q: 'Apa yang terjadi ke analytics kalau saya downgrade?',
                a: 'Data historis tetap aman. Kamu hanya akan kehilangan akses ke dashboard lengkap. Upgrade kembali, semua data kembali bisa diakses.',
              },
              {
                q: 'Apakah ada paket tahunan?',
                a: 'Saat ini kami fokus ke paket bulanan biar creator bisa mulai tanpa komitmen besar. Paket tahunan akan hadir menyusul.',
              },
            ].map((item) => (
              <FAQItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <UpgradeModal
            onClose={() => setShowUpgradeModal(false)}
            onUpgrade={handleUpgrade}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Active membership card
 * ------------------------------------------------------------------------- */
function MembershipActiveCard({ memberSince, activeUntil, daysLeft, onCancel }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-[#E5E7EB] rounded-2xl p-5 shadow-sm max-w-[520px]">
      <div className="flex items-center justify-between mb-4">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-semibold">
          <Icon name="check" className="w-3.5 h-3.5" />
          Skillio+ Active
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs text-[#6B7280]">
          <Icon name="badge" className="w-3.5 h-3.5 text-[#3B82F6]" />
          Creator Pro
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[#6B7280] mb-0.5">
            Member sejak
          </div>
          <div className="text-sm font-semibold text-[#111827]">
            {memberSince || '—'}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[#6B7280] mb-0.5">
            Aktif sampai
          </div>
          <div className="text-sm font-semibold text-[#111827]">
            {activeUntil || '—'}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[#6B7280] mb-0.5">
            Sisa hari
          </div>
          <div className="text-sm font-semibold text-[#3B82F6]">
            {daysLeft != null ? `${daysLeft} hari` : '—'}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link to="/profile" className="flex-1 min-w-[140px]">
          <button className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-sm shadow-blue-500/20 transition-colors">
            Kelola Membership
          </button>
        </Link>
        <button
          onClick={onCancel}
          className="flex-1 min-w-[140px] px-4 py-2.5 rounded-xl text-sm font-semibold text-[#111827] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
        >
          Batalkan
        </button>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Hero preview — floating creator card + analytics + AI tool chip
 * ------------------------------------------------------------------------- */
function HeroPreview() {
  return (
    <div className="relative">
      {/* Main analytics card */}
      <div className="relative bg-white border border-[#E5E7EB] rounded-2xl shadow-[0_30px_80px_-30px_rgba(17,24,39,0.2)] p-5 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center">
              <Icon name="chart" className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#111827]">Creator analytics</div>
              <div className="text-[10px] text-[#6B7280]">7 hari terakhir</div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#3B82F6]/10 text-[#3B82F6] text-[10px] font-semibold">
            <Icon name="trending" className="w-3 h-3" />
            +24%
          </span>
        </div>

        {/* Bars */}
        <div className="flex items-end gap-2 h-24 mb-4">
          {[30, 55, 42, 65, 50, 80, 92].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-md bg-gradient-to-t from-[#3B82F6] to-[#60A5FA]"
                style={{ height: `${h}%` }}
              />
              <span className="text-[9px] text-[#9CA3AF]">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'][i]}
              </span>
            </div>
          ))}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#F3F4F6]">
          {[
            { label: 'Views', value: '48.2K', icon: 'eye' },
            { label: 'Engagement', value: '7.9%', icon: 'heart' },
            { label: 'Follower', value: '+312', icon: 'users' },
          ].map((m) => (
            <div key={m.label}>
              <div className="flex items-center gap-1 text-[10px] text-[#6B7280] mb-0.5">
                <Icon name={m.icon} className="w-3 h-3" />
                {m.label}
              </div>
              <div className="text-sm font-semibold text-[#111827]">{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating AI chip */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-4 -left-3 bg-white border border-[#E5E7EB] rounded-xl shadow-lg p-3 flex items-center gap-2.5 max-w-[220px]"
      >
        <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center shrink-0">
          <Icon name="brain" className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] text-[#6B7280]">AI Summary</div>
          <div className="text-xs font-semibold text-[#111827] truncate">
            Ringkas 12 insight jadi 3 poin kunci
          </div>
        </div>
      </motion.div>

      {/* Floating badge chip */}
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute -bottom-4 -right-3 bg-white border border-[#E5E7EB] rounded-xl shadow-lg p-3 flex items-center gap-2.5"
      >
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
            S
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#3B82F6] text-white flex items-center justify-center ring-2 ring-white">
            <Icon name="sparkles" className="w-2 h-2" />
          </span>
        </div>
        <div>
          <div className="text-xs font-semibold text-[#111827]">Sarah · Skillio+</div>
          <div className="text-[10px] text-[#6B7280]">Verified creator</div>
        </div>
      </motion.div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Analytics preview (section 3)
 * ------------------------------------------------------------------------- */
function AnalyticsPreview() {
  return (
    <div className="relative">
      <div className="bg-white/[0.04] backdrop-blur-sm border border-white/10 rounded-2xl p-5">
        {/* Metric tiles */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: 'Total views', value: '148.9K', icon: 'eye', delta: '+18%' },
            { label: 'Engagement', value: '7.9%', icon: 'heart', delta: '+2.1%' },
            { label: 'Creator reach', value: '82.4K', icon: 'trending', delta: '+24%' },
            { label: 'New followers', value: '+1.2K', icon: 'users', delta: '+31%' },
          ].map((m) => (
            <div
              key={m.label}
              className="p-3 rounded-xl bg-white/[0.04] border border-white/10"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="inline-flex items-center gap-1 text-[10px] text-white/60">
                  <Icon name={m.icon} className="w-3 h-3" />
                  {m.label}
                </div>
                <span className="text-[10px] text-emerald-300">{m.delta}</span>
              </div>
              <div className="text-lg font-semibold text-white">{m.value}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-white/80 font-medium">Audience growth</div>
            <span className="text-[10px] text-white/50">30 hari</span>
          </div>
          <div className="flex items-end gap-1.5 h-20">
            {[30, 40, 35, 50, 45, 60, 55, 70, 65, 78, 72, 88, 92].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm bg-gradient-to-t from-[#3B82F6] to-[#60A5FA] opacity-90"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * FAQ item
 * ------------------------------------------------------------------------- */
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-[#FAFAFA] transition-colors"
      >
        <span className="text-sm font-semibold text-[#111827]">{q}</span>
        <span
          className={`w-7 h-7 rounded-lg bg-[#F3F4F6] text-[#6B7280] flex items-center justify-center shrink-0 transition-transform ${
            open ? 'rotate-45' : ''
          }`}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 text-sm text-[#6B7280] leading-relaxed border-t border-[#F3F4F6] pt-4">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Upgrade Modal
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
    await onUpgrade(selectedPayment)
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

        {/* Header */}
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

        {/* Price */}
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

        {/* Payment methods */}
        <div className="px-6 py-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-3">
            Metode pembayaran
          </div>
          <div className="space-y-2">
            {paymentMethods.map((method) => {
              const active = selectedPayment === method.id
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id)}
                  className={`relative w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
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
                    <div className="text-sm font-semibold text-[#111827]">
                      {method.name}
                    </div>
                    <div className="text-[11px] text-[#6B7280]">{method.sub}</div>
                  </div>
                  {method.popular && (
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
                Bayar Sekarang
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

export default Premium
