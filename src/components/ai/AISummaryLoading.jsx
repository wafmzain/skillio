/**
 * AI Summary Loading — skeleton in the soft-blue theme.
 */
function AISummaryLoading() {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#F3F4F6] flex items-center gap-3">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6]">
          <span className="w-4 h-4 border-2 border-[#3B82F6]/30 border-t-[#3B82F6] rounded-full animate-spin" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-[#111827]">AI Summary</h3>
          <p className="text-[11px] text-[#6B7280]">Merangkum insight...</p>
        </div>
      </div>
      <div className="px-5 py-5 space-y-3">
        <div className="h-3 w-3/4 bg-[#F3F4F6] rounded animate-pulse" />
        <div className="h-3 w-full bg-[#F3F4F6] rounded animate-pulse" />
        <div className="h-3 w-5/6 bg-[#F3F4F6] rounded animate-pulse" />
        <div className="h-3 w-2/3 bg-[#F3F4F6] rounded animate-pulse" />
        <div className="h-3 w-full bg-[#F3F4F6] rounded animate-pulse" />
      </div>
      <div className="px-5 py-3 border-t border-[#F3F4F6] flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[11px] text-[#6B7280]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
          Powered by Groq AI
        </span>
        <span className="text-[10px] text-[#9CA3AF]">Memproses...</span>
      </div>
    </div>
  )
}

export default AISummaryLoading
