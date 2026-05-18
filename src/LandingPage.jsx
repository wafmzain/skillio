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
            <span className="text-xs font-semibold text-[#111827]">Feed Komunitas</span>
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
                <span className="text-xs text-[#6B7280]">Mahasiswa</span>
              </div>
              <span className="text-xs text-[#9CA3AF]">5 jam lalu</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-[#3B82F6] text-[10px] font-semibold">
              <Icon name="trending" className="w-3 h-3" /> Trending
            </span>
          </div>

          <p className="text-sm text-[#111827] leading-relaxed mb-3">
            3 tools gratis yang aku pakai buat riset tugas akhir. Hemat 4 jam per minggu.
          </p>

          <div className="flex items-center gap-5 text-xs text-[#6B7280]">
            <span className="flex items-center gap-1.5"><Icon name="heart" className="w-3.5 h-3.5" /> 1.2K</span>
            <span className="flex items-center gap-1.5"><Icon name="message" className="w-3.5 h-3.5" /> 89</span>
            <span className="flex items-center gap-1.5"><Icon name="share" className="w-3.5 h-3.5" /> 56</span>
          </div>
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
                Belajar dan Berkembang Bersama Komunitas
              </span>

              <h1 className="text-[clamp(2.25rem,5vw,3.75rem)] font-bold leading-[1.1] tracking-tight text-[#111827] mb-6">
                Bagikan insight dan skill bersama komunitas dengan {' '}
                <span className="relative inline-block">
                  <span className="text-[#3B82F6]">dukungan AI.</span>
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
                Platform social learning modern untuk berbagi pengetahuan, membangun reputasi digital, dan menemukan inspirasi dari berbagai kalangan.
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

              {/* Engagement stats removed */}
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
                  Insight yang lagi dibicarain komunitas
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
                  title: '5 prompt AI buat speedrun riset tugas kuliah',
                  author: 'Rizky P.',
                  role: 'Mahasiswa',
                  tags: ['#ai', '#belajar'],
                  likes: '1.9K',
                  comments: '142',
                },
                {
                  rank: '03',
                  title: 'Template Notion yang bikin proyek kelar tepat waktu',
                  author: 'Maya L.',
                  role: 'Product Manager',
                  tags: ['#produktivitas', '#tools'],
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
         * FEATURES — Why Skillio
         * ===================================================================*/}
        <section className="px-4 sm:px-6 py-20 lg:py-28">
          <div className="max-w-[1200px] mx-auto">
            <div className="max-w-[680px] mb-12">
              <div className="inline-flex items-center gap-2 text-[#3B82F6] mb-2">
                <Icon name="sparkles" className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Untuk semua orang</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight leading-tight mb-4">
                Tempat berbagi yang terasa seperti punya sendiri
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed">
                Skillio bukan platform kursus atau marketplace. Ini ruang buat siapa saja saling
                bertukar insight, pengalaman, dan pengetahuan dari berbagai bidang.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  icon: 'pen',
                  title: 'Tulis dan bagikan insight dengan mudah',
                  desc: 'Tidak perlu membuat kursus atau modul panjang. Cukup bagikan pengalaman, pengetahuan, atau hal baru yang kamu pelajari.',
                },
                {
                  icon: 'network',
                  title: 'Terhubung dengan komunitas yang relevan',
                  desc: 'Ikuti pengguna dengan insight yang menarik, berdiskusi lewat komentar, dan bangun koneksi secara natural.',
                },
                {
                  icon: 'trending',
                  title: 'Insight berkualitas lebih mudah ditemukan',
                  desc: 'Konten yang bermanfaat dapat muncul di feed pengguna lain tanpa harus memiliki banyak followers.',
                },
                {
                  icon: 'bookmark',
                  title: 'Simpan insight penting',
                  desc: 'Bookmark insight favorit agar dapat dibaca kembali kapan saja dengan lebih praktis.',
                },
                {
                  icon: 'message',
                  title: 'Diskusi yang lebih bermakna',
                  desc: 'Bangun percakapan yang fokus, saling membantu, dan mendukung proses belajar komunitas.',
                },
                {
                  icon: 'zap',
                  title: 'Fokus pada kualitas insight',
                  desc: 'Platform dirancang untuk menghargai kualitas konten dan kontribusi, bukan sekadar popularitas.',
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
         * TESTIMONIALS
         * ===================================================================*/}
        <section className="px-4 sm:px-6 py-20 lg:py-28 bg-white border-t border-[#E5E7EB]">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center max-w-[680px] mx-auto mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight leading-tight mb-4">
                Pengalaman pengguna di Skillio
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
                  text: 'Di Skillio aku nggak ngerasa harus jadi guru. Cuma share workflow harian, eh malah dapet banyak koneksi dan kolaborasi.',
                  color: 'from-blue-400 to-blue-600',
                },
                {
                  name: 'Bintang W.',
                  role: 'Mahasiswa Informatika',
                  text: 'Format feed-nya pas. Gak harus bikin kursus panjang, tapi tetap bisa bagi insight yang berbobot.',
                  color: 'from-violet-400 to-purple-600',
                },
                {
                  name: 'Kayla R.',
                  role: 'Marketing Lead',
                  text: 'Analytics Skillio+ bikin aku lebih ngerti konten mana yang benar-benar resonate. Worth it banget buat yang serius.',
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
                {/* <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-semibold mb-5">
                  <Icon name="sparkles" className="w-3.5 h-3.5" />
                  Gratis, tanpa kartu kredit
                </div> */}

                <h2 className="text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight leading-tight mb-4">
                  Bangun reputasi digitalmu,<br className="hidden sm:block" />
                  mulai dari satu insight
                </h2>
                <p className="text-base text-[#6B7280] leading-relaxed max-w-[540px] mx-auto mb-8">
                   Belajar dan berkembang bersama komunitas digital modern.
                </p>

                <div className="flex flex-wrap gap-3 justify-center mb-6">
                  <Link to={user ? '/upload' : '/register'}>
                    <button className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all">
                      Mulai Berbagi
                      <Icon name="arrow-right" className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </Link>
                  <Link to="/home">
                    <button className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-[#111827] bg-white border border-[#E5E7EB] hover:border-[#3B82F6]/40 hover:bg-[#F9FAFB] transition-all">
                      Jelajahi Feed
                    </button>
                  </Link>
                </div>

                {/* Social proof micro-strip */}
                {/* <div className="flex items-center justify-center gap-2 text-xs text-[#6B7280]">
                  <div className="flex -space-x-1.5">
                    {['from-blue-400 to-blue-600', 'from-violet-400 to-purple-600', 'from-emerald-400 to-teal-500', 'from-amber-400 to-orange-500'].map((c, i) => (
                      <div key={i} className={`w-6 h-6 rounded-full bg-gradient-to-br ${c} border-2 border-white`} />
                    ))}
                  </div>
                  <span>Bergabung dengan komunitas yang terus tumbuh</span>
                </div> */}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
         * FOOTER
         * ===================================================================*/}
        <footer className="px-4 sm:px-6 py-10 border-t border-[#E5E7EB]">
          <p className="text-center text-xs text-[#9CA3AF]">
            © {new Date().getFullYear()} Skillio. Learn, share, and grow together.
          </p>
        </footer>
      </div>
    </div>
  )
}

export default LandingPage
