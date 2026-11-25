"use client";

import { useRef } from "react";
import { TEXTO_MEDIDAS, TEXTO_PAGAMENTO } from "@/components/loja/ComoFunciona";
import { useRevelar } from "./revelar";
import s from "./vitrine.module.css";

const WA =
  "https://wa.me/559192982017?text=" +
  encodeURIComponent("Oi, Gio! Quero encomendar uma peça do meu jeito. Pode me ajudar?");

const capitalizar = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

// Sem checkout: o fim da loja explica o caminho até a peça chegar, com o
// mesmo texto que o site já usa (ComoFunciona e o processo da home).
const PASSOS = [
  { titulo: "Carrinho", texto: "Escolha as peças e adicione ao carrinho." },
  { titulo: "WhatsApp", texto: "Finalize o pedido pelo WhatsApp, direto com a Gio." },
  { titulo: "Medidas", texto: capitalizar(TEXTO_MEDIDAS) },
  { titulo: "Confecção", texto: capitalizar(TEXTO_PAGAMENTO) },
];

export default function ComoComprar() {
  const ref = useRef<HTMLDivElement>(null);
  useRevelar(ref);
  return (
    <section aria-labelledby="como-comprar" className="px-4 pb-20 pt-20 md:px-6 md:pb-28 md:pt-28 lg:px-0">
      <div ref={ref} className={s.revela}>
        <div className="flex items-baseline gap-3">
          <h2 id="como-comprar" className={`font-[family-name:var(--font-serif)] text-[32px] leading-none text-[#1B4965] md:text-[46px] ${s.texto}`}>
            Como comprar
          </h2>
          <span aria-hidden className={`h-[1.5px] flex-1 self-center ${s.ponto}`} />
        </div>
        <ol className={`mt-8 grid gap-6 sm:grid-cols-2 md:mt-10 lg:grid-cols-4 lg:gap-8 ${s.texto}`}>
          {PASSOS.map((p, i) => (
            <li key={p.titulo} className="flex gap-4 lg:flex-col lg:gap-3">
              <span className="font-[family-name:var(--font-serif)] text-[38px] italic leading-none text-brand-gold-text md:text-[44px]">
                {i + 1}
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#1B4965]">{p.titulo}</p>
                <p className="mt-1.5 text-[14px] leading-relaxed text-brand-muted">{p.texto}</p>
              </div>
            </li>
          ))}
        </ol>
        <div
          className={`mt-10 flex flex-col gap-4 rounded-[4px] border border-[#b8902a]/35 bg-[#b8902a]/[0.06] p-5 md:mt-14 md:flex-row md:items-center md:justify-between md:p-7 ${s.texto}`}
        >
          <div>
            <p className="font-[family-name:var(--font-serif)] text-[24px] leading-tight text-[#1B4965] md:text-[28px]">
              Quer do <em>seu jeito</em>?
            </p>
            <p className="mt-1 text-[14px] leading-relaxed text-brand-muted">
              Dá para personalizar a peça, inclusive as cores. Chame no WhatsApp que a gente monta com você.
            </p>
          </div>
          <a
            href={WA}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full border border-[#1B4965] px-6 text-xs font-bold uppercase tracking-[0.18em] text-[#1B4965] transition-[background-color,color,transform] duration-300 hover:bg-[#1B4965] hover:text-[#EDE7D9] active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDE7D9]"
          >
            Falar com a Gio
          </a>
        </div>
      </div>
    </section>
  );
}
