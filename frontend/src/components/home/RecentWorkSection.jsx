import { Link } from 'react-router-dom'
import ImageCard from '../common/ImageCard'
import SectionTitle from '../common/SectionTitle'
import { galleryItems } from '../../data/gallery'

export default function RecentWorkSection() {
  return (
    <section className="bg-white py-24">
      <div className="container-shell">
        <SectionTitle eyebrow="Recent Work" title="ผลงานล่าสุด" color="yellow" className="mb-16" />

        <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {galleryItems.map((item) => (
            <ImageCard
              key={item.id}
              image={item.image}
              alt={item.alt}
              className="aspect-square rounded-2xl shadow-sm"
              imageClassName="h-full w-full"
            />
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/gallery"
            className="border-b-2 border-brand-red pb-1 text-sm font-bold uppercase tracking-widest text-brand-black transition hover:text-brand-red"
          >
            ดูผลงานทั้งหมด &rarr;
          </Link>
        </div>
      </div>
    </section>
  )
}
