import { useState } from 'react'
import { supabase } from './services/supabaseClient'
import { useNavigate } from 'react-router-dom'
import ImageUpload from './ImageUpload'

function CreatePost() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const categories = [
    'Desain',
    'Programming',
    'Marketing',
    'Video Editing',
    'Bisnis',
    'AI Tools',
    'Productivity',
    'Content Creation',
    'Freelancing',
    'Lainnya'
  ]

  async function ensureUserProfile(user) {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingProfile) {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{ 
          id: user.id, 
          email: user.email,
          name: user.email.split('@')[0],
          username: user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
        }])

      if (insertError) {
        console.error('Error creating profile:', insertError)
        throw new Error('Gagal membuat profile: ' + insertError.message)
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        alert('Silakan login terlebih dahulu')
        setLoading(false)
        return
      }

      await ensureUserProfile(user)

      const { data, error } = await supabase
        .from('posts')
        .insert([{
          title: title,
          excerpt: excerpt,
          content: content,
          category: category,
          thumbnail_url: thumbnailUrl || null,
          user_id: user.id
        }])
        .select()

      if (error) {
        throw error
      }

      alert('Post berhasil dipublikasikan! 🎉')
      navigate('/home')

    } catch (error) {
      alert('Error: ' + error.message)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-3">
          ✍️ Buat Post Baru
        </h1>
        <p className="text-lg text-slate-600">
          Bagikan insight, workflow, atau pengalaman kreatif Anda dengan komunitas
        </p>
      </div>

      <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
        <form onSubmit={handleSubmit}>
          {/* Thumbnail Upload */}
          <div className="mb-6">
            <label className="block mb-3 font-semibold text-slate-900 text-base">
              Thumbnail <span className="text-slate-400">(opsional)</span>
            </label>
            <ImageUpload 
              onUploadComplete={(url) => setThumbnailUrl(url)}
              currentImage={thumbnailUrl}
            />
          </div>

          {/* Title */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-slate-900 text-base">
              Judul Post <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Contoh: Cara Aku Mendapat Client Pertama Sebagai UI Designer"
              className="w-full px-4 py-3 text-base rounded-xl border border-slate-300 outline-none transition-all focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10"
            />
          </div>

          {/* Excerpt */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-slate-900 text-base">
              Ringkasan Singkat <span className="text-red-500">*</span>
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              required
              placeholder="Tulis ringkasan singkat yang menarik (1-2 kalimat)"
              rows="2"
              maxLength="200"
              className="w-full px-4 py-3 text-base rounded-xl border border-slate-300 outline-none transition-all focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 font-[inherit]"
            />
            <p className="text-slate-500 text-sm mt-1.5">
              {excerpt.length}/200 karakter
            </p>
          </div>

          {/* Content */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-slate-900 text-base">
              Konten <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              placeholder="Bagikan pengalaman, workflow, tips, atau insight Anda secara detail..."
              rows="12"
              className="w-full px-4 py-3 text-base rounded-xl border border-slate-300 outline-none transition-all focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 font-[inherit]"
            />
            <p className="text-slate-500 text-sm mt-1.5">
              Tips: Gunakan paragraf, bullet points, dan struktur yang jelas
            </p>
          </div>

          {/* Category */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-slate-900 text-base">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full px-4 py-3 text-base rounded-xl border border-slate-300 outline-none transition-all focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 bg-white"
            >
              <option value="">Pilih kategori</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="px-6 py-3 text-base font-semibold rounded-xl transition-all bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-6 py-3 text-base font-semibold rounded-xl transition-all ${
                loading 
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-600 to-purple-400 text-white hover:-translate-y-0.5 hover:shadow-lg'
              }`}
            >
              {loading ? 'Mempublikasikan...' : '🚀 Publikasikan Post'}
            </button>
          </div>
        </form>
      </div>

      {/* Tips Section */}
      <div className="mt-8 bg-purple-50 border border-purple-200 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-3">💡 Tips Membuat Post yang Menarik</h3>
        <ul className="space-y-2 text-slate-700">
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-1">•</span>
            <span>Gunakan judul yang spesifik dan menarik perhatian</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-1">•</span>
            <span>Bagikan pengalaman pribadi dan contoh nyata</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-1">•</span>
            <span>Sertakan tips praktis yang bisa langsung diterapkan</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-1">•</span>
            <span>Gunakan struktur yang jelas dan mudah dibaca</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default CreatePost
