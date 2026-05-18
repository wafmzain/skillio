import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Compass, Plus, Trophy, User } from 'lucide-react'

/**
 * BottomNavbar
 * --------------------------------------------------------------------------
 * Modern, mobile-only bottom navigation for Skillio.
 * Inspiration: X / Threads / LinkedIn mobile — calm, premium, native-feeling.
 *
 * Layout (left → right):
 *   Beranda · Jelajahi · ＋ Buat · Rewards · Profil
 *
 * Notes
 * - Center "Create" tab is a raised gradient pill — primary engagement CTA.
 * - Active state uses an animated soft-blue pill (Framer Motion `layoutId`).
 * - Honors iOS / Android safe-area insets via `.pb-safe`.
 * - All colors paired with `dark:` variants so it's ready when the app
 *   re-enables dark mode (currently neutralized by index.css).
 * --------------------------------------------------------------------------
 */
const TABS = [
  { key: 'home',    label: 'Beranda',  path: '/home',    icon: Home },
  { key: 'explore', label: 'Jelajahi', path: '/explore', icon: Compass },
  { key: 'create',  label: 'Buat',     path: '/upload',  icon: Plus,   isCenter: true },
  { key: 'rewards', label: 'Rewards',  path: '/rewards', icon: Trophy },
  { key: 'profile', label: 'Profil',   path: '/profile', icon: User },
]

function isPathActive(pathname, tabPath) {
  if (tabPath === '/home') {
    return pathname === '/home' || pathname === '/'
  }
  if (tabPath === '/profile') {
    return pathname === '/profile' || pathname.startsWith('/u/')
  }
  return pathname === tabPath || pathname.startsWith(`${tabPath}/`)
}

function BottomNavbar({ className = '' }) {
  const location = useLocation()

  return (
    <nav
      role="navigation"
      aria-label="Navigasi utama"
      className={`
        fixed bottom-0 inset-x-0
        z-[60]
        pb-[max(env(safe-area-inset-bottom),0.75rem)]
        pt-1
        pointer-events-none
        ${className}
      `}
    >
      <div
        className="
          pointer-events-auto
          mx-auto w-[calc(100%-1.25rem)] max-w-md
          rounded-2xl
          bg-white/85 backdrop-blur-xl
          border border-[#E5E7EB]
          shadow-[0_8px_32px_-8px_rgba(17,24,39,0.18)]
          dark:bg-[#0B1220]/85 dark:border-white/10
          dark:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.55)]
          transition-colors duration-300
        "
      >
        <ul className="flex items-stretch justify-around h-16 px-1.5">
          {TABS.map((tab) => (
            <TabItem
              key={tab.key}
              tab={tab}
              active={isPathActive(location.pathname, tab.path)}
            />
          ))}
        </ul>
      </div>
    </nav>
  )
}

/* -------------------------------------------------------------------------- */
/*  Tab item                                                                  */
/* -------------------------------------------------------------------------- */
function TabItem({ tab, active }) {
  if (tab.isCenter) return <CenterCreateTab tab={tab} />

  const Icon = tab.icon

  return (
    <li className="flex-1 min-w-0">
      <Link
        to={tab.path}
        aria-label={tab.label}
        aria-current={active ? 'page' : undefined}
        className="relative flex flex-col items-center justify-center h-full select-none group outline-none"
      >
        <motion.span
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 380, damping: 24 }}
          className={`
            relative inline-flex items-center justify-center w-12 h-7 rounded-full
            transition-colors
            ${active
              ? 'text-[#3B82F6] dark:text-[#60A5FA]'
              : 'text-[#9CA3AF] group-active:text-[#6B7280] dark:text-[#6B7280] dark:group-active:text-[#9CA3AF]'}
          `}
        >
          {active && (
            <motion.span
              layoutId="bottom-nav-active-pill"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="absolute inset-0 rounded-full bg-[#3B82F6]/10 dark:bg-[#3B82F6]/20"
            />
          )}
          <Icon
            className="relative w-[20px] h-[20px]"
            strokeWidth={active ? 2.2 : 1.8}
          />
        </motion.span>

        <span
          className={`
            text-[10px] mt-0.5 tracking-wide transition-colors
            ${active
              ? 'font-semibold text-[#3B82F6] dark:text-[#60A5FA]'
              : 'font-medium text-[#9CA3AF] dark:text-[#6B7280]'}
          `}
        >
          {tab.label}
        </span>

        {/* Tiny dot indicator under the active label */}
        {active && (
          <motion.span
            layoutId="bottom-nav-active-dot"
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="absolute bottom-1.5 w-1 h-1 rounded-full bg-[#3B82F6] dark:bg-[#60A5FA]"
          />
        )}
      </Link>
    </li>
  )
}

/* -------------------------------------------------------------------------- */
/*  Center "Create Insight" CTA                                               */
/* -------------------------------------------------------------------------- */
function CenterCreateTab({ tab }) {
  const Icon = tab.icon

  return (
    <li className="flex items-center justify-center px-1">
      <Link
        to={tab.path}
        aria-label={tab.label}
        className="relative -translate-y-3.5 outline-none"
      >
        <motion.span
          whileTap={{ scale: 0.92 }}
          whileHover={{ y: -1 }}
          transition={{ type: 'spring', stiffness: 380, damping: 22 }}
          className="
            relative inline-flex items-center justify-center
            w-13 h-13 rounded-2xl
            bg-gradient-to-br from-[#60A5FA] via-[#3B82F6] to-[#2563EB]
            text-white
            ring-4 ring-white dark:ring-[#0B1220]
            shadow-[0_10px_24px_-6px_rgba(59,130,246,0.55)]
            dark:shadow-[0_10px_24px_-6px_rgba(59,130,246,0.45)]
            active:from-[#3B82F6] active:to-[#1D4ED8]
            transition-colors duration-300
          "
          style={{ width: 52, height: 52 }}
        >
          {/* Soft glow halo */}
          <span
            aria-hidden
            className="absolute inset-0 rounded-2xl bg-[#3B82F6]/30 blur-md -z-10"
          />
          <Icon className="relative w-[22px] h-[22px]" strokeWidth={2.4} />
        </motion.span>

        <span className="sr-only">{tab.label}</span>
      </Link>
    </li>
  )
}

export default BottomNavbar
