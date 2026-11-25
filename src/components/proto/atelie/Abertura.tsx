"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ABERTURA } from "./dados";
import { IconeLupa } from "./Lupa";
import { TOTAL_PECAS, VISTAS } from "@/components/loja/vistas";


const PRONTA = VISTAS.find((v) => v.slug === "pronta-entrega")?.itens.length ?? 0;

// Abertura do ateliê: um recorte bem fechado de bordado (Top Maya, foto de
// detalhe da galeria) e a frase da home sobre o feito à mão. No celular, o
// recorte vem em cima e o texto embaixo; no desktop, lado a lado, com o
// recorte encostado na borda direita.
export default function Abertura({ onVerPeca }: { onVerPeca: (id: string) => void }) {
  const reduce = useReducedMotion();

  return (
    <section aria-labelledby="atelie-titulo" className="relative overflow-hidden bg-[#EDE7D9] text-[#1B4965]">
      <div className="lg:grid lg:min-h-[min(760px,calc(100svh-var(--header-h-topo,109px)))] lg:grid-cols-12">
        {/* Recorte do bordado */}
        <div className="relative h-[clamp(240px,33svh,400px)] overflow-hidden bg-[#130209] lg:order-2 lg:col-span-7 lg:h-auto">
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1 }}
            animate={reduce ? { scale: 1 } : { scale: 1.06 }}
            transition={{ duration: 14, ease: "linear", repeat: Infinity, repeatType: "mirror" }}
          >
            <Image
              src={ABERTURA.foto}
              alt="Detalhe do bordado do Top Maya: fileiras de cristais cor de mel, pérolas douradas e miçangas"
              fill
              priority
              sizes="(min-width: 1024px) 60vw, 180vw"
              className="object-cover scale-[1.75] sm:scale-[1.3] lg:scale-[1.22]"
              style={{ objectPosition: ABERTURA.foco, transformOrigin: ABERTURA.foco }}
            />
          </motion.div>
          {/* Sombra para a legenda */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#130209]/80 via-[#130209]/25 to-transparent"
          />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-4 pb-3.5 text-[#EDE7D9] sm:px-6 lg:px-8 lg:pb-7">
            <p className="max-w-[17rem] text-[12px] leading-snug lg:max-w-sm lg:text-[13px]">
              <span className="font-[family-name:var(--font-serif)] text-[15px] italic lg:text-lg">Top Maya, de perto.</span>
              <br />
              Mais de 2.500 miçangas e pedrarias, bordadas à mão.
            </p>
            <button
              type="button"
              onClick={() => onVerPeca(ABERTURA.id)}
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-[#EDE7D9]/60 px-4 text-[11px] uppercase tracking-[0.2em] text-[#EDE7D9] transition-colors hover:border-[#EDE7D9] hover:bg-[#EDE7D9] hover:text-[#1B4965] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7D9]"
            >
              Ver a peça
            </button>
          </div>
        </div>

        {/* Texto */}
        <div className="relative mx-auto max-w-xl px-5 pb-6 pt-5 sm:px-8 lg:order-1 lg:mx-0 lg:max-w-none lg:col-span-5 lg:flex lg:flex-col lg:justify-center lg:px-12 lg:py-16 xl:px-16">
          <p className="text-[10px] uppercase tracking-[0.34em] text-brand-gold-text lg:text-[11px]">
            O ateliê <span aria-hidden>·</span> Belém do Pará
          </p>
          <h1
            id="atelie-titulo"
            className="mt-2.5 font-[family-name:var(--font-serif)] text-[40px] leading-[0.98] tracking-[-0.01em] text-[#1B4965] sm:text-6xl lg:mt-5 lg:text-[clamp(3.5rem,5.5vw,5.75rem)] lg:leading-[0.95]"
          >
            Peças feitas <br className="hidden lg:block" />à mão, <br />
            <em className="text-[#1B4965]/85">ponto a ponto.</em>
          </h1>
          <p className="mt-3.5 flex max-w-md items-start gap-2.5 text-[14px] leading-snug text-brand-muted lg:mt-7 lg:text-[15px]">
            <IconeLupa className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold-text" />
            <span>
              Cada detalhe importa:{" "}
              <span className="text-[#1B4965] [@media(hover:hover)]:hidden">toque e segure qualquer foto para ver o bordado de perto.</span>
              <span className="hidden text-[#1B4965] [@media(hover:hover)]:inline">passe o mouse sobre as fotos para ver o bordado de perto.</span>
            </span>
          </p>
          <div className="mt-10 hidden flex-wrap items-center gap-x-6 gap-y-4 lg:flex">
            <a
              href="#pecas"
              className="group inline-flex min-h-11 shrink-0 items-center gap-3 whitespace-nowrap rounded-full border border-[#1B4965] px-6 text-[11px] uppercase tracking-[0.22em] text-[#1B4965] transition-colors hover:bg-[#1B4965] hover:text-[#EDE7D9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b8902a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDE7D9]"
            >
              Ver as {TOTAL_PECAS} peças
              <svg aria-hidden viewBox="0 0 12 16" className="h-3.5 w-3 transition-transform duration-300 group-hover:translate-y-0.5" fill="none" stroke="currentColor" strokeWidth={1.3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 1v13M1.5 9.5 6 14l4.5-4.5" />
              </svg>
            </a>
            <p className="text-[12px] leading-snug text-brand-muted">
              {PRONTA} à pronta entrega.
              <br />
              Monte o carrinho e finalize pelo WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
