import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from './services/supabaseClient'
import SkillCard from './SkillCard'

function SavedSkills() {
  const [savedSkills, setSavedSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    loadSavedSkills()
  }, [])

  async function loadSavedSkills() {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      setCurrentUser(user)

      const { data, error } = await supabase
        .from('saves')
        .select('*, skills(*, profiles(username, name, avatar_url))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching saved skills:', error)
      } else {
        const skills = data.map(save => save.skills)
        setSavedSkills(skills)
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
    <div className="py-10 px-5 max-w-[1200px] mx-auto">
      <h1 className="text-center mb-10 text-4xl font-bold text-slate-900">
        🔖 Saved Skills
      </h1>

      {savedSkills.length === 0 ? (
        <div className="bg-slate-50 p-10 text-center rounded-2xl border-2 border-dashed border-slate-200">
          <p className="text-lg text-slate-600 m-0 mb-5">
            Belum ada skill yang disave
          </p>
          <Link to="/home">
            <button className="bg-gradient-to-r from-purple-600 to-purple-400 text-white px-6 py-3 text-base rounded-xl font-semibold hover:-translate-y-0.5 transition-all">
              Explore Skill
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
          {savedSkills.map((skill) => (
            <SkillCard 
              key={skill.id} 
              skill={skill} 
              currentUser={currentUser}
              showAuthor={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default SavedSkills
