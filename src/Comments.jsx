import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from './services/supabaseClient'
import PremiumBadge from './components/PremiumBadge'

function CommentItem({ comment, currentUser, onReplySubmit, level = 0, allReplies = [] }) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showReplies, setShowReplies] = useState(false)

  const maxLevel = 3 // Maximum nesting level
  
  // Get replies for this comment from allReplies prop (database as source of truth)
  const commentReplies = allReplies.filter(reply => reply.parent_comment_id === comment.id)
  const hasReplies = commentReplies.length > 0

  // Auto-expand replies if they exist (for persistence after refresh)
  useEffect(() => {
    if (hasReplies && !showReplies) {
      setShowReplies(true)
    }
  }, [hasReplies])

  async function handleSubmitReply(e) {
    e.preventDefault()

    if (!currentUser) {
      alert('Silakan login terlebih dahulu')
      return
    }

    if (!replyContent.trim()) {
      alert('Balasan tidak boleh kosong')
      return
    }

    setSubmitting(true)

    console.log('💬 [Comments] Submitting reply...')
    console.log('💬 [Comments] User ID:', currentUser.id)
    console.log('💬 [Comments] Post ID:', comment.post_id)
    console.log('💬 [Comments] Parent Comment ID:', comment.id)
    console.log('💬 [Comments] Reply content length:', replyContent.trim().length)

    const { data, error } = await supabase
      .from('comments')
      .insert([{
        user_id: currentUser.id,
        post_id: comment.post_id,
        content: replyContent.trim(),
        parent_comment_id: comment.id
      }])
      .select('*, profiles(username, name, avatar_url, is_premium)')

    console.log('💬 [Comments] Reply insert result:', { data, error })

    if (error) {
      console.error('❌ [Comments] Error inserting reply:', error)
      alert('Error: ' + error.message)
    } else {
      console.log('✅ [Comments] Reply inserted successfully')
      console.log('✅ [Comments] Inserted reply records:', data?.length || 0)
      setReplyContent('')
      setShowReplyForm(false)
      setShowReplies(true)
      // Trigger parent refresh to fetch all comments from database
      console.log('🔄 [Comments] Triggering parent refresh...')
      if (onReplySubmit) onReplySubmit()
    }

    setSubmitting(false)
  }

  // Calculate indentation with thread indicator
  const hasThreadLine = level > 0
  const indentClass = level > 0 ? 'ml-6 md:ml-10' : ''

  return (
    <div className={`relative ${indentClass}`}>
      {/* Thread Line Indicator */}
      {hasThreadLine && (
        <div className="absolute left-[-12px] md:left-[-20px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-purple-200 to-transparent"></div>
      )}

      {/* Comment Card */}
      <div className="group relative bg-white border border-slate-200 rounded-2xl p-4 hover:border-purple-300 hover:shadow-md transition-all duration-300">
        {/* Comment Header */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <Link 
            to={comment.profiles?.username ? `/u/${comment.profiles.username}` : '#'}
            className="no-underline flex-shrink-0"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center text-white text-sm font-bold ring-2 ring-white shadow-md hover:scale-110 transition-transform duration-300 overflow-hidden">
              {comment.profiles?.avatar_url ? (
                <img 
                  src={comment.profiles.avatar_url} 
                  alt={comment.profiles.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                comment.profiles?.name?.charAt(0).toUpperCase() || '?'
              )}
            </div>
          </Link>

          {/* Comment Content */}
          <div className="flex-1 min-w-0">
            {/* User Info & Time */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {comment.profiles?.username ? (
                <Link 
                  to={`/u/${comment.profiles.username}`}
                  className="no-underline"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 hover:text-purple-600 transition-colors text-sm">
                      {comment.profiles.name}
                    </span>
                    {comment.profiles.is_premium && (
                      <PremiumBadge size="tiny" />
                    )}
                  </div>
                </Link>
              ) : (
                <span className="font-bold text-slate-900 text-sm">Anonymous</span>
              )}
              
              <span className="text-slate-400 text-xs">•</span>
              
              <span className="text-slate-500 text-xs">
                {new Date(comment.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            
            {/* Comment Text */}
            <p className="text-slate-700 leading-relaxed text-[15px] mb-3 whitespace-pre-wrap">
              {comment.content}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              {/* Reply Button */}
              {currentUser && level < maxLevel && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="group/btn flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-purple-600 transition-colors"
                >
                  <span className="group-hover/btn:scale-110 transition-transform">💬</span>
                  <span>{showReplyForm ? 'Batal' : 'Balas'}</span>
                </button>
              )}
              
              {/* View Replies Button */}
              {hasReplies && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="group/btn flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                >
                  <span className="group-hover/btn:scale-110 transition-transform">
                    {showReplies ? '▼' : '▶'}
                  </span>
                  <span>
                    {showReplies ? 'Sembunyikan' : 'Lihat'} {commentReplies.length} balasan
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <div className="mt-4 ml-0 md:ml-13 animate-[slideDown_0.3s_ease-out]">
            <form onSubmit={handleSubmitReply} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Tulis balasan Anda..."
                rows="3"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-300 bg-white outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 font-[inherit] resize-none"
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  disabled={submitting || !replyContent.trim()}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                    submitting || !replyContent.trim()
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:shadow-lg hover:-translate-y-0.5'
                  }`}
                >
                  {submitting ? 'Mengirim...' : 'Kirim Balasan'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReplyForm(false)
                    setReplyContent('')
                  }}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Nested Replies */}
      {showReplies && hasReplies && (
        <div className="mt-3 space-y-3 animate-[slideDown_0.3s_ease-out]">
          {commentReplies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUser={currentUser}
              onReplySubmit={onReplySubmit}
              level={level + 1}
              allReplies={allReplies}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function Comments({ postId }) {
  const [allComments, setAllComments] = useState([]) // All comments including replies
  const [mainComments, setMainComments] = useState([]) // Only top-level comments
  const [newComment, setNewComment] = useState('')
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getCurrentUser()
    fetchAllComments()
  }, [postId])

  async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  async function fetchAllComments() {
    console.log('🔄 [Comments] Fetching all comments for post:', postId)
    
    // Fetch ALL comments (both main and replies) in one query
    // This is the key to persistence - we fetch everything from database
    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles(username, name, avatar_url, is_premium)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('❌ [Comments] Error fetching comments:', error)
      setLoading(false)
      return
    }

    console.log('✅ [Comments] Fetched comments:', data?.length)
    
    // Store all comments
    setAllComments(data || [])
    
    // Filter main comments (parent_comment_id is null)
    const mainOnly = (data || []).filter(comment => comment.parent_comment_id === null)
    setMainComments(mainOnly)
    
    console.log('📊 [Comments] Main comments:', mainOnly.length)
    console.log('📊 [Comments] Total comments (including replies):', data?.length)
    
    setLoading(false)
  }

  async function handleSubmitComment(e) {
    e.preventDefault()

    if (!currentUser) {
      alert('Silakan login terlebih dahulu untuk berkomentar')
      return
    }

    if (!newComment.trim()) {
      alert('Komentar tidak boleh kosong')
      return
    }

    setSubmitting(true)

    console.log('💬 [Comments] Submitting new comment...')
    console.log('💬 [Comments] User ID:', currentUser.id)
    console.log('💬 [Comments] Post ID:', postId)
    console.log('💬 [Comments] Content length:', newComment.trim().length)

    const { data, error } = await supabase
      .from('comments')
      .insert([{
        user_id: currentUser.id,
        post_id: postId,
        content: newComment.trim(),
        parent_comment_id: null
      }])
      .select('*, profiles(username, name, avatar_url, is_premium)')

    console.log('💬 [Comments] Insert result:', { data, error })

    if (error) {
      console.error('❌ [Comments] Error inserting comment:', error)
      alert('Error: ' + error.message)
    } else {
      console.log('✅ [Comments] Comment inserted successfully')
      console.log('✅ [Comments] Inserted records:', data?.length || 0)
      setNewComment('')
      // Refresh all comments from database to get the latest state
      console.log('🔄 [Comments] Refreshing comments...')
      await fetchAllComments()
      console.log('✅ [Comments] Comments refreshed')
    }

    setSubmitting(false)
  }

  const totalCount = allComments.length

  return (
    <div className="bg-gradient-to-br from-white to-slate-50/50 border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 md:px-8 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center text-white shadow-lg">
              <span className="text-xl">💬</span>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 m-0">
                Diskusi
              </h2>
              <p className="text-sm text-slate-500 m-0">
                {totalCount} {totalCount === 1 ? 'komentar' : 'komentar'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-8 py-6">
        {/* Form Tambah Komentar */}
        {currentUser ? (
          <div className="mb-8">
            <form onSubmit={handleSubmitComment}>
              <div className="flex gap-3">
                {/* Avatar */}
                <Link 
                  to={currentUser.user_metadata?.username ? `/u/${currentUser.user_metadata.username}` : '#'}
                  className="no-underline flex-shrink-0"
                >
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center text-white text-sm font-bold ring-2 ring-white shadow-md hover:scale-110 transition-transform duration-300 overflow-hidden">
                    {currentUser.user_metadata?.avatar_url ? (
                      <img 
                        src={currentUser.user_metadata.avatar_url} 
                        alt="You" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      '👤'
                    )}
                  </div>
                </Link>
                
                {/* Input */}
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Bagikan insight atau pengalaman Anda..."
                    rows="4"
                    className="w-full px-4 py-3 text-[15px] rounded-2xl border-2 border-slate-200 bg-white outline-none transition-all focus:border-purple-400 focus:ring-4 focus:ring-purple-400/10 font-[inherit] resize-none shadow-sm"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-slate-500 m-0">
                      Gunakan bahasa yang sopan dan konstruktif
                    </p>
                    <button
                      type="submit"
                      disabled={submitting || !newComment.trim()}
                      className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                        submitting || !newComment.trim()
                          ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:-translate-y-0.5 hover:shadow-lg shadow-purple-500/30'
                      }`}
                    >
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          Mengirim...
                        </span>
                      ) : (
                        'Kirim Komentar'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-2 border-purple-200 rounded-2xl p-8 mb-8 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">
              💬
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Bergabunglah dalam Diskusi
            </h3>
            <p className="text-slate-600 mb-5 text-sm">
              Login untuk berbagi insight dan berinteraksi dengan komunitas kreator
            </p>
            <Link to="/login">
              <button className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-8 py-3 text-sm rounded-xl font-semibold hover:-translate-y-0.5 hover:shadow-xl shadow-purple-500/30 transition-all">
                Login untuk Berkomentar
              </button>
            </Link>
          </div>
        )}

        {/* Daftar Komentar */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin"></div>
              <p className="text-sm text-slate-600 font-medium">Memuat diskusi...</p>
            </div>
          </div>
        ) : mainComments.length === 0 ? (
          <div className="text-center py-16 px-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border-2 border-dashed border-slate-300">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-5xl mx-auto mb-5 shadow-lg">
              💭
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Belum Ada Diskusi
            </h3>
            <p className="text-slate-600 text-base max-w-md mx-auto">
              Jadilah yang pertama berbagi insight dan memulai percakapan!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {mainComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUser={currentUser}
                onReplySubmit={fetchAllComments}
                level={0}
                allReplies={allComments}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Comments
