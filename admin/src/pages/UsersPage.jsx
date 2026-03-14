import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { users } from '../api/index.js'
import StatusBadge from '../components/common/StatusBadge.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import useAuth from '../hooks/useAuth.js'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

const ROLES = [
  { value: 'superadmin', label: 'ซูเปอร์แอดมิน' },
  { value: 'admin', label: 'แอดมิน' },
  { value: 'staff', label: 'พนักงาน' },
  { value: 'viewer', label: 'ผู้ชม' },
]

function UserModal({ user: editUser, onClose, onSave }) {
  const isEdit = !!editUser
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: editUser || {},
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold">
            {isEdit ? 'แก้ไขผู้ใช้งาน' : 'เพิ่มผู้ใช้งาน'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อ-นามสกุล</label>
            <input
              type="text"
              placeholder="ชื่อ นามสกุล"
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red ${
                errors.name ? 'border-red-400' : 'border-gray-300'
              }`}
              {...register('name', { required: 'กรุณากรอกชื่อ' })}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">อีเมล</label>
            <input
              type="email"
              placeholder="email@hatfixclean.com"
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red ${
                errors.email ? 'border-red-400' : 'border-gray-300'
              }`}
              {...register('email', { required: 'กรุณากรอกอีเมล' })}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">รหัสผ่าน</label>
              <input
                type="password"
                placeholder="••••••••"
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red ${
                  errors.password ? 'border-red-400' : 'border-gray-300'
                }`}
                {...register('password', { required: 'กรุณากรอกรหัสผ่าน', minLength: { value: 6, message: 'อย่างน้อย 6 ตัวอักษร' } })}
              />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">บทบาท</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
              {...register('role', { required: true })}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-brand-red text-white rounded-lg text-sm font-medium hover:bg-red-600"
            >
              {isEdit ? 'บันทึก' : 'เพิ่มผู้ใช้งาน'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const qc = useQueryClient()
  const { user: currentUser, hasRole } = useAuth()
  const [modal, setModal] = useState(null) // null | 'add' | user object
  const isSuperAdmin = hasRole(['superadmin'])

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: users.list,
  })

  const createMutation = useMutation({
    mutationFn: users.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setModal(null) },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => users.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setModal(null) },
  })

  const removeMutation = useMutation({
    mutationFn: users.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })

  const toggleStatus = (u) => {
    updateMutation.mutate({ id: u.id, data: { is_active: !u.is_active } })
  }

  const canEdit = (u) => {
    if (u.role === 'superadmin' && !isSuperAdmin) return false
    return true
  }

  const formatDate = (d) => {
    if (!d) return '—'
    try { return format(new Date(d), 'd MMM yy HH:mm', { locale: th }) } catch { return d }
  }

  const userList = data?.data || data?.users || data || []

  return (
    <div>
      <PageHeader
        title="จัดการผู้ใช้งาน"
        subtitle="พนักงานและสิทธิ์การเข้าถึง"
        action={
          <button
            onClick={() => setModal('add')}
            className="px-4 py-2 bg-brand-red text-white rounded-lg text-sm font-medium hover:bg-red-600 shadow-sm"
          >
            + เพิ่มผู้ใช้งาน
          </button>
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">ชื่อ</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">อีเมล</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">บทบาท</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">สถานะ</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">เข้าสู่ระบบล่าสุด</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      กำลังโหลด...
                    </div>
                  </td>
                </tr>
              ) : userList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">ไม่พบข้อมูล</td>
                </tr>
              ) : (
                userList.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">
                          {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={u.role} type="role" />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.is_active !== false
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {u.is_active !== false ? 'ใช้งาน' : 'ปิดใช้งาน'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{formatDate(u.last_login_at)}</td>
                    <td className="px-4 py-3 text-right">
                      {canEdit(u) && u.id !== currentUser?.id && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setModal(u)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            แก้ไข
                          </button>
                          <button
                            onClick={() => toggleStatus(u)}
                            className={`text-xs font-medium ${
                              u.is_active !== false
                                ? 'text-orange-500 hover:text-orange-700'
                                : 'text-green-600 hover:text-green-800'
                            }`}
                          >
                            {u.is_active !== false ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                          </button>
                          {isSuperAdmin && (
                            <button
                              onClick={() => {
                                if (confirm(`ลบผู้ใช้ ${u.name}?`)) removeMutation.mutate(u.id)
                              }}
                              className="text-xs text-red-500 hover:text-red-700 font-medium"
                            >
                              ลบ
                            </button>
                          )}
                        </div>
                      )}
                      {u.id === currentUser?.id && (
                        <span className="text-xs text-gray-400">บัญชีของคุณ</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(modal === 'add' || (modal && typeof modal === 'object')) && (
        <UserModal
          user={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={(data) => {
            if (modal === 'add') {
              createMutation.mutate(data)
            } else {
              updateMutation.mutate({ id: modal.id, data })
            }
          }}
        />
      )}
    </div>
  )
}
