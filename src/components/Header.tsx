"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

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

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-[#EDE7D9]/95 backdrop-blur-md shadow-sm py-2 border-b border-[#1B4965]/10"
          : "bg-[#EDE7D9]/70 backdrop-blur-sm py-3 border-b border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" aria-label="Gio Handmade" className="flex items-center">
          <Image
            src="/logo-navy.png"
            alt="Gio Handmade"
            width={1200}
            height={856}
            priority
            className={`w-auto transition-all duration-500 ${
              isScrolled ? "h-10 md:h-12" : "h-12 md:h-14"
            }`}
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-xs uppercase tracking-[0.2em] text-[#1B4965]/80 hover:text-[#1B4965] transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="https://wa.me/559192982017?text=Ol%C3%A1%2C%20gostaria%20de%20realizar%20um%20or%C3%A7amento."
            className="text-xs uppercase tracking-[0.2em] font-bold text-[#EDE7D9] bg-[#1B4965] px-4 py-2 hover:bg-[#130209] transition-colors"
          >
            Contato
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          aria-label="Abrir menu"
          className="md:hidden text-[#1B4965] focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-[#EDE7D9]/98 backdrop-blur-md shadow-md py-6 px-6 flex flex-col gap-5 md:hidden border-t border-[#1B4965]/10">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm uppercase tracking-[0.25em] text-[#1B4965]/80 hover:text-[#1B4965]"
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="https://wa.me/559192982017?text=Ol%C3%A1%2C%20gostaria%20de%20realizar%20um%20or%C3%A7amento."
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-sm uppercase tracking-[0.25em] font-bold text-[#EDE7D9] bg-[#1B4965] px-4 py-3 text-center"
          >
            Contato
          </Link>
        </div>
      )}
    </header>
  );
}
