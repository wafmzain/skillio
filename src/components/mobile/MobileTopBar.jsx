import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Search, Sparkles } from 'lucide-react'
import { usePremium } from '../../hooks/usePremium'

/**
 * MobileTopBar
 * Slim, sticky, blurred top bar used on screens < lg.
 * Inspiration: X / Threads / Medium app — minimal, calm, scroll-aware.
 *
 * Layout
 *   [logo]                              [search] [bell] [avatar]
 */
function MobileTopBar({ user, className = '' }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const navigate = useNavigate()
  const notifRef = useRef(null)

  const { isPremium } = usePremium(user?.id)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 6)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const initial = (user?.email?.charAt(0) || 'U').toUpperCase()

  // Mock notifications — kept aligned with DashboardNavbar so behavior matches
  const notifications = [
    { id: 1, text: 'Komentar baru di insight kamu', time: '5m', unread: true },
    { id: 2, text: 'Seseorang menyimpan insight kamu', time: '1j', unread: true },
    { id: 3, text: 'Selamat datang di Skillio', time: '2j', unread: false },
  ]
  const unread = notifications.filter((n) => n.unread).length

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        isScrolled
          ? 'bg-white/85 backdrop-blur-xl border-b border-[#E5E7EB]/80 shadow-[0_2px_12px_-4px_rgba(17,24,39,0.05)]'
          : 'bg-white/70 backdrop-blur-md border-b border-transparent'
      } ${className}`}
      role="banner"
    >
      <div className="flex items-center justify-between gap-2 px-4 h-14 max-w-screen-md mx-auto">
        {/* Logo */}
        <Link
          to={user ? '/home' : '/'}
          className="flex items-center gap-2 shrink-0 touch-press"
          aria-label="Skillio Beranda"
        >
          <img src="/logo.png" alt="Skillio" className="h-7 w-auto object-contain" />
        </Link>

        {/* Right cluster */}
        <div className="flex items-center gap-1">
          <Link
            to="/explore"
            aria-label="Cari"
            className="w-10 h-10 inline-flex items-center justify-center rounded-xl text-[#6B7280] hover:text-[#111827] active:bg-[#F3F4F6] transition-colors touch-press"
          >
            <Search className="w-[18px] h-[18px]" strokeWidth={1.8} />
          </Link>

          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setIsNotifOpen((v) => !v)}
              aria-label="Notifikasi"
              aria-expanded={isNotifOpen}
              className="relative w-10 h-10 inline-flex items-center justify-center rounded-xl text-[#6B7280] hover:text-[#111827] active:bg-[#F3F4F6] transition-colors touch-press"
            >
              <Bell className="w-[18px] h-[18px]" strokeWidth={1.8} />
              {unread > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#3B82F6] ring-2 ring-white" />
              )}
            </button>

            <AnimatePresence>
              {isNotifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="absolute right-0 mt-2 w-[88vw] max-w-sm bg-white border border-[#E5E7EB] rounded-2xl shadow-xl overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[#111827]">Notifikasi</h3>
                    <span className="text-xs text-[#3B82F6] font-medium">{unread} baru</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 hover:bg-[#F9FAFB] flex items-start gap-3 border-b border-[#F3F4F6] last:border-b-0 ${
                          n.unread ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <div
                          className="w-1.5 h-1.5 mt-1.5 rounded-full shrink-0"
                          style={{ background: n.unread ? '#3B82F6' : 'transparent' }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#111827] leading-snug">{n.text}</p>
                          <p className="text-[11px] text-[#6B7280] mt-0.5">{n.time} lalu</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="w-full px-4 py-2.5 text-xs font-medium text-[#3B82F6] hover:bg-[#F9FAFB] border-t border-[#E5E7EB]"
                  >
                    Lihat semua
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={() => navigate('/profile')}
            aria-label="Profil saya"
            className="ml-1 relative w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white text-sm font-semibold flex items-center justify-center ring-2 ring-white shadow-sm touch-press"
          >
            {initial}
            {isPremium && (
              <span
                title="Skillio+"
                className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-white flex items-center justify-center"
              >
                <span className="w-3.5 h-3.5 rounded-full bg-[#3B82F6] flex items-center justify-center">
                  <Sparkles className="w-2 h-2 text-white" strokeWidth={2.4} />
                </span>
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

export default MobileTopBar
