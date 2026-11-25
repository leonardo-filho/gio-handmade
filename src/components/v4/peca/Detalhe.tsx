"use client";

import { useEffect, useRef } from "react";
import FotoSuave from "@/components/v3/estrutura/FotoSuave";
import Legenda from "./Legenda";

type Props = {
  id: string;
  numeral: string;
  nome: string;
  detalhe: { src: string; x: number; y: number };
};

// Prancha "O bordado de perto": a foto da peça, recortada no ponto em que o
// bordado é mais denso (achado na análise das fotos, ver dados-fotos.ts).
// Quando a prancha entra na tela, a imagem se aproxima devagar da peça
// inteira até o bordado, uma vez só. Com movimento reduzido, ela já nasce
// de perto. O HTML do servidor também nasce de perto: o afastamento só é
// ligado pelo efeito, fora da tela.
export default function Detalhe({ id, numeral, nome, detalhe }: Props) {
  const camadaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const camada = camadaRef.current;
    const moldura = camada?.parentElement;
    if (!camada || !moldura) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Já à vista (um quarto ou mais da moldura na tela): fica de perto. Uma
    // beirada só não conta: no celular, o alto da prancha fica 68 px embaixo
    // da barra de compra assim que a página abre. A medida é da moldura, que
    // não tem a escala da camada.
    const caixa = moldura.getBoundingClientRect();
    const visivel = Math.min(caixa.bottom, window.innerHeight) - Math.max(caixa.top, 0);
    if (visivel > caixa.height * 0.25) return;

    // Afasta sem animar e espera a prancha aparecer.
    camada.style.transition = "none";
    camada.dataset.longe = "";
    void camada.offsetWidth;
    camada.style.transition = "";

    const observador = new IntersectionObserver(
      (entradas) => {
        // A proporção, não o isIntersecting: ele já vale com a beirada à vista,
        // e o observador responde assim que começa a observar.
        if (entradas.some((e) => e.intersectionRatio >= 0.5)) {
          delete camada.dataset.longe;
          observador.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observador.observe(moldura);
    return () => observador.disconnect();
  }, []);

  const ponto = `${detalhe.x}% ${detalhe.y}%`;

  return (
    <section id={id} data-prancha={id} aria-label={`${numeral}. O bordado de perto`} className="prancha flex snap-start flex-col">
      <div className="relative min-h-0 flex-1 overflow-hidden bg-[#1B4965]/5">
        <div
          ref={camadaRef}
          style={{ transformOrigin: ponto }}
          className="absolute inset-0 [--escala:1.9] [transform:scale(var(--escala))] data-[longe]:[transform:scale(1)] lg:[--escala:1.75] motion-safe:transition-transform motion-safe:duration-[1600ms] motion-safe:ease-[cubic-bezier(0.22,0.8,0.2,1)]"
        >
          <FotoSuave
            src={detalhe.src}
            alt={`${nome}, o bordado de perto`}
            fill
            loading="lazy"
            sizes="(min-width: 1024px) 120vw, 190vw"
            style={{ objectPosition: ponto }}
            className="object-cover"
          />
        </div>
      </div>
      <Legenda numeral={numeral} titulo="O bordado de perto" />
    </section>
  );
}
