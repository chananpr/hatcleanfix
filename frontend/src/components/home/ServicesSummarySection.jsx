import { Link } from 'react-router-dom'
import ImageCard from '../common/ImageCard'
import SectionTitle from '../common/SectionTitle'
import { serviceItems } from '../../data/services'

export default function ServicesSummarySection() {
  return (
    <section className="bg-white py-24">
      <div className="container-shell">
        <SectionTitle eyebrow="Core Services" title="บริการหลักของเรา" color="red" className="mb-16" />

        <div className="mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {serviceItems.map((service) => (
            <article
              key={service.id}
              className="rounded-[2rem] bg-gray-50 p-6 text-center shadow-premium transition duration-300 hover:-translate-y-1 hover:scale-[1.02]"
            >
              <ImageCard
                image={service.image}
                alt={service.title}
                className="mb-6 h-40 rounded-2xl bg-white"
                imageClassName="h-full w-full"
              />
              <h4 className={`mb-2 text-lg font-bold uppercase italic ${service.titleClassName}`}>{service.title}</h4>
              <p className="text-xs text-gray-400">{service.subtitle}</p>
            </article>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/services"
            className="border-b-2 border-brand-yellow pb-1 text-sm font-bold uppercase tracking-widest text-brand-red transition hover:text-brand-black"
          >
            ดูบริการทั้งหมดและราคา &rarr;
          </Link>
        </div>
      </div>
    </section>
  )
}
