import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from './services/supabaseClient'
import TrendingSection from './components/TrendingSection'
import PostCard from './PostCard'

function Explore() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [currentUser, setCurrentUser] = useState(null)
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'trending')
  const [allPosts, setAllPosts] = useState([])
  const [loading, setLoading] = useState(false)

  // Get current user
  useEffect(() => {
    async function getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
    }
    getCurrentUser()
  }, [])

  // Update URL when tab changes
  useEffect(() => {
    setSearchParams({ tab: activeTab })
  }, [activeTab, setSearchParams])

  // Fetch all posts for "All" tab
  const fetchAllPosts = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            id,
            username,
            name,
            avatar_url,
            is_premium
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Error fetching posts:', error)
      } else {
        setAllPosts(data || [])
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'all') {
      fetchAllPosts()
    }
  }, [activeTab])

  const tabs = [
    { id: 'trending', label: '🔥 Trending', icon: '🔥' },
    { id: 'all', label: '📝 Semua Post', icon: '📝' },
    { id: 'categories', label: '📂 Kategori', icon: '📂' }
  ]

  return (
    <div className="py-10 px-5 max-w-[1200px] mx-auto min-h-[80vh]">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
          Explore Skillio
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Temukan insight, workflow, dan pengalaman terbaik dari creator community
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300
                  ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {/* Trending Tab */}
        {activeTab === 'trending' && (
          <TrendingSection 
            currentUser={currentUser} 
            limit={20}
            showHeader={false}
          />
        )}

        {/* All Posts Tab */}
        {activeTab === 'all' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Semua Post</h2>
              <button
                onClick={fetchAllPosts}
                disabled={loading}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? '🔄' : '↻'} Refresh
              </button>
            </div>

            {loading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
                    <div className="w-full h-48 bg-slate-200 rounded-xl mb-4"></div>
                    <div className="space-y-3">
                      <div className="w-3/4 h-4 bg-slate-200 rounded"></div>
                      <div className="w-1/2 h-3 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : allPosts.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {allPosts.map((post) => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    currentUser={currentUser}
                    showAuthor={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Belum Ada Post</h3>
                <p className="text-slate-600">Jadilah yang pertama membuat konten!</p>
              </div>
            )}
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📂</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Kategori</h3>
            <p className="text-slate-600">Fitur kategori akan segera hadir!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Explore
