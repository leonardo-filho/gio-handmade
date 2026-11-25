"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import Image from "next/image";
import type { Produto } from "@/data/produtos";
import Foto from "../loja/Foto";
import { FOCO, HOVER } from "../estrutura/estilo";
import Lightbox from "./Lightbox";
import MesaDeLuz from "./MesaDeLuz";

const Estudio3DMaya = dynamic(() => import("./Estudio3DMaya"), {
  ssr: false,
  loading: () => (
    <div className="flex aspect-[3/4] w-full items-center justify-center bg-[#EDE7D9] text-[12px] uppercase tracking-[0.14em] text-brand-muted">
      Preparando estúdio 3D...
    </div>
  ),
});

type ModoGaleria = "fotos" | "lente" | "3d";

type Props = {
  fotos: string[];
  nome: string;
  prontaEntrega?: boolean;
  produto?: Produto;
};

const SIZES = "(min-width: 1440px) 744px, (min-width: 1024px) 55vw, (min-width: 768px) 50vw, 100vw";

// Galeria da pagina da peca com barra segmentada compacta numa linha so
// (Fotos · Lente macro · Relevo 3D), sem quebrar em duas linhas no celular 390px.
export default function Galeria({ fotos, nome, prontaEntrega, produto }: Props) {
  const [indice, setIndice] = useState(0);
  const [aberta, setAberta] = useState<number | null>(null);
  const [modo, setModo] = useState<ModoGaleria>("fotos");
  const trilhoRef = useRef<HTMLDivElement>(null);
  const total = fotos.length;
  const tem3D = produto?.id === "top-maya" || nome.toLowerCase() === "top maya";

  const produtoReal: Produto = produto ?? {
    id: tem3D ? "top-maya" : "peca",
    nome,
    detalhes: "Bordado à mão, um a um.",
    preco: 0,
    foto: fotos[0] ?? "",
    categoria: "Tops",
    prontaEntrega,
  };

  function aoRolar() {
    const trilho = trilhoRef.current;
    if (!trilho || trilho.clientWidth === 0) return;
    const i = Math.round(trilho.scrollLeft / trilho.clientWidth);
    if (i !== indice) setIndice(i);
  }

  // Ao voltar para as fotos (da lente ou do 3D), o trilho do celular nasce na
  // 1a foto; aqui ele vai para a foto que estava sendo vista na lente.
  function mudarModo(novo: ModoGaleria) {
    setModo(novo);
    if (novo !== "fotos") return;
    requestAnimationFrame(() => {
      const trilho = trilhoRef.current;
      if (trilho && trilho.scrollWidth > trilho.clientWidth) {
        trilho.scrollTo({ left: indice * trilho.clientWidth, behavior: "auto" });
      }
    });
  }

  function escolherFoto(i: number) {
    setIndice(i);
    if (modo === "3d") setModo("fotos");
    const trilho = trilhoRef.current;
    if (trilho && trilho.scrollWidth > trilho.clientWidth) {
      trilho.scrollTo({ left: i * trilho.clientWidth, behavior: "auto" });
    }
  }

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
      {/* Miniaturas: so no desktop, onde trocam a foto da moldura. */}
      <ul aria-label="Fotos da peça" className="hidden w-24 shrink-0 flex-col gap-3 lg:flex">
        {fotos.map((f, i) => (
          <li key={f}>
            <button
              type="button"
              onClick={() => escolherFoto(i)}
              aria-label={`Ver foto ${i + 1} de ${total}`}
              aria-current={i === indice && modo !== "3d" ? true : undefined}
              className={`relative block h-32 w-24 overflow-hidden border bg-[#1B4965]/5 transition-opacity duration-200 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b8902a] motion-reduce:transition-none ${
                i === indice && modo !== "3d" ? "border-[#1B4965]" : "border-transparent"
              }`}
            >
              <Image src={f} alt="" fill sizes="96px" className="object-cover object-[50%_40%]" />
            </button>
          </li>
        ))}
      </ul>

      <div className="relative min-w-0 md:flex-1 lg:max-w-[744px]">
        {/* Controle segmentado compacto: cabe sempre em 1 linha nos 390px do celular */}
        <div
          role="tablist"
          aria-label="Modo de visualização da peça"
          className="flex h-12 items-center justify-between gap-1.5 border-b border-[#1B4965]/15 bg-[#EDE7D9] px-3"
        >
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <button
              type="button"
              role="tab"
              aria-selected={modo === "fotos"}
              onClick={() => mudarModo("fotos")}
              className={`relative flex h-9 shrink-0 items-center after:absolute after:inset-x-0 after:-inset-y-1 after:content-[''] justify-center whitespace-nowrap rounded-[4px] border px-2.5 text-[11px] uppercase tracking-[0.11em] ${FOCO} ${
                modo === "fotos"
                  ? "border-[#1B4965] bg-[#1B4965] text-[#EDE7D9]"
                  : `border-[#1B4965]/35 text-[#1B4965] ${HOVER}`
              }`}
            >
              Fotos ({total})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={modo === "lente"}
              onClick={() => mudarModo(modo === "lente" ? "fotos" : "lente")}
              className={`relative flex h-9 shrink-0 items-center after:absolute after:inset-x-0 after:-inset-y-1 after:content-[''] justify-center gap-1.5 whitespace-nowrap rounded-[4px] border px-2.5 text-[11px] uppercase tracking-[0.11em] ${FOCO} ${
                modo === "lente"
                  ? "border-[#1B4965] bg-[#1B4965] text-[#EDE7D9]"
                  : `border-[#1B4965]/35 bg-[#C8E1E4]/45 text-[#1B4965] ${HOVER}`
              }`}
            >
              <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
              Lente & luz
            </button>
            {tem3D && (
              <button
                type="button"
                role="tab"
                aria-selected={modo === "3d"}
                onClick={() => mudarModo(modo === "3d" ? "fotos" : "3d")}
                className={`relative flex h-9 shrink-0 items-center after:absolute after:inset-x-0 after:-inset-y-1 after:content-[''] justify-center whitespace-nowrap rounded-[4px] border px-2.5 text-[11px] uppercase tracking-[0.11em] ${FOCO} ${
                  modo === "3d"
                    ? "border-[#1B4965] bg-[#1B4965] text-[#EDE7D9]"
                    : `border-[#1B4965] bg-[#C8E1E4] text-[#1B4965] ${HOVER}`
                }`}
              >
                Relevo 3D
              </button>
            )}
          </div>
        </div>

        {modo === "lente" ? (
          <MesaDeLuz
            produto={produtoReal}
            fotos={fotos}
            indiceFoto={indice}
            aoMudarFoto={(i) => setIndice(i)}
          />
        ) : modo === "3d" && tem3D ? (
          <Estudio3DMaya />
        ) : (
          <div className="relative">
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
        )}
      </div>

      {aberta !== null && <Lightbox fotos={fotos} nome={nome} inicial={aberta} onFechar={fecharLightbox} />}
    </div>
  );
}
