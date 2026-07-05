"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type Item = { id: string; label: string };

// Barra fixa de categorias da loja: navegação rápida entre seções (PC e mobile).
// Os links são âncoras (#id) — o smooth-scroll do Lenis (SmoothScroll.tsx) já
// rola com o offset do header + desta própria barra.
export default function LojaNav({ items }: { items: Item[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const barRef = useRef<HTMLDivElement>(null);

  // Scroll spy: seção atual = última cujo topo passou a linha (header + barra).
  useEffect(() => {
    const linha = () => {
      const header = document.querySelector("header");
      const headerH = header ? header.getBoundingClientRect().height : 84;
      const barH = barRef.current ? barRef.current.getBoundingClientRect().height : 48;
      return headerH + barH + 24;
    };
    const onScroll = () => {
      // Adiciona uma tolerância (1/3 da tela) para a seção ativar antes de bater exatamente no topo
      const y = linha() + window.innerHeight / 3;
      let atual = items[0]?.id ?? "";
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (el && el.getBoundingClientRect().top <= y) atual = it.id;
      }
      setActive(atual);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items]);

  // Mantém o chip ativo visível na barra (scroll horizontal no mobile).
  useEffect(() => {
    const el = barRef.current?.querySelector(`[data-chip="${active}"]`) as HTMLElement | null;
    el?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [active]);

  return (
    <div
      data-loja-nav
      ref={barRef}
      className="sticky top-[80px] z-40 border-y border-[#1B4965]/10 bg-[#EDE7D9]/95 backdrop-blur-md md:top-[92px]"
    >
      <nav
        aria-label="Categorias da loja"
        className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-2.5 [scrollbar-width:none] md:flex-wrap md:justify-center [&::-webkit-scrollbar]:hidden"
      >
        {items.map((it) => {
          const on = active === it.id;
          return (
            <a
              key={it.id}
              href={`#${it.id}`}
              data-chip={it.id}
              onClick={() => setActive(it.id)}
              aria-current={on ? "true" : undefined}
              className={`relative shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors ${
                on
                  ? "border-transparent text-[#EDE7D9]"
                  : "border-[#1B4965]/25 text-[#1B4965]/70 hover:border-[#1B4965] hover:text-[#1B4965]"
              }`}
            >
              {on && (
                <motion.div
                  layoutId="lojanav-active-chip"
                  className="absolute inset-0 rounded-full bg-[#1B4965]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{it.label}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
}
