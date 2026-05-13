import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from './services/supabaseClient'
import PostCard from './PostCard'
import FollowButton from './FollowButton'
import { formatViews } from './utils/formatViews'
import { buildReputation } from './services/reputation'
import ReputationCard from './components/reputation/ReputationCard'
import LeaderboardCard from './components/reputation/LeaderboardCard'
import LevelPill from './components/reputation/LevelPill'

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
    case 'settings':
      return <svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>
    case 'share':
      return <svg {...common}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>
    case 'sparkles':
      return <svg {...common}><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z"/></svg>
    case 'badge':
      return <svg {...common}><path d="M12 2l2.4 2.8L18 4l.4 3.7L22 9l-1.6 3.4L22 15l-3.6 1.3L18 20l-3.6-.8L12 22l-2.4-2.8L6 20l-.4-3.7L2 15l1.6-3.4L2 9l3.6-1.3L6 4l3.6.8L12 2z"/><path d="M9 12l2 2 4-4"/></svg>
    case 'trending':
      return <svg {...common}><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>
    case 'eye':
      return <svg {...common}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
    case 'heart':
      return <svg {...common}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6z"/></svg>
    case 'bookmark':
      return <svg {...common}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
    case 'users':
      return <svg {...common}><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M21 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13A4 4 0 0 1 16 11"/></svg>
    case 'pen':
      return <svg {...common}><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
    case 'file':
      return <svg {...common}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></svg>
    case 'image':
      return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 15l-5-5L5 21"/></svg>
    case 'info':
      return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/></svg>
    case 'calendar':
      return <svg {...common}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
    case 'link':
      return <svg {...common}><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>
    case 'arrow-right':
      return <svg {...common}><path d="M5 12h14M13 5l7 7-7 7"/></svg>
    case 'check':
      return <svg {...common}><path d="M20 6L9 17l-5-5"/></svg>
    case 'plus':
      return <svg {...common}><path d="M12 5v14M5 12h14"/></svg>
    case 'chart':
      return <svg {...common}><path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/></svg>
    case 'flame':
      return <svg {...common}><path d="M12 2s3 4 3 8a3 3 0 0 1-6 0c0-1 .5-2 1-3 0 0-4 3-4 8a6 6 0 0 0 12 0c0-6-6-13-6-13z"/></svg>
    case 'star':
      return <svg {...common} fill="currentColor"><path d="M12 2l3.1 6.3 7 1-5 4.9 1.2 6.9L12 17.8 5.7 21.1 6.9 14.2l-5-4.9 7-1L12 2z"/></svg>
    default:
      return null
  }
}

/* ---------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------- */
function formatJoined(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

const TABS = [
  { key: 'posts', label: 'Postingan', icon: 'pen' },
  { key: 'media', label: 'Media', icon: 'image' },
  { key: 'trending', label: 'Trending', icon: 'trending' },
  { key: 'saved', label: 'Disimpan', icon: 'bookmark', ownerOnly: true },
  { key: 'about', label: 'Tentang', icon: 'info' },
]

/* ---------------------------------------------------------------------------
 * Profile page
 * ------------------------------------------------------------------------- */
function Profile() {
  const { username } = useParams()
  const [currentUser, setCurrentUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [savedPosts, setSavedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [activeTab, setActiveTab] = useState('posts')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadProfileData()
    setActiveTab('posts')
  }, [username])

  async function loadProfileData() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      let profileData = null
      if (username) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single()
        if (error) {
          setLoading(false)
          return
        }
        profileData = data
        setIsOwnProfile(user?.id === data.id)
      } else {
        if (!user) {
          setLoading(false)
          return
        }
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        if (!error) {
          profileData = data
          setIsOwnProfile(true)
        }
      }

      setProfile(profileData)

      if (profileData) {
        await Promise.all([
          fetchFollowCounts(profileData.id),
          fetchPosts(profileData.id),
        ])

        // Fetch saved posts only if viewing own profile
        if (user?.id === profileData.id) {
          fetchSavedPosts(user.id)
        }
      }
    } catch (error) {
      console.error('Profile load error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchFollowCounts(profileId) {
    const [{ count: followers }, { count: following }] = await Promise.all([
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profileId),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profileId),
    ])
    setFollowersCount(followers || 0)
    setFollowingCount(following || 0)
  }

  async function fetchPosts(profileId) {
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(id, username, name, avatar_url, is_premium)')
      .eq('user_id', profileId)
      .order('created_at', { ascending: false })
    if (!error) setPosts(data || [])
  }

  async function fetchSavedPosts(userId) {
    const { data, error } = await supabase
      .from('post_bookmarks')
      .select('posts(*, profiles(id, username, name, avatar_url, is_premium))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30)
    if (!error && data) {
      setSavedPosts(data.filter((b) => b.posts).map((b) => b.posts))
    }
  }

  async function handleFollowChange() {
    if (profile) await fetchFollowCounts(profile.id)
  }

  async function handleShare() {
    const url = profile?.username
      ? `${window.location.origin}/u/${profile.username}`
      : window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: `${profile.name} · Skillio`, url })
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      }
    } catch {
      /* user cancelled */
    }
  }

  /* ----------------------------- derived data ---------------------------- */
  const stats = useMemo(() => {
    const totalViews = posts.reduce((sum, p) => sum + (p.views_count || 0), 0)
    const totalLikes = posts.reduce((sum, p) => sum + (p.likes_count || 0), 0)
    const totalBookmarks = posts.reduce((sum, p) => sum + (p.bookmarks_count || 0), 0)
    return {
      posts: posts.length,
      views: totalViews,
      likes: totalLikes,
      bookmarks: totalBookmarks,
      followers: followersCount,
      following: followingCount,
    }
  }, [posts, followersCount, followingCount])

  const reputation = useMemo(
    () => buildReputation({ posts, isPremium: !!profile?.is_premium }),
    [posts, profile?.is_premium]
  )

  const badges = useMemo(() => {
    if (!profile) return []
    const list = []
    if (profile.is_premium) list.push({ key: 'premium', label: 'Skillio+ Member', icon: 'sparkles', accent: true })

    const hasTrending = posts.some((p) => (p.trending_score || 0) >= 50)
    if (hasTrending) list.push({ key: 'trending', label: 'Trending Author', icon: 'flame' })

    const topInsight = posts.some((p) => (p.likes_count || 0) >= 100)
    if (topInsight) list.push({ key: 'top', label: 'Top Insight', icon: 'star' })

    // Early member if profile.created_at before Jan 1, 2026 (visual heuristic)
    if (profile.created_at && new Date(profile.created_at) < new Date('2026-01-01')) {
      list.push({ key: 'early', label: 'Early Member', icon: 'badge' })
    }
    return list
  }, [profile, posts])

  const topCategory = useMemo(() => {
    const map = {}
    posts.forEach((p) => {
      if (p.category) map[p.category] = (map[p.category] || 0) + 1
    })
    const top = Object.entries(map).sort((a, b) => b[1] - a[1])[0]
    return top ? { name: top[0], count: top[1] } : null
  }, [posts])

  const featuredPost = useMemo(() => {
    if (posts.length === 0) return null
    return [...posts].sort(
      (a, b) => (b.likes_count || 0) + (b.views_count || 0) * 0.01 -
        ((a.likes_count || 0) + (a.views_count || 0) * 0.01)
    )[0]
  }, [posts])

  const recentActivity = useMemo(() => posts.slice(0, 4), [posts])

  const tabPosts = useMemo(() => {
    switch (activeTab) {
      case 'media':
        return posts.filter((p) => !!p.thumbnail_url)
      case 'trending':
        return [...posts]
          .filter((p) => (p.trending_score || 0) >= 30 || (p.likes_count || 0) >= 30)
          .sort((a, b) => (b.trending_score || 0) - (a.trending_score || 0))
      case 'saved':
        return savedPosts
      case 'posts':
      default:
        return posts
    }
  }, [activeTab, posts, savedPosts])

  const availableTabs = TABS.filter((t) => !t.ownerOnly || isOwnProfile)

  /* ------------------------------- guards -------------------------------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6">
          <ProfileSkeleton />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] mb-4">
            <Icon name="info" className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-[#111827] mb-2">Profil tidak ditemukan</h2>
          <p className="text-sm text-[#6B7280] mb-6">
            Creator yang kamu cari tidak tersedia. Coba jelajahi komunitas kami.
          </p>
          <Link to="/home">
            <button className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-sm shadow-blue-500/20 transition-colors">
              Kembali ke feed
              <Icon name="arrow-right" className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    )
  }

  if (!username && !currentUser) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center">
          <h2 className="text-lg font-semibold text-[#111827] mb-2">Login untuk lihat profil</h2>
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

  const initial = profile.name?.charAt(0).toUpperCase() || 'U'

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Copied toast */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg border bg-white border-[#E5E7EB] text-[#111827]">
              <span className="inline-flex items-center gap-2">
                <Icon name="check" className="w-4 h-4 text-[#3B82F6]" />
                Link profil disalin
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================================
       * COVER + HEADER
       * ===================================================================*/}
      <header className="relative">
        {/* Cover */}
        <div className="relative h-40 sm:h-56 lg:h-64 bg-gradient-to-br from-blue-200/60 via-blue-100/60 to-[#FAFAFA] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.25),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.15),transparent_50%)]" />
          {/* soft pattern */}
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.06]"
            preserveAspectRatio="none"
            viewBox="0 0 1000 400"
          >
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M40 0H0V40" fill="none" stroke="#111827" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="1000" height="400" fill="url(#grid)" />
          </svg>
        </div>

        {/* Header content */}
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative -mt-16 sm:-mt-20 bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 lg:p-8"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              {/* Avatar */}
              <div className="relative shrink-0 -mt-14 sm:-mt-16">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-semibold overflow-hidden ring-4 ring-white shadow-md">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initial
                  )}
                </div>
                {profile.is_premium && (
                  <span
                    title="Skillio+ Creator"
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#3B82F6] text-white flex items-center justify-center ring-4 ring-white"
                  >
                    <Icon name="sparkles" className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>

              {/* Identity */}
              <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight truncate">
                        {profile.name}
                      </h1>
                      {profile.is_premium && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#3B82F6]/10 text-[#3B82F6] text-[11px] font-semibold">
                          <Icon name="sparkles" className="w-3 h-3" />
                          Skillio+
                        </span>
                      )}
                      {reputation?.level && (
                        <LevelPill level={reputation.level} size="small" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm text-[#6B7280]">@{profile.username}</span>
                      {profile.created_at && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-[#E5E7EB]" />
                          <span className="inline-flex items-center gap-1 text-xs text-[#6B7280]">
                            <Icon name="calendar" className="w-3 h-3" />
                            Bergabung {formatJoined(profile.created_at)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isOwnProfile ? (
                      <>
                        <Link to="/settings">
                          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-[#111827] bg-white border border-[#E5E7EB] hover:border-[#3B82F6]/40 hover:bg-[#F9FAFB] transition-colors">
                            <Icon name="settings" className="w-4 h-4" />
                            Edit Profile
                          </button>
                        </Link>
                        <button
                          onClick={handleShare}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-[#111827] bg-white border border-[#E5E7EB] hover:border-[#3B82F6]/40 hover:bg-[#F9FAFB] transition-colors"
                          aria-label="Bagikan profil"
                        >
                          <Icon name="share" className="w-4 h-4" />
                          <span className="hidden sm:inline">Bagikan</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <FollowButton
                          profileId={profile.id}
                          profileUsername={profile.username}
                          currentUser={currentUser}
                          size="medium"
                          showCount={false}
                          onFollowChange={handleFollowChange}
                        />
                        <button
                          onClick={handleShare}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-[#111827] bg-white border border-[#E5E7EB] hover:border-[#3B82F6]/40 hover:bg-[#F9FAFB] transition-colors"
                          aria-label="Bagikan profil"
                        >
                          <Icon name="share" className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="text-sm text-[#111827] leading-relaxed mt-4 max-w-2xl">
                    {profile.bio}
                  </p>
                )}

                {/* Meta row: niche + links */}
                <div className="flex items-center gap-3 mt-4 flex-wrap">
                  {topCategory && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F3F4F6] text-[#6B7280] text-xs font-medium">
                      <Icon name="pen" className="w-3 h-3" />
                      {topCategory.name}
                    </span>
                  )}
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[#3B82F6] text-xs font-medium hover:bg-blue-50 transition-colors"
                    >
                      <Icon name="link" className="w-3 h-3" />
                      {profile.website.replace(/^https?:\/\//, '').split('/')[0]}
                    </a>
                  )}
                </div>

                {/* Badges */}
                {badges.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {badges.map((b) => (
                      <BadgeChip key={b.key} icon={b.icon} label={b.label} accent={b.accent} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Stat row */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-6 p-3 rounded-xl bg-[#FAFAFA] border border-[#F3F4F6]">
              <StatCell label="Posts" value={stats.posts} icon="pen" />
              <StatCell label="Views" value={stats.views} icon="eye" />
              <StatCell label="Likes" value={stats.likes} icon="heart" />
              <StatCell label="Bookmarks" value={stats.bookmarks} icon="bookmark" />
              <StatCell label="Pengikut" value={stats.followers} icon="users" accent />
              <StatCell label="Mengikuti" value={stats.following} icon="users" />
            </div>
          </motion.div>

          {/* Tabs */}
          <nav className="mt-6 overflow-x-auto scrollbar-none -mx-1 px-1">
            <div className="flex gap-1 w-max min-w-full">
              {availableTabs.map((t) => {
                const active = activeTab === t.key
                return (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={`relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? 'text-[#3B82F6] bg-[#3B82F6]/10'
                        : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]'
                    }`}
                  >
                    <Icon name={t.icon} className="w-4 h-4" />
                    {t.label}
                  </button>
                )
              })}
            </div>
          </nav>
        </div>
      </header>

      {/* =====================================================================
       * BODY
       * ===================================================================*/}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <main className="lg:col-span-8 min-w-0">
            {/* Mobile-only reputation (desktop shows it in the sidebar) */}
            <div className="lg:hidden mb-4">
              <ReputationCard reputation={reputation} />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22 }}
              >
                {activeTab === 'about' ? (
                  <AboutTab profile={profile} stats={stats} topCategory={topCategory} />
                ) : tabPosts.length === 0 ? (
                  <EmptyState
                    isOwnProfile={isOwnProfile}
                    tab={activeTab}
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
                    {tabPosts.map((post) => (
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
                          showAuthor={activeTab === 'saved'}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Sidebar */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-[92px] space-y-4">
              <ReputationCard reputation={reputation} />
              <CreatorAnalyticsCard stats={stats} />
              {featuredPost && <FeaturedInsightCard post={featuredPost} />}
              {topCategory && <TopCategoryCard topCategory={topCategory} allCounts={posts} />}
              <LeaderboardCard limit={5} />
              <RecentActivityCard posts={recentActivity} />
              {!profile.is_premium && isOwnProfile && <GrowthPromoCard />}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Header building blocks
 * ------------------------------------------------------------------------- */
function BadgeChip({ icon, label, accent = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold ${
        accent
          ? 'bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20'
          : 'bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]'
      }`}
    >
      <Icon name={icon} className="w-3 h-3" />
      {label}
    </span>
  )
}

function StatCell({ label, value, icon, accent = false }) {
  return (
    <div className="text-center px-1">
      <div className="flex items-center justify-center gap-1 text-[10px] text-[#6B7280] uppercase tracking-wider mb-0.5">
        <Icon name={icon} className="w-2.5 h-2.5" />
        {label}
      </div>
      <div
        className={`text-base sm:text-lg font-semibold leading-none ${
          accent ? 'text-[#3B82F6]' : 'text-[#111827]'
        }`}
      >
        {formatViews(value)}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * About tab
 * ------------------------------------------------------------------------- */
function AboutTab({ profile, stats, topCategory }) {
  return (
    <div className="space-y-4">
      <section className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-[#111827] mb-3 flex items-center gap-2">
          <Icon name="info" className="w-4 h-4 text-[#3B82F6]" />
          Tentang
        </h3>
        <p className="text-sm text-[#111827] leading-relaxed">
          {profile.bio ||
            'Orang ini belum menuliskan bio. Ikuti untuk dapatkan update insight terbaru.'}
        </p>
      </section>

      <section className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-[#111827] mb-4 flex items-center gap-2">
          <Icon name="chart" className="w-4 h-4 text-[#3B82F6]" />
          Ringkasan aktivitas
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Total insight', value: stats.posts, icon: 'pen' },
            { label: 'Total views', value: stats.views, icon: 'eye' },
            { label: 'Total likes', value: stats.likes, icon: 'heart' },
            { label: 'Total bookmarks', value: stats.bookmarks, icon: 'bookmark' },
            { label: 'Pengikut', value: stats.followers, icon: 'users' },
            { label: 'Kategori utama', value: topCategory?.name || '—', icon: 'sparkles', isString: true },
          ].map((s) => (
            <div
              key={s.label}
              className="p-3 rounded-xl bg-[#FAFAFA] border border-[#F3F4F6]"
            >
              <div className="flex items-center gap-1 text-[10px] text-[#6B7280] uppercase tracking-wider mb-1">
                <Icon name={s.icon} className="w-3 h-3" />
                {s.label}
              </div>
              <div className="text-base font-semibold text-[#111827]">
                {s.isString ? s.value : formatViews(s.value)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {profile.website && (
        <section className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-[#111827] mb-3 flex items-center gap-2">
            <Icon name="link" className="w-4 h-4 text-[#3B82F6]" />
            Link & social
          </h3>
          <a
            href={profile.website}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-[#3B82F6] hover:text-[#2563EB] font-medium"
          >
            <Icon name="link" className="w-3.5 h-3.5" />
            {profile.website}
          </a>
        </section>
      )}
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Sidebar cards
 * ------------------------------------------------------------------------- */
function CreatorAnalyticsCard({ stats }) {
  const weeks = useMemo(() => {
    // Generate a soft, stable bar pattern (purely visual)
    const base = Math.max(1, stats.posts)
    return [0.4, 0.55, 0.45, 0.7, 0.6, 0.85, 0.95].map((v) => Math.round(v * base * 10))
  }, [stats.posts])

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6]">
            <Icon name="chart" className="w-4 h-4" />
          </span>
          <h3 className="text-sm font-semibold text-[#111827]">Creator analytics</h3>
        </div>
        <span className="text-[10px] text-[#6B7280]">7 hari</span>
      </div>

      <div className="flex items-end gap-1.5 h-16 mb-4">
        {weeks.map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-md bg-gradient-to-t from-[#3B82F6] to-[#60A5FA]"
              style={{ height: `${Math.min(100, h)}%` }}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#F3F4F6]">
        {[
          { label: 'Views', value: stats.views, icon: 'eye' },
          { label: 'Likes', value: stats.likes, icon: 'heart' },
          { label: 'Saved', value: stats.bookmarks, icon: 'bookmark' },
        ].map((m) => (
          <div key={m.label}>
            <div className="flex items-center gap-1 text-[10px] text-[#6B7280] mb-0.5">
              <Icon name={m.icon} className="w-3 h-3" />
              {m.label}
            </div>
            <div className="text-sm font-semibold text-[#111827]">
              {formatViews(m.value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FeaturedInsightCard({ post }) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6]">
          <Icon name="star" className="w-4 h-4" />
        </span>
        <h3 className="text-sm font-semibold text-[#111827]">Featured insight</h3>
      </div>

      <Link to={`/post/${post.id}`} className="group block">
        {post.thumbnail_url && (
          <div className="relative aspect-[16/9] w-full mb-3 rounded-xl overflow-hidden bg-[#F3F4F6]">
            <img
              src={post.thumbnail_url}
              alt={post.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
              onError={(e) => { e.target.style.display = 'none' }}
            />
          </div>
        )}
        {post.category && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#F3F4F6] text-[#6B7280] text-[10px] font-medium mb-2">
            {post.category}
          </span>
        )}
        <h4 className="text-sm font-semibold text-[#111827] leading-snug line-clamp-2 group-hover:text-[#3B82F6] transition-colors mb-2">
          {post.title}
        </h4>
        <div className="flex items-center gap-3 text-[11px] text-[#6B7280]">
          <span className="inline-flex items-center gap-1">
            <Icon name="heart" className="w-3 h-3" />
            {formatViews(post.likes_count || 0)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Icon name="eye" className="w-3 h-3" />
            {formatViews(post.views_count || 0)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Icon name="bookmark" className="w-3 h-3" />
            {formatViews(post.bookmarks_count || 0)}
          </span>
        </div>
      </Link>
    </div>
  )
}

function TopCategoryCard({ topCategory, allCounts }) {
  const counts = useMemo(() => {
    const map = {}
    allCounts.forEach((p) => {
      if (p.category) map[p.category] = (map[p.category] || 0) + 1
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [allCounts])

  const max = Math.max(...counts.map(([, c]) => c), 1)

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6]">
          <Icon name="pen" className="w-4 h-4" />
        </span>
        <h3 className="text-sm font-semibold text-[#111827]">Top kategori</h3>
      </div>

      <div className="space-y-2.5">
        {counts.map(([cat, count]) => (
          <div key={cat}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-[#111827] truncate">{cat}</span>
              <span className="text-[11px] text-[#6B7280]">{count} post</span>
            </div>
            <div className="h-1.5 rounded-full bg-[#F3F4F6] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] to-[#60A5FA]"
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RecentActivityCard({ posts }) {
  if (posts.length === 0) return null
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6]">
          <Icon name="calendar" className="w-4 h-4" />
        </span>
        <h3 className="text-sm font-semibold text-[#111827]">Aktivitas terbaru</h3>
      </div>

      <ul className="space-y-1">
        {posts.map((p) => (
          <li key={p.id}>
            <Link
              to={`/post/${p.id}`}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#F9FAFB] transition-colors group"
            >
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#3B82F6]/60 shrink-0" />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-semibold text-[#111827] line-clamp-2 leading-snug group-hover:text-[#3B82F6] transition-colors">
                  {p.title}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-[#6B7280]">
                  <span className="inline-flex items-center gap-0.5">
                    <Icon name="heart" className="w-2.5 h-2.5" />
                    {formatViews(p.likes_count || 0)}
                  </span>
                  <span className="w-0.5 h-0.5 rounded-full bg-[#9CA3AF]" />
                  <span className="inline-flex items-center gap-0.5">
                    <Icon name="eye" className="w-2.5 h-2.5" />
                    {formatViews(p.views_count || 0)}
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

function GrowthPromoCard() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#111827] to-[#1F2937] rounded-2xl p-5 text-white">
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#3B82F6]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="relative">
        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/10 text-white text-[10px] font-semibold mb-3">
          <Icon name="sparkles" className="w-3 h-3" />
          Skillio+
        </div>
        <h4 className="text-base font-semibold mb-1.5">Tumbuh lebih cepat</h4>
        <p className="text-xs text-white/70 leading-relaxed mb-4">
          Unlock creator analytics, AI assist, dan badge verified untuk bangun personal brand kamu.
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
 * Empty state
 * ------------------------------------------------------------------------- */
function EmptyState({ isOwnProfile, tab }) {
  const config = (() => {
    if (tab === 'media') {
      return {
        icon: 'image',
        title: 'Belum ada media',
        subtitle: 'Post dengan thumbnail atau gambar akan muncul di sini.',
      }
    }
    if (tab === 'trending') {
      return {
        icon: 'trending',
        title: 'Belum ada insight trending',
        subtitle: 'Insight yang mendapat banyak engagement akan muncul di sini.',
      }
    }
    if (tab === 'saved') {
      return {
        icon: 'bookmark',
        title: 'Belum ada insight tersimpan',
        subtitle: 'Simpan insight menarik untuk dibaca kembali nanti.',
      }
    }
    return {
      icon: 'pen',
      title: isOwnProfile ? 'Bagikan Insight Pertamamu' : 'Belum ada insight',
      subtitle: isOwnProfile
        ? 'Mulai bangun kehadiranmu di Skillio.'
        : 'Orang ini belum membagikan insight. Ikuti untuk dapat update terbaru.',
    }
  })()

  return (
    <div className="bg-white border border-dashed border-[#E5E7EB] rounded-2xl p-10 sm:p-14 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#3B82F6]/10 text-[#3B82F6] mb-4">
        <Icon name={config.icon} className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-[#111827] mb-2">{config.title}</h3>
      <p className="text-sm text-[#6B7280] mb-6 max-w-sm mx-auto">{config.subtitle}</p>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {isOwnProfile && tab === 'posts' && (
          <Link to="/upload">
            <button className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-sm shadow-blue-500/20 transition-colors">
              <Icon name="plus" className="w-4 h-4" />
              Mulai Berbagi
            </button>
          </Link>
        )}
        {tab === 'saved' && isOwnProfile && (
          <Link to="/explore">
            <button className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-sm shadow-blue-500/20 transition-colors">
              Jelajahi insight
              <Icon name="arrow-right" className="w-4 h-4" />
            </button>
          </Link>
        )}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Loading skeleton
 * ------------------------------------------------------------------------- */
function ProfileSkeleton() {
  return (
    <div>
      <div className="h-40 sm:h-56 rounded-2xl bg-[#F3F4F6] animate-pulse mb-6" />
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-[#F3F4F6] animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="w-48 h-6 bg-[#F3F4F6] rounded animate-pulse" />
            <div className="w-32 h-4 bg-[#F3F4F6] rounded animate-pulse" />
            <div className="w-80 h-3 bg-[#F3F4F6] rounded animate-pulse" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="p-5 bg-white border border-[#E5E7EB] rounded-2xl h-48 animate-pulse" />
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

export default Profile
