import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Gift, Sparkles, Zap, Trophy, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { supabase } from '../services/supabaseClient'
import { useGamification, useRewards, usePointHistory } from '../hooks/useGamification'
import { getRankInfo, POINT_VALUES } from '../services/gamification'
import { formatCount } from '../lib/format'

function Rewards() {
  const [currentUser, setCurrentUser] = useState(null)
  const [toast, setToast] = useState(null)
  const [redeemingId, setRedeemingId] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user))
  }, [])

  const { points, rank, badges, loading: gamLoading, dailyClaimAvailable, handleDailyClaim, refetch: refetchGam } = useGamification(currentUser?.id)
  const { rewards, redemptions, loading: rewardsLoading, handleRedeem, refetch: refetchRewards } = useRewards(currentUser?.id)
  const { history, loading: historyLoading } = usePointHistory(currentUser?.id, 10)

  const rankInfo = getRankInfo(rank)

  function showToast(msg, tone = 'success') {
    setToast({ msg, tone })
    setTimeout(() => setToast(null), 3000)
  }

  async function onDailyClaim() {
    const result = await handleDailyClaim()
    if (result.success) {
      showToast(`+${result.amount || 3} poin! Login harian diklaim`)
      refetchGam()
    } else {
      showToast(result.error || 'Gagal klaim', 'error')
    }
  }

  async function onRedeem(rewardId) {
    if (redeemingId) return
    setRedeemingId(rewardId)
    const result = await handleRedeem(rewardId)
    if (result.success) {
      showToast(`Berhasil! ${result.reward_title || 'Reward'} ditukarkan`)
      refetchGam()
      refetchRewards()
    } else {
      showToast(result.error || 'Gagal menukarkan', 'error')
    }
    setRedeemingId(null)
  }

  const loading = gamLoading || rewardsLoading

  return (
    <div className="min-h-screen bg-white">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50"
          >
            <div className={`px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg border ${
              toast.tone === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-[#E5E7EB] text-[#111827]'
            }`}>
              {toast.msg}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="border-b border-[#E5E7EB]">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-10 pb-8">
          <Link to="/home" className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#111827] mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-semibold mb-3">
                <Gift className="w-3.5 h-3.5" />
                Rewards
              </div>
              <h1 className="text-3xl font-bold text-[#111827] tracking-tight mb-2">
                Tukarkan Poin
              </h1>
              <p className="text-sm text-[#6B7280] max-w-lg">
                Kumpulkan poin dari aktivitas di Skillio dan tukarkan untuk fitur premium, badge, dan boost.
              </p>
            </div>
          </div>

          {/* Points summary */}
          {currentUser && !loading && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl border border-[#3B82F6]/20 bg-[#3B82F6]/5">
                <div className="text-[10px] text-[#3B82F6] uppercase tracking-wider font-semibold mb-1">Poin kamu</div>
                <div className="text-2xl font-bold text-[#3B82F6] tabular-nums">{formatCount(points)}</div>
              </div>
              <div className="p-4 rounded-xl border border-[#E5E7EB]">
                <div className="text-[10px] text-[#6B7280] uppercase tracking-wider font-semibold mb-1">Rank</div>
                <div className="text-base font-bold" style={{ color: rankInfo.color }}>{rank}</div>
              </div>
              <div className="p-4 rounded-xl border border-[#E5E7EB]">
                <div className="text-[10px] text-[#6B7280] uppercase tracking-wider font-semibold mb-1">Badge</div>
                <div className="text-base font-bold text-[#111827]">{badges.length}</div>
              </div>
              <div className="p-4 rounded-xl border border-[#E5E7EB]">
                <div className="text-[10px] text-[#6B7280] uppercase tracking-wider font-semibold mb-1">Ditukarkan</div>
                <div className="text-base font-bold text-[#111827]">{redemptions.length}</div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Main — rewards grid */}
          <main className="lg:col-span-8 space-y-8">
            {/* Daily claim */}
            {currentUser && dailyClaimAvailable && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl border border-[#3B82F6]/20 bg-gradient-to-r from-[#3B82F6]/5 to-transparent"
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center">
                      <Zap className="w-5 h-5" />
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-[#111827]">Login Harian</div>
                      <div className="text-xs text-[#6B7280]">Klaim +{POINT_VALUES.DAILY_LOGIN} poin setiap hari</div>
                    </div>
                  </div>
                  <button
                    onClick={onDailyClaim}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-sm shadow-blue-500/20 transition-all"
                  >
                    <Zap className="w-4 h-4" />
                    Klaim +{POINT_VALUES.DAILY_LOGIN}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Rewards catalog */}
            <section>
              <h2 className="text-lg font-semibold text-[#111827] mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#3B82F6]" />
                Reward yang tersedia
              </h2>

              {rewardsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-48 rounded-2xl border border-[#E5E7EB] animate-pulse bg-[#F9FAFB]" />
                  ))}
                </div>
              ) : rewards.length === 0 ? (
                <div className="text-center py-12 rounded-2xl border border-dashed border-[#E5E7EB]">
                  <Gift className="w-8 h-8 text-[#3B82F6] mx-auto mb-3" />
                  <p className="text-sm text-[#6B7280]">Belum ada reward tersedia.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {rewards.map((reward) => {
                    const canAfford = points >= reward.cost_points
                    const isRedeeming = redeemingId === reward.id
                    return (
                      <motion.div
                        key={reward.id}
                        whileHover={{ y: -2 }}
                        className="p-5 rounded-2xl border border-[#E5E7EB] bg-white hover:border-[#3B82F6]/30 hover:shadow-[0_8px_30px_-8px_rgba(59,130,246,0.12)] transition-all"
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <span className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center shrink-0">
                            <RewardIcon name={reward.icon} />
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F3F4F6] text-[#6B7280] text-[11px] font-semibold">
                            {reward.category}
                          </span>
                        </div>

                        <h3 className="text-base font-semibold text-[#111827] mb-1">{reward.title}</h3>
                        <p className="text-xs text-[#6B7280] leading-relaxed mb-4">{reward.description}</p>

                        <div className="flex items-center justify-between gap-3">
                          <div className="inline-flex items-center gap-1 text-sm font-bold text-[#3B82F6]">
                            <Sparkles className="w-3.5 h-3.5" />
                            {formatCount(reward.cost_points)} pts
                          </div>

                          <button
                            onClick={() => onRedeem(reward.id)}
                            disabled={!canAfford || isRedeeming || !currentUser}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              canAfford && currentUser
                                ? 'text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-sm shadow-blue-500/20'
                                : 'text-[#9CA3AF] bg-[#F3F4F6] cursor-not-allowed'
                            }`}
                          >
                            {isRedeeming ? 'Menukarkan...' : canAfford ? 'Tukarkan' : 'Poin kurang'}
                          </button>
                        </div>

                        {reward.stock !== null && (
                          <div className="mt-3 text-[10px] text-[#9CA3AF]">
                            Sisa stok: {reward.stock}
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* How to earn */}
            <section>
              <h2 className="text-lg font-semibold text-[#111827] mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#3B82F6]" />
                Cara mendapatkan poin
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'Upload insight', pts: POINT_VALUES.POST_CREATED, icon: 'pen' },
                  { label: 'Mendapat like', pts: POINT_VALUES.LIKE_RECEIVED, icon: 'heart' },
                  { label: 'Mendapat komentar', pts: POINT_VALUES.COMMENT_RECEIVED, icon: 'message' },
                  { label: 'Mendapat bookmark', pts: POINT_VALUES.BOOKMARK_RECEIVED, icon: 'bookmark' },
                  { label: 'Login harian', pts: POINT_VALUES.DAILY_LOGIN, icon: 'zap' },
                  { label: 'Insight trending', pts: POINT_VALUES.TRENDING_BONUS, icon: 'trending' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-xl border border-[#E5E7EB]">
                    <span className="text-sm text-[#111827]">{item.label}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-semibold">
                      +{item.pts}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-4">
            {/* Recent history */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-[#111827] mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#3B82F6]" />
                Riwayat poin
              </h3>
              {historyLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-8 bg-[#F3F4F6] rounded animate-pulse" />
                  ))}
                </div>
              ) : history.length === 0 ? (
                <p className="text-xs text-[#6B7280] text-center py-4">Belum ada aktivitas</p>
              ) : (
                <ul className="space-y-2">
                  {history.slice(0, 8).map((tx) => (
                    <li key={tx.id} className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-[#6B7280] truncate">{reasonLabel(tx.reason)}</span>
                      <span className={`font-semibold tabular-nums shrink-0 ${
                        tx.amount >= 0 ? 'text-[#3B82F6]' : 'text-[#EF4444]'
                      }`}>
                        {tx.amount >= 0 ? '+' : ''}{tx.amount}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Redemption history */}
            {redemptions.length > 0 && (
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-[#111827] mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#3B82F6]" />
                  Riwayat penukaran
                </h3>
                <ul className="space-y-2">
                  {redemptions.slice(0, 5).map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-[#111827] truncate font-medium">{r.rewards?.title || 'Reward'}</span>
                      <span className="text-[#EF4444] font-semibold tabular-nums shrink-0">
                        -{r.points_spent}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Leaderboard link */}
            <Link
              to="/leaderboard"
              className="block p-5 rounded-2xl border border-[#E5E7EB] hover:border-[#3B82F6]/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center">
                  <Trophy className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-sm font-semibold text-[#111827] group-hover:text-[#3B82F6] transition-colors">Leaderboard</div>
                  <div className="text-xs text-[#6B7280]">Lihat peringkat komunitas</div>
                </div>
              </div>
            </Link>
          </aside>
        </div>
      </div>
    </div>
  )
}

function RewardIcon({ name }) {
  switch (name) {
    case 'sparkles': return <Sparkles className="w-5 h-5" />
    case 'brain': return <Zap className="w-5 h-5" />
    case 'badge': return <Trophy className="w-5 h-5" />
    case 'trending': return <TrendingUp className="w-5 h-5" />
    default: return <Gift className="w-5 h-5" />
  }
}

function reasonLabel(reason) {
  const map = {
    post_created: 'Upload insight',
    like_received: 'Mendapat like',
    comment_received: 'Mendapat komentar',
    bookmark_received: 'Mendapat bookmark',
    daily_login: 'Login harian',
    trending_bonus: 'Insight trending',
    reward_redeem: 'Tukar reward',
  }
  return map[reason] || reason
}

export default Rewards
