import { useState, useEffect, useCallback } from "react"
import { usePage } from "../contexts/PageContext.jsx"
import { facebookPages } from "../api/index.js"

function ToggleSwitch({ enabled, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-7 w-[52px] items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${
        enabled ? "bg-green-500 focus:ring-green-500" : "bg-gray-600 focus:ring-gray-500"
      }`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
        enabled ? "translate-x-[26px]" : "translate-x-[3px]"
      }`} />
    </button>
  )
}

function PreviewChat({ personaName }) {
  const name = personaName || "AI"
  return (
    <div className="space-y-3">
      {/* Customer message */}
      <div className="flex items-start gap-2">
        <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center text-xs text-white flex-shrink-0">C</div>
        <div className="bg-gray-700 rounded-2xl rounded-bl-md px-3.5 py-2 max-w-[85%]">
          <p className="text-sm text-gray-200">สวัสดีครับ สนใจบริการซักหมวกครับ</p>
        </div>
      </div>
      {/* AI response */}
      <div className="flex items-start gap-2 flex-row-reverse">
        <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center text-xs text-white flex-shrink-0 font-bold">
          {name.charAt(0)}
        </div>
        <div className="bg-red-500/20 border border-red-500/30 rounded-2xl rounded-br-md px-3.5 py-2 max-w-[85%]">
          <p className="text-sm text-gray-200">สวัสดีค่ะ 😊 ยินดีต้อนรับเข้าสู่ Hat Fix & Clean ค่ะ</p>
          <p className="text-sm text-gray-300 mt-1">ต้องการบริการซักหมวกกี่ใบคะ? ส่งรูปหมวกมาให้ดูได้เลยนะคะ</p>
        </div>
      </div>
      {/* Customer reply */}
      <div className="flex items-start gap-2">
        <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center text-xs text-white flex-shrink-0">C</div>
        <div className="bg-gray-700 rounded-2xl rounded-bl-md px-3.5 py-2 max-w-[85%]">
          <p className="text-sm text-gray-200">2 ใบครับ ราคาเท่าไหร่</p>
        </div>
      </div>
      {/* AI reply */}
      <div className="flex items-start gap-2 flex-row-reverse">
        <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center text-xs text-white flex-shrink-0 font-bold">
          {name.charAt(0)}
        </div>
        <div className="bg-red-500/20 border border-red-500/30 rounded-2xl rounded-br-md px-3.5 py-2 max-w-[85%]">
          <p className="text-sm text-gray-200">ราคาเริ่มต้นที่ 200-350 บาท/ใบค่ะ ขึ้นอยู่กับประเภทและสภาพหมวก 🧢</p>
        </div>
      </div>
    </div>
  )
}

export default function AiSettingsPage() {
  const { selectedPage } = usePage()

  const [aiEnabled, setAiEnabled] = useState(false)
  const [personaName, setPersonaName] = useState("")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [promptOpen, setPromptOpen] = useState(false)
  const [usingDefault, setUsingDefault] = useState(false)

  const loadSettings = useCallback(async () => {
    if (!selectedPage?.id) return
    try {
      setLoading(true)
      const res = await facebookPages.get(selectedPage.id)
      const page = res.data || res
      setAiEnabled(!!page.ai_enabled)
      setPersonaName(page.ai_persona || page.ai_persona_name || "")
      setSystemPrompt(page.ai_system_prompt || page.system_prompt || "")
      setUsingDefault(!!page.using_default_prompt)
    } catch (err) {
      console.error("Failed to load:", err)
    } finally {
      setLoading(false)
    }
  }, [selectedPage?.id])

  useEffect(() => { loadSettings() }, [loadSettings])

  const handleToggle = async () => {
    if (!selectedPage?.id) return
    try {
      const res = await facebookPages.toggleAi(selectedPage.id)
      const updated = res.data || res
      setAiEnabled(!!updated.ai_enabled)
    } catch (err) { console.error("Toggle failed:", err) }
  }

  const handleSave = async () => {
    if (!selectedPage?.id) return
    try {
      setSaving(true)
      setSaved(false)
      await facebookPages.update(selectedPage.id, {
        ai_persona: personaName,
        ai_system_prompt: systemPrompt,
      })
      setSaved(true)
      setUsingDefault(false)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) { console.error("Save failed:", err) }
    finally { setSaving(false) }
  }

  if (!selectedPage) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-400">
        <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        <h2 className="text-xl font-semibold mb-2">ยังไม่ได้เลือกเพจ</h2>
        <p className="text-sm">เลือกเพจจากเมนูด้านซ้ายเพื่อตั้งค่า AI</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-600 border-t-red-500" />
      </div>
    )
  }

  const promptLines = systemPrompt.split("\n").length
  const promptChars = systemPrompt.length

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ─── Active Page Badge ─── */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-800/80 border border-gray-700 rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 text-xl font-bold">
            {(selectedPage.page_name || "H").charAt(0)}
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">{selectedPage.page_name}</h1>
            <p className="text-sm text-gray-400">จัดการ AI ตอบกลับอัตโนมัติสำหรับเพจนี้</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
            aiEnabled
              ? "bg-green-500/10 text-green-400 border border-green-500/30"
              : "bg-gray-700 text-gray-400 border border-gray-600"
          }`}>
            <span className={`w-2 h-2 rounded-full ${aiEnabled ? "bg-green-400 animate-pulse" : "bg-gray-500"}`} />
            {aiEnabled ? "AI เปิดใช้งาน" : "AI ปิดอยู่"}
          </span>
        </div>
      </div>

      {/* ─── AI Auto Reply Toggle ─── */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">AI ตอบกลับอัตโนมัติ</h3>
              <p className="text-sm text-gray-400 mt-0.5">
                {aiEnabled
                  ? "AI จะตอบลูกค้าอัตโนมัติใน Messenger เมื่อมีข้อความเข้า"
                  : "ข้อความจะไม่ถูกตอบอัตโนมัติ — ต้องตอบเองจากหน้า Messenger"}
              </p>
            </div>
          </div>
          <ToggleSwitch enabled={aiEnabled} onToggle={handleToggle} />
        </div>

        {/* Status indicator */}
        {aiEnabled && (
          <div className="mt-4 bg-green-500/5 border border-green-500/20 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div>
              <p className="text-sm text-green-400 font-medium">กำลังทำงาน</p>
              <p className="text-xs text-green-400/70">AI ใช้ Claude Sonnet ในการตอบกลับ พร้อมอ่านข้อมูลลูกค้า ออเดอร์ และสินค้าจากระบบ</p>
            </div>
          </div>
        )}
      </div>

      {/* ─── AI Persona + Preview ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Persona Settings */}
        <div className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">AI Persona</h3>
              <p className="text-xs text-gray-500">ตัวตนของ AI ที่ลูกค้าจะเห็น</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">ชื่อ AI</label>
              <input
                type="text"
                value={personaName}
                onChange={(e) => setPersonaName(e.target.value)}
                className="w-full bg-gray-900/80 border border-gray-600 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                placeholder="เช่น น้องแฮท"
              />
              <p className="text-xs text-gray-500 mt-1.5">ชื่อที่ AI ใช้แนะนำตัวเอง</p>
            </div>

            {/* Persona avatar preview */}
            <div className="bg-gray-900/50 rounded-xl p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-red-500/20">
                {(personaName || "AI").charAt(0)}
              </div>
              <div>
                <div className="text-white font-semibold">{personaName || "AI Assistant"}</div>
                <div className="text-xs text-gray-500">แอดมิน AI ของ {selectedPage.page_name?.substring(0, 20)}</div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-[10px] text-green-400">ออนไลน์</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Preview */}
        <div className="lg:col-span-3 bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">ตัวอย่างการสนทนา</h3>
                <p className="text-[10px] text-gray-500">ดูว่า AI จะตอบลูกค้าอย่างไร</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-gray-700 rounded-full text-gray-400">Preview</span>
          </div>
          <div className="p-5 max-h-[320px] overflow-y-auto bg-gray-900/30">
            <PreviewChat personaName={personaName} />
          </div>
        </div>
      </div>

      {/* ─── Advanced Settings (Collapsible) ─── */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
        <button
          onClick={() => setPromptOpen(!promptOpen)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div className="text-left">
              <h3 className="text-base font-semibold text-white">System Prompt</h3>
              <p className="text-xs text-gray-500">กำหนดพฤติกรรม ภาษา และข้อมูลร้านค้าให้ AI</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {usingDefault && (
              <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full">ใช้ค่าเริ่มต้น</span>
            )}
            <span className="text-xs text-gray-500">{promptChars} ตัวอักษร</span>
            <svg className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${promptOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {promptOpen && (
          <div className="px-6 pb-6 border-t border-gray-700/50">
            <div className="mt-4">
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={12}
                className="w-full bg-gray-900/80 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm leading-relaxed font-mono focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 resize-y transition-all"
                placeholder="กรอก system prompt สำหรับ AI..."
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">
                  กำหนดบุคลิก น้ำเสียง ข้อมูลร้านค้า สินค้า/บริการ และกฎเกณฑ์การตอบ
                </p>
                <span className="text-xs text-gray-600">{promptLines} บรรทัด</span>
              </div>
            </div>

            {/* Quick tips */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-gray-900/50 rounded-xl p-3 border border-gray-700/50">
                <div className="text-xs font-medium text-gray-400 mb-1">💡 น้ำเสียง</div>
                <p className="text-[11px] text-gray-500">กำหนดว่า AI พูดสุภาพ เป็นกันเอง หรือทางการ</p>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-3 border border-gray-700/50">
                <div className="text-xs font-medium text-gray-400 mb-1">📋 ข้อมูลร้าน</div>
                <p className="text-[11px] text-gray-500">ใส่รายการบริการ ราคา ขั้นตอน ที่ AI ควรรู้</p>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-3 border border-gray-700/50">
                <div className="text-xs font-medium text-gray-400 mb-1">⚠️ กฎเกณฑ์</div>
                <p className="text-[11px] text-gray-500">ระบุสิ่งที่ AI ห้ามทำ เช่น ห้ามรับชำระเงิน</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Save Bar ─── */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 flex items-center justify-between sticky bottom-4">
        <div className="flex items-center gap-3">
          {saved ? (
            <>
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="text-sm text-green-400 font-medium">บันทึกเรียบร้อยแล้ว</span>
            </>
          ) : (
            <p className="text-sm text-gray-500">กด บันทึก เพื่อใช้การตั้งค่าใหม่</p>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/30 flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
              <span>กำลังบันทึก...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <span>บันทึกการตั้งค่า</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
