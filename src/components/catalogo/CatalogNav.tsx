"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function CatalogNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
        scrolled ? "bg-[#EDE7D9]/90 backdrop-blur-md border-b border-[#130209]/10" : ""
      }`}
    >
      <div className="flex items-center justify-between px-5 md:px-10 py-3 md:py-4">
        <Link
          href="/"
          aria-label="Voltar ao site Gio Handmade"
          className="flex items-center gap-3 group"
        >
          <span className="text-[#130209] text-[11px] tracking-[0.3em] uppercase font-[family-name:var(--font-display)] group-hover:text-[#1B4965] transition-colors">
            ←
          </span>
          <Image
            src="/brand/logo/gio-ink.png"
            alt="Gio Handmade"
            width={120}
            height={48}
            priority
            className="h-8 md:h-9 w-auto group-hover:opacity-80 transition-opacity"
          />
        </Link>
        <div className="hidden md:flex items-center gap-7 text-[10px] tracking-[0.3em] uppercase font-[family-name:var(--font-display)] text-[#130209]/65">
          <a href="#marca" className="hover:text-[#130209] transition-colors">A Marca</a>
          <a href="#processo" className="hover:text-[#130209] transition-colors">Processo</a>
          <a href="#produtos" className="hover:text-[#130209] transition-colors">Modelos</a>
          <a href="#precos" className="hover:text-[#130209] transition-colors">Preços</a>
          <a href="#contato" className="hover:text-[#130209] transition-colors">Contato</a>
        </div>
        <a
          href="https://wa.me/559192982017?text=Ol%C3%A1%2C%20vi%20o%20cat%C3%A1logo%20e%20quero%20encomendar%20uma%20pe%C3%A7a."
          className="inline-flex items-center justify-center min-h-[44px] text-[10px] md:text-[11px] tracking-[0.3em] uppercase font-[family-name:var(--font-display)] font-bold bg-[#130209] text-[#EDE7D9] px-4 md:px-5 hover:bg-[#1B4965] transition-colors"
        >
          Encomendar
        </a>
      </div>
    </nav>
  );
}
