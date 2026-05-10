import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from './services/supabaseClient'

function Login({ onLoginSuccess }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      })

      if (error) throw error

      // Fetch profile dari table profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError) {
        console.error('Error fetching profile:', profileError)
      }

      alert('Login berhasil! 🎉')
      if (onLoginSuccess) {
        await onLoginSuccess()
      }
      navigate('/home')
    } catch (error) {
      alert('Login gagal: ' + error.message)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/home'
        }
      })

      if (error) {
        alert('Login dengan Google gagal: ' + error.message)
        console.error(error)
        setGoogleLoading(false)
      }
    } catch (error) {
      alert('Error: ' + error.message)
      console.error(error)
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-32 px-5 bg-slate-50">
      <div className="max-w-[440px] w-full p-10 border border-slate-200 rounded-2xl bg-white shadow-lg animate-[fadeIn_0.5s_ease-out]">
        <h2 className="text-center text-slate-900 mt-0 mb-2 text-3xl font-bold">
          Welcome Back! 👋
        </h2>
        <p className="text-center text-slate-600 mb-8 text-[15px]">
          Login untuk melanjutkan ke Skillio
        </p>

        <form onSubmit={handleLogin}>
          <div className="mb-5">
            <label className="block mb-2 font-semibold text-slate-900">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="nama@email.com"
              className="w-full px-4 py-3 text-base rounded-xl border border-slate-300 outline-none transition-all focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10"
            />
          </div>

          <div className="mb-5">
            <label className="block mb-2 font-semibold text-slate-900">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Masukkan password"
              className="w-full px-4 py-3 text-base rounded-xl border border-slate-300 outline-none transition-all focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 text-base font-semibold rounded-xl transition-all ${
              loading 
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-purple-400 text-white hover:-translate-y-0.5 hover:shadow-lg'
            }`}
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6 gap-3">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-slate-400 text-[13px] font-medium">ATAU</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className={`w-full py-3.5 text-base font-semibold rounded-xl border border-slate-300 flex items-center justify-center gap-2.5 transition-all ${
            googleLoading 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
              : 'bg-white text-slate-700 hover:bg-slate-50 hover:shadow-md'
          }`}
        >
          {googleLoading ? (
            'Loading...'
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              Login dengan Google
            </>
          )}
        </button>

        <p className="text-center mt-6 text-slate-600 text-sm">
          Belum punya akun? <Link to="/register" className="text-purple-600 font-semibold no-underline hover:text-purple-700">Daftar</Link>
        </p>

        <p className="text-center mt-4">
          <Link to="/" className="text-slate-400 text-sm no-underline hover:text-slate-600">← Kembali ke Home</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
