const colorClasses = {
  red: 'text-brand-red',
  yellow: 'text-brand-yellow',
  black: 'text-brand-black',
}

const alignClasses = {
  left: 'text-left',
  center: 'text-center',
}

const dividerClasses = {
  left: 'after:mx-0',
  center: 'after:mx-auto',
}

export default function SectionTitle({
  eyebrow,
  title,
  color = 'red',
  align = 'center',
  className = '',
}) {
  return (
    <div className={`${alignClasses[align]} ${className}`}>
      <h2
        className={`section-divider ${dividerClasses[align]} mb-4 text-sm font-black uppercase tracking-[0.4em] ${colorClasses[color]}`}
      >
        {eyebrow}
      </h2>
      <h3 className="text-4xl font-extrabold uppercase italic text-brand-black md:text-5xl">{title}</h3>
    </div>
  )
}
