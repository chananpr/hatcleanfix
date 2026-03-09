import { priceItems, priceNote } from '../../data/services'

export default function PriceSection() {
  return (
    <section className="mx-auto max-w-4xl rounded-[3rem] bg-brand-black p-8 text-white md:p-12">
      <h4 className="mb-8 text-center text-3xl font-bold uppercase italic">ประมาณการราคา</h4>
      <div className="space-y-6">
        {priceItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="font-light">{item.label}</span>
            <span className={`font-bold italic ${item.priceClassName}`}>{item.price}</span>
          </div>
        ))}
        <p className="text-center text-[10px] italic text-gray-500">{priceNote}</p>
      </div>
    </section>
  )
}
