import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../stores/auth.store.js'

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && roles.length > 0) {
    if (!user?.role || !roles.includes(user.role)) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">ไม่มีสิทธิ์เข้าถึง</h1>
            <p className="text-gray-500">คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้</p>
          </div>
        </div>
      )
    }
  }

  return children
}
