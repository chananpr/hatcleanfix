"use client";

import { useEffect, useState } from "react";

const navLinks = [
  { href: "#services", label: "บริการของเรา" },
  { href: "#pricing", label: "เรทราคาเหมา" },
  { href: "#articles", label: "บทความ" },
  { href: "#portfolio", label: "ผลงาน" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "ติดต่อเรา" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return ( 
    <nav
      className={`fixed inset-x-0 top-0 z-50 bg-white transition-all duration-300 ${
        scrolled ? "shadow-lg" : "shadow"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <a href="#" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-lg font-bold text-white">
            H
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xl font-bold text-gray-900">Hat Fix</span>
            <span className="text-sm font-semibold text-primary">&amp; Clean</span>
          </div>
        </a>

        <div className="hidden gap-8 text-sm font-medium text-gray-600 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <a
            href="https://lin.ee/84zbaJk"
            target="_blank"
            className="flex items-center gap-2 rounded-full bg-green-600 px-5 py-2 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-green-700"
          >
            <span className="text-lg">💬</span> แอดไลน์ส่งงาน
          </a>
        </div>

        <button
          className="text-2xl text-gray-700 md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="toggle menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open ? (
        <div className="md:hidden border-t border-gray-100 bg-white shadow-sm">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block px-4 py-3 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="px-4 pb-4">
            <a
              href="https://lin.ee/84zbaJk"
              target="_blank"
              className="block w-full rounded-lg bg-green-600 py-3 text-center text-sm font-bold text-white shadow"
              onClick={() => setOpen(false)}
            >
              แอดไลน์ส่งงาน
            </a>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
