import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from './services/supabaseClient'

function Settings() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form fields
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [usernameError, setUsernameError] = useState('')

  useEffect(() => {
    loadUserProfile()
  }, [])

  async function loadUserProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        navigate('/login')
        return
      }

      setUser(user)

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
      } else {
        setProfile(profileData)
        setName(profileData.name || '')
        setUsername(profileData.username || '')
        setBio(profileData.bio || '')
        setAvatarUrl(profileData.avatar_url || '')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleUsernameChange(value) {
    const cleanUsername = value.toLowerCase().replace(/\s/g, '')
    setUsername(cleanUsername)
    setUsernameError('')

    if (cleanUsername === profile?.username) {
      return
    }

    if (cleanUsername.length >= 3) {
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', cleanUsername)
        .single()

      if (data) {
        setUsernameError('Username sudah dipakai, coba yang lain')
      }
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault()

    if (usernameError) {
      alert('Perbaiki error terlebih dahulu')
      return
    }

    if (username.length < 3) {
      alert('Username minimal 3 karakter')
      return
    }

    setSaving(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: name,
          username: username.toLowerCase(),
          bio: bio,
          avatar_url: avatarUrl
        })
        .eq('id', user.id)

      if (error) throw error

      alert('Profile berhasil diupdate! 🎉')
      navigate('/profile')
    } catch (error) {
      alert('Error: ' + error.message)
      console.error(error)
    } finally {
      setSaving(false)
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

  return (
    <div className="py-12 px-5 max-w-[700px] mx-auto min-h-[80vh]">
      <div className="mb-8">
        <Link to="/profile">
          <button className="bg-slate-600 text-white px-5 py-2.5 rounded-xl font-semibold mb-5 hover:bg-slate-700 transition-colors">
            ← Kembali ke Profile
          </button>
        </Link>
        
        <h1 className="text-4xl font-bold text-slate-900 mb-3">
          ⚙️ Edit Profile
        </h1>
        <p className="text-lg text-slate-600">
          Update informasi profile Anda
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <form onSubmit={handleSaveProfile}>
          <div className="mb-6 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center text-5xl mx-auto mb-3 border-4 border-purple-100">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-full h-full rounded-full object-cover" />
              ) : (
                '👤'
              )}
            </div>
            <p className="text-sm text-slate-500">Avatar URL (opsional)</p>
          </div>

          <div className="mb-5">
            <label className="block mb-2 font-semibold text-slate-900">Nama:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Nama lengkap"
              className="w-full px-4 py-3 text-base rounded-xl border border-slate-300 outline-none transition-all focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10"
            />
          </div>

          <div className="mb-5">
            <label className="block mb-2 font-semibold text-slate-900">Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              required
              placeholder="username (lowercase, tanpa spasi)"
              minLength="3"
              className={`w-full px-4 py-3 text-base rounded-xl border outline-none transition-all ${
                usernameError 
                  ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                  : 'border-slate-300 focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10'
              }`}
            />
            {usernameError && (
              <p className="text-red-500 text-sm mt-1.5">⚠️ {usernameError}</p>
            )}
            {username && !usernameError && username.length >= 3 && username !== profile?.username && (
              <p className="text-green-600 text-sm mt-1.5">✓ Username tersedia</p>
            )}
            <p className="text-slate-500 text-sm mt-1.5">
              Profile URL: /@{username || 'username'}
            </p>
          </div>

          <div className="mb-5">
            <label className="block mb-2 font-semibold text-slate-900">Bio:</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Ceritakan tentang diri Anda..."
              rows="4"
              maxLength="200"
              className="w-full px-4 py-3 text-base rounded-xl border border-slate-300 outline-none transition-all focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 font-[inherit]"
            />
            <p className="text-slate-500 text-sm mt-1.5">
              {bio.length}/200 karakter
            </p>
          </div>

          <div className="mb-5">
            <label className="block mb-2 font-semibold text-slate-900">Avatar URL:</label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-4 py-3 text-base rounded-xl border border-slate-300 outline-none transition-all focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10"
            />
            <p className="text-slate-500 text-sm mt-1.5">
              Link gambar untuk avatar profile
            </p>
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-semibold text-slate-900">Email:</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-3 text-base rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
            />
            <p className="text-slate-500 text-sm mt-1.5">
              Email tidak dapat diubah
            </p>
          </div>

          <button
            type="submit"
            disabled={saving || usernameError}
            className={`w-full py-3.5 text-base font-semibold rounded-xl transition-all ${
              saving || usernameError
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-purple-400 text-white hover:-translate-y-0.5 hover:shadow-lg'
            }`}
          >
            {saving ? 'Menyimpan...' : '💾 Simpan Perubahan'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Settings
