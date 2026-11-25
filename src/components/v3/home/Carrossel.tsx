"use client";

import { Children, isValidElement, useCallback, useEffect, useRef, useState } from "react";

type Props = {
  /** Nome do carrossel para o leitor de tela. */
  rotulo: string;
  children: React.ReactNode;
};

const DURACAO = 300;

// Carrossel por arrasto com encaixe nativo (scroll-snap), sem autoplay.
// Celular: 2,25 cards por tela, 12 px de vão, encostado na borda. Tablet: 3.
// Computador: 4 cards com 16 px de vão e setas quadradas creme de 32 px
// coladas nas bordas, centradas na foto 3:4; cada seta anda 1 card em 0,3 s
// (troca instantânea com movimento reduzido). A seta some quando não há para
// onde ir.
export default function Carrossel({ rotulo, children }: Props) {
  const trilho = useRef<HTMLUListElement>(null);
  const animacao = useRef<number | null>(null);
  const [noInicio, setNoInicio] = useState(true);
  const [noFim, setNoFim] = useState(false);

  const conferirPontas = useCallback(() => {
    const el = trilho.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setNoInicio(el.scrollLeft <= 2);
    setNoFim(el.scrollLeft >= max - 2);
  }, []);

  // Confere as pontas quando o trilho muda de tamanho (inclusive na primeira
  // medida, que diz se todos os cards já cabem na tela).
  useEffect(() => {
    const el = trilho.current;
    if (!el) return;
    const observador = new ResizeObserver(conferirPontas);
    observador.observe(el);
    return () => {
      observador.disconnect();
      if (animacao.current !== null) cancelAnimationFrame(animacao.current);
    };
  }, [conferirPontas]);

  function andar(sentido: 1 | -1) {
    const el = trilho.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    const vao = parseFloat(getComputedStyle(el).columnGap) || 0;
    const max = el.scrollWidth - el.clientWidth;
    // Parte do card mais próximo, para a seta sempre parar alinhada.
    const passo = card.getBoundingClientRect().width + vao;
    const atual = Math.round(el.scrollLeft / passo);
    const alvo = Math.min(max, Math.max(0, (atual + sentido) * passo));

    if (animacao.current !== null) cancelAnimationFrame(animacao.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.scrollLeft = alvo;
      return;
    }

    // Sem encaixe durante a animação, senão o navegador puxa a cada quadro.
    const inicio = el.scrollLeft;
    const t0 = performance.now();
    el.style.scrollSnapType = "none";
    const quadro = (agora: number) => {
      const p = Math.min(1, (agora - t0) / DURACAO);
      const suave = 1 - Math.pow(1 - p, 3);
      el.scrollLeft = inicio + (alvo - inicio) * suave;
      if (p < 1) {
        animacao.current = requestAnimationFrame(quadro);
      } else {
        animacao.current = null;
        el.style.scrollSnapType = "";
      }
    };
    animacao.current = requestAnimationFrame(quadro);
  }

  const itens = Children.toArray(children);

  return (
    <div className="@container relative">
      <ul
        ref={trilho}
        aria-label={rotulo}
        onScroll={conferirPontas}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain [scrollbar-width:none] md:gap-4 [&::-webkit-scrollbar]:hidden"
      >
        {itens.map((item, i) => (
          <li
            key={isValidElement(item) && item.key !== null ? item.key : i}
            className="w-[calc((100%-24px)/2.25)] shrink-0 snap-start md:w-[calc((100%-32px)/3)] lg:w-[calc((100%-48px)/4)]"
          >
            {item}
          </li>
        ))}
      </ul>

      <Seta sentido={-1} oculta={noInicio} aoClicar={() => andar(-1)} />
      <Seta sentido={1} oculta={noFim} aoClicar={() => andar(1)} />
    </div>
  );
}

function Seta({ sentido, oculta, aoClicar }: { sentido: 1 | -1; oculta: boolean; aoClicar: () => void }) {
  const esquerda = sentido === -1;
  return (
    <button
      type="button"
      onClick={aoClicar}
      disabled={oculta}
      aria-label={esquerda ? "Peças anteriores" : "Próximas peças"}
      // Alvo de 44 px com o quadrado de 32 px encostado na borda; a altura
      // acompanha o meio da foto 3:4 do card (3 ou 4 cards por tela).
      className={`group absolute z-10 hidden h-11 w-11 -translate-y-1/2 items-center transition-opacity duration-200 motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-0 md:flex md:top-[calc((100cqw-32px)*2/9)] lg:top-[calc((100cqw-48px)/6)] ${
        esquerda ? "left-0 justify-start" : "right-0 justify-end"
      } focus-visible:outline-none`}
    >
      <span className="flex h-8 w-8 items-center justify-center bg-[#EDE7D9] text-[#1B4965] transition-opacity duration-200 group-hover:opacity-70 group-focus-visible:outline-2 group-focus-visible:outline-solid group-focus-visible:outline-[#b8902a] motion-reduce:transition-none">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d={esquerda ? "m15 5-7 7 7 7" : "m9 5 7 7-7 7"} />
        </svg>
      </span>
    </button>
  );
}
