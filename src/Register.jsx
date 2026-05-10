import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from './services/supabaseClient'

function Register() {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [usernameError, setUsernameError] = useState('')

  // Validasi username real-time
  async function handleUsernameChange(value) {
    const cleanUsername = value.toLowerCase().replace(/\s/g, '')
    setUsername(cleanUsername)
    setUsernameError('')

    if (cleanUsername.length >= 3) {
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', cleanUsername)
        .single()

      if (data) {
        setUsernameError('Username sudah dipakai, coba yang lain')
      }
    }
  }

  async function handleRegister(e) {
    e.preventDefault()

    if (usernameError) {
      alert('Perbaiki error terlebih dahulu')
      return
    }

    if (username.length < 3) {
      alert('Username minimal 3 karakter')
      return
    }

    setLoading(true)

    try {
      // 1. Register auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password
      })

      if (authError) throw authError

      // 2. Buat profile di table profiles
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: authData.user.id,
            username: username.toLowerCase(),
            name: name,
            email: email
          }])

        if (profileError) {
          console.error('Error creating profile:', profileError)
          throw new Error('Gagal membuat profile: ' + profileError.message)
        }
      }

      alert('Register berhasil! 🎉 Silakan cek email untuk verifikasi.')
      setName('')
      setUsername('')
      setEmail('')
      setPassword('')
    } catch (error) {
      alert('Register gagal: ' + error.message)
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
        <h2 className="text-center text-purple-600 mt-0 mb-2 text-3xl font-bold">
          📝 Register
        </h2>
        <p className="text-center text-slate-600 mb-8 text-[15px]">
          Buat akun baru untuk memulai
        </p>

        <form onSubmit={handleRegister}>
          <div className="mb-5">
            <label className="block mb-2 font-semibold text-slate-900">Nama:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Nama lengkap"
              className="w-full px-4 py-3 text-base rounded-xl border border-slate-300 outline-none transition-all focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10"
            />
          </div>

          <div className="mb-5">
            <label className="block mb-2 font-semibold text-slate-900">Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              required
              placeholder="username (lowercase, tanpa spasi)"
              minLength="3"
              className={`w-full px-4 py-3 text-base rounded-xl border outline-none transition-all ${
                usernameError 
                  ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                  : 'border-slate-300 focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10'
              }`}
            />
            {usernameError && (
              <p className="text-red-500 text-sm mt-1.5">⚠️ {usernameError}</p>
            )}
            {username && !usernameError && username.length >= 3 && (
              <p className="text-green-600 text-sm mt-1.5">✓ Username tersedia</p>
            )}
          </div>

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
              placeholder="Minimal 6 karakter"
              minLength="6"
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
            {loading ? 'Loading...' : 'Daftar'}
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
              Daftar dengan Google
            </>
          )}
        </button>

        <p className="text-center mt-6 text-slate-600 text-sm">
          Sudah punya akun? <Link to="/login" className="text-purple-600 font-semibold no-underline hover:text-purple-700">Login</Link>
        </p>

        <p className="text-center mt-4">
          <Link to="/" className="text-slate-400 text-sm no-underline hover:text-slate-600">← Kembali ke Home</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
