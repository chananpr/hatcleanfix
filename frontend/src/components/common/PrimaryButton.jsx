import { Link } from 'react-router-dom'

const variantClasses = {
  red: 'bg-brand-red text-white hover:bg-brand-black shadow-xl shadow-red-500/20',
  black: 'bg-brand-black text-white hover:bg-brand-red shadow-lg',
  text: 'border-b-2 border-brand-yellow px-0 py-0 text-sm font-bold uppercase tracking-widest text-brand-red hover:text-brand-black rounded-none',
}

const sizeClasses = {
  md: 'px-8 py-4 rounded-xl',
  lg: 'px-12 py-5 rounded-2xl',
  pill: 'px-6 py-3 rounded-full',
  none: '',
}

const joinClassNames = (...classes) => classes.filter(Boolean).join(' ')

export default function PrimaryButton({
  children,
  to,
  href,
  variant = 'red',
  size = 'md',
  className = '',
  ...props
}) {
  const classes = joinClassNames(
    'btn-transition inline-flex items-center justify-center gap-2 font-bold',
    variantClasses[variant],
    sizeClasses[size],
    className,
  )

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
