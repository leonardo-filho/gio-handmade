"use client";

import Image from "next/image";
import { Reveal } from "../Reveal";
import CatalogFrame from "./CatalogFrame";

export default function CatalogIntro() {
  return (
    <CatalogFrame page="06 · MODELOS-BASE" tone="ink" full>
      <div className="max-w-7xl mx-auto w-full grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-6 relative">
          <Reveal>
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#EDE7D9]/5">
              <Image
                src="/peca-preta-correntes.png"
                alt="Modelo-base · Gio Handmade"
                fill
                sizes="(min-width: 768px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 text-[10px] tracking-[0.4em] uppercase font-[family-name:var(--font-display)] text-[#EDE7D9]/60">
              Modelo · Top Cristais · #04
            </p>
          </Reveal>
        </div>

        <div className="md:col-span-6">
          <Reveal>
            <p className="text-[11px] tracking-[0.42em] uppercase font-[family-name:var(--font-display)] text-[#EDE7D9]/55">
              Sete peças-base
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-6 font-[family-name:var(--font-display)] font-black uppercase leading-[0.85] tracking-[-0.045em] text-[#EDE7D9] text-[clamp(3rem,8vw,7.5rem)]">
              CATÁLOGO
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-8 font-[family-name:var(--font-serif)] italic text-[#EDE7D9]/75 text-xl md:text-2xl leading-snug max-w-md">
              Use como ponto de partida. Cor, comprimento, densidade da pedraria — tudo desenhado a quatro mãos com você.
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-10 grid grid-cols-3 max-w-md text-[10px] tracking-[0.3em] uppercase font-[family-name:var(--font-display)] text-[#EDE7D9]/55">
              <div className="border-t border-[#EDE7D9]/20 pt-3">
                <span className="block text-[#C8E1E4] font-[family-name:var(--font-display)] font-bold text-3xl normal-case tracking-tight">07</span>
                modelos
              </div>
              <div className="border-t border-[#EDE7D9]/20 pt-3">
                <span className="block text-[#C8E1E4] font-[family-name:var(--font-display)] font-bold text-3xl normal-case tracking-tight">∞</span>
                variações
              </div>
              <div className="border-t border-[#EDE7D9]/20 pt-3">
                <span className="block text-[#C8E1E4] font-[family-name:var(--font-display)] font-bold text-3xl normal-case tracking-tight">01</span>
                única sua
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </CatalogFrame>
  );
}
