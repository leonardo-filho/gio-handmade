"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { PAUSA } from "./dados";
import { movimentoReduzido } from "./movimento";
import s from "./vitrine.module.css";

const ZOOM = 2.4;

// Pausa editorial entre as seções: o bordado do Top Maya de perto, com uma
// lente que atravessa a foto enquanto a página rola (a rolagem conduz a lente,
// sem animação infinita). Ensina a lupa que existe em toda peça e justifica o
// preço sem prometer nada além do que o catálogo diz.
export default function Interludio({ onAbrir }: { onAbrir: (id: string) => void }) {
  const caixaRef = useRef<HTMLDivElement>(null);
  const camadaRef = useRef<HTMLDivElement>(null);
  const lenteRef = useRef<HTMLDivElement>(null);
  const dentroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: caixaRef, offset: ["start end", "end start"] });

  // Escreve direto no estilo (sem render por quadro): parallax da foto, lente
  // e a mesma camada ampliada dentro da lente, alinhada ao ponto do centro.
  const desenhar = useCallback((progresso: number) => {
    const caixa = caixaRef.current;
    const camada = camadaRef.current;
    const lente = lenteRef.current;
    const dentro = dentroRef.current;
    if (!caixa || !camada || !lente || !dentro) return;
    const parado = movimentoReduzido();
    const p = parado ? 0.5 : Math.min(1, Math.max(0, progresso));
    const W = caixa.clientWidth;
    const H = caixa.clientHeight;
    const d = lente.offsetWidth;
    const desloc = parado ? 0 : (p - 0.5) * H * 0.12;
    const camadaT = `translate3d(0, ${desloc}px, 0) scale(1.14)`;
    camada.style.transform = camadaT;
    // A lente desce na diagonal pelo bojo bordado (de 28% a 70% da largura).
    const px = W * (0.28 + 0.42 * p);
    const py = H * (0.34 + 0.22 * p) + Math.sin(p * Math.PI) * H * -0.04;
    lente.style.transform = `translate3d(${px - d / 2}px, ${py - d / 2}px, 0)`;
    dentro.style.width = `${W}px`;
    dentro.style.height = `${H}px`;
    dentro.style.transformOrigin = `${px}px ${py}px`;
    dentro.style.transform = `translate3d(${d / 2 - px}px, ${d / 2 - py}px, 0) scale(${ZOOM})`;
    (dentro.firstElementChild as HTMLElement | null)?.style.setProperty("transform", camadaT);
  }, []);

  useMotionValueEvent(scrollYProgress, "change", desenhar);

  useEffect(() => {
    desenhar(scrollYProgress.get());
    const caixa = caixaRef.current;
    if (!caixa) return;
    const observador = new ResizeObserver(() => desenhar(scrollYProgress.get()));
    observador.observe(caixa);
    return () => observador.disconnect();
  }, [desenhar, scrollYProgress]);

  return (
    <section
      aria-labelledby="pausa-titulo"
      className="relative my-4 overflow-hidden bg-[#1B4965] text-[#EDE7D9] md:my-10 md:grid md:grid-cols-[1.15fr_1fr] md:rounded-[4px]"
    >
      <div ref={caixaRef} className="relative aspect-[4/5] overflow-hidden md:aspect-auto md:min-h-[560px]">
        <div ref={camadaRef} className="absolute inset-0 will-change-transform">
          <Image src={PAUSA.foto} alt="Bordado do Top Maya visto de perto" fill sizes="(min-width: 768px) 55vw, 100vw" className="object-cover" />
        </div>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#130209]/45 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-[#1B4965]/25" />
        {/* Lente: o invólucro anda; dentro dele, a mesma foto ampliada. */}
        <div
          ref={lenteRef}
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 h-[132px] w-[132px] overflow-hidden rounded-full will-change-transform md:h-[200px] md:w-[200px]"
          style={{
            boxShadow:
              "0 0 0 1.5px rgba(216,184,96,0.95), 0 0 0 6px rgba(237,231,217,0.92), 0 0 0 7px rgba(27,73,101,0.35), 0 24px 48px -12px rgba(19,2,9,0.6)",
          }}
        >
          <div ref={dentroRef} className="absolute left-0 top-0 will-change-transform">
            <div className="absolute inset-0">
              <Image src={PAUSA.foto} alt="" fill sizes="(min-width: 768px) 140vw, 260vw" loading="lazy" className="object-cover" />
            </div>
          </div>
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 32% 26%, rgba(255,255,255,0.3), rgba(255,255,255,0) 42%), radial-gradient(circle, rgba(0,0,0,0) 62%, rgba(19,2,9,0.22) 100%)",
            }}
          />
        </div>
      </div>

      <div className="flex flex-col justify-center px-6 pb-10 pt-8 md:px-12 md:py-14">
        <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#C8E1E4]">De perto</p>
        <h2 id="pausa-titulo" className="mt-3 font-[family-name:var(--font-serif)] text-[40px] leading-[1.02] md:text-[56px]">
          Ponto a ponto,
          <br />
          <em className="text-[#e6cf8f]">à mão.</em>
        </h2>
        <span aria-hidden className={`mt-5 block h-[1.5px] w-28 ${s.ponto} ${s.pontoClaro}`} />
        <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-[#EDE7D9]/90">
          O Top Maya é bordado à mão com mais de 2.500 miçangas e pedrarias.
        </p>
        <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-[#C8E1E4]">
          <span className="[@media(hover:hover)]:hidden">Em qualquer peça, toque na foto para ver o bordado de perto.</span>
          <span className="hidden [@media(hover:hover)]:inline">Em qualquer peça, passe o mouse na foto para ver o bordado de perto.</span>
        </p>
        <button
          type="button"
          onClick={() => onAbrir(PAUSA.id)}
          className="group mt-7 inline-flex min-h-12 w-fit cursor-pointer items-center gap-3 rounded-full bg-[#EDE7D9] px-6 text-xs font-bold uppercase tracking-[0.18em] text-[#1B4965] transition-[background-color,transform] duration-300 hover:bg-white active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e6cf8f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1B4965]"
        >
          Ver o Top Maya
          <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-5-5 5 5-5 5" />
          </svg>
        </button>
      </div>
    </section>
  );
}
