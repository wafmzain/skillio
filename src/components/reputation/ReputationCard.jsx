import { motion } from 'framer-motion'
import PointsCounter from './PointsCounter'
import LevelPill from './LevelPill'
import BadgeChip from './BadgeChip'
import ReputationIcon from './ReputationIcons'
import { POINTS_CONFIG, formatPoints } from '../../services/reputation'

/**
 * ReputationCard
 * Hero reputation block for the profile page — shows points, level, progress,
 * and an achievements row. Fully theme-consistent with the rest of Skillio.
 */
function ReputationCard({ reputation, className = '' }) {
  if (!reputation) return null
  const { points, level, badges, trendingCount, postCount } = reputation

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 ${className}`}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#3B82F6] mb-2">
            <ReputationIcon name="sparkles" className="w-3.5 h-3.5" />
            Reputation
          </div>
          <PointsCounter value={points} size="large" />
        </div>
        <LevelPill level={level} size="default" />
      </div>

      {/* Level progress */}
      {level.nextLevel && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-[11px] text-[#6B7280] mb-1.5">
            <span>
              <span className="font-semibold text-[#111827]">{level.name}</span>
              <span className="mx-1 text-[#D1D5DB]">·</span>
              {formatPoints(level.pointsToNext)} pts lagi ke {level.nextLevel.name}
            </span>
            <span className="font-semibold text-[#3B82F6]">
              {Math.round(level.progress * 100)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-[#F3F4F6] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] to-[#60A5FA]"
              initial={{ width: 0 }}
              animate={{ width: `${Math.round(level.progress * 100)}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* Tiny stats */}
      <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#FAFAFA] border border-[#F3F4F6] mb-4">
        <Stat label="Insight" value={postCount} icon="trending" />
        <Stat label="Trending" value={trendingCount} icon="flame" />
        <Stat label="Badge" value={badges.length} icon="trophy" />
      </div>

      {/* Badges row */}
      {badges.length > 0 && (
        <div className="mb-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-2">
            Pencapaian
          </div>
          <div className="flex flex-wrap gap-1.5">
            {badges.map((b) => (
              <BadgeChip
                key={b.key}
                icon={b.icon}
                label={b.label}
                tone={b.tone}
              />
            ))}
          </div>
        </div>
      )}

      {/* How to earn */}
      <details className="group">
        <summary className="list-none cursor-pointer inline-flex items-center gap-1.5 text-[11px] font-medium text-[#6B7280] hover:text-[#111827]">
          <span>Cara dapat points</span>
          <ReputationIcon
            name="arrow-up"
            className="w-3 h-3 rotate-180 transition-transform group-open:rotate-0"
          />
        </summary>
        <ul className="mt-3 space-y-1.5 text-[11px] text-[#6B7280]">
          <PointLine label="Bagikan insight baru" points={POINTS_CONFIG.POST} />
          <PointLine label="Per like yang diterima" points={POINTS_CONFIG.LIKE} />
          <PointLine label="Per bookmark yang diterima" points={POINTS_CONFIG.BOOKMARK} />
          <PointLine label="Per komentar yang diterima" points={POINTS_CONFIG.COMMENT} />
          <PointLine label="Insight masuk trending" points={POINTS_CONFIG.TRENDING_BONUS} />
        </ul>
      </details>
    </motion.div>
  )
}

function Stat({ label, value, icon }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center gap-1 text-[10px] text-[#6B7280] uppercase tracking-wider mb-0.5">
        <ReputationIcon name={icon} className="w-2.5 h-2.5" />
        {label}
      </div>
      <div className="text-sm font-semibold text-[#111827] tabular-nums">
        {value}
      </div>
    </div>
  )
}

function PointLine({ label, points }) {
  return (
    <li className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-2">
        <span className="w-1 h-1 rounded-full bg-[#3B82F6]" />
        {label}
      </span>
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[#3B82F6]/10 text-[#3B82F6] font-semibold text-[10px]">
        +{points}
      </span>
    </li>
  )
}

export default ReputationCard
