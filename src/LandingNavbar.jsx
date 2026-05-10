import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const menuItems = [
    { name: 'Beranda', path: '/', icon: '🏠' },
    { name: 'Jelajahi', path: '/home', icon: '🔍' },
    { name: 'Upload', path: '/upload', icon: '📤' },
    { name: 'Premium', path: '/premium', icon: '⭐' }
  ]

  const isActive = (path) => location.pathname === path

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
                {/* Masuk Button */}
                <Link to="/login">
                  <button className="px-6 py-2.5 rounded-full font-semibold text-[15px] text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all duration-300 hover:scale-105">
                    Masuk
                  </button>
                </Link>

                {/* Daftar Button - Gradient */}
                <Link to="/register">
                  <button className="group relative px-6 py-2.5 rounded-full font-semibold text-[15px] text-white overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50">
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-500"></div>
                    
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Text */}
                    <span className="relative z-10">Daftar</span>
                  </button>
                </Link>
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
            {/* Mobile Menu Items */}
            <div className="space-y-2 mb-6 pb-6 border-b border-slate-200">
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

            {/* Mobile Auth Buttons */}
            <div className="space-y-3">
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full px-6 py-3.5 rounded-2xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all">
                  Masuk
                </button>
              </Link>
              <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full px-6 py-3.5 rounded-2xl font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:shadow-lg hover:shadow-purple-500/50 transition-all">
                  Daftar
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default LandingNavbar
