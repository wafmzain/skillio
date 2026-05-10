/**
 * AI Summary Loading Component
 * Shows loading state while AI generates summary
 */
function AISummaryLoading() {
  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-pulse">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-8 py-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">AI Summary</h3>
            <p className="text-sm text-purple-600 font-medium">AI sedang merangkum insight...</p>
          </div>
        </div>
      </div>

      {/* Loading content */}
      <div className="px-8 py-6 space-y-4">
        {/* Skeleton lines */}
        <div className="space-y-3">
          <div className="h-4 bg-slate-200 rounded-lg w-3/4 animate-pulse"></div>
          <div className="h-4 bg-slate-200 rounded-lg w-full animate-pulse"></div>
          <div className="h-4 bg-slate-200 rounded-lg w-5/6 animate-pulse"></div>
        </div>
        
        <div className="pt-2 space-y-3">
          <div className="h-4 bg-slate-200 rounded-lg w-2/3 animate-pulse"></div>
          <div className="h-4 bg-slate-200 rounded-lg w-full animate-pulse"></div>
          <div className="h-4 bg-slate-200 rounded-lg w-4/5 animate-pulse"></div>
        </div>
        
        <div className="pt-2 space-y-3">
          <div className="h-4 bg-slate-200 rounded-lg w-3/5 animate-pulse"></div>
          <div className="h-4 bg-slate-200 rounded-lg w-full animate-pulse"></div>
        </div>
        
        <div className="pt-2 space-y-3">
          <div className="h-4 bg-slate-200 rounded-lg w-4/6 animate-pulse"></div>
          <div className="h-4 bg-slate-200 rounded-lg w-5/6 animate-pulse"></div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-50 px-8 py-4 border-t border-slate-100">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
            <span>Powered by Groq AI</span>
          </div>
          <div className="text-xs">
            Sedang memproses...
          </div>
        </div>
      </div>
    </div>
  )
}

export default AISummaryLoading