"use client";

import { Reveal } from "../Reveal";
import CatalogFrame from "./CatalogFrame";

const care = [
  {
    n: "01",
    title: "Guarde com cuidado",
    text: "Mantenha em local seco, longe da umidade e do sol direto. Deixe a peça junto do sachê de sílica gel que é enviado.",
  },
  {
    n: "02",
    title: "Manuseie com cuidado",
    text: "Evite deixar as peças soltas em locais onde elas podem embolar ou arranhar umas nas outras.",
  },
  {
    n: "03",
    title: "Não passe produtos por cima dela",
    text: "Vista a peça por último. Evite passar hidratantes e perfumes por cima dela depois de colocá-la.",
  },
  {
    n: "04",
    title: "Limpeza certa",
    text: "Limpe a peça com o paninho que é enviado. Evite água e produtos químicos em qualquer parte dela.",
  },
  {
    n: "05",
    title: "Kit reparo junto",
    text: "Leve sempre seu kit reparo. Nossas peças são feitas com muito cuidado e reforço, mas acidentes acontecem.",
  },
];

export default function Care() {
  return (
    <CatalogFrame page="06 · CUIDADOS" tone="mint" full id="cuidados">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid md:grid-cols-12 gap-12 items-end mb-14">
          <div className="md:col-span-7">
            <Reveal>
              <p className="text-[11px] tracking-[0.42em] uppercase font-[family-name:var(--font-display)] text-[#130209]/55">
                Cuidados · Pra sua peça durar
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-5 font-[family-name:var(--font-display)] font-black uppercase leading-[0.86] tracking-[-0.045em] text-[#130209] text-[clamp(2.4rem,4.8vw,4.6rem)]">
                CUIDE DA SUA PEÇA
                <br />
                COM CARINHO.
              </h2>
            </Reveal>
          </div>
          <div className="md:col-span-5">
            <Reveal delay={0.12}>
              <p className="font-[family-name:var(--font-serif)] italic text-[#130209]/75 text-lg leading-relaxed">
                Cada peça é feita à mão, com reforço e atenção. Tratada com carinho, vai te acompanhar por muitos eventos.
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
          <Reveal delay={0.04 + care.length * 0.04} className="sm:col-span-2 lg:col-span-1">
            <li className="bg-[#1B4965] p-7 md:p-9 pr-7 md:pr-9 pb-12 md:pb-12 h-full flex flex-col justify-between gap-6 text-[#EDE7D9]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] tracking-[0.4em] uppercase font-[family-name:var(--font-display)] text-[#C8E1E4]/70">
                  Obrigada
                </span>
                <span className="block w-10 h-px bg-[#C8E1E4]/40" />
              </div>
              <p className="font-[family-name:var(--font-serif)] italic text-[#EDE7D9] text-lg md:text-xl leading-snug max-w-md">
                Obrigada por escolher o feito à mão. Cuide dessa peça como ela é, especial.
              </p>
              <div className="flex flex-col gap-1.5 text-[10px] tracking-[0.32em] uppercase font-[family-name:var(--font-display)] text-[#C8E1E4]/70">
                <span>Dúvidas? Fala com a gente</span>
                <span className="text-[#EDE7D9] tracking-[0.06em] normal-case text-[13px] font-medium">@gio.handmade__</span>
                <span className="text-[#EDE7D9] tracking-[0.06em] normal-case text-[13px] font-medium">(91) 99298-2017</span>
                <span className="text-[#EDE7D9] tracking-[0.06em] normal-case text-[13px] font-medium">giohandmade.com.br</span>
              </div>
            </li>
          </Reveal>
        </ul>
      </div>
    </CatalogFrame>
  );
}
