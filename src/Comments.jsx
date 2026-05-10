import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from './services/supabaseClient'

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
    case 'message':
      return <svg {...common}><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z"/></svg>
    case 'send':
      return <svg {...common}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
    case 'reply':
      return <svg {...common}><path d="M9 17l-5-5 5-5M4 12h12a4 4 0 0 1 4 4v4"/></svg>
    case 'chevron-down':
      return <svg {...common}><path d="M6 9l6 6 6-6"/></svg>
    case 'chevron-up':
      return <svg {...common}><path d="M18 15l-6-6-6 6"/></svg>
    case 'dot':
      return <svg {...common} fill="currentColor" stroke="none"><circle cx="12" cy="12" r="2"/></svg>
    case 'sparkles':
      return <svg {...common}><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z"/></svg>
    case 'user':
      return <svg {...common}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
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
  return `${Math.floor(diff / 2592000)}bl`
}

/* ---------------------------------------------------------------------------
 * CommentItem
 * ------------------------------------------------------------------------- */
function CommentItem({ comment, currentUser, onReplySubmit, level = 0, allReplies = [] }) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showReplies, setShowReplies] = useState(false)

  const maxLevel = 3
  const commentReplies = allReplies.filter((r) => r.parent_comment_id === comment.id)
  const hasReplies = commentReplies.length > 0

  useEffect(() => {
    if (hasReplies && !showReplies) setShowReplies(true)
  }, [hasReplies])

  async function handleSubmitReply(e) {
    e.preventDefault()
    if (!currentUser) return
    if (!replyContent.trim()) return

    setSubmitting(true)
    const { error } = await supabase
      .from('comments')
      .insert([
        {
          user_id: currentUser.id,
          post_id: comment.post_id,
          content: replyContent.trim(),
          parent_comment_id: comment.id,
        },
      ])
      .select('*, profiles(username, name, avatar_url, is_premium)')

    if (!error) {
      setReplyContent('')
      setShowReplyForm(false)
      setShowReplies(true)
      if (onReplySubmit) onReplySubmit()
    }
    setSubmitting(false)
  }

  const profile = comment.profiles
  const initial = profile?.name?.charAt(0).toUpperCase() || '?'
  const indentClass = level > 0 ? 'pl-6 sm:pl-9 border-l-2 border-[#F3F4F6]' : ''

  return (
    <div className={`relative ${indentClass}`}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Link
          to={profile?.username ? `/u/${profile.username}` : '#'}
          className="shrink-0"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold overflow-hidden ring-2 ring-white shadow-sm">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                initial
              )}
            </div>
            {profile?.is_premium && (
              <span
                title="Skillio+"
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#3B82F6] text-white flex items-center justify-center ring-2 ring-white"
              >
                <Icon name="sparkles" className="w-2 h-2" />
              </span>
            )}
          </div>
        </Link>

        <div className="min-w-0 flex-1">
          {/* Bubble */}
          <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl rounded-tl-sm px-4 py-3">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              {profile?.username ? (
                <Link
                  to={`/u/${profile.username}`}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[#111827] hover:text-[#3B82F6] transition-colors"
                >
                  {profile.name}
                </Link>
              ) : (
                <span className="text-sm font-semibold text-[#111827]">Anonymous</span>
              )}
              {profile?.is_premium && (
                <span
                  title="Skillio+"
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[#3B82F6]/10 text-[#3B82F6] text-[10px] font-semibold"
                >
                  <Icon name="sparkles" className="w-2.5 h-2.5" />
                  Skillio+
                </span>
              )}
              {profile?.username && (
                <span className="text-xs text-[#6B7280]">@{profile.username}</span>
              )}
              <Icon name="dot" className="w-2 h-2 text-[#9CA3AF]" />
              <span className="text-xs text-[#6B7280]">
                {timeAgo(comment.created_at)}
              </span>
            </div>

            <p className="text-[14px] text-[#111827] leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-2 ml-1">
            {currentUser && level < maxLevel && (
              <button
                onClick={() => setShowReplyForm((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B7280] hover:text-[#3B82F6] transition-colors"
              >
                <Icon name="reply" className="w-3.5 h-3.5" />
                {showReplyForm ? 'Batal' : 'Balas'}
              </button>
            )}
            {hasReplies && (
              <button
                onClick={() => setShowReplies((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#3B82F6] hover:text-[#2563EB] transition-colors"
              >
                <Icon
                  name={showReplies ? 'chevron-up' : 'chevron-down'}
                  className="w-3.5 h-3.5"
                />
                {showReplies ? 'Sembunyikan' : 'Lihat'} {commentReplies.length} balasan
              </button>
            )}
          </div>

          {/* Reply form */}
          <AnimatePresence>
            {showReplyForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmitReply}
                className="overflow-hidden"
              >
                <div className="mt-3 bg-white border border-[#E5E7EB] rounded-2xl p-3">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Tulis balasan kamu..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm bg-white outline-none placeholder:text-[#9CA3AF] resize-none"
                    autoFocus
                  />
                  <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-[#F3F4F6]">
                    <button
                      type="button"
                      onClick={() => {
                        setShowReplyForm(false)
                        setReplyContent('')
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#111827] hover:bg-[#F3F4F6] transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !replyContent.trim()}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        submitting || !replyContent.trim()
                          ? 'bg-[#9CA3AF] text-white cursor-not-allowed'
                          : 'bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-sm shadow-blue-500/20'
                      }`}
                    >
                      {submitting ? (
                        <>
                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Mengirim
                        </>
                      ) : (
                        <>
                          <Icon name="send" className="w-3.5 h-3.5" />
                          Kirim balasan
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Nested replies */}
          {showReplies && hasReplies && (
            <div className="mt-4 space-y-4">
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
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Comments root
 * ------------------------------------------------------------------------- */
function Comments({ postId }) {
  const [allComments, setAllComments] = useState([])
  const [mainComments, setMainComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [currentUser, setCurrentUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    init()
    fetchAllComments()
  }, [postId])

  async function init() {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, name, avatar_url')
        .eq('id', user.id)
        .maybeSingle()
      setProfile(data || null)
    }
  }

  async function fetchAllComments() {
    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles(username, name, avatar_url, is_premium)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (!error) {
      setAllComments(data || [])
      setMainComments((data || []).filter((c) => c.parent_comment_id === null))
    }
    setLoading(false)
  }

  async function handleSubmitComment(e) {
    e.preventDefault()
    if (!currentUser) return
    if (!newComment.trim()) return

    setSubmitting(true)
    const { error } = await supabase
      .from('comments')
      .insert([
        {
          user_id: currentUser.id,
          post_id: postId,
          content: newComment.trim(),
          parent_comment_id: null,
        },
      ])
      .select('*, profiles(username, name, avatar_url, is_premium)')

    if (!error) {
      setNewComment('')
      await fetchAllComments()
    }
    setSubmitting(false)
  }

  const totalCount = allComments.length
  const myInitial = (profile?.name || currentUser?.email || 'U').charAt(0).toUpperCase()

  return (
    <div
      data-comments-anchor
      className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 sm:px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6]">
            <Icon name="message" className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-[#111827]">Diskusi</h2>
            <p className="text-xs text-[#6B7280]">
              {totalCount} {totalCount === 1 ? 'komentar' : 'komentar'}
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 sm:px-6 py-6">
        {/* Compose */}
        {currentUser ? (
          <form onSubmit={handleSubmitComment} className="mb-8">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold overflow-hidden ring-2 ring-white shadow-sm">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="You"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  myInitial
                )}
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Bagikan insight atau respon kamu..."
                  rows={3}
                  className="w-full px-4 py-3 text-sm bg-white border border-[#E5E7EB] rounded-2xl outline-none placeholder:text-[#9CA3AF] focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
                />
                <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
                  <p className="text-xs text-[#6B7280]">
                    Jaga diskusi tetap konstruktif dan sopan.
                  </p>
                  <button
                    type="submit"
                    disabled={submitting || !newComment.trim()}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      submitting || !newComment.trim()
                        ? 'bg-[#9CA3AF] text-white cursor-not-allowed'
                        : 'bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/25'
                    }`}
                  >
                    {submitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Mengirim
                      </>
                    ) : (
                      <>
                        <Icon name="send" className="w-4 h-4" />
                        Kirim komentar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="mb-8 bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] mb-3">
              <Icon name="user" className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-[#111827] mb-1">
              Login untuk berdiskusi
            </h3>
            <p className="text-xs text-[#6B7280] mb-4 max-w-sm mx-auto">
              Bergabung untuk berbagi respon dan terhubung dengan creator lain.
            </p>
            <Link to="/login">
              <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-sm shadow-blue-500/20 transition-colors">
                Login
              </button>
            </Link>
          </div>
        )}

        {/* Comments list */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-[#F3F4F6] shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-32 bg-[#F3F4F6] rounded" />
                  <div className="h-16 bg-[#F3F4F6] rounded-2xl" />
                </div>
              </div>
            ))}
          </div>
        ) : mainComments.length === 0 ? (
          <div className="text-center py-10 bg-[#FAFAFA] rounded-2xl border border-dashed border-[#E5E7EB]">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] mb-3">
              <Icon name="message" className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-[#111827] mb-1">
              Belum ada diskusi
            </h3>
            <p className="text-xs text-[#6B7280] max-w-xs mx-auto">
              Jadilah yang pertama membuka diskusi tentang insight ini.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
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
