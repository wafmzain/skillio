/**
 * AI Summary Error — compact retry card.
 */
function AISummaryError({ error, onRetry, onClose }) {
  return (
    <div className="bg-white border border-red-200 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-red-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 shrink-0">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-[#111827]">Gagal membuat summary</h3>
            <p className="text-[11px] text-red-600">Coba lagi dalam beberapa saat</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
            aria-label="Tutup"
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
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="px-5 py-5">
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
          <p className="text-xs text-red-700 leading-relaxed">
            {error || 'Terjadi kesalahan yang tidak diketahui.'}
          </p>
        </div>

        <ul className="space-y-2 text-xs text-[#6B7280] mb-5">
          {[
            'Periksa koneksi internet kamu',
            'Tunggu beberapa saat dan coba lagi',
            'Pastikan konten insight cukup panjang',
          ].map((t) => (
            <li key={t} className="flex items-start gap-2 leading-relaxed">
              <span className="w-1 h-1 rounded-full bg-[#3B82F6] mt-1.5 shrink-0" />
              {t}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-sm shadow-blue-500/20 transition-colors"
            >
              Coba lagi
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-[#111827] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
            >
              Tutup
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default AISummaryError
