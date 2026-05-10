import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from './services/supabaseClient'
import PostCard from './PostCard'
import FollowButton from './FollowButton'
import { CompactTrendingList } from './components/TrendingSection'

function Home() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [trendingCreators, setTrendingCreators] = useState([])
  const [userStats, setUserStats] = useState({ followers: 0, following: 0, posts: 0 })

  useEffect(() => {
    fetchPosts()
    getCurrentUser()
    fetchTrendingCreators()
  }, [])

  useEffect(() => {
    if (currentUser) {
      fetchUserStats()
    }
  }, [currentUser])

  async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  async function fetchUserStats() {
    if (!currentUser) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', currentUser.id)
      .single()

    if (profile) {
      const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profile.id)

      const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', profile.id)

      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)

      setUserStats({
        followers: followersCount || 0,
        following: followingCount || 0,
        posts: postsCount || 0
      })
    }
  }

  async function fetchPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(id, username, name, avatar_url, is_premium)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching posts:', error)
    } else {
      setPosts(data || [])
    }
    setLoading(false)
  }

  async function fetchTrendingCreators() {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, username, name, avatar_url')
      .limit(10)

    if (error) {
      console.error('Error fetching profiles:', error)
      return
    }

    const profilesWithCounts = await Promise.all(
      profiles.map(async (profile) => {
        const { count } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', profile.id)
        
        return {
          ...profile,
          followers_count: count || 0
        }
      })
    )

    const sorted = profilesWithCounts.sort((a, b) => b.followers_count - a.followers_count).slice(0, 5)
    setTrendingCreators(sorted)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh] flex-col gap-4">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin"></div>
        <p className="text-slate-600 font-medium">Memuat konten...</p>
      </div>
    )
  }

  const categories = [
    { name: 'Semua', icon: '🌟' },
    { name: 'Design', icon: '🎨' },
    { name: 'Programming', icon: '💻' },
    { name: 'Marketing', icon: '📈' },
    { name: 'AI Tools', icon: '🤖' },
    { name: 'Productivity', icon: '⚡' },
    { name: 'Video Editing', icon: '🎬' },
    { name: 'Bisnis', icon: '💼' }
  ]

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'Semua' || post.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const trendingTopics = [
    { name: 'AI Workflow', count: '2.4k posts', trend: 'up' },
    { name: 'Figma Tips', count: '1.8k posts', trend: 'up' },
    { name: 'React Hooks', count: '3.2k posts', trend: 'hot' },
    { name: 'SEO Strategy', count: '1.5k posts', trend: 'up' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      {/* Hero Explore Section */}
      <div className="relative overflow-hidden">
        {/* Gradient Glow Background */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-8 pt-32 pb-12">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h1 className="text-5xl lg:text-6xl font-black text-slate-900 mb-4 leading-tight">
              Jelajahi Insight Kreatif
            </h1>
            <p className="text-lg lg:text-xl text-slate-600 mb-8">
              Temukan workflow, tips, dan pengalaman dari komunitas creator terbaik
            </p>

            {/* Search Bar Modern */}
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari insight, workflow, atau creator..."
                className="w-full pl-16 pr-6 py-5 text-base bg-white/80 backdrop-blur-xl border-2 border-slate-200/60 rounded-3xl outline-none transition-all focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20 shadow-xl shadow-slate-900/5 hover:shadow-2xl"
              />
            </div>
          </div>

          {/* Trending Category Pills */}
          <div className="flex items-center justify-center gap-3 flex-wrap max-w-5xl mx-auto">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => setSelectedCategory(category.name)}
                className={`group px-6 py-3 rounded-full transition-all duration-300 flex-shrink-0 font-semibold text-sm ${
                  selectedCategory === category.name
                    ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg shadow-purple-500/30 scale-105'
                    : 'bg-white/80 backdrop-blur-sm border-2 border-slate-200/60 text-slate-700 hover:border-purple-300 hover:scale-105 hover:shadow-lg'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg group-hover:scale-110 transition-transform">{category.icon}</span>
                  <span>{category.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-12 gap-6">
          
          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-3 space-y-6">
            {/* User Mini Profile Card */}
            {currentUser && (
              <div className="sticky top-24 space-y-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 p-6 shadow-lg hover:shadow-xl transition-all">
                  <Link to="/profile" className="no-underline">
                    <div className="flex flex-col items-center text-center mb-5">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 via-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-purple-500/30 mb-3">
                        {currentUser.email?.charAt(0).toUpperCase()}
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">
                        {currentUser.email?.split('@')[0]}
                      </h3>
                      <p className="text-xs text-slate-500">@{currentUser.email?.split('@')[0]}</p>
                    </div>
                  </Link>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-5 pb-5 border-b border-slate-100">
                    <div className="text-center">
                      <p className="text-xl font-bold text-slate-900">{userStats.posts}</p>
                      <p className="text-xs text-slate-500">Posts</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-slate-900">{userStats.followers}</p>
                      <p className="text-xs text-slate-500">Followers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-slate-900">{userStats.following}</p>
                      <p className="text-xs text-slate-500">Following</p>
                    </div>
                  </div>

                  {/* Quick Menu */}
                  <div className="space-y-2">
                    <Link to="/home" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-purple-50 hover:text-purple-600 transition-all no-underline">
                      <span className="text-lg">🔥</span>
                      <span className="text-sm font-semibold">Trending</span>
                    </Link>
                    <Link to="/home" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-purple-50 hover:text-purple-600 transition-all no-underline">
                      <span className="text-lg">👥</span>
                      <span className="text-sm font-semibold">Following</span>
                    </Link>
                    <Link to="/premium" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-purple-50 hover:text-purple-600 transition-all no-underline">
                      <span className="text-lg">⭐</span>
                      <span className="text-sm font-semibold">Premium</span>
                    </Link>
                    <Link to="/saved" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-purple-50 hover:text-purple-600 transition-all no-underline">
                      <span className="text-lg">🔖</span>
                      <span className="text-sm font-semibold">Saved</span>
                    </Link>
                  </div>
                </div>

                {/* Creator Leaderboard Mini */}
                <div className="bg-gradient-to-br from-purple-600 to-blue-500 rounded-3xl p-6 shadow-xl text-white">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🏆</span>
                    <h3 className="font-bold text-lg">Top Creators</h3>
                  </div>
                  <div className="space-y-3">
                    {trendingCreators.slice(0, 3).map((creator, index) => (
                      <Link 
                        key={creator.id}
                        to={`/u/${creator.username}`}
                        className="flex items-center gap-3 no-underline text-white hover:bg-white/10 rounded-xl p-2 transition-all"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm font-bold text-sm">
                          #{index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{creator.name}</p>
                          <p className="text-xs text-white/70">{creator.followers_count} followers</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* MAIN CONTENT FEED */}
          <div className="lg:col-span-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {selectedCategory === 'Semua' ? 'Untuk Anda' : selectedCategory}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {filteredPosts.length} insight tersedia
                </p>
              </div>
              {currentUser && (
                <Link to="/upload">
                  <button className="group bg-gradient-to-r from-purple-600 to-blue-500 text-white px-6 py-3 rounded-2xl font-semibold hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-1 transition-all flex items-center gap-2">
                    <span className="text-lg group-hover:scale-110 transition-transform">✍️</span>
                    <span>Buat Post</span>
                  </button>
                </Link>
              )}
            </div>

            {filteredPosts.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center">
                <div className="text-7xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Tidak ada post ditemukan</h3>
                <p className="text-slate-600 mb-6">
                  Coba ubah filter atau kata kunci pencarian
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredPosts.map((post) => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    currentUser={currentUser}
                    showAuthor={true}
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="lg:col-span-3 space-y-6">
            <div className="sticky top-24 space-y-6">
              
              {/* Trending Topics */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-2xl">📊</span>
                  <h3 className="text-lg font-bold text-slate-900">Topik Trending</h3>
                </div>
                
                <div className="space-y-3">
                  {trendingTopics.map((topic, index) => (
                    <button
                      key={index}
                      className="w-full text-left p-3 rounded-xl hover:bg-slate-50 transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-slate-900 text-sm group-hover:text-purple-600 transition-colors">
                              #{topic.name}
                            </p>
                            {topic.trend === 'hot' && (
                              <span className="text-xs">🔥</span>
                            )}
                            {topic.trend === 'up' && (
                              <span className="text-xs">📈</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">{topic.count}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Trending Creators */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-2xl">✨</span>
                  <h3 className="text-lg font-bold text-slate-900">Creator Trending</h3>
                </div>
                
                <div className="space-y-4">
                  {trendingCreators.length > 0 ? (
                    trendingCreators.map((creator) => (
                      <div key={creator.id} className="flex items-center justify-between group">
                        <Link 
                          to={`/u/${creator.username}`}
                          className="flex items-center gap-3 no-underline flex-1 min-w-0"
                        >
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform overflow-hidden flex-shrink-0">
                            {creator.avatar_url ? (
                              <img src={creator.avatar_url} alt={creator.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-lg text-white font-bold">
                                {creator.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 text-sm group-hover:text-purple-600 transition-colors truncate">
                              {creator.name}
                            </h4>
                            <p className="text-xs text-slate-500 truncate">
                              @{creator.username} • {creator.followers_count} followers
                            </p>
                          </div>
                        </Link>
                        <FollowButton 
                          profileId={creator.id}
                          profileUsername={creator.username}
                          currentUser={currentUser}
                          size="small"
                          showCount={false}
                        />
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 text-center py-4">
                      Belum ada creator
                    </p>
                  )}
                </div>
              </div>

              {/* Trending Posts */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 p-6 shadow-lg">
                <CompactTrendingList currentUser={currentUser} limit={5} />
              </div>

              {/* Daily Inspiration */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-6 border border-blue-100">
                <div className="text-center">
                  <span className="text-4xl mb-3 block">💡</span>
                  <p className="text-sm font-semibold text-slate-700 italic leading-relaxed">
                    "Creativity is intelligence having fun."
                  </p>
                  <p className="text-xs text-slate-500 mt-2">— Albert Einstein</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Create Button (Mobile) */}
      {currentUser && (
        <Link to="/upload" className="lg:hidden">
          <button className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-full shadow-2xl shadow-purple-500/40 hover:scale-110 transition-all flex items-center justify-center z-40">
            <span className="text-2xl">✍️</span>
          </button>
        </Link>
      )}
    </div>
  )
}

export default Home
