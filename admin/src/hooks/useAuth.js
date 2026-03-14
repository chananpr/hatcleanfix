import useAuthStore from '../stores/auth.store.js'

const ROLE_HIERARCHY = {
  superadmin: 4,
  admin: 3,
  staff: 2,
  viewer: 1,
}

const RESOURCE_ROLES = {
  users: ['superadmin', 'admin'],
  pricing: ['superadmin', 'admin'],
  attribution: ['superadmin', 'admin'],
  content: ['superadmin', 'admin'],
  leads: ['superadmin', 'admin', 'staff'],
  orders: ['superadmin', 'admin', 'staff', 'viewer'],
  customers: ['superadmin', 'admin', 'staff', 'viewer'],
  dashboard: ['superadmin', 'admin', 'staff', 'viewer'],
}

export default function useAuth() {
  const { user, isAuthenticated, logout } = useAuthStore()

  const hasRole = (roles) => {
    if (!user?.role) return false
    if (!roles || roles.length === 0) return true
    return roles.includes(user.role)
  }

  const canAccess = (resource) => {
    const allowed = RESOURCE_ROLES[resource]
    if (!allowed) return true
    return hasRole(allowed)
  }

  const isAtLeast = (role) => {
    if (!user?.role) return false
    return (ROLE_HIERARCHY[user.role] || 0) >= (ROLE_HIERARCHY[role] || 0)
  }

  return {
    user,
    isAuthenticated,
    hasRole,
    canAccess,
    isAtLeast,
    logout,
  }
}
