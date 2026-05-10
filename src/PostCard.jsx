import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from './services/supabaseClient'
import FollowButton from './FollowButton'
import PremiumBadge from './components/PremiumBadge'
import { CompactTrendingBadge } from './components/TrendingBadge'
import { usePremium } from './hooks/usePremium'
import { CompactViewCounter } from './components/ViewCounter'

function PostCard({ post, currentUser, showAuthor = true }) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes_count || 0)
  const [bookmarksCount, setBookmarksCount] = useState(post.bookmarks_count || 0)
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0)
  const [loading, setLoading] = useState(false)
  
  const { isPremium } = usePremium(currentUser?.id)
  const isLocked = post.is_premium && !isPremium

  useEffect(() => {
    console.log('🔄 [PostCard useEffect] Post changed:', post.id)
    console.log('📊 [PostCard useEffect] Initial likes_count from post:', post.likes_count)
    console.log('📊 [PostCard useEffect] Initial bookmarks_count from post:', post.bookmarks_count)
    console.log('📊 [PostCard useEffect] Initial comments_count from post:', post.comments_count)
    
    // If counts are null from database, count manually immediately
    if (post.likes_count === null) {
      console.warn('⚠️ [PostCard useEffect] likes_count is null, will count manually')
      countLikesManually()
    } else {
      setLikesCount(post.likes_count || 0)
    }
    
    if (post.bookmarks_count === null) {
      console.warn('⚠️ [PostCard useEffect] bookmarks_count is null, will count manually')
      countBookmarksManually()
    } else {
      setBookmarksCount(post.bookmarks_count || 0)
    }
    
    if (post.comments_count === null) {
      console.warn('⚠️ [PostCard useEffect] comments_count is null, will count manually')
      countCommentsManually()
    } else {
      setCommentsCount(post.comments_count || 0)
    }
    
    if (currentUser) {
      console.log('👤 [PostCard useEffect] Current user exists, checking interactions')
      checkUserInteractions()
    } else {
      console.log('👤 [PostCard useEffect] No current user, resetting states')
      // Reset states if no user
      setIsLiked(false)
      setIsBookmarked(false)
    }
  }, [currentUser, post.id, post.likes_count, post.bookmarks_count, post.comments_count])

  async function countLikesManually() {
    console.log('🔢 [countLikesManually] Counting likes for post:', post.id)
    const { count, error } = await supabase
      .from('post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.id)
    
    if (error) {
      console.error('❌ [countLikesManually] Error:', error)
    } else {
      console.log('✅ [countLikesManually] Manual count:', count)
      setLikesCount(count || 0)
    }
  }

  async function countBookmarksManually() {
    console.log('🔢 [countBookmarksManually] Counting bookmarks for post:', post.id)
    const { count, error } = await supabase
      .from('post_bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.id)
    
    if (error) {
      console.error('❌ [countBookmarksManually] Error:', error)
    } else {
      console.log('✅ [countBookmarksManually] Manual count:', count)
      setBookmarksCount(count || 0)
    }
  }

  async function countCommentsManually() {
    console.log('🔢 [countCommentsManually] Counting comments for post:', post.id)
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.id)
    
    if (error) {
      console.error('❌ [countCommentsManually] Error:', error)
    } else {
      console.log('✅ [countCommentsManually] Manual count:', count)
      setCommentsCount(count || 0)
    }
  }

  async function checkUserInteractions() {
    console.log('🔍 [checkUserInteractions] Checking user interactions')
    console.log('🔍 [checkUserInteractions] User ID:', currentUser.id)
    console.log('🔍 [checkUserInteractions] Post ID:', post.id)
    
    try {
      // Check bookmark - use limit(1) to avoid multiple rows error
      const { data: bookmarkData, error: bookmarkError } = await supabase
        .from('post_bookmarks')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('post_id', post.id)
        .limit(1)
        .maybeSingle()

      if (bookmarkError) {
        console.error('❌ [checkUserInteractions] Error checking bookmark:', bookmarkError)
        setIsBookmarked(false)
      } else {
        console.log('✅ [checkUserInteractions] Bookmark data:', bookmarkData)
        console.log('🔖 [checkUserInteractions] Is bookmarked:', !!bookmarkData)
        setIsBookmarked(!!bookmarkData)
      }

      // Check like - use limit(1) to avoid multiple rows error
      const { data: likeData, error: likeError } = await supabase
        .from('post_likes')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('post_id', post.id)
        .limit(1)
        .maybeSingle()

      if (likeError) {
        console.error('❌ [checkUserInteractions] Error checking like:', likeError)
        setIsLiked(false)
      } else {
        console.log('✅ [checkUserInteractions] Like data:', likeData)
        console.log('👍 [checkUserInteractions] Is liked:', !!likeData)
        setIsLiked(!!likeData)
      }
    } catch (err) {
      console.error('❌ [checkUserInteractions] Unexpected error:', err)
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

    try {
      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('post_bookmarks')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('post_id', post.id)

        if (error) {
          console.error('Error removing bookmark:', error)
          alert(`Gagal menghapus bookmark: ${error.message}`)
        }
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('post_bookmarks')
          .insert([{ user_id: currentUser.id, post_id: post.id }])

        if (error) {
          console.error('Error adding bookmark:', error)
          
          if (error.code === '23505') {
            // Already bookmarked, just update UI
            setIsBookmarked(true)
          } else if (error.code === '42P01') {
            alert('Tabel post_bookmarks belum dibuat. Silakan jalankan database-bookmarks-setup.sql di Supabase SQL Editor.')
          } else {
            alert(`Gagal menambahkan bookmark: ${error.message}`)
          }
        }
      }

      // Fetch fresh data from database after bookmark/unbookmark
      await refreshPostData()
      
    } catch (err) {
      console.error('Unexpected error:', err)
      alert('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  async function handleLike(e) {
    e.preventDefault()
    e.stopPropagation()

    console.log('❤️ [handleLike] Like button clicked')
    console.log('❤️ [handleLike] Current user:', currentUser?.id)
    console.log('❤️ [handleLike] Post ID:', post.id)
    console.log('❤️ [handleLike] Current isLiked:', isLiked)
    console.log('❤️ [handleLike] Current likesCount:', likesCount)

    if (!currentUser) {
      console.warn('⚠️ [handleLike] No current user, showing alert')
      alert('Silakan login terlebih dahulu')
      return
    }

    if (loading) {
      console.warn('⚠️ [handleLike] Already loading, skipping')
      return
    }
    
    setLoading(true)

    try {
      if (isLiked) {
        console.log('👎 [handleLike] Unliking post...')
        // Unlike - Remove like
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('post_id', post.id)

        if (error) {
          console.error('❌ [handleLike] Error removing like:', error)
          alert(`Gagal menghapus like: ${error.message}`)
        } else {
          console.log('✅ [handleLike] Like removed successfully')
        }
      } else {
        console.log('👍 [handleLike] Liking post...')
        // Like - Add like
        const { error } = await supabase
          .from('post_likes')
          .insert([{ user_id: currentUser.id, post_id: post.id }])

        if (error) {
          console.error('❌ [handleLike] Error adding like:', error)
          
          if (error.code === '23505') {
            console.warn('⚠️ [handleLike] Already liked (duplicate), updating UI')
            setIsLiked(true)
          } else if (error.code === '42P01') {
            alert('Tabel post_likes belum dibuat. Silakan jalankan database-likes-setup.sql di Supabase SQL Editor.')
          } else {
            alert(`Gagal menambahkan like: ${error.message}`)
          }
        } else {
          console.log('✅ [handleLike] Like added successfully')
        }
      }

      // Fetch fresh data from database after like/unlike
      console.log('🔄 [handleLike] Refreshing post data...')
      await refreshPostData()
      console.log('✅ [handleLike] Post data refreshed')
      
    } catch (err) {
      console.error('❌ [handleLike] Unexpected error:', err)
      alert('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
      console.log('✅ [handleLike] Like operation complete')
    }
  }

  async function refreshPostData() {
    console.log('🔄 [refreshPostData] Starting refresh for post:', post.id)
    console.log('🔄 [refreshPostData] Current user:', currentUser?.id)
    
    try {
      // Fetch updated post data from database
      const { data: updatedPost, error: postError } = await supabase
        .from('posts')
        .select('likes_count, bookmarks_count')
        .eq('id', post.id)
        .single()

      if (postError) {
        console.error('❌ [refreshPostData] Error fetching updated post:', postError)
      } else {
        console.log('✅ [refreshPostData] Updated post data:', updatedPost)
        console.log('📊 [refreshPostData] New likes_count:', updatedPost.likes_count)
        console.log('📊 [refreshPostData] New bookmarks_count:', updatedPost.bookmarks_count)
        
        // If counts are null, count manually from tables
        if (updatedPost.likes_count === null) {
          console.warn('⚠️ [refreshPostData] likes_count is null, counting manually...')
          const { count, error: countError } = await supabase
            .from('post_likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id)
          
          if (!countError) {
            console.log('📊 [refreshPostData] Manual likes count:', count)
            setLikesCount(count || 0)
          }
        } else {
          setLikesCount(updatedPost.likes_count || 0)
        }
        
        if (updatedPost.bookmarks_count === null) {
          console.warn('⚠️ [refreshPostData] bookmarks_count is null, counting manually...')
          const { count, error: countError } = await supabase
            .from('post_bookmarks')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id)
          
          if (!countError) {
            console.log('📊 [refreshPostData] Manual bookmarks count:', count)
            setBookmarksCount(count || 0)
          }
        } else {
          setBookmarksCount(updatedPost.bookmarks_count || 0)
        }
      }

      // Check current user's like status - use limit(1) to avoid multiple rows error
      const { data: likeData, error: likeError } = await supabase
        .from('post_likes')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('post_id', post.id)
        .limit(1)
        .maybeSingle()

      if (likeError) {
        console.error('❌ [refreshPostData] Error checking like:', likeError)
      } else {
        console.log('✅ [refreshPostData] Like data:', likeData)
        console.log('👍 [refreshPostData] Is liked:', !!likeData)
        setIsLiked(!!likeData)
      }

      // Check current user's bookmark status
      const { data: bookmarkData, error: bookmarkError } = await supabase
        .from('post_bookmarks')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('post_id', post.id)
        .limit(1)
        .maybeSingle()

      if (bookmarkError) {
        console.error('❌ [refreshPostData] Error checking bookmark:', bookmarkError)
      } else {
        console.log('✅ [refreshPostData] Bookmark data:', bookmarkData)
        console.log('🔖 [refreshPostData] Is bookmarked:', !!bookmarkData)
        setIsBookmarked(!!bookmarkData)
      }
      
      console.log('✅ [refreshPostData] Refresh complete')
    } catch (err) {
      console.error('❌ [refreshPostData] Unexpected error:', err)
    }
  }

  return (
    <div className="group bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-300/60 transition-all duration-300">
      {/* Thumbnail */}
      {post.thumbnail_url && (
        <Link to={`/post/${post.id}`} className="block">
          <div className="relative w-full h-56 bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden">
            <img 
              src={post.thumbnail_url} 
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Category Badge on Thumbnail */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div className="bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-slate-700 shadow-lg">
                {post.category}
              </div>
              {/* Trending Badge */}
              <CompactTrendingBadge trendingScore={post.trending_score} />
            </div>

            {/* Premium Badge on Thumbnail */}
            {post.is_premium && (
              <div className="absolute top-4 right-4">
                <PremiumBadge size="small" />
              </div>
            )}

            {/* Lock Overlay for Premium Content */}
            {isLocked && (
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/60 to-transparent flex items-end justify-center pb-6">
                <div className="text-center">
                  <span className="text-4xl mb-2 block">🔒</span>
                  <p className="text-white font-bold text-sm">Skillio+ Exclusive</p>
                </div>
              </div>
            )}
          </div>
        </Link>
      )}

      <div className="p-6">
        {/* Creator Info */}
        {showAuthor && post.profiles && (
          <div className="flex items-center justify-between mb-5">
            <Link 
              to={`/u/${post.profiles.username}`}
              className="no-underline flex items-center gap-3 group/author flex-1 min-w-0"
            >
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-600 via-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-purple-500/30 group-hover/author:scale-110 transition-transform flex-shrink-0">
                {post.profiles.avatar_url ? (
                  <img src={post.profiles.avatar_url} alt={post.profiles.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  post.profiles.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-900 group-hover/author:text-purple-600 transition-colors truncate">
                    {post.profiles.name}
                  </p>
                  {post.profiles.is_premium && (
                    <PremiumBadge size="tiny" />
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate">
                  @{post.profiles.username}
                </p>
              </div>
            </Link>
            
            {/* Follow Button */}
            <FollowButton 
              profileId={post.profiles.id}
              profileUsername={post.profiles.username}
              currentUser={currentUser}
              size="small"
              showCount={false}
            />
          </div>
        )}

        {/* Title */}
        <Link to={`/post/${post.id}`} className="no-underline">
          <div className="flex items-start gap-2 mb-3">
            <h3 className="flex-1 text-xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors line-clamp-2 leading-tight">
              {post.title}
            </h3>
            {post.is_premium && !post.thumbnail_url && (
              <PremiumBadge size="small" />
            )}
          </div>
        </Link>

        {/* Excerpt */}
        <Link to={`/post/${post.id}`} className="no-underline">
          <p className={`text-slate-600 leading-relaxed mb-5 text-sm line-clamp-3 ${isLocked ? 'blur-sm' : ''}`}>
            {post.excerpt}
          </p>
        </Link>

        {/* Premium Lock Message */}
        {isLocked && (
          <div className="mb-5 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔒</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">Skillio+ Exclusive</p>
                <p className="text-xs text-slate-600">Upgrade to unlock this premium content</p>
              </div>
              <Link to="/premium">
                <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:scale-105 transition-all">
                  Upgrade
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Engagement Stats */}
        <div className="flex items-center justify-between pt-5 border-t border-slate-100">
          <div className="flex items-center gap-5 text-sm">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={loading}
              className={`group/like flex items-center gap-2 transition-all duration-300 ${
                isLiked ? 'text-red-500' : 'text-slate-600 hover:text-red-500'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className={`text-lg transition-transform duration-300 ${
                isLiked ? 'scale-125' : 'group-hover/like:scale-125'
              }`}>
                {isLiked ? '❤️' : '🤍'}
              </span>
              <span className="font-semibold">{likesCount}</span>
            </button>

            {/* Comments */}
            <Link to={`/post/${post.id}`} className="group/comment flex items-center gap-2 hover:text-purple-600 transition-colors no-underline text-slate-600">
              <span className="text-lg group-hover/comment:scale-125 transition-transform">💬</span>
              <span className="font-semibold">{commentsCount}</span>
            </Link>

            {/* Views */}
            <CompactViewCounter viewCount={post.views_count || 0} />
          </div>

          {/* Bookmark Button */}
          <button
            onClick={handleBookmark}
            disabled={loading}
            className={`group/bookmark px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
              isBookmarked 
                ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg shadow-purple-500/40 hover:shadow-xl hover:scale-105' 
                : 'bg-slate-100 text-slate-600 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-500 hover:text-white hover:scale-105 hover:shadow-lg'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className={`inline-block transition-transform duration-300 ${isBookmarked ? 'scale-110' : 'group-hover/bookmark:scale-110'}`}>
              {isBookmarked ? '🔖' : '🔖'}
            </span>
            {' '}
            {isBookmarked ? 'Tersimpan' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PostCard
