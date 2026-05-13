import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from './services/supabaseClient'
import PostCard from './PostCard'
import FollowButton from './FollowButton'
import { formatViews } from './utils/formatViews'
import LeaderboardCard from './components/reputation/LeaderboardCard'
import AffiliateSection from './components/affiliate/AffiliateSection'
import { AFFILIATE_SOURCES } from './types/affiliate'

/* ---------------------------------------------------------------------------
 * Icons — minimal stroke set (Lucide-ish)
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
    case 'search':
      return <svg {...common}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
    case 'trending':
      return <svg {...common}><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>
    case 'clock':
      return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
    case 'users':
      return <svg {...common}><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M21 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13A4 4 0 0 1 16 11"/></svg>
    case 'sparkles':
      return <svg {...common}><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z"/></svg>
    case 'plus':
      return <svg {...common}><path d="M12 5v14M5 12h14"/></svg>
    case 'chevron-down':
      return <svg {...common}><path d="M6 9l6 6 6-6"/></svg>
    case 'x':
      return <svg {...common}><path d="M18 6L6 18M6 6l12 12"/></svg>
    case 'check':
      return <svg {...common}><path d="M20 6L9 17l-5-5"/></svg>
    case 'hash':
      return <svg {...common}><path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"/></svg>
    default:
      return null
  }
}

/* ---------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------- */
const CATEGORIES = [
  'Semua',
  'Design',
  'Programming',
  'Marketing',
  'AI Tools',
  'Productivity',
  'Video Editing',
  'Bisnis',
]

const SORT_OPTIONS = [
  { key: 'latest', label: 'Terbaru', icon: 'clock' },
  { key: 'trending', label: 'Trending', icon: 'trending' },
]

/* ---------------------------------------------------------------------------
 * Home
 * ------------------------------------------------------------------------- */
function Home() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [sortBy, setSortBy] = useState('latest')
  const [trendingCreators, setTrendingCreators] = useState([])
  const [userStats, setUserStats] = useState({ followers: 0, following: 0, posts: 0 })
  const [sortMenuOpen, setSortMenuOpen] = useState(false)

  useEffect(() => {
    getCurrentUser()
    fetchPosts()
    fetchTrendingCreators()
  }, [])

  useEffect(() => {
    if (currentUser) fetchUserStats()
  }, [currentUser])

  async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  async function fetchUserStats() {
    if (!currentUser) return
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', currentUser.id)
      .single()
    if (!profile) return

    const [{ count: followers }, { count: following }, { count: postsCount }] = await Promise.all([
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profile.id),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profile.id),
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', profile.id),
    ])

    setUserStats({
      followers: followers || 0,
      following: following || 0,
      posts: postsCount || 0,
    })
  }

  async function fetchPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(id, username, name, avatar_url, is_premium)')
      .order('created_at', { ascending: false })
    if (error) console.error('Error fetching posts:', error)
    else setPosts(data || [])
    setLoading(false)
  }

  async function fetchTrendingCreators() {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, username, name, avatar_url, is_premium')
      .limit(15)
    if (error) return

    const profilesWithCounts = await Promise.all(
      profiles.map(async (p) => {
        const { count } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', p.id)
        return { ...p, followers_count: count || 0 }
      })
    )

    const sorted = profilesWithCounts
      .sort((a, b) => b.followers_count - a.followers_count)
      .slice(0, 5)
    setTrendingCreators(sorted)
  }

  const filteredPosts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    let list = posts.filter((post) => {
      const inTitle = (post.title || '').toLowerCase().includes(q)
      const inExcerpt = (post.excerpt || '').toLowerCase().includes(q)
      const inCreator = (post.profiles?.name || '').toLowerCase().includes(q)
      const matchesSearch = !q || inTitle || inExcerpt || inCreator
      const matchesCategory =
        selectedCategory === 'Semua' || post.category === selectedCategory
      return matchesSearch && matchesCategory
    })

    if (sortBy === 'trending') {
      list = [...list].sort(
        (a, b) => (b.trending_score || 0) - (a.trending_score || 0)
      )
    } else {
      list = [...list].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    }
    return list
  }, [posts, searchQuery, selectedCategory, sortBy])

  const trendingTopics = [
    { name: 'AI Workflow', count: '2.4K' },
    { name: 'Figma Tips', count: '1.8K' },
    { name: 'React Hooks', count: '3.2K' },
    { name: 'SEO Strategy', count: '1.5K' },
    { name: 'Notion Setup', count: '1.1K' },
  ]

  const currentSort = SORT_OPTIONS.find((s) => s.key === sortBy)

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* ================================================================
           * MAIN FEED
           * ============================================================== */}
          <main className="lg:col-span-8 min-w-0">
            {/* Sticky feed header */}
            <div className="sticky top-[76px] z-20 -mx-4 sm:-mx-6 lg:mx-0 px-4 sm:px-6 lg:px-0 bg-[#FAFAFA]/85 backdrop-blur-md pt-2 pb-4 mb-4 border-b border-[#E5E7EB] lg:border-b-0 lg:rounded-2xl lg:bg-transparent lg:backdrop-blur-none lg:static lg:py-0 lg:mb-6">
              {/* Title row */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-semibold text-[#111827] tracking-tight truncate">
                    {selectedCategory === 'Semua' ? 'Untuk kamu' : selectedCategory}
                  </h1>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    {filteredPosts.length} insight · diperbarui realtime
                  </p>
                </div>
                {currentUser && (
                  <Link to="/upload">
                    <button className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/25 transition-all">
                      <Icon name="plus" className="w-4 h-4" />
                      Buat Insight
                    </button>
                  </Link>
                )}
              </div>

              {/* Search + sort */}
              <div className="flex items-center gap-2 mb-3">
                <div className="relative flex-1">
                  <Icon name="search" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari insight, orang, atau topik..."
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-xl outline-none placeholder:text-[#9CA3AF] focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-md text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]"
                      aria-label="Bersihkan pencarian"
                    >
                      <Icon name="x" className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Sort dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setSortMenuOpen((v) => !v)}
                    onBlur={() => setTimeout(() => setSortMenuOpen(false), 150)}
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-[#E5E7EB] text-sm font-medium text-[#111827] hover:bg-[#F9FAFB] transition-colors"
                  >
                    <Icon name={currentSort.icon} className="w-4 h-4 text-[#6B7280]" />
                    <span className="hidden sm:inline">{currentSort.label}</span>
                    <Icon
                      name="chevron-down"
                      className={`w-4 h-4 text-[#6B7280] transition-transform ${sortMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <AnimatePresence>
                    {sortMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.12 }}
                        className="absolute right-0 mt-2 w-44 bg-white border border-[#E5E7EB] rounded-xl shadow-lg overflow-hidden z-10"
                      >
                        {SORT_OPTIONS.map((opt) => (
                          <button
                            key={opt.key}
                            onMouseDown={() => {
                              setSortBy(opt.key)
                              setSortMenuOpen(false)
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left transition-colors ${
                              sortBy === opt.key
                                ? 'bg-blue-50/60 text-[#3B82F6]'
                                : 'text-[#111827] hover:bg-[#F9FAFB]'
                            }`}
                          >
                            <Icon name={opt.icon} className="w-4 h-4" />
                            <span className="flex-1">{opt.label}</span>
                            {sortBy === opt.key && (
                              <Icon name="check" className="w-4 h-4" />
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Category chips */}
              <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5 -mx-1 px-1">
                {CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                        active
                          ? 'bg-[#111827] text-white border-[#111827]'
                          : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:text-[#111827] hover:border-[#3B82F6]/40'
                      }`}
                    >
                      {cat}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Feed body */}
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-5 bg-white border border-[#E5E7EB] rounded-2xl"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-[#F3F4F6] animate-pulse" />
                      <div className="space-y-2">
                        <div className="w-28 h-3 bg-[#F3F4F6] rounded animate-pulse" />
                        <div className="w-20 h-2.5 bg-[#F3F4F6] rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-3/4 h-4 bg-[#F3F4F6] rounded animate-pulse" />
                      <div className="w-full h-3 bg-[#F3F4F6] rounded animate-pulse" />
                      <div className="w-5/6 h-3 bg-[#F3F4F6] rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <EmptyState
                hasSearch={!!searchQuery || selectedCategory !== 'Semua'}
                currentUser={currentUser}
                onReset={() => {
                  setSearchQuery('')
                  setSelectedCategory('Semua')
                }}
              />
            ) : (
              <motion.div
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.04 } },
                }}
                className="space-y-4"
              >
                {filteredPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    variants={{
                      hidden: { opacity: 0, y: 8 },
                      show: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  >
                    <PostCard post={post} currentUser={currentUser} showAuthor />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </main>

          {/* ================================================================
           * RIGHT SIDEBAR (desktop only)
           * ============================================================== */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-[92px] space-y-4">
              {currentUser && (
                <UserMiniCard user={currentUser} stats={userStats} />
              )}

              <LeaderboardCard limit={5} />

              <AffiliateSection
                title="Tools rekomendasi"
                subtitle="Sponsored picks dari platform"
                layout="list"
                variant="compact"
                source={AFFILIATE_SOURCES.HOME_FEED}
                userId={currentUser?.id}
                limit={3}
                showSeeAll
                emptyHidden
              />

              <TrendingCreatorsCard
                creators={trendingCreators}
                currentUser={currentUser}
              />

              <TrendingTopicsCard topics={trendingTopics} />

              <SkillioPlusCard />
            </div>
          </aside>
        </div>
      </div>

      {/* Floating mobile create button */}
      {currentUser && (
        <Link
          to="/upload"
          className="sm:hidden fixed bottom-5 right-5 z-40"
          aria-label="Buat Insight"
        >
          <button className="w-14 h-14 rounded-full bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-xl shadow-blue-500/30 flex items-center justify-center transition-all active:scale-95">
            <Icon name="plus" className="w-6 h-6" />
          </button>
        </Link>
      )}
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Sidebar cards
 * ------------------------------------------------------------------------- */
function UserMiniCard({ user, stats }) {
  const username = user?.email?.split('@')[0] || 'User'
  const initial = user?.email?.charAt(0).toUpperCase() || 'U'

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg font-semibold shrink-0">
          {initial}
        </div>
        <div className="min-w-0">
          <Link to="/profile" className="text-sm font-semibold text-[#111827] hover:text-[#3B82F6] transition-colors block truncate">
            {username}
          </Link>
          <p className="text-xs text-[#6B7280] truncate">@{username}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#FAFAFA] border border-[#F3F4F6]">
        {[
          { label: 'Posts', value: stats.posts },
          { label: 'Pengikut', value: stats.followers },
          { label: 'Mengikuti', value: stats.following },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-base font-semibold text-[#111827]">
              {formatViews(s.value)}
            </div>
            <div className="text-[10px] text-[#6B7280] uppercase tracking-wide">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link to="/profile">
          <button className="w-full px-3 py-2 rounded-lg text-xs font-semibold text-[#111827] bg-[#F3F4F6] hover:bg-[#E5E7EB] transition-colors">
            Profil
          </button>
        </Link>
        <Link to="/saved">
          <button className="w-full px-3 py-2 rounded-lg text-xs font-semibold text-[#111827] bg-[#F3F4F6] hover:bg-[#E5E7EB] transition-colors">
            Tersimpan
          </button>
        </Link>
      </div>
    </div>
  )
}

function TrendingCreatorsCard({ creators, currentUser }) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center">
            <Icon name="users" className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-[#111827]">Rekomendasi untuk kamu</h3>
        </div>
        <Link to="/explore" className="text-xs text-[#3B82F6] font-medium hover:text-[#2563EB]">
          Semua
        </Link>
      </div>

      {creators.length === 0 ? (
        <p className="text-xs text-[#6B7280] text-center py-4">Belum ada anggota</p>
      ) : (
        <div className="space-y-3">
          {creators.map((c) => (
            <div key={c.id} className="flex items-center gap-3 min-w-0">
              <Link
                to={`/u/${c.username}`}
                className="flex items-center gap-3 min-w-0 flex-1 group"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-semibold shrink-0 overflow-hidden">
                  {c.avatar_url ? (
                    <img src={c.avatar_url} alt={c.name} className="w-full h-full object-cover" />
                  ) : (
                    c.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-sm font-semibold text-[#111827] truncate group-hover:text-[#3B82F6] transition-colors">
                      {c.name}
                    </span>
                    {c.is_premium && (
                      <span
                        title="Skillio+"
                        className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#3B82F6] text-white shrink-0"
                      >
                        <svg className="w-2 h-2" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z"/></svg>
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#6B7280] truncate">
                    {formatViews(c.followers_count)} pengikut
                  </div>
                </div>
              </Link>
              <FollowButton
                profileId={c.id}
                profileUsername={c.username}
                currentUser={currentUser}
                size="small"
                showCount={false}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TrendingTopicsCard({ topics }) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center">
          <Icon name="trending" className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-semibold text-[#111827]">Topik trending</h3>
      </div>

      <ul className="space-y-1">
        {topics.map((t, i) => (
          <li key={t.name}>
            <button className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-[#F9FAFB] transition-colors group">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-semibold text-[#9CA3AF] w-5">
                  0{i + 1}
                </span>
                <div className="flex items-center gap-1 text-sm text-[#111827] group-hover:text-[#3B82F6] transition-colors">
                  <Icon name="hash" className="w-3 h-3 text-[#9CA3AF]" />
                  <span className="font-medium">{t.name}</span>
                </div>
              </div>
              <span className="text-[11px] text-[#6B7280]">{t.count} posts</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SkillioPlusCard() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#111827] to-[#1F2937] rounded-2xl p-5 text-white">
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#3B82F6]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="relative">
        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/10 text-white text-[10px] font-semibold mb-3">
          <Icon name="sparkles" className="w-3 h-3" />
          Skillio+
        </div>
        <h4 className="text-base font-semibold mb-1.5">Unlock productivity tools</h4>
        <p className="text-xs text-white/70 leading-relaxed mb-4">
          AI assist, analytics detail, scheduled posting, dan badge verified untuk kamu yang serius.
        </p>
        <Link to="/premium">
          <button className="w-full px-3 py-2 rounded-lg text-xs font-semibold text-[#111827] bg-white hover:bg-[#F3F4F6] transition-colors">
            Coba Skillio+
          </button>
        </Link>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Empty state
 * ------------------------------------------------------------------------- */
function EmptyState({ hasSearch, currentUser, onReset }) {
  return (
    <div className="bg-white border border-dashed border-[#E5E7EB] rounded-2xl p-10 sm:p-14 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#3B82F6]/10 text-[#3B82F6] mb-4">
        <Icon name="sparkles" className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-[#111827] mb-2">
        {hasSearch ? 'Belum ada insight yang cocok' : 'Belum ada insight dibagikan'}
      </h3>
      <p className="text-sm text-[#6B7280] mb-6 max-w-sm mx-auto">
        {hasSearch
          ? 'Coba ubah kata kunci atau pilih kategori lain untuk temukan insight menarik.'
          : 'Jadilah yang pertama berbagi insight kreatif ke komunitas Skillio.'}
      </p>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {hasSearch ? (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-[#111827] bg-[#F3F4F6] hover:bg-[#E5E7EB] transition-colors"
          >
            <Icon name="x" className="w-4 h-4" />
            Reset filter
          </button>
        ) : null}
        {currentUser && (
          <Link to="/upload">
            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-sm shadow-blue-500/20 transition-colors">
              <Icon name="plus" className="w-4 h-4" />
              Mulai Berbagi Insight
            </button>
          </Link>
        )}
      </div>
    </div>
  )
}

export default Home
