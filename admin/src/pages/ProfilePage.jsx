import { useState, useEffect, useCallback } from "react"
import useAuth from "../hooks/useAuth.js"

const API = "https://api.hatfixclean.com"
const FB_APP_ID = "1482154660268433"

const ROLE_MAP = {
  superadmin: { label: "ซูเปอร์แอดมิน", color: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
  admin: { label: "แอดมิน", color: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
  staff: { label: "พนักงาน", color: "bg-green-500/10 text-green-400 border-green-500/30" },
  viewer: { label: "ผู้ดู", color: "bg-gray-500/10 text-gray-400 border-gray-500/30" },
}

function loadFbSdk() {
  return new Promise((resolve) => {
    if (window.FB) return resolve(window.FB)
    window.fbAsyncInit = function () {
      window.FB.init({ appId: FB_APP_ID, cookie: true, xfbml: false, version: "v19.0" })
      resolve(window.FB)
    }
    if (!document.getElementById("facebook-jssdk")) {
      const s = document.createElement("script")
      s.id = "facebook-jssdk"
      s.src = "https://connect.facebook.net/th_TH/sdk.js"
      s.async = true
      s.defer = true
      document.head.appendChild(s)
    }
  })
}

export default function ProfilePage() {
  const { token } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState("")
  const [error, setError] = useState("")

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [curPw, setCurPw] = useState("")
  const [newPw, setNewPw] = useState("")

  // Facebook login state
  const [fbLoading, setFbLoading] = useState(false)
  const [fbConfirm, setFbConfirm] = useState(null) // { id, name, picture }

  const headers = { Authorization: "Bearer " + token, "Content-Type": "application/json" }

  useEffect(() => {
    fetch(API + "/api/users/me/profile", { headers: { Authorization: "Bearer " + token } })
      .then((r) => r.json())
      .then((d) => {
        const u = d.data || d
        setProfile(u)
        setName(u.name || "")
        setEmail(u.email || "")
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [token])

  // Load FB SDK on mount
  useEffect(() => {
    loadFbSdk()
  }, [])

  const showSuccess = useCallback((msg) => {
    setSaved(msg)
    setTimeout(() => setSaved(""), 3000)
  }, [])

  // --- Profile save ---
  const saveProfile = async () => {
    setSaving(true)
    setSaved("")
    try {
      const res = await fetch(API + "/api/users/me/profile", {
        method: "PUT",
        headers,
        body: JSON.stringify({ name, email }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.message || "บันทึกไม่สำเร็จ")
      }
      showSuccess("บันทึกข้อมูลเรียบร้อย")
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  // --- Password change ---
  const changePassword = async () => {
    if (!curPw || !newPw) return setError("กรุณากรอกรหัสผ่านทั้ง 2 ช่อง")
    setSaving(true)
    try {
      const res = await fetch(API + "/api/users/me/password", {
        method: "PUT",
        headers,
        body: JSON.stringify({ current_password: curPw, new_password: newPw }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.message)
      setCurPw("")
      setNewPw("")
      setShowPw(false)
      showSuccess("เปลี่ยนรหัสผ่านเรียบร้อย")
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  // --- Facebook Login via SDK popup ---
  const handleFbLogin = async () => {
    setFbLoading(true)
    setError("")
    try {
      const FB = await loadFbSdk()
      FB.login(
        (loginRes) => {
          if (loginRes.authResponse) {
            FB.api("/me", { fields: "id,name,picture.width(200)" }, (me) => {
              if (me && !me.error) {
                setFbConfirm({
                  id: me.id,
                  name: me.name,
                  picture: me.picture?.data?.url || null,
                })
              } else {
                setError("ไม่สามารถดึงข้อมูล Facebook ได้")
              }
              setFbLoading(false)
            })
          } else {
            setFbLoading(false)
          }
        },
        { scope: "public_profile" }
      )
    } catch (e) {
      setError("ไม่สามารถเชื่อมต่อ Facebook SDK ได้")
      setFbLoading(false)
    }
  }

  // --- Confirm Facebook link ---
  const confirmFbLink = async () => {
    if (!fbConfirm) return
    setSaving(true)
    try {
      const res = await fetch(API + "/api/users/me/facebook", {
        method: "PUT",
        headers,
        body: JSON.stringify({ facebook_psid: fbConfirm.id }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.message || "เชื่อมต่อไม่สำเร็จ")
      setProfile((prev) => ({ ...prev, facebook_psid: fbConfirm.id, is_tester: true }))
      setFbConfirm(null)
      showSuccess("เชื่อมต่อ Facebook สำเร็จ!")
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  // --- Unlink Facebook ---
  const unlinkFb = async () => {
    setSaving(true)
    try {
      await fetch(API + "/api/users/me/facebook", {
        method: "PUT",
        headers,
        body: JSON.stringify({ facebook_psid: null }),
      })
      setProfile((prev) => ({ ...prev, facebook_psid: null, is_tester: false }))
      showSuccess("ยกเลิกการเชื่อมต่อแล้ว")
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  // --- Render ---
  if (loading)
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-600 border-t-red-500" />
      </div>
    )

  const role = profile?.Role?.name || "staff"
  const roleInfo = ROLE_MAP[role] || ROLE_MAP.staff

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-800/80 border border-gray-700 rounded-2xl p-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 text-2xl font-bold">
            {(profile?.name || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{profile?.name}</h1>
            <p className="text-sm text-gray-400 mt-0.5">{profile?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${roleInfo.color}`}>
                {roleInfo.label}
              </span>
              {profile?.is_tester && (
                <span className="text-xs px-2.5 py-1 rounded-full border bg-amber-500/10 text-amber-400 border-amber-500/30 font-medium">
                  Tester
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {saved && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm text-green-400">{saved}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-2">
          <span className="text-sm text-red-400">{error}</span>
          <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Profile Edit Card */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <h3 className="text-base font-semibold text-white mb-4">ข้อมูลในระบบ</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">ชื่อ</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">อีเมล</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
            />
          </div>
          <button
            onClick={saveProfile}
            disabled={saving}
            className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </button>
        </div>
      </div>

      {/* Facebook Connect Card */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          เชื่อมต่อ Facebook
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          เชื่อมต่อบัญชี Facebook เพื่อเป็น Tester — AI จะตอบเฉพาะ Tester ในโหมดทดสอบ
        </p>

        {profile?.facebook_psid ? (
          <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 font-medium text-sm">เชื่อมต่อแล้ว</span>
              </div>
              <p className="text-gray-400 text-xs mt-0.5">Facebook ID: {profile.facebook_psid}</p>
            </div>
            <button
              onClick={unlinkFb}
              disabled={saving}
              className="text-red-400 hover:text-red-300 text-xs border border-red-500/30 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              ยกเลิก
            </button>
          </div>
        ) : (
          <button
            onClick={handleFbLogin}
            disabled={fbLoading}
            className="w-full bg-[#1877F2] hover:bg-[#166FE5] disabled:opacity-70 text-white py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-3 text-base"
          >
            {fbLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                กำลังเชื่อมต่อ...
              </>
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                ดำเนินการต่อด้วย Facebook
              </>
            )}
          </button>
        )}
      </div>

      {/* Password Change Card */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <button onClick={() => setShowPw(!showPw)} className="flex items-center justify-between w-full">
          <h3 className="text-base font-semibold text-white">เปลี่ยนรหัสผ่าน</h3>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${showPw ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showPw && (
          <div className="mt-4 space-y-3">
            <input
              type="password"
              value={curPw}
              onChange={(e) => setCurPw(e.target.value)}
              placeholder="รหัสผ่านปัจจุบัน"
              className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
            />
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="รหัสผ่านใหม่"
              className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
            />
            <button
              onClick={changePassword}
              disabled={saving}
              className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              เปลี่ยนรหัสผ่าน
            </button>
          </div>
        )}
      </div>

      {/* Facebook Confirmation Modal */}
      {fbConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setFbConfirm(null)}
        >
          <div
            className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-sm mx-4 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#1877F2] px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                ยืนยันบัญชี Facebook
              </h3>
              <button onClick={() => setFbConfirm(null)} className="text-white/70 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 text-center">
              {fbConfirm.picture ? (
                <img
                  src={fbConfirm.picture}
                  alt={fbConfirm.name}
                  className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-gray-600"
                />
              ) : (
                <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-[#1877F2]/20 border-2 border-[#1877F2]/40 flex items-center justify-center text-[#1877F2] text-2xl font-bold">
                  {(fbConfirm.name || "F").charAt(0)}
                </div>
              )}
              <p className="text-white font-semibold text-lg">{fbConfirm.name}</p>
              <p className="text-gray-400 text-sm mt-1">Facebook ID: {fbConfirm.id}</p>
              <p className="text-gray-500 text-xs mt-3">
                ต้องการเชื่อมต่อบัญชีนี้กับระบบ HatFixClean หรือไม่?
              </p>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setFbConfirm(null)}
                  className="flex-1 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={confirmFbLink}
                  disabled={saving}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                      กำลังเชื่อมต่อ...
                    </>
                  ) : (
                    "ยืนยันเชื่อมต่อ"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
