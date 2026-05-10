import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from './services/supabaseClient'
import PostCard from './PostCard'
import FollowButton from './FollowButton'

function Profile() {
  const { username } = useParams()
  const [currentUser, setCurrentUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)

  useEffect(() => {
    loadProfileData()
  }, [username])

  async function loadProfileData() {
    console.log('🔄 [Profile] Loading profile data...')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      // Jika ada username di URL, load profile berdasarkan username
      // Jika tidak, load profile user yang sedang login
      let profileData
      
      if (username) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single()

        if (error) {
          console.error('❌ [Profile] Error fetching profile:', error)
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

        if (error) {
          console.error('❌ [Profile] Error fetching profile:', error)
        } else {
          profileData = data
          setIsOwnProfile(true)
        }
      }

      setProfile(profileData)

      // ALWAYS count from follows table (database as source of truth)
      if (profileData) {
        await fetchFollowCounts(profileData.id)
        
        // Fetch posts dari user ini
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*, profiles(username, name, avatar_url, is_premium)')
          .eq('user_id', profileData.id)
          .order('created_at', { ascending: false })

        if (postsError) {
          console.error('❌ [Profile] Error fetching posts:', postsError)
        } else {
          setSkills(postsData)
        }
      }

    } catch (error) {
      console.error('❌ [Profile] Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch follow counts from follows table (database as source of truth)
  async function fetchFollowCounts(profileId) {
    console.log('📊 [Profile] Fetching follow counts for profile:', profileId)
    
    try {
      // Count followers: jumlah row dimana following_id = profile.id
      const { count: followersCountResult, error: followersError } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profileId)

      if (followersError) {
        console.error('❌ [Profile] Error counting followers:', followersError)
      } else {
        console.log('✅ [Profile] Followers count:', followersCountResult)
        setFollowersCount(followersCountResult || 0)
      }

      // Count following: jumlah row dimana follower_id = profile.id
      const { count: followingCountResult, error: followingError } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', profileId)

      if (followingError) {
        console.error('❌ [Profile] Error counting following:', followingError)
      } else {
        console.log('✅ [Profile] Following count:', followingCountResult)
        setFollowingCount(followingCountResult || 0)
      }
    } catch (error) {
      console.error('❌ [Profile] Unexpected error fetching counts:', error)
    }
  }

  // Handle follow change callback
  async function handleFollowChange(isFollowing) {
    console.log('👥 [Profile] Follow status changed:', isFollowing)
    // Refresh counts from database after follow/unfollow
    if (profile) {
      await fetchFollowCounts(profile.id)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-[600px] my-12 mx-auto p-10 text-center bg-amber-50 border-2 border-amber-300 rounded-2xl">
        <h2 className="text-amber-800 mb-4">⚠️ Profile tidak ditemukan</h2>
        <Link to="/home">
          <button className="bg-gradient-to-r from-purple-600 to-purple-400 text-white px-6 py-3 text-base rounded-xl font-semibold hover:-translate-y-0.5 transition-all mt-5">
            Kembali ke Home
          </button>
        </Link>
      </div>
    )
  }

  if (!username && !currentUser) {
    return (
      <div className="max-w-[600px] my-12 mx-auto p-10 text-center bg-amber-50 border-2 border-amber-300 rounded-2xl">
        <h2 className="text-amber-800 mb-4">⚠️ Silakan login terlebih dahulu</h2>
        <Link to="/login">
          <button className="bg-gradient-to-r from-purple-600 to-purple-400 text-white px-6 py-3 text-base rounded-xl font-semibold hover:-translate-y-0.5 transition-all mt-5">
            Login Sekarang
          </button>
        </Link>
      </div>
    )
  }

  return (
    <div className="py-8 px-5 max-w-[900px] mx-auto">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-400 text-white p-8 rounded-2xl mb-8">
        <div className="flex items-center gap-6 flex-wrap">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-5xl border-4 border-white/30">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              '👤'
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <h1 className="m-0 mb-2 text-3xl font-bold">
              {profile.name}
            </h1>
            <p className="m-0 mb-2 opacity-90 text-lg">
              @{profile.username}
            </p>
            {profile.bio && (
              <p className="m-0 opacity-80 text-base">
                {profile.bio}
              </p>
            )}
            
            {/* Stats */}
            <div className="flex flex-wrap gap-6 mt-4">
              <div className="flex flex-col">
                <span className="font-bold text-2xl text-white">{skills.length}</span>
                <span className="opacity-80 text-sm">Posts</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-2xl text-white">{followersCount}</span>
                <span className="opacity-80 text-sm">Followers</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-2xl text-white">{followingCount}</span>
                <span className="opacity-80 text-sm">Following</span>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-3 mt-4">
              {profile.is_premium && (
                <div className="bg-amber-500/30 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5">
                  <span>👑</span>
                  <span>Premium Creator</span>
                </div>
              )}
              {profile.creator_points > 0 && (
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5">
                  <span>⭐</span>
                  <span>{profile.creator_points} Points</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {isOwnProfile ? (
              <Link to="/settings">
                <button className="bg-white/20 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-white/30 transition-all border border-white/30">
                  Edit Profile
                </button>
              </Link>
            ) : (
              <FollowButton 
                profileId={profile.id}
                profileUsername={profile.username}
                currentUser={currentUser}
                size="large"
                showCount={false}
                onFollowChange={handleFollowChange}
              />
            )}
          </div>
        </div>
      </div>

      {/* Skills List */}
      <div>
        <div className="flex justify-between items-center mb-5 flex-wrap gap-4">
          <h2 className="m-0 text-2xl font-bold text-slate-900">
            📚 {isOwnProfile ? 'Post Saya' : 'Posts'} ({skills.length})
          </h2>
          {isOwnProfile && (
            <Link to="/upload">
              <button className="bg-gradient-to-r from-purple-600 to-purple-400 text-white px-5 py-2.5 rounded-xl font-semibold hover:-translate-y-0.5 transition-all">
                + Buat Post
              </button>
            </Link>
          )}
        </div>

        {skills.length === 0 ? (
          <div className="bg-slate-50 p-10 text-center rounded-2xl border-2 border-dashed border-slate-200">
            <p className="text-lg text-slate-600 m-0 mb-5">
              {isOwnProfile ? 'Belum ada post yang dipublikasikan' : 'Belum ada post'}
            </p>
            {isOwnProfile && (
              <Link to="/upload">
                <button className="bg-gradient-to-r from-purple-600 to-purple-400 text-white px-6 py-3 text-base rounded-xl font-semibold hover:-translate-y-0.5 transition-all">
                  Buat Post Pertama
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {skills.map((skill) => (
              <PostCard 
                key={skill.id} 
                post={skill} 
                currentUser={currentUser}
                showAuthor={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
