import { Link } from 'react-router-dom'
import { useTrendingPosts } from '../hooks/useTrending'
import PostCard from '../PostCard'
import TrendingBadge, { TrendingIndicator } from './TrendingBadge'

/**
 * Trending Section Component
 * Displays trending posts with modern creator platform UI
 */
function TrendingSection({ currentUser, limit = 10, showHeader = true }) {
  const { posts, loading, error, refreshTrending, lastFetch } = useTrendingPosts(limit, true)

  if (loading && posts.length === 0) {
    return (
      <div className="space-y-6">
        {showHeader && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse"></div>
              <div className="w-32 h-6 bg-slate-200 rounded animate-pulse"></div>
            </div>
          </div>
        )}
        
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
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔥</div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Gagal Memuat Trending</h3>
        <p className="text-slate-600 mb-4">{error}</p>
        <button
          onClick={refreshTrending}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          Coba Lagi
        </button>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔥</div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Belum Ada Trending</h3>
        <p className="text-slate-600">Jadilah yang pertama membuat konten trending!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm animate-pulse">🔥</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Trending Insights</h2>
              <p className="text-sm text-slate-600">
                Konten paling populer dari creator community
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {lastFetch && (
              <span className="text-xs text-slate-500">
                Update: {lastFetch.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={refreshTrending}
              disabled={loading}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? '🔄' : '↻'} Refresh
            </button>
          </div>
        </div>
      )}

      {/* Trending Posts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => (
          <div key={post.id} className="relative">
            {/* Trending Position Indicator */}
            {index < 3 && (
              <div className="absolute -top-2 -left-2 z-10">
                <TrendingIndicator 
                  trendingScore={post.trending_score} 
                  position={index + 1} 
                />
              </div>
            )}
            
            <PostCard 
              post={post} 
              currentUser={currentUser}
              showAuthor={true}
            />
          </div>
        ))}
      </div>

      {/* Show More Button */}
      {posts.length >= limit && (
        <div className="text-center pt-6">
          <Link to="/explore?tab=trending">
            <button className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all">
              Lihat Semua Trending 🔥
            </button>
          </Link>
        </div>
      )}
    </div>
  )
}

/**
 * Compact Trending List for sidebar
 */
export function CompactTrendingList({ currentUser, limit = 5 }) {
  const { posts, loading, error } = useTrendingPosts(limit)

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-16 h-16 bg-slate-200 rounded-xl"></div>
            <div className="flex-1 space-y-2">
              <div className="w-3/4 h-3 bg-slate-200 rounded"></div>
              <div className="w-1/2 h-2 bg-slate-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error || posts.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500">
        <div className="text-2xl mb-2">🔥</div>
        <p className="text-sm">Belum ada trending</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🔥</span>
        <h3 className="font-bold text-slate-900">Trending Now</h3>
      </div>
      
      <div className="space-y-3">
        {posts.slice(0, limit).map((post, index) => (
          <Link 
            key={post.id} 
            to={`/post/${post.id}`}
            className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
          >
            {/* Thumbnail */}
            <div className="relative w-16 h-16 flex-shrink-0">
              {post.thumbnail_url ? (
                <img 
                  src={post.thumbnail_url} 
                  alt={post.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {post.category?.charAt(0) || '📝'}
                  </span>
                </div>
              )}
              
              {/* Position Badge */}
              {index < 3 && (
                <div className="absolute -top-1 -right-1">
                  <TrendingIndicator 
                    trendingScore={post.trending_score} 
                    position={index + 1} 
                  />
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-slate-900 text-sm line-clamp-2 group-hover:text-purple-600 transition-colors">
                {post.title}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-500">
                  {post.username || 'Anonymous'}
                </span>
                <span className="text-xs text-orange-600 font-medium">
                  🔥 {Math.round(post.trending_score)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <Link 
        to="/explore?tab=trending"
        className="block text-center text-sm text-purple-600 hover:text-purple-700 font-medium py-2"
      >
        Lihat Semua →
      </Link>
    </div>
  )
}

export default TrendingSection