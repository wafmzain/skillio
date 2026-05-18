import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { supabase } from './services/supabaseClient'
import DashboardNavbar from './DashboardNavbar'
import LandingNavbar from './LandingNavbar'
import LandingPage from './LandingPage'
import Home from './Home'
import Login from './Login'
import Register from './Register'
import CreatePost from './CreatePost'
import Profile from './Profile'
import SavedPosts from './SavedPosts'
import PostDetail from './PostDetail'
import Explore from './Explore'
import Premium from './Premium'
import Settings from './Settings'
import Tools from './pages/Tools'
import Leaderboard from './pages/Leaderboard'
import Rewards from './pages/Rewards'
import ProtectedRoute from './ProtectedRoute'
import { MobileTopBar, RouteShell } from './components/mobile'
import BottomNavbar from './components/navigation/BottomNavbar'

/**
 * Routes where the global navbar should be hidden (full-screen flows).
 */
const NAVBAR_HIDDEN_PATHS = ['/login', '/register']

/**
 * Routes where the mobile bottom navigation should be hidden.
 * Includes the marketing landing page (full-bleed hero) and full-screen
 * auth / composer flows.
 */
const BOTTOM_NAV_HIDDEN_PATHS = ['/', '/login', '/register']

/**
 * Routes that supply their own sticky bottom bar — RouteShell uses the
 * "flush" variant so we don't double-pad and don't render the bottom nav.
 */
const FLUSH_ROUTES = ['/upload']

function AppNavbar({ user, onLogout }) {
  const location = useLocation()
  if (NAVBAR_HIDDEN_PATHS.includes(location.pathname)) return null

  // Mobile: slim top bar + bottom nav.
  // Desktop (>= lg): the original floating navbars.
  return (
    <>
      {/* Mobile top bar — shown only on logged-in routes < lg.
          Logged-out users keep the LandingNavbar which already
          handles its own mobile drawer. */}
      {user && (
        <div className="lg:hidden">
          <MobileTopBar user={user} />
        </div>
      )}

      {/* Desktop navbar */}
      <div className={user ? 'hidden lg:block' : ''}>
        {user ? (
          <DashboardNavbar user={user} onLogout={onLogout} />
        ) : (
          <LandingNavbar />
        )}
      </div>
    </>
  )
}

function AppBottomNav({ user }) {
  const location = useLocation()
  // Bottom nav is shown on all mobile routes except marketing / auth /
  // composer flows. We deliberately render it for guests too — public
  // routes like /explore should still feel like a native social app.
  if (BOTTOM_NAV_HIDDEN_PATHS.includes(location.pathname)) return null
  if (FLUSH_ROUTES.includes(location.pathname)) return null
  // Suppress while we're still hydrating the auth state to avoid a
  // brief flash before the user redirects (protected routes resolve).
  void user
  return (
    <div className="lg:hidden">
      <BottomNavbar />
    </div>
  )
}

function AnimatedRoutes({ user, checkUser }) {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage user={user} />} />

        {/* Home - Feed */}
        <Route
          path="/home"
          element={
            <RouteShell>
              <Home />
            </RouteShell>
          }
        />

        {/* Post Detail */}
        <Route
          path="/post/:id"
          element={
            <RouteShell>
              <PostDetail />
            </RouteShell>
          }
        />

        {/* Auth Routes */}
        <Route path="/login" element={<Login onLoginSuccess={checkUser} />} />
        <Route path="/register" element={<Register />} />

        {/* Explore */}
        <Route
          path="/explore"
          element={
            <RouteShell>
              <Explore />
            </RouteShell>
          }
        />

        {/* Premium */}
        <Route
          path="/premium"
          element={
            <ProtectedRoute user={user}>
              <RouteShell>
                <Premium />
              </RouteShell>
            </ProtectedRoute>
          }
        />

        {/* Tools / Affiliate Recommendations */}
        <Route
          path="/tools"
          element={
            <RouteShell>
              <Tools user={user} />
            </RouteShell>
          }
        />

        {/* Leaderboard */}
        <Route
          path="/leaderboard"
          element={
            <RouteShell>
              <Leaderboard />
            </RouteShell>
          }
        />

        {/* Rewards */}
        <Route
          path="/rewards"
          element={
            <ProtectedRoute user={user}>
              <RouteShell>
                <Rewards />
              </RouteShell>
            </ProtectedRoute>
          }
        />

        {/* Settings */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute user={user}>
              <RouteShell>
                <Settings />
              </RouteShell>
            </ProtectedRoute>
          }
        />

        {/* Create Post — uses flush shell because the composer
            already supplies its own sticky bottom save bar. */}
        <Route
          path="/upload"
          element={
            <ProtectedRoute user={user}>
              <RouteShell flush>
                <CreatePost />
              </RouteShell>
            </ProtectedRoute>
          }
        />

        {/* Own profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute user={user}>
              <RouteShell>
                <Profile />
              </RouteShell>
            </ProtectedRoute>
          }
        />

        {/* Saved */}
        <Route
          path="/saved"
          element={
            <ProtectedRoute user={user}>
              <RouteShell>
                <SavedPosts />
              </RouteShell>
            </ProtectedRoute>
          }
        />

        {/* Public Profile */}
        <Route
          path="/u/:username"
          element={
            <RouteShell>
              <Profile />
            </RouteShell>
          }
        />

        {/* 404 - Redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    setLoading(false)
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      alert('Logout gagal: ' + error.message)
    } else {
      setUser(null)
      alert('Logout berhasil!')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-slate-700">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-[#3B82F6] rounded-full animate-spin"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <AppNavbar user={user} onLogout={handleLogout} />
      <AnimatedRoutes user={user} checkUser={checkUser} />
      <AppBottomNav user={user} />
    </BrowserRouter>
  )
}

export default App
