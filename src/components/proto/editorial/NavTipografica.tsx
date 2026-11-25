"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { ItemIndice } from "./Sumario";

// Barra fixa que aparece quando o sumário sai da tela: as mesmas seções em
// palavras, a ativa sublinhada em dourado, a quantidade em sobrescrito.
// Fica logo abaixo do header (--header-h, publicado pelo Header).
export default function NavTipografica({
  itens,
  ativo,
  visivel,
  onEscolher,
}: {
  itens: ItemIndice[];
  ativo: string;
  visivel: boolean;
  onEscolher: (id: string) => void;
}) {
  const listaRef = useRef<HTMLDivElement>(null);
  const primeiraVez = useRef(true);

  // Mantém a palavra ativa à vista (rola só a barra, nunca a página).
  useEffect(() => {
    const lista = listaRef.current;
    const item = lista?.querySelector<HTMLElement>(`[data-item="${ativo}"]`);
    if (!lista || !item || lista.scrollWidth <= lista.clientWidth) return;
    const esquerda = item.offsetLeft - (lista.clientWidth - item.offsetWidth) / 2;
    const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    lista.scrollTo({ left: esquerda, behavior: primeiraVez.current || reduz ? "auto" : "smooth" });
    primeiraVez.current = false;
  }, [ativo, visivel]);

  // Degradê na borda que ainda tem palavras (marca no DOM, sem estado).
  useEffect(() => {
    const lista = listaRef.current;
    if (!lista) return;
    const marcar = () => {
      const resto = lista.scrollWidth - lista.clientWidth - lista.scrollLeft;
      lista.toggleAttribute("data-mais-esq", lista.scrollLeft > 1);
      lista.toggleAttribute("data-mais-dir", resto > 1);
    };
    marcar();
    lista.addEventListener("scroll", marcar, { passive: true });
    const observador = new ResizeObserver(marcar);
    observador.observe(lista);
    return () => {
      lista.removeEventListener("scroll", marcar);
      observador.disconnect();
    };
  }, []);

  return (
    <nav
      aria-label="Seções da loja"
      data-loja-nav
      // Escondida, sai da ordem de Tab e do leitor de tela (o sumário está à vista).
      inert={!visivel}
      className={`fixed inset-x-0 top-[var(--header-h,102px)] z-40 border-b border-[#1B4965]/15 bg-[#EDE7D9]/95 backdrop-blur-md transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
        visivel ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0"
      }`}
    >
      <div
        ref={listaRef}
        className="relative mx-auto flex max-w-[1320px] items-stretch gap-6 overflow-x-auto px-4 [--fade-dir:0px] [--fade-esq:0px] [scrollbar-width:none] data-mais-dir:[--fade-dir:2.5rem] data-mais-esq:[--fade-esq:2.5rem] data-mais-dir:[mask-image:linear-gradient(to_right,transparent,#000_var(--fade-esq),#000_calc(100%_-_var(--fade-dir)),transparent)] data-mais-esq:[mask-image:linear-gradient(to_right,transparent,#000_var(--fade-esq),#000_calc(100%_-_var(--fade-dir)),transparent)] lg:justify-center lg:gap-9 lg:px-10 [&::-webkit-scrollbar]:hidden"
      >
        {itens.map((it) => {
          const on = it.id === ativo;
          return (
            <button
              key={it.id}
              type="button"
              data-item={it.id}
              aria-pressed={on}
              onClick={() => onEscolher(it.id)}
              className={`relative flex min-h-12 shrink-0 items-center whitespace-nowrap font-serif text-[18px] leading-none transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1B4965] lg:text-[19px] ${
                on ? "italic text-[#1B4965]" : "text-brand-muted hover:text-[#1B4965]"
              }`}
            >
              {it.rotulo}
              <sup className="nums-preco ml-0.5 font-sans text-[10px] not-italic tracking-normal text-brand-muted">
                {it.contagem}
              </sup>
              <span className="sr-only"> peças</span>
              {on && (
                <motion.span
                  layoutId="ed-nav-sublinhado"
                  aria-hidden
                  className="absolute inset-x-0 bottom-2.5 h-[1.5px] bg-[#b8902a]"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
