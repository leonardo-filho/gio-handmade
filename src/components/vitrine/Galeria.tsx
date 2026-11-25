"use client";

import { useRef, useState, type RefObject } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { EASE, movimentoReduzido } from "./movimento";
import s from "./vitrine.module.css";

export const ZOOM = 2.6;
const LENTE = 230;

export type Zoom = {
  indice: number;
  /** Caixa da foto desenhada (contain) dentro do quadro, em px. */
  left: number;
  top: number;
  w: number;
  h: number;
  /** Deslocamento inicial (o ponto tocado fica sob o dedo). */
  x: number;
  y: number;
  /** Limites do arrasto. */
  lx: number;
  ly: number;
};

type Props = {
  fotos: string[];
  nome: string;
  desktop: boolean;
  indice: number;
  indiceInicial: number;
  onIndice: (i: number) => void;
  quadroRef: RefObject<HTMLDivElement | null>;
  trilhoRef: RefObject<HTMLDivElement | null>;
  proporcoes: RefObject<Record<string, number>>;
  zoom: Zoom | null;
  onZoom: (z: Zoom | null) => void;
  className?: string;
};

const limitar = (v: number, l: number) => Math.min(l, Math.max(-l, v));

/** Caixa em que a foto i aparece inteira (contain) dentro do quadro. */
export function caixaDaFoto(quadro: HTMLElement, proporcao: number) {
  const W = quadro.clientWidth;
  const H = quadro.clientHeight;
  let w = W;
  let h = W / proporcao;
  if (h > H) {
    h = H;
    w = H * proporcao;
  }
  return { left: (W - w) / 2, top: (H - h) / 2, w, h, W, H };
}

// Galeria da peça: as fotos inteiras (sem corte) sobre um fundo feito da
// própria foto desfocada, num trilho com encaixe (arrasto no celular, setas e
// teclado no desktop). A lupa: no celular, tocar na foto (ou em "Ver de
// perto") aproxima 2,6x no ponto tocado e o arrasto passeia pelo bordado; no
// desktop, uma lente redonda segue o mouse.
export default function Galeria({
  fotos,
  nome,
  desktop,
  indice,
  indiceInicial,
  onIndice,
  quadroRef,
  trilhoRef,
  proporcoes,
  zoom,
  onZoom,
  className = "",
}: Props) {
  const [lenteLigada, setLenteLigada] = useState(false);
  const [lenteUsada, setLenteUsada] = useState(false);
  const lenteRef = useRef<HTMLDivElement>(null);
  const lenteDentroRef = useRef<HTMLDivElement>(null);
  const fimArrasto = useRef(0);

  function irPara(i: number) {
    const trilho = trilhoRef.current;
    if (!trilho) return;
    const alvo = Math.max(0, Math.min(fotos.length - 1, i));
    trilho.scrollTo({ left: alvo * trilho.clientWidth, behavior: movimentoReduzido() ? "auto" : "smooth" });
  }

  function aoRolar() {
    const trilho = trilhoRef.current;
    if (!trilho || trilho.clientWidth === 0) return;
    const i = Math.round(trilho.scrollLeft / trilho.clientWidth);
    if (i !== indice) onIndice(i);
  }

  function entrarZoom(i: number, px?: number, py?: number) {
    const quadro = quadroRef.current;
    if (!quadro) return;
    const c = caixaDaFoto(quadro, proporcoes.current[fotos[i]] ?? 0.75);
    const lx = Math.max(0, (c.w * ZOOM - c.W) / 2);
    const ly = Math.max(0, (c.h * ZOOM - c.H) / 2);
    const x = px === undefined ? 0 : limitar(-(px - c.W / 2) * (ZOOM - 1), lx);
    const y = py === undefined ? 0 : limitar(-(py - c.H / 2) * (ZOOM - 1), ly);
    onZoom({ indice: i, left: c.left, top: c.top, w: c.w, h: c.h, x, y, lx, ly });
  }

  function tocarFoto(e: React.MouseEvent, i: number) {
    if (desktop) return;
    const r = quadroRef.current?.getBoundingClientRect();
    if (!r) return;
    entrarZoom(i, e.clientX - r.left, e.clientY - r.top);
  }

  // Lente do desktop: escreve direto no estilo, sem render por movimento.
  function moverLente(e: React.PointerEvent) {
    if (!desktop || e.pointerType !== "mouse") return;
    if (!lenteLigada) {
      setLenteLigada(true);
      return;
    }
    const quadro = quadroRef.current;
    const lente = lenteRef.current;
    const dentro = lenteDentroRef.current;
    if (!quadro || !lente || !dentro) return;
    const r = quadro.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    const c = caixaDaFoto(quadro, proporcoes.current[fotos[indice]] ?? 0.75);
    const sobreBotao = (e.target as Element).closest("button");
    const dentroDaFoto = !sobreBotao && px >= c.left && px <= c.left + c.w && py >= c.top && py <= c.top + c.h;
    lente.style.opacity = dentroDaFoto ? "1" : "0";
    lente.style.transform = `translate3d(${px - LENTE / 2}px, ${py - LENTE / 2}px, 0) scale(${dentroDaFoto ? 1 : 0.86})`;
    dentro.style.width = `${c.w * ZOOM}px`;
    dentro.style.height = `${c.h * ZOOM}px`;
    dentro.style.transform = `translate3d(${LENTE / 2 - (px - c.left) * ZOOM}px, ${LENTE / 2 - (py - c.top) * ZOOM}px, 0)`;
    if (dentroDaFoto && !lenteUsada) setLenteUsada(true);
  }

  function sairLente() {
    if (lenteRef.current) lenteRef.current.style.opacity = "0";
  }

  const total = fotos.length;

  return (
    <div
      ref={quadroRef}
      onPointerMove={moverLente}
      onPointerLeave={sairLente}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") irPara(indice + 1);
        if (e.key === "ArrowLeft") irPara(indice - 1);
      }}
      className={`relative overflow-hidden bg-[#ddd5c3] ${desktop && lenteLigada ? "cursor-none" : ""} ${className}`}
    >
      <div
        ref={trilhoRef}
        onScroll={aoRolar}
        className={`flex h-full snap-x snap-mandatory overscroll-x-contain ${zoom ? "overflow-hidden" : "overflow-x-auto"} ${s.semBarra}`}
      >
        {fotos.map((f, i) => {
          const perto = Math.abs(i - indice) <= 1;
          return (
            <div
              key={f}
              data-slide
              onClick={(e) => tocarFoto(e, i)}
              className={`relative h-full w-full shrink-0 snap-center snap-always overflow-hidden ${desktop ? "" : "cursor-zoom-in"}`}
            >
              {perto && (
                <Image
                  src={f}
                  alt=""
                  aria-hidden
                  fill
                  sizes="64px"
                  className="scale-125 object-cover opacity-75 blur-2xl"
                />
              )}
              <Image
                data-principal
                src={f}
                alt={total > 1 ? `${nome}, foto ${i + 1} de ${total}` : nome}
                fill
                draggable={false}
                sizes={desktop ? "(min-width: 1400px) 640px, 46vw" : "(min-width: 680px) 680px, 100vw"}
                loading={i === indiceInicial ? "eager" : "lazy"}
                onLoad={(e) => {
                  const img = e.currentTarget;
                  if (img.naturalHeight > 0) proporcoes.current[f] = img.naturalWidth / img.naturalHeight;
                }}
                className="object-contain"
              />
            </div>
          );
        })}
      </div>

      {/* Véu escuro no alto da foto: as barrinhas e a alça da folha ficam
          legíveis também sobre foto de estúdio branca. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-[#130209]/45 via-[#130209]/15 to-transparent"
      />

      {/* Fotos em barrinhas, como nos stories. */}
      {total > 1 && (
        <div aria-hidden className="pointer-events-none absolute inset-x-4 top-5 z-10 flex gap-1 lg:top-4">
          {fotos.map((f, i) => (
            <span
              key={f}
              className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-white/45 shadow-[0_0_3px_rgba(19,2,9,0.35)]"
            >
              <span
                className={`absolute inset-0 origin-left rounded-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  i <= indice ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </span>
          ))}
        </div>
      )}

      {/* Celular: o convite da lupa. Desktop: a dica até o primeiro uso. */}
      {!desktop && !zoom && (
        <button
          type="button"
          onClick={() => entrarZoom(indice)}
          className="absolute bottom-3 left-3 z-10 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-[#130209]/55 px-4 text-[12px] font-medium tracking-[0.04em] text-[#EDE7D9] backdrop-blur-md transition-transform duration-150 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7D9]"
        >
          <IconeLupa className="h-4 w-4" />
          Ver de perto
        </button>
      )}
      {desktop && (
        <p
          aria-hidden
          className={`pointer-events-none absolute bottom-4 left-4 z-10 inline-flex items-center gap-2 rounded-full bg-[#130209]/55 px-3.5 py-2 text-[12px] text-[#EDE7D9] backdrop-blur-md transition-opacity duration-500 ${
            lenteUsada ? "opacity-0" : "opacity-100"
          }`}
        >
          <IconeLupa className="h-3.5 w-3.5" />
          Passe o mouse para ver o bordado de perto
        </p>
      )}

      {total > 1 && (
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-4 right-4 z-10 rounded-full bg-[#130209]/45 px-2.5 py-1 text-[11px] tabular-nums tracking-[0.08em] text-[#EDE7D9] backdrop-blur-md"
        >
          {indice + 1} / {total}
        </span>
      )}

      {/* Desktop: setas. */}
      {desktop && total > 1 && (
        <>
          <Seta lado="esq" desativada={indice === 0} onClick={() => irPara(indice - 1)} />
          <Seta lado="dir" desativada={indice === total - 1} onClick={() => irPara(indice + 1)} />
        </>
      )}

      {/* Lente do desktop (monta no primeiro movimento do mouse). */}
      {desktop && lenteLigada && (
        <div
          ref={lenteRef}
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-20 overflow-hidden rounded-full opacity-0 transition-[opacity,scale] duration-200"
          style={{
            width: LENTE,
            height: LENTE,
            boxShadow:
              "0 0 0 1.5px rgba(184,144,42,0.95), 0 0 0 6px rgba(237,231,217,0.95), 0 0 0 7px rgba(27,73,101,0.3), 0 26px 50px -12px rgba(19,2,9,0.55)",
          }}
        >
          <div ref={lenteDentroRef} className="absolute left-0 top-0 bg-white">
            <Image src={fotos[indice]} alt="" fill sizes="1400px" className="object-contain" />
          </div>
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 32% 26%, rgba(255,255,255,0.26), rgba(255,255,255,0) 42%), radial-gradient(circle, rgba(0,0,0,0) 64%, rgba(19,2,9,0.2) 100%)",
            }}
          />
        </div>
      )}

      {/* Celular: a foto aproximada, que o dedo arrasta. */}
      <AnimatePresence>
        {zoom && (
          <motion.div
            key="zoom"
            className="absolute inset-0 z-20 overflow-hidden bg-[#f3eee3]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.25, delay: 0.15 } }}
            transition={{ duration: 0.15 }}
          >
            <motion.div
              className="absolute cursor-grab touch-none active:cursor-grabbing"
              style={{ left: zoom.left, top: zoom.top, width: zoom.w, height: zoom.h }}
              initial={{ scale: 1, x: 0, y: 0 }}
              animate={{ scale: ZOOM, x: zoom.x, y: zoom.y }}
              exit={{ scale: 1, x: 0, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              drag
              dragConstraints={{ left: -zoom.lx, right: zoom.lx, top: -zoom.ly, bottom: zoom.ly }}
              dragElastic={0.06}
              onDragEnd={() => {
                fimArrasto.current = performance.now();
              }}
              onTap={() => {
                if (performance.now() - fimArrasto.current < 120) return;
                onZoom(null);
              }}
            >
              <Image src={fotos[zoom.indice]} alt="" fill sizes="100vw" className="object-contain" />
              <Image src={fotos[zoom.indice]} alt="" fill sizes="280vw" className="object-contain" />
            </motion.div>
            <button
              type="button"
              onClick={() => onZoom(null)}
              className="absolute bottom-3 left-3 z-10 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-[#1B4965] px-4 text-[12px] font-medium tracking-[0.04em] text-[#EDE7D9] shadow-lg transition-transform duration-150 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE7D9]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
                <path strokeLinecap="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
              Fechar o zoom
            </button>
            <p aria-hidden className="pointer-events-none absolute bottom-4 right-4 rounded-full bg-[#130209]/45 px-3 py-1.5 text-[11px] text-[#EDE7D9] backdrop-blur-md">
              Arraste para explorar
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Seta({ lado, desativada, onClick }: { lado: "esq" | "dir"; desativada: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={desativada}
      aria-label={lado === "esq" ? "Foto anterior" : "Próxima foto"}
      className={`absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#EDE7D9]/90 text-[#1B4965] shadow-md backdrop-blur-md transition-[opacity,transform,background-color] duration-200 hover:scale-105 hover:bg-white active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] disabled:pointer-events-none disabled:opacity-0 ${
        lado === "esq" ? "left-4" : "right-4"
      }`}
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d={lado === "esq" ? "m14.5 6-6 6 6 6" : "m9.5 6 6 6-6 6"} />
      </svg>
    </button>
  );
}

export function IconeLupa({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path strokeLinecap="round" d="m15.4 15.4 5.1 5.1" />
      <path strokeLinecap="round" d="M10.5 8v5M8 10.5h5" />
    </svg>
  );
}
