import { Navigate } from 'react-router-dom'

function ProtectedRoute({ user, children }) {
  if (!user) {
    // Redirect ke login jika user belum login
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
