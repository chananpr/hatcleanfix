import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { pricing } from "../api/index.js"
import PageHeader from "../components/common/PageHeader.jsx"

const DEFAULT_RULES = {
  tiers: [
    { min: 1, max: 10, price: 89 },
    { min: 11, max: 49, price: 65 },
    { min: 50, max: 99, price: 45 },
    { min: 100, max: null, price: 30 },
  ],
  washing_surcharge: 50,
  shipping_base: 50,
}

function tierLabel(tier) {
  return tier.max === null ? `${tier.min}+ ใบ` : `${tier.min}-${tier.max} ใบ`
}

function calculatePrice(rules, hatCount, includeWashing, includeShipping) {
  const tiers = rules?.tiers || DEFAULT_RULES.tiers
  const washing = rules?.washing_surcharge ?? 50
  const shipping = rules?.shipping_base ?? 50
  const tier = tiers.find(
    (t) => hatCount >= t.min && (t.max === null || hatCount <= t.max)
  )
  const pricePerHat = tier?.price ?? 89
  const subtotal = hatCount * pricePerHat
  const washingTotal = includeWashing ? hatCount * washing : 0
  const shippingTotal = includeShipping ? shipping : 0
  return { pricePerHat, subtotal, washingTotal, shippingTotal, total: subtotal + washingTotal + shippingTotal, tier }
}

export default function PricingPage() {
  const qc = useQueryClient()

  const { data: serverRules, isLoading } = useQuery({
    queryKey: ["pricing-rules"],
    queryFn: pricing.getRules,
  })

  const [rules, setRules] = useState(null)
  const [dirty, setDirty] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Calculator
  const [calcHats, setCalcHats] = useState(10)
  const [calcWashing, setCalcWashing] = useState(false)
  const [calcShipping, setCalcShipping] = useState(true)

  useEffect(() => {
    if (serverRules && !dirty) {
      const raw = serverRules?.data || serverRules; const d = raw?.tiers ? raw : (raw?.data?.tiers ? raw.data : DEFAULT_RULES)
      setRules(JSON.parse(JSON.stringify(d)))
    }
  }, [serverRules, dirty])

  const saveMutation = useMutation({
    mutationFn: pricing.updateRules,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pricing-rules"] })
      setDirty(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2500)
    },
  })

  const currentRules = (rules && rules.tiers) ? rules : DEFAULT_RULES
  const calc = calculatePrice(currentRules, Number(calcHats) || 1, calcWashing, calcShipping)

  // ── Tier CRUD ──
  const updateTier = (idx, field, value) => {
    const tiers = [...currentRules.tiers]
    tiers[idx] = { ...tiers[idx], [field]: value === "" ? "" : Number(value) }
    setRules({ ...currentRules, tiers })
    setDirty(true)
  }

  const addTier = () => {
    const tiers = [...currentRules.tiers]
    const lastMax = tiers.length > 0 ? (tiers[tiers.length - 1].max || tiers[tiers.length - 1].min) : 0
    tiers.push({ min: lastMax + 1, max: null, price: 30 })
    setRules({ ...currentRules, tiers })
    setDirty(true)
  }

  const deleteTier = (idx) => {
    const tiers = currentRules.tiers.filter((_, i) => i !== idx)
    setRules({ ...currentRules, tiers })
    setDirty(true)
    setDeleteConfirm(null)
  }

  const updateField = (field, value) => {
    setRules({ ...currentRules, [field]: value === "" ? "" : Number(value) })
    setDirty(true)
  }

  const handleSave = () => {
    // Clean data before save: ensure numbers
    const cleaned = {
      ...currentRules,
      washing_surcharge: Number(currentRules.washing_surcharge) || 0,
      shipping_base: Number(currentRules.shipping_base) || 0,
      tiers: currentRules.tiers.map((t) => ({
        min: Number(t.min) || 0,
        max: t.max === null || t.max === "" ? null : Number(t.max),
        price: Number(t.price) || 0,
      })),
    }
    saveMutation.mutate(cleaned)
  }

  const handleDiscard = () => {
    const raw2 = serverRules?.data || serverRules; const d = raw2?.tiers ? raw2 : (raw2?.data?.tiers ? raw2.data : DEFAULT_RULES)
    setRules(d ? JSON.parse(JSON.stringify(d)) : DEFAULT_RULES)
    setDirty(false)
  }

  return (
    <div className="pb-24">
      <PageHeader title="จัดการราคา" subtitle="ตารางราคาและค่าบริการ" />

      {/* AI Info Badge */}
      <div className="mb-6 flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
        <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
        </svg>
        <span className="text-sm text-red-300">AI จะใช้ข้อมูลราคานี้ในการตอบลูกค้า</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ─── Pricing Tiers ─── */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-white text-lg">ราคาต่อใบ (ซ่อม/ทำความสะอาด)</h3>
            <button
              onClick={addTier}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium hover:bg-red-500/30 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              เพิ่ม Tier
            </button>
          </div>

          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-gray-700 rounded-lg" />)}
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-[1fr_1fr_1fr_40px] gap-2 px-3 mb-2">
                <span className="text-xs text-gray-500 font-medium uppercase">Min จำนวน</span>
                <span className="text-xs text-gray-500 font-medium uppercase">Max จำนวน</span>
                <span className="text-xs text-gray-500 font-medium uppercase">ราคา/ใบ (฿)</span>
                <span></span>
              </div>

              <div className="space-y-2">
                {currentRules.tiers.map((tier, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_1fr_40px] gap-2 items-center bg-gray-700/50 rounded-xl px-3 py-2.5 group">
                    <input
                      type="number"
                      value={tier.min}
                      onChange={(e) => updateTier(i, "min", e.target.value)}
                      className="bg-gray-700 border border-gray-600 rounded-lg px-2.5 py-1.5 text-sm text-white text-center focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      min={0}
                    />
                    <input
                      type="number"
                      value={tier.max === null ? "" : tier.max}
                      onChange={(e) => updateTier(i, "max", e.target.value === "" ? null : e.target.value)}
                      placeholder="ไม่จำกัด"
                      className="bg-gray-700 border border-gray-600 rounded-lg px-2.5 py-1.5 text-sm text-white text-center placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    <div className="relative">
                      <input
                        type="number"
                        value={tier.price}
                        onChange={(e) => updateTier(i, "price", e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2.5 py-1.5 text-sm text-white text-center focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        min={0}
                      />
                    </div>
                    {/* Delete button */}
                    <div className="relative">
                      {deleteConfirm === i ? (
                        <button
                          onClick={() => deleteTier(i)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-600 text-white hover:bg-red-500 transition"
                          title="คลิกอีกครั้งเพื่อยืนยันลบ"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </button>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(i)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-red-400 hover:bg-gray-600 transition opacity-0 group-hover:opacity-100"
                          title="ลบ Tier นี้"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {currentRules.tiers.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  ยังไม่มี Tier ราคา — กดปุ่ม &quot;เพิ่ม Tier&quot; เพื่อเริ่มต้น
                </div>
              )}
            </>
          )}
        </div>

        {/* ─── Additional Costs + Calculator ─── */}
        <div className="space-y-6">
          {/* Additional Costs */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
            <h3 className="font-bold text-white text-lg mb-5">ค่าบริการเพิ่มเติม</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">ค่าซักเพิ่ม (฿/ใบ)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={currentRules.washing_surcharge}
                    onChange={(e) => updateField("washing_surcharge", e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    min={0}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">฿/ใบ</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">ค่าจัดส่งพื้นฐาน (฿/ออเดอร์)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={currentRules.shipping_base}
                    onChange={(e) => updateField("shipping_base", e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    min={0}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">฿</span>
                </div>
              </div>
            </div>
          </div>

          {/* Calculator */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
            <h3 className="font-bold text-white text-lg mb-4">เครื่องคำนวณราคา</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">จำนวนหมวก</label>
                <input
                  type="number"
                  value={calcHats}
                  onChange={(e) => setCalcHats(e.target.value)}
                  min={1}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="กรอกจำนวนหมวก"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={calcWashing} onChange={(e) => setCalcWashing(e.target.checked)} className="w-4 h-4 accent-red-500 rounded" />
                  <span className="text-sm text-gray-300">รวมค่าซัก (+{currentRules.washing_surcharge} ฿/ใบ)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={calcShipping} onChange={(e) => setCalcShipping(e.target.checked)} className="w-4 h-4 accent-red-500 rounded" />
                  <span className="text-sm text-gray-300">รวมค่าจัดส่ง (+{currentRules.shipping_base} ฿)</span>
                </label>
              </div>

              {/* Result breakdown */}
              <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">ราคาต่อใบ ({calcHats} x {calc.pricePerHat} ฿)</span>
                  <span className="text-white font-medium">{calc.subtotal.toLocaleString("th-TH")} ฿</span>
                </div>
                {calcWashing && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">ค่าซัก ({calcHats} x {currentRules.washing_surcharge} ฿)</span>
                    <span className="text-white font-medium">{calc.washingTotal.toLocaleString("th-TH")} ฿</span>
                  </div>
                )}
                {calcShipping && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">ค่าจัดส่ง</span>
                    <span className="text-white font-medium">{calc.shippingTotal.toLocaleString("th-TH")} ฿</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-600 pt-2 mt-2">
                  <span className="font-bold text-white">รวมทั้งสิ้น</span>
                  <span className="font-bold text-red-400 text-xl">{calc.total.toLocaleString("th-TH")} ฿</span>
                </div>
              </div>

              {calc.tier && (
                <div className="text-xs text-gray-500 bg-gray-700/30 border border-gray-700 rounded-lg px-3 py-2">
                  ใช้ Tier: <span className="text-red-400 font-medium">{tierLabel(calc.tier)}</span> = <span className="text-white font-medium">{calc.pricePerHat} ฿/ใบ</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Sticky Save Bar ─── */}
      {dirty && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 border-t border-gray-700 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              <span className="text-sm text-gray-300">มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDiscard}
                className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-500 disabled:opacity-60 transition"
              >
                {saveMutation.isPending ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save success toast */}
      {saveSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          <span className="text-sm font-medium">บันทึกเรียบร้อยแล้ว</span>
        </div>
      )}
    </div>
  )
}
