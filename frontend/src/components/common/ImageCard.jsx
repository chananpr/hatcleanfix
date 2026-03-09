export default function ImageCard({
  image,
  alt,
  className = '',
  imageClassName = '',
  overlay,
  zoom = true,
}) {
  const handleError = (event) => {
    if (image?.fallback && event.currentTarget.src !== image.fallback) {
      event.currentTarget.src = image.fallback
    }
  }

  return (
    <div className={`relative overflow-hidden ${zoom ? 'img-zoom' : ''} ${className}`}>
      <img
        src={image?.src}
        alt={alt}
        onError={handleError}
        className={`h-full w-full object-cover ${imageClassName}`}
      />
      {overlay}
    </div>
  )
}
