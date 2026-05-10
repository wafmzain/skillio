import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { usePremium } from './hooks/usePremium'
import PremiumBadge from './components/PremiumBadge'

function DashboardNavbar({ user, onLogout }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const dropdownRef = useRef(null)
  const notificationRef = useRef(null)

  const { isPremium, loading: premiumLoading } = usePremium(user?.id)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const menuItems = [
    { name: 'Beranda', path: '/', icon: '🏠' },
    { name: 'Jelajahi', path: '/home', icon: '🔍' },
    { name: 'Upload', path: '/upload', icon: '📤' },
    { name: 'Tersimpan', path: '/saved', icon: '🔖' }
  ]

  const profileMenuItems = [
    { name: 'Profil Saya', path: '/profile', icon: '👤' },
    { name: 'Post Saya', path: '/profile', icon: '📚' },
    { name: 'Premium', path: '/premium', icon: '⭐' },
    { name: 'Pengaturan', path: '/settings', icon: '⚙️' }
  ]

  const notifications = [
    { id: 1, text: 'Komentar baru di post Anda', time: '5m lalu', unread: true },
    { id: 2, text: 'Seseorang menyimpan insight Anda', time: '1j lalu', unread: true },
    { id: 3, text: 'Selamat datang di Skillio!', time: '2j lalu', unread: false }
  ]

  const handleLogoutClick = () => {
    setIsProfileDropdownOpen(false)
    onLogout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.email) return 'U'
    return user.email.charAt(0).toUpperCase()
  }

  return (
    <>
      {/* Floating Navbar Container */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'pt-3' : 'pt-6'
      }`}>
        <div className="max-w-[1400px] mx-auto px-6">
          {/* Glassmorphism Capsule Navbar */}
          <div className={`relative backdrop-blur-xl bg-white/90 border border-slate-200/60 rounded-full shadow-lg transition-all duration-500 ${
            isScrolled ? 'shadow-xl shadow-slate-900/10 py-3' : 'shadow-slate-900/5 py-4'
          }`}>
            {/* Subtle Glow Effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className={`relative flex items-center justify-between px-8 transition-all duration-500`}>
              {/* Left - Logo */}
              <Link to="/" className="flex items-center group z-10">
                <img 
                  src="/logo.png" 
                  alt="Skillio" 
                  className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </Link>

              {/* Center - Navigation Menu (Desktop) */}
              <div className="hidden lg:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`group relative px-5 py-2.5 rounded-full font-semibold text-[15px] transition-all duration-300 ${
                      isActive(item.path)
                        ? 'text-slate-900 bg-slate-100'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base opacity-80 group-hover:scale-110 transition-transform">
                        {item.icon}
                      </span>
                      {item.name}
                    </span>
                    
                    {/* Active Indicator */}
                    {isActive(item.path) && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-purple-600 to-purple-500 rounded-full"></span>
                    )}
                    
                    {/* Hover Glow */}
                    <span className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600/0 via-purple-600/5 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </Link>
                ))}
              </div>

              {/* Right - Actions */}
              <div className="hidden lg:flex items-center gap-3 z-10">
                {/* Premium Button */}
                {!premiumLoading && (
                  isPremium ? (
                    <Link to="/premium" className="no-underline">
                      <div className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:scale-105 transition-all">
                        <PremiumBadge size="small" />
                      </div>
                    </Link>
                  ) : (
                    <Link to="/premium" className="no-underline">
                      <button className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2">
                        <span className="text-base">✦</span>
                        <span>Upgrade</span>
                      </button>
                    </Link>
                  )
                )}

                {/* Notification Icon */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className="relative w-10 h-10 flex items-center justify-center rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-300 group"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">🔔</span>
                    {notifications.some(n => n.unread) && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {isNotificationOpen && (
                    <div className="absolute right-0 mt-3 w-80 backdrop-blur-xl bg-white/95 border border-slate-200 rounded-3xl shadow-xl py-3 animate-[fadeIn_0.2s_ease-out]">
                      <div className="px-5 py-3 border-b border-slate-200">
                        <h3 className="font-bold text-slate-900 text-sm">Notifikasi</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-5 py-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                              notification.unread ? 'bg-purple-50/50' : ''
                            }`}
                          >
                            <p className="text-sm text-slate-900 mb-1">{notification.text}</p>
                            <p className="text-xs text-slate-500">{notification.time}</p>
                          </div>
                        ))}
                      </div>
                      <div className="px-5 py-3 border-t border-slate-200">
                        <button className="text-sm text-purple-600 hover:text-purple-700 font-semibold transition-colors">
                          Lihat semua notifikasi
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="w-px h-6 bg-slate-200"></div>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-slate-100 transition-all duration-300 group"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-600/30 group-hover:scale-110 transition-transform">
                      {getUserInitials()}
                    </div>
                    <div className="text-left hidden xl:block">
                      <p className="text-sm font-semibold text-slate-900 leading-tight">
                        {user?.email?.split('@')[0] || 'User'}
                      </p>
                      {isPremium ? (
                        <div className="flex items-center gap-1 mt-0.5">
                          <PremiumBadge size="tiny" />
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500">Free Plan</p>
                      )}
                    </div>
                    <svg 
                      className={`w-4 h-4 text-slate-500 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-64 backdrop-blur-xl bg-white/95 border border-slate-200 rounded-3xl shadow-xl py-3 animate-[fadeIn_0.2s_ease-out]">
                      {/* User Info */}
                      <div className="px-5 py-3 border-b border-slate-200">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-bold text-slate-900 text-sm">{user?.email?.split('@')[0] || 'User'}</p>
                          {isPremium && <PremiumBadge size="tiny" />}
                        </div>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        {isPremium && (
                          <div className="mt-2 pt-2 border-t border-slate-100">
                            <p className="text-xs text-purple-600 font-semibold">✦ Skillio+ Member</p>
                          </div>
                        )}
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        {profileMenuItems.map((item) => (
                          <Link
                            key={item.name}
                            to={item.path}
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-5 py-2.5 hover:bg-slate-50 transition-colors text-slate-600 hover:text-slate-900"
                          >
                            <span className="text-lg">{item.icon}</span>
                            <span className="font-medium text-sm">{item.name}</span>
                          </Link>
                        ))}
                      </div>

                      {/* Logout */}
                      <div className="border-t border-slate-200 pt-2">
                        <button
                          onClick={handleLogoutClick}
                          className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-red-50 transition-colors text-red-600 hover:text-red-700"
                        >
                          <span className="text-lg">🚪</span>
                          <span className="font-medium text-sm">Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-full hover:bg-slate-100 transition-all z-10"
                aria-label="Toggle menu"
              >
                <span className={`w-5 h-0.5 bg-slate-900 transition-all duration-300 ${
                  isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                }`}></span>
                <span className={`w-5 h-0.5 bg-slate-900 transition-all duration-300 ${
                  isMobileMenuOpen ? 'opacity-0' : ''
                }`}></span>
                <span className={`w-5 h-0.5 bg-slate-900 transition-all duration-300 ${
                  isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                }`}></span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>

        {/* Mobile Menu Panel */}
        <div className={`absolute top-24 left-6 right-6 backdrop-blur-xl bg-white/95 border border-slate-200 rounded-3xl shadow-2xl transition-all duration-300 ${
          isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
        }`}>
          <div className="p-6">
            {/* Mobile User Info */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-600/30">
                {getUserInitials()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-slate-900 text-sm">{user?.email?.split('@')[0] || 'User'}</p>
                  {isPremium && <PremiumBadge size="tiny" />}
                </div>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                {isPremium && (
                  <p className="text-xs text-purple-600 font-semibold mt-1">✦ Skillio+ Member</p>
                )}
              </div>
            </div>

            {/* Mobile Menu Items */}
            <div className="space-y-2 mb-6">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl font-semibold transition-all ${
                    isActive(item.path)
                      ? 'text-slate-900 bg-slate-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Mobile Profile Menu */}
            <div className="space-y-2 mb-6 pb-6 border-b border-slate-200">
              {profileMenuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-5 py-3.5 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all font-semibold"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Mobile Logout */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false)
                handleLogoutClick()
              }}
              className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-red-600 hover:bg-red-50 transition-all font-semibold"
            >
              <span className="text-xl">🚪</span>
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default DashboardNavbar
