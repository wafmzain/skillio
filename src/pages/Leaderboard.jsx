import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy, ArrowLeft, Medal, TrendingUp, Sparkles, Flame } from 'lucide-react'
import { useLeaderboard, useGamification } from '../hooks/useGamification'
import { getRankInfo, RANKS } from '../services/gamification'
import { formatCount } from '../lib/format'
import { supabase } from '../services/supabaseClient'
import { useEffect } from 'react'

function Leaderboard() {
  const [currentUser, setCurrentUser] = useState(null)
  const { users, loading, refetch } = useLeaderboard({ limit: 50 })
  const { points, rank, dailyClaimAvailable, handleDailyClaim } = useGamification(currentUser?.id)
  const [claimLoading, setClaimLoading] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user))
  }, [])

  function showToast(msg, tone = 'success') {
    setToast({ msg, tone })
    setTimeout(() => setToast(null), 3000)
  }

  async function onDailyClaim() {
    setClaimLoading(true)
    const result = await handleDailyClaim()
    if (result.success) {
      showToast(`+${result.amount || 3} poin! Login harian diklaim`)
      refetch()
    } else {
      showToast(result.error || 'Gagal klaim', 'error')
    }
    setClaimLoading(false)
  }

  const myRank = users.findIndex((u) => u.id === currentUser?.id) + 1

  return (
    <div className="min-h-screen bg-white">
      {/* Toast */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50">
          <div className={`px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg border ${
            toast.tone === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-[#E5E7EB] text-[#111827]'
          }`}>
            {toast.msg}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 pt-10 pb-8">
          <Link to="/home" className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#111827] mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-semibold mb-3">
                <Trophy className="w-3.5 h-3.5" />
                Leaderboard
              </div>
              <h1 className="text-3xl font-bold text-[#111827] tracking-tight mb-2">
                Top Kontributor
              </h1>
              <p className="text-sm text-[#6B7280]">
                Anggota paling aktif berbagi insight di komunitas Skillio.
              </p>
            </div>

            {/* Daily claim + my stats */}
            {currentUser && (
              <div className="flex items-center gap-3 flex-wrap">
                <div className="px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white">
                  <div className="text-[10px] text-[#6B7280] uppercase tracking-wider">Poin kamu</div>
                  <div className="text-lg font-bold text-[#111827] tabular-nums">{formatCount(points)}</div>
                </div>
                {myRank > 0 && (
                  <div className="px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white">
                    <div className="text-[10px] text-[#6B7280] uppercase tracking-wider">Peringkat</div>
                    <div className="text-lg font-bold text-[#3B82F6] tabular-nums">#{myRank}</div>
                  </div>
                )}
                {dailyClaimAvailable && (
                  <button
                    onClick={onDailyClaim}
                    disabled={claimLoading}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-sm shadow-blue-500/20 transition-all disabled:opacity-60"
                  >
                    <Flame className="w-4 h-4" />
                    {claimLoading ? 'Mengklaim...' : 'Klaim Harian +3'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Rank legend */}
          <div className="mt-6 flex flex-wrap gap-2">
            {RANKS.map((r) => (
              <span
                key={r.key}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold"
                style={{ backgroundColor: r.bg, color: r.color }}
              >
                {r.key}
                <span className="text-[10px] font-normal opacity-70">
                  {r.min === 0 ? '0' : formatCount(r.min)}+
                </span>
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-[#E5E7EB] animate-pulse">
                <div className="w-8 h-8 rounded bg-[#F3F4F6]" />
                <div className="w-10 h-10 rounded-full bg-[#F3F4F6]" />
                <div className="flex-1 h-4 bg-[#F3F4F6] rounded" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 bg-[#FAFAFA] rounded-2xl border border-dashed border-[#E5E7EB]">
            <Trophy className="w-10 h-10 text-[#3B82F6] mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-[#111827] mb-2">Belum ada data</h3>
            <p className="text-sm text-[#6B7280]">Mulai berbagi insight untuk tampil di leaderboard.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((user, i) => {
              const rankInfo = getRankInfo(user.current_rank)
              const isMe = currentUser?.id === user.id
              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                >
                  <Link
                    to={`/u/${user.username}`}
                    className={`group flex items-center gap-4 p-4 rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_-8px_rgba(59,130,246,0.15)] ${
                      isMe
                        ? 'border-[#3B82F6]/30 bg-[#3B82F6]/5'
                        : 'border-[#E5E7EB] bg-white hover:border-[#3B82F6]/30'
                    }`}
                  >
                    {/* Rank number */}
                    <div className={`w-8 text-center text-sm font-bold tabular-nums shrink-0 ${
                      i < 3 ? 'text-[#3B82F6]' : 'text-[#9CA3AF]'
                    }`}>
                      {i === 0 && <Medal className="w-5 h-5 text-amber-500 mx-auto" />}
                      {i === 1 && <Medal className="w-5 h-5 text-gray-400 mx-auto" />}
                      {i === 2 && <Medal className="w-5 h-5 text-amber-700 mx-auto" />}
                      {i > 2 && <span>{i + 1}</span>}
                    </div>

                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-semibold overflow-hidden ring-2 ring-white shadow-sm">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          user.name?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                      {user.is_premium && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#3B82F6] text-white flex items-center justify-center ring-2 ring-white">
                          <Sparkles className="w-2 h-2" />
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-[#111827] truncate group-hover:text-[#3B82F6] transition-colors">
                          {user.name}
                        </span>
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold"
                          style={{ backgroundColor: rankInfo.bg, color: rankInfo.color }}
                        >
                          {user.current_rank}
                        </span>
                        {isMe && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#3B82F6]/10 text-[#3B82F6] font-semibold">
                            Kamu
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#6B7280]">@{user.username}</div>
                    </div>

                    {/* Points */}
                    <div className="text-right shrink-0">
                      <div className="text-base font-bold text-[#111827] tabular-nums">
                        {formatCount(user.points)}
                      </div>
                      <div className="text-[10px] text-[#6B7280]">poin</div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Leaderboard
