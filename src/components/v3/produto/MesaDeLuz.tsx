"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { Produto } from "@/data/produtos";
import { extrairFichaPeca } from "@/lib/pedido-v3";
import { FOCO, HOVER } from "../estrutura/estilo";

type PontoFoco = {
  id: string;
  rotulo: string;
  x: number;
  y: number;
  nota: string;
};

const PONTOS_FOCO: PontoFoco[] = [
  {
    id: "trama",
    rotulo: "Trama central",
    x: 50,
    y: 38,
    nota: "Simetria das fileiras bordadas ponto a ponto",
  },
  {
    id: "luz",
    rotulo: "Luz nos cristais",
    x: 38,
    y: 32,
    nota: "Reflexo sob luz direta nas pedrarias e pérolas",
  },
  {
    id: "caimento",
    rotulo: "Fios e caimento",
    x: 52,
    y: 66,
    nota: "Franjas, elos e acabamento manual de alta resistência",
  },
];

type Props = {
  produto: Produto;
  fotos: string[];
  indiceFoto: number;
  aoMudarFoto: (i: number) => void;
};

// Inovacao de apresentacao da peca (todas as 52 pecas):
// "Mesa de Luz & Lente Macro 2,6x".
// Permite inspecionar o bordado em escala ampliada com um feixe de luz de
// atelie que acompanha o dedo ou o mouse, simulando o brilho dos cristais e
// perolas contra a luz, alem de 3 pontos focais de toque rapido no celular.
export default function MesaDeLuz({ produto, fotos, indiceFoto, aoMudarFoto }: Props) {
  const molduraRef = useRef<HTMLDivElement>(null);
  const [foco, setFoco] = useState<{ x: number; y: number }>({ x: 50, y: 38 });
  const [pontoAtivo, setPontoAtivo] = useState<string>("trama");
  const [luzNoturna, setLuzNoturna] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(2.6);

  const fotoAtual = fotos[indiceFoto] ?? produto.foto;
  const ficha = extrairFichaPeca(produto);
  const notaAtiva = PONTOS_FOCO.find((p) => p.id === pontoAtivo)?.nota ?? "Arraste sobre a peça para mover a lente e a luz";

  function moverParaCliente(clientX: number, clientY: number) {
    const el = molduraRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const x = Math.max(12, Math.min(88, ((clientX - r.left) / r.width) * 100));
    const y = Math.max(12, Math.min(88, ((clientY - r.top) / r.height) * 100));
    setFoco({ x, y });
    setPontoAtivo("");
  }

  function escolherPonto(p: PontoFoco) {
    setFoco({ x: p.x, y: p.y });
    setPontoAtivo(p.id);
  }

  return (
    <div className="relative flex flex-col bg-[#130209] text-[#EDE7D9]">
      {/* Palco 3:4 com a foto base sob luz direcional e a lente macro 2,6x */}
      <div
        ref={molduraRef}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          moverParaCliente(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (e.pointerType === "mouse" || e.buttons > 0) {
            moverParaCliente(e.clientX, e.clientY);
          }
        }}
        onTouchMove={(e) => {
          const t = e.touches[0];
          if (t) moverParaCliente(t.clientX, t.clientY);
        }}
        className="relative aspect-[3/4] w-full cursor-crosshair select-none overflow-hidden touch-none"
      >
        {/* Foto inteira ao fundo, levemente escurecida para destacar o feixe de luz */}
        <Image
          src={fotoAtual}
          alt={`${produto.nome} na mesa de luz`}
          fill
          sizes="(min-width: 1024px) 744px, 100vw"
          priority
          className={`object-cover object-[50%_40%] transition-all duration-300 ${
            luzNoturna ? "brightness-75 contrast-125" : "brightness-90 contrast-105"
          }`}
        />

        {/* Feixe de luz direcional do atelie que acompanha o ponto focal */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-200"
          style={{
            background: luzNoturna
              ? `radial-gradient(circle 220px at ${foco.x}% ${foco.y}%, rgba(255,240,200,0.28) 0%, rgba(19,2,9,0.55) 58%, rgba(19,2,9,0.84) 100%)`
              : `radial-gradient(circle 260px at ${foco.x}% ${foco.y}%, rgba(255,248,231,0.22) 0%, rgba(19,2,9,0.28) 62%, rgba(19,2,9,0.58) 100%)`,
          }}
        />

        {/* Ficha de materiais extraida do catalogo, no topo */}
        <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex flex-wrap items-center justify-between gap-2">
          <span className="rounded bg-[#130209]/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[#EDE7D9]">
            Lente Macro {zoom.toFixed(1).replace(".", ",")}x · {ficha[0]}
          </span>
          <button
            type="button"
            onClick={() => setLuzNoturna((v) => !v)}
            className={`pointer-events-auto flex min-h-9 items-center rounded bg-[#EDE7D9] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-[#1B4965] ${HOVER} ${FOCO}`}
          >
            {luzNoturna ? "Luz: Brilho noturno" : "Luz: Ateliê natural"}
          </button>
        </div>

        {/* Lente macro circular que mostra o bordado ampliado no ponto escolhido */}
        <div
          aria-hidden
          className="pointer-events-none absolute z-10 h-44 w-44 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-2 border-[#EDE7D9]/90 shadow-[0_10px_30px_rgba(19,2,9,0.65)] sm:h-52 sm:w-52"
          style={{
            left: `${foco.x}%`,
            top: `${foco.y}%`,
          }}
        >
          <div
            className="relative h-full w-full"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: `${foco.x}% ${foco.y}%`,
            }}
          >
            <Image
              src={fotoAtual}
              alt=""
              fill
              sizes="600px"
              className={`object-cover object-[50%_40%] ${
                luzNoturna ? "brightness-110 contrast-125 saturate-110" : "brightness-105 contrast-110"
              }`}
            />
          </div>
          {/* Reflexo de lente de vidro e mira central discreta */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,248,230,0.22) 0%, rgba(255,255,255,0) 45%, rgba(19,2,9,0.2) 100%)",
            }}
          />
          <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#EDE7D9]/80" />
        </div>

        {/* Nota do ponto inspecionado e seletor de zoom */}
        <div className="absolute inset-x-3 bottom-3 z-10 flex flex-wrap items-center justify-between gap-2">
          <p className="rounded bg-[#130209]/85 px-2.5 py-1.5 text-[11px] leading-4 text-[#EDE7D9]">
            {notaAtiva}
          </p>
          <div className="flex items-center gap-1 rounded bg-[#130209]/85 p-1">
            {[2.2, 2.6, 3.2].map((z) => (
              <button
                key={z}
                type="button"
                onClick={() => setZoom(z)}
                aria-pressed={zoom === z}
                className={`min-h-8 rounded px-2 text-[10px] uppercase tracking-[0.1em] ${FOCO} ${
                  zoom === z ? "bg-[#EDE7D9] text-[#1B4965]" : "text-[#EDE7D9]"
                }`}
              >
                {z.toString().replace(".", ",")}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Barra inferior da Mesa de Luz: 3 pontos focais de toque + troca de angulo */}
      <div className="border-t border-[#EDE7D9]/15 bg-[#1B4965] px-3 py-2.5 text-[#EDE7D9]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div role="group" aria-label="Pontos de inspeção do bordado" className="flex flex-wrap gap-1.5">
            {PONTOS_FOCO.map((p) => {
              const ativo = pontoAtivo === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => escolherPonto(p)}
                  aria-pressed={ativo}
                  className={`flex min-h-9 items-center rounded px-2.5 text-[11px] uppercase tracking-[0.12em] ${FOCO} ${
                    ativo
                      ? "bg-[#EDE7D9] text-[#1B4965]"
                      : `border border-[#EDE7D9]/35 text-[#EDE7D9] ${HOVER}`
                  }`}
                >
                  {p.rotulo}
                </button>
              );
            })}
          </div>

          {fotos.length > 1 && (
            <div className="flex items-center gap-1">
              {fotos.slice(0, 4).map((f, i) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => aoMudarFoto(i)}
                  aria-label={`Inspecionar foto ${i + 1}`}
                  className={`relative h-9 w-7 overflow-hidden rounded border ${FOCO} ${
                    i === indiceFoto ? "border-[#EDE7D9]" : "border-transparent opacity-60"
                  }`}
                >
                  <Image src={f} alt="" fill sizes="32px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
