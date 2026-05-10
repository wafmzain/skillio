import { Link } from 'react-router-dom'

/* ---------------------------------------------------------------------------
 * Icons — minimal stroke icons (Lucide-ish). Inline SVGs keep bundle clean.
 * ------------------------------------------------------------------------- */
const Icon = ({ name, className = 'w-5 h-5' }) => {
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
    case 'arrow-right':
      return (
        <svg {...common}><path d="M5 12h14M13 5l7 7-7 7" /></svg>
      )
    case 'sparkles':
      return (
        <svg {...common}>
          <path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z" />
          <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
        </svg>
      )
    case 'trending':
      return (
        <svg {...common}>
          <path d="M3 17l6-6 4 4 8-8" />
          <path d="M14 7h7v7" />
        </svg>
      )
    case 'users':
      return (
        <svg {...common}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <circle cx="10" cy="7" r="4" />
          <path d="M21 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13A4 4 0 0 1 16 11" />
        </svg>
      )
    case 'heart':
      return (
        <svg {...common}>
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6z" />
        </svg>
      )
    case 'message':
      return (
        <svg {...common}>
          <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z" />
        </svg>
      )
    case 'bookmark':
      return (
        <svg {...common}>
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      )
    case 'share':
      return (
        <svg {...common}>
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
        </svg>
      )
    case 'zap':
      return (
        <svg {...common}><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" /></svg>
      )
    case 'pen':
      return (
        <svg {...common}>
          <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
        </svg>
      )
    case 'network':
      return (
        <svg {...common}>
          <circle cx="12" cy="5" r="2" />
          <circle cx="5" cy="19" r="2" />
          <circle cx="19" cy="19" r="2" />
          <path d="M12 7v4M10.5 13L7 17M13.5 13l3.5 4" />
        </svg>
      )
    case 'check':
      return (
        <svg {...common}><path d="M20 6L9 17l-5-5" /></svg>
      )
    case 'star':
      return (
        <svg {...common} fill="currentColor">
          <path d="M12 2l3.1 6.3 7 1-5 4.9 1.2 6.9L12 17.8 5.7 21.1 6.9 14.2l-5-4.9 7-1L12 2z" />
        </svg>
      )
    case 'dot':
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <circle cx="12" cy="12" r="2" />
        </svg>
      )
    default:
      return null
  }
}

/* ---------------------------------------------------------------------------
 * Feed Mockup — showcases the social/creator feel immediately in the hero.
 * ------------------------------------------------------------------------- */
const FeedMockup = () => {
  return (
    <div className="relative">
      {/* Soft glow behind the card */}
      <div className="absolute -inset-6 bg-gradient-to-br from-blue-200/40 via-blue-100/20 to-transparent rounded-[32px] blur-2xl -z-10" />

      {/* Main feed card */}
      <div className="relative bg-white border border-[#E5E7EB] rounded-2xl shadow-[0_20px_60px_-20px_rgba(17,24,39,0.15)] overflow-hidden">
        {/* Feed header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F3F4F6]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
            <span className="text-xs font-semibold text-[#111827]">Feed Kreator</span>
          </div>
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E5E7EB]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#E5E7EB]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
          </div>
        </div>

        {/* Post 1 */}
        <div className="px-5 py-4 border-b border-[#F3F4F6]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
              S
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-[#111827]">Sarah Kim</span>
                <span className="text-[#9CA3AF]"><Icon name="dot" className="w-3 h-3" /></span>
                <span className="text-xs text-[#6B7280]">UI Designer</span>
              </div>
              <span className="text-xs text-[#9CA3AF]">2 jam lalu</span>
            </div>
            <button className="text-[#6B7280] hover:text-[#3B82F6]">
              <Icon name="bookmark" className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm text-[#111827] leading-relaxed mb-3">
            Workflow yang aku pakai untuk review desain dalam 15 menit. Gak perlu meeting panjang,
            cukup 3 langkah clear feedback loop.
          </p>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {['#design', '#workflow', '#productivity'].map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-lg bg-[#F3F4F6] text-xs font-medium text-[#3B82F6]"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-5 text-xs text-[#6B7280]">
            <span className="flex items-center gap-1.5"><Icon name="heart" className="w-3.5 h-3.5" /> 248</span>
            <span className="flex items-center gap-1.5"><Icon name="message" className="w-3.5 h-3.5" /> 32</span>
            <span className="flex items-center gap-1.5"><Icon name="share" className="w-3.5 h-3.5" /> 12</span>
          </div>
        </div>

        {/* Post 2 */}
        <div className="px-5 py-4 bg-[#FAFAFA]/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-sm font-bold">
              R
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-[#111827]">Rizky P.</span>
                <span className="text-[#9CA3AF]"><Icon name="dot" className="w-3 h-3" /></span>
                <span className="text-xs text-[#6B7280]">Content Creator</span>
              </div>
              <span className="text-xs text-[#9CA3AF]">5 jam lalu</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-[#3B82F6] text-[10px] font-semibold">
              <Icon name="trending" className="w-3 h-3" /> Trending
            </span>
          </div>

          <p className="text-sm text-[#111827] leading-relaxed mb-3">
            3 prompt AI yang aku pakai setiap hari untuk research konten. Hemat 4 jam per minggu.
          </p>

          <div className="flex items-center gap-5 text-xs text-[#6B7280]">
            <span className="flex items-center gap-1.5"><Icon name="heart" className="w-3.5 h-3.5" /> 1.2K</span>
            <span className="flex items-center gap-1.5"><Icon name="message" className="w-3.5 h-3.5" /> 89</span>
            <span className="flex items-center gap-1.5"><Icon name="share" className="w-3.5 h-3.5" /> 56</span>
          </div>
        </div>
      </div>

      {/* Floating trending chip */}
      <div className="absolute -top-4 -right-4 bg-white border border-[#E5E7EB] rounded-2xl shadow-lg px-3 py-2 flex items-center gap-2 animate-[float_5s_ease-in-out_infinite]">
        <div className="w-7 h-7 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center">
          <Icon name="trending" className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[10px] text-[#6B7280] leading-tight">Trending hari ini</div>
          <div className="text-xs font-semibold text-[#111827] leading-tight">+124 insight baru</div>
        </div>
      </div>

      {/* Floating engagement chip */}
      <div className="absolute -bottom-4 -left-4 bg-white border border-[#E5E7EB] rounded-2xl shadow-lg px-3 py-2 flex items-center gap-2 animate-[float_6s_ease-in-out_infinite_reverse]">
        <div className="flex -space-x-1.5">
          {['from-blue-400 to-blue-600', 'from-amber-400 to-orange-500', 'from-emerald-400 to-teal-500'].map((c, i) => (
            <div key={i} className={`w-6 h-6 rounded-full bg-gradient-to-br ${c} border-2 border-white`} />
          ))}
        </div>
        <div>
          <div className="text-[10px] text-[#6B7280] leading-tight">Creator aktif</div>
          <div className="text-xs font-semibold text-[#111827] leading-tight">2.4K online</div>
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Main landing page
 * ------------------------------------------------------------------------- */
function LandingPage({ user }) {
  return (
    <div className="bg-[#FAFAFA] text-[#111827] overflow-x-hidden">
      {/* LandingNavbar is rendered by App.jsx */}
      <div className="pt-24">
        {/* =====================================================================
         * HERO
         * ===================================================================*/}
        <section className="relative px-4 sm:px-6 pt-8 pb-20 lg:pt-16 lg:pb-28">
          {/* Subtle background accents */}
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-10 -left-24 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
            <div className="absolute top-40 right-0 w-[28rem] h-[28rem] bg-blue-100/40 rounded-full blur-3xl" />
          </div>

          <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* LEFT — Copy + CTA */}
            <div className="relative">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-xs font-medium text-[#111827] shadow-sm mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
                Jaringan creator berbagi insight
              </span>

              <h1 className="text-[clamp(2.25rem,5vw,3.75rem)] font-bold leading-[1.1] tracking-tight text-[#111827] mb-6">
                Bagikan Insight Kreatifmu ke{' '}
                <span className="relative inline-block">
                  <span className="text-[#3B82F6]">Komunitas Creator</span>
                  <svg
                    className="absolute -bottom-1.5 left-0 w-full h-2.5"
                    viewBox="0 0 300 10"
                    preserveAspectRatio="none"
                    fill="none"
                  >
                    <path
                      d="M2 7C60 3 140 2 220 5C260 6.5 285 6 298 4"
                      stroke="#3B82F6"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      opacity="0.35"
                    />
                  </svg>
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#6B7280] leading-relaxed max-w-[540px] mb-8">
                Tempat creator berbagi workflow, insight, dan pengalaman. Temukan ide,
                bangun koneksi, dan tumbuh bareng komunitas kreatif.
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-10">
                <Link to={user ? '/upload' : '/register'}>
                  <button className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all">
                    Mulai Berbagi
                    <Icon name="arrow-right" className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </Link>
                <Link to="/home">
                  <button className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-[#111827] bg-white border border-[#E5E7EB] hover:border-[#3B82F6]/40 hover:bg-white transition-all">
                    Jelajahi Feed
                  </button>
                </Link>
              </div>

              {/* Engagement stats */}
              <div className="grid grid-cols-3 gap-4 max-w-[440px]">
                {[
                  { value: '10K+', label: 'Creator aktif' },
                  { value: '48K', label: 'Insight dibagikan' },
                  { value: '2.1M', label: 'Interaksi bulan ini' },
                ].map((s) => (
                  <div key={s.label} className="border-l-2 border-[#E5E7EB] pl-3">
                    <div className="text-xl sm:text-2xl font-bold text-[#111827]">{s.value}</div>
                    <div className="text-xs text-[#6B7280]">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — Feed mockup */}
            <div className="relative lg:pl-8">
              <FeedMockup />
            </div>
          </div>
        </section>

        {/* =====================================================================
         * TRENDING PREVIEW
         * ===================================================================*/}
        <section className="px-4 sm:px-6 py-16 lg:py-20">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
              <div>
                <div className="inline-flex items-center gap-2 text-[#3B82F6] mb-2">
                  <Icon name="trending" className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Trending sekarang</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">
                  Insight yang lagi dibicarain creator
                </h2>
              </div>
              <Link
                to="/explore"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#3B82F6] hover:text-[#2563EB] transition-colors"
              >
                Lihat semua
                <Icon name="arrow-right" className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  rank: '01',
                  title: 'Cara aku dapet client pertama dari Twitter',
                  author: 'Sarah Kim',
                  role: 'UI Designer',
                  tags: ['#growth', '#freelance'],
                  likes: '2.4K',
                  comments: '186',
                },
                {
                  rank: '02',
                  title: '5 prompt AI buat speedrun riset konten',
                  author: 'Rizky P.',
                  role: 'Content Creator',
                  tags: ['#ai', '#workflow'],
                  likes: '1.9K',
                  comments: '142',
                },
                {
                  rank: '03',
                  title: 'Template Notion yang bikin proyek kelar tepat waktu',
                  author: 'Maya L.',
                  role: 'Product Manager',
                  tags: ['#productivity', '#tools'],
                  likes: '1.6K',
                  comments: '98',
                },
              ].map((post) => (
                <Link
                  key={post.rank}
                  to={user ? '/home' : '/register'}
                  className="group block p-5 bg-white border border-[#E5E7EB] rounded-2xl hover:border-[#3B82F6]/30 hover:shadow-[0_8px_30px_-8px_rgba(59,130,246,0.15)] hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-2xl font-bold text-[#E5E7EB] group-hover:text-[#3B82F6] transition-colors">
                      {post.rank}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-[#3B82F6] font-medium">
                      <Icon name="trending" className="w-3.5 h-3.5" />
                      Trending
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-[#111827] leading-snug mb-3 line-clamp-2 group-hover:text-[#3B82F6] transition-colors">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                      {post.author.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-[#111827] truncate">{post.author}</div>
                      <div className="text-[11px] text-[#6B7280] truncate">{post.role}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[#F3F4F6]">
                    <div className="flex gap-1.5">
                      {post.tags.map((t) => (
                        <span key={t} className="text-[11px] font-medium text-[#6B7280]">{t}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-[#6B7280]">
                      <span className="flex items-center gap-1"><Icon name="heart" className="w-3 h-3" /> {post.likes}</span>
                      <span className="flex items-center gap-1"><Icon name="message" className="w-3 h-3" /> {post.comments}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================================
         * FEATURED CREATORS
         * ===================================================================*/}
        <section id="creators" className="px-4 sm:px-6 py-16 lg:py-20 bg-white border-y border-[#E5E7EB]">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
              <div>
                <div className="inline-flex items-center gap-2 text-[#3B82F6] mb-2">
                  <Icon name="users" className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Creator pilihan</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">
                  Ikuti creator yang lagi tumbuh
                </h2>
              </div>
              <Link
                to="/home"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#3B82F6] hover:text-[#2563EB] transition-colors"
              >
                Temukan lainnya
                <Icon name="arrow-right" className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'Sarah Kim', role: 'UI Designer', followers: '12.4K', color: 'from-blue-400 to-blue-600', tag: 'Design' },
                { name: 'Rizky P.', role: 'Content Creator', followers: '8.7K', color: 'from-amber-400 to-orange-500', tag: 'Creator' },
                { name: 'Maya L.', role: 'Product Manager', followers: '6.2K', color: 'from-emerald-400 to-teal-500', tag: 'Product' },
                { name: 'Dimas A.', role: 'Frontend Dev', followers: '9.1K', color: 'from-violet-400 to-purple-600', tag: 'Engineering' },
              ].map((creator) => (
                <div
                  key={creator.name}
                  className="group relative p-5 bg-white border border-[#E5E7EB] rounded-2xl hover:border-[#3B82F6]/30 hover:shadow-[0_8px_30px_-8px_rgba(59,130,246,0.15)] hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-12 h-12 rounded-full bg-gradient-to-br ${creator.color} flex items-center justify-center text-white font-bold shadow-sm`}
                    >
                      {creator.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-[#111827] truncate">{creator.name}</div>
                      <div className="text-xs text-[#6B7280] truncate">{creator.role}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2 py-1 rounded-md bg-[#F3F4F6] text-[11px] font-medium text-[#6B7280]">
                      {creator.tag}
                    </span>
                    <div className="text-xs text-[#6B7280]">
                      <span className="font-semibold text-[#111827]">{creator.followers}</span> followers
                    </div>
                  </div>
                  <button className="w-full px-3 py-2 rounded-lg bg-[#F3F4F6] group-hover:bg-[#3B82F6] text-xs font-semibold text-[#111827] group-hover:text-white transition-colors">
                    + Ikuti
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================================
         * FEATURES — Why Skillio (creator-focused, not LMS)
         * ===================================================================*/}
        <section className="px-4 sm:px-6 py-20 lg:py-28">
          <div className="max-w-[1200px] mx-auto">
            <div className="max-w-[680px] mb-12">
              <div className="inline-flex items-center gap-2 text-[#3B82F6] mb-2">
                <Icon name="sparkles" className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Dibangun untuk creator</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight leading-tight mb-4">
                Tempat berbagi yang terasa seperti punya sendiri
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed">
                Skillio bukan platform kursus atau marketplace. Ini ruang buat creator saling bertukar
                insight, workflow, dan pengalaman nyata.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  icon: 'pen',
                  title: 'Tulis insight, bukan kursus',
                  desc: 'Format feed yang ringan. Bagikan pemikiran, workflow, atau studi kasus tanpa harus bikin modul panjang.',
                },
                {
                  icon: 'network',
                  title: 'Networking natural',
                  desc: 'Follow creator yang relevan. Diskusi lewat komentar. Bangun koneksi tanpa rasa formal.',
                },
                {
                  icon: 'trending',
                  title: 'Distribusi organik',
                  desc: 'Algoritma highlight insight yang relevan ke audiens yang tepat. Karya bagus dapat panggung.',
                },
                {
                  icon: 'bookmark',
                  title: 'Koleksi personal',
                  desc: 'Simpan insight ke koleksi pribadi. Bangun second brain dari ide creator yang kamu respect.',
                },
                {
                  icon: 'message',
                  title: 'Diskusi bermakna',
                  desc: 'Thread komentar yang fokus. Tanpa noise, tanpa spam, tempat ide diuji dan diperdalam.',
                },
                {
                  icon: 'zap',
                  title: 'Tumbuh tanpa gimmick',
                  desc: 'Engagement stats yang transparan. Fokus ke kualitas insight, bukan ke clickbait.',
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="group p-6 bg-white border border-[#E5E7EB] rounded-2xl hover:border-[#3B82F6]/30 hover:shadow-[0_8px_30px_-8px_rgba(59,130,246,0.15)] hover:-translate-y-0.5 transition-all"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center mb-4 group-hover:bg-[#3B82F6] group-hover:text-white transition-colors">
                    <Icon name={f.icon} className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-[#111827] mb-2">{f.title}</h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================================
         * SKILLIO+  — creator enhancement tools, NOT a paywall
         * ===================================================================*/}
        <section className="px-4 sm:px-6 py-20 lg:py-28">
          <div className="max-w-[1200px] mx-auto">
            <div className="relative bg-gradient-to-br from-[#111827] to-[#1F2937] rounded-3xl overflow-hidden p-8 sm:p-12 lg:p-16">
              {/* Decorative accents */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#3B82F6]/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#3B82F6]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-medium text-white mb-6">
                    <Icon name="sparkles" className="w-3.5 h-3.5" />
                    Skillio+ · Creator tools
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight mb-4">
                    Tools tambahan biar kamu lebih produktif bikin insight
                  </h2>

                  <p className="text-base text-[#9CA3AF] leading-relaxed mb-8 max-w-[520px]">
                    Skillio+ bukan paywall konten. Semua feed tetap bisa diakses bebas. Ini set tools
                    opsional buat creator yang mau bikin, edit, dan distribusi insight lebih cepat.
                  </p>

                  <ul className="space-y-3 mb-8">
                    {[
                      'AI assist untuk summarize, outline, dan improve tulisan',
                      'Analytics detail per insight — reach, retention, konversi follower',
                      'Scheduled posting dan draft yang ter-sinkron lintas device',
                      'Badge creator verified untuk kredibilitas di feed',
                    ].map((perk) => (
                      <li key={perk} className="flex items-start gap-3 text-sm text-white/90">
                        <span className="w-5 h-5 rounded-full bg-[#3B82F6]/20 text-[#3B82F6] flex items-center justify-center shrink-0 mt-0.5">
                          <Icon name="check" className="w-3 h-3" />
                        </span>
                        {perk}
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-3">
                    <Link to={user ? '/premium' : '/register'}>
                      <button className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-[#111827] bg-white hover:bg-[#F3F4F6] transition-colors">
                        Coba Skillio+
                        <Icon name="arrow-right" className="w-4 h-4" />
                      </button>
                    </Link>
                    <Link to="/premium">
                      <button className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-colors">
                        Lihat detail
                      </button>
                    </Link>
                  </div>
                </div>

                {/* Creator analytics mock */}
                <div className="relative">
                  <div className="bg-white/[0.04] backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-xs text-[#9CA3AF]">Performa 7 hari</div>
                        <div className="text-lg font-semibold text-white">Analytics Creator</div>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/15 text-emerald-300 text-[11px] font-semibold">
                        <Icon name="trending" className="w-3 h-3" /> +24%
                      </span>
                    </div>

                    {/* Mini bar chart */}
                    <div className="flex items-end gap-2 h-24 mb-5">
                      {[40, 55, 35, 70, 60, 85, 95].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                          <div
                            className="w-full rounded-md bg-gradient-to-t from-[#3B82F6] to-[#60A5FA]"
                            style={{ height: `${h}%` }}
                          />
                          <span className="text-[10px] text-[#6B7280]">S{i + 1}</span>
                        </div>
                      ))}
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
                      {[
                        { label: 'Reach', value: '48.2K' },
                        { label: 'Engagement', value: '7.9%' },
                        { label: 'Follower baru', value: '+312' },
                      ].map((m) => (
                        <div key={m.label}>
                          <div className="text-xs text-[#9CA3AF]">{m.label}</div>
                          <div className="text-sm font-semibold text-white">{m.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
         * TESTIMONIALS
         * ===================================================================*/}
        <section className="px-4 sm:px-6 py-20 lg:py-28 bg-white border-t border-[#E5E7EB]">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center max-w-[680px] mx-auto mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight leading-tight mb-4">
                Creator yang udah nemuin rumahnya di Skillio
              </h2>
              <p className="text-base text-[#6B7280]">
                Suara dari komunitas tentang cara mereka tumbuh dengan berbagi.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  name: 'Aurel M.',
                  role: 'Brand Designer',
                  text: 'Di Skillio aku nggak ngerasa harus jadi guru. Cuma share workflow harian, eh malah dapet banyak follower dan kolaborasi.',
                  color: 'from-blue-400 to-blue-600',
                },
                {
                  name: 'Bintang W.',
                  role: 'Indie Developer',
                  text: 'Format feed-nya pas. Gak harus bikin kursus panjang, tapi tetap bisa bagi insight yang berbobot.',
                  color: 'from-violet-400 to-purple-600',
                },
                {
                  name: 'Kayla R.',
                  role: 'Content Strategist',
                  text: 'Analytics Skillio+ bikin aku lebih ngerti konten mana yang benar-benar resonate. Worth it banget buat creator serius.',
                  color: 'from-emerald-400 to-teal-500',
                },
              ].map((t) => (
                <div
                  key={t.name}
                  className="p-6 bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl hover:border-[#3B82F6]/30 hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex gap-0.5 mb-4 text-[#3B82F6]">
                    {[...Array(5)].map((_, i) => (
                      <Icon key={i} name="star" className="w-3.5 h-3.5" />
                    ))}
                  </div>
                  <p className="text-sm text-[#111827] leading-relaxed mb-5">
                    “{t.text}”
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-[#E5E7EB]">
                    <div
                      className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xs font-bold`}
                    >
                      {t.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#111827] truncate">{t.name}</div>
                      <div className="text-xs text-[#6B7280] truncate">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================================
         * FINAL CTA
         * ===================================================================*/}
        <section className="px-4 sm:px-6 py-20 lg:py-28">
          <div className="max-w-[880px] mx-auto">
            <div className="relative bg-white border border-[#E5E7EB] rounded-3xl p-10 sm:p-14 text-center overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-semibold mb-5">
                  <Icon name="sparkles" className="w-3.5 h-3.5" />
                  Gratis, tanpa kartu kredit
                </div>

                <h2 className="text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight leading-tight mb-4">
                  Bangun audiens kreatifmu, mulai hari ini
                </h2>
                <p className="text-base text-[#6B7280] leading-relaxed max-w-[560px] mx-auto mb-8">
                  Gabung ke komunitas creator yang saling bantu. Posting pertama kamu bisa ditulis
                  dalam 5 menit.
                </p>

                <div className="flex flex-wrap gap-3 justify-center">
                  <Link to={user ? '/upload' : '/register'}>
                    <button className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all">
                      Mulai Berbagi
                      <Icon name="arrow-right" className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </Link>
                  <Link to="/home">
                    <button className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-[#111827] bg-white border border-[#E5E7EB] hover:border-[#3B82F6]/40 transition-all">
                      Jelajahi Feed
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
         * FOOTER
         * ===================================================================*/}
        <footer className="px-4 sm:px-6 pt-16 pb-10 bg-white border-t border-[#E5E7EB]">
          <div className="max-w-[1200px] mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
              <div className="col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <img src="/logo.png" alt="Skillio" className="h-10 w-auto object-contain" />
                </div>
                <p className="text-sm text-[#6B7280] leading-relaxed max-w-[320px] mb-5">
                  Creator social ecosystem untuk berbagi insight, workflow, dan pengalaman.
                  Dibangun untuk komunitas, bukan algoritma.
                </p>
                <div className="flex gap-2">
                  {['T', 'L', 'G', 'I'].map((s) => (
                    <a
                      key={s}
                      href="#"
                      className="w-9 h-9 rounded-lg bg-[#F3F4F6] hover:bg-[#3B82F6] hover:text-white text-[#6B7280] flex items-center justify-center text-xs font-bold transition-colors"
                    >
                      {s}
                    </a>
                  ))}
                </div>
              </div>

              {[
                { title: 'Produk', items: ['Feed', 'Trending', 'Creator', 'Skillio+'] },
                { title: 'Komunitas', items: ['Jelajahi', 'Topik', 'Creator pilihan', 'Panduan'] },
                { title: 'Perusahaan', items: ['Tentang', 'Blog', 'Kontak', 'Karir'] },
              ].map((col) => (
                <div key={col.title}>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#111827] mb-4">
                    {col.title}
                  </h4>
                  <ul className="space-y-2.5">
                    {col.items.map((item) => (
                      <li key={item}>
                        <a
                          href="#"
                          className="text-sm text-[#6B7280] hover:text-[#3B82F6] transition-colors"
                        >
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-[#E5E7EB] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <p className="text-xs text-[#6B7280]">
                © {new Date().getFullYear()} Skillio. Dibuat untuk creator.
              </p>
              <div className="flex gap-5 text-xs text-[#6B7280]">
                <a href="#" className="hover:text-[#3B82F6] transition-colors">Privasi</a>
                <a href="#" className="hover:text-[#3B82F6] transition-colors">Ketentuan</a>
                <a href="#" className="hover:text-[#3B82F6] transition-colors">Cookie</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default LandingPage
