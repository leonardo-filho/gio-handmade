"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export type ChipLoja = { id: string; rotulo: string };

type Props = {
  itens: ChipLoja[];
  /** id do chip ativo (o filtro atual). */
  ativo: string;
  onEscolher: (id: string) => void;
};

// Barra fixa da loja: filtro da vitrine. Cada chip é um botão de alternância
// (aria-pressed); o estado fica na URL (?ver=) e quem decide o que aparece é a
// Vitrine. A barra cola logo abaixo do header, usando a altura que o Header
// publica em --header-h (o fallback é a altura dele no topo da página).
export default function LojaNav({ itens, ativo, onEscolher }: Props) {
  const listaRef = useRef<HTMLDivElement>(null);
  const primeiraVez = useRef(true);

  // Mantém o chip ativo à vista na barra (scroll horizontal no celular). Rola
  // só a barra, nunca a página.
  useEffect(() => {
    const lista = listaRef.current;
    const chip = lista?.querySelector<HTMLElement>(`[data-chip="${ativo}"]`);
    if (!lista || !chip || lista.scrollWidth <= lista.clientWidth) return;
    const esquerda = chip.offsetLeft - (lista.clientWidth - chip.offsetWidth) / 2;
    const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    lista.scrollTo({ left: esquerda, behavior: primeiraVez.current || reduz ? "auto" : "smooth" });
    primeiraVez.current = false;
  }, [ativo]);

  // Quando a barra rola (celular e tablet), um degradê na borda avisa que há
  // mais chips daquele lado; ele some na ponta em que a lista acaba. Em 360 px,
  // sem isso, os três primeiros chips enchiam a tela e pareciam ser todos.
  // Marca direto no DOM (atributos que o React não controla), sem estado.
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
    // A largura dos chips muda quando a fonte carrega: observa a lista e os chips.
    const observador = new ResizeObserver(marcar);
    observador.observe(lista);
    Array.from(lista.children).forEach((chip) => observador.observe(chip));
    return () => {
      lista.removeEventListener("scroll", marcar);
      observador.disconnect();
    };
  }, []);

  return (
    <div
      data-loja-nav
      className="sticky top-[var(--header-h,102px)] z-40 border-y border-[#1B4965]/10 bg-[#EDE7D9]/95 backdrop-blur-md md:top-[var(--header-h,109px)]"
    >
      <motion.div
        ref={listaRef}
        layoutScroll
        role="group"
        aria-label="Filtrar peças"
        // Uma linha só até 1024 px (rola de lado, centralizada quando cabe);
        // do lg para cima os chips cabem centralizados.
        className="relative mx-auto flex max-w-6xl justify-center-safe gap-2 overflow-x-auto px-4 py-2.5 [--fade-dir:0px] [--fade-esq:0px] [scrollbar-width:none] data-mais-dir:[--fade-dir:2rem] data-mais-esq:[--fade-esq:2rem] data-mais-dir:[mask-image:linear-gradient(to_right,transparent,#000_var(--fade-esq),#000_calc(100%_-_var(--fade-dir)),transparent)] data-mais-esq:[mask-image:linear-gradient(to_right,transparent,#000_var(--fade-esq),#000_calc(100%_-_var(--fade-dir)),transparent)] lg:flex-wrap [&::-webkit-scrollbar]:hidden"
      >
        {itens.map((it) => {
          const on = it.id === ativo;
          return (
            <button
              key={it.id}
              type="button"
              data-chip={it.id}
              aria-pressed={on}
              onClick={() => onEscolher(it.id)}
              // O after estende a área de toque para 47 px de altura sem
              // engordar a barra (cabe no padding vertical dela).
              className={`relative shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors after:absolute after:inset-x-0 after:-inset-y-2 after:content-[''] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDE7D9] ${
                on
                  ? "border-transparent text-[#EDE7D9]"
                  : "border-[#1B4965]/25 text-brand-muted hover:border-[#1B4965] hover:text-[#1B4965]"
              }`}
            >
              {on && (
                <motion.span
                  layoutId="lojanav-chip-ativo"
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-[#1B4965]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{it.rotulo}</span>
            </button>
          );
        })}
      </motion.div>
    </div>
  );
}
