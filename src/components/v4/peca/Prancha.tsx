"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import FotoSuave from "@/components/v3/estrutura/FotoSuave";
import type { Foto } from "../lookbook/pranchas";
import Legenda from "./Legenda";

type Props = {
  id: string;
  numeral: string;
  titulo: string;
  fotos: Foto[];
  nome: string;
  /** A primeira prancha da página: a foto carrega na hora, sem fade. */
  primeira?: boolean;
};

// Uma prancha de fotos (A peça, No corpo). Celular: tela cheia, uma foto por
// vez, troca com o dedo e encaixe nativo. Computador: a foto inteira, sem
// corte, sobre o creme, uma por vez, com setas quando houver mais de uma.
export default function Prancha({ id, numeral, titulo, fotos, nome, primeira = false }: Props) {
  const trilhoRef = useRef<HTMLDivElement>(null);
  const [atual, setAtual] = useState(0);
  const varias = fotos.length > 1;

  function aoRolar() {
    const t = trilhoRef.current;
    const primeiraFoto = t?.firstElementChild as HTMLElement | null;
    if (!t || !primeiraFoto) return;
    const i = Math.round(t.scrollLeft / primeiraFoto.offsetWidth);
    if (i !== atual) setAtual(i);
  }

  function andar(sentido: 1 | -1) {
    const t = trilhoRef.current;
    const primeiraFoto = t?.firstElementChild as HTMLElement | null;
    if (!t || !primeiraFoto) return;
    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    t.scrollBy({ left: sentido * primeiraFoto.offsetWidth, behavior: reduzido ? "auto" : "smooth" });
  }

  return (
    <section
      id={id}
      data-prancha={id}
      aria-label={`${numeral}. ${titulo}`}
      className="prancha flex snap-start flex-col"
    >
      <div
        ref={trilhoRef}
        onScroll={aoRolar}
        tabIndex={varias ? 0 : undefined}
        aria-label={varias ? `${titulo}: ${fotos.length} fotos, role para o lado` : undefined}
        className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overscroll-x-contain outline-offset-[-3px] [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-[#b8902a] [&::-webkit-scrollbar]:hidden"
      >
        {fotos.map((f, i) => {
          const larga = f.aspecto >= 0.9;
          const alt = i === 0 ? `${nome}, ${titulo.toLowerCase()}` : `${nome}, ${titulo.toLowerCase()}, foto ${i + 1}`;
          const classe = `${larga ? "object-contain" : "object-cover"} object-[50%_40%] lg:object-contain`;
          const sizes = "(min-width: 1024px) 50vw, 100vw";
          return (
            <div
              key={f.src}
              className="relative h-full w-full shrink-0 snap-start bg-[#1B4965]/5 lg:bg-transparent"
            >
              <div className="relative h-full w-full">
                {primeira && i === 0 ? (
                  <Image src={f.src} alt={alt} fill sizes={sizes} priority className={classe} />
                ) : (
                  <FotoSuave src={f.src} alt={alt} fill sizes={sizes} loading="lazy" className={classe} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Legenda numeral={numeral} titulo={titulo}>
        {varias && (
          <>
            <span aria-hidden className="nums-preco text-[12px] tracking-[0.08em] text-brand-muted lg:hidden">
              {atual + 1} / {fotos.length}
            </span>
            <span className="hidden items-center lg:flex">
                <Seta rotulo="Fotos anteriores" desligada={atual === 0} aoClicar={() => andar(-1)} sentido={-1} />
                <span aria-hidden className="nums-preco w-12 text-center text-[12px] text-brand-muted">
                  {atual + 1} / {fotos.length}
                </span>
                <Seta
                  rotulo="Próximas fotos"
                  desligada={atual >= fotos.length - 1}
                  aoClicar={() => andar(1)}
                  sentido={1}
                />
            </span>
          </>
        )}
      </Legenda>
    </section>
  );
}

function Seta({
  rotulo,
  desligada,
  aoClicar,
  sentido,
}: {
  rotulo: string;
  desligada: boolean;
  aoClicar: () => void;
  sentido: 1 | -1;
}) {
  return (
    <button
      type="button"
      onClick={aoClicar}
      disabled={desligada}
      aria-label={rotulo}
      className="flex h-11 w-11 items-center justify-center rounded-[4px] text-[#1B4965] transition-opacity duration-200 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-[#b8902a] disabled:opacity-25 motion-reduce:transition-none"
    >
      <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.4}>
        <path d={sentido === 1 ? "m9 5 7 7-7 7" : "M15 5 8 12l7 7"} />
      </svg>
    </button>
  );
}
