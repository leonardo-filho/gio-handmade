"use client";

import { Reveal } from "../Reveal";
import CatalogFrame from "./CatalogFrame";

const care = [
  {
    n: "01",
    title: "Aplique antes",
    text: "Perfume, hidratante e maquiagem antes de vestir, e espere secar. Álcool e óleos podem oxidar correntes e opacar cristais.",
  },
  {
    n: "02",
    title: "Sem água, sem máquina",
    text: "Não molhe nem lave em máquina. Para limpar cristais e pedrarias, passe um pano macio levemente úmido e seque com pano seco.",
  },
  {
    n: "03",
    title: "Conchas naturais",
    text: "Na Saia Conchas, use só pano seco. Conchas não gostam de umidade.",
  },
  {
    n: "04",
    title: "Guarde plana",
    text: "Dentro do saquinho que acompanha. Correntes pesadas desalinham se ficam penduradas por muito tempo.",
  },
  {
    n: "05",
    title: "Headpiece apoiado",
    text: "Guarde sempre apoiado, nunca enrolado, pra manter o desenho original.",
  },
  {
    n: "06",
    title: "Sem ferro",
    text: "Não passe ferro em nenhuma parte da peça. Cuidado com fivelas, anéis e zíperes que podem enroscar nas correntes.",
  },
  {
    n: "07",
    title: "Antes de dormir",
    text: "Tire a peça pra dormir e evite sentar em estofado de couro liso, que pode marcar a corrente.",
  },
];

export default function Care() {
  return (
    <CatalogFrame page="09 · CUIDADOS" tone="mint" full id="cuidados">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid md:grid-cols-12 gap-12 items-end mb-14">
          <div className="md:col-span-7">
            <Reveal>
              <p className="text-[11px] tracking-[0.42em] uppercase font-[family-name:var(--font-display)] text-[#130209]/55">
                Cuidados · Para durar
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-5 font-[family-name:var(--font-display)] font-black uppercase leading-[0.84] tracking-[-0.045em] text-[#130209] text-[clamp(2.6rem,6vw,5.5rem)]">
                PRA SUA
                <br />
                PEÇA DURAR.
              </h2>
            </Reveal>
          </div>
          <div className="md:col-span-5">
            <Reveal delay={0.12}>
              <p className="font-[family-name:var(--font-serif)] italic text-[#130209]/75 text-lg leading-relaxed">
                Cada peça é única. Tratada com carinho, vai te acompanhar por muitos eventos.
              </p>
            </Reveal>
          </div>
        </div>

        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#130209]/15 border border-[#130209]/15">
          {care.map((c, i) => (
            <Reveal key={c.n} delay={0.04 + i * 0.04}>
              <li className="bg-[#C8E1E4] p-7 md:p-8 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <span className="relative inline-flex items-center justify-center w-12 h-6 rounded-full border border-[#130209]/55 text-[9px] tracking-[0.32em] font-[family-name:var(--font-display)] font-bold text-[#130209]">
                    {c.n}
                  </span>
                  <span className="block w-8 h-px bg-[#130209]/40" />
                </div>
                <h3 className="font-[family-name:var(--font-display)] font-bold uppercase tracking-[-0.01em] text-[#130209] text-xl md:text-2xl leading-tight">
                  {c.title}
                </h3>
                <p className="mt-3 font-[family-name:var(--font-serif)] text-[#130209]/80 text-[14px] leading-relaxed">
                  {c.text}
                </p>
              </li>
            </Reveal>
          ))}
          <Reveal delay={0.04 + care.length * 0.04} className="sm:col-span-2 lg:col-span-2">
            <li className="bg-[#1B4965] p-7 md:p-10 h-full flex flex-col justify-between gap-6 text-[#EDE7D9]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] tracking-[0.4em] uppercase font-[family-name:var(--font-display)] text-[#C8E1E4]/70">
                  Lembrete final
                </span>
                <span className="block w-10 h-px bg-[#C8E1E4]/40" />
              </div>
              <p className="font-[family-name:var(--font-serif)] italic text-[#EDE7D9] text-xl md:text-3xl leading-snug max-w-xl">
                Cuide como se a peça já fosse herança — tratada com carinho, ela atravessa muitos eventos com você.
              </p>
              <span className="text-[10px] tracking-[0.4em] uppercase font-[family-name:var(--font-display)] text-[#C8E1E4]/70">
                Gio · Catálogo 2026
              </span>
            </li>
          </Reveal>
        </ul>
      </div>
    </CatalogFrame>
  );
}
