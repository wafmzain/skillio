import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from './services/supabaseClient'
import Comments from './Comments'
import { usePremium } from './hooks/usePremium'
import { upgradeToPremium } from './services/premiumService'
import PremiumPaywall from './components/PremiumPaywall'
import PremiumBadge from './components/PremiumBadge'
import { useAISummary } from './hooks/useAISummary'
import AISummaryButton from './components/ai/AISummaryButton'
import AISummaryCard from './components/ai/AISummaryCard'
import AISummaryLoading from './components/ai/AISummaryLoading'
import AISummaryError from './components/ai/AISummaryError'
import { usePostView } from './hooks/usePostView'
import { DetailedViewCounter } from './components/ViewCounter'

function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [bookmarksCount, setBookmarksCount] = useState(0)
  const [currentUser, setCurrentUser] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const { isPremium, loading: premiumLoading, refetch: refetchPremium } = usePremium(currentUser?.id)
  const isLocked = post?.is_premium && !isPremium

  // AI Summary hook
  const {
    summary,
    loading: aiLoading,
    error: aiError,
    handleGenerateSummary,
    resetSummary,
    retrySummary
  } = useAISummary()

  // Post View hook - automatically increments view when component mounts
  const {
    viewCount,
    loading: viewLoading,
    hasIncremented,
    refreshViewCount
  } = usePostView(id, currentUser)

  // Refresh view count when view is incremented
  useEffect(() => {
    if (hasIncremented) {
      const timer = setTimeout(() => {
        refreshViewCount()
      }, 2000) // Wait 2 seconds then refresh
      
      return () => clearTimeout(timer)
    }
  }, [hasIncremented, refreshViewCount])

  async function handleUpgrade(paymentType) {
    if (!currentUser) return

    const result = await upgradeToPremium(currentUser.id, paymentType)
    
    if (result.success) {
      await refetchPremium()
      alert('🎉 Selamat! Anda sekarang adalah member Skillio+')
    } else {
      alert('Gagal upgrade: ' + result.error)
    }
  }

  async function handleAISummary() {
    if (!post) {
      console.error('❌ [PostDetail] No post data')
      return
    }

    // Combine title, excerpt, and content for summary
    const fullContent = `${post.title}\n\n${post.excerpt}\n\n${post.content}`
    
    const result = await handleGenerateSummary(fullContent)
    
    if (!result.success && result.error) {
      console.error('❌ [PostDetail] Error from handleGenerateSummary:', result.error)
    }
  }

  async function handleRetrySummary() {
    if (!post) return
    
    const fullContent = `${post.title}\n\n${post.excerpt}\n\n${post.content}`
    await retrySummary(fullContent)
  }

  useEffect(() => {
    fetchPostDetail()
  }, [id])

  async function fetchPostDetail() {
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(username, name, avatar_url, id, is_premium)')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching post:', error)
    } else {
      setPost(data)
      
      // If counts are null, count manually
      if (data.likes_count === null) {
        console.warn('⚠️ [PostDetail] likes_count is null, counting manually...')
        const { count } = await supabase
          .from('post_likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', id)
        setLikesCount(count || 0)
      } else {
        setLikesCount(data.likes_count || 0)
      }
      
      if (data.bookmarks_count === null) {
        console.warn('⚠️ [PostDetail] bookmarks_count is null, counting manually...')
        const { count } = await supabase
          .from('post_bookmarks')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', id)
        setBookmarksCount(count || 0)
      } else {
        setBookmarksCount(data.bookmarks_count || 0)
      }
      
      // Count comments manually if null
      if (data.comments_count === null) {
        console.warn('⚠️ [PostDetail] comments_count is null, counting manually...')
        const { count } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', id)
        
        // Update post object with manual count
        setPost({ ...data, comments_count: count || 0 })
      }
      
      // Increment views
      await supabase.rpc('increment_post_views', { post_uuid: id })

      // Check user interactions
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUser(user)
        checkUserInteractions(user.id)
      }
    }
    setLoading(false)
  }

  async function checkUserInteractions(userId) {
    try {
      // Check bookmark
      const { data: bookmarkData, error: bookmarkError } = await supabase
        .from('post_bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq('post_id', id)
        .maybeSingle()

      if (bookmarkError) {
        console.error('Error checking bookmark:', bookmarkError)
        setIsBookmarked(false)
      } else {
        setIsBookmarked(!!bookmarkData)
      }

      // Check like
      const { data: likeData, error: likeError } = await supabase
        .from('post_likes')
        .select('id')
        .eq('user_id', userId)
        .eq('post_id', id)
        .maybeSingle()

      if (likeError) {
        console.error('Error checking like:', likeError)
        setIsLiked(false)
      } else {
        setIsLiked(!!likeData)
      }
    } catch (err) {
      console.error('Error in checkUserInteractions:', err)
      setIsLiked(false)
      setIsBookmarked(false)
    }
  }

  async function refreshPostData() {
    console.log('🔄 [PostDetail refreshPostData] Starting refresh for post:', id)
    console.log('🔄 [PostDetail refreshPostData] Current user:', currentUser?.id)
    
    try {
      // Fetch updated post data from database
      const { data: updatedPost, error: postError } = await supabase
        .from('posts')
        .select('likes_count, bookmarks_count')
        .eq('id', id)
        .single()

      if (postError) {
        console.error('❌ [PostDetail refreshPostData] Error fetching updated post:', postError)
      } else {
        console.log('✅ [PostDetail refreshPostData] Updated post data:', updatedPost)
        console.log('📊 [PostDetail refreshPostData] New likes_count:', updatedPost.likes_count)
        console.log('📊 [PostDetail refreshPostData] New bookmarks_count:', updatedPost.bookmarks_count)
        
        // If counts are null, count manually from tables
        if (updatedPost.likes_count === null) {
          console.warn('⚠️ [PostDetail refreshPostData] likes_count is null, counting manually...')
          const { count, error: countError } = await supabase
            .from('post_likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', id)
          
          if (!countError) {
            console.log('📊 [PostDetail refreshPostData] Manual likes count:', count)
            setLikesCount(count || 0)
          }
        } else {
          setLikesCount(updatedPost.likes_count || 0)
        }
        
        if (updatedPost.bookmarks_count === null) {
          console.warn('⚠️ [PostDetail refreshPostData] bookmarks_count is null, counting manually...')
          const { count, error: countError } = await supabase
            .from('post_bookmarks')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', id)
          
          if (!countError) {
            console.log('📊 [PostDetail refreshPostData] Manual bookmarks count:', count)
            setBookmarksCount(count || 0)
          }
        } else {
          setBookmarksCount(updatedPost.bookmarks_count || 0)
        }
      }

      // Check current user's like status - use limit(1)
      const { data: likeData, error: likeError } = await supabase
        .from('post_likes')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('post_id', id)
        .limit(1)
        .maybeSingle()

      if (likeError) {
        console.error('❌ [PostDetail refreshPostData] Error checking like:', likeError)
      } else {
        console.log('✅ [PostDetail refreshPostData] Like data:', likeData)
        console.log('👍 [PostDetail refreshPostData] Is liked:', !!likeData)
        setIsLiked(!!likeData)
      }

      // Check current user's bookmark status
      const { data: bookmarkData, error: bookmarkError } = await supabase
        .from('post_bookmarks')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('post_id', id)
        .limit(1)
        .maybeSingle()

      if (bookmarkError) {
        console.error('❌ [PostDetail refreshPostData] Error checking bookmark:', bookmarkError)
      } else {
        console.log('✅ [PostDetail refreshPostData] Bookmark data:', bookmarkData)
        console.log('🔖 [PostDetail refreshPostData] Is bookmarked:', !!bookmarkData)
        setIsBookmarked(!!bookmarkData)
      }
      
      console.log('✅ [PostDetail refreshPostData] Refresh complete')
    } catch (err) {
      console.error('❌ [PostDetail refreshPostData] Unexpected error:', err)
    }
  }

  async function handleBookmark() {
    if (!currentUser) {
      alert('Silakan login terlebih dahulu')
      return
    }

    if (actionLoading) return
    setActionLoading(true)

    try {
      if (isBookmarked) {
        const { error } = await supabase
          .from('post_bookmarks')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('post_id', id)

        if (error) {
          console.error('Error removing bookmark:', error)
          alert('Gagal menghapus bookmark')
        }
      } else {
        const { error } = await supabase
          .from('post_bookmarks')
          .insert([{ user_id: currentUser.id, post_id: id }])

        if (error) {
          console.error('Error adding bookmark:', error)
          
          if (error.code === '23505') {
            setIsBookmarked(true)
          } else {
            alert('Gagal menambahkan bookmark')
          }
        }
      }

      // Fetch fresh data from database
      await refreshPostData()
      
    } catch (err) {
      console.error('Unexpected error:', err)
      alert('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleLike() {
    console.log('❤️ [PostDetail handleLike] Like button clicked')
    console.log('❤️ [PostDetail handleLike] Current user:', currentUser?.id)
    console.log('❤️ [PostDetail handleLike] Post ID:', id)
    console.log('❤️ [PostDetail handleLike] Current isLiked:', isLiked)
    console.log('❤️ [PostDetail handleLike] Current likesCount:', likesCount)

    if (!currentUser) {
      console.warn('⚠️ [PostDetail handleLike] No current user')
      alert('Silakan login terlebih dahulu')
      return
    }

    if (actionLoading) {
      console.warn('⚠️ [PostDetail handleLike] Already loading')
      return
    }
    
    setActionLoading(true)

    try {
      if (isLiked) {
        console.log('👎 [PostDetail handleLike] Unliking post...')
        // Unlike - Remove like
        const { data, error } = await supabase
          .from('post_likes')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('post_id', id)
          .select()

        console.log('👎 [PostDetail handleLike] Delete result:', { data, error })

        if (error) {
          console.error('❌ [PostDetail handleLike] Error removing like:', error)
          alert(`Gagal menghapus like: ${error.message}`)
        } else {
          console.log('✅ [PostDetail handleLike] Like removed successfully')
          console.log('✅ [PostDetail handleLike] Deleted records:', data?.length || 0)
        }
      } else {
        console.log('👍 [PostDetail handleLike] Liking post...')
        // Like - Add like
        const { data, error } = await supabase
          .from('post_likes')
          .insert([{ user_id: currentUser.id, post_id: id }])
          .select()

        console.log('👍 [PostDetail handleLike] Insert result:', { data, error })

        if (error) {
          console.error('❌ [PostDetail handleLike] Error adding like:', error)
          
          if (error.code === '23505') {
            console.warn('⚠️ [PostDetail handleLike] Already liked (duplicate)')
            setIsLiked(true)
          } else if (error.code === '42P01') {
            alert('Tabel post_likes belum dibuat. Silakan jalankan database setup.')
          } else {
            alert(`Gagal menambahkan like: ${error.message}`)
          }
        } else {
          console.log('✅ [PostDetail handleLike] Like added successfully')
          console.log('✅ [PostDetail handleLike] Inserted records:', data?.length || 0)
        }
      }

      // Fetch fresh data from database
      console.log('🔄 [PostDetail handleLike] Refreshing post data...')
      await refreshPostData()
      console.log('✅ [PostDetail handleLike] Post data refreshed')
      
    } catch (err) {
      console.error('❌ [PostDetail handleLike] Unexpected error:', err)
      alert('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setActionLoading(false)
      console.log('✅ [PostDetail handleLike] Like operation complete')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh] text-xl">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="max-w-[800px] my-12 mx-auto p-10 text-center">
        <h2 className="text-slate-900 mb-6">Post tidak ditemukan</h2>
        <Link to="/home">
          <button className="bg-gradient-to-r from-purple-600 to-purple-400 text-white px-6 py-3 text-base rounded-xl font-semibold hover:-translate-y-0.5 transition-all">
            Kembali ke Home
          </button>
        </Link>
      </div>
    )
  }

  return (
    <div className="py-10 px-5 max-w-[900px] mx-auto">
      {/* Back Button */}
      <Link to="/home">
        <button className="bg-slate-600 text-white px-5 py-2.5 rounded-xl font-semibold mb-5 hover:bg-slate-700 transition-colors">
          ← Kembali
        </button>
      </Link>

      {/* Post Detail */}
      <article className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-8 overflow-hidden">


        {/* Thumbnail */}
        {post.thumbnail_url && (
          <div className="relative w-full h-80 bg-slate-100">
            <img 
              src={post.thumbnail_url} 
              alt={post.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
            {post.is_premium && (
              <div className="absolute top-4 right-4">
                <PremiumBadge size="medium" />
              </div>
            )}
          </div>
        )}

        <div className="p-8">
          {/* Category & Date */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-bold">
                {post.category}
              </span>
              {post.is_premium && !post.thumbnail_url && (
                <PremiumBadge size="small" />
              )}
            </div>
            <span className="text-slate-400 text-sm">
              {new Date(post.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-slate-900 mb-4 leading-tight">
            {post.title}
          </h1>

          {/* Creator Info */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-200">
            <Link 
              to={`/u/${post.profiles?.username}`}
              className="no-underline"
            >
              <div className="flex items-center gap-3 group">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center text-white font-bold shadow-lg">
                  {post.profiles?.avatar_url ? (
                    <img src={post.profiles.avatar_url} alt={post.profiles.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    post.profiles?.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                      {post.profiles?.name || 'Anonymous'}
                    </p>
                    {post.profiles?.is_premium && (
                      <PremiumBadge size="tiny" />
                    )}
                  </div>
                  <p className="text-sm text-slate-500">
                    @{post.profiles?.username || 'anonymous'}
                  </p>
                </div>
              </div>
            </Link>

            {/* Bookmark Button Only */}
            <button
              onClick={handleBookmark}
              disabled={actionLoading}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                isBookmarked 
                  ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:-translate-y-0.5' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-105'
              } ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isBookmarked ? '🔖 Tersimpan' : '🔖 Simpan'}
            </button>
          </div>

          {/* Premium Paywall */}
          {isLocked ? (
            <div className="mb-8">
              <PremiumPaywall onUpgrade={handleUpgrade} compact={false} />
            </div>
          ) : (
            <>
              {/* AI Summary Section - Premium Only */}
              {currentUser && isPremium && (
                <div className="mb-8">
                  {/* Show AI Summary Button if no summary yet */}
                  {!summary && !aiLoading && !aiError && (
                    <div className="flex items-center justify-center py-6">
                      <AISummaryButton
                        onClick={handleAISummary}
                        loading={aiLoading}
                      />
                    </div>
                  )}

                  {/* Show Loading State */}
                  {aiLoading && (
                    <div className="mb-6">
                      <AISummaryLoading />
                    </div>
                  )}

                  {/* Show AI Summary Result */}
                  {summary && !aiLoading && (
                    <div className="mb-6">
                      <AISummaryCard 
                        summary={summary} 
                        onClose={resetSummary} 
                      />
                    </div>
                  )}

                  {/* Show Error State */}
                  {aiError && !aiLoading && (
                    <div className="mb-6">
                      <AISummaryError
                        error={aiError}
                        onRetry={handleRetrySummary}
                        onClose={resetSummary}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Excerpt */}
              <div className="bg-slate-50 border-l-4 border-purple-600 p-5 mb-6 rounded-r-xl">
                <p className="text-lg text-slate-700 leading-relaxed italic">
                  {post.excerpt}
                </p>
              </div>

              {/* Content */}
              <div className="prose prose-slate max-w-none">
                <div className="text-slate-700 leading-relaxed text-base whitespace-pre-wrap">
                  {post.content}
                </div>
              </div>
            </>
          )}

          {/* Stats */}
          <div className="flex items-center gap-6 mt-8 pt-6 border-t border-slate-200 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <span>❤️</span>
              <span className="font-medium">{likesCount || 0} likes</span>
            </div>
            <div className="flex items-center gap-2">
              <span>💬</span>
              <span className="font-medium">{post.comments_count || 0} komentar</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🔖</span>
              <span className="font-medium">{bookmarksCount || 0} tersimpan</span>
            </div>
            <DetailedViewCounter 
              viewCount={viewCount || post.views_count || 0}
              loading={viewLoading}
              showTooltip={true}
            />
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <Comments postId={id} />
    </div>
  )
}

export default PostDetail
