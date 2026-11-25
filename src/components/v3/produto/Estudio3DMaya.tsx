"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Cena from "@/components/home/hero3d/Cena";
import { criarPonte, type Ponte } from "@/components/home/hero3d/ponte";
import { TOTAL_MICANGAS, costura, pousadas } from "@/components/home/hero3d/roteiro";
import { FOCO, HOVER } from "../estrutura/estilo";

type Modo3D = "relevo" | "macro" | "costura";

const milhar = new Intl.NumberFormat("pt-BR");

type Controlador3D = {
  pronta: () => void;
  escolherModo: (novo: Modo3D, aoCosturar?: (pct: number) => void) => void;
  definirCostura: (pct: number) => void;
  girarPasso: (direcao: -1 | 1) => void;
  desligar: () => void;
};

// Motor imperativo fora do componente React (mesmo padrao de palco.ts):
// altera a ponte mutavel e chama performance.now() apenas aqui fora,
// mantendo o componente React 100% puro para o compilador do React 19.
function ligarEstudio3D(palco: HTMLElement, ponte: Ponte): Controlador3D {
  let animId: number | null = null;
  let arrastando: { id: number; x: number } | null = null;

  function cancelarAnimacao() {
    if (animId !== null) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }

  function medir() {
    const r = palco.getBoundingClientRect();
    const w = Math.max(1, r.width);
    const h = Math.max(1, r.height);
    ponte.tela = { w, h };
    ponte.moldura = {
      x: w * 0.06,
      y: h * 0.05,
      w: w * 0.88,
      h: h * 0.88,
    };
    ponte.compacto = w < 520;
    ponte.visivel = true;
    ponte.pedir();
  }

  function animarParaP(alvo: number, duracao = 650, aoAtualizarCostura?: (pct: number) => void) {
    cancelarAnimacao();
    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduzido) {
      ponte.p = alvo;
      ponte.ultimoGesto = performance.now();
      ponte.pedir();
      if (aoAtualizarCostura) {
        aoAtualizarCostura(Math.round(pousadas(costura(alvo)) * 100));
      }
      return;
    }

    const inicio = ponte.p;
    const t0 = performance.now();
    const passo = (agora: number) => {
      const t = Math.min(1, (agora - t0) / duracao);
      const suave = 1 - Math.pow(1 - t, 3);
      ponte.p = inicio + (alvo - inicio) * suave;
      ponte.ultimoGesto = agora;
      ponte.pedir();
      if (aoAtualizarCostura) {
        aoAtualizarCostura(Math.round(pousadas(costura(ponte.p)) * 100));
      }
      if (t < 1) {
        animId = requestAnimationFrame(passo);
      } else {
        animId = null;
      }
    };
    animId = requestAnimationFrame(passo);
  }

  const aoApertar = (e: PointerEvent) => {
    if ((e.target as HTMLElement | null)?.closest("button,input")) return;
    arrastando = { id: e.pointerId, x: e.clientX };
    try {
      palco.setPointerCapture(e.pointerId);
    } catch {
      // Ignora se o ponteiro ja soltou
    }
  };

  const aoMover = (e: PointerEvent) => {
    const r = palco.getBoundingClientRect();
    ponte.ponteiro.x = ((e.clientX - r.left) / Math.max(1, r.width)) * 2 - 1;
    ponte.ponteiro.y = -(((e.clientY - r.top) / Math.max(1, r.height)) * 2 - 1);
    ponte.ponteiro.ativo = true;
    ponte.ultimoGesto = performance.now();

    if (arrastando && arrastando.id === e.pointerId) {
      const dx = e.clientX - arrastando.x;
      arrastando.x = e.clientX;
      ponte.arraste += (dx / Math.max(280, r.width)) * Math.PI * 1.5;
    }
    ponte.pedir();
  };

  const aoSoltar = () => {
    arrastando = null;
  };

  const aoSair = () => {
    ponte.ponteiro.ativo = false;
    ponte.pedir();
  };

  palco.addEventListener("pointerdown", aoApertar);
  palco.addEventListener("pointermove", aoMover);
  palco.addEventListener("pointerup", aoSoltar);
  palco.addEventListener("pointercancel", aoSoltar);
  palco.addEventListener("pointerleave", aoSair);

  medir();
  const obs = new ResizeObserver(medir);
  obs.observe(palco);

  return {
    pronta() {
      ponte.introInicio = performance.now() - 10000;
      ponte.p = 0.48;
      ponte.arraste = 0;
      ponte.ultimoGesto = performance.now();
      ponte.pedir();
    },
    escolherModo(novo, aoCosturar) {
      if (novo === "relevo") {
        animarParaP(0.48, 600);
      } else if (novo === "macro") {
        ponte.arraste = 0;
        animarParaP(0.82, 750);
      } else {
        ponte.p = 0.1;
        ponte.arraste = 0;
        ponte.pedir();
        animarParaP(0.47, 2400, aoCosturar);
      }
    },
    definirCostura(pct) {
      cancelarAnimacao();
      ponte.p = 0.06 + (pct / 100) * (0.47 - 0.06);
      ponte.ultimoGesto = performance.now();
      ponte.pedir();
    },
    girarPasso(direcao) {
      ponte.arraste += direcao * 0.35;
      ponte.ultimoGesto = performance.now();
      ponte.pedir();
    },
    desligar() {
      cancelarAnimacao();
      obs.disconnect();
      palco.removeEventListener("pointerdown", aoApertar);
      palco.removeEventListener("pointermove", aoMover);
      palco.removeEventListener("pointerup", aoSoltar);
      palco.removeEventListener("pointercancel", aoSoltar);
      palco.removeEventListener("pointerleave", aoSair);
      ponte.visivel = false;
    },
  };
}

export default function Estudio3DMaya() {
  const palcoRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<Controlador3D | null>(null);
  const [ponte] = useState<Ponte>(criarPonte);
  const [pronta, setPronta] = useState(false);
  const [modo, setModo] = useState<Modo3D>("relevo");
  const [progressoCostura, setProgressoCostura] = useState(100);

  useEffect(() => {
    const el = palcoRef.current;
    if (!el) return;
    const ctrl = ligarEstudio3D(el, ponte);
    ctrlRef.current = ctrl;
    return () => {
      ctrlRef.current = null;
      ctrl.desligar();
    };
  }, [ponte]);

  const aoFicarPronta = useCallback(() => {
    ctrlRef.current?.pronta();
    setPronta(true);
  }, []);

  function escolherModo(novo: Modo3D) {
    setModo(novo);
    if (novo === "relevo" || novo === "macro") {
      setProgressoCostura(100);
      ctrlRef.current?.escolherModo(novo);
    } else {
      setProgressoCostura(8);
      ctrlRef.current?.escolherModo("costura", (pct) => setProgressoCostura(pct));
    }
  }

  function aoMudarSliderCostura(pct: number) {
    setModo("costura");
    setProgressoCostura(pct);
    ctrlRef.current?.definirCostura(pct);
  }

  const qtdMicangas = Math.round((progressoCostura / 100) * TOTAL_MICANGAS);

  return (
    <div className="flex flex-col bg-[#EDE7D9] text-[#1B4965]">
      <div
        ref={palcoRef}
        className="relative aspect-[3/4] w-full cursor-grab select-none overflow-hidden bg-[#EDE7D9] active:cursor-grabbing touch-pan-y"
      >
        <Suspense
          fallback={
            <div className="flex h-full w-full items-center justify-center text-[12px] uppercase tracking-[0.14em] text-brand-muted">
              Carregando 2.500 miçangas em 3D...
            </div>
          }
        >
          <Cena ponte={ponte} compacto={false} aoFicarPronta={aoFicarPronta} />
        </Suspense>

        {/* Cabecalho discreto do palco 3D */}
        <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex items-center justify-between gap-2">
          <span className="nums-preco rounded bg-[#EDE7D9]/90 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[#1B4965]">
            {milhar.format(qtdMicangas)} / 2.500 miçangas em 3D
          </span>
          <div className="pointer-events-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => ctrlRef.current?.girarPasso(-1)}
              aria-label="Girar peça para a esquerda"
              className={`flex h-9 w-9 items-center justify-center rounded bg-[#EDE7D9]/90 text-[13px] text-[#1B4965] ${HOVER} ${FOCO}`}
            >
              ↺
            </button>
            <button
              type="button"
              onClick={() => ctrlRef.current?.girarPasso(1)}
              aria-label="Girar peça para a direita"
              className={`flex h-9 w-9 items-center justify-center rounded bg-[#EDE7D9]/90 text-[13px] text-[#1B4965] ${HOVER} ${FOCO}`}
            >
              ↻
            </button>
          </div>
        </div>

        {/* Instrucao discreta na base do canvas */}
        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-10 flex items-center justify-between">
          <span className="rounded bg-[#EDE7D9]/90 px-2.5 py-1 text-[11px] text-[#1B4965]">
            {!pronta
              ? "Montando relevo das miçangas..."
              : modo === "macro"
                ? "Close 3D das fileiras de pérolas e cristais âmbar"
                : "Arraste para girar a peça sob a luz do estúdio"}
          </span>
        </div>
      </div>

      {/* Controles de modo 3D e controle de costura ponto a ponto */}
      <div className="border-t border-[#1B4965]/15 bg-[#EDE7D9] px-3 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div role="group" aria-label="Vistas do modelo 3D" className="flex flex-wrap gap-1.5">
            {(
              [
                ["relevo", "Peça em 3D"],
                ["macro", "Macro 3D do bojo"],
                ["costura", "Ponto a ponto"],
              ] as const
            ).map(([id, rotulo]) => {
              const ativo = modo === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => escolherModo(id)}
                  aria-pressed={ativo}
                  className={`flex min-h-9 items-center rounded border px-2.5 text-[11px] uppercase tracking-[0.12em] ${FOCO} ${
                    ativo
                      ? "border-[#1B4965] bg-[#1B4965] text-[#EDE7D9]"
                      : `border-[#1B4965]/40 text-[#1B4965] ${HOVER}`
                  }`}
                >
                  {rotulo}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="slider-costura-3d" className="text-[11px] text-brand-muted">
              Costura:
            </label>
            <input
              id="slider-costura-3d"
              type="range"
              min={0}
              max={100}
              value={progressoCostura}
              onChange={(e) => aoMudarSliderCostura(Number(e.target.value))}
              className="h-2 w-24 accent-[#1B4965]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
