"use client";

import { Reveal } from "../Reveal";
import CatalogFrame from "./CatalogFrame";
import { Sparkle } from "./BrandMark";

const slogans = [
  { kicker: "I", text: "Feito à mão.", em: "Sentido na pele." },
  { kicker: "II", text: "Menos excesso.", em: "Mais essência." },
  { kicker: "III", text: "Atemporal", em: "por escolha." },
  { kicker: "IV", text: "Cada peça", em: "carrega um processo." },
  { kicker: "V", text: "O essencial,", em: "elevado." },
  { kicker: "VI", text: "Feita para durar", em: "além das tendências." },
];

export default function Manifesto() {
  return (
    <CatalogFrame page="02 · MANIFESTO" tone="ink" full id="manifesto">
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-16">
          <Reveal>
            <p className="text-[11px] tracking-[0.42em] uppercase font-[family-name:var(--font-display)] text-[#EDE7D9]/55">
              Voz da Marca
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-6 font-[family-name:var(--font-display)] font-black uppercase leading-[0.85] tracking-[-0.045em] text-[#EDE7D9] text-[clamp(3.5rem,10vw,9rem)]">
              MANIFESTO
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-8 font-[family-name:var(--font-serif)] italic text-[#EDE7D9]/75 text-xl md:text-2xl leading-snug max-w-2xl border-l-2 border-[#C8E1E4]/40 pl-5">
              Seis frases que dizem o que não cabe explicar a cada peça. A régua de tudo que sai do meu ateliê.
            </p>
          </Reveal>
        </div>

        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#EDE7D9]/10 border border-[#EDE7D9]/10">
          {slogans.map((s, i) => (
            <Reveal key={s.kicker} delay={0.05 + i * 0.05}>
              <li className="bg-[#130209] p-8 md:p-10 min-h-[230px] flex flex-col justify-between group relative overflow-hidden">
                <span className="font-brand text-[#C8E1E4]/85 text-3xl md:text-4xl leading-none tracking-tight">
                  {s.kicker}
                </span>
                <div>
                  <p className="font-[family-name:var(--font-display)] font-bold text-[#EDE7D9] text-2xl md:text-3xl leading-tight">
                    {s.text}
                  </p>
                  <p className="mt-1 font-[family-name:var(--font-serif)] italic text-[#C8E1E4] text-xl md:text-2xl leading-tight">
                    {s.em}
                  </p>
                </div>
                <span className="pointer-events-none absolute right-5 bottom-5 opacity-60 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12">
                  <Sparkle className="text-[#C8E1E4]/70" size={16} />
                </span>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </CatalogFrame>
  );
}
