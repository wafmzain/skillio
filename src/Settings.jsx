import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
    case 'arrow-left':
      return <svg {...common}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
    case 'arrow-right':
      return <svg {...common}><path d="M5 12h14M13 5l7 7-7 7"/></svg>
    case 'camera':
      return <svg {...common}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
    case 'upload':
      return <svg {...common}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5M12 3v12"/></svg>
    case 'trash':
      return <svg {...common}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/></svg>
    case 'user':
      return <svg {...common}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
    case 'at':
      return <svg {...common}><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/></svg>
    case 'align':
      return <svg {...common}><path d="M3 6h18M3 12h14M3 18h12"/></svg>
    case 'link':
      return <svg {...common}><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>
    case 'mail':
      return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
    case 'lock':
      return <svg {...common}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
    case 'check':
      return <svg {...common}><path d="M20 6L9 17l-5-5"/></svg>
    case 'x':
      return <svg {...common}><path d="M18 6L6 18M6 6l12 12"/></svg>
    case 'info':
      return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/></svg>
    case 'sparkles':
      return <svg {...common}><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z"/></svg>
    case 'eye':
      return <svg {...common}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
    default:
      return null
  }
}

/* ---------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------- */
const NAME_MAX = 60
const USERNAME_MAX = 30
const BIO_MAX = 200
const WEBSITE_MAX = 120
const USERNAME_PATTERN = /^[a-z0-9_.]{3,30}$/

/* ---------------------------------------------------------------------------
 * Settings (edit profile)
 * ------------------------------------------------------------------------- */
function Settings() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState(null)

  // Form state
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [website, setWebsite] = useState('')

  // Validation
  const [usernameError, setUsernameError] = useState('')
  const [usernameAvailable, setUsernameAvailable] = useState(null) // null | true | false
  const [checkingUsername, setCheckingUsername] = useState(false)

  const fileInputRef = useRef(null)

  useEffect(() => {
    loadUserProfile()
  }, [])

  async function loadUserProfile() {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        navigate('/login')
        return
      }
      setUser(authUser)

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (!error && profileData) {
        setProfile(profileData)
        setName(profileData.name || '')
        setUsername(profileData.username || '')
        setBio(profileData.bio || '')
        setAvatarUrl(profileData.avatar_url || '')
        setWebsite(profileData.website || '')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  /* ------------------------------ helpers -------------------------------- */
  function showToast(message, tone = 'success') {
    setToast({ message, tone })
    setTimeout(() => setToast(null), 3000)
  }

  const dirty = useMemo(() => {
    if (!profile) return false
    return (
      (profile.name || '') !== name ||
      (profile.username || '') !== username ||
      (profile.bio || '') !== bio ||
      (profile.avatar_url || '') !== avatarUrl ||
      (profile.website || '') !== website
    )
  }, [profile, name, username, bio, avatarUrl, website])

  /* --------------------------- username check ---------------------------- */
  async function handleUsernameChange(value) {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9_.]/g, '').slice(0, USERNAME_MAX)
    setUsername(cleaned)
    setUsernameError('')
    setUsernameAvailable(null)

    if (cleaned === profile?.username) return

    if (cleaned.length > 0 && cleaned.length < 3) {
      setUsernameError('Minimal 3 karakter')
      return
    }
    if (cleaned.length >= 3 && !USERNAME_PATTERN.test(cleaned)) {
      setUsernameError('Gunakan huruf kecil, angka, titik, atau underscore')
      return
    }

    if (cleaned.length >= 3) {
      setCheckingUsername(true)
      try {
        const { data } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', cleaned)
          .maybeSingle()
        if (data) {
          setUsernameError('Username sudah dipakai')
          setUsernameAvailable(false)
        } else {
          setUsernameAvailable(true)
        }
      } finally {
        setCheckingUsername(false)
      }
    }
  }

  /* ---------------------------- avatar upload ---------------------------- */
  function validateAvatarFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      showToast('Format harus JPG, PNG, atau WebP', 'error')
      return false
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran maksimal 2MB', 'error')
      return false
    }
    return true
  }

  async function handleAvatarFile(file) {
    if (!file || !user) return
    if (!validateAvatarFile(file)) return

    try {
      setUploading(true)
      const ext = file.name.split('.').pop()
      const fileName = `avatar-${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('thumbnails')
        .upload(filePath, file, { cacheControl: '3600', upsert: false })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('thumbnails')
        .getPublicUrl(filePath)

      setAvatarUrl(publicUrl)
      showToast('Foto profil diperbarui')
    } catch (err) {
      console.error('Avatar upload error:', err)
      showToast(err.message || 'Gagal upload foto', 'error')
    } finally {
      setUploading(false)
    }
  }

  function handleAvatarFileSelect(e) {
    const file = e.target.files?.[0]
    if (file) handleAvatarFile(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removeAvatar() {
    setAvatarUrl('')
    showToast('Foto profil dihapus')
  }

  /* ---------------------------- save + reset ----------------------------- */
  async function handleSave(e) {
    if (e) e.preventDefault()
    if (usernameError || checkingUsername) return
    if (!name.trim()) {
      showToast('Nama tidak boleh kosong', 'error')
      return
    }
    if (username.length < 3) {
      showToast('Username minimal 3 karakter', 'error')
      return
    }
    if (website && !/^https?:\/\//.test(website)) {
      showToast('Website harus diawali http:// atau https://', 'error')
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: name.trim(),
        username: username.toLowerCase(),
        bio: bio.trim(),
        avatar_url: avatarUrl || null,
      }
      // Only include website if the column exists in their schema.
      // Trying to update a non-existent column would fail — we'll catch that.
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ ...payload, website: website || null })
          .eq('id', user.id)
        if (error) throw error
      } catch (err) {
        // Fallback: retry without website field if column is missing
        if (err.message && err.message.toLowerCase().includes('column')) {
          const { error } = await supabase
            .from('profiles')
            .update(payload)
            .eq('id', user.id)
          if (error) throw error
        } else {
          throw err
        }
      }

      showToast('Perubahan disimpan')
      setProfile((p) => ({ ...p, ...payload, website }))
      setTimeout(() => navigate(`/u/${username.toLowerCase()}`), 800)
    } catch (err) {
      console.error(err)
      showToast(err.message || 'Gagal menyimpan', 'error')
    } finally {
      setSaving(false)
    }
  }

  function handleReset() {
    if (!profile) return
    setName(profile.name || '')
    setUsername(profile.username || '')
    setBio(profile.bio || '')
    setAvatarUrl(profile.avatar_url || '')
    setWebsite(profile.website || '')
    setUsernameError('')
    setUsernameAvailable(null)
  }

  /* ------------------------------ render --------------------------------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6">
          <SettingsSkeleton />
        </div>
      </div>
    )
  }

  const initial = (name || profile?.name || user?.email || 'U').charAt(0).toUpperCase()
  const canSave = dirty && !saving && !usernameError && !checkingUsername && username.length >= 3 && name.trim()

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
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6 lg:py-8">
          <Link
            to={profile?.username ? `/u/${profile.username}` : '/profile'}
            className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#111827] mb-4 transition-colors"
          >
            <Icon name="arrow-left" className="w-4 h-4" />
            Kembali ke profil
          </Link>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-semibold mb-3">
                <Icon name="user" className="w-3.5 h-3.5" />
                Creator Profile
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight leading-tight mb-1">
                Edit Profil
              </h1>
              <p className="text-sm text-[#6B7280] max-w-xl">
                Atur identitas creator kamu — nama, username, bio, dan foto profil yang muncul di
                Skillio.
              </p>
            </div>

            <div className="hidden lg:flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleReset}
                disabled={!dirty || saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-[#111827] bg-white border border-[#E5E7EB] hover:border-[#3B82F6]/40 hover:bg-[#F9FAFB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Batalkan
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!canSave}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all ${
                  canSave
                    ? 'bg-[#3B82F6] hover:bg-[#2563EB] shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/25'
                    : 'bg-[#9CA3AF] cursor-not-allowed'
                }`}
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Icon name="check" className="w-4 h-4" />
                    Simpan perubahan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ================================================================
       * BODY
       * ============================================================== */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* FORM */}
          <form
            onSubmit={handleSave}
            className="lg:col-span-8 min-w-0 space-y-5"
          >
            {/* Avatar */}
            <SectionCard
              icon="camera"
              title="Foto profil"
              description="Gunakan gambar persegi minimal 400×400 untuk hasil terbaik."
            >
              <div className="flex items-start gap-5 flex-wrap">
                <div className="relative shrink-0">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-semibold overflow-hidden ring-4 ring-white shadow-md">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      initial
                    )}
                  </div>
                  {uploading && (
                    <div className="absolute inset-0 rounded-2xl bg-[#111827]/50 backdrop-blur-sm flex items-center justify-center">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-sm shadow-blue-500/20 disabled:opacity-50 transition-colors"
                    >
                      <Icon name="upload" className="w-4 h-4" />
                      Unggah foto
                    </button>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={removeAvatar}
                        disabled={uploading}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-[#EF4444] bg-white border border-[#E5E7EB] hover:border-red-200 hover:bg-red-50 transition-colors"
                      >
                        <Icon name="trash" className="w-4 h-4" />
                        Hapus
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-[#6B7280] mt-2">
                    JPG, PNG, atau WebP · maks 2MB
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleAvatarFileSelect}
                    className="hidden"
                  />
                </div>
              </div>
            </SectionCard>

            {/* Identity */}
            <SectionCard
              icon="user"
              title="Identitas creator"
              description="Nama dan username muncul di feed, profil, dan komentar kamu."
            >
              <div className="space-y-4">
                <Field
                  label="Nama lengkap"
                  icon="user"
                  hint={`${name.length}/${NAME_MAX}`}
                >
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value.slice(0, NAME_MAX))}
                    placeholder="mis. Sarah Kim"
                    maxLength={NAME_MAX}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-xl outline-none placeholder:text-[#9CA3AF] focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </Field>

                <Field
                  label="Username"
                  icon="at"
                  hint={`skillio.app/u/${username || 'username'}`}
                  error={usernameError}
                  success={
                    !usernameError &&
                    username.length >= 3 &&
                    username !== profile?.username &&
                    usernameAvailable
                      ? 'Tersedia'
                      : null
                  }
                  checking={checkingUsername}
                >
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#6B7280]">
                      @
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      placeholder="username"
                      maxLength={USERNAME_MAX}
                      className={`w-full pl-7 pr-10 py-2.5 text-sm bg-white border rounded-xl outline-none placeholder:text-[#9CA3AF] transition-all ${
                        usernameError
                          ? 'border-red-200 focus:border-red-400 focus:ring-4 focus:ring-red-500/10'
                          : 'border-[#E5E7EB] focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/10'
                      }`}
                    />
                    {checkingUsername && (
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#E5E7EB] border-t-[#3B82F6] rounded-full animate-spin" />
                    )}
                    {!checkingUsername && usernameAvailable && (
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#3B82F6]">
                        <Icon name="check" className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </Field>

                <Field
                  label="Bio"
                  icon="align"
                  hint={`${bio.length}/${BIO_MAX}`}
                  description="Ceritakan peran, niche, atau fokus kreatif kamu."
                >
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX))}
                    placeholder="UI Designer · berbagi workflow dan insight desain produk"
                    rows={4}
                    maxLength={BIO_MAX}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-xl outline-none placeholder:text-[#9CA3AF] focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
                  />
                </Field>
              </div>
            </SectionCard>

            {/* Links */}
            <SectionCard
              icon="link"
              title="Link & website"
              description="Tampilkan website pribadi atau portfolio di halaman profil kamu."
            >
              <Field label="Website" icon="link">
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value.slice(0, WEBSITE_MAX))}
                  placeholder="https://portfolio.kamu"
                  maxLength={WEBSITE_MAX}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-xl outline-none placeholder:text-[#9CA3AF] focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </Field>
            </SectionCard>

            {/* Account */}
            <SectionCard
              icon="mail"
              title="Akun"
              description="Info akun yang terhubung ke profil kamu."
            >
              <Field label="Email" icon="mail">
                <div className="relative">
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2.5 pr-10 text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-[#6B7280] cursor-not-allowed"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                    <Icon name="lock" className="w-4 h-4" />
                  </span>
                </div>
                <p className="text-xs text-[#6B7280] mt-2 flex items-center gap-1.5">
                  <Icon name="info" className="w-3 h-3" />
                  Email tidak bisa diubah dari sini.
                </p>
              </Field>
            </SectionCard>
          </form>

          {/* PREVIEW + TIPS */}
          <aside className="lg:col-span-4">
            <div className="sticky top-[92px] space-y-4">
              <ProfilePreview
                name={name}
                username={username}
                bio={bio}
                avatarUrl={avatarUrl}
                website={website}
                isPremium={profile?.is_premium}
                initial={initial}
              />
              <TipsCard />
            </div>
          </aside>
        </div>
      </div>

      {/* Sticky save bar (mobile) */}
      <AnimatePresence>
        {dirty && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB]"
          >
            <div className="max-w-[1100px] mx-auto px-4 py-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#111827] bg-white border border-[#E5E7EB] disabled:opacity-50 transition-colors"
              >
                Batalkan
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!canSave}
                className={`flex-[2] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all ${
                  canSave
                    ? 'bg-[#3B82F6] hover:bg-[#2563EB] shadow-sm shadow-blue-500/20'
                    : 'bg-[#9CA3AF] cursor-not-allowed'
                }`}
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Icon name="check" className="w-4 h-4" />
                    Simpan perubahan
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
 * Reusable pieces
 * ------------------------------------------------------------------------- */
function SectionCard({ icon, title, description, children }) {
  return (
    <section className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6">
      <header className="flex items-start gap-3 mb-5">
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] shrink-0">
          <Icon name={icon} className="w-4 h-4" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-[#111827]">{title}</h2>
          {description && (
            <p className="text-xs text-[#6B7280] mt-0.5">{description}</p>
          )}
        </div>
      </header>
      <div>{children}</div>
    </section>
  )
}

function Field({
  label,
  icon,
  hint,
  description,
  error,
  success,
  checking,
  children,
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#111827] uppercase tracking-wide">
          {icon && <Icon name={icon} className="w-3.5 h-3.5 text-[#6B7280]" />}
          {label}
        </label>
        {hint && !error && !success && (
          <span className="text-[11px] text-[#9CA3AF]">{hint}</span>
        )}
      </div>
      {description && (
        <p className="text-xs text-[#6B7280] mb-2">{description}</p>
      )}
      {children}
      <div className="min-h-[20px] mt-1.5">
        {error && (
          <p className="text-xs text-[#EF4444] inline-flex items-center gap-1">
            <Icon name="x" className="w-3 h-3" />
            {error}
          </p>
        )}
        {!error && success && (
          <p className="text-xs text-[#3B82F6] inline-flex items-center gap-1">
            <Icon name="check" className="w-3 h-3" />
            {success}
          </p>
        )}
        {!error && !success && checking && (
          <p className="text-xs text-[#6B7280] inline-flex items-center gap-1.5">
            <span className="w-3 h-3 border-2 border-[#E5E7EB] border-t-[#3B82F6] rounded-full animate-spin" />
            Mengecek...
          </p>
        )}
      </div>
    </div>
  )
}

function ProfilePreview({ name, username, bio, avatarUrl, website, isPremium, initial }) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
      <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-[#F3F4F6]">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B7280]">
          <Icon name="eye" className="w-3.5 h-3.5" />
          Preview
        </div>
        <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF]">
          Profil kamu
        </span>
      </div>

      {/* Mini cover */}
      <div className="relative h-20 bg-gradient-to-br from-blue-200/60 via-blue-100/60 to-[#FAFAFA]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.2),transparent_60%)]" />
      </div>

      <div className="px-5 -mt-8 pb-5">
        <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-semibold overflow-hidden ring-4 ring-white shadow-sm mb-3">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar preview" className="w-full h-full object-cover" />
          ) : (
            initial
          )}
          {isPremium && (
            <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#3B82F6] text-white flex items-center justify-center ring-2 ring-white">
              <Icon name="sparkles" className="w-2.5 h-2.5" />
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <h3 className="text-sm font-semibold text-[#111827] truncate">
            {name || 'Nama kamu'}
          </h3>
          {isPremium && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#3B82F6]/10 text-[#3B82F6] text-[10px] font-semibold">
              <Icon name="sparkles" className="w-2.5 h-2.5" />
              Skillio+
            </span>
          )}
        </div>
        <p className="text-xs text-[#6B7280] truncate">
          @{username || 'username'}
        </p>

        <p className="text-xs text-[#111827] leading-relaxed mt-3 min-h-[32px]">
          {bio || 'Bio kamu akan muncul di sini — ceritakan niche dan fokus kreatif kamu.'}
        </p>

        {website && (
          <a
            href={website}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 text-xs text-[#3B82F6] hover:text-[#2563EB] font-medium"
          >
            <Icon name="link" className="w-3 h-3" />
            {website.replace(/^https?:\/\//, '').split('/')[0]}
          </a>
        )}
      </div>
    </div>
  )
}

function TipsCard() {
  const tips = [
    'Bio yang jelas membantu audience memahami nichemu dalam 3 detik.',
    'Foto profil persegi 400×400 terlihat paling tajam di semua ukuran.',
    'Gunakan username yang mudah diingat — sama dengan handle di platform lain.',
    'Tambahkan website untuk drive traffic ke portfolio atau newsletter kamu.',
  ]
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6]">
          <Icon name="sparkles" className="w-4 h-4" />
        </span>
        <h3 className="text-sm font-semibold text-[#111827]">Tips creator</h3>
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

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="w-24 h-4 bg-[#F3F4F6] rounded animate-pulse" />
        <div className="w-40 h-6 bg-[#F3F4F6] rounded animate-pulse" />
        <div className="w-80 h-4 bg-[#F3F4F6] rounded animate-pulse" />
      </div>
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 bg-white border border-[#E5E7EB] rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="hidden lg:block lg:col-span-4 space-y-4">
          <div className="h-64 bg-white border border-[#E5E7EB] rounded-2xl animate-pulse" />
          <div className="h-40 bg-white border border-[#E5E7EB] rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export default Settings
