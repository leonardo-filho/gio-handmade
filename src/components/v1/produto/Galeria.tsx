"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Foto from "@/components/v3/loja/Foto";
import { IconeVerDePerto } from "../icones";
import LupaQuadro from "./LupaQuadro";
import VerDePerto from "./VerDePerto";
import { pontoNaFoto, type Ponto } from "./perto";

type Props = { fotos: string[]; nome: string; prontaEntrega?: boolean };

// Foto principal: 100% no celular, metade da tela no tablet e até 744 px no
// computador (ao lado das miniaturas).
const SIZES = "(min-width: 1440px) 744px, (min-width: 1024px) 55vw, (min-width: 768px) 50vw, 100vw";

// Computador com mouse: a lupa abre dentro da moldura. O resto (celular,
// tablet, toque): a tela cheia.
const LUPA_NA_MOLDURA = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";

// Galeria da peça no modelo da AL.TER, com o "Ver de perto":
//   celular e tablet: trilho de borda a borda, troca com o dedo, pontos;
//            tocar na foto abre a tela cheia já aproximada onde o dedo tocou;
//   computador: miniaturas 96x128 em coluna, foto 3:4 com fade de 0,3 s;
//            clicar na foto aproxima ali mesmo e a lupa segue o mouse.
// O botão "Ver de perto" no canto da foto faz o mesmo para quem não sabe que
// a foto é clicável (no computador, no alto da foto, que é mais alta que a
// tela; com a lupa aberta, o mapa da lupa fica no lugar dele).
export default function Galeria({ fotos, nome, prontaEntrega }: Props) {
  const [indice, setIndice] = useState(0);
  const [lupa, setLupa] = useState<Ponto | null>(null);
  const [perto, setPerto] = useState<{ indice: number; foco: Ponto } | null>(null);
  const trilhoRef = useRef<HTMLDivElement>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);
  const total = fotos.length;

  function aoRolar() {
    const trilho = trilhoRef.current;
    if (!trilho || trilho.clientWidth === 0) return;
    const i = Math.round(trilho.scrollLeft / trilho.clientWidth);
    if (i !== indice) setIndice(i);
  }

  /** Abre o "Ver de perto" na foto i. toque: ponto da moldura (0 a 1) ou null (centro). */
  function abrir(i: number, toque: Ponto | null) {
    if (window.matchMedia(LUPA_NA_MOLDURA).matches) {
      setLupa(toque ?? { x: 0.5, y: 0.45 });
      return;
    }
    const moldura = trilhoRef.current?.children[i] as HTMLElement | undefined;
    const img = moldura?.querySelector("img");
    const foco =
      moldura && img && img.naturalWidth
        ? pontoNaFoto(
            toque ?? { x: 0.5, y: 0.45 },
            { w: moldura.clientWidth, h: moldura.clientHeight },
            { w: img.naturalWidth, h: img.naturalHeight }
          )
        : { x: 0.5, y: 0.42 };
    setPerto({ indice: i, foco });
  }

  // Fechou pelo teclado (Esc): o foco volta para o botão "Ver de perto".
  function sairDaLupa() {
    const peloTeclado = document.activeElement?.closest("[data-lupa]") != null;
    setLupa(null);
    if (peloTeclado) requestAnimationFrame(() => botaoRef.current?.focus({ preventScroll: true }));
  }

  // Volta da tela cheia na foto em que a pessoa parou, com o foco nela.
  function fecharPerto(i: number) {
    setPerto(null);
    setIndice(i);
    const trilho = trilhoRef.current;
    if (!trilho) return;
    if (trilho.scrollWidth > trilho.clientWidth) trilho.scrollTo({ left: i * trilho.clientWidth, behavior: "auto" });
    requestAnimationFrame(() => (trilho.children[i] as HTMLElement | undefined)?.focus({ preventScroll: true }));
  }

  return (
    <div className="md:flex md:min-w-0 md:flex-1 md:items-start md:gap-3">
      {/* Miniaturas: só no computador, onde trocam a foto da moldura. */}
      <ul aria-label="Fotos da peça" className="hidden w-24 shrink-0 flex-col gap-3 lg:flex">
        {fotos.map((f, i) => (
          <li key={f}>
            <button
              type="button"
              onClick={() => {
                setLupa(null);
                setIndice(i);
              }}
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
                onClick={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  // detail 0: Enter ou espaço (sem ponto), abre no centro.
                  const toque = e.detail === 0 ? null : { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
                  abrir(i, toque);
                }}
                tabIndex={atual ? 0 : -1}
                aria-hidden={atual ? undefined : true}
                aria-label={total > 1 ? `Ver de perto a foto ${i + 1} de ${total}` : "Ver de perto"}
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

          {lupa && <LupaQuadro key={fotos[indice]} src={fotos[indice]} inicio={lupa} aoSair={sairDaLupa} />}
        </div>

        {prontaEntrega && (
          <span className="pointer-events-none absolute bottom-3 left-3 z-[4] rounded bg-[#EDE7D9] px-2 py-1 text-[10px] uppercase leading-3 tracking-[0.12em] text-brand-gold-text">
            Pronta entrega
          </span>
        )}

        {total > 1 && (
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-[18px] left-1/2 z-[2] flex -translate-x-1/2 gap-1.5 rounded-full bg-[#EDE7D9]/85 px-2 py-1.5 lg:hidden"
          >
            {fotos.map((f, i) => (
              <span key={f} className={`block h-1.5 w-1.5 rounded-full ${i === indice ? "bg-[#1B4965]" : "bg-[#1B4965]/30"}`} />
            ))}
          </div>
        )}

        {/* Ver de perto: pílula creme no canto, 44 px de toque. */}
        <button
          ref={botaoRef}
          type="button"
          onClick={() => (lupa ? sairDaLupa() : abrir(indice, null))}
          aria-pressed={lupa ? true : undefined}
          className={`group absolute bottom-1.5 right-1.5 z-[4] flex h-11 items-center px-1.5 focus-visible:outline-none lg:bottom-auto lg:top-1.5 ${lupa ? "lg:hidden" : ""}`}
        >
          <span className="flex h-8 items-center gap-1.5 rounded-full bg-[#EDE7D9] pl-2.5 pr-3 text-[10px] uppercase leading-none tracking-[0.14em] text-[#1B4965] shadow-[0_1px_3px_rgb(19_2_9/0.18)] transition-opacity duration-200 group-hover:opacity-80 group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-[#b8902a] motion-reduce:transition-none">
            <IconeVerDePerto className="h-4 w-4" />
            Ver de perto
          </span>
        </button>
      </div>

      {perto && <VerDePerto fotos={fotos} nome={nome} inicial={perto.indice} foco={perto.foco} onFechar={fecharPerto} />}
    </div>
  );
}
