import ReputationIcon from './ReputationIcons'

/**
 * LevelPill
 * Soft-blue pill showing the user's current level.
 * Variants:
 *   - size: 'tiny' | 'small' | 'default'
 *   - showIcon: boolean
 */
function LevelPill({ level, size = 'small', showIcon = true, className = '' }) {
  if (!level) return null

  const sizes = {
    tiny: 'px-1.5 py-0.5 text-[10px] gap-1',
    small: 'px-2 py-0.5 text-[11px] gap-1',
    default: 'px-2.5 py-1 text-xs gap-1.5',
  }

  const iconSizes = {
    tiny: 'w-2.5 h-2.5',
    small: 'w-3 h-3',
    default: 'w-3.5 h-3.5',
  }

  return (
    <span
      className={`inline-flex items-center rounded-md font-semibold ${sizes[size]} ${className}`}
      style={{ backgroundColor: level.accentBg, color: level.accent }}
      title={`Level: ${level.name}`}
    >
      {showIcon && <ReputationIcon name={level.icon} className={iconSizes[size]} />}
      <span>{level.name}</span>
    </span>
  )
}

export default LevelPill
