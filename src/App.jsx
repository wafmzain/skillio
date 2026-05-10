import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
import ProtectedRoute from './ProtectedRoute'

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
          <div className="w-12 h-12 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      {/* Show DashboardNavbar when user is logged in, LandingNavbar when not */}
      {user ? (
        <DashboardNavbar user={user} onLogout={handleLogout} />
      ) : (
        <LandingNavbar />
      )}
      
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage user={user} />} />

        {/* Home - List Skill */}
        <Route path="/home" element={
          <div className="pt-28">
            <Home />
          </div>
        } />

        {/* Post Detail */}
        <Route path="/post/:id" element={
          <div className="pt-28">
            <PostDetail />
          </div>
        } />

        {/* Auth Routes */}
        <Route path="/login" element={<Login onLoginSuccess={checkUser} />} />
        <Route path="/register" element={<Register />} />

        {/* Explore Page */}
        <Route path="/explore" element={
          <div className="pt-28">
            <Explore />
          </div>
        } />

        {/* Premium Page */}
        <Route path="/premium" element={
          <ProtectedRoute user={user}>
            <div className="pt-28">
              <Premium />
            </div>
          </ProtectedRoute>
        } />

        {/* Settings Page */}
        <Route path="/settings" element={
          <ProtectedRoute user={user}>
            <div className="pt-28">
              <Settings />
            </div>
          </ProtectedRoute>
        } />

        {/* Protected Routes */}
        <Route 
          path="/upload" 
          element={
            <ProtectedRoute user={user}>
              <div className="pt-28 py-8 px-5 max-w-3xl mx-auto">
                <CreatePost />
              </div>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/profile" 
          element={
            <ProtectedRoute user={user}>
              <div className="pt-28">
                <Profile />
              </div>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/saved" 
          element={
            <ProtectedRoute user={user}>
              <div className="pt-28">
                <SavedPosts />
              </div>
            </ProtectedRoute>
          } 
        />

        {/* Public Profile - Use /u/:username instead of /@:username */}
        <Route 
          path="/u/:username" 
          element={
            <div className="pt-28">
              <Profile />
            </div>
          } 
        />

        {/* 404 - Redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
