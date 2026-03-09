import ImageCard from '../common/ImageCard'
import { serviceItems } from '../../data/services'

export default function ServicesGrid() {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
      {serviceItems.map((service) => (
        <article
          key={service.id}
          className="rounded-[2rem] bg-gray-50 p-8 shadow-premium transition duration-300 hover:-translate-y-1 hover:scale-[1.02]"
        >
          <ImageCard
            image={service.image}
            alt={service.title}
            className="mb-6 h-48 rounded-2xl bg-white"
            imageClassName="h-full w-full"
          />
          <h4 className={`mb-4 text-xl font-bold uppercase italic ${service.titleClassName}`}>{service.title}</h4>
          <p className="text-sm text-gray-500">{service.description}</p>
        </article>
      ))}
    </div>
  )
}
