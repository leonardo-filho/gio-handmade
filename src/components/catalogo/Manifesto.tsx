"use client";

import { Reveal } from "../Reveal";
import CatalogFrame from "./CatalogFrame";

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
    <CatalogFrame page="04 · MANIFESTO" tone="ink" full id="manifesto">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid md:grid-cols-12 gap-10 items-end mb-16">
          <div className="md:col-span-5">
            <Reveal>
              <p className="text-[11px] tracking-[0.42em] uppercase font-[family-name:var(--font-display)] text-[#EDE7D9]/55">
                Voz da Marca
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-6 font-[family-name:var(--font-display)] font-black uppercase leading-[0.85] tracking-[-0.045em] text-[#EDE7D9] text-[clamp(3.5rem,11vw,10rem)]">
                MANIFESTO
              </h2>
            </Reveal>
          </div>
          <div className="md:col-span-7 md:pl-10 md:border-l md:border-[#EDE7D9]/15">
            <Reveal delay={0.1}>
              <p className="font-[family-name:var(--font-serif)] italic text-[#EDE7D9]/75 text-xl md:text-2xl leading-snug max-w-xl">
                Seis frases que dizem o que eu não cabe explicar a cada peça. É a régua de tudo que sai do meu ateliê.
              </p>
            </Reveal>
          </div>
        </div>

        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#EDE7D9]/10 border border-[#EDE7D9]/10">
          {slogans.map((s, i) => (
            <Reveal key={s.kicker} delay={0.05 + i * 0.05}>
              <li className="bg-[#130209] p-8 md:p-10 min-h-[230px] flex flex-col justify-between group relative overflow-hidden">
                <span className="text-[10px] tracking-[0.4em] uppercase font-[family-name:var(--font-display)] text-[#C8E1E4]/70">
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
                <span className="absolute -right-6 -bottom-6 w-24 h-12 rounded-full border border-[#EDE7D9]/15 opacity-60 transition-transform duration-700 group-hover:scale-110" />
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </CatalogFrame>
  );
}
