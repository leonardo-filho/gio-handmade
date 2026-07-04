"use client";

import Image from "next/image";
import { Reveal } from "../Reveal";
import CatalogFrame from "./CatalogFrame";
import { Sparkle } from "./BrandMark";

export default function Brand() {
  return (
    <CatalogFrame page="03 · A MARCA" tone="cream" full id="marca">
      <div className="max-w-7xl mx-auto w-full grid md:grid-cols-12 gap-10 md:gap-16 items-center">
        <Reveal className="md:col-span-5">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#130209]/5">
            <Image
              src="/eu.jpeg"
              alt="Giovanna — fundadora Gio Handmade"
              fill
              className="object-cover grayscale-[20%] contrast-[1.05]"
              sizes="(min-width: 768px) 40vw, 100vw"
            />
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-[10px] tracking-[0.32em] uppercase font-[family-name:var(--font-display)] text-[#EDE7D9]">
              <span>Giovanna</span>
              <span>Atelier · Belém/PA</span>
            </div>
          </div>
        </Reveal>

        <div className="md:col-span-7">
          <Reveal>
            <p className="text-[11px] tracking-[0.42em] uppercase font-[family-name:var(--font-display)] text-[#130209]/55 mb-6">
              A Marca · Cap. 01
            </p>
          </Reveal>

          <Reveal delay={0.05}>
            <h2 className="font-[family-name:var(--font-display)] font-black uppercase leading-[0.86] tracking-[-0.035em] text-[#130209] text-[clamp(2.4rem,6vw,5.2rem)]">
              ROUPA QUE
              <br />
              <span className="italic font-[family-name:var(--font-serif)] font-normal normal-case lowercase text-[#1B4965]">
                traduz quem
              </span>
              <br />
              VOCÊ É.
            </h2>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl">
            <Reveal delay={0.1}>
              <p className="font-[family-name:var(--font-serif)] text-[#130209]/80 leading-relaxed text-[15px]">
                Cada peça nasce pensando em uma mulher só. Não trabalho com coleção em massa, então a peça que chega na sua mão não vai estar em mais ninguém.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <p className="font-[family-name:var(--font-serif)] text-[#130209]/80 leading-relaxed text-[15px]">
                Cristais, pedrarias, correntes e missangas, aplicados um a um, com calma e cuidado. Para ocasiões especiais e para você se sentir bem antes de qualquer elogio.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.26}>
            <div className="mt-10 inline-flex items-center gap-4 px-5 py-3 border border-[#130209]/30 rounded-full">
              <Sparkle className="text-[#1B4965]" size={14} />
              <span className="text-[10px] tracking-[0.4em] uppercase font-[family-name:var(--font-display)] text-[#130209]/70">
                Feito à mão · Sentido na pele
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </CatalogFrame>
  );
}
