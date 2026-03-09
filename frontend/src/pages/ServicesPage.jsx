import PageTransition from '../components/common/PageTransition'
import SectionTitle from '../components/common/SectionTitle'
import PriceSection from '../components/services/PriceSection'
import ServicesGrid from '../components/services/ServicesGrid'

export default function ServicesPage() {
  return (
    <PageTransition>
      <section className="bg-white py-20">
        <div className="container-shell">
          <SectionTitle eyebrow="Our Services" title="บริการจัดเต็ม ครบจบที่นี่" color="red" className="mb-6" />
          <p className="mx-auto mb-16 max-w-2xl text-center font-light text-gray-500">
            เราดูแลหมวกทุกใบด้วยเครื่องจักรมาตรฐานสากลและความใส่ใจในรายละเอียด
          </p>

          <div className="mb-20">
            <ServicesGrid />
          </div>

          <PriceSection />
        </div>
      </section>
    </PageTransition>
  )
}
