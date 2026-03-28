import { useState, useEffect, useRef, useCallback } from "react"
import { usePage } from "../contexts/PageContext"
import { products as productsApi } from "../api/index"

const CATEGORIES = ["general", "cleaning", "repair", "spa", "accessory"]

export default function ProductsPage() {
  const { selectedPage, pages } = usePage()
  const [productsList, setProductsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: "", description: "", category: "general", price: "", compare_price: "", sku: "", stock: "0", page_id: "" })
  const [previews, setPreviews] = useState([])
  const [saving, setSaving] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [search, setSearch] = useState("")
  const fileRef = useRef(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const pageId = selectedPage?.page_id || ""
      const res = await productsApi.list(pageId)
      setProductsList(res.data || res || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [selectedPage])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const openNew = () => {
    setEditing(null)
    setForm({ name: "", description: "", category: "general", price: "", compare_price: "", sku: "", stock: "0", page_id: selectedPage?.page_id || "" })
    setPreviews([])
    setShowForm(true)
  }

  const openEdit = (p) => {
    setEditing(p)
    setForm({
      name: p.name, description: p.description || "", category: p.category || "general",
      price: p.price || "", compare_price: p.compare_price || "", sku: p.sku || "",
      stock: p.stock || "0", page_id: p.page_id || ""
    })
    setPreviews((p.images || []).map(img => ({ ...img, existing: true })))
    setShowForm(true)
  }

  const addFiles = (files) => {
    Array.from(files).forEach(f => {
      if (!f.type.startsWith("image/")) return
      const reader = new FileReader()
      reader.onload = (ev) => setPreviews(prev => [...prev, { file: f, preview: ev.target.result }])
      reader.readAsDataURL(f)
    })
  }

  const handleFiles = (e) => addFiles(e.target.files)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files)
  }

  const removePreview = async (idx) => {
    const item = previews[idx]
    if (item.existing && item.key && editing) {
      try { await productsApi.removeImage(editing.id, item.key) } catch (e) { console.error(e) }
    }
    setPreviews(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append("name", form.name)
      fd.append("description", form.description)
      fd.append("category", form.category)
      fd.append("price", form.price || "0")
      if (form.compare_price) fd.append("compare_price", form.compare_price)
      if (form.sku) fd.append("sku", form.sku)
      fd.append("stock", form.stock || "0")
      fd.append("page_id", form.page_id || selectedPage?.page_id || "")
      const existingImgs = previews.filter(p => p.existing).map(({ key, url, originalName, size, mimeType }) => ({ key, url, originalName, size, mimeType }))
      fd.append("existing_images", JSON.stringify(existingImgs))
      previews.filter(p => p.file).forEach(p => fd.append("images", p.file))
      if (editing) {
        await productsApi.update(editing.id, fd)
      } else {
        await productsApi.create(fd)
      }
      setShowForm(false)
      fetchProducts()
    } catch (e) { console.error(e); alert("Error: " + (e.response?.data?.message || e.message)) }
    finally { setSaving(false) }
  }

  const handleDelete = async (p) => {
    if (!confirm(`Delete product "${p.name}"?`)) return
    try { await productsApi.remove(p.id); fetchProducts() } catch (e) { console.error(e) }
  }

  const handleToggle = async (p) => {
    try { await productsApi.toggle(p.id); fetchProducts() } catch (e) { console.error(e) }
  }

  const fmt = (n) => n ? Number(n).toLocaleString("th-TH", { minimumFractionDigits: 0 }) : "0"

  const filtered = productsList.filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-600 border-t-red-500" />
    </div>
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Products</h1>
          <p className="text-gray-500 text-sm mt-1">
            {selectedPage ? selectedPage.page_name : "All pages"} — {filtered.length} product{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={openNew} className="bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 transition text-sm font-medium flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or SKU..."
            className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
          />
        </div>
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-12 text-center text-gray-500 border-2 border-dashed border-gray-700">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-lg font-medium mb-1 text-gray-400">No products{search ? " found" : " yet"}</p>
          <p className="text-sm">{search ? "Try a different search term" : 'Click "Add Product" to get started'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(p => (
            <div key={p.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition group">
              {/* Image */}
              <div className="aspect-square bg-gray-900 relative overflow-hidden">
                {p.images && p.images.length > 0 ? (
                  <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {!p.is_active && (
                    <span className="bg-gray-900/90 text-gray-400 text-xs px-2 py-0.5 rounded font-medium">Inactive</span>
                  )}
                  {p.images?.length > 1 && (
                    <span className="bg-gray-900/90 text-gray-400 text-xs px-2 py-0.5 rounded">{p.images.length} imgs</span>
                  )}
                </div>
                {p.compare_price && Number(p.compare_price) > Number(p.price) && (
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded font-bold">
                    -{Math.round((1 - p.price / p.compare_price) * 100)}%
                  </div>
                )}
                {/* Stock warning */}
                {Number(p.stock) <= 5 && Number(p.stock) > 0 && (
                  <div className="absolute bottom-2 right-2 bg-yellow-600/90 text-white text-xs px-2 py-0.5 rounded">Low stock</div>
                )}
                {Number(p.stock) === 0 && (
                  <div className="absolute bottom-2 right-2 bg-red-700/90 text-white text-xs px-2 py-0.5 rounded">Out of stock</div>
                )}
              </div>
              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-100 truncate" title={p.name}>{p.name}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {p.category}{p.sku ? ` · ${p.sku}` : ""}
                </p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-lg font-bold text-red-500">{"\u0E3F"}{fmt(p.price)}</span>
                  {p.compare_price && Number(p.compare_price) > Number(p.price) && (
                    <span className="text-sm text-gray-500 line-through">{"\u0E3F"}{fmt(p.compare_price)}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Stock: {p.stock}</p>
                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(p)} className="flex-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 py-1.5 rounded-lg transition font-medium">Edit</button>
                  <button onClick={() => handleToggle(p)} className={`flex-1 text-xs py-1.5 rounded-lg transition font-medium ${p.is_active ? "bg-yellow-900/40 hover:bg-yellow-900/60 text-yellow-400" : "bg-green-900/40 hover:bg-green-900/60 text-green-400"}`}>
                    {p.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => handleDelete(p)} className="text-xs bg-red-900/30 hover:bg-red-900/50 text-red-400 px-3 py-1.5 rounded-lg transition font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-100">{editing ? "Edit Product" : "Add New Product"}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Page select */}
              {pages.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Page</label>
                  <select value={form.page_id} onChange={e => setForm({...form, page_id: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500">
                    <option value="">-- No page --</option>
                    {pages.map(p => <option key={p.page_id} value={p.page_id}>{p.page_name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Product Name *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">SKU</label>
                  <input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none" placeholder="e.g. HAT-001" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Price (THB)</label>
                  <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none" min="0" step="0.01" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Compare Price</label>
                  <input type="number" value={form.compare_price} onChange={e => setForm({...form, compare_price: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none" min="0" step="0.01" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Stock</label>
                  <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none" min="0" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 resize-none outline-none" placeholder="Product description..." />
              </div>

              {/* Image Upload with Drag & Drop */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Images (max 10, uploaded to S3)</label>
                <div className="flex flex-wrap gap-3">
                  {previews.map((p, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-600 group/img">
                      <img src={p.existing ? p.url : p.preview} className="w-full h-full object-cover" alt="" />
                      <button type="button" onClick={() => removePreview(i)} className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                      {i === 0 && <span className="absolute bottom-0 left-0 right-0 bg-red-600/90 text-white text-[10px] text-center py-0.5">Main</span>}
                    </div>
                  ))}
                  {previews.length < 10 && (
                    <div
                      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => fileRef.current?.click()}
                      className={`w-20 h-20 rounded-lg border-2 border-dashed cursor-pointer flex flex-col items-center justify-center transition ${dragOver ? "border-red-500 bg-red-500/10 text-red-400" : "border-gray-600 text-gray-500 hover:border-red-500 hover:text-red-400"}`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      <span className="text-[10px] mt-0.5">Add</span>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" multiple accept="image/*" onChange={handleFiles} className="hidden" />
                <p className="text-xs text-gray-500 mt-2">Drag & drop or click to upload. JPG, PNG, WebP up to 10MB each.</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 text-sm font-medium transition">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50 transition">
                  {saving ? "Saving..." : editing ? "Save Changes" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
