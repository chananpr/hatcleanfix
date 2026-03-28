import { createContext, useContext, useState, useEffect } from "react"
import client from "../api/client.js"

const PageContext = createContext(null)

const STORAGE_KEY = "hatz_selected_page_id"

export function PageProvider({ children }) {
  const [pages, setPages] = useState([])
  const [selectedPage, setSelectedPage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function fetchPages() {
      try {
        const res = await client.get("/api/facebook-pages")
        const list = res.data?.data || res.data || []
        if (cancelled) return
        setPages(list)

        const savedId = localStorage.getItem(STORAGE_KEY)
        const saved = list.find((p) => String(p.page_id) === savedId)
        setSelectedPage(saved || list[0] || null)
      } catch (err) {
        console.error("Failed to fetch pages:", err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchPages()
    return () => { cancelled = true }
  }, [])

  const handleSetSelectedPage = (page) => {
    setSelectedPage(page)
    if (page?.page_id) {
      localStorage.setItem(STORAGE_KEY, String(page.page_id))
    }
  }

  return (
    <PageContext.Provider
      value={{
        pages,
        selectedPage,
        setSelectedPage: handleSetSelectedPage,
        loading,
      }}
    >
      {children}
    </PageContext.Provider>
  )
}

export function usePage() {
  const ctx = useContext(PageContext)
  if (!ctx) throw new Error("usePage must be used within PageProvider")
  return ctx
}
