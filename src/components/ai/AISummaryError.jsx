/**
 * AI Summary Error Component
 * Shows error state with retry functionality
 */
function AISummaryError({ error, onRetry, onClose }) {
  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-red-200/30 border border-red-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 px-8 py-6 border-b border-red-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
              <span className="text-white text-lg">⚠️</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Gagal Membuat Summary</h3>
              <p className="text-sm text-red-600">Terjadi kesalahan saat memproses</p>
            </div>
          </div>
          
          {/* Close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors duration-200 group"
            >
              <svg 
                className="w-4 h-4 text-slate-500 group-hover:text-slate-700" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
          <p className="text-red-700 text-sm leading-relaxed">
            {error || 'Terjadi kesalahan yang tidak diketahui'}
          </p>
        </div>

        {/* Common solutions */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Solusi yang bisa dicoba:</h4>
          <ul className="text-sm text-slate-600 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Periksa koneksi internet Anda</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Tunggu beberapa saat dan coba lagi</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Pastikan konten post tidak terlalu pendek</span>
            </li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25"
            >
              🔄 Coba Lagi
            </button>
          )}
          
          {onClose && (
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-all duration-200"
            >
              Tutup
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-50 px-8 py-4 border-t border-slate-100">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span>Powered by Groq AI</span>
          </div>
          <div className="text-xs">
            Error saat memproses
          </div>
        </div>
      </div>
    </div>
  )
}

export default AISummaryError