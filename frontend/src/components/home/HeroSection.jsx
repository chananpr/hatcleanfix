import PrimaryButton from '../common/PrimaryButton'
import ImageCard from '../common/ImageCard'
import { imageAssets } from '../../data/images'

export default function HeroSection() {
  return (
    <section className="relative flex min-h-[85vh] items-center overflow-hidden bg-gray-50">
      <div className="container-shell relative z-10 grid w-full items-center gap-16 lg:grid-cols-2">
        <div>
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-gray-100 bg-white px-4 py-2 shadow-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-brand-yellow" />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">ราคาถูกใจ เร็ว ทันใจ</span>
          </div>

          <h1 className="mb-6 text-5xl font-extrabold uppercase leading-tight text-brand-black sm:text-6xl lg:text-8xl">
            เสกหมวกเก่า
            <br />
            <span className="text-brand-red underline decoration-brand-yellow decoration-8">ให้เหมือนใหม่</span>
          </h1>

          <p className="mb-10 max-w-lg text-base font-light leading-relaxed text-gray-500 md:text-lg">
            ศูนย์บริการจัดทรง สปา ฆ่าเชื้อ และซักหมวกครบวงจร คืนสภาพหมวกใบโปรดหรือหมวกมือสองให้สวยกริ๊บ เพิ่มมูลค่าสินค้าทันใจ
          </p>

          <div className="flex flex-wrap gap-4">
            <PrimaryButton to="/services" variant="red" size="lg">
              บริการของเรา
            </PrimaryButton>
            <div className="flex flex-col justify-center">
              <span className="text-xl font-black italic leading-none text-brand-black">#รีวิวจัดทรงหมวก</span>
              <span className="mt-1 text-[10px] uppercase tracking-widest text-gray-400">Contact: 084 554 0425</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-brand-yellow/10 blur-3xl" />
          <ImageCard
            image={imageAssets.heroMain}
            alt="รูปหมวกจัดทรงเสร็จ"
            className="rounded-[2.5rem] border-8 border-white shadow-2xl"
          />
        </div>
      </div>
    </section>
  )
}
