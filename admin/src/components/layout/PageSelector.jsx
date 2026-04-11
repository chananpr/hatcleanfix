import { useState, useRef, useEffect, useMemo } from "react"
import { usePage } from "../../contexts/PageContext.jsx"

const AVATAR_COLORS = [
  "#E53E3E", "#DD6B20", "#D69E2E", "#38A169",
  "#319795", "#3182CE", "#5A67D8", "#805AD5",
  "#D53F8C", "#E53E3E", "#2B6CB0", "#2C7A7B",
]

function hashPageId(pageId) {
  let hash = 0
  const str = String(pageId)
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash
  }
  return Math.abs(hash)
}

function getAvatarColor(pageId) {
  return AVATAR_COLORS[hashPageId(pageId) % AVATAR_COLORS.length]
}

function PageAvatar({ page, size = "md" }) {
  const [imgError, setImgError] = useState(false)
  const name = page.page_name || page.name || "P"
  const letter = name.charAt(0).toUpperCase()
  const color = getAvatarColor(page.page_id)
  const sizeClasses = size === "md" ? "w-9 h-9 text-sm" : "w-7 h-7 text-xs"

  if (page.profile_picture_url && !imgError) {
    return (
      <img
        src={page.profile_picture_url} referrerPolicy="no-referrer"
        alt={name}
        className={`${sizeClasses} rounded-full object-cover flex-shrink-0`}
        onError={() => setImgError(true)}
      />
    )
  }

  return (
    <div
      className={`${sizeClasses} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}
      style={{ backgroundColor: color }}
    >
      {letter}
    </div>
  )
}

function AiStatusBadge({ page, compact = false }) {
  const isOn = page.ai_mode && page.ai_mode !== "off"
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={`w-2 h-2 rounded-full flex-shrink-0 ${
          isOn ? "bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]" : "bg-gray-500"
        }`}
      />
      {!compact && (
        <span className={`text-xs ${isOn ? "text-green-400" : "text-white/40"}`}>
          {page.ai_mode === "live" ? "🚀 AI" : page.ai_mode === "test" ? "🧪 ทดสอบ" : "⏸ ปิด"}
        </span>
      )}
    </span>
  )
}

export default function PageSelector() {
  const { pages, selectedPage, setSelectedPage, loading } = usePage()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const containerRef = useRef(null)
  const searchRef = useRef(null)

  // Close on click outside
  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
        setSearch("")
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handleKey(e) {
      if (e.key === "Escape") {
        setOpen(false)
        setSearch("")
      }
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [open])

  // Focus search on open
  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50)
    }
  }, [open])

  const filteredPages = useMemo(() => {
    if (!search.trim()) return pages
    const q = search.toLowerCase()
    return pages.filter((p) => {
      const name = (p.page_name || p.name || "").toLowerCase()
      return name.includes(q)
    })
  }, [pages, search])

  if (loading || pages.length === 0) return null

  const pageName = selectedPage?.page_name || selectedPage?.name || "เลือกเพจ"

  return (
    <div className="relative px-3 py-3 border-b border-white/10" ref={containerRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 transition-all duration-200 group cursor-pointer"
      >
        {selectedPage && <PageAvatar page={selectedPage} />}
        <div className="flex-1 min-w-0 text-left">
          <div className="text-white text-sm font-medium leading-tight truncate" title={pageName}>
            {pageName}
          </div>
          <div className="mt-0.5">
            {selectedPage && <AiStatusBadge page={selectedPage} />}
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-white/40 group-hover:text-white/60 transition-transform duration-200 flex-shrink-0 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      <div
        className={`absolute left-3 right-3 top-full mt-1 z-50 bg-[#252525] border border-white/15 rounded-xl shadow-2xl shadow-black/40 overflow-hidden transition-all duration-200 origin-top ${
          open
            ? "opacity-100 scale-y-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-y-95 -translate-y-1 pointer-events-none"
        }`}
      >
        {/* Search (show if > 3 pages) */}
        {pages.length > 3 && (
          <div className="p-2 border-b border-white/10">
            <div className="relative">
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาเพจ..."
                className="w-full bg-white/[0.07] text-white text-sm rounded-lg pl-8 pr-3 py-2 border border-white/10 focus:outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/30 placeholder:text-white/30"
              />
            </div>
          </div>
        )}

        {/* Page List */}
        <div className="max-h-64 overflow-y-auto py-1 scrollbar-thin">
          {filteredPages.length === 0 && (
            <div className="px-4 py-3 text-white/40 text-sm text-center">
              ไม่พบเพจ
            </div>
          )}
          {filteredPages.map((page) => {
            const isSelected = selectedPage?.page_id === page.page_id
            const name = page.page_name || page.name || page.page_id
            return (
              <button
                key={page.page_id}
                onClick={() => {
                  setSelectedPage(page)
                  setOpen(false)
                  setSearch("")
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors duration-150 ${
                  isSelected
                    ? "bg-brand-red/15 hover:bg-brand-red/20"
                    : "hover:bg-white/[0.07]"
                }`}
              >
                <PageAvatar page={page} size="sm" />
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-sm font-medium leading-tight truncate ${
                      isSelected ? "text-white" : "text-white/80"
                    }`}
                  >
                    {name}
                  </div>
                  <div className="mt-0.5">
                    <AiStatusBadge page={page} />
                  </div>
                </div>
                {isSelected && (
                  <svg
                    className="w-4 h-4 text-brand-red flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            )
          })}
        </div>

        {/* Add Page (footer) */}
        <div className="border-t border-white/10">
          <button
            onClick={() => {
              setOpen(false)
              setSearch("")
              window.location.href = "/ai-settings"
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-white/50 hover:text-white hover:bg-white/[0.07] transition-colors duration-150"
          >
            <div className="w-7 h-7 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-sm">เพิ่มเพจใหม่</span>
          </button>
        </div>
      </div>
    </div>
  )
}
