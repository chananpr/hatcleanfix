const stats = [
  {
    id: 'fast',
    title: 'เร็ว ทันใจ',
    titleClassName: 'text-brand-red',
    quote: '"ซักและจัดทรงรวดเร็ว ไม่รอนาน"',
  },
  {
    id: 'renew',
    title: 'เหมือนใหม่',
    titleClassName: 'text-brand-yellow',
    quote: '"ฟื้นฟูสภาพหมวกให้เป๊ะ 100%"',
  },
  {
    id: 'merchant',
    title: 'ถูกใจร้านค้า',
    titleClassName: 'text-brand-black',
    quote: '"ราคามิตรภาพ ขายได้กำไรดี"',
  },
]

export default function StatsSection() {
  return (
    <section className="border-y border-gray-100 bg-white py-16">
      <div className="container-shell grid grid-cols-1 gap-12 text-center text-brand-black md:grid-cols-3">
        {stats.map((item, index) => (
          <div key={item.id} className={`flex flex-col items-center ${index === 1 ? 'md:border-x md:border-gray-100' : ''}`}>
            <h4 className={`mb-2 text-2xl font-bold italic ${item.titleClassName}`}>{item.title}</h4>
            <p className="text-sm italic text-gray-400">{item.quote}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
