"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import Image from "next/image";

// Lupa do ateliê: uma lente redonda que mostra o bordado ampliado, pérola por
// pérola, em cima de qualquer foto da loja.
//
//   Mouse: a lente segue o ponteiro enquanto ele está sobre a foto; o clique
//          continua abrindo a peça.
//   Toque: tocar e segurar (300 ms parado) liga a lente, que fica um pouco
//          acima do dedo e segue o arrasto; soltar desliga. Um toque curto
//          abre a peça, e arrastar sem segurar rola a página como sempre.
//   Botão: o botão da lupa (canto da foto) deixa a lente ligada no meio da
//          foto; arrastar move a lente, as setas do teclado também, e Esc,
//          o mesmo botão ou um toque fora desligam.
//
// A lente desenha a mesma foto num quadro Z vezes maior, deslocado para que o
// ponto apontado fique no centro dela. A foto ampliada só é pedida na primeira
// vez que a lente liga (52 peças, nada de baixar tudo de uma vez) e o tamanho
// pedido é o do quadro ampliado. O movimento escreve direto no estilo dos
// elementos, sem render a cada quadro.

const SEGURAR_MS = 300;
const TOLERANCIA_PX = 9;
const PASSO_TECLADO = 28;

// ---------------------------------------------------------------------------
// "Já usou a lupa": esconde a dica depois do primeiro uso. Mora no
// localStorage (com try/catch) e é lido com useSyncExternalStore: no servidor
// vale "usada" (sem dica no HTML) e a dica entra depois da hidratação.
const CHAVE_USADA = "gio-atelie-lupa-usada";
const ouvintesUsada = new Set<() => void>();
let usadaCache: boolean | null = null;

function lerUsada() {
  if (usadaCache === null) {
    try {
      usadaCache = window.localStorage.getItem(CHAVE_USADA) === "1";
    } catch {
      usadaCache = false;
    }
  }
  return usadaCache;
}

function marcarUsada() {
  if (lerUsada()) return;
  usadaCache = true;
  try {
    window.localStorage.setItem(CHAVE_USADA, "1");
  } catch {
    /* sem storage: a dica some só nesta visita */
  }
  ouvintesUsada.forEach((o) => o());
}

function assinarUsada(o: () => void) {
  ouvintesUsada.add(o);
  return () => {
    ouvintesUsada.delete(o);
  };
}

export function useLupaUsada() {
  return useSyncExternalStore(assinarUsada, lerUsada, () => true);
}

// A demonstração da lente (ela passeia sozinha pela foto uma vez) roda no
// máximo uma vez por carga da página, na primeira foto que pede.
let demoFeita = false;

// ---------------------------------------------------------------------------

type Props = {
  src: string;
  alt: string;
  /** sizes da foto normal (a da lente é calculado). */
  sizes: string;
  /** Nome da peça, para o rótulo do botão da lupa. */
  nome: string;
  fit?: "cover" | "contain";
  /** object-position da foto (o mesmo vale dentro da lente). */
  posicao?: string;
  zoom?: number;
  /** Diâmetro da lente com mouse e com toque, em px. */
  lente?: number;
  lenteToque?: number;
  /** Foto na primeira tela: carrega na hora, com prioridade. */
  prioridade?: boolean;
  /** Toque curto ou clique: abre a peça. */
  onAbrir?: () => void;
  /** Mostra o botão da lupa no canto. */
  botao?: boolean;
  /** Canto do botão. */
  cantoBotao?: "direita" | "esquerda";
  /** Mostra a dica de uso (e a demonstração) até a pessoa usar a lupa. */
  dica?: boolean;
  /** Texto da dica para mouse e para toque. */
  textoDica?: { mouse: string; toque: string };
  className?: string;
  /** Fundo atrás da foto (contain deixa sobras). */
  fundo?: string;
  children?: ReactNode;
};

type Medida = { w: number; h: number };

export default function Lupa({
  src,
  alt,
  sizes,
  nome,
  fit = "cover",
  posicao = "50% 50%",
  zoom = 2.6,
  lente = 200,
  lenteToque = 150,
  prioridade = false,
  onAbrir,
  botao = true,
  cantoBotao = "direita",
  dica = false,
  textoDica = {
    mouse: "Passe o mouse para ver o bordado de perto",
    toque: "Toque e segure para ver o bordado de perto",
  },
  className = "",
  fundo = "bg-white",
  children,
}: Props) {
  const caixaRef = useRef<HTMLDivElement>(null);
  const lenteRef = useRef<HTMLDivElement>(null);
  const dentroRef = useRef<HTMLDivElement>(null);

  // Lente montada (fica montada depois da primeira vez, com a foto já baixada).
  const [medida, setMedida] = useState<Medida | null>(null);
  const [ativa, setAtiva] = useState(false);
  const [modo, setModo] = useState(false);
  const [toque, setToque] = useState(false);
  const usada = useLupaUsada();

  const modoRef = useRef(false);
  const segurandoRef = useRef(false);
  const engolirCliqueRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const inicioRef = useRef<{ x: number; y: number } | null>(null);
  const posRef = useRef<{ x: number; y: number; acima: boolean }>({ x: 0, y: 0, acima: false });
  const demoRef = useRef<number | null>(null);

  const diametro = toque ? lenteToque : lente;

  // Coloca a lente no ponto (x, y) da foto, em px a partir do canto.
  const posicionar = useCallback(
    (x: number, y: number, acima: boolean) => {
      const caixa = caixaRef.current;
      if (!caixa) return;
      const w = caixa.clientWidth;
      const h = caixa.clientHeight;
      const px = Math.min(w, Math.max(0, x));
      const py = Math.min(h, Math.max(0, y));
      posRef.current = { x: px, y: py, acima };
      const d = acima ? lenteToque : lente;
      const cx = px;
      // No toque a lente sobe para o dedo não cobrir o que ela mostra.
      const cy = acima ? py - d * 0.78 : py;
      const l = lenteRef.current;
      const dentro = dentroRef.current;
      if (l) l.style.transform = `translate3d(${cx - d / 2}px, ${cy - d / 2}px, 0)`;
      if (dentro) {
        dentro.style.width = `${w * zoom}px`;
        dentro.style.height = `${h * zoom}px`;
        dentro.style.transform = `translate3d(${d / 2 - px * zoom}px, ${d / 2 - py * zoom}px, 0)`;
      }
    },
    [lente, lenteToque, zoom]
  );

  // Depois de montar ou de trocar o tamanho da lente, reposiciona (os refs
  // só existem depois do render que montou a lente).
  useEffect(() => {
    if (!medida) return;
    const { x, y, acima } = posRef.current;
    posicionar(x, y, acima);
  }, [medida, toque, posicionar]);

  const medir = useCallback(() => {
    const caixa = caixaRef.current;
    if (!caixa) return;
    const w = caixa.clientWidth;
    const h = caixa.clientHeight;
    setMedida((m) => (m && Math.abs(m.w - w) < 2 && Math.abs(m.h - h) < 2 ? m : { w, h }));
  }, []);

  const pontoDoEvento = (e: { clientX: number; clientY: number }) => {
    const r = caixaRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const pararDemo = useCallback(() => {
    if (demoRef.current !== null) {
      cancelAnimationFrame(demoRef.current);
      demoRef.current = null;
    }
  }, []);

  const ligar = useCallback(
    (x: number, y: number, viaToque: boolean) => {
      pararDemo();
      medir();
      setToque(viaToque);
      setAtiva(true);
      posicionar(x, y, viaToque);
      marcarUsada();
    },
    [medir, posicionar, pararDemo]
  );

  const desligar = useCallback(() => {
    setAtiva(false);
    setModo(false);
    modoRef.current = false;
    segurandoRef.current = false;
  }, []);

  // --- Ponteiro --------------------------------------------------------------
  function aoEntrar(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" || modoRef.current) return;
    const { x, y } = pontoDoEvento(e);
    ligar(x, y, false);
  }

  function aoMover(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse") {
      if (modoRef.current) return;
      if (!ativa) {
        const { x, y } = pontoDoEvento(e);
        ligar(x, y, false);
        return;
      }
      const { x, y } = pontoDoEvento(e);
      posicionar(x, y, false);
      return;
    }
    const { x, y } = pontoDoEvento(e);
    if (segurandoRef.current || modoRef.current) {
      posicionar(x, y, true);
      return;
    }
    const inicio = inicioRef.current;
    if (inicio && Math.hypot(x - inicio.x, y - inicio.y) > TOLERANCIA_PX) {
      clearTimeout(timerRef.current);
      inicioRef.current = null;
    }
  }

  function aoSair(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" || modoRef.current) return;
    setAtiva(false);
  }

  function aoApertar(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse") return;
    pararDemo();
    // Gesto novo: um toque anterior com arrasto não gera clique, então o
    // "engolir o clique" daquele gesto não pode sobrar para este.
    engolirCliqueRef.current = false;
    const { x, y } = pontoDoEvento(e);
    if (modoRef.current) {
      engolirCliqueRef.current = true;
      setToque(true);
      posicionar(x, y, true);
      return;
    }
    inicioRef.current = { x, y };
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!inicioRef.current) return;
      segurandoRef.current = true;
      engolirCliqueRef.current = true;
      ligar(inicioRef.current.x, inicioRef.current.y, true);
    }, SEGURAR_MS);
  }

  function aoSoltar(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse") return;
    clearTimeout(timerRef.current);
    inicioRef.current = null;
    if (segurandoRef.current) {
      segurandoRef.current = false;
      setAtiva(false);
    }
  }

  function aoClicar(e: React.MouseEvent<HTMLDivElement>) {
    if (engolirCliqueRef.current) {
      engolirCliqueRef.current = false;
      e.preventDefault();
      return;
    }
    if (modoRef.current) return;
    onAbrir?.();
  }

  // Segurando ou com o modo lupa ligado, o arrasto move a lente e não a
  // página. O touchmove precisa ser não passivo para o preventDefault valer.
  useEffect(() => {
    const caixa = caixaRef.current;
    if (!caixa) return;
    const travar = (ev: TouchEvent) => {
      if ((segurandoRef.current || modoRef.current) && ev.cancelable) ev.preventDefault();
    };
    caixa.addEventListener("touchmove", travar, { passive: false });
    return () => caixa.removeEventListener("touchmove", travar);
  }, []);

  // Modo lupa: um toque fora da foto desliga.
  useEffect(() => {
    if (!modo) return;
    const fora = (ev: PointerEvent) => {
      if (caixaRef.current && !caixaRef.current.contains(ev.target as Node)) desligar();
    };
    document.addEventListener("pointerdown", fora);
    return () => document.removeEventListener("pointerdown", fora);
  }, [modo, desligar]);

  useEffect(() => () => {
    clearTimeout(timerRef.current);
    if (demoRef.current !== null) cancelAnimationFrame(demoRef.current);
  }, []);

  // --- Botão ----------------------------------------------------------------
  function alternarModo(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    if (modoRef.current) {
      desligar();
      return;
    }
    const caixa = caixaRef.current;
    if (!caixa) return;
    // Teclado ou toque: lente no meio, um pouco acima (o polegar fica embaixo).
    const viaToque = e.detail > 0 && !window.matchMedia("(hover: hover)").matches;
    modoRef.current = true;
    setModo(true);
    const y = caixa.clientHeight * (viaToque ? 0.55 : 0.45);
    ligar(caixa.clientWidth / 2, y, viaToque);
  }

  function teclarBotao(e: ReactKeyboardEvent<HTMLButtonElement>) {
    if (!modoRef.current) return;
    const { x, y, acima } = posRef.current;
    const passos: Record<string, [number, number]> = {
      ArrowLeft: [-PASSO_TECLADO, 0],
      ArrowRight: [PASSO_TECLADO, 0],
      ArrowUp: [0, -PASSO_TECLADO],
      ArrowDown: [0, PASSO_TECLADO],
    };
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      desligar();
      return;
    }
    const p = passos[e.key];
    if (!p) return;
    e.preventDefault();
    posicionar(x + p[0], y + p[1], acima);
  }

  // --- Demonstração ---------------------------------------------------------
  // Na primeira foto com dica, quando ela aparece inteira na tela, a lente
  // passeia sozinha por uns 2 segundos e some. Sem isso a dica era só texto.
  const mostrarDica = dica && !usada;
  useEffect(() => {
    if (!mostrarDica || demoFeita) return;
    const caixa = caixaRef.current;
    if (!caixa) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const obs = new IntersectionObserver(
      ([ent]) => {
        if (!ent.isIntersecting || demoFeita) return;
        demoFeita = true;
        obs.disconnect();
        const w = caixa.clientWidth;
        const h = caixa.clientHeight;
        const inicio = performance.now();
        const DUR = 2600;
        medir();
        setToque(false);
        setAtiva(true);
        const passo = (t: number) => {
          const k = Math.min(1, (t - inicio) / DUR);
          // Um arco suave da esquerda para a direita, na altura em que o
          // bordado costuma estar (busto e cintura, um pouco abaixo do meio).
          const x = w * (0.3 + 0.4 * k);
          const y = h * (0.6 + 0.06 * Math.sin(k * Math.PI * 2));
          posicionar(x, y, false);
          if (k < 1) demoRef.current = requestAnimationFrame(passo);
          else {
            demoRef.current = null;
            if (!modoRef.current && !segurandoRef.current) setAtiva(false);
          }
        };
        demoRef.current = requestAnimationFrame(passo);
      },
      { threshold: 0.85 }
    );
    const atraso = setTimeout(() => obs.observe(caixa), 900);
    return () => {
      clearTimeout(atraso);
      obs.disconnect();
    };
  }, [mostrarDica, medir, posicionar]);

  const ampliada = medida ? `${Math.round(Math.max(medida.w, medida.h * 0.75) * zoom)}px` : "100vw";
  const objeto = fit === "cover" ? "object-cover" : "object-contain";

  return (
    <div
      ref={caixaRef}
      onPointerEnter={aoEntrar}
      onPointerMove={aoMover}
      onPointerLeave={aoSair}
      onPointerDown={aoApertar}
      onPointerUp={aoSoltar}
      onPointerCancel={aoSoltar}
      onClick={aoClicar}
      onContextMenu={(e) => {
        if (segurandoRef.current || modoRef.current || inicioRef.current) e.preventDefault();
      }}
      data-lupa={ativa ? "on" : "off"}
      className={`relative select-none [-webkit-touch-callout:none] ${onAbrir ? "cursor-pointer" : ""} ${
        ativa && !toque ? "cursor-none" : ""
      } ${className}`}
      style={{ touchAction: modo ? "none" : "pan-x pan-y pinch-zoom" }}
    >
      <div className={`absolute inset-0 overflow-hidden ${fundo}`}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          draggable={false}
          loading={prioridade ? "eager" : undefined}
          fetchPriority={prioridade ? "high" : undefined}
          className={`${objeto} pointer-events-none`}
          style={{ objectPosition: posicao }}
        />
      </div>

      {children}

      {/* Lente: o invólucro leva a posição; o círculo dentro dele aparece
          com opacidade e escala (escalar o invólucro levaria a posição junto). */}
      {medida && (
        <div
          ref={lenteRef}
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-30 will-change-transform"
          style={{ width: diametro, height: diametro }}
        >
          <div
            className={`relative h-full w-full overflow-hidden rounded-full ${fundo} transition-[opacity,scale] duration-200 ease-out motion-reduce:transition-none ${
              ativa ? "scale-100 opacity-100" : "scale-[0.88] opacity-0"
            }`}
            style={{
              boxShadow:
                "0 0 0 1px rgba(184,144,42,0.95), 0 0 0 5px rgba(237,231,217,0.96), 0 0 0 6px rgba(27,73,101,0.28), 0 22px 44px -10px rgba(19,2,9,0.55)",
            }}
          >
            <div ref={dentroRef} className="absolute left-0 top-0 will-change-transform">
              {/* A foto que já está na tela (cache) e a ampliada por cima. */}
              <Image src={src} alt="" fill sizes={sizes} draggable={false} className={objeto} style={{ objectPosition: posicao }} />
              <Image
                src={src}
                alt=""
                fill
                sizes={ampliada}
                loading="eager"
                draggable={false}
                className={objeto}
                style={{ objectPosition: posicao }}
              />
            </div>
            {/* Brilho de vidro e borda escurecida, como numa lente de verdade */}
            <span
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 30% 24%, rgba(255,255,255,0.28), rgba(255,255,255,0) 42%), radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 62%, rgba(19,2,9,0.18) 100%)",
              }}
            />
          </div>
        </div>
      )}

      {/* Dica (até o primeiro uso) */}
      {mostrarDica && (
        <span
          aria-hidden
          className={`pointer-events-none absolute bottom-3 z-20 inline-flex max-w-[calc(100%-4.5rem)] items-center gap-2 rounded-full bg-[#130209]/70 px-3 py-1.5 text-[11px] leading-tight text-[#EDE7D9] backdrop-blur-sm transition-opacity duration-300 ${
            cantoBotao === "direita" ? "left-3" : "right-3"
          } ${ativa ? "opacity-0" : "opacity-100"}`}
        >
          <IconeLupa className="h-3.5 w-3.5 shrink-0" />
          <span className="[@media(hover:hover)]:hidden">{textoDica.toque}</span>
          <span className="hidden [@media(hover:hover)]:inline">{textoDica.mouse}</span>
        </span>
      )}

      {botao && (
        <button
          type="button"
          onClick={alternarModo}
          onKeyDown={teclarBotao}
          onPointerDown={(e) => e.stopPropagation()}
          // Sobre o botão a lente sai do caminho (e o cursor volta).
          onPointerEnter={(e) => {
            if (e.pointerType === "mouse" && !modoRef.current) setAtiva(false);
          }}
          onPointerMove={(e) => e.stopPropagation()}
          aria-pressed={modo}
          aria-label={modo ? `Fechar a lupa: ${nome}` : `Ver o bordado de perto: ${nome}`}
          className={`absolute bottom-2 z-40 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b8902a] focus-visible:ring-offset-2 ${
            cantoBotao === "direita" ? "right-2" : "left-2"
          } ${
            modo
              ? "bg-[#1B4965] text-[#EDE7D9]"
              : "bg-[#EDE7D9]/90 text-[#1B4965] shadow-sm backdrop-blur-sm hover:bg-[#EDE7D9]"
          }`}
        >
          {modo ? (
            <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
              <path strokeLinecap="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          ) : (
            <IconeLupa className="h-5 w-5" />
          )}
        </button>
      )}
    </div>
  );
}

export function IconeLupa({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path strokeLinecap="round" d="m15.4 15.4 5.1 5.1" />
      <path strokeLinecap="round" d="M8 8.6a3.2 3.2 0 0 1 2.4-1.4" opacity="0.6" />
    </svg>
  );
}
