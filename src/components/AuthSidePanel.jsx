import { motion } from 'framer-motion'

/* ---------------------------------------------------------------------------
 * AuthSidePanel — right-side panel for /login and /register
 * Uses explicit inline style for the dark background to guarantee rendering.
 * ------------------------------------------------------------------------- */
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
    case 'sparkles':
      return <svg {...common}><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z"/></svg>
    case 'heart':
      return <svg {...common}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6z"/></svg>
    case 'message':
      return <svg {...common}><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z"/></svg>
    case 'bookmark':
      return <svg {...common}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
    case 'trending':
      return <svg {...common}><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>
    case 'check':
      return <svg {...common}><path d="M20 6L9 17l-5-5"/></svg>
    default:
      return null
  }
}

function AuthSidePanel({ mode = 'login' }) {
  const copy = {
    login: {
      label: 'Welcome back',
      title: 'Lanjutkan berbagi insight & inspirasimu',
      subtitle:
        'Masuk untuk akses feed, koleksi insight, dan tools yang sudah kamu atur.',
    },
    register: {
      label: 'Join the community',
      title: 'Gabung komunitas berbagi insight di Skillio',
      subtitle:
        'Gabung komunitas untuk berbagi ide, pengalaman, dan pengetahuan bareng.',
    },
  }[mode]

  return (
    <aside
      className="hidden lg:flex relative overflow-hidden"
      style={{
        backgroundColor: '#0B1220',
        backgroundImage:
          'radial-gradient(ellipse 60% 40% at 20% 10%, rgba(59,130,246,0.35), transparent 60%), radial-gradient(ellipse 50% 40% at 80% 90%, rgba(59,130,246,0.18), transparent 60%)',
      }}
    >
      {/* Grid texture */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.08 }}
        preserveAspectRatio="none"
        viewBox="0 0 1000 1000"
      >
        <defs>
          <pattern id="auth-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="#60A5FA" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="1000" height="1000" fill="url(#auth-grid)" />
      </svg>

      <div
        className="relative w-full flex flex-col justify-between px-10 xl:px-14 py-16 text-white"
        style={{ minHeight: '100vh' }}
      >
        {/* Top — headline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="max-w-[460px]"
        >
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold mb-6"
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderColor: 'rgba(255,255,255,0.12)',
            }}
          >
            <Icon name="sparkles" className="w-3.5 h-3.5" style={{ color: '#60A5FA' }} />
            <span style={{ color: '#93C5FD' }}>{copy.label}</span>
          </div>
          <h2 className="text-[28px] xl:text-[32px] font-bold tracking-tight leading-[1.15] mb-3">
            {copy.title}
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.65)' }}
          >
            {copy.subtitle}
          </p>
        </motion.div>

        {/* Middle — feed mockup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut', delay: 0.08 }}
          className="relative my-12 max-w-[440px]"
        >
          <div
            className="relative rounded-2xl p-5 border shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)]"
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderColor: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: '#60A5FA' }}
                />
                <span
                  className="text-[11px] font-medium"
                  style={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  Feed Kreator
                </span>
              </div>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold"
                style={{ backgroundColor: 'rgba(59,130,246,0.18)', color: '#93C5FD' }}
              >
                <Icon name="trending" className="w-3 h-3" />
                Trending
              </span>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #60A5FA 0%, #2563EB 100%)',
                }}
              >
                S
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white truncate">
                    Sarah Kim
                  </span>
                  <span
                    className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: '#3B82F6' }}
                  >
                    <Icon name="sparkles" className="w-2 h-2 text-white" />
                  </span>
                </div>
                <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  UI Designer · 2j lalu
                </div>
              </div>
            </div>

            <p
              className="text-sm leading-relaxed mb-3"
              style={{ color: 'rgba(255,255,255,0.9)' }}
            >
              Workflow review desain dalam 15 menit — 3 langkah clear feedback loop.
            </p>

            <div
              className="flex items-center gap-4 text-[11px] pt-3 border-t"
              style={{
                color: 'rgba(255,255,255,0.55)',
                borderColor: 'rgba(255,255,255,0.08)',
              }}
            >
              <span className="inline-flex items-center gap-1">
                <Icon name="heart" className="w-3 h-3" /> 248
              </span>
              <span className="inline-flex items-center gap-1">
                <Icon name="message" className="w-3 h-3" /> 32
              </span>
              <span className="inline-flex items-center gap-1">
                <Icon name="bookmark" className="w-3 h-3" /> 86
              </span>
            </div>
          </div>

          {/* Floating creators chip */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-4 -right-3 rounded-xl px-3 py-2 flex items-center gap-2.5 border"
            style={{
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderColor: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div className="flex -space-x-1.5">
              {[
                'linear-gradient(135deg, #60A5FA, #2563EB)',
                'linear-gradient(135deg, #A78BFA, #7C3AED)',
                'linear-gradient(135deg, #34D399, #10B981)',
              ].map((bg, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundImage: bg, border: '2px solid #0B1220' }}
                />
              ))}
            </div>
            <div>
              <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Anggota aktif
              </div>
              <div className="text-xs font-semibold text-white">2.4K online</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom — stats + benefits */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.16 }}
          className="max-w-[460px]"
        >
          <div className="grid grid-cols-3 gap-5 mb-6">
            {[
              { value: '10K+', label: 'Anggota aktif' },
              { value: '48K', label: 'Insight dibagi' },
              { value: '2.1M', label: 'Interaksi/bln' },
            ].map((s) => (
              <div
                key={s.label}
                className="pl-3"
                style={{ borderLeft: '2px solid rgba(255,255,255,0.1)' }}
              >
                <div className="text-xl font-bold text-white leading-none mb-1">
                  {s.value}
                </div>
                <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <ul className="space-y-2">
            {[
              'Feed komunitas gratis tanpa paywall konten',
              'Diskusi bermakna tanpa noise & spam',
              'Discovery organik untuk yang suka berbagi',
            ].map((t) => (
              <li
                key={t}
                className="flex items-start gap-2.5 text-xs leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.7)' }}
              >
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: 'rgba(59,130,246,0.18)', color: '#93C5FD' }}
                >
                  <Icon name="check" className="w-2.5 h-2.5" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </aside>
  )
}

export default AuthSidePanel
