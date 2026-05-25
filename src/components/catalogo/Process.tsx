"use client";

import { Reveal } from "../Reveal";
import CatalogFrame from "./CatalogFrame";
import { Sparkle } from "./BrandMark";

const steps = [
  {
    n: "01",
    title: "Defina seu modelo",
    text: "Nos envie a peça que você deseja, pode ser uma inspiração que você já tenha encontrado ou algo que você imaginou.",
  },
  {
    n: "02",
    title: "Defina a cor ideal",
    text: "Escolha a cor que mais combina com o seu estilo e com o resultado que você quer alcançar.",
  },
  {
    n: "03",
    title: "Confirme sua encomenda",
    text: "Faça o pagamento de 50% do valor total para reservar sua peça (no cartão de crédito é debitado o valor completo).",
  },
  {
    n: "04",
    title: "Envie suas medidas",
    text: "Após a confirmação da peça você receberá um vídeo ensinando a tirar as medidas necessárias, irei ajudar fornecendo orientações.",
  },
  {
    n: "05",
    title: "Aguarde a retirada",
    text: "Definiremos uma data para você retirar sua encomenda feita com muito carinho!",
  },
];

export default function Process() {
  return (
    <CatalogFrame page="03 · COMO ENCOMENDAR" tone="cream" full id="processo">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid md:grid-cols-12 gap-12 items-start">
          <div className="md:col-span-5 md:sticky md:top-24">
            <Reveal>
              <p className="text-[11px] tracking-[0.42em] uppercase font-[family-name:var(--font-display)] text-[#130209]/55">
                Processo
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-6 font-[family-name:var(--font-display)] font-black uppercase leading-[0.85] tracking-[-0.04em] text-[#130209] text-[clamp(2.6rem,5.2vw,4.8rem)]">
                COMO
                <br />
                ENCOMENDAR
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-8 font-[family-name:var(--font-serif)] italic text-[#130209]/70 text-lg max-w-md leading-relaxed">
                Do primeiro contato à peça nas suas mãos.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <a
                href="https://wa.me/559192982017?text=Ol%C3%A1%2C%20gostaria%20de%20realizar%20um%20or%C3%A7amento."
                className="mt-10 inline-flex items-center gap-3 px-6 py-3 bg-[#130209] text-[#EDE7D9] text-[11px] tracking-[0.3em] uppercase font-[family-name:var(--font-display)] hover:bg-[#1B4965] transition-colors"
              >
                Começar pelo WhatsApp
                <svg width="20" height="10" viewBox="0 0 22 10" fill="none">
                  <path d="M1 5H20M20 5L16 1M20 5L16 9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                </svg>
              </a>
            </Reveal>
          </div>

          <div className="md:col-span-7 relative">
            {/* central rail */}
            <span className="hidden md:block absolute left-[26px] top-2 bottom-2 w-px bg-[#130209]/25" />
            <ul className="space-y-9">
              {steps.map((s, i) => (
                <Reveal key={s.n} delay={0.05 + i * 0.06}>
                  <li className="relative grid grid-cols-[54px_1fr] md:grid-cols-[60px_1fr] gap-5 md:gap-7 items-start">
                    <span className="relative inline-flex items-center justify-center w-[54px] md:w-[60px] h-7 rounded-full border border-[#130209]/60 bg-[#EDE7D9] text-[10px] tracking-[0.25em] font-[family-name:var(--font-display)] font-bold text-[#130209]">
                      {s.n}
                    </span>
                    <div>
                      <h3 className="font-[family-name:var(--font-display)] font-bold text-[#130209] text-xl md:text-2xl leading-tight">
                        {s.title}
                      </h3>
                      <p className="mt-2 font-[family-name:var(--font-serif)] text-[#130209]/75 text-[15px] leading-relaxed max-w-xl">
                        {s.text}
                      </p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ul>

            <Reveal delay={0.5}>
              <p className="mt-12 ml-[80px] font-[family-name:var(--font-serif)] italic text-[#130209]/55 text-sm border-l border-[#130209]/20 pl-6 flex items-start gap-3">
                <Sparkle className="text-[#1B4965] mt-1 shrink-0" size={14} />
                <span>Cada peça leva sua numeração de série e é feita pensando só em você.</span>
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </CatalogFrame>
  );
}
