import { useState } from 'react'
import { supabase } from './services/supabaseClient'

function AddSkill() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)

  async function ensureUserProfile(user) {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingProfile) {
      // Jika profile belum ada, buat dengan data minimal
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

      console.log('Profile berhasil dibuat untuk user:', user.email)
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

      const { error } = await supabase
        .from('skills')
        .insert([{
          title: title,
          description: description,
          category: category,
          user_id: user.id
        }])

      if (error) {
        throw error
      }

      alert('Skill berhasil ditambahkan! 🎉')
      setTitle('')
      setDescription('')
      setCategory('')

    } catch (error) {
      alert('Error: ' + error.message)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border-2 border-purple-600 p-6 rounded-2xl mb-8 bg-purple-50">
      <h2 className="mt-0 mb-6 text-2xl font-bold text-slate-900">✨ Bagikan Insight Baru</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-slate-900">
            Judul:
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

        <div className="mb-4">
          <label className="block mb-2 font-semibold text-slate-900">
            Deskripsi:
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Bagikan pengalaman, workflow, atau insight Anda..."
            rows="4"
            className="w-full px-4 py-3 text-base rounded-xl border border-slate-300 outline-none transition-all focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 font-[inherit]"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-semibold text-slate-900">
            Kategori:
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            placeholder="Contoh: Desain, Programming, Marketing"
            className="w-full px-4 py-3 text-base rounded-xl border border-slate-300 outline-none transition-all focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-3 text-base font-semibold rounded-xl transition-all ${
            loading 
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-purple-600 to-purple-400 text-white hover:-translate-y-0.5 hover:shadow-lg'
          }`}
        >
          {loading ? 'Mengirim...' : '✅ Bagikan Sekarang'}
        </button>
      </form>
    </div>
  )
}

export default AddSkill
