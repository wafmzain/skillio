import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

/**
 * LandingNavbar
 * Clean, modern creator-social navbar.
 * Style inspiration: Linear, Arc Browser, Threads.
 */
function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isMobileMenuOpen])

  const menuItems = [
    { name: 'Jelajahi', path: '/home' },
    { name: 'Trending', path: '/explore' },
    { name: 'Tools', path: '/tools' },
    { name: 'Skillio+', path: '/premium' },
  ]

  const isActive = (path) => {
    const clean = path.split('#')[0]
    return location.pathname === clean
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'py-2' : 'py-4'
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div
            className={`relative flex items-center justify-between gap-4 rounded-2xl border border-[#E5E7EB] bg-white/80 backdrop-blur-xl px-4 sm:px-5 transition-all duration-300 ${
              isScrolled
                ? 'py-2.5 shadow-[0_4px_20px_-4px_rgba(17,24,39,0.08)]'
                : 'py-3 shadow-[0_2px_12px_-4px_rgba(17,24,39,0.04)]'
            }`}
          >
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img
                src="/logo.png"
                alt="Skillio"
                className="h-8 w-auto object-contain"
              />
            </Link>

            {/* Desktop menu */}
            <div className="hidden lg:flex items-center gap-1">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'text-[#111827] bg-[#F3F4F6]'
                      : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-2">
              <Link to="/login">
                <button className="px-4 py-2 rounded-xl text-sm font-medium text-[#111827] hover:bg-[#F3F4F6] transition-colors">
                  Masuk
                </button>
              </Link>
              <Link to="/register">
                <button className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/25 transition-all">
                  Mulai Berbagi
                  <svg
                    className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 10h12M12 5l5 5-5 5" />
                  </svg>
                </button>
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px] rounded-xl hover:bg-[#F3F4F6] transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span
                className={`w-[18px] h-[2px] bg-[#111827] rounded transition-transform duration-300 ${
                  isMobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''
                }`}
              />
              <span
                className={`w-[18px] h-[2px] bg-[#111827] rounded transition-opacity duration-300 ${
                  isMobileMenuOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`w-[18px] h-[2px] bg-[#111827] rounded transition-transform duration-300 ${
                  isMobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
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
            <div className="space-y-1 mb-3 pb-3 border-b border-[#E5E7EB]">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-[15px] font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-[#111827] bg-[#F3F4F6]'
                      : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-2 p-1">
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-[#111827] bg-[#F3F4F6] hover:bg-[#E5E7EB] transition-colors">
                  Masuk
                </button>
              </Link>
              <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-sm shadow-blue-500/20 transition-all">
                  Mulai Berbagi
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
