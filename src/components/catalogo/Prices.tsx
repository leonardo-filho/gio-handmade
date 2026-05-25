"use client";

import { Reveal } from "../Reveal";
import CatalogFrame from "./CatalogFrame";
import { Sparkle } from "./BrandMark";

const rows = [
  { code: "07", name: "Headpiece", price: "R$ 170" },
  { code: "04", name: "Top Cristais", price: "R$ 500" },
  { code: "01", name: "Beaded Top", price: "R$ 600" },
  { code: "03", name: "Acessório Conchas Naturais", price: "R$ 600" },
  { code: "06", name: "Vestido Cristais", price: "R$ 1.000" },
  { code: "02", name: "Conjunto Cristais", price: "R$ 1.100" },
  { code: "05", name: "Conjunto Pedrarias", price: "R$ 1.300" },
];

export default function Prices() {
  return (
    <CatalogFrame page="05 · INVESTIMENTO" tone="cream" full id="precos">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid md:grid-cols-12 gap-10 items-end mb-12">
          <div className="md:col-span-7">
            <Reveal>
              <p className="text-[11px] tracking-[0.42em] uppercase font-[family-name:var(--font-display)] text-[#130209]/55">
                Investimento
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-5 font-[family-name:var(--font-display)] font-black uppercase leading-[0.85] tracking-[-0.045em] text-[#130209] text-[clamp(2.8rem,6.5vw,6rem)]">
                FAIXAS
                <br />
                <span className="italic font-[family-name:var(--font-serif)] font-normal normal-case lowercase text-[#1B4965]">
                  de preço
                </span>
              </h2>
            </Reveal>
          </div>
          <div className="md:col-span-5">
            <Reveal delay={0.12}>
              <p className="font-[family-name:var(--font-serif)] italic text-[#130209]/70 text-lg leading-relaxed max-w-md">
                Valores iniciais. Personalização e pedrarias premium podem alterar o preço final. Combinamos tudo junto antes da produção.
              </p>
            </Reveal>
          </div>
        </div>

        <Reveal>
          <ul className="border-t border-[#130209]/30">
            {rows.map((r, i) => (
              <li
                key={`${r.code}-${i}`}
                className="grid grid-cols-[60px_1fr_auto] gap-4 md:gap-8 items-baseline px-1 py-5 md:py-6 border-b border-[#130209]/15 hover:bg-[#130209]/5 transition-colors"
              >
                <span className="text-[10px] tracking-[0.4em] uppercase font-[family-name:var(--font-display)] text-[#130209]/55">
                  #{r.code}
                </span>
                <span className="font-[family-name:var(--font-serif)] text-[#130209] text-xl md:text-2xl">
                  {r.name}
                </span>
                <span className="font-[family-name:var(--font-display)] font-bold text-[#1B4965] text-xl md:text-2xl tracking-tight">
                  {r.price}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-10 grid sm:grid-cols-3 gap-6 text-[11px] tracking-[0.28em] uppercase font-[family-name:var(--font-display)] text-[#130209]/70">
            <div className="border-t border-[#130209]/30 pt-4">
              <span className="block text-[10px] text-[#130209]/55">Sinal</span>
              <span className="mt-1 block text-[#130209] text-lg md:text-xl normal-case tracking-tight font-bold leading-snug">50% no aceite</span>
            </div>
            <div className="border-t border-[#130209]/30 pt-4">
              <span className="block text-[10px] text-[#130209]/55">Saldo restante</span>
              <span className="mt-1 block text-[#130209] text-lg md:text-xl normal-case tracking-tight font-bold leading-snug">Até 72h após a data combinada para entrega da peça</span>
            </div>
            <div className="border-t border-[#130209]/30 pt-4">
              <span className="block text-[10px] text-[#130209]/55">Envio</span>
              <span className="mt-1 block text-[#130209] text-lg md:text-xl normal-case tracking-tight font-bold leading-snug">Toda a América</span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.18}>
          <p className="mt-8 flex items-start gap-3 font-[family-name:var(--font-serif)] italic text-[#130209]/75 text-[15px] md:text-base leading-relaxed max-w-3xl border-l border-[#1B4965]/30 pl-5">
            <Sparkle className="text-[#1B4965] mt-1.5 shrink-0" size={14} />
            <span>
              Caso precise antes do prazo estipulado, entre em contato informando a data do evento. Em muitos casos conseguimos antecipar a produção.
            </span>
          </p>
        </Reveal>

        <Reveal delay={0.22}>
          <div className="mt-14 border border-[#130209]/20 bg-[#130209]/[0.03] p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start gap-4 max-w-xl">
              <Sparkle className="text-[#1B4965] mt-1 shrink-0" size={20} />
              <div>
                <p className="font-[family-name:var(--font-display)] font-bold uppercase tracking-[-0.01em] text-[#130209] text-xl md:text-2xl leading-tight">
                  Reserve seu lugar na agenda
                </p>
                <p className="mt-2 font-[family-name:var(--font-serif)] italic text-[#130209]/70 text-[15px] md:text-base leading-relaxed">
                  Trabalho com poucas peças por mês para manter o cuidado em cada detalhe. Garanta a sua antes do próximo evento.
                </p>
              </div>
            </div>
            <a
              href="https://wa.me/559192982017?text=Ol%C3%A1%2C%20vi%20os%20pre%C3%A7os%20e%20quero%20encomendar%20uma%20pe%C3%A7a."
              className="shrink-0 inline-flex items-center justify-center gap-3 bg-[#130209] text-[#EDE7D9] px-7 py-3.5 text-[11px] tracking-[0.32em] uppercase font-[family-name:var(--font-display)] font-bold hover:bg-[#1B4965] transition-colors"
            >
              Pedir orçamento
              <svg width="22" height="10" viewBox="0 0 22 10" fill="none">
                <path d="M1 5H20M20 5L16 1M20 5L16 9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              </svg>
            </a>
          </div>
        </Reveal>
      </div>
    </CatalogFrame>
  );
}
