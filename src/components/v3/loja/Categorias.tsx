"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { LINHA, hrefLoja, type Ordem } from "./vistas";

// Linha de categorias em texto: a ativa em navy com sublinhado de 1 px, as
// outras em muted, 44 px de área de toque. No celular rola de lado; se a
// ativa nascer fora da tela (ex.: Acessórios), a linha já abre rolada até ela.
export default function Categorias({ ativa, ordem }: { ativa: string | null; ordem: Ordem }) {
  const linhaRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const linha = linhaRef.current;
    const item = linha?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!linha || !item) return;
    const fim = item.offsetLeft + item.offsetWidth;
    if (fim > linha.clientWidth - 16) linha.scrollLeft = item.offsetLeft - 16;
  }, [ativa]);

  return (
    <nav aria-label="Categorias">
      <ul
        ref={linhaRef}
        className="flex gap-x-5 overflow-x-auto px-4 [scrollbar-width:none] md:gap-x-7 [&::-webkit-scrollbar]:hidden"
      >
        {LINHA.map((item) => {
          const atual = item.slug === ativa;
          return (
            <li key={item.rotulo} className="shrink-0">
              <Link
                href={hrefLoja(item.slug, ordem)}
                scroll={false}
                aria-current={atual ? "page" : undefined}
                className={`flex h-11 items-center whitespace-nowrap text-[13px] outline-offset-[-2px] transition-opacity duration-200 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-[#b8902a] motion-reduce:transition-none ${
                  atual ? "text-[#1B4965] underline decoration-1 underline-offset-[6px]" : "text-brand-muted"
                }`}
              >
                {item.rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
