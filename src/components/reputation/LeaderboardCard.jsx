import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchLeaderboard, formatPoints } from '../../services/reputation'
import LevelPill from './LevelPill'
import ReputationIcon from './ReputationIcons'

/**
 * LeaderboardCard
 * Mini sidebar widget showing top contributors this week, derived from
 * post engagement. Safe fallback: renders nothing if no data yet.
 */
function LeaderboardCard({ limit = 5, windowDays = 7, className = '' }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    fetchLeaderboard({ limit, windowDays }).then((data) => {
      if (!alive) return
      setRows(data)
      setLoading(false)
    })
    return () => { alive = false }
  }, [limit, windowDays])

  return (
    <div className={`bg-white border border-[#E5E7EB] rounded-2xl p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6]">
            <ReputationIcon name="trophy" className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-[#111827] leading-tight">
              Top Kontributor
            </h3>
            <p className="text-[10px] text-[#6B7280] leading-tight">
              Minggu ini
            </p>
          </div>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#F3F4F6] text-[#6B7280] font-semibold">
          Live
        </span>
      </div>

      {loading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-5 h-5 rounded bg-[#F3F4F6]" />
              <div className="w-8 h-8 rounded-full bg-[#F3F4F6]" />
              <div className="flex-1 h-3 bg-[#F3F4F6] rounded" />
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-xs text-[#6B7280]">Belum ada aktivitas minggu ini</p>
          <p className="text-[10px] text-[#9CA3AF] mt-1">
            Bagikan insight untuk tampil di sini
          </p>
        </div>
      ) : (
        <ul className="space-y-1">
          {rows.map((row, i) => (
            <motion.li
              key={row.profile.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut', delay: i * 0.04 }}
            >
              <Link
                to={`/u/${row.profile.username}`}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F9FAFB] transition-colors group"
              >
                <RankBadge rank={i + 1} />
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold overflow-hidden ring-2 ring-white">
                    {row.profile.avatar_url ? (
                      <img
                        src={row.profile.avatar_url}
                        alt={row.profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      row.profile.name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  {row.profile.is_premium && (
                    <span
                      title="Skillio+"
                      className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#3B82F6] text-white flex items-center justify-center ring-2 ring-white"
                    >
                      <ReputationIcon name="sparkles" className="w-2 h-2" />
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-[#111827] truncate group-hover:text-[#3B82F6] transition-colors">
                      {row.profile.name}
                    </span>
                    <LevelPill level={row.level} size="tiny" showIcon={false} />
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#6B7280]">
                    <span>{row.postCount} insight</span>
                    <span className="w-0.5 h-0.5 rounded-full bg-[#9CA3AF]" />
                    <span className="inline-flex items-center gap-0.5 text-[#3B82F6] font-semibold">
                      <ReputationIcon name="sparkles" className="w-2.5 h-2.5" />
                      {formatPoints(row.points)} pts
                    </span>
                  </div>
                </div>
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  )
}

function RankBadge({ rank }) {
  const isTopThree = rank <= 3
  return (
    <span
      className={`w-5 text-center text-[11px] font-bold tabular-nums shrink-0 ${
        isTopThree ? 'text-[#3B82F6]' : 'text-[#9CA3AF]'
      }`}
    >
      {rank}
    </span>
  )
}

export default LeaderboardCard
