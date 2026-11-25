"use client";

import type { Ref } from "react";

export type ItemIndice = { id: string; rotulo: string; numero: string; contagem: number };

// Sumário da revista, que é também o filtro da loja: cada linha mostra uma
// seção (?ver=<slug>). Número, nome, pontilhado e a quantidade de peças.
export default function Sumario({
  itens,
  ativo,
  onEscolher,
  ref,
}: {
  itens: ItemIndice[];
  ativo: string;
  onEscolher: (id: string) => void;
  ref?: Ref<HTMLElement>;
}) {
  return (
    <section
      ref={ref}
      id="pecas"
      tabIndex={-1}
      aria-labelledby="sumario-titulo"
      className="mx-auto max-w-[1320px] px-4 pb-16 pt-12 outline-none lg:grid lg:grid-cols-[1fr_1.25fr] lg:gap-20 lg:px-10 lg:pb-28 lg:pt-24"
    >
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-brand-gold-text">Neste número</p>
        <h2
          id="sumario-titulo"
          className="mt-3 font-serif text-[52px] leading-[0.9] tracking-[-0.025em] text-[#1B4965] lg:text-[104px]"
        >
          Sumário
        </h2>
        <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-brand-muted lg:mt-8 lg:text-sm">
          Monte seu carrinho, calcule o frete e finalize pelo WhatsApp. Peças feitas à mão em Belém, sob medida ou à
          pronta entrega, com envio para todo o Brasil.
        </p>
      </div>

      <div role="group" aria-label="Filtrar peças" className="mt-8 lg:mt-2">
      <ol className="border-t border-[#1B4965]">
        {itens.map((it) => {
          const on = it.id === ativo;
          return (
            <li key={it.id} className="border-b border-[#1B4965]/20">
              <button
                type="button"
                aria-pressed={on}
                onClick={() => onEscolher(it.id)}
                className="group/item flex min-h-[52px] w-full items-baseline gap-3 py-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1B4965] lg:min-h-[64px] lg:gap-5"
              >
                <span
                  aria-hidden
                  className={`w-7 shrink-0 font-serif text-[15px] italic [font-variant-numeric:lining-nums] lg:w-10 lg:text-lg ${
                    on ? "text-[#1B4965]" : "text-brand-gold-text"
                  }`}
                >
                  {it.numero}
                </span>
                <span
                  className={`font-serif text-[24px] leading-none tracking-[-0.01em] transition-colors lg:text-[34px] ${
                    on
                      ? "italic text-[#1B4965] underline decoration-[#b8902a] decoration-[1.5px] underline-offset-[6px]"
                      : "text-[#1B4965]/85 group-hover/item:text-[#1B4965]"
                  }`}
                >
                  {it.rotulo}
                </span>
                <span
                  aria-hidden
                  className="mb-1 min-w-4 flex-1 self-end border-b border-dotted border-[#1B4965]/35"
                />
                <span className="nums-preco shrink-0 text-xs tracking-[0.08em] text-brand-muted lg:text-sm">
                  {it.contagem}
                  <span className="sr-only"> peças</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      </div>
    </section>
  );
}
