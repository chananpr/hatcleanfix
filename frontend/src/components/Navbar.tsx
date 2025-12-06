import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { label: 'บริการของเรา', href: '/#services' },
  { label: 'เรทราคาเหมา', href: '/#pricing' },
  { label: 'ผลงาน', href: '/#portfolio' },
  { label: 'ติดต่อเรา', href: '/#contact' }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <nav
      id="navbar"
      className={`fixed w-full z-50 bg-white transition-all duration-300 ${
        scrolled ? 'shadow-md' : ''
      }`}
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary text-white rounded-lg flex items-center justify-center text-xl font-bold group-hover:bg-green-700 transition">
            H
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-gray-900 leading-none">Hat Fix</span>
            <span className="text-sm text-primary font-medium tracking-wide">&amp; Clean</span>
          </div>
        </Link>

        <div className="hidden md:flex space-x-8 text-gray-600 font-medium">
          {menuItems.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-primary transition">
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <a
            href="https://lin.ee/84zbaJk"
            target="_blank"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-bold shadow-lg transition transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            <i className="fa-brands fa-line text-xl" /> แอดไลน์ส่งงาน
          </a>
        </div>

        <button
          className="md:hidden text-gray-700 text-2xl focus:outline-none"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <i className="fa-solid fa-bars" />
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="md:hidden bg-white border-t shadow-sm">
          {menuItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block px-4 py-3 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <div className="p-4">
            <a
              href="https://lin.ee/84zbaJk"
              target="_blank"
              className="block text-center bg-green-600 text-white py-3 rounded-lg font-bold shadow-md"
              onClick={() => setOpen(false)}
            >
              <i className="fa-brands fa-line" /> แอดไลน์ส่งงาน (@84zbaJk)
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
