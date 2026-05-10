import { useState, useEffect } from 'react'
import { supabase } from './services/supabaseClient'

function FollowButton({ 
  profileId, 
  profileUsername,
  currentUser,
  size = 'medium',
  showCount = false,
  onFollowChange = null
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

  // Check apakah user sudah follow profile ini
  async function checkFollowStatus() {
    console.log('🔍 [FollowButton] Checking follow status...')
    console.log('🔍 [FollowButton] Current user:', currentUser.id)
    console.log('🔍 [FollowButton] Profile ID:', profileId)
    
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', currentUser.id)
        .eq('following_id', profileId)
        .maybeSingle()

      if (error) {
        console.error('❌ [FollowButton] Error checking follow status:', error)
        setIsFollowing(false)
      } else if (data) {
        console.log('✅ [FollowButton] Already following')
        setIsFollowing(true)
      } else {
        console.log('✅ [FollowButton] Not following')
        setIsFollowing(false)
      }
    } catch (error) {
      console.error('❌ [FollowButton] Unexpected error:', error)
      setIsFollowing(false)
    } finally {
      setInitialLoading(false)
    }
  }

  // Fetch followers count from follows table (database as source of truth)
  async function fetchFollowersCount() {
    console.log('📊 [FollowButton] Fetching followers count...')
    
    try {
      // Count from follows table: following_id = profileId
      const { count, error } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profileId)

      if (error) {
        console.error('❌ [FollowButton] Error counting followers:', error)
      } else {
        console.log('✅ [FollowButton] Followers count:', count)
        setFollowersCount(count || 0)
      }
    } catch (error) {
      console.error('❌ [FollowButton] Unexpected error:', error)
    }
  }

  // Handle follow/unfollow
  async function handleFollowToggle() {
    if (!currentUser) {
      alert('Silakan login terlebih dahulu')
      return
    }

    // Prevent self-follow
    if (currentUser.id === profileId) {
      alert('Anda tidak bisa follow diri sendiri')
      return
    }

    setLoading(true)

    try {
      if (isFollowing) {
        console.log('👎 [FollowButton] Unfollowing...')
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', profileId)

        if (error) throw error

        console.log('✅ [FollowButton] Unfollowed successfully')
        setIsFollowing(false)
        
        // Fetch fresh count from follows table
        await fetchFollowersCount()
        
        if (onFollowChange) {
          onFollowChange(false)
        }
      } else {
        console.log('👍 [FollowButton] Following...')
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert([{
            follower_id: currentUser.id,
            following_id: profileId
          }])

        if (error) {
          if (error.code === '23505') {
            // Duplicate follow
            console.warn('⚠️ [FollowButton] Already following (duplicate)')
            setIsFollowing(true)
            await fetchFollowersCount()
          } else {
            throw error
          }
        } else {
          console.log('✅ [FollowButton] Followed successfully')
          setIsFollowing(true)
          
          // Fetch fresh count from follows table
          await fetchFollowersCount()
          
          if (onFollowChange) {
            onFollowChange(true)
          }
        }
      }
    } catch (error) {
      console.error('❌ [FollowButton] Error toggling follow:', error)
      alert('Terjadi kesalahan: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Don't show button for own profile
  if (currentUser?.id === profileId) {
    return null
  }

  // Loading state
  if (initialLoading) {
    return (
      <div className={`${
        size === 'small' ? 'w-20 h-8' : 
        size === 'large' ? 'w-32 h-12' : 
        'w-24 h-10'
      } bg-slate-100 rounded-full animate-pulse`}></div>
    )
  }

  // Size variants
  const sizeClasses = {
    small: 'px-4 py-1.5 text-xs',
    medium: 'px-5 py-2 text-sm',
    large: 'px-6 py-2.5 text-base'
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleFollowToggle}
        disabled={loading || !currentUser}
        className={`
          ${sizeClasses[size]}
          font-semibold rounded-full transition-all duration-300
          ${loading ? 'cursor-not-allowed opacity-50' : 'hover:scale-105'}
          ${isFollowing 
            ? 'bg-white text-slate-700 border-2 border-slate-300 hover:border-red-400 hover:text-red-600 hover:bg-red-50' 
            : 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl'
          }
        `}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            <span>...</span>
          </span>
        ) : isFollowing ? (
          <span className="flex items-center gap-1.5">
            <span>✓</span>
            <span>Following</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <span>+</span>
            <span>Follow</span>
          </span>
        )}
      </button>

      {showCount && (
        <span className="text-sm text-slate-600 font-medium">
          {followersCount} {followersCount === 1 ? 'follower' : 'followers'}
        </span>
      )}
    </div>
  )
}

export default FollowButton
