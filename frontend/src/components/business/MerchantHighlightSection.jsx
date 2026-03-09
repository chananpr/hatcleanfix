import PrimaryButton from '../common/PrimaryButton'
import ImageCard from '../common/ImageCard'
import { merchantBenefits, merchantVisual } from '../../data/merchant'

export default function MerchantHighlightSection() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="container-shell grid items-center gap-20 lg:grid-cols-2">
        <div>
          <h2 className="mb-6 text-sm font-black uppercase tracking-[0.4em] text-brand-red underline underline-offset-8">For Merchants</h2>
          <h3 className="mb-8 text-4xl font-extrabold uppercase italic leading-tight text-brand-black md:text-5xl">
            บริการพิเศษสำหรับ
            <br />
            <span className="text-brand-red underline decoration-brand-yellow">ร้านหมวกมือสอง</span>
          </h3>
          <p className="mb-8 text-lg font-light leading-relaxed text-gray-500">
            เราคือพาร์ทเนอร์ที่ช่วยเปลี่ยน "ซากหมวก" ของคุณให้เป็นของทำกำไร! หมวกมือสองที่เสียทรงและไม่สะอาด เราจัดการให้กลับมาทรงเป๊ะเหมือนใหม่ออกช็อป เพื่อให้คุณขายได้ราคาดีกว่าเดิมหลายเท่า
          </p>

          <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {merchantBenefits.map((item) => (
              <article
                key={item.id}
                className={`rounded-2xl border-l-4 bg-white p-6 shadow-sm ${item.borderColorClassName}`}
              >
                <h5 className="mb-2 text-sm font-bold uppercase italic">{item.title}</h5>
                <p className="text-xs text-gray-400">{item.description}</p>
              </article>
            ))}
          </div>

          <PrimaryButton href="tel:+66845540425" variant="black">
            สอบถามราคาส่งร้านค้า
          </PrimaryButton>
        </div>

        <ImageCard
          image={merchantVisual.image}
          alt="บริการสำหรับร้านหมวกมือสอง"
          className="rounded-[3rem] border-8 border-white shadow-2xl"
          overlay={
            <div className="absolute inset-0 flex items-center justify-center bg-brand-red/10">
              <div className="rounded-2xl bg-white/90 p-8 text-center shadow-2xl backdrop-blur-md">
                <div className="mb-1 text-4xl font-black italic text-brand-red">100%</div>
                <div className="text-[10px] font-bold uppercase tracking-widest">Profit Increase</div>
              </div>
            </div>
          }
        />
      </div>
    </section>
  )
}
