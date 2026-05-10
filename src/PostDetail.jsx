import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from './services/supabaseClient'
import Comments from './Comments'
import FollowButton from './FollowButton'
import PremiumPaywall from './components/PremiumPaywall'
import AISummaryButton from './components/ai/AISummaryButton'
import AISummaryCard from './components/ai/AISummaryCard'
import AISummaryLoading from './components/ai/AISummaryLoading'
import AISummaryError from './components/ai/AISummaryError'
import { usePremium } from './hooks/usePremium'
import { upgradeToPremium } from './services/premiumService'
import { useAISummary } from './hooks/useAISummary'
import { usePostView } from './hooks/usePostView'
import { formatViews } from './utils/formatViews'

/* ---------------------------------------------------------------------------
 * Icons
 * ------------------------------------------------------------------------- */
const Icon = ({ name, className = 'w-4 h-4', filled = false }) => {
  const common = {
    className,
    viewBox: '0 0 24 24',
    fill: filled ? 'currentColor' : 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }
  switch (name) {
    case 'arrow-left':
      return <svg {...common}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
    case 'heart':
      return <svg {...common}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6z"/></svg>
    case 'bookmark':
      return <svg {...common}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
    case 'message':
      return <svg {...common}><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z"/></svg>
    case 'share':
      return <svg {...common}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>
    case 'eye':
      return <svg {...common}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
    case 'sparkles':
      return <svg {...common}><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z"/></svg>
    case 'trending':
      return <svg {...common}><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>
    case 'dot':
      return <svg {...common} fill="currentColor" stroke="none"><circle cx="12" cy="12" r="2"/></svg>
    case 'check':
      return <svg {...common}><path d="M20 6L9 17l-5-5"/></svg>
    case 'clock':
      return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
    case 'list':
      return <svg {...common}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
    case 'lock':
      return <svg {...common}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
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

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function readingTime(text) {
  if (!text) return 1
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

function extractHeadings(content) {
  if (!content) return []
  // Treat non-empty lines that are short and end without punctuation OR markdown-style # as potential section markers
  const lines = content.split('\n')
  const headings = []
  lines.forEach((raw, i) => {
    const line = raw.trim()
    if (!line) return
    if (/^#{1,3}\s+/.test(line)) {
      headings.push({
        id: `section-${i}`,
        text: line.replace(/^#{1,3}\s+/, ''),
      })
    } else if (
      line.length > 0 &&
      line.length <= 80 &&
      !line.endsWith('.') &&
      !line.endsWith(',') &&
      /^[A-Z0-9]/.test(line) &&
      lines[i + 1] &&
      lines[i + 1].trim().length > 80
    ) {
      headings.push({ id: `section-${i}`, text: line })
    }
  })
  return headings.slice(0, 6)
}

/* ---------------------------------------------------------------------------
 * PostDetail
 * ------------------------------------------------------------------------- */
function PostDetail() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)

  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [bookmarksCount, setBookmarksCount] = useState(0)
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const [relatedPosts, setRelatedPosts] = useState([])

  const { isPremium, refetch: refetchPremium } = usePremium(currentUser?.id)
  const isLocked = post?.is_premium && !isPremium

  const {
    summary,
    loading: aiLoading,
    error: aiError,
    handleGenerateSummary,
    resetSummary,
    retrySummary,
  } = useAISummary()

  const { viewCount, hasIncremented, refreshViewCount } = usePostView(
    id,
    currentUser
  )

  useEffect(() => {
    if (hasIncremented) {
      const t = setTimeout(() => refreshViewCount(), 2000)
      return () => clearTimeout(t)
    }
  }, [hasIncremented, refreshViewCount])

  useEffect(() => {
    fetchPostDetail()
  }, [id])

  /* ------------------------------- helpers ------------------------------- */
  function showToast(message, tone = 'success') {
    setToast({ message, tone })
    setTimeout(() => setToast(null), 2600)
  }

  async function fetchPostDetail() {
    setLoading(true)
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(id, username, name, avatar_url, is_premium, bio)')
      .eq('id', id)
      .single()

    if (error) {
      setLoading(false)
      return
    }

    // Fallback counts if triggers haven't populated columns
    if (data.likes_count === null) {
      const { count } = await supabase
        .from('post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', id)
      setLikesCount(count || 0)
    } else {
      setLikesCount(data.likes_count || 0)
    }

    if (data.bookmarks_count === null) {
      const { count } = await supabase
        .from('post_bookmarks')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', id)
      setBookmarksCount(count || 0)
    } else {
      setBookmarksCount(data.bookmarks_count || 0)
    }

    if (data.comments_count === null) {
      const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', id)
      setPost({ ...data, comments_count: count || 0 })
    } else {
      setPost(data)
    }

    // Increment views via RPC (defined in backend)
    supabase.rpc('increment_post_views', { post_uuid: id })

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setCurrentUser(user)
      checkUserInteractions(user.id)
    }

    // Related posts
    if (data.profiles?.id) {
      fetchRelatedPosts(data.profiles.id, data.id, data.category)
    }

    setLoading(false)
  }

  async function fetchRelatedPosts(creatorId, currentId, category) {
    // First 4 posts from same creator excluding current, fall back to category
    const [{ data: fromCreator }, { data: fromCategory }] = await Promise.all([
      supabase
        .from('posts')
        .select('id, title, thumbnail_url, likes_count, views_count, category, created_at')
        .eq('user_id', creatorId)
        .neq('id', currentId)
        .order('created_at', { ascending: false })
        .limit(4),
      category
        ? supabase
            .from('posts')
            .select('id, title, thumbnail_url, likes_count, views_count, category, created_at, profiles(username, name)')
            .eq('category', category)
            .neq('id', currentId)
            .order('trending_score', { ascending: false, nullsFirst: false })
            .limit(4)
        : Promise.resolve({ data: [] }),
    ])
    const combined = [...(fromCreator || []), ...(fromCategory || [])]
    const seen = new Set()
    const unique = []
    for (const p of combined) {
      if (!seen.has(p.id)) {
        seen.add(p.id)
        unique.push(p)
      }
      if (unique.length >= 4) break
    }
    setRelatedPosts(unique)
  }

  async function checkUserInteractions(userId) {
    try {
      const [{ data: bm }, { data: lk }] = await Promise.all([
        supabase
          .from('post_bookmarks')
          .select('id')
          .eq('user_id', userId)
          .eq('post_id', id)
          .maybeSingle(),
        supabase
          .from('post_likes')
          .select('id')
          .eq('user_id', userId)
          .eq('post_id', id)
          .maybeSingle(),
      ])
      setIsBookmarked(!!bm)
      setIsLiked(!!lk)
    } catch {
      setIsBookmarked(false)
      setIsLiked(false)
    }
  }

  async function refreshCounts() {
    const { data } = await supabase
      .from('posts')
      .select('likes_count, bookmarks_count')
      .eq('id', id)
      .single()

    if (data) {
      if (data.likes_count === null) {
        const { count } = await supabase
          .from('post_likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', id)
        setLikesCount(count || 0)
      } else {
        setLikesCount(data.likes_count || 0)
      }

      if (data.bookmarks_count === null) {
        const { count } = await supabase
          .from('post_bookmarks')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', id)
        setBookmarksCount(count || 0)
      } else {
        setBookmarksCount(data.bookmarks_count || 0)
      }
    }

    if (currentUser) await checkUserInteractions(currentUser.id)
  }

  /* ---------------------------- interactions ----------------------------- */
  async function handleLike() {
    if (!currentUser) {
      showToast('Login untuk menyukai insight', 'error')
      return
    }
    if (actionLoading) return
    setActionLoading(true)

    const prevLiked = isLiked
    const prevCount = likesCount
    setIsLiked(!prevLiked)
    setLikesCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1)

    try {
      if (prevLiked) {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('post_id', id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('post_likes')
          .insert([{ user_id: currentUser.id, post_id: id }])
        if (error && error.code !== '23505') throw error
      }
      await refreshCounts()
    } catch (err) {
      setIsLiked(prevLiked)
      setLikesCount(prevCount)
      console.error(err)
      showToast('Gagal memproses like', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleBookmark() {
    if (!currentUser) {
      showToast('Login untuk menyimpan insight', 'error')
      return
    }
    if (actionLoading) return
    setActionLoading(true)

    const prev = isBookmarked
    const prevCount = bookmarksCount
    setIsBookmarked(!prev)
    setBookmarksCount(prev ? Math.max(0, prevCount - 1) : prevCount + 1)

    try {
      if (prev) {
        const { error } = await supabase
          .from('post_bookmarks')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('post_id', id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('post_bookmarks')
          .insert([{ user_id: currentUser.id, post_id: id }])
        if (error && error.code !== '23505') throw error
      }
      await refreshCounts()
      showToast(prev ? 'Dihapus dari koleksi' : 'Disimpan ke koleksi')
    } catch (err) {
      setIsBookmarked(prev)
      setBookmarksCount(prevCount)
      console.error(err)
      showToast('Gagal memproses bookmark', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}/post/${id}`
    try {
      if (navigator.share) {
        await navigator.share({ title: post?.title || 'Insight Skillio', url })
      } else {
        await navigator.clipboard.writeText(url)
        showToast('Link disalin')
      }
    } catch {
      /* cancelled */
    }
  }

  async function handleUpgrade(paymentType) {
    if (!currentUser) return
    const result = await upgradeToPremium(currentUser.id, paymentType)
    if (result.success) {
      await refetchPremium()
      showToast('Selamat datang di Skillio+')
    } else {
      showToast('Gagal upgrade: ' + result.error, 'error')
    }
  }

  async function handleAISummary() {
    if (!post) return
    const fullContent = `${post.title}\n\n${post.excerpt}\n\n${post.content}`
    await handleGenerateSummary(fullContent)
  }

  async function handleRetrySummary() {
    if (!post) return
    const fullContent = `${post.title}\n\n${post.excerpt}\n\n${post.content}`
    await retrySummary(fullContent)
  }

  /* ----------------------------- derived --------------------------------- */
  const isTrending = (post?.trending_score || 0) >= 50
  const readingMins = useMemo(() => readingTime(post?.content || ''), [post])
  const headings = useMemo(() => extractHeadings(post?.content || ''), [post])
  const totalViews = viewCount || post?.views_count || 0

  /* ------------------------------ guards --------------------------------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
          <DetailSkeleton />
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center">
          <h2 className="text-lg font-semibold text-[#111827] mb-2">
            Insight tidak ditemukan
          </h2>
          <p className="text-sm text-[#6B7280] mb-6">
            Mungkin sudah dihapus atau link-nya salah.
          </p>
          <Link to="/home">
            <button className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-sm shadow-blue-500/20 transition-colors">
              <Icon name="arrow-left" className="w-4 h-4" />
              Kembali ke feed
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const author = post.profiles

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-10">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50"
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
                  name={toast.tone === 'error' ? 'lock' : 'check'}
                  className="w-4 h-4"
                />
                {toast.message}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================
       * TOP BAR
       * ============================================================== */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-6">
        <div className="flex items-center justify-between">
          <Link
            to="/home"
            className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
          >
            <Icon name="arrow-left" className="w-4 h-4" />
            Kembali ke feed
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#111827] bg-white border border-[#E5E7EB] hover:border-[#3B82F6]/40 hover:bg-[#F9FAFB] transition-colors"
              aria-label="Bagikan"
            >
              <Icon name="share" className="w-3.5 h-3.5" />
              Bagikan
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================
       * BODY
       * ============================================================== */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* MAIN */}
          <main className="lg:col-span-8 min-w-0">
            <motion.article
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden"
            >
              {/* Thumbnail (bleeds inside the card) */}
              {post.thumbnail_url && (
                <div className="relative aspect-[16/9] bg-[#F3F4F6] overflow-hidden">
                  <img
                    src={post.thumbnail_url}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                  {post.is_premium && (
                    <div className="absolute top-4 right-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-sm text-[#3B82F6] text-xs font-semibold shadow-sm">
                      <Icon name="sparkles" className="w-3.5 h-3.5" />
                      Skillio+
                    </div>
                  )}
                </div>
              )}

              <div className="p-6 sm:p-8 lg:p-10">
                {/* Meta chips */}
                <div className="flex items-center gap-2 flex-wrap mb-5">
                  {post.category && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#F3F4F6] text-[#6B7280] text-[11px] font-medium">
                      {post.category}
                    </span>
                  )}
                  {isTrending && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#3B82F6]/10 text-[#3B82F6] text-[11px] font-semibold">
                      <Icon name="trending" className="w-3 h-3" />
                      Trending
                    </span>
                  )}
                  {post.is_premium && !post.thumbnail_url && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 text-[11px] font-semibold">
                      <Icon name="sparkles" className="w-3 h-3" />
                      Skillio+
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#6B7280]">
                    <Icon name="clock" className="w-3 h-3" />
                    {readingMins} menit baca
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#111827] tracking-tight leading-[1.15] mb-5">
                  {post.title}
                </h1>

                {/* Author row */}
                <div className="flex items-center justify-between gap-3 pb-6 mb-6 border-b border-[#F3F4F6] flex-wrap">
                  <Link
                    to={author?.username ? `/u/${author.username}` : '#'}
                    className="flex items-center gap-3 min-w-0 group"
                  >
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-semibold overflow-hidden ring-2 ring-white shadow-sm">
                        {author?.avatar_url ? (
                          <img
                            src={author.avatar_url}
                            alt={author.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          author?.name?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                      {author?.is_premium && (
                        <span
                          title="Skillio+"
                          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#3B82F6] text-white flex items-center justify-center ring-2 ring-white"
                        >
                          <Icon name="sparkles" className="w-2 h-2" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-[#111827] truncate group-hover:text-[#3B82F6] transition-colors">
                          {author?.name || 'Anonymous'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                        <span className="truncate">@{author?.username || 'anonymous'}</span>
                        <Icon name="dot" className="w-2.5 h-2.5" />
                        <span className="shrink-0">{formatDate(post.created_at)}</span>
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center gap-2 shrink-0">
                    {author && currentUser?.id !== author.id && (
                      <FollowButton
                        profileId={author.id}
                        profileUsername={author.username}
                        currentUser={currentUser}
                        size="small"
                        showCount={false}
                      />
                    )}
                  </div>
                </div>

                {/* Excerpt */}
                {post.excerpt && !isLocked && (
                  <div className="mb-8 px-4 sm:px-5 py-4 rounded-xl bg-[#FAFAFA] border-l-4 border-[#3B82F6]">
                    <p className="text-base text-[#111827] leading-relaxed italic">
                      {post.excerpt}
                    </p>
                  </div>
                )}

                {/* AI summary (Skillio+ only) */}
                {!isLocked && currentUser && isPremium && (
                  <div className="mb-8">
                    {!summary && !aiLoading && !aiError && (
                      <div className="flex items-center justify-start">
                        <AISummaryButton onClick={handleAISummary} loading={aiLoading} />
                      </div>
                    )}
                    {aiLoading && <AISummaryLoading />}
                    {summary && !aiLoading && (
                      <AISummaryCard summary={summary} onClose={resetSummary} />
                    )}
                    {aiError && !aiLoading && (
                      <AISummaryError
                        error={aiError}
                        onRetry={handleRetrySummary}
                        onClose={resetSummary}
                      />
                    )}
                  </div>
                )}

                {/* Paywall or content */}
                {isLocked ? (
                  <PremiumPaywall onUpgrade={handleUpgrade} compact={false} />
                ) : (
                  <div className="prose prose-slate max-w-none">
                    <div className="text-[15px] sm:text-base text-[#111827] leading-[1.8] whitespace-pre-wrap selection:bg-[#3B82F6]/20">
                      {post.content}
                    </div>
                  </div>
                )}

                {/* Stats footer */}
                <div className="mt-8 pt-6 border-t border-[#F3F4F6] flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-4 text-xs text-[#6B7280]">
                    <span className="inline-flex items-center gap-1">
                      <Icon name="heart" className="w-3.5 h-3.5" />
                      {formatViews(likesCount)} suka
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Icon name="message" className="w-3.5 h-3.5" />
                      {formatViews(post.comments_count || 0)} komentar
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Icon name="bookmark" className="w-3.5 h-3.5" />
                      {formatViews(bookmarksCount)} tersimpan
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Icon name="eye" className="w-3.5 h-3.5" />
                      {formatViews(totalViews)} dilihat
                    </span>
                  </div>
                  <span className="text-[11px] text-[#9CA3AF]">
                    Dipublikasikan {timeAgo(post.created_at)}
                  </span>
                </div>
              </div>
            </motion.article>

            {/* Creator cta card */}
            {author && (
              <CreatorCTA author={author} currentUser={currentUser} />
            )}

            {/* Comments */}
            <div className="mt-6">
              <Comments postId={id} />
            </div>
          </main>

          {/* SIDEBAR */}
          <aside className="lg:col-span-4">
            <div className="sticky top-[92px] space-y-4">
              <EngagementRail
                isLiked={isLiked}
                isBookmarked={isBookmarked}
                likesCount={likesCount}
                bookmarksCount={bookmarksCount}
                commentsCount={post.comments_count || 0}
                views={totalViews}
                onLike={handleLike}
                onBookmark={handleBookmark}
                onShare={handleShare}
                actionLoading={actionLoading}
              />

              {headings.length > 1 && <TableOfContents headings={headings} />}

              {author && <AuthorCard author={author} />}

              {relatedPosts.length > 0 && <RelatedCard posts={relatedPosts} />}

              {!isPremium && <SkillioPlusCard />}
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile sticky engagement bar */}
      <MobileEngagementBar
        isLiked={isLiked}
        isBookmarked={isBookmarked}
        likesCount={likesCount}
        bookmarksCount={bookmarksCount}
        commentsCount={post.comments_count || 0}
        onLike={handleLike}
        onBookmark={handleBookmark}
        onShare={handleShare}
        actionLoading={actionLoading}
      />
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Engagement rail (desktop sidebar)
 * ------------------------------------------------------------------------- */
function EngagementRail({
  isLiked,
  isBookmarked,
  likesCount,
  bookmarksCount,
  commentsCount,
  views,
  onLike,
  onBookmark,
  onShare,
  actionLoading,
}) {
  const actions = [
    {
      key: 'like',
      label: isLiked ? 'Suka' : 'Suka',
      icon: 'heart',
      count: likesCount,
      active: isLiked,
      onClick: onLike,
      activeClass: 'text-[#EF4444] bg-red-50',
    },
    {
      key: 'bookmark',
      label: isBookmarked ? 'Tersimpan' : 'Simpan',
      icon: 'bookmark',
      count: bookmarksCount,
      active: isBookmarked,
      onClick: onBookmark,
      activeClass: 'text-[#3B82F6] bg-blue-50',
    },
    {
      key: 'share',
      label: 'Bagikan',
      icon: 'share',
      count: null,
      active: false,
      onClick: onShare,
      activeClass: 'text-[#3B82F6] bg-blue-50',
    },
  ]

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4">
      <div className="grid grid-cols-3 gap-2 mb-3">
        {actions.map((a) => (
          <button
            key={a.key}
            onClick={a.onClick}
            disabled={actionLoading && a.key !== 'share'}
            className={`group flex flex-col items-center justify-center gap-1 py-3 rounded-xl transition-all ${
              a.active
                ? a.activeClass
                : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Icon
              name={a.icon}
              className="w-[18px] h-[18px] transition-transform group-hover:scale-110"
              filled={a.active}
            />
            <span className="text-[10px] font-semibold">{a.label}</span>
            {a.count !== null && (
              <span className="text-[11px] text-[#6B7280] font-medium">
                {formatViews(a.count)}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#F3F4F6]">
        <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280]">
          <Icon name="message" className="w-3 h-3" />
          {formatViews(commentsCount)} komentar
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280] justify-end">
          <Icon name="eye" className="w-3 h-3" />
          {formatViews(views)} views
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Table of contents
 * ------------------------------------------------------------------------- */
function TableOfContents({ headings }) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6]">
          <Icon name="list" className="w-4 h-4" />
        </span>
        <h3 className="text-sm font-semibold text-[#111827]">Daftar isi</h3>
      </div>
      <ul className="space-y-1">
        {headings.map((h, i) => (
          <li key={h.id}>
            <span
              className="flex items-start gap-2 px-2 py-1.5 rounded-md text-xs text-[#6B7280] hover:text-[#3B82F6] hover:bg-[#F9FAFB] cursor-default transition-colors"
            >
              <span className="text-[10px] font-semibold text-[#9CA3AF] mt-0.5">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="line-clamp-2 leading-snug">{h.text}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Author card (sidebar)
 * ------------------------------------------------------------------------- */
function AuthorCard({ author }) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-base font-semibold overflow-hidden">
            {author?.avatar_url ? (
              <img src={author.avatar_url} alt={author.name} className="w-full h-full object-cover" />
            ) : (
              author?.name?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
          {author.is_premium && (
            <span
              title="Skillio+"
              className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#3B82F6] text-white flex items-center justify-center ring-2 ring-white"
            >
              <Icon name="sparkles" className="w-2 h-2" />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <Link
            to={`/u/${author.username}`}
            className="text-sm font-semibold text-[#111827] hover:text-[#3B82F6] transition-colors truncate block"
          >
            {author.name}
          </Link>
          <p className="text-xs text-[#6B7280] truncate">@{author.username}</p>
        </div>
      </div>

      {author.bio && (
        <p className="text-xs text-[#111827] leading-relaxed mb-4 line-clamp-3">
          {author.bio}
        </p>
      )}

      <Link to={`/u/${author.username}`}>
        <button className="w-full px-3 py-2 rounded-lg text-xs font-semibold text-[#111827] bg-[#F3F4F6] hover:bg-[#E5E7EB] transition-colors">
          Lihat profil creator
        </button>
      </Link>
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Creator CTA (inline below article)
 * ------------------------------------------------------------------------- */
function CreatorCTA({ author, currentUser }) {
  if (!author || currentUser?.id === author.id) return null
  return (
    <div className="mt-6 bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 flex items-center gap-4 flex-wrap">
      <div className="relative shrink-0">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-base font-semibold overflow-hidden ring-2 ring-white shadow-sm">
          {author.avatar_url ? (
            <img src={author.avatar_url} alt={author.name} className="w-full h-full object-cover" />
          ) : (
            author.name?.charAt(0).toUpperCase()
          )}
        </div>
        {author.is_premium && (
          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#3B82F6] text-white flex items-center justify-center ring-2 ring-white">
            <Icon name="sparkles" className="w-2 h-2" />
          </span>
        )}
      </div>

      <div className="flex-1 min-w-[200px]">
        <p className="text-[11px] text-[#6B7280] uppercase tracking-wider mb-0.5">
          Ditulis oleh
        </p>
        <h4 className="text-sm font-semibold text-[#111827] truncate">{author.name}</h4>
        <p className="text-xs text-[#6B7280] truncate">@{author.username}</p>
      </div>

      <div className="flex items-center gap-2">
        <Link to={`/u/${author.username}`}>
          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#111827] bg-white border border-[#E5E7EB] hover:border-[#3B82F6]/40 hover:bg-[#F9FAFB] transition-colors">
            Lihat profil
          </button>
        </Link>
        <FollowButton
          profileId={author.id}
          profileUsername={author.username}
          currentUser={currentUser}
          size="small"
          showCount={false}
        />
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Related posts
 * ------------------------------------------------------------------------- */
function RelatedCard({ posts }) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6]">
          <Icon name="sparkles" className="w-4 h-4" />
        </span>
        <h3 className="text-sm font-semibold text-[#111827]">Insight lainnya</h3>
      </div>
      <ul className="space-y-1">
        {posts.map((p) => (
          <li key={p.id}>
            <Link
              to={`/post/${p.id}`}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#F9FAFB] transition-colors group"
            >
              <div className="w-12 h-12 rounded-lg bg-[#F3F4F6] overflow-hidden shrink-0 relative">
                {p.thumbnail_url ? (
                  <img
                    src={p.thumbnail_url}
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-[#3B82F6]">
                    <Icon name="sparkles" className="w-4 h-4" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-semibold text-[#111827] line-clamp-2 leading-snug group-hover:text-[#3B82F6] transition-colors">
                  {p.title}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-[#6B7280]">
                  {p.category && <span className="truncate">{p.category}</span>}
                  <span className="w-0.5 h-0.5 rounded-full bg-[#9CA3AF]" />
                  <span className="inline-flex items-center gap-0.5 shrink-0">
                    <Icon name="heart" className="w-2.5 h-2.5" />
                    {formatViews(p.likes_count || 0)}
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Skillio+ promo
 * ------------------------------------------------------------------------- */
function SkillioPlusCard() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#111827] to-[#1F2937] rounded-2xl p-5 text-white">
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#3B82F6]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="relative">
        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/10 text-white text-[10px] font-semibold mb-3">
          <Icon name="sparkles" className="w-3 h-3" />
          Skillio+
        </div>
        <h4 className="text-base font-semibold mb-1.5">Bantu baca lebih cepat</h4>
        <p className="text-xs text-white/70 leading-relaxed mb-4">
          AI summary, analytics creator, dan badge verified untuk kamu yang serius tumbuh.
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
 * Mobile bottom engagement bar
 * ------------------------------------------------------------------------- */
function MobileEngagementBar({
  isLiked,
  isBookmarked,
  likesCount,
  bookmarksCount,
  commentsCount,
  onLike,
  onBookmark,
  onShare,
  actionLoading,
}) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB]">
      <div className="max-w-[1200px] mx-auto px-4 py-2.5 grid grid-cols-4 gap-1">
        <button
          onClick={onLike}
          disabled={actionLoading}
          className={`flex flex-col items-center gap-0.5 py-1.5 rounded-lg transition-colors ${
            isLiked ? 'text-[#EF4444]' : 'text-[#6B7280] hover:text-[#111827]'
          } disabled:opacity-50`}
        >
          <Icon name="heart" className="w-5 h-5" filled={isLiked} />
          <span className="text-[10px] font-semibold">{formatViews(likesCount)}</span>
        </button>

        <button
          onClick={() => {
            // Scroll to comments
            const el = document.querySelector('[data-comments-anchor]')
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
          className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-[#6B7280] hover:text-[#111827] transition-colors"
        >
          <Icon name="message" className="w-5 h-5" />
          <span className="text-[10px] font-semibold">{formatViews(commentsCount)}</span>
        </button>

        <button
          onClick={onBookmark}
          disabled={actionLoading}
          className={`flex flex-col items-center gap-0.5 py-1.5 rounded-lg transition-colors ${
            isBookmarked ? 'text-[#3B82F6]' : 'text-[#6B7280] hover:text-[#111827]'
          } disabled:opacity-50`}
        >
          <Icon name="bookmark" className="w-5 h-5" filled={isBookmarked} />
          <span className="text-[10px] font-semibold">{formatViews(bookmarksCount)}</span>
        </button>

        <button
          onClick={onShare}
          className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-[#6B7280] hover:text-[#111827] transition-colors"
        >
          <Icon name="share" className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Bagikan</span>
        </button>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Skeleton
 * ------------------------------------------------------------------------- */
function DetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
      <div className="lg:col-span-8 space-y-4">
        <div className="h-4 w-32 bg-[#F3F4F6] rounded animate-pulse" />
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
          <div className="aspect-[16/9] bg-[#F3F4F6] animate-pulse" />
          <div className="p-6 sm:p-8 space-y-4">
            <div className="h-3 w-24 bg-[#F3F4F6] rounded animate-pulse" />
            <div className="h-8 w-3/4 bg-[#F3F4F6] rounded animate-pulse" />
            <div className="h-4 w-40 bg-[#F3F4F6] rounded animate-pulse" />
            <div className="space-y-2 pt-4">
              <div className="h-3 w-full bg-[#F3F4F6] rounded animate-pulse" />
              <div className="h-3 w-5/6 bg-[#F3F4F6] rounded animate-pulse" />
              <div className="h-3 w-full bg-[#F3F4F6] rounded animate-pulse" />
              <div className="h-3 w-4/6 bg-[#F3F4F6] rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
      <div className="hidden lg:block lg:col-span-4 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white border border-[#E5E7EB] rounded-2xl h-40 animate-pulse" />
        ))}
      </div>
    </div>
  )
}

export default PostDetail
