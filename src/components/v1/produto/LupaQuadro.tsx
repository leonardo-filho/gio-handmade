"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { RECORTE, ZOOM_INICIAL, limitar, type Ponto } from "./perto";

// "Ver de perto" no computador: a própria moldura da foto vira a lupa. A foto
// em resolução cheia aparece ampliada 2,5x e o ponto à vista segue o mouse
// (com uma folga suave; seco com movimento reduzido). No canto, um mapa
// pequeno mostra que pedaço da peça está na tela. Clique, Esc ou tirar o
// mouse da foto fecham. Pelo teclado, as setas andam pela foto.

type Props = {
  src: string;
  /** Ponto da moldura (0 a 1) em que a lupa abre: onde a pessoa clicou. */
  inicio: Ponto;
  aoSair: () => void;
};

const Z = ZOOM_INICIAL;

const reduzido = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function LupaQuadro({ src, inicio, aoSair }: Props) {
  const caixaRef = useRef<HTMLDivElement>(null);
  const fotoRef = useRef<HTMLDivElement>(null);
  const janelaRef = useRef<HTMLSpanElement>(null);
  const alvo = useRef<Ponto>(inicio);
  const atual = useRef<Ponto>(inicio);
  const quadro = useRef<number | null>(null);
  const [carregou, setCarregou] = useState(false);

  function aplicar() {
    const caixa = caixaRef.current;
    const foto = fotoRef.current;
    if (!caixa || !foto) return;
    const { x, y } = atual.current;
    const w = caixa.clientWidth;
    const h = caixa.clientHeight;
    foto.style.transform = `translate3d(${-x * (Z - 1) * w}px, ${-y * (Z - 1) * h}px, 0)`;
    const janela = janelaRef.current;
    if (janela) {
      janela.style.left = `${x * (1 - 1 / Z) * 100}%`;
      janela.style.top = `${y * (1 - 1 / Z) * 100}%`;
    }
  }

  // Tamanho da foto ampliada (acompanha a moldura) e a primeira posição.
  useEffect(() => {
    const caixa = caixaRef.current;
    if (!caixa) return;
    const medir = () => {
      const foto = fotoRef.current;
      if (!foto) return;
      foto.style.width = `${caixa.clientWidth * Z}px`;
      foto.style.height = `${caixa.clientHeight * Z}px`;
      aplicar();
    };
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(caixa);
    caixa.focus({ preventScroll: true });
    return () => {
      observador.disconnect();
      if (quadro.current !== null) cancelAnimationFrame(quadro.current);
    };
    // Roda uma vez por abertura (aplicar só lê refs).
  }, []);

  function seguir() {
    if (quadro.current !== null) return;
    const passo = () => {
      const a = atual.current;
      const b = alvo.current;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      if (Math.abs(dx) < 0.0008 && Math.abs(dy) < 0.0008) {
        atual.current = { ...b };
        aplicar();
        quadro.current = null;
        return;
      }
      atual.current = { x: a.x + dx * 0.2, y: a.y + dy * 0.2 };
      aplicar();
      quadro.current = requestAnimationFrame(passo);
    };
    quadro.current = requestAnimationFrame(passo);
  }

  function irPara(p: Ponto) {
    alvo.current = { x: limitar(p.x, 0, 1), y: limitar(p.y, 0, 1) };
    if (reduzido()) {
      atual.current = alvo.current;
      aplicar();
    } else {
      seguir();
    }
  }

  return (
    <div
      ref={caixaRef}
      data-lupa=""
      role="button"
      tabIndex={-1}
      aria-label="Foto ampliada. Mova o mouse ou use as setas para percorrer. Clique ou Esc para sair."
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        irPara({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
      }}
      onMouseLeave={aoSair}
      onClick={aoSair}
      onKeyDown={(e) => {
        const passo = 0.08;
        const a = alvo.current;
        if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          aoSair();
        } else if (e.key === "ArrowLeft") irPara({ ...a, x: a.x - passo });
        else if (e.key === "ArrowRight") irPara({ ...a, x: a.x + passo });
        else if (e.key === "ArrowUp") irPara({ ...a, y: a.y - passo });
        else if (e.key === "ArrowDown") irPara({ ...a, y: a.y + passo });
        else return;
        e.preventDefault();
      }}
      className="absolute inset-0 z-[3] cursor-zoom-out overflow-hidden outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#b8902a]"
    >
      <div ref={fotoRef} className="absolute left-0 top-0 will-change-transform">
        <Image
          src={src}
          alt=""
          fill
          unoptimized
          onLoad={() => setCarregou(true)}
          className={`object-cover transition-opacity duration-200 motion-reduce:transition-none ${carregou ? "opacity-100" : "opacity-0"}`}
          style={{ objectPosition: `${RECORTE.x * 100}% ${RECORTE.y * 100}%` }}
        />
      </div>

      {/* Mapa: a foto inteira em miniatura e a janela do que está à vista. */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-3 top-3 block h-24 w-[72px] overflow-hidden rounded-[2px] bg-[#130209]/20 shadow-[0_0_0_1px_rgb(237_231_217/0.9)]"
      >
        <Image src={src} alt="" fill sizes="72px" className="object-cover" style={{ objectPosition: "50% 40%" }} />
        <span
          ref={janelaRef}
          className="absolute block border border-[#EDE7D9] shadow-[0_0_0_1px_rgb(19_2_9/0.45)]"
          style={{ width: `${100 / Z}%`, height: `${100 / Z}%` }}
        />
      </span>
    </div>
  );
}
