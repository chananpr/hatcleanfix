import ImageCard from '../common/ImageCard'
import { galleryItems } from '../../data/gallery'

export default function GalleryGrid() {
  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
      {galleryItems.map((item) => (
        <ImageCard
          key={item.id}
          image={item.image}
          alt={item.alt}
          className={`aspect-[3/4] rounded-3xl shadow-lg ${item.staggerOnDesktop ? 'md:mt-12' : ''}`}
          imageClassName="h-full w-full"
        />
      ))}
    </div>
  )
}
