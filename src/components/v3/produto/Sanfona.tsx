"use client";

import { useId, useState, type ReactNode } from "react";

// Sanfona fechada: título em 11 px, caixa alta, 48 px de altura e chevron
// que gira. Abre em 0,2 s (troca seca com movimento reduzido); fechada, o
// conteúdo fica inerte (fora do Tab e do leitor de tela).
export default function Sanfona({ titulo, children }: { titulo: string; children: ReactNode }) {
  const [aberta, setAberta] = useState(false);
  const id = useId();

  return (
    <div className="border-b border-[#1B4965]/15">
      <h2>
        <button
          type="button"
          aria-expanded={aberta}
          aria-controls={id}
          onClick={() => setAberta((a) => !a)}
          className="flex h-12 w-full items-center justify-between gap-4 text-left text-[11px] uppercase tracking-[0.14em] text-[#1B4965] outline-offset-[-2px] transition-opacity duration-200 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-[#b8902a] motion-reduce:transition-none"
        >
          {titulo}
          <svg
            aria-hidden
            viewBox="0 0 12 12"
            className={`h-3 w-3 shrink-0 transition-transform duration-200 motion-reduce:transition-none ${aberta ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.2}
          >
            <path d="M2.5 4.5 6 8l3.5-3.5" />
          </svg>
        </button>
      </h2>
      <div
        id={id}
        role="region"
        aria-label={titulo}
        inert={!aberta}
        className={`grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none ${
          aberta ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="pb-4 text-[14px] leading-[22px] text-brand-muted">{children}</div>
        </div>
      </div>
    </div>
  );
}
