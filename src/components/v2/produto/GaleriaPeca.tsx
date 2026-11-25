"use client";

import { useRef, useState } from "react";
import Foto from "@/components/v3/loja/Foto";
import FotoSuave from "@/components/v3/estrutura/FotoSuave";
import Visor from "./Visor";

// A primeira foto carrega na hora e sem fade. A segunda também carrega já
// (no tablet ela aparece ao lado da primeira; no computador é a próxima da
// rolagem), com o fade de sempre. As outras ficam preguiçosas.
function FotoDaGaleria({ src, alt, sizes, i }: { src: string; alt: string; sizes: string; i: number }) {
  const comum = { src, alt, fill: true, sizes, className: "object-cover object-[50%_40%]" } as const;
  if (i === 1) return <FotoSuave {...comum} loading="eager" />;
  return <Foto {...comum} prioridade={i === 0} />;
}

type Props = { fotos: string[]; nome: string; prontaEntrega?: boolean };

// Galeria editorial da página da peça (versão 2): foto grande, uma por tela,
// legenda mínima.
//   Celular: trilho de borda a borda com fotos altas (a tela quase toda,
//            deixando nome e preço à vista), troca com o dedo, "1 / 5".
//   Tablet: duas fotos 3:4 por vez no mesmo trilho.
//   Computador: as fotos uma embaixo da outra, cada uma da altura da tela,
//            centradas no creme, com o número embaixo; a coluna de compra
//            acompanha ao lado.
// Tocar numa foto abre o visor em tela cheia, também uma por tela.
export default function GaleriaPeca({ fotos, nome, prontaEntrega }: Props) {
  const [indice, setIndice] = useState(0);
  const [aberta, setAberta] = useState<number | null>(null);
  const trilhoRef = useRef<HTMLDivElement>(null);
  const total = fotos.length;

  function aoRolar() {
    const trilho = trilhoRef.current;
    const primeira = trilho?.firstElementChild as HTMLElement | null;
    if (!trilho || !primeira || primeira.clientWidth === 0) return;
    const i = Math.round(trilho.scrollLeft / primeira.clientWidth);
    if (i !== indice) setIndice(i);
  }

  function fecharVisor(i: number) {
    setAberta(null);
    const trilho = trilhoRef.current;
    const primeira = trilho?.firstElementChild as HTMLElement | null;
    if (trilho && primeira && trilho.scrollWidth > trilho.clientWidth) {
      trilho.scrollTo({ left: i * primeira.clientWidth, behavior: "auto" });
      setIndice(i);
    }
  }

  const selo = prontaEntrega && (
    <span className="pointer-events-none absolute bottom-3 left-3 z-[2] rounded bg-[#EDE7D9] px-2 py-1 text-[10px] uppercase leading-3 tracking-[0.12em] text-brand-gold-text">
      Pronta entrega
    </span>
  );

  return (
    <>
      {/* Celular e tablet: trilho com encaixe nativo. */}
      <div className="relative lg:hidden">
        <div
          ref={trilhoRef}
          onScroll={aoRolar}
          className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {fotos.map((f, i) => (
            <button
              key={f}
              type="button"
              onClick={() => setAberta(i)}
              aria-label={total > 1 ? `Ver foto ${i + 1} de ${total} em tela cheia` : "Ver foto em tela cheia"}
              className="relative block h-[clamp(440px,calc(100svh_-_236px),155vw)] w-full shrink-0 snap-start snap-always bg-[#1B4965]/5 outline-offset-[-3px] focus-visible:outline-2 focus-visible:outline-[#b8902a] md:h-auto md:aspect-[3/4] md:w-1/2"
            >
              <FotoDaGaleria src={f} alt={i === 0 ? nome : `${nome}, foto ${i + 1}`} sizes="(min-width: 768px) 50vw, 100vw" i={i} />
            </button>
          ))}
        </div>
        {selo}
        {total > 1 && (
          <p
            aria-hidden
            className="nums-preco pointer-events-none absolute bottom-3 right-3 z-[2] rounded-full bg-[#EDE7D9]/90 px-2.5 py-1 text-[11px] leading-4 tracking-[0.12em] text-[#1B4965] md:hidden"
          >
            {indice + 1} / {total}
          </p>
        )}
      </div>

      {/* Computador: uma foto por tela, uma embaixo da outra. */}
      <ol aria-label="Fotos da peça" className="hidden lg:block">
        {fotos.map((f, i) => (
          <li key={f} className="flex flex-col items-center pb-10 first:pt-6">
            <button
              type="button"
              onClick={() => setAberta(i)}
              aria-label={`Ver foto ${i + 1} de ${total} em tela cheia`}
              className="relative block aspect-[3/4] h-[calc(100vh_-_76px_-_72px)] max-h-[1040px] min-h-[520px] cursor-zoom-in bg-[#1B4965]/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b8902a]"
            >
              <FotoDaGaleria src={f} alt={i === 0 ? nome : `${nome}, foto ${i + 1}`} sizes="(min-width: 1024px) 45vw, 1px" i={i} />
              {i === 0 && selo}
            </button>
            <p aria-hidden className="nums-preco mt-3 text-[11px] leading-4 tracking-[0.14em] text-brand-muted">
              {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </p>
          </li>
        ))}
      </ol>

      {aberta !== null && <Visor fotos={fotos} nome={nome} inicial={aberta} aoFechar={fecharVisor} />}
    </>
  );
}
