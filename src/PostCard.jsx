import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from './services/supabaseClient'
import FollowButton from './FollowButton'
import { usePremium } from './hooks/usePremium'
import { formatViews } from './utils/formatViews'

/* Minimal stroke icon set shared with the rest of the app */
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
    case 'eye':
      return (
        <svg {...common}>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
    case 'trending':
      return (
        <svg {...common}>
          <path d="M3 17l6-6 4 4 8-8" />
          <path d="M14 7h7v7" />
        </svg>
      )
    case 'lock':
      return (
        <svg {...common}>
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      )
    case 'sparkles':
      return (
        <svg {...common}>
          <path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z" />
          <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
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

function timeAgo(iso) {
  if (!iso) return ''
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'baru saja'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}j`
  if (diff < 2592000) return `${Math.floor(diff / 86400)}h`
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}bl`
  return `${Math.floor(diff / 31536000)}th`
}

function PostCard({ post, currentUser, showAuthor = true }) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes_count || 0)
  const [bookmarksCount, setBookmarksCount] = useState(post.bookmarks_count || 0)
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0)
  const [loading, setLoading] = useState(false)

  const { isPremium } = usePremium(currentUser?.id)
  const isLocked = post.is_premium && !isPremium
  const isTrending = (post.trending_score || 0) >= 50

  useEffect(() => {
    if (post.likes_count === null) countLikesManually()
    else setLikesCount(post.likes_count || 0)

    if (post.bookmarks_count === null) countBookmarksManually()
    else setBookmarksCount(post.bookmarks_count || 0)

    if (post.comments_count === null) countCommentsManually()
    else setCommentsCount(post.comments_count || 0)

    if (currentUser) {
      checkUserInteractions()
    } else {
      setIsLiked(false)
      setIsBookmarked(false)
    }
  }, [currentUser, post.id, post.likes_count, post.bookmarks_count, post.comments_count])

  async function countLikesManually() {
    const { count, error } = await supabase
      .from('post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.id)
    if (!error) setLikesCount(count || 0)
  }

  async function countBookmarksManually() {
    const { count, error } = await supabase
      .from('post_bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.id)
    if (!error) setBookmarksCount(count || 0)
  }

  async function countCommentsManually() {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.id)
    if (!error) setCommentsCount(count || 0)
  }

  async function checkUserInteractions() {
    try {
      const { data: bookmarkData } = await supabase
        .from('post_bookmarks')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('post_id', post.id)
        .limit(1)
        .maybeSingle()
      setIsBookmarked(!!bookmarkData)

      const { data: likeData } = await supabase
        .from('post_likes')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('post_id', post.id)
        .limit(1)
        .maybeSingle()
      setIsLiked(!!likeData)
    } catch {
      setIsLiked(false)
      setIsBookmarked(false)
    }
  }

  async function handleBookmark(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!currentUser) {
      alert('Silakan login terlebih dahulu')
      return
    }
    if (loading) return
    setLoading(true)

    // Optimistic update
    const prevBookmarked = isBookmarked
    const prevCount = bookmarksCount
    setIsBookmarked(!prevBookmarked)
    setBookmarksCount(prevBookmarked ? Math.max(0, prevCount - 1) : prevCount + 1)

    try {
      if (prevBookmarked) {
        const { error } = await supabase
          .from('post_bookmarks')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('post_id', post.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('post_bookmarks')
          .insert([{ user_id: currentUser.id, post_id: post.id }])
        if (error && error.code !== '23505') throw error
      }
      await refreshPostData()
    } catch (err) {
      // Revert optimistic update on failure
      setIsBookmarked(prevBookmarked)
      setBookmarksCount(prevCount)
      console.error('Bookmark error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleLike(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!currentUser) {
      alert('Silakan login terlebih dahulu')
      return
    }
    if (loading) return
    setLoading(true)

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
          .eq('post_id', post.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('post_likes')
          .insert([{ user_id: currentUser.id, post_id: post.id }])
        if (error && error.code !== '23505') throw error
      }
      await refreshPostData()
    } catch (err) {
      setIsLiked(prevLiked)
      setLikesCount(prevCount)
      console.error('Like error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function refreshPostData() {
    try {
      const { data: updatedPost } = await supabase
        .from('posts')
        .select('likes_count, bookmarks_count')
        .eq('id', post.id)
        .single()

      if (updatedPost) {
        if (updatedPost.likes_count === null) await countLikesManually()
        else setLikesCount(updatedPost.likes_count || 0)

        if (updatedPost.bookmarks_count === null) await countBookmarksManually()
        else setBookmarksCount(updatedPost.bookmarks_count || 0)
      }

      if (!currentUser) return

      const { data: likeData } = await supabase
        .from('post_likes')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('post_id', post.id)
        .limit(1)
        .maybeSingle()
      setIsLiked(!!likeData)

      const { data: bookmarkData } = await supabase
        .from('post_bookmarks')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('post_id', post.id)
        .limit(1)
        .maybeSingle()
      setIsBookmarked(!!bookmarkData)
    } catch (err) {
      console.error('refreshPostData error:', err)
    }
  }

  return (
    <article className="group bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden hover:border-[#3B82F6]/30 hover:shadow-[0_8px_30px_-8px_rgba(59,130,246,0.12)] hover:-translate-y-0.5 transition-all duration-200">
      {/* Header: author + timestamp */}
      {showAuthor && post.profiles && (
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <Link
            to={`/u/${post.profiles.username}`}
            className="flex items-center gap-3 min-w-0 flex-1 group/author"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-semibold shrink-0 overflow-hidden ring-2 ring-white shadow-sm">
              {post.profiles.avatar_url ? (
                <img
                  src={post.profiles.avatar_url}
                  alt={post.profiles.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                post.profiles.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-[#111827] truncate group-hover/author:text-[#3B82F6] transition-colors">
                  {post.profiles.name}
                </span>
                {post.profiles.is_premium && (
                  <span
                    title="Skillio+ Creator"
                    className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#3B82F6] text-white"
                  >
                    <Icon name="sparkles" className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                <span className="truncate">@{post.profiles.username}</span>
                <Icon name="dot" className="w-2.5 h-2.5" />
                <span className="shrink-0">{timeAgo(post.created_at)}</span>
              </div>
            </div>
          </Link>

          <FollowButton
            profileId={post.profiles.id}
            profileUsername={post.profiles.username}
            currentUser={currentUser}
            size="small"
            showCount={false}
          />
        </div>
      )}

      {/* Body */}
      <div className="px-5 pb-4">
        {/* Meta row: category + trending */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {post.category && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#F3F4F6] text-[11px] font-medium text-[#6B7280]">
              {post.category}
            </span>
          )}
          {isTrending && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#3B82F6]/10 text-[#3B82F6] text-[11px] font-semibold">
              <Icon name="trending" className="w-3 h-3" />
              Trending
            </span>
          )}
          {post.is_premium && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 text-[11px] font-semibold">
              <Icon name="sparkles" className="w-3 h-3" />
              Skillio+
            </span>
          )}
        </div>

        {/* Title */}
        <Link to={`/post/${post.id}`} className="block">
          <h3 className="text-lg sm:text-xl font-semibold text-[#111827] leading-snug mb-2 line-clamp-2 group-hover:text-[#3B82F6] transition-colors">
            {post.title}
          </h3>
        </Link>

        {/* Excerpt */}
        {post.excerpt && (
          <Link to={`/post/${post.id}`} className="block">
            <p
              className={`text-sm text-[#6B7280] leading-relaxed line-clamp-3 ${
                isLocked ? 'blur-[3px] select-none' : ''
              }`}
            >
              {post.excerpt}
            </p>
          </Link>
        )}
      </div>

      {/* Thumbnail */}
      {post.thumbnail_url && (
        <Link to={`/post/${post.id}`} className="block px-5 pb-4">
          <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-[#F3F4F6] border border-[#E5E7EB]">
            <img
              src={post.thumbnail_url}
              alt={post.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
              onError={(e) => { e.target.style.display = 'none' }}
            />
            {isLocked && (
              <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/80 via-[#111827]/40 to-transparent flex items-end justify-center pb-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/95 text-[#111827] text-xs font-semibold">
                  <Icon name="lock" className="w-3.5 h-3.5" />
                  Skillio+ Exclusive
                </div>
              </div>
            )}
          </div>
        </Link>
      )}

      {/* Premium CTA */}
      {isLocked && !post.thumbnail_url && (
        <div className="mx-5 mb-4 p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center shrink-0">
            <Icon name="lock" className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#111827]">Insight eksklusif Skillio+</p>
            <p className="text-xs text-[#6B7280]">Upgrade untuk buka konten ini</p>
          </div>
          <Link to="/premium" className="shrink-0">
            <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] transition-colors">
              Upgrade
            </button>
          </Link>
        </div>
      )}

      {/* Engagement bar */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-[#F3F4F6]">
        <div className="flex items-center gap-1">
          <button
            onClick={handleLike}
            disabled={loading}
            aria-label="Suka"
            className={`group/btn inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isLiked
                ? 'text-[#EF4444] bg-red-50'
                : 'text-[#6B7280] hover:text-[#EF4444] hover:bg-red-50/60'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Icon name="heart" className="w-4 h-4 transition-transform group-hover/btn:scale-110" filled={isLiked} />
            <span>{formatViews(likesCount)}</span>
          </button>

          <Link
            to={`/post/${post.id}`}
            className="group/btn inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#6B7280] hover:text-[#3B82F6] hover:bg-blue-50/60 transition-colors"
          >
            <Icon name="message" className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
            <span>{formatViews(commentsCount)}</span>
          </Link>

          <button
            onClick={handleBookmark}
            disabled={loading}
            aria-label="Simpan"
            className={`group/btn inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isBookmarked
                ? 'text-[#3B82F6] bg-blue-50'
                : 'text-[#6B7280] hover:text-[#3B82F6] hover:bg-blue-50/60'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Icon name="bookmark" className="w-4 h-4 transition-transform group-hover/btn:scale-110" filled={isBookmarked} />
            <span>{formatViews(bookmarksCount)}</span>
          </button>
        </div>

        <div className="inline-flex items-center gap-1.5 text-xs text-[#9CA3AF]">
          <Icon name="eye" className="w-3.5 h-3.5" />
          <span>{formatViews(post.views_count || 0)}</span>
        </div>
      </div>
    </article>
  )
}

export default PostCard
