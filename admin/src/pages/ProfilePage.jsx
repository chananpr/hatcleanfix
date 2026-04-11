import { useState, useEffect, useCallback } from "react"
import { users } from "../api/index.js"

const FB_APP_ID = "1482154660268433"

function useFacebookSDK() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (window.FB) { setReady(true); return }
    window.fbAsyncInit = function () {
      window.FB.init({ appId: FB_APP_ID, cookie: true, xfbml: false, version: "v19.0" })
      setReady(true)
    }
    if (!document.getElementById("fb-sdk-script")) {
      const s = document.createElement("script")
      s.id = "fb-sdk-script"
      s.src = "https://connect.facebook.net/th_TH/sdk.js"
      s.async = true; s.defer = true
      document.body.appendChild(s)
    }
  }, [])
  return ready
}

export default function ProfilePage() {
  const sdkReady = useFacebookSDK()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ type: "", text: "" })
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [curPw, setCurPw] = useState("")
  const [newPw, setNewPw] = useState("")

  // Linking
  const [linkStep, setLinkStep] = useState("idle") // idle, fb_login, show_code, linked
  const [linkCode, setLinkCode] = useState("")
  const [fbInfo, setFbInfo] = useState(null)

  const flash = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg({ type: "", text: "" }), 4000) }

  useEffect(() => {
    users.myProfile().then(d => {
      const u = d.data || d
      setProfile(u); setName(u.name || ""); setEmail(u.email || "")
    }).catch(() => flash("error", "โหลดข้อมูลไม่สำเร็จ")).finally(() => setLoading(false))
  }, [])

  const saveProfile = async () => {
    setSaving(true)
    try { await users.updateProfile({ name, email }); flash("ok", "บันทึกเรียบร้อย") }
    catch (e) { flash("error", e.message) } finally { setSaving(false) }
  }

  const changePassword = async () => {
    if (!curPw || !newPw) return flash("error", "กรอกรหัสผ่านทั้ง 2 ช่อง")
    setSaving(true)
    try {
      await users.changePassword({ current_password: curPw, new_password: newPw })
      flash("ok", "เปลี่ยนรหัสผ่านเรียบร้อย"); setCurPw(""); setNewPw(""); setShowPw(false)
    } catch (e) { flash("error", e?.response?.data?.message || e.message) } finally { setSaving(false) }
  }

  // Facebook Login → Generate Link Code
  const startLinking = useCallback(() => {
    if (!window.FB) return flash("error", "Facebook SDK ยังไม่พร้อม")
    setLinkStep("fb_login")
    window.FB.login(function (response) {
      if (response.authResponse) {
        window.FB.api("/me", { fields: "id,name,picture.width(200)" }, async function (user) {
          setFbInfo({ id: user.id, name: user.name, picture: user.picture?.data?.url })
          // Save FB info to profile
          try { await users.linkFacebook({ facebook_psid: user.id, facebook_name: user.name, facebook_picture: user.picture?.data?.url }) } catch {}
          // Generate linking code
          try {
            const res = await users.generateLinkCode()
            const code = res.data?.code || res.code
            setLinkCode(code)
            setLinkStep("show_code")
          } catch (e) { flash("error", "สร้าง code ไม่สำเร็จ"); setLinkStep("idle") }
        })
      } else { setLinkStep("idle") }
    }, { scope: "public_profile" })
  }, [])

  const unlinkFb = async () => {
    setSaving(true)
    try {
      await users.linkFacebook({ facebook_psid: null })
      setProfile(prev => ({ ...prev, facebook_psid: null, is_tester: false, facebook_name: null, facebook_picture: null }))
      setLinkStep("idle"); setLinkCode(""); setFbInfo(null)
      flash("ok", "ยกเลิกการเชื่อมต่อแล้ว")
    } catch (e) { flash("error", e.message) } finally { setSaving(false) }
  }

  if (loading) return <div className="flex items-center justify-center py-32"><div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-600 border-t-red-500" /></div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-800/80 border border-gray-700 rounded-2xl p-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 text-2xl font-bold">
            {profile?.facebook_picture
              ? <img src={profile.facebook_picture} alt="" className="w-full h-full object-cover" />
              : (profile?.name || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{profile?.name}</h1>
            <p className="text-sm text-gray-400 mt-0.5">{profile?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              {profile?.is_tester && <span className="text-xs px-2.5 py-1 rounded-full border bg-amber-500/10 text-amber-400 border-amber-500/30 font-medium">🧪 Tester</span>}
              {profile?.facebook_name && <span className="text-xs px-2.5 py-1 rounded-full border bg-blue-500/10 text-blue-400 border-blue-500/30">{profile.facebook_name}</span>}
            </div>
          </div>
        </div>
      </div>

      {msg.text && (
        <div className={`${msg.type === "ok" ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-red-500/10 border-red-500/30 text-red-400"} border rounded-xl p-3 text-sm flex items-center gap-2`}>
          {msg.type === "ok" ? "✓" : "✕"} {msg.text}
        </div>
      )}

      {/* Profile */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <h3 className="text-base font-semibold text-white mb-4">ข้อมูลในระบบ</h3>
        <div className="space-y-4">
          <div><label className="block text-sm text-gray-400 mb-1">ชื่อ</label><input value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50" /></div>
          <div><label className="block text-sm text-gray-400 mb-1">อีเมล</label><input value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50" /></div>
          <button onClick={saveProfile} disabled={saving} className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-medium">บันทึกข้อมูล</button>
        </div>
      </div>

      {/* Facebook Connection */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          เชื่อมต่อ Facebook + Messenger
        </h3>
        <p className="text-xs text-gray-500 mb-4">เชื่อมต่อบัญชี Facebook แล้วส่ง code ไปที่เพจเพื่อผูก Messenger</p>

        {/* Already linked with real PSID */}
        {profile?.is_tester && profile?.facebook_psid && linkStep !== "show_code" ? (
          <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-green-500 flex-shrink-0">
              {profile.facebook_picture ? <img src={profile.facebook_picture} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-green-500/20 flex items-center justify-center text-green-400 text-xl font-bold">{(profile.facebook_name || "?").charAt(0)}</div>}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /><span className="text-green-400 font-medium text-sm">เชื่อมต่อแล้ว</span></div>
              {profile.facebook_name && <p className="text-white text-sm font-medium mt-0.5">{profile.facebook_name}</p>}
              <p className="text-gray-500 text-xs mt-0.5">ID: {profile.facebook_psid}</p>
            </div>
            <button onClick={unlinkFb} disabled={saving} className="text-red-400 hover:text-red-300 text-xs border border-red-500/30 px-3 py-1.5 rounded-lg">ยกเลิก</button>
          </div>

        /* Show Linking Code */
        ) : linkStep === "show_code" && linkCode ? (
          <div className="space-y-4">
            {fbInfo && (
              <div className="flex items-center gap-3 bg-blue-500/5 border border-blue-500/20 rounded-xl p-3">
                {fbInfo.picture && <img src={fbInfo.picture} alt="" className="w-10 h-10 rounded-full border border-blue-500" />}
                <div>
                  <p className="text-white text-sm font-medium">{fbInfo.name}</p>
                  <p className="text-blue-400 text-xs">Facebook เชื่อมต่อแล้ว ✓</p>
                </div>
              </div>
            )}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5 text-center">
              <p className="text-amber-400 text-sm font-medium mb-3">ขั้นตอนสุดท้าย — ส่ง code นี้ไปที่เพจ</p>
              <div className="bg-gray-900 rounded-xl px-6 py-4 inline-block">
                <span className="text-3xl font-mono font-bold text-white tracking-wider">{linkCode}</span>
              </div>
              <p className="text-gray-500 text-xs mt-3">เปิด Messenger → ทักเพจ Hat Fix & Clean → พิมพ์ code ด้านบน</p>
              <p className="text-gray-600 text-xs mt-1">code หมดอายุใน 30 นาที</p>
              <button onClick={() => { navigator.clipboard?.writeText(linkCode); flash("ok", "คัดลอก code แล้ว") }} className="mt-3 text-amber-400 hover:text-amber-300 text-sm border border-amber-500/30 px-4 py-2 rounded-lg">📋 คัดลอก code</button>
            </div>
          </div>

        /* FB Login button */
        ) : (
          <div className="space-y-3">
            <button onClick={startLinking} disabled={!sdkReady || linkStep === "fb_login"} className="w-full bg-[#1877F2] hover:bg-[#166FE5] disabled:opacity-60 text-white py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-3 text-base">
              {linkStep === "fb_login" ? (
                <><div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" /> กำลังเชื่อมต่อ...</>
              ) : (
                <><svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> ดำเนินการต่อด้วย Facebook</>
              )}
            </button>
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-3">
              <p className="text-xs text-gray-500 font-medium mb-1">ขั้นตอน:</p>
              <p className="text-xs text-gray-500">1. กดปุ่ม → Login ด้วย Facebook ของคุณ</p>
              <p className="text-xs text-gray-500">2. ระบบจะสร้าง code ให้</p>
              <p className="text-xs text-gray-500">3. ส่ง code ไปที่เพจ Hat Fix & Clean ผ่าน Messenger</p>
              <p className="text-xs text-gray-500">4. ระบบจะผูก Messenger ของคุณอัตโนมัติ ✅</p>
            </div>
          </div>
        )}
      </div>

      {/* Password */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <button onClick={() => setShowPw(!showPw)} className="flex items-center justify-between w-full">
          <h3 className="text-base font-semibold text-white">เปลี่ยนรหัสผ่าน</h3>
          <svg className={`w-5 h-5 text-gray-400 transition-transform ${showPw ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
        {showPw && (
          <div className="mt-4 space-y-3">
            <input type="password" value={curPw} onChange={e => setCurPw(e.target.value)} placeholder="รหัสผ่านปัจจุบัน" className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
            <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="รหัสผ่านใหม่" className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
            <button onClick={changePassword} disabled={saving} className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-medium">เปลี่ยนรหัสผ่าน</button>
          </div>
        )}
      </div>
    </div>
  )
}
