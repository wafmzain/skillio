import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from './services/supabaseClient'
import Comments from './Comments'

function SkillDetail() {
  const { id } = useParams()
  const [skill, setSkill] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSkillDetail()
  }, [id])

  async function fetchSkillDetail() {
    const { data, error } = await supabase
      .from('skills')
      .select('*, profiles(username, name, avatar_url, id)')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching skill:', error)
    } else {
      setSkill(data)
    }
    setLoading(false)
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

  if (!skill) {
    return (
      <div className="max-w-[800px] my-12 mx-auto p-10 text-center">
        <h2 className="text-slate-900 mb-6">Skill tidak ditemukan</h2>
        <Link to="/home">
          <button className="bg-gradient-to-r from-purple-600 to-purple-400 text-white px-6 py-3 text-base rounded-xl font-semibold hover:-translate-y-0.5 transition-all">
            Kembali ke Home
          </button>
        </Link>
      </div>
    )
  }

  return (
    <div className="py-10 px-5 max-w-[900px] mx-auto">
      {/* Back Button */}
      <Link to="/home">
        <button className="bg-slate-600 text-white px-5 py-2.5 rounded-xl font-semibold mb-5 hover:bg-slate-700 transition-colors">
          ← Kembali
        </button>
      </Link>

      {/* Skill Detail */}
      <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm mb-8">
        <div className="flex justify-between items-start mb-5 flex-wrap gap-4">
          <h1 className="text-purple-600 m-0 text-4xl font-bold">
            {skill.title}
          </h1>
          <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-base font-bold">
            {skill.category}
          </span>
        </div>

        <p className="text-slate-700 text-lg leading-relaxed mb-5">
          {skill.description}
        </p>

        <div className="border-t border-slate-200 pt-4 flex justify-between items-center flex-wrap gap-2.5">
          <div>
            <small className="text-slate-400">Dibuat oleh: </small>
            {skill.profiles?.username ? (
              <Link 
                to={`/u/${skill.profiles.username}`}
                className="no-underline"
              >
                <strong className="text-purple-600 hover:text-purple-700 transition-colors">
                  {skill.profiles.name}
                </strong>
              </Link>
            ) : (
              <strong className="text-purple-600">Anonymous</strong>
            )}
          </div>
          <small className="text-slate-400">
            {new Date(skill.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </small>
        </div>
      </div>

      {/* Comments Section */}
      <Comments skillId={id} />
    </div>
  )
}

export default SkillDetail
