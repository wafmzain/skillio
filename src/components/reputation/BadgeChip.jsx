import ReputationIcon from './ReputationIcons'

/**
 * BadgeChip
 * Reputation achievement pill.
 * tone: 'accent' (soft blue) | 'warm' (amber) | 'subtle' (neutral)
 */
function BadgeChip({
  icon,
  label,
  tone = 'accent',
  size = 'small',
  className = '',
}) {
  const sizes = {
    small: 'px-2 py-0.5 text-[11px] gap-1',
    default: 'px-2.5 py-1 text-xs gap-1.5',
  }

  const iconSizes = {
    small: 'w-3 h-3',
    default: 'w-3.5 h-3.5',
  }

  const palette = {
    accent: 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20',
    warm: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    subtle: 'bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]',
  }[tone] || 'bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]'

  return (
    <span
      className={`inline-flex items-center rounded-md border font-semibold ${sizes[size]} ${palette} ${className}`}
      title={label}
    >
      {icon && <ReputationIcon name={icon} className={iconSizes[size]} />}
      {label}
    </span>
  )
}

export default BadgeChip
