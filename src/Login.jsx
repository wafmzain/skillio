import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from './services/supabaseClient'
import AuthSidePanel from './components/AuthSidePanel'

/* Icons */
const Icon = ({ name, className = 'w-4 h-4' }) => {
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
    case 'mail':
      return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
    case 'lock':
      return <svg {...common}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
    case 'eye':
      return <svg {...common}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
    case 'eye-off':
      return <svg {...common}><path d="M17 17s-2 3-5 3-5-3-5-3M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2"/><path d="M6.7 6.7C4 8.2 2 12 2 12s3.5 7 10 7c2 0 3.7-.6 5.1-1.4M22 12s-1-2-2.7-3.7"/></svg>
    case 'arrow-left':
      return <svg {...common}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
    case 'arrow-right':
      return <svg {...common}><path d="M5 12h14M13 5l7 7-7 7"/></svg>
    case 'check':
      return <svg {...common}><path d="M20 6L9 17l-5-5"/></svg>
    case 'x':
      return <svg {...common}><path d="M18 6L6 18M6 6l12 12"/></svg>
    default:
      return null
  }
}

function Login({ onLoginSuccess }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [toast, setToast] = useState(null)

  function showToast(message, tone = 'success') {
    setToast({ message, tone })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleLogin(e) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (error) throw error

      await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      showToast('Selamat datang kembali')
      if (onLoginSuccess) await onLoginSuccess()
      setTimeout(() => navigate('/home'), 500)
    } catch (err) {
      showToast(err.message || 'Login gagal', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    if (googleLoading) return
    setGoogleLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/home' },
      })
      if (error) throw error
    } catch (err) {
      showToast(err.message || 'Login dengan Google gagal', 'error')
      setGoogleLoading(false)
    }
  }

  return (
    <AuthLayout
      toast={toast}
      mode="login"
      topLink={
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
        >
          <Icon name="arrow-left" className="w-4 h-4" />
          Kembali ke beranda
        </Link>
      }
    >
      <div className="mb-6">
        <h1 className="text-[26px] sm:text-[28px] font-bold text-[#111827] tracking-tight leading-tight mb-1.5">
          Masuk ke Skillio
        </h1>
        <p className="text-sm text-[#6B7280]">
          Lanjutkan perjalanan berbagi insight bareng komunitas.
        </p>
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className="group w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#111827] bg-white border border-[#E5E7EB] hover:border-[#3B82F6]/40 hover:bg-[#F9FAFB] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {googleLoading ? (
          <span className="w-4 h-4 border-2 border-[#E5E7EB] border-t-[#3B82F6] rounded-full animate-spin" />
        ) : (
          <GoogleLogo />
        )}
        <span>{googleLoading ? 'Menghubungkan...' : 'Lanjut dengan Google'}</span>
      </button>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-[#E5E7EB]" />
        <span className="text-[11px] uppercase tracking-wider text-[#9CA3AF] font-medium">
          atau email
        </span>
        <div className="flex-1 h-px bg-[#E5E7EB]" />
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <Field label="Email">
          <div className="relative">
            <Icon
              name="mail"
              className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="kamu@email.com"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-xl outline-none placeholder:text-[#9CA3AF] focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
          </div>
        </Field>

        <Field
          label="Password"
          hint={
            <button
              type="button"
              className="text-xs font-medium text-[#3B82F6] hover:text-[#2563EB] transition-colors"
              onClick={() => showToast('Fitur reset password segera hadir', 'error')}
            >
              Lupa password?
            </button>
          }
        >
          <div className="relative">
            <Icon
              name="lock"
              className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]"
            />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Masukkan password"
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-xl outline-none placeholder:text-[#9CA3AF] focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-md text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]"
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            >
              <Icon name={showPassword ? 'eye-off' : 'eye'} className="w-4 h-4" />
            </button>
          </div>
        </Field>

        <label className="inline-flex items-center gap-2 text-xs text-[#6B7280] select-none cursor-pointer">
          <span className="relative">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="peer appearance-none w-4 h-4 rounded border border-[#E5E7EB] bg-white checked:bg-[#3B82F6] checked:border-[#3B82F6] transition-colors"
            />
            <Icon
              name="check"
              className="absolute inset-0 m-auto w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
            />
          </span>
          Tetap login di perangkat ini
        </label>

        <button
          type="submit"
          disabled={loading}
          className={`w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all ${
            loading
              ? 'bg-[#9CA3AF] cursor-not-allowed'
              : 'bg-[#3B82F6] hover:bg-[#2563EB] shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30'
          }`}
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Masuk...
            </>
          ) : (
            <>
              Masuk
              <Icon name="arrow-right" className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-[#6B7280] mt-6">
        Belum punya akun?{' '}
        <Link
          to="/register"
          className="font-semibold text-[#3B82F6] hover:text-[#2563EB] transition-colors"
        >
          Gabung Skillio
        </Link>
      </p>
    </AuthLayout>
  )
}

/* ---------------------------------------------------------------------------
 * Shared auth layout
 * ------------------------------------------------------------------------- */
function AuthLayout({ children, mode, topLink, toast }) {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div
              className={`px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg border ${
                toast.tone === 'error'
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-white border-[#E5E7EB] text-[#111827]'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Icon
                  name={toast.tone === 'error' ? 'x' : 'check'}
                  className="w-4 h-4"
                />
                {toast.message}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* LEFT — form column */}
        <div className="flex flex-col justify-center px-4 sm:px-6 py-12 lg:py-10">
          <div className="w-full max-w-[440px] mx-auto">
            {/* Top link */}
            <div className="mb-6">{topLink}</div>

            {/* Card */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-[0_4px_30px_-12px_rgba(17,24,39,0.08)]"
            >
              {children}
            </motion.div>

            <footer className="mt-8 text-[11px] text-[#9CA3AF] text-center">
              © {new Date().getFullYear()} Skillio · Tempat berbagi insight & inspirasi
            </footer>
          </div>
        </div>

        {/* RIGHT — side panel */}
        <AuthSidePanel mode={mode} />
      </div>
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-[#111827] uppercase tracking-wide">
          {label}
        </label>
        {hint}
      </div>
      {children}
    </div>
  )
}

function GoogleLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  )
}

export default Login
