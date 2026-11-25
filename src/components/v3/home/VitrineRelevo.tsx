"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FOCO, HOVER } from "../estrutura/estilo";
import SetaTexto from "./SetaTexto";

const FOCOS_MACRO = [
  { id: "ambar", rotulo: "Cristais âmbar", x: 36, y: 44 },
  { id: "perolas", rotulo: "Pérolas douradas", x: 64, y: 38 },
  { id: "fios", rotulo: "Fios suspensos", x: 50, y: 74 },
] as const;

// Bloco autoral da Home V3 Argon ("Atelie de Luz e Relevo"):
// Uma janela escura de joalheria com apenas 16 palavras que convida a tocar nos
// pontos de luz do bordado macro do Top Maya e experimentar o Relevo 3D e a
// Lente Macro na pagina da peca, diferenciando visualmente a home sem poluir.
export default function VitrineRelevo() {
  const [foco, setFoco] = useState<{ id: string; x: number; y: number }>(FOCOS_MACRO[0]);

  return (
    <section aria-labelledby="atelie-luz-titulo" className="px-4 pt-12 md:px-6 md:pt-16">
      <div className="mx-auto grid max-w-[1392px] overflow-hidden rounded-[4px] bg-[#130209] text-[#EDE7D9] md:grid-cols-[1.15fr_1fr]">
        {/* Janela macro interativa com feixe de luz direcional */}
        <div className="relative aspect-[16/10] w-full overflow-hidden md:aspect-auto md:min-h-[320px]">
          <Image
            src="/colecao/top-maya-5.jpg"
            alt="Close macro das 2.500 miçangas e cristais âmbar do Top Maya"
            fill
            sizes="(min-width: 768px) 55vw, 100vw"
            className="object-cover transition-transform duration-500 motion-reduce:transition-none"
            style={{
              objectPosition: `${foco.x}% ${foco.y}%`,
              transform: "scale(1.12)",
              transformOrigin: `${foco.x}% ${foco.y}%`,
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle 190px at ${foco.x}% ${foco.y}%, rgba(255,244,214,0.22) 0%, rgba(19,2,9,0.45) 60%, rgba(19,2,9,0.82) 100%)`,
            }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#EDE7D9]/75 shadow-[0_0_24px_rgba(255,235,190,0.4)] transition-all duration-300 motion-reduce:transition-none"
            style={{ left: `${foco.x}%`, top: `${foco.y}%` }}
          />
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-x-1.5 gap-y-2">
            {FOCOS_MACRO.map((item) => {
              const ativo = foco.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFoco(item)}
                  aria-pressed={ativo}
                  className={`relative flex min-h-9 items-center rounded px-2.5 text-[10px] after:absolute after:inset-x-0 after:-inset-y-1 after:content-[''] uppercase tracking-[0.13em] ${FOCO} ${
                    ativo
                      ? "bg-[#EDE7D9] text-[#130209]"
                      : `bg-[#130209]/75 text-[#EDE7D9] border border-[#EDE7D9]/30 ${HOVER}`
                  }`}
                >
                  {item.rotulo}
                </button>
              );
            })}
          </div>
        </div>

        {/* Coluna enxuta de convite para o estudio 3D e lente macro */}
        <div className="flex flex-col justify-center px-5 py-7 md:px-10 md:py-10">
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#C8E1E4]">
            Mesa de luz & relevo 3D
          </p>
          <h2
            id="atelie-luz-titulo"
            className="mt-2 font-[family-name:var(--font-serif)] text-[24px] font-normal leading-[30px] text-[#EDE7D9] md:text-[28px] md:leading-[34px]"
          >
            Top Maya: 2.500 miçangas ponto a ponto
          </h2>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <Link
              href="/loja/top-maya"
              className={`inline-flex min-h-11 items-center gap-2 rounded-[4px] bg-[#EDE7D9] px-4 text-[11px] uppercase tracking-[0.15em] text-[#130209] ${HOVER} ${FOCO}`}
            >
              Inspecionar em 3D e lente
              <SetaTexto />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
