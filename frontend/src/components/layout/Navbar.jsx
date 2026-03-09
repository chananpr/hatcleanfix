import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import PrimaryButton from '../common/PrimaryButton'
import { navItems } from '../../data/navigation'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-md">
      <nav className="container-shell flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="text-3xl font-extrabold italic tracking-tighter">
            <span className="text-brand-red">HATZ</span>
          </div>
          <div className="mx-2 h-6 w-px bg-gray-200" />
          <div className="text-[9px] font-bold uppercase leading-none tracking-[0.3em] text-gray-400">
            Professional
            <br />
            Hat Service
          </div>
        </Link>

        <div className="hidden items-center gap-10 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
              end={item.path === '/'}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}

          <PrimaryButton href="tel:+66845540425" variant="black" size="pill" className="text-sm">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 005.454 5.454l.774-1.548a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            084 554 0425
          </PrimaryButton>
        </div>

        <button
          type="button"
          className="rounded-xl border border-gray-200 p-2 text-brand-black lg:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-label="เปิดเมนู"
        >
          {isOpen ? (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      <div
        className={`overflow-hidden border-t border-gray-100 bg-white px-6 transition-all duration-300 lg:hidden ${
          isOpen ? 'max-h-[420px] py-6 opacity-100' : 'max-h-0 py-0 opacity-0'
        }`}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-[0.2em] transition ${
                  isActive ? 'bg-brand-red text-white' : 'bg-gray-50 text-brand-black hover:bg-gray-100'
                }`
              }
              end={item.path === '/'}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
          <PrimaryButton
            href="tel:+66845540425"
            variant="black"
            className="w-full justify-center text-sm"
            onClick={() => setIsOpen(false)}
          >
            โทรเลย 084 554 0425
          </PrimaryButton>
        </div>
      </div>
    </header>
  )
}
