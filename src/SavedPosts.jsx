import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from './services/supabaseClient'
import PostCard from './PostCard'
import FollowButton from './FollowButton'
import { formatViews } from './utils/formatViews'

/* ---------------------------------------------------------------------------
 * Icons
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
    case 'bookmark':
      return <svg {...common}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
    case 'bookmark-filled':
      return <svg {...common} fill="currentColor"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
    case 'trending':
      return <svg {...common}><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>
    case 'clock':
      return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
    case 'heart':
      return <svg {...common}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6z"/></svg>
    case 'share':
      return <svg {...common}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>
    case 'external':
      return <svg {...common}><path d="M15 3h6v6M10 14L21 3M21 14v7H3V3h7"/></svg>
    case 'trash':
      return <svg {...common}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/></svg>
    case 'user':
      return <svg {...common}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
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
    case 'library':
      return <svg {...common}><path d="M4 4h4v16H4zM10 4h4v16h-4zM16 4l4 16"/></svg>
    case 'arrow-right':
      return <svg {...common}><path d="M5 12h14M13 5l7 7-7 7"/></svg>
    case 'more':
      return <svg {...common}><circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/></svg>
    default:
      return null
  }
}

/* ---------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------- */
function timeAgo(iso) {
  if (!iso) return ''
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'baru saja'
  if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`
  if (diff < 86400) return `${Math.floor(diff / 3600)}j lalu`
  if (diff < 2592000) return `${Math.floor(diff / 86400)}h lalu`
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}bl lalu`
  return `${Math.floor(diff / 31536000)}th lalu`
}

const CATEGORIES = [
  'Semua',
  'Design',
  'Programming',
  'Productivity',
  'Marketing',
  'AI Tools',
  'Freelancing',
]

const SORT_OPTIONS = [
  { key: 'saved', label: 'Baru disimpan', icon: 'bookmark' },
  { key: 'latest', label: 'Terbaru', icon: 'clock' },
  { key: 'trending', label: 'Trending', icon: 'trending' },
  { key: 'popular', label: 'Populer', icon: 'heart' },
]

/* ---------------------------------------------------------------------------
 * SavedPosts
 * ------------------------------------------------------------------------- */
function SavedPosts() {
  const [savedPosts, setSavedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [sortBy, setSortBy] = useState('saved')
  const [sortMenuOpen, setSortMenuOpen] = useState(false)

  const [favoriteCreators, setFavoriteCreators] = useState([])
  const [recommendedPosts, setRecommendedPosts] = useState([])

  useEffect(() => {
    loadSavedPosts()
  }, [])

  async function loadSavedPosts() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      setCurrentUser(user)

      const { data, error } = await supabase
        .from('post_bookmarks')
        .select('*, posts(*, profiles(id, username, name, avatar_url, is_premium))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) {
        const posts = data
          .filter((b) => b.posts)
          .map((b) => ({ ...b.posts, saved_at: b.created_at }))
        setSavedPosts(posts)

        // Compute "favorite creators" from saved posts (most-saved first)
        const counts = {}
        posts.forEach((p) => {
          const prof = p.profiles
          if (!prof?.id) return
          if (!counts[prof.id]) counts[prof.id] = { ...prof, count: 0 }
          counts[prof.id].count += 1
        })
        const topCreators = Object.values(counts)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
        setFavoriteCreators(topCreators)

        // Fetch a light recommendation list for the sidebar
        fetchRecommendedPosts(user.id)
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchRecommendedPosts(userId) {
    const { data } = await supabase
      .from('posts')
      .select('id, title, category, likes_count, trending_score, profiles(username, name)')
      .order('trending_score', { ascending: false, nullsFirst: false })
      .limit(8)
    if (data) {
      // Exclude posts the user already saved
      const savedIds = new Set(savedPosts.map((p) => p.id))
      const filtered = data.filter((p) => !savedIds.has(p.id)).slice(0, 5)
      setRecommendedPosts(filtered)
    }
  }

  async function handleRemoveSaved(postId) {
    if (!currentUser) return
    // Optimistic
    const prev = savedPosts
    setSavedPosts((list) => list.filter((p) => p.id !== postId))
    try {
      const { error } = await supabase
        .from('post_bookmarks')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('post_id', postId)
      if (error) throw error
    } catch (err) {
      console.error('Remove bookmark error:', err)
      setSavedPosts(prev) // revert
    }
  }

  async function handleShare(post) {
    const url = `${window.location.origin}/post/${post.id}`
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, url })
      } else {
        await navigator.clipboard.writeText(url)
        // Minimal visual feedback: could be replaced with a toast system
        alert('Link disalin ke clipboard')
      }
    } catch {
      /* user cancelled */
    }
  }

  /* ----------------------------- derived data ---------------------------- */
  const filteredPosts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    let list = savedPosts.filter((post) => {
      const inTitle = (post.title || '').toLowerCase().includes(q)
      const inExcerpt = (post.excerpt || '').toLowerCase().includes(q)
      const inCreator = (post.profiles?.name || '').toLowerCase().includes(q)
      const inUsername = (post.profiles?.username || '').toLowerCase().includes(q)
      const matchesSearch = !q || inTitle || inExcerpt || inCreator || inUsername
      const matchesCategory =
        selectedCategory === 'Semua' || post.category === selectedCategory
      return matchesSearch && matchesCategory
    })

    switch (sortBy) {
      case 'latest':
        list = [...list].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        break
      case 'trending':
        list = [...list].sort(
          (a, b) => (b.trending_score || 0) - (a.trending_score || 0)
        )
        break
      case 'popular':
        list = [...list].sort(
          (a, b) => (b.likes_count || 0) - (a.likes_count || 0)
        )
        break
      case 'saved':
      default:
        list = [...list].sort(
          (a, b) => new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime()
        )
    }
    return list
  }, [savedPosts, searchQuery, selectedCategory, sortBy])

  const categoryCounts = useMemo(() => {
    const map = {}
    savedPosts.forEach((p) => {
      if (p.category) map[p.category] = (map[p.category] || 0) + 1
    })
    return map
  }, [savedPosts])

  const currentSort = SORT_OPTIONS.find((s) => s.key === sortBy) || SORT_OPTIONS[0]
  const hasFilter = !!searchQuery || selectedCategory !== 'Semua'

  /* ------------------------------ guards --------------------------------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 lg:py-10">
          <LoadingSkeleton />
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] mb-4">
            <Icon name="bookmark" className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-[#111827] mb-2">
            Login untuk melihat koleksi
          </h2>
          <p className="text-sm text-[#6B7280] mb-6">
            Masuk ke akun kamu untuk mengakses insight yang sudah disimpan.
          </p>
          <Link to="/login">
            <button className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-sm shadow-blue-500/20 transition-colors">
              Login sekarang
              <Icon name="arrow-right" className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* =====================================================================
       * HEADER
       * ===================================================================*/}
      <header className="relative overflow-hidden border-b border-[#E5E7EB] bg-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 left-1/3 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 right-1/4 w-96 h-96 bg-blue-50/60 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 pt-10 pb-8 lg:pt-14 lg:pb-10">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex items-start justify-between gap-4 flex-wrap"
          >
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-semibold mb-4">
                <Icon name="library" className="w-3.5 h-3.5" />
                Personal Library
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight leading-tight mb-2">
                Tersimpan
              </h1>
              <p className="text-base text-[#6B7280] leading-relaxed max-w-xl">
                Kumpulan insight dan inspirasi yang kamu simpan.
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3">
              <StatChip
                label="Tersimpan"
                value={savedPosts.length}
                icon="bookmark-filled"
                accent
              />
              <StatChip
                label="Kategori"
                value={Object.keys(categoryCounts).length}
                icon="hash"
              />
              <StatChip
                label="Orang"
                value={favoriteCreators.length}
                icon="users"
              />
            </div>
          </motion.div>

          {savedPosts.length > 0 && (
            <>
              {/* Search + Sort */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut', delay: 0.08 }}
                className="mt-6 flex items-center gap-2 max-w-3xl"
              >
                <div className="relative flex-1">
                  <Icon name="search" className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari insight tersimpan..."
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
                        className="absolute right-0 mt-2 w-48 bg-white border border-[#E5E7EB] rounded-xl shadow-lg overflow-hidden z-20"
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
                  const count = cat === 'Semua' ? savedPosts.length : categoryCounts[cat] || 0
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
            </>
          )}
        </div>
      </header>

      {/* =====================================================================
       * BODY
       * ===================================================================*/}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 lg:py-10">
        {savedPosts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* MAIN FEED */}
            <main className="lg:col-span-8 min-w-0">
              {/* Inline heading */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-[#111827]">
                    {hasFilter
                      ? searchQuery
                        ? `Hasil untuk "${searchQuery}"`
                        : selectedCategory
                      : 'Semua insight tersimpan'}
                  </h2>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    {filteredPosts.length} dari {savedPosts.length} insight
                  </p>
                </div>
                {hasFilter && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedCategory('Semua')
                    }}
                    className="text-xs font-medium text-[#3B82F6] hover:text-[#2563EB]"
                  >
                    Reset filter
                  </button>
                )}
              </div>

              {filteredPosts.length === 0 ? (
                <NoResultsState
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
                  <AnimatePresence>
                    {filteredPosts.map((post) => (
                      <motion.div
                        key={post.id}
                        layout
                        variants={{
                          hidden: { opacity: 0, y: 8 },
                          show: { opacity: 1, y: 0 },
                        }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                      >
                        <SavedPostItem
                          post={post}
                          currentUser={currentUser}
                          onRemove={() => handleRemoveSaved(post.id)}
                          onShare={() => handleShare(post)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </main>

            {/* RIGHT SIDEBAR */}
            <aside className="hidden lg:block lg:col-span-4">
              <div className="sticky top-[92px] space-y-4">
                <FavoriteCreatorsCard
                  creators={favoriteCreators}
                  currentUser={currentUser}
                />
                <TrendingCategoriesCard
                  counts={categoryCounts}
                  selectedCategory={selectedCategory}
                  onSelect={setSelectedCategory}
                />
                <RecommendedCard posts={recommendedPosts} />
                <SkillioPlusCard />
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Saved post item — PostCard + saved meta + quick actions
 * ------------------------------------------------------------------------- */
function SavedPostItem({ post, currentUser, onRemove, onShare }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="relative">
      {/* Saved meta bar */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="inline-flex items-center gap-1.5 text-xs text-[#6B7280]">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#3B82F6]/10 text-[#3B82F6] font-semibold">
            <Icon name="bookmark-filled" className="w-3 h-3" />
            Tersimpan
          </span>
          <span className="text-[#9CA3AF]">·</span>
          <span>{timeAgo(post.saved_at)}</span>
        </div>

        <div className="flex items-center gap-0.5">
          <Link
            to={`/post/${post.id}`}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:text-[#3B82F6] hover:bg-[#3B82F6]/10 transition-colors"
            title="Buka insight"
            aria-label="Buka insight"
          >
            <Icon name="external" className="w-4 h-4" />
          </Link>
          <button
            onClick={onShare}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:text-[#3B82F6] hover:bg-[#3B82F6]/10 transition-colors"
            title="Bagikan"
            aria-label="Bagikan"
          >
            <Icon name="share" className="w-4 h-4" />
          </button>

          {post.profiles?.username && (
            <Link
              to={`/u/${post.profiles.username}`}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:text-[#3B82F6] hover:bg-[#3B82F6]/10 transition-colors"
              title="Profil pengguna"
              aria-label="Buka profil pengguna"
            >
              <Icon name="user" className="w-4 h-4" />
            </Link>
          )}

          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
              aria-label="Aksi lain"
            >
              <Icon name="more" className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 mt-2 w-44 bg-white border border-[#E5E7EB] rounded-xl shadow-lg overflow-hidden z-10"
                >
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault()
                      setMenuOpen(false)
                      onRemove()
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left text-[#EF4444] hover:bg-red-50 transition-colors"
                  >
                    <Icon name="trash" className="w-4 h-4" />
                    Hapus dari koleksi
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <PostCard post={post} currentUser={currentUser} showAuthor />
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Header stats
 * ------------------------------------------------------------------------- */
function StatChip({ label, value, icon, accent = false }) {
  return (
    <div
      className={`inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl border ${
        accent
          ? 'bg-[#3B82F6]/10 border-[#3B82F6]/20 text-[#3B82F6]'
          : 'bg-white border-[#E5E7EB] text-[#111827]'
      }`}
    >
      <span
        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg ${
          accent ? 'bg-white text-[#3B82F6]' : 'bg-[#F3F4F6] text-[#6B7280]'
        }`}
      >
        <Icon name={icon} className="w-3.5 h-3.5" />
      </span>
      <div>
        <div className={`text-base font-semibold leading-none ${accent ? 'text-[#3B82F6]' : 'text-[#111827]'}`}>
          {formatViews(value)}
        </div>
        <div className={`text-[10px] uppercase tracking-wider mt-0.5 ${accent ? 'text-[#3B82F6]/70' : 'text-[#6B7280]'}`}>
          {label}
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Sidebar cards
 * ------------------------------------------------------------------------- */
function FavoriteCreatorsCard({ creators, currentUser }) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6]">
          <Icon name="users" className="w-4 h-4" />
        </span>
        <h3 className="text-sm font-semibold text-[#111827]">Orang favorit</h3>
      </div>

      {creators.length === 0 ? (
        <p className="text-xs text-[#6B7280] text-center py-4">
          Simpan insight untuk mulai membangun daftar favoritmu.
        </p>
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
                    {c.count} insight disimpan
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

function TrendingCategoriesCard({ counts, selectedCategory, onSelect }) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6)

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6]">
          <Icon name="hash" className="w-4 h-4" />
        </span>
        <h3 className="text-sm font-semibold text-[#111827]">Kategori tersimpan</h3>
      </div>

      {entries.length === 0 ? (
        <p className="text-xs text-[#6B7280] text-center py-4">Belum ada kategori</p>
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
                  <span className="text-[11px] text-[#6B7280] shrink-0">{count}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function RecommendedCard({ posts }) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6]">
            <Icon name="sparkles" className="w-4 h-4" />
          </span>
          <h3 className="text-sm font-semibold text-[#111827]">Rekomendasi untukmu</h3>
        </div>
        <Link to="/explore" className="text-xs text-[#3B82F6] font-medium hover:text-[#2563EB]">
          Semua
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-xs text-[#6B7280] text-center py-4">Belum ada rekomendasi</p>
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
        <h4 className="text-base font-semibold mb-1.5">Koleksi tanpa batas</h4>
        <p className="text-xs text-white/70 leading-relaxed mb-4">
          Atur koleksi ke beberapa board, tambah catatan pribadi, dan dapatkan rekomendasi berbasis AI dari insight yang kamu simpan.
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
 * Empty + loading states
 * ------------------------------------------------------------------------- */
function EmptyState() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-dashed border-[#E5E7EB] rounded-2xl p-10 sm:p-14 text-center">
        {/* Minimal illustration */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-2xl bg-[#3B82F6]/10" />
          <div className="absolute inset-0 flex items-center justify-center text-[#3B82F6]">
            <Icon name="bookmark" className="w-8 h-8" />
          </div>
          <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[#3B82F6]">
            <Icon name="sparkles" className="w-2.5 h-2.5" />
          </div>
          <div className="absolute -bottom-1 -left-2 w-4 h-4 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[#3B82F6]">
            <Icon name="heart" className="w-2 h-2" />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-[#111827] mb-2">
          Belum Ada Insight Tersimpan
        </h2>
        <p className="text-sm text-[#6B7280] leading-relaxed mb-8 max-w-md mx-auto">
          Simpan insight menarik untuk dibaca kembali nanti. Koleksi kamu akan muncul di sini.
        </p>

        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Link to="/home">
            <button className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-sm shadow-blue-500/20 transition-colors">
              <Icon name="users" className="w-4 h-4" />
              Jelajahi Komunitas
              <Icon name="arrow-right" className="w-4 h-4" />
            </button>
          </Link>
          <Link to="/explore">
            <button className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#111827] bg-white border border-[#E5E7EB] hover:border-[#3B82F6]/40 transition-colors">
              Lihat Trending
            </button>
          </Link>
        </div>

        {/* Tip */}
        <div className="mt-8 pt-6 border-t border-[#E5E7EB]">
          <p className="text-xs text-[#6B7280]">
            Klik ikon{' '}
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#3B82F6]/10 text-[#3B82F6] align-middle">
              <Icon name="bookmark" className="w-3 h-3" />
            </span>{' '}
            di insight manapun untuk menyimpannya ke koleksi ini.
          </p>
        </div>
      </div>
    </div>
  )
}

function NoResultsState({ onReset }) {
  return (
    <div className="bg-white border border-dashed border-[#E5E7EB] rounded-2xl p-10 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#3B82F6]/10 text-[#3B82F6] mb-4">
        <Icon name="search" className="w-5 h-5" />
      </div>
      <h3 className="text-base font-semibold text-[#111827] mb-2">
        Tidak ada insight yang cocok
      </h3>
      <p className="text-sm text-[#6B7280] mb-5 max-w-sm mx-auto">
        Coba ubah kata kunci atau pilih kategori lain.
      </p>
      <button
        onClick={onReset}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-[#111827] bg-[#F3F4F6] hover:bg-[#E5E7EB] transition-colors"
      >
        <Icon name="x" className="w-4 h-4" />
        Reset filter
      </button>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="w-24 h-6 bg-[#F3F4F6] rounded-full animate-pulse" />
        <div className="w-48 h-8 bg-[#F3F4F6] rounded animate-pulse" />
        <div className="w-80 h-4 bg-[#F3F4F6] rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="lg:col-span-8 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-5 bg-white border border-[#E5E7EB] rounded-2xl">
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
              </div>
            </div>
          ))}
        </div>
        <div className="hidden lg:block lg:col-span-4 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-5 bg-white border border-[#E5E7EB] rounded-2xl h-40 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default SavedPosts
