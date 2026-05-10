import { Link } from 'react-router-dom'

function Navbar({ user, onLogout }) {
  return (
    <nav className="fixed top-5 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-[1200px] z-50">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl border border-slate-200/80 shadow-lg px-8 py-4 flex justify-between items-center flex-wrap gap-5">
        {/* Logo */}
        <Link 
          to="/" 
          className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent hover:scale-105 transition-transform"
        >
          Skillio
        </Link>

        {/* Center Menu */}
        <div className="flex gap-8 items-center">
          <Link 
            to="/home" 
            className="text-slate-600 hover:text-purple-600 font-medium text-[15px] transition-colors"
          >
            Home
          </Link>

          {user && (
            <>
              <Link 
                to="/upload" 
                className="text-slate-600 hover:text-purple-600 font-medium text-[15px] transition-colors"
              >
                Upload
              </Link>

              <Link 
                to="/saved" 
                className="text-slate-600 hover:text-purple-600 font-medium text-[15px] transition-colors"
              >
                Saved
              </Link>

              <Link 
                to="/profile" 
                className="text-slate-600 hover:text-purple-600 font-medium text-[15px] transition-colors"
              >
                Profile
              </Link>
            </>
          )}
        </div>

        {/* Right CTA */}
        {user ? (
          <button
            onClick={onLogout}
            className="px-6 py-2.5 text-sm font-semibold text-slate-600 bg-transparent border border-slate-200 rounded-xl hover:border-purple-600 hover:text-purple-600 transition-all"
          >
            Logout
          </button>
        ) : (
          <Link to="/login">
            <button className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-400 rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-600/40 transition-all shadow-md shadow-purple-600/30">
              Get Started
            </button>
          </Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar
