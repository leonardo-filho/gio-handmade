"use client";

import { useEffect, useRef } from "react";
import { ABAS } from "./dados";

// Filtro do ateliê: palavras em serif com a contagem em sobrescrito, como o
// sumário de um livro, e um ponto de costura dourado sob a escolhida. Cada
// palavra é um botão de alternância (aria-pressed); quem guarda o estado é a
// URL (?ver=), lida pelo Atelie.
//
// No celular a linha rola de lado e a palavra escolhida vem para a vista.

type Props = {
  ativo: string;
  onEscolher: (id: string) => void;
  className?: string;
};

export default function Abas({ ativo, onEscolher, className = "" }: Props) {
  const listaRef = useRef<HTMLDivElement>(null);
  const primeira = useRef(true);

  useEffect(() => {
    const lista = listaRef.current;
    const aba = lista?.querySelector<HTMLElement>(`[data-aba="${ativo}"]`);
    if (!lista || !aba || lista.scrollWidth <= lista.clientWidth) return;
    const esquerda = aba.offsetLeft - (lista.clientWidth - aba.offsetWidth) / 2;
    const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    lista.scrollTo({ left: esquerda, behavior: primeira.current || reduz ? "auto" : "smooth" });
    primeira.current = false;
  }, [ativo]);

  return (
    <div
      ref={listaRef}
      role="group"
      aria-label="Filtrar peças"
      className={`flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
    >
      {ABAS.map((aba) => {
        const on = aba.id === ativo;
        return (
          <button
            key={aba.id}
            type="button"
            data-aba={aba.id}
            aria-pressed={on}
            onClick={() => onEscolher(aba.id)}
            className={`group/aba relative flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-sm font-[family-name:var(--font-serif)] text-[17px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] ${
              on ? "italic text-[#1B4965]" : "text-brand-muted hover:text-[#1B4965]"
            }`}
          >
            {aba.rotulo}
            <sup className="nums-preco ml-0.5 font-[family-name:var(--font-sans)] text-[10px] not-italic text-brand-gold-text">
              {aba.total}
            </sup>
            <span className="sr-only">{aba.total === 1 ? " peça" : " peças"}</span>
            {/* Ponto de costura sob a palavra escolhida */}
            <span
              aria-hidden
              className={`absolute inset-x-0 bottom-1.5 h-0 border-b border-dashed transition-opacity ${
                on ? "border-[#b8902a] opacity-100" : "border-[#1B4965]/30 opacity-0 group-hover/aba:opacity-100"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
