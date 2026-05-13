import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { usePremium } from './hooks/usePremium'

/* Shared inline icon set — stroke style */
const Icon = ({ name, className = 'w-5 h-5' }) => {
  const common = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }
  switch (name) {
    case 'home':
      return <svg {...common}><path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1v-9.5z"/></svg>
    case 'compass':
      return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5L13.5 13.5 8.5 15.5 10.5 10.5 15.5 8.5z"/></svg>
    case 'trending':
      return <svg {...common}><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>
    case 'bookmark':
      return <svg {...common}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
    case 'sparkles':
      return <svg {...common}><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z"/></svg>
    case 'package':
      return <svg {...common}><path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.3 7L12 12l8.7-5M12 22V12"/></svg>
    case 'bell':
      return <svg {...common}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
    case 'plus':
      return <svg {...common}><path d="M12 5v14M5 12h14"/></svg>
    case 'chevron-down':
      return <svg {...common}><path d="M6 9l6 6 6-6"/></svg>
    case 'user':
      return <svg {...common}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
    case 'settings':
      return <svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>
    case 'logout':
      return <svg {...common}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>
    case 'search':
      return <svg {...common}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
    default:
      return null
  }
}

function DashboardNavbar({ user, onLogout }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const profileRef = useRef(null)
  const notifRef = useRef(null)

  const { isPremium } = usePremium(user?.id)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setIsProfileOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setIsNotifOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isMobileMenuOpen])

  const menuItems = [
    { name: 'Beranda', path: '/home', icon: 'home' },
    { name: 'Jelajahi', path: '/explore', icon: 'compass' },
    { name: 'Trending', path: '/explore?tab=trending', icon: 'trending' },
    { name: 'Tools', path: '/tools', icon: 'package' },
    { name: 'Tersimpan', path: '/saved', icon: 'bookmark' },
    { name: 'Skillio+', path: '/premium', icon: 'sparkles' },
  ]

  const profileMenu = [
    { name: 'Profil Saya', path: '/profile', icon: 'user' },
    { name: 'Skillio+', path: '/premium', icon: 'sparkles' },
    { name: 'Pengaturan', path: '/settings', icon: 'settings' },
  ]

  const notifications = [
    { id: 1, text: 'Komentar baru di insight kamu', time: '5m', unread: true },
    { id: 2, text: 'Seseorang menyimpan insight kamu', time: '1j', unread: true },
    { id: 3, text: 'Selamat datang di Skillio', time: '2j', unread: false },
  ]

  const handleLogout = () => {
    setIsProfileOpen(false)
    onLogout()
    navigate('/')
  }

  const getInitial = () => (user?.email ? user.email.charAt(0).toUpperCase() : 'U')
  const username = user?.email?.split('@')[0] || 'User'

  const isActive = (path) => {
    const clean = path.split('?')[0]
    return location.pathname === clean
  }

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div
            className={`relative flex items-center justify-between gap-4 rounded-2xl border border-[#E5E7EB] bg-white/80 backdrop-blur-xl px-4 sm:px-5 transition-all duration-300 ${
              isScrolled
                ? 'py-2.5 shadow-[0_4px_20px_-4px_rgba(17,24,39,0.08)]'
                : 'py-3 shadow-[0_2px_12px_-4px_rgba(17,24,39,0.04)]'
            }`}
          >
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img src="/logo.png" alt="Skillio" className="h-8 w-auto object-contain" />
            </Link>

            {/* Desktop menu */}
            <div className="hidden lg:flex items-center gap-1">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'text-[#3B82F6] bg-[#3B82F6]/10'
                      : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]'
                  }`}
                >
                  <Icon name={item.icon} className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Right actions */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              <Link to="/upload">
                <button className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/25 transition-all">
                  <Icon name="plus" className="w-4 h-4" />
                  Buat Insight
                </button>
              </Link>

              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setIsNotifOpen((v) => !v)}
                  className="relative w-10 h-10 flex items-center justify-center rounded-xl text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
                  aria-label="Notifications"
                >
                  <Icon name="bell" className="w-5 h-5" />
                  {notifications.some((n) => n.unread) && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[#3B82F6] rounded-full ring-2 ring-white" />
                  )}
                </button>

                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl overflow-hidden animate-[fadeIn_0.15s_ease-out]">
                    <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-[#111827]">Notifikasi</h3>
                      <span className="text-xs text-[#3B82F6] font-medium">
                        {notifications.filter((n) => n.unread).length} baru
                      </span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`px-4 py-3 hover:bg-[#F9FAFB] cursor-pointer flex items-start gap-3 border-b border-[#F3F4F6] last:border-b-0 ${
                            n.unread ? 'bg-blue-50/40' : ''
                          }`}
                        >
                          <div className="w-2 h-2 mt-1.5 rounded-full shrink-0 {n.unread ? 'bg-[#3B82F6]' : 'bg-transparent'}" style={{ background: n.unread ? '#3B82F6' : 'transparent' }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[#111827]">{n.text}</p>
                            <p className="text-xs text-[#6B7280] mt-0.5">{n.time} lalu</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2.5 border-t border-[#E5E7EB]">
                      <button className="text-xs font-medium text-[#3B82F6] hover:text-[#2563EB]">
                        Lihat semua
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="w-px h-6 bg-[#E5E7EB]" />

              {/* Profile */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen((v) => !v)}
                  className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl hover:bg-[#F3F4F6] transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {getInitial()}
                  </div>
                  <div className="text-left hidden xl:block">
                    <div className="text-xs font-semibold text-[#111827] leading-tight">{username}</div>
                    <div className="text-[10px] text-[#6B7280]">{isPremium ? 'Skillio+' : 'Free'}</div>
                  </div>
                  <Icon name="chevron-down" className={`w-4 h-4 text-[#6B7280] transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl overflow-hidden animate-[fadeIn_0.15s_ease-out]">
                    <div className="px-4 py-3 border-b border-[#E5E7EB]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                          {getInitial()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-[#111827] truncate">{username}</div>
                          <div className="text-xs text-[#6B7280] truncate">{user?.email}</div>
                        </div>
                      </div>
                      {isPremium && (
                        <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#3B82F6]/10 text-[#3B82F6] text-[11px] font-semibold">
                          <Icon name="sparkles" className="w-3 h-3" />
                          Skillio+ Member
                        </div>
                      )}
                    </div>
                    <div className="py-1.5">
                      {profileMenu.map((item) => (
                        <Link
                          key={item.name}
                          to={item.path}
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#111827] hover:bg-[#F9FAFB] transition-colors"
                        >
                          <Icon name={item.icon} className="w-4 h-4 text-[#6B7280]" />
                          {item.name}
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-[#E5E7EB]">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#EF4444] hover:bg-red-50 transition-colors"
                      >
                        <Icon name="logout" className="w-4 h-4" />
                        Keluar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px] rounded-xl hover:bg-[#F3F4F6] transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className={`w-[18px] h-[2px] bg-[#111827] rounded transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
              <span className={`w-[18px] h-[2px] bg-[#111827] rounded transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`w-[18px] h-[2px] bg-[#111827] rounded transition-transform duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 bg-[#111827]/40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div
          className={`absolute top-[76px] left-4 right-4 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl transition-all duration-300 ${
            isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
          }`}
        >
          <div className="p-3">
            {/* Profile header */}
            <div className="flex items-center gap-3 px-3 py-3 mb-2 border-b border-[#E5E7EB]">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                {getInitial()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-[#111827] truncate">{username}</div>
                <div className="text-xs text-[#6B7280] truncate">{user?.email}</div>
              </div>
              {isPremium && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#3B82F6]/10 text-[#3B82F6] text-[10px] font-semibold">
                  <Icon name="sparkles" className="w-3 h-3" /> Skillio+
                </span>
              )}
            </div>

            <div className="space-y-1 mb-2">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-[#3B82F6] bg-[#3B82F6]/10'
                      : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]'
                  }`}
                >
                  <Icon name={item.icon} className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="space-y-1 pt-2 border-t border-[#E5E7EB]">
              {profileMenu.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB] transition-colors"
                >
                  <Icon name={item.icon} className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
              <Link to="/upload" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full flex items-center justify-center gap-2 mt-2 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] transition-colors">
                  <Icon name="plus" className="w-4 h-4" />
                  Buat Insight
                </button>
              </Link>
              <button
                onClick={() => { setIsMobileMenuOpen(false); handleLogout() }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] text-[#EF4444] hover:bg-red-50 transition-colors"
              >
                <Icon name="logout" className="w-4 h-4" />
                Keluar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default DashboardNavbar
