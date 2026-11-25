"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { EASE_ATELIER } from "./animacoes";
import { useReduzirMovimento } from "./useReduzirMovimento";

const ZOOM = 2.6;
const LENTE_DESKTOP = 188;
const LENTE_TOQUE = 148;

type Props = {
  fotos: string[];
  fotoAtiva: number;
  onTrocarFoto: (indice: number) => void;
  nome: string;
};

type Medida = { w: number; h: number };

export default function LupaBordado({
  fotos,
  fotoAtiva,
  onTrocarFoto,
  nome,
}: Props) {
  const reduzir = useReduzirMovimento();
  const caixaRef = useRef<HTMLDivElement>(null);
  const lenteRef = useRef<HTMLDivElement>(null);
  const dentroRef = useRef<HTMLDivElement>(null);
  const arrastoSwipeRef = useRef<{ x: number; y: number } | null>(null);

  const [lupaAtiva, setLupaAtiva] = useState(false);
  const [modoToque, setModoToque] = useState(false);
  const [medida, setMedida] = useState<Medida | null>(null);
  const [moveuLupa, setMoveuLupa] = useState(false);

  const posRef = useRef<{ x: number; y: number; toque: boolean }>({ x: 0, y: 0, toque: false });
  const ultimoToqueRef = useRef(false);
  const diametro = modoToque ? LENTE_TOQUE : LENTE_DESKTOP;

  const posicionarLente = useCallback((x: number, y: number, toque: boolean) => {
    const caixa = caixaRef.current;
    if (!caixa) return;
    const w = caixa.clientWidth;
    const h = caixa.clientHeight;
    const px = Math.min(w, Math.max(0, x));
    const py = Math.min(h, Math.max(0, y));
    posRef.current = { x: px, y: py, toque };

    const d = toque ? LENTE_TOQUE : LENTE_DESKTOP;
    const cy = toque ? Math.max(d * 0.45, py - d * 0.72) : py;

    const lente = lenteRef.current;
    const dentro = dentroRef.current;
    if (lente) {
      lente.style.transform = `translate3d(${px - d / 2}px, ${cy - d / 2}px, 0)`;
    }
    if (dentro) {
      dentro.style.width = `${w * ZOOM}px`;
      dentro.style.height = `${h * ZOOM}px`;
      dentro.style.transform = `translate3d(${d / 2 - px * ZOOM}px, ${d / 2 - py * ZOOM}px, 0)`;
    }
  }, []);

  useEffect(() => {
    if (!lupaAtiva || !medida) return;
    const { x, y, toque } = posRef.current;
    posicionarLente(x, y, toque);
  }, [lupaAtiva, medida, modoToque, fotoAtiva, posicionarLente]);

  function alternarLupa() {
    const caixa = caixaRef.current;
    if (lupaAtiva) {
      setLupaAtiva(false);
      return;
    }
    if (!caixa) return;
    const w = caixa.clientWidth;
    const h = caixa.clientHeight;
    const ehToque = ultimoToqueRef.current;
    setModoToque(ehToque);
    setMedida({ w, h });
    setMoveuLupa(false);
    posRef.current = { x: w * 0.5, y: h * 0.48, toque: ehToque };
    setLupaAtiva(true);
  }

  function aoDescer(e: ReactPointerEvent<HTMLDivElement>) {
    if (lupaAtiva) {
      const caixa = caixaRef.current;
      if (!caixa) return;
      const r = caixa.getBoundingClientRect();
      const ehToque = e.pointerType !== "mouse";
      if (ehToque !== modoToque) setModoToque(ehToque);
      if (!moveuLupa) setMoveuLupa(true);
      posicionarLente(e.clientX - r.left, e.clientY - r.top, ehToque);
      return;
    }
    if (fotos.length > 1) {
      arrastoSwipeRef.current = { x: e.clientX, y: e.clientY };
    }
  }

  function aoMover(e: ReactPointerEvent<HTMLDivElement>) {
    if (!lupaAtiva) return;
    const caixa = caixaRef.current;
    if (!caixa) return;
    const r = caixa.getBoundingClientRect();
    const ehToque = e.pointerType !== "mouse";
    if (ehToque !== modoToque) setModoToque(ehToque);
    if (!moveuLupa) setMoveuLupa(true);
    posicionarLente(e.clientX - r.left, e.clientY - r.top, ehToque);
  }

  function aoSoltar(e: ReactPointerEvent<HTMLDivElement>) {
    if (lupaAtiva) return;
    const inicio = arrastoSwipeRef.current;
    arrastoSwipeRef.current = null;
    if (!inicio || fotos.length <= 1) return;
    const dx = e.clientX - inicio.x;
    const dy = e.clientY - inicio.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      const proximo =
        dx < 0 ? (fotoAtiva + 1) % fotos.length : (fotoAtiva - 1 + fotos.length) % fotos.length;
      onTrocarFoto(proximo);
    }
  }

  const srcAtual = fotos[fotoAtiva] ?? fotos[0];

  return (
    <motion.div
      ref={caixaRef}
      suppressHydrationWarning
      initial={reduzir ? false : { scale: 1.03, opacity: 0.75 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: reduzir ? 0 : 0.36, ease: EASE_ATELIER }}
      onPointerDown={aoDescer}
      onPointerMove={aoMover}
      onPointerUp={aoSoltar}
      onPointerCancel={() => {
        arrastoSwipeRef.current = null;
      }}
      className={`relative aspect-[3/4] max-h-[min(50dvh,calc(92dvh_-_20.5rem))] w-full select-none overflow-hidden bg-white md:aspect-auto md:max-h-none md:min-h-0 md:flex-1 ${
        lupaAtiva ? "cursor-crosshair touch-none" : "touch-pan-y"
      }`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={srcAtual}
          initial={reduzir ? { opacity: 0 } : { opacity: 0.4, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduzir ? { opacity: 0 } : { opacity: 0.35 }}
          transition={{ duration: reduzir ? 0 : 0.22, ease: EASE_ATELIER }}
          className="relative h-full w-full"
        >
          <Image
            src={srcAtual}
            alt={fotos.length > 1 ? `${nome}, foto ${fotoAtiva + 1} de ${fotos.length}` : nome}
            fill
            loading="eager"
            sizes="(min-width: 768px) 560px, 100vw"
            className="pointer-events-none object-contain"
          />
        </motion.div>
      </AnimatePresence>

      {/* Contador discreto no topo esquerdo */}
      {fotos.length > 1 && (
        <span
          aria-hidden
          className="pointer-events-none absolute left-3 top-3 z-20 rounded-full bg-[#EDE7D9]/90 px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-[#1B4965] ring-1 ring-[#1B4965]/12 backdrop-blur-sm tabular-nums"
        >
          {fotoAtiva + 1} / {fotos.length}
        </span>
      )}

      {/* Setas laterais discretas no desktop quando a lupa esta desligada */}
      {fotos.length > 1 && !lupaAtiva && (
        <>
          <button
            type="button"
            aria-label="Foto anterior"
            onClick={(e) => {
              e.stopPropagation();
              onTrocarFoto((fotoAtiva - 1 + fotos.length) % fotos.length);
            }}
            className="absolute left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#EDE7D9]/90 text-[#1B4965] shadow-sm ring-1 ring-[#1B4965]/12 backdrop-blur-sm transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] md:flex"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Próxima foto"
            onClick={(e) => {
              e.stopPropagation();
              onTrocarFoto((fotoAtiva + 1) % fotos.length);
            }}
            className="absolute right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#EDE7D9]/90 text-[#1B4965] shadow-sm ring-1 ring-[#1B4965]/12 backdrop-blur-sm transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] md:flex"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </>
      )}

      {/* Dica curta ao ligar a lupa */}
      <AnimatePresence>
        {lupaAtiva && !moveuLupa && (
          <motion.span
            initial={{ opacity: 0, y: reduzir ? 0 : -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduzir ? 0 : 0.2 }}
            className="pointer-events-none absolute left-1/2 top-3 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#1B4965]/92 px-3 py-1.5 text-[11px] font-medium tracking-[0.04em] text-[#EDE7D9] shadow-md backdrop-blur-sm"
          >
            {modoToque ? "Arraste o dedo sobre o bordado" : "Passe sobre a foto para ampliar"}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Lente circular 2,6x */}
      {lupaAtiva && medida && (
        <div
          ref={lenteRef}
          aria-hidden
          style={{ width: diametro, height: diametro }}
          className="pointer-events-none absolute left-0 top-0 z-20 overflow-hidden rounded-full bg-white shadow-2xl shadow-[#130209]/30 ring-2 ring-[#b8902a]"
        >
          <div ref={dentroRef} className="relative left-0 top-0">
            <Image
              src={srcAtual}
              alt=""
              fill
              loading="eager"
              sizes="(min-width: 768px) 1400px, 950px"
              className="object-contain"
            />
          </div>
        </div>
      )}

      {/* Botao visivel e convidativo da lupa */}
      <button
        type="button"
        onPointerDown={(e) => {
          e.stopPropagation();
          ultimoToqueRef.current = e.pointerType !== "mouse";
        }}
        onClick={alternarLupa}
        aria-pressed={lupaAtiva}
        className={`absolute bottom-3 left-3 z-30 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] shadow-md backdrop-blur-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] ${
          lupaAtiva
            ? "bg-[#1B4965] text-[#EDE7D9] ring-1 ring-[#b8902a]"
            : "bg-[#EDE7D9]/95 text-[#1B4965] ring-1 ring-[#1B4965]/18 hover:bg-white"
        }`}
      >
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" d="m20 20-3.5-3.5" />
          {!lupaAtiva && <path strokeLinecap="round" d="M11 8v6M8 11h6" />}
        </svg>
        <span>{lupaAtiva ? "Fechar lupa" : "Ampliar bordado"}</span>
      </button>
    </motion.div>
  );
}
