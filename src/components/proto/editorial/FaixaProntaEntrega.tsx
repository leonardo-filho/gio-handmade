"use client";

import Image from "next/image";
import BotaoMais from "./BotaoMais";
import { formatBRLPreco } from "@/lib/format";
import { labelParcelamento, parcelamentoCartao } from "@/lib/parcelas";
import type { Produto } from "@/data/produtos";

// Destaque editorial da pronta entrega (só na vista "Todas"): uma página navy
// com as peças já finalizadas numa fileira numerada. É um atalho: as mesmas
// peças seguem nas seções, onde ficam os cards (e o data-produto) delas.
export default function FaixaProntaEntrega({
  itens,
  onAbrir,
  onVerTodas,
}: {
  itens: Produto[];
  onAbrir: (id: string) => void;
  onVerTodas: () => void;
}) {
  const total = String(itens.length).padStart(2, "0");
  return (
    <section
      aria-labelledby="ed-pronta-titulo"
      className="relative overflow-hidden bg-[#1B4965] py-12 text-[#EDE7D9] lg:py-20"
    >
      <div className="mx-auto max-w-[1320px] px-4 lg:px-10">
        <div className="flex items-baseline justify-between gap-4 border-t border-[#EDE7D9]/60 pt-2.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#e9cf8a]">Destaque · Pronta entrega</p>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#EDE7D9]/80">{itens.length} peças</p>
        </div>

        <div className="mt-6 lg:mt-10 lg:flex lg:items-end lg:justify-between lg:gap-16">
          <h2
            id="ed-pronta-titulo"
            className="font-serif text-[48px] leading-[0.88] tracking-[-0.025em] lg:text-[112px]"
          >
            Prontas,
            <br />
            <em>envio imediato.</em>
          </h2>
          <div className="mt-5 max-w-sm lg:mt-0 lg:pb-3">
            <p className="text-[13px] leading-relaxed text-[#EDE7D9]/85 lg:text-sm">
              Peças já finalizadas, com envio imediato. Confira no WhatsApp o tamanho disponível.
            </p>
            <button
              type="button"
              onClick={onVerTodas}
              className="mt-4 inline-flex min-h-11 items-center gap-2 border-b border-[#EDE7D9] text-xs font-bold uppercase tracking-[0.18em] transition-colors hover:border-[#e9cf8a] hover:text-[#e9cf8a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7D9] focus-visible:ring-offset-4 focus-visible:ring-offset-[#1B4965]"
            >
              Ver só a pronta entrega
              <svg width="18" height="9" viewBox="0 0 22 10" fill="none" aria-hidden>
                <path d="M1 5H20M20 5L16 1M20 5L16 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Fileira: rola de lado no celular, cabe inteira no desktop. */}
      <ol
        className="mt-9 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 [scrollbar-width:none] lg:mx-auto lg:mt-14 lg:grid lg:max-w-[1320px] lg:grid-cols-7 lg:gap-5 lg:overflow-visible lg:px-10 [&::-webkit-scrollbar]:hidden"
      >
        {itens.map((p, i) => {
          const parc = parcelamentoCartao(p);
          return (
            <li key={p.id} className="group relative w-[46vw] max-w-[220px] shrink-0 snap-start lg:w-auto lg:max-w-none">
              <div className="relative aspect-[3/4] overflow-hidden bg-[#EDE7D9]/10">
                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden
                  onClick={() => onAbrir(p.id)}
                  className="absolute inset-0 cursor-pointer"
                >
                  <Image
                    src={p.foto}
                    alt=""
                    fill
                    sizes="(min-width: 1400px) 166px, (min-width: 1024px) 13vw, 46vw"
                    className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] motion-reduce:transition-none"
                  />
                </button>
                <div className="pointer-events-none absolute bottom-2 right-2">
                  <BotaoMais produto={p} escuro />
                </div>
              </div>
              <p aria-hidden className="mt-3 font-serif text-sm italic text-[#e9cf8a]">
                {String(i + 1).padStart(2, "0")}/{total}
              </p>
              <h3 className="mt-0.5 font-serif text-[17px] leading-tight lg:text-lg">
                <button
                  type="button"
                  onClick={() => onAbrir(p.id)}
                  className="cursor-pointer rounded-sm text-left underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7D9] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1B4965]"
                >
                  {p.nome}
                </button>
              </h3>
              <p className="nums-preco mt-1 font-serif text-base">{formatBRLPreco(parc.total)}</p>
              <p className="mt-0.5 text-xs leading-snug text-[#EDE7D9]/80">
                {labelParcelamento(parc)}
                <br />
                ou {formatBRLPreco(p.preco)} no pix
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
