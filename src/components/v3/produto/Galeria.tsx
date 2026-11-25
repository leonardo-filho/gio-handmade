"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Foto from "../loja/Foto";
import Lightbox from "./Lightbox";

type Props = { fotos: string[]; nome: string; prontaEntrega?: boolean };

// Foto principal: 100% no celular, metade da tela no tablet e até 744 px no
// desktop (ao lado das miniaturas).
const SIZES = "(min-width: 1440px) 744px, (min-width: 1024px) 55vw, (min-width: 768px) 50vw, 100vw";

// Galeria da página da peça. É uma lista só de fotos que muda de forma:
//   celular e tablet: trilho (390x520 no celular, de borda a borda), troca
//            com o dedo e encaixe nativo, pontos sobre a foto, sem miniaturas;
//   desktop: as fotos empilhadas numa moldura 3:4, a atual por cima com fade
//            de 0,3 s, e as miniaturas 96x128 em coluna à esquerda.
// Tocar ou clicar na foto abre a lightbox escura.
export default function Galeria({ fotos, nome, prontaEntrega }: Props) {
  const [indice, setIndice] = useState(0);
  const [aberta, setAberta] = useState<number | null>(null);
  const trilhoRef = useRef<HTMLDivElement>(null);
  const total = fotos.length;

  // Celular: a foto atual é a que o trilho mostra.
  function aoRolar() {
    const trilho = trilhoRef.current;
    if (!trilho || trilho.clientWidth === 0) return;
    const i = Math.round(trilho.scrollLeft / trilho.clientWidth);
    if (i !== indice) setIndice(i);
  }

  // Volta da lightbox na foto em que a pessoa parou, com o foco nela.
  function fecharLightbox(i: number) {
    setAberta(null);
    setIndice(i);
    const trilho = trilhoRef.current;
    if (!trilho) return;
    if (trilho.scrollWidth > trilho.clientWidth) trilho.scrollTo({ left: i * trilho.clientWidth, behavior: "auto" });
    requestAnimationFrame(() => (trilho.children[i] as HTMLElement | undefined)?.focus({ preventScroll: true }));
  }

  return (
    <div className="md:flex md:min-w-0 md:flex-1 md:items-start md:gap-3">
      {/* Miniaturas: só no desktop, onde trocam a foto da moldura. */}
      <ul aria-label="Fotos da peça" className="hidden w-24 shrink-0 flex-col gap-3 lg:flex">
        {fotos.map((f, i) => (
          <li key={f}>
            <button
              type="button"
              onClick={() => setIndice(i)}
              aria-label={`Ver foto ${i + 1} de ${total}`}
              aria-current={i === indice || undefined}
              className={`relative block h-32 w-24 overflow-hidden border bg-[#1B4965]/5 transition-opacity duration-200 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b8902a] motion-reduce:transition-none ${
                i === indice ? "border-[#1B4965]" : "border-transparent"
              }`}
            >
              <Image src={f} alt="" fill sizes="96px" className="object-cover object-[50%_40%]" />
            </button>
          </li>
        ))}
      </ul>

      <div className="relative min-w-0 md:flex-1 lg:max-w-[744px]">
        <div
          ref={trilhoRef}
          onScroll={aoRolar}
          className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] lg:relative lg:block lg:aspect-[3/4] lg:snap-none lg:overflow-hidden [&::-webkit-scrollbar]:hidden"
        >
          {fotos.map((f, i) => {
            const atual = i === indice;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setAberta(i)}
                tabIndex={atual ? 0 : -1}
                aria-hidden={atual ? undefined : true}
                aria-label={total > 1 ? `Ampliar foto ${i + 1} de ${total}` : "Ampliar foto"}
                className={`relative block aspect-[3/4] w-full shrink-0 snap-center snap-always cursor-zoom-in bg-[#1B4965]/5 outline-offset-[-3px] focus-visible:outline-2 focus-visible:outline-[#b8902a] lg:absolute lg:inset-0 lg:aspect-auto motion-safe:lg:transition-opacity motion-safe:lg:duration-300 ${
                  atual ? "lg:z-[1] lg:opacity-100" : "lg:pointer-events-none lg:opacity-0"
                }`}
              >
                <Foto
                  src={f}
                  alt={i === 0 ? nome : `${nome}, foto ${i + 1}`}
                  fill
                  sizes={SIZES}
                  prioridade={i === 0}
                  className="object-cover object-[50%_40%]"
                />
              </button>
            );
          })}
        </div>

        {prontaEntrega && (
          <span className="pointer-events-none absolute bottom-3 left-3 z-[2] rounded bg-[#EDE7D9] px-2 py-1 text-[10px] uppercase leading-3 tracking-[0.12em] text-brand-gold-text">
            Pronta entrega
          </span>
        )}

        {total > 1 && (
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-3 left-1/2 z-[2] flex -translate-x-1/2 gap-1.5 rounded-full bg-[#EDE7D9]/85 px-2 py-1.5"
          >
            {fotos.map((f, i) => (
              <span
                key={f}
                className={`block h-1.5 w-1.5 rounded-full ${i === indice ? "bg-[#1B4965]" : "bg-[#1B4965]/30"}`}
              />
            ))}
          </div>
        )}
      </div>

      {aberta !== null && <Lightbox fotos={fotos} nome={nome} inicial={aberta} onFechar={fecharLightbox} />}
    </div>
  );
}
