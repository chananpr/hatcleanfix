import PageTransition from '../components/common/PageTransition'
import SectionTitle from '../components/common/SectionTitle'
import GalleryGrid from '../components/gallery/GalleryGrid'

export default function GalleryPage() {
  return (
    <PageTransition>
      <section className="bg-white py-20">
        <div className="container-shell">
          <SectionTitle eyebrow="Our Portfolio" title="ผลงานจริงจากทางร้าน" color="yellow" className="mb-8" />
          <p className="mx-auto mb-16 max-w-xl text-center font-light italic text-gray-400">
            "การันตีความพึงพอใจด้วยผลงานคุณภาพระดับพรีเมียม"
          </p>

          <div className="mb-20">
            <GalleryGrid />
          </div>

          <div className="flex flex-col items-center justify-between gap-8 rounded-[3rem] bg-gray-50 p-12 md:flex-row">
            <div>
              <h4 className="mb-2 text-3xl font-black uppercase italic">ยังมีรีวิวอีกเพียบ!</h4>
              <p className="font-light text-gray-500">ติดตามผลงานล่าสุดและรีวิวลูกค้าได้ที่โซเชียลมีเดีย</p>
            </div>
            <span className="text-2xl font-black italic text-brand-red underline decoration-brand-yellow underline-offset-8 md:text-3xl">
              #รีวิวจัดทรงหมวก
            </span>
          </div>
        </div>
      </section>
    </PageTransition>
  )
}
