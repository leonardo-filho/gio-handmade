"use client";

import { Reveal } from "../Reveal";
import CatalogFrame from "./CatalogFrame";

export default function ComingSoon() {
  return (
    <CatalogFrame page="07 · EM BREVE" tone="navy" full id="em-breve">
      <div className="max-w-7xl mx-auto w-full grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-5 relative">
          <Reveal>
            <div className="relative aspect-[3/4] w-full bg-gradient-to-br from-[#1B4965] via-[#0e2e44] to-[#130209] overflow-hidden border border-[#EDE7D9]/15">
              {/* decorative shapes */}
              <span className="absolute top-1/3 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full border border-[#C8E1E4]/20" />
              <span className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full border border-[#C8E1E4]/10" />
              <span className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full border border-[#C8E1E4]/5" />

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
                <span className="text-[10px] tracking-[0.5em] uppercase font-[family-name:var(--font-display)] text-[#C8E1E4]/60">
                  Em breve
                </span>
                <h3 className="mt-6 font-[family-name:var(--font-display)] font-black uppercase leading-[0.85] tracking-[-0.04em] text-[#EDE7D9] text-5xl md:text-6xl">
                  COPA
                  <br />
                  2026
                </h3>
                <span className="mt-6 text-[10px] tracking-[0.4em] uppercase font-[family-name:var(--font-display)] text-[#C8E1E4]/60">
                  Edição limitada · 03 peças
                </span>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="md:col-span-7">
          <Reveal>
            <p className="text-[11px] tracking-[0.42em] uppercase font-[family-name:var(--font-display)] text-[#C8E1E4]/70">
              Edição Especial · Copa do Mundo
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-6 font-[family-name:var(--font-display)] font-black uppercase leading-[0.85] tracking-[-0.045em] text-[#EDE7D9] text-[clamp(3rem,9vw,8rem)]">
              COLEÇÃO
              <br />
              COPA 2026
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-8 font-[family-name:var(--font-serif)] italic text-[#EDE7D9]/85 text-xl md:text-2xl leading-snug max-w-xl">
              Uma cápsula inspirada nas cores da bandeira do Brasil, pensada para a Copa do Mundo de 2026.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <p className="mt-5 font-[family-name:var(--font-serif)] text-[#EDE7D9]/70 text-base max-w-xl leading-relaxed">
              Serão três opções de roupa, cada uma em uma combinação inédita das cores da bandeira. Tiragem numerada — não volta após a coleção encerrar.
            </p>
          </Reveal>

          <Reveal delay={0.25}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              {[
                { c: "#009C3B", l: "Verde" },
                { c: "#FFDF00", l: "Ouro" },
                { c: "#002776", l: "Azul" },
                { c: "#EDE7D9", l: "Marfim" },
              ].map((sw) => (
                <div key={sw.l} className="flex items-center gap-2">
                  <span className="block w-4 h-4 rounded-full border border-[#EDE7D9]/30" style={{ background: sw.c }} />
                  <span className="text-[10px] tracking-[0.32em] uppercase font-[family-name:var(--font-display)] text-[#EDE7D9]/70">
                    {sw.l}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.32}>
            <a
              href="https://wa.me/559192982017?text=Quero%20entrar%20na%20lista%20de%20interesse%20da%20Cole%C3%A7%C3%A3o%20Copa%202026."
              className="mt-10 inline-flex items-center gap-3 px-6 py-3 bg-[#C8E1E4] text-[#1B4965] text-[11px] tracking-[0.3em] uppercase font-[family-name:var(--font-display)] hover:bg-[#EDE7D9] transition-colors"
            >
              Entrar na lista de interesse
              <svg width="20" height="10" viewBox="0 0 22 10" fill="none">
                <path d="M1 5H20M20 5L16 1M20 5L16 9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              </svg>
            </a>
          </Reveal>
        </div>
      </div>
    </CatalogFrame>
  );
}
