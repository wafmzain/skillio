import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from './services/supabaseClient'
import { formatViews } from './utils/formatViews'
import { grantPostCreatedPoints } from './services/pointsIntegration'
import { usePointsToast } from './components/gamification/PointsToast'
import { POINT_VALUES } from './services/gamification'

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
    case 'arrow-left':
      return <svg {...common}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
    case 'arrow-right':
      return <svg {...common}><path d="M5 12h14M13 5l7 7-7 7"/></svg>
    case 'image':
      return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 15l-5-5L5 21"/></svg>
    case 'upload':
      return <svg {...common}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5M12 3v12"/></svg>
    case 'trash':
      return <svg {...common}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/></svg>
    case 'pen':
      return <svg {...common}><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
    case 'type':
      return <svg {...common}><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>
    case 'align':
      return <svg {...common}><path d="M3 6h18M3 12h14M3 18h12"/></svg>
    case 'hash':
      return <svg {...common}><path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"/></svg>
    case 'sparkles':
      return <svg {...common}><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z"/></svg>
    case 'check':
      return <svg {...common}><path d="M20 6L9 17l-5-5"/></svg>
    case 'x':
      return <svg {...common}><path d="M18 6L6 18M6 6l12 12"/></svg>
    case 'eye':
      return <svg {...common}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
    case 'heart':
      return <svg {...common}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6z"/></svg>
    case 'message':
      return <svg {...common}><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z"/></svg>
    case 'bookmark':
      return <svg {...common}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
    case 'info':
      return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/></svg>
    case 'send':
      return <svg {...common}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
    case 'save':
      return <svg {...common}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>
    case 'dot':
      return <svg {...common} fill="currentColor" stroke="none"><circle cx="12" cy="12" r="2"/></svg>
    default:
      return null
  }
}

/* ---------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------- */
const TITLE_MAX = 120
const EXCERPT_MAX = 200
const CONTENT_MIN = 80
const DRAFT_KEY = 'skillio:draft:createpost'

const CATEGORIES = [
  'Design',
  'Programming',
  'Marketing',
  'AI Tools',
  'Productivity',
  'Video Editing',
  'Bisnis',
  'Freelancing',
  'Content Creation',
  'Lainnya',
]

const STEPS = [
  { key: 'thumbnail', label: 'Thumbnail' },
  { key: 'title', label: 'Judul' },
  { key: 'excerpt', label: 'Ringkasan' },
  { key: 'content', label: 'Konten' },
  { key: 'category', label: 'Kategori' },
]

/* ---------------------------------------------------------------------------
 * CreatePost
 * ------------------------------------------------------------------------- */
function CreatePost() {
  const navigate = useNavigate()
  const showPointsToast = usePointsToast()

  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [toast, setToast] = useState(null)

  const fileInputRef = useRef(null)

  /* ---------------------------------- init ------------------------------- */
  useEffect(() => {
    async function init() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        navigate('/login')
        return
      }
      setUser(authUser)

      const { data } = await supabase
        .from('profiles')
        .select('id, username, name, avatar_url, is_premium')
        .eq('id', authUser.id)
        .maybeSingle()
      if (data) setProfile(data)

      // Restore draft
      try {
        const raw = localStorage.getItem(DRAFT_KEY)
        if (raw) {
          const draft = JSON.parse(raw)
          if (draft.user_id === authUser.id) {
            setTitle(draft.title || '')
            setExcerpt(draft.excerpt || '')
            setContent(draft.content || '')
            setCategory(draft.category || '')
            setThumbnailUrl(draft.thumbnail_url || '')
          }
        }
      } catch {
        /* ignore */
      }
    }
    init()
  }, [navigate])

  /* --------------------------- draft persistence -------------------------- */
  useEffect(() => {
    if (!user) return
    const hasAny = title || excerpt || content || category || thumbnailUrl
    if (!hasAny) {
      localStorage.removeItem(DRAFT_KEY)
      return
    }
    const handle = setTimeout(() => {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          user_id: user.id,
          title,
          excerpt,
          content,
          category,
          thumbnail_url: thumbnailUrl,
          saved_at: Date.now(),
        })
      )
    }, 600)
    return () => clearTimeout(handle)
  }, [user, title, excerpt, content, category, thumbnailUrl])

  /* ---------------------------- helpers ---------------------------------- */
  function showToast(message, tone = 'success') {
    setToast({ message, tone })
    setTimeout(() => setToast(null), 3000)
  }

  const completeness = useMemo(() => {
    const checks = {
      thumbnail: !!thumbnailUrl,
      title: title.trim().length > 0,
      excerpt: excerpt.trim().length > 0,
      content: content.trim().length >= CONTENT_MIN,
      category: !!category,
    }
    const required = ['title', 'excerpt', 'content', 'category']
    const done = required.filter((k) => checks[k]).length
    const percent = Math.round((done / required.length) * 100)
    return { checks, percent, required }
  }, [thumbnailUrl, title, excerpt, content, category])

  const canPublish =
    completeness.checks.title &&
    completeness.checks.excerpt &&
    completeness.checks.content &&
    completeness.checks.category

  /* --------------------------- thumbnail upload --------------------------- */
  function validateImage(file) {
    const valid = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!valid.includes(file.type)) {
      showToast('Format harus JPG, PNG, atau WebP', 'error')
      return false
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran maksimal 2MB', 'error')
      return false
    }
    return true
  }

  async function uploadImage(file) {
    if (!validateImage(file) || !user) return
    try {
      setUploading(true)
      const ext = file.name.split('.').pop()
      const fileName = `thumb-${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`
      const filePath = `${user.id}/${fileName}`
      const { error: upErr } = await supabase.storage
        .from('thumbnails')
        .upload(filePath, file, { cacheControl: '3600', upsert: false })
      if (upErr) throw upErr
      const { data: { publicUrl } } = supabase.storage
        .from('thumbnails')
        .getPublicUrl(filePath)
      setThumbnailUrl(publicUrl)
      showToast('Thumbnail diunggah')
    } catch (err) {
      console.error(err)
      showToast(err.message || 'Gagal upload gambar', 'error')
    } finally {
      setUploading(false)
    }
  }

  function handleFileInput(e) {
    const file = e.target.files?.[0]
    if (file) uploadImage(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleDrag(e) {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else if (e.type === 'dragleave') setDragActive(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadImage(file)
  }

  /* -------------------------- ensure profile row ------------------------- */
  async function ensureUserProfile(u) {
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', u.id)
      .maybeSingle()
    if (existing) return
    const { error } = await supabase.from('profiles').insert([
      {
        id: u.id,
        email: u.email,
        name: u.email.split('@')[0],
        username: u.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
      },
    ])
    if (error) throw new Error('Gagal membuat profile: ' + error.message)
  }

  /* ------------------------------ submit --------------------------------- */
  async function handleSubmit(e) {
    if (e) e.preventDefault()
    if (!canPublish || loading) return

    setLoading(true)
    try {
      if (!user) throw new Error('Silakan login terlebih dahulu')
      await ensureUserProfile(user)

      const { error } = await supabase
        .from('posts')
        .insert([
          {
            title: title.trim(),
            excerpt: excerpt.trim(),
            content: content.trim(),
            category,
            thumbnail_url: thumbnailUrl || null,
            user_id: user.id,
          },
        ])
        .select()
      if (error) throw error

      localStorage.removeItem(DRAFT_KEY)
      showToast('Insight dipublikasikan')

      // Grant gamification points (fire-and-forget)
      grantPostCreatedPoints(user.id, null).then(() => {
        if (showPointsToast) showPointsToast({ amount: POINT_VALUES.POST_CREATED, reason: 'post_created' })
      })

      setTimeout(() => navigate('/home'), 700)
    } catch (err) {
      console.error(err)
      showToast(err.message || 'Gagal mempublikasikan', 'error')
    } finally {
      setLoading(false)
    }
  }

  function handleSaveDraft() {
    if (!user) return
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        user_id: user.id,
        title,
        excerpt,
        content,
        category,
        thumbnail_url: thumbnailUrl,
        saved_at: Date.now(),
      })
    )
    showToast('Draft disimpan di perangkat ini')
  }

  function handleDiscard() {
    if (
      !(title || excerpt || content || category || thumbnailUrl) ||
      confirm('Buang semua perubahan? Draft lokal juga akan dihapus.')
    ) {
      localStorage.removeItem(DRAFT_KEY)
      navigate(-1)
    }
  }

  /* ------------------------------ render --------------------------------- */
  const initial =
    (profile?.name || user?.email || 'U').charAt(0).toUpperCase()
  const creatorName = profile?.name || user?.email?.split('@')[0] || 'Creator'
  const creatorUsername = profile?.username || creatorName.toLowerCase()

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-28 lg:pb-10">
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
                  name={toast.tone === 'error' ? 'x' : 'check'}
                  className="w-4 h-4"
                />
                {toast.message}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================
       * HEADER
       * ============================================================== */}
      <header className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-5 lg:py-6">
          <button
            type="button"
            onClick={handleDiscard}
            className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#111827] mb-4 transition-colors"
          >
            <Icon name="arrow-left" className="w-4 h-4" />
            Kembali
          </button>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-semibold mb-3">
                <Icon name="pen" className="w-3.5 h-3.5" />
                Composer Insight
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight leading-tight mb-1">
                Bagikan Insight Baru
              </h1>
              <p className="text-sm text-[#6B7280] max-w-xl">
                Tulis ide, pengalaman, atau pengetahuan untuk komunitas Skillio.
              </p>
            </div>

            <div className="hidden lg:flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-[#111827] bg-white border border-[#E5E7EB] hover:border-[#3B82F6]/40 hover:bg-[#F9FAFB] transition-colors"
              >
                <Icon name="save" className="w-4 h-4" />
                Simpan draft
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canPublish || loading}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all ${
                  canPublish && !loading
                    ? 'bg-[#3B82F6] hover:bg-[#2563EB] shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/25'
                    : 'bg-[#9CA3AF] cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Mempublikasikan...
                  </>
                ) : (
                  <>
                    <Icon name="send" className="w-4 h-4" />
                    Publikasikan
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Progress */}
          <CompletenessBar completeness={completeness} />
        </div>
      </header>

      {/* ================================================================
       * BODY
       * ============================================================== */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* COMPOSER */}
          <form onSubmit={handleSubmit} className="lg:col-span-8 min-w-0 space-y-5">
            {/* Thumbnail */}
            <SectionCard
              icon="image"
              title="Thumbnail"
              subtitle="Opsional. 16:9 menghasilkan tampilan paling bagus di feed."
            >
              {thumbnailUrl ? (
                <div className="relative group">
                  <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-[#F3F4F6] border border-[#E5E7EB]">
                    <img
                      src={thumbnailUrl}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                    />
                    {uploading && (
                      <div className="absolute inset-0 bg-[#111827]/50 flex items-center justify-center">
                        <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#111827] bg-white border border-[#E5E7EB] hover:border-[#3B82F6]/40 hover:bg-[#F9FAFB] transition-colors disabled:opacity-50"
                    >
                      <Icon name="upload" className="w-3.5 h-3.5" />
                      Ganti gambar
                    </button>
                    <button
                      type="button"
                      onClick={() => setThumbnailUrl('')}
                      disabled={uploading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#EF4444] bg-white border border-[#E5E7EB] hover:border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <Icon name="trash" className="w-3.5 h-3.5" />
                      Hapus
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all ${
                    dragActive
                      ? 'border-[#3B82F6] bg-blue-50/60'
                      : 'border-[#E5E7EB] hover:border-[#3B82F6]/40 hover:bg-[#F9FAFB]'
                  }`}
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-3 text-[#6B7280]">
                      <span className="w-6 h-6 border-2 border-[#E5E7EB] border-t-[#3B82F6] rounded-full animate-spin" />
                      <span className="text-xs font-medium">Mengunggah...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-center px-4">
                      <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] mb-1">
                        <Icon name="image" className="w-5 h-5" />
                      </span>
                      <div className="text-sm font-semibold text-[#111827]">
                        {dragActive ? 'Lepas di sini' : 'Tarik & letakkan gambar'}
                      </div>
                      <div className="text-xs text-[#6B7280]">
                        atau{' '}
                        <span className="text-[#3B82F6] font-medium">klik untuk pilih</span>
                        <span className="mx-1.5 text-[#D1D5DB]">·</span>
                        JPG, PNG, WebP · maks 2MB
                      </div>
                    </div>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileInput}
                className="hidden"
              />
            </SectionCard>

            {/* Title */}
            <SectionCard
              icon="type"
              title="Judul"
              subtitle="Judul tajam yang langsung bilang 'ini tentang apa'."
              required
            >
              <div className="relative">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
                  placeholder="mis. Workflow review desain dalam 15 menit"
                  maxLength={TITLE_MAX}
                  className="w-full px-4 py-3 text-lg font-semibold bg-white border border-[#E5E7EB] rounded-xl outline-none placeholder:text-[#9CA3AF] focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-[#6B7280] inline-flex items-center gap-1.5">
                  <Icon name="info" className="w-3 h-3" />
                  Judul spesifik lebih mudah di-search & di-bookmark.
                </p>
                <CounterPill current={title.length} max={TITLE_MAX} />
              </div>
            </SectionCard>

            {/* Excerpt */}
            <SectionCard
              icon="align"
              title="Ringkasan"
              subtitle="1-2 kalimat pembuka yang muncul di feed."
              required
            >
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value.slice(0, EXCERPT_MAX))}
                placeholder="Tulis ringkasan singkat yang bikin audience langsung tertarik..."
                rows={2}
                maxLength={EXCERPT_MAX}
                className="w-full px-4 py-3 text-sm bg-white border border-[#E5E7EB] rounded-xl outline-none placeholder:text-[#9CA3AF] focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-[#6B7280]">
                  Ringkasan muncul sebagai preview di PostCard.
                </p>
                <CounterPill current={excerpt.length} max={EXCERPT_MAX} />
              </div>
            </SectionCard>

            {/* Content */}
            <SectionCard
              icon="pen"
              title="Konten"
              subtitle="Ceritakan pengalaman, proses, atau insight kamu."
              required
            >
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Mulai tulis insight kamu di sini...

Tips: gunakan paragraf pendek, bullet points, dan contoh nyata biar mudah dibaca."
                rows={14}
                className="w-full px-4 py-3 text-sm bg-white border border-[#E5E7EB] rounded-xl outline-none placeholder:text-[#9CA3AF] focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/10 transition-all resize-y leading-relaxed"
              />
              <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                <div className="flex items-center gap-3 text-xs text-[#6B7280]">
                  <span>
                    {content.trim().split(/\s+/).filter(Boolean).length} kata
                  </span>
                  <span className="w-1 h-1 rounded-full bg-[#E5E7EB]" />
                  <span>
                    ~{Math.max(1, Math.round(content.trim().split(/\s+/).filter(Boolean).length / 200))} menit baca
                  </span>
                </div>
                {content.length > 0 && content.trim().length < CONTENT_MIN && (
                  <span className="text-xs text-[#9CA3AF]">
                    Minimal {CONTENT_MIN} karakter
                  </span>
                )}
                {content.trim().length >= CONTENT_MIN && (
                  <span className="inline-flex items-center gap-1 text-xs text-[#3B82F6] font-medium">
                    <Icon name="check" className="w-3 h-3" />
                    Panjang cukup
                  </span>
                )}
              </div>
            </SectionCard>

            {/* Category */}
            <SectionCard
              icon="hash"
              title="Kategori"
              subtitle="Pilih topik utama agar audience yang tepat menemukan insight kamu."
              required
            >
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const active = category === cat
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(active ? '' : cat)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                        active
                          ? 'bg-[#3B82F6] text-white border-[#3B82F6] shadow-sm shadow-blue-500/20'
                          : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:text-[#111827] hover:border-[#3B82F6]/40'
                      }`}
                    >
                      {active && <Icon name="check" className="w-3 h-3" />}
                      {cat}
                    </button>
                  )
                })}
              </div>
            </SectionCard>
          </form>

          {/* SIDEBAR */}
          <aside className="lg:col-span-4">
            <div className="sticky top-[92px] space-y-4">
              <LivePreview
                thumbnailUrl={thumbnailUrl}
                title={title}
                excerpt={excerpt}
                category={category}
                creatorName={creatorName}
                creatorUsername={creatorUsername}
                avatarUrl={profile?.avatar_url}
                isPremium={profile?.is_premium}
                initial={initial}
              />
              <TipsCard />
              <GuidelinesCard />
            </div>
          </aside>
        </div>
      </div>

      {/* Sticky save bar (mobile) */}
      <AnimatePresence>
        {(canPublish || title || content) && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB]"
          >
            <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#111827] bg-white border border-[#E5E7EB] transition-colors"
                aria-label="Simpan draft"
              >
                <Icon name="save" className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canPublish || loading}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all ${
                  canPublish && !loading
                    ? 'bg-[#3B82F6] hover:bg-[#2563EB] shadow-sm shadow-blue-500/20'
                    : 'bg-[#9CA3AF] cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Mempublikasikan...
                  </>
                ) : (
                  <>
                    <Icon name="send" className="w-4 h-4" />
                    Publikasikan
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Progress + cards
 * ------------------------------------------------------------------------- */
function CompletenessBar({ completeness }) {
  return (
    <div className="mt-5 flex items-center gap-3 flex-wrap">
      <div className="flex-1 min-w-[220px] max-w-[420px]">
        <div className="flex items-center justify-between text-xs text-[#6B7280] mb-1.5">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="sparkles" className="w-3.5 h-3.5 text-[#3B82F6]" />
            Kesiapan insight
          </span>
          <span className="font-semibold text-[#111827]">{completeness.percent}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-[#F3F4F6] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] to-[#60A5FA]"
            initial={{ width: 0 }}
            animate={{ width: `${completeness.percent}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {STEPS.map((step) => {
          const done = completeness.checks[step.key]
          const required = completeness.required.includes(step.key)
          return (
            <span
              key={step.key}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border ${
                done
                  ? 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20'
                  : required
                  ? 'bg-white text-[#6B7280] border-[#E5E7EB]'
                  : 'bg-[#F9FAFB] text-[#9CA3AF] border-[#E5E7EB]'
              }`}
            >
              {done ? (
                <Icon name="check" className="w-3 h-3" />
              ) : (
                <Icon name="dot" className="w-2.5 h-2.5" />
              )}
              {step.label}
            </span>
          )
        })}
      </div>
    </div>
  )
}

function SectionCard({ icon, title, subtitle, required, children }) {
  return (
    <section className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6">
      <header className="flex items-start gap-3 mb-4">
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] shrink-0">
          <Icon name={icon} className="w-4 h-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h2 className="text-base font-semibold text-[#111827]">{title}</h2>
            {required && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#3B82F6]" title="Wajib diisi" />
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-[#6B7280] mt-0.5">{subtitle}</p>
          )}
        </div>
      </header>
      <div>{children}</div>
    </section>
  )
}

function CounterPill({ current, max }) {
  const ratio = current / max
  const tone =
    ratio >= 1 ? 'text-[#EF4444]' : ratio >= 0.85 ? 'text-amber-600' : 'text-[#9CA3AF]'
  return (
    <span className={`text-[11px] font-medium tabular-nums ${tone}`}>
      {current}/{max}
    </span>
  )
}

/* ---------------------------------------------------------------------------
 * Live preview
 * ------------------------------------------------------------------------- */
function LivePreview({
  thumbnailUrl,
  title,
  excerpt,
  category,
  creatorName,
  creatorUsername,
  avatarUrl,
  isPremium,
  initial,
}) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
      <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-[#F3F4F6]">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B7280]">
          <Icon name="eye" className="w-3.5 h-3.5" />
          Preview di feed
        </div>
        <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF]">
          Skillio feed
        </span>
      </div>

      {/* Mock post card */}
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold overflow-hidden ring-2 ring-white shadow-sm">
            {avatarUrl ? (
              <img src={avatarUrl} alt={creatorName} className="w-full h-full object-cover" />
            ) : (
              initial
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-[#111827] truncate">
                {creatorName}
              </span>
              {isPremium && (
                <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#3B82F6] text-white shrink-0">
                  <Icon name="sparkles" className="w-2 h-2" />
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-[#6B7280]">
              <span className="truncate">@{creatorUsername}</span>
              <Icon name="dot" className="w-2 h-2" />
              <span>baru saja</span>
            </div>
          </div>
        </div>

        {category && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#F3F4F6] text-[#6B7280] text-[10px] font-medium mb-2">
            {category}
          </span>
        )}

        <h4 className="text-sm font-semibold text-[#111827] leading-snug mb-1.5 line-clamp-2 min-h-[36px]">
          {title || 'Judul insight kamu akan muncul di sini'}
        </h4>
        <p className="text-xs text-[#6B7280] leading-relaxed line-clamp-2 mb-3 min-h-[32px]">
          {excerpt || 'Ringkasan singkat akan muncul tepat di bawah judul sebagai preview.'}
        </p>

        {thumbnailUrl && (
          <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-[#F3F4F6] border border-[#E5E7EB] mb-3">
            <img
              src={thumbnailUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex items-center gap-3 pt-3 border-t border-[#F3F4F6] text-[11px] text-[#9CA3AF]">
          <span className="inline-flex items-center gap-1">
            <Icon name="heart" className="w-3 h-3" /> 0
          </span>
          <span className="inline-flex items-center gap-1">
            <Icon name="message" className="w-3 h-3" /> 0
          </span>
          <span className="inline-flex items-center gap-1">
            <Icon name="bookmark" className="w-3 h-3" /> 0
          </span>
          <span className="ml-auto inline-flex items-center gap-1">
            <Icon name="eye" className="w-3 h-3" /> {formatViews(0)}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Supporting cards
 * ------------------------------------------------------------------------- */
function TipsCard() {
  const tips = [
    'Mulai dengan satu insight spesifik — bukan tutorial panjang.',
    'Paragraf pendek dan bullet point bikin mudah di-skim.',
    'Sertakan contoh nyata dari proyek atau proses kamu.',
    'Akhiri dengan 1 takeaway yang bisa langsung diterapkan.',
  ]
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6]">
          <Icon name="sparkles" className="w-4 h-4" />
        </span>
        <h3 className="text-sm font-semibold text-[#111827]">Tips insight yang engaging</h3>
      </div>
      <ul className="space-y-2">
        {tips.map((t) => (
          <li key={t} className="flex items-start gap-2 text-xs text-[#6B7280] leading-relaxed">
            <span className="w-1 h-1 rounded-full bg-[#3B82F6] mt-1.5 shrink-0" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  )
}

function GuidelinesCard() {
  return (
    <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#F3F4F6] text-[#6B7280]">
          <Icon name="info" className="w-4 h-4" />
        </span>
        <h3 className="text-sm font-semibold text-[#111827]">Community guidelines</h3>
      </div>
      <p className="text-xs text-[#6B7280] leading-relaxed">
        Bagikan pengalaman asli kamu. Hindari konten promosi berlebihan, spam, atau mengunggah
        karya milik orang lain tanpa kredit yang jelas.
      </p>
      <Link
        to="/premium"
        className="inline-flex items-center gap-1 text-xs font-medium text-[#3B82F6] hover:text-[#2563EB] mt-3"
      >
        Tingkatkan jangkauan dengan Skillio+
        <Icon name="arrow-right" className="w-3.5 h-3.5" />
      </Link>
    </div>
  )
}

export default CreatePost
