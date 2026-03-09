import PrimaryButton from '../common/PrimaryButton'
import ImageCard from '../common/ImageCard'
import { merchantVisual } from '../../data/merchant'

export default function BusinessSummarySection() {
  return (
    <section className="bg-gray-50 py-24">
      <div className="container-shell grid items-center gap-16 lg:grid-cols-2">
        <ImageCard image={merchantVisual.image} alt="บริการสำหรับร้านค้า" className="rounded-[2.5rem] shadow-2xl" />

        <div>
          <h2 className="mb-4 text-sm font-black uppercase tracking-[0.4em] text-brand-red">For Merchants</h2>
          <h3 className="mb-6 text-4xl font-extrabold uppercase italic leading-tight text-brand-black lg:text-5xl">
            พาร์ทเนอร์สำหรับ
            <br />
            ร้านหมวกมือสอง
          </h3>
          <p className="mb-8 font-light leading-relaxed text-gray-500">
            เราช่วยเปลี่ยนหมวกมือสองสภาพเสียทรง ให้กลับมาเป็นของพรีเมียมพร้อมทำกำไร! ราคามิตรภาพพิเศษสำหรับร้านค้าที่ส่งจำนวนมาก งานรวดเร็ว ทันใจ ไม่ค้างสต็อกแน่นอน
          </p>
          <PrimaryButton to="/business" variant="black">
            รายละเอียดสำหรับร้านค้า
          </PrimaryButton>
        </div>
      </div>
    </section>
  )
}
