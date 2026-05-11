import { useState, useEffect } from 'react'
import { supabase } from './services/supabaseClient'

function FollowButton({
  profileId,
  profileUsername,
  currentUser,
  size = 'medium',
  showCount = false,
  onFollowChange = null,
}) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    if (currentUser && profileId) {
      checkFollowStatus()
      fetchFollowersCount()
    } else {
      setInitialLoading(false)
    }
  }, [currentUser, profileId])

  async function checkFollowStatus() {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', currentUser.id)
        .eq('following_id', profileId)
        .maybeSingle()
      setIsFollowing(!error && !!data)
    } catch {
      setIsFollowing(false)
    } finally {
      setInitialLoading(false)
    }
  }

  async function fetchFollowersCount() {
    try {
      const { count } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profileId)
      setFollowersCount(count || 0)
    } catch {
      /* ignore */
    }
  }

  async function handleFollowToggle() {
    if (!currentUser) {
      alert('Silakan login terlebih dahulu')
      return
    }
    if (currentUser.id === profileId) {
      alert('Anda tidak bisa follow diri sendiri')
      return
    }

    setLoading(true)
    const prev = isFollowing
    setIsFollowing(!prev)

    try {
      if (prev) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', profileId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('follows')
          .insert([{ follower_id: currentUser.id, following_id: profileId }])
        if (error && error.code !== '23505') throw error
      }
      await fetchFollowersCount()
      if (onFollowChange) onFollowChange(!prev)
    } catch (error) {
      setIsFollowing(prev) // revert
      console.error('Follow error:', error)
      alert('Terjadi kesalahan: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (currentUser?.id === profileId) return null

  if (initialLoading) {
    return (
      <div
        className={`${
          size === 'small' ? 'w-20 h-8' : size === 'large' ? 'w-28 h-11' : 'w-24 h-9'
        } bg-[#F3F4F6] rounded-lg animate-pulse`}
      />
    )
  }

  const sizeClasses = {
    small: 'px-3 py-1.5 text-xs',
    medium: 'px-4 py-2 text-sm',
    large: 'px-5 py-2.5 text-sm',
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleFollowToggle}
        disabled={loading || !currentUser}
        className={`${sizeClasses[size]} inline-flex items-center gap-1.5 rounded-lg font-semibold transition-all duration-200 ${
          loading ? 'cursor-not-allowed opacity-60' : ''
        } ${
          isFollowing
            ? 'bg-white text-[#111827] border border-[#E5E7EB] hover:bg-red-50 hover:text-red-600 hover:border-red-200'
            : 'bg-[#3B82F6] text-white hover:bg-[#2563EB] shadow-sm shadow-blue-500/20'
        }`}
      >
        {loading ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </span>
        ) : isFollowing ? (
          <span className="inline-flex items-center gap-1">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
            <span className="group-hover:hidden">Diikuti</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
            Ikuti
          </span>
        )}
      </button>

      {showCount && (
        <span className="text-sm text-[#6B7280] font-medium">
          {followersCount} {followersCount === 1 ? 'pengikut' : 'pengikut'}
        </span>
      )}
    </div>
  )
}

export default FollowButton
