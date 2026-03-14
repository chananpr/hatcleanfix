import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pricing } from '../api/index.js'
import PageHeader from '../components/common/PageHeader.jsx'

const DEFAULT_TIERS = [
  { min: 1, max: 10, price: 89, label: '1-10 ใบ' },
  { min: 11, max: 49, price: 65, label: '11-49 ใบ' },
  { min: 50, max: 99, price: 45, label: '50-99 ใบ' },
  { min: 100, max: null, price: 30, label: '100+ ใบ' },
]

function calculatePrice(pricingData, hatCount, includeWashing = false, shippingIncluded = true) {
  const tiers = pricingData?.tiers || DEFAULT_TIERS
  const washing = pricingData?.washing_surcharge ?? 50
  const shipping = pricingData?.shipping_base ?? 50

  const tier = tiers.find((t) =>
    hatCount >= t.min && (t.max === null || hatCount <= t.max)
  )
  const pricePerHat = tier?.price ?? 89
  const subtotal = hatCount * pricePerHat
  const washingTotal = includeWashing ? hatCount * washing : 0
  const total = subtotal + washingTotal + (shippingIncluded ? shipping : 0)

  return { pricePerHat, subtotal, washingTotal, shipping: shippingIncluded ? shipping : 0, total }
}

export default function PricingPage() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState(null)

  // Calculator state
  const [calcHats, setCalcHats] = useState(10)
  const [calcWashing, setCalcWashing] = useState(false)
  const [calcShipping, setCalcShipping] = useState(true)

  const { data, isLoading } = useQuery({
    queryKey: ['pricing'],
    queryFn: pricing.list,
    onSuccess: (d) => setEditData(d),
  })

  const saveMutation = useMutation({
    mutationFn: pricing.update,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pricing'] })
      setEditing(false)
    },
  })

  const pricingData = data || { tiers: DEFAULT_TIERS, washing_surcharge: 50, shipping_base: 50 }
  const calc = calculatePrice(pricingData, Number(calcHats) || 1, calcWashing, calcShipping)

  const handleEdit = () => {
    setEditData(JSON.parse(JSON.stringify(pricingData)))
    setEditing(true)
  }

  const handleSave = () => {
    saveMutation.mutate(editData)
  }

  const updateTierPrice = (index, value) => {
    const tiers = [...editData.tiers]
    tiers[index] = { ...tiers[index], price: Number(value) }
    setEditData({ ...editData, tiers })
  }

  const currentTiers = editing ? editData?.tiers : pricingData.tiers
  const washingSurcharge = editing ? editData?.washing_surcharge : pricingData.washing_surcharge
  const shippingBase = editing ? editData?.shipping_base : pricingData.shipping_base

  return (
    <div>
      <PageHeader
        title="จัดการราคา"
        subtitle="ตารางราคาและค่าบริการ"
        action={
          editing ? (
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="px-4 py-2 bg-brand-red text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-60"
              >
                {saveMutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          ) : (
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-brand-red text-white rounded-lg text-sm font-medium hover:bg-red-600"
            >
              แก้ไขราคา
            </button>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pricing Tiers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4">ราคาต่อใบ (ซ่อม/ทำความสะอาด)</h3>
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {(currentTiers || DEFAULT_TIERS).map((tier, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
                >
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">{tier.label}</div>
                    <div className="text-xs text-gray-400">
                      {tier.min} - {tier.max ?? '∞'} ใบ
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {editing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={tier.price}
                          onChange={(e) => updateTierPrice(i, e.target.value)}
                          className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-brand-red"
                          min={1}
                        />
                        <span className="text-sm text-gray-500">฿/ใบ</span>
                      </div>
                    ) : (
                      <div className="text-right">
                        <div className="text-xl font-bold text-brand-red">{tier.price}</div>
                        <div className="text-xs text-gray-400">฿/ใบ</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between bg-yellow-50 rounded-xl px-4 py-3">
              <div>
                <div className="font-semibold text-gray-800 text-sm">ค่าซักเพิ่ม</div>
                <div className="text-xs text-gray-400">บวกเพิ่มต่อใบ</div>
              </div>
              {editing ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={washingSurcharge}
                    onChange={(e) => setEditData({ ...editData, washing_surcharge: Number(e.target.value) })}
                    className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-brand-red"
                    min={0}
                  />
                  <span className="text-sm text-gray-500">฿/ใบ</span>
                </div>
              ) : (
                <div className="text-right">
                  <div className="text-xl font-bold text-yellow-600">+{washingSurcharge}</div>
                  <div className="text-xs text-gray-400">฿/ใบ</div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-3">
              <div>
                <div className="font-semibold text-gray-800 text-sm">ค่าจัดส่งพื้นฐาน</div>
                <div className="text-xs text-gray-400">ต่อออเดอร์</div>
              </div>
              {editing ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={shippingBase}
                    onChange={(e) => setEditData({ ...editData, shipping_base: Number(e.target.value) })}
                    className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-brand-red"
                    min={0}
                  />
                  <span className="text-sm text-gray-500">฿</span>
                </div>
              ) : (
                <div className="text-right">
                  <div className="text-xl font-bold text-blue-600">{shippingBase}</div>
                  <div className="text-xs text-gray-400">฿</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Calculator */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4">เครื่องคำนวณราคา</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                จำนวนหมวก
              </label>
              <input
                type="number"
                value={calcHats}
                onChange={(e) => setCalcHats(e.target.value)}
                min={1}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
                placeholder="กรอกจำนวนหมวก"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={calcWashing}
                  onChange={(e) => setCalcWashing(e.target.checked)}
                  className="w-4 h-4 accent-brand-red"
                />
                <span className="text-sm text-gray-700">รวมค่าซัก (+{washingSurcharge} ฿/ใบ)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={calcShipping}
                  onChange={(e) => setCalcShipping(e.target.checked)}
                  className="w-4 h-4 accent-brand-red"
                />
                <span className="text-sm text-gray-700">รวมค่าจัดส่ง (+{shippingBase} ฿)</span>
              </label>
            </div>

            {/* Result */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  ราคาต่อใบ ({calcHats} ใบ × {calc.pricePerHat} ฿)
                </span>
                <span className="font-medium">{calc.subtotal.toLocaleString('th-TH')} ฿</span>
              </div>
              {calcWashing && (
                <div className="flex justify-between">
                  <span className="text-gray-600">ค่าซัก ({calcHats} ใบ × {washingSurcharge} ฿)</span>
                  <span className="font-medium">{calc.washingTotal.toLocaleString('th-TH')} ฿</span>
                </div>
              )}
              {calcShipping && (
                <div className="flex justify-between">
                  <span className="text-gray-600">ค่าจัดส่ง</span>
                  <span className="font-medium">{calc.shipping.toLocaleString('th-TH')} ฿</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                <span className="font-bold text-gray-800">รวมทั้งสิ้น</span>
                <span className="font-bold text-brand-red text-xl">
                  {calc.total.toLocaleString('th-TH')} ฿
                </span>
              </div>
            </div>

            <div className="text-xs text-gray-400 bg-blue-50 rounded-lg px-3 py-2">
              ราคาที่ใช้คำนวณ: Tier{' '}
              <strong>{(currentTiers || DEFAULT_TIERS).find((t) =>
                Number(calcHats) >= t.min && (t.max === null || Number(calcHats) <= t.max)
              )?.label || '?'}</strong>{' '}
              = <strong>{calc.pricePerHat} ฿/ใบ</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
