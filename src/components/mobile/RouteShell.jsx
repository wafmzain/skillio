import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'

/**
 * RouteShell
 * Wraps a route's content with the correct top + bottom padding so it
 * clears the fixed mobile top bar and bottom nav (and the desktop
 * floating navbar).
 *
 * Use `flush` for screens that already supply their own sticky bottom
 * bar (e.g. the CreatePost composer) so we don't double-pad.
 */
function RouteShell({ children, flush = false, className = '' }) {
  const location = useLocation()

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`${flush ? 'app-shell-route--flush' : 'app-shell-route'} ${className}`}
    >
      {children}
    </motion.div>
  )
}

export default RouteShell
