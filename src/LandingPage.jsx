import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from './services/supabaseClient'

function LandingPage({ user }) {
  const [skills, setSkills] = useState([])
  const [email, setEmail] = useState('')

  useEffect(() => {
    fetchSkills()
  }, [])

  async function fetchSkills() {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3)

    if (error) {
      console.error('Error fetching skills:', error)
    } else {
      setSkills(data)
    }
  }

  const handleEmailSubmit = (e) => {
    e.preventDefault()
    alert(`Thanks for subscribing: ${email}`)
    setEmail('')
  }

  return (
    <div className="bg-slate-50 overflow-hidden">
      {/* Navbar handled by App.jsx */}
      
      {/* Add padding top to account for fixed navbar */}
      <div className="pt-28">
        {/* Hero Section - Editorial Style */}
        <section id="home" className="relative min-h-screen flex items-center justify-center px-6 py-20 bg-slate-50">
          {/* Floating Decorative Elements */}
          <div className="absolute top-32 right-[10%] w-20 h-20 bg-purple-200/40 rounded-full blur-2xl animate-[float_6s_ease-in-out_infinite]"></div>
          <div className="absolute bottom-32 left-[15%] w-32 h-32 bg-purple-300/30 rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite]"></div>
          <div className="absolute top-1/2 right-[20%] w-16 h-16 bg-purple-400/20 rounded-full blur-xl animate-[float_7s_ease-in-out_infinite]"></div>
          
          <div className="max-w-[1400px] mx-auto w-full relative z-10 text-center">
            {/* Oversized Editorial Typography */}
            <div className="max-w-[1100px] mx-auto animate-[fadeIn_0.8s_ease-out]">
              <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-[1.1] text-slate-900 mb-8 tracking-tight">
                Berbagi Insight<br />
                Bersama Komunitas<br />
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 bg-clip-text text-transparent">
                    Kreatif
                  </span>
                  {/* Decorative underline */}
                  <svg className="absolute -bottom-2 left-0 w-full h-4" viewBox="0 0 400 12" fill="none">
                    <path d="M2 10C80 4 160 2 240 6C320 10 360 8 398 4" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round"/>
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#7C3AED" />
                        <stop offset="100%" stopColor="#A855F7" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h1>

              <p className="text-[clamp(1rem,1.5vw,1.25rem)] leading-relaxed text-slate-600 mb-12 max-w-[680px] mx-auto">
               Temukan workflow, pengalaman, dan insight nyata dari creator kreatif.
              </p>

              {/* CTA Buttons */}
              <div className="flex gap-4 flex-wrap justify-center">
                <Link to={user ? '/home' : '/register'}>
                  <button className="group px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 rounded-2xl hover:shadow-2xl hover:shadow-purple-500/40 hover:-translate-y-1 transition-all shadow-lg shadow-purple-500/30">
                    Mulai Sekarang
                    <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </Link>
                <Link to="/home">
                  <button className="px-8 py-4 text-base font-semibold text-slate-700 bg-white border-2 border-slate-200 rounded-2xl hover:border-purple-300 hover:bg-purple-50/50 transition-all">
                    Jelajahi Skill
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

      {/* Categories Section - Modern Community Categories */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="text-center text-[clamp(1.5rem,3vw,2rem)] font-bold text-slate-900 mb-12">
            Jelajahi Skill Dari Komunitas Kreatif
          </h2>
          
          <div className="flex flex-wrap justify-center items-center gap-4">
            {[
              { name: 'Desain', icon: '🎨', color: 'from-purple-500 to-purple-400' },
              { name: 'Programming', icon: '💻', color: 'from-blue-500 to-blue-400' },
              { name: 'Marketing', icon: '📈', color: 'from-pink-500 to-pink-400' },
              { name: 'Video Editing', icon: '🎬', color: 'from-orange-500 to-orange-400' },
              { name: 'Bisnis', icon: '💼', color: 'from-green-500 to-green-400' },
              { name: 'AI Tools', icon: '🤖', color: 'from-indigo-500 to-indigo-400' }
            ].map((category, index) => (
              <div
                key={index}
                className="group relative px-6 py-3 bg-white border-2 border-slate-200 rounded-full hover:border-transparent hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-0 group-hover:opacity-100 rounded-full transition-opacity duration-300`}></div>
                
                {/* Content */}
                <div className="relative flex items-center gap-2">
                  <span className="text-xl group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </span>
                  <span className="font-semibold text-slate-700 group-hover:text-white transition-colors duration-300">
                    {category.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Modern Bento Grid */}
      <section id="features" className="relative py-32 px-6 bg-slate-50">
        {/* Decorative blob */}
        <div className="absolute top-20 left-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-[1400px] mx-auto relative z-10">
          {/* Section Header - Minimal */}
          <div className="mb-16 text-center">
            <h2 className="text-[clamp(2.5rem,5vw,3.5rem)] font-black text-slate-900 mb-4 leading-[1.15] tracking-tight">
              Semua yang Anda Butuhkan
            </h2>
            <p className="text-lg text-slate-600">
              Dibangun untuk kreator, pembelajar, dan komunitas
            </p>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
            {/* Large Card - Learn From Community */}
            <div className="lg:col-span-8 bg-gradient-to-br from-purple-600 to-purple-500 p-12 rounded-[40px] text-white relative overflow-hidden group hover:-translate-y-1 transition-all">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform">
                  👥
                </div>
                <h3 className="text-3xl font-bold mb-3">Berbagi Dari Komunitas</h3>
                <p className="text-lg text-purple-100 max-w-[500px]">
                  Temukan insight, workflow, dan pengalaman dari kreator di seluruh dunia.
                </p>
              </div>
            </div>

            {/* Medium Card - Premium Courses */}
            <div className="lg:col-span-4 bg-white p-10 rounded-[40px] border border-slate-200 hover:-translate-y-1 hover:shadow-2xl transition-all group">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-400 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                ⭐
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Konten Premium</h3>
              <p className="text-base text-slate-600">
                Akses workflow eksklusif dan aset downloadable dari kreator.
              </p>
            </div>

            {/* Small Card - Upload Skills */}
            <div className="lg:col-span-4 bg-white p-10 rounded-[40px] border border-slate-200 hover:-translate-y-1 hover:shadow-2xl transition-all group">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-400 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                📤
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Bagikan Pengalaman</h3>
              <p className="text-base text-slate-600">
                Bagikan insight dan workflow Anda dengan komunitas.
              </p>
            </div>

            {/* Medium Card - Save & Bookmark */}
            <div className="lg:col-span-5 bg-slate-900 p-10 rounded-[40px] text-white hover:-translate-y-1 hover:shadow-2xl transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                  🔖
                </div>
                <h3 className="text-2xl font-bold mb-3">Simpan & Bookmark</h3>
                <p className="text-base text-slate-300">
                  Simpan skill favorit Anda di satu tempat.
                </p>
              </div>
            </div>

            {/* Small Card - Interactive Discussion */}
            <div className="lg:col-span-3 bg-white p-8 rounded-[40px] border border-slate-200 hover:-translate-y-1 hover:shadow-2xl transition-all group">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-400 rounded-2xl flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform">
                💬
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Diskusi Interaktif</h3>
              <p className="text-sm text-slate-600">
                Terhubung dan berdiskusi dengan kreator.
              </p>
            </div>

            {/* Large Card - Multi Categories */}
            <div className="lg:col-span-7 bg-gradient-to-br from-slate-900 to-slate-800 p-12 rounded-[40px] text-white relative overflow-hidden group hover:-translate-y-1 transition-all">
              <div className="absolute bottom-0 right-0 w-56 h-56 bg-purple-500/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform">
                  🎯
                </div>
                <h3 className="text-3xl font-bold mb-3">Multi Kategori Skill</h3>
                <p className="text-lg text-slate-300 max-w-[500px]">
                  Jelajahi skill lebih dari sekadar programming. Desain, marketing, bisnis, dan lainnya.
                </p>
                
                {/* Category Pills */}
                <div className="flex flex-wrap gap-2 mt-6">
                  {['Desain', 'Code', 'Marketing', 'Video', 'AI'].map((cat, i) => (
                    <span key={i} className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Small Card - Fast & Reliable */}
            <div className="lg:col-span-5 bg-white p-10 rounded-[40px] border border-slate-200 hover:-translate-y-1 hover:shadow-2xl transition-all group">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-400 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                ⚡
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Cepat & Andal</h3>
              <p className="text-base text-slate-600">
                Performa super cepat dengan jaminan uptime 99.9%.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Skills - Visual Content Showcase */}
      <section id="community" className="py-32 px-6 bg-slate-50">
        <div className="max-w-[1400px] mx-auto">
          {/* Section Header */}
          <div className="mb-16 text-center max-w-[800px] mx-auto">
            <h2 className="text-[clamp(2.5rem,5vw,3.5rem)] font-black text-slate-900 mb-6 leading-[1.15] tracking-tight">
              Insight Populer dari Komunitas
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Temukan workflow, pengalaman, dan insight yang dibagikan oleh kreator di seluruh dunia.
            </p>
          </div>

          {/* Skills Grid */}
          {skills.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {skills.map((skill) => (
                <Link key={skill.id} to={`/skill/${skill.id}`} className="no-underline group">
                  <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:border-purple-200 transition-all h-full">
                    {/* Thumbnail */}
                    <div className="relative h-48 bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center overflow-hidden">
                      <div className="text-6xl group-hover:scale-110 transition-transform">
                        {skill.category === 'Design' ? '🎨' : 
                         skill.category === 'Programming' ? '💻' : 
                         skill.category === 'Marketing' ? '📈' : 
                         skill.category === 'Video' ? '🎬' : 
                         skill.category === 'Business' ? '💼' : '📚'}
                      </div>
                      
                      {/* Premium Badge */}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 shadow-sm">
                        Gratis
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Category Badge */}
                      <div className="inline-block bg-purple-50 text-purple-600 px-3 py-1 rounded-lg text-xs font-semibold mb-3">
                        {skill.category}
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
                        {skill.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-2">
                        {skill.description}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        {/* Creator */}
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center text-sm">
                            👤
                          </div>
                          <span className="text-sm font-medium text-slate-700">Kreator</span>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <span>👁️</span>
                            <span>1.2K</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>🔖</span>
                            <span>89</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            // Dummy Content when no skills available
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {[
                { 
                  title: 'Cara Aku Mendapat Client Pertama Sebagai UI Designer', 
                  desc: 'Pengalaman pribadi dan strategi yang aku pakai untuk mendapatkan client pertama.',
                  category: 'Desain',
                  icon: '🎨',
                  creator: 'Sarah Kim',
                  views: '2.4K',
                  saves: '156',
                  premium: false
                },
                { 
                  title: 'Workflow Editing Video yang Aku Pakai untuk Freelance', 
                  desc: 'Tools dan workflow editing video yang mempercepat produktivitas freelance.',
                  category: 'Video Editing',
                  icon: '🎬',
                  creator: 'Mike Johnson',
                  views: '2.9K',
                  saves: '189',
                  premium: true
                },
                { 
                  title: '5 Prompt AI yang Mempercepat Kerja Content Creator', 
                  desc: 'Prompt AI favorit yang aku pakai setiap hari untuk membuat konten lebih cepat.',
                  category: 'AI Tools',
                  icon: '🤖',
                  creator: 'Emma Wilson',
                  views: '3.1K',
                  saves: '203',
                  premium: false
                },
                { 
                  title: 'Tools Marketing Gratis yang Aku Pakai Setiap Hari', 
                  desc: 'Rekomendasi tools marketing gratis yang powerful untuk startup dan freelancer.',
                  category: 'Marketing',
                  icon: '📈',
                  creator: 'Alex Chen',
                  views: '1.8K',
                  saves: '127',
                  premium: false
                },
                { 
                  title: 'Cara Membuat Portfolio Design yang Menarik', 
                  desc: 'Tips dan trik membuat portfolio design yang stand out dan menarik client.',
                  category: 'Desain',
                  icon: '🎨',
                  creator: 'David Lee',
                  views: '1.5K',
                  saves: '98',
                  premium: false
                },
                { 
                  title: 'Setup Development Environment yang Aku Pakai', 
                  desc: 'Tools, extensions, dan konfigurasi development environment untuk produktivitas maksimal.',
                  category: 'Programming',
                  icon: '💻',
                  creator: 'Lisa Park',
                  views: '4.2K',
                  saves: '267',
                  premium: true
                }
              ].map((skill, index) => (
                <Link key={index} to={user ? '/home' : '/login'} className="no-underline group">
                  <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:border-purple-200 transition-all h-full">
                    {/* Thumbnail */}
                    <div className="relative h-48 bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center overflow-hidden">
                      <div className="text-6xl group-hover:scale-110 transition-transform">
                        {skill.icon}
                      </div>
                      
                      {/* Premium Badge */}
                      {skill.premium ? (
                        <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-amber-400 px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-lg flex items-center gap-1">
                          <span>👑</span>
                          <span>Premium</span>
                        </div>
                      ) : (
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 shadow-sm">
                          Free
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Category Badge */}
                      <div className="inline-block bg-purple-50 text-purple-600 px-3 py-1 rounded-lg text-xs font-semibold mb-3">
                        {skill.category}
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-purple-600 transition-colors">
                        {skill.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-slate-600 leading-relaxed mb-4">
                        {skill.desc}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        {/* Creator */}
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center text-sm">
                            👤
                          </div>
                          <span className="text-sm font-medium text-slate-700">{skill.creator}</span>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <span>👁️</span>
                            <span>{skill.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>🔖</span>
                            <span>{skill.saves}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* CTA Button */}
          <div className="text-center">
            <Link to={user ? '/home' : '/login'}>
              <button className="px-8 py-4 text-base font-semibold text-slate-700 bg-white border-2 border-slate-200 rounded-2xl hover:border-purple-300 hover:bg-purple-50/50 hover:-translate-y-1 transition-all shadow-sm">
                Jelajahi Semua Skill
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials - Bento Grid Style */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-[1400px] mx-auto">
          {/* Section Header */}
          <div className="mb-20 text-center max-w-[800px] mx-auto">
            <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-black text-slate-900 mb-6 leading-[1.15] tracking-tight">
              Dicintai Komunitas Kreatif
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              Lihat apa kata komunitas kami tentang pengalaman berbagi dan belajar bersama.
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                name: 'Sarah Johnson', 
                role: 'Product Designer', 
                text: 'Skillio mengubah cara aku belajar. Insight dari kreator sangat membantu karir aku.', 
                avatar: '👩‍💼',
                color: 'from-purple-500 to-purple-400'
              },
              { 
                name: 'Michael Chen', 
                role: 'Software Engineer', 
                text: 'Workflow dan pengalaman yang dibagikan kreator sangat praktis dan langsung bisa diterapkan.', 
                avatar: '👨‍💻',
                color: 'from-blue-500 to-blue-400'
              },
              { 
                name: 'Emily Rodriguez', 
                role: 'Content Creator', 
                text: 'Komunitas yang supportive dan konten yang berkualitas. Worth it banget!', 
                avatar: '👩‍🎨',
                color: 'from-pink-500 to-pink-400'
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-slate-50 p-8 rounded-[32px] border border-slate-200 hover:-translate-y-1 transition-all">
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-base text-slate-700 leading-relaxed mb-8">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-2xl shadow-lg`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="text-base font-bold text-slate-900">{testimonial.name}</div>
                    <div className="text-sm text-slate-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - Community Support */}
      <section className="py-32 px-6 bg-slate-50">
        <div className="max-w-[1400px] mx-auto">
          {/* Section Header */}
          <div className="mb-16 text-center max-w-[800px] mx-auto">
            <h2 className="text-[clamp(2.5rem,5vw,3.5rem)] font-black text-slate-900 mb-6 leading-[1.15] tracking-tight">
              Dukung Komunitas
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              Langganan Anda membantu kreator terus berbagi pengetahuan berharga dengan pembelajar di seluruh dunia.
            </p>

            {/* Community Impact Stats */}
            <div className="flex justify-center items-center gap-8 flex-wrap text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👥</span>
                <span><strong className="text-purple-600 font-bold">500+</strong> Kreator Didukung</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎓</span>
                <span><strong className="text-purple-600 font-bold">10K+</strong> Pembelajar Aktif</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">📚</span>
                <span><strong className="text-purple-600 font-bold">2K+</strong> Tutorial Premium</span>
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-[1000px] mx-auto mb-12">
            {/* Free Plan */}
            <div className="bg-white p-10 rounded-[40px] border-2 border-slate-200 hover:-translate-y-1 transition-all">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Gratis</h3>
                <p className="text-slate-600">Mulai jelajahi dan belajar</p>
              </div>

              <div className="mb-8">
                <span className="text-5xl font-black text-slate-900">$0</span>
                <span className="text-slate-500 ml-2">selamanya</span>
              </div>

              <ul className="space-y-4 mb-10">
                {[
                  'Akses konten gratis',
                  'Jelajahi komunitas',
                  'Bookmark insight',
                  'Gabung diskusi'
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-700">
                    <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to={user ? '/home' : '/register'}>
                <button className="w-full px-6 py-4 text-base font-semibold text-slate-700 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all">
                  Mulai Jelajahi
                </button>
              </Link>
            </div>

            {/* Premium Plan - Featured */}
            <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 p-10 rounded-[40px] hover:-translate-y-1 transition-all shadow-2xl">
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-purple-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                Dukung Kreator
              </div>

              {/* Decorative glow */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>

              <div className="relative z-10">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
                  <p className="text-slate-300">Buka semua & dukung kreator</p>
                </div>

                <div className="mb-8">
                  <span className="text-5xl font-black text-white">$29</span>
                  <span className="text-slate-400 ml-2">/bulan</span>
                </div>

                <ul className="space-y-4 mb-10">
                  {[
                    'Konten eksklusif kreator',
                    'Aset yang bisa diunduh',
                    'Workflow mendalam',
                    'Pengalaman bebas iklan',
                    'Akses penuh tanpa batas',
                    'Dukung ekosistem kreator'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-white">
                      <svg className="w-6 h-6 text-purple-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to={user ? '/home' : '/login'}>
                  <button className="w-full px-6 py-4 text-base font-semibold text-slate-900 bg-white rounded-2xl hover:bg-slate-100 transition-all shadow-lg">
                    Gabung Komunitas Premium
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Impact Message */}
          <div className="text-center max-w-[600px] mx-auto">
            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6">
              <p className="text-base text-slate-700 leading-relaxed">
                <span className="font-semibold text-purple-600">Setiap member premium</span> membantu mendanai lebih banyak konten pembelajaran buatan komunitas dan mendukung kreator di seluruh dunia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Support Our Mission - Community-Driven */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-[900px] mx-auto text-center">
          {/* Decorative heart icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-50 rounded-full mb-8">
            <span className="text-4xl">💜</span>
          </div>

          <h2 className="text-[clamp(2.5rem,5vw,3.5rem)] font-black text-slate-900 mb-6 leading-[1.15] tracking-tight">
            Dukung Misi Kami
          </h2>
          
          <p className="text-lg text-slate-600 leading-relaxed mb-12 max-w-[700px] mx-auto">
            Dukungan Anda membantu Skillio terus membangun platform komunitas untuk berbagi skill, insight, dan pengalaman kreatif.
          </p>

          {/* Impact Stats */}
          <div className="grid grid-cols-3 gap-8 mb-12 max-w-[600px] mx-auto">
            <div>
              <div className="text-3xl font-black text-purple-600 mb-2">10K+</div>
              <div className="text-sm text-slate-600">Pembelajar Aktif</div>
            </div>
            <div>
              <div className="text-3xl font-black text-purple-600 mb-2">500+</div>
              <div className="text-sm text-slate-600">Kreator Komunitas</div>
            </div>
            <div>
              <div className="text-3xl font-black text-purple-600 mb-2">2K+</div>
              <div className="text-sm text-slate-600">Insight Dibagikan</div>
            </div>
          </div>

          {/* Support Points Card */}
          <div className="bg-gradient-to-br from-slate-50 to-purple-50/30 border border-purple-100 rounded-[32px] p-10 mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Dukungan Anda memungkinkan:</h3>
            
            <div className="grid md:grid-cols-2 gap-6 text-left">
              {[
                { icon: '🚀', title: 'Pengembangan Platform', desc: 'Membangun tools yang lebih baik untuk komunitas' },
                { icon: '💪', title: 'Pemberdayaan Kreator', desc: 'Mendukung kreator berbagi lebih banyak' },
                { icon: '🌱', title: 'Pertumbuhan Komunitas', desc: 'Memperluas komunitas kreatif global' },
                { icon: '📚', title: 'Akses Lebih Baik', desc: 'Membuat platform lebih accessible' }
              ].map((point, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
                    {point.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">{point.title}</h4>
                    <p className="text-sm text-slate-600">{point.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Link to={user ? '/home' : '/login'}>
            <button className="group px-10 py-5 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 rounded-2xl hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/40 transition-all shadow-lg shadow-purple-500/30">
              Dukung Skillio
              <span className="inline-block ml-2 group-hover:scale-110 transition-transform">💜</span>
            </button>
          </Link>

          {/* Trust message */}
          <p className="text-sm text-slate-500 mt-6">
            Bergabunglah dengan komunitas kami dalam membangun platform pembelajaran yang lebih baik untuk semua
          </p>
        </div>
      </section>

      {/* Final CTA - Clean White with Visual Elements */}
      <section className="relative py-32 px-6 bg-white text-center overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-[10%] w-32 h-32 bg-purple-100 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-[15%] w-40 h-40 bg-purple-50 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-[8%] w-24 h-24 bg-purple-100/50 rounded-full blur-2xl"></div>
        
        <div className="max-w-[900px] mx-auto relative z-10">
          <h2 className="text-[clamp(2.5rem,6vw,4rem)] font-black text-slate-900 mb-6 leading-[1.1] tracking-tight">
            Mulai berbagi hari ini
          </h2>
          <p className="text-xl text-slate-600 mb-12 leading-relaxed max-w-[600px] mx-auto">
            Bergabunglah dengan ribuan kreator dan komunitas. Mulai gratis, tanpa kartu kredit.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap mb-8">
            <Link to={user ? '/upload' : '/register'}>
              <button className="group px-10 py-5 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 rounded-2xl hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/40 transition-all shadow-lg shadow-purple-500/30">
                Mulai Gratis
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </Link>
            <Link to="/home">
              <button className="px-10 py-5 text-lg font-semibold text-slate-700 bg-white border-2 border-slate-200 rounded-2xl hover:border-purple-300 hover:bg-purple-50/50 transition-all">
                Jelajahi Insight
              </button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex justify-center items-center gap-6 flex-wrap text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span>Gratis selamanya</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span>Tanpa kartu kredit</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span>Batal kapan saja</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Clean with Visual Elements */}
      <footer className="relative bg-slate-50 text-slate-900 py-20 border-t border-slate-200 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 right-[10%] w-32 h-32 bg-purple-50 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 left-[15%] w-40 h-40 bg-purple-50 rounded-full blur-3xl"></div>
        
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img 
                  src="/logo.png" 
                  alt="Skillio Logo" 
                  className="h-14 w-auto object-contain"
                />
              </div>
              <p className="text-slate-600 leading-relaxed text-sm max-w-[300px] mb-6">
                Belajar skill dari komunitas kreatif di seluruh dunia. Mulai perjalanan Anda hari ini.
              </p>
              {/* Social Links */}
              <div className="flex gap-3">
                {['T', 'L', 'G'].map((social, index) => (
                  <a 
                    key={index} 
                    href="#" 
                    className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 flex items-center justify-center transition-colors text-sm font-bold text-slate-700 hover:text-purple-600"
                  >
                    {social}
                  </a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-bold mb-5 text-slate-900">Produk</h4>
              <ul className="space-y-3">
                {['Fitur', 'Harga', 'Premium', 'Aplikasi Mobile'].map((item, index) => (
                  <li key={index}>
                    <a href="#" className="text-sm text-slate-600 hover:text-purple-600 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-bold mb-5 text-slate-900">Perusahaan</h4>
              <ul className="space-y-3">
                {['Tentang', 'Blog', 'Karir', 'Kontak'].map((item, index) => (
                  <li key={index}>
                    <a href="#" className="text-sm text-slate-600 hover:text-purple-600 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-bold mb-5 text-slate-900">Resource</h4>
              <ul className="space-y-3">
                {['Pusat Bantuan', 'Komunitas', 'Panduan', 'Dokumentasi API'].map((item, index) => (
                  <li key={index}>
                    <a href="#" className="text-sm text-slate-600 hover:text-purple-600 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              © 2024 Skillio. Hak cipta dilindungi.
            </p>
            <div className="flex gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-purple-600 transition-colors">Privasi</a>
              <a href="#" className="hover:text-purple-600 transition-colors">Ketentuan</a>
              <a href="#" className="hover:text-purple-600 transition-colors">Cookie</a>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  )
}

export default LandingPage
