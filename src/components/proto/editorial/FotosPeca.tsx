"use client";

import { useState } from "react";
import Image from "next/image";

// Foto do card. No toque, um carrossel por arrasto (scroll-snap) com pontinhos
// para ver as fotos da peça sem abrir o detalhe; um toque simples abre a peça
// (arrastar não dispara o clique). Com mouse, o carrossel fica parado na
// primeira foto e a segunda aparece no hover.
//
// O que só serve a um dos modos some no outro com display none, e como as
// imagens são lazy, nem é baixado: as fotos 2 em diante do carrossel no
// desktop e a foto de hover no celular.

const TRANSICAO =
  "object-cover transition-[transform,opacity] duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none";

export default function FotosPeca({
  fotos,
  nome,
  sizes,
  onAbrir,
  className = "",
  prioridade = false,
  foco,
}: {
  fotos: string[];
  nome: string;
  sizes: string;
  onAbrir: () => void;
  className?: string;
  prioridade?: boolean;
  /** object-position das fotos (ex.: "50% 22%" para manter o rosto). */
  foco?: string;
}) {
  const estilo = foco ? { objectPosition: foco } : undefined;
  const [ativa, setAtiva] = useState(0);
  const varias = fotos.length > 1;

  function aoRolar(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const i = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
    if (i !== ativa) setAtiva(i);
  }

  return (
    <div
      aria-hidden
      onClick={onAbrir}
      // Sempre dentro de uma caixa com tamanho (a proporção fica com quem usa).
      className={`absolute inset-0 cursor-pointer overflow-hidden bg-[#e4ddcf] ${className}`}
    >
      <div
        onScroll={varias ? aoRolar : undefined}
        className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [@media(hover:hover)]:overflow-hidden"
      >
        {fotos.map((f, i) => (
          <div
            key={f}
            className={`relative h-full w-full shrink-0 snap-center snap-always ${i > 0 ? "[@media(hover:hover)]:hidden" : ""}`}
          >
            <Image
              src={f}
              alt={i === 0 ? nome : ""}
              fill
              sizes={sizes}
              draggable={false}
              loading={i === 0 && prioridade ? "eager" : "lazy"}
              fetchPriority={i === 0 && prioridade ? "high" : undefined}
              style={estilo}
              className={`${TRANSICAO} ${i === 0 ? "[@media(hover:hover)]:group-hover:scale-[1.035]" : ""} ${
                i === 0 && varias ? "[@media(hover:hover)]:group-hover:opacity-0" : ""
              }`}
            />
          </div>
        ))}
      </div>

      {/* Segunda foto no hover (só com mouse). */}
      {varias && (
        <Image
          src={fotos[1]}
          alt=""
          fill
          sizes={sizes}
          style={estilo}
          className={`${TRANSICAO} pointer-events-none hidden scale-[1.035] opacity-0 group-hover:scale-100 group-hover:opacity-100 [@media(hover:hover)]:block`}
        />
      )}

      {/* Pontinhos do carrossel (só no toque). */}
      {varias && (
        <div className="pointer-events-none absolute bottom-2.5 left-2.5 flex items-center gap-[5px] rounded-full bg-[#EDE7D9]/85 px-2 py-[7px] backdrop-blur-sm [@media(hover:hover)]:hidden">
          {fotos.map((f, i) => (
            <span
              key={f}
              className={`block h-[5px] rounded-full transition-all duration-300 motion-reduce:transition-none ${
                i === ativa ? "w-3 bg-[#1B4965]" : "w-[5px] bg-[#1B4965]/35"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
