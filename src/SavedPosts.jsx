import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from './services/supabaseClient'
import PostCard from './PostCard'

function SavedPosts() {
  const [savedPosts, setSavedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    loadSavedPosts()
  }, [])

  async function loadSavedPosts() {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      setCurrentUser(user)

      const { data, error } = await supabase
        .from('post_bookmarks')
        .select('*, posts(*, profiles(username, name, avatar_url, is_premium))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching saved posts:', error)
      } else {
        const posts = data.map(bookmark => bookmark.posts)
        setSavedPosts(posts)
      }

    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh] text-xl">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
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
    <div className="min-h-screen bg-slate-50">
      <div className="py-10 px-5 max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="mb-10 animate-[fadeIn_0.6s_ease-out]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center text-2xl shadow-lg">
              🔖
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 m-0">
                Koleksi Tersimpan
              </h1>
              <p className="text-base text-slate-500 m-0">
                {savedPosts.length} insight tersimpan
              </p>
            </div>
          </div>
          <p className="text-lg text-slate-600 mt-3">
            Insight dan workflow favorit yang Anda kumpulkan
          </p>
        </div>

        {savedPosts.length === 0 ? (
          <div className="bg-white rounded-[32px] border-2 border-dashed border-slate-200 p-16 text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
              <span className="text-5xl">🔖</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Belum Ada Koleksi
            </h2>
            <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
              Mulai simpan insight menarik untuk dibaca nanti dan bangun koleksi pengetahuan pribadi Anda
            </p>
            <Link to="/home">
              <button className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-8 py-4 text-base rounded-2xl font-semibold hover:shadow-xl hover:-translate-y-1 transition-all shadow-lg shadow-purple-500/30">
                Jelajahi Insight
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 animate-[fadeIn_0.7s_ease-out]">
            {savedPosts.map((post) => (
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
    </div>
  )
}

export default SavedPosts
