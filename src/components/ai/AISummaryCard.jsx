import { useState, useEffect } from 'react'

/**
 * AI Summary Card Component
 * Displays the generated AI summary with modern design
 */
function AISummaryCard({ summary, onClose }) {
  const [isVisible, setIsVisible] = useState(false)

  // Fade in animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      if (onClose) onClose()
    }, 300)
  }

  if (!summary) return null

  return (
    <div className={`
      transform transition-all duration-500 ease-out
      ${isVisible 
        ? 'opacity-100 translate-y-0 scale-100' 
        : 'opacity-0 translate-y-4 scale-95'
      }
    `}>
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-8 py-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                <span className="text-white text-lg">✨</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">AI Summary</h3>
                <p className="text-sm text-slate-600">Dirangkum oleh Groq AI</p>
              </div>
            </div>
            
            {/* Close button */}
            <button
              onClick={handleClose}
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
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          <div className="prose prose-slate max-w-none">
            <div className="text-slate-700 leading-relaxed whitespace-pre-line text-base">
              {summary}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Powered by Groq AI</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="inline-flex items-center gap-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-2 py-1 rounded-full">
                <span>✦</span>
                <span>Skillio+</span>
              </div>
              <span>Premium Feature</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AISummaryCard