function PremiumBadge({ size = 'small', className = '' }) {
  const sizes = {
    tiny: 'px-2 py-0.5 text-[10px] gap-1',
    small: 'px-2.5 py-1 text-xs gap-1',
    medium: 'px-3 py-1.5 text-sm gap-1.5',
    large: 'px-4 py-2 text-base gap-2'
  }

  const iconSizes = {
    tiny: 'text-[10px]',
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  }

  return (
    <span 
      className={`inline-flex items-center ${sizes[size]} rounded-full bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white font-bold shadow-lg shadow-purple-500/30 ${className}`}
      title="Skillio+ Member"
    >
      <span className={iconSizes[size]}>✦</span>
      <span>Skillio+</span>
    </span>
  )
}

export default PremiumBadge
