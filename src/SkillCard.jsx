import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from './services/supabaseClient'

function SkillCard({ skill, currentUser, showAuthor = true }) {
  const [isSaved, setIsSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (currentUser) {
      checkIfSaved()
    }
  }, [currentUser, skill.id])

  async function checkIfSaved() {
    const { data } = await supabase
      .from('saves')
      .select('id')
      .eq('user_id', currentUser.id)
      .eq('skill_id', skill.id)
      .single()

    if (data) {
      setIsSaved(true)
    }
  }

  async function handleSave() {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert('Silakan login terlebih dahulu untuk save insight')
      return
    }

    setLoading(true)

    if (isSaved) {
      const { error } = await supabase
        .from('saves')
        .delete()
        .eq('user_id', user.id)
        .eq('skill_id', skill.id)

      if (error) {
        alert('Error: ' + error.message)
        console.error(error)
      } else {
        setIsSaved(false)
        alert('Insight berhasil dihapus dari saved')
      }
    } else {
      const { error } = await supabase
        .from('saves')
        .insert([{ user_id: user.id, skill_id: skill.id }])

      if (error) {
        if (error.code === '23505') {
          alert('Insight sudah disave sebelumnya')
          setIsSaved(true)
        } else {
          alert('Error: ' + error.message)
          console.error(error)
        }
      } else {
        setIsSaved(true)
        alert('Insight berhasil disave! 🎉')
      }
    }

    setLoading(false)
  }

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative cursor-pointer">
      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={loading}
        className={`absolute top-4 right-4 px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-all shadow-sm hover:scale-105 ${
          isSaved 
            ? 'bg-purple-600 text-white' 
            : 'bg-white text-slate-600 border border-slate-200'
        } ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        {loading ? '...' : isSaved ? '✓ Saved' : '🔖 Save'}
      </button>

      <Link to={`/skill/${skill.id}`} className="no-underline">
        <h3 className="text-slate-900 mt-0 mb-3 pr-24 text-xl font-bold leading-tight">
          {skill.title}
        </h3>

        <p className="text-slate-600 leading-relaxed mb-4 text-[15px]">
          {skill.description.length > 120 
            ? skill.description.substring(0, 120) + '...' 
            : skill.description}
        </p>
      </Link>

      <div className="flex justify-between items-center flex-wrap gap-2.5 pt-3 border-t border-slate-100">
        <span className="bg-purple-100 text-purple-600 px-3.5 py-1.5 rounded-full text-[13px] font-semibold">
          {skill.category}
        </span>

        {showAuthor && skill.profiles && (
          <Link 
            to={`/u/${skill.profiles.username}`}
            className="no-underline"
            onClick={(e) => e.stopPropagation()}
          >
            <small className="text-slate-400 text-[13px] hover:text-purple-600 transition-colors">
              by <strong className="text-slate-600">{skill.profiles.name}</strong>
            </small>
          </Link>
        )}

        {!showAuthor && skill.created_at && (
          <small className="text-slate-400 text-[13px]">
            {new Date(skill.created_at).toLocaleDateString('id-ID')}
          </small>
        )}
      </div>
    </div>
  )
}

export default SkillCard
