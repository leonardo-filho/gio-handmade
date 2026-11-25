"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { isolarFundo, prenderTab, travarRolagem } from "@/lib/travaRolagem";
import { IconeFechar } from "@/components/v3/estrutura/Icones";
import { IconeMais, IconeMenos } from "../icones";
import { ZOOM_INICIAL, ZOOM_MAX, ZOOM_MIN, caber, limitar, type Ponto, type Tamanho } from "./perto";

// "Ver de perto" no celular (e no tablet): tela cheia sobre a tinta, a foto
// em resolução cheia já aproximada 2,5x no ponto em que a pessoa tocou. O
// bordado segue o dedo (arrastar), a pinça aproxima e afasta, e o toque duplo
// alterna entre a foto inteira e o close. Embaixo, as fotos da peça em
// miniatura; na atual, um quadro mostra o pedaço que está na tela.
//
// O movimento é todo do dedo da pessoa (nada anda sozinho), então vale igual
// com movimento reduzido; só o fade de abertura some.

type Props = {
  fotos: string[];
  nome: string;
  inicial: number;
  /** Ponto da foto (0 a 1) que abre no centro da tela. */
  foco: Ponto;
  onFechar: (indice: number) => void;
};

type Pinca = { d: number; s: number; meio: Ponto; x: number; y: number };

const MINI = { w: 44, h: 58 };

export default function VerDePerto({ fotos, nome, inicial, foco, onFechar }: Props) {
  const [indice, setIndice] = useState(inicial);
  const [naturais, setNaturais] = useState<Record<string, Tamanho>>({});
  const [dica, setDica] = useState<string | null>("Arraste para percorrer o bordado");
  const [zoomAtual, setZoomAtual] = useState(ZOOM_INICIAL);

  const painelRef = useRef<HTMLDivElement>(null);
  const palcoRef = useRef<HTMLDivElement>(null);
  const fotoRef = useRef<HTMLDivElement>(null);
  const janelaRef = useRef<HTMLSpanElement>(null);
  const fecharRef = useRef<HTMLButtonElement>(null);
  const indiceRef = useRef(inicial);
  // Estado do gesto fora do React (muda a cada quadro do dedo).
  const t = useRef({ s: ZOOM_INICIAL, x: 0, y: 0 });
  const focoPendente = useRef<Ponto>(foco);
  // Aproximação com que a foto atual abre: o close na primeira, a foto inteira nas outras.
  const zoomPendente = useRef(ZOOM_INICIAL);
  const dedos = useRef(new Map<number, Ponto>());
  const pinca = useRef<Pinca | null>(null);
  const toque = useRef<{ x: number; y: number; t: number; moveu: boolean }>({ x: 0, y: 0, t: 0, moveu: false });
  const ultimoToque = useRef<{ x: number; y: number; t: number } | null>(null);

  const src = fotos[indice];
  const natural = naturais[src];
  const total = fotos.length;

  // Trava a página, isola o fundo e põe o foco no X.
  useEffect(() => {
    const liberarRolagem = travarRolagem();
    const liberarFundo = isolarFundo();
    fecharRef.current?.focus({ preventScroll: true });
    return () => {
      liberarFundo();
      liberarRolagem();
    };
  }, []);

  // Base da foto (inteira na tela) e a posição de abertura no ponto pedido.
  function base(): { caixa: Tamanho; foto: Tamanho } | null {
    const palco = palcoRef.current;
    if (!palco || !natural) return null;
    const caixa = { w: palco.clientWidth, h: palco.clientHeight };
    return { caixa, foto: caber(natural, caixa) };
  }

  function prender() {
    const b = base();
    if (!b) return;
    const { s } = t.current;
    const mx = Math.max(0, (b.foto.w * s - b.caixa.w) / 2);
    const my = Math.max(0, (b.foto.h * s - b.caixa.h) / 2);
    t.current.x = limitar(t.current.x, -mx, mx);
    t.current.y = limitar(t.current.y, -my, my);
  }

  function aplicar() {
    const b = base();
    const foto = fotoRef.current;
    if (!b || !foto) return;
    const { s, x, y } = t.current;
    const w = b.foto.w * s;
    const h = b.foto.h * s;
    const esq = b.caixa.w / 2 + x - w / 2;
    const topo = b.caixa.h / 2 + y - h / 2;
    foto.style.width = `${w}px`;
    foto.style.height = `${h}px`;
    foto.style.transform = `translate3d(${esq}px, ${topo}px, 0)`;
    foto.style.visibility = "visible";

    // Quadro da miniatura: o pedaço da foto que está na tela.
    const janela = janelaRef.current;
    if (janela && natural) {
      const mini = caber(natural, MINI);
      const ox = (MINI.w - mini.w) / 2;
      const oy = (MINI.h - mini.h) / 2;
      const l = limitar(-esq / w, 0, 1);
      const r = limitar((b.caixa.w - esq) / w, 0, 1);
      const tp = limitar(-topo / h, 0, 1);
      const bt = limitar((b.caixa.h - topo) / h, 0, 1);
      janela.style.left = `${ox + l * mini.w}px`;
      janela.style.top = `${oy + tp * mini.h}px`;
      janela.style.width = `${(r - l) * mini.w}px`;
      janela.style.height = `${(bt - tp) * mini.h}px`;
    }
  }

  // Quando a foto atual já tem tamanho conhecido: abre no ponto pedido.
  useEffect(() => {
    const b = base();
    if (!b) return;
    const s = zoomPendente.current;
    const p = focoPendente.current;
    t.current = { s, x: -(p.x - 0.5) * b.foto.w * s, y: -(p.y - 0.5) * b.foto.h * s };
    prender();
    aplicar();
    const aoRedimensionar = () => {
      prender();
      aplicar();
    };
    window.addEventListener("resize", aoRedimensionar);
    return () => window.removeEventListener("resize", aoRedimensionar);
    // base, prender e aplicar só leem refs e a foto atual.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, natural]);

  // Aproxima ou afasta mantendo parado o ponto q (relativo ao centro do palco).
  function zoomEm(novo: number, q: Ponto) {
    const atual = t.current;
    const s = limitar(novo, ZOOM_MIN, ZOOM_MAX);
    t.current = { s, x: q.x - (q.x - atual.x) * (s / atual.s), y: q.y - (q.y - atual.y) * (s / atual.s) };
    prender();
    aplicar();
    setZoomAtual(s);
    setDica(null);
  }

  function centroRelativo(clientX: number, clientY: number): Ponto {
    const r = palcoRef.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0 };
    return { x: clientX - r.left - r.width / 2, y: clientY - r.top - r.height / 2 };
  }

  function trocar(i: number) {
    if (i === indice) return;
    focoPendente.current = { x: 0.5, y: 0.5 };
    zoomPendente.current = ZOOM_MIN;
    indiceRef.current = i;
    setIndice(i);
    setZoomAtual(ZOOM_MIN);
    setDica("Toque duas vezes para aproximar");
    if (fotoRef.current) fotoRef.current.style.visibility = "hidden";
  }

  const fechar = () => onFechar(indiceRef.current);

  return createPortal(
    <div
      ref={painelRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Ver de perto: ${nome}`}
      tabIndex={-1}
      onKeyDown={(e) => {
        const passo = 60;
        if (e.key === "Escape") return fechar();
        if (e.key === "Tab") return prenderTab(e, painelRef.current);
        if (e.key === "+" || e.key === "=") zoomEm(t.current.s * 1.4, { x: 0, y: 0 });
        else if (e.key === "-") zoomEm(t.current.s / 1.4, { x: 0, y: 0 });
        else if (e.key.startsWith("Arrow")) {
          if (e.key === "ArrowLeft") t.current.x += passo;
          if (e.key === "ArrowRight") t.current.x -= passo;
          if (e.key === "ArrowUp") t.current.y += passo;
          if (e.key === "ArrowDown") t.current.y -= passo;
          prender();
          aplicar();
        } else return;
        e.preventDefault();
      }}
      className="fixed inset-0 z-[100] bg-[#130209] text-[#EDE7D9] opacity-100 outline-none transition-opacity duration-200 starting:opacity-0 motion-reduce:transition-none"
    >
      {/* Palco: recebe o dedo (sem rolagem nem zoom do navegador). */}
      <div
        ref={palcoRef}
        className="absolute inset-0 touch-none select-none overflow-hidden"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          dedos.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
          if (dica) setDica(null);
          if (dedos.current.size === 1) {
            toque.current = { x: e.clientX, y: e.clientY, t: e.timeStamp, moveu: false };
          } else if (dedos.current.size === 2) {
            const [a, b] = [...dedos.current.values()];
            pinca.current = {
              d: Math.hypot(a.x - b.x, a.y - b.y) || 1,
              s: t.current.s,
              meio: centroRelativo((a.x + b.x) / 2, (a.y + b.y) / 2),
              x: t.current.x,
              y: t.current.y,
            };
            toque.current.moveu = true;
          }
        }}
        onPointerMove={(e) => {
          const antes = dedos.current.get(e.pointerId);
          if (!antes) return;
          dedos.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
          if (dedos.current.size >= 2 && pinca.current) {
            const [a, b] = [...dedos.current.values()];
            const p = pinca.current;
            const s = limitar((p.s * Math.hypot(a.x - b.x, a.y - b.y)) / p.d, ZOOM_MIN, ZOOM_MAX);
            const meio = centroRelativo((a.x + b.x) / 2, (a.y + b.y) / 2);
            // O ponto da foto que estava sob o meio dos dedos continua sob ele.
            t.current = { s, x: meio.x - (p.meio.x - p.x) * (s / p.s), y: meio.y - (p.meio.y - p.y) * (s / p.s) };
            prender();
            aplicar();
            return;
          }
          const dx = e.clientX - antes.x;
          const dy = e.clientY - antes.y;
          if (Math.hypot(e.clientX - toque.current.x, e.clientY - toque.current.y) > 6) toque.current.moveu = true;
          t.current.x += dx;
          t.current.y += dy;
          prender();
          aplicar();
        }}
        onPointerUp={(e) => {
          dedos.current.delete(e.pointerId);
          if (dedos.current.size < 2 && pinca.current) {
            pinca.current = null;
            setZoomAtual(t.current.s);
          }
          if (dedos.current.size > 0) return;
          const agora = e.timeStamp;
          const tq = toque.current;
          if (tq.moveu || agora - tq.t > 300) return;
          const ultimo = ultimoToque.current;
          if (ultimo && agora - ultimo.t < 320 && Math.hypot(e.clientX - ultimo.x, e.clientY - ultimo.y) < 30) {
            // Toque duplo: foto inteira ou close, no ponto tocado.
            ultimoToque.current = null;
            zoomEm(t.current.s > 1.2 ? 1 : ZOOM_INICIAL, centroRelativo(e.clientX, e.clientY));
          } else {
            ultimoToque.current = { x: e.clientX, y: e.clientY, t: agora };
          }
        }}
        onPointerCancel={(e) => {
          dedos.current.delete(e.pointerId);
          pinca.current = null;
        }}
        onWheel={(e) => zoomEm(t.current.s * Math.exp(-e.deltaY * 0.0015), centroRelativo(e.clientX, e.clientY))}
      >
        {/* Ocupa o palco até a foto carregar (o fill pede altura); depois,
            aplicar() troca pelo tamanho real ampliado. */}
        <div ref={fotoRef} className="invisible absolute left-0 top-0 h-full w-full">
          <Image
            key={src}
            src={src}
            alt={total > 1 ? `${nome}, foto ${indice + 1} de ${total}, ampliada` : `${nome}, ampliada`}
            fill
            unoptimized
            draggable={false}
            onLoad={(e) => {
              const img = e.currentTarget;
              const medida = { w: img.naturalWidth, h: img.naturalHeight };
              setNaturais((n) => (n[src] ? n : { ...n, [src]: medida }));
            }}
            className="object-contain"
          />
        </div>
      </div>

      {/* Topo: contador e fechar, sobre um véu para ler em qualquer foto. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex h-20 items-start justify-between bg-gradient-to-b from-[#130209]/70 to-transparent pl-4 pr-1.5 pt-1.5">
        <p className="flex h-11 items-center gap-3 text-[11px] uppercase tracking-[0.16em]">
          Ver de perto
          {total > 1 && (
            <span aria-live="polite" className="nums-preco text-[#EDE7D9]/80">
              {indice + 1} / {total}
            </span>
          )}
        </p>
        <button
          ref={fecharRef}
          type="button"
          onClick={fechar}
          aria-label="Fechar"
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-[4px] transition-opacity duration-200 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-[#b8902a] motion-reduce:transition-none"
        >
          <IconeFechar className="h-[22px] w-[22px]" />
        </button>
      </div>

      {dica && (
        <p
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-[#130209]/70 px-4 py-2 text-[12px] tracking-[0.04em]"
        >
          {dica}
        </p>
      )}

      {/* Embaixo: as fotos da peça e o zoom. */}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-[#130209]/80 to-transparent px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-10">
        <ul aria-label="Fotos da peça" className="flex min-w-0 gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {fotos.map((f, i) => {
            const atual = i === indice;
            return (
              <li key={f} className="shrink-0">
                <button
                  type="button"
                  onClick={() => trocar(i)}
                  aria-label={`Foto ${i + 1} de ${total}`}
                  aria-current={atual || undefined}
                  className={`relative block overflow-hidden rounded-[2px] bg-[#EDE7D9]/10 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#b8902a] ${
                    atual ? "opacity-100 ring-1 ring-[#EDE7D9]" : "opacity-60 transition-opacity duration-200 hover:opacity-100 motion-reduce:transition-none"
                  }`}
                  style={{ width: MINI.w, height: MINI.h }}
                >
                  <Image src={f} alt="" fill sizes="44px" className="object-contain" />
                  {atual && (
                    <span
                      ref={janelaRef}
                      aria-hidden
                      className="absolute block border border-[#EDE7D9] shadow-[0_0_0_1px_rgb(19_2_9/0.5)]"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        <div role="group" aria-label="Aproximar" className="flex shrink-0 gap-1.5">
          <BotaoZoom rotulo="Afastar" desligado={zoomAtual <= ZOOM_MIN + 0.01} aoClicar={() => zoomEm(t.current.s / 1.5, { x: 0, y: 0 })}>
            <IconeMenos className="h-5 w-5" />
          </BotaoZoom>
          <BotaoZoom rotulo="Aproximar" desligado={zoomAtual >= ZOOM_MAX - 0.01} aoClicar={() => zoomEm(t.current.s * 1.5, { x: 0, y: 0 })}>
            <IconeMais className="h-5 w-5" />
          </BotaoZoom>
        </div>
      </div>
    </div>,
    document.body
  );
}

function BotaoZoom({
  rotulo,
  desligado,
  aoClicar,
  children,
}: {
  rotulo: string;
  desligado: boolean;
  aoClicar: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={aoClicar}
      aria-label={rotulo}
      aria-disabled={desligado || undefined}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-[#EDE7D9]/60 transition-opacity duration-200 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b8902a] aria-disabled:opacity-35 motion-reduce:transition-none"
    >
      {children}
    </button>
  );
}
