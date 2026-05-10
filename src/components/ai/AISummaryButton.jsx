/**
 * AI Summary Button — minimal creator-tool pill.
 */
function AISummaryButton({ onClick, loading = false, disabled = false }) {
  return (
    <button
      onClick={() => !loading && !disabled && onClick?.()}
      disabled={loading || disabled}
      className={`group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
        loading || disabled
          ? 'bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed'
          : 'bg-white text-[#111827] border border-[#E5E7EB] hover:border-[#3B82F6]/40 hover:bg-[#F9FAFB] shadow-sm'
      }`}
    >
      <span
        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
          loading || disabled
            ? 'bg-[#E5E7EB] text-[#9CA3AF]'
            : 'bg-[#3B82F6]/10 text-[#3B82F6] group-hover:bg-[#3B82F6] group-hover:text-white'
        }`}
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z" />
          <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
        </svg>
      </span>
      <span>
        {loading ? 'Merangkum insight...' : 'Ringkas dengan AI'}
      </span>
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#3B82F6]/10 text-[#3B82F6] text-[10px] font-semibold">
        Skillio+
      </span>
    </button>
  )
}

export default AISummaryButton
