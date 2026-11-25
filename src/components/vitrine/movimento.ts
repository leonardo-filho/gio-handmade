// Ritmo único da vitrine da /loja: as mesmas curvas em todo movimento, para a página
// inteira ter um jeito só de se mexer.

import type { CSSProperties } from "react";

/** Saída rápida e pouso macio: entradas, foto que cresce, cartões. */
export const EASE = [0.22, 1, 0.36, 1] as const;
export const CSS_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/** Saída de cena: acelera, porque quem sai não precisa ser visto pousando. */
export const EASE_SAIDA = [0.4, 0, 0.9, 0.5] as const;

export function movimentoReduzido() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Atraso de uma animação CSS (variável --d do vitrine.module.css). */
export function atraso(ms: number): CSSProperties {
  return { "--d": `${ms}ms` } as CSSProperties;
}

/** O maior retângulo 3:4 centrado dentro de r (a foto do cartão é 3:4). */
export function encaixar34(r: DOMRect | { left: number; top: number; width: number; height: number }) {
  const largura = Math.min(r.width, r.height * 0.75);
  const altura = largura / 0.75;
  return {
    left: r.left + (r.width - largura) / 2,
    top: r.top + (r.height - altura) / 2,
    width: largura,
    height: altura,
  };
}

export type Caixa = { left: number; top: number; width: number; height: number };

/** Transform que leva a caixa `para` (onde o elemento está) até `de`. */
export function transformDe(de: Caixa, para: Caixa) {
  const sx = de.width / para.width;
  const sy = de.height / para.height;
  return `translate3d(${de.left - para.left}px, ${de.top - para.top}px, 0) scale(${sx}, ${sy})`;
}

/** Cópia solta de uma foto, presa à tela, para voar entre dois lugares. */
export function criarClone(src: string, caixa: Caixa, encaixe: "cover" | "contain" = "cover") {
  const clone = document.createElement("div");
  clone.setAttribute("aria-hidden", "true");
  clone.style.cssText = [
    "position:fixed",
    `left:${caixa.left}px`,
    `top:${caixa.top}px`,
    `width:${caixa.width}px`,
    `height:${caixa.height}px`,
    "z-index:120",
    "pointer-events:none",
    "transform-origin:0 0",
    "will-change:transform,opacity",
    "overflow:hidden",
    "contain:strict",
  ].join(";");
  const img = document.createElement("img");
  img.src = src;
  img.alt = "";
  img.decoding = "sync";
  img.style.cssText = `width:100%;height:100%;object-fit:${encaixe};display:block`;
  clone.appendChild(img);
  document.body.appendChild(clone);
  return clone;
}

export function naTela(el: Element) {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight;
}
