import { useState, useEffect } from 'react'
import axios from 'axios'
import useAuthStore from '../stores/auth.store.js'

const API_URL = import.meta.env.VITE_API_URL || 'https://api.hatfixclean.com'

const ROLE_LABELS = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  staff: 'Staff',
  viewer: 'Viewer',
}

const ROLE_COLORS = {
  superadmin: 'bg-purple-100 text-purple-700 border-purple-200',
  admin: 'bg-blue-100 text-blue-700 border-blue-200',
  staff: 'bg-green-100 text-green-700 border-green-200',
  viewer: 'bg-gray-100 text-gray-600 border-gray-200',
}

export default function ProfilePage() {
  const { token, setUser } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  // Show/hide password
  const [showPlainPassword, setShowPlainPassword] = useState(false)

  // Edit name
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState('')
  const [savingName, setSavingName] = useState(false)

  const headers = { Authorization: `Bearer ${token}` }

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API_URL}/api/users/me/profile`, { headers })
      setProfile(res.data)
      setNewName(res.data.name || '')
    } catch (err) {
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลโปรไฟล์ได้')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword.length < 6) {
      setPasswordError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('รหัสผ่านไม่ตรงกัน')
      return
    }

    try {
      setSavingPassword(true)
      await axios.put(`${API_URL}/api/users/me/password`, { newPassword }, { headers })
      setPasswordSuccess('เปลี่ยนรหัสผ่านสำเร็จ!')
      setNewPassword('')
      setConfirmPassword('')
      setShowPasswordForm(false)
      // Refresh profile to get updated plain_password
      fetchProfile()
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้')
    } finally {
      setSavingPassword(false)
    }
  }

  const handleUpdateName = async () => {
    if (!newName.trim()) return
    try {
      setSavingName(true)
      await axios.put(`${API_URL}/api/users/me/profile`, { name: newName.trim() }, { headers })
      setProfile((prev) => ({ ...prev, name: newName.trim() }))
      // Update auth store so sidebar reflects new name
      setUser({ ...useAuthStore.getState().user, name: newName.trim() })
      setEditingName(false)
    } catch (err) {
      setError(err.response?.data?.message || 'ไม่สามารถแก้ไขชื่อได้')
    } finally {
      setSavingName(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          กำลังโหลด...
        </div>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">เกิดข้อผิดพลาด</div>
          <div className="text-gray-500 dark:text-gray-400 text-sm">{error}</div>
          <button onClick={fetchProfile} className="mt-4 px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-brand-red-dark transition-colors">
            ลองใหม่
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">โปรไฟล์ของฉัน</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">ดูและจัดการข้อมูลบัญชีของคุณ</p>
      </div>

      {/* Success message */}
      {passwordSuccess && (
        <div className="mb-4 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm flex items-center gap-2 transition-colors">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {passwordSuccess}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
        {/* Avatar & Name header */}
        <div className="bg-gradient-to-r from-brand-dark to-gray-800 px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-2xl backdrop-blur-sm border-2 border-white/30">
              {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="px-3 py-1.5 rounded-lg text-sm text-gray-900 dark:text-white border-0 focus:ring-2 focus:ring-brand-red dark:bg-gray-700"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdateName()
                        if (e.key === 'Escape') { setEditingName(false); setNewName(profile?.name || '') }
                      }}
                    />
                    <button
                      onClick={handleUpdateName}
                      disabled={savingName}
                      className="px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      {savingName ? '...' : 'บันทึก'}
                    </button>
                    <button
                      onClick={() => { setEditingName(false); setNewName(profile?.name || '') }}
                      className="px-3 py-1.5 bg-white/20 text-white text-xs font-medium rounded-lg hover:bg-white/30 transition-colors"
                    >
                      ยกเลิก
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-white text-xl font-bold">{profile?.name || 'ไม่ระบุชื่อ'}</h2>
                    <button
                      onClick={() => setEditingName(true)}
                      className="p-1 rounded hover:bg-white/20 transition-colors"
                      title="แก้ไขชื่อ"
                    >
                      <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
              <div className="mt-1.5">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${ROLE_COLORS[profile?.role] || 'bg-gray-100 text-gray-600'}`}>
                  {ROLE_LABELS[profile?.role] || profile?.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Info sections */}
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {/* Username */}
          <div className="px-6 py-4 flex items-center justify-between transition-colors">
            <div>
              <div className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">ชื่อผู้ใช้ (Username)</div>
              <div className="text-gray-900 dark:text-white font-mono text-lg font-semibold mt-0.5">{profile?.username}</div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg transition-colors">
              <svg className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-xs text-gray-500 dark:text-gray-400">ไม่สามารถเปลี่ยนได้</span>
            </div>
          </div>

          {/* Password */}
          <div className="px-6 py-4 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">รหัสผ่านปัจจุบัน</div>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="text-xs text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors"
              >
                {showPasswordForm ? 'ยกเลิก' : 'เปลี่ยนรหัสผ่าน'}
              </button>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 font-mono transition-colors">
                {showPlainPassword ? (
                  <span className="text-gray-900 dark:text-white text-sm font-medium select-all">{profile?.plain_password}</span>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500 text-sm tracking-widest">••••••••</span>
                )}
              </div>
              <button
                onClick={() => setShowPlainPassword(!showPlainPassword)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                title={showPlainPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
              >
                {showPlainPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(profile?.plain_password || '')
                  // Simple feedback
                  const btn = document.activeElement
                  const original = btn.title
                  btn.title = 'คัดลอกแล้ว!'
                  setTimeout(() => { btn.title = original }, 1500)
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                title="คัดลอกรหัสผ่าน"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>

            {/* Change password form */}
            {showPasswordForm && (
              <form onSubmit={handleChangePassword} className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3 transition-colors">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">รหัสผ่านใหม่</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ยืนยันรหัสผ่านใหม่</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  />
                </div>
                {passwordError && (
                  <div className="px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-xs transition-colors">
                    {passwordError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="w-full py-2.5 bg-brand-red text-white font-medium rounded-lg hover:bg-brand-red-dark transition-colors disabled:opacity-50 text-sm"
                >
                  {savingPassword ? 'กำลังบันทึก...' : 'เปลี่ยนรหัสผ่าน'}
                </button>
              </form>
            )}
          </div>

          {/* Email (optional) */}
          {profile?.email && (
            <div className="px-6 py-4 transition-colors">
              <div className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">อีเมล</div>
              <div className="text-gray-900 dark:text-white text-sm mt-0.5">{profile.email}</div>
            </div>
          )}

          {/* Account info */}
          <div className="px-6 py-4 transition-colors">
            <div className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">ข้อมูลบัญชี</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-400 dark:text-gray-500">วันที่สร้างบัญชี</div>
                <div className="text-gray-700 dark:text-gray-300 text-sm mt-0.5">
                  {profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
                    : '-'}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 dark:text-gray-500">เข้าสู่ระบบล่าสุด</div>
                <div className="text-gray-700 dark:text-gray-300 text-sm mt-0.5">
                  {profile?.last_login
                    ? new Date(profile.last_login).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : 'ยังไม่เคยเข้าสู่ระบบ'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
