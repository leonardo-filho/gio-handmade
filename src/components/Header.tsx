"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Início", href: "#" },
    { name: "Categorias", href: "#categorias" },
    { name: "Processo", href: "#processo" },
    { name: "Coleção", href: "#colecao" },
    { name: "Sobre", href: "#sobre" },
  ];

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-[1200] transition-all duration-300 ${isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm py-3"
          : "bg-transparent py-5"
        }`}
    >
      <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          href="/"
          className="group text-xl font-serif font-bold text-stone-900 tracking-wider hover:text-stone-700 transition-colors"
        >
          <span className="relative">
            GIO HANDMADE
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-600 group-hover:w-full transition-all duration-300" />
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="group text-sm uppercase tracking-widest text-stone-600 hover:text-stone-900 transition-colors relative"
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-0 h-px bg-stone-900 group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
          <Link
            href="https://wa.me/5591992342017?text=Ol%C3%A1!%20Gostaria%20de%20realizar%20um%20or%C3%A7amento."
            className="group text-sm uppercase tracking-widest font-bold text-stone-900 px-6 py-2 border-2 border-stone-900 rounded-sm hover:bg-stone-900 hover:text-white transition-all duration-300 hover:shadow-lg"
          >
            Contato
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-stone-900 focus:outline-none p-2 hover:bg-stone-100 rounded transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Overlay with Animation */}
      <div
        className={`absolute top-full left-0 w-full bg-white shadow-lg border-t border-stone-100 md:hidden transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? "max-h-96 py-4" : "max-h-0 py-0"
          }`}
      >
        <div className="px-4 flex flex-col gap-4">
          {navLinks.map((link, index) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={handleLinkClick}
              className="text-sm uppercase tracking-widest text-stone-600 hover:text-stone-900 hover:bg-stone-50 px-4 py-2 rounded transition-colors"
              style={{
                animation: isMobileMenuOpen
                  ? `slideUp 0.3s ease-out ${index * 0.05}s both`
                  : 'none'
              }}
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="https://wa.me/5591992342017?text=Ol%C3%A1!%20Gostaria%20de%20realizar%20um%20or%C3%A7amento."
            onClick={handleLinkClick}
            className="text-sm uppercase tracking-widest font-bold text-white bg-stone-900 px-4 py-3 rounded-sm hover:bg-stone-700 transition-colors text-center"
          >
            Contato
          </Link>
        </div>
      </div>
    </header>
  );
}
