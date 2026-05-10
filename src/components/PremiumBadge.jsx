/**
 * PremiumBadge
 * Minimal Skillio+ identifier — soft blue pill to match the creator theme.
 */
function PremiumBadge({ size = 'small', className = '' }) {
  const sizes = {
    tiny: 'px-1.5 py-0.5 text-[10px] gap-0.5',
    small: 'px-2 py-0.5 text-[11px] gap-1',
    medium: 'px-2.5 py-1 text-xs gap-1',
    large: 'px-3 py-1.5 text-sm gap-1.5',
  }

  const iconSizes = {
    tiny: 'w-2.5 h-2.5',
    small: 'w-3 h-3',
    medium: 'w-3.5 h-3.5',
    large: 'w-4 h-4',
  }

  return (
    <span
      className={`inline-flex items-center ${sizes[size]} rounded-md bg-[#3B82F6]/10 text-[#3B82F6] font-semibold border border-[#3B82F6]/20 ${className}`}
      title="Skillio+ Member"
    >
      <svg
        className={iconSizes[size]}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z" />
      </svg>
      <span>Skillio+</span>
    </span>
  )
}

export default PremiumBadge
