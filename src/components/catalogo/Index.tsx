"use client";

import { Reveal } from "../Reveal";
import CatalogFrame from "./CatalogFrame";
import { Sparkle } from "./BrandMark";

const entries = [
  { n: "01", label: "Manifesto", anchor: "manifesto" },
  { n: "02", label: "Como Encomendar", anchor: "processo" },
  { n: "03", label: "Catálogo · Modelos-base", anchor: "produtos" },
  { n: "04", label: "Faixas de Preço", anchor: "precos" },
  { n: "05", label: "Cuidados", anchor: "cuidados" },
  { n: "06", label: "Contato", anchor: "contato" },
];

export default function IndexSection() {
  return (
    <CatalogFrame page="01 · ÍNDICE" tone="cream" full>
      <div className="max-w-7xl mx-auto w-full grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-5">
          <Reveal>
            <p className="text-[11px] tracking-[0.42em] uppercase font-[family-name:var(--font-display)] text-[#130209]/55 mb-6">
              Sumário
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="font-[family-name:var(--font-display)] font-black uppercase leading-[0.85] tracking-[-0.04em] text-[#130209] text-[clamp(4rem,12vw,11rem)] flex items-start gap-3">
              ÍNDICE
              <Sparkle className="text-[#1B4965] mt-2 md:mt-4" size={28} />
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-8 font-[family-name:var(--font-serif)] italic text-[#130209]/65 max-w-md text-lg leading-snug">
              Um percurso pela coleção, da intenção por trás de cada peça aos cuidados que prolongam a sua vida.
            </p>
          </Reveal>
        </div>

        <div className="md:col-span-7 relative">
          {/* curve background motif */}
          <svg
            viewBox="0 0 400 600"
            fill="none"
            className="absolute -left-10 top-0 h-full w-[120%] text-[#130209]/35 pointer-events-none"
            preserveAspectRatio="none"
          >
            <path d="M 80 0 C 260 120, 260 260, 100 320 C -40 380, -40 540, 110 600" stroke="currentColor" strokeWidth="1" />
          </svg>

          <ul className="relative space-y-7">
            {entries.map((e, i) => (
              <Reveal key={e.n} delay={0.05 + i * 0.04}>
                <a
                  href={`#${e.anchor}`}
                  className="group flex items-center gap-6 pl-6 transition-transform duration-500 hover:translate-x-1"
                >
                  <span className="relative inline-block shrink-0">
                    <span className="block w-10 h-5 rounded-full border border-[#130209]/60 bg-[#EDE7D9] transition-colors group-hover:bg-[#130209]" />
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] tracking-widest font-[family-name:var(--font-display)] text-[#130209]/70 group-hover:text-[#EDE7D9]">
                      {e.n}
                    </span>
                  </span>
                  <span className="text-base md:text-xl tracking-[0.18em] uppercase font-[family-name:var(--font-display)] font-medium text-[#130209]">
                    {e.label}
                  </span>
                </a>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </CatalogFrame>
  );
}
