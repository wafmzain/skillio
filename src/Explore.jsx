import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from './services/supabaseClient'
import PostCard from './PostCard'
import FollowButton from './FollowButton'
import { formatViews } from './utils/formatViews'
import LeaderboardCard from './components/reputation/LeaderboardCard'
import AffiliateSection from './components/affiliate/AffiliateSection'
import { AFFILIATE_SOURCES } from './types/affiliate'
import { useInfiniteFeed } from './hooks/useInfiniteFeed'
import { FeedSentinel, PostCardSkeletonList } from './components/feed'

/* ---------------------------------------------------------------------------
 * Icons — minimal stroke set
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
    case 'heart':
      return <svg {...common}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6z"/></svg>
    case 'users':
      return <svg {...common}><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M21 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13A4 4 0 0 1 16 11"/></svg>
    case 'sparkles':
      return <svg {...common}><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z"/></svg>
    case 'chevron-down':
      return <svg {...common}><path d="M6 9l6 6 6-6"/></svg>
    case 'x':
      return <svg {...common}><path d="M18 6L6 18M6 6l12 12"/></svg>
    case 'check':
      return <svg {...common}><path d="M20 6L9 17l-5-5"/></svg>
    case 'hash':
      return <svg {...common}><path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"/></svg>
    case 'arrow-right':
      return <svg {...common}><path d="M5 12h14M13 5l7 7-7 7"/></svg>
    case 'compass':
      return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5L13.5 13.5 8.5 15.5 10.5 10.5 15.5 8.5z"/></svg>
    case 'message':
      return <svg {...common}><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z"/></svg>
    case 'eye':
      return <svg {...common}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
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
  'Productivity',
  'Marketing',
  'AI Tools',
  'Freelancing',
  'Video Editing',
  'Content Creator',
]

const SORT_OPTIONS = [
  { key: 'trending', label: 'Trending', icon: 'trending' },
  { key: 'latest', label: 'Terbaru', icon: 'clock' },
  { key: 'popular', label: 'Populer', icon: 'heart' },
]

/* ---------------------------------------------------------------------------
 * Explore
 * ------------------------------------------------------------------------- */
function Explore() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [currentUser, setCurrentUser] = useState(null)
  const [highlightPool, setHighlightPool] = useState([])  // small fixed slice for trending highlights + counts
  const [creators, setCreators] = useState([])

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery.trim())
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('cat') || 'Semua')
  const [sortBy, setSortBy] = useState(searchParams.get('tab') || 'trending')
  const [sortMenuOpen, setSortMenuOpen] = useState(false)

  /* Debounce search term so typing doesn't fire a query per keystroke. */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 280)
    return () => clearTimeout(t)
  }, [searchQuery])

  /* Paginated main feed. */
  const feed = useInfiniteFeed({
    pageSize: 12,
    category: selectedCategory,
    sort: sortBy,
    search: debouncedSearch,
  })

  /* --------------------------------- data ------------------------------- */
  useEffect(() => {
    getCurrentUser()
    fetchHighlights()
    fetchCreators()
  }, [])

  // Keep URL in sync with tab for deep-linking
  useEffect(() => {
    const params = {}
    if (sortBy !== 'trending') params.tab = sortBy
    if (selectedCategory !== 'Semua') params.cat = selectedCategory
    if (searchQuery) params.q = searchQuery
    setSearchParams(params, { replace: true })
  }, [sortBy, selectedCategory, searchQuery, setSearchParams])

  async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  /**
   * Small hot pool used by the trending highlights, category counts, and
   * sidebar widgets. The main grid is paginated separately by the hook so
   * we only ship a thin slice (40 rows) for the at-a-glance widgets.
   */
  async function fetchHighlights() {
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, excerpt, category, thumbnail_url, trending_score, likes_count, comments_count, bookmarks_count, views_count, created_at, user_id, is_premium, profiles!inner(id, username, name, avatar_url, is_premium)')
      .order('trending_score', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(40)
    if (!error) setHighlightPool(data || [])
  }

  async function fetchCreators() {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, username, name, avatar_url, is_premium, bio')
      .order('points', { ascending: false, nullsFirst: false })
      .limit(20)
    if (error || !profiles) return

    const enriched = await Promise.all(
      profiles.map(async (p) => {
        const [{ count: followers }, { count: postsCount }] = await Promise.all([
          supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', p.id),
          supabase.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', p.id),
        ])
        return {
          ...p,
          followers_count: followers || 0,
          posts_count: postsCount || 0,
        }
      })
    )
    const sorted = enriched.sort((a, b) => b.followers_count - a.followers_count)
    setCreators(sorted)
  }

  /* Stable callbacks for the memoized PostCard. */
  const handlePostDeleted = useCallback(() => feed.refresh(), [feed])

  /* ------------------------------ derived data ------------------------------ */
  // Trending highlight: top items from the hot pool.
  const trendingPosts = useMemo(() => {
    return [...highlightPool]
      .sort(
        (a, b) =>
          (b.trending_score || 0) + (b.likes_count || 0) * 0.3 -
          ((a.trending_score || 0) + (a.likes_count || 0) * 0.3)
      )
      .slice(0, 4)
  }, [highlightPool])

  // Category counts derived from the hot pool — close enough to feel real
  // without requiring a full scan.
  const categoryCounts = useMemo(() => {
    const map = {}
    highlightPool.forEach((p) => {
      if (p.category) map[p.category] = (map[p.category] || 0) + 1
    })
    return map
  }, [highlightPool])

  const topCreators = creators.slice(0, 5)
  const spotlightCreators = creators.slice(0, 4)
  const currentSort = SORT_OPTIONS.find((s) => s.key === sortBy) || SORT_OPTIONS[0]
  const hasFilter = !!searchQuery || selectedCategory !== 'Semua'

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* =====================================================================
       * HERO HEADER
       * ===================================================================*/}
      <header className="relative overflow-hidden border-b border-[#E5E7EB] bg-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 left-1/4 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-blue-50/60 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 pt-10 pb-8 lg:pt-14 lg:pb-10">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-semibold mb-4">
              <Icon name="compass" className="w-3.5 h-3.5" />
              Discovery
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight leading-tight mb-3">
              Jelajahi Insight & Inspirasi
            </h1>
            <p className="text-base text-[#6B7280] leading-relaxed">
              Temukan ide, pengalaman, dan insight terbaik dari komunitas.
            </p>
          </motion.div>

          {/* Search + sort row */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.08 }}
            className="mt-6 flex items-center gap-2 max-w-3xl"
          >
            <div className="relative flex-1">
              <Icon
                name="search"
                className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari insight, orang, atau topik..."
                className="w-full pl-11 pr-10 py-3 text-sm bg-white border border-[#E5E7EB] rounded-full outline-none placeholder:text-[#9CA3AF] focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]"
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
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-full bg-white border border-[#E5E7EB] text-sm font-medium text-[#111827] hover:bg-[#F9FAFB] transition-colors"
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
                    className="absolute right-0 mt-2 w-44 bg-white border border-[#E5E7EB] rounded-xl shadow-lg overflow-hidden z-20"
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
                        {sortBy === opt.key && <Icon name="check" className="w-4 h-4" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Category chips */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.15 }}
            className="mt-5 flex gap-2 overflow-x-auto scrollbar-none pb-0.5 -mx-1 px-1"
          >
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat
              const count = cat === 'Semua' ? posts.length : categoryCounts[cat] || 0
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 border ${
                    active
                      ? 'bg-[#3B82F6] text-white border-[#3B82F6] shadow-sm shadow-blue-500/20'
                      : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:text-[#111827] hover:border-[#3B82F6]/40'
                  }`}
                >
                  <span>{cat}</span>
                  {count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        active ? 'bg-white/20 text-white' : 'bg-[#F3F4F6] text-[#6B7280]'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </motion.div>
        </div>
      </header>

      {/* =====================================================================
       * MAIN GRID
       * ===================================================================*/}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* MAIN COLUMN */}
          <main className="lg:col-span-8 min-w-0 space-y-10">
            {/* ===== Trending highlights (only when no filter) ===== */}
            {!hasFilter && trendingPosts.length > 0 && (
              <TrendingHighlights
                posts={trendingPosts}
                currentUser={currentUser}
              />
            )}

            {/* ===== Creator spotlight (only when no filter) ===== */}
            {!hasFilter && spotlightCreators.length > 0 && !loading && (
              <CreatorSpotlight
                creators={spotlightCreators}
                currentUser={currentUser}
              />
            )}

            {/* ===== Main feed ===== */}
            <section>
              <SectionHeading
                icon="compass"
                title={
                  hasFilter
                    ? searchQuery
                      ? `Hasil untuk "${searchQuery}"`
                      : selectedCategory
                    : 'Semua Insight'
                }
                subtitle={
                  feed.loading
                    ? 'Memuat insight…'
                    : `${feed.posts.length}${feed.hasMore ? '+' : ''} insight ditemukan`
                }
              />

              {feed.loading ? (
                <PostGridSkeleton />
              ) : feed.posts.length === 0 ? (
                <EmptyState
                  onReset={() => {
                    setSearchQuery('')
                    setSelectedCategory('Semua')
                  }}
                />
              ) : (
                <>
                  <motion.div
                    initial="hidden"
                    animate="show"
                    variants={{
                      hidden: {},
                      show: { transition: { staggerChildren: 0.04 } },
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {feed.posts.map((post) => (
                      <motion.div
                        key={post.id}
                        variants={{
                          hidden: { opacity: 0, y: 8 },
                          show: { opacity: 1, y: 0 },
                        }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                      >
                        <PostCard
                          post={post}
                          currentUser={currentUser}
                          showAuthor
                          onDelete={handlePostDeleted}
                        />
                      </motion.div>
                    ))}
                  </motion.div>

                  <FeedSentinel
                    loaderRef={feed.loaderRef}
                    hasMore={feed.hasMore}
                    loading={feed.loadingMore}
                  />
                </>
              )}
            </section>
          </main>

          {/* RIGHT SIDEBAR */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-[92px] space-y-4">
              <LeaderboardCard limit={5} />

              <AffiliateSection
                title="Tools rekomendasi"
                subtitle="Sponsored picks dari platform"
                layout="list"
                variant="compact"
                source={AFFILIATE_SOURCES.SIDEBAR}
                userId={currentUser?.id}
                limit={3}
                showSeeAll
                emptyHidden
              />

              <TrendingCategoriesCard
                counts={categoryCounts}
                selectedCategory={selectedCategory}
                onSelect={setSelectedCategory}
              />

              <RecommendedCreatorsCard
                creators={topCreators}
                currentUser={currentUser}
              />

              <TopInsightsCard posts={trendingPosts.slice(0, 5)} />

              <SkillioPlusCard />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Reusable pieces
 * ------------------------------------------------------------------------- */
function SectionHeading({ icon, title, subtitle, action }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {icon && (
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6]">
              <Icon name={icon} className="w-4 h-4" />
            </span>
          )}
          <h2 className="text-lg sm:text-xl font-semibold text-[#111827] tracking-tight truncate">
            {title}
          </h2>
        </div>
        {subtitle && <p className="text-xs text-[#6B7280] ml-9">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

function TrendingHighlights({ posts, currentUser }) {
  return (
    <section>
      <SectionHeading
        icon="trending"
        title="Trending Insights"
        subtitle="Yang lagi dibicarain komunitas minggu ini"
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.slice(0, 6).map((post, i) => (
          <TrendingCard key={post.id} post={post} rank={String(i + 1).padStart(2, '0')} />
        ))}
      </div>
    </section>
  )
}

function TrendingCard({ post, rank }) {
  const author = post.profiles
  return (
    <Link
      to={`/post/${post.id}`}
      className="group block p-5 bg-white border border-[#E5E7EB] rounded-2xl hover:border-[#3B82F6]/30 hover:shadow-[0_8px_30px_-8px_rgba(59,130,246,0.15)] hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-2xl font-bold text-[#E5E7EB] group-hover:text-[#3B82F6] transition-colors">
          {rank}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-[#3B82F6] font-medium">
          <Icon name="trending" className="w-3.5 h-3.5" />
          Trending
        </span>
      </div>
      <h3 className="text-base font-semibold text-[#111827] leading-snug mb-3 line-clamp-2 group-hover:text-[#3B82F6] transition-colors">
        {post.title}
      </h3>
      {author && (
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden shrink-0">
            {author.avatar_url ? (
              <img src={author.avatar_url} alt={author.name} className="w-full h-full object-cover" />
            ) : (
              author.name?.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-[#111827] truncate">{author.name}</div>
            <div className="text-[11px] text-[#6B7280] truncate">@{author.username}</div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between pt-3 border-t border-[#F3F4F6]">
        {post.category && (
          <span className="text-[11px] font-medium text-[#6B7280]">{post.category}</span>
        )}
        <div className="flex items-center gap-3 text-[11px] text-[#6B7280]">
          <span className="flex items-center gap-1"><Icon name="heart" className="w-3 h-3" /> {formatViews(post.likes_count || 0)}</span>
          <span className="flex items-center gap-1"><Icon name="message" className="w-3 h-3" /> {formatViews(post.comments_count || 0)}</span>
        </div>
      </div>
    </Link>
  )
}

function CreatorSpotlight({ creators, currentUser }) {
  return (
    <section>
      <SectionHeading
        icon="users"
        title="Anggota Populer"
        subtitle="Orang yang lagi aktif berbagi di komunitas"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {creators.map((c) => (
          <div
            key={c.id}
            className="group flex items-center gap-3 p-4 bg-white border border-[#E5E7EB] rounded-2xl hover:border-[#3B82F6]/30 hover:shadow-[0_6px_20px_-8px_rgba(59,130,246,0.15)] hover:-translate-y-0.5 transition-all duration-200"
          >
            <Link
              to={`/u/${c.username}`}
              className="flex items-center gap-3 min-w-0 flex-1"
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
                  {c.avatar_url ? (
                    <img src={c.avatar_url} alt={c.name} className="w-full h-full object-cover" />
                  ) : (
                    c.name?.charAt(0).toUpperCase()
                  )}
                </div>
                {c.is_premium && (
                  <span
                    title="Skillio+"
                    className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#3B82F6] text-white flex items-center justify-center ring-2 ring-white"
                  >
                    <svg className="w-2 h-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z" />
                    </svg>
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-[#111827] truncate group-hover:text-[#3B82F6] transition-colors">
                  {c.name}
                </div>
                <div className="text-[11px] text-[#6B7280] truncate">
                  @{c.username} · {formatViews(c.followers_count)} pengikut
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
    </section>
  )
}

/* ---------------------------------------------------------------------------
 * Sidebar
 * ------------------------------------------------------------------------- */
function TrendingCategoriesCard({ counts, selectedCategory, onSelect }) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6)

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6]">
          <Icon name="hash" className="w-4 h-4" />
        </span>
        <h3 className="text-sm font-semibold text-[#111827]">Kategori trending</h3>
      </div>

      {entries.length === 0 ? (
        <p className="text-xs text-[#6B7280] text-center py-4">Belum ada data</p>
      ) : (
        <ul className="space-y-1">
          {entries.map(([cat, count], i) => {
            const active = selectedCategory === cat
            return (
              <li key={cat}>
                <button
                  onClick={() => onSelect(cat)}
                  className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg transition-colors ${
                    active
                      ? 'bg-[#3B82F6]/10 text-[#3B82F6]'
                      : 'hover:bg-[#F9FAFB] text-[#111827]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-semibold text-[#9CA3AF] w-5">
                      0{i + 1}
                    </span>
                    <span className="text-sm font-medium truncate">{cat}</span>
                  </div>
                  <span className="text-[11px] text-[#6B7280] shrink-0">
                    {count} post
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function RecommendedCreatorsCard({ creators, currentUser }) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6]">
            <Icon name="users" className="w-4 h-4" />
          </span>
          <h3 className="text-sm font-semibold text-[#111827]">Rekomendasi orang</h3>
        </div>
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
                    c.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-[#111827] truncate group-hover:text-[#3B82F6] transition-colors">
                      {c.name}
                    </span>
                    {c.is_premium && (
                      <span
                        title="Skillio+"
                        className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#3B82F6] text-white shrink-0"
                      >
                        <svg className="w-2 h-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#6B7280] truncate">
                    {formatViews(c.followers_count)} pengikut · {c.posts_count} post
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

function TopInsightsCard({ posts }) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6]">
          <Icon name="sparkles" className="w-4 h-4" />
        </span>
        <h3 className="text-sm font-semibold text-[#111827]">Top insights</h3>
      </div>

      {posts.length === 0 ? (
        <p className="text-xs text-[#6B7280] text-center py-4">Belum ada insight</p>
      ) : (
        <ul className="space-y-1">
          {posts.map((post, i) => (
            <li key={post.id}>
              <Link
                to={`/post/${post.id}`}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#F9FAFB] transition-colors group"
              >
                <span className="text-sm font-bold text-[#E5E7EB] group-hover:text-[#3B82F6] transition-colors w-5 shrink-0 text-center">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-semibold text-[#111827] line-clamp-2 leading-snug group-hover:text-[#3B82F6] transition-colors">
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-[#6B7280]">
                    {post.profiles && (
                      <>
                        <span className="truncate">@{post.profiles.username}</span>
                        <span className="w-0.5 h-0.5 rounded-full bg-[#9CA3AF]" />
                      </>
                    )}
                    <span className="inline-flex items-center gap-0.5 shrink-0">
                      <Icon name="heart" className="w-2.5 h-2.5" />
                      {formatViews(post.likes_count || 0)}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
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
        <h4 className="text-base font-semibold mb-1.5">Discover lebih banyak</h4>
        <p className="text-xs text-white/70 leading-relaxed mb-4">
          Akses analytics insight, AI assist, dan rekomendasi personal untuk temukan insight yang relevan.
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
 * States: skeleton + empty
 * ------------------------------------------------------------------------- */
function PostGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-5 bg-white border border-[#E5E7EB] rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#F3F4F6] animate-pulse" />
            <div className="space-y-2">
              <div className="w-28 h-3 bg-[#F3F4F6] rounded animate-pulse" />
              <div className="w-20 h-2.5 bg-[#F3F4F6] rounded animate-pulse" />
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="w-3/4 h-4 bg-[#F3F4F6] rounded animate-pulse" />
            <div className="w-full h-3 bg-[#F3F4F6] rounded animate-pulse" />
            <div className="w-5/6 h-3 bg-[#F3F4F6] rounded animate-pulse" />
          </div>
          <div className="w-full aspect-[16/9] bg-[#F3F4F6] rounded-xl animate-pulse" />
        </div>
      ))}
    </div>
  )
}

function EmptyState({ onReset }) {
  return (
    <div className="bg-white border border-dashed border-[#E5E7EB] rounded-2xl p-10 sm:p-14 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#3B82F6]/10 text-[#3B82F6] mb-4">
        <Icon name="compass" className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-[#111827] mb-2">
        Belum ada insight ditemukan
      </h3>
      <p className="text-sm text-[#6B7280] mb-6 max-w-sm mx-auto">
        Coba ubah filter atau jelajahi topik lain untuk temukan insight menarik.
      </p>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-[#111827] bg-[#F3F4F6] hover:bg-[#E5E7EB] transition-colors"
        >
          <Icon name="x" className="w-4 h-4" />
          Reset filter
        </button>
        <Link to="/home">
          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-sm shadow-blue-500/20 transition-colors">
            <Icon name="users" className="w-4 h-4" />
            Jelajahi Komunitas
            <Icon name="arrow-right" className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </div>
  )
}

export default Explore
